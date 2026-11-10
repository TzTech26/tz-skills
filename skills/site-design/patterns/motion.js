// Replay fallback for browsers without scroll-driven CSS. Import once from the layout.
// An element gets .in when it comes into view and loses it only after it has gone back below the
// viewport, so it replays on the next scroll down and never blanks while the visitor scrolls up.
if (!CSS.supports('animation-timeline: view()') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const els = document.querySelectorAll('[data-wipe], [data-rise]');
  // Mark what is already on screen before hiding anything, so nothing flashes.
  for (const el of els) if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
  document.documentElement.classList.add('js');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('in');
        else if (e.boundingClientRect.top > 0) e.target.classList.remove('in');
      }
    },
    { threshold: 0.15 },
  );
  for (const el of els) io.observe(el);
}
