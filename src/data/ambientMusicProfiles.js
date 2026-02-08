export const DEFAULT_AMBIENT_MUSIC_PROFILE_ID = "jianghu_roam";

export const ambientMusicProfiles = {
  jianghu_roam: {
    id: "jianghu_roam",
    name: "江湖行旅",
    tempoBpm: 54,
    targetGain: 0.12,
    drone: [
      { freqHz: 87.31, wave: "triangle", gain: 0.24, detuneCents: -3 },
      { freqHz: 130.81, wave: "triangle", gain: 0.18, detuneCents: 2 }
    ],
    wind: {
      gain: 0.05,
      lowpassHz: 780,
      wobbleHz: 0.07,
      wobbleDepthHz: 110
    },
    lead: {
      wave: "triangle",
      stepBeats: 1,
      durationBeats: 0.82,
      gain: 0.19,
      scaleHz: [174.61, 196.0, 220.0, 261.63, 293.66],
      sequence: [0, 1, 2, 1, 3, 2, 1, 0, -1, 0, 1, 2, 4, 2, 1, -1]
    }
  },
  market_bustle: {
    id: "market_bustle",
    name: "市井喧声",
    tempoBpm: 76,
    targetGain: 0.14,
    drone: [
      { freqHz: 98.0, wave: "triangle", gain: 0.2, detuneCents: -1 },
      { freqHz: 146.83, wave: "sine", gain: 0.15, detuneCents: 3 }
    ],
    wind: {
      gain: 0.03,
      lowpassHz: 1200,
      wobbleHz: 0.11,
      wobbleDepthHz: 180
    },
    pulse: {
      wave: "square",
      freqHz: 98.0,
      stepBeats: 0.5,
      durationBeats: 0.2,
      gain: 0.13,
      pattern: [1, 0, 1, 0, 1, 1, 0, 1]
    },
    lead: {
      wave: "triangle",
      stepBeats: 0.5,
      durationBeats: 0.34,
      gain: 0.16,
      scaleHz: [220.0, 246.94, 261.63, 329.63, 392.0],
      sequence: [0, 1, 2, 1, 0, -1, 2, 3, 2, 1, 0, -1, 3, 4, 3, 2]
    }
  },
  magistrate_watch: {
    id: "magistrate_watch",
    name: "公廨巡鼓",
    tempoBpm: 66,
    targetGain: 0.13,
    drone: [
      { freqHz: 73.42, wave: "sine", gain: 0.2, detuneCents: -2 },
      { freqHz: 110.0, wave: "triangle", gain: 0.16, detuneCents: 2 }
    ],
    wind: {
      gain: 0.04,
      lowpassHz: 690,
      wobbleHz: 0.06,
      wobbleDepthHz: 120
    },
    pulse: {
      wave: "square",
      freqHz: 73.42,
      stepBeats: 1,
      durationBeats: 0.26,
      gain: 0.16,
      pattern: [1, 0, 0, 1, 0, 0, 1, 1]
    },
    lead: {
      wave: "sine",
      stepBeats: 1,
      durationBeats: 0.55,
      gain: 0.14,
      scaleHz: [146.83, 174.61, 196.0, 220.0],
      sequence: [0, -1, 1, -1, 2, 1, -1, 0, -1, 1, 2, -1, 3, 2, 1, -1]
    }
  },
  temple_zen: {
    id: "temple_zen",
    name: "禅院松风",
    tempoBpm: 46,
    targetGain: 0.11,
    drone: [
      { freqHz: 65.41, wave: "sine", gain: 0.26, detuneCents: 0 },
      { freqHz: 98.0, wave: "triangle", gain: 0.17, detuneCents: -4 }
    ],
    wind: {
      gain: 0.06,
      lowpassHz: 560,
      wobbleHz: 0.05,
      wobbleDepthHz: 90
    },
    lead: {
      wave: "triangle",
      stepBeats: 2,
      durationBeats: 1.45,
      gain: 0.17,
      scaleHz: [130.81, 146.83, 174.61, 196.0, 261.63],
      sequence: [0, -1, 2, -1, 3, -1, 2, -1, 1, -1, 2, -1, 4, -1, 2, -1]
    }
  }
};

const ambientMusicProfileIds = new Set(Object.keys(ambientMusicProfiles));

export function isAmbientMusicProfileId(profileId) {
  return isNonEmptyString(profileId) && ambientMusicProfileIds.has(profileId);
}

export function normalizeAmbientMusicProfileId(profileId) {
  if (isAmbientMusicProfileId(profileId)) {
    return profileId;
  }
  return DEFAULT_AMBIENT_MUSIC_PROFILE_ID;
}

export function getAmbientMusicProfile(profileId) {
  return ambientMusicProfiles[normalizeAmbientMusicProfileId(profileId)];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
