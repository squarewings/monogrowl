// Motion lifecycle shared by Layout (flag), Waveform and Visualiser (loops).
// Two layers (see SPEC A1): the CSS prefers-reduced-motion block in
// global.scss works with JS disabled; this module handles the rAF loops
// and keeps the existing body[data-motion] kill-switch in sync.

/** Live media query for the user's reduced-motion preference. */
export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Mirrors prefers-reduced-motion onto body[data-motion], on load and on
 * change, so the existing global.scss kill-switch keeps working unchanged.
 */
export function syncMotionFlag(): void {
  const apply = () => {
    document.body.dataset.motion = reducedMotion.matches ? "off" : "on";
  };
  reducedMotion.addEventListener("change", apply);
  apply();
}

/**
 * Runs `draw` on rAF only while `section` intersects the viewport, the
 * document is visible, and motion is allowed. Outside those conditions no
 * frame is scheduled at all (SPEC P4 — no idle rAF spin). `fps` caps the
 * draw rate via elapsed time (Visualiser passes 30 — SPEC N5).
 * Returns a dispose function.
 */
export function rafLoop(
  section: Element,
  draw: (dt: number) => void,
  fps?: number,
): () => void {
  const interval = fps ? 1000 / fps : 0;
  let inView = false;
  let rafId = 0;
  let last = 0;

  const shouldRun = () =>
    inView && !document.hidden && !reducedMotion.matches;

  const tick = (now: number) => {
    rafId = 0;
    if (!shouldRun()) return;
    if (now - last >= interval) {
      draw(now - last);
      last = now;
    }
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!rafId && shouldRun()) {
      last = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
  const sync = () => (shouldRun() ? start() : stop());

  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  io.observe(section);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);

  return () => {
    stop();
    io.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
  };
}
