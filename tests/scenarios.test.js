import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateOutcome,
  getPhaseProgress,
  getTrainingCase,
  PHASES,
  TRAINING_CASES,
} from "../src/game/scenarios.js";

test("training cases provide a complete ordered consultation loop", () => {
  assert.equal(TRAINING_CASES.length, 3);

  for (const trainingCase of TRAINING_CASES) {
    assert.ok(trainingCase.avatar.startsWith("/assets/"));
    assert.ok(trainingCase.turns.length >= 3);
    assert.deepEqual(
      [...new Set(trainingCase.turns.map((turn) => turn.phase))],
      PHASES,
    );

    for (const turn of trainingCase.turns) {
      assert.equal(turn.choices.length, 3);
      assert.equal(
        turn.choices.filter((choice) => choice.correct).length,
        1,
        `${trainingCase.id}/${turn.objective} should have one preferred choice`,
      );
      for (const choice of turn.choices) {
        assert.deepEqual(Object.keys(choice.deltas).sort(), [
          "rapport",
          "reasoning",
          "safety",
        ]);
      }
    }
  }
});

test("phase progress identifies completed, active, and upcoming work", () => {
  const trainingCase = getTrainingCase("daniel-sore-throat");
  const progress = getPhaseProgress(trainingCase, 3);

  assert.deepEqual(progress, [
    { phase: "Explore", status: "complete" },
    { phase: "Assess", status: "active" },
    { phase: "Plan", status: "upcoming" },
  ]);
});

test("unknown case ids safely fall back to the guided case", () => {
  assert.equal(getTrainingCase("missing").id, "daniel-sore-throat");
});

test("critical errors always force review", () => {
  const outcome = calculateOutcome(
    { rapport: 10, safety: 10, reasoning: 10 },
    1,
  );
  assert.equal(outcome.tone, "review");
});

test("strong safe decisions produce a practice-ready outcome", () => {
  const outcome = calculateOutcome(
    { rapport: 7, safety: 7, reasoning: 7 },
    0,
  );
  assert.equal(outcome.tone, "excellent");
});
