/* Beginner_in_AI · site behaviours
   no dependencies; progressive enhancement only */
(function () {
  "use strict";

  const doc = document;
  const root = doc.body ? doc.body.dataset.root || "" : "";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- header */
  const header = doc.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------ mobile nav */
  const toggle = doc.querySelector(".nav-toggle");
  const links = doc.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
      }
    });
  }

  /* --------------------------------------------------------------- reveal */
  const revealables = doc.querySelectorAll("[data-reveal]");
  if (revealables.length) {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      revealables.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* ------------------------------------------------------------ mermaid */
  function renderMermaid(scope) {
    const api = window.mermaid;
    if (!api) return;
    const nodes = Array.from(
      (scope || doc).querySelectorAll(".mermaid:not([data-processed])")
    ).filter((node) => {
      const panel = node.closest(".tab-panel");
      return !panel || !panel.hasAttribute("hidden");
    });
    if (!nodes.length) return;
    try {
      api.run({ nodes });
    } catch (err) {
      /* keep the source visible instead of breaking the page */
      console.warn("mermaid render failed", err);
    }
  }

  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      fontFamily:
        '"Segoe UI", "Microsoft YaHei UI", "PingFang SC", "Noto Sans SC", sans-serif',
      themeVariables: {
        background: "#ffffff",
        primaryColor: "#ffffff",
        primaryTextColor: "#080b16",
        primaryBorderColor: "#080b16",
        secondaryColor: "#e8fbff",
        tertiaryColor: "#f7f9fd",
        lineColor: "#4a5470",
        textColor: "#080b16",
        mainBkg: "#ffffff",
        nodeBorder: "#080b16",
        clusterBkg: "#f7f9fd",
        clusterBorder: "#ccd3e4",
        edgeLabelBackground: "#eef1f8",
        fontSize: "13px"
      },
      flowchart: {
        curve: "basis",
        padding: 14,
        nodeSpacing: 46,
        rankSpacing: 52,
        useMaxWidth: true,
        htmlLabels: false
      }
    });
    renderMermaid();
  }

  /* ---------------------------------------------------------------- tabs */
  const tablists = doc.querySelectorAll("[data-tabs]");
  tablists.forEach((list) => {
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const activate = (tab, focus, syncHash) => {
      const panelId = tab.getAttribute("aria-controls");
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = doc.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      doc.querySelectorAll("[data-toc-group]").forEach((group) => {
        group.hidden = group.dataset.tocGroup !== panelId;
      });
      if (focus) tab.focus();
      renderMermaid();
      if (syncHash && history.replaceState) {
        history.replaceState(null, "", "#" + panelId);
      }
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(tab, false, true));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          activate(next, true);
        }
      });
    });

    let initial = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
    const hash = (location.hash || "").slice(1);
    if (hash) {
      const fromHash = tabs.find((t) => t.getAttribute("aria-controls") === hash);
      if (fromHash) initial = fromHash;
    }
    if (initial) activate(initial, false, false);
  });

  /* ------------------------------------------------------------- copy code */
  doc.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const figure = btn.closest(".code-block");
    const code = figure && figure.querySelector("code");
    if (!code) return;
    const text = code.textContent;
    const done = () => {
      const old = btn.textContent;
      btn.textContent = "copied";
      btn.classList.add("is-copied");
      setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove("is-copied");
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
    } else {
      const ta = doc.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      try {
        doc.execCommand("copy");
        done();
      } catch (_) {}
      doc.body.removeChild(ta);
    }
  });

  /* ---------------------------------------------------------- toc spy */
  const tocLinks = Array.from(doc.querySelectorAll(".toc-list a[href^='#']"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = new Map();
    tocLinks.forEach((a) => byId.set(a.getAttribute("href").slice(1), a));
    const headings = Array.from(byId.keys())
      .map((id) => doc.getElementById(id))
      .filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tocLinks.forEach((a) => a.classList.remove("is-active"));
          const link = byId.get(entry.target.id);
          if (link) link.classList.add("is-active");
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => spy.observe(h));
  }

  /* -------------------------------------------------------- progress board */
  const STORE = "beginner-in-ai.progress.v1";
  const board = doc.querySelector("[data-progress-board]");
  if (board) {
    let state = {};
    try {
      state = JSON.parse(localStorage.getItem(STORE) || "{}") || {};
    } catch (_) {
      state = {};
    }
    const save = () => {
      try {
        localStorage.setItem(STORE, JSON.stringify(state));
      } catch (_) {}
    };

    const inputs = Array.from(board.querySelectorAll("input[type=checkbox][data-key]"));
    const dates = Array.from(board.querySelectorAll("input[type=date][data-date]"));
    const bars = Array.from(board.querySelectorAll("[data-bar]"));

    const refresh = () => {
      let done = 0;
      inputs.forEach((input) => {
        const on = !!state[input.dataset.key];
        input.checked = on;
        const wrapper = input.closest(".check");
        if (wrapper) wrapper.classList.toggle("is-checked", on);
        const milestone = input.closest(".milestone");
        if (milestone) milestone.classList.toggle("is-done", on);
        if (on) done += 1;
      });
      const pct = inputs.length ? Math.round((done / inputs.length) * 100) : 0;
      const ring = doc.querySelector("[data-pct]");
      if (ring) ring.textContent = pct + "%";
      bars.forEach((bar) => {
        const group = bar.dataset.bar;
        const groupInputs =
          group === "all" ? inputs : inputs.filter((i) => i.dataset.group === group);
        const groupDone = groupInputs.filter((i) => state[i.dataset.key]).length;
        const groupPct = groupInputs.length
          ? Math.round((groupDone / groupInputs.length) * 100)
          : 0;
        bar.style.setProperty("--w", groupPct + "%");
        const label = doc.querySelector('[data-count="' + group + '"]');
        if (label) label.textContent = groupDone + "/" + groupInputs.length;
      });
      const overall = doc.querySelector('[data-count="all"]');
      if (overall) overall.textContent = done + "/" + inputs.length;
    };

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        state[input.dataset.key] = input.checked;
        save();
        refresh();
      });
    });
    dates.forEach((input) => {
      input.value = state[input.dataset.date] || "";
      input.addEventListener("change", () => {
        state[input.dataset.date] = input.value;
        save();
      });
    });

    const reset = board.querySelector("[data-reset]");
    if (reset) {
      reset.addEventListener("click", () => {
        if (!window.confirm("清空所有打卡记录？此操作不可恢复。")) return;
        state = {};
        save();
        dates.forEach((d) => (d.value = ""));
        refresh();
      });
    }
    refresh();
  }

  /* ------------------------------------------------------------- search */
  const overlay = doc.querySelector("[data-search-overlay]");
  if (overlay) {
    const input = overlay.querySelector("input");
    const list = overlay.querySelector("[data-search-results]");
    const empty = overlay.querySelector(".search-empty");
    let index = null;
    let active = -1;
    let items = [];

    const loadIndex = () => {
      if (index) return Promise.resolve(index);
      return fetch(root + "assets/search.json")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          index = Array.isArray(data) ? data : [];
          return index;
        })
        .catch(() => {
          index = [];
          return index;
        });
    };

    const render = (hits) => {
      list.innerHTML = "";
      active = -1;
      if (!hits.length) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      hits.slice(0, 24).forEach((hit, i) => {
        const li = doc.createElement("li");
        const a = doc.createElement("a");
        a.href = root + hit.u;
        a.innerHTML =
          '<span class="sr-kind">' + hit.k + "</span>" +
          '<span class="sr-title"></span>' +
          '<span class="sr-path"></span>';
        a.querySelector(".sr-title").textContent = hit.t;
        a.querySelector(".sr-path").textContent = hit.p;
        li.appendChild(a);
        list.appendChild(li);
      });
      items = Array.from(list.querySelectorAll("a"));
    };

    const filter = (q) => {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) {
        return (index || []).filter((x) => x.kind === "page").slice(0, 8);
      }
      return (index || [])
        .map((entry) => {
          const hay = (entry.t + " " + (entry.text || "") + " " + entry.p).toLowerCase();
          let score = 0;
          for (const term of terms) {
            if (!hay.includes(term)) return null;
            score += entry.t.toLowerCase().startsWith(term) ? 6 : han(entry.t, term) * 3 + han(hay, term);
          }
          return { entry, score };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.entry);
    };

    const han = (hay, term) => {
      let n = 0;
      let i = hay.indexOf(term);
      while (i !== -1) {
        n += 1;
        i = hay.indexOf(term, i + term.length);
      }
      return n;
    };

    const open = () => {
      overlay.classList.add("is-open");
      doc.body.style.overflow = "hidden";
      input.value = "";
      input.focus();
      loadIndex().then(() => render(filter("")));
    };
    const close = () => {
      overlay.classList.remove("is-open");
      doc.body.style.overflow = "";
    };

    doc.querySelectorAll("[data-search-open]").forEach((btn) => {
      btn.addEventListener("click", open);
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelectorAll("[data-search-close]").forEach((btn) =>
      btn.addEventListener("click", close)
    );

    input.addEventListener("input", () => {
      loadIndex().then(() => render(filter(input.value.trim())));
    });

    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("is-active", i === active));
        items[active].scrollIntoView({ block: "nearest" });
      }
      if (e.key === "Enter" && active >= 0 && items[active]) {
        items[active].click();
      }
    });

    doc.addEventListener("keydown", (e) => {
      const isK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isK) {
        e.preventDefault();
        overlay.classList.contains("is-open") ? close() : open();
      }
      if (e.key === "/" && !/input|textarea|select/i.test(doc.activeElement.tagName)) {
        e.preventDefault();
        open();
      }
    });
  }

  /* --------------------------------------------------------------- misc */
  doc.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const top = doc.querySelector("[data-to-top]");
  if (top) {
    top.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
