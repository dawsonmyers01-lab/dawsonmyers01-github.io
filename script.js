// Smooth, simple page transitions for internal links (fun, not heavy)
(function () {
  const isInternal = (href) => {
    if (!href) return false;
    if (href.startsWith("#")) return false;
    if (href.startsWith("http")) return false;
    if (href.startsWith("mailto:")) return false;
    return true;
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!isInternal(href)) return;

    // Let normal behavior happen for new tabs, etc.
    if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    document.body.classList.add("leaving");

    setTimeout(() => {
      window.location.href = href;
    }, 180);
  });
})();
