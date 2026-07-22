import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Billboard, RoundedBox, Text, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CONSULTATION_POINT,
  MOVEMENT_SPEED,
  PLAYER_START,
  SCENE_CONTROL_EVENT,
  SPRINT_MULTIPLIER,
  constrainPlayerPosition,
  getConsultationProximity,
  getMovementDirection,
  movementKeyToAction,
  shouldIgnoreMovementInput,
} from "./movement.js";
import {
  getCameraPreset,
  getResponsiveCameraFraming,
} from "./camera.js";
import { PHARMACY_ROOM } from "./environment.js";
import { PharmacyEnvironment } from "./PharmacyEnvironment.jsx";

const PATIENT_POSITION = [1.35, 2.68, 0.16];

function ConsultationCounter() {
  const oakTexture = useTexture("/assets/oak-veneer.webp");

  useEffect(() => {
    oakTexture.colorSpace = THREE.SRGBColorSpace;
    oakTexture.wrapS = THREE.RepeatWrapping;
    oakTexture.wrapT = THREE.RepeatWrapping;
    oakTexture.repeat.set(2.4, 2.4);
    oakTexture.anisotropy = 4;
    oakTexture.needsUpdate = true;
  }, [oakTexture]);

  return (
    <group position={[0, 0, 1.48]}>
      <RoundedBox
        args={[7.4, 1.72, 1.16]}
        radius={0.08}
        smoothness={3}
        receiveShadow
        castShadow
        position={[0.2, 1.03, 0]}
      >
        <meshStandardMaterial map={oakTexture} color="#c9bdb1" roughness={0.66} />
      </RoundedBox>
      <RoundedBox
        args={[7.82, 0.18, 1.38]}
        radius={0.07}
        smoothness={3}
        receiveShadow
        castShadow
        position={[0.2, 1.94, 0]}
      >
        <meshStandardMaterial color="#d9c8b3" roughness={0.56} />
      </RoundedBox>
      <mesh position={[0.2, 0.16, 0.59]}>
        <boxGeometry args={[7.42, 0.24, 0.08]} />
        <meshStandardMaterial color="#4c493f" metalness={0.18} roughness={0.65} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => {
        const x = -3.08 + index * 1.08;
        return (
          <group key={`counter-panel-${index}`} position={[x, 1.03, 0.6]}>
            <mesh>
              <boxGeometry args={[0.94, 1.38, 0.055]} />
              <meshStandardMaterial
                map={oakTexture}
                color={index % 2 ? "#d3c7bc" : "#c8bbb0"}
                roughness={0.69}
              />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <boxGeometry args={[0.74, 1.18, 0.025]} />
              <meshStandardMaterial map={oakTexture} color="#ddd1c5" roughness={0.67} />
            </mesh>
          </group>
        );
      })}

      <group position={[-2.1, 2.35, -0.08]} rotation={[-0.08, 0.16, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.02, 0.72, 0.12]} />
          <meshStandardMaterial color="#203b38" metalness={0.22} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.015, 0.071]}>
          <boxGeometry args={[0.84, 0.54, 0.025]} />
          <meshStandardMaterial
            color="#82b4aa"
            emissive="#315f58"
            emissiveIntensity={0.38}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, -0.55, -0.02]}>
          <boxGeometry args={[0.12, 0.42, 0.1]} />
          <meshStandardMaterial color="#334743" metalness={0.2} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.78, 0.01]}>
          <boxGeometry args={[0.62, 0.08, 0.36]} />
          <meshStandardMaterial color="#3d4b48" roughness={0.52} />
        </mesh>
      </group>
      <mesh castShadow position={[-1.12, 2.08, 0.2]} rotation={[-0.24, -0.1, 0]}>
        <boxGeometry args={[0.5, 0.09, 0.34]} />
        <meshStandardMaterial color="#5a6762" metalness={0.1} roughness={0.56} />
      </mesh>
      <group position={[1.28, 2.12, 0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.32, 0.56]} />
          <meshStandardMaterial color="#e1ddd3" roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.18, 0.08]}>
          <boxGeometry args={[0.5, 0.08, 0.28]} />
          <meshStandardMaterial color="#43534f" roughness={0.54} />
        </mesh>
      </group>
      <group position={[2.06, 2.22, 0.03]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.11, 0.42, 16]} />
          <meshStandardMaterial color="#d4ebe1" transparent opacity={0.72} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.2, 0.09, 0.1]} />
          <meshStandardMaterial color="#f1f0e9" roughness={0.6} />
        </mesh>
      </group>
      <mesh castShadow position={[2.82, 2.14, 0.05]}>
        <cylinderGeometry args={[0.19, 0.24, 0.32, 20]} />
        <meshStandardMaterial color="#d9b06e" metalness={0.18} roughness={0.4} />
      </mesh>
    </group>
  );
}

function createPharmacyFloorTextures() {
  const size = 512;
  const tilesPerSide = 4;
  const tileSize = size / tilesPerSide;
  const groutWidth = 1;
  const colorCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = size;
  bumpCanvas.width = bumpCanvas.height = size;

  const colorContext = colorCanvas.getContext("2d");
  const bumpContext = bumpCanvas.getContext("2d");
  const palette = ["#ddd7cd", "#e4ded4", "#d8d2c8", "#e0d9cf"];
  let seed = 0x51f15e;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  colorContext.fillStyle = "#c7bfb4";
  colorContext.fillRect(0, 0, size, size);
  bumpContext.fillStyle = "#747474";
  bumpContext.fillRect(0, 0, size, size);

  for (let row = 0; row < tilesPerSide; row += 1) {
    for (let column = 0; column < tilesPerSide; column += 1) {
      const x = column * tileSize + groutWidth;
      const y = row * tileSize + groutWidth;
      const width = tileSize - groutWidth * 2;
      const height = tileSize - groutWidth * 2;
      const base = palette[(row * tilesPerSide + column) % palette.length];
      const gradient = colorContext.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, base);
      gradient.addColorStop(0.55, "#e8e1d7");
      gradient.addColorStop(1, "#d2cbc1");
      colorContext.fillStyle = gradient;
      colorContext.fillRect(x, y, width, height);

      bumpContext.fillStyle = "#a2a2a2";
      bumpContext.fillRect(x, y, width, height);
      bumpContext.strokeStyle = "#ababab";
      bumpContext.lineWidth = 1;
      bumpContext.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

      for (let speckle = 0; speckle < 90; speckle += 1) {
        const speckleX = x + random() * width;
        const speckleY = y + random() * height;
        const radius = 0.25 + random() * 1.15;
        const opacity = 0.018 + random() * 0.035;
        colorContext.fillStyle = random() > 0.5
          ? `rgba(255, 248, 235, ${opacity})`
          : `rgba(90, 82, 74, ${opacity})`;
        colorContext.beginPath();
        colorContext.arc(speckleX, speckleY, radius, 0, Math.PI * 2);
        colorContext.fill();

        bumpContext.fillStyle = random() > 0.5 ? "#a8a8a8" : "#999999";
        bumpContext.fillRect(speckleX, speckleY, 1, 1);
      }
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  for (const texture of [colorMap, bumpMap]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6.7, 8.9);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
  }
  colorMap.colorSpace = THREE.SRGBColorSpace;

  return { colorMap, bumpMap };
}

function PharmacyFloor({ onMove }) {
  const { gl } = useThree();
  const textures = useMemo(createPharmacyFloorTextures, []);

  useEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    textures.colorMap.anisotropy = anisotropy;
    textures.bumpMap.anisotropy = anisotropy;
    textures.colorMap.needsUpdate = true;
    textures.bumpMap.needsUpdate = true;

    return () => {
      textures.colorMap.dispose();
      textures.bumpMap.dispose();
    };
  }, [gl, textures]);

  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, PHARMACY_ROOM.floorCenterZ]}
      onClick={(event) => {
        event.stopPropagation();
        onMove(event.point);
      }}
    >
      <planeGeometry args={[PHARMACY_ROOM.floorWidth, PHARMACY_ROOM.floorDepth]} />
      <meshStandardMaterial
        map={textures.colorMap}
        bumpMap={textures.bumpMap}
        bumpScale={0.012}
        color="#fffaf2"
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
}

function useReducedMotionRef() {
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = query.matches;
    };
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reducedMotionRef;
}

function CharacterSprite({
  map,
  scale,
  opacity = 1,
  onClick,
  kind = "patient",
  speaking = false,
  reaction = "neutral",
  motionRef,
}) {
  const animationRef = useRef();
  const meshRef = useRef();
  const geometryRef = useRef();
  const basePositionsRef = useRef();
  const facingRef = useRef(1);
  const reducedMotionRef = useReducedMotionRef();

  useEffect(() => {
    const positions = geometryRef.current?.attributes.position.array;
    if (positions) basePositionsRef.current = positions.slice();
  }, []);

  useFrame(({ clock }, frameDelta) => {
    if (!animationRef.current || !meshRef.current) return;
    const time = clock.elapsedTime;
    const reduced = reducedMotionRef.current;
    const walkAmount = kind === "player" ? motionRef?.current?.amount ?? 0 : 0;
    const travelHeading =
      kind === "player" ? motionRef?.current?.heading ?? 0 : 0;
    const directionX =
      kind === "player" ? motionRef?.current?.directionX ?? 0 : 0;
    if (kind === "player" && Math.abs(directionX) > 0.08) {
      facingRef.current = directionX > 0 ? 1 : -1;
    }
    const directionalLean =
      kind === "player" ? directionX * 0.025 : 0;
    const speechPulse = !reduced && speaking
      ? 0.55 + Math.sin(time * 8.6) * 0.25 + Math.sin(time * 13.2) * 0.12
      : 0;
    const idleBreath = reduced ? 0 : Math.sin(time * 1.35) * 0.006;
    const step = reduced ? 0 : Math.abs(Math.sin(time * 7.2)) * walkAmount;
    const reactionLean =
      reaction === "positive" ? -0.012 : reaction === "negative" ? 0.022 : 0;

    animationRef.current.position.y = step * 0.085 + idleBreath * 0.8;
    animationRef.current.position.x =
      reduced || kind !== "player"
        ? 0
        : Math.sin(time * 7.2) * walkAmount * 0.035;
    animationRef.current.position.z = reaction === "negative" ? 0.07 : 0;
    animationRef.current.rotation.y = THREE.MathUtils.damp(
      animationRef.current.rotation.y,
      kind === "player" ? Math.sin(travelHeading) * walkAmount * 0.2 : 0,
      9,
      frameDelta,
    );
    animationRef.current.rotation.z = reduced
      ? 0
      : Math.sin(time * (walkAmount > 0.05 ? 7.2 : 0.72)) *
          (walkAmount * 0.02 + (speaking ? 0.006 : 0)) +
        reactionLean -
        directionalLean;

    meshRef.current.scale.set(
      scale[0] * facingRef.current * (1 + speechPulse * 0.004),
      scale[1] * (1 + idleBreath + step * 0.006),
      scale[2],
    );

    const geometry = geometryRef.current;
    const basePositions = basePositionsRef.current;
    if (!geometry || !basePositions) return;
    const positions = geometry.attributes.position.array;
    const uvs = geometry.attributes.uv.array;
    for (let index = 0; index < positions.length / 3; index += 1) {
      const uvY = uvs[index * 2 + 1];
      const faceMask = THREE.MathUtils.clamp(
        1 - Math.abs(uvY - 0.79) / 0.13,
        0,
        1,
      );
      const jawMask = THREE.MathUtils.clamp(
        1 - Math.abs(uvY - 0.735) / 0.055,
        0,
        1,
      );
      positions[index * 3] =
        basePositions[index * 3] * (1 + faceMask * speechPulse * 0.005);
      positions[index * 3 + 1] =
        basePositions[index * 3 + 1] -
        (reduced ? 0 : jawMask * speechPulse * 0.0075);
      positions[index * 3 + 2] = basePositions[index * 3 + 2];
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Billboard follow lockX={false} lockY={false} lockZ={false}>
      <group ref={animationRef}>
        <mesh
          ref={meshRef}
          castShadow
          onClick={(event) => {
            event.stopPropagation();
            onClick?.();
          }}
        >
          <planeGeometry ref={geometryRef} args={[1, 1.5, 10, 18]} />
          <meshBasicMaterial
            map={map}
            transparent
            alphaTest={0.06}
            depthWrite={false}
            toneMapped={false}
            opacity={opacity}
          />
        </mesh>
      </group>
    </Billboard>
  );
}

function PlayerActor({
  map,
  motionRef,
  groupRef,
  consulting,
  speaking,
}) {
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 40]} />
        <meshBasicMaterial color="#153c38" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <group position={[0, 2.55, 0]}>
        <CharacterSprite
          map={map}
          scale={[3.1, 4.65, 1]}
          opacity={consulting ? 0.98 : 0.92}
          kind="player"
          motionRef={motionRef}
          speaking={speaking}
        />
      </group>
    </group>
  );
}

function PatientActor({
  map,
  onClick,
  speaking,
  reaction,
  patientName,
  proximityRef,
  consulting,
}) {
  const { size } = useThree();
  const signalRef = useRef();
  const patientGroupRef = useRef();
  const ringMaterialRef = useRef();
  const barRefs = useRef([]);
  const reducedMotionRef = useReducedMotionRef();

  useFrame(({ clock }, frameDelta) => {
    const proximity = proximityRef.current;
    const amount = proximity?.amount ?? 0;
    if (signalRef.current) {
      signalRef.current.visible =
        !consulting &&
        size.width > 820 &&
        proximity?.distance < 3.25;
      signalRef.current.position.y = reducedMotionRef.current
        ? 0
        : Math.sin(clock.elapsedTime * 1.4) * 0.035;
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.opacity = 0.3 + amount * 0.56;
    }
    if (patientGroupRef.current) {
      patientGroupRef.current.position.y = THREE.MathUtils.damp(
        patientGroupRef.current.position.y,
        consulting ? PATIENT_POSITION[1] : 2.05,
        6,
        frameDelta,
      );
    }
    barRefs.current.forEach((bar, index) => {
      if (!bar) return;
      const energy = reducedMotionRef.current
        ? speaking
          ? 0.78
          : 0.34
        : speaking
        ? 0.45 + Math.abs(Math.sin(clock.elapsedTime * (7.4 + index * 0.8))) * 0.85
        : 0.28 + amount * 0.22;
      bar.scale.y = energy;
    });
  });

  return (
    <group>
      <group
        ref={patientGroupRef}
        position={[PATIENT_POSITION[0], 2.05, PATIENT_POSITION[2]]}
      >
        <CharacterSprite
          map={map}
          scale={[3.7, 5.55, 1]}
          onClick={onClick}
          speaking={speaking}
          reaction={reaction}
        />
      </group>
      <mesh
        visible={!consulting}
        position={[1.35, 0.025, -0.06]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.46, 0.58, 48]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color="#f0a744"
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </mesh>
      <Billboard visible={!consulting} position={[2.5, 4.85, 0.05]} follow>
        <group ref={signalRef}>
          <mesh position={[0, 0, -0.035]}>
            <boxGeometry args={[1.78, 0.46, 0.05]} />
            <meshBasicMaterial color="#123b39" transparent opacity={0.91} />
          </mesh>
          {Array.from({ length: 4 }, (_, index) => (
            <mesh
              key={index}
              ref={(element) => {
                barRefs.current[index] = element;
              }}
              position={[-0.68 + index * 0.11, 0, 0]}
            >
              <boxGeometry args={[0.045, 0.19, 0.02]} />
              <meshBasicMaterial color={speaking ? "#9bf3d2" : "#f0a643"} />
            </mesh>
          ))}
          <Text
            position={[0.22, 0, 0]}
            fontSize={0.14}
            color="#fff9ef"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.1}
          >
            {speaking ? `${patientName} is speaking` : `Talk to ${patientName}`}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

function ConsultationWaypoint({ proximityRef }) {
  const groupRef = useRef();
  const innerMaterialRef = useRef();
  const reducedMotionRef = useReducedMotionRef();

  useFrame(({ clock }) => {
    const amount = proximityRef.current?.amount ?? 0;
    if (groupRef.current) {
      const pulse = reducedMotionRef.current
        ? 1
        : 1 + Math.sin(clock.elapsedTime * 3) * 0.045 * (1 - amount);
      groupRef.current.scale.setScalar(pulse);
    }
    if (innerMaterialRef.current) {
      innerMaterialRef.current.opacity = 0.32 + amount * 0.52;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[CONSULTATION_POINT.x, 0.034, CONSULTATION_POINT.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <mesh>
        <ringGeometry args={[0.34, 0.48, 48]} />
        <meshBasicMaterial
          ref={innerMaterialRef}
          color="#9bf3d2"
          transparent
          opacity={0.46}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.002]}>
        <circleGeometry args={[0.13, 32]} />
        <meshBasicMaterial color="#f0a643" transparent opacity={0.72} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PharmacyWorld({
  patientAvatar,
  patientName,
  patientSpeaking,
  patientReaction,
  playerSpeaking,
  consulting,
  motionRef,
  playerGroupRef,
  proximityRef,
  onFloorMove,
  onPatientClick,
}) {
  const patientTexture = useTexture(patientAvatar);
  const pharmacistTexture = useTexture("/assets/pharmacist-back.png");
  patientTexture.colorSpace = THREE.SRGBColorSpace;
  pharmacistTexture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      <color attach="background" args={["#b9c9c3"]} />
      <fog attach="fog" args={["#b9c9c3", 31, 59]} />
      <ambientLight intensity={0.34} />
      <hemisphereLight args={["#fff3d9", "#57645c", 0.76]} />
      <directionalLight
        castShadow
        position={[-6, 11, 8]}
        intensity={1.48}
        color="#ffe9c5"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={34}
      />
      <pointLight position={[-4.2, 6.25, 2.2]} intensity={0.78} distance={14} decay={2} color="#ffe8be" />
      <pointLight position={[4.4, 6.15, -1.8]} intensity={0.68} distance={13} decay={2} color="#fff0cf" />
      <PharmacyFloor onMove={onFloorMove} />
      <PharmacyEnvironment />
      <ConsultationCounter />
      {consulting ? null : (
        <ConsultationWaypoint proximityRef={proximityRef} />
      )}
      <PatientActor
        map={patientTexture}
        onClick={onPatientClick}
        speaking={patientSpeaking}
        reaction={patientReaction}
        patientName={patientName}
        proximityRef={proximityRef}
        consulting={consulting}
      />
      <PlayerActor
        map={pharmacistTexture}
        motionRef={motionRef}
        groupRef={playerGroupRef}
        consulting={consulting}
        speaking={playerSpeaking}
      />
    </group>
  );
}

function PlayerController({
  consulting,
  controlsEnabled,
  cameraPreset,
  resetKey,
  playerPositionRef,
  playerGroupRef,
  motionRef,
  proximityRef,
  moveRequestRef,
  interactionRequestRef,
  onConsultationChange,
  onPatientFocus,
  onWorldState,
}) {
  const { camera, pointer, gl } = useThree();
  const activeControlsRef = useRef(new Set());
  const velocityRef = useRef(new THREE.Vector2());
  const moveTargetRef = useRef(null);
  const autoInteractRef = useRef(false);
  const lastSnapshotRef = useRef("");
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const cameraView = getCameraPreset(cameraPreset);
  const guidedCameraView = getCameraPreset();

  const stopMovement = useCallback(() => {
    activeControlsRef.current.clear();
    moveTargetRef.current = null;
    autoInteractRef.current = false;
    velocityRef.current.set(0, 0);
    motionRef.current.amount = 0;
  }, [motionRef]);

  const requestConsultation = useCallback(() => {
    if (!controlsEnabled || consulting) return;
    const proximity = getConsultationProximity(playerPositionRef.current);
    if (proximity.isWithinRange) {
      stopMovement();
      onPatientFocus?.("engaged");
      onConsultationChange(true);
      return;
    }
    moveTargetRef.current = new THREE.Vector2(
      CONSULTATION_POINT.x,
      CONSULTATION_POINT.z,
    );
    autoInteractRef.current = true;
    onPatientFocus?.("approaching");
  }, [
    consulting,
    controlsEnabled,
    onConsultationChange,
    onPatientFocus,
    playerPositionRef,
    stopMovement,
  ]);

  useEffect(() => {
    interactionRequestRef.current = requestConsultation;
    moveRequestRef.current = (point) => {
      if (!controlsEnabled || consulting) return;
      const next = constrainPlayerPosition(point);
      moveTargetRef.current = new THREE.Vector2(next.x, next.z);
      autoInteractRef.current = false;
    };
    return () => {
      interactionRequestRef.current = null;
      moveRequestRef.current = null;
    };
  }, [
    consulting,
    controlsEnabled,
    interactionRequestRef,
    moveRequestRef,
    requestConsultation,
  ]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        consulting &&
        controlsEnabled &&
        !shouldIgnoreMovementInput(event.target)
      ) {
        event.preventDefault();
        onConsultationChange(false);
        return;
      }
      const action =
        movementKeyToAction(event.key) ?? movementKeyToAction(event.code);
      if (!action || shouldIgnoreMovementInput(event.target) || !controlsEnabled) return;
      if (action === "interact") {
        if (!event.repeat) requestConsultation();
      } else if (!consulting) {
        activeControlsRef.current.add(action);
        moveTargetRef.current = null;
        autoInteractRef.current = false;
      }
      event.preventDefault();
    }

    function handleKeyUp(event) {
      const action =
        movementKeyToAction(event.key) ?? movementKeyToAction(event.code);
      if (action) activeControlsRef.current.delete(action);
    }

    function handleSceneControl(event) {
      const { action, active = true } = event.detail ?? {};
      if (action === "interact" || action === "approach") {
        if (active) requestConsultation();
        return;
      }
      if (action === "leave") {
        if (active && consulting) onConsultationChange(false);
        return;
      }
      if (!["forward", "backward", "left", "right", "sprint"].includes(action)) {
        return;
      }
      if (active && controlsEnabled && !consulting) {
        activeControlsRef.current.add(action);
        moveTargetRef.current = null;
        autoInteractRef.current = false;
      } else {
        activeControlsRef.current.delete(action);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", stopMovement);
    window.addEventListener(SCENE_CONTROL_EVENT, handleSceneControl);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", stopMovement);
      window.removeEventListener(SCENE_CONTROL_EVENT, handleSceneControl);
    };
  }, [
    consulting,
    controlsEnabled,
    onConsultationChange,
    requestConsultation,
    stopMovement,
  ]);

  useEffect(() => {
    stopMovement();
    velocityRef.current.set(0, 0);
    playerPositionRef.current.set(PLAYER_START.x, 0, PLAYER_START.z);
    if (playerGroupRef.current) {
      playerGroupRef.current.position.set(PLAYER_START.x, 0, PLAYER_START.z);
    }
  }, [playerGroupRef, playerPositionRef, resetKey, stopMovement]);

  useEffect(() => {
    if (!controlsEnabled) stopMovement();
  }, [controlsEnabled, stopMovement]);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, 0.05);
    const position = playerPositionRef.current;
    const velocity = velocityRef.current;
    let direction = getMovementDirection(activeControlsRef.current);
    const hasKeyboardDirection = direction.x !== 0 || direction.z !== 0;

    if (!consulting && controlsEnabled && !hasKeyboardDirection && moveTargetRef.current) {
      const targetDelta = moveTargetRef.current.clone().sub(new THREE.Vector2(position.x, position.z));
      if (targetDelta.length() > 0.1) {
        targetDelta.normalize();
        direction = { x: targetDelta.x, z: targetDelta.y };
      } else {
        moveTargetRef.current = null;
      }
    }

    const isSprinting = activeControlsRef.current.has("sprint");
    const speed = isSprinting ? MOVEMENT_SPEED * SPRINT_MULTIPLIER : MOVEMENT_SPEED;
    const canMove = controlsEnabled && !consulting;
    velocity.x = THREE.MathUtils.damp(
      velocity.x,
      canMove ? direction.x * speed : 0,
      canMove ? 8 : 12,
      delta,
    );
    velocity.y = THREE.MathUtils.damp(
      velocity.y,
      canMove ? direction.z * speed : 0,
      canMove ? 8 : 12,
      delta,
    );

    if (consulting) {
      position.x = THREE.MathUtils.damp(
        position.x,
        CONSULTATION_POINT.x,
        8,
        delta,
      );
      position.z = THREE.MathUtils.damp(
        position.z,
        CONSULTATION_POINT.z,
        8,
        delta,
      );
    } else {
      const constrained = constrainPlayerPosition({
        x: position.x + velocity.x * delta,
        z: position.z + velocity.y * delta,
      });
      position.x = constrained.x;
      position.z = constrained.z;
    }

    if (playerGroupRef.current) {
      playerGroupRef.current.position.set(position.x, 0, position.z);
    }

    const currentSpeed = velocity.length();
    motionRef.current.amount = THREE.MathUtils.clamp(
      currentSpeed / MOVEMENT_SPEED,
      0,
      1,
    );
    motionRef.current.directionX = direction.x;
    motionRef.current.directionZ = direction.z;
    motionRef.current.heading = Math.atan2(velocity.x, -velocity.y || 0.0001);

    const proximity = getConsultationProximity(position);
    proximityRef.current = proximity;
    if (autoInteractRef.current && proximity.isWithinRange && !consulting) {
      autoInteractRef.current = false;
      moveTargetRef.current = null;
      velocity.set(0, 0);
      onPatientFocus?.("engaged");
      onConsultationChange(true);
    }

    const stateSnapshot = {
      canInteract: proximity.isWithinRange,
      distance: Math.round(proximity.distance * 4) / 4,
      isAutoWalking: autoInteractRef.current,
      isMoving: currentSpeed > 0.08,
    };
    const snapshotKey = `${Number(stateSnapshot.canInteract)}:${stateSnapshot.distance}:${Number(stateSnapshot.isAutoWalking)}:${Number(stateSnapshot.isMoving)}`;
    if (snapshotKey !== lastSnapshotRef.current) {
      lastSnapshotRef.current = snapshotKey;
      onWorldState?.(stateSnapshot);
    }

    const activeView = consulting
      ? cameraView.consultation
      : cameraView.exploration;
    const guidedView = consulting
      ? guidedCameraView.consultation
      : guidedCameraView.exploration;
    const responsiveFraming = getResponsiveCameraFraming(
      camera.aspect,
      consulting,
    );
    const responsiveCameraX = THREE.MathUtils.lerp(
      activeView.camera.x,
      guidedView.camera.x,
      responsiveFraming.blendToGuided,
    );
    const responsiveTargetX = THREE.MathUtils.lerp(
      activeView.target.x,
      guidedView.target.x,
      responsiveFraming.blendToGuided,
    );
    const responsiveTargetY = activeView.target.y - responsiveFraming.targetDrop;
    const desiredCameraX = consulting
      ? responsiveCameraX + pointer.x * 0.18
      : position.x * 0.52 + responsiveCameraX + pointer.x * 0.24;
    const desiredCameraY = activeView.camera.y + pointer.y * 0.1;
    const desiredCameraZ = consulting
      ? activeView.camera.z + responsiveFraming.pullback
      : position.z + activeView.camera.z + responsiveFraming.pullback;
    const desiredFov = responsiveFraming.fov;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredCameraX, 4.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredCameraY, 4.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredCameraZ, 4.8, delta);
    camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, 5.5, delta);
    camera.updateProjectionMatrix();

    if (consulting) {
      lookTarget.set(
        THREE.MathUtils.damp(
          lookTarget.x,
          responsiveTargetX + responsiveFraming.targetShift,
          6,
          delta,
        ),
        THREE.MathUtils.damp(lookTarget.y, responsiveTargetY, 6, delta),
        THREE.MathUtils.damp(lookTarget.z, activeView.target.z, 6, delta),
      );
    } else {
      lookTarget.set(
        THREE.MathUtils.damp(
          lookTarget.x,
          position.x * 0.42 + responsiveTargetX + responsiveFraming.targetShift,
          5,
          delta,
        ),
        THREE.MathUtils.damp(lookTarget.y, responsiveTargetY, 5, delta),
        THREE.MathUtils.damp(
          lookTarget.z,
          position.z + activeView.target.z,
          5,
          delta,
        ),
      );
    }
    camera.lookAt(lookTarget);
    gl.domElement.style.cursor = consulting ? "default" : "pointer";
  });

  return null;
}

function SceneRuntime(props) {
  const playerPositionRef = useRef(
    new THREE.Vector3(PLAYER_START.x, 0, PLAYER_START.z),
  );
  const playerGroupRef = useRef();
  const motionRef = useRef({
    amount: 0,
    directionX: 0,
    directionZ: 0,
    heading: 0,
  });
  const proximityRef = useRef(getConsultationProximity(PLAYER_START));
  const moveRequestRef = useRef();
  const interactionRequestRef = useRef();

  return (
    <>
      <PlayerController
        {...props}
        playerPositionRef={playerPositionRef}
        playerGroupRef={playerGroupRef}
        motionRef={motionRef}
        proximityRef={proximityRef}
        moveRequestRef={moveRequestRef}
        interactionRequestRef={interactionRequestRef}
      />
      <PharmacyWorld
        patientAvatar={props.patientAvatar}
        patientName={props.patientName}
        patientSpeaking={props.patientSpeaking}
        patientReaction={props.patientReaction}
        playerSpeaking={props.playerSpeaking}
        consulting={props.consulting}
        motionRef={motionRef}
        playerGroupRef={playerGroupRef}
        proximityRef={proximityRef}
        onFloorMove={(point) => moveRequestRef.current?.(point)}
        onPatientClick={() => interactionRequestRef.current?.()}
      />
    </>
  );
}

export function PharmacyScene({
  cameraPreset,
  patientAvatar,
  patientName,
  patientSpeaking,
  patientReaction,
  playerSpeaking,
  consulting,
  controlsEnabled,
  resetKey,
  onConsultationChange,
  onPatientFocus,
  onWorldState,
}) {
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 4.55, 11], fov: 47, near: 0.1, far: 65 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneRuntime
            cameraPreset={cameraPreset}
            patientAvatar={patientAvatar}
            patientName={patientName}
            patientSpeaking={patientSpeaking}
            patientReaction={patientReaction}
            playerSpeaking={playerSpeaking}
            consulting={consulting}
            controlsEnabled={controlsEnabled}
            resetKey={resetKey}
            onConsultationChange={onConsultationChange}
            onPatientFocus={onPatientFocus}
            onWorldState={onWorldState}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
