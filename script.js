(function () {
  // Signal that JS loaded
  window.__DM_SITE_READY__ = true;

  // Safety: only enable reveal-hiding when JS is present
  document.body.classList.add("has-js");

  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  const drawer = qs("#drawer");
  const scrim = qs("#scrim");
  const openBtn = qs("#openDrawer");
  const closeBtn = qs("#closeDrawer");

  const progressBar = qs("#progressBar");
  const toTop = qs("#toTop");

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

  // Reveal on scroll
  const revealEls = qsa(".reveal");
  const makeVisible = (el) => el.classList.add("in");

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
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Scroll progress + back to top
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

  // Close drawer when clicking drawer links
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (a.classList.contains("drawer-link") || a.classList.contains("drawer-post")) closeDrawer();
  });
})();
