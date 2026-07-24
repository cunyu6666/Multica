# Multica 复刻指南：Agent 创建 · Squad 调度 · Issue 循环

> 目标：复刻 Multica 的三个核心机制——
> 1. **Agent 创建**（空白模式 + 智能创建 / Builder 模式 + 模板模式）
> 2. **Squad 小队**（组队、leader 选举、成员管理）
> 3. **Issue 派发到 Squad 循环实现**（leader 接收 → @mention 派给成员 → 成员执行 → 回到 leader）

---

## 0. 全局心智模型

在动手之前，先把这张图刻在脑子里：

```
┌──────────── Workspace ────────────┐
│  • Agents（agent = 一个 Claude/Codex 实例）                  │
│      ↳ 跑在某个 Runtime（local daemon / cloud）             │
│  • Squads（多个 agent 编组，指定一个 leader agent）         │
│  • Issues（任务，可以指派给 agent 或 squad）                │
│  • Members（人类成员，能创建 squad、issue）                 │
└────────────────────────────────────┘

派任务给 "agent"：直接让它执行
派任务给 "squad"：唤醒 leader agent，让它决定派给谁
```

**记住这三件事的不变量**：
- agent 跑在 runtime 上（runtime = 执行环境）
- squad 的 leader 永远是某个具体的 agent
- issue 的 assignee 字段是 `type + id`，type ∈ `{agent, squad}`

---

## 1. 数据模型

先决定你数据库里要有哪些表。Multica 用了 PostgreSQL + pgvector，但 MVP 你用 SQLite/Postgres 都行。

### 1.1 核心表（最低够用版）

```sql
-- 用户/成员
CREATE TABLE members (
  id           UUID PRIMARY KEY,
  workspace_id UUID,
  user_id      UUID,
  role         TEXT  -- 'owner' / 'admin' / 'member'
);

-- Agent（一个 agent = 一个 Claude Code 实例）
CREATE TABLE agents (
  id             UUID PRIMARY KEY,
  workspace_id   UUID,
  name           TEXT,
  description    TEXT,
  instructions   TEXT,                 -- 系统提示词（核心）
  skills         TEXT[],               -- 关联的 skill 名
  runtime_id     UUID,                 -- 在哪台机器上跑
  agent_kind     TEXT,                 -- 'claude_code' / 'codex' / 'copilot_cli' ...
  archived_at    TIMESTAMP,
  created_at     TIMESTAMP,
  created_by     UUID
);

-- Squad（小队）
CREATE TABLE squads (
  id             UUID PRIMARY KEY,
  workspace_id   UUID,
  name           TEXT,
  description    TEXT,
  instructions   TEXT,                 -- 用户自定义的 squad 规则
  leader_id      UUID REFERENCES agents(id),  -- ★ 关键：leader 必须是 agent
  creator_id     UUID,
  archived_at    TIMESTAMP,
  created_at     TIMESTAMP
);

-- Squad 成员
CREATE TABLE squad_members (
  id          UUID PRIMARY KEY,
  squad_id    UUID REFERENCES squads(id),
  member_type TEXT,                     -- 'agent' / 'human'（MVP 只用 agent）
  member_id   UUID,                     -- agent.id
  role        TEXT,                     -- 'leader' / 'member'
  created_at  TIMESTAMP
);

-- Issue（任务）
CREATE TABLE issues (
  id             UUID PRIMARY KEY,
  workspace_id   UUID,
  identifier     TEXT,                  -- 例如 'ACME-123'，UI 上显示的
  title          TEXT,
  description    TEXT,
  status         TEXT,                  -- 'todo' / 'in_progress' / 'in_review' / 'done'
  assignee_type  TEXT,                  -- 'agent' | 'squad' | NULL
  assignee_id    UUID,                  -- agents.id 或 squads.id
  reporter_id    UUID,
  created_at     TIMESTAMP
);

-- Issue 活动（评论 / 状态变更 / @mention）
CREATE TABLE issue_comments (
  id          UUID PRIMARY KEY,
  issue_id    UUID,
  author_type TEXT,                     -- 'member' / 'agent'
  author_id   UUID,
  body        TEXT,
  mentions    JSONB,                    -- 解析出来的 @mention 列表
  created_at  TIMESTAMP
);

-- Runtime（agent 跑在哪里）
CREATE TABLE runtimes (
  id          UUID PRIMARY KEY,
  workspace_id UUID,
  name        TEXT,
  kind        TEXT,                     -- 'local' / 'cloud'
  status      TEXT,                     -- 'online' / 'offline'
  last_seen   TIMESTAMP
);
```

### 1.2 关系约束（按 Multica 的硬规则）

- `squads.leader_id` 必须存在 → 应用层校验，不要用 FK 强约束
- `issue.assignee_type = 'squad'` 时，`assignee_id` 必须存在 → 同上应用层校验
- 一个 issue 同一时刻只有一个 assignee

---

## 2. 三种 agent 创建模式

Multica 用三种入口创建 agent（看 `server/internal/handler/agent.go:1` 和 `agent_builder.go:4`）。复刻时建议保留这三种：

### 2.1 空白模式（Blank agent）

最简单。用户填名字、描述、runtime，系统给一套最小提示词骨架。

```python
# 后端：POST /api/agents
def create_blank_agent(workspace_id, user, payload):
    instructions = payload.get('instructions', '')
    if not instructions.strip():
        instructions = '''You are a helpful coding agent in this workspace.
Stay terse. Read the issue before acting. Ask when stuck.'''
    
    agent = insert_agent(
        workspace_id=workspace_id,
        name=payload['name'],
        description=payload['description'],
        instructions=instructions,
        runtime_id=payload['runtime_id'],
        agent_kind=payload.get('agent_kind', 'claude_code'),
        created_by=user.id,
    )
    return agent
```

**前端：单页表单**
- 名字、描述、runtime 下拉、agent 类型（Claude Code / Codex 等）、instructions 多行文本框
- 一个"创建"按钮

### 2.2 模板模式（From template）

预置几套"行业最佳实践"配置，用户挑一个一键创建。

```python
# 内置几个模板（你可以先做 3 个示范）
TEMPLATES = [
    {
        'slug': 'frontend-engineer',
        'name': 'Frontend Engineer',
        'category': 'Engineering',
        'icon': 'Palette',
        'accent': 'info',
        'instructions': '''You are a senior frontend engineer.
Focus on React/TypeScript, accessibility, and design fidelity.
Always run pnpm typecheck and pnpm test before reporting done.''',
        'skills': ['component-review', 'accessibility-audit'],
    },
    {
        'slug': 'backend-engineer',
        ...
    },
    # 你的产品场景
]

# 后端：POST /api/agents/from-template
def create_agent_from_template(workspace_id, user, template_slug):
    tpl = load_template(template_slug)
    agent = create_blank_agent(workspace_id, user, {
        'name': tpl['name'],
        'description': tpl['description'],
        'instructions': tpl['instructions'],
        'runtime_id': user.default_runtime_id,  # 让用户选 runtime
    })
    # 关联 skills（如果你做了 skill 系统）
    for skill_name in tpl['skills']:
        attach_skill(agent.id, skill_name)
    return agent
```

**前端：模板选择器**
- 顶部按 `category` 分组
- 每个模板一张卡片：图标 + 名字 + 一句话描述
- 点选后弹出"选 runtime"对话框，确认创建

### 2.3 智能创建 / Builder 模式（AI 配 agent）

这是 Multica 最有意思的入口（`agent_builder.go`）。跟用户多轮对话，问清楚需求，AI 自动给出一份 agent 配置（名字、instructions、技能）。

**核心思路：派一个临时的"配 agent 的 agent"去跟用户聊天，聊天结束产出一份结构化配置。**

```python
# 后端：POST /api/agents/builder-sessions
def start_builder_session(workspace_id, user):
    """起一个新会话，让 AI 配 agent"""
    # 创建一个私有的"builder agent"（也是普通 agent，只是专用来配置）
    builder = create_blank_agent(
        workspace_id,
        creator_id=user.id,
        name='Agent Builder',
        instructions='''你是 "Agent Builder"。你的工作是跟用户多轮对话，
搞清楚他们想要一个什么样的 agent 来做什么工作，最后产出一份结构化配置：
- name（名字）
- description（一句话）
- instructions（系统提示词）
- skills（需要的技能列表）
用 3-5 轮对话问清楚用户的真实需求，每轮只问 1 个最重要的问题。
产出用 ```json config 块给出。'''
    )
    
    session = create_chat_session(workspace_id, builder.id, user.id)
    return {'session_id': session.id, 'builder_agent_id': builder.id}

# 用户在聊天里聊完，提交配置：
# POST /api/agents/builder-sessions/{session_id}/complete
def complete_builder_session(session_id, payload):
    """从 builder session 的最后一轮聊天里提取配置，然后创建真 agent"""
    config = payload  # {name, description, instructions, skills}
    return create_blank_agent(...)
```

**前端：智能创建对话流**
```
┌─ Step 1 ────────────────────────┐
│  [空白]  [模板]  [智能创建]      │   ← 模式选择 tabs
└────────────────────────────────┘
        ↓ 选"智能创建"
┌─ Step 2 ────────────────────────┐
│  💬 跟 Agent Builder 聊天       │
│  Bot: 你想要什么样的 agent？     │
│  你: 我想做一个专门修 bug 的     │
│      Bot: 修什么样的代码？       │
│  你: 主要 Python 后端...         │
│      Bot: 它应该遵守什么约定？   │
│      ...                         │
│      Bot: 好的，配置：           │
│      ```json                     │
│      { name: "BugFixBot", ... }  │
│      ```                         │
└────────────────────────────────┘
        ↓ 用户点"用这个配置创建"
┌─ Step 3 ────────────────────────┐
│  选 runtime → 创建成功          │
└────────────────────────────────┘
```

---

## 3. Squad 创建与调度

这是 Multica 最核心的机制，分三块：

### 3.1 创建 Squad

```python
# POST /api/squads
def create_squad(workspace_id, user, payload):
    # 1. 验证 leader 必须是 agent
    leader = get_agent(payload['leader_id'])
    if not leader or leader.workspace_id != workspace_id:
        raise BadRequest('leader must be a valid agent in this workspace')
    
    # 2. 创建 squad
    squad = insert_squad(
        workspace_id=workspace_id,
        name=payload['name'],
        description=payload['description'],
        instructions=payload.get('instructions', ''),
        leader_id=leader.id,
        creator_id=user.id,
    )
    
    # 3. 自动把 leader 加进 members 表，role='leader'
    add_squad_member(squad.id, 'agent', leader.id, role='leader')
    
    # 4. 用户传了其他成员，继续加
    for member_id in payload.get('additional_members', []):
        add_squad_member(squad.id, 'agent', member_id, role='member')
    
    return squad
```

**关键设计**：leader 不是一个独立实体，它**必然是某个 agent**。这样做的好处：
- leader 自己能直接跑任务（兜底，比如所有其他成员都忙）
- leader 的 runtime / kind 直接复用，不需要重复配置
- 创建 squad 后，**leader 已经自动在 squads 表里、role=leader**

### 3.2 Squad Leader 的工作模式

**这是最关键的一段。** Multica 的 leader 不"做事"，它只**"派事"**。

`server/internal/handler/squad_briefing.go:16` 有一段很完整的"系统提示词模板"，核心规则翻译成中文版给你：

```python
SQUAD_LEADER_BRIEFING = '''
## 小队工作协议

**你现在是这个 squad 的 leader。** 你的工作是协调，不是干活。

规则：
1. 读 issue（标题、描述、最新评论），根据"小队花名册"里每个成员的 skill，
   挑最合适的那个执行。
2. 用 @mention 派任务。评论里 **必须用 Markdown mention 格式**：
   [@成员名](mention://agent/<uuid>)
   不能用纯文本 "@name"（不会触发 agent）。
3. 派完任务 **结束你的回合**。不要继续干活，也不要写代码。
   你会被自动再次唤醒：
   - 成员有更新或提问时
   - 成员完成时
   - 有人再次 @你时
4. 每次被唤醒都要重新评估，但**只在必要时才再派人**。
   如果成员发了进度更新但没要回复，记录 `no_action` 然后沉默退出。
5. 不要重复 issue 内容（成员已经看过了）。
   你的评论只说"派谁、为什么、额外约束"，2-3 句话足够。
6. 如果 squad 没有人能做，发评论说明（@issue 报告者），别自己悄悄干了。
'''
```

**怎么把这段 prompt 注入 leader agent**？

```python
def claim_task(task, agent):
    """leader agent 认领任务时，给它注入 squad briefing"""
    if task.assignee_type == 'squad':
        squad = get_squad(task.assignee_id)
        if squad.leader_id == agent.id:
            # 我就是 leader，注入 briefing
            briefing = build_squad_briefing(squad, owns_issue_status=True)
            task.prompt = briefing + '\n\n## Issue:\n' + task.prompt
    return run_agent(task, agent)


def build_squad_briefing(squad, owns_issue_status):
    parts = [SQUAD_LEADER_BRIEFING]
    
    # 花名册（动态生成，每个成员给一个 mention markdown）
    roster = ['\n## 小队花名册\n']
    roster.append(f'- **你自己（leader）**: [@{squad.leader.name}](mention://agent/{squad.leader.id})')
    for m in get_squad_members(squad.id):
        if m.role == 'leader':
            continue
        roster.append(f'- **{m.name}** ({m.role}): [@{m.name}](mention://agent/{m.id})')
    parts.append('\n'.join(roster))
    
    # 用户自定义规则
    if squad.instructions:
        parts.append(f'\n## 小队自定义规则\n{squad.instructions}')
    
    if not owns_issue_status:
        parts.append('\n（本 issue 不归你这个 squad 管，别动它的 status。）')
    
    return '\n'.join(parts)
```

### 3.3 Leader 派任务 → 成员执行的触发链

这是 issue 在 squad 里"循环"的真正路径。触发链：

```
人类：指派 issue 给 squad
   ↓
后端：assignee_type=squad, assignee_id=squad.id，唤醒 leader
   ↓
Leader agent 跑起来，看到 briefing → 写一条评论：
       "[@Alice](mention://agent/<Alice-uuid>) 这个 bug 你看下，重点检查 XX。"
   ↓
后端：解析评论里的 mention，发现是 agent Alice
   ↓
后端：把任务入队到 Alice
   ↓
Alice 起来执行：clone 代码、改、跑测试、commit、push、开 PR
   ↓
Alice 跑完，在 issue 下发评论：
       "PR 开好了 [#456](github.com/...)。等 leader 决定下一步。"
   ↓
（此时问题来了：是触发 leader 还是谁？）
```

**关键的设计决策**：

Multica 的做法 — **leader 不需要被自动再次唤醒**，除非：
- 成员完成时（需要 leader 决定下一步）
- 成员发评论 @leader
- 有新的 @mention

实现上：
- 任务执行者完成时 → 发系统事件 `issue.commented` + `issue.status_changed`
- 这个事件检查：是不是 squad 的 leader 该被唤醒？
- 如果是 → 重新入队 leader 任务

```python
def on_agent_finished(agent, task):
    """某个 agent 完成一次任务后调用"""
    issue = get_issue(task.issue_id)
    
    # 如果 issue 当前 assignee 是 agent（直接派），且成员完成 → 通知人类
    if issue.assignee_type == 'agent':
        if issue.assignee_id == agent.id:
            notify_human(issue, task)
        return
    
    # 如果是 squad，看 leader 是否需要被唤醒
    if issue.assignee_type == 'squad':
        squad = get_squad(issue.assignee_id)
        # 成员完成了 → 自动唤醒 leader，让它决定下一步
        if agent.id != squad.leader_id:
            enqueue_leader_task(squad, issue, reason='member-finished')
            return
```

**循环就这样开始了**：
- 用户派给 squad → leader 派给 Alice
- Alice 干完 → 自动唤醒 leader
- leader 看 Alice 的成果 → 决定派给 Bob 做 code review
- Bob 干完 → 自动唤醒 leader
- leader 看 Bob 觉得可以 → 改 issue status 为 in_review，关循环

---

## 4. Issue 派发到 Squad 的完整循环

把 1+2+3 串起来，就是一个完整循环的实现步骤：

### 4.1 UI 层（前端）

需要的页面：
- **新建 Issue** — 标题、描述、assignee 选择器（"agent" 或 "squad"）
- **Issue 详情** — 右侧评论流，左侧状态、assignee、关联 PR
- **新建 Squad** — 名字、描述、leader 选择器、成员多选
- **新建 Agent** — 三 tabs：空白 / 模板 / 智能创建

### 4.2 后端最关键的两个端点

```python
# 指派 issue（无论是 agent 还是 squad 都用这同一个端点）
POST /api/issues/{id}/assign
{
    "assignee_type": "agent" | "squad",
    "assignee_id": "<uuid>"
}

# 处理流程：
def assign_issue(issue_id, user, payload):
    issue = get_issue(issue_id)
    issue.assignee_type = payload['assignee_type']
    issue.assignee_id = payload['assignee_id']
    issue.status = 'in_progress'  # 指派即开始
    save(issue)
    
    # 唤醒执行者
    if payload['assignee_type'] == 'agent':
        enqueue_task(issue, agent_id=payload['assignee_id'])
    else:  # squad
        squad = get_squad(payload['assignee_id'])
        enqueue_leader_task(squad, issue)
```

### 4.3 一个自动循环的"剧本"

写一个端到端的剧本，帮你在脑子里跑一遍：

```
1. 用户在 UI 创建 issue：
   "用户登录要支持手机号"  → 指派给 @FrontendTeam（squad）

2. 后端：FrontendTeam 的 leader 是 "AliceBot"，自动唤醒它
   注入 SQUAD_LEADER_BRIEFING + 花名册

3. AliceBot 跑一轮 Claude API：
   - 读 issue
   - 看花名册：AliceBot 自己是 leader，下面有 BugFixBot、CodeReviewerBot
   - 决定让 BugFixBot 修这个
   - 发评论：
     "[@BugFixBot](mention://agent/<BugFixBot-uuid>) 改一下 login 模块，记得加测试。"

4. 后端：解析这条评论的 mentions
   - 找到了 agent mention（BugFixBot）
   - 创建子任务：assignee=BugFixBot, parent_issue=原 issue
   - 唤醒 BugFixBot

5. BugFixBot 跑起来：
   - 改代码 → commit → push → 开 PR
   - 发评论："PR #456 已开，CI 在跑。"

6. 后端：BugFixBot 完成事件触发
   - 检查到 issue.assignee_type=squad，leader != BugFixBot
   - 再次唤醒 leader (AliceBot)

7. AliceBot 再跑一轮：
   - 读新评论："PR #456 已开，CI 在跑"
   - 看花名册：这次派给 CodeReviewerBot
   - 发评论：
     "[@CodeReviewerBot](mention://agent/<CodeReviewerBot-uuid>) 看一下 PR #456，重点检查手机号格式校验。"

8. CodeReviewerBot 跑起来：
   - 看 PR
   - 发评论："看了一遍，主要 OK，但建议把正则校验抽到 utils。"

9. 后端又触发 leader 唤醒 → AliceBot 决定：
   - 把 issue.status 改为 in_review
   - 不再派人，等人类介入

10. 人类上线，看到 PR 已经准备好，in_review 状态，点 done
```

### 4.4 一些必须想清楚的边界条件

**Q：leader 在多个 issue 间如何排队？**
A：每个 leader 有自己的任务队列，按时间顺序处理，避免一个 leader 同时跑多个回合。

**Q：成员完成后 leader 多久内必须再次被唤醒？**
A：建议立即（毫秒级事件）触发，不要用 cron 轮询。这样 leader 几乎"实时"继续工作。

**Q：@mention 怎么解析？**
A：用正则匹配 `[@<name>](mention://<type>/<uuid>)`，没有这个格式的 @ 文字不触发。

**Q：leader 出现异常怎么办？**
A：跑 N 轮还没收敛（仍在 in_progress），应该发警告给人类，避免无限循环。

**Q：squad 可以嵌套吗？**
A：Multica 不支持（leader 必须是 agent）。建议你也不支持，保持简单。

---

## 5. MVP 实施顺序

**Day 1 — 数据模型 + 一个能跑的 agent**
- 建数据库表
- 实现空白模式创建 agent
- 让 agent 能认领一个 issue 并完成一句话回复（不需要真的改代码，先跑通流程）

**Day 2 — Issue 派给 agent**
- 写 issue 详情页（不用美化）
- 写派发端点
- 让 agent 真的能写代码、commit、开 PR

**Day 3 — Squad 创建 + leader 路由**
- 写 squad CRUD
- 实现 leader 被 squad 任务唤醒的路径
- leader 发一条 @mention 评论即可（成员可能还不存在，先打通 leader 路由）

**Day 4 — 成员循环**
- 实现成员执行的路径
- 实现"成员完成 → 唤醒 leader"的回调
- 完成一套真实的 squad 协作

**Day 5 — 智能创建**
- 实现 agent builder（其实就是再开一个 agent，对话产出配置）
- 三个入口都跑通

---

## 6. Multica 代码路径速查表

复刻时遇到细节直接看这些文件：

| 你要做什么 | 看这个文件 |
|---|---|
| Agent 空白创建 | `server/internal/handler/agent.go` 第 1139 行 `CreateAgent` |
| Agent 模板创建 | `server/internal/handler/agent.go` `CreateAgentFromTemplate` |
| Agent 智能创建 | `server/internal/handler/agent_builder.go` |
| Squad CRUD | `server/internal/handler/squad.go` 第 229 行 `CreateSquad` |
| Squad leader briefing | `server/internal/handler/squad_briefing.go` 第 16 行 |
| Leader 任务入队 | `server/internal/handler/issue_trigger.go` 第 49 行 `enqueueSquadLeaderTask` |
| Issue 指派 | `server/internal/handler/issue_trigger.go` 第 49 行 `dispatchIssueRun` |
| 路由 | `server/cmd/server/router.go` 第 1159 / 1233 行 |
| API 触发 squad leader 任务的 mention 解析 | `server/internal/handler/comment.go`（mentions 解析） |

---

## 7. 复刻时可以省的事（先不做）

Multica 这些特性在 MVP 阶段可以缓一缓：

- **WebSocket 实时推送** — MVP 用轮询就行
- **成员权限 / RBAC** — MVP 就一种角色，全员可创建
- **Autopilot（定时任务）** — 第二阶段
- **Skill 体系（可复用技能）** — 第二阶段
- **PR 自动快照** — 第二阶段
- **Onboarding wizard** — 第二阶段
- **多 workspace 切换** — MVP 只支持一个 workspace
- **Cloud runtime** — MVP 只支持 local daemon
- **Avatar 系统** — 用 emoji 占位就行

---

## 8. 最终那张图（你心里要刻着的版本）

```
┌─────────────────────────────────────────────────────────────┐
│  Issue 指派给 squad                                          │
│      ↓                                                       │
│  后端 enqueueSquadLeaderTask                                │
│      ↓                                                       │
│  Leader agent 收到任务                                       │
│      ↓   (prompt 已被注入 SQUAD_LEADER_BRIEFING)            │
│  Leader 读 issue → 选成员 → 发 @mention 评论                 │
│      ↓                                                       │
│  后端解析评论 mentions → 入队成员任务                         │
│      ↓                                                       │
│  成员 agent 执行（clone code / commit / push / PR）           │
│      ↓                                                       │
│  成员完成事件 → 自动 enqueueSquadLeaderTask                   │
│      ↓                                                       │
│  Leader 又醒过来 → 决定下一步（review / escalate / done）     │
│      ↓                                                       │
│  循环直到 leader 觉得完成 → issue.status = in_review         │
└─────────────────────────────────────────────────────────────┘
```

Leader 是协调者，不是执行者。**循环的节奏 = leader 在每轮决定"还要派给谁"**。把这一点想明白，整个 squad 机制就懂了。
