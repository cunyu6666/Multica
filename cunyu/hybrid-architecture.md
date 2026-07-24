# 混合架构：Agent Flow + Squad 双模式共存

> **核心决策**：Agent Flow 为主（80% 场景），Squad + 工具作为逃生通道（20% 场景）。
>
> 两种模式共存于同一个产品，按场景触发，不二选一。

---

## 1. 为什么需要两种模式

**单一模式解决不了所有问题**：

| 模式 | 擅长 | 不擅长 |
|---|---|---|
| **Agent Flow（工作流）** | 确定、可调试、便宜、快 | 不能处理"用户说不清需求"的场景 |
| **Squad（leader + 工具）** | 灵活、能处理模糊任务 | 慢、贵、不可控、难调试 |

**真实用户场景分布**（蕾姆的判断）：

```
80% ──────── 用户能说清楚怎么干 ──→ Agent Flow 搞定
        │
20% ──────── 用户说不清 / 需要边跑边发现 ──→ Squad 兜底
```

如果只做一种：
- 只做 Agent Flow：失去 20% 的复杂场景
- 只做 Squad：把简单事情做复杂，成本爆炸

---

## 2. 双模式共存的产品形态

### 2.1 核心对象

```
Project
  ├── Workflows (用户定义的工作流，可多个)
  │     ├── Steps: shell / api / agent / condition / loop / sub-workflow
  │     └── 触发：cron / webhook / UI 按钮
  │
  └── Squads (高级模式，可选)
        ├── Leader agent (强 agent，带工具)
        └── 成员 agent (普通 agent)
        触发：UI 派任务给 squad
```

**关键不变量**：

- Workflow 和 Squad 是**同级别的对象**，不互相包含
- 一个 Project 可以**只有 Workflow**，**只有 Squad**，或者**两者都有**
- 触发方式不同：Workflow 走 cron/webhook，Squad 走"派任务给 squad"

### 2.2 UI 层：让用户自然选择

**模式选择不是用户主动选的，而是根据任务性质自动建议的**：

```
┌───── 用户创建任务 ─────┐
│                        │
│  标题: 修复登录 bug     │
│  描述: ...              │
│                        │
│  [选择执行方式]          │
│  ┌──────────────────┐ │
│  │  ◉ 用工作流      │ │  ← 默认选项，标注"推荐"
│  │    选个现成的     │ │
│  │    workflow      │ │
│  └──────────────────┘ │
│  ┌──────────────────┐ │
│  │  ○ 派给小队       │ │  ← 进阶选项，标注"高级"
│  │    让 leader      │ │
│  │    自己看着办     │ │
│  └──────────────────┘ │
│                        │
│  [创建]                │
└────────────────────────┘
```

**"推荐工作流"的理由**：
- 用户已经定义了类似 workflow
- 这个任务有明确触发条件（cron 跑 / 某个 webhook）
- 这个任务可以拆成确定的步骤

**"建议用 Squad"的理由**：
- 用户没找到匹配的 workflow
- 任务描述是开放式的（"让代码看起来更专业"）
- 用户主动选了 squad

---

## 3. Agent Flow 模式详解

### 3.1 数据结构

```yaml
# 一个 Workflow 定义（伪 YAML / JSON）
id: wf_123
name: 修复前端 lint 错误
trigger:
  type: webhook
  config:
    path: /api/trigger/lint-fix
steps:
  - id: pull
    type: shell
    config:
      cmd: git pull origin main
      
  - id: run_lint
    type: shell
    config:
      cmd: pnpm lint --format json > /tmp/lint.json
      
  - id: parse_errors
    type: shell
    config:
      cmd: cat /tmp/lint.json | jq '.errors[]'
      
  - id: fix_errors
    type: agent
    config:
      agent: any-frontend
      prompt: |
        根据上一步的 lint 错误列表，自动修复代码。
        失败的话记录下来，跳到下个文件。
      on_error: continue
      
  - id: commit_and_push
    type: shell
    config:
      cmd: |
        git add -A
        git commit -m "fix: auto-fix lint errors"
        git push origin auto-fix/lint
```

### 3.2 Step 类型

最小够用集：

| 类型 | 干什么 | 例子 |
|---|---|---|
| `shell` | 跑 shell 命令 | git pull / npm test / 文件操作 |
| `api` | 调 HTTP API | 通知 Slack / 调 GitHub API |
| `agent` | 调 AI agent | 写代码 / 写评论 / 做判断 |
| `condition` | 条件分支 | "测试过了就 commit，没过就通知人" |
| `loop` | 循环 | "对每个 PR 重复以下步骤" |
| `sub_workflow` | 嵌套工作流 | 把通用步骤抽出来复用 |

### 3.3 UI 设计：可视化编排

```
┌─────────── Workflow 编辑器 ───────────┐
│                                      │
│  触发: [Webhook ▼]                    │
│                                      │
│  ┌──────────┐                         │
│  │ 1. shell │ git pull               │
│  └────┬─────┘                         │
│       ↓                               │
│  ┌──────────┐                         │
│  │ 2. shell │ pnpm lint               │
│  └────┬─────┘                         │
│       ↓                               │
│  ┌──────────┐                         │
│  │ 3. shell │ parse json              │
│  └────┬─────┘                         │
│       ↓                               │
│  ┌──────────┐                         │
│  │ 4. agent │ fix errors  ⚡          │  ← 蓝色标识 agent step
│  └────┬─────┘                         │
│       ↓                               │
│  ┌──────────┐                         │
│  │ 5. shell │ commit && push          │
│  └────┬─────┘                         │
│       ↓                               │
│       ✓ done                          │
│                                      │
│  [+ 添加 step]                        │
└──────────────────────────────────────┘
```

用户拖拽 step，连线，填参数。**Agent step 用蓝色标记**，一眼能看出哪里在用 AI。

### 3.4 运行时状态可视化

```
运行 #4782 开始于 14:32:01
  ✓ 1. shell (git pull)        2.1s
  ✓ 2. shell (pnpm lint)        14s
  ✓ 3. shell (parse json)      0.3s
  ⏳ 4. agent (fix errors)      进行中 23s...  ← 这里卡住了
  ○ 5. shell (commit)          等待
```

每步有状态（✓ / ⏳ / ✗），耗时显示。**agent step 显示 token 消耗**。

---

## 4. Squad 模式详解

### 4.1 数据结构

```yaml
id: sq_frontend
name: FrontendTeam
leader_id: agent_alice
instructions: |
  你负责前端代码审查和 bug 修复。
  优先用 TypeScript 严格模式，所有 PR 必须通过 typecheck。
members:
  - agent_id: agent_alice
    role: leader
  - agent_id: agent_bob
    role: member
    skills: [react, css]
  - agent_id: agent_carol
    role: member
    skills: [testing, e2e]
```

### 4.2 Leader 的工具箱

Squad 模式里，leader agent 不只是"派任务"，**它真的在用工具干活**：

```python
# Leader 的 system prompt 注入
SQUAD_LEADER_WITH_TOOLS_PROMPT = '''
你是 FrontendTeam 的 leader。

你可以用以下工具：
- run_shell(cmd)        在容器里跑命令
- read_file(path)       读仓库里任何文件
- write_file(path, ...) 写文件
- git_diff()            看当前 diff
- call_api(method, url, body) 调 HTTP API
- assign_to_member(agent_id, task) 派给成员
- post_comment(text)    在 issue 下发评论

工作协议：
1. 读 issue
2. 决定怎么干（可能需要先用工具探索代码）
3. 能直接用工具干的就直接干
4. 需要专门技能的派给对应成员
5. 完成后写总结评论

硬规则：
- 派任务必须用 [@Name](mention://agent/<uuid>) 格式
- 一次回合结束前必须写一条评论或一条派任务
- 不要无限循环，超过 5 轮没进展就停下来问人类
'''
```

### 4.3 工作流程

```
用户：派 issue #123 给 FrontendTeam
   ↓
后端：issue.assignee_type=squad, assignee_id=sq_frontend
   ↓
后端：唤醒 leader (Alice)
   ↓
Alice 跑第一轮：
  - 读 issue
  - 用 read_file 看相关代码
  - 决定："这个 bug 我自己能修"
  - 用 write_file 改代码
  - 用 run_shell 跑测试
  - 测试过了，commit & push
  - 发评论："已修，PR #456 已开"
  - 结束回合
   ↓
如果 leader 没自己干完，派给成员：
  - 发 [@Bob](mention://agent/bob_uuid) 帮我做 X
   ↓
成员 Bob 起来干活，发评论/开 PR
   ↓
完成后事件触发，再次唤醒 leader
   ↓
leader 决定："再派给 Carol 做 code review" 或 "完成了，结束"
```

### 4.4 边界控制

**关键**：即使在 squad 模式，也要防止 leader 失控。

```python
MAX_LEADER_TURNS = 5  # 同一 issue 最多唤醒 leader 5 次

def enqueue_leader_task(squad, issue):
    turn_count = get_leader_turn_count(issue.id, squad.id)
    if turn_count >= MAX_LEADER_TURNS:
        # 通知人类：AI 搞不定，需要人介入
        notify_human(f"Issue #{issue.identifier} 卡在 squad {squad.name}，请介入")
        return
    # 正常入队
    ...
```

---

## 5. 双模式怎么协作

### 5.1 场景：用户先用 workflow，跑着跑着卡住了

```
workflow 跑 → step 4 agent 失败 3 次
   ↓
workflow 触发"兜底"配置
   ↓
自动创建一个 issue，assignee = squad
   ↓
issue 描述里写："workflow wf_123 失败了，请 squad 接手"
   ↓
leader 接手后，可能：
  - 自己用工具修了 → 完成 issue
  - 派给成员 → 完成 issue
  - 改了 workflow 的 step 配置 → 重新跑 workflow
```

### 5.2 场景：squad 跑出可复用的 workflow

```
squad leader 干完一个 issue
   ↓
leader 在评论里说："这次任务我跑了以下步骤..."
   ↓
（系统建议："要不要保存为 workflow？"）
   ↓
用户确认 → 自动生成 workflow 定义
   ↓
下次类似任务直接用 workflow
```

**这是产品飞轮**：用户用 squad 处理模糊任务 → 系统建议沉淀为 workflow → 越来越多任务有了现成 workflow → 用户越来越少需要 squad。

### 5.3 场景：用户混用两种模式

```
Project 下：
  /workflows/
    daily-standup.yml      ← 定时跑，每天自动汇总
    pr-review.yml          ← 收到 PR webhook 自动跑
    
  /squads/
    frontend-team.json     ← 处理模糊的前端任务
    
触发：
  - daily-standup 每天 9am 跑 → 写评论到 Slack
  - 新 PR 进来 → 跑 pr-review → 不通过就派给 frontend-team squad
  - 用户手动创建 issue 说"让代码更专业" → 直接派给 frontend-team squad
```

---

## 6. MVP 实施顺序

### Phase 1：只做 Agent Flow（4-6 周）

**目标**：把 workflow 跑通，覆盖 80% 场景

- 数据库：workflows、workflow_steps、workflow_runs
- 后端：step 调度器、状态管理、错误重试
- 前端：可视化编辑器、运行状态查看
- Step 类型：先做 shell / api / agent / condition 四种
- 触发：cron + webhook + UI 按钮

**不做**：squad、loop、sub-workflow

### Phase 2：加 Squad 模式（3-4 周）

**目标**：覆盖剩下 20% 模糊任务

- 数据库：squads、squad_members
- 后端：squad 派任务端点、leader 唤醒、成员回调
- Leader prompt：tool-using 版本
- 工具实现：run_shell / read_file / write_file / git_diff / call_api
- 边界控制：max turns、人类兜底

### Phase 3：打通双模式（2-3 周）

- workflow 失败兜底到 squad
- squad 完成任务后建议生成 workflow
- Project 页同时展示两套对象

---

## 7. 不要做的事（避免产品过度复杂）

**Phase 1 坚决不做**：

- ❌ Squad 模式（先验证 workflow 模式可行）
- ❌ Loop / sub-workflow（先做线性流程）
- ❌ 复杂 condition（if-else 足够）
- ❌ 工作流版本控制（先跑起来再说）
- ❌ 工作流市场/分享（先做单租户）

**Phase 2 也不做**：

- ❌ squad 嵌套（squad 包含 squad）
- ❌ squad 自动学习用户偏好
- ❌ leader 用工具写代码时支持 PR review 自动反馈

**永远不做**：

- ❌ 让 agent 自己定义 workflow（递归风险太大）
- ❌ 让 leader agent 自己决定 squad 成员（必须人类配置）

---

## 8. 关键 UX 决策

### 8.1 默认模式

**新用户默认看到的是 Agent Flow**，不是 Squad。

理由：
- workflow 上手快（"拖几个 step 就行"）
- 用户能立即看到结果（跑一遍就知道对不对）
- Squad 模式心智更重，不适合冷启动

### 8.2 Squad 入口隐藏

不要在导航栏直接放 "Squads"。把它藏在：

- 创建 issue 时的"高级选项"里
- workflow 失败后的"换个方式重试"里
- 用户的 "Power User" 开关里

### 8.3 Squad 不卖"管理 AI 团队"的叙事

文案要避免：

- ❌ "组建你的 AI 团队"
- ❌ "AI 同事帮你干活"
- ❌ "Next 10 hires won't be human"

文案要用：

- ✅ "让 AI 自己想办法解决"
- ✅ "适合说不清需求的任务"
- ✅ "高级模式：AI 自主决策"

---

## 9. 数据流总结图

```
┌─────────── 用户界面 ──────────┐
│                              │
│  ┌─ Workflows ─┐ ┌─ Squads ─┐│
│  │  • daily    │ │ • fe-team ││
│  │  • pr-review│ │ • be-team ││
│  └─────────────┘ └───────────┘│
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌─────────┐   ┌─────────┐
│ Workflow│   │ Squad   │
│ Runner  │   │ Router  │
└────┬────┘   └────┬────┘
     │             │
     ↓             ↓
┌─────────────────────────┐
│   Step Executor         │
│   ┌─────┬─────┬──────┐  │
│   │shell│ api │agent │  │
│   └─────┴─────┴──────┘  │
└─────────────┬───────────┘
              ↓
┌─────────────────────────┐
│   持久化               │
│   • workflows           │
│   • workflow_runs       │
│   • squads              │
│   • issues              │
│   • step_outputs        │
└─────────────────────────┘
```

---

## 10. 一句话总结

> **Agent Flow 是主干，Squad 是逃生通道。两种模式共存于同一个 Project，按场景触发。**
>
> 用户能说清楚怎么干 → Agent Flow（确定、可调试、便宜）
> 用户说不清怎么干 → Squad（灵活、能兜底、贵但有效）
>
> 这是一个**渐进式复杂度**的产品：用户从简单的 workflow 起步，慢慢才会用到 squad。两个模式不需要在同一时刻决策，用户自然会在需要时切换。