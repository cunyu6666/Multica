# Agent vs 工作流：什么时候该用 AI，什么时候该用脚本

> 这份文档讨论一个根本的产品架构问题：
> **某些工作流是不是不必完全靠 agent 智能，也可以靠脚本/程序（N8N 类）？**
>
> 结论：**是的，而且大部分场景应该用工作流，只在"必须 AI 判断"的环节才调 agent。**

---

## 1. 核心论点

**Agent 擅长的是"判断"，不擅长"确定性执行"。**

- 能用 if-else 写出来的，就别用 agent
- agent 慢、贵、不稳、难调试
- 能用工作流编排的，就别让 agent 自作主张

---

## 2. Agent 适合什么 / 不适合什么

| 任务 | 适合 agent | 适合脚本 | 原因 |
|---|---|---|---|
| "这个 PR 写得怎么样" | ✅ | ❌ | 需要主观判断 |
| "给 issue 打标签"（bug/feature/docs） | ✅ | ❌ | 规则太多维护不起 |
| "改完代码跑测试，没过就改" | ⚠️ | ✅ | shell 脚本 3 行搞定 |
| "code review 后发评论" | ✅ | ❌ | 需要自然语言表达 |
| "每晚 11 点列所有未处理的 PR" | ⚠️ | ✅ | cron 一行 |
| "把客户姓名标准化" | ⚠️ | ⚠️ | 简单场景脚本，复杂场景 agent |
| "读 issue，决定派给 squad 哪个成员" | ⚠️ | ✅ | 完全可以基于 skill 标签匹配 |
| "写代码" | ✅ | ❌ | agent 唯一不可替代的 |

**经验法则**：

- **必须用 agent**：写代码、写评论、读 issue 做主观判断、需要自然语言交互
- **应该用脚本**：cron 触发、数据快照、路由派发、状态机推进、API 轮询

---

## 3. Multica 自己其实就在混着用

蕾姆刚才看代码时发现，Multica 看起来"全 AI"，但很多地方其实是纯脚本：

### 例 1：PR 状态快照

`MUL-5265: GitHub API-snapshot PR cards` 这个提交——**它是后台脚本定时调 GitHub API 存快照**，不是 agent 去盯着。

完全没 AI，就是定时任务。

### 例 2：成员完成 → 唤醒 leader

这是个纯事件回调：

```go
// 后端代码逻辑
if agent 完成了一个任务 {
    issue = get_issue(task.issue_id)
    if issue.assignee_type == "squad" && agent.id != squad.leader_id {
        enqueue_leader_task(squad, issue)  // 唤醒 leader
    }
}
```

没有 AI，就是事件驱动。

### 例 3：Squad leader 的"派任务"

看起来很"AI"，底层其实可以结构化：

- 读 issue 标题/描述/评论 → 结构化数据，不需要 AI
- 匹配成员的 skill → 关键词匹配规则就够
- 发 mention 评论 → 模板化输出

**完全可以用 N8N 工作流替代**：

```
trigger: issue 派给 squad
   ↓
读 members 表
   ↓
根据 issue 标签/关键词选人（规则匹配）
   ↓
发 mention 评论
   ↓
done
```

---

## 4. 那为什么 Multica 还要用 agent 做 leader？

Multica 的选择背后有自己的理由：

| 选择 | 理由 |
|---|---|
| **让 leader agent 做派发** | 用户用自然语言描述任务，agent 能"听懂" |
| **leader 自己写派发评论** | 评论文本灵活，人类评审看起来自然 |
| **整个 squad 像一个 LLM 编排系统** | 符合"AI 团队"的叙事，企业客户买单 |

**但代价是**：

- 每次派发都烧 token（一个 leader 唤醒一次 = 几美分到几毛钱）
- leader 可能派错人（agent 不稳）
- 调试困难（leader 为什么派给 A 不是 B？没日志只能重跑）
- 慢（每次派发要走 LLM 几秒到几十秒）

---

## 5. 真正的混合架构：触发 + 编排 + agent 调用三层

如果你要做"AI + 工作流"混合产品，这是蕾姆推荐的分层：

```
┌─────────── 触发层 ───────────┐
│   cron / webhook / UI 按钮     │    ← 启动工作流
└─────────────┬──────────────┘
              ▼
┌─────────── 编排层 ───────────┐    ← 纯工作流（N8N / Temporal / 自研 queue）
│   • 步骤 1: 读数据             │
│   • 步骤 2: 条件判断           │
│   • 步骤 3: 让 agent 写代码    │    ← 只有"需要 AI"的步骤才调 agent
│   • 步骤 4: 开 PR              │
│   • 步骤 5: 通知人类           │
└─────────────┬──────────────┘
              ▼
┌─────────── 持久化层 ───────────┐
│   数据库 / 事件流                │
└─────────────────────────────┘
```

**这种架构的好处**：

1. **可观察**：每一步在干嘛清清楚楚
2. **可调试**：哪步错了改哪步
3. **成本低**：大部分步骤是纯计算或 HTTP
4. **可测试**：每步可以单独写测试

**具体例子：让 agent 写代码 + 工作流编排其他一切**

```yaml
# 一个完整的"前端代码改动"工作流（伪 YAML）
name: frontend-change
trigger:
  - issue.label_added: ["frontend", "needs-implementation"]

steps:
  - id: setup_worktree
    type: git
    action: create_worktree
    
  - id: understand_issue
    type: agent
    agent: any-frontend
    prompt: |
      读 issue ${issue.id}，输出：
      1. 需要改哪几个文件
      2. 验收标准
      3. 是否需要新依赖
      
  - id: implement
    type: agent
    agent: any-frontend
    depends_on: [understand_issue]
    prompt: |
      根据上一轮的输出，实现代码改动。
      完成后 commit 但不要 push。
      
  - id: typecheck_and_test
    type: shell
    action: |
      pnpm typecheck && pnpm test
    on_failure: rerun_implement  # 失败让 agent 重写
    
  - id: open_pr
    type: shell
    action: gh pr create --fill
    
  - id: notify_reviewer
    type: api
    action: post_to_slack
```

**注意**：只有 `understand_issue` 和 `implement` 两步是 agent，其他全是 shell / API 调用。

---

## 6. Squad 机制到底保留不保留？

回到 Multica 的 squad 概念，重新审视一下：

**squad 的核心价值**：用稳定名字 `@FrontendTeam` 派任务，**不用关心现在谁能干**。

这个价值，**N8N 完全能做到**：
- 工作流叫 "frontend-team-workflow"
- 触发时它自己查"现在哪个 frontend agent 在线/空闲"
- 派给那个 agent
- 全程不需要 leader agent

**squad 的 leader 机制 = 用 agent 做"路由"，其实是杀鸡用牛刀。**

| Multica 做法 | 工作流做法 | 对比 |
|---|---|---|
| 派给 squad → 唤醒 leader agent → leader 选人 | 派给工作流 → 工作流按规则选人 | 工作流快、便宜、稳定 |
| leader agent 写"派发评论" | 工作流按模板写"派发评论" | 工作流可控、可审计 |
| 成员完成 → 唤醒 leader | 成员完成 → 触发下一步工作流 | 等价 |

**结论**：squad 的"路由层"价值真实存在，但**用 agent 做路由是过度 AI 化**。纯工作流完全够用。

---

## 7. 真正适合用 agent 的场景

只有这些场景，agent 是不可替代的：

1. **写代码本身** —— 这是 agent 唯一最擅长的事
2. **code review 后写评论** —— 自然语言表达
3. **用户用自然语言描述任务** —— 智能理解意图
4. **builder 智能创建** —— 跟用户多轮对话产出配置
5. **处理模糊、没有清晰规则的任务** —— 比如"让这个看起来更专业"
6. **决策树非常深的复杂判断** —— 比如 "这个 PR 能不能合" 涉及几十个维度

**除了这些，其他都该用脚本**。

---

## 8. 给做产品的人的关键决策点

### 决策 1：你的产品是给谁用的？

| 用户 | 适合什么 |
|---|---|
| 普通开发者（个人） | 简单编排 + agent 调用，**别做复杂 squad** |
| 小团队 | 共享 workspace + 简单任务派发 |
| 大企业（自托管） | Multica 路线，完整 agent 团队管理 |

### 决策 2：你产品的核心叙事是什么？

| 叙事 | 含义 | 例子 |
|---|---|---|
| **AI 是团队成员** | Multica 路线 | "Next 10 hires won't be human" |
| **AI 是工具** | 主流路线 | "Your AI-powered dev environment" |
| **AI 是工作流的一环** | N8N+AI 路线 | "编排 AI 工作流，像搭积木" |

**这三种叙事对应的产品复杂度差一个数量级**。Multica 选了第一种，所以它的系统复杂度最高。

### 决策 3：agent 在你系统里的位置

- **A. agent 是被管理的"队友"** —— Multica 路线
- **B. agent 是被编排的工具** —— N8N + AI 路线 ✅ 推荐
- **C. agent 是无形的"助手"** —— Cursor/Codex 路线，最轻量

---

## 9. 最终建议

如果你要做一个"AI-native 任务管理"产品，蕾姆的建议：

> **不要复制 Multica 的完整 agent 团队模型。**
>
> 做"**AI 是被调用的工具，工作流编排一切**"的轻量模型：
> - 触发层：cron / webhook / UI
> - 编排层：N8N / Temporal / 自研简单队列
> - agent 层：只在写代码、写评论、做模糊判断时调用
> - 持久化层：数据库存任务和状态
>
> 这样你的产品：
> - 成本可控（agent 只在必要时跑）
> - 可观察可调试（每步有日志）
> - 用户预期正确（不是"管理 AI 团队"，是"自动化工作流"）
> - 工程上简单 5-10 倍

---

## 10. 实际产品架构建议（如果你真的要动手）

```
产品名（暂定）: WorkflowAI

核心对象:
  • Project（项目）
  • Issue（任务）
  • Workflow（工作流定义，N8N-style JSON）
  • Agent（只用于真正需要 AI 的步骤）
  • Trigger（cron / webhook / UI）

用户典型操作:
  1. 创建 Project
  2. 在 Project 下定义 Workflow
  3. Workflow 里大部分 step 是 shell / API，少量是 agent
  4. Trigger 触发 Workflow
  5. 用户在 UI 看每步状态、出错能定位到具体 step

差异化:
  • 比 N8N 简单（面向开发者，不是面向 IT）
  • agent 是 native step，不用自己拼 API
  • 失败可重试单个 step，不用从头跑
  • 每步消耗可看（agent step 标 token 成本）
```

这个产品的开发工作量大概是 Multica 的 1/10，但能解决 80% 的真实场景。

---

## 一句话总结

> **不要让 agent 做所有事。让 agent 做它擅长的事（写代码、判断、表达），其他事交给脚本和工作流。**
>
> Multica 选了"全 AI 团队"路线，是因为它在卖"未来工作方式"的叙事。如果你要做工具，不是卖叙事，那就走"工作流 + AI"路线，工程简单 10 倍，效果一样好。