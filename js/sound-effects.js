let audioContext;
let noiseBuffer;

function getAudioContext() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  try {
    audioContext ??= new Context();
    if (audioContext.state === "suspended") void audioContext.resume().catch(() => {});
    return audioContext;
  } catch {
    return null;
  }
}

function playTone(context, frequency, start, duration, volume, type = "sine", endFrequency = frequency) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency !== frequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.012, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.015);
}

function playNoiseBurst(context, start, duration, filterType, startFrequency, endFrequency, volume, resonance = 0.7) {
  if (!noiseBuffer) {
    const length = Math.floor(context.sampleRate * 0.5);
    noiseBuffer = context.createBuffer(1, length, context.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = noiseBuffer;
  filter.type = filterType;
  filter.Q.setValueAtTime(resonance, start);
  filter.frequency.setValueAtTime(startFrequency, start);
  filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.014, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(start, 0, duration);
  source.stop(start + duration + 0.012);
}

export function playButtonClick() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  playTone(context, 920, now, 0.055, 0.025, "sine", 660);
}

export function playAttackSound() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  // Fast weapon-like sweep, a heavy impact, then a sharp follow-up clash.
  playNoiseBurst(context, now, 0.28, "bandpass", 2200, 180, 0.055, 1.1);
  playTone(context, 230, now, 0.27, 0.09, "triangle", 42);
  playTone(context, 610, now + 0.015, 0.19, 0.035, "sawtooth", 125);
  playNoiseBurst(context, now + 0.16, 0.24, "lowpass", 1150, 115, 0.105, 0.6);
  playTone(context, 96, now + 0.16, 0.34, 0.13, "sine", 38);
  playTone(context, 280, now + 0.205, 0.18, 0.045, "square", 72);
  playTone(context, 920, now + 0.39, 0.12, 0.026, "sawtooth", 250);
}

export function playCelebrationSound() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  [659.25, 783.99, 987.77, 1318.51].forEach((frequency, index) => {
    playTone(context, frequency, now + index * 0.105, 0.34, 0.055, "sine");
    playTone(context, frequency * 2, now + index * 0.105, 0.22, 0.012, "sine");
  });
}
