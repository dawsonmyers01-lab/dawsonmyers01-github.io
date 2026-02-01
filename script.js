(function () {
  window.__DM_SITE_READY__ = true;

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const drawer = qs("#drawer");
  const scrim = qs("#scrim");
  const openBtn = qs("#openDrawer");
  const closeBtn = qs("#closeDrawer");

  const progressBar = qs("#progressBar");
  const toTop = qs("#toTop");

  const warpLayer = qs("#warpLayer");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Drawer controls
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

  // Assign ragdoll order
  const drops = qsa(".drop");
  drops.forEach((el, i) => el.style.setProperty("--i", i));

  // Reveal on scroll + trigger drop-in
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

  // Slide + fade transition overlay
  let transitioning = false;
  const startTransition = (onDone) => {
    if (prefersReduced || !warpLayer) {
      onDone();
      return;
    }
    if (transitioning) return;
    transitioning = true;

    document.body.classList.add("is-transitioning");

    requestAnimationFrame(() => {
      warpLayer.classList.add("on");
      setTimeout(() => onDone(), 260);
    });
  };

  window.addEventListener("pageshow", () => {
    if (warpLayer) warpLayer.classList.remove("on");
    document.body.classList.remove("is-transitioning");
    transitioning = false;
  });

  // Click handling: anchors smooth scroll; internal links transition
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

    if (a.classList.contains("drawer-link") || a.classList.contains("drawer-post")) {
      closeDrawer();
    }

    if (href.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(href);
      return;
    }

    if (isInternal(href)) {
      if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      startTransition(() => (window.location.href = href));
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

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }
})();
