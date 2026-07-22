import test from "node:test";
import assert from "node:assert/strict";

import {
  PLAYER_VOICE_NAME,
  getPatientVoiceProfile,
  getPlayerVoiceProfile,
  selectSpeechVoice,
} from "../src/game/voices.js";

const voices = [
  { name: "Microsoft Wayne Online (Natural) - English (Singapore)", lang: "en-SG" },
  { name: "Microsoft Luna Online (Natural) - English (Singapore)", lang: "en-SG" },
  { name: PLAYER_VOICE_NAME, lang: "en-US", default: true },
];

test("uses a fixed preferred voice for the player", () => {
  assert.equal(
    selectSpeechVoice(voices, getPlayerVoiceProfile()).name,
    PLAYER_VOICE_NAME,
  );
});

test("selects patient voices according to character gender", () => {
  assert.match(
    selectSpeechVoice(voices, getPatientVoiceProfile("male")).name,
    /Wayne/,
  );
  assert.match(
    selectSpeechVoice(voices, getPatientVoiceProfile("female")).name,
    /Luna/,
  );
});

test("uses gender name hints before a generic English fallback", () => {
  const fallbackVoices = [
    { name: "Generic English", lang: "en-US", default: true },
    { name: "Daniel", lang: "en-GB" },
    { name: "Karen", lang: "en-AU" },
  ];

  assert.equal(
    selectSpeechVoice(fallbackVoices, getPatientVoiceProfile("male")).name,
    "Daniel",
  );
  assert.equal(
    selectSpeechVoice(fallbackVoices, getPatientVoiceProfile("female")).name,
    "Karen",
  );
});
