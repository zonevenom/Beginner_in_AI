/* 站点构建：读取 source/ 下的原始 Markdown，生成纯静态站点 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, MODULES, PROJECTS } from "./data.mjs";
import { renderMarkdown } from "./md.mjs";
import { SITE_URL } from "./layout.mjs";
import { renderHome, renderModules, render404 } from "./pages-home.mjs";
import {
  renderModule,
  renderRoadmap,
  renderProjects,
  renderGraph,
  renderResources,
  renderProgress
} from "./pages-doc.mjs";
import { readTitle, plainText } from "./content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = ROOT;

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const write = (rel, html) => {
  const abs = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, html, "utf8");
  return html.length;
};

const problems = [];
const pages = [];

function build() {
  const t0 = Date.now();

  /* ------------------------------------------------------------ module docs */
  const moduleDocs = new Map();
  MODULES.forEach((m) => {
    const files = {
      theory: m.theory,
      quiz: path.join(m.quizDir, "01_题目.md"),
      answers: path.join(m.quizDir, "02_答案与解析.md"),
      project: m.project
    };
    const docs = {};
    Object.entries(files).forEach(([key, file]) => {
      if (!exists(file)) {
        problems.push(`缺少文件：${file}（${m.code} ${key}）`);
        docs[key] = "";
        return;
      }
      docs[key] = read(file);
    });
    const quizCount = (docs.quiz.match(/^##\s+.*第\s*\d+\s*题/gm) || []).length || 6;
    moduleDocs.set(m.slug, { docs, quizCount });
  });

  /* --------------------------------------------------------------- pages */
  write("index.html", renderHome());
  pages.push({ u: "index.html", t: "首页", k: "page", p: "BEGINNER_IN_AI" });

  write("modules.html", renderModules());
  pages.push({ u: "modules.html", t: "模块总览", k: "page", p: "8 个模块" });

  const planDoc = read("source/00_知识图谱总览区/01_学习计划总表.md");
  const readme = read("source/README.md");
  write("roadmap.html", renderRoadmap({ planDoc, readme }));
  pages.push({ u: "roadmap.html", t: "16 周路线图", k: "page", p: "排期" });

  const overviewDoc = read("source/04_实践项目区/00_项目总览.md");
  write("projects.html", renderProjects({ overviewDoc }));
  pages.push({ u: "projects.html", t: "实践项目", k: "page", p: "8 个项目" });

  const graphDoc = read("source/00_知识图谱总览区/00_知识图谱.md");
  write("graph.html", renderGraph({ graphDoc }));
  pages.push({ u: "graph.html", t: "知识图谱", k: "page", p: "全局地图" });

  const resources = collectResources();
  const compareDoc = read("source/01_学习资料区/04_资料与阶段对照表.md");
  const indexDoc = read("source/01_学习资料区/00_资料总索引.md");
  write("resources.html", renderResources({ resources, compareDoc, indexDoc }));
  pages.push({ u: "resources.html", t: "学习资料", k: "page", p: "15 份资料" });

  write("progress.html", renderProgress());
  pages.push({ u: "progress.html", t: "学习进度看板", k: "page", p: "打卡" });

  write("404.html", render404());

  /* ---------------------------------------------------------- module pages */
  MODULES.forEach((m, i) => {
    const { docs, quizCount } = moduleDocs.get(m.slug);
    const html = renderModule({
      module: m,
      docs,
      quizCount,
      prev: MODULES[i - 1],
      next: MODULES[i + 1]
    });
    write(`modules/${m.slug}.html`, html);
    pages.push({
      u: `modules/${m.slug}.html`,
      t: `${m.code} ${m.short}`,
      k: "module",
      p: m.weeks
    });

    /* 搜索索引：每个二级标题一条 */
    [
      ["theory", "讲稿"],
      ["quiz", "练习"],
      ["answers", "解析"],
      ["project", "项目"]
    ].forEach(([key, label]) => {
      const doc = docs[key];
      if (!doc) return;
      const { headings } = renderMarkdown(doc, { headingIdPrefix: key + "-" });
      headings
        .filter((h) => h.level === 2)
        .forEach((h) => {
          pages.push({
            u: `modules/${m.slug}.html#${h.id}`,
            t: h.text,
            k: label,
            p: `${m.code} · ${m.short}`,
            text: ""
          });
        });
    });
  });

  /* ------------------------------------------------------------ search.json */
  const search = pages.map((p) => ({
    t: p.t,
    k: p.k,
    u: p.u,
    p: p.p,
    kind: p.k === "page" ? "page" : "doc",
    text: p.text || ""
  }));
  write("assets/search.json", JSON.stringify(search));

  /* --------------------------------------------------------------- extras */
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  "index.html",
  "modules.html",
  "roadmap.html",
  "projects.html",
  "graph.html",
  "resources.html",
  "progress.html",
  ...MODULES.map((m) => `modules/${m.slug}.html`)
]
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}${u.replace("index.html", "")}</loc><changefreq>monthly</changefreq></url>`
  )
  .join("\n")}
</urlset>
`
  );
  write(
    "robots.txt",
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`
  );

  const ms = Date.now() - t0;
  console.log(`✔ 构建完成 ${ms}ms`);
  console.log(`  页面 ${pages.length} 条索引 / ${MODULES.length + 8} 个 HTML`);
  if (problems.length) {
    console.log("\n⚠ 问题：");
    problems.forEach((p) => console.log("  - " + p));
    process.exitCode = 1;
  }
}

/* ------------------------------------------------------------- resources */

function collectResources() {
  const groups = [
    { dir: "source/01_学习资料区/01_pdf电子书", kind: "book", tag: "PDF", prefix: "书" },
    { dir: "source/01_学习资料区/02_网页", kind: "web", tag: "WEB", prefix: "网页" },
    { dir: "source/01_学习资料区/03_github库", kind: "repo", tag: "REPO", prefix: "仓库" }
  ];
  const out = [];
  for (const g of groups) {
    if (!exists(g.dir)) {
      problems.push(`资料目录不存在：${g.dir}`);
      continue;
    }
    const files = fs
      .readdirSync(path.join(ROOT, g.dir))
      .filter((f) => f.endsWith(".md") && !f.startsWith("00_"))
      .sort();
    for (const f of files) {
      const src = read(path.join(g.dir, f));
      const rawTitle = readTitle(src).replace(/^#\s*/, "");
      const codeMatch = rawTitle.match(new RegExp(`^${g.prefix}(\\d+)`));
      const code = codeMatch ? g.prefix + codeMatch[1] : "";
      const title = rawTitle.replace(new RegExp(`^${g.prefix}\\d+\\s*[·.]?\\s*`), "").trim();
      const urlLine =
        src.match(/\*\*(?:链接|仓库|在线阅读)[^*]*\*\*[：:]\s*(https?:\/\/\S+)/) ||
        src.match(/(https?:\/\/[^\s)]+)/);
      const url = urlLine ? urlLine[1].replace(/[）)，。]+$/, "") : "#";
      const modLine = src.match(/\*\*对应模块\*\*[：:]\s*(.+)/);
      const modules = modLine
        ? (modLine[1].match(/M\d/g) || []).filter((v, i, a) => a.indexOf(v) === i)
        : [];
      out.push({
        kind: g.kind,
        tag: g.tag,
        code,
        title: title || rawTitle,
        url,
        modules,
        excerpt: excerptOf(src)
      });
      if (url === "#") problems.push(`未能解析链接：${f}`);
    }
  }
  return out;
}

function excerptOf(src) {
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("#")) continue;
    if (line.startsWith(">")) continue;
    if (/^[-*]\s/.test(line)) continue;
    if (/^-{3,}$/.test(line)) continue;
    if (/^\|/.test(line)) continue;
    const text = line
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*`_]/g, "")
      .trim();
    if (text.length > 24) {
      return text.length > 118 ? text.slice(0, 116) + "…" : text;
    }
  }
  return "查看原文与用法说明。";
}

build();
