// Pro-feeling motion: drawer menu, smooth internal transitions, scroll reveal, progress bar, to-top button, smooth anchor scroll.

(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const drawer = qs("#drawer");
  const scrim = qs("#scrim");
  const openBtn = qs("#openDrawer");
  const closeBtn = qs("#closeDrawer");
  const transition = qs("#transition");
  const progressBar = qs("#progressBar");
  const toTop = qs("#toTop");

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

  // Smooth anchor scrolling
  const smoothScrollTo = (hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Page transitions for internal links (no external links, no new tabs)
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

    // Drawer links close the menu
    if (a.classList.contains("drawer-link") || a.classList.contains("drawer-post")) {
      closeDrawer();
    }

    // Smooth scroll for in-page anchors
    if (href.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(href);
      return;
    }

    // internal navigation with transition
    if (isInternal(href)) {
      // allow ctrl/cmd click
      if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      if (transition) transition.classList.add("on");

      setTimeout(() => {
        window.location.href = href;
      }, 200);
    }
  });

  // Reveal on scroll (IntersectionObserver)
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    const revealEls = qsa(".reveal");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    qsa(".reveal").forEach((el) => el.classList.add("in"));
  }

  // Scroll progress bar + to-top button
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = `${progress}%`;

    if (toTop) {
      if (scrollTop > 500) toTop.classList.add("show");
      else toTop.classList.remove("show");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Back to top
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
