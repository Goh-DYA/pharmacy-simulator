import { RoundedBox, Text, useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CEILING_LIGHT_POSITIONS,
  EXTERIOR_BUILDINGS,
  EXTERIOR_TREES,
  PHARMACY_ROOM,
  PRODUCT_PALETTES,
  SHELF_RUNS,
  buildShelfStock,
} from "./environment.js";

const WOOD = "#b98e63";
const DARK_WOOD = "#7b5942";
const SAGE = "#748577";
const DARK_SAGE = "#4f655b";
const CREAM = "#eee7dc";
const INK = "#173f3b";
const TERRACOTTA = "#b9674f";

function setInstanceTransforms(mesh, items, getTransform) {
  if (!mesh) return;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  items.forEach((item, index) => {
    const transform = getTransform(item);
    dummy.position.set(...transform.position);
    dummy.rotation.set(...(transform.rotation ?? [0, 0, 0]));
    dummy.scale.set(...transform.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
    if (transform.color) mesh.setColorAt(index, color.set(transform.color));
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.material.needsUpdate = true;
  mesh.computeBoundingSphere();
}

function CartonStock({ items }) {
  const cartonRef = useRef();
  const labelRef = useRef();

  useEffect(() => {
    setInstanceTransforms(cartonRef.current, items, (item) => ({
      color: item.color,
      position: item.position,
      rotation: [0, item.rotationY, 0],
      scale: [item.width, item.height, item.depth],
    }));
    setInstanceTransforms(labelRef.current, items, (item) => ({
      color: "#f8f4eb",
      position: [
        item.position[0],
        item.position[1] - item.height * 0.08,
        item.position[2] + item.depth / 2 + 0.012,
      ],
      rotation: [0, item.rotationY, 0],
      scale: [item.width * 0.72, item.height * 0.13, 0.018],
    }));
  }, [items]);

  if (!items.length) return null;
  return (
    <>
      <instancedMesh ref={cartonRef} args={[undefined, undefined, items.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.72} />
      </instancedMesh>
      <instancedMesh ref={labelRef} args={[undefined, undefined, items.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.82} />
      </instancedMesh>
    </>
  );
}

function BottleStock({ items }) {
  const bottleRef = useRef();
  const capRef = useRef();

  useEffect(() => {
    setInstanceTransforms(bottleRef.current, items, (item) => ({
      color: item.color,
      position: item.position,
      rotation: [0, item.rotationY, 0],
      scale: [item.width, item.height, item.width],
    }));
    setInstanceTransforms(capRef.current, items, (item) => ({
      color: "#f3eee5",
      position: [
        item.position[0],
        item.position[1] + item.height / 2 + 0.045,
        item.position[2],
      ],
      scale: [item.width * 0.72, 0.09, item.width * 0.72],
    }));
  }, [items]);

  if (!items.length) return null;
  return (
    <>
      <instancedMesh ref={bottleRef} args={[undefined, undefined, items.length]} receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <meshStandardMaterial roughness={0.64} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, undefined, items.length]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </>
  );
}

function ProductStock({ palette, seed, width }) {
  const stock = useMemo(
    () => buildShelfStock({ palette, seed, width }),
    [palette, seed, width],
  );

  return (
    <group>
      <CartonStock items={stock.cartons} />
      <BottleStock items={stock.bottles} />
    </group>
  );
}

function WallShelfRun({ label, palette, position, rotationY, seed, width }) {
  const oakTexture = useTexture("/assets/oak-veneer.webp");
  const shelfHeights = [1.47, 2.23, 2.99, 3.75, 4.51];
  const doorCount = 6;
  const doorWidth = (width - 0.24) / doorCount;

  useEffect(() => {
    oakTexture.colorSpace = THREE.SRGBColorSpace;
    oakTexture.wrapS = THREE.RepeatWrapping;
    oakTexture.wrapT = THREE.RepeatWrapping;
    oakTexture.repeat.set(2.4, 2.4);
    oakTexture.anisotropy = 4;
    oakTexture.needsUpdate = true;
  }, [oakTexture]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 2.8, 0]}>
        <boxGeometry args={[width, 5.55, 0.18]} />
        <meshStandardMaterial map={oakTexture} color="#d8d0c7" roughness={0.76} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.58, 0.16]}>
        <boxGeometry args={[width, 1.12, 0.72]} />
        <meshStandardMaterial color={SAGE} roughness={0.73} />
      </mesh>
      <mesh position={[0, 0.08, 0.46]}>
        <boxGeometry args={[width, 0.15, 0.16]} />
        <meshStandardMaterial color="#40524a" roughness={0.82} />
      </mesh>

      {Array.from({ length: doorCount }, (_, index) => {
        const x = -width / 2 + doorWidth / 2 + 0.12 + index * doorWidth;
        return (
          <group key={`door-${index}`} position={[x, 0.58, 0.535]}>
            <mesh>
              <boxGeometry args={[doorWidth - 0.045, 0.98, 0.025]} />
              <meshStandardMaterial
                color={index % 3 === 1 ? "#829286" : "#758578"}
                roughness={0.72}
              />
            </mesh>
            <mesh position={[doorWidth * 0.3, 0.02, 0.035]}>
              <boxGeometry args={[0.035, 0.24, 0.035]} />
              <meshStandardMaterial color="#b9aa91" metalness={0.35} roughness={0.46} />
            </mesh>
          </group>
        );
      })}

      {shelfHeights.map((height) => (
        <mesh key={height} receiveShadow position={[0, height, 0.26]}>
          <boxGeometry args={[width, 0.085, 0.78]} />
          <meshStandardMaterial map={oakTexture} color="#ebe6df" roughness={0.67} />
        </mesh>
      ))}
      {[-width / 2, width / 2].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 2.85, 0.2]}>
          <boxGeometry args={[0.14, 5.72, 0.78]} />
          <meshStandardMaterial map={oakTexture} color="#ddd5cc" roughness={0.66} />
        </mesh>
      ))}
      {[-width / 4, 0, width / 4].map((x) => (
        <mesh key={`upright-${x}`} receiveShadow position={[x, 3.25, 0.12]}>
          <boxGeometry args={[0.065, 4.02, 0.58]} />
          <meshStandardMaterial map={oakTexture} color="#d1c8bf" roughness={0.69} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 5.66, 0.43]}>
        <boxGeometry args={[Math.min(4.3, width - 0.4), 0.56, 0.12]} />
        <meshStandardMaterial color={INK} roughness={0.65} />
      </mesh>
      <Text
        position={[0, 5.66, 0.5]}
        fontSize={0.24}
        color="#f7f0e4"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.075}
      >
        {label}
      </Text>
      <ProductStock palette={palette} seed={seed} width={width} />
    </group>
  );
}

function RoomShell() {
  const depth = PHARMACY_ROOM.frontZ - PHARMACY_ROOM.backZ;
  const centerZ = (PHARMACY_ROOM.frontZ + PHARMACY_ROOM.backZ) / 2;
  const halfWidth = PHARMACY_ROOM.width / 2;

  return (
    <group>
      {[-halfWidth, halfWidth].map((x) => (
        <group key={`wall-${x}`}>
          <mesh receiveShadow position={[x, PHARMACY_ROOM.height / 2, centerZ]}>
            <boxGeometry args={[0.28, PHARMACY_ROOM.height, depth]} />
            <meshStandardMaterial color="#ddd4c7" roughness={0.92} />
          </mesh>
          <mesh position={[x - Math.sign(x) * 0.16, 0.19, centerZ]}>
            <boxGeometry args={[0.12, 0.34, depth]} />
            <meshStandardMaterial color="#92735a" roughness={0.74} />
          </mesh>
          <mesh position={[x - Math.sign(x) * 0.17, 5.95, centerZ]}>
            <boxGeometry args={[0.1, 0.15, depth]} />
            <meshStandardMaterial color="#bd9c78" roughness={0.72} />
          </mesh>
        </group>
      ))}

      <mesh receiveShadow position={[0, PHARMACY_ROOM.height, centerZ]}>
        <boxGeometry args={[PHARMACY_ROOM.floorWidth, 0.24, depth]} />
        <meshStandardMaterial color="#eee8de" roughness={0.94} />
      </mesh>
      {[-5.7, -1.2, 3.35, 8.1, 12.8].map((z) => (
        <mesh key={`bulkhead-${z}`} position={[0, 7.1, z]}>
          <boxGeometry args={[PHARMACY_ROOM.width - 0.3, 0.34, 0.28]} />
          <meshStandardMaterial color="#d9d0c4" roughness={0.88} />
        </mesh>
      ))}
      <mesh position={[0, 7.06, 2.25]}>
        <boxGeometry args={[1.75, 0.1, 1.75]} />
        <meshStandardMaterial color="#d4d8d3" roughness={0.75} />
      </mesh>
      {[-0.56, 0, 0.56].flatMap((x) =>
        [-0.56, 0, 0.56].map((z) => (
          <mesh key={`vent-${x}-${z}`} position={[x, 6.99, 2.25 + z]}>
            <boxGeometry args={[0.38, 0.025, 0.025]} />
            <meshStandardMaterial color="#9fa7a0" roughness={0.75} />
          </mesh>
        )),
      )}
    </group>
  );
}

function CeilingFixtures() {
  return (
    <group>
      {CEILING_LIGHT_POSITIONS.map(([x, y, z], index) => (
        <group key={`ceiling-light-${x}-${z}`} position={[x, y - 0.045, z]}>
          <mesh>
            <boxGeometry args={[1.55, 0.075, 0.58]} />
            <meshStandardMaterial color="#d6d3cb" roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.043, 0]}>
            <boxGeometry args={[1.38, 0.018, 0.43]} />
            <meshStandardMaterial
              color="#fff5dc"
              emissive="#ffe5a8"
              emissiveIntensity={index < 8 ? 1.75 : 1.25}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GlassPane({ position, size }) {
  return (
    <mesh position={position} renderOrder={-1}>
      <boxGeometry args={[size[0], size[1], 0.035]} />
      <meshPhysicalMaterial
        color="#b8d5cf"
        transparent
        opacity={0.14}
        roughness={0.18}
        metalness={0.05}
        depthWrite={false}
      />
    </mesh>
  );
}

function Storefront() {
  const paneCentres = [-6.75, -4.45, -2.2, 2.25, 4.5, 6.75];
  const mullions = [-8.25, -5.62, -3.3, -1.12, 1.13, 3.32, 5.62, 8.25];

  return (
    <group position={[0, 0, -6.72]}>
      <mesh castShadow position={[0, 6.48, 0]}>
        <boxGeometry args={[16.8, 0.52, 0.34]} />
        <meshStandardMaterial color={DARK_SAGE} roughness={0.68} />
      </mesh>
      <Text
        position={[0, 6.48, 0.19]}
        fontSize={0.28}
        color="#f6efe3"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.11}
      >
        PHARMACITY  ·  COMMUNITY CARE
      </Text>
      {mullions.map((x) => (
        <mesh key={`mullion-${x}`} position={[x, 3.18, 0.02]}>
          <boxGeometry args={[0.13, 6.15, 0.19]} />
          <meshStandardMaterial color="#bdad99" metalness={0.08} roughness={0.52} />
        </mesh>
      ))}
      <mesh position={[0, 5.42, 0.02]}>
        <boxGeometry args={[16.6, 0.12, 0.19]} />
        <meshStandardMaterial color="#bdad99" metalness={0.08} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.08, 0.08]}>
        <boxGeometry args={[16.6, 0.16, 0.34]} />
        <meshStandardMaterial color="#806f5f" metalness={0.16} roughness={0.58} />
      </mesh>

      {paneCentres.map((x) => (
        <GlassPane key={`pane-${x}`} position={[x, 2.78, 0]} size={[2.05, 5.22]} />
      ))}
      {[-0.56, 0.56].map((x) => (
        <group key={`door-${x}`} position={[x, 2.72, 0.055]}>
          <GlassPane position={[0, 0, 0]} size={[1.06, 5.18]} />
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[1.1, 0.09, 0.1]} />
            <meshStandardMaterial color="#aa9d8c" metalness={0.16} roughness={0.52} />
          </mesh>
          <mesh position={[x < 0 ? 0.38 : -0.38, 0.05, 0.16]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 12]} />
            <meshStandardMaterial color="#8e8b81" metalness={0.7} roughness={0.28} />
          </mesh>
        </group>
      ))}
      <Text
        position={[0, 4.72, 0.2]}
        fontSize={0.13}
        color="#f7f2e9"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        OPEN DAILY  ·  8 AM – 10 PM
      </Text>
    </group>
  );
}

function ExteriorPlanter({ position }) {
  return (
    <group position={position}>
      <RoundedBox args={[2.3, 0.72, 0.76]} radius={0.08} smoothness={2} castShadow>
        <meshStandardMaterial color="#b8aa96" roughness={0.86} />
      </RoundedBox>
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[2.08, 0.08, 0.62]} />
        <meshStandardMaterial color="#554a37" roughness={1} />
      </mesh>
      {[-0.78, -0.38, 0, 0.4, 0.78].map((x, index) => (
        <group key={`plant-${x}`} position={[x, 0.68, 0]} rotation={[0, index * 0.8, 0]}>
          {[-0.22, 0, 0.22].map((offset, leafIndex) => (
            <mesh
              key={`leaf-${offset}`}
              position={[offset, 0.18 + leafIndex * 0.04, 0]}
              rotation={[0, 0, offset * 1.5]}
            >
              <sphereGeometry args={[0.2, 10, 8]} />
              <meshStandardMaterial
                color={leafIndex % 2 ? "#6d8c64" : "#527456"}
                roughness={0.92}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function StreetTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 3.7, 10]} />
        <meshStandardMaterial color="#786047" roughness={0.96} />
      </mesh>
      {[
        [-0.55, 3.85, 0, 1.1],
        [0.45, 4.05, 0.1, 1.2],
        [0, 4.65, -0.15, 1.25],
        [0.65, 4.55, -0.2, 0.92],
      ].map(([x, y, z, size], index) => (
        <mesh key={`canopy-${index}`} castShadow position={[x, y, z]} scale={[size, size * 0.8, size]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={index % 2 ? "#4f7956" : "#5f865a"}
            roughness={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}

function BuildingFacade({ building }) {
  const [width, height, depth] = building.size;
  const windows = useMemo(() => {
    const result = [];
    const horizontalStep = width / (building.columns + 1);
    const verticalStep = (height - 1.4) / (building.rows + 0.4);
    for (let row = 0; row < building.rows; row += 1) {
      for (let column = 0; column < building.columns; column += 1) {
        result.push({
          color: (row + column) % 4 === 0 ? "#70918c" : "#8da4a0",
          position: [
            -width / 2 + horizontalStep * (column + 1),
            -height / 2 + 1.3 + verticalStep * row,
            depth / 2 + 0.025,
          ],
          scale: [horizontalStep * 0.42, verticalStep * 0.42, 0.045],
        });
      }
    }
    return result;
  }, [building, depth, height, width]);
  const windowRef = useRef();

  useEffect(() => {
    setInstanceTransforms(windowRef.current, windows, (window) => window);
  }, [windows]);

  return (
    <group position={building.position}>
      <mesh receiveShadow>
        <boxGeometry args={building.size} />
        <meshStandardMaterial color={building.color} roughness={0.94} />
      </mesh>
      <mesh position={[-width * 0.32, 0, depth / 2 + 0.06]}>
        <boxGeometry args={[width * 0.09, height, 0.08]} />
        <meshStandardMaterial color={building.accent} roughness={0.85} />
      </mesh>
      {Array.from({ length: building.rows }, (_, row) => (
        <mesh
          key={`balcony-${row}`}
          position={[0, -height / 2 + 1.4 + row * ((height - 1.4) / building.rows), depth / 2 + 0.09]}
        >
          <boxGeometry args={[width * 0.92, 0.1, 0.2]} />
          <meshStandardMaterial color="#eee7dc" roughness={0.82} />
        </mesh>
      ))}
      <instancedMesh ref={windowRef} args={[undefined, undefined, windows.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.12} roughness={0.42} />
      </instancedMesh>
      <mesh position={[0, -height / 2 + 0.5, depth / 2 + 0.34]}>
        <boxGeometry args={[width * 0.88, 0.18, 0.74]} />
        <meshStandardMaterial color={building.accent} roughness={0.72} />
      </mesh>
    </group>
  );
}

function SingaporeExterior() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.02, -8.55]}>
        <boxGeometry args={[21, 0.12, 3.5]} />
        <meshStandardMaterial color="#cfcbc2" roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.02, -10.3]}>
        <boxGeometry args={[23, 0.22, 0.28]} />
        <meshStandardMaterial color="#a9a49b" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.16, -12.75]}>
        <boxGeometry args={[32, 0.15, 5]} />
        <meshStandardMaterial color="#59615f" roughness={0.95} />
      </mesh>
      {[-7.6, -2.5, 2.6, 7.7].map((x) => (
        <mesh key={`road-mark-${x}`} position={[x, -0.07, -12.7]}>
          <boxGeometry args={[2.5, 0.025, 0.1]} />
          <meshStandardMaterial color="#e2d8b6" roughness={0.84} />
        </mesh>
      ))}
      <mesh position={[0, 3.05, -17.6]}>
        <boxGeometry args={[22, 0.2, 2.1]} />
        <meshStandardMaterial color="#b7ad9e" roughness={0.85} />
      </mesh>
      {[-9, -4.5, 0, 4.5, 9].map((x) => (
        <mesh key={`walkway-column-${x}`} position={[x, 1.5, -17.1]}>
          <boxGeometry args={[0.18, 3, 0.18]} />
          <meshStandardMaterial color="#8a8378" metalness={0.08} roughness={0.72} />
        </mesh>
      ))}
      <ExteriorPlanter position={[-4.55, 0.36, -8.15]} />
      <ExteriorPlanter position={[4.55, 0.36, -8.15]} />
      {EXTERIOR_TREES.map((tree) => (
        <StreetTree key={tree.id} {...tree} />
      ))}
      {EXTERIOR_BUILDINGS.map((building) => (
        <BuildingFacade key={building.id} building={building} />
      ))}
    </group>
  );
}

function DispensaryCabinets() {
  return (
    <group>
      {[-4.95, 4.95].map((x, sideIndex) => (
        <group key={`dispensary-${x}`} position={[x, 0, -5.76]}>
          <RoundedBox args={[3.25, 1.18, 0.72]} radius={0.07} smoothness={2} castShadow receiveShadow position={[0, 0.59, 0]}>
            <meshStandardMaterial color={sideIndex ? "#7d8a7d" : SAGE} roughness={0.76} />
          </RoundedBox>
          <mesh position={[0, 1.23, 0.03]}>
            <boxGeometry args={[3.38, 0.12, 0.82]} />
            <meshStandardMaterial color="#d6c6b1" roughness={0.65} />
          </mesh>
          {[-1.06, -0.35, 0.36, 1.07].map((doorX) => (
            <group key={doorX} position={[doorX, 0.61, 0.37]}>
              <mesh>
                <boxGeometry args={[0.66, 0.98, 0.025]} />
                <meshStandardMaterial color="#788779" roughness={0.73} />
              </mesh>
              <mesh position={[0.2, 0.03, 0.035]}>
                <boxGeometry args={[0.035, 0.23, 0.035]} />
                <meshStandardMaterial color="#b4a68e" metalness={0.32} roughness={0.45} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <group position={[-6.25, 2.5, -5.62]}>
        <RoundedBox args={[1.28, 2.52, 0.82]} radius={0.06} smoothness={2} castShadow>
          <meshStandardMaterial color="#e6e5df" roughness={0.68} />
        </RoundedBox>
        <mesh position={[0, 0.14, 0.43]}>
          <boxGeometry args={[1.05, 1.62, 0.035]} />
          <meshPhysicalMaterial color="#8eaaa5" transparent opacity={0.38} depthWrite={false} roughness={0.22} />
        </mesh>
        <mesh position={[0.46, 0.16, 0.47]}>
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial color="#888b84" metalness={0.52} roughness={0.32} />
        </mesh>
      </group>
    </group>
  );
}

function ServiceDetails() {
  return (
    <group>
      <group position={[-6.25, 0, 4.55]}>
        {[0, 0.18, 0.36].map((y, index) => (
          <RoundedBox key={y} args={[0.92 - index * 0.04, 0.2, 0.62]} radius={0.05} smoothness={2} position={[0, 0.15 + y, 0]}>
            <meshStandardMaterial color={index === 1 ? TERRACOTTA : "#365f59"} roughness={0.76} />
          </RoundedBox>
        ))}
      </group>
      <group position={[6.23, 0, 4.35]}>
        <mesh castShadow position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.34, 0.39, 1.15, 20]} />
          <meshStandardMaterial color="#d9d4ca" metalness={0.22} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.17, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 20]} />
          <meshStandardMaterial color="#777e78" metalness={0.42} roughness={0.45} />
        </mesh>
      </group>
      <group position={[7.97, 5.75, 1.1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <circleGeometry args={[0.48, 40]} />
          <meshStandardMaterial color="#f1ece2" roughness={0.76} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.43, 0.48, 40]} />
          <meshStandardMaterial color={WOOD} roughness={0.64} />
        </mesh>
        <mesh position={[0.08, 0.08, 0.04]} rotation={[0, 0, -0.75]}>
          <boxGeometry args={[0.03, 0.26, 0.025]} />
          <meshStandardMaterial color={INK} roughness={0.62} />
        </mesh>
        <mesh position={[-0.05, 0.02, 0.045]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.025, 0.34, 0.025]} />
          <meshStandardMaterial color={INK} roughness={0.62} />
        </mesh>
      </group>
      <group position={[-7.96, 5.25, 3.35]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[2.1, 1.45, 0.08]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color="#edf0e8" roughness={0.84} />
        </RoundedBox>
        <Text position={[0, 0.25, 0.06]} fontSize={0.19} color={INK} anchorX="center" anchorY="middle">
          ASK YOUR PHARMACIST
        </Text>
        <Text position={[0, -0.15, 0.06]} fontSize={0.11} color={TERRACOTTA} anchorX="center" anchorY="middle">
          Personal advice · safer choices
        </Text>
      </group>
    </group>
  );
}

export function PharmacyEnvironment() {
  return (
    <group>
      <RoomShell />
      <CeilingFixtures />
      <Storefront />
      <SingaporeExterior />
      {SHELF_RUNS.map((shelf) => (
        <WallShelfRun
          key={shelf.id}
          {...shelf}
          palette={PRODUCT_PALETTES[shelf.palette]}
        />
      ))}
      <DispensaryCabinets />
      <ServiceDetails />
    </group>
  );
}
