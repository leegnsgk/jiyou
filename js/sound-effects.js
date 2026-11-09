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
  playTone(context, 190, now, 0.16, 0.085, "triangle", 62);
  playTone(context, 470, now, 0.11, 0.026, "sawtooth", 150);

  if (!noiseBuffer) {
    const length = Math.floor(context.sampleRate * 0.12);
    noiseBuffer = context.createBuffer(1, length, context.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  noise.buffer = noiseBuffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1250, now);
  filter.frequency.exponentialRampToValueAtTime(260, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  noise.start(now);
  noise.stop(now + 0.13);
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
