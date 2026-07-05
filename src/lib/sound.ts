let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

export function initAudio(): void {
  getAudioContext();
}

/**
 * Play alert sound with distinct tones for warning vs bad.
 * - warning: two soft ascending sine tones (C5 → E5), gentle
 * - bad: three sharp descending tones (E5 → D5 → C5), urgent triangle wave
 */
export function playAlertSound(type: "warning" | "bad", volume: number = 0.5): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const vol = volume / 100;

  if (type === "warning") {
    // Two soft ascending tones — gentle nudge
    const notes = [
      { freq: 523, time: 0 },           // C5
      { freq: 659, time: 0.22 },        // E5
    ];
    for (const note of notes) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      const gain = ctx.createGain();
      const start = ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol * 0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    }
  } else {
    // Three sharp descending tones — urgent alert using triangle wave
    const notes = [
      { freq: 659, time: 0 },           // E5
      { freq: 587, time: 0.18 },        // D5
      { freq: 523, time: 0.36 },        // C5
    ];
    for (const note of notes) {
      const osc = ctx.createOscillator();
      osc.type = "triangle"; // sharper, more alerting than sine
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      const gain = ctx.createGain();
      const start = ctx.currentTime + note.time;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol * 0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.17);
    }
  }
}

/**
 * Play a gentle notification chime for pomodoro phase transitions.
 * - focus: ascending C5→E5→G5 (let's go)
 * - break: descending G5→E5→C5 (time to rest)
 */
export function playPhaseChangeSound(phase: "focus" | "break"): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") ctx.resume();

  const notes = phase === "focus"
    ? [{ freq: 523, t: 0 }, { freq: 659, t: 0.15 }, { freq: 784, t: 0.30 }] // C5→E5→G5
    : [{ freq: 784, t: 0 }, { freq: 659, t: 0.15 }, { freq: 523, t: 0.30 }]; // G5→E5→C5

  for (const n of notes) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.t);
    const gain = ctx.createGain();
    const s = ctx.currentTime + n.t;
    gain.gain.setValueAtTime(0, s);
    gain.gain.linearRampToValueAtTime(0.15, s + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, s + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(s);
    osc.stop(s + 0.27);
  }
}
