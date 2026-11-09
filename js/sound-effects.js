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

export function playAttackSound(variant = 0) {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const profiles = [
    { sweep: "bandpass", high: 2600, low: 170, pitch: 1, hit: 86, hitTime: 0.16, hitVolume: 0.12, duration: 0.27 },
    { sweep: "lowpass", high: 1250, low: 65, pitch: 0.72, hit: 54, hitTime: 0.12, hitVolume: 0.15, duration: 0.34 },
    { sweep: "bandpass", high: 3400, low: 360, pitch: 1.3, hit: 145, hitTime: 0.19, hitVolume: 0.09, duration: 0.32 },
    { sweep: "highpass", high: 3900, low: 480, pitch: 1.12, hit: 112, hitTime: 0.14, hitVolume: 0.14, duration: 0.23 },
    { sweep: "bandpass", high: 4200, low: 250, pitch: 1.45, hit: 125, hitTime: 0.13, hitVolume: 0.105, duration: 0.22 },
    { sweep: "bandpass", high: 1050, low: 75, pitch: 0.9, hit: 72, hitTime: 0.2, hitVolume: 0.13, duration: 0.38 },
  ];
  const sound = profiles[Math.abs(variant) % profiles.length];

  // Each technique has its own whoosh, impact pitch, and follow-up clash.
  playNoiseBurst(context, now, sound.duration, sound.sweep, sound.high, sound.low, 0.055, 1.1);
  playTone(context, 230 * sound.pitch, now, 0.27, 0.09, "triangle", 42 * sound.pitch);
  playTone(context, 610 * sound.pitch, now + 0.015, 0.19, 0.035, "sawtooth", 125 * sound.pitch);
  playNoiseBurst(context, now + sound.hitTime, 0.24, "lowpass", 1150, sound.hit, sound.hitVolume, 0.6);
  playTone(context, sound.hit, now + sound.hitTime, 0.34, 0.13, "sine", 38 * sound.pitch);
  playTone(context, 280 * sound.pitch, now + sound.hitTime + 0.045, 0.18, 0.045, "square", 72 * sound.pitch);
  playTone(context, 920 * sound.pitch, now + sound.hitTime + 0.23, 0.12, 0.026, "sawtooth", 250 * sound.pitch);
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
