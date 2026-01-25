(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const drawer = qs("#drawer");
  const scrim = qs("#scrim");
  const openBtn = qs("#openDrawer");
  const closeBtn = qs("#closeDrawer");
  const warp = qs("#warp");
  const progressBar = qs("#progressBar");
  const toTop = qs("#toTop");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Drawer menu
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

  // Assign ragdoll order (drop-in)
  const drops = qsa(".drop");
  drops.forEach((el, i) => el.style.setProperty("--i", i));

  // Reveal on scroll + trigger ragdoll when revealed
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

  // Smooth anchor scrolling
  const smoothScrollTo = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  };

  // Warp transition for internal page navigation
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

    // Close drawer when clicking inside it
    if (a.classList.contains("drawer-link") || a.classList.contains("drawer-post")) {
      closeDrawer();
    }

    // In-page anchors
    if (href.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(href);
      return;
    }

    // Internal navigation with warp
    if (isInternal(href)) {
      if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();

      if (!prefersReduced && warp) {
        warp.classList.add("on");
        setTimeout(() => (window.location.href = href), 420);
      } else {
        window.location.href = href;
      }
    }
  });

  // Scroll progress bar + to-top button
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

  // Back to top
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }
})();
