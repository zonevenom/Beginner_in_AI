# 仓库01 · datawhalechina/llm-universe

- **仓库**：https://github.com/datawhalechina/llm-universe
- **在线阅读**：https://datawhalechina.github.io/llm-universe/
- **出品**：Datawhale
- **语言**：中文
- **对应模块**：M0、M1、M2、M4、M7
- **能抄什么**：**项目目录结构**、Streamlit 界面写法、RAG 的最小实现

---

## 它是什么

"基于 LLM API 与 LangChain 的大模型应用开发教程"的配套代码仓库。教程正文是网页，这个仓库是**能跑起来的代码**。

对你最大的价值：**它不是玩具 demo，而是一个完整应用的目录结构**。你做 P5/P7 时，照它的分层方式组织文件，代码会立刻显得"专业"。

---

## 该看哪些

| 目录/文件 | 看什么 | 什么时候 |
|---|---|---|
| `README.md` | 整体目录说明 | M0 时扫一眼 |
| 前端/界面相关目录 | Streamlit 怎么组织页面 | M7 |
| 知识库/RAG 相关目录 | 文档解析、切分、入库的分层 | M4 |
| `requirements.txt` | 要装哪些库 | 装环境时对照 |

**不要看**：`docs/` 里的书稿正文（网页版更好读）、任何 `notebook` 里的长篇实验。

---

## 能抄的三个具体东西

1. **目录分层**：把"配置 / 模型调用 / 检索 / 界面"分开，别全写一个文件里。
2. **配置管理**：用 `.env` + 一个 `config.py`，而不是把 key 写在代码里。
3. **异常处理**：看它怎么处理"API 超时""key 无效"。

---

## 注意

- 它用的 LangChain 版本可能较老，直接 `pip install -r requirements.txt` 常常装出一堆冲突。**别整包安装**，用到哪个装哪个。
- 它的代码是"教学代码"，命名和结构偏简单，实际项目要更严谨——但作为起点足够了。
