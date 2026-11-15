/* 内容层小工具：markdown 渲染封装 / 链接改写 / 章节拆分 / 通用卡片 */

import { renderMarkdown } from "./md.mjs";
import { MODULES, PROJECTS, icon, byCode } from "./data.mjs";

const MODULE_BY_NUM = MODULES.reduce((acc, m) => {
  acc[m.code.slice(1)] = m;
  return acc;
}, {});

export const readTitle = (md) => {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
};

export function stripFirstH1(md) {
  return md.replace(/^\s*#\s+.*(?:\r?\n)+/, "");
}

/** 拆分一级章节（## 标题） */
export function splitSections(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = { title: "", md: "" };
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (current.title || current.md.trim()) sections.push(current);
      current = { title: m[1].trim(), md: "" };
    } else {
      current.md += line + "\n";
    }
  }
  if (current.title || current.md.trim()) sections.push(current);
  return sections;
}

export function pickSections(md, matchList) {
  const sections = splitSections(md);
  const picked = [];
  for (const matcher of matchList) {
    const found = sections.find((s) =>
      typeof matcher === "string" ? s.title.includes(matcher) : matcher.test(s.title)
    );
    if (found) picked.push(`## ${found.title}\n${found.md}`);
  }
  return picked.length ? picked.join("\n\n") : md;
}

/** 把 markdown 里的站内路径改写成站点路由 */
export function makeResolver(root = "") {
  return (href, kind) => {
    if (!href) return null;
    if (/^(https?:)?\/\//i.test(href)) return href;
    if (href.startsWith("mailto:")) return href;
    if (kind === "image") return null;
    if (href.startsWith("#")) return href;
    const clean = href.split("#")[0];
    if (/知识图谱\.html$/.test(clean)) return root + "graph.html";

    const modDir = clean.match(/M(\d)_/);
    if (modDir && MODULE_BY_NUM[modDir[1]]) {
      const mod = MODULE_BY_NUM[modDir[1]];
      let panel = "panel-theory";
      if (/03_练习题目区/.test(clean)) panel = "panel-quiz";
      if (/04_实践项目区/.test(clean)) panel = "panel-project";
      if (/02_理论讲解区/.test(clean)) panel = "panel-theory";
      return `${root}modules/${mod.slug}.html#${panel}`;
    }

    const projDir = clean.match(/P(\d)_/);
    if (projDir && MODULES[Number(projDir[1]) - 1]) {
      return `${root}modules/${MODULES[Number(projDir[1]) - 1].slug}.html#panel-project`;
    }

    if (/^README\.md$/i.test(clean) || /^\.\.\//.test(clean)) return null;
    // 站点内部相对文件不存在，一律降级为纯文本，避免死链
    return null;
  };
}

export function md(markdown, { root = "", headingIdPrefix = "", resolver } = {}) {
  return renderMarkdown(markdown, {
    headingIdPrefix,
    linkResolver: resolver || makeResolver(root)
  });
}

/** 粗略清洗 markdown 供搜索索引使用 */
export function plainText(markdown, limit = 240) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*_`~|]/g, " ")
    .replace(/^\s*[-+]\s+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, limit);
}

/* ------------------------------------------------------------------ cards */

export function moduleCard(m, { root = "", stageLabel = "" } = {}) {
  return `<a class="module-card" href="${root}modules/${m.slug}.html"
    style="--accent:${m.accent}">
  <div class="module-index">
    <div class="module-code">${m.code.slice(0, 1)}<span>${m.code.slice(1)}</span></div>
    <div class="module-weeks">${m.weeks}</div>
  </div>
  <div class="module-body">
    <h3 class="module-title">${m.title}</h3>
    <p class="module-desc">${m.tagline}</p>
    <div class="module-facts">
      <span class="chip chip--accent" style="--accent:${m.accent}">${m.projectCode} 项目</span>
      ${stageLabel ? `<span class="chip chip--outline">${stageLabel}</span>` : ""}
      <span class="chip chip--outline">理论 + 练习 + 项目</span>
    </div>
  </div>
  <span class="module-arrow">${icon("arrow", { size: 14 })}</span>
</a>`;
}

export function diffStars(n, accent) {
  const stars = "★".repeat(n) + "☆".repeat(5 - n);
  return `<span class="diff" style="--accent:${accent || "#00d5e8"}" aria-label="难度 ${n} / 5">${stars}</span>`;
}

export function projectCard(p, { root = "", accent } = {}) {
  const m = byCode(p.module);
  const color = accent || (m ? m.accent : "#00d5e8");
  return `<a class="project-card" href="${root}modules/${m.slug}.html#panel-project" style="--accent:${color}">
  <div class="project-card__top">
    <span>${p.code}</span>
    <span class="chip chip--outline">${p.module}</span>
    ${diffStars(p.diff, color)}
  </div>
  <h3>${p.name}</h3>
  <p>${p.output}</p>
  <div class="project-card__foot">
    <span class="chip chip--outline">简历价值 · ${p.resume}</span>
    <span class="chip" style="margin-left:auto">看计划书 ${icon("arrow", { size: 12 })}</span>
  </div>
</a>`;
}

export function zoneCard(z, { root = "" } = {}) {
  return `<a class="zone-card" href="${root}${z.href}" style="--accent:${z.accent}">
  <span class="zone-num">${z.num} / ${icon(z.icon, { size: 13 })}</span>
  <h3>${z.name}</h3>
  <p>${z.desc}</p>
  <span class="zone-card__go">${z.linkText} ${icon("arrow", { size: 12 })}</span>
</a>`;
}

export function chip(text, kind = "", style = "") {
  return `<span class="chip${kind ? " chip--" + kind : ""}"${style ? ` style="${style}"` : ""}>${text}</span>`;
}

export function ticker(items) {
  const group = `<div class="ticker-group">${items
    .map((t) => `<span class="ticker-item">${t}</span>`)
    .join("")}</div>`;
  return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${group}${group}</div></div>`;
}

export function sectionHead({ eyebrow, title, lead, side = "" }) {
  return `<div class="section-head">
  <div>
    <span class="eyebrow">${eyebrow}</span>
    <h2>${title}</h2>
  </div>
  <div class="section-head__side">
    ${lead ? `<p class="lead">${lead}</p>` : ""}
    ${side}
  </div>
</div>`;
}
