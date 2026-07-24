# "Attention Inbox" 设计：把需要人类决策的消息收敛到一个地方

> 借鉴 Multica 现有 Inbox 机制 + 改进，做一个专门给人类决策用的"注意力收件箱"。

---

## 1. 一句话总结

**用一张 `inbox_item` 表，把所有"需要人类看/决策"的信号（agent 卡住 / 失败 / 求助 / PR 待审 / 跨 squad escalate 等）统一收口，前端一个 `/inbox` 页面 + 一个红色未读徽标搞定。**

---

## 2. Multica 现有的 Inbox 是什么样的

看 `server/internal/handler/inbox.go`，数据结构已经非常完整：

```go
type InboxItemResponse struct {
    ID            string          // 唯一 id
    WorkspaceID   string          // 哪个 workspace
    RecipientType string          // 'member' / 'agent'
    RecipientID   string          // 谁收
    Type          string          // 类型（决定图标和文案）
    Severity      string          // 'info' / 'warning' / 'action_required'
    IssueID       *string         // 关联的 issue
    Title         string          // 标题（一行）
    Body          *string         // 详情（可选）
    Read          bool            // 已读未读
    Archived      bool            // 归档
    CreatedAt     string          // 时间
    ActorType     *string         // 谁发起的
    ActorID       *string
    Details       json.RawMessage // 任意附加数据
}
```

**API 端点**（从 `inbox.go` 看到）：

```
GET    /api/inbox              列出未归档
GET    /api/inbox/archived     列出已归档
POST   /api/inbox/{id}/read    标已读
POST   /api/inbox/{id}/archive 归档
POST   /api/inbox/mark-all-read 全部已读
POST   /api/inbox/archive-all  全部归档
POST   /api/inbox/archive-all-read 归档所有已读
POST   /api/inbox/archive-completed 归档"已完成"类型的
GET    /api/inbox/unread-count 未读数量
GET    /api/inbox/workspace-unread-summary 按 workspace 汇总
```

**前端**有完整的 `/inbox` 页面（`packages/views/inbox/components/inbox-page.tsx`），未读会显示在导航栏的徽标。

---

## 3. Multica 现在的 Type 都覆盖了哪些场景

从代码看到现有的 inbox 类型（`task.go`、`autopilot.go`）：

```
quick_create_done              用户 quick-create 成功
quick_create_failed            用户 quick-create 失败
assign                         被分派任务
status_change                  issue 状态变化
mention                        @提到
agent_failure                  agent 跑挂了
squad_no_action                squad 评估为 no_action
autopilot_run_done             autopilot 跑完
...（还有很多，根据业务增长）
```

**核心洞察**：Multica 的 inbox 已经是"任何需要人知道的事"都往里塞的模式，**没有专门区分"决策类"和"通知类"**。

---

## 4. 你想要的"Attention"和 Multica Inbox 的差异

| 维度 | Multica Inbox | 你想要的 Attention |
|---|---|---|
| 包含什么 | 一切通知 | **只**需要人类决策的事 |
| 心理负担 | 重（所有信号） | 轻（只决策） |
| 触发条件 | 自动写 | **只在"非决策不可"时**写 |
| 默认清空策略 | 手动归档 | 决策完自动消化 |
| UI 位置 | 侧栏 inbox | 主屏幕最显眼位置 |
| 谁能写 | 系统 + agent | 系统 + agent + workflow step |

**关键区别**：Multica 的 inbox 是"消息中心"，你的 Attention 是"决策待办"。

---

## 5. 怎么在 Multica 基础上做 Attention

最简洁的实现：**复用 inbox_item 表，加一个 `requires_decision` 字段**，前端 `/inbox` 页面分两个 tab（"消息"+"待决策"）。

### 5.1 数据层改动

```sql
-- 加一个字段就行
ALTER TABLE inbox_item 
  ADD COLUMN requires_decision BOOLEAN NOT NULL DEFAULT FALSE;

-- 加索引方便查询
CREATE INDEX idx_inbox_attention 
  ON inbox_item(recipient_id, read, archived, requires_decision)
  WHERE requires_decision = TRUE AND archived = FALSE;
```

### 5.2 写入端：哪些场景会写 Attention

按严重程度递减，分三类：

#### A. 阻塞型（必须人来才能继续）

```python
def on_squad_blocked(squad, issue, reason):
    """squad 跑了 N 轮还没收敛"""
    return InboxItem(
        type="attention.squad_blocked",
        severity="action_required",
        requires_decision=True,
        title=f"{squad.name} 卡在 {issue.identifier}",
        body=reason,  # "5 轮没进展，似乎缺一个能做这活的 agent"
        issue_id=issue.id,
        details={"suggested_actions": [
            "添加一个能做这活的 agent",
            "把 issue 派给别的 squad",
            "自己接手改"
        ]}
    )

def on_squad_no_capable_member(squad, issue, leader_comment):
    """squad 里没人能做这事"""
    return InboxItem(
        type="attention.no_capable_member",
        severity="action_required",
        requires_decision=True,
        title=f"{squad.name} 没人能做 {issue.identifier}",
        body=leader_comment,
        issue_id=issue.id,
    )

def on_destructive_op_requested(agent, op, reason):
    """agent 想做破坏性操作（删数据、force push、--no-verify）"""
    return InboxItem(
        type="attention.destructive_op",
        severity="action_required",
        requires_decision=True,
        title=f"{agent.name} 想 {op}",
        body=reason,
        details={"agent_id": ..., "operation": op, "command": "..."}
    )

def on_external_secret_needed(agent, service):
    """agent 需要密码/token"""
    return InboxItem(
        type="attention.secret_needed",
        severity="action_required",
        requires_decision=True,
        title=f"{agent.name} 需要 {service} 凭据",
        body=f"请在 Settings → Integrations 添加 {service} access token"
    )
```

#### B. 决策型（人来判断会更聪明）

```python
def on_pr_ready_for_review(pr):
    """PR 跑完 CI 等人 review"""
    return InboxItem(
        type="attention.pr_ready",
        severity="info",
        requires_decision=True,
        title=f"PR #{pr.number} 准备好 review",
        issue_id=pr.issue_id,
        details={"pr_url": pr.url, "files_changed": pr.file_count}
    )

def on_conflicting_advice(agent_a, agent_b, issue):
    """两个成员意见冲突"""
    return InboxItem(
        type="attention.conflicting_advice",
        severity="warning",
        requires_decision=True,
        title=f"{agent_a.name} 和 {agent_b.name} 意见不一致",
        issue_id=issue.id,
        body=f"请决定采用哪一方"
    )

def on_ambiguous_status(issue, agent):
    """agent 觉得完成但不确定"""
    return InboxItem(
        type="attention.ambiguous_completion",
        severity="warning",
        requires_decision=True,
        title=f"{agent.name} 觉得 {issue.identifier} 完成了",
        body="但有些验证未通过，请确认",
        issue_id=issue.id,
    )
```

#### C. 通知型（不需要决策，但相关）

这些**不要**进 Attention，留在普通 Inbox 即可：

```python
NOT_ATTENTION_TYPES = {
    "issue_assigned",       # 派任务给你了（不是 attention，是 fact）
    "comment_added",         # 评论（不需要决策）
    "status_changed",        # 状态变化（自动的）
    "agent_started",         # agent 开始跑
    "agent_finished",        # agent 完成
}
```

### 5.3 消费端：UI 设计

**主屏幕顶部固定一个红条**（比 inbox 徽标更显眼）：

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  3 件需要你决定的事    [立即查看]                    │  ← 永远置顶
└─────────────────────────────────────────────────────────┘
```

**点击进入 `/attention` 页面**：

```
┌─────────────────────────────────────────┐
│  待决策 (3)                             │
├─────────────────────────────────────────┤
│                                         │
│  🔴 前端 Squad 卡在 MUL-123              │
│     跑了 5 轮没进展，缺能改登录的人       │
│     [添加 agent] [改派 squad] [我自己来] │
│                                         │
│  🟡 PR #456 准备好 review                │
│     改动了 12 个文件，CI 全过             │
│     [打开 PR] [通过] [打回]              │
│                                         │
│  🟠 AliceBot 想 force push              │
│     "Rebase 失败，建议 --force-with-lease"│
│     [批准] [拒绝] [改用 rebase]          │
│                                         │
└─────────────────────────────────────────┘
```

**每个 Attention 一行**：
- 左：类型图标（🔴🟡🟠）+ 标题
- 中：一句话详情
- 右：直接给出可执行动作（不用跳到 issue）

**已读自动消化**：你点了一个动作 / 标为已处理，**自动归档**。不像普通 inbox 要手动 archive。

### 5.4 Action 处理

每个 Attention 类型对应一组可执行 action：

```python
ATTENTION_ACTIONS = {
    "attention.squad_blocked": [
        {"id": "add_agent", "label": "添加能干的 agent", "endpoint": "/api/agents"},
        {"id": "reassign", "label": "改派别的 squad", "endpoint": "/api/issues/{id}/assign"},
        {"id": "take_over", "label": "我自己来", "endpoint": "/api/issues/{id}/assign"},
    ],
    "attention.pr_ready": [
        {"id": "open_pr", "label": "打开 PR", "url": "{pr_url}"},
        {"id": "approve", "label": "通过", "endpoint": "/api/issues/{id}/status"},
        {"id": "reject", "label": "打回", "endpoint": "/api/issues/{id}/comment"},
    ],
    "attention.destructive_op": [
        {"id": "approve", "label": "批准", "endpoint": "/api/attention/{id}/approve"},
        {"id": "reject", "label": "拒绝", "endpoint": "/api/attention/{id}/reject"},
    ],
    # ...
}
```

点击 action → 调 endpoint → 后端执行并标 Attention 为 `resolved` + 自动归档。

---

## 6. 数据模型完整版

```sql
CREATE TABLE inbox_item (
    id                UUID PRIMARY KEY,
    workspace_id      UUID,
    recipient_type    TEXT,    -- 'member' / 'agent'
    recipient_id      UUID,
    type              TEXT,    -- 'attention.xxx' / 'notification.xxx'
    severity          TEXT,    -- 'info' / 'warning' / 'action_required'
    requires_decision BOOLEAN NOT NULL DEFAULT FALSE,
    issue_id          UUID,
    title             TEXT,
    body              TEXT,
    details           JSONB,
    suggested_actions JSONB,   -- ← 新增：可执行动作列表
    resolved          BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by       UUID,
    resolved_at       TIMESTAMP,
    read              BOOLEAN NOT NULL DEFAULT FALSE,
    archived          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP
);

-- Attention 专用索引
CREATE INDEX idx_inbox_attention_pending
  ON inbox_item(recipient_id, workspace_id, created_at DESC)
  WHERE requires_decision = TRUE 
    AND resolved = FALSE 
    AND archived = FALSE;
```

---

## 7. 后端 API

```python
# 列出当前用户所有待决策项
GET /api/attention
→ 返回 [{id, type, severity, title, body, issue_id, suggested_actions, created_at}]

# 未读/未决策数量（导航栏徽标用）
GET /api/attention/count
→ {"count": 3}

# 标为已读
POST /api/attention/{id}/read

# 处理（执行 action）
POST /api/attention/{id}/resolve
{
    "action_id": "approve",
    "resolution_note": "Approved, force push is fine here"
}
→ 服务端执行对应动作，标 resolved + archived
```

---

## 8. 触发时机一览

| 触发点 | 文件位置（Multica） | 应该写哪种 Inbox |
|---|---|---|
| agent 跑完 | `service/task.go:onAgentFinished` | 普通（status change） |
| agent 失败 | `service/task.go` | **Attention（如果 N 次后）** |
| squad 评估 no_action | `service/squad_no_action.go` | 普通 |
| squad leader 卡住 N 轮 | （自己实现） | **Attention（必须决策）** |
| squad 没合适成员 | `handler/squad_briefing.go` prompt 里 | **Attention（必须决策）** |
| PR 开好 | `service/autopilot.go` 或自己实现 | **Attention（PR 待审）** |
| destructive op 请求 | （自己实现） | **Attention（必须决策）** |
| 人类被 @mention | `handler/comment.go` | 普通（事实通知） |
| issue 被派给你 | `handler/issue_trigger.go` | 普通 |

**规律**：能自动继续的 → 普通；只有人能继续的 → Attention。

---

## 9. 与 Squad 协议的协作

回到之前蕾姆给你看的 `squad_briefing.go`——leader 有 5 条规则，其中第 5 条：

> 5. **Re-evaluate on each trigger.** When you wake up again, read the new activity and decide whether to delegate the next step, **escalate to the human reporter**, or close the loop.

"escalate to the human reporter" 这一步**就是写 Attention** 的入口：

```python
def leader_escalate_to_human(leader, issue, reason):
    """leader agent 决定 escalate 时调用"""
    inbox_item = InboxItem(
        type="attention.squad_escalation",
        severity="action_required",
        requires_decision=True,
        title=f"{leader.squad.name} 把 {issue.identifier} escalate 给你",
        body=reason,
        issue_id=issue.id,
        actor_type="agent",
        actor_id=leader.id,
        suggested_actions=[
            {"id": "give_hint", "label": "给点提示让 agent 继续", "endpoint": "..."},
            {"id": "reassign", "label": "改派给别的 squad", "endpoint": "..."},
            {"id": "take_over", "label": "我自己来", "endpoint": "..."},
        ]
    )
```

这把"leader 在 prompt 里被告诉要 escalate"和"实际产生 Attention item"接上了。

---

## 10. UI 上的关键设计决策

### 决策 1：Attention vs Inbox 是同一个页面还是分开？

**建议：同一个页面，两个 tab。**

- Tab 1: **Attention**（红圈，必看）
- Tab 2: **Inbox**（普通通知，可选）

理由：数据复用、用户只需记一个 URL、视觉层级清晰。

### 决策 2：Attention 红条要不要全屏永远显示？

**建议：是的，最显眼的位置。**

放在主屏幕顶部或者 sidebar 顶部，永远可见。未读数量作为红色徽标。

### 决策 3：Attention 处理完要不要立刻消失？

**建议：是的，处理完立刻归档。**

不像普通 inbox 可以堆积。Attention 的本质是"未决问题"，处理完就不需要保留。

### 决策 4：Attention 多了怎么办？

**建议：按 workspace 分组**（如果你有多个 workspace），或者按类型分组。

UI 上加个 filter：`[全部] [我的 squad] [PR review] [危险操作]`

---

## 11. MVP 实施

### Phase 1（1 周）

- 加 `requires_decision` 字段
- 加 `/api/attention` 端点
- 在 `squad_briefing.go` 的 leader 触发 escalate 时写 Attention
- 前端加 `/attention` 页面（复用 inbox-display 组件）

### Phase 2（1 周）

- 加 destructive op 检测（agent 写代码时拦截危险命令）
- 加 PR 准备好时写 Attention
- 加 `suggested_actions` 字段和对应 API
- 处理完自动归档逻辑

### Phase 3（持续）

- 按用户使用数据调整哪些进 Attention、哪些不进
- 决策权交给用户配置（"PR review 我不想被打扰"）

---

## 12. 一句话总结

> **复用 Multica 的 inbox_item 表 + 加 `requires_decision` 字段 + `/attention` 单独 tab = "Attention Inbox"。**
>
> 关键判断标准：**这件事能不能自动继续？能就普通通知，不能就 Attention**。然后让 Attention 每个 item 都有 1-3 个可执行 action，处理完自动归档。

---

## 附录：Multica 现有 inbox 触发点速查

| 文件 | 函数 | 写什么 inbox |
|---|---|---|
| `service/task.go:4379` | quick-create 完成 | `quick_create_done` |
| `service/task.go:4421` | quick-create 失败 | `quick_create_failed` |
| `service/autopilot.go:785` | autopilot 跑完 | `autopilot_run_done` |
| `handler/comment.go` | 解析 mention 时 | `mention` |
| `handler/issue_trigger.go` | 派任务时 | `assign` |
| ... | ... | ... |

复刻时直接复用这些触发点，加一层 `requires_decision=true` 的过滤就能切出 Attention 流。