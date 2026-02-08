import {
  DEFAULT_AMBIENT_MUSIC_PROFILE_ID,
  getAmbientMusicProfile,
  normalizeAmbientMusicProfileId
} from "../data/ambientMusicProfiles.js";

const TRACK_FADE_SECONDS = 1.6;
const MASTER_FADE_SECONDS = 0.28;

export function createAmbientAudioDirector({ onStateChange } = {}) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return {
      unlock: async () => false,
      setMuted: () => {},
      setProfile: () => {},
      stop: () => {},
      getState: () => ({
        supported: false,
        ready: false,
        muted: true,
        profileId: DEFAULT_AMBIENT_MUSIC_PROFILE_ID,
        profileName: "浏览器不支持 Web Audio"
      })
    };
  }

  let context = null;
  let masterGain = null;
  let activeTrack = null;
  let currentProfileId = DEFAULT_AMBIENT_MUSIC_PROFILE_ID;
  let muted = false;
  let ready = false;

  function ensureGraph() {
    if (context) {
      return;
    }

    context = new AudioContextCtor();
    masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);
  }

  async function unlock() {
    ensureGraph();
    if (context.state !== "running") {
      await context.resume();
    }
    ready = context.state === "running";
    updateMasterGain();
    emitState();
    return ready;
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    updateMasterGain();
    emitState();
  }

  function setProfile(profileId) {
    const normalized = normalizeAmbientMusicProfileId(profileId);
    if (normalized === currentProfileId && activeTrack) {
      return;
    }

    ensureGraph();
    const nextProfile = getAmbientMusicProfile(normalized);
    const nextTrack = createAmbientTrack(context, nextProfile, masterGain);
    fadeTrack(nextTrack, nextTrack.targetGain, TRACK_FADE_SECONDS);

    const previous = activeTrack;
    if (previous) {
      fadeTrack(previous, 0, TRACK_FADE_SECONDS);
      const disposeDelayMs = Math.max(260, Math.round((TRACK_FADE_SECONDS + 0.2) * 1000));
      window.setTimeout(() => {
        previous.dispose();
      }, disposeDelayMs);
    }

    activeTrack = nextTrack;
    currentProfileId = normalized;
    emitState();
  }

  function stop() {
    if (activeTrack) {
      activeTrack.dispose();
      activeTrack = null;
    }

    if (context) {
      context.close();
    }

    context = null;
    masterGain = null;
    ready = false;
    currentProfileId = DEFAULT_AMBIENT_MUSIC_PROFILE_ID;
    emitState();
  }

  function updateMasterGain() {
    if (!context || !masterGain) {
      return;
    }

    const now = context.currentTime;
    const target = ready && !muted ? 1 : 0;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(target, now + MASTER_FADE_SECONDS);
  }

  function emitState() {
    if (typeof onStateChange !== "function") {
      return;
    }
    onStateChange({
      supported: true,
      ready,
      muted,
      profileId: currentProfileId,
      profileName: getAmbientMusicProfile(currentProfileId).name
    });
  }

  return {
    unlock,
    setMuted,
    setProfile,
    stop,
    getState: () => ({
      supported: true,
      ready,
      muted,
      profileId: currentProfileId,
      profileName: getAmbientMusicProfile(currentProfileId).name
    })
  };
}

function createAmbientTrack(context, profile, destination) {
  const output = context.createGain();
  output.gain.value = 0;
  output.connect(destination);

  const disposers = [];

  for (const layer of profile.drone || []) {
    disposers.push(createDroneLayer(context, output, layer));
  }

  if (profile.wind) {
    disposers.push(createWindLayer(context, output, profile.wind));
  }

  if (profile.pulse) {
    disposers.push(createPatternVoice(context, output, profile.pulse, profile.tempoBpm));
  }

  if (profile.lead) {
    disposers.push(createMelodyVoice(context, output, profile.lead, profile.tempoBpm));
  }

  return {
    output,
    targetGain: clamp(profile.targetGain, 0, 1),
    dispose: () => {
      for (const dispose of disposers) {
        try {
          dispose();
        } catch {
          // Ignore node disposal failures during rapid scene switches.
        }
      }
      try {
        output.disconnect();
      } catch {
        // noop
      }
    }
  };
}

function fadeTrack(track, targetGain, seconds) {
  const gain = track.output.gain;
  const ctx = track.output.context;
  const now = ctx.currentTime;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.linearRampToValueAtTime(clamp(targetGain, 0, 1), now + Math.max(0.04, seconds));
}

function createDroneLayer(context, output, layer) {
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = layer.wave || "triangle";
  osc.frequency.value = Math.max(16, Number(layer.freqHz) || 220);
  osc.detune.value = Number(layer.detuneCents) || 0;
  gain.gain.value = clamp(Number(layer.gain) || 0.16, 0, 1);

  osc.connect(gain);
  gain.connect(output);
  osc.start();

  return () => {
    try {
      osc.stop(context.currentTime + 0.04);
    } catch {
      // noop
    }
    osc.disconnect();
    gain.disconnect();
  };
}

function createWindLayer(context, output, spec) {
  const noise = context.createBufferSource();
  noise.buffer = createPinkNoiseBuffer(context, 1.5);
  noise.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = clamp(Number(spec.lowpassHz) || 700, 120, 5000);
  filter.Q.value = 0.0001;

  const gain = context.createGain();
  gain.gain.value = clamp(Number(spec.gain) || 0.03, 0, 0.3);

  const wobble = context.createOscillator();
  const wobbleGain = context.createGain();
  wobble.type = "sine";
  wobble.frequency.value = clamp(Number(spec.wobbleHz) || 0.06, 0.01, 0.6);
  wobbleGain.gain.value = clamp(Number(spec.wobbleDepthHz) || 120, 0, 1200);

  wobble.connect(wobbleGain);
  wobbleGain.connect(filter.frequency);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  noise.start();
  wobble.start();

  return () => {
    try {
      noise.stop(context.currentTime + 0.02);
    } catch {
      // noop
    }
    try {
      wobble.stop(context.currentTime + 0.02);
    } catch {
      // noop
    }
    noise.disconnect();
    filter.disconnect();
    gain.disconnect();
    wobble.disconnect();
    wobbleGain.disconnect();
  };
}

function createPatternVoice(context, output, spec, tempoBpm) {
  const beatMs = 60000 / Math.max(20, Number(tempoBpm) || 60);
  const stepBeats = Math.max(0.25, Number(spec.stepBeats) || 1);
  const stepMs = beatMs * stepBeats;
  const pattern = Array.isArray(spec.pattern) && spec.pattern.length > 0 ? spec.pattern : [1];

  let step = 0;
  const tick = () => {
    const active = Number(pattern[step % pattern.length]) > 0;
    step += 1;
    if (!active) {
      return;
    }

    spawnTone(context, output, {
      wave: spec.wave || "square",
      freqHz: clamp(Number(spec.freqHz) || 120, 16, 3000),
      gain: clamp(Number(spec.gain) || 0.1, 0, 1),
      durationSec: ((Number(spec.durationBeats) || 0.24) * beatMs) / 1000,
      attackSec: 0.005,
      releaseSec: 0.08
    });
  };

  tick();
  const timer = window.setInterval(tick, stepMs);

  return () => {
    window.clearInterval(timer);
  };
}

function createMelodyVoice(context, output, spec, tempoBpm) {
  const beatMs = 60000 / Math.max(20, Number(tempoBpm) || 60);
  const stepBeats = Math.max(0.25, Number(spec.stepBeats) || 1);
  const stepMs = beatMs * stepBeats;
  const sequence = Array.isArray(spec.sequence) && spec.sequence.length > 0 ? spec.sequence : [0];
  const scale = Array.isArray(spec.scaleHz) && spec.scaleHz.length > 0 ? spec.scaleHz : [220];

  let step = 0;
  const tick = () => {
    const note = Number(sequence[step % sequence.length]);
    step += 1;
    if (!Number.isFinite(note) || note < 0) {
      return;
    }

    const baseIndex = Math.floor(note) % scale.length;
    const octave = Math.floor(note / scale.length);
    const baseHz = clamp(Number(scale[baseIndex]) || 220, 16, 4000);
    const freqHz = baseHz * Math.pow(2, octave);

    spawnTone(context, output, {
      wave: spec.wave || "triangle",
      freqHz,
      gain: clamp(Number(spec.gain) || 0.14, 0, 1),
      durationSec: ((Number(spec.durationBeats) || 0.8) * beatMs) / 1000,
      attackSec: 0.02,
      releaseSec: 0.15
    });
  };

  tick();
  const timer = window.setInterval(tick, stepMs);

  return () => {
    window.clearInterval(timer);
  };
}

function spawnTone(
  context,
  output,
  { wave = "triangle", freqHz = 220, gain = 0.2, durationSec = 0.3, attackSec = 0.01, releaseSec = 0.12 }
) {
  const now = context.currentTime;
  const duration = Math.max(0.04, durationSec);
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = wave;
  oscillator.frequency.value = clamp(freqHz, 16, 6000);

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.linearRampToValueAtTime(gain, now + Math.max(0.004, attackSec));
  envelope.gain.linearRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(envelope);
  envelope.connect(output);

  oscillator.start(now);
  oscillator.stop(now + duration + Math.max(0.02, releaseSec));

  oscillator.addEventListener(
    "ended",
    () => {
      oscillator.disconnect();
      envelope.disconnect();
    },
    { once: true }
  );
}

function createPinkNoiseBuffer(context, seconds) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    previous = (previous + 0.018 * white) / 1.018;
    data[i] = previous * 3.6;
  }

  return buffer;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
