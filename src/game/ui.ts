import Phaser from "phaser";

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  options: { fill?: number; fontSize?: string; disabled?: boolean } = {}
) {
  const fill = options.disabled ? 0x445566 : options.fill ?? 0x2f7cb0;
  const container = scene.add.container(x, y);

  const bg = scene.add.rectangle(0, 0, width, height, fill).setStrokeStyle(2, 0xffffff, 0.5);
  const text = scene.add
    .text(0, 0, label, { fontFamily: "monospace", fontSize: options.fontSize ?? "20px", color: "#ffffff" })
    .setOrigin(0.5);

  container.add([bg, text]);
  container.setSize(width, height);

  if (!options.disabled) {
    const lighten = (color: number, amount: number) => {
      const r = Math.min(255, ((color >> 16) & 0xff) + amount);
      const g = Math.min(255, ((color >> 8) & 0xff) + amount);
      const b = Math.min(255, (color & 0xff) + amount);
      return (r << 16) | (g << 8) | b;
    };
    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerdown", onClick);
    bg.on("pointerover", () => bg.setFillStyle(lighten(fill, 25)));
    bg.on("pointerout", () => bg.setFillStyle(fill));
  }

  return container;
}
