/* 首页 / 模块总览 / 404 */

import { page, heroArt, SITE } from "./layout.mjs";
import {
  MODULES,
  STAGES,
  WEEKS,
  PROJECTS,
  ZONES,
  icon,
  byCode
} from "./data.mjs";
import { moduleCard, zoneCard, projectCard, ticker, sectionHead, chip, md, stripFirstH1, makeResolver } from "./content.mjs";

const TOTAL_QUIZ = 51;

/* ------------------------------------------------------------------ home */

function homeHero() {
  return `<section class="hero">
  <div class="container hero-inner">
    <div class="hero-copy">
      <div class="hero-kicker">
        <span class="pulse-dot" aria-hidden="true"></span>
        <span class="eyebrow">16 weeks · beginner → rag / agent</span>
      </div>
      <h1 class="hero-title">
        <span class="line">16 周，</span>
        <span class="line"><span class="accent">从零</span>到</span>
        <span class="line glitch"><span class="outline">AI 应用</span></span>
      </h1>
      <p class="hero-sub">
        不啃 533 页教材，不推一个公式。每个周末 4 小时，按
        <strong>理论 → 练习 → 项目</strong> 走完 8 个模块，
        最后手里是三个能发给别人的作品：RAG 知识库、Agent 助手、部署上线的 Web 链接。
      </p>
      <div class="hero-actions">
        <a class="btn" href="modules/m0.html">开始第 1 周 ${icon("arrow", { size: 14 })}</a>
        <a class="btn btn--ghost" href="roadmap.html">看 16 周排期</a>
      </div>
      <div class="hero-meta">
        <span class="hero-meta__item"><b>8</b> 模块</span>
        <span class="hero-meta__item"><b>16</b> 周</span>
        <span class="hero-meta__item"><b>${TOTAL_QUIZ}</b> 道题</span>
        <span class="hero-meta__item"><b>8</b> 个项目</span>
        <span class="hero-meta__item"><b>≈80</b> 小时</span>
      </div>
    </div>
    ${heroArt()}
  </div>
</section>`;
}

function stats() {
  const cells = [
    { num: "8", sup: "", label: "模块 · 理论 + 练习 + 项目" },
    { num: "16", sup: "", label: "周 · 周末制，每周约 5 小时" },
    { num: String(TOTAL_QUIZ), sup: "", label: "道练习 · 全部带详细解析" },
    { num: "8", sup: "", label: "份项目计划书 · 串成作品集" }
  ];
  return `<div class="container"><div class="stat-grid">${cells
    .map(
      (c) => `<div class="stat-cell">
      <div class="stat-cell__num">${c.num}${c.sup ? `<sup>${c.sup}</sup>` : ""}</div>
      <div class="stat-cell__label">${c.label}</div>
    </div>`
    )
    .join("")}</div></div>`;
}

function zonesSection() {
  return `<section class="section" id="zones">
  <div class="container">
    ${sectionHead({
      eyebrow: "01 / the material",
      title: "五个区，一套材料",
      lead: "资料是「出处」不是「必读」；讲稿是嚼碎后的中文重写。五块拼在一起，才是一条能走完的路。"
    })}
    <div class="zone-grid">
      ${ZONES.map((z) => zoneCard(z)).join("")}
    </div>
  </div>
</section>`;
}

function modulesSection() {
  return `<section class="section section--line" id="modules">
  <div class="container">
    ${sectionHead({
      eyebrow: "02 / modules",
      title: "八个模块，八个闭环",
      lead: "每个模块都是同一个形状：先读讲稿，再做练习，最后交付一个项目。顺序反了，你只会变成「会复制代码的人」。",
      side: `<a class="btn btn--ghost btn--sm" href="modules.html">全部模块 ${icon("arrow", { size: 13 })}</a>`
    })}
    <div class="module-grid">
      ${MODULES.map((m) => moduleCard(m)).join("")}
    </div>
  </div>
</section>`;
}

function routeSection() {
  const rows = STAGES.map((s) => {
    const span = s.weeks[1] - s.weeks[0] + 1;
    const weeks = Array.from({ length: span }, (_, i) => s.weeks[0] + i);
    return `<a class="stage-row" href="roadmap.html#stage-${s.id}" style="--accent:${s.accent}">
      <div class="stage-row__num">阶段 0${s.id}</div>
      <div>
        <div class="stage-row__title">${s.name}<small>${s.en} · W${s.weeks[0]}–W${s.weeks[1]}</small></div>
      </div>
      <div class="stage-row__weeks">
        ${weeks.map((w) => `<span class="chip">W${w}</span>`).join("")}
        ${s.modules.map((c) => `<span class="chip chip--accent" style="--accent:${s.accent}">${c}</span>`).join("")}
      </div>
      <div class="stage-row__bar" style="--w:${(span / 16) * 100}%"><i></i></div>
    </a>`;
  }).join("");

  return `<section class="section" id="route">
  <div class="container">
    ${sectionHead({
      eyebrow: "03 / 16-week route",
      title: "按阶段推进，别跳级",
      lead: "四个阶段，每阶段都有明确的「过了才算过」的标准。M4 和 M6 不能跳，它们是面试硬通货。",
      side: `<a class="btn btn--ghost btn--sm" href="roadmap.html">完整排期 ${icon("arrow", { size: 13 })}</a>`
    })}
    <div class="timeline">${rows}</div>
    <div class="stat-grid" style="margin-top:26px">
      ${[
        { t: "周六 2h", d: "读讲稿 → 做练习 → 对解析 → 抄错题" },
        { t: "周日 2h", d: "照着计划书敲代码，每 10 行跑一次" },
        { t: "平日 3×15min", d: "只做「回锅肉」：重跑、改参数、背术语" },
        { t: "周日 10min", d: "填进度看板 + 错题本加一条" }
      ]
        .map(
          (x) => `<div class="stat-cell">
          <div class="stat-cell__num" style="font-size:22px">${x.t}</div>
          <div class="stat-cell__label" style="text-transform:none;letter-spacing:0;font-family:var(--font-body);font-size:12.5px">${x.d}</div>
        </div>`
        )
        .join("")}
    </div>
  </div>
</section>`;
}

function howToSection() {
  return `<section class="section section--line" id="howto">
  <div class="container">
    <div class="split">
      <div>
        <span class="eyebrow">04 / how to use</span>
        <h2 style="font-size:clamp(28px,3.6vw,42px);margin:14px 0 18px">这份材料怎么用</h2>
        <ol class="howto">
          <li>
            <div>
              <h3>先看全貌（5 分钟）</h3>
              <p>打开 <a href="graph.html">知识图谱</a>，看清 16 周要爬几座山、模块之间谁先谁后。</p>
            </div>
          </li>
          <li>
            <div>
              <h3>找到这周的位置</h3>
              <p>在 <a href="roadmap.html">16 周排期</a> 里找到当前周，看清周末任务和本周产出。</p>
            </div>
          </li>
          <li>
            <div>
              <h3>读讲稿 → 做练习 → 对解析</h3>
              <p>从 <a href="modules/m0.html">M0</a> 开始。讲稿只读一遍，不懂的地方画问号；练习先做再看答案。</p>
            </div>
          </li>
          <li>
            <div>
              <h3>做项目，然后打卡</h3>
              <p>按计划书一步一停地敲。完成一个模块，去 <a href="progress.html">进度看板</a> 打勾——看得见的进度最管用。</p>
            </div>
          </li>
        </ol>
      </div>
      <div>
        <span class="eyebrow">three laws</span>
        <h2 style="font-size:clamp(28px,3.6vw,42px);margin:14px 0 18px">三条铁律</h2>
        <div class="law-grid" style="grid-template-columns:1fr">
          <div class="law-card">
            <span class="law-card__num">LAW 01</span>
            <h3>讲稿读不懂，再去翻原资料</h3>
            <p>原资料是「出处」，不是「必读」。你不需要把 533 页的书啃完，只需要在卡住时回查那 2 页。</p>
          </div>
          <div class="law-card">
            <span class="law-card__num">LAW 02</span>
            <h3>理论 → 练习 → 项目，顺序不能反</h3>
            <p>只听理论，一动手全懵；只做项目，换个需求就不会。练习是中间那块缓冲垫，故意设计得刚好够难。</p>
          </div>
          <div class="law-card">
            <span class="law-card__num">LAW 03</span>
            <h3>能改、能修、能解释，才算过</h3>
            <p>代码跑通不算学会。故意改坏一个地方能自己修回来，面试时能说清「每一行为什么这么写」，才算。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function projectsTeaser() {
  const picks = PROJECTS.slice(4);
  return `<section class="section" id="projects">
  <div class="container">
    ${sectionHead({
      eyebrow: "05 / portfolio",
      title: "16 周后，你手里有什么",
      lead: "不是「我学过 AI」，而是三条别人能打开、能试用、能追问的交付物。",
      side: `<a class="btn btn--ghost btn--sm" href="projects.html">全部 8 个项目 ${icon("arrow", { size: 13 })}</a>`
    })}
    <div class="project-grid">
      ${picks.map((p) => projectCard(p)).join("")}
    </div>
  </div>
</section>`;
}

function finalCta() {
  return `<section class="section section--tight">
  <div class="container">
    <div class="panel panel--ink" style="position:relative;overflow:hidden">
      <div style="display:grid;grid-template-columns:minmax(0,1.3fr) auto;gap:28px;align-items:center" class="cta-inner">
        <div>
          <span class="eyebrow" style="color:rgba(255,255,255,.6)">start here</span>
          <h2 style="font-size:clamp(26px,3.4vw,40px);margin:12px 0 10px;color:#fff">
            第 1 周，从一条 API 调用开始
          </h2>
          <p style="color:rgba(255,255,255,.72);font-size:14.5px;max-width:56ch">
            不用等「准备好」。M0 的第一讲就把大模型拆成「接话机器」，第一天的任务只有一件事：
            让模型回你一句话。
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <a class="btn btn--neon" href="modules/m0.html">进入 M0 ${icon("arrow", { size: 14 })}</a>
          <a class="btn btn--ghost" href="graph.html" style="border-color:rgba(255,255,255,.5);color:#fff">先看知识图谱</a>
        </div>
      </div>
      <div aria-hidden="true" style="position:absolute;right:-40px;bottom:-60px;width:220px;height:220px;border:1px solid rgba(255,255,255,.18);border-radius:50%"></div>
      <div aria-hidden="true" style="position:absolute;right:60px;bottom:-100px;width:220px;height:220px;border:1px solid rgba(255,255,255,.1);border-radius:50%"></div>
    </div>
  </div>
</section>`;
}

export function renderHome() {
  const content = [
    homeHero(),
    ticker([
      "16 weeks · 8 modules",
      "理论 → 练习 → 项目",
      "rag · agent · deploy",
      "周末制 · 每周约 5 小时",
      `${TOTAL_QUIZ} 道练习 · 全部带解析`,
      "8 份项目计划书",
      "从 hello_llm.py 到作品集"
    ]),
    `<div class="section section--tight" style="padding-top:0">${stats()}</div>`,
    zonesSection(),
    modulesSection(),
    routeSection(),
    howToSection(),
    projectsTeaser(),
    finalCta()
  ].join("\n");

  return page({
    root: "",
    active: "home",
    title: SITE.title,
    description: SITE.description,
    content
  });
}

/* ---------------------------------------------------------- modules index */

export function renderModules({ guides = {} } = {}) {
  const resolver = makeResolver("");
  const guideBlocks = [
    {
      key: "theory",
      title: "理论讲解区 · 导读：讲稿怎么读",
      body: guides.theory || ""
    },
    {
      key: "quiz",
      title: "练习题目区 · 使用说明：题目怎么做",
      body: guides.quiz || ""
    }
  ]
    .filter((g) => g.body)
    .map(
      (g) => `<details class="guide-detail">
      <summary>${g.title}</summary>
      <div class="guide-detail__body">
        <div class="prose">${md(stripFirstH1(g.body), {
          root: "",
          headingIdPrefix: `guide-${g.key}-`,
          resolver
        }).html}</div>
      </div>
    </details>`
    )
    .join("");

  const blocks = STAGES.map((stage) => {
    const mods = MODULES.filter((m) => m.stage === stage.id);
    return `<div class="stage-block" id="stage-${stage.id}" style="--accent:${stage.accent}">
      <div class="stage-block__head">
        <div class="stage-block__num">阶段 0${stage.id} · ${stage.en}</div>
        <h2>${stage.name}</h2>
        <p>${stage.desc}</p>
        <div class="stage-block__meta">
          <span class="chip">W${stage.weeks[0]} – W${stage.weeks[1]}</span>
          ${mods.map((m) => `<span class="chip chip--accent" style="--accent:${stage.accent}">${m.code} ${m.short}</span>`).join("")}
        </div>
      </div>
      <div class="module-grid">${mods.map((m) => moduleCard(m)).join("")}</div>
    </div>`;
  }).join("");

  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">modules / 8</span>
          <h1>八个模块，<br>一套复盘闭环</h1>
          <p class="lead">每个模块都由同一套三件套组成：理论讲稿 → 练习题（含解析）→ 项目计划书。按顺序走，每个模块约 2 周。</p>
        </div>
        <div class="page-head__meta">
          <div><b>16</b>周总周期</div>
          <div><b>${TOTAL_QUIZ}</b>道练习题</div>
          <div><b>8</b>份项目计划书</div>
        </div>
      </div>
    </div>
  </section>
  <div class="container" style="padding-bottom:80px">
    ${
      guideBlocks
        ? `<div style="margin:0 0 34px">
      <span class="eyebrow">read me first</span>
      <h2 style="font-size:clamp(20px,2.6vw,28px);margin:10px 0 16px">开始前必读</h2>
      ${guideBlocks}
    </div>`
        : ""
    }
    ${blocks}
  </div>`;

  return page({
    root: "",
    active: "modules",
    title: "模块总览",
    description: "8 个模块的完整路线：M0 环境与第一次调用、M1 提示工程、M2 对话应用、M3 语义检索、M4 RAG 核心、M5 RAG 进阶与评估、M6 Agent 与工具调用、M7 部署上线。",
    content
  });
}

/* ------------------------------------------------------------------- 404 */

export function render404() {
  const content = `<section class="page-head">
    <div class="container">
      <div class="page-head__inner">
        <div>
          <span class="eyebrow">error 404 · signal lost</span>
          <h1 style="font-size:clamp(64px,14vw,180px);line-height:.9">404</h1>
          <p class="lead" style="font-size:18px">这条路径不在路线图上。可能是链接写错了，也可能是这个模块还没写。</p>
          <div class="hero-actions">
            <a class="btn" href="index.html">回到首页 ${icon("arrow", { size: 14 })}</a>
            <a class="btn btn--ghost" href="modules.html">看看 8 个模块</a>
          </div>
        </div>
        <div class="page-head__meta">
          <div><b>404</b>not found</div>
        </div>
      </div>
    </div>
  </section>`;

  return page({
    root: "",
    active: "",
    title: "页面不存在",
    description: "这个页面不在路线图上。",
    content
  });
}
