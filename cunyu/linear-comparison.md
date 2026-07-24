# Linear vs Multica：值得借鉴到 Multica 的功能

> 基于抓取 https://linear.app/features、/ai、/agents、/insights、/docs/projects、/docs/initiatives、/docs/triage、/blog/introducing-loops 后的整理。
>
> Linear 和 Multica 解决类似问题（agent 友好的项目管理），但产品理念差异很大。本文聚焦**哪些 Linear 的设计值得 Multica 借鉴**——尤其是 Loops、Agents、Triage 这三个跟 AI 强相关的功能。

---

## 1. 一句话结论

**Multica 已经覆盖了 Linear 80% 的核心功能**（squad = Linear Agent 的子集，autopilot = Loops 的子集）。最值得借鉴的是三个具体设计：

1. **Triage 队列** —— 一个独立的"待审 inbox"，让 issue 进入正式工作流前先被分类
2. **Loops 的"判断+上下文"模式** —— 不只是 cron，而是 AI 能在循环中应用 judgment
3. **Agent 是"协作者"而不是"主理人"** —— Linear 把 agent 设计成 contributor，人类仍是 assignee

---

## 2. 三大功能详解（来自 Linear 官网）

### 2.1 Linear Loops（2026 年 7 月 20 日发布）

这是最新、最值得借鉴的功能。Linear 官方博客原话：

> Today we're launching Loops, recurring agent workflows for teams.
>
> To set up a Loop, describe the job in plain language and then choose whether it should run on a schedule or in response to an event. Each time a loop runs, **Linear Agent reviews its instructions and determines what should happen next.** It can draw on context from Linear, connected codebases, MCP servers, and previous runs.
>
> Because Loops are fully AI-powered, **they can apply judgment as they work. They can account for exceptions, navigate ambiguity, gather missing information, and decide on the best path forward.**

**关键设计**：

| 维度 | Multica 的 autopilot | Linear 的 Loops |
|---|---|---|
| 触发 | cron / webhook | schedule / event（类似） |
| 步骤 | 预定义 workflow | 自然语言描述任务 |
| 智能程度 | 按 step 跑（确定性） | 每轮重读指令，自主判断下一步 |
| 上下文 | workspace + agent 配置 | Linear + 连接的代码库 + MCP + 历史 runs |
| 可见性 | 团队能看到 | 团队能看到 + 可审查每轮结果 |

**Loops 的 3 个真实用例**（Linear 博客原文）：

1. **Diagnose and dispatch bug reports** —— bug 进 triage 时自动审 + 必要时开 coding session
2. **Generate follow-up work** —— 新 feature request 自动拆成 iOS / Android / Web 子 issue 并路由
3. **Keep plans and documents current** —— 每天扫项目和 initiative，发现变化就更新文档

### 2.2 Linear Agents（前面是 For Agents 页面）

Linear 把 agent 设计成"协作者"而非"主理人"：

> When an issue gets delegated to an agent, **the human user remains the primary assignee, while the agent is added as a contributor.**
>
> Agents act on your behalf, but never in the dark. **Understand every change they make at a glance, or inspect the underlying reasoning.**
>
> Agents can work across multiple issues simultaneously.

**关键设计**：

- Agent 是 **contributor**，人类仍是 **primary assignee**
- 每个 agent 的动作可审查（change visibility）
- 可并行处理多个 issue

**Multica 对比**：

- Multica 的 squad 模式：issue 的 assignee 变成 squad → leader 接管
- Linear 模式：人类是 assignee，agent 只是 contributor（更低门槛、可控性更强）

### 2.3 Linear Triage

来自 Linear Docs：

> Triage is a special inbox for your team. When an issue is created by integration or by a workspace member not belonging to your specific Linear team, **it will appear here.**
>
> Triage offers a opportunity to **review, update, and prioritize issues before they are added to your team's workflow.**

**关键操作**（键盘快捷键）：

- `1` —— Accept（接受并加入工作流）
- `2` —— Mark as duplicate
- `3` —— Decline
- `H` —— Snooze（暂时搁置）

**自动化能力**（Business / Enterprise 才有）：

- **Triage Rules** —— 条件触发自动动作（assignee / team / label / project）
- **Triage Intelligence** —— LLM 建议 assignee、label、project，识别重复
- **Triage Responsibility** —— 轮值 on-call（可接 PagerDuty / OpsGenie）

**Multica 对比**：

- Multica 没有专门的"待审队列"
- issue 创建后直接进入 backlog 或者直接指派
- 没有"先分类，再工作"这一步

---

## 3. 其他 Linear 亮点

来自 https://linear.app/features、/insights 等：

### 3.1 Pulse updates（AI 摘要）

> AI distills all project and initiative updates into a short daily or weekly summary, available in your inbox to read or listen as an audio digest.

——每天/每周自动生成项目摘要，能听（音频）。

### 3.2 Triage Intelligence（去重 + 路由）

> Triage Intelligence identifies similar issues and links related work, so you don't end up with three versions of the same thing.
>
> **Unlock the value of your backlog**
>
> Triage Intelligence uncovers the implicit patterns of your issue history and applies them to what comes next.

——学习 issue 历史，识别重复，建议路由。

### 3.3 Insights / Dashboards

> Take the guesswork out of product planning with Linear's purpose-built analytics and reporting features.
>
> Realtime reporting, purpose-built for product teams. Aggregate, segment and visualize data across your Linear workspace.
>
> **Drill down on any data point** Use quick filters to get an instant view of all the underlying issues and immediately take action.

——实时分析 + 自定义 dashboards + 任何数据点可下钻到原始 issue。

### 3.4 Project Views（视图嵌套）

> Each team has a Projects page which organizes the team's projects into a list, board, or timeline.
>
> **Attach issue views to projects** — Next to the "Issues" tab in each project, you'll find the new view icon. **This feature enables the creation of custom views of the project's issues.**

——把视图嵌进 project 页面（类似 Linear 早期著名的 keyboard-first 体验延伸）。

### 3.5 SLAs

> SLA status — Linear 内置 SLA 字段，可以按 SLA 状态过滤 issue。

——直接告诉你哪些 issue 超时了。

---

## 4. 哪些值得加到 Multica？

按"价值 vs 实现成本"排序：

### Tier 1：强烈推荐（高价值 + 中等成本）

#### A. Triage 队列

**为什么值得**：

- Multica 现在 issue 创建后直接进 backlog，缺少"先分类再工作"环节
- 大量 issue 是从外部集成（GitHub / Slack / 客户支持）进来的，需要先分流
- 实现成本不高：在 `inbox_item` 表上加一个 status='triage' 即可，前端加个 tab

**实现要点**：

```sql
-- inbox_item 表已经有，复用
-- 加一个 view 把 status='triage' 的单独列出来
CREATE VIEW triage_queue AS
SELECT i.*, iss.title as issue_title, iss.identifier
FROM inbox_item i
LEFT JOIN issue iss ON i.issue_id = iss.id
WHERE i.type = 'triage' AND i.resolved = FALSE
ORDER BY i.created_at DESC;
```

**键盘操作**（学习 Linear 的体验）：

- `A` Accept（接受，加入 backlog）
- `D` Mark duplicate
- `X` Decline
- `S` Snooze

#### B. Loops（schedule + AI judgment）

**为什么值得**：

- Multica 的 autopilot 已经能做"定时任务"，但 Loops 的"AI judgment" 是新维度
- 用户写自然语言 → AI 每轮自己判断 → 比纯 cron 灵活得多
- 实现成本中等：复用 Multica 的 `inbox_item` 机制

**实现思路**：

```
Loop 定义（自然语言）:
  "每天 9am 扫描未分配的 bug，自动分类、建议 assignee、@squad 处理"
  
触发 → daemon 跑一个 task:
  prompt = "你是 Loop runner，根据下面指令决定下一步动作..."
  tools = [
    list_unassigned_bugs(),
    create_inbox_item(...),  # 写 Triage
    @mention_squad(...),
    add_comment(...),
    update_issue(...)
  ]
  judgment = AI 自由组合
```

**和 autopilot 的关系**：

- **Autopilot**：适合"明确步骤"（cron + 固定 workflow）
- **Loops**：适合"模糊目标"（schedule + AI 自由组合）
- 两者并存，让用户根据任务性质选

#### C. Agent as Contributor（不是主理人）

**为什么值得**：

- Multica 现在 agent 接管 issue 后人类就失去控制权（leader agent 主导）
- Linear 的模型：人类永远是 assignee，agent 是 contributor
- 改动成本中等：UI 上加个"contributors" 字段

**实现要点**：

```sql
-- 加一张表
CREATE TABLE issue_contributors (
    issue_id UUID,
    agent_id UUID,
    role TEXT,  -- 'code' / 'review' / 'investigate'
    started_at TIMESTAMP,
    PRIMARY KEY (issue_id, agent_id)
);
```

**UI 表现**：

```
Issue: MUL-123 (in progress)
  Assignee:    寸雨       ← 永远是主要责任人
  Contributors: CodeBot, ReviewerBot  ← agent 是协助者
```

### Tier 2：值得做（中等价值 + 较高成本）

#### D. Pulse Updates（每日摘要）

**为什么值得**：让用户用 30 秒看完当天项目动态，不用一个个点开 issue。

**实现**：cron 触发 + LLM 总结当日变化。

#### E. Insights / Dashboards

**为什么值得**：管理层/PM 需要看整体数据，而不是一条一条 issue。

**实现**：参考 Linear 的 Insights 功能（slices、charts、dashboards）。MVP 阶段可以只做 3-4 个固定 dashboards。

#### F. SLAs

**为什么值得**：自动标记超时 issue，避免任务消失在 backlog 里。

**实现**：issue 加 `due_at` 和 `sla_status` 字段，前端用颜色高亮超时项。

### Tier 3：不建议（不符合 Multica 定位）

#### ❌ 完整 Projects / Initiatives 层级

Linear 有 Project → Initiative 二级组织。Multica 已经有 workspace → project，**不需要再加一层**。

#### ❌ 复杂的 Triage Intelligence（自动学习路由）

需要大量历史数据 + 持续训练。MVP 阶段太重。

---

## 5. 三个核心对比：设计哲学差异

| 维度 | Linear | Multica |
|---|---|---|
| **AI 定位** | Agent 是 contributor，人类主导 | Agent 是队友，可以独立工作 |
| **任务生命周期** | Triage → Backlog → Cycle → Done | Issue 直接进 backlog |
| **自动化触发** | Rules（无 AI）+ Intelligence（LLM） | Autopilot（cron）+ Squad leader（LLM 派活） |
| **AI 工作方式** | AI 在每步应用 judgment | AI 跑完整 workflow |
| **可见性** | 每次 action 都可审查 | 部分隐藏（agent 内部决策） |

**Multica 的优势**：自动化能力更强（squad 派活循环）
**Linear 的优势**：人类控制权更强（assignee 永远是人类的）

---

## 6. 优先级建议

如果你要做 MVP，蕾姆建议的顺序：

| 优先级 | 功能 | 预计工作量 |
|---|---|---|
| P0 | Triage 队列 | 1-2 周 |
| P0 | Agent as Contributor | 1 周（仅 UI 改动） |
| P1 | Loops（自然语言 + schedule） | 2-3 周 |
| P1 | Pulse Updates | 1-2 周 |
| P2 | SLAs | 1 周 |
| P2 | Insights MVP | 2-4 周 |

**最该先做的**是 **Triage 队列**——实现最简单，但对 UX 提升最大。

---

## 7. 一句话总结

> **Multica 和 Linear 在 AI + 项目管理这个交叉点上选择了不同方向：Multica 让 agent 更自主（squad leader），Linear 让 agent 更可控（contributor）。**
>
> 最值得借鉴的三个具体功能：
> 1. **Triage 队列**（issue 进入正式工作流前的分类环节）
> 2. **Loops 的 AI judgment 模式**（schedule + 自由判断，比纯 cron 灵活）
> 3. **Agent as Contributor**（人类永远 primary assignee，agent 是协助者）
>
> 这三个功能都和 Multica 的现有架构兼容，改动量小，价值高。其它（Insights / SLAs / Pulse）作为后续迭代。

---

## 附录：参考资料

抓取时间：2026-07-25

| URL | 内容 |
|---|---|
| https://linear.app/features | 官方功能总览 |
| https://linear.app/ai | AI workflow 产品页 |
| https://linear.app/agents | Linear for Agents 产品页 |
| https://linear.app/insights | Insights 产品页 |
| https://linear.app/blog/introducing-loops | Loops 发布博客（2026-07-20） |
| https://linear.app/docs/triage | Triage 文档 |
| https://linear.app/docs/projects | Projects 文档 |
| https://linear.app/docs/initiatives | Initiatives 文档 |