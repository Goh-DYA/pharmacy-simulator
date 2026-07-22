export const PLAYER_VOICE_NAME =
  "Microsoft Aria Online (Natural) - English (United States)";

const VOICE_PROFILES = {
  player: {
    preferredNames: [
      PLAYER_VOICE_NAME,
      "Microsoft Aria - English (United States)",
      "Microsoft Zira - English (United States)",
      "Samantha",
    ],
    nameHints: ["aria", "zira", "samantha"],
  },
  femalePatient: {
    preferredNames: [
      "Microsoft Luna Online (Natural) - English (Singapore)",
      "Microsoft Luna - English (Singapore)",
      "Google UK English Female",
      "Microsoft Hazel - English (Great Britain)",
    ],
    nameHints: ["luna", "female", "hazel", "susan", "karen"],
  },
  malePatient: {
    preferredNames: [
      "Microsoft Wayne Online (Natural) - English (Singapore)",
      "Microsoft Wayne - English (Singapore)",
      "Google UK English Male",
      "Microsoft David - English (United States)",
    ],
    nameHints: ["wayne", "male", "david", "daniel", "guy", "james"],
  },
};

function normalize(value) {
  return value?.trim().toLowerCase() ?? "";
}

export function getPatientVoiceProfile(gender) {
  return gender === "female"
    ? VOICE_PROFILES.femalePatient
    : VOICE_PROFILES.malePatient;
}

export function getPlayerVoiceProfile() {
  return VOICE_PROFILES.player;
}

export function selectSpeechVoice(voices, profile) {
  if (!Array.isArray(voices) || !voices.length || !profile) return null;

  const englishVoices = voices.filter((voice) =>
    normalize(voice.lang).startsWith("en"),
  );
  const candidates = englishVoices.length ? englishVoices : voices;

  for (const preferredName of profile.preferredNames) {
    const match = candidates.find(
      (voice) => normalize(voice.name) === normalize(preferredName),
    );
    if (match) return match;
  }

  for (const hint of profile.nameHints) {
    const match = candidates.find((voice) =>
      normalize(voice.name).includes(normalize(hint)),
    );
    if (match) return match;
  }

  return (
    candidates.find((voice) => normalize(voice.lang) === "en-sg") ??
    candidates.find((voice) => voice.default) ??
    candidates[0] ??
    null
  );
}
