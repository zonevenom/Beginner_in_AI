# 仓库05 · openai/openai-cookbook

- **仓库**：https://github.com/openai/openai-cookbook
- **类型**：官方示例代码集
- **语言**：英文（代码为主，注释不多）
- **对应模块**：M1、M2、M6
- **能抄什么**：**工业级的"怎么调"最佳实践**

---

## 它是什么

OpenAI 官方维护的"食谱"：一堆可以直接抄的示例，告诉你"做某件事的标准写法是什么"。

它不教你原理，只告诉你**别人生产环境里怎么写的**。所以它是"照着做"的资料，不是"读懂"的资料。

---

## 你只需要看这几个例子

| 例子 | 讲什么 | 对应 |
|---|---|---|
| How to count tokens | 怎么数 token、估算成本 | M2 成本控制 |
| How to format inputs to ChatGPT models | messages 数组怎么拼 | M2 |
| How to use chat completions with streaming | 流式输出 | M2 |
| Structured outputs / JSON mode | 让模型稳定输出 JSON | M1 理论 6 |
| Function calling | 工具调用 | M6 |
| RAG 相关示例 | 检索 + 生成的最小实现 | M4 |

**跳过**：微调、图像、语音、Assistants API（这些要么用不上，要么 OpenAI 专属）。

---

## 为什么英文资料也给你

因为**这是全网质量最高的"标准写法"**。你不需要读它的文字，只需要看代码块——变量名、函数签名、异常处理，这些是通用语言。

我的讲稿会把每个例子的关键点用中文讲清楚，你只需要在写代码时回来对照。

---

## 注意

- 它假设你用 OpenAI 的 SDK。你用 DeepSeek 时，`from openai import OpenAI` 一样能用，只要改 `base_url`——**这就是"兼容 OpenAI 格式"的好处**。
- 部分例子用了较新的 API（如 Responses API），如果你装的 SDK 版本老，会报错。**报错就看版本，别硬改。**
