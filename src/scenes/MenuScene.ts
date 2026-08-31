import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";
import { SaveData } from "../game/SaveData";
import { makeButton } from "../game/ui";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x123a5e).setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 160, "RIVER DUCK", {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add.image(GAME_WIDTH / 2, 260, "duck").setScale(2.5);

    const data = SaveData.get();
    this.add
      .text(GAME_WIDTH / 2, 340, `Best distance: ${data.bestScore}\nFish coins: ${data.currency}`, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#cfe8ff",
        align: "center",
      })
      .setOrigin(0.5);

    makeButton(this, GAME_WIDTH / 2, 460, 220, 56, "SWIM!", () => this.scene.start("Game"), {
      fill: 0xf5a623,
      fontSize: "24px",
    });

    makeButton(this, GAME_WIDTH / 2, 540, 220, 50, "Upgrades", () => this.scene.start("Upgrade"));

    this.add
      .text(
        GAME_WIDTH / 2,
        620,
        "Hold a side of the screen to swim\nthat way — left/right AND up/down.\nDodge hunters' arrows by moving\noff their row.",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#9fbfe0",
          align: "center",
        }
      )
      .setOrigin(0.5);
  }
}
