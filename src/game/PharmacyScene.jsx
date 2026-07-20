import { Suspense, useMemo, useRef } from "react";
import { Billboard, Text, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PRODUCT_COLORS = [
  "#d8e9df",
  "#f3d6b8",
  "#bdd7db",
  "#e8c8bf",
  "#dfe0b7",
  "#c8d2ea",
];

function CameraRig({ focusMode }) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const motionScale = focusMode ? 0.18 : 0.42;
    const destinationX = pointer.x * motionScale;
<<<<<<< HEAD
    const destinationY = 4.2 + pointer.y * 0.1;
=======
    const destinationY = 3.75 + pointer.y * 0.1;
>>>>>>> origin/main
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      destinationX,
      4,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      destinationY,
      4,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      focusMode ? 10.8 : 12.2,
      4,
      delta,
    );
<<<<<<< HEAD
    target.set(focusMode ? 0.25 : -0.3, focusMode ? 2.35 : 2.15, -0.8);
=======
    target.set(focusMode ? 0.25 : -0.3, focusMode ? 2.25 : 2.05, -0.8);
>>>>>>> origin/main
    camera.lookAt(target);
  });

  return null;
}

function ProductRow({ y, z, side = 1 }) {
  const products = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        color: PRODUCT_COLORS[(index + Math.round(y * 3)) % PRODUCT_COLORS.length],
        height: 0.34 + ((index * 7) % 4) * 0.06,
        width: 0.22 + ((index * 3) % 3) * 0.04,
        x: -1.85 + index * 0.285,
      })),
    [y],
  );

  return (
    <group position={[side * 4.95, y, z]} rotation={[0, side > 0 ? -0.08 : 0.08, 0]}>
      {products.map((product, index) => (
        <mesh
          key={`${y}-${index}`}
          castShadow
          position={[product.x, product.height / 2 + 0.07, 0]}
        >
          <boxGeometry args={[product.width, product.height, 0.24]} />
          <meshStandardMaterial
            color={product.color}
            roughness={0.72}
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  );
}

function Shelving({ side = 1 }) {
  const x = side * 5.7;
  return (
    <group
      position={[x, 0.15, -1.85]}
      rotation={[0, side > 0 ? -1.28 : 1.28, 0]}
      scale={[0.82, 0.9, 0.82]}
    >
      <mesh receiveShadow position={[0, 2.55, -0.24]}>
        <boxGeometry args={[4.45, 5.15, 0.32]} />
        <meshStandardMaterial color="#e8ddce" roughness={0.8} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (
        <group key={index}>
          <mesh receiveShadow position={[0, 0.55 + index * 0.82, -0.03]}>
            <boxGeometry args={[4.25, 0.1, 0.76]} />
            <meshStandardMaterial color="#9c8065" roughness={0.7} />
          </mesh>
          <ProductRow y={0.64 + index * 0.82} z={0.42} side={0} />
        </group>
      ))}
    </group>
  );
}

function HeartlandView() {
  return (
    <group position={[0, 0, -8]}>
      <mesh position={[0, 2.4, 0]}>
        <planeGeometry args={[10, 5.1]} />
        <meshStandardMaterial color="#c8dfe0" roughness={1} />
      </mesh>
      <mesh position={[-2.8, 2.55, -0.15]}>
        <boxGeometry args={[3.4, 4.2, 0.3]} />
        <meshStandardMaterial color="#d8c7ba" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 2.7, -0.2]}>
        <boxGeometry args={[3.7, 4.5, 0.35]} />
        <meshStandardMaterial color="#c6d0c9" roughness={0.9} />
      </mesh>
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 8 }, (_, column) => (
          <mesh
            key={`${row}-${column}`}
            position={[-4.05 + column * 1.16, 1.15 + row * 0.86, 0.04]}
          >
            <boxGeometry args={[0.5, 0.38, 0.05]} />
            <meshStandardMaterial
              color={(row + column) % 3 === 0 ? "#eaefe9" : "#75929a"}
              roughness={0.65}
            />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.32, 1]}>
        <boxGeometry args={[12, 0.3, 1.6]} />
        <meshStandardMaterial color="#a98a72" roughness={1} />
      </mesh>
      <mesh position={[0, 1.95, 1.32]}>
        <boxGeometry args={[0.16, 4.25, 0.16]} />
        <meshStandardMaterial color="#354b46" />
      </mesh>
      <mesh position={[0, 4.1, 1.32]}>
        <boxGeometry args={[10.3, 0.16, 0.16]} />
        <meshStandardMaterial color="#354b46" />
      </mesh>
      <group position={[-3.8, 0.35, 0.65]}>
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.09, 0.14, 2.5, 12]} />
          <meshStandardMaterial color="#8c694d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.5, 0]} scale={[1.15, 0.45, 0.7]}>
          <sphereGeometry args={[0.85, 18, 14]} />
          <meshStandardMaterial color="#739575" roughness={0.92} />
        </mesh>
      </group>
      <group position={[3.75, 0.35, 0.5]}>
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.08, 0.13, 2.3, 12]} />
          <meshStandardMaterial color="#8c694d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.35, 0]} scale={[1, 0.42, 0.62]}>
          <sphereGeometry args={[0.8, 18, 14]} />
          <meshStandardMaterial color="#66876d" roughness={0.92} />
        </mesh>
      </group>
    </group>
  );
}

function ConsultationCounter() {
  return (
    <group position={[0, 0, 1.55]}>
      <mesh receiveShadow castShadow position={[0.2, 1.05, 0]}>
        <boxGeometry args={[7.4, 1.7, 1.28]} />
        <meshStandardMaterial color="#a87f5f" roughness={0.62} />
      </mesh>
      <mesh receiveShadow castShadow position={[0.2, 1.95, 0]}>
        <boxGeometry args={[7.8, 0.18, 1.55]} />
        <meshStandardMaterial color="#e3d3c0" roughness={0.58} />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={index} position={[-3.1 + index * 0.9, 1.04, 0.67]}>
          <boxGeometry args={[0.05, 1.45, 0.05]} />
          <meshStandardMaterial color="#856249" roughness={0.8} />
        </mesh>
      ))}
      <mesh castShadow position={[-2.1, 2.35, -0.15]} rotation={[-0.1, 0.25, 0]}>
        <boxGeometry args={[0.95, 0.7, 0.12]} />
        <meshStandardMaterial color="#243f3c" metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[2.7, 2.16, 0.05]}>
        <cylinderGeometry args={[0.19, 0.24, 0.32, 20]} />
        <meshStandardMaterial color="#d9b06e" roughness={0.42} />
      </mesh>
    </group>
  );
}

function PharmacyBackdrop() {
  const backgroundTexture = useTexture("/assets/pharmacy-background.png");
  backgroundTexture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 4.15, -7.45]}>
      <planeGeometry args={[24, 16]} />
      <meshBasicMaterial
        map={backgroundTexture}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

function CharacterSprite({ map, position, scale, opacity = 1, onClick }) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <mesh scale={scale} onClick={onClick}>
        <planeGeometry args={[1, 1.5]} />
        <meshBasicMaterial
          map={map}
          transparent
          alphaTest={0.06}
          depthWrite={false}
          toneMapped={false}
          opacity={opacity}
        />
      </mesh>
    </Billboard>
  );
}

function Characters({ focusMode, onPatientFocus, patientAvatar }) {
  const patientTexture = useTexture(patientAvatar);
  const pharmacistTexture = useTexture("/assets/pharmacist-back.png");
  patientTexture.colorSpace = THREE.SRGBColorSpace;
  pharmacistTexture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      <CharacterSprite
        map={patientTexture}
        position={[1.35, 2.68, 0.16]}
        scale={[3.7, 5.55, 1]}
        onClick={onPatientFocus}
      />
      <CharacterSprite
        map={pharmacistTexture}
        position={[-1.65, 2.55, 3.52]}
        scale={[3.1, 4.65, 1]}
        opacity={focusMode ? 0.98 : 0.78}
      />
      <mesh position={[1.35, 0.22, -0.06]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.55, 48]} />
        <meshBasicMaterial color="#f0a744" transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

function PharmacyWorld({ focusMode, onPatientFocus, patientAvatar }) {
  const worldRef = useRef();

  useFrame(({ clock }) => {
    if (!worldRef.current) return;
    worldRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.012;
  });

  return (
    <group ref={worldRef}>
      <color attach="background" args={["#d8cdbf"]} />
      <fog attach="fog" args={["#d8cdbf", 14, 28]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#f8f1dd", "#6f796b", 1.35]} />
      <directionalLight
        castShadow
        position={[-4, 9, 7]}
        intensity={2.35}
        color="#fff0d7"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[24, 25]} />
        <meshStandardMaterial color="#d7c9b9" roughness={0.86} />
      </mesh>
      <mesh receiveShadow position={[0, 8, -1.2]}>
        <boxGeometry args={[16, 0.25, 14]} />
        <meshStandardMaterial color="#efe7dc" roughness={0.9} />
      </mesh>
      <PharmacyBackdrop />
      <ConsultationCounter />
      <group position={[4.15, 4.8, -2.35]}>
        <mesh>
          <boxGeometry args={[2.45, 0.68, 0.12]} />
          <meshStandardMaterial color="#36564f" roughness={0.72} />
        </mesh>
        <Text
          position={[0, 0, 0.07]}
          fontSize={0.28}
          color="#f5eee2"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          SELF-CARE
        </Text>
      </group>
      <group position={[0, 5.15, -6.48]}>
        <mesh>
          <boxGeometry args={[9.9, 0.72, 0.16]} />
          <meshStandardMaterial color="#36564f" roughness={0.74} />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.25}
          color="#f4ede1"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          CARE  ·  FOR YOU  ·  FOR LIFE
        </Text>
      </group>
      <Characters
        focusMode={focusMode}
        onPatientFocus={onPatientFocus}
        patientAvatar={patientAvatar}
      />
    </group>
  );
}

export function PharmacyScene({ focusMode, onPatientFocus, patientAvatar }) {
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
<<<<<<< HEAD
        camera={{ position: [0, 4.2, 10.8], fov: 47, near: 0.1, far: 45 }}
=======
        camera={{ position: [0, 3.75, 10.8], fov: 47, near: 0.1, far: 45 }}
>>>>>>> origin/main
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraRig focusMode={focusMode} />
        <Suspense fallback={null}>
          <PharmacyWorld
            focusMode={focusMode}
            onPatientFocus={onPatientFocus}
            patientAvatar={patientAvatar}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
