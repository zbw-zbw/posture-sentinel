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

export function playAlertSound(type: "warning" | "bad", volume: number = 0.5): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const freq = type === "warning" ? 523 : 659;
  const count = type === "warning" ? 2 : 3;
  const noteDuration = 0.15;
  const gap = 0.2;

  for (let i = 0; i < count; i++) {
    const startTime = ctx.currentTime + i * (noteDuration + gap);

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    // Gain envelope (fade in/out for softness)
    const gain = ctx.createGain();
    const vol = volume / 100;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol * 0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration + 0.01);
  }
}
