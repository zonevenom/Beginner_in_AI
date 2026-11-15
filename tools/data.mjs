/* 站点数据：模块 / 项目 / 阶段 / 图标 / 小工具 */

export const SITE = {
  name: "Beginner_in_AI",
  title: "Beginner in AI · 16 周大模型应用开发路线",
  subtitle: "从会一点 Python 到能交付 RAG 与 Agent",
  repo: "https://github.com/zonevenom/Beginner_in_AI",
  description:
    "一份为「会一点 Python、数学基本忘光、看英文吃力、只有周末能集中学」的人定制的 16 周大模型应用开发学习计划：8 个模块、8 个实践项目、理论 / 练习 / 项目三件套。"
};

export const MODULES = [
  {
    code: "M0",
    slug: "m0",
    stage: 1,
    title: "开局：把电脑变成 AI 工作台",
    short: "开局",
    weeks: "第 1–2 周",
    weekFrom: 1,
    weekTo: 2,
    accent: "#00d5e8",
    accentInk: "#00707d",
    icon: "terminal",
    tagline: "装好环境，写下人生第一行调用大模型的代码。",
    goal: "跑通第一次 API 调用，看懂返回的每个字段。",
    deliverables: ["P1 命令行问答工具"],
    theory: "source/02_理论讲解区/M0_开局_环境与第一次调用/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M0_开局_环境与第一次调用",
    project: "source/04_实践项目区/P1_命令行AI问答工具/00_项目计划书.md",
    projectCode: "P1"
  },
  {
    code: "M1",
    slug: "m1",
    stage: 1,
    title: "提示工程：怎么跟模型说话",
    short: "提示工程",
    weeks: "第 3–4 周",
    weekFrom: 3,
    weekTo: 4,
    accent: "#ff3d9a",
    accentInk: "#b8005f",
    icon: "message",
    tagline: "学会「怎么说话」，让模型稳定输出你要的东西。",
    goal: "写出稳定输出的提示词，让模型按 JSON 格式回答。",
    deliverables: ["P2 提示词实验台"],
    theory: "source/02_理论讲解区/M1_提示工程_怎么跟模型说话/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M1_提示工程_怎么跟模型说话",
    project: "source/04_实践项目区/P2_提示词实验台/00_项目计划书.md",
    projectCode: "P2"
  },
  {
    code: "M2",
    slug: "m2",
    stage: 2,
    title: "对话应用工程",
    short: "对话应用",
    weeks: "第 5–6 周",
    weekFrom: 5,
    weekTo: 6,
    accent: "#6a4cff",
    accentInk: "#4a2bd6",
    icon: "chat",
    tagline: "做出会流式输出、记得上下文的聊天助手。",
    goal: "做出有上下文记忆的聊天界面，并能控制成本。",
    deliverables: ["P3 带记忆的聊天助手"],
    theory: "source/02_理论讲解区/M2_对话应用工程/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M2_对话应用工程",
    project: "source/04_实践项目区/P3_带记忆的聊天助手/00_项目计划书.md",
    projectCode: "P3"
  },
  {
    code: "M3",
    slug: "m3",
    stage: 2,
    title: "语义检索",
    short: "语义检索",
    weeks: "第 7–8 周",
    weekFrom: 7,
    weekTo: 8,
    accent: "#b9e012",
    accentInk: "#4f6b00",
    icon: "vector",
    tagline: "让电脑「按意思」找东西，而不是按关键词。",
    goal: "用向量把「意思相近」的文本找出来。",
    deliverables: ["P4 语义搜索器"],
    theory: "source/02_理论讲解区/M3_语义检索/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M3_语义检索",
    project: "source/04_实践项目区/P4_语义搜索器/00_项目计划书.md",
    projectCode: "P4"
  },
  {
    code: "M4",
    slug: "m4",
    stage: 2,
    title: "RAG 核心",
    short: "RAG 核心",
    weeks: "第 9–10 周",
    weekFrom: 9,
    weekTo: 10,
    accent: "#ff6b35",
    accentInk: "#a5330c",
    icon: "layers",
    tagline: "让你的文档变成可以提问的知识库。",
    goal: "把一堆 PDF 变成能问答的知识库，答案带出处。",
    deliverables: ["P5 个人文档问答机器人 v1"],
    theory: "source/02_理论讲解区/M4_RAG核心/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M4_RAG核心",
    project: "source/04_实践项目区/P5_个人文档问答机器人/00_项目计划书.md",
    projectCode: "P5"
  },
  {
    code: "M5",
    slug: "m5",
    stage: 3,
    title: "RAG 进阶与评估",
    short: "RAG 进阶",
    weeks: "第 11–12 周",
    weekFrom: 11,
    weekTo: 12,
    accent: "#00c2a8",
    accentInk: "#00736a",
    icon: "gauge",
    tagline: "检索变准、答案可评估、不再胡说。",
    goal: "说清楚「我的 RAG 准确率是多少」，并优化它。",
    deliverables: ["P6 带评测的 RAG v2"],
    theory: "source/02_理论讲解区/M5_RAG进阶与评估/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M5_RAG进阶与评估",
    project: "source/04_实践项目区/P6_带评测的RAG_v2/00_项目计划书.md",
    projectCode: "P6"
  },
  {
    code: "M6",
    slug: "m6",
    stage: 3,
    title: "Agent 与工具调用",
    short: "Agent",
    weeks: "第 13–14 周",
    weekFrom: 13,
    weekTo: 14,
    accent: "#2f6bff",
    accentInk: "#1a45c8",
    icon: "bot",
    tagline: "让模型自己决定「该用哪个工具」。",
    goal: "让模型自己调工具、分步骤完成任务。",
    deliverables: ["P7 多功能 Agent"],
    theory: "source/02_理论讲解区/M6_Agent与工具调用/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M6_Agent与工具调用",
    project: "source/04_实践项目区/P7_多功能Agent/00_项目计划书.md",
    projectCode: "P7"
  },
  {
    code: "M7",
    slug: "m7",
    stage: 4,
    title: "部署上线",
    short: "部署上线",
    weeks: "第 15–16 周",
    weekFrom: 15,
    weekTo: 16,
    accent: "#ffb020",
    accentInk: "#8a5300",
    icon: "rocket",
    tagline: "部署、打包、写进简历——把作品交到别人手里。",
    goal: "部署成链接发给别人用，写进简历。",
    deliverables: ["P8 部署好的网页链接"],
    theory: "source/02_理论讲解区/M7_部署上线/00_理论讲稿.md",
    quizDir: "source/03_练习题目区/M7_部署上线",
    project: "source/04_实践项目区/P8_部署上线/00_项目计划书.md",
    projectCode: "P8"
  }
];

export const STAGES = [
  {
    id: 1,
    name: "能跑起来",
    en: "BOOT",
    weeks: [1, 4],
    accent: "#00d5e8",
    desc: "装环境、调通 API、学会怎么跟模型说话。这一阶段的目标只有一个：让代码跑起来。",
    modules: ["M0", "M1"]
  },
  {
    id: 2,
    name: "会做产品",
    en: "BUILD",
    weeks: [5, 10],
    accent: "#6a4cff",
    desc: "对话、向量、RAG。从「能收到回复」走到「能对着自己的文档提问」。",
    modules: ["M2", "M3", "M4"]
  },
  {
    id: 3,
    name: "做好",
    en: "TUNE",
    weeks: [11, 14],
    accent: "#00c2a8",
    desc: "让检索更准、让答案可量化、让模型自己调工具。这一阶段决定面试时你有没有话说。",
    modules: ["M5", "M6"]
  },
  {
    id: 4,
    name: "交付",
    en: "SHIP",
    weeks: [15, 16],
    accent: "#ffb020",
    desc: "界面、接口、部署、作品集。把「我做过」变成一条别人能打开的链接。",
    modules: ["M7"]
  }
];

/* 16 周课表：与 source/00_知识图谱总览区/01_学习计划总表.md 一致 */
export const WEEKS = [
  { n: 1, module: "M0", weekend: "装 Python 环境、跑通第一次 API 调用（理论 1.1–1.3 + 练习 1–3）", daily: "每天读 10 分钟讲稿，把不懂的词圈出来", output: "一个能跑通的 hello_llm.py" },
  { n: 2, module: "M0", weekend: "讲完理论 1.4、做完练习 4–6、开始 P1 项目", daily: "改 hello_llm.py 里的 temperature，观察输出变化", output: "P1 命令行问答工具 v1" },
  { n: 3, module: "M1", weekend: "提示工程四要素、few-shot、结构化输出（理论全部 + 练习 1–4）", daily: "每天用「角色+任务+格式+约束」重写一句你平时问 AI 的话", output: "一份 10 条的提示词卡片" },
  { n: 4, module: "M1", weekend: "JSON 输出 + 提示注入 + 做完练习 5–7、做 P2", daily: "用 P2 对比两种提示词，记下差异", output: "P2 提示词实验台" },
  { n: 5, module: "M2", weekend: "流式输出原理、多轮对话消息数组（理论 2.1–2.2）", daily: "观察 ChatGPT 打字机效果，想「它为什么不一次给完」", output: "理解 messages 结构" },
  { n: 6, module: "M2", weekend: "上下文窗口、截断策略、成本控制；做 P3", daily: "给你的聊天助手加一句 system，看风格变化", output: "P3 带记忆的聊天助手" },
  { n: 7, module: "M3", weekend: "向量与相似度直觉、Embedding 调用（理论 3.1–3.2）", daily: "用一句话找同义句，人工感受「语义相似」", output: "能把句子变成一串数字" },
  { n: 8, module: "M3", weekend: "向量库（Chroma）增删改查；做 P4", daily: "给向量库加 5 条你自己的笔记", output: "P4 语义搜索器" },
  { n: 9, module: "M4", weekend: "RAG 全景：切分→检索→拼提示→生成→引用（理论 4.1–4.3）", daily: "手写一遍「检索到的片段怎么塞进提示词」", output: "画得出 RAG 数据流" },
  { n: 10, module: "M4", weekend: "做 P5：PDF → 切片 → 入库 → 问答 → 显示出处", daily: "换一本你自己的 PDF 试试", output: "P5 个人文档问答机器人 v1" },
  { n: 11, module: "M5", weekend: "检索为什么会错：切分粒度、混合检索、重排（理论 5.1–5.2）", daily: "故意问一个库里没有的问题，看它是否承认「不知道」", output: "列出 5 个失败案例" },
  { n: 12, module: "M5", weekend: "搭 20 条评测集、算命中率；做 P6 升级", daily: "每周给你的 RAG 打一次分", output: "P6 带评测的 RAG v2" },
  { n: 13, module: "M6", weekend: "工具调用原理（JSON Schema / function calling）、ReAct（理论 6.1–6.2）", daily: "想 3 个「模型自己算不对但工具能算对」的例子", output: "一个能算数的工具" },
  { n: 14, module: "M6", weekend: "多工具 + 失败重试 + 防死循环；做 P7", daily: "观察 Agent 调用顺序日志", output: "P7 多功能 Agent" },
  { n: 15, module: "M7", weekend: "Web 界面（Streamlit）+ 接口（FastAPI）+ 密钥管理", daily: "把应用发给一个朋友试用，收集 3 条吐槽", output: "能打开的网页版" },
  { n: 16, module: "M7", weekend: "部署、README、演示视频、简历三句话；做 P8", daily: "回看 16 周错题本", output: "作品集（3 个项目）" }
];

export const PROJECTS = [
  { code: "P1", name: "命令行 AI 问答工具「小助」", module: "M0", diff: 1, output: "一个能在终端聊天的脚本", resume: "低（练习用）" },
  { code: "P2", name: "提示词实验台", module: "M1", diff: 2, output: "能对比、能打分的小工具", resume: "中" },
  { code: "P3", name: "带记忆的聊天助手（Web）", module: "M2", diff: 2, output: "网页版聊天界面", resume: "中" },
  { code: "P4", name: "语义搜索器", module: "M3", diff: 2, output: "按「意思」找内容的搜索", resume: "中" },
  { code: "P5", name: "个人文档问答机器人 v1", module: "M4", diff: 3, output: "能对着你的 PDF 提问", resume: "高" },
  { code: "P6", name: "带评测的 RAG v2", module: "M5", diff: 4, output: "有准确率数字的系统", resume: "很高" },
  { code: "P7", name: "多功能 Agent", module: "M6", diff: 4, output: "会自己调工具的助手", resume: "很高" },
  { code: "P8", name: "部署上线的完整应用", module: "M7", diff: 5, output: "一个能发给别人的链接", resume: "很高" }
];

export const MILESTONES = [
  "第一次成功调用 API，看到模型回话",
  "第一次让模型稳定输出 JSON",
  "第一次做出能连续对话的界面",
  "第一次用向量找到「意思相近」的句子",
  "第一次让 RAG 答对并给出正确出处",
  "第一次算出一个数字（比如「命中率 75%」）而不是「感觉还行」",
  "第一次让模型自己选工具完成任务",
  "第一次把链接发给别人，对方能打开"
];

export const ZONES = [
  {
    num: "01",
    name: "知识图谱总览区",
    desc: "全局地图、16 周排期、进度勾选。每周开始前 5 分钟用。",
    href: "graph.html",
    linkText: "看地图",
    accent: "#00d5e8",
    icon: "map"
  },
  {
    num: "02",
    name: "学习资料区",
    desc: "PDF 电子书 / 网页 / GitHub 库的链接与用法。想查原文时用。",
    href: "resources.html",
    linkText: "查资料",
    accent: "#ff3d9a",
    icon: "book"
  },
  {
    num: "03",
    name: "理论讲解区",
    desc: "把多份资料嚼碎后用大白话重写的中文讲稿，每模块一份。",
    href: "modules/m0.html#panel-theory",
    linkText: "读讲稿",
    accent: "#6a4cff",
    icon: "layers"
  },
  {
    num: "04",
    name: "练习题目区",
    desc: "每模块 5–8 题 + 详细解析，概念 / 代码 / 动手三类。",
    href: "modules/m0.html#panel-quiz",
    linkText: "做题",
    accent: "#b9e012",
    icon: "target"
  },
  {
    num: "05",
    name: "实践项目区",
    desc: "每模块一份完整项目计划书 + 代码骨架，串起来就是作品集。",
    href: "projects.html",
    linkText: "做项目",
    accent: "#ff6b35",
    icon: "rocket"
  }
];

/* ---------------------------------------------------------------- icons */
const ICONS = {
  terminal:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3.2 3L7 15"/><path d="M13 15h4"/>',
  message:
    '<path d="M4 5h16v11h-8l-5 4v-4H4z"/><path d="M8 9h8M8 12.5h5"/>',
  chat:
    '<path d="M3 4.5h12v8H8.5L4.5 15v-2.5H3z"/><path d="M9 15.5h8l3 2.5v-9.5h-4"/>',
  vector:
    '<circle cx="5" cy="12" r="2.4"/><circle cx="19" cy="5" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M7.3 10.9 16.7 6.1M7.3 13.1l9.4 4.8"/>',
  layers:
    '<path d="m12 3 9 4.5-9 4.5L3 7.5z"/><path d="m3 12.4 9 4.5 9-4.5"/><path d="m3 16.9 9 4.5 9-4.5"/>',
  gauge:
    '<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 14.5 4.2-4.2"/><circle cx="12" cy="15" r="1.3"/>',
  bot:
    '<rect x="4" y="8" width="16" height="11" rx="2.5"/><path d="M12 4.5V8M8.5 13h.01M15.5 13h.01M9.5 16.2h5"/><circle cx="12" cy="3.2" r="1.2"/>',
  rocket:
    '<path d="M12 2.8c3 2.6 4.4 6 4.4 9.6L12 17l-4.4-4.6C7.6 8.8 9 5.4 12 2.8Z"/><path d="M9.2 16.4 6.4 20l3.6-.9M14.8 16.4 17.6 20l-3.6-.9"/><circle cx="12" cy="9" r="1.6"/>',
  map:
    '<path d="M9 4 3 6.6v13.8L9 17.8l6 2.4 6-2.4V4.2l-6 2.4z"/><path d="M9 4v13.8M15 6.6v13.6"/>',
  book:
    '<path d="M4 4.5h6a2.5 2.5 0 0 1 2.5 2.5v13A2 2 0 0 0 10.5 18H4z"/><path d="M20 4.5h-4.5A2.5 2.5 0 0 0 13 7v13a2 2 0 0 1 2-2h5z"/>',
  grid:
    '<rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/>',
  target:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  chart:
    '<path d="M4 20V4M4 20h16"/><path d="M8.5 16.5v-4M12.5 16.5V8M16.5 16.5V11"/>',
  arrow: '<path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5"/>',
  arrowLeft: '<path d="M20 12H5M10.5 6.5 5 12l5.5 5.5"/>',
  external: '<path d="M14 4h6v6M20 4l-8.2 8.2M18.5 14v5.5h-14v-14H10"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.4 4.4"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  spark:
    '<path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21M6 6l3.2 3.2M14.8 14.8 18 18M18 6l-3.2 3.2M9.2 14.8 6 18"/>',
  github:
    '<path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0C18 4.7 19 5 19 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.4 3.1 7.9 7.5 9.3 4.4-1.4 7.5-4.9 7.5-9.3V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 4 2 4H5"/>',
  bolt: '<path d="M13 2 5 13h5.5L10 22l8-11h-5.5z"/>',
  code: '<path d="m9 7-5 5 5 5M15 7l5 5-5 5"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M15 9V5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H9"/>',
  download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/>',
  compass:
    '<circle cx="12" cy="12" r="8.5"/><path d="m15.2 8.8-2 6.4-6.4 2 2-6.4z"/>',
  bookmark: '<path d="M6 3.5h12v17l-6-4.2-6 4.2z"/>'
};

export function icon(name, { size = 24, cls = "", fill = false } = {}) {
  const body = ICONS[name] || ICONS.spark;
  const attrs = fill
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" ${attrs} aria-hidden="true" focusable="false">${body}</svg>`;
}

export const bySlug = (slug) => MODULES.find((m) => m.slug === slug);
export const byCode = (code) => MODULES.find((m) => m.code === code);
export const stageOf = (module) => STAGES.find((s) => s.id === module.stage);
