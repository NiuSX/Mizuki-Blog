# AI 与 AI Agent 发展脉络及行业术语详解

<!-- lecture-notes:integrated-v2 -->

## 讲义导读：把 Agent 放进工程闭环

这一章讲的是 **AI 与 AI Agent 发展脉络及行业术语详解**。学习 AI Agent 时最容易犯的错误，是把所有新名词都看成“更高级的聊天机器人功能”。更稳妥的学法是：先看它解决什么工程问题，再看它把模型、工具、上下文、状态、评测和安全中的哪一环变得更清楚。

### 一句话先懂

术语学习的目标不是背名词，而是知道每个名词解决了哪个时代、哪个系统层次、哪类工程问题。

### 通俗类比

AI 术语像一棵技术树：机器学习是树干，深度学习是粗枝，大模型是新枝，Agent 是把模型接入工具和环境后的应用形态。只看叶子会迷路，要顺着历史和问题往回看。

类比只是入门扶手，不是严格定义。真正掌握时，要把类比重新落回本章的准确术语、流程、接口、状态、权限、评测指标和失败现象上。只停留在“感觉懂了”很危险；能画流程、能举反例、能解释失败原因，才算真正学会。

### 本章学习主线

1. **先看边界**：这章讨论的是模型能力、工具能力、上下文能力、控制流能力，还是上线治理能力？
2. **再看接口**：输入从哪里来，输出给谁用，中间状态如何保存，工具或外部系统如何接入？
3. **然后看失败**：如果模型答错、工具失败、检索不到、权限不足、成本超限或用户意图不清，系统应该怎么表现？
4. **接着看证据**：用什么 trace、日志、评测样例、人工审查或线上指标证明它真的有效？
5. **最后看取舍**：什么时候应该用简单 Workflow，什么时候才值得引入更自治的 Agent？

### 概念怎么学才不容易忘

遇到重要概念时，建议按“白话解释 -> 工程定义 -> 最小例子 -> 失败样例 -> 上线检查”五步走。比如看到 Tool Calling，先说清它为什么让模型能做事，再看 schema、权限和错误语义；看到 RAG，先说清它为什么补充外部知识，再看切分、召回、重排、引用和无答案策略；看到多 Agent，先说清为什么单 Agent 不够，再看通信、共享状态和停止条件。

### 最小实践任务

按时间线整理 20 个术语：每个术语写出出现背景、解决的问题、和前后概念的关系、一个实际例子。

实践时要刻意保留失败样本。很多 Agent 知识真正变清楚，不是在第一次跑通时，而是在你看到它如何失败、如何报错、如何恢复时。建议记录：输入是什么，期望输出是什么，实际 trace 是什么，失败属于模型、工具、检索、权限、状态还是业务规则，下一次如何更快判断。

### 读完本章应该能产出

能解释 AI、ML、DL、LLM、RAG、Agent、MCP、Workflow、多 Agent 等术语关系；能识别行业文章中的概念混用。

> 本节是全篇讲义化改写的阅读入口，后续正文中的定义、步骤、示例和参考资料都应围绕这条学习主线来理解。
本文是一份系统化学习文档，目标是帮助读者理解人工智能从早期符号主义到深度学习、生成式 AI、AI Agent 的演进过程，并掌握 AI 行业中常见的专业术语。

> 说明：本文为独立新增文档，不修改仓库中已有 AI 学习文章。

## 目录

0. AI 与 Agent 关键时间线总览
1. AI 的基本定义
2. AI 发展的历史阶段
3. 从传统 AI 到生成式 AI
4. AI Agent 的出现与发展
5. Agent 的核心组成与运行机制
6. AI 行业技术栈全景
7. AI 专业术语详解
8. Agent 专业术语详解
9. 大模型应用工程术语
10. AI 评测、安全与治理术语
11. 行业趋势与学习建议
12. 参考资料

## 0. AI 与 Agent 关键时间线总览

这一节按“研究论文、模型产品、工程范式、行业基础设施”四条线梳理。需要注意：很多概念不是某一年突然出现，而是经历了多年研究积累，直到某个模型、论文、产品或开源项目出现后才被行业广泛采用。

另外，常见说法里有一个时间点容易写错：Transformer 不是 2016 年提出，而是 2017 年 6 月 arXiv 发布《Attention Is All You Need》，并在 NeurIPS 2017 形成广泛影响。

### 0.1 1950 到 1999：人工智能思想、符号主义与机器学习基础

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 1950 | 图灵提出“机器能否思考”的问题，并提出后来被称为图灵测试的思想 | AI 哲学和计算智能讨论的重要起点 |
| 1956 | Dartmouth Workshop 通常被视为人工智能学科诞生标志 | “Artificial Intelligence” 成为研究领域名称 |
| 1960s | 早期符号 AI、搜索、规划、专家系统思想发展 | AI 主要被理解为规则、符号和逻辑推理 |
| 1966 | ELIZA 对话系统出现 | 早期人机对话系统，展示了简单模式匹配也能产生对话感 |
| 1970s | 专家系统兴起 | 通过人工规则模拟专家决策，适合封闭领域 |
| 1980s | 反向传播、神经网络再次受到关注 | 为后来的深度学习复兴奠定基础 |
| 1997 | IBM Deep Blue 战胜国际象棋世界冠军 Garry Kasparov | 搜索、评估函数和专用计算在封闭博弈中的代表性成功 |

这一阶段的关键词是“规则、搜索、推理、专家系统”。AI 的核心想象是：只要把知识和推理规则写清楚，机器就能表现出智能。但现实世界太复杂，人工规则很难维护，因此后来机器学习逐渐成为主流。

### 0.2 2000 到 2011：统计学习、互联网数据与深度学习准备期

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2000s | 统计机器学习广泛应用 | 搜索、广告、推荐、风控、语音等领域大量使用 ML |
| 2006 | 深度信念网络等工作推动“深度学习”重新受到关注 | 神经网络从低谷中恢复关注度 |
| 2009 | ImageNet 数据集发布 | 大规模视觉数据集推动计算机视觉竞赛和深度学习评估 |
| 2011 | IBM Watson 在 Jeopardy! 中获胜 | 问答系统和知识工程的重要行业事件 |

这一阶段的主线是数据、特征工程和统计模型。机器学习系统已经在工业界产生巨大价值，但仍然依赖人工特征和任务专用模型。

### 0.3 2012 到 2016：深度学习成为主流

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2012 | AlexNet 在 ImageNet 竞赛中取得突破 | GPU + 深度卷积网络推动视觉深度学习爆发 |
| 2013 | Word2Vec 推广词向量表示 | 让词语语义可以用向量表达，影响 NLP 表示学习 |
| 2014 | Seq2Seq 模型用于序列到序列任务 | 机器翻译、摘要、对话等任务开始采用端到端神经网络 |
| 2014 | Attention 机制开始用于神经机器翻译 | 为后来的 Transformer 奠定关键思想基础 |
| 2014 | GAN 提出 | 生成式模型重要路线之一，推动图像生成研究 |
| 2015 | DQN 在 Atari 游戏上表现突出 | 深度学习与强化学习结合，引发深度强化学习热潮 |
| 2016 | AlphaGo 战胜李世石 | 深度学习、强化学习、搜索结合，在复杂博弈中取得标志性成果 |

这一阶段的关键词是“深度学习、表示学习、端到端、GPU”。AI 从依赖人工特征，转向用深度网络自动学习表示。

### 0.4 2017 到 2021：Transformer 与大模型范式形成

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2017-06 | 《Attention Is All You Need》提出 Transformer | 抛弃循环和卷积，使用注意力机制，成为后续 LLM 基础架构 |
| 2018 | BERT 发布 | 双向 Transformer 预训练 + 微调范式在 NLP 中取得巨大影响 |
| 2018 | GPT-1 发布 | 生成式预训练 Transformer 路线开始成型 |
| 2019 | GPT-2 发布 | 展示更大语言模型的文本生成能力，引发对规模化的关注 |
| 2019 | T5 将多种 NLP 任务统一为 text-to-text | 进一步强化“统一文本接口”的思想 |
| 2020-05 | GPT-3 论文发布，175B 参数规模 | Few-shot / zero-shot 能力成为大模型时代标志 |
| 2020 | RAG 相关研究推动检索增强生成 | 解决模型知识过时、私有知识和可追溯问题 |
| 2021 | CLIP 推动图文对齐和多模态表示 | 文本与图像跨模态理解能力增强 |
| 2021 | Codex 展示大模型代码生成能力 | AI 编程助手成为重要应用方向 |

这一阶段的关键词是“预训练、规模化、Transformer、上下文学习、多模态、代码生成”。大模型开始从单任务模型转向通用基础模型。

### 0.5 2022：指令对齐、推理提示、ReAct 与 ChatGPT

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2022-01 | InstructGPT 发布 | RLHF 和指令跟随成为大模型产品化关键能力 |
| 2022 | Chain-of-Thought Prompting 受到广泛关注 | 通过中间推理提升复杂任务表现 |
| 2022-10 | ReAct 论文发布 | 将 reasoning 与 acting 交替结合，是现代 LLM Agent 的关键范式 |
| 2022-11-30 | ChatGPT 发布，基于 GPT-3.5 系列模型 | 生成式 AI 从研究和开发者圈层进入大众市场 |
| 2022 | Embedding + 向量数据库 + RAG 在应用层快速普及 | 企业知识库问答和私有数据增强成为主流需求 |

2022 年是生成式 AI 产品化的关键分水岭。InstructGPT 解决“模型能不能听懂人类指令”的问题，ChatGPT 解决“大众如何自然使用模型”的问题，ReAct 则把模型从“回答者”推向“能边想边做的任务执行者”。

### 0.6 2023：GPT-4、AutoGPT、开源模型与 Agent 热潮

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2023-03 | GPT-4 发布 | 多模态和复杂推理能力显著提升，推动企业探索高价值应用 |
| 2023-03 | AutoGPT 开源并走红 | “自主 Agent”成为大众开发者关注热点 |
| 2023 | BabyAGI、AgentGPT 等项目流行 | 任务拆解、自动执行、长期目标循环成为 Agent 原型方向 |
| 2023 | LangChain 生态快速扩张 | LLM 应用开发开始围绕 Chain、Tool、Agent、RAG 编排 |
| 2023 | Llama 系列等开源模型推动本地和私有化部署 | 大模型不再只由少数闭源 API 控制 |
| 2023 | 向量数据库、RAG 框架和企业知识库产品爆发 | “把企业数据接入大模型”成为主要落地方式 |

2023 年的 Agent 更像实验热潮。AutoGPT 这类项目证明了“LLM + 工具 + 目标循环”的想象力，也暴露了循环失控、成本高、错误累积、缺少权限和评测等问题。

### 0.7 2024：Agent 从演示走向工程化，协议和工作流兴起

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2024 | 多模态模型能力增强 | 模型开始同时处理文本、图像、音频、视频等输入 |
| 2024 | Agentic Workflow 成为更务实的落地方向 | 从“完全自治 Agent”转向“工作流 + 模型决策 + 工具调用” |
| 2024 | LangGraph 等状态图式 Agent 编排受到关注 | Agent 从自由循环转向可控状态机和图编排 |
| 2024 | AI 编程助手从补全走向多文件修改、测试和任务执行 | Coding Agent 成为 Agent 最活跃场景之一 |
| 2024-11-25 | Anthropic 发布 Model Context Protocol | MCP 为 AI 应用连接工具、资源和上下文提供统一协议方向 |

你提到“24 年 Agent”可以更准确地理解为：Agent 概念并非 2024 年才出现，但 2024 年行业开始从 2023 年的自主 Agent 演示，转向更工程化的 Agentic Workflow、状态管理、工具协议和企业集成。

### 0.8 2025：Agent SDK、观测评测、安全护栏与企业落地

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2025 | DeepSeek-R1 等推理模型引发对 reasoning model 的关注 | 推理能力和低成本模型成为行业焦点 |
| 2025-03-11 | OpenAI 发布 Responses API 与 Agents SDK | Agent 开发从“拼接模型和工具”转向更标准化的 SDK、trace 和 guardrails |
| 2025 | MCP 生态扩张 | 工具、数据源、IDE、桌面应用开始围绕统一协议集成 |
| 2025 | 企业开始重视 Agent 观测、评测、权限和审计 | 从 Demo 进入生产前准备阶段 |
| 2025 | 多 Agent 编排、Agent 评测、Agent 安全成为研究和工程热点 | Agent 不再只是 prompt，而是完整软件系统 |

2025 年的重点是“基础设施化”。行业意识到：Agent 是否有用，不只取决于模型，还取决于工具、权限、记忆、状态、评测、trace、成本控制和安全治理。

### 0.9 2026：Harness Engineering 与生产级 Agent 基础设施

| 时间 | 事件 | 意义 |
| --- | --- | --- |
| 2026 | Harness Engineering 在 AI Agent 工程讨论中升温 | 行业开始把模型外部的工具、状态、上下文、验证、沙箱、权限整体看作 Agent 运行底座 |
| 2026-04-15 | OpenAI Agents SDK 更新引入 model-native harness 和 native sandbox execution | 将文件、工具、沙箱执行、MCP、skills、AGENTS.md 等能力纳入更标准化的 Agent 运行环境 |
| 2026-04 | Agentic Harness Engineering 相关论文出现 | 研究开始把 harness 视为可观测、可演化、可验证的工程对象 |
| 2026-05 | AI Harness Engineering 相关论文将 harness formalize 为 foundation-model software agents 的 runtime substrate | “模型 + harness + 环境”成为解释软件 Agent 能力的重要框架 |

这里的 Harness Engineering 可以理解为：模型之外的一切工程结构。包括系统提示词、上下文选择、工具系统、文件系统、执行环境、状态管理、记忆、验证闭环、权限、审计、可观测性、沙箱和人工介入。

它和 Prompt Engineering、Context Engineering 的关系可以概括为：

```text
Prompt Engineering：解决表达问题，让模型听懂任务
Context Engineering：解决信息问题，让模型拿到正确上下文
Harness Engineering：解决执行问题，让 Agent 在长链路任务中可控、可验证、可恢复
```

因此，“2026 年 Harness”不是指 AI 才开始有工程外壳，而是这个概念在 Agent 生产化压力下被更明确地命名、讨论和系统化。

### 0.10 总结性判断

如果用一句话概括每个阶段：

| 阶段 | 核心变化 |
| --- | --- |
| 1950s-1980s | AI 主要是符号、规则、搜索和推理 |
| 1990s-2011 | 机器学习从数据中学习规律，特征工程是核心 |
| 2012-2016 | 深度学习自动学习表示，视觉、语音、强化学习突破 |
| 2017-2021 | Transformer 和预训练大模型形成通用基础模型范式 |
| 2022 | 指令对齐、ChatGPT、ReAct 推动模型进入大众应用和 Agent 雏形 |
| 2023 | GPT-4 与 AutoGPT 引发 Agent 热潮，但暴露工程短板 |
| 2024 | Agentic Workflow、MCP、状态图编排让 Agent 开始工程化 |
| 2025 | Agent SDK、评测、观测、安全和企业集成成为重点 |
| 2026 | Harness Engineering 把模型外执行底座系统化，Agent 向生产级基础设施演进 |

## 1. AI 的基本定义

AI，全称 Artificial Intelligence，中文通常翻译为人工智能。广义上，AI 指让机器表现出某些通常需要人类智能才能完成的能力，例如理解语言、识别图像、推理、规划、学习、决策和生成内容。

更工程化地说，AI 是一组让计算机从数据、规则、环境反馈或人类指令中获得能力，并用于完成预测、分类、生成、控制、规划和交互任务的技术体系。

AI 不是某一个单一算法，而是一整个学科和产业集合。它包含：

- 机器学习。
- 深度学习。
- 自然语言处理。
- 计算机视觉。
- 语音识别与合成。
- 推荐系统。
- 强化学习。
- 知识图谱。
- 生成式 AI。
- 大语言模型。
- 多模态模型。
- AI Agent。

## 2. AI 发展的历史阶段

### 2.1 萌芽阶段：逻辑、推理与机器智能设想

人工智能思想可以追溯到更早的逻辑学、自动机、控制论和计算理论。现代 AI 的理论基础与图灵机、可计算性、符号逻辑密切相关。

这一阶段的核心问题是：机器是否能表现出智能？如果能，智能能否被形式化为计算过程？

代表概念：

- 图灵测试。
- 自动机。
- 形式逻辑。
- 搜索。
- 推理。

### 2.2 符号主义 AI 阶段

早期 AI 主要采用符号主义思路。研究者认为智能可以通过符号、规则和逻辑推理实现。

典型做法：

- 用人工编写规则描述知识。
- 用搜索算法解决问题。
- 用逻辑推理推导结论。
- 构建专家系统。

代表系统：

- 专家系统。
- 规则引擎。
- 定理证明器。
- 早期规划系统。

优点：

- 可解释性强。
- 规则清晰。
- 在封闭领域有效。

缺点：

- 知识获取成本高。
- 规则维护困难。
- 对模糊、开放、噪声数据适应差。
- 难以覆盖真实世界复杂性。

### 2.3 机器学习阶段

机器学习的核心思想是：不完全依靠人工编写规则，而是让模型从数据中学习模式。

传统机器学习常见流程：

```text
收集数据
  ↓
人工设计特征
  ↓
训练模型
  ↓
验证模型
  ↓
部署预测
```

常见算法：

- 线性回归。
- 逻辑回归。
- 决策树。
- 随机森林。
- 支持向量机。
- 朴素贝叶斯。
- K-Means。
- 梯度提升树。

这一阶段的重点是特征工程。模型能力很大程度取决于人如何设计输入特征。

### 2.4 深度学习阶段

深度学习使用多层神经网络自动学习特征。它在图像、语音、自然语言等领域取得突破。

深度学习兴起的原因：

- 数据规模扩大。
- GPU 等计算资源提升。
- 神经网络结构改进。
- 训练技巧成熟。
- 开源框架发展。

代表模型：

- CNN：卷积神经网络，常用于图像。
- RNN：循环神经网络，常用于序列。
- LSTM / GRU：改进的循环网络。
- Transformer：基于注意力机制的序列建模架构。

深度学习的意义在于，它减少了大量人工特征工程，让模型能从原始数据中学习复杂表示。

### 2.5 Transformer 与大模型阶段

Transformer 架构通过注意力机制改善了序列建模能力，并成为大语言模型的基础。

大模型阶段的关键变化：

- 模型参数规模显著扩大。
- 训练数据规模显著扩大。
- 预训练成为核心范式。
- 模型出现更强的泛化能力。
- 自然语言成为通用交互接口。

典型能力：

- 文本生成。
- 摘要。
- 翻译。
- 问答。
- 代码生成。
- 推理。
- 工具调用。
- 多模态理解。

### 2.6 生成式 AI 阶段

生成式 AI 指能够生成新内容的 AI，包括文本、图像、音频、视频、代码和 3D 内容。

常见模型类型：

- 大语言模型。
- 文生图模型。
- 文生视频模型。
- 语音合成模型。
- 代码生成模型。
- 多模态模型。

生成式 AI 的重要变化是：AI 从“分类和预测工具”变成了“内容生产和任务协作工具”。

## 3. 从传统 AI 到生成式 AI

### 3.1 传统 AI 的典型任务

传统 AI 更多解决：

- 预测：预测价格、风险、销量。
- 分类：垃圾邮件识别、图像分类。
- 排序：搜索结果、推荐系统。
- 检测：异常检测、欺诈检测。
- 控制：机器人控制、自动驾驶。

输出通常是标签、分数、类别或动作。

### 3.2 生成式 AI 的典型任务

生成式 AI 更多解决：

- 写文章。
- 生成代码。
- 生成图片。
- 总结文档。
- 生成报告。
- 设计对话。
- 规划任务。
- 解释数据。

输出通常是自然语言、多媒体内容或结构化结果。

### 3.3 两者的关系

生成式 AI 不是取代传统 AI，而是扩展 AI 的能力边界。

真实系统中经常组合使用：

- 用传统机器学习做风控评分。
- 用大模型解释评分原因。
- 用 RAG 检索业务文档。
- 用 Agent 调用工具完成操作。

## 4. AI Agent 的出现与发展

### 4.1 Agent 的基本含义

Agent 可理解为具有目标、状态、工具和行动能力的智能体。它不仅回答问题，还能在环境中执行任务。

一个 AI Agent 通常具备：

- 目标理解。
- 任务规划。
- 工具调用。
- 状态维护。
- 结果观察。
- 错误恢复。
- 最终交付。

### 4.2 早期智能体思想

Agent 并不是大模型时代才出现的概念。早期 AI、强化学习、机器人、自动规划、游戏 AI 中都有智能体思想。

早期 Agent 关注：

- 感知环境。
- 根据规则或策略行动。
- 最大化奖励。
- 完成规划目标。

例如：

- 游戏 NPC。
- 自动规划系统。
- 机器人控制系统。
- 强化学习智能体。

### 4.3 大模型之前的 Agent

大模型出现之前，Agent 通常依赖：

- 手写规则。
- 状态机。
- 规划算法。
- 强化学习策略。
- 专家系统。

这类 Agent 在封闭环境中可控，但面对自然语言、开放任务和复杂工具时灵活性不足。

### 4.4 大模型带来的变化

大语言模型让 Agent 获得了更强的自然语言理解、推理、生成和工具选择能力。

变化包括：

- 用户可以用自然语言描述任务。
- Agent 可以读懂工具说明。
- Agent 可以生成工具参数。
- Agent 可以阅读工具返回结果。
- Agent 可以根据中间结果调整计划。
- Agent 可以生成面向人的总结。

因此，大模型成为现代 AI Agent 的“大脑”或决策中心。

### 4.5 ReAct 模式

ReAct 是 Reasoning and Acting 的缩写，强调推理和行动交替。

典型流程：

```text
用户目标
  ↓
思考下一步
  ↓
选择工具
  ↓
执行工具
  ↓
观察结果
  ↓
继续推理
  ↓
完成任务
```

ReAct 的意义在于，它让模型不是一次性给答案，而是边做边看结果。

### 4.6 Tool Calling 阶段

Tool Calling 让模型可以选择工具并生成结构化参数。

示例：

```json
{
  "tool": "search_docs",
  "arguments": {
    "query": "Android DataStore 使用场景"
  }
}
```

Tool Calling 是 Agent 工程化的重要基础，因为它把模型输出从自由文本变成可执行动作。

### 4.7 RAG + Agent 阶段

RAG 解决“模型不知道或容易编造”的问题。Agent 结合 RAG 后，可以：

- 检索资料。
- 阅读证据。
- 引用来源。
- 根据资料回答。
- 在信息不足时继续搜索。

RAG 让 Agent 更适合企业知识库、文档问答、研究报告和代码库分析。

### 4.8 Multi-Agent 阶段

多 Agent 系统使用多个角色协作：

- Planner：规划。
- Researcher：检索。
- Coder：编码。
- Reviewer：审查。
- Executor：执行。
- Critic：找问题。

多 Agent 的价值在于分工和审查，但它也会增加成本、延迟和调试复杂度。

### 4.9 Agentic Workflow 阶段

现代生产系统不一定追求完全自治 Agent，而是采用 Agentic Workflow。

也就是：

```text
确定性工作流
  +
模型判断节点
  +
工具调用
  +
人工审批
  +
评测和追踪
```

这种方式比“完全交给 Agent 自己跑”更可控，更适合真实业务。

## 5. Agent 的核心组成与运行机制

## 5.1 目标

目标是 Agent 要完成的任务。例如：

- “帮我整理一份竞品分析报告。”
- “读取这个仓库并修复测试失败。”
- “查询用户订单并生成客服回复。”

目标必须明确。目标越模糊，Agent 越容易跑偏。

## 5.2 模型

模型负责：

- 理解任务。
- 分析上下文。
- 决定下一步。
- 生成工具参数。
- 解释结果。
- 输出最终答案。

模型能力决定 Agent 的上限，但系统设计决定 Agent 的稳定性。

## 5.3 工具

工具是 Agent 能调用的外部能力：

- 搜索。
- 数据库查询。
- 文件读写。
- 浏览网页。
- 调用 API。
- 执行代码。
- 发送消息。

工具必须有明确 schema、权限和错误处理。

## 5.4 状态

状态记录任务进度：

- 当前目标。
- 已执行步骤。
- 工具结果。
- 中间产物。
- 错误信息。
- 用户确认。

没有状态管理，Agent 难以完成长任务。

## 5.5 记忆

记忆分为：

- 短期记忆：当前任务上下文。
- 长期记忆：用户偏好、历史任务、稳定事实。
- 情景记忆：某次任务的过程。
- 语义记忆：领域知识。

记忆要有权限、过期、可删除和可纠错机制。

## 5.6 规划器

Planner 把目标拆成步骤：

```text
收集资料 → 整理结构 → 生成草稿 → 校验来源 → 输出结果
```

计划应包含：

- 步骤目标。
- 所需工具。
- 输入输出。
- 完成条件。
- 风险等级。

## 5.7 执行器

Executor 根据计划执行具体动作。它可以调用工具、更新状态、处理错误。

执行器必须遵守：

- 最大步数。
- 最大成本。
- 最大时间。
- 权限边界。
- 停止条件。

## 5.8 验证器

Verifier 用于检查结果是否合格：

- 格式是否正确。
- 数据是否完整。
- 工具是否成功。
- 引用是否支持结论。
- 测试是否通过。

生产系统不能只靠模型自我感觉良好。

## 5.9 人工参与

Human-in-the-loop 适用于：

- 高风险操作。
- 权限不明确。
- 信息不足。
- 多个方案都合理。
- 成本超预算。

例如删除文件、发邮件、付款、修改权限等操作必须让人确认。

## 6. AI 行业技术栈全景

AI 系统可以按层理解：

```text
应用层：聊天助手、办公助手、代码助手、客服、搜索、推荐
Agent 层：规划、工具调用、记忆、多 Agent、工作流
模型层：LLM、多模态模型、Embedding、图像模型、语音模型
数据层：训练数据、向量库、知识库、数据库、日志
工程层：推理服务、MLOps、LLMOps、评测、监控、安全
基础设施：GPU、云平台、容器、调度、存储、网络
```

## 7. AI 专业术语详解

### 7.1 人工智能

让机器具备感知、学习、推理、决策、生成或行动能力的技术体系。

### 7.2 机器学习

机器学习是 AI 的子领域，强调从数据中学习规律，而不是完全由人工编写规则。

### 7.3 深度学习

深度学习是机器学习的子领域，使用多层神经网络学习数据表示。

### 7.4 神经网络

由大量参数和非线性变换组成的模型结构，灵感来自神经元连接，但工程上更应理解为可训练函数。

### 7.5 参数

模型训练后得到的数值权重。参数越多，模型容量通常越大，但也更消耗计算资源。

### 7.6 Token

模型处理文本的基本单位。Token 可能是一个字、一个词、一个词片段或标点。

Token 影响：

- 上下文长度。
- 计费。
- 推理速度。
- 模型可处理的信息量。

### 7.7 语料

用于训练或评估模型的数据集合。语料质量直接影响模型能力。

### 7.8 训练

通过数据调整模型参数，使模型在目标任务上表现更好。

### 7.9 预训练

在大规模通用数据上训练模型，让模型获得基础语言、知识和模式能力。

### 7.10 微调

在特定数据上继续训练模型，让它更适合某个领域或任务。

### 7.11 指令微调

用指令和回答数据训练模型，使模型更擅长按用户指令行动。

### 7.12 对齐

让模型输出更符合人类意图、安全要求和价值偏好的过程。

### 7.13 RLHF

Reinforcement Learning from Human Feedback，基于人类反馈的强化学习。它通过人类偏好训练奖励模型，再优化模型输出。

### 7.14 推理

Inference，指模型在部署后根据输入生成输出的过程。

### 7.15 Embedding

Embedding 是把文本、图片等数据转换成向量表示。相似内容在向量空间中距离更近。

用途：

- 语义检索。
- 聚类。
- 推荐。
- 去重。
- RAG。

### 7.16 向量数据库

用于存储和检索向量的数据库，支持相似度搜索。

常见用途：

- 知识库问答。
- 语义搜索。
- 长期记忆。

### 7.17 RAG

Retrieval-Augmented Generation，检索增强生成。先从外部知识库检索资料，再让模型基于资料回答。

RAG 解决：

- 模型知识过时。
- 私有知识无法进入模型。
- 需要引用来源。

RAG 不能完全消除幻觉，仍需要评测和引用校验。

### 7.18 幻觉

Hallucination，指模型生成看似合理但事实错误、无来源或编造的内容。

原因：

- 训练目标是预测文本，不是事实数据库。
- 上下文证据不足。
- 检索错误。
- 用户问题模糊。
- 模型过度补全。

### 7.19 上下文窗口

模型一次请求能处理的最大 token 范围。上下文越长，可放入的信息越多，但成本和延迟也更高。

### 7.20 Prompt

Prompt 是给模型的输入指令，包括用户问题、系统规则、示例、上下文、输出格式等。

### 7.21 System Prompt

系统级指令，用于定义模型角色、行为边界、安全规则和输出约束。

### 7.22 Few-shot

在 Prompt 中提供少量示例，让模型模仿示例完成任务。

### 7.23 Zero-shot

不给示例，直接让模型完成任务。

### 7.24 Chain of Thought

思维链，引导模型进行中间推理。工程上通常不需要暴露完整内部推理给用户，而是保留简洁解释和可审计过程。

### 7.25 多模态

模型能处理多种模态，例如文本、图片、音频、视频。

### 7.26 Foundation Model

基础模型，指在大规模数据上训练、可适配多种下游任务的大模型。

### 7.27 LLM

Large Language Model，大语言模型。以文本为主要输入输出，具备语言理解和生成能力。

### 7.28 SLM

Small Language Model，小语言模型。参数规模较小，成本低、延迟低，适合本地、边缘和特定任务。

### 7.29 MoE

Mixture of Experts，专家混合模型。模型包含多个专家子网络，每次只激活部分专家，以提升参数规模和计算效率之间的平衡。

### 7.30 Distillation

蒸馏，用大模型指导小模型训练，让小模型学习大模型能力。

### 7.31 Quantization

量化，把模型参数从高精度转换为低精度，例如 FP16、INT8、INT4，以减少显存和提升推理速度。

### 7.32 Fine-tuning 与 Prompting 的区别

Prompting 是通过输入指令影响模型行为，不改变模型参数。

Fine-tuning 会继续训练模型，改变模型参数。

一般优先尝试 Prompt、RAG、工具调用和工作流。只有当行为稳定需要内化到模型时，再考虑微调。

## 8. Agent 专业术语详解

### 8.1 Agent

具备目标、状态、工具和行动能力的 AI 系统。它可以多步执行任务，而不是只回答单个问题。

### 8.2 Agent Runtime

Agent 的运行时系统，负责循环执行、模型调用、工具调用、状态更新、错误处理和停止条件。

### 8.3 Tool Calling

模型选择工具并生成参数，由系统执行工具。

### 8.4 Function Calling

模型 API 层面的函数调用能力，是 Tool Calling 的常见实现方式。

### 8.5 MCP

Model Context Protocol，一种连接 AI 应用与外部工具、资源和提示的开放协议。它让工具和上下文可以通过统一方式暴露给 AI 应用。

### 8.6 Planner

规划器，把任务拆解成步骤。

### 8.7 Executor

执行器，负责执行计划中的步骤。

### 8.8 Verifier

验证器，检查中间结果或最终结果是否满足要求。

### 8.9 Memory

记忆，保存任务历史、用户偏好、长期事实或上下文状态。

### 8.10 Short-term Memory

短期记忆，通常是当前会话或当前任务上下文。

### 8.11 Long-term Memory

长期记忆，跨会话保存，可用于个性化和长期任务。

### 8.12 Reflection

反思，让模型检查自己的计划、输出或错误，并提出修正。

### 8.13 Handoff

任务移交。一个 Agent 将任务交给另一个 Agent，或交给人工。

### 8.14 Multi-Agent

多个 Agent 分工协作的系统。

### 8.15 Agentic Workflow

带有 Agent 能力的工作流。通常由确定性流程控制主线，模型负责语义判断、生成和工具选择。

### 8.16 Human-in-the-loop

人工参与，在高风险或不确定场景中由人确认、审批或接管。

### 8.17 Guardrails

护栏机制，用于限制模型和 Agent 的行为，例如输出格式校验、安全过滤、权限控制、敏感信息过滤。

### 8.18 Trace

执行轨迹，记录 Agent 每一步模型调用、工具调用、状态变化和错误，便于调试和审计。

### 8.19 Sandbox

沙箱，用于限制 Agent 执行代码、访问文件或调用网络的范围，降低风险。

### 8.20 Stop Condition

停止条件，例如达到目标、超过最大步数、超过预算、需要人工确认或发生安全风险。

## 9. 大模型应用工程术语

### 9.1 LLMOps

围绕大模型应用的工程实践，包括 Prompt 管理、模型路由、评测、监控、成本控制、灰度发布和安全治理。

### 9.2 MLOps

机器学习工程运维体系，关注数据、训练、部署、监控、模型版本和再训练。

### 9.3 Prompt Engineering

提示工程，通过设计输入指令、上下文和示例来改善模型输出。

### 9.4 Prompt Template

提示模板，把固定规则和动态变量组合成模型输入。

### 9.5 Structured Output

结构化输出，让模型输出 JSON、表格或 schema 约束格式，便于程序解析。

### 9.6 JSON Schema

描述 JSON 数据结构的规范，常用于约束工具参数或模型输出。

### 9.7 Orchestration

编排，把模型、工具、检索、工作流和业务系统连接起来。

### 9.8 Model Gateway

模型网关，统一管理模型调用、重试、限流、日志、成本和模型路由。

### 9.9 Tool Gateway

工具网关，统一管理工具注册、权限、参数校验、审计和错误处理。

### 9.10 Vector Search

向量搜索，按语义相似度检索内容。

### 9.11 Rerank

重排序，对初步检索结果再次排序，提高相关性。

### 9.12 Chunk

文档切片。RAG 中把长文档拆成适合检索和放入上下文的小片段。

### 9.13 Context Compression

上下文压缩，把长内容摘要、筛选或结构化后再放入模型上下文。

### 9.14 Cache

缓存，保存可复用的模型结果、检索结果或工具结果，以降低成本和延迟。

### 9.15 Streaming

流式输出，模型边生成边返回，改善用户等待体验。

### 9.16 Latency

延迟，从用户请求到系统响应所需时间。

### 9.17 Throughput

吞吐量，单位时间内系统能处理的请求数量。

### 9.18 Cost per Task

单任务成本，包括模型 token、工具调用、检索、存储和计算资源。

## 10. AI 评测、安全与治理术语

### 10.1 Evaluation

评测，用样例、指标和人工审查衡量模型或 Agent 表现。

### 10.2 Benchmark

基准测试，用固定任务集合比较模型能力。

### 10.3 Golden Dataset

黄金评测集，由高质量样本和标准答案组成，用于回归测试。

### 10.4 LLM-as-Judge

使用大模型评估另一个模型输出。适合语义质量判断，但不能替代真实规则、工具测试和人工审查。

### 10.5 Grounding

让模型输出基于给定证据或真实数据，而不是凭空生成。

### 10.6 Citation

引用来源。RAG 和研究型 Agent 中常用于说明答案依据。

### 10.7 Faithfulness

忠实度，衡量模型回答是否忠实于给定上下文或证据。

### 10.8 Robustness

鲁棒性，系统面对异常输入、噪声、攻击或环境变化时保持稳定的能力。

### 10.9 Prompt Injection

提示注入，攻击者把恶意指令放入用户输入或外部内容，诱导模型违背原始规则。

### 10.10 Jailbreak

越狱攻击，诱导模型绕过安全规则输出不该输出的内容。

### 10.11 Data Leakage

数据泄露，敏感数据被模型、日志、工具或错误输出泄露。

### 10.12 PII

Personally Identifiable Information，个人身份信息，例如姓名、手机号、身份证号、地址、邮箱等。

### 10.13 Red Teaming

红队测试，通过攻击性测试发现模型和系统漏洞。

### 10.14 Safety Policy

安全策略，定义系统允许和拒绝的内容与行为。

### 10.15 Audit Log

审计日志，记录关键操作、权限判断、工具调用和人工审批。

### 10.16 Bias

偏见，模型输出中对某些群体、观点或样本分布的不公平倾向。

### 10.17 Explainability

可解释性，理解模型或系统为什么给出某个结果的能力。

### 10.18 Governance

治理，围绕 AI 使用的制度、流程、责任、审计、安全和合规体系。

## 11. 行业趋势与学习建议

## 11.1 从模型能力竞争到系统能力竞争

早期生成式 AI 应用常关注“模型能不能回答”。现在更关注：

- 能否接入企业数据。
- 能否调用工具。
- 能否稳定完成任务。
- 能否评测。
- 能否审计。
- 能否控制成本。
- 能否安全上线。

模型能力仍然重要，但工程系统能力变得同样关键。

## 11.2 从聊天机器人到任务执行系统

AI 应用正在从 Chatbot 走向 Task Assistant 和 Agentic System。

区别：

- Chatbot 主要对话。
- Copilot 辅助人完成任务。
- Agent 可以主动规划和调用工具。
- Workflow Agent 在业务流程中稳定执行部分工作。

## 11.3 从单模型到多模型组合

真实系统可能使用：

- 强模型做复杂推理。
- 小模型做分类和路由。
- Embedding 模型做检索。
- 视觉模型看图。
- 语音模型处理音频。
- 传统 ML 做评分。

多模型组合比单一模型更经济，也更可控。

## 11.4 从 Prompt 到产品工程

Prompt 很重要，但远远不够。生产级 AI 应用还需要：

- 数据治理。
- RAG。
- 工具权限。
- 状态管理。
- 评测集。
- Trace。
- 灰度发布。
- 成本监控。
- 安全策略。

## 11.5 学习路线

建议顺序：

1. 理解 AI、机器学习、深度学习和大模型基本概念。
2. 学习 Prompt、结构化输出和工具调用。
3. 学习 RAG、Embedding、向量数据库。
4. 学习 Agent 架构、ReAct、Planner、Memory。
5. 学习评测、Tracing、安全和成本控制。
6. 做一个真实项目，例如知识库问答、代码助手、研究助手或办公自动化 Agent。

## 12. 参考资料

以下资料适合持续跟进。AI 和 Agent 领域变化很快，具体 API、框架能力和标准状态应以官方资料为准。

### 综合报告与治理

- [Stanford HAI AI Index](https://hai.stanford.edu/ai-index)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OECD AI Principles](https://oecd.ai/en/ai-principles)

### 关键论文与研究线索

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805)
- [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)
- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)
- [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774)
- [Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses](https://arxiv.org/abs/2604.25850)
- [AI Harness Engineering: A Runtime Substrate for Foundation-Model Software Agents](https://arxiv.org/abs/2605.13357)

### 平台、协议与 Agent 框架

- [OpenAI Platform 文档](https://platform.openai.com/docs)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [The next evolution of the Agents SDK](https://openai.com/index/the-next-evolution-of-the-agents-sdk/)
- [Model Context Protocol 文档](https://modelcontextprotocol.io/docs)
- [LangChain 文档](https://docs.langchain.com/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [LlamaIndex 文档](https://docs.llamaindex.ai/)
- [Microsoft AutoGen](https://microsoft.github.io/autogen/)
- [Google AI for Developers](https://ai.google.dev/)

## 13. 快速复习表

| 术语 | 一句话理解 |
| --- | --- |
| AI | 让机器表现出智能能力的技术体系 |
| ML | 从数据中学习规律 |
| DL | 使用深层神经网络学习表示 |
| LLM | 以语言理解和生成为核心的大模型 |
| Token | 模型处理文本的基本单位 |
| Prompt | 给模型的输入指令和上下文 |
| RAG | 检索资料后再生成答案 |
| Embedding | 把内容转换成向量 |
| Vector DB | 存储和检索向量的数据库 |
| Hallucination | 模型编造或输出错误事实 |
| Agent | 能规划、调用工具并执行任务的 AI 系统 |
| Tool Calling | 模型选择工具并生成参数 |
| MCP | 连接 AI 应用与工具/资源的协议 |
| Memory | Agent 保存和使用历史信息的能力 |
| Planner | 任务规划器 |
| Verifier | 结果验证器 |
| Guardrails | 安全和行为护栏 |
| Trace | Agent 执行轨迹 |
| LLMOps | 大模型应用工程运维体系 |
| Evaluation | 对模型或 Agent 的系统评测 |

---

## 万字精讲扩展（2026-06-16 更新）
> Last researched: 2026-06-16。本文补充内容以 OpenAI、Anthropic、MCP、LangGraph、LlamaIndex、AutoGen、CrewAI、Microsoft Agent Framework、Langfuse 等官方或厂商资料为主；Agent 生态变化很快，真实项目应继续核对模型、SDK、框架和安全策略的最新版本。

### 本章在 AI Agent 学习路线中的位置

《AI 与 AI Agent 发展脉络及行业术语详解》是 Agent 工程能力链条中的一个环节。Agent 不是单次模型调用，也不是一个框架名，而是模型、工具、上下文、状态、规划、执行、评测、安全和可观测性组合成的系统。学习本章时，不要只问“这个概念是什么”，还要问“它如何被测试、如何被限制、如何被观测、如何在失败时恢复”。

本章学习完成后，至少应达到三个标准。第一，能说明该主题给 Agent 增加了什么能力，以及什么时候不该使用。第二，能设计一个最小 demo，并明确工具、状态、停止条件和失败处理。第三，能用 trace 和评测样例证明改动有效。没有评测和可观测性的 Agent，只是难以维护的黑箱。

### 发展脉络和术语类笔记的精讲重点

AI Agent 的发展不是突然出现的概念，而是传统 AI、强化学习、规划系统、工具调用、RAG、函数调用、工作流自动化和大模型能力共同演进的结果。术语学习要避免把不同层次混在一起：LLM 是模型，Agent 是系统，tool 是外部能力，memory 是状态策略，workflow 是控制流，MCP 是连接标准，eval 是质量控制，guardrail 是风险控制。

行业术语更新很快，笔记应标注定义来源和使用语境。同一个词在不同框架里可能含义不同，例如 memory、agent、tool、workflow、handoff、trace、guardrail。术语表的目标不是追热词，而是让架构讨论更准确。

### Agent 学习的底层方法：把“智能”拆成可控工程循环

AI Agent 最容易被讲成一个模糊概念：模型会思考、会调用工具、会自己完成任务。工程上更可靠的理解是：Agent 是围绕模型构建的运行时系统，它接收目标和上下文，选择下一步动作，调用工具或查询记忆，观察结果，再决定继续、交给人、回滚或停止。这个循环看起来像自主行为，但每一步都应该有边界：允许调用哪些工具，工具参数如何校验，结果如何压缩，失败如何重试，什么时候必须让人审批，什么时候停止，怎样记录 trace，怎样评测结果是否可靠。

学习 Agent 不要从“多智能体”和“全自动”开始，而要从一个增强型 LLM 开始：一个模型、一个清晰任务、一个结构化输出、一个只读工具、一组评测样例。只有这个最小闭环稳定以后，再引入写操作、RAG、Memory、规划器、工作流、多 Agent、异步任务和生产监控。Anthropic 的 effective agents 文章也强调，很多生产系统更适合简单、可组合、可预测的工作流，而不是一开始就追求复杂自治。OpenAI Agents SDK 的文档同样把工具、handoff、state、guardrails、tracing、evals 作为可组合能力，而不是把 Agent 当成黑箱。

### Agent 运行时闭环

```mermaid
flowchart LR
  User[用户目标/任务] --> Intake[输入解析与风险分级]
  Intake --> Context[上下文: RAG/Memory/会话状态]
  Context --> Model[LLM 决策]
  Model --> Action{动作类型}
  Action -->|回答| Output[结构化输出]
  Action -->|调用工具| Tool[Tool Gateway/MCP/Function]
  Action -->|交给人| HITL[Human Review]
  Tool --> Obs[观察结果]
  HITL --> Obs
  Obs --> State[状态与Trace]
  State --> Model
  Output --> Eval[评测/监控/反馈]
```

Figure: 生产级 Agent 运行时闭环，综合 OpenAI Agents SDK、Anthropic effective agents、MCP、LangGraph/LlamaIndex/CrewAI/AutoGen 文档整理。

这个图的重点是：模型不是系统的全部，工具也不是简单函数。生产 Agent 至少需要输入治理、上下文治理、工具治理、执行治理、结果治理和可观测性。没有这些工程层，Agent 在 demo 中看起来可用，但上线后会遇到成本不可控、延迟过高、工具误用、权限越界、提示注入、RAG 幻觉、记忆污染、不可复现、无法回放和无法评测的问题。

### Workflow 和 Agent 要分清

Workflow 是预定义控制流，适合流程稳定、责任明确、风险可控的任务；Agent 是模型在运行中选择步骤和工具，适合路径不固定、需要动态探索、需要根据观察调整策略的任务。很多企业场景应该采用“workflow + agent”的混合结构：用 workflow 固定高风险主流程，用 Agent 处理信息抽取、检索、草拟、分类、诊断和建议；写操作、外部发送、转账、删除、审批、发布等动作由规则、权限和人审控制。

一个实用判断是：如果任务步骤稳定，优先 workflow；如果任务需要在多个信息源中探索，才考虑 Agent；如果任务有高风险写操作，必须加入审批和回滚；如果任务没有明确评测标准，不要急于自动化。Agent 不是所有 LLM 应用的升级版，很多问答、摘要、抽取和分类任务用普通链式调用更稳、更便宜、更容易测。

### 评测先于复杂化

Agent 系统引入工具和循环后，失败模式会指数增加。一个普通 LLM 调用只需要评估答案质量，Agent 还要评估步骤选择、工具参数、工具结果理解、是否过度调用、是否遗漏验证、是否遵守权限、是否正确停止。OpenAI agent evals 文档强调 trace 级评估，因为 trace 能展示模型调用、工具调用、handoff、guardrails 和自定义 span。没有 trace，就很难知道失败来自提示、检索、工具、模型、权限还是业务规则。

建议每个 Agent 项目从第一天就建立评测集。评测样例至少包括成功路径、边界路径、恶意输入、缺失信息、工具失败、权限不足、长上下文、重复请求和成本压力。每次改 prompt、模型、工具 schema、RAG 切分、memory 策略或框架版本，都跑回归评测。没有评测的 Agent 优化，很容易变成“这次看起来更聪明”的主观判断。

### 核心知识点逐条精讲

#### 1. AI 发展阶段

在《AI 与 AI Agent 发展脉络及行业术语详解》中，`AI 发展阶段` 要从“能力、边界、证据、风险”四个角度理解。能力回答它能带来什么增量，例如让模型调用工具、访问知识、规划任务或协作执行；边界回答什么时候不该使用它，例如普通确定性流程、低风险固定任务或无法评测的任务；证据回答如何证明它有效，例如 trace、评测集、人工审查、工具调用日志和线上指标；风险回答失败后会造成什么后果，例如成本升高、权限越界、数据泄露、错误操作或用户误信。

实践中，`AI 发展阶段` 不应该只写成概念，而要落到可配置对象和测试样例。比如工具要有 schema、权限、超时、错误码和 mock；RAG 要有切分、召回、重排、引用和无答案策略；Memory 要有写入规则、过期规则、用户可见和纠错机制；Planner 要有最大步数、停止条件和验证器；多 Agent 要有通信格式、共享状态和冲突解决。每个对象都应能被单独测试，并能在 trace 里被观察。

生产判断上，`AI 发展阶段` 的默认策略应是先简单、后复杂，先只读、后写入，先人工审批、后自动化，先评测、后扩展。Agent 系统最大的风险不是模型“不够聪明”，而是系统把不稳定能力放进了不可控场景。真正可靠的 Agent 往往是被明确边界、工具权限、工作流状态和评测体系约束出来的。

#### 2. Agent 运行机制

在《AI 与 AI Agent 发展脉络及行业术语详解》中，`Agent 运行机制` 要从“能力、边界、证据、风险”四个角度理解。能力回答它能带来什么增量，例如让模型调用工具、访问知识、规划任务或协作执行；边界回答什么时候不该使用它，例如普通确定性流程、低风险固定任务或无法评测的任务；证据回答如何证明它有效，例如 trace、评测集、人工审查、工具调用日志和线上指标；风险回答失败后会造成什么后果，例如成本升高、权限越界、数据泄露、错误操作或用户误信。

实践中，`Agent 运行机制` 不应该只写成概念，而要落到可配置对象和测试样例。比如工具要有 schema、权限、超时、错误码和 mock；RAG 要有切分、召回、重排、引用和无答案策略；Memory 要有写入规则、过期规则、用户可见和纠错机制；Planner 要有最大步数、停止条件和验证器；多 Agent 要有通信格式、共享状态和冲突解决。每个对象都应能被单独测试，并能在 trace 里被观察。

生产判断上，`Agent 运行机制` 的默认策略应是先简单、后复杂，先只读、后写入，先人工审批、后自动化，先评测、后扩展。Agent 系统最大的风险不是模型“不够聪明”，而是系统把不稳定能力放进了不可控场景。真正可靠的 Agent 往往是被明确边界、工具权限、工作流状态和评测体系约束出来的。

#### 3. 行业术语

在《AI 与 AI Agent 发展脉络及行业术语详解》中，`行业术语` 要从“能力、边界、证据、风险”四个角度理解。能力回答它能带来什么增量，例如让模型调用工具、访问知识、规划任务或协作执行；边界回答什么时候不该使用它，例如普通确定性流程、低风险固定任务或无法评测的任务；证据回答如何证明它有效，例如 trace、评测集、人工审查、工具调用日志和线上指标；风险回答失败后会造成什么后果，例如成本升高、权限越界、数据泄露、错误操作或用户误信。

实践中，`行业术语` 不应该只写成概念，而要落到可配置对象和测试样例。比如工具要有 schema、权限、超时、错误码和 mock；RAG 要有切分、召回、重排、引用和无答案策略；Memory 要有写入规则、过期规则、用户可见和纠错机制；Planner 要有最大步数、停止条件和验证器；多 Agent 要有通信格式、共享状态和冲突解决。每个对象都应能被单独测试，并能在 trace 里被观察。

生产判断上，`行业术语` 的默认策略应是先简单、后复杂，先只读、后写入，先人工审批、后自动化，先评测、后扩展。Agent 系统最大的风险不是模型“不够聪明”，而是系统把不稳定能力放进了不可控场景。真正可靠的 Agent 往往是被明确边界、工具权限、工作流状态和评测体系约束出来的。

#### 4. 工具和记忆

在《AI 与 AI Agent 发展脉络及行业术语详解》中，`工具和记忆` 要从“能力、边界、证据、风险”四个角度理解。能力回答它能带来什么增量，例如让模型调用工具、访问知识、规划任务或协作执行；边界回答什么时候不该使用它，例如普通确定性流程、低风险固定任务或无法评测的任务；证据回答如何证明它有效，例如 trace、评测集、人工审查、工具调用日志和线上指标；风险回答失败后会造成什么后果，例如成本升高、权限越界、数据泄露、错误操作或用户误信。

实践中，`工具和记忆` 不应该只写成概念，而要落到可配置对象和测试样例。比如工具要有 schema、权限、超时、错误码和 mock；RAG 要有切分、召回、重排、引用和无答案策略；Memory 要有写入规则、过期规则、用户可见和纠错机制；Planner 要有最大步数、停止条件和验证器；多 Agent 要有通信格式、共享状态和冲突解决。每个对象都应能被单独测试，并能在 trace 里被观察。

生产判断上，`工具和记忆` 的默认策略应是先简单、后复杂，先只读、后写入，先人工审批、后自动化，先评测、后扩展。Agent 系统最大的风险不是模型“不够聪明”，而是系统把不稳定能力放进了不可控场景。真正可靠的 Agent 往往是被明确边界、工具权限、工作流状态和评测体系约束出来的。

#### 5. 评测、安全和治理

在《AI 与 AI Agent 发展脉络及行业术语详解》中，`评测、安全和治理` 要从“能力、边界、证据、风险”四个角度理解。能力回答它能带来什么增量，例如让模型调用工具、访问知识、规划任务或协作执行；边界回答什么时候不该使用它，例如普通确定性流程、低风险固定任务或无法评测的任务；证据回答如何证明它有效，例如 trace、评测集、人工审查、工具调用日志和线上指标；风险回答失败后会造成什么后果，例如成本升高、权限越界、数据泄露、错误操作或用户误信。

实践中，`评测、安全和治理` 不应该只写成概念，而要落到可配置对象和测试样例。比如工具要有 schema、权限、超时、错误码和 mock；RAG 要有切分、召回、重排、引用和无答案策略；Memory 要有写入规则、过期规则、用户可见和纠错机制；Planner 要有最大步数、停止条件和验证器；多 Agent 要有通信格式、共享状态和冲突解决。每个对象都应能被单独测试，并能在 trace 里被观察。

生产判断上，`评测、安全和治理` 的默认策略应是先简单、后复杂，先只读、后写入，先人工审批、后自动化，先评测、后扩展。Agent 系统最大的风险不是模型“不够聪明”，而是系统把不稳定能力放进了不可控场景。真正可靠的 Agent 往往是被明确边界、工具权限、工作流状态和评测体系约束出来的。


### 场景化学习与排错表

| 主题 | 推荐动作 | 常见风险 | 验证方式 |
| :--- | :--- | :--- | :--- |
| AI 发展阶段 | 先定义任务边界和成功标准，再设计工具/状态/评测，最后接入生产监控 | 直接堆框架、缺少评测、工具权限过大、没有停止条件、无法回放 | 单元测试、工具 mock、trace 回放、黄金集评测、红队样例、线上指标 |
| Agent 运行机制 | 先定义任务边界和成功标准，再设计工具/状态/评测，最后接入生产监控 | 直接堆框架、缺少评测、工具权限过大、没有停止条件、无法回放 | 单元测试、工具 mock、trace 回放、黄金集评测、红队样例、线上指标 |
| 行业术语 | 先定义任务边界和成功标准，再设计工具/状态/评测，最后接入生产监控 | 直接堆框架、缺少评测、工具权限过大、没有停止条件、无法回放 | 单元测试、工具 mock、trace 回放、黄金集评测、红队样例、线上指标 |
| 工具和记忆 | 先定义任务边界和成功标准，再设计工具/状态/评测，最后接入生产监控 | 直接堆框架、缺少评测、工具权限过大、没有停止条件、无法回放 | 单元测试、工具 mock、trace 回放、黄金集评测、红队样例、线上指标 |
| 评测、安全和治理 | 先定义任务边界和成功标准，再设计工具/状态/评测，最后接入生产监控 | 直接堆框架、缺少评测、工具权限过大、没有停止条件、无法回放 | 单元测试、工具 mock、trace 回放、黄金集评测、红队样例、线上指标 |

这张表的重点是把 Agent 能力变成可验证工程对象。很多 Agent demo 的问题不是不能成功一次，而是失败时没有证据、无法复现、无法回滚、无法量化改进。每个主题都应该对应 trace、评测样例、权限策略和失败处理。

### 本章建议工作流

```mermaid
flowchart TD
  A[阅读《AI 与 AI Agent 发展脉络及行业术语详解》概念和官方资料] --> B[定义任务边界和风险等级]
  B --> C[设计最小 Agent/Workflow]
  C --> D[定义工具、状态、上下文和停止条件]
  D --> E[构建评测集和红队样例]
  E --> F[接入 trace、日志、成本和延迟监控]
  F --> G[小流量试运行并复盘失败]
```

Figure: 《AI 与 AI Agent 发展脉络及行业术语详解》学习和落地工作流，综合 OpenAI Agents SDK、Anthropic effective agents、MCP、LangGraph、LlamaIndex、AutoGen、CrewAI 和 Langfuse 资料整理。

这个流程避免“先做复杂系统再补治理”。Agent 项目越早接入评测和可观测性，越容易知道改动是否有效。复杂能力如多 Agent、长期记忆、自动写操作和长任务执行，都应该在最小闭环稳定后再引入。

### 常见误区和纠正方法

- 误区：把 Agent 等同于聊天机器人。纠正：Agent 的关键是多步执行、工具使用、状态和反馈循环，普通问答不一定需要 Agent。
- 误区：一开始就多 Agent。纠正：先用单 Agent 或 workflow 解决问题，只有职责清晰、可评测、可观测时再拆多 Agent。
- 误区：把所有治理写进 prompt。纠正：权限、schema、验证器、审批、沙箱、审计和回滚应由系统实现，prompt 只是其中一层。
- 误区：没有评测就调 prompt。纠正：每次改模型、prompt、工具、RAG 或框架，都应跑回归评测和 trace 对比。
- 误区：工具越多越好。纠正：工具越多，选择错误和权限越界风险越高；工具应职责清晰、可组合、可测试、可审计。
- 误区：Memory 永远有益。纠正：记忆会污染、过期、泄露隐私，也可能强化错误偏好；必须有写入、读取、纠错和删除策略。

### 与相邻章节的关系

《AI 与 AI Agent 发展脉络及行业术语详解》应与提示工程、工具/MCP、RAG/Memory、规划执行、评测、安全和生产工程章节联动。Prompt 决定模型如何理解任务，工具决定它能做什么，RAG 和 Memory 决定上下文，规划执行决定任务如何推进，评测和可观测性决定能否改进，安全风控决定能否上线。任何单点能力脱离这些关系，都容易变成 demo 级系统。

### 实操训练和复盘模板

1. 围绕 `AI 发展阶段` 做一个最小实验：写成功样例、失败样例、trace 观察点和评测标准。
2. 围绕 `Agent 运行机制` 做一个最小实验：写成功样例、失败样例、trace 观察点和评测标准。
3. 围绕 `行业术语` 做一个最小实验：写成功样例、失败样例、trace 观察点和评测标准。
4. 围绕 `工具和记忆` 做一个最小实验：写成功样例、失败样例、trace 观察点和评测标准。
5. 围绕 `评测、安全和治理` 做一个最小实验：写成功样例、失败样例、trace 观察点和评测标准。

建议每个 Agent 练习都按下面格式复盘：

```text
项目名称：
本章主题：AI 与 AI Agent 发展脉络及行业术语详解
任务边界：用户目标、允许动作、禁止动作
模型和框架版本：
工具列表：名称、schema、权限、超时、错误码、mock
上下文来源：RAG、Memory、会话状态、用户输入、系统配置
执行控制：最大步数、最大成本、停止条件、重试和人审
评测样例：成功、失败、边界、恶意、工具异常、缺少信息
Trace 观察：模型调用、工具调用、handoff、guardrail、成本、延迟
失败原因：prompt / retrieval / tool / model / permission / business rule
改进动作：
上线风险：
```

这个模板能把 Agent 学习从“能跑 demo”推进到“能解释和治理”。生产级 Agent 最重要的不是一次成功输出，而是每次失败都能定位原因，每次改动都能通过评测验证。

## 参考资料与延伸阅读

- [Official / OpenAI] Agents SDK guide: https://developers.openai.com/api/docs/guides/agents
- [Official / OpenAI] Agents SDK quickstart: https://developers.openai.com/api/docs/guides/agents/quickstart
- [Official / OpenAI] Running agents: https://developers.openai.com/api/docs/guides/agents/running-agents
- [Official / OpenAI] Orchestration and handoffs: https://developers.openai.com/api/docs/guides/agents/orchestration
- [Official / OpenAI] Results and state: https://developers.openai.com/api/docs/guides/agents/results
- [Official / OpenAI] Integrations and observability: https://developers.openai.com/api/docs/guides/agents/integrations-observability
- [Official / OpenAI] Evaluate agent workflows: https://developers.openai.com/api/docs/guides/agent-evals
- [Official / OpenAI Developers] Agents learning hub: https://developers.openai.com/learn/agents
- [Official / Anthropic] Building Effective Agents: https://www.anthropic.com/research/building-effective-agents
- [Official / Anthropic] Writing effective tools for AI agents: https://www.anthropic.com/engineering/writing-tools-for-agents
- [Official / MCP] Model Context Protocol introduction: https://modelcontextprotocol.io/docs/getting-started/intro
- [Official / MCP] MCP specification 2025-11-25 - Tools: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- [Official / LangChain] LangGraph overview: https://docs.langchain.com/oss/python/langgraph/overview
- [Official / LangChain] LangGraph product page: https://www.langchain.com/langgraph
- [Official / LlamaIndex] Developer documentation: https://developers.llamaindex.ai/python/framework/
- [Official / LlamaIndex] Agent memory: https://developers.llamaindex.ai/python/framework/module_guides/deploying/agents/memory/
- [Official / LlamaIndex] Agentic RAG architecture guide: https://www.llamaindex.ai/blog/agentic-rag-with-llamaindex-2721b8a49ff6
- [Official / Microsoft] AutoGen stable documentation: https://microsoft.github.io/autogen/stable//index.html
- [Official / Microsoft] Microsoft Agent Framework overview: https://learn.microsoft.com/en-us/agent-framework/overview/
- [Official / Microsoft Research] AutoGen project: https://www.microsoft.com/en-us/research/project/autogen/
- [Official / CrewAI] CrewAI documentation: https://docs.crewai.com/
- [Official / CrewAI] Agents: https://docs.crewai.com/en/concepts/agents
- [Official / CrewAI] Crews: https://docs.crewai.com/en/concepts/crews
- [Official / CrewAI] Flows: https://docs.crewai.com/en/concepts/flows
- [Vendor / Langfuse] AI Agent Observability, Tracing & Evaluation: https://langfuse.com/blog/2024-07-ai-agent-observability-with-langfuse
- [Community / CSDN] AI Agent 学习笔记检索入口: https://so.csdn.net/so/search?q=AI%20Agent%20%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%20RAG%20MCP
- [Community / 博客园] Agent、RAG、MCP 实践检索入口: https://zzk.cnblogs.com/s/blogpost?Keywords=AI%20Agent%20RAG%20MCP
- [Community / 掘金] AI Agent 工程化与 LangGraph 实践检索入口: https://juejin.cn/search?query=AI%20Agent%20LangGraph%20MCP%20RAG&type=0
