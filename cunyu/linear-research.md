# Linear 调研笔记

> 抓取时间：2026-07-25
>
> 这是一份原始调研笔记，记录从 Linear 各个产品页抓到的内容、功能结构、设计细节、以及和 Multica 对比时的发现。
>
> 上层文档（结论+取舍建议）见 `cunyu/linear-comparison.md`。本文件是更详细的素材库。

---

## 1. 抓取来源清单

| URL | 抓到的核心内容 |
|---|---|
| https://linear.app/features | 9 大功能板块、Planning/Building/AI/Insights/Mobile/Customer Requests/Linear Asks/Security |
| https://linear.app/ai | AI workflow 完整产品页：Triage Intelligence、Linear MCP、AI 搜索、Pulse updates |
| https://linear.app/agents | Linear for Agents 产品页：contributor 模式、3 大内置 agent、Build your own agents |
| https://linear.app/insights | Insights + Dashboards 完整功能 |
| https://linear.app/blog/introducing-loops | Loops 发布原文（2026-07-20，Nan Yu） |
| https://linear.app/docs/triage | Triage 详细文档：4 个键盘快捷键 + 3 种自动化 |
| https://linear.app/docs/projects | Projects 文档 + 视图嵌套 |
| https://linear.app/docs/initiatives | Initiatives 文档：5 个状态、健康度 |

抓取失败（404 或动态加载）：`/loops`、`/docs/cycles`、`/method/principles/3.3-build-with-users`、`/cycles`

---

## 2. Linear 9 大功能板块（来自 /features）

Linear 把整个产品切成 9 块：

| 板块 | 一句话定位 |
|---|---|
| **Planning** | Set the product direction with projects and initiatives |
| **Building** | Make progress with issue tracking and cycle planning |
| **Artificial intelligence** | Streamline product development with AI-powered workflows and agents |
| **Insights** | Instant analytics for any stream of work |
| **Mobile** | Move product work forward from anywhere |
| **Customer Requests** | Build what customers actually want |
| **Linear Asks** | Turn workplace requests into actionable issues |
| **Security** | Best-in-class security practices |

**结构观察**：

- "Linear Asks" 是一个独立板块 —— 让非 Linear 用户（如销售、客户支持）也能提交 issue
- "Customer Requests" 和 "Linear Asks" 是两个相关但不同的东西
  - Customer Requests：内置 CRM 集成（Intercom/Front/Zendesk）
  - Linear Asks：让任何人通过表单提交请求

---

## 3. Linear AI 完整功能地图（来自 /ai）

### 3.1 Triage Intelligence

> Self-driving product operations. **AI-powered features like Triage Intelligence proactively suggest and apply the right assignees, teams, labels, and projects** based on your team's historical patterns.

**关键能力**：

- 建议 assignee（"this person was the assignee on previous issues related to performance problems"）
- 建议 project（"the current issue seems to be a mobile app related bug"）
- 建议 label（"this appears to be a bug"）
- 识别重复（"Duplicate of ENG-1419"）
- 识别相关（"Related to ENG-1820"）

**模型**：基于"issue 的内容 + 历史行为模式"，不需要专门训练。

### 3.2 AI-powered search

> Semantic search looks across titles, descriptions, customer feedback, and support tickets to find exactly what you're looking for.

——跨标题、描述、客户反馈、支持 ticket 的语义搜索。

### 3.3 Pulse updates

> AI distills all project and initiative updates into a short daily or weekly summary, available in your inbox to read or listen as an **audio digest**.

——每日/每周摘要，可以听（音频）。

### 3.4 Linear MCP

> Connect Linear to your favorite AI tools including Cursor, Claude, ChatGPT, and more.

——MCP server，让外部 AI 工具能访问 Linear。

### 3.5 自动化建议 UI

Linear 的 UI 里展示了 Triage Intelligence 的实时建议：

```
┌─────────────────────────────────────────┐
│  Mobile App Refactor                    │  ← Triage 视图
│  Slack                                   │
│  Duplicate of ENG-1419                  │
├─────────────────────────────────────────┤
│  Activity                                │
│  Unsubscribe                             │
│  skyline created the issue ⋅ 15min ago  │
│  Linear notified nan ⋅ 15min ago         │
├─────────────────────────────────────────┤
│  Triage Intelligence                    │
│  Suggestions                              │
│  nan                                     │  ← 建议的 assignee
│  Mobile App Refactor                     │  ← 建议的 project
│  Slack                                   │  ← 建议的 label
│  Duplicate of ENG-1419                   │  ← 建议的重复关系
│  Related to ENG-1820                     │  ← 建议的相关关系
│                                         │
│  [Accept suggestion]                     │
├─────────────────────────────────────────┤
│  Why this assignee was suggested         │  ← AI 解释理由
│  This person was the assignee on        │
│  previous issues related to              │
│  performance problems in the             │
│  mobile app launch flow                  │
└─────────────────────────────────────────┘
```

**关键 UX**：AI 不仅给建议，还**解释理由**（"why this assignee was suggested"）。这是 LLM-as-product 的核心模式。

---

## 4. Linear for Agents 完整功能（来自 /agents）

### 4.1 Agent 是 contributor，不是 assignee

> When an issue gets delegated to an agent, **the human user remains the primary assignee, while the agent is added as a contributor.**

——人类永远是 primary，agent 只是 contributor。

### 4.2 Agent 行为可见

> Agents act on your behalf, but never in the dark. **Understand every change they make at a glance, or inspect the underlying reasoning.**

——所有 action 可审查，包括 reasoning。

### 4.3 Agent 可并行处理多个 issue

> Agents can work across multiple issues simultaneously. Select tasks, assign them to an agent, and watch work move forward.

——支持批量分配。

### 4.4 内置 agents

| Agent | 干什么 |
|---|---|
| **Linear Agent** | Triage issues, answer questions, create follow-up work |
| **Cursor** | Drafts branches from assigned issues, ready to finish in your editor |
| **OpenAI Codex** | Coding agent that can take on entire tasks |
| **Devin** | Scopes issues and drafts PRs |
| **Sentry** | Runs root cause analysis and fixes issues with Seer |
| **ChatPRD** | Writes requirements, manages issues, and gives feedback |
| **Oz by Warp** | Answers questions, fixes bugs, and explores ideas |
| **Factory** | Codes, tests, and creates pull requests |
| **Charlie** | Plans, implements, and reviews your TypeScript PRs |
| **Ranger** | Enhance bug formatting and generate test plans |
| **Tembo** | Delegates work to any coding agent |

——内置 agent 是一个 marketplace，多个第三方 agent 集成。

### 4.5 自定义 agent

> Build your own AI teammates with the Linear API. Keep them private or share with the Linear community.

——Linear API 允许构建自定义 agent，可以公开分享。

### 4.6 工作场景展示

Linear 在 `/agents` 页面展示了 7 个具体使用场景（每个配 reply）：

```
1. "what are the three most important customer requests around permissions?
    add them to the Access Controls project"
   → Reply: Access Controls project

2. "Review today's mobile triage and group the issues by what should happen next"
   → Reply: Mobile Triage added to context

3. "What could delay the API launch?"
   → Reply: API launch added to context

4. "how does notification grouping work today, and where should I change it?"
   → Reply: Notification Grouping added to context

5. "add retry handling for failed image uploads described in this issue"
   → Reply: ENG-2844 added to context

6. "review this issue, draft complete offline mode requirements,
    and break the work into sub-issues"
   → Reply: ENG-2521 added to context

7. "Fix the dimmed ride rows that never reset and open a PR"
   → Reply: DRV-364 added to context
```

**观察**：每个场景都是"自然语言问题 → AI 把相关 issue/project 加到上下文 → 让 agent 干活"。

---

## 5. Linear Loops 完整说明（来自发布博客）

### 5.1 背景

> Loop engineering has quickly emerged as an important practice in software development. In tools like Claude Code and Codex, developers define recurring or trigger-based behavior for their agents, usually through a /loop command, and hand off the repetitive tasks that would otherwise consume their attention.
>
> The resulting productivity gains are real, but so far they have mostly been limited to individual developer workflows. What if an entire product team could work this way?

——Loops 的灵感来自 Claude Code / Codex 的 `/loop` 命令，但 Linear 把这个概念扩展到了团队级别。

### 5.2 定义方式

> To set up a Loop, describe the job in plain language and then choose whether it should run on a schedule or in response to an event.

——**自然语言描述任务**，然后选 schedule 或 event-driven。

### 5.3 每次运行的机制

> Each time a loop runs, **Linear Agent reviews its instructions and determines what should happen next.** It can draw on context from Linear, connected codebases, MCP servers, and previous runs.
>
> Because Loops are fully AI-powered, **they can apply judgment as they work. They can account for exceptions, navigate ambiguity, gather missing information, and decide on the best path forward.**

——每轮重读指令，自主判断下一步。

### 5.4 三个真实用例

#### 用例 1：Diagnose and dispatch bug reports

> When an issue enters triage, a Loop can review its description, comments, and relevant parts of the codebase to recommend a next step. When the path forward is clear, it can start a coding session for an immediate fix.

——bug 进 triage → AI 读 description + comments + 代码库 → 建议下一步，必要时直接修。

#### 用例 2：Generate follow-up work

> When a new feature request is created, a Loop can determine whether separate iOS, Android, and web app changes are needed. It can then create the relevant platform-specific issues and route them to the appropriate teams.

——新 feature request → AI 判断要不要拆成 iOS / Android / Web 三个子 issue → 自动创建并路由。

#### 用例 3：Keep plans and documents current

> At the end of each day, a Loop can review active projects and initiatives against a central release plan. When it finds that timing or scope has changed, it can update the document and leave a note explaining why.

——每天结束 → AI 对比项目和文档，发现变化就更新 + 留理由。

### 5.5 治理

> Loops run at the team and workspace level, with shared visibility and control. Anyone with access can review their instructions, see how they are configured, and inspect what happened during each run.

——可见、可审查、可配置。

### 5.6 计费 & 计划

> Loops are available today on Business and Enterprise plans and **use AI credits to run.**

——Business/Enterprise 才能用，按 AI credits 计费。

### 5.7 未来方向

> We plan to expand the triggers and context sources they can use, along with the governance controls available to workspace and team admins.

——Linear 自己也在迭代这个功能。

---

## 6. Linear Triage 完整文档（来自 /docs/triage）

### 6.1 定位

> Triage is a special inbox for your team. When an issue is created by integration or by a workspace member not belonging to your specific Linear team, it will appear here.
>
> Triage offers a opportunity to **review, update, and prioritize issues before they are added to your team's workflow.**

### 6.2 入口

- 团队 Settings → Triage，开关
- 打开后出现在 sidebar 团队名下面
- 键盘快捷键：`G then T` 进入 triage，`O then T` 切换到指定团队

### 6.3 哪些 issue 进 triage

- 通过集成（Slack、Sentry）创建的
- 在 triage view 里创建的
- 由非本团队成员创建的

### 6.4 4 个键盘操作

| 快捷键 | 操作 | 效果 |
|---|---|---|
| `1` | Accept | 接受并加入团队默认 status（可选留评论） |
| `2` | Mark as duplicate | 标记重复（可合并到现有 issue；移动 attachments）→ Canceled |
| `3` | Decline | 拒绝 → Canceled（可选加解释评论） |
| `H` | Snooze | 暂时搁置（可选时间）→ 新 activity 触发自动回 triage |
| `MM` | 标记重复（同 `2`） | 同上 |

**额外**：可以在 issue 里评论问更多信息，issue 留在 triage。

### 6.5 3 种自动化

#### Triage Rules（条件触发）

> Configure custom rules to take automated actions on issues when they enter Triage.
>
> Triggered on filterable properties, triage rules can update an issue's team, status, assignee, label, project and priority.

——基于 issue 属性自动执行动作。

#### Triage Intelligence（LLM 路由）

> Triage Intelligence allows LLMs to analyze every new issue in triage against your existing issues to suggest properties like assignee and label, and pro-actively surface likely related issues or duplicates based on the analysis of the issue's content against historical behavior in your workspace.

——LLM 分析 + 建议。

#### Triage Responsibility（轮值）

> Enable triage responsibility to define who handles incoming issues.
>
> You can select specific members of your workspace to receive notifications of new issues or be automatically assigned to them.
>
> Optionally connect your PagerDuty, OpsGenie, Rootly, or Incident.io schedules to automate the rotation of first responders.

——on-call 轮值，可接 PagerDuty / OpsGenie / Rootly / Incident.io。

### 6.6 集成

- **Asks**：通过表单收集 issue（让非 Linear 用户提交）
- **Customer support**：Intercom / Front / Zendesk → Linear issue

### 6.7 FAQ 要点

> Can I require priority to be set before an issue leaves Triage?
> Yes. Configure this behavior under Team Settings > Triage.

——可以强制离开 triage 前设优先级。

---

## 7. Linear Insights / Dashboards（来自 /insights）

### 7.1 定位

> Take the guesswork out of product planning with Linear's purpose-built analytics and reporting features.

### 7.2 核心能力

- **Instant analytics** — 实时聚合、分段、可视化
- **Drill down** — 任何数据点可下钻到原始 issue
- **Dashboards** — 自定义 dashboard
- **Fully modular** — 灵活布局
- **Built to share** — 可分享或私有

### 7.3 控件（slices / measures）

**Measure（度量）**：

| 类型 | 说明 |
|---|---|
| Issue count | issue 数 |
| Effort | 工作量 |
| Cycle time | cycle 完成时间 |
| Triage time | triage 停留时间 |
| Lead time | 从创建到完成 |
| Issue age | 当前年龄 |

**Slice（维度）**：

| 类型 | 说明 |
|---|---|
| Status / Status type | 状态 |
| Assignee / Creator | 谁 |
| Priority | 优先级 |
| Label / Label group | 标签 |
| SLA status | SLA 状态 |
| Estimate | 估算 |
| Template | 模板 |
| External source | 外部来源 |
| Project / Initiative | 项目 |
| Project label / Project label group | 项目标签 |
| Cycle | cycle |
| Added to cycle / Team | cycle 归属 |
| Created date / Completed date / Canceled date / Started date / Due date | 时间 |
| Burn-up | burn-up |

**时间分组**：daily / weekly / monthly / quarterly / yearly

### 7.4 三个预设用例

| 用例 | 解答的问题 |
|---|---|
| **Effort distribution** | "Where are we spending our resources?" |
| **Bug clearance** | "Are we getting better at fixing bugs?" |
| **Data hygiene** | "Are we prioritizing issues consistently?" |

### 7.5 导出

- CSV export
- Google Sheets
- Fivetran integration
- Airbyte → 数据仓库同步

### 7.6 计费

- Insights 在 Linear Business
- Dashboards 在 Linear Enterprise

---

## 8. Linear Projects 完整功能（来自 /docs/projects）

### 8.1 定位

> Projects are units of work that have a clear outcome or planned completion date, such as a new feature's launch, and are comprised of issues and optional documents.
>
> They can be shared across multiple teams and come with their own unique features, progress graph, and notification options.

### 8.2 创建

- 唯一必需字段：name
- 推荐：project lead + icon
- 可后编辑（在项目页面或 initiative 内右键）

### 8.3 删除

- 软删除 30 天，归档到 "Recently deleted"

### 8.4 查看

- Team Projects 页：list / board / timeline
- Workspace Projects 页：所有项目
- 项目详情页：summary + properties + documents + milestones

### 8.5 把 issue 加进 project

- `Shift P` 快捷键
- 项目页按 `C` 创建新 issue（自动归到当前 project）
- 一个 issue 只能在一个 project（想多归属用 sub-issues）

### 8.6 视图嵌套（特别值得借鉴）

> Next to the "Issues" tab in each project, you'll find the new view icon. **This feature enables the creation of custom views of the project's issues.**
>
> By clicking this icon, you can filter a subset of the project's issues and save this filtered perspective under a specific view name.

——**每个 project 可以有自己的视图**（不只是 workspace 视图）。

> Example views we've attached to projects:
> - A view that filters for all issues assigned to the current user
> - A bug view that filters for all issues with the "bug" label
> - A "standup" view filtering for In Progress

——视图可命名、可拖拽排序、跨 project 复用。

### 8.7 时间框架

> Rarely will a project's precise end date be known in its early stages.
>
> Options are available to choose a year, half-year, quarter, month or precise day.

——提供粗粒度时间（季度、半年）+ 细粒度（具体日期），不强求精确。

### 8.8 Project 详情侧边栏

`Cmd/Ctrl I` 切换侧边栏。

### 8.9 FAQ

> Can I add multiple project leads?
> We have a single lead field to keep ownership of the project clear.

——**单一 project lead**，避免多人责任不清。

---

## 9. Linear Initiatives 完整功能（来自 /docs/initiatives）

### 9.1 定位

> Use initiatives to group projects around company objectives, then organize them with status, priority, and labels so it's easier to track what matters and review progress across your roadmap.

——Initiative 是**项目之上的层级**，用于组织公司级目标。

### 9.2 可见性

> There is no concept of a "private" Initiative — Initiatives are always shared workspace-wide.

——Initiative 永远 workspace-wide 可见，没有 private。

### 9.3 属性

| 属性 | 说明 |
|---|---|
| **Status** | Proposed / Planned / Active / Completed / Canceled |
| **Priority** | 优先级（高低） |
| **Labels** | 跨切分类（产品线、地区、目标、规划周期） |
| **Owner** | 单一负责人 |
| **Target date** | 完成时间 |
| **Resources** | 链接、文档 |
| **Description** | 详细描述 |
| **Projects** | 包含的项目 |

### 9.4 健康度（特别值得借鉴）

> When viewing Initiatives, use the Initiative Health and Active projects columns to quickly assess how work is progressing.
>
> **Initiative Health** shows whether the latest initiative update indicated work was **on track, at risk, or off track**. Click on it to read the full update.
>
> **Active Projects** rolls up data for individual projects in the initiative.

——每个 initiative 有"健康度"（on track / at risk / off track），从最近的 update 自动判断。

**颜色编码**：

- 🟢 Green: On track
- 🟡 Yellow: At risk
- 🔴 Red: Off track
- ⚪ Gray: No current update

### 9.5 Initiative Graph

> Each curve on an initiative graph represents the rate of completed issues within a single project in that initiative — **rising during periods of high activity and leveling off during quieter periods or after project completion.**

——burn-up 图，按项目分别画曲线。

### 9.6 Sub-initiatives（子层级）

——可以嵌套。

### 9.7 计费

Initiative views 在 Enterprise plan。

---

## 10. 跨文档的设计模式观察

### 模式 1：键盘优先

整个 Linear 产品**重度依赖键盘快捷键**：

- `1/2/3/H` 处理 triage
- `G then T` 进入 triage
- `Shift P` 把 issue 加入 project
- `C` 在当前 view 创建 issue
- `Cmd/Ctrl I` 切换侧边栏
- `MM` 标记重复

**含义**：面向 power user，不做"鼠标友好"的全键盘体验。

### 模式 2：AI 永远给"为什么"

不管是 Triage Intelligence 还是其他 AI 建议，UI 都有 "Why this X was suggested" 区块。

**含义**：AI 不是黑盒，每个建议都有可解释性。

### 模式 3：视图嵌套

视图可以挂在 workspace / team / project 不同层级。

**含义**：让用户能在最相关的上下文里看最相关的数据。

### 模式 4：健康度统一表达

Initiative / Project / Issue 都有"健康度"概念，颜色编码一致。

**含义**：统一的视觉语言让用户在不同层级看到一致的状态。

### 模式 5：自然语言配置

Loops、Insights 查询、AI 搜索——都允许自然语言作为输入。

**含义**：降低使用门槛，让非技术 PM 也能用。

---

## 11. 和 Multica 的具体对比点

| Linear 功能 | Multica 现状 | 差距 |
|---|---|---|
| Triage 队列 | 无 | 高（应该做） |
| Loops（AI judgment） | autopilot 是 cron + workflow，无 AI 自由判断 | 高（应该做） |
| Agent as contributor | agent 接管 issue，人类失去控制权 | 中（改 UI 即可） |
| Pulse updates | 无 | 中（应该做） |
| Insights / Dashboards | 无 | 中（应该做） |
| SLAs | 部分支持（issue 有 due_at） | 低（补字段） |
| Projects（视图嵌套） | 有 project，但视图不可嵌套 | 低 |
| Initiatives | 有 workspace 概念 | 不需要复制 |
| 健康度颜色编码 | 无统一标准 | 低（加色卡） |

---

## 12. 一句话总结

> **Linear 把"AI-as-product"做到了极致：每个 AI 建议都有理由、键盘优先、自然语言配置、健康度统一。**
>
> Multica 的差异化在"agent 自主性"（squad leader），但**Triage + Loops + Agent-as-contributor 是三个最值得借鉴的具体功能**——实现成本都不高，价值大。

---

## 附录：所有抓到的页面 URL 速查

| 类型 | URL |
|---|---|
| 产品功能总览 | https://linear.app/features |
| AI 完整功能 | https://linear.app/ai |
| Agents 详细 | https://linear.app/agents |
| Insights | https://linear.app/insights |
| Loops 发布博客 | https://linear.app/blog/introducing-loops |
| Triage 文档 | https://linear.app/docs/triage |
| Projects 文档 | https://linear.app/docs/projects |
| Initiatives 文档 | https://linear.app/docs/initiatives |
| Linear Method | https://linear.app/method |

抓取失败 URL：`/loops`（动态加载）、`/docs/cycles`（404）、`/method/principles/3.3-build-with-users`（404）