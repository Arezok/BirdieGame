import {
  CURRENT_CHANGE_INTERVAL_MAX,
  CURRENT_CHANGE_INTERVAL_MIN,
  CURRENT_LERP_SPEED,
  CURRENT_MAX_STRENGTH,
} from "./constants";

export class River {
  private target = 0;
  private value = 0;
  private timeToNextChange = 0;

  constructor() {
    this.pickNewTarget();
  }

  private pickNewTarget() {
    this.target = (Math.random() * 2 - 1) * CURRENT_MAX_STRENGTH;
    this.timeToNextChange =
      CURRENT_CHANGE_INTERVAL_MIN +
      Math.random() * (CURRENT_CHANGE_INTERVAL_MAX - CURRENT_CHANGE_INTERVAL_MIN);
  }

  update(deltaMs: number) {
    this.timeToNextChange -= deltaMs;
    if (this.timeToNextChange <= 0) this.pickNewTarget();
    const t = Math.min(1, (CURRENT_LERP_SPEED * deltaMs) / 1000);
    this.value += (this.target - this.value) * t;
  }

  /** Signed px/sec push. Negative = toward left bank, positive = toward right bank. */
  get strength(): number {
    return this.value;
  }

  /** 0..1, how strong the current is right now, direction-agnostic. */
  get intensity(): number {
    return Math.abs(this.value) / CURRENT_MAX_STRENGTH;
  }
}
