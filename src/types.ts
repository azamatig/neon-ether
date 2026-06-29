export interface CompanionState {
  name: string;
  fee: number;
  status: "available" | "hired" | "in_party" | "working";
  bio: string;
  role: string;
  equipment?: EquipmentState;
  avatar?: string;
  inventory?: string[];
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

export interface EquipmentState {
  meleeWeapon?: string | null;
  rangedWeapon?: string | null;
  armor?: string | null;
  headpiece?: string | null;
  trinket?: string | null;
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
  attributes?: {
    str: number;
    dex: number;
    int: number;
    will: number;
    eth: number;
  };
  skills?: {
    cyberBlade: number;
    netSlicer: number;
    heavyChrome: number;
    mindmancer: number;
  };
  equipment?: EquipmentState;
  completedPOIActions?: string[];
  // Customized Character Properties
  playerName?: string;
  playerAge?: number;
  playerRace?: string;
  playerAvatarUrl?: string;
  playerBackground?: string;
  playerPerks?: string[];
}

export interface LogMessage {
  id: string;
  timestamp: string;
  text: string;
  type: "narration" | "action" | "combat" | "system";
  district?: string;
  poi?: string;
}
