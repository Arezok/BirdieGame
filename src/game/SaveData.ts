import { SAVE_KEY } from "./constants";

export interface UpgradeDef {
  key: "finSpeed" | "currentGrip";
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
}

export const UPGRADES: UpgradeDef[] = [
  {
    key: "finSpeed",
    name: "Fin Speed",
    description: "Swim faster left and right.",
    maxLevel: 5,
    baseCost: 8,
    costGrowth: 1.5,
  },
  {
    key: "currentGrip",
    name: "Current Grip",
    description: "Resist being pushed by the current.",
    maxLevel: 5,
    baseCost: 8,
    costGrowth: 1.5,
  },
];

interface SaveShape {
  currency: number;
  bestScore: number;
  upgrades: Record<string, number>;
}

function defaultSave(): SaveShape {
  return {
    currency: 0,
    bestScore: 0,
    upgrades: { finSpeed: 0, currentGrip: 0 },
  };
}

function load(): SaveShape {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    return { ...defaultSave(), ...parsed, upgrades: { ...defaultSave().upgrades, ...parsed.upgrades } };
  } catch {
    return defaultSave();
  }
}

function save(data: SaveShape) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export const SaveData = {
  get(): SaveShape {
    return load();
  },

  addCurrency(amount: number) {
    const data = load();
    data.currency += amount;
    save(data);
    return data.currency;
  },

  reportScore(score: number) {
    const data = load();
    if (score > data.bestScore) data.bestScore = score;
    save(data);
    return data.bestScore;
  },

  upgradeLevel(key: string): number {
    return load().upgrades[key] ?? 0;
  },

  costFor(def: UpgradeDef, level: number): number {
    return Math.round(def.baseCost * Math.pow(def.costGrowth, level));
  },

  buyUpgrade(key: string): boolean {
    const data = load();
    const def = UPGRADES.find((u) => u.key === key);
    if (!def) return false;
    const level = data.upgrades[key] ?? 0;
    if (level >= def.maxLevel) return false;
    const cost = this.costFor(def, level);
    if (data.currency < cost) return false;
    data.currency -= cost;
    data.upgrades[key] = level + 1;
    save(data);
    return true;
  },
};
