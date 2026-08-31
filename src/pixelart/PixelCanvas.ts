export class PixelCanvas {
  readonly width: number;
  readonly height: number;
  private grid: string[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => Array(width).fill("."));
  }

  set(x: number, y: number, char: string) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.grid[y][x] = char;
  }

  fillRect(x0: number, y0: number, w: number, h: number, char: string) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) this.set(x, y, char);
    }
  }

  fillEllipse(cx: number, cy: number, rx: number, ry: number, char: string) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        if (nx * nx + ny * ny <= 1) this.set(x, y, char);
      }
    }
  }

  /** Isosceles triangle pointing up, apex at (cx, yTop), base at yBottom spanning halfWidth either side. */
  fillTriangleUp(cx: number, yTop: number, yBottom: number, halfWidth: number, char: string) {
    const h = Math.max(1, yBottom - yTop);
    for (let y = yTop; y <= yBottom; y++) {
      const t = (y - yTop) / h;
      const w = halfWidth * t;
      for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) this.set(x, y, char);
    }
  }

  toRows(): string[] {
    return this.grid.map((row) => row.join(""));
  }
}
