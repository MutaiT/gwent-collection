import type { PointerEvent } from 'react';

/** Tilts a card towards the pointer, like inspecting a card in the game's collection screen. */
export function tilt(e: PointerEvent<HTMLElement>, el: HTMLElement | null) {
  if (!el || e.pointerType !== 'mouse') return;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
  el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
  el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
}

export function untilt(el: HTMLElement | null) {
  el?.style.setProperty('--rx', '0deg');
  el?.style.setProperty('--ry', '0deg');
}
