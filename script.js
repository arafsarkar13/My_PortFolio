/* =========================================================
   Portfolio interactions — vanilla JS, no dependencies
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- loader ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => $("#loader").classList.add("done"), 700);
  });

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  /* ---------- nav ---------- */
  const nav = $("#nav"),
    navLinks = $("#navLinks");
  $("#menuToggle").addEventListener("click", (e) => {
    const open = navLinks.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });

  const progress = $("#scrollProgress"),
    fab = $("#fab");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    fab.classList.toggle("show", y > 600);
    const h = document.body.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  fab.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }),
  );

  /* ---------- custom cursor ---------- */
  const cur = $("#cursor"),
    dot = $("#cursorDot");
  if (matchMedia("(hover: hover)").matches) {
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0;
    addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
    });
    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cur.style.transform = `translate(${cx - 17}px, ${cy - 17}px)`;
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
      <div class="skill-top"><strong>${s.n}</strong><em>${s.l}%</em></div>
      <small>${labels[s.c]}</small>
      <div class="bar"><i data-level="${s.l}"></i></div>
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

  /* ---------- github dashboard (illustrative data) ---------- */
  const heat = $("#heatmap");
  let total = 0,
    frag = "";
  for (let i = 0; i < 371; i++) {
    const r = Math.random();
    const lvl = r > 0.93 ? 4 : r > 0.8 ? 3 : r > 0.6 ? 2 : r > 0.35 ? 1 : 0;
    total += lvl * 2;
    frag += `<i class="l${lvl}"></i>`;
  }
  heat.innerHTML = frag;
  $("#contribTotal").textContent = total + " contributions · last year";

  const langs = [
    ["JavaScript", 46],
    ["HTML", 22],
    ["CSS", 18],
    ["Node.js", 9],
    ["Other", 5],
  ];
  $("#langBars").innerHTML = langs
    .map(
      ([n, v]) => `
    <div class="lang-row"><div class="lang-top"><span>${n}</span><span class="muted mono">${v}%</span></div>
    <div class="bar"><i data-level="${v}"></i></div></div>`,
    )
    .join("");

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

  /* ---------- reveal + counters + bars ---------- */
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

  /* ---------- contact form ---------- */
  const form = $("#contactForm"),
    toast = $("#toast");
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function setError(name, msg) {
    const field = $(`#${name}`).closest(".field");
    field.classList.toggle("invalid", !!msg);
    $(`.error[data-for="${name}"]`).textContent = msg || "";
    $(`#${name}`).setAttribute("aria-invalid", msg ? "true" : "false");
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (id) => $("#" + id).value.trim();
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
      showToast("Please fix the highlighted fields.");
      return;
    }
    const body = encodeURIComponent(
      `${v("message")}\n\n— ${v("name")} (${v("email")})`,
    );
    window.location.href = `mailto:arafsarkar13@gmail.com?subject=${encodeURIComponent(v("subject"))}&body=${body}`;
    showToast("Thanks! Opening your email client…");
    form.reset();
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
    "font-family: 'Sora', sans-serif; font-weight: 800; font-size: 42px; background: linear-gradient(120deg,#35e0c8,#5b8cff 55%,#b06cff); -webkit-background-clip: text; background-clip: text; color: transparent;",
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
      ctx.fillStyle = "#35e0c8";
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
