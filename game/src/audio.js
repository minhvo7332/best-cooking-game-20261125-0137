// Wok Rush — every sound the game makes, synthesized live with WebAudio. No audio files:
// a chop is a short filtered noise burst, the wok sizzles while it cooks, a serve is a
// two-note chime, a burnt dish is a low buzz and a dying order ticks.
export function createSound() {
  let context = null;
  let sizzleNodes = null;
  let muted = false;
  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }
  function tone(frequency, seconds, type, gainValue, when = 0) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }
  function noiseBurst(seconds, filterFrequency, gainValue) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFrequency;
    const gain = ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  }
  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
    pickup() { tone(520, 0.07, 'triangle', 0.12); },
    chop() { noiseBurst(0.08, 2400, 0.25); },
    place() { tone(300, 0.08, 'sine', 0.14); },
    ding() { tone(880, 0.12, 'sine', 0.16); tone(1320, 0.2, 'sine', 0.12, 0.09); },
    serve() { tone(660, 0.12, 'triangle', 0.18); tone(880, 0.14, 'triangle', 0.18, 0.1); tone(1320, 0.3, 'triangle', 0.16, 0.2); },
    fail() { tone(220, 0.25, 'sawtooth', 0.1); tone(160, 0.35, 'sawtooth', 0.1, 0.18); },
    burnt() { tone(140, 0.4, 'square', 0.08); },
    tick() { tone(980, 0.05, 'square', 0.07); },
    startSizzle() {
      const ctx = ensure();
      if (!ctx || muted || sizzleNodes) return;
      const length = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3800;
      const gain = ctx.createGain();
      gain.gain.value = 0.045;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      sizzleNodes = { source, gain };
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try { sizzleNodes.source.stop(); } catch { /* already stopped */ }
      sizzleNodes = null;
    },
  };
}
