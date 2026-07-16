export interface CompanionState {
  name: string;
  fee: number;
  status: "available" | "hired" | "in_party" | "working";
  bio: string;
  role: string;
  equipment?: EquipmentState;
  avatar?: string;
  image?: string;
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
  playerStatuses?: string[];
  enemyStatuses?: string[];
  playerOverclockTurns?: number;
  enemyGlitchTurns?: number;
  playerCorrodedTurns?: number;
  enemyPanicTurns?: number;
  ironWillTriggered?: boolean;
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
  structuredQuests?: QuestState[];
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
  installedCyberware?: string[];
  weaponMods?: { [weaponName: string]: string };
  // Stamina / Fatigue and Weather system
  stamina: number;
  maxStamina: number;
  weather?: "clear" | "rain" | "snow" | "storm" | "heat" | "smog";
  baseNPCs?: BaseNPC[];
  activeBaseNPCId?: string | null;
  dojoBuffActive?: boolean;
  safehouseDefenses?: {
    securityLevel: number; // 1 to 5
    turrets: number; // number of laser turrets (reduces raid damage/difficulty or prevents raid)
    shieldStrength: number; // shield capacitor charge %
    fortifiedDoors: boolean; // slows intruders down
    intrusionLogs: string[]; // logs of raids and events
  };
  safehouseUpgrades?: {
    crewBunksExpanded?: boolean; // increases crew max limit
    resplicerActive?: boolean; // unlocks crafting stims
    decryptorActive?: boolean; // unlocks fast travel decrypt info / passive buffs
    dojoUpgraded?: boolean; // upgrades dojo
    kitchenUpgraded?: boolean; // doubles food prep
  };
  crewMissions?: {
    npcId: string;
    missionId: string;
    turnsLeft: number;
    missionName: string;
    risk: string;
    rewardType: string;
  }[];
  reputations?: {
    streetOutlaws: number;
    titanLogistics: number;
    aresCorporate: number;
  };
  activeBranchingDialogue?: {
    npcId: "jax" | "marv" | "cipher";
    nodeId: string;
  } | null;
}

export interface BaseNPC {
  id: string;
  name: string;
  role: string;
  avatar: string;
  image: string;
  description: string;
  dialogue: string;
  reaction: string | null;
  // Stats matching YELLOW zone
  happiness: number;
  affection: string; // e.g. "Hostile" | "Distant" | "Amiable" | "Warm" | "Devoted" | "Wife"
  affectionValue: number; // 0 to 100
  willpower: number;
  corruption: number;
  hygiene: string; // "Dirty" | "Normal" | "Excellent"
  discipline: number;
  hunger: string; // "Starving" | "Hungry" | "Satiated" | "Well-fed"
  respect: number;
  withdrawRisk: string; // "None" | "Low" | "High"
  anger: number;
  defiance: number;
  fear: number;
  // Inventory and jobs matching GREEN zone
  inventory: string[];
  currentJob: string; // e.g. "Idle / Chilling", "Defensive Security Guard", "Dojo Training Coach", "Base Supply Chef", "Hacker Network Operator"
  injuryStatus?: "Healthy" | "Wounded" | "Critical";
}

export interface LogMessage {
  id: string;
  timestamp: string;
  text: string;
  type: "narration" | "action" | "combat" | "system";
  district?: string;
  poi?: string;
}

export interface QuestObjective {
  id: string;
  text: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface QuestReward {
  type: "credits" | "experience" | "item" | "maxMana" | "maxHp" | "attribute";
  amount?: number;
  itemName?: string;
  attributeName?: string;
}

export interface QuestState {
  id: string;
  title: string;
  category: "Main Quest" | "Side Quest";
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  status: "NOT_STARTED" | "ACTIVE" | "COMPLETED" | "FAILED";
  log: string[]; // Progression/narrative log notes
  rewardClaimed?: boolean;
}

