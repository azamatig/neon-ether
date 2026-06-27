export interface CompanionState {
  name: string;
  fee: number;
  status: "available" | "hired" | "in_party" | "working";
  bio: string;
  role: string;
}

export interface CombatState {
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyShields: number;
  enemyMaxShields: number;
  isActive: boolean;
  turnLog: string;
}

export interface GameState {
  district: string;
  poi: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  credits: number;
  party: string[];
  activeQuests: string[];
  completedQuests: string[];
  inventory: string[];
  companions: CompanionState[];
  combatState: CombatState | null;
  archetype: string;
  level: number;
  experience: number;
  day: number;
  timeOfDay: "Morning" | "Afternoon" | "Night";
}

export interface LogMessage {
  id: string;
  timestamp: string;
  text: string;
  type: "narration" | "action" | "combat" | "system";
  district?: string;
  poi?: string;
}
