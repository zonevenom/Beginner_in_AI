/* 模块页 / 路线图 / 项目 / 图谱 / 资料 / 进度 */

import { page, SITE } from "./layout.mjs";
import {
  MODULES,
  STAGES,
  WEEKS,
  PROJECTS,
  MILESTONES,
  icon,
  byCode
} from "./data.mjs";
import {
  md,
  stripFirstH1,
  pickSections,
  makeResolver,
  moduleCard,
  projectCard,
  diffStars,
  chip,
  sectionHead,
  plainText
} from "./content.mjs";

const ROOT = "../";

/* --------------------------------------------------------------- helpers */

function tocFromHeadings(headings) {
  const items = headings.filter((h) => h.level === 2);
  if (!items.length) return "";
  return `<ul class="toc-list">${items
    .map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`)
    .join("")}</ul>`;
}

/* ----------------------------------------------------------- module page */

export function renderModule({ module: m, docs, quizCount, prev, next }) {
  const resolver = makeResolver(ROOT);
  const stage = STAGES.find((s) => s.id === m.stage);

  const theory = md(stripFirstH1(docs.theory), {
    root: ROOT,
    headingIdPrefix: "theory-",
    resolver
  });
  const quiz = md(stripFirstH1(docs.quiz), {
    root: ROOT,
    headingIdPrefix: "quiz-",
    resolver
  });
  const answers = md(stripFirstH1(docs.answers), {
    root: ROOT,
    headingIdPrefix: "answers-",
    resolver
  });
  const project = md(stripFirstH1(docs.project), {
    root: ROOT,
    headingIdPrefix: "project-",
    resolver
  });

  const tabs = [
    { id: "panel-theory", label: "理论讲稿", count: "1" },
    { id: "panel-quiz", label: "练习题", count: String(quizCount) },
    { id: "panel-answers", label: "答案解析", count: String(quizCount) },
    { id: "panel-project", label: "项目计划书", count: m.projectCode }
  ];

  const tabBar = `<div class="tabs" role="tablist" aria-label="模块内容" data-tabs>
    ${tabs
      .map(
        (t, i) => `<button class="tab" role="tab" id="tab-${t.id}" aria-controls="${t.id}"
      aria-selected="${i === 0 ? "true" : "false"}" tabindex="${i === 0 ? 0 : -1}">
      ${t.label}<i>${t.count}</i></button>`
      )
      .join("")}
  </div>`;

  const toc = `<aside class="doc-sidebar" aria-label="本页目录">
    <div class="toc-title">本页导航</div>
    <div class="toc-group" data-toc-group="panel-theory">${tocFromHeadings(theory.headings)}</div>
    <div class="toc-group" data-toc-group="panel-quiz" hidden>${tocFromHeadings(quiz.headings)}</div>
    <div class="toc-group" data-toc-group="panel-answers" hidden>${tocFromHeadings(answers.headings)}</div>
    <div class="toc-group" data-toc-group="panel-project" hidden>${tocFromHeadings(project.headings)}</div>
    <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line)">
      <a class="btn btn--ghost btn--sm" href="../progress.html" style="width:100%;justify-content:center">去打卡 ${icon("check", { size: 13 })}</a>
    </div>
  </aside>`;

  const panels = `
  <div class="tab-panel" id="panel-theory" role="tabpanel" aria-labelledby="tab-panel-theory">
    <div class="prose">${theory.html}</div>
  </div>
  <div class="tab-panel" id="panel-quiz" role="tabpanel" aria-labelledby="tab-panel-quiz" hidden>
    <div class="callout" style="margin-bottom:22px">
      <strong>先做，再看解析。</strong> 题目按「概念 / 代码 / 动手」三类排列，建议用时：概念题 3 分钟，代码题 10 分钟，动手题 30 分钟。
      做完再去下一个标签页对答案，否则等于没做。
    </div>
    <div class="prose exercise-doc">${quiz.html}</div>
  </div>
  <div class="tab-panel" id="panel-answers" role="tabpanel" aria-labelledby="tab-panel-answers" hidden>
    <div class="prose">${answers.html}</div>
  </div>
  <div class="tab-panel" id="panel-project" role="tabpanel" aria-labelledby="tab-panel-project" hidden>
    <div class="callout" style="margin-bottom:22px">
      <strong>${m.projectCode} 项目计划书 · ${m.deliverables[0]}</strong><br>
      按「目标 → 代码 → 为什么 → 怎么验证」一步步敲。卡住的地方，才是真正学到的地方。
    </div>
    <div class="prose">${project.html}</div>
  </div>`;

  const pager = `<nav class="module-pager" aria-label="模块切换">
    ${
      prev
        ? `<a class="pager-link" href="${prev.slug}.html"><span>← 上一模块</span><b>${prev.code} · ${prev.short}</b></a>`
        : `<a class="pager-link" href="../modules.html"><span>← 返回</span><b>全部模块</b></a>`
    }
    ${
      next
        ? `<a class="pager-link pager-link--next" href="${next.slug}.html"><span>下一模块 →</span><b>${next.code} · ${next.short}</b></a>`
        : `<a class="pager-link pager-link--next" href="../projects.html"><span>继续 →</span><b>项目总览</b></a>`
    }
  </nav>`;

  const content = `<section class="module-hero">
    <div class="module-hero__glow" aria-hidden="true"></div>
    <div class="container">
      <div class="module-hero__top">
        <a class="chip chip--outline" href="../modules.html">${icon("arrowLeft", { size: 11 })} 全部模块</a>
        <span class="module-hero__code">${m.code}<span>MODULE 0${m.stage === 0 ? "" : MODULES.indexOf(m) + 1}</span></span>
        <span class="chip">${m.weeks}</span>
        <span class="chip chip--accent" style="--accent:${stage.accent}">阶段 0${stage.id} · ${stage.name}</span>
      </div>
      <div class="module-hero__inner">
        <div>
          <h1>${m.title}</h1>
          <p class="module-hero__sub">${m.tagline} ${m.goal}</p>
          <div class="module-hero__facts">
            <span class="chip chip--outline">理论讲稿</span>
            <span class="chip chip--outline">${quizCount} 道练习 + 解析</span>
            <span class="chip chip--outline">${m.projectCode} 项目</span>
            <span class="chip chip--accent" style="--accent:${m.accent}">交付 · ${m.deliverables[0]}</span>
          </div>
        </div>
        <div class="module-hero__icon" aria-hidden="true">${icon(m.icon, { size: 84 })}</div>
      </div>
    </div>
  </section>
  <div class="container">
    <div class="doc-layout">
      ${toc}
      <div class="doc-main">
        ${tabBar}
        ${panels}
        ${pager}
      </div>
    </div>
  </div>`;

  return page({
    root: ROOT,
    active: "modules",
    title: `${m.code} ${m.short}`,
    description: `${m.code} ${m.title}：${m.tagline} 含理论讲稿、${quizCount} 道练习题与解析、${m.projectCode} 项目计划书。`,
    accent: m.accent,
    accentInk: m.accentInk,
    content
  });
}

/* --------------------------------------------------------------- roadmap */

function weekList(items) {
  return `<div class="week-list">${items
    .map((w) => {
      const m = byCode(w.module);
      return `<div class="week-item" style="--accent:${m.accent}">
      <div class="week-num">W${String(w.n).padStart(2, "0")}</div>
      <div class="week-mod">
        <a class="chip chip--accent" style="--accent:${m.accent}" href="modules/${m.slug}.html">${m.code}</a>
      </div>
      <div class="week-task">
        <p>${w.weekend}</p>
        <small><span class="week-task__tag">平日</span>${w.daily}</small>
      </div>
      <div class="week-out">
        <span>本周产出</span>
        <b>${w.output}</b>
      </div>
    </div>`;
    })
    .join("")}</div>`;
}

export function renderRoadmap({ planDoc, readme }) {
  const resolver = makeResolver("");
  const timeSection = md(
    pickSections(planDoc, ["时间怎么分", "每周的固定动作", "考核标准", "断档了怎么办", "16 周后"]),
    { root: "", headingIdPrefix: "plan-", resolver }
  );
  const accounts = md(pickSections(readme, ["账号准备清单"]), {
    root: "",
    headingIdPrefix: "acc-",
    resolver
  });

  const stageBlocks = STAGES.map((stage) => {
    const weeks = WEEKS.filter(
      (w) => w.n >= stage.weeks[0] && w.n <= stage.weeks[1]
    );
    return `<section class="stage-block" id="stage-${stage.id}" style="--accent:${stage.accent}">
      <div class="stage-block__head">
        <div class="stage-block__num">阶段 0${stage.id} · ${stage.en} · W${stage.weeks[0]}–W${stage.weeks[1]}</div>
        <h2>${stage.name}</h2>
        <p>${stage.desc}</p>
        <div class="stage-block__meta">
          ${stage.modules
            .map((c) => {
              const m = byCode(c);
              return `<a class="chip" href="modules/${m.slug}.html">${m.code} ${m.short}</a>`;
            })
            .join("")}
          <span class="chip">${weeks.length} 周</span>
        </div>
      </div>
      ${weekList(weeks)}
    </section>`;
  }).join("");

  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">roadmap / 16 weeks</span>
          <h1>16 周排期，<br>周末啃硬骨头</h1>
          <p class="lead">只有周末能集中学、平时零散，所以：周末啃硬骨头，平日只做「轻动作」。一周真实投入约 5 小时，16 周约 80 小时。</p>
        </div>
        <div class="page-head__meta">
          <div><b>4</b>个阶段</div>
          <div><b>16</b>周课表</div>
          <div><b>≈5h</b>每周投入</div>
        </div>
      </div>
    </div>
  </section>
  <div class="container">
    <div class="stage-stack">${stageBlocks}</div>
  </div>
  <section class="section">
    <div class="container">
      <div class="doc-main prose" style="max-width:900px">${timeSection.html}</div>
    </div>
  </section>
  <section class="section section--line">
    <div class="container">
      ${sectionHead({
        eyebrow: "before you start",
        title: "开工前：账号与工具清单",
        lead: "现在只看，别急着注册。需要安装软件 / 申请账号的动作，到 M0 那一步再决定。"
      })}
      <div class="prose">${accounts.html}</div>
    </div>
  </section>`;

  return page({
    root: "",
    active: "roadmap",
    title: "16 周路线图",
    description:
      "16 周 · 周末制的大模型应用开发排期：4 个阶段、16 周课表、每周固定动作、模块考核标准与断档后的弹性规则。",
    content
  });
}

/* -------------------------------------------------------------- projects */

export function renderProjects({ overviewDoc }) {
  const resolver = makeResolver("");
  const extra = md(
    pickSections(overviewDoc, ["标准结构", "四条纪律", "抄参考项目"]),
    { root: "", headingIdPrefix: "proj-", resolver }
  );

  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">projects / 8</span>
          <h1>8 个项目，<br>串成你的作品集</h1>
          <p class="lead">项目不是「学完再做」，是「边做边学」。卡住的地方，才是真正学到的地方。每个模块配 1 个项目，8 个串起来就是 16 周后的作品集。</p>
        </div>
        <div class="page-head__meta">
          <div><b>8</b>个项目</div>
          <div><b>P5–P8</b>简历主力</div>
          <div><b>3</b>件交付物</div>
        </div>
      </div>
    </div>
  </section>
  <div class="container" style="padding-bottom:40px">
    <div class="project-grid">${PROJECTS.map((p) => projectCard(p)).join("")}</div>
  </div>
  <section class="section section--tight">
    <div class="container">
      <div class="prose" style="max-width:900px">${extra.html}</div>
    </div>
  </section>`;

  return page({
    root: "",
    active: "projects",
    title: "实践项目",
    description:
      "8 个由浅入深的大模型应用项目：命令行问答、提示词实验台、带记忆的聊天助手、语义搜索器、个人文档问答、带评测的 RAG v2、多功能 Agent、部署上线。",
    content
  });
}

/* ----------------------------------------------------------------- graph */

function graphSvg() {
  const X = 190;
  const W = 380;
  const H = 66;
  const CX = X + W / 2;
  const TOP = 150;
  const GAP = 92;
  const RIGHT = X + W + 34;
  const nodes = MODULES.map((m, i) => ({ ...m, y: TOP + i * GAP, i }));
  const cy = (n) => n.y + H / 2;

  const edges = nodes
    .slice(0, -1)
    .map((n, i) => {
      const y1 = n.y + H;
      const y2 = nodes[i + 1].y;
      return `<g>
        <path d="M${CX} ${y1}V${y2 - 8}" stroke="#080b16" stroke-width="1.5" opacity=".38"/>
        <path d="m${CX - 4.5} ${y2 - 10} 4.5 6 4.5-6" fill="none" stroke="#080b16" stroke-width="1.5" opacity=".5"/>
      </g>`;
    })
    .join("");

  const stageMarks = STAGES.map((s) => {
    const first = nodes.find((n) => n.code === s.modules[0]);
    const last = nodes.find((n) => n.code === s.modules[s.modules.length - 1]);
    const y1 = cy(first) - 8;
    const y2 = cy(last) + 8;
    return `<g>
      <path d="M${X - 26} ${y1}V${y2}" stroke="${s.accent}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="${X - 26}" cy="${y1}" r="3" fill="${s.accent}"/>
      <circle cx="${X - 26}" cy="${y2}" r="3" fill="${s.accent}"/>
      <text x="${X - 40}" y="${cy(first) - 5}" text-anchor="end" style="font-size:11.5px;font-weight:700" fill="#080b16">阶段 0${s.id} · ${s.name}</text>
      <text x="${X - 40}" y="${cy(first) + 11}" text-anchor="end" class="ha-mono" style="font-size:9px;letter-spacing:.12em" fill="#626b83">W${s.weeks[0]}–W${s.weeks[1]}</text>
    </g>`;
  }).join("");

  const cards = nodes
    .map((n) => {
      const center = cy(n);
      return `<a href="modules/${n.slug}.html" class="graph-node" aria-label="${n.code} ${n.title}">
      <g>
        <rect x="${X}" y="${n.y}" width="${W}" height="${H}" rx="3" fill="#fff" stroke="#080b16" stroke-width="1.5"/>
        <rect x="${X}" y="${n.y}" width="5" height="${H}" fill="${n.accent}"/>
        <text x="${X + 20}" y="${center + 6}" class="ha-mono" style="font-size:16px;font-weight:700;letter-spacing:.02em" fill="${n.accentInk}">${n.code}</text>
        <text x="${X + 68}" y="${center - 2}" style="font-size:13.5px;font-weight:700" fill="#080b16">${n.title}</text>
        <text x="${X + 68}" y="${center + 17}" class="ha-mono" style="font-size:9px;letter-spacing:.12em" fill="#626b83">${n.weeks} · 理论 + 练习 + ${n.projectCode}</text>
        <path d="M${X + W} ${center}h16" stroke="${n.accent}" stroke-width="1.5"/>
        <circle cx="${X + W + 20}" cy="${center}" r="2.5" fill="${n.accent}"/>
        <text x="${RIGHT + 2}" y="${center - 4}" class="ha-mono" style="font-size:8.5px;letter-spacing:.16em" fill="#626b83">DELIVERABLE</text>
        <text x="${RIGHT + 2}" y="${center + 12}" style="font-size:11px" fill="#242b3f">${n.deliverables[0]}</text>
      </g>
    </a>`
    })
    .join("");

  const l0 = ["Python 够用就好", "命令行与文件", "Git 与 GitHub"]
    .map(
      (t, i) =>
        `<g><rect x="${190 + i * 125}" y="46" width="118" height="30" rx="2" fill="#f7f9fd" stroke="#ccd3e4"/>
        <text x="${249 + i * 125}" y="65" text-anchor="middle" style="font-size:10px" fill="#243b3f">${t}</text></g>`
    )
    .join("");

  const f1y = TOP + 8 * GAP + 10;
  const f1 = `<g>
    <path d="M${CX} ${nodes[7].y + H}V${f1y - 8}" stroke="#080b16" stroke-width="1.5" stroke-dasharray="4 5" opacity=".4"/>
    <rect x="${X}" y="${f1y}" width="${W}" height="54" rx="3" fill="#fff" stroke="#ccd3e4" stroke-dasharray="5 4"/>
    <text x="${X + 20}" y="${f1y + 22}" class="ha-mono" style="font-size:10px;letter-spacing:.16em" fill="#626b83">F1 · OPTIONAL</text>
    <text x="${X + 20}" y="${f1y + 41}" style="font-size:11.5px" fill="#242b3f">微调 / 本地模型（LoRA、量化、私有化部署）</text>
  </g>`;

  return `<svg class="graph-canvas" viewBox="0 0 900 ${f1y + 96}" role="img"
    aria-label="知识图谱：从 Python 地基到 M0–M7 八个模块的路线图">
    <defs>
      <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0v40" fill="none" stroke="#080b16" stroke-width="1" opacity=".035"/>
      </pattern>
      <marker id="graph-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 10 5 0 10z" fill="#080b16" opacity=".55"/>
      </marker>
    </defs>
    <rect x="0" y="0" width="900" height="${f1y + 96}" fill="url(#graph-grid)"/>
    <text x="${X - 40}" y="32" text-anchor="end" class="ha-mono" style="font-size:9.5px;letter-spacing:.16em" fill="#626b83">L0 · 地基</text>
    ${l0}
    <path d="M249 76V108H${CX}M374 76V108M499 76V108" fill="none" stroke="#080b16" stroke-width="1.2" opacity=".28"/>
    <path d="M${CX} 108V${TOP - 8}" fill="none" stroke="#080b16" stroke-width="1.2" opacity=".28" marker-end="url(#graph-arrow)"/>
    ${stageMarks}
    ${edges}
    ${cards}
    ${f1}
  </svg>`;
}

function graphList() {
  return `<div class="graph-list">${MODULES.map((m) => {
    const stage = STAGES.find((s) => s.id === m.stage);
    return `<a class="graph-list__item" href="modules/${m.slug}.html" style="--accent:${m.accent}">
      <span class="graph-list__code">${m.code}</span>
      <span>
        <b>${m.title}</b>
        <small>${stage.name} · ${m.weeks} · ${m.projectCode}</small>
      </span>
      ${icon("arrow", { size: 14 })}
    </a>`;
  }).join("")}</div>`;
}

export function renderGraph({ graphDoc }) {
  const resolver = makeResolver("");
  const sections = md(
    pickSections(graphDoc, ["每个模块的内部结构", "能力地图", "三条学习主线", "资料对应速查"]),
    { root: "", headingIdPrefix: "graph-", resolver }
  );

  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">knowledge graph</span>
          <h1>这 16 周，<br>要爬几座山</h1>
          <p class="lead">图是给你「看清全貌」的，不用背。看不懂术语没关系，学到对应模块自然会懂。每学完一个模块，回来看一眼：我现在站在哪一格？</p>
        </div>
        <div class="page-head__meta">
          <div><b>5</b>层能力</div>
          <div><b>8</b>个模块</div>
          <div><b>1</b>条主线</div>
        </div>
      </div>
    </div>
  </section>
  <div class="container" style="padding-bottom:36px">
    <div class="graph-wrap">
      <div class="graph-legend">
        <span class="graph-legend__item"><i style="background:#080b16"></i>实线 = 学习顺序</span>
        <span class="graph-legend__item"><i style="background:transparent;border:1px dashed #080b16"></i>虚线 = 选修 / 地基</span>
        <span class="graph-legend__item">点击模块卡片直达内容</span>
      </div>
      ${graphSvg()}
      ${graphList()}
    </div>
    <div class="split" style="margin-top:28px">
      <div class="law-card">
        <span class="law-card__num">DATA FLOW</span>
        <h3>按「数据流」理解</h3>
        <p>用户输入 → 提示词拼装 → 模型生成 → 后处理 → 返回。<br>RAG 是在链条中间插了「检索」，Agent 是插了「调工具」。</p>
      </div>
      <div class="law-card">
        <span class="law-card__num">FAILURE MODE</span>
        <h3>按「出错方式」理解</h3>
        <p>不知道 → 要 RAG；不会算 / 不能操作 → 要工具；不听话 → 要提示工程；太贵太慢 → 要工程优化。</p>
      </div>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="prose" style="max-width:900px">${sections.html}</div>
    </div>
  </section>`;

  return page({
    root: "",
    active: "graph",
    title: "知识图谱",
    description:
      "16 周学习路线的知识图谱：Python 地基、M0–M7 八个模块的学习顺序与依赖关系、每个模块能干什么、三条学习主线。",
    content
  });
}

/* ------------------------------------------------------------- resources */

export function renderResources({ resources, compareDoc, indexDoc }) {
  const resolver = makeResolver("");
  const groups = [
    { key: "book", label: "PDF 电子书", note: "系统打底、当字典查", icon: "book" },
    { key: "web", label: "网页 / 在线文档", note: "查手册、看官方示例", icon: "bookmark" },
    { key: "repo", label: "GitHub 仓库", note: "抄结构、找项目灵感", icon: "github" }
  ];

  const cards = groups
    .map((g) => {
      const items = resources.filter((r) => r.kind === g.key);
      return `<div class="res-group">
        <div class="res-group__head">
          <span class="res-group__title">${icon(g.icon, { size: 16 })} ${g.label}</span>
          <span class="res-group__note">${g.note}</span>
          <span class="chip">${items.length} 份</span>
        </div>
        <div class="res-grid">
          ${items
            .map(
              (r) => `<a class="res-card" href="${r.url}" target="_blank" rel="noopener">
            <div class="res-card__top">
              <span class="res-tag">${r.tag}</span>
              <span class="res-code">${r.code}</span>
            </div>
            <h3>${r.title}</h3>
            <p>${r.excerpt}</p>
            <div class="res-card__foot">
              <span class="res-mods">${r.modules.map((c) => `<span class="chip chip--outline">${c}</span>`).join("")}</span>
              <span class="res-go">访问 ${icon("external", { size: 11 })}</span>
            </div>
          </a>`
            )
            .join("")}
        </div>
      </div>`;
    })
    .join("");

  const compare = md(pickSections(compareDoc, ["按模块查", "该停"]), {
    root: "",
    headingIdPrefix: "res-",
    resolver
  });
  const discipline = md(pickSections(indexDoc, ["三类资料怎么分工", "英文资料", "使用纪律"]), {
    root: "",
    headingIdPrefix: "res-",
    resolver
  });

  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">resources / 15</span>
          <h1>资料是出处，<br>不是必读</h1>
          <p class="lead">你的主教材是理论区的讲稿。这里的链接只用来溯源和深挖：卡住时查一处，查完立刻回讲稿。</p>
        </div>
        <div class="page-head__meta">
          <div><b>3</b>本电子书</div>
          <div><b>6</b>个网页文档</div>
          <div><b>6</b>个仓库</div>
        </div>
      </div>
    </div>
  </section>
  <div class="container" style="padding-bottom:24px">
    <div class="callout" style="margin-bottom:26px">
      <strong>三条纪律：</strong>不要收藏了就当学了；不要同时开三份资料；GitHub 仓库不要 clone 一堆——每个模块最多看 1 个仓库的 README。
    </div>
    ${cards}
  </div>
  <section class="section section--tight">
    <div class="container">
      ${sectionHead({
        eyebrow: "deep dive / 15",
        title: "每份资料：看什么、跳过什么",
        lead: "展开任意一份，能看到这本书 / 这个仓库具体该读哪几章、什么该跳过——这些是「用法说明」，不是摘要。"
      })}
      ${resources
        .map(
          (r) => `<details class="res-detail">
        <summary>
          <span class="res-tag">${r.tag}</span>
          <h3>${r.code} · ${r.title}</h3>
          <span class="res-detail__meta">${r.modules.join(" / ")} · ${r.host}</span>
        </summary>
        <div class="res-detail__body">
          <div class="prose">${r.body}</div>
          <a class="res-detail__link" href="${r.url}" target="_blank" rel="noopener">打开原文 ${icon("external", { size: 12 })}</a>
        </div>
      </details>`
        )
        .join("")}
    </div>
  </section>
  <section class="section section--tight">
    <div class="container">
      <div class="prose" style="max-width:900px">${compare.html}</div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: "how to read",
        title: "三类资料怎么分工",
        lead: "PDF 强在体系、网页强在最新、仓库强在真实工程。用错场景，就是自找劝退。"
      })}
      <div class="prose" style="max-width:900px">${discipline.html}</div>
    </div>
  </section>`;

  return page({
    root: "",
    active: "resources",
    title: "学习资料",
    description:
      "15 份学习资料的用法与出处：3 本中文 PDF 电子书、6 个官方网页文档、6 个 GitHub 参考仓库，以及「这周该翻哪份」的对照表。",
    content
  });
}

/* -------------------------------------------------------------- progress */

export function renderProgress() {
  const rows = MODULES.map((m) => {
    const checks = [
      ["theory", "理论"],
      ["quiz", "练习"],
      ["project", "项目"],
      ["explain", "能讲"]
    ];
    return `<div class="board-row">
      <div class="board-row__name"><i>${m.code}</i>${m.short}</div>
      ${checks
        .map(
          ([k, label]) => `<label class="check">
        <input type="checkbox" data-key="${m.slug}-${k}" data-group="${k}" aria-label="${m.code} ${label}">
        <span class="check__box" aria-hidden="true"></span>
        <span>${label}</span>
      </label>`
        )
        .join("")}
      <input type="date" data-date="date-${m.slug}" aria-label="${m.code} 完成日期">
    </div>`;
  }).join("");

  const milestoneItems = MILESTONES.map(
    (t, i) => `<li class="milestone">
      <span class="idx">${String(i + 1).padStart(2, "0")}</span>
      <label class="check">
        <input type="checkbox" data-key="milestone-${i}" data-group="milestone" aria-label="${t}">
        <span class="check__box" aria-hidden="true"></span>
        <span>${t}</span>
      </label>
    </li>`
  ).join("");

  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">progress board</span>
          <h1>看得见的进度，<br>才是坚持的动力</h1>
          <p class="lead">每周日晚上花 10 分钟打勾。记录保存在你自己的浏览器里（localStorage），不上传、不联网——换设备就会重新开始。</p>
        </div>
        <div class="page-head__meta">
          <div><b data-pct>0%</b>总体进度</div>
          <div><b data-count="all">0/40</b>已完成项</div>
        </div>
      </div>
    </div>
  </section>
  <div class="container">
    <div class="board" data-progress-board>
      <div class="board-head">
        <h2>模块打卡</h2>
        <span class="progress-note">本地保存 · 不上传</span>
        <button class="reset-btn" type="button" data-reset>清空记录</button>
      </div>
      <div class="overall">
        <div class="overall__row">
          <span>理论讲稿 <b data-count="theory">0/8</b></span>
          <div class="bar"><i data-bar="theory"></i></div>
          <span></span>
        </div>
        <div class="overall__row">
          <span>练习题 <b data-count="quiz">0/8</b></span>
          <div class="bar"><i data-bar="quiz"></i></div>
          <span></span>
        </div>
        <div class="overall__row">
          <span>项目实践 <b data-count="project">0/8</b></span>
          <div class="bar"><i data-bar="project"></i></div>
          <span></span>
        </div>
        <div class="overall__row">
          <span>能讲给外行听 <b data-count="explain">0/8</b></span>
          <div class="bar"><i data-bar="explain"></i></div>
          <span></span>
        </div>
      </div>
      <div class="board-row board-row--head">
        <span>模块</span><span>理论</span><span>练习</span><span>项目</span><span>能讲</span><span>完成日期</span>
      </div>
      ${rows}
    </div>

    <div class="section section--tight" style="padding-inline:0">
      <span class="eyebrow">milestones</span>
      <h2 style="font-size:clamp(24px,3vw,34px);margin:12px 0 18px">里程碑：到了就奖励自己</h2>
      <ul class="milestones">${milestoneItems}</ul>
    </div>

    <div class="split" style="margin-bottom:60px">
      <div class="panel">
        <span class="eyebrow">module gate</span>
        <h3 style="font-size:20px;margin:10px 0 10px">模块过了才算过</h3>
        <p style="font-size:13.5px;color:var(--muted);line-height:1.75">
          理论：不看讲稿能用自己的话讲给外行听 3 分钟。<br>
          练习：5 题里至少 4 题独立做对，错题能说出错在哪一步。<br>
          项目：代码能跑，能解释关键行为什么这么写，故意改坏能自己修回来。
        </p>
      </div>
      <div class="panel">
        <span class="eyebrow">if you fall behind</span>
        <h3 style="font-size:20px;margin:10px 0 10px">断档了怎么办</h3>
        <p style="font-size:13.5px;color:var(--muted);line-height:1.75">
          只完成一半 → 剩余并入下周，砍掉「进阶」部分。<br>
          连续两周没动 → 别从头再来，先花 30 分钟把上次的代码跑一遍，跑通即恢复。<br>
          学不懂 → 跳到项目，先做出来再回头理解。
        </p>
      </div>
    </div>
  </div>`;

  return page({
    root: "",
    active: "progress",
    title: "学习进度看板",
    description:
      "16 周学习计划的进度看板：按模块打卡理论 / 练习 / 项目 / 能讲给外行听，统计总体完成度与里程碑。",
    content
  });
}
