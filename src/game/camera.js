export const DEFAULT_CAMERA_PRESET = "guided";
export const BASE_CAMERA_FOV = 47;

export const CAMERA_PRESET_ORDER = Object.freeze([
  "guided",
  "patient",
  "context",
]);

export const CAMERA_PRESETS = Object.freeze({
  guided: Object.freeze({
    id: "guided",
    label: "Guided",
    exploration: Object.freeze({
      camera: Object.freeze({ x: 0, y: 4.55, z: 5.2 }),
      target: Object.freeze({ x: 0.35, y: 2.5, z: -5.15 }),
    }),
    consultation: Object.freeze({
      camera: Object.freeze({ x: 0, y: 4.2, z: 10.8 }),
      target: Object.freeze({ x: 0.25, y: 2.35, z: -0.8 }),
    }),
  }),
  patient: Object.freeze({
    id: "patient",
    label: "Patient",
    exploration: Object.freeze({
      camera: Object.freeze({ x: 1.15, y: 4.35, z: 4.85 }),
      target: Object.freeze({ x: 0.65, y: 2.55, z: -4.9 }),
    }),
    consultation: Object.freeze({
      camera: Object.freeze({ x: 1.1, y: 4.25, z: 10.35 }),
      target: Object.freeze({ x: 0.72, y: 2.68, z: -0.45 }),
    }),
  }),
  context: Object.freeze({
    id: "context",
    label: "Context",
    exploration: Object.freeze({
      camera: Object.freeze({ x: -1.05, y: 5.1, z: 6.15 }),
      target: Object.freeze({ x: 0.05, y: 2.35, z: -5.55 }),
    }),
    consultation: Object.freeze({
      camera: Object.freeze({ x: -0.85, y: 4.65, z: 12.2 }),
      target: Object.freeze({ x: 0, y: 2.25, z: -0.8 }),
    }),
  }),
});

export function getCameraPreset(presetId) {
  return CAMERA_PRESETS[presetId] ?? CAMERA_PRESETS[DEFAULT_CAMERA_PRESET];
}

export function getNextCameraPreset(presetId) {
  const currentIndex = CAMERA_PRESET_ORDER.indexOf(presetId);
  const nextIndex = currentIndex < 0
    ? 0
    : (currentIndex + 1) % CAMERA_PRESET_ORDER.length;
  return CAMERA_PRESET_ORDER[nextIndex];
}

export function getResponsiveCameraFraming(aspect, consulting = false) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  const narrowAmount = Math.max(
    0,
    Math.min(1, (1.05 - safeAspect) / 0.6),
  );

  return {
    blendToGuided: narrowAmount,
    fov: BASE_CAMERA_FOV + narrowAmount * 18,
    pullback: narrowAmount * (consulting ? 3 : 4.5),
    targetDrop: narrowAmount * (consulting ? 0.45 : 0.8),
    targetShift: narrowAmount * 0.08,
  };
}
