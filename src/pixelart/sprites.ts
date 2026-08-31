import { PixelCanvas } from "./PixelCanvas";

export interface SpriteDef {
  key: string;
  rows: string[];
  palette: Record<string, number>;
  pixelSize: number;
}

const DUCK_PALETTE = {
  w: 0xffffff, // body
  g: 0xe4e4e4, // wing shading
  o: 0xf5a623, // beak / feet
  d: 0xd98c1a, // beak shading
  b: 0x1a1a1a, // eyes
};

function buildDuck(): SpriteDef {
  const c = new PixelCanvas(16, 16);
  c.fillEllipse(8, 9, 6, 6.5, "w");
  c.fillEllipse(4.5, 10, 2, 4, "g");
  c.fillEllipse(11.5, 10, 2, 4, "g");
  c.fillTriangleUp(8, 0, 4, 2.5, "o");
  c.set(7, 3, "d");
  c.set(9, 3, "d");
  c.set(6, 5, "b");
  c.set(10, 5, "b");
  c.fillRect(3, 14, 3, 2, "o");
  c.fillRect(10, 14, 3, 2, "o");
  return { key: "duck", rows: c.toRows(), palette: DUCK_PALETTE, pixelSize: 3 };
}

const ROCK_PALETTE = {
  r: 0x8a8a8f,
  l: 0xb3b3b8,
  k: 0x5c5c60,
};

function buildRock(): SpriteDef {
  const c = new PixelCanvas(16, 16);
  c.fillEllipse(8, 9, 7, 6, "r");
  c.fillEllipse(10.5, 11.5, 3.5, 2.5, "k");
  c.fillEllipse(6, 6.5, 3, 2, "l");
  return { key: "rock", rows: c.toRows(), palette: ROCK_PALETTE, pixelSize: 3 };
}

const HUNTER_PALETTE = {
  j: 0x3a5f3a, // jacket
  s: 0xd9a066, // skin
  h: 0x5c3a21, // hat
  g: 0x2b2b2b, // gun
};

function buildHunter(): SpriteDef {
  const c = new PixelCanvas(16, 16);
  c.fillEllipse(8, 11, 5, 4, "j");
  c.fillEllipse(8, 5, 3, 3, "s");
  c.fillRect(5, 0, 7, 2, "h");
  c.fillRect(3, 2, 11, 1, "h");
  c.fillRect(11, 8, 5, 2, "g");
  return { key: "hunter", rows: c.toRows(), palette: HUNTER_PALETTE, pixelSize: 3 };
}

const ARROW_PALETTE = {
  a: 0x8a5a2b, // shaft
  h: 0xc9ccd1, // head
};

function buildArrow(): SpriteDef {
  const c = new PixelCanvas(8, 16);
  c.fillRect(3, 5, 2, 11, "a");
  c.fillTriangleUp(4, 0, 6, 3, "h");
  return { key: "arrow", rows: c.toRows(), palette: ARROW_PALETTE, pixelSize: 3 };
}

const FOOD_PALETTE = {
  f: 0x6fb7d9,
  s: 0xbfe6f5,
  b: 0x1a1a1a,
};

function buildFood(): SpriteDef {
  const c = new PixelCanvas(12, 8);
  c.fillEllipse(6, 4, 4.2, 2.6, "f");
  c.fillEllipse(5, 3, 1.6, 0.9, "s");
  c.fillTriangleUp(1, 2, 6, 2, "f");
  c.set(9, 4, "b");
  return { key: "food", rows: c.toRows(), palette: FOOD_PALETTE, pixelSize: 3 };
}

const WATER_PALETTE = {
  a: 0x2f7cb0,
  b: 0x3c8cc2,
};

function buildWaterTile(): SpriteDef {
  const c = new PixelCanvas(16, 16);
  c.fillRect(0, 0, 16, 16, "a");
  c.fillRect(0, 3, 16, 1, "b");
  c.fillRect(0, 10, 16, 1, "b");
  return { key: "water", rows: c.toRows(), palette: WATER_PALETTE, pixelSize: 3 };
}

export function allSprites(): SpriteDef[] {
  return [buildDuck(), buildRock(), buildHunter(), buildArrow(), buildFood(), buildWaterTile()];
}
