/* 页面外壳：head / 导航 / 页脚 / 搜索浮层 / 首页插画 */

import { SITE, MODULES, icon } from "./data.mjs";

export const SITE_URL = "https://zonevenom.github.io/Beginner_in_AI/";

export { SITE };

const NAV = [
  { key: "home", label: "首页", href: "index.html" },
  { key: "modules", label: "模块", href: "modules.html" },
  { key: "roadmap", label: "路线图", href: "roadmap.html" },
  { key: "projects", label: "项目", href: "projects.html" },
  { key: "graph", label: "图谱", href: "graph.html" },
  { key: "resources", label: "资料", href: "resources.html" },
  { key: "progress", label: "进度", href: "progress.html" }
];

function head({ root, title, description, accent, accentInk, ogImage }) {
  const fullTitle = title === SITE.title ? title : `${title} · ${SITE.name}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<meta name="author" content="zonevenom">
<meta name="theme-color" content="#eef1f8">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:image" content="${SITE_URL}assets/img/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE_URL}assets/img/og-cover.png">
<link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/img/favicon.svg">
<link rel="stylesheet" href="${root}assets/css/site.css">
<link rel="stylesheet" href="${root}assets/css/content.css">
${accent ? `<style>:root{--accent:${accent};--accent-ink:${accentInk || accent}}</style>` : ""}
</head>`;
}

function header({ root, active }) {
  const links = NAV.map(
    (item) =>
      `<li><a class="nav-link" href="${root}${item.href}"${
        item.key === active ? ' aria-current="page"' : ""
      }>${item.label}</a></li>`
  ).join("");

  return `<a class="skip-link" href="#main">跳到正文</a>
<header class="site-header">
  <div class="container nav-inner">
    <a class="brand" href="${root}index.html" aria-label="${SITE.name} 首页">
      ${brandMark()}
      <span class="brand-text">
        <span class="brand-name">BEGINNER_IN_AI</span>
        <span class="brand-sub">16 weeks · llm application dev</span>
      </span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="展开导航">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="nav-links">
      ${links}
      <li><button class="search-open" type="button" data-search-open aria-label="搜索全站（Ctrl K）">
        ${icon("search", { size: 13 })}<span>搜索</span><kbd>⌘K</kbd>
      </button></li>
      <li class="nav-cta"><a class="btn btn--sm" href="${SITE.repo}" target="_blank" rel="noopener">
        ${icon("github", { size: 13, fill: true })}GitHub</a></li>
    </ul>
  </div>
</header>`;
}

export function brandMark() {
  return `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
  <path d="M20 2.6 35 11v18L20 37.4 5 29V11z" fill="#fff" stroke="#080b16" stroke-width="1.8"/>
  <path d="M20 2.6 35 11v9L20 28.6 5 20v-9z" fill="#00d5e8" opacity=".9"/>
  <path d="M35 20v9L20 37.4V28.6z" fill="#ff3d9a" opacity=".85"/>
  <path d="M13.2 24V16l6.8-3.9L26.8 16v8L20 27.9z" fill="#fff" stroke="#080b16" stroke-width="1.4"/>
  <circle cx="20" cy="20" r="2.1" fill="#080b16"/>
</svg>`;
}

function searchOverlay({ root }) {
  return `<div class="search-overlay" data-search-overlay role="dialog" aria-modal="true" aria-label="站内搜索">
  <div class="search-panel">
    <div class="search-field">
      ${icon("search", { size: 16 })}
      <input type="search" placeholder="搜索模块、概念、题目、项目…" aria-label="搜索关键词" autocomplete="off">
      <button class="search-esc" type="button" data-search-close>ESC</button>
    </div>
    <ul class="search-results" data-search-results></ul>
    <p class="search-empty" hidden>没有匹配结果，换个关键词试试。</p>
  </div>
</div>`;
}

function footer({ root }) {
  const moduleLinks = MODULES.map(
    (m) =>
      `<li><a href="${root}modules/${m.slug}.html">${m.code} · ${m.short}</a></li>`
  ).join("");

  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="${root}index.html">
          ${brandMark()}
          <span class="brand-text">
            <span class="brand-name">BEGINNER_IN_AI</span>
            <span class="brand-sub">from python basics to rag &amp; agents</span>
          </span>
        </a>
        <p>为「会一点 Python、数学基本忘光、看英文吃力、只有周末能集中学」的人准备的 16 周路线。理论 → 练习 → 项目，每个模块都走一遍。</p>
      </div>
      <div class="footer-col">
        <h4>Route</h4>
        <ul>
          <li><a href="${root}roadmap.html">16 周排期</a></li>
          <li><a href="${root}modules.html">8 个模块</a></li>
          <li><a href="${root}projects.html">8 个实践项目</a></li>
          <li><a href="${root}graph.html">知识图谱</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Modules</h4>
        <ul>${moduleLinks}</ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> ${SITE.name} · 内容来自个人学习计划，持续迭代中</span>
      <span>
        <a href="${SITE.repo}" target="_blank" rel="noopener">GitHub</a> ·
        <a href="${root}resources.html">资料出处</a> ·
        <button class="reset-btn" type="button" data-to-top>回到顶部 ↑</button>
      </span>
    </div>
  </div>
</footer>`;
}

export function page({
  root = "",
  active = "",
  title = SITE.title,
  description = SITE.description,
  accent = "",
  accentInk = "",
  bodyClass = "",
  bodyAttrs = "",
  content = "",
  scripts = ""
}) {
  return `${head({ root, title, description, accent, accentInk })}
<body${bodyClass ? ` class="${bodyClass}"` : ""} data-root="${root}"${bodyAttrs}>
${header({ root, active })}
<main id="main">
${content}
</main>
${footer({ root })}
${searchOverlay({ root })}
<script src="${root}assets/vendor/mermaid.min.js" defer></script>
<script src="${root}assets/js/site.js" defer></script>
${scripts}
</body>
</html>`;
}

/* ------------------------------------------------------------------ hero art */
export function heroArt() {
  const C = 280;
  const RING = 202;
  const nodes = MODULES.map((m, i) => {
    const angle = (-90 + i * 45) * (Math.PI / 180);
    const x = C + Math.cos(angle) * RING;
    const y = C + Math.sin(angle) * RING;
    const ix = C + Math.cos(angle) * 122;
    const iy = C + Math.sin(angle) * 122;
    const w = 58;
    const h = 27;
    return `<g class="ha-node">
      <path d="M${ix.toFixed(1)} ${iy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${m.accent}" stroke-width="1.4" opacity=".75"/>
      <circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="2.6" fill="${m.accent}"/>
      <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="3" fill="#ffffff" stroke="#080b16" stroke-width="1.5"/>
      <rect x="${(x - w / 2).toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="4" height="${h}" fill="${m.accent}"/>
      <text x="${(x + 3).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" class="ha-mono" fill="#080b16" style="font-size:11px;letter-spacing:.06em">${m.code}</text>
      <text x="${(x).toFixed(1)}" y="${(y + h / 2 + 13).toFixed(1)}" text-anchor="middle" class="ha-mono" fill="#626b83" style="font-size:8px;letter-spacing:.14em">W${m.weekFrom}</text>
    </g>`;
  }).join("");

  const ticks = Array.from({ length: 48 }, (_, i) => {
    const a = (i * 7.5 * Math.PI) / 180;
    const r1 = 240;
    const r2 = i % 4 === 0 ? 250 : 245;
    return `<path d="M${(C + Math.cos(a) * r1).toFixed(1)} ${(C + Math.sin(a) * r1).toFixed(1)}L${(C + Math.cos(a) * r2).toFixed(1)} ${(C + Math.sin(a) * r2).toFixed(1)}" stroke="#080b16" stroke-width="1" opacity="${i % 4 === 0 ? 0.32 : 0.16}"/>`;
  }).join("");

  return `<div class="hero-art hud" aria-hidden="true">
  <span class="hero-art__tag hero-art__tag--a">SYS / ROADMAP v1.0</span>
  <span class="hero-art__tag hero-art__tag--b">16 WEEKS · 8 MODULES</span>
  <svg viewBox="0 0 560 560" role="img" aria-label="八个模块围绕 AI 应用开发核心的路线图">
    <defs>
      <radialGradient id="ha-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#00d5e8" stop-opacity=".42"/>
        <stop offset="55%" stop-color="#6a4cff" stop-opacity=".14"/>
        <stop offset="100%" stop-color="#ff3d9a" stop-opacity="0"/>
      </radialGradient>
      <pattern id="ha-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M28 0H0v28" fill="none" stroke="#080b16" stroke-width="1" opacity=".055"/>
      </pattern>
      <filter id="ha-blur" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="16"/>
      </filter>
    </defs>
    <rect width="560" height="560" fill="url(#ha-grid)"/>
    <circle cx="280" cy="280" r="196" fill="url(#ha-glow)"/>
    <circle cx="280" cy="280" r="118" fill="#fff" opacity=".55" filter="url(#ha-blur)"/>
    <circle cx="280" cy="280" r="252" fill="none" stroke="#080b16" stroke-width="1" opacity=".14"/>
    <circle cx="280" cy="280" r="202" fill="none" stroke="#080b16" stroke-width="1" opacity=".22" stroke-dasharray="1 7"/>
    <circle cx="280" cy="280" r="152" fill="none" stroke="#080b16" stroke-width="1" opacity=".12"/>
    <circle cx="280" cy="280" r="96" fill="none" stroke="#080b16" stroke-width="1.2" opacity=".26"/>
    ${ticks}
    <g class="ha-spin">${Array.from(
      { length: 6 },
      (_, i) => {
        const a = (i * 60 * Math.PI) / 180;
        return `<circle cx="${(C + Math.cos(a) * 226).toFixed(1)}" cy="${(C + Math.sin(a) * 226).toFixed(1)}" r="3" fill="#080b16" opacity=".35"/>`;
      }
    ).join("")}</g>
    <path d="M280 18v44M280 498v44M18 280h44M498 280h44" stroke="#080b16" stroke-width="1" opacity=".3"/>
    <g class="ha-float">
      <path d="M280 232 322 256v48L280 328 238 304v-48z" fill="#ffffff" stroke="#080b16" stroke-width="2"/>
      <path d="M280 232 322 256v24L280 304 238 280v-24z" fill="#c9f227" opacity=".85"/>
      <path d="M322 280v24L280 328V304z" fill="#00d5e8" opacity=".9"/>
      <circle cx="280" cy="276" r="4" fill="#080b16"/>
      <text x="280" y="212" text-anchor="middle" class="ha-mono" fill="#080b16" style="font-size:9px;letter-spacing:.3em">AI CORE</text>
      <text x="280" y="352" text-anchor="middle" class="ha-mono" fill="#626b83" style="font-size:8.5px;letter-spacing:.22em">LLM APP DEV</text>
    </g>
    ${nodes}
    <path d="M28 28h20M28 28v20" fill="none" stroke="#080b16" stroke-width="2" opacity=".7"/>
    <path d="M532 28h-20M532 28v20" fill="none" stroke="#080b16" stroke-width="2" opacity=".7"/>
    <path d="M28 532h20M28 532v-20" fill="none" stroke="#080b16" stroke-width="2" opacity=".7"/>
    <path d="M532 532h-20M532 532v-20" fill="none" stroke="#080b16" stroke-width="2" opacity=".7"/>
  </svg>
</div>`;
}

/* 小工具：把一段 HTML 包成 section */
export function section(inner, { cls = "section", id = "" } = {}) {
  return `<section class="${cls}"${id ? ` id="${id}"` : ""}>
  <div class="container">${inner}</div>
</section>`;
}
