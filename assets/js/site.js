(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REPO = "samuelit0davila/fifa-street-pc-port";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
                  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

  /* ---------- i18n ---------- */
  const I = window.I18N;
  const nodes = $$("[data-i18n]"), altNodes = $$("[data-i18n-alt]");
  const EN = {};
  nodes.forEach((n) => (EN[n.dataset.i18n] = n.textContent));
  altNodes.forEach((n) => (EN["alt." + n.dataset.i18nAlt] = n.alt));
  Object.assign(EN, I.en);
  let lang = "en";
  const t = (k) => (I.dict[lang] && I.dict[lang][k]) || EN[k] || k;

  const sel = $("#lang");
  I.langs.forEach(([code, name]) => sel.add(new Option(name, code)));
  const pick = () => {
    const saved = store.get("restreet-lang");
    if (saved && I.langs.some(([c]) => c === saved)) return saved;
    for (const l of navigator.languages || [navigator.language || "en"]) {
      const base = l.toLowerCase().split("-")[0];
      const hit = I.langs.find(([c]) => c.toLowerCase().split("-")[0] === base);
      if (hit) return hit[0];
    }
    return "en";
  };
  function applyLang(code) {
    lang = code;
    document.documentElement.lang = code;
    sel.value = code;
    nodes.forEach((n) => (n.textContent = t(n.dataset.i18n)));
    altNodes.forEach((n) => (n.alt = t("alt." + n.dataset.i18nAlt)));
    document.title = t("meta.title");
    splitHero();
    renderReleases(releases);
    if (motionBtn) $("#motionLabel").textContent = t(still ? "motion.play" : "motion.pause");
  }
  sel.addEventListener("change", () => { store.set("restreet-lang", sel.value); applyLang(sel.value); });

  /* ---------- hero letter rise ---------- */
  function splitHero() {
    let i = 0;
    $$(".hero__title .split").forEach((el) => {
      const text = el.textContent;
      el.setAttribute("aria-label", text);
      el.textContent = "";
      const words = text.split(" ");
      words.forEach((w, wi) => {
        const word = document.createElement("span");
        word.style.display = "inline-block";
        word.setAttribute("aria-hidden", "true");
        [...w].forEach((c, ci) => {
          const s = document.createElement("span");
          s.className = "ch";
          s.textContent = c;
          s.style.animationDelay = (reduced ? 0 : 0.15 + i++ * 0.035) + "s";
          if (el.classList.contains("grad")) { s.style.setProperty("--gw", w.length * 100 + "%"); s.style.setProperty("--gx", (w.length > 1 ? (ci / (w.length - 1)) * 100 : 0) + "%"); }
          word.appendChild(s);
        });
        el.appendChild(word);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ---------- nav, progress, active section ---------- */
  const nav = $("#nav"), bar = $("#progress");
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("is-solid", y > 30);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = $$(".nav__links a");
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });

  const burger = $("#burger"), menu = $("#navlinks");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); menu.classList.toggle("is-open", open); };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  links.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- reveal on scroll (staggered per parent) ---------- */
  const reveal = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sibs = $$(":scope > .reveal", e.target.parentElement);
    e.target.style.setProperty("--d", Math.min(sibs.indexOf(e.target), 8) * 0.08 + "s");
    e.target.classList.add("is-in");
    reveal.unobserve(e.target);
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  const watchReveal = (root = document) => $$(".reveal:not(.is-in)", root).forEach((el) => reveal.observe(el));
  watchReveal();

  /* ---------- card tilt + glow ---------- */
  if (!reduced && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", x * 100 + "%"); c.style.setProperty("--my", y * 100 + "%");
        c.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-4px)`;
      });
      c.addEventListener("pointerleave", () => (c.style.transform = ""));
    });
  }

  /* ---------- counters ---------- */
  const counter = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    counter.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    if (reduced) return;
    const t0 = performance.now(), dur = 1600;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - p, 4)));
      el.textContent = pre + v + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$(".count").forEach((c) => counter.observe(c));

  /* ---------- videos: play only while on screen ---------- */
  const hero = $("#heroVideo"), motionBtn = $("#motionBtn");
  // Ambient motion (hero loop, marquee, shine) can be paused; it starts paused for prefers-reduced-motion.
  let still = store.get("restreet-motion") ? store.get("restreet-motion") === "off" : reduced;
  function setStill(v) {
    still = v;
    document.documentElement.classList.toggle("is-paused", v);
    motionBtn.setAttribute("aria-pressed", v);
    $("#motionLabel").textContent = t(v ? "motion.play" : "motion.pause");
    if (v) hero.pause(); else hero.play().catch(() => {});
  }
  motionBtn.addEventListener("click", () => { setStill(!still); store.set("restreet-motion", still ? "off" : "on"); });
  if (still) hero.removeAttribute("autoplay");
  const vids = [hero, $("#reel"), $("#logVideo")];
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !(v === hero ? still : reduced) && !v.dataset.userPaused) v.play().catch(() => {});
    else if (!e.isIntersecting && !v.paused) { v.dataset.auto = "1"; v.pause(); }
  }), { threshold: 0.35 });
  vids.forEach((v) => v && vio.observe(v));
  // A reel the viewer paused (or that ended) stays paused when it scrolls back in.
  $("#reel").addEventListener("pause", (e) => { if (!e.target.dataset.auto) e.target.dataset.userPaused = "1"; e.target.dataset.auto = ""; });

  /* ---------- releases (snapshot, then live from GitHub) ---------- */
  let releases = window.RELEASES || [];
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inline = (s) => esc(s)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  // shortcut: tiny Markdown subset (headings, lists, bold, links, code), enough for these release notes; use a real parser if notes get richer.
  function md(src) {
    let html = "", list = false;
    for (const raw of src.replace(/\r/g, "").split("\n")) {
      const line = raw.trim();
      const li = line.match(/^[-*]\s+(.*)/) || line.match(/^\d+\.\s+(.*)/);
      if (!li && list) { html += "</ul>"; list = false; }
      if (!line || /^---+$/.test(line)) continue;
      const h = line.match(/^#{1,6}\s+(.*)/);
      if (h) { if (!/^#\s/.test(line)) html += `<h4>${inline(h[1])}</h4>`; continue; }
      if (li) { if (!list) { html += "<ul>"; list = true; } html += `<li>${inline(li[1])}</li>`; continue; }
      html += `<p>${inline(line)}</p>`;
    }
    return html + (list ? "</ul>" : "");
  }
  function renderReleases(list) {
    const box = $("#releases");
    if (!box || !list.length) return;
    const fmt = new Intl.DateTimeFormat(lang, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    box.innerHTML = list.slice(0, 6).map((r, i) => {
      const tag = r.tag_name.replace(/-online-beta(-test)?$/, "");
      const name = esc(r.name.replace(/^ReStreet\s*(-\s*FIFA Street 2012 Recompiled\s*)?/i, "").replace(/^v[\d.]+\s*[—-]?\s*/, "") || r.name);
      return `<details class="rel"${i === 0 ? " open" : ""}><summary><span class="rel__tag grad">${esc(tag)}</span>` +
        `<span class="rel__name">${name}</span>${i === 0 ? `<span class="rel__badge">${esc(t("log.latest"))}</span>` : ""}` +
        `<time class="rel__date" datetime="${esc(r.published_at)}">${fmt.format(new Date(r.published_at))}</time></summary>` +
        `<div class="rel__body">${md(r.body || "")}<p><a href="${esc(r.html_url)}" rel="noopener">${esc(t("log.open"))}</a></p></div></details>`;
    }).join("");
  }

  applyLang(pick());
  setStill(still);

  if (location.protocol.startsWith("http")) {
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=6`, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list) => { list = list.filter((r) => !r.draft); if (list.length) { releases = list; renderReleases(releases); } })
      .catch(() => {}); // offline or rate-limited: keep the snapshot
  }
})();
