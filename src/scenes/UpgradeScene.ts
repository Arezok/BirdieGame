import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../game/constants";
import { SaveData, UPGRADES } from "../game/SaveData";
import { makeButton } from "../game/ui";

export class UpgradeScene extends Phaser.Scene {
  private currencyText!: Phaser.GameObjects.Text;
  private rowTexts: Partial<Record<string, Phaser.GameObjects.Text>> = {};
  private rowButtons: Partial<Record<string, Phaser.GameObjects.Container>> = {};

  constructor() {
    super("Upgrade");
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x123a5e).setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 70, "UPGRADES", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.currencyText = this.add
      .text(GAME_WIDTH / 2, 115, "", { fontFamily: "monospace", fontSize: "18px", color: "#ffd75e" })
      .setOrigin(0.5);

    let y = 190;
    for (const def of UPGRADES) {
      this.buildRow(def.key, y);
      y += 150;
    }

    makeButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 200, 50, "Back", () => this.scene.start("Menu"));

    this.refresh();
  }

  private buildRow(key: string, y: number) {
    const def = UPGRADES.find((u) => u.key === key)!;

    this.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 60, 130, 0x0e2c48).setStrokeStyle(2, 0x2f7cb0);

    this.add
      .text(40, y - 45, def.name, { fontFamily: "monospace", fontSize: "20px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0, 0.5);

    this.add
      .text(40, y - 18, def.description, { fontFamily: "monospace", fontSize: "13px", color: "#9fbfe0" })
      .setOrigin(0, 0.5);

    this.rowTexts[key] = this.add
      .text(40, y + 10, "", { fontFamily: "monospace", fontSize: "14px", color: "#cfe8ff" })
      .setOrigin(0, 0.5);

    this.rowButtons[key] = makeButton(this, GAME_WIDTH - 90, y + 30, 130, 44, "BUY", () => {
      if (SaveData.buyUpgrade(key)) this.refresh();
    });
  }

  private refresh() {
    const save = SaveData.get();
    this.currencyText.setText(`Fish coins: ${save.currency}`);

    for (const def of UPGRADES) {
      const level = save.upgrades[def.key] ?? 0;
      const maxed = level >= def.maxLevel;
      const cost = maxed ? 0 : SaveData.costFor(def, level);
      const text = this.rowTexts[def.key];
      if (text) {
        text.setText(
          maxed
            ? `Level ${level}/${def.maxLevel} (MAX)`
            : `Level ${level}/${def.maxLevel}  ·  Cost: ${cost} coins`
        );
      }

      const button = this.rowButtons[def.key];
      if (button) {
        button.destroy();
        this.rowButtons[def.key] = makeButton(
          this,
          button.x,
          button.y,
          130,
          44,
          maxed ? "MAX" : "BUY",
          () => {
            if (SaveData.buyUpgrade(def.key)) this.refresh();
          },
          { disabled: maxed || save.currency < cost }
        );
      }
    }
  }
}
