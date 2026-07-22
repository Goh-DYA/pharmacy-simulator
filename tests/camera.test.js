import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  CAMERA_PRESETS,
  CAMERA_PRESET_ORDER,
  DEFAULT_CAMERA_PRESET,
  getCameraPreset,
  getNextCameraPreset,
  getResponsiveCameraFraming,
} from "../src/game/camera.js";
import {
  CONSULTATION_POINT,
  PLAYER_START,
} from "../src/game/movement.js";

function projectSubjects(preset, aspect, consulting) {
  const framing = getResponsiveCameraFraming(aspect, consulting);
  const activeView = consulting ? preset.consultation : preset.exploration;
  const guidedPreset = getCameraPreset();
  const guidedView = consulting
    ? guidedPreset.consultation
    : guidedPreset.exploration;
  const player = consulting ? CONSULTATION_POINT : PLAYER_START;
  const cameraX = THREE.MathUtils.lerp(
    activeView.camera.x,
    guidedView.camera.x,
    framing.blendToGuided,
  );
  const targetX = THREE.MathUtils.lerp(
    activeView.target.x,
    guidedView.target.x,
    framing.blendToGuided,
  );
  const camera = new THREE.PerspectiveCamera(framing.fov, aspect, 0.1, 45);

  camera.position.set(
    (consulting ? 0 : player.x * 0.52) + cameraX,
    activeView.camera.y,
    (consulting ? 0 : player.z) + activeView.camera.z + framing.pullback,
  );
  camera.lookAt(
    (consulting ? 0 : player.x * 0.42) + targetX + framing.targetShift,
    activeView.target.y - framing.targetDrop,
    (consulting ? 0 : player.z) + activeView.target.z,
  );
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  return {
    patient: new THREE.Vector3(1.35, consulting ? 2.68 : 2.05, 0.16)
      .project(camera).x,
    player: new THREE.Vector3(player.x, 2.55, player.z).project(camera).x,
  };
}

test("camera presets cycle predictably and fall back to the guided view", () => {
  assert.equal(DEFAULT_CAMERA_PRESET, "guided");
  assert.equal(getNextCameraPreset("guided"), "patient");
  assert.equal(getNextCameraPreset("patient"), "context");
  assert.equal(getNextCameraPreset("context"), "guided");
  assert.equal(getNextCameraPreset("unknown"), "guided");
  assert.equal(getCameraPreset("unknown"), CAMERA_PRESETS.guided);
});

test("camera presets remain elevated, finite, and within the pharmacy set", () => {
  assert.deepEqual(Object.keys(CAMERA_PRESETS), [...CAMERA_PRESET_ORDER]);

  for (const preset of Object.values(CAMERA_PRESETS)) {
    for (const mode of [preset.exploration, preset.consultation]) {
      for (const point of [mode.camera, mode.target]) {
        assert.ok(Number.isFinite(point.x));
        assert.ok(Number.isFinite(point.y));
        assert.ok(Number.isFinite(point.z));
      }
    }

    assert.ok(preset.consultation.camera.y >= 4.2);
    assert.ok(Math.abs(preset.consultation.camera.x) <= 1.2);
    assert.ok(preset.consultation.camera.z >= 10);
    assert.ok(preset.consultation.camera.z <= 12.25);
  }
});

test("responsive framing keeps both characters in portrait and tablet views", () => {
  for (const aspect of [390 / 844, 820 / 1180]) {
    for (const preset of Object.values(CAMERA_PRESETS)) {
      for (const consulting of [false, true]) {
        const projected = projectSubjects(preset, aspect, consulting);
        assert.ok(
          Math.abs(projected.player) <= 1.05,
          `${preset.id} player is clipped at aspect ${aspect}`,
        );
        assert.ok(
          Math.abs(projected.patient) <= 1.05,
          `${preset.id} patient is clipped at aspect ${aspect}`,
        );
      }
    }
  }
});
