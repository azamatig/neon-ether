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
  mindmancerUnlocked?: boolean;
  unlockedBases?: string[];
  ownedBases?: string[];
  currentBaseId?: string;
  unlockedDistricts?: string[];
  unlockedPerks?: string[];
  campaignQuestsRegistry?: UnifiedQuest[];
  poiInteractiveScenes?: Record<string, POIInteractiveEvent>;
  customPOIsRegistry?: CustomPOIData[];
}

export interface POIShopService {
  enabled: boolean;
  merchantName?: string;
  merchantTitle?: string;
  merchantAvatar?: string;
  greeting?: string;
  items?: string[];
  priceMultiplier?: number;
  allowSell?: boolean;
}

export interface POIClinicService {
  enabled: boolean;
  doctorName?: string;
  doctorAvatar?: string;
  healHpCost?: number;
  restoreManaCost?: number;
  cureDebuffsCost?: number;
  surgeryAvailable?: boolean;
}

export interface POIRestService {
  enabled: boolean;
  innkeeperName?: string;
  rentRoomCost?: number;
  staminaRestore?: number;
  hpRestore?: number;
  advanceHours?: number;
  flavorText?: string;
}

export interface POIAuctionLot {
  id: string;
  name: string;
  type: "slave" | "mercenary" | "companion" | "artifact" | "cyberware";
  price: number;
  desc: string;
  stats?: string;
  avatar?: string;
  companionIdToRecruit?: string;
  itemIdToGrant?: string;
  purchased?: boolean;
}

export interface POIAuctionService {
  enabled: boolean;
  auctioneerName?: string;
  auctioneerAvatar?: string;
  description?: string;
  lots?: POIAuctionLot[];
}

export interface POIContractsService {
  enabled: boolean;
  boardTitle?: string;
  boardDescription?: string;
  availableQuestIds?: string[];
}

export interface POIRumorItem {
  id: string;
  title: string;
  text: string;
  cost?: number;
  unlocksDistrictId?: string;
  unlocksPoiId?: string;
  grantsXP?: number;
  heard?: boolean;
}

export interface POIRumorsService {
  enabled: boolean;
  informantName?: string;
  informantAvatar?: string;
  rumorList?: POIRumorItem[];
}

export interface POINpcsService {
  enabled: boolean;
  placedNPCIds?: string[];
}

export interface POIQuestTriggerConfig {
  linkedSceneId?: string;
  linkedSceneStepId?: string;
  triggerCondition?: "always_on_enter" | "first_time_only" | "if_active_quest" | "manual_button";
  linkedQuestId?: string;
  linkedQuestStageId?: string;
  triggerButtonLabel?: string;
}

export interface UnifiedPOIServices {
  shop?: POIShopService;
  clinic?: POIClinicService;
  rest?: POIRestService;
  auction?: POIAuctionService;
  contracts?: POIContractsService;
  rumors?: POIRumorsService;
  npcs?: POINpcsService;
}

export interface CustomPOIAction {
  id: string;
  label: string;
  desc: string;
  cost?: number;
  statCheck?: string;
  actionType: "dialogue" | "shop" | "combat" | "rumor" | "event" | "rest" | "scene" | "custom";
  targetNpcId?: string;
  targetEventId?: string;
  targetSceneId?: string;
  rewardCredits?: number;
  rewardXP?: number;
  rewardItem?: string;
}

export interface CustomPOIData {
  id: string;
  name: string;
  district: string;
  category: "safehouse" | "social" | "shop" | "combat" | "temple" | "quest" | "auction" | "medical";
  desc: string;
  x: number;
  y: number;
  bgImage?: string;
  image?: string;
  isUnlocked: boolean;
  fastTravelCost?: number;
  dangerRating?: "Safe" | "Low" | "Medium" | "High" | "Lethal";
  
  // Quest / Scene Integration
  questTrigger?: POIQuestTriggerConfig;

  // Interior Modular Services
  services?: UnifiedPOIServices;

  // Interior Activities & Actions
  actions: CustomPOIAction[];
  buttons?: string[];
  
  // Placed NPCs in this POI
  placedNPCIds: string[];

  // Combat Configuration (if combat POI)
  isCombatZone?: boolean;
  enemyUnitName?: string;
  enemyHp?: number;
  enemyShields?: number;
  enemyAtk?: number;
  enemyDesc?: string;
  isCapturable?: boolean;
  capturableNpcId?: string;
  victoryCredits?: number;
  victoryXP?: number;
  victoryItemDrop?: string;

  // Legacy fields for backward compatibility
  entryEventId?: string;
}

export interface POICompanionDialogue {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  portrait?: string;
  text: string;
  color?: string;
}

export interface POISceneChoice {
  id: string;
  label: string;
  targetStepId?: string;
  targetPOIId?: string;
  checkType?: "none" | "int" | "str" | "dex" | "will" | "mindmancer" | "credits" | "item";
  checkValue?: number;
  requiredItem?: string;
  outcomeNarrative?: string;
  grantsXP?: number;
  grantsCredits?: number;
  grantsItem?: string;
  triggerCombatEncounterId?: string;
  unlockDistrictId?: string;
  unlockBaseId?: string;
  completeQuestStageId?: string;
  variant?: "cyan" | "amber" | "rose" | "purple" | "emerald";
}

export interface POISceneStep {
  id: string;
  stepTitle?: string;
  bannerTitle: string;
  bannerImage: string;
  badgeLabel?: string;
  narrativeText: string;
  companions?: POICompanionDialogue[];
  choices: POISceneChoice[];
}

export interface POIInteractiveEvent {
  id?: string;
  poiId: string;
  poiName: string;
  districtId: string;
  title: string;
  initialStepId: string;
  steps: Record<string, POISceneStep>;
  linkedQuestId?: string;
  linkedStageId?: string;
}

export interface QuestOperationalPath {
  id: string;
  label: string;
  checkType?: "none" | "int" | "str" | "dex" | "will" | "mindmancer" | "credits" | "item";
  checkValue?: number;
  requiredStat?: string;
  requiredStatValue?: number;
  requiredSkill?: string;
  requiredSkillLevel?: number;
  requiredItem?: string;
  requiredMana?: number;
  outcomeDesc?: string;
  outcomeText?: string;
  grantsBonusCredits?: number;
  grantsBonusXP?: number;
  grantsBonusItem?: string;
  rewardCredits?: number;
  rewardXP?: number;
  rewardItem?: string;
  linkedPOISceneId?: string;
  linkedPOISceneStepId?: string;
}

export interface QuestStage {
  id: string;
  stageIndex: number;
  title: string;
  description: string;
  objectiveType: "interact_poi" | "kill_target" | "hack_terminal" | "talk_npc" | "collect_item" | "custom_choice";
  targetPOI?: string;
  /** Stable MAP_POIS id. Names remain presentation-only and may be edited. */
  targetPOIId?: string;
  targetDistrict?: string;
  targetNPC?: string;
  targetItem?: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  /** Runtime event key written to completedPOIActions when this stage is resolved. */
  completionAction?: string;
  operationalPaths?: QuestOperationalPath[];
  linkedPOISceneId?: string;
  linkedPOISceneStepId?: string;
}

export interface QuestWorldUnlocks {
  unlockBaseId?: string;
  unlockDistrictId?: string;
  unlockVendorTier?: string;
  unlockPerkOrSkill?: string;
  recruitCompanionId?: string;
}

export interface UnifiedQuest {
  id: string;
  title: string;
  category: "Main Quest" | "Side Quest" | "Faction Contract" | "Companion Story";
  chapter?: "Prologue" | "Chapter 1: The Outcast Spark" | "Chapter 2: The Corporate War" | "Chapter 3: Technomantic Singularity" | "Endgame";
  description: string;
  narrativeBriefing?: string;
  giverNPC?: string;
  giverPOI?: string;
  minLevel?: number;
  prerequisiteQuestId?: string;
  nextQuestId?: string;
  stages: QuestStage[];
  rewards: {
    credits?: number;
    experience?: number;
    items?: string[];
    reputation?: {
      streetOutlaws?: number;
      titanLogistics?: number;
      aresCorporate?: number;
    };
    worldUnlocks?: QuestWorldUnlocks;
  };
  status: "NOT_STARTED" | "ACTIVE" | "COMPLETED" | "FAILED";
  log: string[];
  rewardClaimed?: boolean;
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

export interface GridCombatant {
  id: string;
  name: string;
  team: 'player' | 'enemy';
  hp: number;
  maxHp: number;
  shields: number;
  maxShields: number;
  x: number;
  y: number;
  avatar: string;
  image?: string;
  color: string;
  range: number;
  damage: number;
  ap: number;
  maxAp: number;
  initiative: number;
  isDead: boolean;
  isCompanion?: boolean;
  statuses?: string[];
  overclockTurns?: number;
  glitchTurns?: number;
  corrodedTurns?: number;
  panicTurns?: number;
  stunnedTurns?: number;
  silencedTurns?: number;
  bleedTurns?: number;
}

export interface GridInteractiveObject {
  id: string;
  name: string;
  type: 'terminal' | 'battery' | 'shield_cover';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
  isHacked: boolean;
  avatar: string;
  color: string;
  description: string;
}

export interface GridCombatState {
  combatants: GridCombatant[];
  turnOrder: string[];
  currentTurnIdx: number;
  selectedAction: "move" | "attack" | "meleeAtk" | "rangedAtk" | "spell" | "item" | null;
  turnLog: string;
  interactiveObjects?: GridInteractiveObject[];
}

export interface HackingPuzzleState {
  type: "sanctuary" | "cargo_logs" | "security_mainframe" | "cryo_bypass" | "nouveau_safe" | "rebel_courier" | "shatter_ridge_server";
  status: "idle" | "playing" | "success" | "failure";
  targets: string[];
  buffer: string[];
  maxBuffer: number;
  grid: { hex: string; row: number; col: number; isClicked: boolean; isHighlighted: boolean }[][];
  attemptsLeft: number;
  maxAttempts: number;
  activeLineType: "row" | "col";
  activeLineIdx: number;
  netSlicerLevel: number;
  intelligence: number;
  usedPerkBuffer: boolean;
  usedPerkAttempts: boolean;
}

export type District = string;
export type POI = any;
export type Item = any;


