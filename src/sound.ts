// Small synthesized sound effects, so no audio files need to be shipped.
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, gain: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

/** Bright two-note chime for collecting a card. */
export function playCollect() {
  tone(659.25, 0, 0.5, 'triangle', 0.12);
  tone(987.77, 0.08, 0.7, 'triangle', 0.1);
  tone(1318.5, 0.16, 0.9, 'sine', 0.05);
}

/** Low thud for putting a card back. */
export function playRemove() {
  tone(196, 0, 0.25, 'sine', 0.15);
  tone(130.81, 0.04, 0.3, 'sine', 0.1);
}

/** Card-shuffle-ish tick for tabs and filters. */
export function playTick() {
  tone(1800, 0, 0.04, 'square', 0.015);
}

/** Fanfare for completing the whole collection or a faction. */
export function playFanfare() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.9, 'triangle', 0.09));
}
