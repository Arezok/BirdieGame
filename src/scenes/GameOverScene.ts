import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";
import { SaveData } from "../game/SaveData";
import { makeButton } from "../game/ui";

interface GameOverData {
  score: number;
  coins: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create(data: GameOverData) {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d1b2a).setOrigin(0);

    const save = SaveData.get();
    const isBest = data.score >= save.bestScore;

    this.add
      .text(GAME_WIDTH / 2, 140, isBest ? "NEW BEST!" : "SPLASH!", {
        fontFamily: "monospace",
        fontSize: "34px",
        color: isBest ? "#ffd75e" : "#ff6b6b",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add.image(GAME_WIDTH / 2, 230, "duck").setScale(2).setAngle(90).setAlpha(0.9);

    this.add
      .text(
        GAME_WIDTH / 2,
        330,
        `Distance: ${data.score}\nFish eaten: ${data.coins}\n\nBest distance: ${save.bestScore}\nFish coins: ${save.currency}`,
        { fontFamily: "monospace", fontSize: "18px", color: "#cfe8ff", align: "center" }
      )
      .setOrigin(0.5);

    makeButton(this, GAME_WIDTH / 2, 470, 220, 56, "SWIM AGAIN", () => this.scene.start("Game"), {
      fill: 0xf5a623,
      fontSize: "22px",
    });
    makeButton(this, GAME_WIDTH / 2, 540, 220, 50, "Upgrades", () => this.scene.start("Upgrade"));
    makeButton(this, GAME_WIDTH / 2, 610, 220, 50, "Menu", () => this.scene.start("Menu"));
  }
}
