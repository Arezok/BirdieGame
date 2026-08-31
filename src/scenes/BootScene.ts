import Phaser from "phaser";
import { generatePixelTexture } from "../pixelart/generate";
import { allSprites } from "../pixelart/sprites";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create() {
    for (const sprite of allSprites()) {
      generatePixelTexture(this, sprite.key, sprite.rows, sprite.palette, sprite.pixelSize);
    }
    this.scene.start("Menu");
  }
}
