import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  LANE_LEFT,
  LANE_RIGHT,
  DUCK_START_Y,
  DUCK_BASE_SWIM_SPEED,
  SCROLL_SPEED_START,
  SCROLL_SPEED_MAX,
  SCROLL_SPEED_RAMP_PER_SEC,
  CURRENT_MAX_STRENGTH,
  HAZARD_SPAWN_INTERVAL_START,
  HAZARD_SPAWN_INTERVAL_MIN,
  HAZARD_SPAWN_RAMP_PER_SEC,
  FOOD_SPAWN_INTERVAL_START,
  FOOD_SPAWN_INTERVAL_MIN,
  FOOD_SPAWN_RAMP_PER_SEC,
  HUNTER_SPAWN_INTERVAL_START,
  HUNTER_SPAWN_INTERVAL_MIN,
  HUNTER_SPAWN_RAMP_PER_SEC,
  HUNTER_BANK_OFFSET,
  HUNTER_FIRE_LEAD,
  ARROW_SPEED,
  SHOTGUN_UNLOCK_DISTANCE,
  SHOTGUN_ANGLES_DEG,
  FIN_SPEED_BONUS_PER_LEVEL,
  CURRENT_GRIP_REDUCTION_PER_LEVEL,
} from "../game/constants";
import { River } from "../game/River";
import { SaveData } from "../game/SaveData";

export class GameScene extends Phaser.Scene {
  private duck!: Phaser.Physics.Arcade.Image;
  private hazards!: Phaser.Physics.Arcade.Group;
  private food!: Phaser.Physics.Arcade.Group;
  private hunters!: Phaser.Physics.Arcade.Group;
  private arrows!: Phaser.Physics.Arcade.Group;
  private water!: Phaser.GameObjects.TileSprite;
  private currentBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;

  private river = new River();
  private isGameOver = false;
  private elapsedSec = 0;
  private distance = 0;
  private fishEaten = 0;
  private scrollSpeed = SCROLL_SPEED_START;

  private hazardTimer = 0;
  private foodTimer = 0;
  private hunterTimer = 0;

  private leftDown = false;
  private rightDown = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;

  private swimSpeed = DUCK_BASE_SWIM_SPEED;
  private currentGripMultiplier = 1;

  constructor() {
    super("Game");
  }

  create() {
    this.isGameOver = false;
    this.elapsedSec = 0;
    this.distance = 0;
    this.fishEaten = 0;
    this.scrollSpeed = SCROLL_SPEED_START;
    this.hazardTimer = HAZARD_SPAWN_INTERVAL_START;
    this.foodTimer = FOOD_SPAWN_INTERVAL_START;
    this.hunterTimer = HUNTER_SPAWN_INTERVAL_START;
    this.leftDown = false;
    this.rightDown = false;
    this.river = new River();

    const finLevel = SaveData.upgradeLevel("finSpeed");
    const gripLevel = SaveData.upgradeLevel("currentGrip");
    this.swimSpeed = DUCK_BASE_SWIM_SPEED * (1 + finLevel * FIN_SPEED_BONUS_PER_LEVEL);
    this.currentGripMultiplier = Math.max(0.15, 1 - gripLevel * CURRENT_GRIP_REDUCTION_PER_LEVEL);

    this.water = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, "water").setOrigin(0);

    this.add.rectangle(0, 0, LANE_LEFT, GAME_HEIGHT, 0x2d5a2d).setOrigin(0);
    this.add.rectangle(LANE_RIGHT, 0, GAME_WIDTH - LANE_RIGHT, GAME_HEIGHT, 0x2d5a2d).setOrigin(0);

    this.hazards = this.physics.add.group();
    this.food = this.physics.add.group();
    this.hunters = this.physics.add.group();
    this.arrows = this.physics.add.group();

    this.duck = this.physics.add.image(GAME_WIDTH / 2, DUCK_START_Y, "duck");
    this.duck.setCircle(20, 4, 4);
    this.duck.setDepth(10);

    this.physics.add.overlap(this.duck, this.hazards, this.onHazardHit, undefined, this);
    this.physics.add.overlap(this.duck, this.arrows, this.onHazardHit, undefined, this);
    this.physics.add.overlap(this.duck, this.food, this.onFoodEat, undefined, this);

    this.currentBar = this.add.graphics().setDepth(20);
    this.add
      .text(GAME_WIDTH / 2, 30, "CURRENT", { fontFamily: "monospace", fontSize: "12px", color: "#ffffff" })
      .setOrigin(0.5)
      .setDepth(20)
      .setAlpha(0.7);

    this.scoreText = this.add
      .text(16, 60, "", { fontFamily: "monospace", fontSize: "18px", color: "#ffffff" })
      .setDepth(20);

    this.input.addPointer(2);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keyA = this.input.keyboard?.addKey("A");
    this.keyD = this.input.keyboard?.addKey("D");
  }

  private hasPointerOnSide(side: -1 | 1): boolean {
    const pointers = this.input.manager.pointers;
    for (const pointer of pointers) {
      if (!pointer.isDown) continue;
      const isLeft = pointer.x < GAME_WIDTH / 2;
      if (side === -1 && isLeft) return true;
      if (side === 1 && !isLeft) return true;
    }
    return false;
  }

  update(_time: number, deltaMs: number) {
    if (this.isGameOver) return;
    const delta = Math.min(deltaMs, 50);
    const dt = delta / 1000;

    this.leftDown = this.hasPointerOnSide(-1) || !!this.cursors?.left.isDown || !!this.keyA?.isDown;
    this.rightDown = this.hasPointerOnSide(1) || !!this.cursors?.right.isDown || !!this.keyD?.isDown;

    this.elapsedSec += dt;
    this.scrollSpeed = Math.min(SCROLL_SPEED_MAX, SCROLL_SPEED_START + this.elapsedSec * SCROLL_SPEED_RAMP_PER_SEC);
    this.river.update(delta);

    this.water.tilePositionY -= this.scrollSpeed * dt;

    let dir = 0;
    if (this.leftDown) dir -= 1;
    if (this.rightDown) dir += 1;
    const vx = dir * this.swimSpeed + this.river.strength * this.currentGripMultiplier;
    const newX = Phaser.Math.Clamp(this.duck.x + vx * dt, LANE_LEFT + 24, LANE_RIGHT - 24);
    this.duck.setX(newX);
    this.duck.setRotation(Phaser.Math.Clamp(vx / 500, -0.35, 0.35));

    this.moveGroup(this.hazards, dt);
    this.moveGroup(this.food, dt);
    this.moveGroup(this.hunters, dt);
    this.updateArrows(dt);
    this.updateHunters();

    this.hazardTimer -= delta;
    if (this.hazardTimer <= 0) {
      this.spawnHazard();
      const interval = Math.max(
        HAZARD_SPAWN_INTERVAL_MIN,
        HAZARD_SPAWN_INTERVAL_START - this.elapsedSec * HAZARD_SPAWN_RAMP_PER_SEC
      );
      this.hazardTimer = interval * (0.8 + Math.random() * 0.4);
    }

    this.foodTimer -= delta;
    if (this.foodTimer <= 0) {
      this.spawnFood();
      const interval = Math.max(
        FOOD_SPAWN_INTERVAL_MIN,
        FOOD_SPAWN_INTERVAL_START - this.elapsedSec * FOOD_SPAWN_RAMP_PER_SEC
      );
      this.foodTimer = interval * (0.8 + Math.random() * 0.4);
    }

    this.hunterTimer -= delta;
    if (this.hunterTimer <= 0) {
      this.spawnHunter();
      const interval = Math.max(
        HUNTER_SPAWN_INTERVAL_MIN,
        HUNTER_SPAWN_INTERVAL_START - this.elapsedSec * HUNTER_SPAWN_RAMP_PER_SEC
      );
      this.hunterTimer = interval * (0.8 + Math.random() * 0.4);
    }

    this.distance += this.scrollSpeed * dt * 0.1;
    this.scoreText.setText(`Distance ${Math.floor(this.distance)}\nFish ${this.fishEaten}`);

    this.currentBar.clear();
    const barWidth = (this.river.strength / CURRENT_MAX_STRENGTH) * 90;
    this.currentBar.fillStyle(0x9fe6ff, 0.95);
    if (barWidth >= 0) this.currentBar.fillRect(GAME_WIDTH / 2, 44, barWidth, 8);
    else this.currentBar.fillRect(GAME_WIDTH / 2 + barWidth, 44, -barWidth, 8);
    this.currentBar.fillStyle(0xffffff, 1);
    this.currentBar.fillRect(GAME_WIDTH / 2 - 1, 40, 2, 16);
  }

  private moveGroup(group: Phaser.Physics.Arcade.Group, dt: number) {
    for (const child of group.getChildren() as Phaser.Physics.Arcade.Image[]) {
      child.y += this.scrollSpeed * dt;
      if (child.y > GAME_HEIGHT + 40) child.destroy();
    }
  }

  private updateArrows(dt: number) {
    for (const arrow of this.arrows.getChildren() as Phaser.Physics.Arcade.Image[]) {
      arrow.x += (arrow.getData("vx") as number) * dt;
      arrow.y += (arrow.getData("vy") as number) * dt;
      if (arrow.y > GAME_HEIGHT + 40 || arrow.x < LANE_LEFT - 40 || arrow.x > LANE_RIGHT + 40) arrow.destroy();
    }
  }

  private updateHunters() {
    for (const hunter of this.hunters.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (hunter.getData("fired")) continue;
      if (hunter.y >= DUCK_START_Y - HUNTER_FIRE_LEAD) {
        this.fireHunter(hunter);
      }
    }
  }

  private fireHunter(hunter: Phaser.Physics.Arcade.Image) {
    hunter.setData("fired", true);
    const side = hunter.getData("side") as "left" | "right";
    const dir = side === "left" ? 1 : -1;
    const startX = side === "left" ? LANE_LEFT + 4 : LANE_RIGHT - 4;

    if (this.distance >= SHOTGUN_UNLOCK_DISTANCE) {
      const speed = Math.hypot(ARROW_SPEED, this.scrollSpeed);
      for (const deg of SHOTGUN_ANGLES_DEG) {
        const rad = (deg * Math.PI) / 180;
        this.spawnArrow(startX, hunter.y, speed * Math.sin(rad) * dir, speed * Math.cos(rad));
      }
    } else {
      this.spawnArrow(startX, hunter.y, ARROW_SPEED * dir, this.scrollSpeed);
    }

    this.tweens.add({ targets: hunter, scale: 1.3, duration: 100, yoyo: true });
  }

  private spawnArrow(x: number, y: number, vx: number, vy: number) {
    const arrow = this.arrows.create(x, y, "arrow") as Phaser.Physics.Arcade.Image;
    arrow.setRotation(Math.atan2(vx, -vy));
    arrow.setData("vx", vx);
    arrow.setData("vy", vy);
    arrow.setCircle(6, 6, 18);
    arrow.setDepth(6);
  }

  private spawnHazard() {
    const x = Phaser.Math.Between(LANE_LEFT + 30, LANE_RIGHT - 30);
    const hazard = this.hazards.create(x, -40, "rock") as Phaser.Physics.Arcade.Image;
    hazard.setCircle(20, 4, 4);
    hazard.setRotation(Math.random() * Math.PI * 2);
    hazard.setDepth(5);
  }

  private spawnFood() {
    const x = Phaser.Math.Between(LANE_LEFT + 20, LANE_RIGHT - 20);
    const item = this.food.create(x, -30, "food") as Phaser.Physics.Arcade.Image;
    item.setCircle(10, 8, 2);
    item.setDepth(5);
  }

  private spawnHunter() {
    const side: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
    const x = side === "left" ? LANE_LEFT - HUNTER_BANK_OFFSET : LANE_RIGHT + HUNTER_BANK_OFFSET;
    const hunter = this.hunters.create(x, -40, "hunter") as Phaser.Physics.Arcade.Image;
    hunter.setFlipX(side === "right");
    hunter.setData("side", side);
    hunter.setData("fired", false);
    hunter.setDepth(4);
  }

  private onHazardHit() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.cameras.main.shake(200, 0.02);
    this.cameras.main.flash(150, 200, 40, 40);

    const finalScore = Math.floor(this.distance);
    SaveData.reportScore(finalScore);
    SaveData.addCurrency(this.fishEaten);

    this.time.delayedCall(250, () => {
      this.scene.start("GameOver", { score: finalScore, coins: this.fishEaten });
    });
  }

  private onFoodEat(_duck: unknown, foodObj: unknown) {
    (foodObj as Phaser.Physics.Arcade.Image).destroy();
    this.fishEaten += 1;
  }
}
