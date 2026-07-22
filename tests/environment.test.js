import assert from "node:assert/strict";
import test from "node:test";
import {
  CEILING_LIGHT_POSITIONS,
  ENVIRONMENT_BUDGET,
  EXTERIOR_BUILDINGS,
  MAJOR_FIXTURE_BOUNDS,
  PHARMACY_ROOM,
  PRODUCT_PALETTES,
  SHELF_RUNS,
  buildShelfStock,
  fixtureIntersectsNavigation,
} from "../src/game/environment.js";
import { NAVIGATION_BOUNDS } from "../src/game/movement.js";

test("the 3D pharmacy shell covers the full camera envelope", () => {
  assert.ok(PHARMACY_ROOM.width >= 16);
  assert.ok(PHARMACY_ROOM.height >= 7.1);
  assert.ok(PHARMACY_ROOM.backZ <= -7);
  assert.ok(PHARMACY_ROOM.frontZ >= 17);
  assert.ok(PHARMACY_ROOM.floorWidth >= PHARMACY_ROOM.width);
  assert.ok(PHARMACY_ROOM.floorDepth >= 30);
});

test("major pharmacy fixtures leave the navigation corridor clear", () => {
  const fixtureIds = MAJOR_FIXTURE_BOUNDS.map((fixture) => fixture.id);
  assert.equal(new Set(fixtureIds).size, fixtureIds.length);
  for (const fixture of MAJOR_FIXTURE_BOUNDS) {
    assert.equal(
      fixtureIntersectsNavigation(fixture, NAVIGATION_BOUNDS),
      false,
      `${fixture.id} overlaps the walkable corridor`,
    );
  }
});

test("stock generation is deterministic, bounded, and sufficiently populated", () => {
  let totalProducts = 0;

  for (const shelf of SHELF_RUNS) {
    const options = {
      palette: PRODUCT_PALETTES[shelf.palette],
      seed: shelf.seed,
      width: shelf.width,
    };
    const first = buildShelfStock(options);
    const second = buildShelfStock(options);
    assert.deepEqual(first, second);

    const products = [...first.cartons, ...first.bottles];
    totalProducts += products.length;
    assert.ok(products.length >= 65, `${shelf.id} does not look fully stocked`);

    for (const product of products) {
      assert.ok(Number.isFinite(product.position[0]));
      assert.ok(Number.isFinite(product.position[1]));
      assert.ok(Number.isFinite(product.position[2]));
      assert.ok(Math.abs(product.position[0]) <= shelf.width / 2);
      assert.ok(product.height > 0 && product.width > 0 && product.depth > 0);
      assert.ok(PRODUCT_PALETTES[shelf.palette].includes(product.color));
    }
  }

  assert.ok(totalProducts >= 140);
  assert.ok(totalProducts <= ENVIRONMENT_BUDGET.maxProductInstances);
});

test("lighting and exterior detail stay within the scene budget", () => {
  assert.ok(CEILING_LIGHT_POSITIONS.length > 0);
  assert.ok(
    CEILING_LIGHT_POSITIONS.length <= ENVIRONMENT_BUDGET.maxCeilingLights,
  );
  assert.ok(EXTERIOR_BUILDINGS.length >= 3);
  assert.equal(
    new Set(EXTERIOR_BUILDINGS.map((building) => building.id)).size,
    EXTERIOR_BUILDINGS.length,
  );
});
