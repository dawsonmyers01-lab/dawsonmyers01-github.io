(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const drawer = qs("#drawer");
  const scrim = qs("#scrim");
  const openBtn = qs("#openDrawer");
  const closeBtn = qs("#closeDrawer");
  const progressBar = qs("#progressBar");
  const toTop = qs("#toTop");

  const warpLayer = qs("#warpLayer");
  const warpCanvas = qs("#warpCanvas");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Drawer
  const openDrawer = () => {
    if (!drawer || !scrim) return;
    drawer.classList.add("on");
    scrim.classList.add("on");
    drawer.setAttribute("aria-hidden", "false");
  };
  const closeDrawer = () => {
    if (!drawer || !scrim) return;
    drawer.classList.remove("on");
    scrim.classList.remove("on");
    drawer.setAttribute("aria-hidden", "true");
  };
  openBtn && openBtn.addEventListener("click", openDrawer);
  closeBtn && closeBtn.addEventListener("click", closeDrawer);
  scrim && scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // Drop order
  const drops = qsa(".drop");
  drops.forEach((el, i) => el.style.setProperty("--i", i));

  // Reveal on scroll (and trigger ragdoll drop)
  const revealEls = qsa(".reveal");
  const makeVisible = (el) => {
    el.classList.add("in");
    if (el.classList.contains("drop")) el.classList.add("in");
  };

  if (prefersReduced) {
    revealEls.forEach(makeVisible);
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            makeVisible(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Smooth anchors
  const smoothScrollTo = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  };

  // Hyperspace / tunnel warp transition (Canvas star-streaks)
  // Inspired by common "warp speed" starfield approaches and canvas demos. :contentReference[oaicite:1]{index=1}
  let warpRunning = false;
  const startWarp = (onDone, durationMs = 650) => {
    if (!warpLayer || !warpCanvas || prefersReduced) {
      onDone();
      return;
    }
    if (warpRunning) return;
    warpRunning = true;

    const ctx = warpCanvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, cx = 0, cy = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      cx = w / 2;
      cy = h / 2;

      warpCanvas.width = Math.floor(w * dpr);
      warpCanvas.height = Math.floor(h * dpr);
      warpCanvas.style.width = `${w}px`;
      warpCanvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    // Starfield params
    const STAR_COUNT = Math.min(1200, Math.floor((w * h) / 1100));
    const DEPTH = 900; // z depth
    const stars = [];

    const rand = (min, max) => Math.random() * (max - min) + min;

    const resetStar = (s) => {
      // spread in a square around center, more dense near center
      const spread = Math.max(w, h) * 0.65;
      s.x = rand(-spread, spread);
      s.y = rand(-spread, spread);
      s.z = rand(1, DEPTH);
      s.px = null;
      s.py = null;
    };

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = {};
      resetStar(s);
      stars.push(s);
    }

    warpLayer.classList.add("on");

    const t0 = performance.now();
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const draw = (now) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOut(t);

      // ramp speed up hard near the end (feels like "jump")
      const speed = 10 + eased * 55;
      const trail = 0.12 + eased * 0.22;

      // fade previous frame slightly for motion blur
      ctx.fillStyle = `rgba(0,0,0,${trail})`;
      ctx.fillRect(0, 0, w, h);

      // subtle center glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
      glow.addColorStop(0, `rgba(209,179,139,${0.10 + eased * 0.14})`);
      glow.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // draw stars
      for (const s of stars) {
        s.z -= speed;
        if (s.z <= 1) resetStar(s);

        const k = 380 / s.z; // projection scale
        const x = cx + s.x * k;
        const y = cy + s.y * k;

        // outside screen? respawn
        if (x < -100 || x > w + 100 || y < -100 || y > h + 100) {
          resetStar(s);
          continue;
        }

        // previous point for streak
        if (s.px === null) {
          s.px = x;
          s.py = y;
        }

        const alpha = Math.min(1, 1.1 - s.z / DEPTH);
        const width = 0.6 + alpha * (1.6 + eased * 1.8);

        // star color shifts slightly between tan and teal
        const r = 209;
        const g = 179 + Math.floor(eased * 12);
        const b = 139 + Math.floor(alpha * 20);

        ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 + alpha * 0.65})`;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(x, y);
        ctx.stroke();

        s.px = x;
        s.py = y;
      }

      if (t < 1) {
        requestAnimationFrame(draw);
      } else {
        // tiny extra pop for punch
        setTimeout(() => {
          warpLayer.classList.remove("on");
          warpRunning = false;
          onDone();
        }, 30);
      }
    };

    // start with a clean dark frame so no weird stripes appear
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, w, h);

    window.addEventListener("resize", resize, { passive: true, once: true });
    requestAnimationFrame(draw);
  };

  // Click handling: anchors smooth scroll; internal links warp
  const isInternal = (href) => {
    if (!href) return false;
    if (href.startsWith("http")) return false;
    if (href.startsWith("mailto:")) return false;
    return true;
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    // close drawer for its links
    if (a.classList.contains("drawer-link") || a.classList.contains("drawer-post")) {
      closeDrawer();
    }

    // anchor jump
    if (href.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(href);
      return;
    }

    // internal page nav with warp
    if (isInternal(href)) {
      if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      startWarp(() => (window.location.href = href));
    }
  });

  // Scroll progress + to-top
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = `${progress}%`;

    if (toTop) {
      if (scrollTop > 520) toTop.classList.add("show");
      else toTop.classList.remove("show");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }
})();
