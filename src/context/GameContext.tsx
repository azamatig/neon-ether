import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  GameState, 
  LogMessage, 
  GridCombatState, 
  HackingPuzzleState, 
  CompanionState,
  BaseNPC
} from "../types";
import { ARCHETYPES, Archetype } from "../data";

export interface GameContextType {
  // Screens & General
  currentScreen: "menu" | "game" | "character_select" | "intro_story";
  setCurrentScreen: (screen: "menu" | "game" | "character_select" | "intro_story") => void;
  selectedArchetype: Archetype;
  setSelectedArchetype: React.Dispatch<React.SetStateAction<Archetype>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  logs: LogMessage[];
  setLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>;
  
  // Customization
  customName: string;
  setCustomName: (name: string) => void;
  customAge: number;
  setCustomAge: (age: number) => void;
  customRace: string;
  setCustomRace: (race: string) => void;
  customAvatarUrl: string;
  setCustomAvatarUrl: (url: string) => void;
  customBackground: string;
  setCustomBackground: (bg: string) => void;
  selectedPerks: string[];
  setSelectedPerks: React.Dispatch<React.SetStateAction<string[]>>;
  charSelectStep: number;
  setCharSelectStep: (step: number) => void;
  statPointsPool: number;
  setStatPointsPool: (pool: number) => void;
  addedStats: { str: number; dex: number; int: number; will: number; eth: number };
  setAddedStats: React.Dispatch<React.SetStateAction<{ str: number; dex: number; int: number; will: number; eth: number }>>;
  previewSkillTreeClass: string;
  setPreviewSkillTreeClass: (cls: string) => void;

  // Custom Input & Tabs
  customInput: string;
  setCustomInput: (input: string) => void;
  activeTab: "overview" | "inventory" | "gear" | "companions" | "quests" | "factions";
  setActiveTab: (tab: "overview" | "inventory" | "gear" | "companions" | "quests" | "factions") => void;
  clickedFaction: "streetOutlaws" | "titanLogistics" | "aresCorporate" | null;
  setClickedFaction: (faction: "streetOutlaws" | "titanLogistics" | "aresCorporate" | null) => void;
  hoveredFaction: "streetOutlaws" | "titanLogistics" | "aresCorporate" | null;
  setHoveredFaction: (faction: "streetOutlaws" | "titanLogistics" | "aresCorporate" | null) => void;
  selectedInspectTierIndex: number;
  setSelectedInspectTierIndex: (index: number) => void;
  selectedQuestId: string | null;
  setSelectedQuestId: (id: string | null) => void;
  questFilter: "all" | "main" | "side" | "completed";
  setQuestFilter: (filter: "all" | "main" | "side" | "completed") => void;
  gameTab: "exploration" | "database";
  setGameTab: (tab: "exploration" | "database") => void;
  expandLogs: boolean;
  setExpandLogs: (expand: boolean) => void;
  stashFilter: "all" | "weapons" | "cyberware" | "consumables" | "valuables";
  setStashFilter: (filter: "all" | "weapons" | "cyberware" | "consumables" | "valuables") => void;

  // Companion gear management
  editingCompanionName: string | null;
  setEditingCompanionName: (name: string | null) => void;
  selectedWeaponForModding: string | null;
  setSelectedWeaponForModding: (weapon: string | null) => void;
  workbenchTab: "infusion" | "crafting";
  setWorkbenchTab: (tab: "infusion" | "crafting") => void;
  shopFilter: string;
  setShopFilter: (filter: string) => void;

  // Dialogues and POIs
  companionOpinion: { name: string; line: string; image?: string } | null;
  setCompanionOpinion: (opinion: { name: string; line: string; image?: string } | null) => void;
  selectedCompanion: CompanionState | null;
  setSelectedCompanion: (comp: CompanionState | null) => void;
  activePOIView: string | null;
  setActivePOIView: (view: string | null) => void;
  activeRegionId: string;
  setActiveRegionId: (id: string) => void;
  activeDialogue: string | null;
  setActiveDialogue: (dialogue: string | null) => void;
  relicStep: "intro" | "examine" | "discuss_vice" | "discuss_tracker" | "awakening" | "tracker_down" | "breach" | "sacrifice" | "awakened_fury";
  setRelicStep: (step: "intro" | "examine" | "discuss_vice" | "discuss_tracker" | "awakening" | "tracker_down" | "breach" | "sacrifice" | "awakened_fury") => void;
  squadDialogue: { text: string; sender: string; speakerAvatar: string } | null;
  setSquadDialogue: (dial: { text: string; sender: string; speakerAvatar: string } | null) => void;
  activePopup: { title: string; subtitle?: string; type: string; text: string } | null;
  setActivePopup: (popup: { title: string; subtitle?: string; type: string; text: string } | null) => void;
  saveToast: string | null;
  setSaveToast: (toast: string | null) => void;

  // Tactical Grid Combat State
  gridCombat: GridCombatState | null;
  setGridCombat: React.Dispatch<React.SetStateAction<GridCombatState | null>>;
  combatActionTab: "attacks" | "skills" | "support";
  setCombatActionTab: (tab: "attacks" | "skills" | "support") => void;
  hoveredAction: "move" | "meleeAtk" | "rangedAtk" | "spell" | "mind" | "neural" | null;
  setHoveredAction: (action: "move" | "meleeAtk" | "rangedAtk" | "spell" | "mind" | "neural" | null) => void;
  hoveredEntity: any | null;
  setHoveredEntity: (entity: any | null) => void;
  selectedSkill: { name: string; cost: number; costType: "MP" | "SP"; desc: string; icon: string; scope: "enemy" | "self" | "all_enemies" } | null;
  setSelectedSkill: (skill: { name: string; cost: number; costType: "MP" | "SP"; desc: string; icon: string; scope: "enemy" | "self" | "all_enemies" } | null) => void;

  // Hacking Puzzle State
  hackingPuzzle: HackingPuzzleState | null;
  setHackingPuzzle: React.Dispatch<React.SetStateAction<HackingPuzzleState | null>>;

  // Common Helpers
  addLog: (text: string, type: "narration" | "action" | "combat" | "system", district?: string, poi?: string) => void;
  triggerToast: (msg: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<"menu" | "game" | "character_select" | "intro_story">("menu");
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>(ARCHETYPES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Customization
  const [customName, setCustomName] = useState("Kaelen");
  const [customAge, setCustomAge] = useState(24);
  const [customRace, setCustomRace] = useState("Human");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
  const [customBackground, setCustomBackground] = useState("Street Rat");
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [charSelectStep, setCharSelectStep] = useState(1);
  const [statPointsPool, setStatPointsPool] = useState(10);
  const [addedStats, setAddedStats] = useState({ str: 0, dex: 0, int: 0, will: 0, eth: 0 });
  const [previewSkillTreeClass, setPreviewSkillTreeClass] = useState<string>("Cyber-Blade");

  // Custom Input & Tabs
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "gear" | "companions" | "quests" | "factions">("overview");
  const [clickedFaction, setClickedFaction] = useState<"streetOutlaws" | "titanLogistics" | "aresCorporate" | null>(null);
  const [hoveredFaction, setHoveredFaction] = useState<"streetOutlaws" | "titanLogistics" | "aresCorporate" | null>(null);
  const [selectedInspectTierIndex, setSelectedInspectTierIndex] = useState<number>(0);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [questFilter, setQuestFilter] = useState<"all" | "main" | "side" | "completed">("all");
  const [gameTab, setGameTab] = useState<"exploration" | "database">("exploration");
  const [expandLogs, setExpandLogs] = useState(false);
  const [stashFilter, setStashFilter] = useState<"all" | "weapons" | "cyberware" | "consumables" | "valuables">("all");

  // Companion gear management
  const [editingCompanionName, setEditingCompanionName] = useState<string | null>(null);
  const [selectedWeaponForModding, setSelectedWeaponForModding] = useState<string | null>(null);
  const [workbenchTab, setWorkbenchTab] = useState<"infusion" | "crafting">("infusion");
  const [shopFilter, setShopFilter] = useState<string>("all");

  // Dialogues and POIs
  const [companionOpinion, setCompanionOpinion] = useState<{ name: string; line: string; image?: string } | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionState | null>(null);
  const [activePOIView, setActivePOIView] = useState<string | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string>("aurus");
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [relicStep, setRelicStep] = useState<"intro" | "examine" | "discuss_vice" | "discuss_tracker" | "awakening" | "tracker_down" | "breach" | "sacrifice" | "awakened_fury">("intro");
  const [squadDialogue, setSquadDialogue] = useState<{ text: string; sender: string; speakerAvatar: string } | null>(null);
  const [activePopup, setActivePopup] = useState<{ title: string; subtitle?: string; type: string; text: string } | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Tactical Grid Combat State
  const [gridCombat, setGridCombat] = useState<GridCombatState | null>(null);
  const [combatActionTab, setCombatActionTab] = useState<"attacks" | "skills" | "support">("attacks");
  const [hoveredAction, setHoveredAction] = useState<"move" | "meleeAtk" | "rangedAtk" | "spell" | "mind" | "neural" | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<any | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; cost: number; costType: "MP" | "SP"; desc: string; icon: string; scope: "enemy" | "self" | "all_enemies" } | null>(null);

  // Hacking Puzzle State
  const [hackingPuzzle, setHackingPuzzle] = useState<HackingPuzzleState | null>(null);

  // Helper alerts and toasts
  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);
  };

  // Helper log addition
  const addLog = (
    text: string, 
    type: "narration" | "action" | "combat" | "system", 
    district?: string, 
    poi?: string
  ) => {
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text,
        type,
        district,
        poi
      },
      ...prev
    ]);
  };

  const value: GameContextType = {
    currentScreen,
    setCurrentScreen,
    selectedArchetype,
    setSelectedArchetype,
    isLoading,
    setIsLoading,
    gameState,
    setGameState,
    logs,
    setLogs,
    customName,
    setCustomName,
    customAge,
    setCustomAge,
    customRace,
    setCustomRace,
    customAvatarUrl,
    setCustomAvatarUrl,
    customBackground,
    setCustomBackground,
    selectedPerks,
    setSelectedPerks,
    charSelectStep,
    setCharSelectStep,
    statPointsPool,
    setStatPointsPool,
    addedStats,
    setAddedStats,
    previewSkillTreeClass,
    setPreviewSkillTreeClass,
    customInput,
    setCustomInput,
    activeTab,
    setActiveTab,
    clickedFaction,
    setClickedFaction,
    hoveredFaction,
    setHoveredFaction,
    selectedInspectTierIndex,
    setSelectedInspectTierIndex,
    selectedQuestId,
    setSelectedQuestId,
    questFilter,
    setQuestFilter,
    gameTab,
    setGameTab,
    expandLogs,
    setExpandLogs,
    stashFilter,
    setStashFilter,
    editingCompanionName,
    setEditingCompanionName,
    selectedWeaponForModding,
    setSelectedWeaponForModding,
    workbenchTab,
    setWorkbenchTab,
    shopFilter,
    setShopFilter,
    companionOpinion,
    setCompanionOpinion,
    selectedCompanion,
    setSelectedCompanion,
    activePOIView,
    setActivePOIView,
    activeRegionId,
    setActiveRegionId,
    activeDialogue,
    setActiveDialogue,
    relicStep,
    setRelicStep,
    squadDialogue,
    setSquadDialogue,
    activePopup,
    setActivePopup,
    saveToast,
    setSaveToast,
    gridCombat,
    setGridCombat,
    combatActionTab,
    setCombatActionTab,
    hoveredAction,
    setHoveredAction,
    hoveredEntity,
    setHoveredEntity,
    selectedSkill,
    setSelectedSkill,
    hackingPuzzle,
    setHackingPuzzle,
    addLog,
    triggerToast
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
