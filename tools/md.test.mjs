import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import md, { renderMarkdown, escapeHtml, slugify } from './md.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(here, '..', 'source');

/* ------------------------------------------------------------------ */
/* 导出与基础工具                                                      */
/* ------------------------------------------------------------------ */

test('导出 API 完整', () => {
  assert.equal(typeof renderMarkdown, 'function');
  assert.equal(typeof escapeHtml, 'function');
  assert.equal(typeof slugify, 'function');
  assert.equal(typeof md.renderMarkdown, 'function');
  assert.equal(md.renderMarkdown, renderMarkdown);
  assert.equal(md.escapeHtml, escapeHtml);
  assert.equal(md.slugify, slugify);
});

test('escapeHtml 转义五类字符', () => {
  assert.equal(escapeHtml('<script a="1">&\''), '&lt;script a=&quot;1&quot;&gt;&amp;&#39;');
});

test('slugify 处理 CJK、标点与重复连字符', () => {
  assert.equal(slugify('M0 · 开局：把你的电脑变成一台"AI 工作台"'), 'm0-开局把你的电脑变成一台ai-工作台');
  assert.equal(slugify('Hello__World  Test'), 'hello-world-test');
  assert.equal(slugify('！！'), '');
});

/* ------------------------------------------------------------------ */
/* 标题                                                                */
/* ------------------------------------------------------------------ */

test('标题 id 唯一且带前缀，文本去掉行内标记', () => {
  const { html, headings } = renderMarkdown(
    '# 你好 World\n\n## 你好 World\n\n### 问题 `NoneType` 与 **重点**\n',
    { headingIdPrefix: 'sec-' },
  );
  assert.equal(headings.length, 3);
  assert.deepEqual(
    headings.map((h) => h.level),
    [1, 2, 3],
  );
  assert.equal(headings[0].id, 'sec-你好-world');
  assert.equal(headings[1].id, 'sec-你好-world-2');
  assert.equal(headings[2].id, 'sec-问题-nonetype-与-重点');
  assert.equal(headings[2].text, '问题 NoneType 与 重点');
  assert.equal(new Set(headings.map((h) => h.id)).size, 3);
  assert.ok(html.includes('<h1 id="sec-你好-world">'));
  assert.ok(html.includes('<code>NoneType</code>'));
});

/* ------------------------------------------------------------------ */
/* 表格                                                                */
/* ------------------------------------------------------------------ */

test('表格对齐与转义竖线', () => {
  const source = [
    '| 左 | 中 | 右 | 默认 |',
    '| :--- | :---: | ---: | --- |',
    '| a\\|b | 中 | 右 | x |',
  ].join('\n');
  const { html, headings } = renderMarkdown(source);

  assert.equal(headings.length, 0);
  assert.ok(html.startsWith('<div class="table-scroll"><table class="data-table">'));
  assert.ok(html.includes('<th style="text-align:left">左</th>'));
  assert.ok(html.includes('<th style="text-align:center">中</th>'));
  assert.ok(html.includes('<th style="text-align:right">右</th>'));
  assert.ok(html.includes('<th>默认</th>'));
  assert.ok(html.includes('<td style="text-align:left">a|b</td>'));
  assert.ok(html.includes('</tbody></table></div>'));
});

test('表格 ragged rows 自动补齐，且不会吞掉后面的段落', () => {
  const source = '| A | B |\n|---|---|\n| 1 |\n| 2 | 3 | 4 |\n\n后面一段';
  const { html } = renderMarkdown(source);
  assert.ok(html.includes('<tr><td>1</td><td></td></tr>'));
  assert.ok(html.includes('<tr><td>2</td><td>3</td></tr>'));
  assert.ok(!html.includes('<td>4</td>'));
  assert.ok(html.includes('<p>后面一段</p>'));
});

/* ------------------------------------------------------------------ */
/* 列表                                                                */
/* ------------------------------------------------------------------ */

test('嵌套列表嵌在父级 li 内', () => {
  const { html } = renderMarkdown('- 父\n  - 子一\n  - 子二\n- 父二');
  assert.match(html, /<li>父\n<ul>\n<li>子一<\/li>\n<li>子二<\/li>\n<\/ul><\/li>/);
  assert.ok(html.includes('<li>父二</li>'));
});

test('有序列表里用 3 空格缩进的嵌套列表', () => {
  const { html } = renderMarkdown('1. 查询，其中：\n   - 同义改写\n   - 跨表述\n2. 记录结果');
  assert.match(html, /<li>查询，其中：\n<ul>\n<li>同义改写<\/li>/);
  assert.ok(html.includes('<li>记录结果</li>'));
});

test('紧凑列表不产生 p，松散列表产生 p', () => {
  const tight = renderMarkdown('- 一\n- 二').html;
  assert.ok(tight.includes('<li>一</li>'));
  assert.ok(!tight.includes('<p>'));

  const loose = renderMarkdown('- 一\n\n- 二').html;
  assert.ok(loose.includes('<li><p>一</p></li>'));
  assert.ok(loose.includes('<li><p>二</p></li>'));
});

test('任务列表结构与勾选态', () => {
  const { html } = renderMarkdown('- [ ] 未完成\n- [x] 已完成\n- [X] 大写');
  assert.equal((html.match(/class="task-item"/g) || []).length, 1);
  assert.equal((html.match(/class="task-item is-done"/g) || []).length, 2);
  assert.ok(html.includes('<span class="task-box" aria-hidden="true"></span>'));
  assert.ok(html.includes('<span class="task-text">未完成</span>'));
  assert.ok(!html.includes('checkbox'));
});

/* ------------------------------------------------------------------ */
/* 代码块                                                              */
/* ------------------------------------------------------------------ */

test('python 代码块：结构、高亮与 XSS 转义', () => {
  const source = '```python\nx = "<script>alert(1)</script>"\ny = 42\n```';
  const { html, stats } = renderMarkdown(source);
  assert.ok(html.includes('<figure class="code-block" data-lang="python">'));
  assert.ok(html.includes('<span class="code-lang">python</span>'));
  assert.ok(html.includes('<span class="code-copy" data-copy>copy</span>'));
  assert.ok(html.includes('<pre><code class="language-python">'));
  assert.ok(html.includes('<span class="tok-str">&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;</span>'));
  assert.ok(html.includes('<span class="tok-num">42</span>'));
  assert.ok(!html.includes('<script>'));
  assert.equal(stats.codeBlocks, 1);
});

test('未知语言（html）代码块内容被完整转义', () => {
  const { html } = renderMarkdown('```html\n<script>alert(1)</script>\n```');
  assert.ok(html.includes('data-lang="html"'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
});

test('mermaid 内容原样输出（保留 <br/>）', () => {
  const { html } = renderMarkdown('```mermaid\nflowchart TD\n    A --> B<br/>C\n```');
  assert.ok(
    html.includes('<div class="mermaid-wrap"><div class="mermaid">flowchart TD\n    A --> B<br/>C</div></div>'),
  );
  assert.ok(!html.includes('&lt;br/&gt;'));
});

test('未闭合代码围栏不会死循环或抛错', () => {
  const { html, stats } = renderMarkdown('```python\nprint("hi")\n# 没有结束围栏');
  assert.equal(stats.codeBlocks, 1);
  assert.ok(html.includes('language-python'));
  assert.ok(html.includes('print'));
  assert.ok(html.includes('没有结束围栏'));
});

test('行内代码里的 * 和 < 不被当作标记', () => {
  const { html } = renderMarkdown('`a*b<c` 和 **粗体**');
  assert.ok(html.includes('<code>a*b&lt;c</code>'));
  assert.ok(!html.includes('<em>'));
  assert.ok(html.includes('<strong>粗体</strong>'));
});

/* ------------------------------------------------------------------ */
/* 引用与行内语法                                                      */
/* ------------------------------------------------------------------ */

test('引用块含嵌套列表', () => {
  const { html, headings } = renderMarkdown('> **提示**\n> - 一\n> - 二\n\n> ## 引用里的标题');
  assert.ok(html.includes('<blockquote class="callout">\n<p><strong>提示</strong></p>'));
  assert.ok(html.includes('<ul>\n<li>一</li>\n<li>二</li>\n</ul>'));
  assert.ok(html.includes('<h2 id="引用里的标题">引用里的标题</h2>'));
  assert.equal(headings.length, 1);
});

test('粗体与 CJK 紧邻', () => {
  const { html } = renderMarkdown('**注意：**这一讲');
  assert.equal(html, '<p><strong>注意：</strong>这一讲</p>');
});

test('linkResolver 对链接和图片返回 null 时退化为纯文本', () => {
  const kinds = [];
  const { html } = renderMarkdown('[点这里](https://x.com) 和 ![示意图](a.png)', {
    linkResolver: (href, kind) => {
      kinds.push([href, kind]);
      return null;
    },
  });
  assert.deepEqual(kinds, [
    ['https://x.com', 'link'],
    ['a.png', 'image'],
  ]);
  assert.ok(!html.includes('<a '));
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('点这里'));
  assert.ok(html.includes('示意图'));
});

test('linkResolver 改写地址、目标属性与 title', () => {
  const { html } = renderMarkdown('[站内](/docs/a) [站外](https://a.com "标题") ![图](x.png)', {
    linkResolver: (href) => (href === 'x.png' ? '/img/x.png' : href),
  });
  assert.ok(html.includes('<a href="/docs/a">站内</a>'));
  assert.ok(html.includes('<a href="https://a.com" title="标题" target="_blank" rel="noopener">站外</a>'));
  assert.ok(html.includes('<img src="/img/x.png" alt="图" loading="lazy">'));
});

test('自动链接与裸 URL，去掉尾部标点', () => {
  const { html } = renderMarkdown('看 <https://a.com/x> 和 https://b.com/y。');
  assert.ok(html.includes('<a href="https://a.com/x" target="_blank" rel="noopener">https://a.com/x</a>'));
  assert.ok(html.includes('<a href="https://b.com/y" target="_blank" rel="noopener">https://b.com/y</a>。'));
  assert.ok(!html.includes('https://b.com/y。</a>'));
});

test('分隔线', () => {
  const { html } = renderMarkdown('---\n\n***\n\n___');
  assert.equal((html.match(/<hr class="rule">/g) || []).length, 3);
});

test('硬换行：两个空格与反斜杠', () => {
  const { html } = renderMarkdown('第一行  \n第二行');
  assert.ok(html.includes('第一行<br>\n第二行'));
  const backslash = renderMarkdown('第一行\\\n第二行').html;
  assert.ok(backslash.includes('第一行<br>\n第二行'));
});

test('普通文本中的 < 与 & 被转义，<br> 与注释特殊处理', () => {
  const { html } = renderMarkdown('a < b & c <script>alert(1)</script><br>换行\n\n前 <!-- 隐藏 --> 后');
  assert.ok(html.includes('a &lt; b &amp; c &lt;script&gt;'));
  assert.ok(html.includes('<br>换行'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<!--'));
  assert.ok(html.includes('前  后'));
});

test('空文档与统计字段', () => {
  const result = renderMarkdown('');
  assert.equal(result.html, '');
  assert.deepEqual(result.headings, []);
  assert.equal(result.stats.chars, 0);
  assert.equal(result.stats.words, 0);
  assert.equal(result.stats.codeBlocks, 0);
});

/* ------------------------------------------------------------------ */
/* 全量 dry run                                                        */
/* ------------------------------------------------------------------ */

function collectMarkdown(dir) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
    }
  };
  walk(dir);
  out.sort();
  return out;
}

test('dry run：渲染 source 下全部 Markdown', () => {
  const files = collectMarkdown(sourceDir);
  assert.ok(files.length >= 59, `期望至少 59 个 md 文件，实际 ${files.length}`);

  for (const file of files) {
    const rel = path.relative(sourceDir, file);
    const source = fs.readFileSync(file, 'utf8');
    const result = renderMarkdown(source);

    assert.ok(result.html.length > 200, `${rel}: html 太短`);
    assert.ok(result.headings.length >= 1, `${rel}: 没有解析出标题`);
    assert.ok(result.stats.codeBlocks >= 0, `${rel}: stats.codeBlocks 异常`);
    assert.ok(!/<script/i.test(result.html), `${rel}: 泄漏了 <script>`);
    assert.ok(!/<script/i.test(source), `${rel}: 源文件意外包含 <script>`);

    const ids = result.headings.map((h) => h.id);
    assert.equal(new Set(ids).size, ids.length, `${rel}: 标题 id 重复`);
    for (const h of result.headings) {
      assert.ok(h.id.length > 0, `${rel}: 空标题 id`);
      assert.ok(typeof h.text === 'string', `${rel}: 标题文本缺失`);
    }
  }
});
