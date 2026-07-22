export const PHARMACY_ROOM = Object.freeze({
  width: 17,
  height: 7.4,
  backZ: -7.1,
  frontZ: 18,
  floorWidth: 24,
  floorDepth: 32,
  floorCenterZ: 1.5,
});

export const ENVIRONMENT_BUDGET = Object.freeze({
  maxProductInstances: 340,
  maxCeilingLights: 12,
  maxShadowCastingFixtures: 24,
});

export const PRODUCT_PALETTES = Object.freeze({
  "Cold & Flu": Object.freeze([
    "#f3eee5",
    "#9ebdb5",
    "#83a9b6",
    "#d6a46f",
    "#c8d7c3",
  ]),
  "Pain Relief": Object.freeze([
    "#f4efe7",
    "#d89b83",
    "#d9ba72",
    "#9bb5aa",
    "#a7b9ca",
  ]),
});

export const SHELF_RUNS = Object.freeze([
  Object.freeze({
    id: "left-cold-flu",
    label: "COLD & FLU",
    palette: "Cold & Flu",
    position: Object.freeze([-7.15, 0, -0.55]),
    rotationY: Math.PI / 2,
    seed: 7341,
    width: 7.65,
  }),
  Object.freeze({
    id: "right-pain-relief",
    label: "PAIN RELIEF",
    palette: "Pain Relief",
    position: Object.freeze([7.15, 0, -0.55]),
    rotationY: -Math.PI / 2,
    seed: 9217,
    width: 7.65,
  }),
]);

export const CEILING_LIGHT_POSITIONS = Object.freeze(
  [-5.4, -1.8, 1.8, 5.4].flatMap((x) =>
    [-3.8, 0.5, 4.8].map((z) => Object.freeze([x, 7.2, z])),
  ),
);

export const EXTERIOR_BUILDINGS = Object.freeze([
  Object.freeze({
    id: "heartland-centre",
    position: Object.freeze([0, 6.6, -22.5]),
    size: Object.freeze([13.5, 13.2, 2.2]),
    color: "#d6c1aa",
    accent: "#9f5f4e",
    columns: 7,
    rows: 6,
  }),
  Object.freeze({
    id: "left-hdb",
    position: Object.freeze([-11.2, 5.6, -20.7]),
    size: Object.freeze([7.8, 11.2, 2.4]),
    color: "#c9d0c2",
    accent: "#71877b",
    columns: 4,
    rows: 5,
  }),
  Object.freeze({
    id: "right-hdb",
    position: Object.freeze([11.1, 5.9, -21.2]),
    size: Object.freeze([8.2, 11.8, 2.4]),
    color: "#d8cfbd",
    accent: "#a97757",
    columns: 4,
    rows: 5,
  }),
]);

export const EXTERIOR_TREES = Object.freeze([
  Object.freeze({ id: "tree-left", position: Object.freeze([-5.7, 0, -13.9]), scale: 1.05 }),
  Object.freeze({ id: "tree-centre", position: Object.freeze([0.3, 0, -15.2]), scale: 0.9 }),
  Object.freeze({ id: "tree-right", position: Object.freeze([5.6, 0, -13.7]), scale: 1 }),
]);

const SHELF_HEIGHTS = Object.freeze([1.52, 2.28, 3.04, 3.8, 4.56]);

function createSeededRandom(initialSeed) {
  let seed = Number.isFinite(initialSeed) ? initialSeed >>> 0 : 1;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

export function buildShelfStock({
  palette = PRODUCT_PALETTES["Cold & Flu"],
  seed = 1,
  shelfHeights = SHELF_HEIGHTS,
  width = 7.65,
} = {}) {
  const random = createSeededRandom(seed);
  const cartons = [];
  const bottles = [];

  shelfHeights.forEach((shelfY, rowIndex) => {
    let cursor = -width / 2 + 0.25 + random() * 0.08;
    const rightEdge = width / 2 - 0.25;

    while (cursor < rightEdge) {
      const isBottle = random() < 0.2;
      const itemWidth = isBottle
        ? 0.22 + random() * 0.11
        : 0.26 + random() * 0.24;
      if (cursor + itemWidth > rightEdge) break;

      const height = isBottle
        ? 0.38 + random() * 0.2
        : 0.34 + random() * 0.28;
      const depth = isBottle ? itemWidth : 0.2 + random() * 0.1;
      const position = [
        cursor + itemWidth / 2,
        shelfY + height / 2 + 0.035,
        0.47 + random() * 0.035,
      ];
      const color = palette[
        (rowIndex * 2 + Math.floor(random() * palette.length)) % palette.length
      ];

      const item = {
        color,
        depth,
        height,
        id: `${seed}-${rowIndex}-${cartons.length + bottles.length}`,
        position,
        rotationY: (random() - 0.5) * 0.055,
        width: itemWidth,
      };
      if (isBottle) bottles.push(item);
      else cartons.push(item);

      cursor += itemWidth + 0.07 + random() * 0.085;
    }
  });

  return { bottles, cartons };
}

export function fixtureIntersectsNavigation(fixture, navigationBounds) {
  const fixtureMinX = fixture.x - fixture.width / 2;
  const fixtureMaxX = fixture.x + fixture.width / 2;
  const fixtureMinZ = fixture.z - fixture.depth / 2;
  const fixtureMaxZ = fixture.z + fixture.depth / 2;

  return !(
    fixtureMaxX < navigationBounds.minX ||
    fixtureMinX > navigationBounds.maxX ||
    fixtureMaxZ < navigationBounds.minZ ||
    fixtureMinZ > navigationBounds.maxZ
  );
}

export const MAJOR_FIXTURE_BOUNDS = Object.freeze([
  Object.freeze({ id: "left-shelves", x: -7.15, z: -0.55, width: 0.9, depth: 7.65 }),
  Object.freeze({ id: "right-shelves", x: 7.15, z: -0.55, width: 0.9, depth: 7.65 }),
  Object.freeze({ id: "consultation-counter", x: 0.2, z: 1.5, width: 7.8, depth: 1.35 }),
]);
