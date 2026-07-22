import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSULTATION_POINT,
  INTERACTION_RADIUS,
  NAVIGATION_BOUNDS,
  PLAYER_START,
  constrainPlayerPosition,
  getConsultationProximity,
  getMovementDirection,
  getPatientSpeechDuration,
  movementKeyToAction,
  shouldIgnoreMovementInput,
} from "../src/game/movement.js";

test("movement keys map to actions without stealing dialogue keys", () => {
  assert.equal(movementKeyToAction("w"), "forward");
  assert.equal(movementKeyToAction("W"), "forward");
  assert.equal(movementKeyToAction("ArrowDown"), "backward");
  assert.equal(movementKeyToAction("a"), "left");
  assert.equal(movementKeyToAction("ArrowRight"), "right");
  assert.equal(movementKeyToAction("Shift"), "sprint");
  assert.equal(movementKeyToAction("KeyE"), "interact");
  assert.equal(movementKeyToAction("Enter"), null);
  assert.equal(movementKeyToAction("1"), null);
  assert.equal(movementKeyToAction(null), null);
});

test("movement direction is normalized and opposing inputs cancel", () => {
  assert.deepEqual(getMovementDirection({}), { x: 0, z: 0 });
  assert.deepEqual(getMovementDirection({ forward: true }), { x: 0, z: -1 });

  const diagonal = getMovementDirection({ forward: true, right: true });
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z) - 1) < 1e-12);
  assert.ok(diagonal.x > 0);
  assert.ok(diagonal.z < 0);

  assert.deepEqual(
    getMovementDirection(new Set(["left", "right", "forward", "backward"])),
    { x: 0, z: 0 },
  );
});

test("player positions are constrained to the navigable pharmacy floor", () => {
  assert.deepEqual(
    constrainPlayerPosition({ x: -100, z: 100 }),
    { x: NAVIGATION_BOUNDS.minX, z: NAVIGATION_BOUNDS.maxZ },
  );
  assert.deepEqual(
    constrainPlayerPosition({ x: 100, z: -100 }),
    { x: NAVIGATION_BOUNDS.maxX, z: NAVIGATION_BOUNDS.minZ },
  );
  assert.deepEqual(constrainPlayerPosition({ x: 0, z: 4 }), { x: 0, z: 4 });

  const fallback = constrainPlayerPosition({ x: Number.NaN, z: Infinity });
  assert.ok(Number.isFinite(fallback.x));
  assert.ok(Number.isFinite(fallback.z));
});

test("player and consultation anchors are valid separated floor positions", () => {
  for (const point of [PLAYER_START, CONSULTATION_POINT]) {
    assert.ok(point.x >= NAVIGATION_BOUNDS.minX);
    assert.ok(point.x <= NAVIGATION_BOUNDS.maxX);
    assert.ok(point.z >= NAVIGATION_BOUNDS.minZ);
    assert.ok(point.z <= NAVIGATION_BOUNDS.maxZ);
  }

  const startProximity = getConsultationProximity(PLAYER_START);
  assert.ok(startProximity.distance > INTERACTION_RADIUS);
  assert.equal(startProximity.isWithinRange, false);
});

test("consultation proximity reports distance, range, and falloff", () => {
  assert.deepEqual(getConsultationProximity(CONSULTATION_POINT), {
    distance: 0,
    isWithinRange: true,
    amount: 1,
  });

  const boundary = getConsultationProximity({
    x: CONSULTATION_POINT.x + INTERACTION_RADIUS,
    z: CONSULTATION_POINT.z,
  });
  assert.ok(Math.abs(boundary.distance - INTERACTION_RADIUS) < 1e-12);
  assert.equal(boundary.isWithinRange, true);
  assert.equal(boundary.amount, 0);

  const outside = getConsultationProximity({
    x: CONSULTATION_POINT.x + INTERACTION_RADIUS + 0.1,
    z: CONSULTATION_POINT.z,
  });
  assert.equal(outside.isWithinRange, false);
  assert.equal(outside.amount, 0);
});

test("patient speech timing scales with dialogue and remains bounded", () => {
  assert.equal(getPatientSpeechDuration(""), 0);
  assert.equal(getPatientSpeechDuration(null), 0);

  const shortDuration = getPatientSpeechDuration("Hello.");
  const longerDuration = getPatientSpeechDuration(
    "Please tell me whether the fever started before or after the sore throat.",
  );
  const maximumDuration = getPatientSpeechDuration("word ".repeat(200));

  assert.ok(shortDuration >= 1_100);
  assert.ok(longerDuration > shortDuration);
  assert.equal(maximumDuration, 9_000);
});

test("movement input is ignored for editable targets and their descendants", () => {
  assert.equal(shouldIgnoreMovementInput(null), false);
  assert.equal(shouldIgnoreMovementInput({ tagName: "DIV" }), false);
  assert.equal(shouldIgnoreMovementInput({ tagName: "BUTTON" }), false);
  assert.equal(shouldIgnoreMovementInput({ tagName: "INPUT" }), true);
  assert.equal(shouldIgnoreMovementInput({ tagName: "textarea" }), true);
  assert.equal(shouldIgnoreMovementInput({ tagName: "SELECT" }), true);
  assert.equal(shouldIgnoreMovementInput({ isContentEditable: true }), true);
  assert.equal(
    shouldIgnoreMovementInput({ contentEditable: "plaintext-only" }),
    true,
  );
  assert.equal(
    shouldIgnoreMovementInput({
      tagName: "SPAN",
      closest: () => ({ tagName: "TEXTAREA" }),
    }),
    true,
  );
});
