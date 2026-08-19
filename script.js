/* =========================================================
   Portfolio interactions — vanilla JS, no dependencies
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- loader ---------- */
  const LOADER_MIN_MS = 3000; // the site must stay on the loader at least this long
  const loaderStart = performance.now();
  let loaderExited = false;

  // Instant hide, no animation — used only for the bfcache-restore edge case,
  // where re-running a multi-second boot sequence on every back-navigation
  // would be far more annoying than helpful.
  function hideLoaderInstant() {
    loaderExited = true;
    clearInterval(loaderMsgTimer);
    clearInterval(loaderPctTimer);
    const loader = $("#loader");
    if (loader) loader.classList.add("done");
  }

  // Normal exit: snap to 100%, hold briefly, swap to the "access granted"
  // panel, hold that, then fade the whole loader out.
  function beginLoaderExit() {
    if (loaderExited) return;
    loaderExited = true;
    clearInterval(loaderMsgTimer);
    clearInterval(loaderPctTimer);
    if (loaderPctEl) loaderPctEl.textContent = "100%";
    const bootBar = document.querySelector("#loader .loader-bar span");
    if (bootBar) bootBar.style.width = "100%";
    setTimeout(() => {
      $("#loaderBoot")?.classList.remove("active");
      $("#loaderAccess")?.classList.add("active");
      setTimeout(() => $("#loader")?.classList.add("done"), 950);
    }, 300);
  }

  function hideLoader() {
    if (loaderExited) return;
    const elapsed = performance.now() - loaderStart;
    // beginLoaderExit's own sequence takes ~1250ms (100% hold + access panel)
    // before .done is applied, so back that out of the minimum-stay budget.
    const remaining = Math.max(0, LOADER_MIN_MS - elapsed - 1250);
    setTimeout(beginLoaderExit, remaining);
  }

  // Rotating status messages + a live percentage counter, purely cosmetic,
  // both self-terminate via hideLoader() so they never outlive the loader.
  const loaderMessages = [
    "Compiling experience…", "Bundling curiosity…", "Linting the coffee…",
    "Warming up the grid…", "Almost there…",
  ];
  const loaderTextEl = $("#loaderText"), loaderPctEl = $("#loaderPct");
  let loaderMsgIdx = 0;
  const loaderMsgTimer = loaderTextEl
    ? setInterval(() => {
        loaderMsgIdx = (loaderMsgIdx + 1) % loaderMessages.length;
        loaderTextEl.style.opacity = 0;
        setTimeout(() => {
          loaderTextEl.textContent = loaderMessages[loaderMsgIdx];
          loaderTextEl.style.opacity = 1;
        }, 250);
      }, 650)
    : null;
  let loaderPct = 0;
  const loaderPctTimer = loaderPctEl
    ? setInterval(() => {
        loaderPct = Math.min(loaderPct + Math.round(Math.random() * 9) + 3, 99);
        loaderPctEl.textContent = loaderPct + "%";
      }, 130)
    : null;

  // Case 1: page already finished loading before this script ran
  // (common on mobile with cached assets) — 'load' will never fire again.
  if (document.readyState === "complete") {
    setTimeout(hideLoader, 300);
  } else {
    window.addEventListener("load", () => setTimeout(hideLoader, 700));
  }
  // Case 2: page restored from bfcache (iOS Safari / Android Chrome swipe-back)
  // — 'load' does not refire on restore, only 'pageshow' does. Skip the
  // multi-second boot animation entirely here — just snap it away.
  window.addEventListener("pageshow", (e) => { if (e.persisted) hideLoaderInstant(); });
  // Case 3: absolute safety net — never let a stalled font/asset trap the loader.
  setTimeout(hideLoader, 4500);

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  // Keep the mobile browser's own chrome (status bar / address bar) in sync
  // with the site's actual background, instead of leaving it default white.
  const THEME_COLORS = { dark: "#10182a", light: "#eef3fc" };
  function syncThemeColorMeta(theme) {
    $("#metaThemeColor")?.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.dark);
  }
  if (saved) root.dataset.theme = saved;
  syncThemeColorMeta(root.dataset.theme || "dark");
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
    syncThemeColorMeta(next);
  });

  /* ---------- nav (floating pill / dropdown) ---------- */
  const navPill = $("#navPill"),
    navLinks = $("#navLinks"),
    menuToggle = $("#menuToggle");

  function closeNav() {
    navPill.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
  function toggleNav() {
    const open = navPill.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  }
  menuToggle.addEventListener("click", toggleNav);
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeNav();
  });
  // Close on outside click / Escape, like a normal dropdown.
  document.addEventListener("click", (e) => {
    if (navPill.classList.contains("open") && !navPill.contains(e.target)) closeNav();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navPill.classList.contains("open")) closeNav();
  });

  const progress = $("#scrollProgress"),
    fab = $("#fab");
  const onScroll = () => {
    const y = window.scrollY;
    navPill.classList.toggle("scrolled", y > 20);
    fab.classList.toggle("show", y > 600);
    const h = document.body.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  fab.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }),
  );

  /* ---------- custom cursor + trailing glow ---------- */
  const cur = $("#cursor"),
    dot = $("#cursorDot"),
    glow = $("#cursorGlow");
  if (matchMedia("(hover: hover)").matches) {
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      gx = 0,
      gy = 0,
      glowTimeout;
    addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
      if (glow) {
        glow.classList.add("active");
        clearTimeout(glowTimeout);
        glowTimeout = setTimeout(() => glow.classList.remove("active"), 900);
      }
    });
    (function loop() {
      cx += (x - cx) * 0.45;
      cy += (y - cy) * 0.45;
      cur.style.transform = `translate(${cx - 17}px, ${cy - 17}px)`;
      if (glow) {
        gx += (x - gx) * 0.08; // slower lerp = longer, dreamier trail
        gy += (y - gy) * 0.08;
        glow.style.transform = `translate(${gx}px, ${gy}px)`;
      }
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      cur.classList.toggle(
        "grow",
        !!e.target.closest("a,button,input,textarea,.card,.project"),
      );
    });
  }

  /* ---------- typewriter ---------- */
  const words = [
    "Web Developer",
    "CSE Student",
    "Problem Solver",
    "Future Software Engineer",
  ];
  const tw = $("#typewriter");
  let wi = 0,
    ci = 0,
    del = false;
  (function type() {
    const w = words[wi];
    tw.textContent = w.slice(0, ci);
    if (!del && ci < w.length) ci++;
    else if (del && ci > 0) ci--;
    else if (!del) {
      del = true;
      setTimeout(type, 1400);
      return;
    } else {
      del = false;
      wi = (wi + 1) % words.length;
    }
    setTimeout(type, del ? 45 : 85);
  })();

  /* ---------- data ---------- */
  const skills = [
    { n: "HTML5", c: "frontend", l: 92 },
    { n: "CSS3", c: "frontend", l: 90 },
    { n: "JavaScript", c: "frontend", l: 85 },
    { n: "Bootstrap", c: "frontend", l: 82 },
    { n: "Tailwind CSS", c: "frontend", l: 80 },
    { n: "Node.js", c: "backend", l: 72 },
    { n: "Express.js", c: "backend", l: 70 },
    { n: "MongoDB", c: "database", l: 68 },
    { n: "MySQL", c: "database", l: 70 },
    { n: "Git", c: "tools", l: 84 },
    { n: "GitHub", c: "tools", l: 86 },
    { n: "VS Code", c: "tools", l: 90 },
    { n: "Figma", c: "tools", l: 65 },
    { n: "Data Structures", c: "cs", l: 75 },
    { n: "Algorithms", c: "cs", l: 72 },
    { n: "OOP", c: "cs", l: 78 },
    { n: "Database Systems", c: "cs", l: 74 },
    { n: "Problem Solving", c: "cs", l: 82 },
  ];
  const labels = {
    frontend: "Frontend",
    backend: "Backend",
    database: "Database",
    tools: "Tools",
    cs: "CS Fundamentals",
  };

  $("#skillGrid").innerHTML = skills
    .map(
      (s) => `
    <article class="glass skill reveal" data-cat="${s.c}">
      <div class="skill-top"><strong>${s.n}</strong></div>
      <small>${labels[s.c]}</small>
    </article>`,
    )
    .join("");

  const projects = [
    {
      cat: "frontend",
      img: "assets/project-portfolio.jpg",
      title: "Personal Portfolio Website",
      desc: "A fully responsive personal portfolio designed to showcase skills, projects, and professional growth while maintaining exceptional user experience and modern aesthetics.",
      stack: ["HTML", "CSS", "JavaScript"],
      features: [
        "Responsive design",
        "Dark/light mode",
        "Interactive animations",
        "SEO optimized",
      ],
      stats: ["10 sections", "100% responsive", "0 dependencies"],
    },
    {
      cat: "fullstack",
      img: "assets/project-sms.jpg",
      title: "Student Management System",
      desc: "A CRUD-based student management platform designed to streamline academic data organization and student record management.",
      stack: ["JavaScript", "Node.js", "Express.js", "MongoDB"],
      features: [
        "Student records",
        "CRUD operations",
        "Search functionality",
        "Secure data handling",
      ],
      stats: ["REST API", "4 entities", "Auth ready"],
    },
    {
      cat: "frontend",
      img: "assets/project-ecom.jpg",
      title: "E-Commerce Landing Page",
      desc: "A modern and responsive storefront interface focused on conversion optimization and user experience.",
      stack: ["HTML", "CSS", "Bootstrap", "JavaScript"],
      features: [
        "Product showcase",
        "Responsive layouts",
        "Modern UI design",
        "Performance optimized",
      ],
      stats: ["Mobile first", "Fast LCP", "Conversion focused"],
    },
    {
      cat: "upcoming",
      img: "assets/project-future.jpg",
      title: "Future Full Stack Project",
      desc: "A dedicated space highlighting upcoming full-stack applications currently under development as part of continuous learning and skill advancement.",
      stack: ["React", "Node.js", "PostgreSQL", "Cloud"],
      features: [
        "Authentication",
        "Role-based access",
        "Scalable architecture",
        "CI/CD pipeline",
      ],
      stats: ["In progress", "2026", "Learning build"],
    },
  ];

  $("#projectGrid").innerHTML = projects
    .map(
      (p, i) => `
    <article class="glass project reveal" data-cat="${p.cat}">
      <figure><img loading="lazy" src="${p.img}" width="1024" height="640" alt="${p.title} preview" /></figure>
      <div class="project-body">
        <span class="project-index mono">Project 0${i + 1}</span>
        <h3>${p.title}</h3>
        <p class="muted">${p.desc}</p>
        <div class="stack">${p.stack.map((t) => `<span>${t}</span>`).join("")}</div>
        <ul class="ticks">${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <div class="project-stats">${p.stats.map((s) => `<span>${s}</span>`).join("")}</div>
        <div class="project-links">
          <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
          <a href="#" target="_self">Live demo</a>
        </div>
      </div>
    </article>`,
    )
    .join("");

  const strengths = [
    [
      "Strong Learning Ability",
      "Quickly adapts to new technologies and development environments.",
    ],
    [
      "Problem-Solving Mindset",
      "Approaches challenges logically and systematically.",
    ],
    [
      "Consistency & Discipline",
      "Maintains continuous learning and skill development.",
    ],
    [
      "Communication Skills",
      "Capable of explaining technical concepts clearly and effectively.",
    ],
    [
      "Team Collaboration",
      "Works effectively with others while remaining accountable.",
    ],
    [
      "Engineering Perspective",
      "Focuses on scalable, maintainable, user-centered solutions.",
    ],
  ];
  $("#strengths").innerHTML = strengths
    .map(
      ([t, d], i) => `
    <article class="glass card reveal"><span class="mono" style="color:var(--primary)">0${i + 1}</span><h3>${t}</h3><p class="muted">${d}</p></article>`,
    )
    .join("");

  const posts = [
    [
      "My Journey Into Web Development",
      "How curiosity turned into a daily practice of shipping.",
    ],
    [
      "JavaScript Fundamentals Every Beginner Should Know",
      "Scope, closures, async — the concepts that unlock everything.",
    ],
    [
      "Git & GitHub: Version Control Essentials",
      "A practical workflow for solo and team projects.",
    ],
    [
      "Building My First Professional Portfolio",
      "Design decisions, performance budget, and lessons learned.",
    ],
    [
      "Lessons Learned While Studying Computer Science",
      "What theory actually gives you as a developer.",
    ],
  ];
  $("#blogGrid").innerHTML = posts
    .map(
      (p, i) => `
    <article class="glass card post reveal"><span class="mono">Article 0${i + 1}</span><h3>${p[0]}</h3><p class="muted">${p[1]}</p><a href="#blog">Read more →</a></article>`,
    )
    .join("");

  const quotes = [
    [
      "Araf explains complex concepts in a simple and understandable way. His guidance significantly improved my academic performance.",
      "Tuition Student",
      "Class 10",
    ],
    [
      "Dedicated, disciplined, and highly motivated. He consistently demonstrates a strong willingness to learn and improve.",
      "Academic Mentor",
      "University",
    ],
    [
      "Reliable team member with excellent communication and problem-solving skills.",
      "Project Collaborator",
      "Team project",
    ],
  ];
  const dots = $("#dots");
  dots.innerHTML = quotes.map((_, i) => `<b data-i="${i}"></b>`).join("");
  let qi = 0;
  function renderQuote() {
    const [q, w, r] = quotes[qi];
    $("#quote").textContent = "“" + q + "”";
    $("#who").textContent = w;
    $("#role").textContent = r;
    $$("#dots b").forEach((b, i) => b.classList.toggle("on", i === qi));
  }
  $("#nextQ").addEventListener("click", () => {
    qi = (qi + 1) % quotes.length;
    renderQuote();
  });
  $("#prevQ").addEventListener("click", () => {
    qi = (qi - 1 + quotes.length) % quotes.length;
    renderQuote();
  });
  dots.addEventListener("click", (e) => {
    if (e.target.dataset.i) {
      qi = +e.target.dataset.i;
      renderQuote();
    }
  });
  renderQuote();
  setInterval(() => {
    qi = (qi + 1) % quotes.length;
    renderQuote();
  }, 7000);

  /* ---------- github dashboard (live via GitHub API) ---------- */
  // Set your GitHub username here to pull real data. Leave blank ("") to
  // keep the illustrative placeholder numbers instead.
  const GITHUB_USERNAME = "arafsarkar13";

  const dashCaption = $("#dashCaption");
  const heat = $("#heatmap");

  function renderHeatmap(levels) {
    heat.innerHTML = levels.map((l) => `<i class="l${l}"></i>`).join("");
  }

  function renderIllustrativeGithub() {
    let total = 0;
    const levels = [];
    for (let i = 0; i < 371; i++) {
      const r = Math.random();
      const lvl = r > 0.93 ? 4 : r > 0.8 ? 3 : r > 0.6 ? 2 : r > 0.35 ? 1 : 0;
      total += lvl * 2;
      levels.push(lvl);
    }
    renderHeatmap(levels);
    $("#contribTotal").textContent = total + " contributions · last year";
    $("#repoCount").dataset.count = "18";
    $("#commitCount").dataset.count = "640";
    $("#streakCount").dataset.count = "26";
    [$("#repoCount"), $("#commitCount"), $("#streakCount")].forEach(finalizeCounter);
    renderLangBars([
      ["JavaScript", 46],
      ["HTML", 22],
      ["CSS", 18],
      ["Node.js", 9],
      ["Other", 5],
    ]);
    if (dashCaption)
      dashCaption.textContent =
        "Illustrative snapshot — set GITHUB_USERNAME in script.js to render live data.";
  }

  function renderLangBars(langs) {
    $("#langBars").innerHTML = langs
      .map(
        ([n, v]) => `
      <div class="lang-row"><div class="lang-top"><span>${n}</span><span class="muted mono">${v}%</span></div>
      <div class="bar"><i data-level="${v}"></i></div></div>`,
      )
      .join("");
    finalizeLangBars();
  }
  function finalizeCounter(el) {
    if (el && el.dataset.done) {
      // already animated once with placeholder data — correct the final value
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    }
  }
  function finalizeLangBars() {
    const langsCard = $("#langBars")?.closest(".reveal");
    if (langsCard && langsCard.classList.contains("in")) {
      $$("#langBars .bar i").forEach((b) => (b.style.width = b.dataset.level + "%"));
    }
  }

  async function loadLiveGithub(username) {
    // 1) profile — official GitHub REST API, no auth needed for this endpoint
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error(`GitHub user lookup failed (${userRes.status})`);
    const user = await userRes.json();

    // 2) contribution calendar — GitHub's own API only exposes this via
    // authenticated GraphQL, which can't be called safely from the browser
    // (it'd expose a token to every visitor). This uses a public, unofficial,
    // read-only mirror of the same calendar data instead.
    const contribRes = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    );
    if (!contribRes.ok) throw new Error("Contribution calendar fetch failed");
    const contrib = await contribRes.json();
    const days = contrib.contributions || [];
    const totalContribs = days.reduce((sum, d) => sum + d.count, 0);
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      const isToday = i === days.length - 1;
      if (days[i].count > 0) streak++;
      else if (isToday) continue; // today may just not have activity yet
      else break;
    }
    renderHeatmap(days.map((d) => d.level ?? 0));
    $("#contribTotal").textContent = totalContribs + " contributions · last year";

    // 3) repos + languages — official REST API
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
    );
    if (!reposRes.ok) throw new Error("Repo list fetch failed");
    const repos = await reposRes.json();
    const langCounts = {};
    let counted = 0;
    repos
      .filter((r) => !r.fork && r.language)
      .forEach((r) => {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        counted++;
      });
    const langs = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => [name, Math.round((count / counted) * 100)]);

    $("#repoCount").dataset.count = String(user.public_repos ?? repos.length);
    $("#commitCount").dataset.count = String(totalContribs);
    $("#commitCount").dataset.suffix = "";
    $("#streakCount").dataset.count = String(streak);
    [$("#repoCount"), $("#commitCount"), $("#streakCount")].forEach(finalizeCounter);
    if (langs.length) renderLangBars(langs);
    if (dashCaption)
      dashCaption.innerHTML = `Live data from <a href="https://github.com/${username}" target="_blank" rel="noopener">github.com/${username}</a> via the GitHub API.`;
  }

  if (GITHUB_USERNAME) {
    loadLiveGithub(GITHUB_USERNAME).catch((err) => {
      console.warn("Live GitHub data unavailable, showing illustrative snapshot:", err);
      renderIllustrativeGithub();
    });
  } else {
    renderIllustrativeGithub();
  }

  /* ---------- filters ---------- */
  function wireFilter(barSel, itemSel) {
    const bar = $(barSel);
    if (!bar) return;
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip-btn");
      if (!btn) return;
      $$(".chip-btn", bar).forEach((b) =>
        b.classList.toggle("is-active", b === btn),
      );
      const f = btn.dataset.filter;
      $$(itemSel).forEach((el) =>
        el.classList.toggle("hide", f !== "all" && el.dataset.cat !== f),
      );
    });
  }
  wireFilter("#skillFilters", ".skill");
  wireFilter("#projectFilters", ".project");

  /* ---------- reveal + counters + bars (with stagger + direction) ---------- */
  // Give siblings inside the same parent a small incremental delay, and — for
  // grids with several items — alternate the direction each one flies in from,
  // so sections feel dynamic instead of every card sliding up the same way.
  const revealDirections = ["reveal-left", "reveal-right", "reveal-scale", "reveal-down"];
  const revealGroups = new Map(); // parent -> array of its .reveal children, in order
  $$(".reveal").forEach((el) => {
    const parent = el.parentElement;
    if (!revealGroups.has(parent)) revealGroups.set(parent, []);
    revealGroups.get(parent).push(el);
  });
  revealGroups.forEach((siblings) => {
    siblings.forEach((el, idx) => {
      el.style.transitionDelay = Math.min(idx, 6) * 70 + "ms"; // cap so long grids don't lag too far
      if (siblings.length > 1) el.classList.add(revealDirections[idx % revealDirections.length]);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        $$(".bar i", en.target).forEach(
          (b) => (b.style.width = b.dataset.level + "%"),
        );
        $$("[data-count]", en.target).forEach(countUp);
        if (en.target.matches("[data-count]")) countUp(en.target);
        io.unobserve(en.target);
      });
    },
    { threshold: 0.15 },
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- subtle hero parallax ---------- */
  if (!reduced) {
    const floaters = $(".floaters");
    if (floaters) {
      let ticking = false;
      addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const y = Math.min(window.scrollY, 600);
            floaters.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
            ticking = false;
          });
        },
        { passive: true },
      );
    }
  }

  /* ---------- profile portrait scroll parallax ---------- */
  // Drifts, tilts and scales the hero portrait as the page scrolls, driven
  // by CSS custom properties consumed in styles.css (.profile-top img).
  if (!reduced) {
    const portrait = $(".profile-top img");
    if (portrait) {
      let pTicking = false;
      const updatePortrait = () => {
        const rect = portrait.getBoundingClientRect();
        // 0 when the portrait sits at its natural spot, growing (either
        // sign) as it scrolls up out of / down into view.
        const centerOffset = rect.top + rect.height / 2 - innerHeight / 2;
        const progress = Math.max(-1, Math.min(1, centerOffset / (innerHeight * 0.7)));
        portrait.style.setProperty("--pt-y", (progress * -26).toFixed(2) + "px");
        portrait.style.setProperty("--pt-rot", (progress * 8).toFixed(2) + "deg");
        portrait.style.setProperty("--pt-scale", (1 - Math.abs(progress) * 0.08).toFixed(3));
        pTicking = false;
      };
      addEventListener(
        "scroll",
        () => {
          if (pTicking) return;
          pTicking = true;
          requestAnimationFrame(updatePortrait);
        },
        { passive: true },
      );
      updatePortrait();
    }
  }

  /* ---------- floating scroll portrait (outside the hero card) ---------- */
  // A second copy of the portrait that lives fixed on the page, separate
  // from the one inside the profile card. As the page scrolls it: (1)
  // swings from edge-on to face-on over the first ~90% of a viewport height
  // scrolled, and (2) travels down a vertical track tied to overall scroll
  // progress through the whole document, so it's genuinely in a different
  // place a moment later rather than sitting static.
  (function floatingPortrait() {
    const wrap = $("#floatPortrait");
    if (!wrap || reduced) return;
    let fTicking = false;
    const TRACK_TOP_VH = 14,
      TRACK_BOTTOM_VH = 76;
    const updateFloat = () => {
      const scrollableHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const overall = Math.min(1, Math.max(0, scrollY / scrollableHeight));
      const topVh = TRACK_TOP_VH + (TRACK_BOTTOM_VH - TRACK_TOP_VH) * overall;
      wrap.style.top = topVh.toFixed(2) + "vh";

      const flipRange = innerHeight * 0.9;
      const flip = Math.min(1, Math.max(0, scrollY / flipRange));
      const rot = -72 + flip * 72; // edge-on sliver -> facing forward
      wrap.style.setProperty("--fp-rot", rot.toFixed(2) + "deg");
      wrap.style.opacity = (0.28 + flip * 0.72).toFixed(2);
      fTicking = false;
    };
    addEventListener(
      "scroll",
      () => {
        if (fTicking) return;
        fTicking = true;
        requestAnimationFrame(updateFloat);
      },
      { passive: true },
    );
    updateFloat();
  })();

  /* ---------- live clock ---------- */
  (function liveClock() {
    const timeEl = $("#clockTime"), metaEl = $("#clockMeta"), navEl = $("#navClockTime");
    if (!timeEl && !navEl) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    function tick() {
      const now = new Date();
      const hm = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      if (timeEl) timeEl.textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      if (metaEl) {
        const day = now.toLocaleDateString(undefined, { weekday: "short" });
        const date = now.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        const tzShort = now.toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop();
        metaEl.textContent = `${day} · ${date} · ${tzShort || tz}`;
      }
      if (navEl) navEl.textContent = hm; // compact nav version updates once/minute in effect, no seconds needed
    }
    tick();
    setInterval(tick, 1000);
  })();

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = +el.dataset.count,
      suffix = el.dataset.suffix || "";
    const dur = 1400,
      start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- active section in nav ---------- */
  const sections = $$("main section[id]");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          $$("#navLinks a").forEach((a) =>
            a.classList.toggle(
              "active",
              a.getAttribute("href") === "#" + en.target.id,
            ),
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- contact form (real-time send via EmailJS) ---------- */
  // 1. Create a free account at https://www.emailjs.com
  // 2. Add an Email Service (e.g. Gmail) → copy its Service ID below.
  // 3. Create an Email Template with variables: {{from_name}} {{from_email}}
  //    {{subject}} {{message}} → copy its Template ID below.
  // 4. Account → API Keys → copy your Public Key below.
  const EMAILJS_CONFIG = {
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID",
  };
  const emailjsReady =
    typeof emailjs !== "undefined" &&
    EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY";
  if (emailjsReady) emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

  /* ---------- silent WhatsApp delivery (via CallMeBot) ---------- */
  // 1. Save +34 644 59 71 15 as a contact on the phone that owns +8801518972367.
  // 2. From +8801518972367, WhatsApp that contact: "I allow callmebot to send me messages"
  // 3. CallMeBot replies with your personal apiKey — paste it below.
  // Docs: https://www.callmebot.com/blog/free-api-whatsapp-messages/
  // Note: this is a free, unofficial, third-party bridge — not run by WhatsApp/Meta.
  // Messages land directly in your WhatsApp with no redirect for the visitor,
  // but delivery isn't 100% guaranteed and it's rate-limited to ~1 msg/minute.
  const WHATSAPP_CONFIG = {
    phone: "8801518972367", // your number, digits only, no + or spaces
    apiKey: "YOUR_CALLMEBOT_APIKEY",
  };
  const whatsappReady = WHATSAPP_CONFIG.apiKey !== "YOUR_CALLMEBOT_APIKEY";

  function sendToWhatsApp(text) {
    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_CONFIG.phone}` +
      `&text=${encodeURIComponent(text)}&apikey=${WHATSAPP_CONFIG.apiKey}`;
    // no-cors: fire-and-forget — CallMeBot doesn't return CORS headers, so we
    // can't read the response, but the request still reaches it in the background.
    return fetch(url, { mode: "no-cors" });
  }

  const form = $("#contactForm"),
    toast = $("#toast"),
    submitBtn = $("#contactSubmit");
  function showToast(msg, isError) {
    toast.textContent = msg;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3800);
  }
  function setError(name, msg) {
    const field = $(`#${name}`).closest(".field");
    field.classList.toggle("invalid", !!msg);
    $(`.error[data-for="${name}"]`).textContent = msg || "";
    $(`#${name}`).setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function setSending(isSending) {
    submitBtn.classList.toggle("is-loading", isSending);
    submitBtn.disabled = isSending;
  }

  const RATE_LIMIT_MS = 45000; // one submission per 45s per browser
  const RATE_LIMIT_KEY = "contactLastSent";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (id) => $("#" + id).value.trim();

    // Honeypot: bots fill every field, real users never see #company
    if (v("company")) {
      showToast("Thanks! Message sent.");
      form.reset();
      return;
    }

    // Rate limit: prevent rapid-fire spam submissions
    const last = +localStorage.getItem(RATE_LIMIT_KEY) || 0;
    const waited = Date.now() - last;
    if (waited < RATE_LIMIT_MS) {
      const secs = Math.ceil((RATE_LIMIT_MS - waited) / 1000);
      showToast(`Please wait ${secs}s before sending another message.`, true);
      return;
    }

    let ok = true;
    const checks = {
      name: v("name").length < 2 ? "Please enter your full name." : "",
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))
        ? "Enter a valid email address."
        : "",
      subject: v("subject").length < 3 ? "Add a short subject." : "",
      message:
        v("message").length < 10
          ? "Message should be at least 10 characters."
          : "",
    };
    Object.entries(checks).forEach(([k, msg]) => {
      setError(k, msg);
      if (msg) ok = false;
    });
    if (!ok) {
      showToast("Please fix the highlighted fields.", true);
      return;
    }

    const waMessage = `New portfolio message\nFrom: ${v("name")} (${v("email")})\nSubject: ${v("subject")}\n\n${v("message")}`;

    if (!emailjsReady && !whatsappReady) {
      // Neither channel configured yet — keep the form usable via mailto fallback.
      const body = encodeURIComponent(
        `${v("message")}\n\n— ${v("name")} (${v("email")})`,
      );
      window.location.href = `mailto:arafsarkar13@gmail.com?subject=${encodeURIComponent(v("subject"))}&body=${body}`;
      showToast("Opening your email client (no send channel configured yet)…");
      form.reset();
      return;
    }

    setSending(true);
    const sends = [];
    if (emailjsReady) {
      sends.push(
        emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
          from_name: v("name"),
          from_email: v("email"),
          subject: v("subject"),
          message: v("message"),
        }),
      );
    }
    if (whatsappReady) sends.push(sendToWhatsApp(waMessage));

    Promise.allSettled(sends).then((results) => {
      const anySucceeded = results.some((r) => r.status === "fulfilled");
      if (anySucceeded) {
        localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
        showToast("Message sent! I'll get back to you soon.");
        form.reset();
      } else {
        console.error("Contact send failed:", results);
        showToast("Couldn't send right now — please try again or email me directly.", true);
      }
      setSending(false);
    });
  });
  $$("#contactForm input, #contactForm textarea").forEach((el) => {
    el.addEventListener("input", () => setError(el.id, ""));
  });

  $("#year").textContent = new Date().getFullYear();

  /* =========================================================
     Easter egg: Konami-triggered terminal + Matrix rain
     ========================================================= */

  /* ---------- console message for anyone peeking at devtools ---------- */
  console.log(
    "%cAS",
    "font-family: 'Sora', sans-serif; font-weight: 800; font-size: 42px; background: linear-gradient(120deg,#d3e1f8,#4c6690 55%,#2b3b58); -webkit-background-clip: text; background-clip: text; color: transparent;",
  );
  console.log(
    "%cLooking at the source, huh? I like that.\nHey, I'm Araf — CSE student, web dev, future software engineer.\nIf you're hiring or just curious: arafsarkar13@gmail.com\nPS: try the Konami code on this page. ↑ ↑ ↓ ↓ ← → ← → B A",
    "font-family: monospace; font-size: 13px; color: #9aa6c4;",
  );

  /* ---------- build the DOM ---------- */
  const eggOverlay = document.createElement("div");
  eggOverlay.className = "egg-overlay";
  eggOverlay.id = "eggOverlay";
  eggOverlay.innerHTML = `
    <div class="egg-term" role="dialog" aria-modal="true" aria-label="Hidden terminal">
      <div class="egg-term-bar">
        <span></span><span></span><span></span>
        <span class="egg-term-title">araf@portfolio: ~/secret</span>
      </div>
      <div class="egg-term-body" id="eggBody"></div>
      <div class="egg-term-input-row">
        <span class="egg-prompt">&gt;</span>
        <input class="egg-term-input" id="eggInput" autocomplete="off" spellcheck="false" placeholder="type 'help'" />
      </div>
    </div>`;
  document.body.appendChild(eggOverlay);

  const matrixCanvas = document.createElement("canvas");
  matrixCanvas.id = "eggMatrix";
  document.body.appendChild(matrixCanvas);

  const eggBody = $("#eggBody");
  const eggInput = $("#eggInput");

  function eggPrintln(html, cls) {
    const line = document.createElement("div");
    line.className = "egg-line" + (cls ? " " + cls : "");
    line.innerHTML = html;
    eggBody.appendChild(line);
    eggBody.scrollTop = eggBody.scrollHeight;
  }

  function eggBootIntro() {
    eggBody.innerHTML = "";
    eggPrintln(`<span class="egg-grad">You found the secret terminal.</span>`);
    eggPrintln(
      `Welcome. This is Araf's portfolio, running a tiny fake shell for fun.`,
    );
    eggPrintln(`Type <b>help</b> to see what this thing can do.`, "egg-echo");
    eggPrintln("");
  }

  /* ---------- commands ---------- */
  const eggCommands = {
    help: () =>
      [
        "Available commands:",
        "  whoami        - who runs this site",
        "  skills        - a quick skills dump",
        "  projects      - featured projects",
        "  hire          - why you should hire Araf",
        "  contact       - how to reach out",
        "  theme         - toggle dark/light",
        "  matrix        - enter the matrix (esc to exit)",
        "  sudo hire araf- try it",
        "  clear         - clear the screen",
        "  exit          - close this terminal",
      ].join("\n"),
    whoami: () =>
      "Md Araf Islam Sarkar — CSE student, web developer, future software engineer. Based in Bangladesh.",
    skills: () =>
      "HTML · CSS · JavaScript · Node.js · Express · MongoDB · MySQL · Git/GitHub · Data Structures & Algorithms.",
    projects: () =>
      "Personal Portfolio · Student Management System · E-Commerce Landing Page · (more shipping in 2026).",
    hire: () =>
      "Fast learner, ships consistently, explains things clearly (3+ yrs tutoring), and actually finishes what he starts.",
    contact: () =>
      "Email: arafsarkar13@gmail.com  ·  GitHub: github.com/arafsarkar13  ·  LinkedIn: linkedin.com/in/arafsarkar13",
    theme: () => {
      const btn = $("#themeToggle");
      if (btn) btn.click();
      return "Theme toggled.";
    },
    clear: () => {
      eggBody.innerHTML = "";
      return null;
    },
    exit: () => {
      eggClose();
      return null;
    },
    matrix: () => {
      eggStartMatrix();
      return "Entering the matrix... press ESC to return.";
    },
    "sudo hire araf": () => "Permission granted. Redirecting to #contact...",
  };

  function eggRunCommand(raw) {
    const cmdKey = raw.trim().toLowerCase();
    eggPrintln(
      `<span class="egg-prompt">&gt;</span> <span class="egg-echo">${eggEscapeHtml(raw)}</span>`,
    );
    if (!cmdKey) return;
    if (cmdKey === "sudo hire araf") {
      const out = eggCommands["sudo hire araf"]();
      eggPrintln(out);
      setTimeout(() => {
        eggClose();
        $("#contact")?.scrollIntoView({ behavior: "smooth" });
      }, 900);
      return;
    }
    const fn = eggCommands[cmdKey];
    if (!fn) {
      eggPrintln(
        `command not found: ${eggEscapeHtml(cmdKey)} — type 'help'`,
        "egg-echo",
      );
      return;
    }
    const out = fn();
    if (out) eggPrintln(eggEscapeHtml(out).replace(/\n/g, "<br>"));
  }

  function eggEscapeHtml(s) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  eggInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const v = eggInput.value;
      eggInput.value = "";
      eggRunCommand(v);
    }
  });

  function eggOpen() {
    eggOverlay.classList.add("show");
    eggBootIntro();
    setTimeout(() => eggInput.focus(), 50);
    document.addEventListener("keydown", eggOnEscClose);
  }
  function eggClose() {
    eggOverlay.classList.remove("show");
    document.removeEventListener("keydown", eggOnEscClose);
  }
  function eggOnEscClose(e) {
    if (e.key === "Escape") eggClose();
  }
  eggOverlay.addEventListener("click", (e) => {
    if (e.target === eggOverlay) eggClose();
  });

  /* ---------- Konami code ---------- */
  const konami = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiProgress = 0;
  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konami[konamiProgress]) {
      konamiProgress++;
      if (konamiProgress === konami.length) {
        konamiProgress = 0;
        eggOpen();
      }
    } else {
      konamiProgress = key === konami[0] ? 1 : 0;
    }
  });

  /* ---------- Matrix rain ---------- */
  let matrixRunning = false,
    matrixRaf;
  function eggStartMatrix() {
    eggClose();
    matrixCanvas.classList.add("show");
    const ctx = matrixCanvas.getContext("2d");
    let w, h, cols, drops;
    function size() {
      w = matrixCanvas.width = innerWidth;
      h = matrixCanvas.height = innerHeight;
      cols = Math.floor(w / 16);
      drops = new Array(cols).fill(1);
    }
    size();
    const chars = "アイウエオカキクケコ01araf<>/{}0123456789";
    matrixRunning = true;
    function draw() {
      if (!matrixRunning) return;
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4c6690";
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 16, y * 16);
        if (y * 16 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      matrixRaf = requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener("resize", size);
    function stop(e) {
      if (e.key === "Escape") {
        matrixRunning = false;
        cancelAnimationFrame(matrixRaf);
        matrixCanvas.classList.remove("show");
        window.removeEventListener("resize", size);
        document.removeEventListener("keydown", stop);
      }
    }
    document.addEventListener("keydown", stop);
  }
})();
