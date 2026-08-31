import Phaser from "phaser";

/**
 * Draws a pixel-grid sprite (array of same-length strings, one char per pixel,
 * "." = transparent) into a texture at `pixelSize` px per grid cell.
 */
export function generatePixelTexture(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  palette: Record<string, number>,
  pixelSize: number
) {
  if (scene.textures.exists(key)) return;

  const height = rows.length;
  const width = rows[0].length;
  const g = scene.add.graphics();

  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      const char = row[x];
      if (char === ".") continue;
      const color = palette[char];
      g.fillStyle(color, 1);
      g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  g.generateTexture(key, width * pixelSize, height * pixelSize);
  g.destroy();
}
