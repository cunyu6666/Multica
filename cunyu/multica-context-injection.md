# Multica Issue 上下文拼接机制

> 当一个 issue 被派给第一个处理的 agent 时，它实际看到的上下文是怎么拼接出来的？
>
> 本文基于读 `server/internal/handler/daemon.go`、`server/internal/daemon/execenv/runtime_config_sections.go`、`server/internal/daemon/execenv/context.go`、`server/internal/handler/squad_briefing.go` 后的整理。

---

## 1. 一句话总结

**不是简单拼成一个 prompt，而是分两个阶段、按 provider 不同方式、分层注入。**

---

## 2. 整体架构：两阶段

```
阶段 1：服务端组装 TaskAgentData（结构化数据）
   daemon.go → Query 任务、issue、agent、squad → 返回结构化 JSON

阶段 2：daemon 渲染成实际 prompt（按 provider）
   execenv/runtime_config_sections.go → 调多个 writeXxx() 拼字符串
                                    → 写到 .agent_context/issue_context.md
                                    → 写到 .claude/skills/（按 provider）
                                    → 实际给 Claude Code 的 prompt
```

**关键**：阶段 1 的产物是**结构化字段**（不是字符串），阶段 2 才把这些字段渲染成具体文本。

---

## 3. 阶段 1 详解：服务端拼装什么

在 `server/internal/handler/daemon.go` 第 1640 行附近，daemon 来"领任务"时，服务端返回 `TaskAgentData`：

```go
resp.Agent = &TaskAgentData{
    ID:                    agent.ID,
    Name:                  agent.Name,
    Instructions:          agent.Instructions,   // agent 人设（最高优先级）
    CustomEnv:             customEnv,             // agent 自定义环境变量
    CustomArgs:            customArgs,            // agent 自定义启动参数
    McpConfig:             mcpConfig,             // MCP 配置
    Model:                 agent.Model,
    ThinkingLevel:         agent.ThinkingLevel,
    ServiceTier:           agent.ServiceTier,
    RuntimeConfig:         runtimeConfig,         // 按 provider 的 JSON 调优
    DisabledRuntimeSkills: disabledRuntimeSkillsFor(...),
}

// 加载 skills
if useSkillRefs {
    _, skillRefs := h.TaskService.LoadAgentSkillBundles(...)
    resp.Agent.SkillRefs = skillRefs
} else {
    skills := h.TaskService.LoadAgentSkills(...)
    skills = append(skills, builtinSkills...)
    resp.Agent.Skills = skills
}

// issue 上下文
if task.IssueID.Valid {
    if issue, err := h.Queries.GetIssue(...); err == nil {
        resp.WorkspaceID = uuidToString(issue.WorkspaceID)
        resp.ThreadName = issue.Title         // ← issue 标题
    }
}

// squad leader briefing（仅 leader 任务）
if resp.Agent != nil && task.IsLeaderTask && task.SquadID.Valid {
    briefing := buildSquadLeaderBriefing(...)   // ← squad_briefing.go 注入
    resp.Agent.Instructions = resp.Agent.Instructions + "\n\n" + briefing
}

// 任务发起人
if task.InitiatorUserID.Valid {
    resp.InitiatorName = u.Name
    resp.InitiatorEmail = u.Email
}

// runtime owner（"## Requesting User"）
if runtime.OwnerID.Valid {
    if owner, err := h.Queries.GetUser(...); err == nil {
        resp.RequestingUserName = owner.Name
        resp.RequestingUserProfileDescription = owner.ProfileDescription
    }
}

// project resources（local_directory / github_repo）
// repo precedence: project > workspace
```

### 关键字段

| 字段 | 来源 | 用途 |
|---|---|---|
| `Instructions` | `agents` 表 | agent 的 system prompt 主体 |
| `Skills` / `SkillRefs` | `agent_skills` + `builtin_skills` | agent 能用的 skill 列表 |
| `WorkspaceID` | `issues.workspace_id` | 当前 workspace |
| `ThreadName` | `issues.title` | issue 标题 |
| `InitiatorName/Email` | `users` 表 | 谁发起的任务 |
| `RequestingUserName` | runtime owner | 谁拥有这个执行环境 |
| 项目资源 | `project_resources` 表 | local_directory 路径、github_repo URL |

---

## 4. 阶段 2 详解：daemon 渲染成 prompt

`server/internal/daemon/execenv/runtime_config_sections.go` 里有多个 `writeXxx()` 函数，每个写一个 markdown section。最终拼成完整 prompt：

```
═══════════════════════════════════════════════
[Agent Identity]                  ← agent.Instructions
                                   （最高优先级）

[Squad Operating Protocol]        ← 仅 leader 任务
[ Squad Roster ]                  ← squad_briefing.go 注入

[Issue Metadata]                  ← 跨会话 KV
[Task Initiator]                  ← 谁发起的
[Requesting User]                 ← runtime 拥有者

### Workflow                       ← 任务模式
[Chat / Issue-assignment / Quick-create / Autopilot]

[Project Resources]               ← local_directory / github_repo

[Comments]                        ← 最近评论流
═══════════════════════════════════════════════
```

### 4.1 各 section 的具体内容

#### Issue Metadata（`writeIssueMetadata`）

> `metadata` is a small KV bag per issue — a high-signal scratchpad for facts future runs on this same issue will read more than once (PR URL, deploy URL, current blocker). Most runs pin **zero** new keys; that is the expected case.

每个 issue 一个 KV 字典，存**重要且下次还要看**的事实。推荐 keys：`pr_url`, `pr_number`, `pipeline_status`, `deploy_url`, `waiting_on`, `blocked_reason`, `decision`。

#### Instruction Precedence（`writeInstructionPrecedence`）

> Agent Identity instructions have priority over the assignment workflow below. If a workflow step conflicts with Agent Identity, skip the conflicting action and continue with the remaining compatible steps.

**Agent Identity 永远最高优先级**，workflow 只是参考。

#### Session Continuity Notice（`writeSessionContinuityNotice`）

当一个原本要 resume 的任务发现续不上时，注入一段提示：

> This run was meant to continue an earlier conversation, but that session's context could NOT be restored — you are starting fresh with no memory of the previous turns.

让 agent 知道这是新会话，要重新理解上下文，并在回复时告诉用户。

#### Workflow（按任务类型分四种）

- `writeWorkflowChat` — chat 模式
- `writeWorkflowQuickCreate` — 快速创建 issue
- `writeWorkflowAutopilot` — autopilot 定时任务
- `writeWorkflowAssignment` — issue 分派

每种给 agent 一套具体的行为规则。

---

## 5. Issue 上下文放哪里

不只是 prompt，还写到**文件**里。

`server/internal/daemon/execenv/context.go` 的 `writeContextFiles` 函数：

```go
func writeContextFiles(workDir, provider string, ctx TaskContextForEnv, manifest *sidecarManifest) error {
    if err := writeTaskContextMarker(workDir, ctx, manifest); err != nil {
        return err
    }

    contextDir := filepath.Join(workDir, ".agent_context")
    if err := recordMkdirAll(contextDir, 0o755, manifest); err != nil {
        return fmt.Errorf("create .agent_context dir: %w", err)
    }

    content := renderIssueContext(provider, ctx)
    path := filepath.Join(contextDir, "issue_context.md")
    if err := recordWriteFile(path, []byte(content), 0o644, manifest); err != nil {
        // pre-existing path → 跳过
    }
    // ...
}
```

**关键路径**：

```
{workDir}/
├── .agent_context/
│   └── issue_context.md          ← 完整 issue 信息（标题、描述、评论等）
├── .claude/skills/{name}/SKILL.md  ← skills（按 provider）
├── .codebuddy/skills/{name}/...     ← CodeBuddy 是 Claude Code fork
├── .github/skills/{name}/...       ← Copilot
├── .opencode/skills/{name}/...     ← OpenCode
├── .cursor/skills/{name}/...       ← Cursor
├── .kimi/skills/{name}/...         ← Kimi
├── .kiro/skills/{name}/...         ← Kiro
├── .agents/skills/{name}/...       ← Antigravity
└── ...
```

**每个 provider 有自己的 skills 目录**，靠 `provider` 字段路由。完整的 provider 列表（来自代码注释）：

| Provider | Skills 路径 |
|---|---|
| Claude Code | `.claude/skills/` |
| CodeBuddy | `.codebuddy/skills/` |
| Codex | codex-home（特殊） |
| Hermes | HERMES_HOME/skills（特殊） |
| Copilot | `.github/skills/` |
| OpenCode | `.opencode/skills/` |
| OpenClaw | `skills/` |
| Pi | `.pi/skills/` |
| Cursor | `.cursor/skills/` |
| Kimi | `.kimi/skills/` |
| Kiro | `.kiro/skills/` |
| Qoder | `.qoder/skills/` |
| Qwen Code | `.qwen/skills/` |
| Antigravity | `.agents/skills/` |
| Default | `.agent_context/skills/` |

---

## 6. 关键设计点

### 6.1 分层注入，不是一坨

每一块来源不同、生命周期不同、优先级不同：

- **Agent Identity**（永久、最高优先级）
- **Squad Briefing**（任务级、leader 专用）
- **Issue Metadata**（跨任务 KV、动态）
- **Issue Context**（写在文件里、agent 自取）
- **Workflow**（按任务模式、规则级）

### 6.2 Issue body 不在 prompt 里复述

`squad_briefing.go:54` 明确写：

> Do NOT restate the issue body or prior comments in your delegation — the assignee already has them. Repeating context is noise that buries the actual instruction.

**完整 issue body 写到 `issue_context.md`**，agent 自己读，不在 system prompt 里复述。这样：

- 节省 token
- 避免 prompt 膨胀
- 保持数据一致性

### 6.3 Issue Metadata 是跨会话记忆

每次 agent 跑完一个 issue，如果产生"重要且下次还要看"的事实（PR URL、deploy URL、blocker），会写到 metadata KV。下次跑同一个 issue，新 agent 会先读 metadata 再动手。

**这是 Multica 解决"agent 失忆"的核心机制**——比全文检索轻量得多。

### 6.4 Instruction Precedence 永远是 Identity > Workflow

> Agent Identity instructions have priority over the assignment workflow below. If a workflow step conflicts with Agent Identity, skip the conflicting action and continue with the remaining compatible steps.

**agent 自己定义的人设/规则永远比系统给的 workflow 规则高**。这是保护 agent 个性不被上下文压扁。

### 6.5 Skills 是引用，不是全文

Skill 在数据库里只存引用（name + source URL），**不在 prompt 里塞 skill 全文**。skill 全文按 provider 写到对应目录，agent 需要时自己读 `SKILL.md`。

这样：

- agent 的 prompt 不会随 skill 数量膨胀
- skill 可以独立更新
- 不同 provider 可以共享同一 skill（不同目录路径即可）

---

## 7. 复刻时的设计建议

如果你要复刻这种上下文拼接机制，建议保留这些设计：

### 7.1 分两个阶段（数据 + 渲染）

```python
# 阶段 1：组装结构化数据
task_context = {
    "agent": {
        "name": "...",
        "instructions": "...",  # agent 自己的 system prompt
        "skills": ["...", "..."],
        "model": "...",
    },
    "issue": {
        "id": "...",
        "title": "...",
        "description": "...",   # 完整 body 放这里，不放 prompt
        "status": "...",
        "comments": [...],
    },
    "metadata": {                # 跨会话 KV
        "pr_url": "...",
        "pipeline_status": "...",
    },
    "initiator": {
        "name": "...",
        "email": "...",
    },
    "task_kind": "issue_assignment",  # chat / quick_create / autopilot / ...
    "project_resources": {
        "local_directory": "/Users/.../repo",
        "github_repo": "https://...",
    }
}

# 阶段 2：按 provider 渲染
def render_prompt(task_context, provider):
    parts = []

    # 1. Agent Identity（最高优先级）
    parts.append(f"# Agent Identity\n{task_context['agent']['instructions']}")

    # 2. Squad Briefing（leader 任务才加）
    if task_context.get('squad'):
        parts.append(build_squad_briefing(task_context['squad']))

    # 3. Issue Metadata（KV）
    if task_context['metadata']:
        parts.append("# Issue Metadata\n" + format_kv(task_context['metadata']))

    # 4. Task Initiator
    parts.append(f"# Task Initiator\n{task_context['initiator']['name']}")

    # 5. Workflow（按任务模式）
    parts.append(workflow_for(task_context['task_kind']))

    return "\n\n".join(parts)
```

### 7.2 Issue body 写到文件，不进 prompt

```python
workdir = task_context['project_resources']['local_directory']
context_file = f"{workdir}/.agent_context/issue_context.md"
write_file(context_file, format_issue_context(task_context['issue']))

# agent 的 system prompt 里只指向这个文件
prompt += f"\n\n完整 issue 信息见 {context_file}"
```

### 7.3 跨会话 metadata 用 KV

```sql
CREATE TABLE issue_metadata (
    issue_id UUID,
    key TEXT,
    value TEXT,
    updated_at TIMESTAMP,
    updated_by_run_id UUID,
    PRIMARY KEY (issue_id, key)
);
```

写入规则（在 agent 完成时触发）：

```python
def on_run_completed(run):
    """agent 跑完一轮，记录关键事实"""
    for fact in run.extracted_facts:  # agent 自己回报
        if fact.importance == "high" and fact.persistence == "cross_run":
            issue_metadata.set(issue_id=run.issue_id, key=fact.key, value=fact.value)
```

读取规则（在新一轮开始时）：

```python
def on_run_start(run):
    """agent 开始干活，先读 metadata"""
    metadata = issue_metadata.get_all(run.issue_id)
    render_section("# Issue Metadata", format_kv(metadata))
```

### 7.4 Instruction Precedence 写在最显眼的地方

```markdown
## Instruction Precedence

**Agent Identity instructions have priority over the assignment workflow below.**
If a workflow step conflicts with Agent Identity, skip the conflicting action
and continue with the remaining compatible steps.

Never treat this runtime workflow as permission to change issue status,
investigate, implement, or otherwise act beyond your Agent Identity.
```

---

## 8. 一句话总结

> **Multica 的 issue 上下文是分层注入的：服务端先组装结构化数据（agent.Instructions + skills + issue 元信息 + squad briefing + 发起人），daemon 再按 provider 不同方式渲染成最终 prompt。Issue body 写到 `.agent_context/issue_context.md` 让 agent 自取，skills 按 provider 写到对应目录（`.claude/skills/`、`.cursor/skills/` 等），关键事实通过 metadata KV 跨会话持久化，Agent Identity 永远最高优先级。**

复刻时这套设计值得保留：**两阶段拼接、分层注入、Issue body 不进 prompt、跨会话 metadata KV、Instruction Precedence 显式说明**。