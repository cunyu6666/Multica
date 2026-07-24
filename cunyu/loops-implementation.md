# Loops 实现文档：自然语言定时任务

> 借鉴 Linear Loops（2026-07-20 发布）的设计，
> 讨论如何在你的产品里实现"AI judgment 风格的循环任务"。
>
> 本文分三部分：
> 1. **Loop 的本质抽象** —— 跟传统 cron 的根本区别
> 2. **最小可用实现** —— MVP 怎么起步
> 3. **完整实现** —— V2 应该长什么样

---

## 1. 一句话总结

**Loop = 自然语言目标 + 触发器（schedule / event）+ AI runner + 可观察的执行历史。**

它不是"AI 版的 cron"，而是"AI 反复去达成某个目标"。

---

## 2. Loop 的本质抽象

### 2.1 跟 cron 的对比

```yaml
# Cron 是固定剧本
cron:
  schedule: "0 9 * * 1"        # 每周一 9 点
  script: |
    1. fetch issues from github
    2. filter where status=open and age > 7 days
    3. for each: send reminder
```

```yaml
# Loop 是目标和触发器
loop:
  trigger: 
    type: schedule
    cron: "0 9 * * 1"
  goal: |
    每周一 9 点扫描所有超过 7 天没动的 open issue，
    提醒 owner 更新状态或关闭。
    如果发现 issue 已经解决但没关闭，自动 close 并 @最近一次评论者。
    如果发现 issue 描述不清楚，评论请求补充。
  context:
    - workspace: cunyu6666/multica
    - team: mobile
```

**关键区别**：

- Cron：列出"做什么"
- Loop：列出"达成什么 + 给 AI 自由发挥"

---

### 2.2 Loop 跑一次时发生了什么

```
Trigger (schedule / event)
       ↓
Daemon 接到任务
       ↓
┌─────────────────────────────────────────┐
│  Round 1: AI 读 Goal + 当前状态          │
│  - 读 workspace 数据                      │
│  - 决定下一步: "扫一下 issue 表"          │
│  - 调用 tool: list_open_issues()         │
│  - 拿到结果, 决定下一步: "提醒 5 个"      │
│  - 调用 tool: post_comment() × 5         │
│  - 完成                                  │
└─────────────────────────────────────────┘
       ↓
记录: 这次跑了什么 tool、调了几次、最终结果
       ↓
触发下一轮（如果需要）/ 结束
```

**Loop 每次跑 = 一个多步 AI agent 任务**。和 Multica 现有 agent task 的区别：

| 维度 | 普通 agent task | Loop run |
|---|---|---|
| 触发 | 派任务给 agent / @mention | schedule / event |
| 目标 | 修这个 bug / review 这个 PR | 自然语言描述的"长期目标" |
| 结束条件 | 一次性 | 达成目标 / 超时 / 失败 |
| 输出 | comment / PR / status change | 一次 run 的完整 reasoning + actions |

---

## 3. 数据模型

### 3.1 Loop 定义

```sql
CREATE TABLE loops (
    id              UUID PRIMARY KEY,
    workspace_id    UUID,
    name            TEXT,
    description     TEXT,                    -- 自然语言目标
    trigger_type    TEXT,                    -- 'schedule' / 'event'
    trigger_config  JSONB,                   -- cron 表达式 / event 类型
    context         JSONB,                   -- 默认注入的上下文（workspace, team 等）
    tools           TEXT[],                  -- 允许使用的工具白名单
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    max_rounds      INT NOT NULL DEFAULT 10, -- 单次 run 最多 AI 步数
    max_runtime_sec INT NOT NULL DEFAULT 600,-- 单次 run 最大时长
    cooldown_sec    INT NOT NULL DEFAULT 60, -- 两次 run 间隔
    created_by      UUID,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    last_run_at     TIMESTAMP
);

-- 触发器实例
CREATE TABLE loop_runs (
    id              UUID PRIMARY KEY,
    loop_id         UUID REFERENCES loops(id),
    triggered_at    TIMESTAMP,
    triggered_by    TEXT,                    -- 'schedule' / 'event:xxx' / 'manual'
    status          TEXT,                    -- 'pending' / 'running' / 'success' / 'failed' / 'timeout'
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    rounds_used     INT,                     -- 用了多少 AI 步
    tools_called    JSONB,                   -- [{tool, args, result_preview}, ...]
    summary         TEXT,                    -- AI 最后总结
    error           TEXT
);

CREATE INDEX idx_loop_runs_loop ON loop_runs(loop_id, triggered_at DESC);
```

### 3.2 触发器类型

```python
# Schedule（cron 表达式）
{
    "type": "schedule",
    "cron": "0 9 * * 1"        # 每周一 9 点
}

# Event（监听某个事件）
{
    "type": "event",
    "event": "issue.created",
    "filter": {"team": "mobile"}
}

# Webhook（外部触发）
{
    "type": "webhook",
    "secret": "...",
    "path": "/api/loops/abc-123/trigger"
}

# Manual（手动触发，主要用于调试）
{
    "type": "manual"
}
```

---

## 4. AI Runner 怎么实现

### 4.1 核心循环

```python
def run_loop(loop, run_context):
    """一次 Loop run 的执行"""
    run = create_loop_run(loop, run_context)
    
    history = []
    started_at = time.time()
    
    for round_num in range(loop.max_rounds):
        # 1. 构建 prompt
        prompt = build_loop_prompt(loop, history, run_context)
        
        # 2. 调 LLM
        llm_response = call_llm(prompt, tools=loop.tools)
        
        # 3. 解析 response（要么 tool call，要么 final answer）
        if llm_response.is_final_answer():
            # 完成
            run.summary = llm_response.summary
            run.status = 'success'
            run.rounds_used = round_num + 1
            break
        
        # 4. 执行 tool call
        for tool_call in llm_response.tool_calls:
            result = execute_tool(tool_call, workspace=loop.workspace_id)
            history.append({
                'round': round_num,
                'tool': tool_call.name,
                'args': tool_call.args,
                'result': result,
            })
        
        # 5. 检查超时
        if time.time() - started_at > loop.max_runtime_sec:
            run.status = 'timeout'
            break
    
    if run.status == 'pending':
        run.status = 'failed'
        run.error = 'exceeded max_rounds without final answer'
    
    save(run)
    return run
```

### 4.2 Prompt 模板

```python
LOOP_PROMPT = """
You are running a Loop. Your goal is:

{loop.description}

=== Context ===

Workspace: {workspace.name}
Current time: {now}
This is run #{run_number} of this loop.
Previous run summary: {previous_run_summary}

=== Tools you can use ===

{format_tools(loop.tools)}

=== Round {current_round} of {max_rounds} ===

{format_history(history)}

What's your next step?

If you have achieved the goal, call `final_answer` with a summary.
If you need more information or want to take another action, call the appropriate tool.
"""
```

### 4.3 Tool 白名单

Loop 不能使用所有 tool，必须限制范围（避免一个 Loop 删了整个数据库）：

```python
# 内置安全 tools
SAFE_TOOLS = [
    'list_issues',
    'get_issue',
    'search_issues',
    'post_comment',
    'add_label',
    'update_status',
    'assign_issue',
    'create_issue',
]

DANGEROUS_TOOLS = [   # 需要 Loop 配置里显式 enable
    'delete_issue',
    'archive_workspace',
    'update_user_role',
    'send_email_external',
]

# Loop 创建时勾选 allowed_tools
# 默认只给 SAFE_TOOLS
```

---

## 5. 几个具体 Loops 怎么实现

### 5.1 Loop 例 1：清理陈旧 issue

```yaml
name: 清理陈旧 issue
description: |
  每周一早上 9 点扫描所有超过 30 天没有评论或状态变化的 open issue。
  
  对每个这样的 issue：
  - 如果最近一次评论是在 14 天内，评论提醒 owner
  - 如果最近一次评论超过 30 天，自动关闭并在评论里说明
  - 关闭后 @creator 通知
  
  最后在 workspace 的 #general channel 发一个本周清理报告。
trigger:
  type: schedule
  cron: "0 9 * * 1"
tools:
  - list_issues
  - get_issue
  - post_comment
  - update_status
max_rounds: 20
```

**AI 在这个 Loop 里做的事**：

```
Round 1: list_issues({status: open, no_activity_days: 30})
        → 拿到 12 个 issue
        
Round 2: for each issue: get_issue(id) 了解详情
        → 决定分两类: 3 个还在活跃、9 个真正陈旧
        
Round 3: post_comment(...) 给 3 个活跃的
        update_status({id, status: closed}) 给 9 个
        post_comment(...) 给 9 个关闭者
        
Round 4: final_answer(summary: "清理了 9 个陈旧 issue, 提醒了 3 个活跃 owner")
```

### 5.2 Loop 例 2：自动 triage 新 issue

```yaml
name: 自动 triage 新 issue
description: |
  每当有新 issue 创建时触发。
  
  读 issue 标题和描述，决定：
  - 这是 bug / feature / docs 哪一类？打对应 label
  - 应该归到哪个 project？
  - 谁应该是 assignee（参考过去的同类 issue）？
  
  如果 issue 描述不够清楚（少于 30 字符 + 没有复现步骤），
  评论请求补充信息。
trigger:
  type: event
  event: issue.created
tools:
  - get_issue
  - list_issues            # 找类似 issue
  - add_label
  - assign_issue
  - post_comment
max_rounds: 5
```

### 5.3 Loop 例 3：每日项目摘要

```yaml
name: 每日项目摘要
description: |
  每个工作日 18 点总结当天的进展：
  - 完成了哪些 issue
  - 开了哪些 PR、哪些被合并
  - 哪些 issue 状态变了
  - 哪些 blocker 出现
  
  生成一份精炼的总结，发到项目 channel。
  重点突出"需要决策的事"，不要流水账。
trigger:
  type: schedule
  cron: "0 18 * * 1-5"
tools:
  - list_issues
  - get_issue
  - list_prs
  - post_message          # 发到 channel
max_rounds: 8
```

---

## 6. 跟 Multica autopilot 的关系

### 6.1 现状：Multica 已经有 autopilot

`server/internal/service/autopilot.go` + README 里讲的 autopilots：

> **Autopilots** — schedule recurring work for agents. **Cron triggers, webhooks, or manual runs** — each autopilot creates the issue and routes it to an agent automatically.

**autopilot 已经能做**：cron 触发 + 创建一个 issue + 派给 agent。

### 6.2 跟 Loops 的差距

| 维度 | Multica autopilot | Linear Loops |
|---|---|---|
| **目标定义** | 具体 workflow（步骤固定）| 自然语言目标 |
| **AI 角色** | 执行者（按步骤跑）| 决策者（自己判断怎么做）|
| **决策权** | 在用户写的 workflow | 在 AI |
| **失败恢复** | workflow 报错就停 | AI 自己想办法 |
| **可见性** | 每步日志 | 每步 + 完整 reasoning |

**所以 Loops 不是取代 autopilot**，而是 autopilot 之上的更高层抽象：

```
                    ┌──────────────┐
                    │   Loops      │  ← 自然语言目标
                    │  (V2 加上)   │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  Autopilot   │  ← 已存在: cron + workflow
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  Squad       │  ← 已存在: leader 派活
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  Agent Task  │  ← 基础: 单个 agent 跑
                    └──────────────┘
```

---

## 7. MVP 怎么起步

**别一上来就做完整 Loops**——先做"Loops-lite"：

### Phase 1：autopilot 加强（1-2 周）

不动 autopilot 的核心，**只让它支持"自然语言描述"**：

```python
# 现在
autopilot = {
    "name": "daily-standup",
    "trigger": {"type": "schedule", "cron": "0 9 * * *"},
    "steps": [
        {"type": "agent", "agent": "...", "prompt": "..."},
        {"type": "shell", "cmd": "..."},
    ]
}

# 加上后
autopilot = {
    "name": "clean-stale-issues",
    "trigger": {"type": "schedule", "cron": "0 9 * * 1"},
    "mode": "loops",                    # ← 新增模式
    "goal": "扫描 30 天没动的 open issue, 提醒 owner 或关闭",
    "tools": ["list_issues", "post_comment", "update_status"],
    "max_rounds": 10,
}
```

实现：

- 加一个 `mode` 字段
- 当 `mode == 'loops'`，不用 steps 字段，改用 goal + tools
- 后端调同一个 task runner，但用不同的 prompt 模板

### Phase 2：UI（1-2 周）

```
┌─ Autopilot 编辑器 ─────────────────────────────┐
│                                                │
│  名字: 清理陈旧 issue                            │
│                                                │
│  触发: [Schedule ▼]                              │
│  ┌──────────────────────────────────────────┐  │
│  │ 0 9 * * 1    每周一 9 点                  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  模式:                                          │
│  ◉ Loops (AI judgment)        ← 新选项           │
│  ○ Workflow (固定步骤)        ← 原 autopilot    │
│                                                │
│  ┌─ Loops 模式 ─────────────────────────────┐  │
│  │ 目标 (自然语言):                          │  │
│  │ ┌──────────────────────────────────────┐ │  │
│  │ │ 每周一 9 点扫描所有超过 30 天...        │ │  │
│  │ │ (类似这样写)                          │ │  │
│  │ └──────────────────────────────────────┘ │  │
│  │                                            │  │
│  │ 允许的工具:                                │  │
│  │ ☑ list_issues   ☑ post_comment             │  │
│  │ ☑ update_status ☐ delete_issue             │  │
│  │                                            │  │
│  │ 最大 AI 步数: [10]                          │  │
│  │ 最大运行时间: [600] 秒                      │  │
│  └────────────────────────────────────────┘  │
│                                                │
│  [保存]  [立即测试运行]                          │
└────────────────────────────────────────────────┘
```

### Phase 3：可观察性（1 周）

每个 Loop run 都有完整历史：

```
┌─ Loop: 清理陈旧 issue ─────────────────────────┐
│ 最近 5 次运行:                                  │
│                                                │
│ ✓ 2026-07-21 09:00  4 步   清理 9 个, 提醒 3 个  │
│ ✓ 2026-07-14 09:00  6 步   清理 12 个, 提醒 5 个 │
│ ✗ 2026-07-07 09:00  超时   第 8 步卡住          │
│ ✓ 2026-06-30 09:00  3 步   清理 5 个, 提醒 2 个  │
│                                                │
│ 点击展开看 reasoning:                            │
│ ┌──────────────────────────────────────────┐  │
│ │ Round 1: 我先扫了一下, 发现 12 个...       │  │
│ │ Round 2: 我看了下其中 5 个...              │  │
│ │ Round 3: 我决定关闭 9 个, 提醒 3 个...     │  │
│ │ Round 4: 完成 ✓                            │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## 8. 关键设计决策

### 决策 1：Loop 创建者是开发者还是任何用户？

**建议：分两层**

- **预置 Loop 模板**（产品内置，任何用户可一键启用）
  - "清理陈旧 issue"
  - "每日项目摘要"
  - "自动 triage"
- **自定义 Loop**（power user，写自然语言 + 选工具）

不要让普通用户从零写 Loop——会很难用。

### 决策 2：Loop 出错了怎么办？

```python
# 三层错误处理
if run.status == 'failed':
    if run.rounds_used >= loop.max_rounds:
        # AI 跑满了步数 → 通知人类
        write_inbox_item(
            type='attention.loop_stuck',
            title=f"Loop '{loop.name}' 没收敛",
            body=f"跑了 {run.rounds_used} 步还没完成，请检查",
            severity='warning',
        )
    elif run.status == 'timeout':
        # 超时 → 通知
        write_inbox_item(
            type='attention.loop_timeout',
            title=f"Loop '{loop.name}' 超时",
            severity='warning',
        )
    else:
        # 其他错误 → 记录但不通知
        log_error(run.error)
```

### 决策 3：怎么计费？

```python
# Loop run 成本 = AI token cost + tool call cost
# 计费策略:
- 默认按 AI credits（每 1000 tokens = 1 credit）
- 用户可以设月预算上限（"Loop 总共不超过 100 credits/月"）
- 超预算自动暂停 Loop，发邮件通知
```

### 决策 4：什么时候不要做 Loop？

| 场景 | 用 cron | 用 Loop |
|---|---|---|
| 数据备份 | ✅ | ❌ |
| 同步外部 API | ✅ | ❌ |
| 每日日志归档 | ✅ | ❌ |
| 周报生成 | ❌ | ✅ |
| 自动分类 issue | ❌ | ✅ |
| 通知 owner | ❌ | ✅ |
| 模糊的运营任务 | ❌ | ✅ |

**判断标准**：步骤能不能写死？能写死用 cron，不能写死用 Loop。

---

## 9. 安全和治理

### 9.1 Tool 白名单（必须）

```python
# 每个 Loop 创建时必须勾选工具
# 默认不开 "危险" 工具
DANGEROUS_TOOLS_NEED_CONFIRMATION = [
    'delete_issue',
    'archive_workspace',
    'update_user_role',
    'send_email_external',
    'force_push_branch',
]
```

### 9.2 单次 run 限制

```python
# 必须有这些限制
max_rounds: 10            # 最多 AI 步数
max_runtime_sec: 600      # 最多 10 分钟
max_tool_calls_per_run: 50  # 最多工具调用次数
```

### 9.3 速率限制

```python
# Loop 不能太频繁
min_cooldown_sec: 60      # 同一 Loop 至少间隔 60 秒
max_concurrent_runs: 3    # 同一 Loop 最多 3 个并发
```

### 9.4 审计

```python
# 每次 run 必须有完整日志
run_record = {
    'loop_id': ...,
    'triggered_at': ...,
    'triggered_by': ...,
    'rounds': [
        {'round': 1, 'reasoning': '...', 'tool': 'list_issues', 'args': {...}, 'result_preview': '...'},
        ...
    ],
    'final_summary': '...',
    'success': True/False,
}
```

---

## 10. 反模式（不要做的事）

### ❌ 让 Loop 自己创建新 Loop

```python
# 反模式
tool: create_loop(...)
# 一个 Loop 可以建 1000 个 Loop, 系统雪崩
```

→ **禁止 create_loop 工具**

### ❌ 让 Loop 修改自己的目标

```python
# 反模式
tool: update_loop_description(loop_id, ...)
# 每次跑都改目标, 行为不可预测
```

→ **禁止 update_loop 工具**

### ❌ Loop 之间相互触发

```python
# 反模式: Loop A 完成 → 触发 Loop B
# 容易形成循环依赖
```

→ **Loop 只能被 schedule / event / 手动触发**

### ❌ 无限制的工具

```python
# 反模式: 默认给所有 tool
tools = [t for t in ALL_TOOLS]
```

→ **默认只给安全的 tool, 危险 tool 需显式勾选**

---

## 11. 一句话总结

> **Loops 是"目标驱动"的定时任务，不是 cron 的替代品，是它的上层抽象。**
>
> 实现思路：
> 1. **Phase 1（最简）**：在现有 autopilot 上加 `mode='loops'`，自然语言 + tool 白名单
> 2. **Phase 2**：UI + run 历史
> 3. **Phase 3**：可观察性 + 计费 + 治理
>
> **关键安全设计**：tool 白名单 + 单次 run 限制 + 速率限制 + 审计日志。
>
> **最该避免的反模式**：让 Loop 自己创建新 Loop / 修改自己的目标 / 互相触发。

---

## 附录：跟 Multica autopilot 集成方案

如果你要在 Multica 基础上加 Loops，最小改动方案：

```python
# server/internal/service/autopilot.go
# 现有 Autopilot struct 加一个 mode 字段

type Autopilot struct {
    ID          UUID
    Name        string
    Trigger     TriggerConfig
    
    // 二选一
    Workflow    *WorkflowDefinition  // 现有模式
    Loop        *LoopDefinition      // 新模式
    
    // ...
}

type LoopDefinition struct {
    Goal          string
    AllowedTools  []string
    MaxRounds     int
    MaxRuntimeSec int
}
```

后端调同一个 task runner，根据 mode 选不同的 prompt 模板：

```python
def build_prompt(autopilot, task):
    if autopilot.Loop:
        return build_loop_prompt(autopilot.Loop, task)
    else:
        return build_workflow_prompt(autopilot.Workflow, task)
```

这样**不需要新建表**，复用 autopilot 的存储 + UI + 触发器。最小改动。