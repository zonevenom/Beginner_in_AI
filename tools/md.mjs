/**
 * md.mjs —— 零依赖 Markdown → HTML 渲染器（中文学习站专用）
 *
 * 只实现 docs 里用到的 GFM 子集：标题 / 段落 / 代码块 / 表格 / 列表 /
 * 引用 / 分隔线 / 常用行内语法。所有文本输出都经过转义，代码高亮采用
 * 「扫描原始字符串 + 逐段转义」的方式，避免二次正则破坏实体。
 */

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** HTML 转义（文本与属性通用） */
export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** 生成锚点 id：小写拉丁、保留 CJK、空白/下划线转 -、标点剔除、合并 - */
export function slugify(s) {
  if (s == null) return '';
  let out = '';
  for (const ch of String(s).toLowerCase()) {
    if (ch === '-' || ch === '_' || /\s/u.test(ch)) out += '-';
    else if (/[\p{L}\p{N}]/u.test(ch)) out += ch;
    else out += '';
  }
  return out.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

/* ------------------------------------------------------------------ */
/* 预处理                                                              */
/* ------------------------------------------------------------------ */

function normalizeSource(src) {
  let s = String(src == null ? '' : src);
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return s.replace(/\r\n?/g, '\n');
}

const OPEN_FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;

/** 去掉单独成行的 HTML 注释；代码块内容保持原样 */
function stripBlockComments(source) {
  const lines = source.split('\n');
  const out = [];
  let fence = null; // { char, len }
  let inComment = false;

  for (const line of lines) {
    if (inComment) {
      const end = line.indexOf('-->');
      if (end < 0) continue;
      inComment = false;
      const rest = line.slice(end + 3);
      if (rest.trim()) out.push(rest);
      continue;
    }
    if (fence) {
      const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
      if (close && close[1][0] === fence.char && close[1].length >= fence.len) fence = null;
      out.push(line);
      continue;
    }
    const open = OPEN_FENCE.exec(line);
    if (open) {
      fence = { char: open[1][0], len: open[1].length };
      out.push(line);
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      const start = line.indexOf('<!--');
      const end = line.indexOf('-->', start + 4);
      if (end < 0) {
        inComment = true;
        const before = line.slice(0, start);
        if (before.trim()) out.push(before);
        continue;
      }
      const cleaned = line.slice(0, start) + line.slice(end + 3);
      if (cleaned.trim()) out.push(cleaned);
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

/* ------------------------------------------------------------------ */
/* 行内渲染                                                            */
/* ------------------------------------------------------------------ */

const ESCAPABLE = /[\\`*_{}\[\]()#+\-.!|>~]/;
const CJK_CHAR = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/gu;

function runLength(text, start, ch) {
  let k = start;
  while (text[k] === ch) k += 1;
  return k - start;
}

function findCodeClose(text, from, run) {
  const needle = '`'.repeat(run);
  let idx = text.indexOf(needle, from);
  while (idx >= 0) {
    if (text[idx + run] !== '`' || text[idx - 1] !== '`') return idx;
    idx = text.indexOf(needle, idx + run);
  }
  return -1;
}

function resolveHref(ctx, href, kind) {
  const fn = ctx.options.linkResolver;
  if (typeof fn !== 'function') return href;
  const resolved = fn(href, kind);
  if (resolved === null || resolved === undefined) return null;
  return String(resolved);
}

function anchorHtml(href, label, title) {
  const attrs = [`href="${escapeHtml(href)}"`];
  if (title != null) attrs.push(`title="${escapeHtml(title)}"`);
  if (/^https?:\/\//i.test(href)) attrs.push('target="_blank" rel="noopener"');
  return `<a ${attrs.join(' ')}>${label}</a>`;
}

function renderLink(link, ctx) {
  const href = resolveHref(ctx, link.href, 'link');
  if (href === null) return escapeHtml(stripInlineMarkdown(link.text));
  return anchorHtml(href, renderInline(link.text, ctx), link.title);
}

function renderImage(link, ctx) {
  const href = resolveHref(ctx, link.href, 'image');
  if (href === null) return escapeHtml(link.text);
  const attrs = [`src="${escapeHtml(href)}"`, `alt="${escapeHtml(link.text)}"`];
  if (link.title != null) attrs.push(`title="${escapeHtml(link.title)}"`);
  attrs.push('loading="lazy"');
  return `<img ${attrs.join(' ')}>`;
}

function renderAutoLink(raw, ctx) {
  const display = raw.replace(/^mailto:/i, '');
  const href = resolveHref(ctx, raw, 'link');
  if (href === null) return escapeHtml(display);
  return anchorHtml(href, escapeHtml(display), null);
}

function renderBareLink(url, ctx) {
  const href = resolveHref(ctx, url, 'link');
  if (href === null) return escapeHtml(url);
  return anchorHtml(href, escapeHtml(url), null);
}

function parseDestination(raw) {
  let s = raw.trim();
  let href = '';
  let title = null;
  if (s.startsWith('<')) {
    const gt = s.indexOf('>');
    if (gt > 0) {
      href = s.slice(1, gt);
      s = s.slice(gt + 1).trim();
    }
  } else {
    const m = /^(\S*)([\s\S]*)$/.exec(s);
    href = m[1] || '';
    s = (m[2] || '').trim();
  }
  if (s) {
    const t = /^(?:"([\s\S]*)"|'([\s\S]*)'|\(([\s\S]*)\))$/.exec(s);
    if (t) title = t[1] !== undefined ? t[1] : t[2] !== undefined ? t[2] : t[3];
  }
  return { href, title };
}

/** 解析 [文字](地址 "标题") —— openIdx 指向 '[' */
function parseInlineLink(text, openIdx) {
  if (text[openIdx] !== '[') return null;
  let depth = 0;
  let close = -1;
  for (let i = openIdx; i < text.length; i += 1) {
    const c = text[i];
    if (c === '\\') {
      i += 1;
      continue;
    }
    if (c === '[') depth += 1;
    else if (c === ']') {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close < 0 || text[close + 1] !== '(') return null;
  let pdepth = 0;
  let end = -1;
  for (let i = close + 1; i < text.length; i += 1) {
    const c = text[i];
    if (c === '\\') {
      i += 1;
      continue;
    }
    if (c === '(') pdepth += 1;
    else if (c === ')') {
      pdepth -= 1;
      if (pdepth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return null;
  const dest = parseDestination(text.slice(close + 2, end));
  return {
    text: text.slice(openIdx + 1, close),
    href: dest.href,
    title: dest.title,
    end: end + 1,
  };
}

/** 解析强调。返回 { html, end } 或 null */
function parseEmphasis(text, i, ch, ctx) {
  if (ch === '*') {
    if (text[i + 1] === '*') {
      const close = text.indexOf('**', i + 2);
      if (close > i + 2) {
        return {
          html: `<strong>${renderInline(text.slice(i + 2, close), ctx)}</strong>`,
          end: close + 2,
        };
      }
      return null;
    }
    if (text[i + 1] === '*' || /\s/.test(text[i + 1] || '')) return null;
    let close = i + 1;
    while (close < text.length) {
      close = text.indexOf('*', close);
      if (close < 0) return null;
      const prev = text[close - 1] || '';
      const next = text[close + 1] || '';
      if (prev !== '*' && next !== '*' && !/\s/.test(prev) && close > i + 1) {
        return {
          html: `<em>${renderInline(text.slice(i + 1, close), ctx)}</em>`,
          end: close + 1,
        };
      }
      close += 1;
    }
    return null;
  }

  // 下划线强调：避免把 snake_case 里的 _ 当成标记
  const before = i === 0 ? '' : text[i - 1];
  if (/[A-Za-z0-9]/.test(before)) return null;

  if (text[i + 1] === '_') {
    if (/\s/.test(text[i + 2] || '')) return null;
    let close = i + 2;
    while (close < text.length) {
      close = text.indexOf('__', close);
      if (close < 0) return null;
      const after = text[close + 2] || '';
      if (!/[A-Za-z0-9]/.test(after) && close > i + 2) {
        return {
          html: `<strong>${renderInline(text.slice(i + 2, close), ctx)}</strong>`,
          end: close + 2,
        };
      }
      close += 1;
    }
    return null;
  }

  if (/\s/.test(text[i + 1] || '')) return null;
  let close = i + 1;
  while (close < text.length) {
    close = text.indexOf('_', close);
    if (close < 0) return null;
    const after = text[close + 1] || '';
    const prev = text[close - 1] || '';
    if (text[close + 1] !== '_' && !/[A-Za-z0-9]/.test(after) && !/\s/.test(prev) && close > i + 1) {
      return {
        html: `<em>${renderInline(text.slice(i + 1, close), ctx)}</em>`,
        end: close + 1,
      };
    }
    close += 1;
  }
  return null;
}

function isUrlBoundary(prev) {
  return prev === '' || /[\s(（\[【「『：:，,、；;—–-]/.test(prev);
}

function renderInline(text, ctx) {
  let out = '';
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (ch === '\\' && i + 1 < n && ESCAPABLE.test(text[i + 1])) {
      out += escapeHtml(text[i + 1]);
      i += 2;
      continue;
    }

    if (ch === '`') {
      const run = runLength(text, i, '`');
      const close = findCodeClose(text, i + run, run);
      if (close >= 0) {
        let code = text.slice(i + run, close);
        if (code.length >= 2 && code[0] === ' ' && code[code.length - 1] === ' ' && code.trim() !== '') {
          code = code.slice(1, -1);
        }
        out += `<code>${escapeHtml(code.replace(/\n/g, ' '))}</code>`;
        i = close + run;
        continue;
      }
      out += '`';
      i += 1;
      continue;
    }

    if (ch === '!' && text[i + 1] === '[') {
      const img = parseInlineLink(text, i + 1);
      if (img) {
        out += renderImage(img, ctx);
        i = img.end;
        continue;
      }
      out += '!';
      i += 1;
      continue;
    }

    if (ch === '[') {
      const link = parseInlineLink(text, i);
      if (link) {
        out += renderLink(link, ctx);
        i = link.end;
        continue;
      }
      out += '[';
      i += 1;
      continue;
    }

    if (ch === '<') {
      const br = /^<br\s*\/?>/i.exec(text.slice(i, i + 8));
      if (br) {
        out += '<br>';
        i += br[0].length;
        continue;
      }
      if (text.startsWith('<!--', i)) {
        const end = text.indexOf('-->', i + 4);
        i = end < 0 ? n : end + 3;
        continue;
      }
      const auto = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>/i.exec(text.slice(i));
      if (auto) {
        out += renderAutoLink(auto[1], ctx);
        i += auto[0].length;
        continue;
      }
      out += '&lt;';
      i += 1;
      continue;
    }

    if (ch === '&') {
      out += '&amp;';
      i += 1;
      continue;
    }

    if (ch === '*' || ch === '_') {
      const emphasis = parseEmphasis(text, i, ch, ctx);
      if (emphasis) {
        out += emphasis.html;
        i = emphasis.end;
        continue;
      }
      out += escapeHtml(ch);
      i += 1;
      continue;
    }

    if (ch === '~' && text[i + 1] === '~') {
      const close = text.indexOf('~~', i + 2);
      if (close > i + 2) {
        out += `<del>${renderInline(text.slice(i + 2, close), ctx)}</del>`;
        i = close + 2;
        continue;
      }
      out += '~~';
      i += 2;
      continue;
    }

    if ((ch === 'h' || ch === 'H') && isUrlBoundary(i === 0 ? '' : text[i - 1]) && /^https?:\/\//i.test(text.slice(i, i + 8))) {
      const m = /^https?:\/\/[^\s<>"'`]+/i.exec(text.slice(i));
      if (m) {
        let url = m[0];
        const trailing = /[),.;:，。）]+$/.exec(url);
        if (trailing) url = url.slice(0, -trailing[0].length);
        if (url.length > 8) {
          out += renderBareLink(url, ctx);
          if (trailing) out += escapeHtml(trailing[0]);
          i += m[0].length;
          continue;
        }
      }
    }

    out += escapeHtml(ch);
    i += 1;
  }

  return out;
}

/** 去掉行内标记，取得纯文本（用于标题列表、alt 等） */
function stripInlineMarkdown(s) {
  let t = String(s == null ? '' : s);
  t = t.replace(/`+([^`]*)`+/g, '$1');
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/<br\s*\/?>/gi, ' ');
  t = t.replace(/<!--[\s\S]*?-->/g, '');
  t = t.replace(/<[^>]*>/g, '');
  t = t.replace(/(\*\*|__)([\s\S]*?)\1/g, '$2');
  t = t.replace(/(\*|_)([\s\S]*?)\1/g, '$2');
  t = t.replace(/~~([\s\S]*?)~~/g, '$1');
  t = t.replace(/\\([\\`*_{}\[\]()#+\-.!|>~])/g, '$1');
  return t.replace(/\s+/g, ' ').trim();
}

/* ------------------------------------------------------------------ */
/* 代码高亮                                                            */
/* ------------------------------------------------------------------ */

const PY_KEYWORDS = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' '),
);
const BASH_KEYWORDS = new Set(
  'if then else elif fi for while until do done case esac function select in time coproc'.split(' '),
);
const JS_KEYWORDS = new Set(
  'break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return static super switch this throw try typeof var void while with yield async await'.split(' '),
);
const SQL_KEYWORDS = new Set(
  'select from where insert into update delete create table drop alter add join inner left right full outer on group by order having limit offset union all distinct as and or not null is in like between exists case when then else end values set primary key foreign references index view database'.split(' '),
);
const YAML_KEYWORDS = new Set('true false null yes no on off'.split(' '));
const BOOLS = new Set(['true', 'false', 'null', 'none', 'nil', 'undefined', 'yes', 'no', 'on', 'off', 'nan']);

const LANGUAGES = {
  python: {
    line: ['#'],
    block: null,
    strings: ['"""', "'''", '"', "'"],
    keywords: PY_KEYWORDS,
    ci: false,
  },
  bash: {
    line: ['#'],
    block: null,
    strings: ['"', "'"],
    keywords: BASH_KEYWORDS,
    ci: false,
    dashOp: false,
  },
  json: {
    line: [],
    block: null,
    strings: ['"'],
    keywords: new Set(),
    ci: false,
  },
  javascript: {
    line: ['//'],
    block: ['/*', '*/'],
    strings: ['"', "'", '`'],
    keywords: JS_KEYWORDS,
    ci: false,
  },
  sql: {
    line: ['--'],
    block: ['/*', '*/'],
    strings: ["'", '"'],
    keywords: SQL_KEYWORDS,
    ci: true,
  },
  yaml: {
    line: ['#'],
    block: null,
    strings: ['"', "'"],
    keywords: YAML_KEYWORDS,
    ci: true,
    dashOp: false,
  },
};

const LANG_ALIASES = {
  py: 'python',
  python: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  bash: 'bash',
  js: 'javascript',
  javascript: 'javascript',
  json: 'json',
  sql: 'sql',
  yaml: 'yaml',
  yml: 'yaml',
};

function canonicalLang(info) {
  const raw = String(info || '').trim().split(/\s+/)[0].toLowerCase();
  if (!raw) return 'text';
  return LANG_ALIASES[raw] || raw;
}

function scanString(code, start, quote) {
  const n = code.length;
  const triple = quote.length === 3;
  let i = start + quote.length;
  while (i < n) {
    if (code[i] === '\\') {
      i += 2;
      continue;
    }
    if (code.startsWith(quote, i)) return i + quote.length;
    if (!triple && code[i] === '\n') return i; // 未闭合的普通字符串到行尾为止
    i += 1;
  }
  return n;
}

function tokenSpan(cls, raw) {
  return `<span class="${cls}">${escapeHtml(raw)}</span>`;
}

function isFunctionCall(code, from) {
  let i = from;
  while (i < code.length && (code[i] === ' ' || code[i] === '\t')) i += 1;
  return code[i] === '(';
}

/** 单遍扫描原始代码，逐段转义输出；未知语言退化为纯转义 */
function highlight(code, lang) {
  const cfg = LANGUAGES[lang];
  if (!cfg) return escapeHtml(code);

  let out = '';
  let i = 0;
  const n = code.length;

  while (i < n) {
    const ch = code[i];

    if (cfg.block && code.startsWith(cfg.block[0], i)) {
      const end = code.indexOf(cfg.block[1], i + cfg.block[0].length);
      const stop = end < 0 ? n : end + cfg.block[1].length;
      out += tokenSpan('tok-com', code.slice(i, stop));
      i = stop;
      continue;
    }

    let lineHit = null;
    for (const marker of cfg.line) {
      if (code.startsWith(marker, i)) {
        lineHit = marker;
        break;
      }
    }
    if (lineHit) {
      let end = code.indexOf('\n', i);
      if (end < 0) end = n;
      out += tokenSpan('tok-com', code.slice(i, end));
      i = end;
      continue;
    }

    let quote = null;
    for (const q of cfg.strings) {
      if (code.startsWith(q, i)) {
        quote = q;
        break;
      }
    }
    if (quote) {
      const stop = scanString(code, i, quote);
      out += tokenSpan('tok-str', code.slice(i, stop));
      i = stop;
      continue;
    }

    if (/[0-9]/.test(ch) && !/[A-Za-z_$]/.test(code[i - 1] || '')) {
      const m = /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)/.exec(
        code.slice(i),
      );
      if (m) {
        out += tokenSpan('tok-num', m[0]);
        i += m[0].length;
        continue;
      }
    }

    if (/[A-Za-z_$]/.test(ch)) {
      const word = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(code.slice(i))[0];
      const key = cfg.ci ? word.toLowerCase() : word;
      if (BOOLS.has(word.toLowerCase())) {
        // 布尔 / 空值统一走 tok-bool（True/False/None/null…）
        out += tokenSpan('tok-bool', word);
      } else if (cfg.keywords.has(key)) {
        out += tokenSpan('tok-kw', word);
      } else if (isFunctionCall(code, i + word.length)) {
        out += tokenSpan('tok-fn', word);
      } else {
        out += escapeHtml(word);
      }
      i += word.length;
      continue;
    }

    const opChars = cfg.dashOp === false ? '+-*/%=<>!&|^~?:'.replace('-', '') : '+-*/%=<>!&|^~?:';
    if (opChars.includes(ch)) {
      let run = i + 1;
      while (run < n && opChars.includes(code[run])) run += 1;
      out += tokenSpan('tok-op', code.slice(i, run));
      i = run;
      continue;
    }

    out += escapeHtml(ch);
    i += 1;
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* 块级解析                                                            */
/* ------------------------------------------------------------------ */

function renderBlocks(blocks, wrapParagraphs = true) {
  return blocks
    .map((b) => (b.kind === 'p' ? (wrapParagraphs ? `<p>${b.html}</p>` : b.html) : b.html))
    .join('\n');
}

function indentWidth(line) {
  let n = 0;
  while (line[n] === ' ' || line[n] === '\t') n += 1;
  return n;
}

function matchHeading(line) {
  const m = /^ {0,3}(#{1,6})(?:[ \t]+([\s\S]*?))?[ \t]*$/.exec(line);
  if (!m) return null;
  let content = m[2] || '';
  content = content.replace(/[ \t]+#+[ \t]*$/, '');
  return { level: m[1].length, content };
}

function matchHr(line) {
  return /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/.test(line);
}

function matchList(line) {
  const m = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+)([\s\S]*)$/.exec(line);
  if (!m) return null;
  return {
    indent: m[1].length,
    marker: m[2],
    ordered: /^\d/.test(m[2]),
    spaces: m[3].length,
    content: m[4],
  };
}

function isFenceStart(line) {
  return OPEN_FENCE.test(line);
}

function startsBlock(lines, i) {
  const line = lines[i];
  if (line.trim() === '') return true;
  if (isFenceStart(line)) return true;
  if (matchHeading(line)) return true;
  if (matchHr(line)) return true;
  if (/^ {0,3}>/.test(line)) return true;
  if (matchList(line)) return true;
  if (/^\s*<!--/.test(line)) return true;
  if (isTableStart(lines, i)) return true;
  return false;
}

/* ---------------------------- 代码块 ---------------------------- */

function parseFence(lines, start, ctx) {
  const m = OPEN_FENCE.exec(lines[start]);
  const marker = m[1][0];
  const len = m[1].length;
  const info = (m[2] || '').trim();
  const body = [];
  let i = start + 1;
  while (i < lines.length) {
    const close = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[i]);
    if (close && close[1][0] === marker && close[1].length >= len) {
      i += 1;
      break;
    }
    body.push(lines[i]);
    i += 1;
  }

  ctx.codeBlocks += 1;
  const raw = body.join('\n');
  const firstToken = info.split(/\s+/)[0] || '';

  if (firstToken.toLowerCase() === 'mermaid') {
    // mermaid 内容按原样输出（里面含 <br/> 等）
    return {
      html: `<div class="mermaid-wrap"><div class="mermaid">${raw}</div></div>`,
      next: i,
    };
  }

  const lang = canonicalLang(firstToken);
  return {
    html:
      `<figure class="code-block" data-lang="${escapeHtml(lang)}">` +
      `<figcaption><span class="code-lang">${escapeHtml(lang)}</span>` +
      `<span class="code-copy" data-copy>copy</span></figcaption>` +
      `<pre><code class="language-${escapeHtml(lang)}">${highlight(raw, lang)}</code></pre>` +
      `</figure>`,
    next: i,
  };
}

/* ---------------------------- 引用块 ---------------------------- */

function parseBlockquote(lines, start, ctx) {
  const inner = [];
  let i = start;
  while (i < lines.length) {
    const m = /^ {0,3}>[ \t]?([\s\S]*)$/.exec(lines[i]);
    if (m) {
      inner.push(m[1]);
      i += 1;
      continue;
    }
    if (lines[i].trim() === '' && i + 1 < lines.length && /^ {0,3}>/.test(lines[i + 1])) {
      inner.push('');
      i += 1;
      continue;
    }
    break;
  }
  const blocks = parseBlocks(inner, ctx);
  return {
    html: `<blockquote class="callout">\n${renderBlocks(blocks)}\n</blockquote>`,
    next: i,
  };
}

/* ---------------------------- 表格 ---------------------------- */

function hasUnescapedPipe(line) {
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '\\') {
      i += 1;
      continue;
    }
    if (line[i] === '|') return true;
  }
  return false;
}

function splitTableRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) {
    let backslashes = 0;
    for (let k = s.length - 2; k >= 0 && s[k] === '\\'; k -= 1) backslashes += 1;
    if (backslashes % 2 === 0) s = s.slice(0, -1);
  }
  const cells = [];
  let cur = '';
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === '\\' && s[i + 1] === '|') {
      cur += '|';
      i += 1;
      continue;
    }
    if (s[i] === '|') {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}

function isDelimiterRow(line) {
  if (!hasUnescapedPipe(line)) return false;
  const cells = splitTableRow(line);
  if (cells.length < 1) return false;
  return cells.every((c) => /^:?-{1,}:?$/.test(c));
}

function isTableStart(lines, i) {
  if (i + 1 >= lines.length) return false;
  if (!hasUnescapedPipe(lines[i])) return false;
  return isDelimiterRow(lines[i + 1]);
}

function parseTable(lines, start, ctx) {
  const header = splitTableRow(lines[start]);
  const align = splitTableRow(lines[start + 1]).map((c) => {
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return '';
  });

  let i = start + 2;
  const rows = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') break;
    if (!hasUnescapedPipe(line)) break;
    if (isFenceStart(line) || matchHeading(line) || matchHr(line) || /^ {0,3}>/.test(line)) break;
    rows.push(splitTableRow(line));
    i += 1;
  }

  const cellHtml = (tag, text, index) => {
    const style = align[index] ? ` style="text-align:${align[index]}"` : '';
    return `<${tag}${style}>${renderInline(text, ctx)}</${tag}>`;
  };

  const head = header.map((c, idx) => cellHtml('th', c, idx)).join('');
  const body = rows
    .map((row) => {
      const cells = header.map((_, idx) => cellHtml('td', row[idx] === undefined ? '' : row[idx], idx));
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');

  return {
    html: `<div class="table-scroll"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`,
    next: i,
  };
}

/* ---------------------------- 列表 ---------------------------- */

function renderListItem(itemLines, ctx, loose) {
  const taskMatch = /^\[([ xX])\](?:[ \t]+([\s\S]*))?$/.exec(itemLines[0] || '');
  let lines = itemLines;
  let task = null;
  if (taskMatch) {
    task = { done: taskMatch[1].toLowerCase() === 'x' };
    lines = [taskMatch[2] || '', ...itemLines.slice(1)];
  }

  const blocks = parseBlocks(lines, ctx);

  if (task) {
    const firstP = blocks.find((b) => b.kind === 'p');
    const rest = blocks.filter((b) => b !== firstP);
    const text = firstP ? firstP.html : '';
    const extra = rest.length ? `\n${renderBlocks(rest, loose)}` : '';
    return `<li class="task-item${task.done ? ' is-done' : ''}"><span class="task-box" aria-hidden="true"></span><span class="task-text">${text}</span>${extra}</li>`;
  }

  return `<li>${renderBlocks(blocks, loose)}</li>`;
}

function parseList(lines, start, ctx) {
  const first = matchList(lines[start]);
  const baseIndent = first.indent;
  const ordered = first.ordered;
  const startNumber = ordered ? Number.parseInt(first.marker, 10) : 1;
  const items = [];
  let i = start;
  let loose = false;

  while (i < lines.length) {
    const m = matchList(lines[i]);
    if (!m || m.indent !== baseIndent || m.ordered !== ordered) break;

    const contentIndent = m.indent + m.marker.length + m.spaces;
    const contIndent = m.indent + 2;
    const itemLines = [m.content];
    let blankInItem = false;
    i += 1;

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') {
        let k = i + 1;
        while (k < lines.length && lines[k].trim() === '') k += 1;
        if (k >= lines.length) {
          i = k;
          break;
        }
        const nextLine = lines[k];
        const nextIndent = indentWidth(nextLine);
        const nextMarker = matchList(nextLine);
        if (nextIndent >= contIndent || (nextMarker && nextMarker.indent === baseIndent && nextMarker.ordered === ordered)) {
          itemLines.push('');
          blankInItem = true;
          i += 1;
          continue;
        }
        i = k;
        break;
      }

      const ind = indentWidth(line);
      if (ind >= contIndent) {
        itemLines.push(line.slice(Math.min(ind, contentIndent)));
        i += 1;
        continue;
      }
      break;
    }

    while (itemLines.length > 0 && itemLines[itemLines.length - 1].trim() === '') itemLines.pop();
    if (blankInItem) loose = true;
    if (itemLines.length === 0) itemLines.push('');
    items.push(itemLines);
  }

  const tag = ordered ? 'ol' : 'ul';
  const opener = ordered && startNumber !== 1 ? `<ol start="${startNumber}">` : `<${tag}>`;
  const html = items.map((item) => renderListItem(item, ctx, loose)).join('\n');
  return { html: `${opener}\n${html}\n</${tag}>`, next: i };
}

/* ---------------------------- 段落 / 标题 ---------------------------- */

function renderParagraph(lines, ctx) {
  const parts = [];
  for (const rawLine of lines) {
    let line = rawLine;
    if (/(?:^|[^\\])\\$/.test(line)) {
      // 行尾反斜杠 = 硬换行
      line = line.slice(0, -1);
      parts.push(`${renderInline(line, ctx)}<br>`);
    } else if (/ {2,}$/.test(line)) {
      // 行尾两个以上空格 = 硬换行
      line = line.replace(/ +$/, '');
      parts.push(`${renderInline(line, ctx)}<br>`);
    } else {
      parts.push(renderInline(line, ctx));
    }
  }
  return parts.join('\n');
}

function registerHeading(ctx, level, content) {
  const inline = renderInline(content, ctx);
  const text = stripInlineMarkdown(content);
  const base = slugify(text) || 'section';
  let id = ctx.headingIdPrefix + base;
  let n = 2;
  while (ctx.usedIds.has(id)) {
    id = `${ctx.headingIdPrefix}${base}-${n}`;
    n += 1;
  }
  ctx.usedIds.add(id);
  ctx.headings.push({ level, text, id });
  return { id, inline };
}

/* ---------------------------- 主循环 ---------------------------- */

function parseBlocks(lines, ctx) {
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    if (isFenceStart(line)) {
      const result = parseFence(lines, i, ctx);
      blocks.push({ kind: 'html', html: result.html });
      i = result.next;
      continue;
    }

    const heading = matchHeading(line);
    if (heading) {
      const { id, inline } = registerHeading(ctx, heading.level, heading.content);
      blocks.push({
        kind: 'html',
        html: `<h${heading.level} id="${escapeHtml(id)}">${inline}</h${heading.level}>`,
      });
      i += 1;
      continue;
    }

    if (matchHr(line)) {
      blocks.push({ kind: 'html', html: '<hr class="rule">' });
      i += 1;
      continue;
    }

    if (/^ {0,3}>/.test(line)) {
      const result = parseBlockquote(lines, i, ctx);
      blocks.push({ kind: 'html', html: result.html });
      i = result.next;
      continue;
    }

    if (isTableStart(lines, i)) {
      const result = parseTable(lines, i, ctx);
      blocks.push({ kind: 'html', html: result.html });
      i = result.next;
      continue;
    }

    if (matchList(line)) {
      const result = parseList(lines, i, ctx);
      blocks.push({ kind: 'html', html: result.html });
      i = result.next;
      continue;
    }

    if (/^\s*<!--/.test(line)) {
      i += 1;
      continue;
    }

    const para = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== '' && !startsBlock(lines, i)) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: 'p', html: renderParagraph(para, ctx) });
  }

  return blocks;
}

/* ------------------------------------------------------------------ */
/* 导出                                                                */
/* ------------------------------------------------------------------ */

/** 统计：汉字逐字计，拉丁词按词计 */
function countWords(text) {
  const cjk = text.match(CJK_CHAR);
  const cjkCount = cjk ? cjk.length : 0;
  const rest = text.replace(CJK_CHAR, ' ');
  const latin = rest.match(/[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/g) || [];
  return cjkCount + latin.length;
}

/**
 * Markdown → HTML
 * @param {string} markdown
 * @param {{headingIdPrefix?: string, linkResolver?: (href: string, kind: 'link'|'image') => string|null|undefined, docId?: string}} [options]
 * @returns {{html: string, headings: Array<{level:number,text:string,id:string}>, stats: {chars:number,words:number,codeBlocks:number}}}
 */
export function renderMarkdown(markdown, options = {}) {
  const opts = options || {};
  const source = normalizeSource(markdown);
  const cleaned = stripBlockComments(source);
  const ctx = {
    options: opts,
    headings: [],
    usedIds: new Set(),
    headingIdPrefix: typeof opts.headingIdPrefix === 'string' ? opts.headingIdPrefix : '',
    codeBlocks: 0,
  };

  const blocks = parseBlocks(cleaned.split('\n'), ctx);

  return {
    html: renderBlocks(blocks),
    headings: ctx.headings,
    stats: {
      chars: source.length,
      words: countWords(source),
      codeBlocks: ctx.codeBlocks,
    },
  };
}

export default { renderMarkdown, escapeHtml, slugify };
