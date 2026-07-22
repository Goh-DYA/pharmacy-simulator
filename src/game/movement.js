export const PLAYER_START = Object.freeze({ x: -3.25, z: 5.75 });

export const CONSULTATION_POINT = Object.freeze({ x: -1.45, z: 3.55 });

export const NAVIGATION_BOUNDS = Object.freeze({
  minX: -4.35,
  maxX: 4.35,
  minZ: 2.65,
  maxZ: 6.25,
});

export const MOVEMENT_SPEED = 2.4;
export const SPRINT_MULTIPLIER = 1.65;
export const INTERACTION_RADIUS = 1.4;
export const SCENE_CONTROL_EVENT = "pharmacity:scene-control";

const MOVEMENT_KEY_ACTIONS = Object.freeze({
  w: "forward",
  keyw: "forward",
  arrowup: "forward",
  s: "backward",
  keys: "backward",
  arrowdown: "backward",
  a: "left",
  keya: "left",
  arrowleft: "left",
  d: "right",
  keyd: "right",
  arrowright: "right",
  shift: "sprint",
  shiftleft: "sprint",
  shiftright: "sprint",
  e: "interact",
  keye: "interact",
});

export function movementKeyToAction(key) {
  if (typeof key !== "string") return null;
  return MOVEMENT_KEY_ACTIONS[key.toLowerCase()] ?? null;
}

function isControlActive(controls, action) {
  if (controls instanceof Set) return controls.has(action);
  return Boolean(controls?.[action]);
}

export function getMovementDirection(controls) {
  const x =
    Number(isControlActive(controls, "right")) -
    Number(isControlActive(controls, "left"));
  const z =
    Number(isControlActive(controls, "backward")) -
    Number(isControlActive(controls, "forward"));
  const magnitude = Math.hypot(x, z);

  if (magnitude === 0) return { x: 0, z: 0 };
  return { x: x / magnitude, z: z / magnitude };
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function constrainPlayerPosition(position = PLAYER_START) {
  const x = finiteOr(position?.x, PLAYER_START.x);
  const z = finiteOr(position?.z, PLAYER_START.z);

  return {
    x: Math.min(NAVIGATION_BOUNDS.maxX, Math.max(NAVIGATION_BOUNDS.minX, x)),
    z: Math.min(NAVIGATION_BOUNDS.maxZ, Math.max(NAVIGATION_BOUNDS.minZ, z)),
  };
}

export function getConsultationProximity(position = PLAYER_START) {
  const x = finiteOr(position?.x, PLAYER_START.x);
  const z = finiteOr(position?.z, PLAYER_START.z);
  const distance = Math.hypot(
    x - CONSULTATION_POINT.x,
    z - CONSULTATION_POINT.z,
  );

  return {
    distance,
    isWithinRange: distance <= INTERACTION_RADIUS,
    amount: Math.max(0, 1 - distance / INTERACTION_RADIUS),
  };
}

export function getPatientSpeechDuration(text) {
  const normalized = typeof text === "string" ? text.trim() : "";
  if (!normalized) return 0;

  const wordCount = normalized.split(/\s+/u).length;
  const pauseCount = (normalized.match(/[,.!?;:]/gu) ?? []).length;
  const estimatedDuration = 650 + wordCount * 330 + pauseCount * 110;

  return Math.min(9_000, Math.max(1_100, estimatedDuration));
}

export function shouldIgnoreMovementInput(targetLike) {
  if (!targetLike) return false;

  const tagName = String(targetLike.tagName ?? "").toLowerCase();
  if (["input", "textarea", "select"].includes(tagName)) return true;
  if (targetLike.isContentEditable) return true;

  const contentEditable =
    typeof targetLike.getAttribute === "function"
      ? targetLike.getAttribute("contenteditable")
      : targetLike.contentEditable;
  if (["", "true", "plaintext-only"].includes(contentEditable)) return true;

  if (typeof targetLike.closest !== "function") return false;
  return Boolean(
    targetLike.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
    ),
  );
}
