import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Database,
  Briefcase,
  Users,
  Award,
  BookOpen,
  MapPin,
  Heart,
  Zap,
  Coins,
  Shield,
  RotateCcw,
  Terminal,
  Play,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  User,
  Activity,
  Sword,
  Clock,
  Save,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  X,
  XCircle,
  Plus,
  Cpu,
  Gem,
  Crosshair,
  Pill,
  Settings,
  Check,
  Edit,
  UserCog,
  CloudLightning,
  Menu,
  FolderOpen,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import MainMenuScreen from "./components/MainMenuScreen";
import IntroStoryScreen from "./components/IntroStoryScreen";
import CharacterSelectScreen from "./components/CharacterSelectScreen";
import SaveManager from "./components/SaveManager";
import WeatherOverlay from "./components/WeatherOverlay";
import NPCBaseManagement from "./components/NPCBaseManagement";
import TypewriterText from "./components/TypewriterText";
import TacticalCombatView from "./components/combat/TacticalCombatView";
import DevStudioModal from "./components/dev/DevStudioModal";
import { POIInteriorHub } from "./components/POIInteriorHub";

import { GameProvider, useGame } from "./context/GameContext";

import { LogMessage, GameState, CompanionState, QuestState, QuestObjective, QuestReward, POIInteractiveEvent, POISceneStep, POISceneChoice, POICompanionDialogue, CustomPOIData } from "./types";
import { DEFAULT_POI_INTERACTIVE_SCENES } from "./poiScenesData";
import { activateQuest, advanceQuestStage, buildQuestCatalog, completeQuest, hydrateQuestSystem, synchronizeQuestProgress } from "./questEngine";
import vicePortrait from "./assets/characters/vice/vice_portrait.png";
import viceBody from "./assets/characters/vice/vice_body.png";
import trackerPortrait from "./assets/characters/tracker/tracker_portrait.png";
import trackerBody from "./assets/characters/tracker/tracker_body.png";
import {
  ARCHETYPES,
  SHOP_ITEMS,
  INITIAL_COMPANIONS,
  getInitialState,
  MAP_POIS,
  REGIONS,
  ENEMIES,
  MapPOI,
  Region,
  ITEM_METADATA,
  ItemDetails,
  REGION_CONNECTIONS,
  TravelConnection
} from "./data";

interface DialogueChoice {
  text: string;
  nodeId: string;
  prereqText?: string;
  prereq?: (state: GameState) => boolean;
  onSelect?: (state: GameState) => GameState;
}

interface DialogueNode {
  title: string;
  role: string;
  image: string;
  text: string | ((state: GameState) => string);
  choices: DialogueChoice[];
}


import { BRANCHING_DIALOGUES } from "./dialoguesData";


const getItemIcon = (itemName: string, slot?: string) => {
  const nameLower = itemName.toLowerCase();
  
  if (nameLower.includes("pistol") || nameLower.includes("smg") || nameLower.includes("rifle") || nameLower.includes("cannon") || nameLower.includes("revolver") || nameLower.includes("gun")) {
    return <Crosshair size={14} className="text-cyan-400" />;
  }
  if (nameLower.includes("katana") || nameLower.includes("blade") || nameLower.includes("baton") || nameLower.includes("fists") || nameLower.includes("slicer") || nameLower.includes("sword") || nameLower.includes("dagger")) {
    return <Sword size={14} className="text-rose-400" />;
  }
  if (nameLower.includes("armor") || nameLower.includes("vest") || nameLower.includes("plate") || nameLower.includes("jacket")) {
    return <Shield size={14} className="text-emerald-400" />;
  }
  if (nameLower.includes("visor") || nameLower.includes("helmet") || nameLower.includes("headgear") || nameLower.includes("chip") || nameLower.includes("processor") || nameLower.includes("deck")) {
    return <Cpu size={14} className="text-purple-400" />;
  }
  if (nameLower.includes("matrix") || nameLower.includes("core") || nameLower.includes("totem") || nameLower.includes("crystal") || nameLower.includes("augment") || nameLower.includes("relic") || nameLower.includes("ring")) {
    return <Gem size={14} className="text-amber-400" />;
  }
  if (nameLower.includes("stim") || nameLower.includes("heal") || nameLower.includes("cell") || nameLower.includes("mana") || nameLower.includes("battery")) {
    return <Pill size={14} className="text-sky-400" />;
  }
  if (nameLower.includes("circuitry") || nameLower.includes("scrap") || nameLower.includes("hardware") || nameLower.includes("parts")) {
    return <Settings size={14} className="text-slate-400" />;
  }
  
  if (slot === "meleeWeapon") return <Sword size={14} className="text-rose-400" />;
  if (slot === "rangedWeapon") return <Crosshair size={14} className="text-cyan-400" />;
  if (slot === "armor") return <Shield size={14} className="text-emerald-400" />;
  if (slot === "headpiece") return <Cpu size={14} className="text-purple-400" />;
  if (slot === "trinket") return <Gem size={14} className="text-amber-400" />;
  if (slot === "consumable") return <Pill size={14} className="text-sky-400" />;
  if (slot === "valuable") return <Settings size={14} className="text-slate-400" />;
  
  return <Briefcase size={14} className="text-slate-400" />;
};

const getPlayerActionLabel = (action: string): string =>
  action.replace(/^\[(?:SCENE|QUEST):[^\]]+\]\s*/i, "");

export function buildQuestJournal(state: GameState): QuestState[] {
  const quests: QuestState[] = [];

  const getOrCreate = (id: string, defaults: Partial<QuestState>): QuestState => {
    let q = quests.find(item => item.id === id);
    if (!q) {
      q = {
        id,
        title: defaults.title || "",
        category: defaults.category || "Side Quest",
        description: defaults.description || "",
        status: "NOT_STARTED",
        objectives: defaults.objectives || [],
        rewards: defaults.rewards || [],
        log: defaults.log || [],
        ...defaults
      };
      quests.push(q);
    }
    return q;
  };

  // Authored campaign and side quests are synchronized from the unified registry.

  // 14. Dynamic Campaign Quests & Custom Quests Registry Synchronization
  const campaignRegistry = buildQuestCatalog(state.campaignQuestsRegistry || []);
  for (const customQ of campaignRegistry) {
    const isCompleted = customQ.status === "COMPLETED";
    const isActive = customQ.status === "ACTIVE";

    if (isActive || isCompleted || customQ.status !== "NOT_STARTED") {
      const q = getOrCreate(customQ.id, {
        title: customQ.title,
        category: (customQ.category === "Main Quest" ? "Main Quest" : "Side Quest") as any,
        description: customQ.description,
        objectives: (customQ.stages || []).map((s, idx) => ({
          id: s.id || `stage_${idx}`,
          text: s.title + (s.description ? `: ${s.description}` : ""),
          current: isCompleted ? (s.targetCount || 1) : (s.currentCount || 0),
          target: s.targetCount || 1,
          completed: isCompleted || s.completed || (s.currentCount >= (s.targetCount || 1))
        })),
        rewards: [
          ...(customQ.rewards?.credits ? [{ type: "credits" as const, amount: customQ.rewards.credits }] : []),
          ...(customQ.rewards?.experience ? [{ type: "experience" as const, amount: customQ.rewards.experience }] : []),
          ...(customQ.rewards?.items?.map(it => ({ type: "item" as const, itemName: it })) || [])
        ]
      });

      q.title = customQ.title;
      q.description = customQ.description;
      q.category = customQ.category === "Main Quest" ? "Main Quest" : "Side Quest";
      q.objectives = (customQ.stages || []).map((s, idx) => ({
        id: s.id || `stage_${idx}`,
        text: s.title + (s.description ? `: ${s.description}` : ""),
        current: isCompleted ? (s.targetCount || 1) : (s.currentCount || 0),
        target: s.targetCount || 1,
        completed: isCompleted || s.completed || (s.currentCount >= (s.targetCount || 1))
      }));
      if (isCompleted || customQ.status === "COMPLETED") {
        q.status = "COMPLETED";
      } else {
        q.status = isActive ? "ACTIVE" : customQ.status;
      }
      if (customQ.narrativeBriefing) {
        q.log = [customQ.narrativeBriefing];
      }
    }
  }

  return quests;
}

// Helper to derive perks based on Level
export function getPerksForLevel(level: number): string[] {
  const perks: string[] = [];
  if (level >= 2) {
    perks.push("adrenaline_junkie");
    perks.push("Adrenaline Junkie");
  }
  if (level >= 3) {
    perks.push("cyber_optimizer");
    perks.push("Cyber-Optimizer");
  }
  if (level >= 4) {
    perks.push("ether_conduit");
    perks.push("Ether Conduit");
  }
  if (level >= 5) {
    perks.push("hardened_chassis");
    perks.push("Hardened Chassis");
  }
  if (level >= 6) {
    perks.push("lucky_jack");
    perks.push("Lucky Jack");
  }
  return perks;
}

export interface CombatSkill {
  name: string;
  cost: number;
  costType: "MP" | "SP";
  desc: string;
  icon: string;
  scope: "enemy" | "self" | "all_enemies";
}

export const COMBAT_SKILL_DETAILS: Record<string, CombatSkill> = {
  // Cyber-Blade
  "Viper Strike (Tier 1)": { name: "Viper Strike (Tier 1)", cost: 10, costType: "MP", desc: "Melee blow dealing +150% physical damage with a chemical armor-dissolving corrosion debuff.", icon: "⚔️", scope: "enemy" },
  "Adrenaline Surge (Tier 2)": { name: "Adrenaline Surge (Tier 2)", cost: 15, costType: "SP", desc: "Inject fast combat-stimulants, granting +2 AP and +15% Critical Hit Chance for 2 turns.", icon: "⚡", scope: "self" },
  "Phantom Dash (Tier 3)": { name: "Phantom Dash (Tier 3)", cost: 20, costType: "MP", desc: "Bypass defensive fields to blink behind a target, performing a guaranteed 300% backstab crit.", icon: "👤", scope: "enemy" },
  "Razor Tempest (Tier 4)": { name: "Razor Tempest (Tier 4)", cost: 25, costType: "MP", desc: "Unleash a whirlwind of molecular edge sweeps, dealing 30 Physical damage to all targets and bleeding them.", icon: "🌪️", scope: "all_enemies" },
  "Cyber-Celerity (Tier 5)": { name: "Cyber-Celerity (Tier 5)", cost: 18, costType: "MP", desc: "Accelerate neural clock-rate, dodging the next 2 physical attacks completely.", icon: "🏃", scope: "self" },
  "Executioner's Wake (Tier 6)": { name: "Executioner's Wake (Tier 6)", cost: 35, costType: "MP", desc: "Ultimate single-target execution, dealing massive 55 damage. If the target dies, immediately refunds 50% mana.", icon: "☠️", scope: "enemy" },

  // Techno-Mage
  "Ether Spark (Tier 1)": { name: "Ether Spark (Tier 1)", cost: 8, costType: "MP", desc: "Bends ambient ley structures to fire a direct energy bolt, dealing 18 Ether damage.", icon: "🔮", scope: "enemy" },
  "Net Shield (Tier 2)": { name: "Net Shield (Tier 2)", cost: 12, costType: "MP", desc: "Materialize an active firewall barrier over your neural interface, granting +15 Shields.", icon: "🛡️", scope: "self" },
  "Feedback Burn (Tier 3)": { name: "Feedback Burn (Tier 3)", cost: 22, costType: "MP", desc: "Overload target cerebral deck terminals, causing a spell explosion for 35 damage and 1 turn Silence.", icon: "💥", scope: "enemy" },
  "Quantum Singularity (Tier 4)": { name: "Quantum Singularity (Tier 4)", cost: 28, costType: "MP", desc: "Force-collapse local gravity, pulling all hostiles together, dealing 25 void damage, and pinning them down (Stun).", icon: "🌌", scope: "all_enemies" },
  "Bio-Electric Surge (Tier 5)": { name: "Bio-Electric Surge (Tier 5)", cost: 20, costType: "MP", desc: "Chain cyber-organic lightning through up to 3 hostiles, inflicting 30 shock damage and disabling robotic components.", icon: "⚡", scope: "enemy" },
  "Absolute Zero Code (Tier 6)": { name: "Absolute Zero Code (Tier 6)", cost: 40, costType: "MP", desc: "Freeze target CPU units entirely, dealing 50 frost-code damage and completely incapacitating them for 2 turns.", icon: "❄️", scope: "enemy" },

  // Outlaw Hacker
  "ICE Disruption (Tier 1)": { name: "ICE Disruption (Tier 1)", cost: 10, costType: "MP", desc: "Inject corrupted software into enemy combat sub-routines, lowering accuracy by 30%.", icon: "💻", scope: "enemy" },
  "Targeting Link (Tier 2)": { name: "Targeting Link (Tier 2)", cost: 12, costType: "MP", desc: "Paint the target with an orbital micro-laser, boosting all ranged damage they take by +25%.", icon: "🎯", scope: "enemy" },
  "Systems Overload (Tier 3)": { name: "Systems Overload (Tier 3)", cost: 25, costType: "MP", desc: "Trigger remote battery/munition discharges, inflicting 28 range damage and stun.", icon: "🔋", scope: "enemy" },
  "Glitch Protocol (Tier 4)": { name: "Glitch Protocol (Tier 4)", cost: 18, costType: "MP", desc: "Siphon active shield energy from hostiles, turning their own protective grids into a massive defensive shield (+20 Shields).", icon: "🛰️", scope: "enemy" },
  "Nano-Swarm Hack (Tier 5)": { name: "Nano-Swarm Hack (Tier 5)", cost: 22, costType: "MP", desc: "Reprogram nanite aerosol injectors to eat away enemy components, dealing 12 corrosion damage per turn for 3 turns.", icon: "🐜", scope: "enemy" },
  "Satellite Guillotine (Tier 6)": { name: "Satellite Guillotine (Tier 6)", cost: 35, costType: "MP", desc: "Command a decommissioned spy satellite to fire a high-orbit kinetic rod on the grid, dealing 55 heavy impact damage.", icon: "☄️", scope: "enemy" },

  // Mindmancer
  "Mind Hack (Tier 1)": { name: "Mind Hack (Tier 1)", cost: 15, costType: "MP", desc: "Direct synaptic rewrite, hacking target motor functions and forcing them to attack allies.", icon: "👁️", scope: "enemy" },
  "Neural Overload (Tier 2)": { name: "Neural Overload (Tier 2)", cost: 20, costType: "MP", desc: "Psychic cortex shock inflicting 25 damage, completely ignoring physical armor layers.", icon: "🧠", scope: "enemy" },
  "Synaptic Cascade (Tier 3)": { name: "Synaptic Cascade (Tier 3)", cost: 30, costType: "MP", desc: "Meltdown blast on all nearby targets dealing 40 psychic damage, locking brains in vegetative sleep.", icon: "🌀", scope: "all_enemies" },
  "Ether Shroud (Tier 4)": { name: "Ether Shroud (Tier 4)", cost: 18, costType: "MP", desc: "Banish yourself to the digital ether plane, becoming completely untargetable and immune to damage for 1 turn.", icon: "🌫️", scope: "self" },
  "Hallucinatory Echo (Tier 5)": { name: "Hallucinatory Echo (Tier 5)", cost: 24, costType: "MP", desc: "Clone your neural signature, creating 2 holograms that absorb incoming single-target spells.", icon: "👥", scope: "self" },
  "Cerebro-Collapse (Tier 6)": { name: "Cerebro-Collapse (Tier 6)", cost: 45, costType: "MP", desc: "Total psychic execution. Obliterates target neural paths for 60 psychic damage, transferring 50% of the damage dealt as active health to yourself.", icon: "🥀", scope: "enemy" }
};

export interface RepTierInfo {
  name: string;
  range: string;
  pricing: string;
  perks: string[];
  statusColor: string;
}

export const FACTION_TIERS: Record<"streetOutlaws" | "titanLogistics" | "aresCorporate", RepTierInfo[]> = {
  streetOutlaws: [
    { name: "Allied", range: "80% - 100%", pricing: "20% Shop Discount", perks: ["Dr. Marv's Clinic items cost 20% less", "Unlocks legendary quest 'Vice's Retribution'", "Enables rogue dialog check outcomes"], statusColor: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30" },
    { name: "Friendly", range: "61% - 79%", pricing: "10% Shop Discount", perks: ["Dr. Marv's Clinic items cost 10% less", "Favorable street reactions and chatter"], statusColor: "text-sky-400 border-sky-500/20 bg-sky-950/20" },
    { name: "Neutral", range: "41% - 60%", pricing: "Standard Market Prices", perks: ["Base medical treatment costs", "Standard dialog paths"], statusColor: "text-slate-400 border-slate-500/20 bg-slate-950/40" },
    { name: "Distant", range: "21% - 40%", pricing: "20% Price Markup", perks: ["Dr. Marv's Clinic items cost 20% more", "Scrutiny on the streets, colder dialog"], statusColor: "text-amber-500 border-amber-500/20 bg-amber-950/20" },
    { name: "Hostile", range: "0% - 20%", pricing: "50% Price Markup", perks: ["Dr. Marv's Clinic items cost 50% more", "Street Outlaws brawls and locked questlines"], statusColor: "text-rose-500 border-rose-500/30 bg-rose-950/30" }
  ],
  titanLogistics: [
    { name: "Allied", range: "80% - 100%", pricing: "20% Shop Discount", perks: ["Non-specialized merchant prices reduced by 20%", "Regional travel stamina cost reduced by 100% (Free)", "Unlocks elite black-market gear blueprints"], statusColor: "text-amber-400 border-amber-500/30 bg-amber-950/30" },
    { name: "Friendly", range: "61% - 79%", pricing: "10% Shop Discount", perks: ["Non-specialized merchant prices reduced by 10%", "Transit stamina costs reduced by 50% (5 Stamina)"], statusColor: "text-orange-400 border-orange-500/20 bg-orange-950/20" },
    { name: "Neutral", range: "41% - 60%", pricing: "Standard Market Prices", perks: ["Standard merchant hardware pricing", "Base travel cost (10 stamina per sector)"], statusColor: "text-slate-400 border-slate-500/20 bg-slate-950/40" },
    { name: "Distant", range: "21% - 40%", pricing: "20% Price Markup", perks: ["20% markup on generic sector merchants", "Travel costs increased by +5 stamina (15 total)"], statusColor: "text-amber-500 border-amber-500/20 bg-amber-950/20" },
    { name: "Hostile", range: "0% - 20%", pricing: "50% Price Markup", perks: ["50% markup on generic sector merchants", "Travel costs doubled to +10 stamina (20 total)"], statusColor: "text-rose-500 border-rose-500/30 bg-rose-950/30" }
  ],
  aresCorporate: [
    { name: "Allied", range: "80% - 100%", pricing: "20% Shop Discount", perks: ["Nouveau Chrome luxury showroom items cost 20% less", "Encounters: Scripted story nodes only", "Elite corporate nanotech clearance"], statusColor: "text-indigo-400 border-indigo-500/30 bg-indigo-950/30" },
    { name: "Friendly", range: "61% - 79%", pricing: "10% Shop Discount", perks: ["Nouveau Chrome luxury showroom items cost 10% less", "Encounters: Scripted story nodes only"], statusColor: "text-purple-400 border-purple-500/20 bg-purple-950/20" },
    { name: "Neutral", range: "41% - 60%", pricing: "Standard Showroom Prices", perks: ["Base Nouveau Chrome showroom pricing", "Encounters: Scripted story nodes only"], statusColor: "text-slate-400 border-slate-500/20 bg-slate-950/40" },
    { name: "Distant", range: "21% - 40%", pricing: "20% Price Markup", perks: ["Nouveau Chrome showroom items cost 20% more", "Encounters: Scripted story nodes only"], statusColor: "text-amber-500 border-amber-500/20 bg-amber-950/20" },
    { name: "Hostile", range: "0% - 20%", pricing: "50% Price Markup", perks: ["Nouveau Chrome showroom items cost 50% more", "Encounters: Scripted story nodes only"], statusColor: "text-rose-500 border-rose-500/30 bg-rose-950/30" }
  ]
};

export const getTierIndexForRepValue = (rep: number): number => {
  if (rep >= 80) return 0;
  if (rep >= 61) return 1;
  if (rep >= 41) return 2;
  if (rep >= 21) return 3;
  return 4;
};

const slideInVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

export default function App() {
  return (
    <GameProvider>
      <MainGame />
    </GameProvider>
  );
}

function MainGame() {
  const {
    currentScreen,
    setCurrentScreen,
    selectedArchetype,
    setSelectedArchetype,
    gameState,
    setGameState,
    logs,
    setLogs,
    isLoading,
    setIsLoading,
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
  } = useGame();

  // State to track whether the Base NPC Management modal is open
  const [baseNPCManagerOpen, setBaseNPCManagerOpen] = useState(false);
  const [isSaveDeckOpen, setIsSaveDeckOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [showMainMenuConfirm, setShowMainMenuConfirm] = useState(false);
  const [isDevStudioOpen, setIsDevStudioOpen] = useState(false);

  // State for Cyber-Lab clinic and Gear Modding terminal
  const [cyberLabOpen, setCyberLabOpen] = useState(false);
  const [gearModdingOpen, setGearModdingOpen] = useState(false);
  const [selectedWeaponForModding, setSelectedWeaponForModding] = useState<string | null>(null);
  const [workbenchTab, setWorkbenchTab] = useState<"infusion" | "crafting">("infusion");

  const buyCraftingMaterial = (materialName: string, cost: number) => {
    if (!gameState) return;
    if (gameState.credits < cost) {
      triggerToast(`INSUFFICIENT FUNDS: ${materialName} costs ${cost}¤!`);
      return;
    }
    
    let nextState = { ...gameState };
    nextState.credits -= cost;
    if (!nextState.inventory) {
      nextState.inventory = [];
    }
    nextState.inventory.push(materialName);
    
    setGameState(nextState);
    triggerToast(`💰 PURCHASED: Obtained 1x '${materialName}' for ${cost}¤.`);
  };

  const handleCraftWeaponMod = () => {
    if (!gameState) return;
    if (!selectedWeaponForModding) {
      triggerToast("CALIBRATION FAULT: Please select a weapon from the left first!");
      return;
    }
    
    const inventory = gameState.inventory || [];
    const hasScrap = inventory.includes("High-Grade Scrap Salvage");
    const hasCircuitry = inventory.includes("Rusted Circuitry");
    
    if (!hasScrap || !hasCircuitry) {
      triggerToast("COMPONENTS MISSING: Requires 1x High-Grade Scrap Salvage and 1x Rusted Circuitry!");
      return;
    }
    
    // Choose random mod
    const possibleMods = [
      { id: "Toxic Vials", name: "🧪 Bio-Toxic Vials", tier: 1 },
      { id: "Bio-Shocks", name: "⚡ Bio-Electric Shock Capacitor", tier: 1 },
      { id: "Electromagnetic Chambers", name: "🌐 Electromagnetic EMP Chamber", tier: 1 },
      { id: "Plasma Heat Coil", name: "🔥 Plasma Heat Coil", tier: 1 },
      { id: "Cryo-Fluid Injector", name: "❄️ Cryo-Fluid Injector", tier: 1 },
      { id: "Nano-Laser Sight", name: "🎯 Nano-Laser Sight", tier: 1 }
    ];
    
    const rolledMod = possibleMods[Math.floor(Math.random() * possibleMods.length)];
    
    // Deduct ingredients from inventory (exactly one of each)
    let nextState = { ...gameState };
    let removedScrap = false;
    let removedCircuitry = false;
    
    nextState.inventory = (nextState.inventory || []).filter(item => {
      if (item === "High-Grade Scrap Salvage" && !removedScrap) {
        removedScrap = true;
        return false;
      }
      if (item === "Rusted Circuitry" && !removedCircuitry) {
        removedCircuitry = true;
        return false;
      }
      return true;
    });
    
    if (!nextState.weaponMods) {
      nextState.weaponMods = {};
    }
    nextState.weaponMods[selectedWeaponForModding] = rolledMod.id;
    
    setGameState(nextState);
    triggerToast(`🔧 CRAFT SUCCESS: Assembled and mounted ${rolledMod.name} onto ${selectedWeaponForModding}!`);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🔧 GEAR WORKBENCH CRAFTING: Combined 1x [High-Grade Scrap Salvage] and 1x [Rusted Circuitry] to craft a [${rolledMod.id}] Tier-1 Mod. Mounted directly onto ${selectedWeaponForModding}.`,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    
    setActivePopup({
      title: "🔧 MOD ASSEMBLED",
      subtitle: "CRAFTING SUCCESS",
      type: "loot",
      text: `You loaded the components into the gear workbench synthesizer. Hydraulic pistons press, sparks ignite, and laser nodes fuse the micro-circuits into: \n\n💎 ${rolledMod.name} (Tier-1)\n\nIt has been immediately mounted onto your selected [${selectedWeaponForModding}].`
    });
  };

  const {
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
  } = useGame();

  // Advanced Shop vendor popup modal
  const [shopVendorOpen, setShopVendorOpen] = useState(false);

  // Cost calculator helper based on rarity and specific items
  const getItemCost = (itemName: string, details: any) => {
    if (itemName.includes("Mantis")) return 120;
    if (itemName.includes("Ether-deck")) return 140;
    if (itemName.includes("Heavy Plasma")) return 175;
    if (itemName.includes("Exo-Plated")) return 130;
    
    const itemRarity = details.rarity || "common";
    switch (itemRarity) {
      case "common": return 50;
      case "deluxe": return 90;
      case "epic": return 130;
      case "legendary": return 190;
      default: return 60;
    }
  };

  // Helper to compute derived stats including active equipment
  const getDerivedStats = () => {
    if (!gameState) {
      return {
        maxHp: 100,
        maxMana: 50,
        startingShields: 0,
        str: 10,
        dex: 10,
        int: 10,
        will: 10,
        eth: 10,
        meleeAtk: 0,
        rangeAtk: 0
      };
    }
    let maxHp = gameState.maxHp || 100;
    let maxMana = gameState.maxMana || 50;
    let startingShields = 0;

    // Apply active perks
    if (gameState.playerPerks?.includes("Hardened Chassis")) {
      maxHp += 30;
    }
    if (gameState.playerPerks?.includes("Cyber-Optimizer") || gameState.playerPerks?.includes("Cybernetic Optimizer")) {
      startingShields += 15;
    }
    
    let str = gameState.attributes?.str || 10;
    let dex = gameState.attributes?.dex || 10;
    let int = gameState.attributes?.int || 10;
    let will = gameState.attributes?.will || 10;
    let eth = gameState.attributes?.eth || 10;

    let meleeAtk = 0;
    let rangeAtk = 0;

    const eq = gameState.equipment;
    if (eq) {
      const slots = ["meleeWeapon", "rangedWeapon", "armor", "headpiece", "trinket"] as const;
      slots.forEach(slot => {
        const itemName = eq[slot];
        if (itemName) {
          const details = ITEM_METADATA[itemName];
          if (details && details.stats) {
            const st = details.stats;
            if (st.maxHp) maxHp += st.maxHp;
            if (st.maxMana) maxMana += st.maxMana;
            if (st.startingShields) startingShields += st.startingShields;
            if (st.str) str += st.str;
            if (st.dex) dex += st.dex;
            if (st.int) int += st.int;
            if (st.will) will += st.will;
            if (st.eth) eth += st.eth;
            if (st.meleeAtk) meleeAtk += st.meleeAtk;
            if (st.rangeAtk) rangeAtk += st.rangeAtk;
          }
        }
      });
    }

    return {
      maxHp,
      maxMana,
      startingShields,
      str,
      dex,
      int,
      will,
      eth,
      meleeAtk,
      rangeAtk
    };
  };

  // Squad dialogue system configurations with companions Vice and Tracker
  const SQUAD_DIALOGUES: Record<
    "banter" | "peptalk" | "tactics" | "transit_conduit_to_ridge" | "transit_ridge_to_vault",
    Record<
      string,
      {
        speakerName: string;
        speakerRole: string;
        portrait: string;
        text: string;
        choices: {
          text: string;
          nodeId: string | null;
          effect?: (state: any) => any;
        }[];
      }
    >
  > = {
    banter: {
      start: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "We're almost at the core, recruit. Tracker is sweating bullets and my plasma battery is only at seventy percent. How's your gear holding up?",
        choices: [
          {
            text: "My cybernetics are primed. We can handle whatever Ares throws at us.",
            nodeId: "vesper_confident"
          },
          {
            text: "This operation is getting hot. Is the payout really worth the risk?",
            nodeId: "vesper_worried"
          },
          {
            text: "Let's keep chatter on silent channels. Corporate scanners are active.",
            nodeId: "tracker_agrees"
          }
        ]
      },
      vesper_confident: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Confidence is cheap, kid. But I like the fire in your circuit board. Keep that SMG ready—I'm getting faint energy spikes ahead. We're not alone in these shafts.",
        choices: [
          { text: "Ask: 'What's the history of Conduit 09?'", nodeId: "history_conduit" },
          { text: "Ask: 'What should we expect from Ares Security?'", nodeId: "ares_security" },
          { text: "Roger that. Let's advance. (Exit Conversation)", nodeId: null }
        ]
      },
      history_conduit: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Conduit 09 was built during the great silicon rush fifty years ago. Ares used it as a subterranean waste disposal tube for high-capacity cooling pipes. When the lower city flooded, they sealed it off and left it to decay. Ideal for us outcasts, except the security arrays are still powered on.",
        choices: [
          { text: "Go back.", nodeId: "start" },
          { text: "Understood. Let's move. (Exit Conversation)", nodeId: null }
        ]
      },
      ares_security: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "They use old autonomous MK-II drones armed with high-frequency pulse-lasers. They ignore energy shields sometimes, so watch your physical armor. My bio-scanners suggest there's a guard locker nearby containing high-tech flak armor. Keep an eye out for a barracks room.",
        choices: [
          { text: "Go back.", nodeId: "start" },
          { text: "I'll keep my eyes open. Let's move. (Exit Conversation)", nodeId: null }
        ]
      },
      vesper_worried: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "Always is, rookie. The Ares database crystals contain bio-synthetic schemas that the Outcast union will buy for ten thousand credits. We split that, and we can finally afford tickets out of Megacity-9 slums. Hang tight.",
        choices: [
          { text: "Ask: 'Ten thousand credits is a lot. How do we fence corporate crystals?'", nodeId: "fencing_crystals" },
          { text: "Ask: 'Is the danger really worth tickets to the high orbit cities?'", nodeId: "orbit_cities" },
          { text: "Understood. Let's get it done. (Exit Conversation)", nodeId: null }
        ]
      },
      fencing_crystals: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "I've got a contact in the Red Neon slums, goes by 'Solder'. He strips the encryption sleeves and cleans the memory chips. He'll pay cold, hard credits. None of that traceable corporate script. Don't worry, kid, Solder's reliable.",
        choices: [
          { text: "Go back.", nodeId: "start" },
          { text: "Good to know. Let's move. (Exit Conversation)", nodeId: null }
        ]
      },
      orbit_cities: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "Vesper, the high orbit habitats like 'Elysian Canopy' have real sunlight. Pure oxygen. Clean synthetic water. Down here in Megacity-9, we breathe recycled copper-dust and industrial smog. If this heist goes right, we can buy clean bio-breathers or a shuttle ticket. Yes, it's worth it.",
        choices: [
          { text: "Go back.", nodeId: "start" },
          { text: "Let's win our ticket then. (Exit Conversation)", nodeId: null }
        ]
      },
      tracker_agrees: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "The kid is right, Vice. Shut your grill. If their auditory arrays pick up your voice, we'll have an entire squad of Ares Enforcers sealing the vents. Focus on prying that valve.",
        choices: [
          { text: "Acknowledged. Staying silent. (Exit Conversation)", nodeId: null }
        ]
      }
    },
    peptalk: {
      start: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "Damn, look at those energy tripwires flashing. If we step on those, the defensive system will slice us into cyber-scrap. Tracker, can you hack it?",
        choices: [
          {
            text: "We've survived this far. Tracker, take your time. Vice and I have your back.",
            nodeId: "pep_trust"
          },
          {
            text: "If we panic, we're dead. Take a deep breath and clear your mind.",
            nodeId: "pep_calm",
            effect: (state) => {
              state.mana = Math.min(state.maxMana || 50, state.mana + 15);
              return state;
            }
          },
          {
            text: "Remember who we're doing this for. The Outcasts are counting on us.",
            nodeId: "pep_outcasts",
            effect: (state) => {
              state.hp = Math.min(state.maxHp || 100, state.hp + 15);
              return state;
            }
          }
        ]
      },
      pep_trust: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "Damn straight. I've got my railgun locked on the main corridor. No corporate drone is getting past me while Tracker does his magic. Let's do this!",
        choices: [
          { text: "Prepare yourself. (Exit Conversation)", nodeId: null }
        ]
      },
      pep_calm: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Appreciate the neural grounding, kid. The ionization level is dropping in my sensors. Bypassing the security gate registers now... (You feel your own cognitive deck stabilize, gaining +15 Mana!)",
        choices: [
          { text: "Excellent. (Exit Conversation)", nodeId: null }
        ]
      },
      pep_outcasts: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "For the Union! Those suits in Megacity-9 towers think we're just scrap metal. Let's show them what outcast grit can do. I feel a surge of overdrive in my chassis! (Your squad is inspired, restoring +15 HP!)",
        choices: [
          { text: "For the Union. (Exit Conversation)", nodeId: null }
        ]
      }
    },
    tactics: {
      start: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "The main array core is just behind the next bulk door. The terminal registers show three heavy sentry drones patrolling the column. If we charge in blind, we'll be surrounded in seconds. What's the plan, recruit?",
        choices: [
          {
            text: "I'll lead the charge as a distraction. You two flank them.",
            nodeId: "tac_charge"
          },
          {
            text: "Let's siphon the bio-reactor core to cause a localized power blackout first.",
            nodeId: "tac_sabotage"
          },
          {
            text: "We set up an ambush right here, drawing them into this narrow reactor well.",
            nodeId: "tac_ambush"
          }
        ]
      },
      tac_charge: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "Bold. Insane, but bold. I'll cover you with high-caliber plasma suppressive fire. The moment they target you, I'll melt their sensor lenses from the dark.",
        choices: [
          { text: "Sounds like a plan. (Exit Conversation)", nodeId: null }
        ]
      },
      tac_sabotage: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Incredibly smart. Siphoning the reactor well will overload their recharge docks, shutting down their auxiliary energy shields! That gives us a massive combat advantage.",
        choices: [
          { text: "Let's execute it. (Exit Conversation)", nodeId: null }
        ]
      },
      tac_ambush: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "A tactical choke point. Yes, the narrow bridge of the reactor well restricts their flight patterns. We'll bottleneck them easily. You've got a sharp tactical processor, Vesper.",
        choices: [
          { text: "Agreed. Let's move. (Exit Conversation)", nodeId: null }
        ]
      }
    },
    transit_conduit_to_ridge: {
      start: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Wait. Before we climb through that gate into Shatter-Ridge Core, we need to decide on our insertion strategy. Ares Biotech has a secure cargo scanner running on that gate. If we push through directly, they'll tag our energy signatures immediately.",
        choices: [
          {
            text: "[SNEAK] 'Can we run a silent EMP pulse to temporarily scramble their scanner grids?'",
            nodeId: "sneak_emp"
          },
          {
            text: "[OVERLOAD] 'What if we feed a massive feedback loop into their power coupling, blowing the breakers?'",
            nodeId: "overload_grid"
          },
          {
            text: "[FORCE] 'No time. We charge through with weapons hot and handle whatever turns up.'",
            nodeId: "force_through"
          }
        ]
      },
      sneak_emp: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Smart. If I discharge my auxiliary cyber-deck battery, I can generate a micro-EMP. It'll keep us off their thermal sensors, but it drains some of my deck capacity. Vesper, this will grant you a localized active-shroud shield for the next district! (+20 starting Shields)",
        choices: [
          {
            text: "Excellent. Initiate the pulse and proceed. (Enter Shatter-Ridge Core)",
            nodeId: null,
            effect: (state) => {
              state.shields = Math.min(state.maxShields || 100, (state.shields || 0) + 20);
              return state;
            }
          }
        ]
      },
      overload_grid: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "I like the way you think, recruit! A clean energy overload will short-circuit their automated turret docks. They won't be able to lock onto us when we breach. It costs us some conduit coolant, but it'll make any automated systems in the next district spark out! (You gain +20 Stamina for systemic preparedness)",
        choices: [
          {
            text: "Do it. Let's overload the breakers and proceed. (Enter Shatter-Ridge Core)",
            nodeId: null,
            effect: (state) => {
              state.stamina = Math.min(state.maxStamina || 100, (state.stamina || 0) + 20);
              return state;
            }
          }
        ]
      },
      force_through: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "Hell yeah! That's what I'm talking about! Let the corporate pigs hear us coming. It gets the adrenaline pumping. Look at you—your cyber-muscles are flexing under the pressure. Let's kick that gate in! (Adrenaline rush restores +20 Health!)",
        choices: [
          {
            text: "Weapons ready. Let's push through. (Enter Shatter-Ridge Core)",
            nodeId: null,
            effect: (state) => {
              state.hp = Math.min(state.maxHp || 100, (state.hp || 0) + 20);
              return state;
            }
          }
        ]
      }
    },
    transit_ridge_to_vault: {
      start: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "The lift is ready, recruit. We are descending into the holy grail: the Ares Biotech Deep Data Vault. This is where they store their core genetic crystals. Once we breach that chamber, there's no turning back. How's your neural matrix holding up?",
        choices: [
          {
            text: "'My mind has never been clearer. Let's hack that terminal.'",
            nodeId: "clear_mind"
          },
          {
            text: "'I'm feeling a massive build-up of raw psychic energy inside me...'",
            nodeId: "psychic_surge"
          },
          {
            text: "'Let's make sure we get those crystals. For the Outcast union.'",
            nodeId: "for_union"
          }
        ]
      },
      clear_mind: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Good. Decrypting corporate vault crystal schemas requires cold logic and precise synaptic timing. Maintain that focus. Here, take this military-grade neural stim-pack I salvaged. It will stabilize your cognitive deck. (+30 Mana for the upcoming puzzle!)",
        choices: [
          {
            text: "Plug it in. Ready for decryption. (Enter Data Vault Sanctuary)",
            nodeId: null,
            effect: (state) => {
              state.mana = Math.min(state.maxMana || 100, (state.mana || 0) + 30);
              return state;
            }
          }
        ]
      },
      psychic_surge: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: trackerPortrait,
        text: "Fascinating... the exposure to the ancient relic is mutating your cerebral pathways at an exponential rate. Your brain is generating biological ether waves. Let it flow, Vesper—but guide it carefully. (Your maximum psychic potential expands! Maximum Mana permanently increased by +15!)",
        choices: [
          {
            text: "I can feel the network... Let's descend. (Enter Data Vault Sanctuary)",
            nodeId: null,
            effect: (state) => {
              state.maxMana = (state.maxMana || 50) + 15;
              state.mana = Math.min(state.maxMana, (state.mana || 0) + 15);
              return state;
            }
          }
        ]
      },
      for_union: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: vicePortrait,
        text: "For the Union! Those suits up in their ivory towers have sucked the life out of this city for too long. Today, we claw some of it back. Take this alloy-shroud weave to reinforce your chest armor. We aren't dying in there! (Maximum Health permanently increased by +15!)",
        choices: [
          {
            text: "Armored and ready. Let's descend. (Enter Data Vault Sanctuary)",
            nodeId: null,
            effect: (state) => {
              state.maxHp = (state.maxHp || 100) + 15;
              state.hp = Math.min(state.maxHp, (state.hp || 0) + 15);
              return state;
            }
          }
        ]
      }
    }
  };

  // Helper function to dynamically modify POI descriptions based on actions done
  const getPOIDescription = (poiId: string | null) => {
    if (!poiId || !gameState) return "";
    const basePOI = MAP_POIS.find(p => p.id === poiId);
    if (!basePOI) return "";

    const completed = gameState.completedPOIActions || [];

    if (poiId === "ventilation_shaft") {
      const scavDone = completed.includes("ventilation_shaft:scavenge");
      const casingDone = completed.includes("ventilation_shaft:casing");
      if (scavDone && casingDone) {
        return "A dark, cramped aerospace ventilation shaft. The emergency locker is open and empty. The loose metal casing has been completely removed from the frame. Only the spinning cooling fan remains.";
      } else if (scavDone) {
        return "A dark, cramped aerospace ventilation shaft. The rusted emergency locker is open and empty, but a loose carbon-reinforced casing is still attached to the duct.";
      } else if (casingDone) {
        return "A dark, cramped aerospace ventilation shaft. The ventilation casing has been dismantled, but a rusted emergency locker is still locked in the corner.";
      }
    }

    if (poiId === "security_terminal") {
      const lockerDone = completed.includes("security_terminal:locker");
      const batteryDone = completed.includes("security_terminal:battery");
      if (lockerDone && batteryDone) {
        return "A monitoring station with offline terminals. The weapons locker stands open and looted, and the auxiliary thermal battery cell socket is dark and empty.";
      } else if (lockerDone) {
        return "A monitoring station. The weapons locker stands open and empty. The auxiliary thermal battery cell is still humming in its socket.";
      } else if (batteryDone) {
        return "A monitoring station. The thermal battery cell is gone, but the secure heavy weapons locker remains locked.";
      }
    }

    if (poiId === "blast_door") {
      const barracksDone = completed.includes("blast_door:barracks");
      const binDone = completed.includes("blast_door:bin");
      if (barracksDone && binDone) {
        return "A massive, multi-layered hydraulic blast barrier. The nearby guard barracks are cleared out, and the corporate supply bin has been fully raided.";
      } else if (barracksDone) {
        return "A massive blast barrier. The guard barracks are empty, but the locked corporate supply bin is still intact.";
      } else if (binDone) {
        return "A massive blast barrier. The supply bin has been emptied, but the guard barracks are still unsearched.";
      }
    }

    if (poiId === "shatter_ridge_security_post") {
      const scavDone = completed.includes("shatter_ridge_security_post:scavenge");
      const gateDone = completed.includes("shatter_ridge_security_post:gate");
      if (scavDone && gateDone) {
        return "A fortified cyber-barrier checkpoint. The steel lockers lie open and ransacked. The defensive tripwires and security gate are permanently overloaded and inactive.";
      } else if (scavDone) {
        return "A fortified cyber-barrier checkpoint. The steel lockers are completely empty. Red defensive warning lights continue to flash across the security gate.";
      } else if (gateDone) {
        return "A fortified cyber-barrier checkpoint. The defensive tripwires are deactivated, but the heavy steel lockers remain locked.";
      }
    }

    if (poiId === "shatter_ridge_reactor_well") {
      const leverDone = completed.includes("shatter_ridge_reactor_well:lever");
      const coreDone = completed.includes("shatter_ridge_reactor_well:reactor_core");
      if (leverDone && coreDone) {
        return "A boiling pool of toxic bio-coolant fluid. The suspended cargo crate has been lowered and looted, and the bio-reactor core is dark and quiet.";
      } else if (leverDone) {
        return "A boiling pool of toxic bio-coolant. The cargo crate has been lowered and emptied, but the bio-reactor core is still hum-charging.";
      } else if (coreDone) {
        return "A boiling pool of toxic bio-coolant. The bio-reactor core has been dismantled, but the cargo crate still hangs overhead.";
      }
    }

    return basePOI.description;
  };

  // Helper to determine if an action button has already been consumed
  const isActionCompleted = (poiId: string | null, actionText: string) => {
    if (!poiId || !gameState || !gameState.completedPOIActions) return false;
    const clean = actionText.toLowerCase();
    if (poiId === "ventilation_shaft") {
      if (clean.includes("scavenge") && gameState.completedPOIActions.includes("ventilation_shaft:scavenge")) return true;
      if (clean.includes("dismantle") && gameState.completedPOIActions.includes("ventilation_shaft:casing")) return true;
      if (clean.includes("slip") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("force fan") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("trigger emp") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("hack fan") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("talk to") && gameState.completedPOIActions.includes("ventilation_shaft:talk_to_vice_tracker")) return true;
    }
    if (poiId === "security_terminal") {
      if (clean.includes("bypass") && gameState.completedPOIActions.includes("security_terminal:bypass")) return true;
      if (clean.includes("wreckage") && gameState.completedPOIActions.includes("security_terminal:wreckage")) return true;
      if (clean.includes("locker") && gameState.completedPOIActions.includes("security_terminal:locker")) return true;
      if (clean.includes("siphon") && gameState.completedPOIActions.includes("security_terminal:battery")) return true;
    }
    if (poiId === "blast_door") {
      if (clean.includes("pry") && gameState.completedPOIActions.includes("blast_door:pry")) return true;
      if (clean.includes("barracks") && gameState.completedPOIActions.includes("blast_door:barracks")) return true;
      if (clean.includes("supply") && gameState.completedPOIActions.includes("blast_door:bin")) return true;
      if (clean.includes("banter") && gameState.completedPOIActions.includes("blast_door:banter")) return true;
    }
    if (poiId === "shatter_ridge_security_post") {
      if (clean.includes("overclock") && gameState.completedPOIActions.includes("shatter_ridge_security_post:gate")) return true;
      if (clean.includes("scavenge") && gameState.completedPOIActions.includes("shatter_ridge_security_post:scavenge")) return true;
      if (clean.includes("pep-talk") && gameState.completedPOIActions.includes("shatter_ridge_security_post:peptalk")) return true;
    }
    if (poiId === "shatter_ridge_reactor_well") {
      if (clean.includes("pull") && gameState.completedPOIActions.includes("shatter_ridge_reactor_well:lever")) return true;
      if (clean.includes("salvage") && gameState.completedPOIActions.includes("shatter_ridge_reactor_well:reactor_core")) return true;
      if (clean.includes("tactics") && gameState.completedPOIActions.includes("shatter_ridge_reactor_well:tactics")) return true;
    }
    return false;
  };

  // Priority State Machine Intercept Checker
  const hasActiveQuestIntercept = (poiId: string | null): boolean => {
    if (!poiId || !gameState) return false;
    
    // 1. Prologue/Dungeon regions (conduit09, shatter_ridge_core, data_vault)
    // In these regions, every POI is a dedicated cinematic quest-room/combat checkpoint!
    const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
    if (isPrologue) {
      return true;
    }
    
    // 3. Dynamic campaign quest objectives targeting this POI
    if (gameState.campaignQuestsRegistry && gameState.campaignQuestsRegistry.length > 0) {
      const currentPoiObj = MAP_POIS.find(p => p.id === poiId);
      const currentPoiName = (currentPoiObj?.name || "").toLowerCase();
      const currentPoiId = poiId.toLowerCase();
      const currentDistrict = (currentPoiObj?.district || gameState.district || "").toLowerCase();
      
      let hasCampaignStage = false;
      gameState.campaignQuestsRegistry.forEach(quest => {
        if (quest.status !== "ACTIVE") return;
        
        const currentStage = quest.stages?.find(s => !s.completed);
        if (!currentStage) return;
        
        const targetPoiLower = (currentStage.targetPOI || "").toLowerCase();
        const targetPoiIdLower = (currentStage.targetPOIId || "").toLowerCase();
        const targetDistrictLower = (currentStage.targetDistrict || "").toLowerCase();
        
        const matchesThisPOI = 
          (targetPoiIdLower && targetPoiIdLower === currentPoiId) ||
          (targetPoiLower && (currentPoiName.includes(targetPoiLower) || currentPoiId.includes(targetPoiLower) || targetPoiLower.includes(currentPoiId))) ||
          (!targetPoiLower && targetDistrictLower && targetDistrictLower === currentDistrict);
          
        if (matchesThisPOI) {
          hasCampaignStage = true;
        }
      });
      if (hasCampaignStage) return true;
    }
    
    // 4. Custom POI Studio triggers
    const found = (gameState.customPOIsRegistry || []).find(p => p.id === poiId);
    if (found && found.questTrigger?.questId) {
      const triggerQuest = gameState.campaignQuestsRegistry?.find(quest => quest.id === found.questTrigger?.questId);
      if (triggerQuest?.status === "ACTIVE" && !gameState.completedPOIActions.includes(`${poiId}:quest_triggered`)) {
        return true;
      }
    }
    
    return false;
  };

  const handleEquipItem = (itemName: string) => {
    if (!gameState) return;
    const details = ITEM_METADATA[itemName];
    if (!details || !details.slot) return;
    const slot = details.slot as "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket";

    let nextState = { ...gameState };
    if (!nextState.equipment) {
      nextState.equipment = { meleeWeapon: null, rangedWeapon: null, armor: null, headpiece: null, trinket: null };
    }

    const previousItem = nextState.equipment[slot];
    if (previousItem) {
      nextState.inventory.push(previousItem);
    }

    nextState.equipment[slot] = itemName;
    nextState.inventory = nextState.inventory.filter((item, idx) => idx !== nextState.inventory.indexOf(itemName));

    setGameState(nextState);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotDisplay = slot === "meleeWeapon" ? "MELEE WEAPON" : slot === "rangedWeapon" ? "RANGED WEAPON" : slot;
    const logText = previousItem 
      ? `🔄 EQUIPMENT SWAPPED: Unequipped ${previousItem} and equipped ${itemName} into ${slotDisplay.toUpperCase()} slot!`
      : `🛡️ EQUIPMENT EQUIP: Equipped ${itemName} into ${slotDisplay.toUpperCase()} slot!`;

    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: logText,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    triggerToast(`EQUIPPED: ${itemName}`);
  };

  const handleUnequipItem = (slot: "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket") => {
    if (!gameState || !gameState.equipment) return;
    const itemName = gameState.equipment[slot];
    if (!itemName) return;

    let nextState = { ...gameState };
    nextState.inventory.push(itemName);
    nextState.equipment[slot] = null;

    setGameState(nextState);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotDisplay = slot === "meleeWeapon" ? "MELEE WEAPON" : slot === "rangedWeapon" ? "RANGED WEAPON" : slot;
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🛡️ EQUIPMENT UNEQUIP: Unequipped ${itemName} from ${slotDisplay.toUpperCase()} slot. Returned to stash inventory.`,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    triggerToast(`UNEQUIPPED: ${itemName}`);
  };

  const handleEquipCompanionItem = (companionName: string, slot: "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket", itemName: string) => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp) return;
    
    if (!comp.equipment) {
      comp.equipment = {
        meleeWeapon: null,
        rangedWeapon: null,
        armor: null,
        headpiece: null,
        trinket: null
      };
    }
    
    const currentEquipped = comp.equipment[slot];
    
    // Remove from player inventory
    next.inventory = next.inventory.filter((item, idx) => idx !== next.inventory.indexOf(itemName));
    
    // Return previous item to player inventory
    if (currentEquipped) {
      next.inventory.push(currentEquipped);
    }
    
    comp.equipment[slot] = itemName;
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🛡️ MERCENARY GEAR COMPLETED: Equipped ${itemName} on ${companionName.toUpperCase()} into their ${slot.toUpperCase()} slot!`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Equipped on ${companionName}: ${itemName}`);
  };

  const handleUnequipCompanionItem = (companionName: string, slot: "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket") => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp || !comp.equipment) return;
    
    const currentEquipped = comp.equipment[slot];
    if (!currentEquipped) return;
    
    next.inventory.push(currentEquipped);
    comp.equipment[slot] = null;
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🛡️ MERCENARY GEAR STRIPPED: Unequipped ${currentEquipped} from ${companionName.toUpperCase()}'s ${slot.toUpperCase()} slot. Returned to stash.`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Unequipped ${currentEquipped} from ${companionName}`);
  };

  const handleGiveCompanionItem = (companionName: string, itemName: string) => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp) return;
    
    if (!comp.inventory) {
      comp.inventory = [];
    }
    
    next.inventory = next.inventory.filter((item, idx) => idx !== next.inventory.indexOf(itemName));
    comp.inventory.push(itemName);
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `📦 ITEM TRANSFERRED: Transferred '${itemName}' from global stash to ${companionName.toUpperCase()}'s combat belt inventory.`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Transferred ${itemName} to ${companionName}`);
  };

  const handleTakeCompanionItem = (companionName: string, itemName: string) => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp || !comp.inventory) return;
    
    comp.inventory = comp.inventory.filter((item, idx) => idx !== comp.inventory.indexOf(itemName));
    next.inventory.push(itemName);
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `📦 ITEM TRANSFERRED: Retrieved '${itemName}' from ${companionName.toUpperCase()}'s combat belt inventory into global stash.`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Retrieved ${itemName} from ${companionName}`);
  };
  
  // Success toast indicators
  const { saveToast, setSaveToast } = useGame();
  const [hasSave, setHasSave] = useState(false);

  // Ventilation Shaft failure state for richer branch options
  const [ventFailed, setVentFailed] = useState(false);

  // Tactical grid-based combat structures
  interface GridCombatant {
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

  interface GridInteractiveObject {
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

  interface GridCombatState {
    combatants: GridCombatant[];
    turnOrder: string[];
    currentTurnIdx: number;
    selectedAction: "move" | "attack" | "meleeAtk" | "rangedAtk" | "spell" | "item" | null;
    turnLog: string;
    interactiveObjects?: GridInteractiveObject[];
  }

  const {
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
    setHackingPuzzle
  } = useGame() as any;

  const addLog = (text: string, type: "narration" | "combat" | "dialogue" | "system" = "narration") => {
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        type,
        district: gameState?.district,
        poi: gameState?.poi
      }
    ]);
  };

  interface HackingPuzzleState {
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

  const initHackingGame = (
    type: "sanctuary" | "cargo_logs" | "security_mainframe" | "cryo_bypass" | "nouveau_safe" | "rebel_courier" | "shatter_ridge_server",
    intScore: number,
    netSlicerLevel: number,
    hasBonusCard: boolean = false
  ): HackingPuzzleState => {
    let targetLen = 3;
    if (type === "sanctuary") targetLen = 2;
    if (type === "nouveau_safe" || type === "security_mainframe" || type === "shatter_ridge_server") targetLen = 4;

    const hexPool = ["1C", "E9", "BD", "55", "FF", "AA", "7A", "4F", "D4", "7C", "3B", "2E"];
    const targets: string[] = [];
    for (let i = 0; i < targetLen; i++) {
      targets.push(hexPool[Math.floor(Math.random() * hexPool.length)]);
    }

    const grid: { hex: string; row: number; col: number; isClicked: boolean; isHighlighted: boolean }[][] = [];
    for (let r = 0; r < 6; r++) {
      const rowArr = [];
      for (let c = 0; c < 6; c++) {
        rowArr.push({
          hex: hexPool[Math.floor(Math.random() * hexPool.length)],
          row: r,
          col: c,
          isClicked: false,
          isHighlighted: false
        });
      }
      grid.push(rowArr);
    }

    let curR = 0;
    let curC = Math.floor(Math.random() * 6);
    grid[curR][curC].hex = targets[0];
    const path = [{ r: curR, c: curC }];

    for (let i = 1; i < targetLen; i++) {
      if (i % 2 === 1) {
        let nextR = curR;
        while (nextR === curR) {
          nextR = Math.floor(Math.random() * 6);
        }
        curR = nextR;
      } else {
        let nextC = curC;
        while (nextC === curC) {
          nextC = Math.floor(Math.random() * 6);
        }
        curC = nextC;
      }
      grid[curR][curC].hex = targets[i];
      path.push({ r: curR, c: curC });
    }

    if (netSlicerLevel >= 3) {
      path.forEach(({ r, c }) => {
        grid[r][c].isHighlighted = true;
      });
    }

    let maxAttempts = 5;
    if (netSlicerLevel >= 2) maxAttempts += 2;
    if (hasBonusCard) maxAttempts += 1;

    let maxBuffer = 5;
    if (netSlicerLevel >= 1) maxBuffer += 2;

    return {
      type,
      status: "playing",
      targets,
      buffer: [],
      maxBuffer,
      grid,
      attemptsLeft: maxAttempts,
      maxAttempts,
      activeLineType: "row",
      activeLineIdx: 0,
      netSlicerLevel,
      intelligence: intScore,
      usedPerkBuffer: false,
      usedPerkAttempts: false
    };
  };

  const handleHackingSuccess = () => {
    if (!hackingPuzzle) return;
    let nextState = { ...gameState! };
    const type = hackingPuzzle.type;
    
    if (type === "sanctuary") {
      nextState.poi = "Mysterious Relic Altar";
      setActivePOIView("relic_altar");
      nextState.inventory.push("Ares Data Crystal");
      nextState.completedPOIActions = [...(nextState.completedPOIActions || []), "terminal_hacking_puzzle:hacked"];
      nextState.experience += 50;
      setActivePopup({
        title: "DATABASE COPIED",
        subtitle: "HEX DECRYPTION SUCCESS",
        type: "loot",
        text: "You successfully bypassed the Ares mainframe and extracted the Ares Data Crystal! The secure lockpins holding the golden relic chamber have fully retracted. Access the altar immediately."
      });
      setGameState(nextState);
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💾 DECRYPTION SUCCESS: You safely extract the 'Ares Data Crystal' into your inventory stash. The heavy security door behind the terminal slides back silently, revealing a glowing chamber with a floating golden relic on a black altar...",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "cargo_logs") {
      nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), "hunt_for_vice:logs_acquired"]));
      if (!nextState.inventory.includes("Decrypted Ares Transit Token")) {
        nextState.inventory.push("Decrypted Ares Transit Token");
      }
      nextState.experience += 40;
      nextState = completeQuest(synchronizeQuestProgress(nextState), "hunt_for_vice");
      setActivePopup({
        title: "💾 SECURITY BYPASSED",
        subtitle: "LOGISTICS ARCHIVE BREACHED",
        type: "check_success",
        text: "With superb neural execution, you bypassed the Titan Logistics security nodes. You isolated the transport log for Subject ID: Vice.\n\nDestination: Cryo-Locked Detainment Bay B, beneath Ares Biotech Corporate Plaza, Downtown.\n\nYou have also siphoned an encrypted 'Decrypted Ares Transit Token' into your active stash database!"
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💾 SECURITY BYPASSED: You hacked the main cargo logistics node safely! Copied decrypted manifests and secured a transit token.",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "security_mainframe") {
      nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), "rescue_vice:checkpoint_bypassed"]));
      nextState = synchronizeQuestProgress(nextState);
      nextState.experience += 40;
      setActivePopup({
        title: "💾 DECRYPT COMPLETE",
        subtitle: "MAINBOARD COVERT OVERRIDE",
        type: "check_success",
        text: "With brilliant neural flow, you bypassed the security nodes. You looped the video feeds and injected a simulated security authorization. The heavy titanium elevator slides open smoothly. You step inside to descend to the detention sub-level!"
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💾 MAINBOARD OVERRIDDEN: Bypassed the corporate plaza security checkpoint terminal covertly! Staff lift unlocked.",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "cryo_bypass") {
      nextState.completedPOIActions = Array.from(new Set([
        ...(nextState.completedPOIActions || []),
        "rescue_vice:extracted"
      ]));
      nextState = completeQuest(synchronizeQuestProgress(nextState), "rescue_vice");

      setActivePopup({
        title: "🔓 CHAPTER 1 COMPLETED!",
        subtitle: "VICE HAS BEEN EXTRACTED",
        type: "check_success",
        text: "The cryo-glass seal cracks, releasing pressurized white nitrogen gas. Vice stumbles out of the pod, coughing and shivering but grinning.\n\nReward: Vice joins your active party squad. The quest rewards configured in Quest Studio have been granted."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💻 OVERRIDE SUCCESSFUL: Bypassed cryo-computer thermal governor! Vice is safely released!",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "nouveau_safe") {
      nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), "nouveau:shields_disabled"]));
      nextState.experience += 40;
      setActivePopup({
        title: "💾 BYPASS COMPLETED",
        subtitle: "EM SHIELDS OFFLINE",
        type: "check_success",
        text: "The security console screen flickers to an authorized state. The high-pitched electromagnetic hum dies down instantly as the force fields slide into the floor registers. The Prototype Singularity Battery stands exposed on its pedestal!"
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💾 SHIELDS DEACTIVATED: Successfully bypassed Nouveau's luxury showroom terminal pressure shields!",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "shatter_ridge_server") {
      if (!nextState.inventory.includes("Encrypted Ares Ledger")) nextState.inventory.push("Encrypted Ares Ledger");
      nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), "vice:ledger_acquired"]));
      nextState = synchronizeQuestProgress(nextState);
      nextState.experience += 50;
      setActivePopup({
        title: "💻 ACCESS GRANTED",
        subtitle: "BLACK LEDGER DECRYPTED",
        type: "check_success",
        text: "Success! You bypass the database mainframe security grid. A heavy carbon-plated data storage cylinder unlocks with a soft hiss, revealing the Encrypted Ares Ledger! Hand this over to Vice at the Aurus Safehouse to finish the legendary quest."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💻 SERVER FARM BREACHED: Stole the Encrypted Ares Ledger from the server databases!",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "rebel_courier") {
      nextState.credits += 80;
      nextState.experience += 25;
      setActivePopup({
        title: "🔓 COURIER DECK DECRYPTED",
        subtitle: "CREDIT TRANSFER COMPLETE",
        type: "check_success",
        text: "You bypassed the dead rebel courier's cyberdeck biometric lock! Successfully routed and wired +80¤ credits and downloaded highly valuable neural matrix schemas (+25 XP)."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "💾 COURIER DECRYPTED: Successfully siphoned +80¤ from dead courier's cyberdeck.",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
  };

  const handleHackingFailure = () => {
    if (!hackingPuzzle) return;
    let nextState = { ...gameState! };
    const type = hackingPuzzle.type;

    if (type === "sanctuary") {
      nextState.hp = Math.max(10, nextState.hp - 10);
      setActivePopup({
        title: "⚠️ COGNITIVE FEEDBACK",
        subtitle: "SHOCK BARRIER TRIGGERED",
        type: "check_failure",
        text: "Your cyberdeck suffered a severe feedback surge! Dealt -10 cognitive HP damage. Clean your deck buffer and reinitialize when ready."
      });
      setGameState(nextState);
      setHackingPuzzle(null);
    }
    else if (type === "cargo_logs") {
      nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), "hunt_for_vice:logs_acquired"]));
      nextState.hp = Math.max(10, nextState.hp - 20);
      nextState = completeQuest(synchronizeQuestProgress(nextState), "hunt_for_vice");
      setActivePopup({
        title: "⚠️ NEURAL BACKLASH",
        subtitle: "FIREWALL TRAP ENGAGED",
        type: "check_failure",
        text: "The terminal detected your intrusion vector. A feedback voltage shock surge scorched your synapse arrays, dealing -20 HP damage!\n\nHowever, a partial transfer manifest was successfully cached:\n\nSubject ID: Vice has been relocated to the cryogenic holding block beneath Ares Biotech Corporate Plaza (Downtown Region). Proceed there immediately!"
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "⚠️ BACKLASH ERROR: A proxy-firewall triggered a neural feedback loop! Dealt -20 HP damage. Fragmented transfer logs salvaged.",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "security_mainframe") {
      nextState.combatState = {
        enemyName: "Ares Plasma Sentinel",
        enemyHp: 110,
        enemyMaxHp: 110,
        enemyShields: 60,
        enemyMaxShields: 60,
        isActive: true,
        turnLog: "🚨 ALERT: SECURITY BREACH DETECTED! Sentry guns deploy with emergency combat shielding!"
      };
      setActivePopup({
        title: "🚨 SECURITY ALARM",
        subtitle: "SYS-ADMIN TRAP ENGAGED",
        type: "check_failure",
        text: "You failed the override hack! Red strobe lights spin across the plaza walls. An Ares Plasma Sentinel with boosted defense shields deploys immediately to incinerate your neural signature!"
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "🚨 SECURITY ALARM: Failed the security checkpoint override! Red strobe lights spinning.",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "cryo_bypass") {
      nextState.hp = Math.max(10, nextState.hp - 15);
      setActivePopup({
        title: "❌ OVERRIDE FAILURE",
        subtitle: "THERMAL EXPLOIT LOCKED",
        type: "check_failure",
        text: "The cryo-computer detected your host intrusion. It immediately locked you out and triggered an auxiliary coolant purge! Slipped ice frost blast dealing -15 HP."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "❌ OVERRIDE FAILURE: Cryo-computer system locked out, venting freezing coolant (-15 HP).",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "nouveau_safe") {
      nextState.hp = Math.max(10, nextState.hp - 20);
      setActivePopup({
        title: "🚨 LASER OVERRIDE ENGAGED",
        subtitle: "THERMAL COUNTER-DEFENSE",
        type: "check_failure",
        text: "The safe terminal detected your intrusion vector. A thermal security laser fired directly into your forearm plating! Dealt -20 HP thermal damage."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "🚨 SECURITY LASER SECTOR: Caught hacking Nouveau safe terminal, shot by defense laser (-20 HP).",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "shatter_ridge_server") {
      nextState.hp = Math.max(10, nextState.hp - 15);
      setActivePopup({
        title: "🚨 SERVER BACKLASH",
        subtitle: "VOLTAGE SURGE DEPLOYED",
        type: "check_failure",
        text: "Your exploit code faulted! The server terminal fired a high-voltage electrostatic discharge through your hand connectors, dealing -15 HP electrical damage."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "🚨 SERVER EXPLOIT FAULT: High-voltage feedback loop hit your frame during hacking (-15 HP).",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
    else if (type === "rebel_courier") {
      nextState.mana = Math.max(0, nextState.mana - 20);
      setActivePopup({
        title: "⚠️ THERMITE COIL EXPLOSION",
        subtitle: "SELF-DESTRUCT SECURED",
        type: "check_failure",
        text: "The courier deck's self-destruct thermite coil triggered upon intrusion! Discharged a heavy neural feedback spike, draining -20 Mana."
      });
      setGameState(nextState);
      setActivePOIView("default");
      setHackingPuzzle(null);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "⚠️ CYBERDECK BURST ERROR: Dead rebel courier deck self-destructed (-20 Mana feedback).",
          type: "narration",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
    }
  };

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Dismiss companion from squad entirely
  const handleDismissCompanion = (companionName: string) => {
    if (!gameState) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextState = { ...gameState };
    
    // Set status to available
    const comp = nextState.companions.find(c => c.name === companionName);
    if (comp) {
      comp.status = "available";
    }
    
    // Remove from party
    nextState.party = nextState.party.filter(name => name !== companionName);
    
    setGameState(nextState);
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `⚙️ ROSTER UPDATE: Discharged contractor [${companionName}] from active squad. They have returned to the Nexus Agency suite.`,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    triggerToast(`${companionName} dismissed from squad`);
  };

  // Companion talk feedback opinions
  const handleTalkCompanion = (comp: CompanionState) => {
    if (!gameState) return;
    
    const companionLines: Record<string, Record<string, string>> = {
      Scythe: {
        docks: "The seawater around these slipways is highly contaminated. Watch your footing on those rusty cargo loaders. Keep a blade ready, I smell scavengers.",
        downtown: "Too many high-resolution cameras down these sky canyons. If an automated security bot scans our profile, we'll be in high security before sunrise.",
        satoshi: "All these glowing server shrines hum too loud. High technomancy and cybernetics... it's a volatile brew. Keep your distance from Morgana's ley cores.",
        default: "I've seen empires crumble under Megacity-9 slums. Jax is a decent coordinator, but when the bullets fly, trust your alloy blade first."
      },
      Vex: {
        docks: "I'm siphoning shipping manifest logs from these automatic logistics nodes! Lots of corporate contraband flowing here. Want me to slice open a cargo hatch?",
        downtown: "Look at those massive corporate firewalls! Ares Biotech has incredible security layers. My deck is heating up just scanning them. Pure digital bliss!",
        satoshi: "High Priestess Morgana is the real deal! Technomancy at its finest. I can feel the pure static ley currents charging my network visor. Let me hack the temple columns!",
        default: "Aurus slums are alright if you don't mind the neon acid rain. Need some local transaction overrides? Just ask Vex."
      },
      Brick: {
        docks: "Smells like rotten seaweed and mechanical grease. Perfect. Let those giant mutant sludge beasts crawl out... my electro-fists are hungry for a crush.",
        downtown: "If those fancy corporate enforcers look at us wrong, my alloy knuckles are going straight through their chrome faceplates. Keep moving.",
        satoshi: "All these digital cherry trees are fake holograms, but the server exhaust vents are perfect for warming up my hydraulic hydraulics.",
        default: "We need bigger stims and thicker armor meshes. But for now, my custom double-barreled shotgun has plenty of explosive scrap shells."
      }
    };

    const currentRegionId = gameState.district || "aurus";
    const companionData = companionLines[comp.name] || { default: "Let's keep moving. Megacity-9 doesn't sleep." };
    const dialogueLine = companionData[currentRegionId] || companionData.default;

    setCompanionOpinion({
      name: comp.name,
      line: dialogueLine,
      image: comp.image
    });
  };

  // Tactical grid-based combat initialization helper
  const initGridCombat = (
    enemyName: string,
    enemyHp: number,
    enemyMaxHp: number,
    enemyShields: number,
    enemyMaxShields: number,
    district: string,
    party: string[],
    archetype: string
  ) => {
    let pRange = archetype === "Cyber-Blade" ? 1 : 3;
    let pDmg = archetype === "Cyber-Blade" ? 22 : archetype === "Techno-Mage" ? 28 : 18;
    let pAvatar = archetype === "Cyber-Blade" ? "⚔️" : archetype === "Techno-Mage" ? "🔮" : "🔫";
    let pShields = 0;

    if (gameState?.inventory.includes("Tactical Cyber-SMG")) {
      pRange = 3;
      pDmg = Math.max(pDmg, 24);
      pAvatar = "🔫";
    }
    if (gameState?.inventory.includes("Carbon Fiber Armor Plates")) {
      pShields += 30;
    }
    if (gameState?.inventory.includes("Tactical Flak Armor")) {
      pShields += 45;
    }
    if (gameState?.inventory.includes("Cyber-Ammo")) {
      pDmg += 6;
    }

    const combatants: GridCombatant[] = [
      {
        id: "player",
        name: `You (${archetype})`,
        team: "player",
        hp: gameState?.hp || 100,
        maxHp: gameState?.maxHp || 100,
        shields: pShields,
        maxShields: pShields,
        x: 1,
        y: 2,
        avatar: pAvatar,
        image: gameState?.playerAvatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        color: "border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]",
        range: pRange,
        damage: pDmg,
        ap: 2,
        maxAp: 2,
        initiative: 12 + Math.floor(Math.random() * 5),
        isDead: false
      }
    ];

    // Prologue companions
    if (["conduit09", "shatter_ridge_core"].includes(district)) {
      combatants.push({
        id: "vice",
        name: "Vice (Companion)",
        team: "player",
        hp: 120,
        maxHp: 120,
        shields: 0,
        maxShields: 0,
        x: 1,
        y: 1,
        avatar: "👩‍🎤",
        image: viceBody,
        color: "border-rose-500 text-rose-400",
        range: 3,
        damage: 16,
        ap: 2,
        maxAp: 2,
        initiative: 14,
        isDead: false,
        isCompanion: true
      });
      combatants.push({
        id: "tracker",
        name: "Tracker (Companion)",
        team: "player",
        hp: 90,
        maxHp: 90,
        shields: 0,
        maxShields: 0,
        x: 0,
        y: 3,
        avatar: "📟",
        image: trackerBody,
        color: "border-amber-500 text-amber-400",
        range: 3,
        damage: 12,
        ap: 2,
        maxAp: 2,
        initiative: 13,
        isDead: false,
        isCompanion: true
      });
    } else if (district === "data_vault") {
      combatants.push({
        id: "vice",
        name: "Vice (Companion)",
        team: "player",
        hp: 75,
        maxHp: 120,
        shields: 0,
        maxShields: 0,
        x: 1,
        y: 1,
        avatar: "👩‍🎤",
        image: viceBody,
        color: "border-rose-500 text-rose-400",
        range: 3,
        damage: 16,
        ap: 2,
        maxAp: 2,
        initiative: 14,
        isDead: false,
        isCompanion: true
      });
    } else {
      // Chapter 1 onwards
      party.forEach((name, idx) => {
        if (name === "Scythe") {
          combatants.push({
            id: "scythe",
            name: "Scythe (Companion)",
            team: "player",
            hp: 100,
            maxHp: 100,
            shields: 10,
            maxShields: 10,
            x: 0,
            y: idx + 1,
            avatar: "🥷",
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
            color: "border-teal-500 text-teal-400",
            range: 1,
            damage: 24,
            ap: 2,
            maxAp: 2,
            initiative: 16,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Vex") {
          combatants.push({
            id: "vex",
            name: "Vex (Companion)",
            team: "player",
            hp: 80,
            maxHp: 80,
            shields: 0,
            maxShields: 0,
            x: 0,
            y: idx + 1,
            avatar: "🔮",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
            color: "border-purple-500 text-purple-400",
            range: 4,
            damage: 26,
            ap: 2,
            maxAp: 2,
            initiative: 11,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Brick") {
          combatants.push({
            id: "brick",
            name: "Brick (Companion)",
            team: "player",
            hp: 150,
            maxHp: 150,
            shields: 30,
            maxShields: 30,
            x: 0,
            y: idx + 1,
            avatar: "🦾",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
            color: "border-stone-500 text-stone-400",
            range: 1,
            damage: 18,
            ap: 2,
            maxAp: 2,
            initiative: 8,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Trigger") {
          combatants.push({
            id: "trigger",
            name: "Trigger (Companion)",
            team: "player",
            hp: 95,
            maxHp: 95,
            shields: 15,
            maxShields: 15,
            x: 0,
            y: idx + 1,
            avatar: "🔫",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
            color: "border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
            range: 4,
            damage: 20,
            ap: 2,
            maxAp: 2,
            initiative: 12,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Vice") {
          combatants.push({
            id: "vice",
            name: "Vice (Companion)",
            team: "player",
            hp: 120,
            maxHp: 120,
            shields: 10,
            maxShields: 10,
            x: 0,
            y: idx + 1,
            avatar: "👩‍🎤",
            image: viceBody,
            color: "border-rose-500 text-rose-400",
            range: 3,
            damage: 18,
            ap: 2,
            maxAp: 2,
            initiative: 14,
            isDead: false,
            isCompanion: true
          });
        }
      });
    }

    // Add primary enemy
    const isBoss = enemyName.includes("Behemoth") || enemyName.includes("Ares Prime") || enemyName.includes("Special Ops Commander");
    const isDrone = enemyName.includes("Drone") || enemyName.includes("Sentry") || enemyName.includes("Watcher");
    combatants.push({
      id: "enemy-1",
      name: enemyName,
      team: "enemy",
      hp: enemyHp,
      maxHp: enemyMaxHp,
      shields: enemyShields,
      maxShields: enemyMaxShields,
      x: 6,
      y: 2,
      avatar: isBoss ? "👹" : isDrone ? "🤖" : "🕴️",
      image: isBoss 
        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600" 
        : isDrone 
          ? "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600" 
          : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
      color: "border-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
      range: isBoss ? 2 : isDrone ? 3 : 2,
      damage: isBoss ? 24 : 14,
      ap: 2,
      maxAp: 2,
      initiative: 10 + Math.floor(Math.random() * 4),
      isDead: false
    });

    // Add 1 auxiliary enemy if not solo weak mob
    if (enemyHp >= 40) {
      const isMech = enemyName.includes("Drone") || enemyName.includes("Security");
      combatants.push({
        id: "enemy-2",
        name: isMech ? "Sentry Watcher Drone" : "Corporate Patrol Guard",
        team: "enemy",
        hp: Math.floor(enemyHp * 0.45) || 25,
        maxHp: Math.floor(enemyHp * 0.45) || 25,
        shields: 0,
        maxShields: 0,
        x: 7,
        y: isMech ? 1 : 3,
        avatar: isMech ? "🛸" : "👮",
        image: isMech 
          ? "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600" 
          : "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
        color: "border-red-400 text-red-400",
        range: isMech ? 3 : 2,
        damage: isMech ? 8 : 10,
        ap: 2,
        maxAp: 2,
        initiative: 11,
        isDead: false
      });
    }

    const finalizedCombatants = combatants.map(c => ({
      ...c,
      statuses: [] as string[],
      overclockTurns: 0,
      glitchTurns: 0,
      corrodedTurns: 0,
      panicTurns: 0,
      stunnedTurns: 0,
      silencedTurns: 0,
      bleedTurns: 0
    }));

    const sorted = [...finalizedCombatants].sort((a, b) => b.initiative - a.initiative);
    const turnOrder = sorted.map(c => c.id);

    const interactiveObjects: GridInteractiveObject[] = [
      {
        id: "obj-battery-1",
        name: "Plasma Battery",
        type: "battery",
        x: 2,
        y: 4,
        hp: 10,
        maxHp: 10,
        isDestroyed: false,
        isHacked: false,
        avatar: "🔋",
        color: "border-amber-500 text-amber-500 bg-amber-950/20",
        description: "Unstable plasma core. Deals 30 Heavy Fire damage to all adjacent cells when destroyed."
      },
      {
        id: "obj-terminal-1",
        name: "Tech Mainframe",
        type: "terminal",
        x: 2,
        y: 1,
        hp: 20,
        maxHp: 20,
        isDestroyed: false,
        isHacked: false,
        avatar: "💻",
        color: "border-cyan-500 text-cyan-400 bg-cyan-950/20",
        description: "Local mainframe. Hackable (requires 10 MP) to siphon grid power, shocking all enemies for 20 damage and silencing them."
      },
      {
        id: "obj-shield-1",
        name: "Energy Cover",
        type: "shield_cover",
        x: 5,
        y: 3,
        hp: 30,
        maxHp: 30,
        isDestroyed: false,
        isHacked: false,
        avatar: "🛰️",
        color: "border-indigo-500 text-indigo-400 bg-indigo-950/20",
        description: "Electromagnetic cover. Activate (requires 1 AP) to grant adjacent player units +20 Shields."
      }
    ];

    return {
      combatants: finalizedCombatants,
      turnOrder,
      currentTurnIdx: 0,
      selectedAction: "move" as const,
      turnLog: `Tactical grid combat initialized. All units deployed. ${sorted[0].name} has the initiative!`,
      interactiveObjects
    };
  };

  // Sync grid combat with game state combat changes
  useEffect(() => {
    if (gameState?.combatState?.isActive && !gridCombat) {
      const combat = gameState.combatState;
      const initialGrid = initGridCombat(
        combat.enemyName,
        combat.enemyHp,
        combat.enemyMaxHp,
        combat.enemyShields,
        combat.enemyMaxShields,
        gameState.district,
        gameState.party,
        gameState.archetype
      );
      setGridCombat(initialGrid);
    } else if (!gameState?.combatState?.isActive && gridCombat) {
      setGridCombat(null);
    }
  }, [gameState?.combatState?.isActive]);

  // Check if save exists on load across all slots
  useEffect(() => {
    const keys = [
      "neon_ether_state",
      "neon_ether_state_slot1",
      "neon_ether_state_slot2",
      "neon_ether_state_slot3",
      "neon_ether_state_autosave"
    ];
    const found = keys.some(k => localStorage.getItem(k) !== null);
    if (found) {
      setHasSave(true);
    }
  }, []);

  // Ensure Vice and Tracker always use official character portraits across state updates
  useEffect(() => {
    if (!gameState) return;
    let modified = false;
    const nextCompanions = gameState.companions?.map(c => {
      if (c.name === "Vice" && c.image !== vicePortrait) {
        modified = true;
        return { ...c, image: vicePortrait };
      }
      if (c.name === "Tracker" && c.image !== trackerPortrait) {
        modified = true;
        return { ...c, image: trackerPortrait };
      }
      return c;
    });

    const nextBaseNPCs = gameState.baseNPCs?.map(n => {
      if ((n.name === "Vice" || n.id === "vice") && n.image !== vicePortrait) {
        modified = true;
        return { ...n, image: vicePortrait };
      }
      if ((n.name === "Tracker" || n.id === "tracker") && n.image !== trackerPortrait) {
        modified = true;
        return { ...n, image: trackerPortrait };
      }
      return n;
    });

    if (modified) {
      setGameState(prev => prev ? {
        ...prev,
        companions: nextCompanions || prev.companions,
        baseNPCs: nextBaseNPCs || prev.baseNPCs
      } : null);
    }
  }, [gameState?.companions, gameState?.baseNPCs]);

  // Quest definitions authored in Quest Studio own progression. World handlers
  // only emit stable completedPOIActions event keys consumed by the quest engine.
  useEffect(() => {
    if (!gameState) return;
    const synchronized = synchronizeQuestProgress(gameState);
    const progressSignature = (state: GameState) => JSON.stringify(
      (state.campaignQuestsRegistry || []).map(q => [
        q.id,
        q.status,
        q.stages.map(stage => [stage.id, stage.currentCount, stage.completed])
      ])
    );
    if (progressSignature(gameState) !== progressSignature(synchronized)) {
      setGameState(synchronized);
    }
  }, [
    gameState?.completedPOIActions?.join("|"),
    gameState?.inventory.join("|"),
    gameState?.campaignQuestsRegistry?.map(q => q.stages.map(stage => stage.completionAction || "").join(",")).join("|")
  ]);

  // Scroll to latest logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Command keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== "game" || !gameState || isLoading) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      
      const buttons = gameState.combatState?.isActive
        ? ["Physical Attack", "Spell Slash", "Cyber Hack", "Quick Item", "Attempt Flee"]
        : activePOIView 
          ? (activePOIView === "ventilation_shaft" && ventFailed
            ? ["Force Fan Blades (STR Check)", "Trigger EMP Burst (EMP Explosion!)", "Hack Fan Console (INT Check)"]
            : (MAP_POIS.find(p => p.id === activePOIView)?.buttons || []))
          : [];
        
      const keyIndex = parseInt(e.key) - 1;
      if (keyIndex >= 0 && keyIndex < buttons.length) {
        e.preventDefault();
        handleExecuteAction(buttons[keyIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, isLoading, currentScreen, activePOIView]);

  // Unified helper to restore state and logs from save structure
  const handleRestoreStateAndLogs = (state: any, savedLogs: any[]) => {
    try {
      // Clean migration of old state variables
      const isBlade = state.archetype === "Cyber-Blade";
      const isMage = state.archetype === "Techno-Mage";
      const migratedState: GameState = hydrateQuestSystem({
        district: "aurus",
        poi: "Main Headquarters (The Hideout)",
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        credits: 100,
        party: [],
        activeQuests: [],
        completedQuests: [],
        inventory: [],
        companions: [],
        combatState: null,
        archetype: "Cyber-Blade",
        level: 1,
        experience: 0,
        day: 1,
        timeOfDay: "Morning",
        attributes: {
          str: isBlade ? 14 : isMage ? 9 : 10,
          dex: isBlade ? 15 : isMage ? 11 : 13,
          int: isBlade ? 10 : isMage ? 14 : 15,
          will: isBlade ? 11 : isMage ? 12 : 11,
          eth: isBlade ? 10 : isMage ? 15 : 11,
        },
        skills: {
          cyberBlade: isBlade ? 3 : isMage ? 1 : 1,
          netSlicer: isBlade ? 1 : isMage ? 2 : 3,
          heavyChrome: isBlade ? 2 : isMage ? 1 : 1,
          mindmancer: isMage ? 1 : 0
        },
        equipment: {
          meleeWeapon: null,
          rangedWeapon: null,
          armor: null,
          headpiece: null,
          trinket: null
        },
        ...state
      });

      // Migrate old weapon slot if exists
      if (migratedState.equipment && (migratedState.equipment as any).weapon) {
        const oldWeapon = (migratedState.equipment as any).weapon;
        delete (migratedState.equipment as any).weapon;
        const details = ITEM_METADATA[oldWeapon];
        if (details && details.slot === "meleeWeapon") {
          migratedState.equipment.meleeWeapon = oldWeapon;
        } else if (details && details.slot === "rangedWeapon") {
          migratedState.equipment.rangedWeapon = oldWeapon;
        } else {
          migratedState.equipment.meleeWeapon = oldWeapon;
        }
      }

      setGameState(migratedState);
      setLogs(savedLogs);
      setActiveRegionId(migratedState.district || "aurus");
      
      // If they were at a POI, open its detailed view
      const targetPOI = MAP_POIS.find(p => p.name === migratedState.poi);
      if (targetPOI) {
        setActivePOIView(targetPOI.id);
      } else {
        setActivePOIView(null);
      }
      
      setCurrentScreen("game");
      triggerToast("VIRTUAL MEMORY STREAM RESTORED SUCCESS");
    } catch (e) {
      console.error("Failed to restore save game file", e);
      triggerToast("CRITICAL FAIL: CORRUPTED DATA DECK");
    }
  };

  // Load from LocalStorage - opens Save Deck so player can pick which slot to restore
  const handleLoadGame = () => {
    setIsSaveDeckOpen(true);
  };

  // Save changes to localStorage manually
  const handleSaveGame = () => {
    if (gameState) {
      localStorage.setItem("neon_ether_state", JSON.stringify(gameState));
      localStorage.setItem("neon_ether_logs", JSON.stringify(logs));
      setHasSave(true);
      triggerToast("NUCLEUS SAVE CHANNEL SYNCED [OK]");
    }
  };

  // Automated background save to AUTOSAVE slot
  const triggerAutosave = (state: GameState, logsList: LogMessage[]) => {
    const isEnabled = localStorage.getItem("neon_ether_autosave_enabled") !== "false";
    if (!isEnabled) return;

    try {
      const slotId = "autosave";
      const timestamp = new Date().toLocaleString();
      const metadata = {
        slotId,
        timestamp,
        playerName: state.playerName || "Kaelen",
        archetype: state.archetype || "Unknown",
        level: state.level || 1,
        credits: state.credits || 0,
        hp: state.hp || 100,
        maxHp: state.maxHp || 100,
        district: state.district || "Aurus Hideout",
        poi: state.poi || "Hideout Core",
        day: state.day || 1
      };

      localStorage.setItem(`neon_ether_state_${slotId}`, JSON.stringify(state));
      localStorage.setItem(`neon_ether_logs_${slotId}`, JSON.stringify(logsList));
      localStorage.setItem(`neon_ether_meta_${slotId}`, JSON.stringify(metadata));
      setHasSave(true);
      console.log("Autosave updated successfully");
    } catch (err) {
      console.error("Autosave failed", err);
    }
  };

  // Resets current runtime session and returns to Main Menu WITHOUT deleting save slots
  const handleResetModuleSession = () => {
    setGameState(null);
    setLogs([]);
    setActivePOIView(null);
    setActiveDialogue(null);
    setGridCombat(null);
    setCurrentScreen("menu");

    // Sync hasSave based on whether any saved slots exist in localStorage
    const keys = [
      "neon_ether_state",
      "neon_ether_state_slot1",
      "neon_ether_state_slot2",
      "neon_ether_state_slot3",
      "neon_ether_state_autosave"
    ];
    const found = keys.some(k => localStorage.getItem(k) !== null);
    setHasSave(found);

    triggerToast("SESSION RESET: RETURNED TO MAIN MENU");
  };

  // Wipe Save completely from localStorage and return to main menu
  const handleWipeAllSaves = () => {
    if (window.confirm("⚠️ CONFIRM PURGE: Are you sure you want to permanently erase all saved matrix slots?")) {
      const keys = ["slot1", "slot2", "slot3", "autosave"];
      keys.forEach(slotId => {
        localStorage.removeItem(`neon_ether_state_${slotId}`);
        localStorage.removeItem(`neon_ether_logs_${slotId}`);
        localStorage.removeItem(`neon_ether_meta_${slotId}`);
      });
      localStorage.removeItem("neon_ether_state");
      localStorage.removeItem("neon_ether_logs");
      setGameState(null);
      setLogs([]);
      setHasSave(false);
      setActivePOIView(null);
      setActiveDialogue(null);
      setGridCombat(null);
      setCurrentScreen("menu");
      triggerToast("SYSTEM PURGED: ALL SAVED MATRICES ERASED");
    }
  };

  // Skip Intro and begin Chapter 1 in Aurus Hideout base
  const handleSkipIntro = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Seed initial baseNPCs if missing
    const starterNPCs = [
      {
        id: "aria",
        name: "Chancellor Aria",
        role: "High Commander",
        avatar: "👑",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
        description: "You catch Aria standing inside your headquarters, analyzing holo-maps of the Megacity grid sectors. Clad in a dark leather officer outfit, she carries a severe authority that demands absolute discipline.",
        dialogue: "Master. It is excellent to see you. The base is operational, but we must expand our parameters. State your directives or allocate me to research protocols.",
        reaction: null,
        happiness: 80,
        affection: "Amiable",
        affectionValue: 65,
        willpower: 82,
        corruption: 39,
        hygiene: "Normal",
        discipline: 90,
        hunger: "Well-fed",
        respect: 21,
        withdrawRisk: "None",
        anger: 0,
        defiance: 0,
        fear: 0,
        inventory: ["Corpo Security Pistol", "Cheap Combat Armor"],
        currentJob: "Idle / Chilling"
      },
      {
        id: "mia",
        name: "Mia",
        role: "Base Specialist",
        avatar: "🌸",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
        description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
        dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
        reaction: null,
        happiness: 95,
        affection: "Warm",
        affectionValue: 78,
        willpower: 45,
        corruption: 10,
        hygiene: "Excellent",
        discipline: 60,
        hunger: "Satiated",
        respect: 85,
        withdrawRisk: "None",
        anger: 0,
        defiance: 5,
        fear: 15,
        inventory: ["Copper-Wire Ring"],
        currentJob: "Base Supply Chef"
      },
      {
        id: "scythe_base",
        name: "Scythe",
        role: "Security Coordinator",
        avatar: "👤",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
        description: "Scythe sits quietly on an ammo crate, field-stripping her customized monoblade. The ambient neon light reflects off her active camo plating.",
        dialogue: "Report, Boss. Perimeter sensor sweeps are green, but corporate signal sniffers are active nearby. Give me a target, or I'll run another patrol.",
        reaction: null,
        happiness: 75,
        affection: "Amiable",
        affectionValue: 50,
        willpower: 95,
        corruption: 20,
        hygiene: "Normal",
        discipline: 85,
        hunger: "Well-fed",
        respect: 75,
        withdrawRisk: "None",
        anger: 10,
        defiance: 15,
        fear: 5,
        inventory: ["Nano-alloy Katana"],
        currentJob: "Defensive Security Guard"
      }
    ];

    setGameState(prev => {
      // If gameState is not loaded (e.g. from main menu), initialize with the Cyber-Blade archetype
      let current = hydrateQuestSystem(prev || getInitialState(ARCHETYPES[0]));
      current = completeQuest(current, "prologue", false);
      current = activateQuest(current, "outcast_directive");
      
      return {
        ...current,
        district: "aurus",
        poi: "Aurus Safehouse (The Hideout)",
        stamina: 100,
        maxStamina: 100,
        credits: Math.max(current.credits, 450), // Provide test currency for gifting & testing
        baseNPCs: [],
        activeBaseNPCId: null,
        safehouseDefenses: current.safehouseDefenses || {
          securityLevel: 1,
          turrets: 0,
          shieldStrength: 100,
          fortifiedDoors: false,
          intrusionLogs: [
            "🔋 Safehouse initial power grid linked successfully.",
            "📡 Stealth frequency beacon activated - safehouse hidden from city radars."
          ]
        }
      };
    });

    setLogs(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: "⚡ NEURAL MATRIX SYNC OVERRIDE: Skip initiated. Prologue bypassed, Chapter 1 unlocked. Welcome to Aurus Base Headquarters.",
        type: "system"
      },
      ...prev
    ]);

    setActivePOIView("hideout");
    setActiveRegionId("aurus");
    setActiveDialogue(null);
    setCurrentScreen("game");
    triggerToast("CHAPTER 1 BEGUN: BASE CREW CONSOLE OPENED");
  };

  // Helper alert notifier
  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);
  };

  // Unified helper to calculate stamina loss, weather debuffs, and random weather transitions on travel
  const handleStaminaAndWeatherOnTravel = (
    state: GameState,
    isRegionChange: boolean,
    destinationName: string
  ): { nextState: GameState; warningText: string | null; logs: LogMessage[] } => {
    let nextState = { ...state };
    let logs: LogMessage[] = [];
    let warningText: string | null = null;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Calculate base cost
    let staminaCost = isRegionChange ? 15 : 8;

    // 2. Weather adjustments to stamina cost
    const activeWeather = nextState.weather || "clear";
    if (activeWeather === "rain") {
      staminaCost += 2;
    } else if (activeWeather === "snow") {
      staminaCost += 3;
    } else if (activeWeather === "storm") {
      staminaCost += 5;
    } else if (activeWeather === "heat") {
      staminaCost += 5;
    } else if (activeWeather === "smog") {
      staminaCost += 4;
    }

    // 3. Deduct stamina
    const previousStamina = nextState.stamina;
    nextState.stamina = Math.max(0, nextState.stamina - staminaCost);
    const finalStamina = nextState.stamina;

    const logsText: string[] = [];
    logsText.push(`🔋 STAMINA DECREASED: Consumed ${staminaCost} stamina points during transit to "${destinationName}" (Remaining: ${finalStamina}/100).`);

    // 4. Apply weather debuffs on health/mana
    if (activeWeather === "smog") {
      // Holographic smog drains HP and Mana due to toxic exposure
      nextState.hp = Math.max(5, nextState.hp - 3);
      nextState.mana = Math.max(0, nextState.mana - 3);
      logsText.push(`😷 TOXIC SMOG INHALED: Severe neon pollution in area. Suffered minor organic degradation: -3 HP, -3 Ether.`);
    } else if (activeWeather === "heat") {
      // Extreme heat has 25% chance of applying minor damage or dehydrating
      if (Math.random() < 0.3) {
        nextState.hp = Math.max(5, nextState.hp - 5);
        logsText.push(`🥵 HEATSTROKE WARNING: Core temperatures exceeded safe limits during transit through thermal zones: -5 HP.`);
      }
    } else if (activeWeather === "storm") {
      // Static discharges
      if (Math.random() < 0.25) {
        nextState.hp = Math.max(5, nextState.hp - 4);
        logsText.push(`⚡ LIGHTNING STATIC STRIKE: Ambient magnetic storms caused static discharge into neural implants: -4 HP.`);
      }
    } else if (activeWeather === "snow") {
      // Chilled / acidic frost reduces active Mana slightly
      nextState.mana = Math.max(0, nextState.mana - 2);
      logsText.push(`❄️ ACID FROST COOLING: Severe cybernetic temperature drop. Drained minor neural energy: -2 Ether.`);
    }

    // 5. Check if stamina has reached 0
    if (finalStamina === 0 && previousStamina > 0) {
      warningText = "⚠️ SYSTEM BLACKOUT: Your stamina is fully depleted! You are severely exhausted. Return to the Safehouse to rest/sleep.";
      logsText.push(`🚨 CRITICAL EMERGENCY: Stamina depleted to 0%. Locomotor and hacking modules locked in Safe Mode. You cannot perform further operations until you Rest/Sleep at Aurus Safehouse!`);
    }

    // 6. Roll for new weather (45% chance on travel/region change)
    if (Math.random() < 0.45) {
      const weatherPool: ("clear" | "rain" | "snow" | "storm" | "heat" | "smog")[] = [
        "clear", "clear", "rain", "snow", "storm", "heat", "smog"
      ];
      const newWeather = weatherPool[Math.floor(Math.random() * weatherPool.length)];
      if (newWeather !== activeWeather) {
        nextState.weather = newWeather;
        const weatherNames = {
          clear: "Clear/Optimal Skies ☀️",
          rain: "Acid Rain Storm 🌧️ (+2 Stamina Drain)",
          snow: "Neon Frost Snow ❄️ (+3 Stamina Drain, -2 Ether on Travel)",
          storm: "Magnetic Lightning Storm ⚡ (+5 Stamina Drain, Static Strike Risk)",
          heat: "Thermal Overheat waves 🥵 (+5 Stamina Drain, Dehydration Risk)",
          smog: "Toxic Holographic Smog 😷 (+4 Stamina Drain, -3 HP/-3 Ether on Travel)"
        };
        logsText.push(`🌤️ WEATHER CORRIDOR UPDATE: Climatology grid shifted. Current conditions: ${weatherNames[newWeather]}.`);
      }
    }

    // 7. Corporate Notoriety Check: Random ambushes disabled in favor of scripted encounters.
    // (Ares corporate notoriety ambushes disabled)

    // Transform logsText array into LogMessage structures
    logsText.forEach(txt => {
      logs.push({
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: txt,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      });
    });

    return { nextState, warningText, logs };
  };

  // Deploy fresh agent from archetype select
  const handleDeployAgent = async () => {
    setIsLoading(true);
    const initial = hydrateQuestSystem(getInitialState(selectedArchetype));
    
    // Set custom properties
    initial.playerName = customName.trim() || "Kaelen";
    initial.playerAge = customAge;
    initial.playerRace = customRace;
    initial.playerAvatarUrl = customAvatarUrl;
    initial.playerBackground = customBackground;
    initial.playerPerks = [...selectedPerks, ...getPerksForLevel(initial.level || 1)];
    
    // Establish base attributes
    const baseAttrs = { ...initial.attributes };
    
    // Add player's distributed stat points
    baseAttrs.str = (baseAttrs.str || 10) + addedStats.str;
    baseAttrs.dex = (baseAttrs.dex || 10) + addedStats.dex;
    baseAttrs.int = (baseAttrs.int || 10) + addedStats.int;
    baseAttrs.will = (baseAttrs.will || 10) + addedStats.will;
    baseAttrs.eth = (baseAttrs.eth || 10) + addedStats.eth;

    // Apply selected starting perks stat bonuses
    if (selectedPerks.includes("Genius")) {
      baseAttrs.int = (baseAttrs.int || 10) + 2;
    }
    if (selectedPerks.includes("Iron Will")) {
      baseAttrs.will = (baseAttrs.will || 10) + 2;
    }
    if (selectedPerks.includes("Shadow Operative")) {
      baseAttrs.dex = (baseAttrs.dex || 10) + 1;
    }
    if (selectedPerks.includes("Heavy Hitter")) {
      baseAttrs.str = (baseAttrs.str || 10) + 1;
    }
    if (selectedPerks.includes("Apex Reflexes")) {
      baseAttrs.dex = (baseAttrs.dex || 10) + 2;
    }
    if (selectedPerks.includes("Technomancer Catalyst")) {
      baseAttrs.eth = (baseAttrs.eth || 10) + 1;
    }
    if (selectedPerks.includes("Hardened Chassis")) {
      initial.maxHp = (initial.maxHp || 100) + 30;
      initial.hp = initial.maxHp;
    }
    if (selectedPerks.includes("Street Smart")) {
      initial.credits += 30;
    }
    if (selectedPerks.includes("Lucky Jack")) {
      initial.credits += 40;
    }
    
    // Apply Race stat modifiers
    if (customRace === "Human") {
      baseAttrs.str += 1;
      baseAttrs.dex += 1;
    } else if (customRace === "Cyborg") {
      baseAttrs.dex += 2;
      baseAttrs.int += 1;
      baseAttrs.will -= 1;
    } else if (customRace === "Mutant") {
      baseAttrs.str += 2;
      baseAttrs.eth += 2;
      baseAttrs.int -= 2;
    } else if (customRace === "Elf" || customRace === "Neuro-Elf") {
      baseAttrs.int += 2;
      baseAttrs.will += 2;
      baseAttrs.str -= 1;
    } else if (customRace === "Dwarf" || customRace === "Chrome-Dwarf") {
      baseAttrs.str += 2;
      baseAttrs.will += 2;
      baseAttrs.dex -= 1;
    }
    
    // Apply Background modifiers
    if (customBackground === "Street Rat") {
      initial.credits += 20;
      baseAttrs.dex += 1;
    } else if (customBackground === "Ex-Corp Agent") {
      initial.credits += 50;
      initial.maxHp = Math.max(40, (initial.maxHp || 100) - 10);
      initial.hp = initial.maxHp;
      baseAttrs.int += 1;
    } else if (customBackground === "Glitched Specimen") {
      initial.maxHp = (initial.maxHp || 100) + 20;
      initial.hp = initial.maxHp;
      initial.credits = Math.max(10, initial.credits - 30);
      baseAttrs.str += 1;
      baseAttrs.eth += 1;
    } else if (customBackground === "Grid Drifter") {
      baseAttrs.str += 1;
      baseAttrs.will += 1;
    }
    
    initial.attributes = baseAttrs;
    
    const welcomeLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `DEPLOYED AGENT [${initial.playerName}] (${customRace} ${selectedArchetype.name}) into Megacity-9 slums. Background: ${customBackground}. Cognitive passives fully integrated. Initial gear established: ${initial.inventory.join(", ")}. Primary credits balance: ${initial.credits}¤.\n\nYour organic cybernetic cortex aligns with sol-prime parameters. The neon glow hums underneath your heels.\n\nSelect districts on the overland map to scan. Enter POIs to trigger local interaction consoles.`,
      type: "system",
      district: initial.district,
      poi: initial.poi
    };

    setLogs([welcomeLog]);
    setGameState(initial);
    setActiveRegionId("conduit09");
    setActivePOIView("ventilation_shaft"); // Start initialized right inside the Ventilation Shaft detailed view!
    setCurrentScreen("intro_story");
    setIsLoading(false);
  };

  // Switch active region of the map
  const handleSwitchRegion = (regionId: string) => {
    const reg = REGIONS.find(r => r.id === regionId);
    if (!reg || !gameState) return;

    // Check if player is currently in the prologue
    if (["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district)) {
      triggerToast("SYSTEM ERROR: LOCAL COGNITIVE BOUNDS ENGAGED - HEIST IN PROGRESS");
      return;
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (gameState.stamina <= 0) {
      let collapseState = { ...gameState };
      collapseState.stamina = collapseState.maxStamina || 100;
      collapseState.hp = Math.max(collapseState.hp, 25);
      collapseState.district = "aurus";
      collapseState.poi = "Main Headquarters (The Hideout)";
      setActiveRegionId("aurus");
      setActivePOIView("hideout");
      
      setGameState(collapseState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `🚨 NEURAL BLACKOUT ON TRANSIT: You attempted to initiate monorail transit with 0/100 Stamina. Your motor processors shut down on the platform. The transit security system triggered your recovery beacon, returning you to the Aurus Safehouse to stabilize. Stamina fully restored.`,
          type: "system",
          district: "aurus",
          poi: "Main Headquarters (The Hideout)"
        }
      ]);
      triggerToast("EXHAUSTED: Returned to Safehouse");
      return;
    }

    let nextState = { ...gameState };
    nextState.district = regionId;
    nextState.poi = "Transit Node";
    
    setActiveRegionId(regionId);
    setActivePOIView(null);

    // Deduct stamina and process weather consequences
    const travelResult = handleStaminaAndWeatherOnTravel(nextState, true, reg.name);
    nextState = travelResult.nextState;

    if (nextState.stamina <= 0) {
      nextState.stamina = nextState.maxStamina || 100;
      nextState.hp = Math.max(nextState.hp, 25);
      nextState.district = "aurus";
      nextState.poi = "Main Headquarters (The Hideout)";
      setActiveRegionId("aurus");
      setActivePOIView("hideout");
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `🚨 NEURAL BLACKOUT ON TRANSIT: Your stamina hit 0% during travel to ${reg.name}. You collapsed on the platform. Your emergency recovery beacon returned you to the Aurus Safehouse, restoring your systems.`,
          type: "system",
          district: "aurus",
          poi: "Main Headquarters (The Hideout)"
        }
      ]);
      triggerToast("EXHAUSTED: Returned to Safehouse");
      return;
    }

    setGameState(nextState);

    const log: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: timeString,
      text: `[TRANSIT CHANNEL OPEN]: Deployed magnetic monorail to ${reg.name}. Scanning regional coordinate nodes...`,
      type: "system",
      district: regionId,
      poi: "Transit Node"
    };
    const updatedLogs: LogMessage[] = [...logs, log, ...travelResult.logs];
    setLogs(updatedLogs);
    triggerAutosave(nextState, updatedLogs);

    if (travelResult.warningText) {
      triggerToast(travelResult.warningText);
    }
  };

  // Interactive local actions calculation
  const handleExecuteAction = async (actionText: string) => {
    if (!gameState || isLoading || !actionText.trim()) return;
    
    setIsLoading(true);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add command to log list
    const actionLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: timeString,
      text: `> ${actionText}`,
      type: "action",
      district: gameState.district,
      poi: gameState.poi
    };

    setLogs(prev => [...prev, actionLog]);
    
    // Short artificial delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let nextState = { ...gameState };
    if (!nextState.completedPOIActions) {
      nextState.completedPOIActions = [];
    }
    let narrative = "";
    let logType: LogMessage["type"] = "narration";

    const cleanAction = actionText.toLowerCase();

    const isRestAction = cleanAction.includes("rest & recover") || cleanAction.includes("rest and sleep");
    const isEmergencyAdrenaline = cleanAction.includes("emergency adrenaline dose");
    const isEmergencyGrate = cleanAction.includes("heavy rest on back-alley grate");
    const isFastTravelHome = cleanAction.includes("fast-travel home to sleep");
    const isEmergency = isEmergencyAdrenaline || isEmergencyGrate || isFastTravelHome;

    // 1. Stamina depletion guard: block standard actions if stamina is 0 and it's not a rest/emergency/combat action
    if (gameState.stamina <= 0 && !isRestAction && !isEmergency && !gameState.combatState?.isActive) {
      const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
      if (!isPrologue) {
        let collapseState = { ...gameState };
        collapseState.stamina = collapseState.maxStamina || 100;
        collapseState.hp = Math.max(collapseState.hp, 25);
        collapseState.district = "aurus";
        collapseState.poi = "Main Headquarters (The Hideout)";
        setActiveRegionId("aurus");
        setActivePOIView("hideout");
        
        setGameState(collapseState);
        setLogs(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            timestamp: timeString,
            text: `🚨 EMERGENCY EVACUATION: Your systems are completely exhausted (0/100 Stamina). To prevent critical hardware failure, your auto-beacon has returned you to the Aurus Safehouse bunk and fully restored your Stamina.`,
            type: "system",
            district: "aurus",
            poi: "Main Headquarters (The Hideout)"
          }
        ]);
        triggerToast("EXHAUSTED: Returned to Safehouse");
        setIsLoading(false);
        return;
      } else {
        // In prologue, they cannot go back to Aurus Safehouse since they are in a linear sequence
        // Let's give them some stamina so they don't get stuck in the prologue!
        let prologueState = { ...gameState };
        prologueState.stamina = 50; // Give them a second wind in the prologue
        setGameState(prologueState);
        setLogs(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            timestamp: timeString,
            text: `🔋 SECOND WIND: Neural modules overloaded! Companion Vice overrides your cyberdeck constraints, injecting an emergency backup recharge: +50 Stamina.`,
            type: "system",
            district: gameState.district,
            poi: gameState.poi
          }
        ]);
        triggerToast("Prologue Second Wind: +50 Stamina");
        setIsLoading(false);
        return;
      }
    }

    // 2. Handle Emergency actions
    if (isEmergency) {
      if (isEmergencyAdrenaline) {
        if (nextState.credits >= 25) {
          nextState.credits -= 25;
          nextState.stamina = Math.min(100, nextState.stamina + 40);
          narrative = `💉 ADRENALINE DEPOT UNLEASHED: Injected an emergency military-grade adrenaline serum into your spinal port (-25¤). Neural stamina recharged to ${nextState.stamina}/100. Let's move!`;
          triggerToast("Injected Adrenaline: +40 Stamina");
        } else {
          narrative = `❌ INSUFFICIENT FUNDS: An Emergency Adrenaline Dose requires 25¤. Your current balance is ${nextState.credits}¤.`;
          triggerToast("Insufficient Credits!");
        }
      } else if (isEmergencyGrate) {
        const hpLoss = 10;
        if (nextState.hp > 12) {
          nextState.hp -= hpLoss;
          nextState.stamina = Math.min(100, nextState.stamina + 20);
          narrative = `💤 UNCOMFORTABLE BACK-ALLEY INTERMISSION: Rested on a vibrating hot-steam ventilation grate under radioactive neon pollution. Recharged +20 Stamina, but sustained severe body chassis soreness and toxic exposure: -${hpLoss} HP. Current Stamina: ${nextState.stamina}/100, HP: ${nextState.hp}/${nextState.maxHp}.`;
          triggerToast("Took Back-Alley Nap: +20 Stamina, -10 HP");
        } else {
          narrative = `❌ CRITICAL HP WARNING: Your health (${nextState.hp} HP) is too low to safely sleep on the contaminated back-alley grates. You would not survive the toxic exposure!`;
          triggerToast("HP Too Low to Sleep on Grates!");
        }
      } else if (isFastTravelHome) {
        if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
          narrative = `❌ TRANSIT ERROR: Cognitive bounds engaged. Heist operations are in progress; fast travel is blocked.`;
          triggerToast("Fast Travel Blocked!");
        } else {
          // Perform home sleep
          nextState.district = "aurus";
          nextState.poi = "Aurus Safehouse (The Hideout)";
          setActiveRegionId("aurus");
          setActivePOIView("hideout");
          
          nextState.hp = nextState.maxHp;
          nextState.mana = nextState.maxMana;
          nextState.stamina = nextState.maxStamina; // FULL REPLENISH!
          nextState.weather = "clear"; // RESET WEATHER!
          nextState.timeOfDay = "Morning";
          nextState.day += 1;

          let passiveText = "";
          
          // Core companion node wages
          let totalWage = 0;
          nextState.companions.forEach(c => {
            if (c.status === "working") totalWage += 35;
          });
          if (totalWage > 0) {
            nextState.credits += totalWage;
            passiveText += `\n\n💎 CREW HARVEST DECK: Hired mercenaries delivered automated sub-node payout: +${totalWage}¤.`;
          }

          // Base Crew Jobs Passive Production
          const baseNPCsList = nextState.baseNPCs || [];

          // Hacker Network Operators
          const hackerCount = baseNPCsList.filter(n => n.currentJob === "Hacker Network Operator").length;
          if (hackerCount > 0) {
            const earnings = hackerCount * 45;
            nextState.credits += earnings;
            passiveText += `\n\n💻 HACKER NETWORK INCOME: ${hackerCount} base operator(s) tapped corporate bank sub-nodes: +${earnings}¤ deposited.`;
          }

          // Base Supply Chefs (with Luxury Kitchen support)
          const chefCount = baseNPCsList.filter(n => n.currentJob === "Base Supply Chef").length;
          if (chefCount > 0) {
            const isKitchenUpgraded = nextState.safehouseUpgrades?.kitchenUpgraded;
            const mealsPerChef = isKitchenUpgraded ? 2 : 1;
            const totalMeals = chefCount * mealsPerChef;
            for (let i = 0; i < totalMeals; i++) {
              nextState.inventory.push("Synthetic Nutrient Plate");
            }
            passiveText += `\n\n🍗 CHEF KITCHEN BATCH: ${chefCount} base chef(s) prepped ${totalMeals} hot meals ${isKitchenUpgraded ? "[Luxury Kitchen x2 Boost!]" : ""}: placed in stash.`;
          }

          // Dojo Training Coaches (with Dojo Mat Expansion support)
          const coachCount = baseNPCsList.filter(n => n.currentJob === "Dojo Training Coach").length;
          const isDojoUpgraded = nextState.safehouseUpgrades?.dojoUpgraded;
          if (coachCount > 0 || isDojoUpgraded) {
            nextState.dojoBuffActive = true;
            const bonusPct = isDojoUpgraded ? "+30%" : "+15%";
            passiveText += `\n\n⚔️ DOJO TRAINING CALIBRATION: Dojo coaches & automated combat mats fine-tuned your blades: granted ${bonusPct} Melee damage for your next combat encounter!`;
          }

          // Process Crew Infiltration & Recon Sub-Grid Missions
          if (nextState.crewMissions && nextState.crewMissions.length > 0) {
            const remainingMissions: typeof nextState.crewMissions = [];
            for (const mission of nextState.crewMissions) {
              const updatedMission = { ...mission, turnsLeft: mission.turnsLeft - 1 };
              const targetNPC = (nextState.baseNPCs || []).find(n => n.id === mission.npcId);
              const npcName = targetNPC ? targetNPC.name : "Your operator";

              if (updatedMission.turnsLeft <= 0) {
                // Resolve mission outcome!
                // Risk-based roll (low: 10%, medium: 25%, high: 45%)
                const riskVal = mission.risk.toLowerCase();
                const riskPct = riskVal === "high" ? 0.45 : riskVal === "medium" ? 0.25 : 0.10;
                const gotInjured = Math.random() < riskPct;

                if (gotInjured) {
                  // NPC injured
                  if (targetNPC) {
                    targetNPC.injuryStatus = "Wounded";
                    targetNPC.happiness = Math.max(0, targetNPC.happiness - 25);
                    targetNPC.dialogue = "Ugh... they detected my signature during the sub-grid run. It was a setup! I need medical attention in the hideout bunk.";
                    targetNPC.currentJob = "Idle / Chilling";
                  }
                  nextState.inventory.push("High-Grade Scrap Salvage");
                  passiveText += `\n\n⚠️ INFILTRATION ALERT: ${npcName} triggered alarms on the run to ${mission.missionName}! They returned wounded and bleeding. Managed to drag back 1x 'High-Grade Scrap Salvage' but needs rest.`;
                  triggerToast(`${npcName} returned WOUNDED from mission!`);
                } else {
                  // Mission succeeded cleanly!
                  let rewardsText = "";
                  if (mission.missionId === "matrix_decrypt") {
                    nextState.credits += 120;
                    nextState.inventory.push("Encrypted Decrypt Key");
                    rewardsText = "120¤ and 1x 'Encrypted Decrypt Key'";
                  } else if (mission.missionId === "cargo_raid") {
                    nextState.credits += 220;
                    nextState.inventory.push("Synthetic Nutrient Plate");
                    nextState.inventory.push("High-Grade Scrap Salvage");
                    rewardsText = "220¤, 1x 'Synthetic Nutrient Plate', and 1x 'High-Grade Scrap Salvage'";
                  } else {
                    // apex_infiltration
                    nextState.credits += 450;
                    nextState.inventory.push("Deluxe Combat Stimulant");
                    nextState.inventory.push("Heavy Sentry Blueprint");
                    rewardsText = "450¤, 1x 'Deluxe Combat Stimulant', and 1x 'Heavy Sentry Blueprint'";
                  }

                  if (targetNPC) {
                    targetNPC.injuryStatus = "Healthy";
                    targetNPC.happiness = Math.min(100, targetNPC.happiness + 15);
                    targetNPC.dialogue = "System bypassed! Core sub-nodes downloaded successfully, commander. The rewards have been delivered to stash.";
                    targetNPC.currentJob = "Idle / Chilling";
                  }

                  passiveText += `\n\n📟 MISSION SUCCESS: ${npcName} bypassed all corporate ice blocks at ${mission.missionName}! Delivered ${rewardsText} to your safehouse stash.`;
                  triggerToast(`${npcName} COMPLETED Sub-Grid Run!`);
                }
              } else {
                remainingMissions.push(updatedMission);
                passiveText += `\n\n📡 SUB-GRID RUN IN PROGRESS: ${npcName} is active in cyberspace bypassing nodes at ${mission.missionName} (${updatedMission.turnsLeft} turns left).`;
              }
            }
            nextState.crewMissions = remainingMissions;
          }

          narrative = `🚀 TELEPORTED HOME & SLEPT: Triggered emergency secure beacon. Recalled to Aurus Safehouse. You immediately collapsed onto your medical bunk and fell into a deep dreamless sleep. Woke up refreshed the next morning: Stamina and Vitals fully restored to 100%! Weather is now Clear.${passiveText}`;
          triggerToast("Returned Home and Slept: 100% restored!");
        }
      }

      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: narrative,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      setIsLoading(false);
      return;
    }

    // 3. Deduct stamina for executing a standard action if we're not in combat, not a region switch, and not resting
    const isRegionSwitch = cleanAction.includes("switch region");
    if (!gameState.combatState?.isActive && !isRestAction && !isRegionSwitch) {
      let actionStaminaCost = 5;
      const activeWeather = nextState.weather || "clear";
      if (activeWeather === "rain") actionStaminaCost += 1;
      else if (activeWeather === "snow") actionStaminaCost += 2;
      else if (activeWeather === "storm" || activeWeather === "heat" || activeWeather === "smog") actionStaminaCost += 3;

      nextState.stamina = Math.max(0, nextState.stamina - actionStaminaCost);
    }

    // ---- REGION SWITCH TRANSLATION PASS ----
    if (cleanAction.includes("switch region:") || cleanAction.includes("switch region")) {
      setIsLoading(false);
      if (cleanAction.includes("docks")) handleSwitchRegion("docks");
      else if (cleanAction.includes("downtown")) handleSwitchRegion("downtown");
      else if (cleanAction.includes("satoshi")) handleSwitchRegion("satoshi");
      else if (cleanAction.includes("aurus")) handleSwitchRegion("aurus");
      return;
    }

    // ---- LIVE CAMPAIGN QUEST DIRECTOR RUNTIME HOOK ----
    if (actionText.startsWith("[QUEST:") || cleanAction.includes("[quest:")) {
      const match = actionText.match(/\[QUEST:\s*([^\]]+)\]\s*(.*)/);
      if (match) {
        const idsPart = match[1].trim();
        const labelPart = match[2].trim();
        const parts = idsPart.split(":");
        const questId = parts[0];
        const stageId = parts[1];
        const pathId = parts[2];

        const registry = buildQuestCatalog(nextState.campaignQuestsRegistry || []);
        nextState.campaignQuestsRegistry = registry;
        const quest = registry.find(q => q.id === questId);
        if (quest) {
          const stage = quest.stages?.find(s => s.id === stageId || !s.completed);
          if (stage) {
            const path = stage.operationalPaths?.find(p => p.id === pathId);
            
            // Execute Check if defined
            let checkPassed = true;
            let rollText = "";
            if (path && path.checkType && path.checkType !== "none") {
              const req = path.checkValue || 10;
              if (path.checkType === "int") {
                const stat = nextState.attributes?.int || 10;
                const d20 = Math.floor(Math.random() * 20) + 1;
                const total = stat + d20;
                checkPassed = total >= req;
                rollText = `[INT Check: 1d20(${d20}) + ${stat} = ${total} vs DC ${req}]`;
              } else if (path.checkType === "str") {
                const stat = nextState.attributes?.str || 10;
                const d20 = Math.floor(Math.random() * 20) + 1;
                const total = stat + d20;
                checkPassed = total >= req;
                rollText = `[STR Check: 1d20(${d20}) + ${stat} = ${total} vs DC ${req}]`;
              } else if (path.checkType === "dex") {
                const stat = nextState.attributes?.dex || 10;
                const d20 = Math.floor(Math.random() * 20) + 1;
                const total = stat + d20;
                checkPassed = total >= req;
                rollText = `[DEX Check: 1d20(${d20}) + ${stat} = ${total} vs DC ${req}]`;
              } else if (path.checkType === "will") {
                const stat = nextState.attributes?.will || 10;
                const d20 = Math.floor(Math.random() * 20) + 1;
                const total = stat + d20;
                checkPassed = total >= req;
                rollText = `[WILL Check: 1d20(${d20}) + ${stat} = ${total} vs DC ${req}]`;
              } else if (path.checkType === "mindmancer") {
                checkPassed = !!nextState.mindmancerUnlocked;
                rollText = checkPassed ? `[Mindmancer Telepathic Override: Active]` : `[Mindmancer: Locked]`;
              } else if (path.checkType === "credits") {
                if (nextState.credits >= req) {
                  nextState.credits -= req;
                  checkPassed = true;
                  rollText = `[Bribe Paid: -${req}¤ Credits]`;
                } else {
                  checkPassed = false;
                  rollText = `[Insufficient Credits: need ${req}¤]`;
                }
              } else if (path.checkType === "item") {
                const hasItem = path.requiredItem ? nextState.inventory.includes(path.requiredItem) : true;
                checkPassed = hasItem;
                rollText = `[Required Item: ${path.requiredItem || "Item"}]`;
              }
            }

            if (checkPassed) {
              // Grant path bonus rewards
              let bonusText = "";
              if (path?.grantsBonusXP) {
                nextState.experience = (nextState.experience || 0) + path.grantsBonusXP;
                bonusText += ` +${path.grantsBonusXP} XP`;
              }
              if (path?.grantsBonusCredits) {
                nextState.credits = (nextState.credits || 0) + path.grantsBonusCredits;
                bonusText += ` +${path.grantsBonusCredits}¤`;
              }
              if (path?.grantsBonusItem) {
                nextState.inventory.push(path.grantsBonusItem);
                bonusText += ` +Item '${path.grantsBonusItem}'`;
              }

              nextState = advanceQuestStage(nextState, quest.id, stage.id);
              const advancedQuest = nextState.campaignQuestsRegistry?.find(item => item.id === quest.id);
              const allStagesDone = !!advancedQuest?.stages.every(item => item.completed);
              if (allStagesDone) {
                nextState = completeQuest(nextState, quest.id);
                narrative = `🏆 CAMPAIGN QUEST COMPLETED: "${quest.title}"!\n\n${path?.outcomeDesc || stage.description}${bonusText ? `\n\nPath rewards:${bonusText}` : ""}`;
                triggerToast(`QUEST COMPLETED: ${quest.title}!`);
              } else {
                narrative = `⚡ CAMPAIGN DIRECTIVE ADVANCED: [${quest.title} - ${stage.title}]\n\n${path?.outcomeDesc || stage.description} ${rollText}${bonusText ? `\n\nBonus Rewards:${bonusText}` : ""}`;
                triggerToast(`OBJECTIVE ADVANCED: ${stage.title}`);
              }
            } else {
              narrative = `❌ TACTICAL CHECK FAILED: ${rollText}\n\nYour attempt was deflected by the perimeter defenses. Re-assess your approach and try an alternative operational route.`;
              triggerToast(`Check Failed: ${rollText}`);
            }

            setGameState(nextState);
            const finalLog: LogMessage = {
              id: crypto.randomUUID(),
              timestamp: timeString,
              text: narrative,
              type: "action",
              district: nextState.district,
              poi: nextState.poi
            };
            const updatedLogs = [...logs, finalLog];
            setLogs(updatedLogs);
            triggerAutosave(nextState, updatedLogs);
            setIsLoading(false);
            return;
          }
        }
      }
    }

    // ---- COMBAT ACTIONS RESOLUTION ----
    if (gameState.combatState?.isActive) {
      const combat = { ...gameState.combatState };

      if (cleanAction.includes("physical attack") || cleanAction.includes("strike") || cleanAction.includes("blade")) {
        let pDmg = Math.floor(Math.random() * 11) + 15; // 15-25 base
        
        if (nextState.inventory.includes("Apex Mantis electro-blade")) {
          pDmg += 25;
        }
        if (nextState.inventory.includes("Smart-Targeting Visor")) {
          pDmg += 12;
        }

        let buffText = "";
        if (nextState.dojoBuffActive) {
          const isDojoUpgraded = nextState.safehouseUpgrades?.dojoUpgraded;
          const pct = isDojoUpgraded ? 0.30 : 0.15;
          const bonus = Math.floor(pDmg * pct);
          pDmg += bonus;
          buffText = isDojoUpgraded ? " [Dojo Buff +30%]" : " [Dojo Buff +15%]";
        }

        // --- Optical HUDs Critical Hit Check ---
        let hudText = "";
        if (nextState.installedCyberware?.includes("Optical HUDs") && Math.random() < 0.25) {
          pDmg = Math.floor(pDmg * 1.5);
          hudText = " ⚡CRITICAL OVERDRIVE!⚡";
        }

        // --- Weapon Mod Damage Check ---
        let modText = "";
        const equippedMelee = nextState.equipment?.meleeWeapon;
        if (equippedMelee && nextState.weaponMods?.[equippedMelee]) {
          const mod = nextState.weaponMods[equippedMelee];
          const enemyLower = combat.enemyName.toLowerCase();
          
          let modDmg = 12;
          let isVulnerable = false;
          
          if (mod === "Toxic Vials") {
            if (enemyLower.includes("corporate") || enemyLower.includes("ares") || enemyLower.includes("enforcer") || enemyLower.includes("officer") || enemyLower.includes("commander")) {
              modDmg = 25;
              isVulnerable = true;
            }
            pDmg += modDmg;
            modText = isVulnerable 
              ? ` 🧪 [Toxic Vials EXPLOIT: +${modDmg} Acid Damage! Melted Corporate Armor!]`
              : ` 🧪 [Toxic Vials: +${modDmg} Acid Damage]`;
          } else if (mod === "Bio-Shocks") {
            if (enemyLower.includes("mutant") || enemyLower.includes("sludge") || enemyLower.includes("behemoth") || enemyLower.includes("beast") || enemyLower.includes("orc")) {
              modDmg = 25;
              isVulnerable = true;
            }
            pDmg += modDmg;
            modText = isVulnerable 
              ? ` ⚡ [Bio-Shocks EXPLOIT: +${modDmg} Electric Shock! Disrupted Bio-systems!]`
              : ` ⚡ [Bio-Shocks: +${modDmg} Shock Damage]`;
          } else if (mod === "Electromagnetic Chambers") {
            if (enemyLower.includes("drone") || enemyLower.includes("sentinel") || enemyLower.includes("mech") || enemyLower.includes("robotic") || enemyLower.includes("autonomous") || enemyLower.includes("mainframe") || enemyLower.includes("terminal")) {
              modDmg = 25;
              isVulnerable = true;
            }
            pDmg += modDmg;
            modText = isVulnerable 
              ? ` 🌐 [EMP Chamber EXPLOIT: +${modDmg} Electromagnetic Burst! Short-circuited Robotic Sensors!]`
              : ` 🌐 [EMP Chamber: +${modDmg} EMP Damage]`;
          } else if (mod === "Plasma Heat Coil") {
            if (enemyLower.includes("corporate") || enemyLower.includes("ares") || enemyLower.includes("enforcer") || enemyLower.includes("officer") || enemyLower.includes("commander") || enemyLower.includes("drone") || enemyLower.includes("sentinel") || enemyLower.includes("mech")) {
              modDmg = 25;
              isVulnerable = true;
            }
            pDmg += modDmg;
            modText = isVulnerable 
              ? ` 🔥 [Plasma Heat Coil EXPLOIT: +${modDmg} Plasma Heat! Melted Heavy Defense Layers!]`
              : ` 🔥 [Plasma Heat Coil: +${modDmg} Plasma Damage]`;
          } else if (mod === "Cryo-Fluid Injector") {
            if (enemyLower.includes("mutant") || enemyLower.includes("sludge") || enemyLower.includes("behemoth") || enemyLower.includes("beast") || enemyLower.includes("orc")) {
              modDmg = 25;
              isVulnerable = true;
            }
            pDmg += modDmg;
            modText = isVulnerable 
              ? ` ❄️ [Cryo-Fluid Injector EXPLOIT: +${modDmg} Cryo Freeze! Brittle Armor Shattered!]`
              : ` ❄️ [Cryo-Fluid Injector: +${modDmg} Cryo Damage]`;
          } else if (mod === "Nano-Laser Sight") {
            modDmg = 18;
            pDmg += modDmg;
            modText = ` 🎯 [Nano-Laser Sight: +${modDmg} Piercing Laser Damage]`;
          }
        }

        if (combat.enemyShields > 0) {
          const rem = combat.enemyShields - pDmg;
          if (rem < 0) {
            combat.enemyShields = 0;
            combat.enemyHp += rem;
          } else {
            combat.enemyShields = rem;
          }
        } else {
          combat.enemyHp -= pDmg;
        }

        narrative = `⚔️ STRIKE RETALIATED: You flash your blade into ${combat.enemyName}! Dealt ${pDmg} physical damage.${buffText}${hudText}${modText}`;
      }
      else if (cleanAction.includes("spell slash") || cleanAction.includes("spend mp") || cleanAction.includes("plasma")) {
        if (nextState.mana < 15) {
          narrative = "⚠️ COGNITIVE STABLE FAULT: Insufficient ETHER flow. Your spell fizzled! (-0 Mana)";
        } else {
          nextState.mana -= 15;
          let mDmg = Math.floor(Math.random() * 16) + 30; // 30-45
          if (nextState.inventory.includes("Coven Ether-deck v3")) {
            mDmg = Math.floor(mDmg * 1.35);
          }

          // --- Optical HUDs Critical Check ---
          let hudText = "";
          if (nextState.installedCyberware?.includes("Optical HUDs") && Math.random() < 0.25) {
            mDmg = Math.floor(mDmg * 1.5);
            hudText = " ⚡CRITICAL OVERDRIVE!⚡";
          }

          // --- Weapon Mod Damage Check (Spell focus/weapon mod) ---
          let modText = "";
          const equippedMelee = nextState.equipment?.meleeWeapon;
          const equippedRanged = nextState.equipment?.rangedWeapon;
          const activeWeapon = equippedMelee || equippedRanged;
          if (activeWeapon && nextState.weaponMods?.[activeWeapon]) {
            const mod = nextState.weaponMods[activeWeapon];
            const enemyLower = combat.enemyName.toLowerCase();
            
            let modDmg = 12;
            let isVulnerable = false;
            
            if (mod === "Toxic Vials") {
              if (enemyLower.includes("corporate") || enemyLower.includes("ares") || enemyLower.includes("enforcer") || enemyLower.includes("officer") || enemyLower.includes("commander")) {
                modDmg = 25;
                isVulnerable = true;
              }
              mDmg += modDmg;
              modText = isVulnerable 
                ? ` 🧪 [Toxic Vials EXPLOIT: +${modDmg} Acid Damage! Melted Corporate Armor!]`
                : ` 🧪 [Toxic Vials: +${modDmg} Acid Damage]`;
            } else if (mod === "Bio-Shocks") {
              if (enemyLower.includes("mutant") || enemyLower.includes("sludge") || enemyLower.includes("behemoth") || enemyLower.includes("beast") || enemyLower.includes("orc")) {
                modDmg = 25;
                isVulnerable = true;
              }
              mDmg += modDmg;
              modText = isVulnerable 
                ? ` ⚡ [Bio-Shocks EXPLOIT: +${modDmg} Electric Shock! Disrupted Bio-systems!]`
                : ` ⚡ [Bio-Shocks: +${modDmg} Shock Damage]`;
            } else if (mod === "Electromagnetic Chambers") {
              if (enemyLower.includes("drone") || enemyLower.includes("sentinel") || enemyLower.includes("mech") || enemyLower.includes("robotic") || enemyLower.includes("autonomous") || enemyLower.includes("mainframe") || enemyLower.includes("terminal")) {
                modDmg = 25;
                isVulnerable = true;
              }
              mDmg += modDmg;
              modText = isVulnerable 
                ? ` 🌐 [EMP Chamber EXPLOIT: +${modDmg} Electromagnetic Burst! Short-circuited Robotic Sensors!]`
                : ` 🌐 [EMP Chamber: +${modDmg} EMP Damage]`;
            } else if (mod === "Plasma Heat Coil") {
              if (enemyLower.includes("corporate") || enemyLower.includes("ares") || enemyLower.includes("enforcer") || enemyLower.includes("officer") || enemyLower.includes("commander") || enemyLower.includes("drone") || enemyLower.includes("sentinel") || enemyLower.includes("mech")) {
                modDmg = 25;
                isVulnerable = true;
              }
              mDmg += modDmg;
              modText = isVulnerable 
                ? ` 🔥 [Plasma Heat Coil EXPLOIT: +${modDmg} Plasma Heat! Melted Heavy Defense Layers!]`
                : ` 🔥 [Plasma Heat Coil: +${modDmg} Plasma Damage]`;
            } else if (mod === "Cryo-Fluid Injector") {
              if (enemyLower.includes("mutant") || enemyLower.includes("sludge") || enemyLower.includes("behemoth") || enemyLower.includes("beast") || enemyLower.includes("orc")) {
                modDmg = 25;
                isVulnerable = true;
              }
              mDmg += modDmg;
              modText = isVulnerable 
                ? ` ❄️ [Cryo-Fluid Injector EXPLOIT: +${modDmg} Cryo Freeze! Brittle Armor Shattered!]`
                : ` ❄️ [Cryo-Fluid Injector: +${modDmg} Cryo Damage]`;
            } else if (mod === "Nano-Laser Sight") {
              modDmg = 18;
              mDmg += modDmg;
              modText = ` 🎯 [Nano-Laser Sight: +${modDmg} Piercing Laser Damage]`;
            }
          }

          combat.enemyHp -= mDmg;
          narrative = `🔮 ETHER DISCHARGE: Cast Spell Slash on ${combat.enemyName}! Dealt ${mDmg} armor-bypassing magic damage. (-15 Mana)${hudText}${modText}`;
        }
      }
      else if (cleanAction.includes("cyber hack") || cleanAction.includes(" ransomware") || cleanAction.includes("hack")) {
        let hDmg = Math.floor(Math.random() * 8) + 12; 
        if (nextState.inventory.includes("Smart-Targeting Visor")) {
          hDmg += 8;
        }

        // --- Optical HUDs Critical Check ---
        let hudText = "";
        if (nextState.installedCyberware?.includes("Optical HUDs") && Math.random() < 0.25) {
          hDmg = Math.floor(hDmg * 1.5);
          hudText = " ⚡CRITICAL OVERDRIVE!⚡";
        }

        combat.enemyHp -= hDmg;
        narrative = `💾 NODE OVERLOAD: You inject a system-overload ransomware trigger! Dealt ${hDmg} neuro-bypass damage directly.${hudText}`;
      }
      else if (cleanAction.includes("mind hack")) {
        if (nextState.mana < 20) {
          narrative = "⚠️ COGNITIVE STABLE FAULT: Insufficient ETHER flow. Your psychic hypnosis failed! (-0 Mana)";
        } else {
          nextState.mana -= 20;
          combat.enemyHp = Math.max(0, combat.enemyHp - 50);
          narrative = `🔮 MIND HACK: You bend the synaptic currents of ${combat.enemyName}! Hypnotized for 2 turns. The hostile turns its weapon inward, blasting its own systems for 50 damage! (-20 Mana)`;
        }
      }
      else if (cleanAction.includes("neural overload")) {
        if (nextState.mana < 35) {
          narrative = "⚠️ COGNITIVE STABLE FAULT: Insufficient ETHER flow. Your neural overload failed! (-0 Mana)";
        } else {
          nextState.mana -= 35;
          const roll = Math.random();
          if (roll <= 0.40) {
            combat.enemyHp = 0;
            narrative = `🔮 NEURAL OVERLOAD SUCCESS: A devastating psych-ether spike ruptures the brain synapses of ${combat.enemyName}! Instant critical shutdown! (-35 Mana)`;
          } else {
            nextState.hp = Math.max(1, nextState.hp - 15);
            narrative = `🔮 NEURAL OVERLOAD FAIL: You focus your psychic ether beam, but ${combat.enemyName}'s firewall resists the impact! You suffer 15 points of traumatic psychic feedback. (-35 Mana)`;
          }
        }
      }
      else if (cleanAction.includes("quick item") || cleanAction.includes("med-stim") || cleanAction.includes("consume heal")) {
        if (nextState.inventory.includes("Nano Med-Stim (Heal)")) {
          nextState.hp = Math.min(nextState.maxHp, nextState.hp + 60);
          nextState.inventory = nextState.inventory.filter((item, idx) => idx !== nextState.inventory.indexOf("Nano Med-Stim (Heal)"));
          narrative = "💊 MED-STIM INJECTED: Bio-metrics successfully repaired by +60 Health!";
        } else {
          narrative = "⚠️ CRITICAL FAILURE: No 'Nano Med-Stim (Heal)' inside your current inventory deck!";
        }
      }
      else if (cleanAction.includes("attempt flee") || cleanAction.includes("flee") || cleanAction.includes("evade")) {
        if (Math.random() > 0.4) {
          nextState.combatState = null;
          nextState.dojoBuffActive = false;
          const updatedLogs = [
            ...logs,
            {
              id: crypto.randomUUID(),
              timestamp: timeString,
              text: `🏃 ESCAPE DEPLOYED: You deploy active cloaking mesh and successfully broke contact back to security.`,
              type: "narration" as const,
              district: nextState.district,
              poi: nextState.poi
            }
          ];
          setGameState(nextState);
          setLogs(updatedLogs);
          triggerAutosave(nextState, updatedLogs);
          setIsLoading(false);
          return;
        } else {
          narrative = "❌ EVASION REFUSED: The hostile intercepts your flank coordinate channel. Safe flight blocked!";
        }
      }

      // Check of death
      if (combat.enemyHp <= 0) {
        const rewardC = Math.floor(Math.random() * 51) + 75; // 75-125
        const expGained = 45;
        nextState.credits += rewardC;
        nextState.experience += expGained;

        narrative += `\n\n★ THREAT EXTERMINATED: ${combat.enemyName} collasped with heavy spark leaks. You recover +${rewardC}¤ and earn +${expGained} XP!`;

        // Authored scenes can declaratively control post-combat progression.
        if (combat.victorySceneId) {
          if (combat.victoryCompletionAction) {
            nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), combat.victoryCompletionAction]));
          }
          setActiveDialogue(combat.victorySceneId);
          const victoryScene = { ...DEFAULT_POI_INTERACTIVE_SCENES, ...(nextState.poiInteractiveScenes || {}) }[combat.victorySceneId];
          if (victoryScene) setRelicStep(victoryScene.initialStepId as any);
        }
        // Level Up
        if (nextState.experience >= 100) {
          nextState.level += 1;
          nextState.experience -= 100;
          nextState.maxHp += 20;
          nextState.maxMana += 15;
          nextState.hp = nextState.maxHp;
          nextState.mana = nextState.maxMana;
          nextState.playerPerks = getPerksForLevel(nextState.level);
          
          narrative += `\n\n📶 SYSTEM LEVEL EXPANDED: Congratulations! Ascended to Level ${nextState.level}. Max health and mana stats fully restored!`;
          
          const unlockedPerk = nextState.level === 2 ? "Adrenaline Junkie" :
                               nextState.level === 3 ? "Cyber-Optimizer" :
                               nextState.level === 4 ? "Ether Conduit" :
                               nextState.level === 5 ? "Hardened Chassis" :
                               nextState.level === 6 ? "Lucky Jack" : null;
          if (unlockedPerk) {
            narrative += `\n\n🧠 PASSIVE PERK INTEGRATED: Your synaptic cortex has adapted! [${unlockedPerk}] is now permanently active!`;
          }
        }

        nextState.combatState = null;
        nextState.dojoBuffActive = false;
        logType = "system";
      } else {
        // Enemy Counter-Attacks
        const eDmg = Math.floor(Math.random() * 11) + 12; // 12-22
        let finalDmg = eDmg;
        let evaded = false;
        
        if (nextState.installedCyberware?.includes("Neural Reflex-Boosters") && Math.random() < 0.20) {
          evaded = true;
        }

        if (evaded) {
          narrative += `\n\n🏃 CYBERWARE EVASION: Neural Reflex-Boosters flared! You cleanly evaded ${combat.enemyName}'s counter-attack!`;
        } else {
          let defenseText = "";
          if (nextState.installedCyberware?.includes("Sub-dermal Armor")) {
            finalDmg = Math.max(2, finalDmg - 5);
            defenseText = " (Sub-dermal Armor absorbed -5 damage)";
          }
          nextState.hp -= finalDmg;
          narrative += `\n\n⚠️ HOSTILE REACTION: ${combat.enemyName} strikes back, dealing ${finalDmg} kinetic damage to your armor.${defenseText}`;
        }

        if (nextState.hp <= 0) {
          if (nextState.playerPerks?.includes("Iron Will") && !combat.ironWillTriggered) {
            combat.ironWillTriggered = true;
            const reviveHp = Math.floor(nextState.maxHp * 0.25);
            nextState.hp = reviveHp;
            narrative += `\n\n🛡️ [PERK: IRON WILL ACTIVATED] Your heart stops, but your cybernetic pacing nodes and indomitable grit reboot your systems! You self-revive at 25% HP (${reviveHp}/${nextState.maxHp}) with a surge of renewed combat adrenaline!`;
            combat.turnLog = `Enemy HP: ${combat.enemyHp}/${combat.enemyMaxHp}. Action requested!`;
            nextState.combatState = combat;
            logType = "combat";
          } else if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
            // PROLOGUE GAME OVER / RETRY
            nextState.hp = nextState.maxHp;
            nextState.mana = nextState.maxMana;
            nextState.combatState = null;
            nextState.dojoBuffActive = false;
            narrative += `\n\n☠️ CRITICAL OVERLOAD: Your bio-signatures flatlined in the catacombs! Fortunately, your squad-mate Vice injected an adrenaline micro-dose, resetting your critical vitals and dragging you back to safety. Let's try again!`;
            logType = "system";
          } else {
            // PLAYER DOWNED
            const penalty = Math.floor(nextState.credits * 0.15);
            nextState.credits -= penalty;
            nextState.hp = 25;
            nextState.poi = "Main Headquarters (The Hideout)";
            nextState.district = "aurus";
            setActiveRegionId("aurus");
            setActivePOIView("hideout");
            nextState.combatState = null;
            nextState.dojoBuffActive = false;
            narrative += `\n\n☠️ SYSTEM OVERRIDE TRAUMA: Bio-signatures flatlined! Your emergency backup beacon auto-teleported your frame to Hideout medical bay. -${penalty}¤ Trauma deduction.`;
            logType = "system";
          }
        } else {
          combat.turnLog = `Enemy HP: ${combat.enemyHp}/${combat.enemyMaxHp}. Action requested!`;
          nextState.combatState = combat;
          logType = "combat";
        }
      }
    } 
    // ---- EXPLORATION MODE RESOLUTIONS ----
    else {
      // 1. BASE JOBS PROGRESSION TICK
      const advanceTimeAndProgressJobs = (state: GameState) => {
        // Advance clock
        if (state.timeOfDay === "Morning") {
          state.timeOfDay = "Afternoon";
        } else if (state.timeOfDay === "Afternoon") {
          state.timeOfDay = "Night";
        } else {
          state.timeOfDay = "Morning";
          state.day += 1;
        }

        // Passive companion payouts on mornings
        if (state.timeOfDay === "Morning") {
          let totalWage = 0;
          state.companions.forEach(c => {
            if (c.status === "working") totalWage += 35;
          });
          if (totalWage > 0) {
            state.credits += totalWage;
            return `\n\n💎 AUTOMATED SERVERS PAYMENT: Hired personnel finished deep mining sub-nodes. +${totalWage}¤ transferred to credits cache.`;
          }
        }
        return "";
      };

      // ---- SPECIFIC HOOKS ----
      
      // 0. SCENE TRIGGER VIA REGISTRY
      if (actionText.startsWith("[SCENE:") || cleanAction.startsWith("[scene:")) {
        const match = actionText.match(/\[SCENE:\s*([^:\]]+)(?::([^\]]+))?\]/i);
        if (match) {
          const sceneId = match[1].trim();
          const stepId = match[2] ? match[2].trim() : undefined;
          
          const allScenes = { ...DEFAULT_POI_INTERACTIVE_SCENES, ...(nextState.poiInteractiveScenes || {}) };
          const scene = allScenes[sceneId];
          if (scene) {
            const linkedQuest = nextState.campaignQuestsRegistry?.find(quest => quest.id === scene.linkedQuestId);
            const prerequisite = linkedQuest?.prerequisiteQuestId
              ? nextState.campaignQuestsRegistry?.find(quest => quest.id === linkedQuest.prerequisiteQuestId)
              : undefined;
            if (linkedQuest?.status === "COMPLETED") {
              triggerToast(`${linkedQuest.title} is already completed.`);
              setIsLoading(false);
              return;
            }
            if (linkedQuest && linkedQuest.status === "NOT_STARTED" && (
              (linkedQuest.minLevel || 1) > nextState.level ||
              (linkedQuest.requiredReputationFaction && (nextState.reputations?.[linkedQuest.requiredReputationFaction] || 0) < (linkedQuest.requiredReputationValue || 0)) ||
              (linkedQuest.prerequisiteQuestId && prerequisite?.status !== "COMPLETED")
            )) {
              triggerToast(`Quest requirements are not met: ${linkedQuest.title}`);
              setIsLoading(false);
              return;
            }
            const startStep = stepId || scene.initialStepId;
            setActiveDialogue(sceneId);
            setRelicStep(startStep as any);
            setGameState(nextState);
            setLogs(prev => [
              ...prev,
              {
                id: crypto.randomUUID(),
                timestamp: timeString,
                text: `⚡ EVENT INITIATED: Entering "${scene.title}"...`,
                type: "system",
                district: nextState.district,
                poi: nextState.poi
              }
            ]);
            setIsLoading(false);
            return;
          }
        }
      }

      // Consumables use / consume
      if (cleanAction.startsWith("consume ")) {
        const itemToConsume = nextState.inventory.find(item => cleanAction.includes(item.toLowerCase()));
        if (itemToConsume) {
          const itemLower = itemToConsume.toLowerCase();
          const idx = nextState.inventory.indexOf(itemToConsume);
          if (idx > -1) {
            nextState.inventory.splice(idx, 1);
          }
          
          let healText = "";
          if (itemLower.includes("nutrient") || itemLower.includes("plate") || itemLower.includes("synthetic nutrient plate")) {
            const healAmt = 45;
            const oldHp = nextState.hp;
            nextState.hp = Math.min(nextState.maxHp, nextState.hp + healAmt);
            const healed = nextState.hp - oldHp;
            
            const stamAmt = 35;
            const oldStam = nextState.stamina;
            nextState.stamina = Math.min(nextState.maxStamina, nextState.stamina + stamAmt);
            const stamRestored = nextState.stamina - oldStam;

            healText = `🍗 SYNTH-NUTRIENT CONSUMED: You enjoyed a warm, freshly prepared 'Synthetic Nutrient Plate'. Repolarized +${healed} HP and recharged +${stamRestored} Stamina!`;
            triggerToast(`Consumed Nutrient Plate: +${healed} HP, +${stamRestored} Stamina`);
          } else if (itemLower.includes("stim") || itemLower.includes("heal")) {
            const healAmt = 60;
            const oldHp = nextState.hp;
            nextState.hp = Math.min(nextState.maxHp, nextState.hp + healAmt);
            const healed = nextState.hp - oldHp;
            healText = `💊 BIO-STIMULANT DEPLOYED: You consumed '${itemToConsume}'. Repolarized +${healed} HP! Current: ${nextState.hp}/${nextState.maxHp}`;
            triggerToast(`Repaired +${healed} HP`);
          } else if (itemLower.includes("cell") || itemLower.includes("mana")) {
            const manaAmt = 40;
            const oldMana = nextState.mana;
            nextState.mana = Math.min(nextState.maxMana, nextState.mana + manaAmt);
            const recharged = nextState.mana - oldMana;
            healText = `⚡ ETHER CHARGE INSTALLED: You consumed '${itemToConsume}'. Recharged +${recharged} Mana! Current: ${nextState.mana}/${nextState.maxMana}`;
            triggerToast(`Recharged +${recharged} Mana`);
          } else {
            healText = `📦 ITEM CONSUMED: You consumed '${itemToConsume}', but its neural effects were neutral.`;
          }
          
          setGameState(nextState);
          setLogs(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              timestamp: timeString,
              text: healText,
              type: "system",
              district: nextState.district,
              poi: nextState.poi
            }
          ]);
          setIsLoading(false);
          return;
        } else {
          narrative = `⚠️ USE FAILURE: No matching item found inside inventory stash!`;
        }
      }

      // Rest at base
      if (cleanAction.includes("rest & recover") || cleanAction.includes("rest and sleep")) {
        nextState.hp = nextState.maxHp;
        nextState.mana = nextState.maxMana;
        nextState.stamina = nextState.maxStamina; // Restores stamina completely!
        nextState.weather = "clear"; // Resets weather after a full night's rest!
        nextState.timeOfDay = "Morning";
        nextState.day += 1;
        
        let passiveText = "";
        
        // 1. Core wages for hired companions on nodes
        let totalWage = 0;
        nextState.companions.forEach(c => {
          if (c.status === "working") totalWage += 35;
        });
        if (totalWage > 0) {
          nextState.credits += totalWage;
          passiveText += `\n\n💎 CREW HARVEST DECK: Hired mercenaries delivered automated sub-node payout: +${totalWage}¤.`;
        }

        // 2. Base Crew Jobs Passive Production
        const baseNPCsList = nextState.baseNPCs || [];

        // Hacker Network Operators
        const hackerCount = baseNPCsList.filter(n => n.currentJob === "Hacker Network Operator").length;
        if (hackerCount > 0) {
          const earnings = hackerCount * 45;
          nextState.credits += earnings;
          passiveText += `\n\n💻 HACKER NETWORK INCOME: ${hackerCount} base operator(s) tapped corporate bank sub-nodes: +${earnings}¤ deposited.`;
        }

        // Base Supply Chefs (with Luxury Kitchen support)
        const chefCount = baseNPCsList.filter(n => n.currentJob === "Base Supply Chef").length;
        if (chefCount > 0) {
          const isKitchenUpgraded = nextState.safehouseUpgrades?.kitchenUpgraded;
          const mealsPerChef = isKitchenUpgraded ? 2 : 1;
          const totalMeals = chefCount * mealsPerChef;
          for (let i = 0; i < totalMeals; i++) {
            nextState.inventory.push("Synthetic Nutrient Plate");
          }
          passiveText += `\n\n🍗 CHEF KITCHEN BATCH: ${chefCount} base chef(s) prepped ${totalMeals} hot meals ${isKitchenUpgraded ? "[Luxury Kitchen x2 Boost!]" : ""}: placed in stash.`;
        }

        // Dojo Training Coaches (with Dojo Mat Expansion support)
        const coachCount = baseNPCsList.filter(n => n.currentJob === "Dojo Training Coach").length;
        const isDojoUpgraded = nextState.safehouseUpgrades?.dojoUpgraded;
        if (coachCount > 0 || isDojoUpgraded) {
          nextState.dojoBuffActive = true;
          const bonusPct = isDojoUpgraded ? "+30%" : "+15%";
          passiveText += `\n\n⚔️ DOJO TRAINING CALIBRATION: Dojo coaches & automated combat mats fine-tuned your blades: granted ${bonusPct} Melee damage for your next combat encounter!`;
        }

        // Process Crew Infiltration & Recon Sub-Grid Missions
        if (nextState.crewMissions && nextState.crewMissions.length > 0) {
          const remainingMissions: typeof nextState.crewMissions = [];
          for (const mission of nextState.crewMissions) {
            const updatedMission = { ...mission, turnsLeft: mission.turnsLeft - 1 };
            const targetNPC = (nextState.baseNPCs || []).find(n => n.id === mission.npcId);
            const npcName = targetNPC ? targetNPC.name : "Your operator";

            if (updatedMission.turnsLeft <= 0) {
              // Resolve mission outcome!
              // Risk-based roll (low: 10%, medium: 25%, high: 45%)
              const riskVal = mission.risk.toLowerCase();
              const riskPct = riskVal === "high" ? 0.45 : riskVal === "medium" ? 0.25 : 0.10;
              const gotInjured = Math.random() < riskPct;

              if (gotInjured) {
                // NPC injured
                if (targetNPC) {
                  targetNPC.injuryStatus = "Wounded";
                  targetNPC.happiness = Math.max(0, targetNPC.happiness - 25);
                  targetNPC.dialogue = "Ugh... they detected my signature during the sub-grid run. It was a setup! I need medical attention in the hideout bunk.";
                  targetNPC.currentJob = "Idle / Chilling";
                }
                nextState.inventory.push("High-Grade Scrap Salvage");
                passiveText += `\n\n⚠️ INFILTRATION ALERT: ${npcName} triggered alarms on the run to ${mission.missionName}! They returned wounded and bleeding. Managed to drag back 1x 'High-Grade Scrap Salvage' but needs rest.`;
                triggerToast(`${npcName} returned WOUNDED from mission!`);
              } else {
                // Mission succeeded cleanly!
                let rewardsText = "";
                if (mission.missionId === "matrix_decrypt") {
                  nextState.credits += 120;
                  nextState.inventory.push("Encrypted Decrypt Key");
                  rewardsText = "120¤ and 1x 'Encrypted Decrypt Key'";
                } else if (mission.missionId === "cargo_raid") {
                  nextState.credits += 220;
                  nextState.inventory.push("Synthetic Nutrient Plate");
                  nextState.inventory.push("High-Grade Scrap Salvage");
                  rewardsText = "220¤, 1x 'Synthetic Nutrient Plate', and 1x 'High-Grade Scrap Salvage'";
                } else {
                  // apex_infiltration
                  nextState.credits += 450;
                  nextState.inventory.push("Deluxe Combat Stimulant");
                  nextState.inventory.push("Heavy Sentry Blueprint");
                  rewardsText = "450¤, 1x 'Deluxe Combat Stimulant', and 1x 'Heavy Sentry Blueprint'";
                }

                if (targetNPC) {
                  targetNPC.injuryStatus = "Healthy";
                  targetNPC.happiness = Math.min(100, targetNPC.happiness + 15);
                  targetNPC.dialogue = "System bypassed! Core sub-nodes downloaded successfully, commander. The rewards have been delivered to stash.";
                  targetNPC.currentJob = "Idle / Chilling";
                }

                passiveText += `\n\n📟 MISSION SUCCESS: ${npcName} bypassed all corporate ice blocks at ${mission.missionName}! Delivered ${rewardsText} to your safehouse stash.`;
                triggerToast(`${npcName} COMPLETED Sub-Grid Run!`);
              }
            } else {
              remainingMissions.push(updatedMission);
              passiveText += `\n\n📡 SUB-GRID RUN IN PROGRESS: ${npcName} is active in cyberspace bypassing nodes at ${mission.missionName} (${updatedMission.turnsLeft} turns left).`;
            }
          }
          nextState.crewMissions = remainingMissions;
        }

        narrative = `💤 REST PROTOCOLS COMPLETE: Rested on safehouse medical bunk. Cybernetic channels completely drained and fully calibrated to 100% capacity.${passiveText}`;

        // Safehouse Intrusion & Tactical Base Raids unlock after three authored quests.
        const isRaidEnabled = (nextState.campaignQuestsRegistry || []).filter(quest => quest.status === "COMPLETED").length >= 3;
        if (isRaidEnabled) {
          const defenses = nextState.safehouseDefenses || {
            securityLevel: 1,
            turrets: 0,
            shieldStrength: 100,
            fortifiedDoors: false,
            intrusionLogs: []
          };
          
          // Corporate sweep raid random intrusion disabled in favor of scripted encounters
        }
      }
      
      // Prologue POI actions are authored in Scene Studio and executed by the generic scene runtime.

      // Approach Lost, Frightened Girl (Mia recruitment)
      else if (cleanAction.includes("approach lost") || cleanAction.includes("frightened girl") || cleanAction.includes("lost, frightened girl")) {
        setActiveDialogue("lost_girl");
        narrative = "You carefully approach the shivering figure huddled behind the neon crates. Read the high-priority dialogue overlay above to interact.";
        setIsLoading(false);
        return;
      }

      // Check Inventory Stash
      else if (cleanAction.includes("check stash") || cleanAction.includes("stash inventory")) {
        narrative = `🎒 STORAGE AUDIT: Current items stored in physical slots: ${nextState.inventory.length > 0 ? nextState.inventory.join(", ") : "None"}. Balance liquidity: ${nextState.credits}¤.`;
      }

      // Base Crew Management / NPC Interaction Hub
      else if (cleanAction.includes("base crew management") || cleanAction.includes("base npc manager")) {
        setBaseNPCManagerOpen(true);
        narrative = "📡 CONSOLE UPLINK SECURED: Initiated high-frequency encryption sync with safehouse staff. Displaying Base Crew Command Station...";
        setIsLoading(false);
        return;
      }

      // Cyber-Lab clinic
      else if (cleanAction.includes("access cyber-lab clinic") || cleanAction.includes("cyber-lab")) {
        setCyberLabOpen(true);
        narrative = "🔌 CLINIC OFFLINE FREQUENCY ALIGNED: Power grid redirected to the sub-dermal ripper-doc terminal. Select neural or structural cyberware updates to install.";
        setIsLoading(false);
        return;
      }

      // Gear Modding Terminal
      else if (cleanAction.includes("open gear modding terminal") || cleanAction.includes("gear modding")) {
        setGearModdingOpen(true);
        narrative = "🛠️ GEAR MODIFICATION MATRIX UPLINKED: Weapons bracket synchronized. Insert chemical, bio-shocks, or electromagnetic modifications into your active slots.";
        setIsLoading(false);
        return;
      }

      // Bar Dialog Jax / Talk Jax
      else if (cleanAction.includes("talk to agent jax") || cleanAction.includes("agent jax")) {
        nextState.activeBranchingDialogue = { npcId: "jax", nodeId: "start" };
        setActiveDialogue(null);
        narrative = "You initiate secure transmission layer with Agent Jax.";
        setGameState(nextState);
        setIsLoading(false);
        return;
      }

      // Order synthetic drink
      else if (cleanAction.includes("order spell-enhanced cocktail") || cleanAction.includes("cocktail") || cleanAction.includes("drink")) {
        if (nextState.credits >= 10) {
          nextState.credits -= 10;
          nextState.mana = Math.min(nextState.maxMana, nextState.mana + 30);
          narrative = "🍸 ORDER DISPENSED: Slipped a glowing magenta synth-cocktail. Bio-ether levels recharged (+30 Mana)!";
          setActivePopup({
            title: "SYNTH-COCKTAIL DISPENSED",
            subtitle: "RECOGNITION FLUID RECEIVED",
            type: "check_success",
            text: "You down the glowing magenta synthetic drink. A warm, vibrating bio-ether energy surges through your nervous system!\n\nRecharged +30 Mana!"
          });
        } else {
          narrative = "❌ INSUFFICIENT LIQUIDITY: The bartender spits on the floor. 'Get some real currency.'";
          setActivePopup({
            title: "TRANSACTION REFUSED",
            subtitle: "LIQUIDITY RUNOUT",
            type: "check_failure",
            text: "The bartender looks at your empty ledger and spits on the concrete floor. 'Get some real currency, rookie.'"
          });
        }
      }

      // Eavesdrop on thugs
      else if (cleanAction.includes("eavesdrop")) {
        narrative = "📻 AUDIOWALL HACKED: Overheard conversation feeds:\n- 'Aria at Apex showroom is distributing heavy weapons if you clear out water monsters in the Docks Region...'\n- 'Jax is in a serious pick, the outpatient team got ambushed Downtown inside Shatter Ridge...'";
        setActivePopup({
          title: "AUDIOWALL INTERCEPT",
          subtitle: "EAVESDROP SUCCESS",
          type: "check_success",
          text: "📻 SECURE FEED INTERCEPT OVERLAY:\n\n• \"Aria at Apex showroom is distributing heavy weapons if you clear out water monsters in the Docks Region...\"\n\n• \"Jax is in a serious pick, the outpatient team got ambushed Downtown inside Shatter Ridge...\"\n\n• \"I heard the local weapon vendors restocked deluxe/legendary items under the hood!\""
        });
      }

      // Search Booths
      else if (cleanAction.includes("search booths") || cleanAction.includes("trash scrap")) {
        if (Math.random() > 0.4) {
          nextState.inventory.push("Rusted Circuitry");
          narrative = "🔍 SCAVENGE SUCCESS: Pulled a functional copper piece of 'Rusted Circuitry' scrap from behind leather benches! Sell this at Apex Armory.";
          setActivePopup({
            title: "SCRAP RECOVERED",
            subtitle: "SCAVENGE SUCCESS",
            type: "loot",
            text: "You reached deep behind the sticky leather benches and salvaged a piece of functional copper 'Rusted Circuitry' scrap! This can be recycled for credits at the Apex Armory."
          });
        } else {
          narrative = "🔍 SCAVENGE EMPTY: Only sticky chemical residue and empty drug cylinders detected.";
          setActivePopup({
            title: "SCAVENGE DRY",
            subtitle: "SCAVENGE EMPTY",
            type: "check_failure",
            text: "You searched thoroughly underneath the booths but found only sticky chemical residue and empty drug cylinders."
          });
        }
      }

      // Enter Auction Lobby
      else if (cleanAction.includes("enter auction lobby") || cleanAction.includes("auction lobby") || cleanAction.includes("enter slave")) {
        setActiveDialogue("auction_lobby");
        narrative = "You step into the dimly-lit syndicate bidding lounge. Cages line the perimeter under orange light tubes.";
        setIsLoading(false);
        return;
      }

      // Inspect Holdout Pens
      else if (cleanAction.includes("inspect holdout pens") || cleanAction.includes("holdout pens") || cleanAction.includes("inspect outcast")) {
        setActiveDialogue("inspect_pens");
        narrative = "You walk through the holding blocks, reviewing the cold carbon-steel enclosures of captured escapees.";
        setIsLoading(false);
        return;
      }

      // Bribe Syndicate Warden
      else if (cleanAction.includes("bribe syndicate warden") || cleanAction.includes("bribe warden")) {
        if (nextState.credits >= 40) {
          nextState.credits -= 40;
          nextState.completedPOIActions.push("auction_market:bribed");
          narrative = "💰 WARDEN BRIBED: You slip a cold ledger block containing 40¤ into the warden's glove. Active bid prices reduced by 25%!";
          setActivePopup({
            title: "WARDEN BRIBED",
            subtitle: "MARKET OVERRIDE ACTIVE",
            type: "check_success",
            text: "You slipped 40¤ to the Syndicate Warden. He pockets it and flips off the active telemetry monitors. All bids are now cheaper!"
          });
        } else {
          narrative = "❌ TRANSACTION FAILURE: Warden scowls. 'You think forty copper bits buy you silence here?'";
          setActivePopup({
            title: "TRANSACTION REJECTED",
            subtitle: "INSUFFICIENT LIQUIDITY",
            type: "check_failure",
            text: "The Warden sneers at your small balance ledger. 'You think forty copper bits buy you silence here? Move along.'"
          });
        }
      }

      // ---- AURUS ARENA ACTIONS ----
      else if (cleanAction.includes("enter the arena pit") || cleanAction.includes("enter arena pit") || cleanAction.includes("enter the arena")) {
        setActiveDialogue("mira_voss_intro");
        narrative = "You step into the hot, blood-spattered dirt of Aurus Fighting Arena. The roar of the spectator block is overwhelming.";
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("challenge mira voss to an action-ap duel") || cleanAction.includes("challenge mira voss") || cleanAction.includes("action-ap duel")) {
        if (nextState.baseNPCs?.some(n => n.id === "mira")) {
          narrative = "Mira Voss is already recruited and stationed at your safehouse base!";
          setActivePopup({
            title: "MIRA ALREADY RECRUITED",
            subtitle: "ACTIVE BASE SQUAD MEMBER",
            type: "check_failure",
            text: "Mira Voss has already joined your Safehouse Base. She respects your power."
          });
        } else {
          const strength = nextState.attributes?.str || 10;
          const roll = Math.floor(Math.random() * 20) + 1 + strength;
          const targetDC = 15;
          if (roll >= targetDC) {
            const maxCap = nextState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
            if ((nextState.baseNPCs || []).length >= maxCap) {
              narrative = "Challenge won, but Safehouse quarters are fully occupied! Expand your quarters first.";
              triggerToast("SAFEHOUSE FULL");
            } else {
              const mira = {
                id: "mira",
                name: "Mira Voss",
                role: "Combat Trainer / Dojo Training Coach / Sentinel",
                avatar: "🛡️",
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=600",
                description: "Mira Voss stands tall in her arena combat leather wrappings and cybernetic forearm shields, her face scarred from countless arena fights. She is aggressive, respects action and power, and hates cheap pity.",
                dialogue: "You think you're strong enough to command me, rookie? Prove it in the field. Keep your guard up and strike hard, otherwise you're just another corporate target.",
                reaction: null,
                happiness: 80,
                affection: "Respectful",
                affectionValue: 60,
                willpower: 90,
                corruption: 20,
                hygiene: "Normal",
                discipline: 90,
                hunger: "Satiated",
                respect: 85,
                withdrawRisk: "None",
                anger: 15,
                defiance: 25,
                fear: 5,
                inventory: ["Spiked Brass Knuckles", "Championship Arena Medal"],
                currentJob: "Defensive Dojo Coach"
              };
              nextState.baseNPCs = [...(nextState.baseNPCs || []), mira];
              nextState.experience += 150;
              narrative = `💪 DUEL VICTORY: You slammed Mira Voss onto the steel ring platform with a devastating blow (Roll: ${roll} vs ${targetDC})! Mira wipes blood from her lip and sneers in deep respect: 'A clean strike. You've got fire, kid. I'm yours.'`;
              setActivePopup({
                title: "DUEL VICTORY",
                subtitle: "MIRA VOSS RECRUITED",
                type: "check_success",
                text: `With an amazing display of close-quarters tactical supremacy, you completely countered Mira's shield guard!\n\nRoll: ${roll} vs DC ${targetDC}\n\nMira Voss has broken her gang contract to join your Safehouse Dojo as a Combat Trainer!\n\nEarned +150 XP!`
              });
            }
          } else {
            nextState.hp = Math.max(10, nextState.hp - 35);
            narrative = `💥 DUEL DEFEAT: Mira Voss completely countered your approach, slamming her steel forearm shield into your rib cage (Roll: ${roll} vs ${targetDC}). Dealt -35 damage!`;
            setActivePopup({
              title: "DUEL DEFEAT",
              subtitle: "MIRA LAUGHS AT YOU",
              type: "check_failure",
              text: `You were too slow! Mira predicted your trajectory, ducked beneath your swing, and slammed her heavy shock-shield into your chest, throwing you onto the hazard fence.\n\nRoll: ${roll} vs DC ${targetDC}\n\nDealt -35 kinetic damage. Mira sneers: 'Is that all you've got, rookie? Come back when you learn how to swing a blade!'`
            });
          }
        }
      }
      else if (cleanAction.includes("buy mira voss's arena contract") || cleanAction.includes("buy mira") || cleanAction.includes("arena contract")) {
        if (nextState.baseNPCs?.some(n => n.id === "mira")) {
          narrative = "Mira Voss is already recruited!";
        } else {
          const isBribed = nextState.completedPOIActions?.includes("auction_market:bribed");
          const price = isBribed ? 150 : 200;
          if (nextState.credits >= price) {
            const maxCap = nextState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
            if ((nextState.baseNPCs || []).length >= maxCap) {
              narrative = `Safehouse quarters are fully occupied (${(nextState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`;
            } else {
              nextState.credits -= price;
              const mira = {
                id: "mira",
                name: "Mira Voss",
                role: "Combat Trainer / Dojo Training Coach / Sentinel",
                avatar: "🛡️",
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=600",
                description: "Mira Voss stands tall in her arena combat leather wrappings and cybernetic forearm shields, her face scarred from countless arena fights. She is aggressive, respects action and power, and hates cheap pity.",
                dialogue: "You think you're strong enough to command me, rookie? Prove it in the field. Keep your guard up and strike hard, otherwise you're just another corporate target.",
                reaction: null,
                happiness: 80,
                affection: "Respectful",
                affectionValue: 60,
                willpower: 90,
                corruption: 20,
                hygiene: "Normal",
                discipline: 90,
                hunger: "Satiated",
                respect: 85,
                withdrawRisk: "None",
                anger: 15,
                defiance: 25,
                fear: 5,
                inventory: ["Spiked Brass Knuckles", "Championship Arena Medal"],
                currentJob: "Defensive Dojo Coach"
              };
              nextState.baseNPCs = [...(nextState.baseNPCs || []), mira];
              nextState.experience += 90;
              narrative = `💰 CONTRACT BOUGHT: Purchased Mira's arena contract ledger for ${price}¤! Mira grunts: 'Paid off, huh? Fine. I'd rather guard your safehouse than bleed for these fat bidding corporate scouts.'`;
              setActivePopup({
                title: "CONTRACT RE-ALLOCATED",
                subtitle: "MIRA RECRUITED",
                type: "loot",
                text: `You transferred ${price}¤ Credits to the Arena Pit boss, taking over Mira's active contract. She collects her knuckles and joins your base!\n\nEarned +90 XP!`
              });
            }
          } else {
            narrative = `❌ LIQUIDITY REJECTED: Arena contractor wants ${price}¤ for her contract. Stash balance insufficient!`;
          }
        }
      }
      else if (cleanAction.includes("gamble on underground arena fight") || cleanAction.includes("gamble")) {
        if (nextState.credits >= 50) {
          nextState.credits -= 50;
          const intScore = nextState.attributes?.int || 10;
          const winChance = intScore >= 12 ? 0.58 : 0.45;
          const win = Math.random() < winChance;
          if (win) {
            nextState.credits += 100;
            narrative = "🎰 GAMBLE SUCCESS: Your fighter knocked out the cyborg gladiator in Round 3! Recovered +100¤ Credits!";
            setActivePopup({
              title: "🎰 BETTING WIN",
              subtitle: "UNDERGROUND GLADIATOR BOUT",
              type: "loot",
              text: `You analyzed the fighter's telemetry scans correctly!\n\nYour chosen gladiator landed a brutal neural-decoupling punch in Round 3.\n\nPaid out +100¤ Credits (Net Profit: +50¤)!`
            });
          } else {
            narrative = "🎰 GAMBLE DEFEAT: Your fighter's power core overheated in Round 2. Lost -50¤ Credits!";
            setActivePopup({
              title: "🎰 BETTING LOSS",
              subtitle: "FIGHTER DETONATION",
              type: "check_failure",
              text: "Bad luck. Your gladiator's kinetic dampener failed, and they were thrown out of the ring boundaries.\n\nLost -50¤ Credits."
            });
          }
        } else {
          narrative = "❌ GAMBLE ABORTED: You need 50¤ Credits to enter the active bidding board.";
        }
      }

      // Talk Aria
      else if (cleanAction.includes("talk to chancellor aria") || cleanAction.includes("chancellor aria")) {
        setActiveDialogue("aria");
        narrative = "You establish connection interface with Chancellor Aria.";
        setIsLoading(false);
        return;
      }

      // Sell scrap
      else if (cleanAction.includes("sell scrap") || cleanAction.includes("sell ") && cleanAction.includes("circuitry")) {
        if (nextState.inventory.includes("Rusted Circuitry")) {
          nextState.inventory = nextState.inventory.filter(i => i !== "Rusted Circuitry");
          nextState.credits += 30;
          narrative = "💰 TRANS-RECEIVER CLEARED: Disposed of Rusted Circuitry scrap to automated recycler. Recovered +30¤.";
          setActivePopup({
            title: "SCRAP RECYCLED",
            subtitle: "AUTOMATED RECYCLER",
            type: "loot",
            text: "You loaded the Rusted Circuitry scrap into the slot. The machine clanks, shreds, and registers a trade. Transfer complete!\n\nEarned +30¤ Credits!"
          });
        } else {
          narrative = "⚠️ recycler refused: No 'Rusted Circuitry' detected under active equipment list.";
          setActivePopup({
            title: "RECYCLER ERROR",
            subtitle: "SCRAP REJECTED",
            type: "check_failure",
            text: "The automated terminal's red scanner flashes. No 'Rusted Circuitry' detected in your stash inventory. Recycler sequence aborted."
          });
        }
      }

      // Buy shop items
      else if (cleanAction.includes("purchase advanced") || cleanAction.includes("purchase item") || cleanAction.includes("gear")) {
        setShopVendorOpen(true);
        narrative = "🛒 SHOP VENDOR CONSOLE INITIALIZED: Accessing the localized neural network shop. Complete your equipment upgrades from the interactive terminal modal now!";
      }

      // Talk Recruiter
      else if (cleanAction.includes("consult agent recruiter") || cleanAction.includes("vesper")) {
        setActiveDialogue("recruiter");
        narrative = "You approach Nexus Coordinator Agent Vesper.";
        setIsLoading(false);
        return;
      }

      // Hire Crew triggers
      else if (cleanAction.includes("contract hire") || cleanAction.includes("hire ")) {
        const name = cleanAction.includes("scythe") ? "Scythe" : cleanAction.includes("vex") ? "Vex" : "Brick";
        const target = nextState.companions.find(c => c.name === name);
        if (target) {
          if (target.status !== "available") {
            narrative = `⚠️ INTEGRATION FAIL: Operator ${target.name} is already deployed on active squad database registry.`;
          } else if (nextState.credits >= target.fee) {
            nextState.credits -= target.fee;
            target.status = "in_party";
            nextState.party.push(target.name);
            narrative = `🤝 ROSTER ALIGNED: Contractor ${target.name} signed deployment agreements! Allocated job slots available at Hideout.`;
          } else {
            narrative = `❌ CREDIT FAIL: Operative ${target.name} requests ${target.fee}¤ starting payment. Balance insufficient.`;
          }
        }
      }

      // Talk Priestess Morgana
      else if (cleanAction.includes("talk to priestess morgana") || cleanAction.includes("morgana")) {
        setActiveDialogue("morgana");
        narrative = "Establishing telepathic link with High Priestess Morgana.";
        setIsLoading(false);
        return;
      }

      // Meditate Satoshi Square / Temple Core
      else if (cleanAction.includes("meditate with the core") || cleanAction.includes("meditate")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 35);
        narrative = "🧘 ETHER ABSORB: You sit silently inside the server cooling grid. Pure static energy enters your core (+35 Mana recovered).";
      }

      // Meditate Shrines (Satoshi Gardens)
      else if (cleanAction.includes("meditate with shrines")) {
        nextState.hp = Math.min(nextState.maxHp, nextState.hp + 10);
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 15);
        narrative = "🌸 ZEN CHIPPED: The synthetic cherry petals float over your body. Partially recovered health and mana streams (+10 HP, +15 Mana).";
      }

      // Perform offering at Shrine
      else if (cleanAction.includes("perform ritual tech offering")) {
        if (nextState.credits >= 20) {
          nextState.credits -= 20;
          nextState.mana = nextState.maxMana;
          narrative = "🌸 COVEN GRACE: Siphoned 20¤ as digital offering. Your cybernetic mana channels are fully charged!";
        } else {
          narrative = "❌ INSUFFICIENT FUNDS: No digital change recorded under active network logs.";
        }
      }

      // Train Mana capacity at Temple
      else if (cleanAction.includes("train mana capacity") || cleanAction.includes("train mana")) {
        if (nextState.credits >= 80) {
          nextState.credits -= 80;
          nextState.maxMana += 20;
          nextState.mana = nextState.maxMana;
          narrative = "🧬 NEURAL EXPANSION: Successfully augmented your cortex limits! +20 Maximum ETHER capacity permanently installed.";
        } else {
          narrative = "❌ SHORT ON CREDITS: High Priestess Morgana shakes her head. 'Mind training requires a donation of 80¤.'";
        }
      }

      // ---- COMBAT SPOTS INITIATE ----
      
      // Shatter Ridge combat
      else if (cleanAction.includes("ambush outlaw") || cleanAction.includes("engage combat") || cleanAction.includes("canyon outlaws")) {
        const templates = ENEMIES.shatter_ridge;
        const roll = templates[Math.floor(Math.random() * templates.length)];
        
        nextState.combatState = {
          enemyName: roll.name,
          enemyHp: roll.hp,
          enemyMaxHp: roll.maxHp,
          enemyShields: roll.shields,
          enemyMaxShields: roll.maxShields,
          isActive: true,
          turnLog: `${roll.name} drops from a highwalk structural beam with auto-pistols aimed!`
        };
        narrative = `💥 COMBAT INITIALIZED: Ambushed by a hostile ${roll.name}! Deploy defense systems immediately.`;
        logType = "combat";
      }

      // Outlaw Mine scavenger
      else if (cleanAction.includes("scavenge rusted mine") || cleanAction.includes("rusted mine") || cleanAction.includes("mine shaft")) {
        if (Math.random() > 0.4) {
          nextState.inventory.push("Nano Med-Stim (Heal)");
          narrative = "🔍 SCAVENGE SUCCESS: Salvaged an unused corporate medical stimpack ('Nano Med-Stim (Heal)') from an empty highwalk crate!";
        } else {
          narrative = "🔍 SCAVENGE FAILURE: Ground sensors show only heavy iron oxide sludge and metallic scrap dust.";
        }
      }

      // Sludge Conduits combat (Wetlands / sewer replacement)
      else if (cleanAction.includes("hunt toxic swamp") || cleanAction.includes("hunt toxic") || cleanAction.includes("sludge crawler")) {
        const templates = ENEMIES.sludge_conduits;
        const roll = templates[0];

        nextState.combatState = {
          enemyName: roll.name,
          enemyHp: roll.hp,
          enemyMaxHp: roll.maxHp,
          enemyShields: roll.shields,
          enemyMaxShields: roll.maxShields,
          isActive: true,
          turnLog: `The radioactive crawler slithers out of hot bubbling acid runoff conduits!`
        };
        narrative = `💥 COMBAT INITIALIZED: Confronted by hostile mutant ${roll.name}! Heavy toxic gas warnings triggered.`;
        logType = "combat";
      }

      // Scan shipping container / Scavenge sewers
      else if (cleanAction.includes("scavenge shipping") || cleanAction.includes("container") || cleanAction.includes("scavenge glowing")) {
        if (Math.random() > 0.5) {
          nextState.inventory.push("Ether Mana-Cell (Mana)");
          narrative = "🔍 SCAVENGE SUCCESS: Extracted a fully charged battery cells 'Ether Mana-Cell (Mana)' from discarded industrial containers!";
        } else {
          nextState.hp = Math.max(15, nextState.hp - 15);
          narrative = "⚠️ ACID LEAK HAZARD: You slipped on a chemically corroded valve. Spent coolant burned through leg chassis! Dealt -15 corrosion damage.";
        }
      }

      // ==========================================
      // ---- EXPANDED DOCKS & DOWNTOWN POIs ----
      // ==========================================

      // Rusty Anchor Shipyard utility actions
      else if (cleanAction.includes("steal crane master control key")) {
        const dex = nextState.attributes?.dex || 10;
        const netSlicer = nextState.skills?.netSlicer || 1;
        const roll = Math.floor(Math.random() * 20) + 1 + dex + (netSlicer * 2);

        if (roll >= 15) {
          if (!nextState.inventory.includes("Carbon-Mesh Visor")) {
            nextState.inventory.push("Carbon-Mesh Visor");
          }
          nextState.experience += 25;
          narrative = `🔓 LOCKPICK SUCCESS (Roll: ${roll} vs 15): You slickly bypass the lock on the high-reach crane cabin and secure an advanced 'Carbon-Mesh Visor' and +25 XP!`;
          setActivePopup({
            title: "🔓 BYPASS COMPLETED",
            subtitle: "CRANE CABIN LOOTED",
            type: "check_success",
            text: `Superb manual finesse (Roll: ${roll} vs 15). You popped the pressurized seal of the Crane cabin, finding a corporate courier's leftover crate.\n\nAcquired: 'Carbon-Mesh Visor' added to stash!\nGain: +25 XP!`
          });
        } else {
          nextState.hp = Math.max(10, nextState.hp - 15);
          nextState.stamina = Math.max(0, nextState.stamina - 10);
          narrative = `🚨 SECURITY ALERT (Roll: ${roll} vs 15): You snapped a structural wire, triggering a pneumatic alarm trap! Freezing steam dealt -15 HP and -10 Stamina.`;
        }
      }
      else if (cleanAction.includes("scavenge submerged hull")) {
        if (Math.random() > 0.4) {
          nextState.credits += 30;
          narrative = "🔍 SCAVENGE SUCCESS: You climbed inside the half-submerged freighter hull and siphoned 30¤ worth of active copper micro-cables!";
        } else {
          nextState.hp = Math.max(15, nextState.hp - 10);
          narrative = "⚠️ SHARP CORROSION: You slipped on rusty structural plates. Scratched your leg plates (-10 HP).";
        }
      }

      // 3. Dr. Marv's Clinic actions
      else if (cleanAction.includes("talk to dr. marv")) {
        nextState.activeBranchingDialogue = { npcId: "marv", nodeId: "start" };
        setActiveDialogue(null);
        narrative = "You initiate secure consultation interface with Dr. Marv.";
        setGameState(nextState);
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("undergo experimental bio-splice")) {
        if (nextState.completedPOIActions.includes("marv_clinic:bio_spliced")) {
          narrative = "⚠️ CHROMOSOME ERROR: Dr. Marv shakes his head. 'I can't splice you again, runner. Your central nervous grid would collapse into mush!'";
        } else {
          const str = nextState.attributes?.str || 10;
          const roll = Math.floor(Math.random() * 20) + 1 + str;

          if (roll >= 16) {
            nextState.completedPOIActions.push("marv_clinic:bio_spliced");
            nextState.maxHp += 15;
            nextState.hp = nextState.maxHp;
            nextState.experience += 30;
            narrative = `🧬 BIO-SPLICE SUCCESSFUL (Roll: ${roll} vs 16): Dr. Marv weaves advanced synthetic muscles directly into your chest plates! Permanent Max HP +15 and health fully restored!`;
            setActivePopup({
              title: "🧬 EVOLUTION INSTALLED",
              subtitle: "EXPERIMENTAL BIO-SPLICE",
              type: "check_success",
              text: `With high-tensile pain tolerance (Roll: ${roll} vs 16), you survived the raw cybernetic suture process without anesthetic.\n\nYour muscular-skeletal framework is reinforced with synthetic titanium weaves!\n\nPermanent Boost: Max HP +15 (Current Max: ${nextState.maxHp})!`
            });
          } else {
            nextState.hp = Math.max(10, nextState.hp - 25);
            nextState.stamina = Math.max(0, nextState.stamina - 20);
            narrative = `🧬 SURGICAL CRITICAL REJECTION (Roll: ${roll} vs 16): Your chromosomes rejected the synthetic material. Your blood vessels swelled painfully (-25 HP, -20 Stamina).`;
          }
        }
      }

      // 4. Club Afterlife VIP Lounge actions
      else if (cleanAction.includes("talk to cipher")) {
        nextState.activeBranchingDialogue = { npcId: "cipher", nodeId: "start" };
        setActiveDialogue(null);
        narrative = "You enter secure dialogue link with Cipher.";
        setGameState(nextState);
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("buy round of luxury champagne")) {
        if (nextState.credits >= 30) {
          nextState.credits -= 30;
          nextState.hp = Math.min(nextState.maxHp, nextState.hp + 35);
          nextState.mana = Math.min(nextState.maxMana, nextState.mana + 35);
          narrative = "🍾 CHAMPAGNE POURED: Siphoned 30¤. You drink the icy, oxygen-fused synthetic champagne. High-grade molecular repair (+35 HP, +35 Mana)!";
        } else {
          narrative = "❌ CREDIT TRANSACTION SHIELD: High-priority champagne requires 30¤. Trans-funds blocked.";
        }
      }
      else if (cleanAction.includes("eavesdrop on corporate executives")) {
        nextState.experience += 15;
        narrative = "👂 INTEL FILTERED: You slip close to a corporate VIP booth. You intercept localized audio feeds showing that Nouveau's safe shields can be bypassed easily if you hack their mainframe terminal with a VIP Afterlife Keycard!";
      }
      else if (cleanAction.includes("slip vip keycard into pocket")) {
        if (nextState.inventory.includes("VIP Afterlife Keycard")) {
          narrative = "⚠️ DECK DETECTED: You already have a 'VIP Afterlife Keycard' inside your pockets.";
        } else {
          const dex = nextState.attributes?.dex || 10;
          const roll = Math.floor(Math.random() * 20) + 1 + dex;

          if (roll >= 15) {
            nextState.inventory.push("VIP Afterlife Keycard");
            nextState.experience += 25;
            narrative = `🕵️ SLEIGHT OF HAND SUCCESS (Roll: ${roll} vs 15): You smoothly bumped into Cipher and slipped his 'VIP Afterlife Keycard' from his neon duster pocket!`;
          } else {
            nextState.hp = Math.max(10, nextState.hp - 15);
            nextState.stamina = Math.max(0, nextState.stamina - 15);
            narrative = `🚨 PICKPOCKET CAUGHT (Roll: ${roll} vs 15): Cipher notices your manual intrusion! His bodyguard shoves you roughly into a plasma partition (-15 HP, -15 Stamina).`;
          }
        }
      }

      // Highwalk Homicide Site utility actions
      else if (cleanAction.includes("hack rebel courier's cyberdeck") || cleanAction.includes("hack rebel courier")) {
        const intScore = nextState.attributes?.int || 10;
        const netSlicerLevel = nextState.skills?.netSlicer || 1;
        setHackingPuzzle(initHackingGame("rebel_courier", intScore, netSlicerLevel));
        setActivePOIView("terminal_hacking_puzzle");
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("search wreckage for cargo pass")) {
        if (Math.random() > 0.5) {
          nextState.credits += 50;
          narrative = "🔍 SEARCH DISCOVERY: You found a discarded Ares Cargo Ledger key containing +50¤!";
        } else {
          if (!nextState.inventory.includes("Shatter-Ridge Scrap Metal")) {
            nextState.inventory.push("Shatter-Ridge Scrap Metal");
          }
          narrative = "🔍 SEARCH SUCCESS: You salvaged 1x 'Shatter-Ridge Scrap Metal' from the shredded drone chassis!";
        }
      }

      // ==========================================
      // ---- NEW UNMAPPED DISTRICT POI ACTIONS ----
      // ==========================================

      // 1. Grid Waste-Barrens Actions
      else if (cleanAction.includes("sift through server junk")) {
        const intVal = nextState.attributes?.intelligence || nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + intVal;
        if (roll >= 15) {
          nextState.credits += 80;
          nextState.experience += 40;
          nextState.completedPOIActions.push("scavenger_outpost:scavenged");
          narrative = `🎯 INT CHECK SUCCESS (Roll: ${roll} vs 15): You parse the unmapped junked server array and decrypt a cache of obsolete cryptographic ledger addresses! Recovered +80¤ and +40 XP!`;
          setActivePopup({
            title: "🎯 CRYPTO ADDRESS DECRYPTED",
            subtitle: "INT CHECK SUCCESS",
            type: "check_success",
            text: `You interface with the dead server rack's interface port (Roll: ${roll} vs 15). Inside, you successfully parse and salvage active cryptographic seed phrases!\n\nRecovered +80¤ Credits and +40 XP.`
          });
        } else {
          nextState.hp = Math.max(10, nextState.hp - 10);
          narrative = `❌ INT CHECK FAILURE (Roll: ${roll} vs 15): You attempt to force-hack the active power capacitor, but a heavy feedback surge zaps your neural deck! Sustained 10 electrical damage.`;
          setActivePopup({
            title: "❌ COGNITIVE ZAP SURGE",
            subtitle: "INT CHECK FAILURE",
            type: "check_failure",
            text: `A sudden electromagnetic static discharge explodes from the broken terminal housing (Roll: ${roll} vs 15)!\n\nSustained -10 HP feedback damage.`
          });
        }
      }
      else if (cleanAction.includes("trade with scrap-merchant")) {
        if (nextState.credits >= 30) {
          nextState.credits -= 30;
          nextState.inventory.push("Nano Med-Stim (Heal)");
          narrative = "🤝 TRADING COMPLETE: You purchased a medical-grade injection pack ('Nano Med-Stim (Heal)') from the Scrap-Merchant for 30¤.";
          setActivePopup({
            title: "🤝 TRADE ACQUIRED",
            subtitle: "SCRAP-MERCHANT COMPACT",
            type: "loot",
            text: "You hand 30¤ to the hooded cyber-scavenger. He passes you a sealed military-grade medicine canister.\n\nReceived: 'Nano Med-Stim (Heal)' added to inventory!"
          });
        } else {
          narrative = `❌ TRANSACTION REFUSED: The Scrap-Merchant spits. 'Come back when you have 30¤.' Your balance: ${nextState.credits}¤.`;
          setActivePopup({
            title: "TRANSACTION REJECTED",
            subtitle: "INSUFFICIENT LIQUIDITY",
            type: "check_failure",
            text: "The Scrap-Merchant sneers at your small balance ledger. 'Come back when you have 30 copper bits, rookie.'"
          });
        }
      }

      // 2. Kurogane Heavy Industrial Actions
      else if (cleanAction.includes("overload automated grid line")) {
        const intVal = nextState.attributes?.intelligence || nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + intVal;
        if (roll >= 16) {
          nextState.credits += 120;
          nextState.experience += 50;
          nextState.completedPOIActions.push("blast_furnace_07:overloaded");
          narrative = `💥 HACK SUCCESS (Roll: ${roll} vs 16): You successfully route a high-voltage surge through the secondary molten sliders, blowing out local camera arrays and prying a pristine Power Core! Sold to streetrunners for +120¤ and +50 XP!`;
          setActivePopup({
            title: "💥 AUTOMATED SYSTEM TRIPPED",
            subtitle: "GRID OVERLOAD SUCCESS",
            type: "check_success",
            text: `You bypassed the security transformer and triggered a localized thermal power surge (Roll: ${roll} vs 16). The robotic lifters go dark and you pry a solid corporate energy block from the housing!\n\nEarned +120¤ Credits, +50 XP!`
          });
        } else {
          nextState.hp = Math.max(10, nextState.hp - 15);
          narrative = `❌ GRID OVERLOAD FAILURE (Roll: ${roll} vs 16): A high-voltage thermal arc flashes from the busbar, melting your copper palm circuits! Sustained 15 fire damage.`;
          setActivePopup({
            title: "❌ ARC FLASH FAILURE",
            subtitle: "HACK FAILURE",
            type: "check_failure",
            text: `The primary safety breakers failed to trip (Roll: ${roll} vs 16)! A blinding blue electric arc flash vaporizes your probe.\n\nSustained -15 fire damage.`
          });
        }
      }
      else if (cleanAction.includes("inspect thermal pipes")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 20);
        nextState.experience += 15;
        nextState.completedPOIActions.push("blast_furnace_07:inspected");
        narrative = "🔍 THERMAL EXPULSION CHANNEL: You carefully bleed steam from the heat exchangers. The intense warmth calibrates your deck's internal thermistors, boosting cognitive flow (+20 Mana, +15 XP).";
        setActivePopup({
          title: "🔍 THERMAL EXPULSION",
          subtitle: "CALIBRATION REFRESHED",
          type: "loot",
          text: "You carefully bleed pressurized steam from the heavy heat exchangers. The warm, circulating energy calibrates your deck's thermal limiters, improving processing throughput!\n\nRecovered +20 Mana, +15 XP."
        });
      }

      // 3. Hyperion Neo-Cathedral Actions
      else if (cleanAction.includes("calibrate deck at the ley-matrix")) {
        const wilVal = nextState.attributes?.willpower || nextState.attributes?.wil || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + wilVal;
        if (roll >= 15) {
          nextState.maxMana += 15;
          nextState.mana = nextState.maxMana;
          nextState.experience += 50;
          nextState.completedPOIActions.push("altar_column:calibrated");
          narrative = `🔮 WILL CHECK SUCCESS (Roll: ${roll} vs 15): The raw electromagnetic Ley-Matrix aligns perfectly with your mind! Maximum Ether permanently increased by 15. All Mana fully charged! Earned +50 XP.`;
          setActivePopup({
            title: "🔮 LEY-MATRIX SYNCHRONIZED",
            subtitle: "WILL CHECK SUCCESS",
            type: "check_success",
            text: `Your mind resonates perfectly with the copper Ley-Matrix spire (Roll: ${roll} vs 15). The violent violet light streams flood your cognitive channels, permanently expanding your mind's bandwidth!\n\nMaximum Mana permanently increased by +15!\nMana fully recharged!`
          });
        } else {
          nextState.mana = 0;
          narrative = `❌ WILL CHECK FAILURE (Roll: ${roll} vs 15): Your mind is overwhelmed by the wild, unshielded signal stream! Your cognitive buffers are fully cleared, draining your Mana to 0.`;
          setActivePopup({
            title: "❌ NEURAL FEEDBACK FLOOD",
            subtitle: "WILL CHECK FAILURE",
            type: "check_failure",
            text: `The Ley-Matrix signals override your deck's security boundaries (Roll: ${roll} vs 15). Your thoughts dissolve into white noise.\n\nCognitive Deck fully drained (Mana set to 0)!`
          });
        }
      }
      else if (cleanAction.includes("recite high-level binary litany")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 25);
        if (!nextState.reputations) nextState.reputations = { streetOutlaws: 50, corporateSyndicate: 50 };
        nextState.reputations.streetOutlaws = Math.min(100, (nextState.reputations.streetOutlaws || 50) + 5);
        nextState.completedPOIActions.push("altar_column:recited");
        narrative = "⛪ BINARY HEXADECIMAL CODES SPOKEN: You join the hooded cyber-nuns, chanting high-level assembly registers. You feel your neural nodes quieten and gain their trust (+25 Mana, +5% Outcast Union reputation).";
        setActivePopup({
          title: "⛪ HEXADECIMAL PSALMS",
          subtitle: "BINARY RESONANCE",
          type: "loot",
          text: "You bow your head and speak hexadecimal registers alongside the cyber-nuns. The harmonious low-frequency chanting relaxes your cognitive Deck, while earning respect from the local underground coven.\n\nRecovered +25 Mana!\nGain +5% Outcast Union Trust!"
        });
      }

      // Standard default exploration narrative
      else {
        const tickLogMsg = advanceTimeAndProgressJobs(nextState);
        narrative = `Refreshed tracking data channels at ${nextState.poi}. Atmospheric pollution levels high. Static wind currents. Net connection offline.${tickLogMsg}`;
      }
    }

    const isPrologueEnd = ["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district);
    if (nextState.stamina <= 0 && !isPrologueEnd) {
      nextState.stamina = nextState.maxStamina || 100;
      nextState.hp = Math.max(nextState.hp, 25);
      nextState.district = "aurus";
      nextState.poi = "Main Headquarters (The Hideout)";
      setActiveRegionId("aurus");
      setActivePOIView("hideout");
      
      narrative = (narrative ? narrative + "\n\n" : "") + `🚨 NEURAL EXHAUSTION COLLAPSE: Your stamina reached 0! You collapsed from extreme fatigue. Your auto-teleport recovery beacon triggered, returning your frame safely to the Aurus Safehouse bunk where life support stabilized your core and fully restored your Stamina!`;
      logType = "system";
      triggerToast("STAMINA DEPLETED: Teleported to Safehouse");
    }

    const finalLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: timeString,
      text: narrative,
      type: logType,
      district: nextState.district,
      poi: nextState.poi
    };
    const updatedLogs = [...logs, finalLog];
    setGameState(nextState);
    setLogs(updatedLogs);
    triggerAutosave(nextState, updatedLogs);
    setCustomInput("");
    setIsLoading(false);
  };

  // Switch companion to manual task allocations
  const handleAssignCompanionTask = (companionName: string, task: string) => {
    if (!gameState) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextState = { ...gameState };
    const comp = nextState.companions.find(c => c.name === companionName);
    
    if (comp) {
      comp.status = "working";
      nextState.party = nextState.party.filter(name => name !== companionName);
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `⚙️ PERSONNEL ALLOCATED: Placed ${companionName} on node task: "${task}". They are now collecting +35¤ on every restful night cycle.`,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      triggerToast(`${companionName} allocated to server job`);
    }
    setSelectedCompanion(null);
  };

  // Bring working mercenary back into companion group
  const handleRecallCompanion = (companionName: string) => {
    if (!gameState) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextState = { ...gameState };
    const comp = nextState.companions.find(c => c.name === companionName);
    
    if (comp && comp.status === "working") {
      comp.status = "in_party";
      nextState.party.push(companionName);
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `⚙️ PERSONNEL RECALLED: Operative ${companionName} recalled and deployed directly into your tactical squad.`,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      triggerToast(`${companionName} returned to active party`);
    }
  };

  // Get modified cost based on active POI faction alignments
  const getModifiedCost = (baseCost: number, poiId: string) => {
    if (!gameState) return baseCost;
    let factionKey: "streetOutlaws" | "aresCorporate" | "titanLogistics" = "titanLogistics";
    if (poiId === "marv_clinic") factionKey = "streetOutlaws";
    else if (poiId === "nouveau_chrome") factionKey = "aresCorporate";
    
    const rep = gameState.reputations?.[factionKey] ?? 50;
    let multiplier = 1.0;
    if (rep >= 80) multiplier = 0.8; // 20% discount
    else if (rep >= 61) multiplier = 0.9; // 10% discount
    else if (rep <= 20) multiplier = 1.5; // 50% markup
    else if (rep <= 40) multiplier = 1.2; // 20% markup
    
    return Math.round(baseCost * multiplier);
  };

  // Buy item button helper
  const handleBuyItemDirectly = (item: { name: string; cost: number }) => {
    if (!gameState) return;
    if (gameState.credits >= item.cost) {
      let nextState = { ...gameState };
      nextState.credits -= item.cost;
      nextState.inventory.push(item.name);
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🛒 CONVEYOR DISPATCHED: Transferred ${item.cost}¤. Stored upgraded equipment [${item.name}] into inventory stash slot.`,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      triggerToast(`PURCHASED ${item.name} SUCCESS`);
    } else {
      triggerToast("TRANSACTION REFUSED: INSUFFICIENT CREDITS");
    }
  };

  // Get dynamic merchant stock based on active POI
  const getShopItemsForPOI = (poiId: string) => {
    let baseStock = SHOP_ITEMS;
    if (poiId === "marv_clinic") {
      baseStock = [
        { name: "Nano Med-Stim (Heal)", cost: 25, slot: "Consumable", desc: "Fully restores 60 HP instantly. Dr. Marv's discounted rate!" },
        { name: "Ether Mana-Cell (Mana)", cost: 30, slot: "Consumable", desc: "Fully restores 50 ETHER instantly." },
        { name: "Smart-Targeting Visor", cost: 70, slot: "Cyberware", desc: "Adds telemetry targeters (+15 damage to range/hacks)." },
        { name: "Synthetic Muscle Splice", cost: 100, slot: "Cyberware", desc: "Increases strength and reflex speeds (+10 Max HP)." }
      ];
    } else if (poiId === "nouveau_chrome") {
      baseStock = [
        { name: "Apex Mantis electro-blade", cost: 110, slot: "Weapons", desc: "Surgical lightning weapon that cuts armor plates (+25 physical damage)." },
        { name: "Exo-Plated Mesh Armor", cost: 130, slot: "Armor", desc: "Nanotube composite armor with 25% physical absorption." },
        { name: "Unstable Plasma Core", cost: 200, slot: "Material", desc: "High-yield energy module required for highwalk plasma hacks." },
        { name: "Chrono-Shift Augment", cost: 250, slot: "Cyberware", desc: "High-end corporate reflex booster (+15 Max HP, +30 ETHER, +2 DEX)." }
      ];
    }
    
    return baseStock.map(item => ({
      ...item,
      cost: getModifiedCost(item.cost, poiId)
    }));
  };

  // Sell scrap helper
  const handleRecycleScrapDirect = () => {
    handleExecuteAction("Sell circuitry scrap for credits.");
  };

  const derived = getDerivedStats();

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-100 font-sans flex flex-col antialiased relative selection:bg-rose-500 selection:text-white p-0 m-0 overflow-hidden select-none">
      
      {/* Background Ambient Glowing Orbs - Frosted Glass Aesthetics */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-[550px] h-[550px] rounded-full bg-rose-500/10 blur-[150px] animate-pulse-slow" />
        <div className="absolute top-[50%] left-[60%] w-[350px] h-[350px] rounded-full bg-violet-600/5 blur-[120px] animate-pulse-slow" />
        
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-x-0 top-0 h-full opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>



      {/* SAVE TOAST POPUP */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-md border border-cyan-500/30 bg-slate-950/90 text-cyan-400 font-mono text-xs flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full h-full p-2 sm:p-3 flex flex-col gap-2 z-10 transition-all flex-1 overflow-hidden min-h-0">

        <AnimatePresence mode="wait">
          
          {/* ==============================================
              SCREEN 1: GAMEPLAY MAIN MENU
             ============================================== */}
          {currentScreen === "menu" && (
            <MainMenuScreen
              hasSave={hasSave}
              onNewGame={() => {
                setCharSelectStep(1);
                setSelectedPerks([]);
                setStatPointsPool(10);
                setAddedStats({ str: 0, dex: 0, int: 0, will: 0, eth: 0 });
                setCurrentScreen("character_select");
              }}
              onLoadGame={handleLoadGame}
              onWipeSave={handleWipeAllSaves}
            />
          )}

                    {/* ==============================================
              SCREEN 2: CHARACTER CREATION WIZARD (3 STEPS)
             ============================================== */}
          {currentScreen === "character_select" && (
            <CharacterSelectScreen />
          )}

          {/* ==============================================
              SCREEN 2.5: INTRO STORY & CONTROLS GUIDE
             ============================================== */}
          {currentScreen === "intro_story" && gameState && (
            <IntroStoryScreen
              gameState={gameState}
              selectedArchetype={selectedArchetype}
              onAdjustBiometrics={() => {
                setCurrentScreen("character_select");
              }}
              onCommenceInfiltration={() => {
                setCurrentScreen("game");
                triggerToast("NEURAL INTERFACE LOCKED. WELCOME BACK, RUNNER.");
              }}
            />
          )}

                    {/* ==============================================
              SCREEN 3: ACTIVE GAMEPLAY GRID
             ============================================== */}
          {currentScreen === "game" && gameState && (
            <motion.div
              key="active-game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2 w-full h-full flex-1 min-h-0 overflow-hidden relative"
            >
              <WeatherOverlay weather={gameState.weather || "clear"} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch h-full flex-1 min-h-0 overflow-hidden">
              
              {/* MAIN EXPANDED EXPLORATION VIEW (MAP & SCANNER) */}
              {gameTab === "exploration" && (
                <>
                <div className="lg:col-span-12 flex flex-col gap-2 h-full flex-1 min-h-0 overflow-hidden">

                {/* THE HIGHEST CRAFTED CENTRAL SCREEN MAP OR POI BLUEPRINT SCENE */}
                {!gameState.combatState?.isActive && (
                  <div className="glass-panel rounded-xl p-2.5 shadow-2xl text-slate-100 flex flex-col gap-2 box-glow-cyan h-full flex-1 min-h-0 overflow-hidden">
                  
                  {/* Header Selector Switch for holographic routing */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-white/10 pb-1.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <Compass size={14} className="text-cyan-400" />
                      <span className="font-display font-extrabold text-[11px] uppercase tracking-wider text-slate-100">
                        {activePOIView ? `DETAILED LOCAL SCANNER: ${gameState.poi}` : "HOLOGRAPHIC TRANSIT REGION INTERCEPT"}
                      </span>
                    </div>

                    {/* Regional Switch Panel on top of Holographic view (Humble human readable display of active sector status) */}
                    {!activePOIView && (
                      <div className="font-mono text-[9.5px] uppercase tracking-wider text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded border border-white/5 flex items-center gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        ACTIVE SECTOR: <span className="text-cyan-400 font-extrabold">{REGIONS.find(r => r.id === activeRegionId)?.name.toUpperCase() || "UNKNOWN"}</span>
                      </div>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    
                    {/* VIEW A: DETAILED GLOBAL REGION GRID */}
                    {!activePOIView ? (
                      <motion.div
                        key="global-map"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative bg-slate-950 border border-white/10 rounded-xl h-[calc(100vh-200px)] min-h-[300px] overflow-hidden shadow-inner flex flex-col items-center justify-center p-3 group"
                        id="holographic-tactical-map"
                      >
                        {/* Selected Region Background Map Imagery with Cyberpunk tint */}
                        <div className="absolute inset-0 z-0">
                          <img
                            src={REGIONS.find(r => r.id === activeRegionId)?.bgImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"}
                            alt="Cyberpunk Sector Grid"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-65 filter saturate-150 contrast-125 select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80" />
                          
                          {/* Radial glowing core map layout decoration */}
                          <div className="absolute inset-x-0 top-0 h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        </div>

                        {/* Interactive District Pins Map Grid */}
                        <div className="absolute inset-x-0 h-full w-full max-w-4xl mx-auto z-10">
                          {(() => {
                            const basePOIs = MAP_POIS.filter(poi => poi.district === activeRegionId);
                            const customReg = (gameState?.customPOIsRegistry || []).filter(p => p.district === activeRegionId);
                            const mergedMap: Record<string, any> = {};
                            basePOIs.forEach(p => { mergedMap[p.id] = p; });
                            customReg.forEach(p => {
                              // If custom POI has the same ID or new ID, merge with standard MapPOI interface
                              mergedMap[p.id] = {
                                ...(mergedMap[p.id] || {}),
                                ...p,
                                id: p.id,
                                name: p.name,
                                district: p.district,
                                type: p.type || (p.category === "medical" ? "safehouse" : p.category === "shop" ? "shop" : "social"),
                                x: p.x,
                                y: p.y,
                                image: p.bgImage || p.image || mergedMap[p.id]?.image,
                                buttons: (p.actions && p.actions.length > 0) ? p.actions.map(a => a.label) : (mergedMap[p.id]?.buttons || [])
                              };
                            });
                            return Object.values(mergedMap);
                          })().map((p: any, idx: number) => {
                            const isCurrentlyHere = gameState.poi === p.name;
                            
                            // Check if an active campaign quest targets this POI
                            const questPinDirective = (() => {
                              if (!gameState?.campaignQuestsRegistry) return null;
                              for (const quest of gameState.campaignQuestsRegistry) {
                                if (quest.status !== "ACTIVE") continue;
                                const currentStage = quest.stages?.find(s => !s.completed);
                                if (!currentStage) continue;
                                const targetPoiLower = (currentStage.targetPOI || "").toLowerCase();
                                const pNameLower = p.name.toLowerCase();
                                const pIdLower = p.id.toLowerCase();
                                if (targetPoiLower && (pNameLower.includes(targetPoiLower) || pIdLower.includes(targetPoiLower) || targetPoiLower.includes(pIdLower))) {
                                  return { quest, stage: currentStage };
                                }
                              }
                              return null;
                            })();

                            // Determine type details for better icons and indicators
                            const isClinic = p.id === "marv_clinic" || p.name.toLowerCase().includes("clinic");
                            const isSafehouse = p.type === "safehouse" || p.id === "hideout" || p.id === "neon_shrine";
                            const isShop = p.type === "shop" && !isClinic;

                            let nodeIcon = null;
                            let nodeColorClasses = "";
                            let nodeBlinkerColor = "bg-slate-400";

                            if (questPinDirective) {
                              nodeColorClasses = "bg-amber-500 border-amber-200 text-amber-950 shadow-[0_0_16px_rgba(245,158,11,0.95)] ring-2 ring-amber-400/80 animate-pulse";
                              nodeBlinkerColor = "bg-amber-400";
                            } else if (isCurrentlyHere) {
                              nodeColorClasses = "bg-cyan-500 border-cyan-200 text-cyan-950 shadow-[0_0_18px_rgba(34,211,238,0.95)]";
                              nodeBlinkerColor = "bg-cyan-400";
                            } else if (isClinic) {
                              nodeColorClasses = "bg-emerald-600 border-emerald-950 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.7)] group-hover/pin:bg-emerald-500 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-emerald-500";
                            } else if (isSafehouse) {
                              nodeColorClasses = "bg-cyan-600 border-cyan-950 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.7)] group-hover/pin:bg-cyan-500 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-cyan-500";
                            } else if (isShop) {
                              nodeColorClasses = "bg-amber-500 border-amber-950 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.7)] group-hover/pin:bg-amber-400 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-amber-500";
                            } else if (p.type === "combat") {
                              nodeColorClasses = "bg-rose-600 border-rose-950 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.7)] group-hover/pin:bg-rose-500 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-rose-500";
                            } else if (p.type === "social") {
                              nodeColorClasses = "bg-indigo-600 border-indigo-950 text-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.6)] group-hover/pin:bg-indigo-500 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-indigo-500";
                            } else if (p.type === "hiring") {
                              nodeColorClasses = "bg-teal-600 border-teal-950 text-teal-100 shadow-[0_0_10px_rgba(20,184,166,0.6)] group-hover/pin:bg-teal-500 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-teal-500";
                            } else {
                              // quest / default
                              nodeColorClasses = "bg-slate-600 border-slate-950 text-slate-100 shadow-[0_0_8px_rgba(100,116,139,0.5)] group-hover/pin:bg-slate-500 group-hover/pin:scale-110";
                              nodeBlinkerColor = "bg-slate-400";
                            }

                            // Select icon component dynamically
                            if (isClinic) {
                              nodeIcon = <Pill size={11} className="stroke-[2.5]" />;
                            } else if (isSafehouse) {
                              nodeIcon = <Shield size={11} className="stroke-[2.5]" />;
                            } else if (isShop) {
                              nodeIcon = <ShoppingCart size={11} className="stroke-[2.5]" />;
                            } else if (p.type === "combat") {
                              nodeIcon = <Sword size={11} className="stroke-[2.5]" />;
                            } else if (p.type === "social") {
                              nodeIcon = <Users size={11} className="stroke-[2.5]" />;
                            } else if (p.type === "hiring") {
                              nodeIcon = <Briefcase size={11} className="stroke-[2.5]" />;
                            } else {
                              nodeIcon = <MapPin size={11} className="stroke-[2.5]" />;
                            }

                            return (
                              <motion.button
                                key={`${p.id}-${activeRegionId}`}
                                initial={{ scale: 0, opacity: 0, y: -15 }}
                                animate={{
                                  scale: isCurrentlyHere ? [0, 1.38, 0.92, 1.12, 1] : [0, 1.25, 0.95, 1],
                                  opacity: 1,
                                  y: 0
                                }}
                                transition={{
                                  duration: 0.55,
                                  delay: idx * 0.07,
                                  ease: [0.34, 1.56, 0.64, 1]
                                }}
                                onClick={() => {
                                  if (activeDialogue || gameState?.activeBranchingDialogue || squadDialogue) {
                                    triggerToast("⚠️ ACTIVE DIALOGUE: Complete your conversation before traveling!");
                                    return;
                                  }
                                  if (gameState.stamina <= 0) {
                                    const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                                    if (!isPrologue) {
                                      let collapseState = { ...gameState };
                                      collapseState.stamina = collapseState.maxStamina || 100;
                                      collapseState.hp = Math.max(collapseState.hp, 25);
                                      collapseState.district = "aurus";
                                      collapseState.poi = "Main Headquarters (The Hideout)";
                                      setActiveRegionId("aurus");
                                      setActivePOIView("hideout");
                                      
                                      setGameState(collapseState);
                                      setLogs(prev => [
                                        ...prev,
                                        {
                                          id: crypto.randomUUID(),
                                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                          text: `🚨 NEURAL BLACKOUT ON NAVIGATION: You attempted to navigate to "${p.name}" with 0/100 Stamina. Your actuators failed, and you collapsed. Your emergency backup beacon auto-teleported you back to the Aurus Safehouse bunk, restoring your systems to 100%.`,
                                          type: "system",
                                          district: "aurus",
                                          poi: "Main Headquarters (The Hideout)"
                                        }
                                      ]);
                                      triggerToast("EXHAUSTED: Returned to Safehouse");
                                      return;
                                    } else {
                                      // Prologue second wind
                                      let prologueState = { ...gameState };
                                      prologueState.stamina = 50;
                                      setGameState(prologueState);
                                      setLogs(prev => [
                                        ...prev,
                                        {
                                          id: crypto.randomUUID(),
                                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                          text: `🔋 SECOND WIND: Companion Vice overrides your cyberdeck constraints, injecting an emergency backup recharge: +50 Stamina.`,
                                          type: "system",
                                          district: gameState.district,
                                          poi: gameState.poi
                                        }
                                      ]);
                                      triggerToast("Prologue Second Wind: +50 Stamina");
                                      return;
                                    }
                                  }

                                  // Update game POI
                                  let nextState = { ...gameState };
                                  nextState.poi = p.name;
                                  nextState.district = p.district;
                                  const travelResult = handleStaminaAndWeatherOnTravel(nextState, false, p.name);
                                  nextState = travelResult.nextState;
                                  setGameState(nextState);
                                  setActivePOIView(p.id);
                                  const newLogs = [
                                    ...logs,
                                    {
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                      text: `[TRANSIT COMMITTED]: Safe arrival coordinates established at "${p.name}". Initialized local area detail blueprint.`,
                                      type: "system" as const,
                                      district: p.district,
                                      poi: p.name
                                    },
                                    ...travelResult.logs
                                  ];
                                  setLogs(newLogs);
                                  triggerAutosave(nextState, newLogs);
                                  if (travelResult.warningText) {
                                    triggerToast(travelResult.warningText);
                                  }
                                }}
                                className="absolute transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-lg group/pin z-20"
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                              >
                                {/* Blinker Node - Only the active pin (isCurrentlyHere) pulses subtly */}
                                <div className="relative flex items-center justify-center">
                                  {isCurrentlyHere && (
                                    <motion.span
                                      animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0.1, 0.45] }}
                                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                      className="absolute inline-flex h-8 w-8 rounded-full border border-cyan-400/60 bg-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.3)] pointer-events-none"
                                    />
                                  )}
                                  <div
                                    className={`relative inline-flex items-center justify-center rounded-full h-6.5 w-6.5 border-2 shadow-lg transition-all transform group-hover/pin:scale-125 ${nodeColorClasses}`}
                                  >
                                    {nodeIcon}
                                    {questPinDirective && (
                                      <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-amber-200 shadow-[0_0_8px_rgba(245,158,11,1)] animate-bounce z-30">
                                        ⚡
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Holographic Tooltip above pin on hover */}
                                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-950/95 border border-white/20 whitespace-nowrap px-2.5 py-1.5 rounded-md shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-all pointer-events-none scale-90 group-hover/pin:scale-100 z-50 text-left font-mono max-w-xs">
                                    <p className="text-2xs font-extrabold text-white flex items-center gap-1">
                                      <span className={`w-1 h-1 rounded-full ${isCurrentlyHere ? "bg-cyan-400" : questPinDirective ? "bg-amber-400" : "bg-slate-400"}`} />
                                      {p.name.toUpperCase()}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">
                                      {isClinic ? "clinic" : isSafehouse ? "safehouse" : isShop ? "shop" : p.type} node
                                    </p>
                                    {questPinDirective && (
                                      <p className="text-[8.5px] text-amber-300 mt-1 font-bold border-t border-amber-500/30 pt-0.5 whitespace-normal">
                                        ⚡ DIRECTIVE: {questPinDirective.quest.title} - {questPinDirective.stage.title}
                                      </p>
                                    )}
                                    {isCurrentlyHere && <p className="text-[8.5px] text-cyan-400 mt-0.5">✓ CURRENT COORDINATE</p>}
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}

                          {/* Transit / Edge travel connections */}
                          {REGION_CONNECTIONS[activeRegionId]?.map((conn, connIdx) => {
                            const targetReg = REGIONS.find(r => r.id === conn.targetRegionId);
                            if (!targetReg) return null;
                            
                            const currentIsPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                            const targetIsPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(conn.targetRegionId);
                            
                            // If we are in the prologue, do not show non-prologue targets.
                            // If we are in Chapter 1, do not show prologue targets (Conduit, Shatter-Ridge, Data).
                            if (currentIsPrologue !== targetIsPrologue) return null;

                            return (
                              <motion.button
                                key={`${conn.targetRegionId}-${activeRegionId}`}
                                initial={{ scale: 0, opacity: 0, y: -12 }}
                                animate={{ scale: [0, 1.28, 0.95, 1], opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.5,
                                  delay: (MAP_POIS.filter(poi => poi.district === activeRegionId).length * 0.06) + (connIdx * 0.08),
                                  ease: [0.34, 1.56, 0.64, 1]
                                }}
                                onClick={() => {
                                  if (activeDialogue || gameState?.activeBranchingDialogue || squadDialogue) {
                                    triggerToast("⚠️ ACTIVE DIALOGUE: Complete your conversation before traveling!");
                                    return;
                                  }
                                  handleSwitchRegion(conn.targetRegionId);
                                }}
                                className="absolute transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-xl group/transit z-30"
                                style={{ left: `${conn.x}%`, top: `${conn.y}%` }}
                              >
                                <div className="relative flex items-center justify-center">
                                  {/* Static subtle halo ring */}
                                  <span className="absolute inline-flex h-7 w-7 rounded-full bg-amber-500/20 border border-amber-500/30 pointer-events-none" />
                                  <div className="relative inline-flex items-center justify-center rounded-full h-5.5 w-5.5 border-2 border-amber-400 bg-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] group-hover/transit:scale-125 transition-all text-amber-400">
                                    <Compass size={11} className="animate-spin-slow text-amber-400" />
                                  </div>
                                  
                                  {/* Label displayed on hover */}
                                  <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 bg-slate-950/95 border border-amber-500/30 whitespace-nowrap px-2.5 py-1.5 rounded-md shadow-2xl opacity-0 group-hover/transit:opacity-100 transition-all pointer-events-none scale-90 group-hover/transit:scale-100 z-50 text-left font-mono">
                                    <p className="text-2xs font-extrabold text-amber-400 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                      {conn.label}
                                    </p>
                                    <p className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">CLICK TO TRAVEL BETWEEN DISTRICTS</p>
                                    <p className="text-[8px] text-amber-400/80 mt-0.5 font-sans uppercase tracking-wider">⚡ REQUIRES STAMINA</p>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="detailed-poi-view"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="bg-slate-950/95 border border-cyan-500/30 rounded-xl p-3 md:p-4 shadow-[0_0_25px_rgba(6,182,212,0.05)] h-[calc(100vh-200px)] min-h-[300px] overflow-y-auto"
                      >
                        {(() => {
                          const isDialogueActive = squadDialogue || gameState?.activeBranchingDialogue || activeDialogue;
                          const isQuestIntercept = hasActiveQuestIntercept(activePOIView);
                          const customPOIOverride = (gameState.customPOIsRegistry || []).find(p => p.id === activePOIView);
                          if (!isDialogueActive && (!isQuestIntercept || !!customPOIOverride)) {
                            const found = customPOIOverride || MAP_POIS.find(p => p.id === activePOIView);
                            if (found) {
                              const resolvedPOI: CustomPOIData = {
                                id: found.id,
                                name: found.name,
                                district: found.district || gameState.district || "",
                                category: (found as any).category || (
                                  found.id === "hideout" ? "safehouse" :
                                  found.name.toLowerCase().includes("clinic") ? "medical" :
                                  found.name.toLowerCase().includes("market") || found.name.toLowerCase().includes("shop") ? "shop" :
                                  found.name.toLowerCase().includes("auction") ? "auction" :
                                  found.name.toLowerCase().includes("bar") || found.name.toLowerCase().includes("abyss") ? "social" :
                                  found.name.toLowerCase().includes("temple") || found.name.toLowerCase().includes("shrine") ? "temple" : "social"
                                ),
                                desc: found.desc || (found as any).description || "Megacity-9 Local Grid Node. Scan line frequencies align.",
                                x: found.x,
                                y: found.y,
                                image: found.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
                                isUnlocked: true,
                                services: (found as any).services || {
                                  shop: {
                                    enabled: found.name.toLowerCase().includes("market") || found.name.toLowerCase().includes("shop") || found.id === "hideout",
                                    merchantName: found.name.includes("Black Market") ? "Fixer Corvus" : "Local Merchant",
                                    merchantTitle: "Arms & Smuggled Hardware Dealer",
                                    greeting: "Got clean credits? Look around, but don't touch what you can't afford.",
                                    priceMultiplier: 1.0,
                                    allowSell: true,
                                    items: ["Health Stimpack", "Cyber-Ammo Pack", "Energy Cell", "Tactical Cyber-SMG", "Nano Med-Stim"]
                                  },
                                  clinic: {
                                    enabled: found.name.toLowerCase().includes("clinic") || found.id === "hideout",
                                    doctorName: "Dr. Rachel Sterling",
                                    greeting: "The trauma beds are warmed up. Try to keep your limbs attached.",
                                    healHpCost: 15,
                                    healStaminaCost: 10,
                                    surgeryUpgradeCost: 150
                                  },
                                  rest: {
                                    enabled: found.id === "hideout",
                                    comfortLevel: "Premium Safehouse Cot",
                                    staminaRegen: 100,
                                    restNarrative: "You lock the heavy biometric deadbolts of your safehouse apartment. Laying down on the clean military cot, you fall into a deep, dreamless sleep as the ambient drone of the city thrums through the concrete walls."
                                  },
                                  auction: {
                                    enabled: found.name.toLowerCase().includes("auction") || found.name.toLowerCase().includes("market"),
                                    lobbyGreeting: "Welcome to the Under-Grid Servitude Exchange."
                                  },
                                  contracts: {
                                    enabled: found.name.toLowerCase().includes("bar") || found.id === "hideout" || found.name.toLowerCase().includes("abyss"),
                                    availableQuestIds: []
                                  },
                                  rumors: {
                                    enabled: true,
                                    rumorList: [
                                      "Whispers on the net say Ares Biotech is secret-testing a cognitive mindmancer deck under Level B4.",
                                      "Titan Logistics is running illegal military stims from the outer orbital stations.",
                                      "A cyber-gladiator named Mira Voss is looking for someone strong enough to challenge her at the Aurus Pit."
                                    ]
                                  }
                                },
                                actions: (found as any).actions || [],
                                buttons: (found as any).buttons || [],
                                placedNPCIds: (found as any).placedNPCIds || (
                                  found.id === "hideout" ? ["vice"] :
                                  found.id === "neon_abyss_bar" ? ["jax", "mira_voss"] :
                                  found.id === "temple_gardens" ? ["morgana"] : []
                                )
                              };
                              return (
                                <POIInteriorHub
                                  poi={resolvedPOI}
                                  gameState={gameState}
                                  setGameState={setGameState}
                                  setLogs={setLogs}
                                  triggerToast={triggerToast}
                                  onReturnToMap={() => {
                                    setActivePOIView(null);
                                    setActiveDialogue(null);
                                  }}
                                  onStartDialogue={(npcId, nodeId) => {
                                    setGameState(prev => ({
                                      ...prev,
                                      activeBranchingDialogue: { npcId, nodeId: nodeId || "start" }
                                    }));
                                  }}
                                  onLaunchQuestScene={(sceneId, stepId) => {
                                    const scene = { ...DEFAULT_POI_INTERACTIVE_SCENES, ...(gameState.poiInteractiveScenes || {}) }[sceneId];
                                    setActiveDialogue(sceneId);
                                    setRelicStep((stepId || scene?.initialStepId || "intro") as any);
                                  }}
                                  onExecuteAction={(actionText) => {
                                    handleExecuteAction(actionText);
                                  }}
                                  completedActions={gameState.completedPOIActions || []}
                                />
                              );
                            }
                          }

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full h-full">
                        {/* Left half: POI scenery illustration frame */}
                        <div className="lg:col-span-5 flex flex-col justify-between relative rounded-xl overflow-hidden border border-white/10 group min-h-[220px] lg:min-h-[340px]">
                          {/* Main Close-up Illustrated Photo of local environment */}
                          <img
                            src={MAP_POIS.find(p => p.id === activePOIView)?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"}
                            alt={gameState.poi}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover select-none filter brightness-90 saturate-125 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/80 z-10" />

                          {/* Scanner visual laser lines overlay */}
                          <div className="absolute inset-x-0 h-0.5 bg-cyan-400/30 blur-[2px] shadow-[0_0_10px_rgba(34,211,238,0.5)] top-[10%] animate-pulse z-10" />
                          <div className="absolute inset-x-0 top-0 h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] z-10" />

                          {/* Top Tag info inside image */}
                          <div className="p-2 z-10 flex justify-between items-center bg-slate-950/80 backdrop-blur-sm border-b border-white/5 uppercase font-mono text-[9px] text-slate-400">
                            <span>GRID LOCALITY FILE</span>
                            <span className="text-cyan-400 font-bold">STATUS: VISITED</span>
                          </div>

                          {/* Lower scene metadata over image overlay */}
                          <div className="p-3 z-10 font-mono">
                            <span className="text-cyan-400 text-3xs tracking-wider uppercase font-extrabold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              NODE SCAN COMPLETE
                            </span>
                            <p className="text-sm font-black font-display text-white mt-0.5 uppercase tracking-wide leading-none">
                              {MAP_POIS.find(p => p.id === activePOIView)?.name.replace("Main Headquarters ", "")}
                            </p>
                          </div>
                        </div>

                        {/* Right half: Detailed text and local operational interaction terminal */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-3xs font-mono uppercase tracking-[0.15em] text-cyan-400 font-black leading-none">
                              LOCAL DESCRIPTOR CONSOLE
                            </h4>
                            <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-left font-medium">
                              {getPOIDescription(activePOIView)}
                            </p>
                          </div>

                          {/* Dynamic NPC Dialog or Scene Buttons depending on dialogue engagement */}
                          <div className="border-t border-white/5 pt-4">
                            <AnimatePresence mode="wait">
                              {squadDialogue ? (
                                (() => {
                                  const node = SQUAD_DIALOGUES[squadDialogue.sceneId]?.[squadDialogue.nodeId];
                                  if (!node) return null;
                                  return (
                                    <motion.div
                                      key={`squad-${squadDialogue.sceneId}-${squadDialogue.nodeId}`}
                                      variants={slideInVariants}
                                      initial="initial"
                                      animate="animate"
                                      exit="exit"
                                      transition={{ duration: 0.25, ease: "easeOut" }}
                                      className="bg-slate-950/95 border border-cyan-500/50 rounded-xl p-5 relative flex flex-col gap-4 font-mono shadow-2xl box-glow text-left"
                                    >
                                      <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                        <span className="text-cyan-400 font-extrabold text-[12px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                          <Compass size={14} className="text-cyan-500" /> SQUAD TRANSMISSION CONDUIT
                                        </span>
                                        <span className="text-3xs text-cyan-500 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                                          {squadDialogue.sceneId} interaction
                                        </span>
                                      </div>
                                      
                                      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start text-left">
                                        {node.portrait && (
                                          <div className="relative flex-shrink-0">
                                            <img
                                              src={node.portrait}
                                              alt={node.speakerName}
                                              referrerPolicy="no-referrer"
                                              className="w-16 h-16 object-cover rounded-xl border-2 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-950" />
                                          </div>
                                        )}
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <h4 className="text-sm font-extrabold text-cyan-300">{node.speakerName}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{node.speakerRole}</p>
                                          </div>
                                          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                            "{node.text}"
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 gap-2 mt-2">
                                        {node.choices.map((choice, cIdx) => (
                                          <button
                                            key={cIdx}
                                            onClick={() => {
                                              if (choice.effect && gameState) {
                                                let updated = choice.effect({ ...gameState });
                                                setGameState(updated);
                                              }
                                              if (choice.nodeId !== undefined) {
                                                if (choice.nodeId === null) {
                                                  setSquadDialogue(null);
                                                  if (gameState) {
                                                    let next = { ...gameState };
                                                    if (!next.completedPOIActions) next.completedPOIActions = [];
                                                    if (squadDialogue.sceneId === "banter") {
                                                      next.completedPOIActions.push("ventilation_shaft:talk_to_vice_tracker");
                                                      next.completedPOIActions.push("blast_door:banter");
                                                    } else if (squadDialogue.sceneId === "peptalk") {
                                                      next.completedPOIActions.push("shatter_ridge_security_post:peptalk");
                                                    } else if (squadDialogue.sceneId === "tactics") {
                                                      next.completedPOIActions.push("shatter_ridge_reactor_well:tactics");
                                                    } else if (squadDialogue.sceneId === "transit_conduit_to_ridge") {
                                                      next.completedPOIActions.push("section_gate:transit");
                                                      next.district = "shatter_ridge_core";
                                                      next.poi = "Shatter-Ridge Security Checkpoint";
                                                      setActiveRegionId("shatter_ridge_core");
                                                      setActivePOIView("shatter_ridge_security_post");
                                                      setActivePopup({
                                                        title: "SHATTER-RIDGE CORE ACCESS",
                                                        subtitle: "DISTRICT TRANSLATION",
                                                        type: "transit",
                                                        text: "You climb through the heavy gate and seal it behind you. You emerge inside the heavily guarded checkpoint of the Shatter-Ridge Core district. Scan the local defensive barrier console."
                                                      });
                                                    } else if (squadDialogue.sceneId === "transit_ridge_to_vault") {
                                                      next.district = "data_vault";
                                                      next.poi = "Sanctuary Hacking Terminal";
                                                      setActiveRegionId("data_vault");
                                                      setActivePOIView("terminal_hacking_puzzle");
                                                      setActivePopup({
                                                        title: "DATA VAULT ENTRANCE",
                                                        subtitle: "CORE SANCTUARY SECURED",
                                                        type: "transit",
                                                        text: "You ride the heavy industrial lift down into the deep sanctuary core. Secure your terminal wire-mesh gear to begin the decryption heist."
                                                      });
                                                    }
                                                    setGameState(next);
                                                  }
                                                } else {
                                                  setSquadDialogue({
                                                    sceneId: squadDialogue.sceneId,
                                                    nodeId: choice.nodeId
                                                  });
                                                }
                                              }
                                            }}
                                            className="text-left w-full px-4 py-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-400 text-cyan-100 font-mono text-xs transition-all flex items-center justify-between cursor-pointer group"
                                          >
                                            <span>&gt; {choice.text}</span>
                                            <span className="text-[10px] text-cyan-500/60 group-hover:text-cyan-300 font-bold">SELECT</span>
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  );
                                })()
                              ) : gameState.activeBranchingDialogue ? (
                              (() => {
                                const activeBranch = gameState.activeBranchingDialogue;
                                const npcId = activeBranch.npcId;
                                const nodeId = activeBranch.nodeId;
                                const node = BRANCHING_DIALOGUES[npcId]?.[nodeId];
                                if (!node) return null;

                                const textContent = typeof node.text === "function" ? node.text(gameState) : node.text;

                                return (
                                  <motion.div
                                    key={`branch-${activeBranch.npcId}-${activeBranch.nodeId}`}
                                    variants={slideInVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="bg-slate-950/95 border border-cyan-500/50 rounded-xl p-5 relative flex flex-col gap-4 font-mono shadow-2xl box-glow text-left"
                                  >
                                    <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                      <span className="text-cyan-400 font-extrabold text-[12px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                        <Compass size={14} className="text-cyan-500" /> SECURED NEURAL LINK // {npcId.toUpperCase()}
                                      </span>
                                      <span className="text-3xs text-cyan-500 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                                        {nodeId} sequence
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start text-left">
                                      <div className="relative flex-shrink-0">
                                        <img
                                          src={node.image}
                                          alt={node.title}
                                          referrerPolicy="no-referrer"
                                          className="w-16 h-16 object-cover rounded-xl border-2 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-950 animate-pulse" />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div>
                                          <h4 className="text-sm font-extrabold text-cyan-300">{node.title}</h4>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{node.role}</p>
                                        </div>
                                        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                                          {textContent}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Faction Ledger Display Inside Conversation */}
                                    <div className="grid grid-cols-3 gap-2.5 bg-slate-900/40 p-3 rounded-lg border border-white/5 text-center">
                                      <div>
                                        <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">STREET OUTLAWS</p>
                                        <div className="flex items-center justify-center gap-1.5 mt-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                          <span className="text-xs font-bold text-cyan-400">{(gameState.reputations?.streetOutlaws ?? 50)}%</span>
                                        </div>
                                      </div>
                                      <div className="border-x border-white/5">
                                        <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">TITAN LOGISTICS</p>
                                        <div className="flex items-center justify-center gap-1.5 mt-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                          <span className="text-xs font-bold text-amber-400">{(gameState.reputations?.titanLogistics ?? 50)}%</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">ARES CORP</p>
                                        <div className="flex items-center justify-center gap-1.5 mt-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                          <span className="text-xs font-bold text-rose-400">{(gameState.reputations?.aresCorporate ?? 50)}%</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                      {node.choices.map((choice, cIdx) => {
                                        const isPrereqMet = choice.prereq ? choice.prereq(gameState) : true;
                                        return (
                                          <button
                                            key={cIdx}
                                            disabled={!isPrereqMet}
                                            onClick={() => {
                                              if (!gameState) return;
                                              let updatedState = { ...gameState };
                                              
                                              // Apply dialogue choice effect
                                              if (choice.onSelect) {
                                                updatedState = choice.onSelect(updatedState);
                                              }
                                              
                                              if (choice.nodeId === "exit") {
                                                updatedState.activeBranchingDialogue = null;
                                                // Create a log entry for dialogue exit
                                                setLogs(prev => [
                                                  ...prev,
                                                  {
                                                    id: crypto.randomUUID(),
                                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                    text: `💬 DIALOGUE TERMINATED: Disconnected neural link with ${node.title}.`,
                                                    type: "system",
                                                    district: updatedState.district,
                                                    poi: updatedState.poi
                                                  }
                                                ]);
                                              } else {
                                                updatedState.activeBranchingDialogue = {
                                                  npcId: npcId,
                                                  nodeId: choice.nodeId
                                                };
                                              }
                                              
                                              setGameState(updatedState);
                                            }}
                                            className={`text-left w-full px-4 py-3 rounded-lg border text-xs transition-all flex items-center justify-between font-mono group ${
                                              isPrereqMet
                                                ? "border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-400 text-cyan-100 cursor-pointer"
                                                : "border-slate-800 bg-slate-950/50 text-slate-500 cursor-not-allowed opacity-60"
                                            }`}
                                          >
                                            <div className="flex flex-col text-left">
                                              <span>&gt; {choice.text}</span>
                                              {choice.prereqText && (
                                                <span className={`text-[10px] mt-0.5 font-bold ${isPrereqMet ? "text-cyan-400/80" : "text-rose-400/80"}`}>
                                                  {choice.prereqText} {isPrereqMet ? "✓" : "✗"}
                                                </span>
                                              )}
                                            </div>
                                            <span className={`text-[10px] font-bold ${isPrereqMet ? "text-cyan-500/60 group-hover:text-cyan-300" : "text-slate-600"}`}>
                                              {isPrereqMet ? "SELECT" : "LOCKED"}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                );
                              })()
                            ) : activeDialogue ? (
                              activeDialogue === "relic_awakening" || (gameState?.poiInteractiveScenes && activeDialogue in gameState.poiInteractiveScenes) || (activeDialogue in DEFAULT_POI_INTERACTIVE_SCENES) ? (
                                (() => {
                                  const resolvedSceneKey = activeDialogue === "relic_awakening" ? "relic_altar" : activeDialogue;
                                  const sceneRegistry: Record<string, POIInteractiveEvent> = {
                                    ...DEFAULT_POI_INTERACTIVE_SCENES,
                                    ...(gameState?.poiInteractiveScenes || {})
                                  };
                                  const sceneData = sceneRegistry[resolvedSceneKey];
                                  if (!sceneData || !sceneData.steps) {
                                    return (
                                      <div className="bg-slate-950 p-4 rounded-xl border border-white/10 text-slate-400 font-mono text-xs">
                                        <p className="text-amber-400 font-bold">⚠️ Scene node data missing for "{resolvedSceneKey}"</p>
                                        <button onClick={() => setActiveDialogue(null)} className="mt-2 px-3 py-1 bg-slate-800 rounded text-slate-200 cursor-pointer">Close</button>
                                      </div>
                                    );
                                  }

                                  const activeStepKey = (relicStep && sceneData.steps[relicStep])
                                    ? relicStep
                                    : (sceneData.steps[sceneData.initialStepId] ? sceneData.initialStepId : Object.keys(sceneData.steps)[0]);
                                  const stepData = sceneData.steps[activeStepKey] || Object.values(sceneData.steps)[0];

                                  const handleExecuteChoice = (choice: POISceneChoice) => {
                                    if (!gameState) return;
                                    let nextState = { ...gameState };

                                    if (choice.triggerHackingPuzzleType) {
                                      setHackingPuzzle(initHackingGame(
                                        choice.triggerHackingPuzzleType,
                                        nextState.attributes?.int || 10,
                                        nextState.skills?.netSlicer || 1
                                      ));
                                      setActiveDialogue(null);
                                      setGameState(nextState);
                                      return;
                                    }

                                    if (choice.combat) {
                                      if (choice.maxHpDelta) {
                                        nextState.maxHp = Math.max(1, nextState.maxHp + choice.maxHpDelta);
                                        nextState.hp = Math.min(nextState.hp, nextState.maxHp);
                                      }
                                      if (choice.unlockMindmancer) {
                                        nextState.mindmancerUnlocked = true;
                                        if (nextState.skills) nextState.skills.mindmancer = Math.max(1, nextState.skills.mindmancer || 0);
                                      }
                                      nextState.combatState = {
                                        enemyName: choice.combat.enemyName,
                                        enemyHp: choice.combat.enemyHp,
                                        enemyMaxHp: choice.combat.enemyHp,
                                        enemyShields: choice.combat.enemyShields || 0,
                                        enemyMaxShields: choice.combat.enemyShields || 0,
                                        isActive: true,
                                        turnLog: choice.combat.turnLog,
                                        victorySceneId: choice.combat.victorySceneId,
                                        victoryCompletionAction: choice.combat.victoryCompletionAction
                                      };
                                      setActiveDialogue(null);
                                      setGameState(nextState);
                                      return;
                                    }

                                    // Stat / Skill checks evaluation
                                    if (choice.checkType && choice.checkType !== "none") {
                                      const rollD20 = Math.floor(Math.random() * 20) + 1;
                                      let statVal = 0;
                                      if (choice.checkType === "int") statVal = nextState.attributes?.int || 10;
                                      else if (choice.checkType === "str") statVal = nextState.attributes?.str || 10;
                                      else if (choice.checkType === "dex") statVal = nextState.attributes?.dex || 10;
                                      else if (choice.checkType === "will") statVal = nextState.attributes?.will || 10;
                                      else if (choice.checkType === "mindmancer") statVal = (nextState.skills?.mindmancer || 0) * 3;
                                      
                                      let totalRoll = rollD20 + statVal;
                                      let isSuccess = totalRoll >= (choice.checkValue || 10);
                                      if (choice.checkType === "credits") {
                                        totalRoll = nextState.credits;
                                        isSuccess = nextState.credits >= (choice.checkValue || 0);
                                      } else if (choice.checkType === "mana") {
                                        totalRoll = nextState.mana;
                                        isSuccess = nextState.mana >= (choice.checkValue || 0);
                                      } else if (choice.checkType === "item") {
                                        const requiredQuantity = Math.max(1, choice.requiredItemQuantity || 1);
                                        totalRoll = nextState.inventory.filter(item => item === (choice.requiredItem || "")).length;
                                        isSuccess = totalRoll >= requiredQuantity;
                                      }

                                      if (!isSuccess) {
                                        if (choice.failureHpDamage) nextState.hp = Math.max(1, nextState.hp - choice.failureHpDamage);
                                        if (choice.failureManaDamage) nextState.mana = Math.max(0, nextState.mana - choice.failureManaDamage);
                                        triggerToast(`⚠️ CHECK FAILED: ${totalRoll} vs ${choice.checkValue || 10}`);
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: choice.failureNarrative || `[CHECK FAILURE]: ${totalRoll} vs ${choice.checkValue || 10} (${choice.checkType.toUpperCase()}).`,
                                            type: "system" as const,
                                            district: nextState.district,
                                            poi: nextState.poi
                                          }
                                        ]);
                                        setGameState(nextState);
                                        if (choice.failureTargetStepId) setRelicStep(choice.failureTargetStepId as any);
                                        return;
                                      } else {
                                        if (choice.checkType === "credits") nextState.credits -= choice.checkValue || 0;
                                        if (choice.checkType === "mana") nextState.mana -= choice.checkValue || 0;
                                        if (choice.checkType === "item" && choice.consumeItem) {
                                          const requiredQuantity = Math.max(1, choice.requiredItemQuantity || 1);
                                          for (let count = 0; count < requiredQuantity; count += 1) {
                                            const index = nextState.inventory.indexOf(choice.requiredItem || "");
                                            if (index >= 0) nextState.inventory.splice(index, 1);
                                          }
                                        }
                                        triggerToast(`⚡ CHECK SUCCESS: ${totalRoll} vs ${choice.checkValue || 10}!`);
                                      }
                                    }

                                    // Grant Rewards
                                    if (choice.grantsXP) {
                                      nextState.experience += choice.grantsXP;
                                      triggerToast(`+${choice.grantsXP} XP Granted`);
                                    }
                                    if (choice.grantsCredits) {
                                      nextState.credits += choice.grantsCredits;
                                      triggerToast(`+${choice.grantsCredits}¤ Credits Granted`);
                                    }
                                    if (choice.grantsItem) {
                                      const quantity = Math.max(1, choice.grantsItemQuantity || 1);
                                      if (quantity > 1 || !nextState.inventory.includes(choice.grantsItem)) {
                                        nextState.inventory = [...Array(quantity).fill(choice.grantsItem), ...nextState.inventory];
                                        triggerToast(`Item Acquired: ${choice.grantsItem}${quantity > 1 ? ` x${quantity}` : ""}`);
                                      }
                                    }
                                    if (choice.grantsHp) nextState.hp = Math.min(nextState.maxHp, nextState.hp + choice.grantsHp);
                                    if (choice.grantsMana) nextState.mana = Math.min(nextState.maxMana, nextState.mana + choice.grantsMana);
                                    if (choice.grantsMindmancerSkill && nextState.skills) nextState.skills.mindmancer += choice.grantsMindmancerSkill;
                                    if (choice.clearParty) nextState.party = [];
                                    if (choice.completionAction) {
                                      nextState.completedPOIActions = Array.from(new Set([
                                        ...(nextState.completedPOIActions || []),
                                        choice.completionAction
                                      ]));
                                      nextState = synchronizeQuestProgress(nextState);
                                    }
                                    if (choice.completeQuestId) nextState = completeQuest(synchronizeQuestProgress(nextState), choice.completeQuestId);
                                    if (choice.activateQuestId) nextState = activateQuest(nextState, choice.activateQuestId);
                                    if (choice.unlockDistrictId) {
                                      nextState.district = choice.unlockDistrictId;
                                      setActiveRegionId(choice.unlockDistrictId);
                                    }

                                    // Narrative Log Output
                                    if (choice.outcomeNarrative) {
                                      const newEntry = {
                                        id: crypto.randomUUID(),
                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        text: `[${choice.label}]: ${choice.outcomeNarrative}`,
                                        type: "narration" as const,
                                        district: nextState.district,
                                        poi: nextState.poi
                                      };
                                      setLogs(prev => [...prev, newEntry]);
                                    }

                                    setGameState(nextState);

                                    // Step Branching
                                    if (choice.targetStepId === "__EXIT__") {
                                      setActiveDialogue(null);
                                      setRelicStep("intro");
                                    } else if (choice.targetStepId) {
                                      setRelicStep(choice.targetStepId as any);
                                    } else if (choice.targetPOIId) {
                                      const targetPOI = MAP_POIS.find(poi => poi.id === choice.targetPOIId);
                                      if (targetPOI) {
                                        nextState.poi = targetPOI.name;
                                        nextState.district = targetPOI.district;
                                        setActiveRegionId(targetPOI.district);
                                        setGameState(nextState);
                                      }
                                      setActivePOIView(choice.targetPOIId);
                                      setActiveDialogue(null);
                                      setRelicStep("intro");
                                    } else {
                                      setActiveDialogue(null);
                                      setRelicStep("intro");
                                    }
                                  };

                                  return (
                                    <motion.div
                                      key={`poi-scene-${resolvedSceneKey}-${activeStepKey}`}
                                      variants={slideInVariants}
                                      initial="initial"
                                      animate="animate"
                                      exit="exit"
                                      transition={{ duration: 0.25, ease: "easeOut" }}
                                      className="bg-slate-950/95 border border-purple-500/50 rounded-xl p-5 relative flex flex-col gap-4 font-mono shadow-2xl box-glow-pink"
                                    >
                                      {/* Header Bar */}
                                      <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                                        <span className="text-purple-400 font-extrabold text-[12px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                          <Zap size={14} className="text-purple-500" /> {stepData.stepTitle || sceneData.title}
                                        </span>
                                        <span className="text-3xs text-purple-500 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                                          {stepData.badgeLabel || "ACTIVE CONSOLE FIELD"}
                                        </span>
                                      </div>

                                      {/* Landscape Cinematic Viewport Box */}
                                      <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-inner group">
                                        <div className="aspect-[21/9] sm:aspect-[24/9] w-full relative overflow-hidden bg-slate-900">
                                          <img
                                            src={stepData.bannerImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
                                            alt={stepData.bannerTitle}
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                          <div className="absolute inset-0 bg-purple-950/20 mix-blend-color-dodge pointer-events-none" />
                                          
                                          {/* Scanlines Effect */}
                                          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

                                          {/* Bottom Overlay Info inside Banner */}
                                          <div className="absolute bottom-3 left-4 right-4 text-left">
                                            <span className="text-4xs font-mono uppercase tracking-widest text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40 backdrop-blur-sm">
                                              ANOMALY SCAN FEED
                                            </span>
                                            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-tight mt-1 drop-shadow-md">
                                              {stepData.bannerTitle}
                                            </h3>
                                          </div>
                                        </div>

                                        {/* Cinematic Narrative Text */}
                                        <div className="p-4 bg-slate-950/80 text-left border-t border-purple-500/20 space-y-2">
                                          {stepData.narrativeText.split("\n\n").map((para, pIdx) => (
                                            <p key={pIdx} className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">
                                              {para}
                                            </p>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Dynamic Companion Dialogue Barks */}
                                      {stepData.companions && stepData.companions.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                          {stepData.companions.map((comp) => {
                                            const isVice = comp.id.includes("vice") || comp.name.toLowerCase().includes("vice");
                                            const isTracker = comp.id.includes("tracker") || comp.name.toLowerCase().includes("tracker");
                                            const borderClass = isVice 
                                              ? "border-rose-500/30 bg-rose-950/20" 
                                              : isTracker 
                                                ? "border-amber-500/30 bg-amber-950/20"
                                                : "border-cyan-500/30 bg-cyan-950/20";
                                            const textClass = isVice ? "text-rose-400" : isTracker ? "text-amber-400" : "text-cyan-400";

                                            return (
                                              <div key={comp.id} className={`border ${borderClass} p-3 rounded-lg flex gap-2.5 items-start font-mono shadow-sm`}>
                                                <div className="w-9 h-9 rounded-md bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-base shadow">
                                                  {comp.avatar || (isVice ? "🔫" : isTracker ? "📟" : "👤")}
                                                </div>
                                                <div className="text-[10px] space-y-0.5 flex-1">
                                                  <p className={`${textClass} font-extrabold uppercase flex items-center justify-between`}>
                                                    <span>{comp.name}</span>
                                                    <span className="text-3xs text-slate-500">{comp.role || "Squad Member"}</span>
                                                  </p>
                                                  <p className="text-slate-300 font-sans text-2xs italic leading-relaxed pt-0.5">
                                                    "{comp.text}"
                                                  </p>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* Interactive Operational Choices */}
                                      <div className="flex flex-wrap gap-2.5 pt-2 border-t border-purple-500/20 justify-start">
                                        {stepData.choices.map((choice) => {
                                          const isPurple = choice.variant === "purple" || choice.id.includes("awakening") || choice.id.includes("combat");
                                          const isAmber = choice.variant === "amber";
                                          const isRose = choice.variant === "rose";
                                          const isCyan = choice.variant === "cyan" || !choice.variant;

                                          let btnClass = "bg-slate-900 hover:bg-slate-800 border-white/20 text-slate-200";
                                          if (isPurple) {
                                            btnClass = "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse";
                                          } else if (isAmber) {
                                            btnClass = "bg-amber-950/70 hover:bg-amber-900 border-amber-500/40 text-amber-200";
                                          } else if (isRose) {
                                            btnClass = "bg-rose-950/70 hover:bg-rose-900 border-rose-500/40 text-rose-200";
                                          } else if (isCyan) {
                                            btnClass = "bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-200";
                                          }

                                          return (
                                            <button
                                              key={choice.id}
                                              id={`scene-choice-${choice.id}`}
                                              onClick={() => handleExecuteChoice(choice)}
                                              className={`border font-mono font-bold text-2xs sm:text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all uppercase tracking-wider flex items-center gap-2 ${btnClass}`}
                                            >
                                              <span>{choice.label}</span>
                                              {choice.checkType && choice.checkType !== "none" && (
                                                <span className="text-3xs bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-extrabold border border-amber-500/30">
                                                  [DC {choice.checkValue}]
                                                </span>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  );
                                })()
                              ) : (
                                <motion.div
                                  key={`active-dialogue-${activeDialogue}`}
                                  variants={slideInVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="bg-slate-900/60 border border-cyan-400/20 rounded-lg p-3 relative flex items-start gap-3"
                                >
                                  {/* NPC small avatar */}
                                  <img
                                    src={
                                      activeDialogue === "jax"
                                        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                                        : activeDialogue === "aria"
                                          ? "/src/assets/images/npc_aria_portrait_1782169594302.jpg"
                                          : activeDialogue === "morgana"
                                            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                                            : activeDialogue === "lost_girl"
                                              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                                              : activeDialogue === "auction_lobby"
                                                ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=200"
                                                : activeDialogue === "inspect_pens"
                                                  ? "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=200"
                                                  : activeDialogue?.startsWith("mira_voss")
                                                    ? "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=200"
                                                    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                                    }
                                    alt="NPC portrait"
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 object-cover rounded-md border border-white/15 shadow flex-shrink-0"
                                  />

                                  <div className="space-y-1 font-mono text-[11px] flex-1 text-left">
                                    <p className="text-cyan-400 font-bold uppercase leading-none">
                                      {activeDialogue === "jax" ? "Agent Jax" : activeDialogue === "aria" ? "Chancellor Aria" : activeDialogue === "morgana" ? "Priestess Morgana" : activeDialogue === "lost_girl" ? "Mia" : activeDialogue === "auction_lobby" ? "Syndicate Auctioneer" : activeDialogue === "inspect_pens" ? "Holding Cell Warden" : activeDialogue?.startsWith("mira_voss") ? "Mira Voss" : "Agent Vesper"}
                                    </p>
                                    <p className="text-[9px] text-slate-500 uppercase font-semibold">
                                      {activeDialogue === "jax" ? "Outcast Coordinator" : activeDialogue === "aria" ? "Corporative Representative" : activeDialogue === "morgana" ? "Coven Technomancer" : activeDialogue === "lost_girl" ? "Lost Corporate Subject" : activeDialogue === "auction_lobby" ? "Outcast Contract Trader" : activeDialogue === "inspect_pens" ? "Security Detainee Monitor" : activeDialogue?.startsWith("mira_voss") ? "Arena Contract Gladiator" : "Nexus Recruiter"}
                                    </p>
                                    <span className="h-px bg-white/5 block my-1" />
                                    <p className="text-slate-300 font-sans text-2xs leading-relaxed italic">
                                      <TypewriterText text={
                                        activeDialogue === "mira_voss_intro"
                                          ? "You think you can just wander into my training pit and stare, rookie? I don't trade words with soft-bellied scavengers. If you want something, buy my contract from the pit boss, or challenge me to an Action-AP Duel right here. Prove you're not just another walking corpse."
                                          : activeDialogue === "mira_voss_career"
                                            ? "Career? That's a fancy word for a slow death. I was sold to the Aurus syndicate three years ago after my merc squad got wiped at Shatter Ridge. I've broken twenty cyber-gladiators on this dirt, but my contract is locked down hard. The boss keeps raising the price because of the betting crowds."
                                            : activeDialogue === "mira_voss_offer"
                                              ? "You want me to guard some dusty basement safehouse? *Laughs harshly* That's a good joke. Pity doesn't buy loyalty. If you want my knuckles, pay the boss his 200¤ credits, or slam me into the ground in a duel. Show me you have the strength to command, otherwise go back to your desk."
                                              : activeDialogue === "jax"
                                            ? "Jax reviews the resistance network and points you toward the authored contracts available at this location."
                                            : activeDialogue === "aria"
                                              ? "Chancellor Aria monitors Apex operations from behind an encrypted armory console."
                                              : activeDialogue === "morgana"
                                                ? "Morgana studies the ley-stream in silence. Her authored rites and contracts are available through the temple scene nodes."
                                                    : activeDialogue === "lost_girl"
                                                      ? gameState.companions.some(c => c.name === "Mia")
                                                        ? "Mia looks up at you with happy, sparkling eyes: 'Thank you for giving me a home and saving my life, commander! I'll do my absolute best to support you.'"
                                                        : "P-please... don't report me to Ares Biotech security... I escaped when the mainframe crashed. My neural cortex is overloading and I have no credentials, no credits, and nowhere to go... can you help me?"
                                                      : activeDialogue === "auction_lobby"
                                                        ? "The syndicate auction floor is roaring! Today we are selling the premium servitude contracts of captured outcasts and cyber-laborers. Place your bids immediately or leave the trading ring!"
                                                        : activeDialogue === "inspect_pens"
                                                          ? "You walk down the wet, rusty steel corridors of the holding blocks. Outcasts of all shapes look through the glowing security bars with fear and hope. You can purchase their cell key to release them to your base, or ignore them."
                                                          : "Welcome to Nexus Agency. Elite field support Scythe (Ninja), Vex (Mage), and Brick (Orc) are waiting for hire. Choose below."
                                      } />
                                    </p>

                                  {/* Branching Response Action Buttons inside Dialogue Overlay */}
                                  <div className="flex flex-wrap gap-1.5 pt-2.5">
                                    
                                    {activeDialogue === "auction_lobby" && (
                                      <>
                                        {/* Bid for Evelyn */}
                                        {!gameState.baseNPCs?.some(n => n.id === "evelyn") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 90 : 120;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const evelyn = {
                                                        id: "evelyn",
                                                        name: "Evelyn",
                                                        role: "Maid Servitude Specialist",
                                                        avatar: "🧹",
                                                        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
                                                        description: "Evelyn was a cyber-genetic engineer before severe medical debts got her sold to the syndicate under absolute servitude. She wears clean butler-style lace cuffs and sweeps base server nodes.",
                                                        dialogue: "Master... the safehouse energy grids have been fine-tuned and calibrated to peak performance. Tell me how I can serve you today.",
                                                        reaction: null,
                                                        happiness: 45,
                                                        affection: "Reserved",
                                                        affectionValue: 35,
                                                        willpower: 55,
                                                        corruption: 15,
                                                        hygiene: "Excellent",
                                                        discipline: 75,
                                                        hunger: "Hungry",
                                                        respect: 40,
                                                        withdrawRisk: "None",
                                                        anger: 15,
                                                        defiance: 20,
                                                        fear: 40,
                                                        inventory: ["Tech-repair Screwdriver"],
                                                        currentJob: "Base Maintenance Maid"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), evelyn];
                                                      next.experience += 75;
                                                      setGameState(next);
                                                      triggerToast(`EVELYN CONTRACT PURCHASED (+75 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🧹 Bid on Evelyn ({price}¤) [Guaranteed Win]
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Evelyn
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const mind = gameState.skills?.mindmancer || 0;
                                                    if (mind >= 1) {
                                                      let next = { ...gameState };
                                                      const bluffPrice = isBribed ? 60 : 80;
                                                      if (next.credits >= bluffPrice) {
                                                        next.credits -= bluffPrice;
                                                        const evelyn = {
                                                          id: "evelyn",
                                                          name: "Evelyn",
                                                          role: "Maid Servitude Specialist",
                                                          avatar: "🧹",
                                                          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
                                                          description: "Evelyn was a cyber-genetic engineer before severe medical debts got her sold to the syndicate under absolute servitude. She wears clean butler-style lace cuffs and sweeps base server nodes.",
                                                          dialogue: "Master... the safehouse energy grids have been fine-tuned and calibrated to peak performance. Tell me how I can serve you today.",
                                                          reaction: null,
                                                          happiness: 45,
                                                          affection: "Reserved",
                                                          affectionValue: 35,
                                                          willpower: 55,
                                                          corruption: 15,
                                                          hygiene: "Excellent",
                                                          discipline: 75,
                                                          hunger: "Hungry",
                                                          respect: 40,
                                                          withdrawRisk: "None",
                                                          anger: 15,
                                                          defiance: 20,
                                                          fear: 40,
                                                          inventory: ["Tech-repair Screwdriver"],
                                                          currentJob: "Base Maintenance Maid"
                                                        };
                                                        next.baseNPCs = [...(next.baseNPCs || []), evelyn];
                                                        next.experience += 100;
                                                        setGameState(next);
                                                        triggerToast(`BLUFF SUCCESS: Bought Evelyn for ${bluffPrice}¤!`);
                                                      } else {
                                                        triggerToast("INSUFFICIENT CREDITS FOR BLUFF");
                                                      }
                                                    } else {
                                                      triggerToast("REQUIRES MINDMANCER LEVEL 1");
                                                    }
                                                  }}
                                                  className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🔮 [Mindmancer 1] Social Bluff Bid ({isBribed ? 60 : 80}¤)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Evelyn Contract Acquired
                                          </span>
                                        )}

                                        {/* Bid for Talon */}
                                        {!gameState.baseNPCs?.some(n => n.id === "talon") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 135 : 180;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const talon = {
                                                        id: "talon",
                                                        name: "Talon",
                                                        role: "Chrome Base Sentinel",
                                                        avatar: "🤖",
                                                        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
                                                        description: "A heavily-chromed cybernetic enforcer and former pit-gladiator purchased from the syndicate arenas. He stands tall, checking the ballistic shell loaders in his pneumatic arm gaskets.",
                                                        dialogue: "Orders, Boss. My pneumatic pistons are pressurized and ready to breach. Any corporate rat coming through those hideout doors will get iron-crushed.",
                                                        reaction: null,
                                                        happiness: 60,
                                                        affection: "Distant",
                                                        affectionValue: 20,
                                                        willpower: 85,
                                                        corruption: 35,
                                                        hygiene: "Normal",
                                                        discipline: 80,
                                                        hunger: "Well-fed",
                                                        respect: 65,
                                                        withdrawRisk: "None",
                                                        anger: 25,
                                                        defiance: 10,
                                                        fear: 10,
                                                        inventory: ["Pneumatic Gauntlet Key"],
                                                        currentJob: "Hideout Sentry Guard"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), talon];
                                                      next.experience += 85;
                                                      setGameState(next);
                                                      triggerToast(`TALON CONTRACT PURCHASED (+85 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🤖 Bid on Talon ({price}¤) [Guaranteed Win]
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Talon
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const str = gameState.attributes?.str || 10;
                                                    const roll = Math.floor(Math.random() * 20) + 1 + str;
                                                    const bluffPrice = isBribed ? 90 : 120;
                                                    if (roll >= 15) {
                                                      let next = { ...gameState };
                                                      if (next.credits >= bluffPrice) {
                                                        next.credits -= bluffPrice;
                                                        const talon = {
                                                          id: "talon",
                                                          name: "Talon",
                                                          role: "Chrome Base Sentinel",
                                                          avatar: "🤖",
                                                          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                                                          description: "A heavily-chromed cybernetic enforcer and former pit-gladiator purchased from the syndicate arenas. He stands tall, checking the ballistic shell loaders in his pneumatic arm gaskets.",
                                                          dialogue: "Orders, Boss. My pneumatic pistons are pressurized and ready to breach. Any corporate rat coming through those hideout doors will get iron-crushed.",
                                                          reaction: null,
                                                          happiness: 60,
                                                          affection: "Distant",
                                                          affectionValue: 20,
                                                          willpower: 85,
                                                          corruption: 35,
                                                          hygiene: "Normal",
                                                          discipline: 80,
                                                          hunger: "Well-fed",
                                                          respect: 65,
                                                          withdrawRisk: "None",
                                                          anger: 25,
                                                          defiance: 10,
                                                          fear: 10,
                                                          inventory: ["Pneumatic Gauntlet Key"],
                                                          currentJob: "Hideout Sentry Guard"
                                                        };
                                                        next.baseNPCs = [...(next.baseNPCs || []), talon];
                                                        next.experience += 110;
                                                        setGameState(next);
                                                        triggerToast(`STR INTIMIDATION SUCCESS! Bought Talon for ${bluffPrice}¤!`);
                                                      } else {
                                                        triggerToast("INSUFFICIENT CREDITS FOR INTIMIDATION");
                                                      }
                                                    } else {
                                                      triggerToast(`STR INTIMIDATION FAIL (Roll: ${roll} vs 15): Bidders laughed!`);
                                                    }
                                                  }}
                                                  className="bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🦾 [Strength Check] Intimidate Competitors ({isBribed ? 90 : 120}¤)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Talon Contract Acquired
                                          </span>
                                        )}
                                      </>
                                    )}

                                    {activeDialogue === "inspect_pens" && (
                                      <>
                                        {!gameState.baseNPCs?.some(n => n.id === "kira") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 150 : 200;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const kira = {
                                                        id: "kira",
                                                        name: "Kira",
                                                        role: "Cyber-Hacker Specialist",
                                                        avatar: "💻",
                                                        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                                        description: "Kira is a prodigy netrunner whom you rescued from the syndicate holdout cages. She sits cross-legged on a server crate with her portable deck glowing bright teal.",
                                                        dialogue: "Yo, Boss! Hacked three corporate escrow channels while you were out. Automated credits are trickling into our balance logs as we speak!",
                                                        reaction: null,
                                                        happiness: 80,
                                                        affection: "Grateful",
                                                        affectionValue: 60,
                                                        willpower: 70,
                                                        corruption: 10,
                                                        hygiene: "Excellent",
                                                        discipline: 65,
                                                        hunger: "Satiated",
                                                        respect: 70,
                                                        withdrawRisk: "None",
                                                        anger: 5,
                                                        defiance: 15,
                                                        fear: 15,
                                                        inventory: ["Cracked Cyberdeck Module"],
                                                        currentJob: "Automated Data Thief"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), kira];
                                                      next.experience += 90;
                                                      setGameState(next);
                                                      triggerToast(`RESCUED KIRA (+90 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🔓 Rescued Kira / Buy Key ({price}¤)
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Kira Key
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const intelligence = gameState.attributes?.int || 10;
                                                    const roll = Math.floor(Math.random() * 20) + 1 + intelligence;
                                                    if (roll >= 18) {
                                                      let next = { ...gameState };
                                                      const kira = {
                                                        id: "kira",
                                                        name: "Kira",
                                                        role: "Cyber-Hacker Specialist",
                                                        avatar: "💻",
                                                        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                                        description: "Kira is a prodigy netrunner whom you rescued from the syndicate holdout cages. She sits cross-legged on a server crate with her portable deck glowing bright teal.",
                                                        dialogue: "Yo, Boss! Hacked three corporate escrow channels while you were out. Automated credits are trickling into our balance logs as we speak!",
                                                        reaction: null,
                                                        happiness: 80,
                                                        affection: "Grateful",
                                                        affectionValue: 60,
                                                        willpower: 70,
                                                        corruption: 10,
                                                        hygiene: "Excellent",
                                                        discipline: 65,
                                                        hunger: "Satiated",
                                                        respect: 70,
                                                        withdrawRisk: "None",
                                                        anger: 5,
                                                        defiance: 15,
                                                        fear: 15,
                                                        inventory: ["Cracked Cyberdeck Module"],
                                                        currentJob: "Automated Data Thief"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), kira];
                                                      next.experience += 150;
                                                      setGameState(next);
                                                      triggerToast(`INT CHECK SUCCESS (Roll: ${roll} vs 18)! Kira Hacked Free!`);
                                                    } else {
                                                      // Trigger Alarm Combat!
                                                      let next = { ...gameState };
                                                      next.combatState = {
                                                        enemyName: "Syndicate Shock-Guard (Group Ambush)",
                                                        enemyHp: 65,
                                                        enemyMaxHp: 65,
                                                        enemyShields: 20,
                                                        enemyMaxShields: 20,
                                                        isActive: true,
                                                        turnLog: "INT CHECK FAILURE! Hacking attempt detected! Red laser grid alarm activated and Warden dispatched Shock-Guards to neutralize you!"
                                                      };
                                                      setGameState(next);
                                                      setActiveDialogue(null);
                                                      triggerToast(`🚨 HACK FAILURE (Roll: ${roll} vs 18): ALARMS DETECTED!`);
                                                    }
                                                  }}
                                                  className="bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🧠 [Intellect Check] Decrypt Latch Code (0¤, Alert Risk)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Kira Rescued to Safehouse Base
                                          </span>
                                        )}

                                        {/* LIRA VALE RECRUITMENT block */}
                                        {!gameState.baseNPCs?.some(n => n.id === "lira") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 110 : 150;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const lira = {
                                                        id: "lira",
                                                        name: "Lira Vale",
                                                        role: "Chief Tech Officer / Hacker Network Operator",
                                                        avatar: "🔧",
                                                        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
                                                        description: "Lira is a brilliant former Ares Biotech engineer who was discarded and sold to the pens. In her grease-stained jumpsuits and glowing utility goggles, she works on upgrading your safehouse generators and grid-relays. She is highly analytical.",
                                                        dialogue: "You pulled me out of those damp cells. I've mapped out the entire Ares sub-station layout. Let me get to work on our safehouse matrices - we can boost our defenses significantly.",
                                                        reaction: null,
                                                        happiness: 85,
                                                        affection: "Loyal",
                                                        affectionValue: 65,
                                                        willpower: 75,
                                                        corruption: 5,
                                                        hygiene: "Normal",
                                                        discipline: 80,
                                                        hunger: "Satiated",
                                                        respect: 75,
                                                        withdrawRisk: "None",
                                                        anger: 0,
                                                        defiance: 10,
                                                        fear: 10,
                                                        inventory: ["Nano-Solder Kit", "Ares ID Card (Expired)"],
                                                        currentJob: "Tech Upgrades Engineer"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), lira];
                                                      next.experience += 90;
                                                      setGameState(next);
                                                      triggerToast(`RESCUED LIRA VALE (+90 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🔓 Buy Lira Vale Key ({price}¤)
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Lira
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const intelligence = gameState.attributes?.int || 10;
                                                    const roll = Math.floor(Math.random() * 20) + 1 + intelligence;
                                                    if (roll >= 16) {
                                                      let next = { ...gameState };
                                                      const lira = {
                                                        id: "lira",
                                                        name: "Lira Vale",
                                                        role: "Chief Tech Officer / Hacker Network Operator",
                                                        avatar: "🔧",
                                                        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
                                                        description: "Lira is a brilliant former Ares Biotech engineer who was discarded and sold to the pens. In her grease-stained jumpsuits and glowing utility goggles, she works on upgrading your safehouse generators and grid-relays. She is highly analytical.",
                                                        dialogue: "You pulled me out of those damp cells. I've mapped out the entire Ares sub-station layout. Let me get to work on our safehouse matrices - we can boost our defenses significantly.",
                                                        reaction: null,
                                                        happiness: 85,
                                                        affection: "Loyal",
                                                        affectionValue: 65,
                                                        willpower: 75,
                                                        corruption: 5,
                                                        hygiene: "Normal",
                                                        discipline: 80,
                                                        hunger: "Satiated",
                                                        respect: 75,
                                                        withdrawRisk: "None",
                                                        anger: 0,
                                                        defiance: 10,
                                                        fear: 10,
                                                        inventory: ["Nano-Solder Kit", "Ares ID Card (Expired)"],
                                                        currentJob: "Tech Upgrades Engineer"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), lira];
                                                      next.experience += 150;
                                                      setGameState(next);
                                                      triggerToast(`INT CHECK SUCCESS (Roll: ${roll} vs 16)! Lira Free!`);
                                                    } else {
                                                      let next = { ...gameState };
                                                      next.combatState = {
                                                        enemyName: "Syndicate Enforcer Sentries",
                                                        enemyHp: 80,
                                                        enemyMaxHp: 80,
                                                        enemyShields: 30,
                                                        enemyMaxShields: 30,
                                                        isActive: true,
                                                        turnLog: "INT CHECK FAILURE! Terminal lockout triggered! Alarms ring out, and Warden commands defense units to liquidate you!"
                                                      };
                                                      setGameState(next);
                                                      setActiveDialogue(null);
                                                      triggerToast(`🚨 LIRA HACK FAILURE (Roll: ${roll} vs 16)`);
                                                    }
                                                  }}
                                                  className="bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🧠 [Intellect Check] Hack Lira's Lock (0¤, Alert Risk)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Lira Rescued to Base
                                          </span>
                                        )}

                                        {/* NYRA RECRUITMENT block */}
                                        {!gameState.baseNPCs?.some(n => n.id === "nyra") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 120 : 160;
                                            const mindmancerUnlocked = (gameState.skills?.mindmancer || 0) >= 1;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const nyra = {
                                                        id: "nyra",
                                                        name: "Nyra",
                                                        role: "High Priestess / Magical Alchemist",
                                                        avatar: "🔮",
                                                        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
                                                        description: "Nyra is a mystical ether coven member whose eyes hum with high-intensity violet ley-currents. She can hear the whispers of the Sol-Prime Core and warns you about the psychic drain. She works at the safehouse alchemy arrays.",
                                                        dialogue: "The Sol-Prime Ley Core... its current hums in your bloodstream, initiate. I can feel the violet nodes. Let me mix raw ether catalysts to fuel your spell banks.",
                                                        reaction: null,
                                                        happiness: 90,
                                                        affection: "Devoted",
                                                        affectionValue: 70,
                                                        willpower: 50,
                                                        corruption: 30,
                                                        hygiene: "Normal",
                                                        discipline: 70,
                                                        hunger: "Satiated",
                                                        respect: 80,
                                                        withdrawRisk: "None",
                                                        anger: 0,
                                                        defiance: 5,
                                                        fear: 20,
                                                        inventory: ["Ley-Catalyst Vials", "Obsidian Choker"],
                                                        currentJob: "Ether Synthesizer"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), nyra];
                                                      next.experience += 90;
                                                      setGameState(next);
                                                      triggerToast(`RESCUED NYRA (+90 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🔓 Buy Nyra Key ({price}¤)
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Nyra
                                                  </span>
                                                )}

                                                {mindmancerUnlocked && (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      const nyra = {
                                                        id: "nyra",
                                                        name: "Nyra",
                                                        role: "High Priestess / Magical Alchemist",
                                                        avatar: "🔮",
                                                        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
                                                        description: "Nyra is a mystical ether coven member whose eyes hum with high-intensity violet ley-currents. She can hear the whispers of the Sol-Prime Core and warns you about the psychic drain. She works at the safehouse alchemy arrays.",
                                                        dialogue: "The Sol-Prime Ley Core... its current hums in your bloodstream, initiate. I can feel the violet nodes. Let me mix raw ether catalysts to fuel your spell banks.",
                                                        reaction: null,
                                                        happiness: 90,
                                                        affection: "Devoted",
                                                        affectionValue: 70,
                                                        willpower: 50,
                                                        corruption: 30,
                                                        hygiene: "Normal",
                                                        discipline: 70,
                                                        hunger: "Satiated",
                                                        respect: 80,
                                                        withdrawRisk: "None",
                                                        anger: 0,
                                                        defiance: 5,
                                                        fear: 20,
                                                        inventory: ["Ley-Catalyst Vials", "Obsidian Choker"],
                                                        currentJob: "Ether Synthesizer"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), nyra];
                                                      next.experience += 150;
                                                      setGameState(next);
                                                      triggerToast(`MINDMANCER TRANS-FUSION: NYRA RECRUITED!`);
                                                    }}
                                                    className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer animate-pulse"
                                                  >
                                                    🔮 [Mindmance Check] Override Cell Locks (0¤)
                                                  </button>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const intelligence = gameState.attributes?.int || 10;
                                                    const roll = Math.floor(Math.random() * 20) + 1 + intelligence;
                                                    if (roll >= 15) {
                                                      let next = { ...gameState };
                                                      const nyra = {
                                                        id: "nyra",
                                                        name: "Nyra",
                                                        role: "High Priestess / Magical Alchemist",
                                                        avatar: "🔮",
                                                        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
                                                        description: "Nyra is a mystical ether coven member whose eyes hum with high-intensity violet ley-currents. She can hear the whispers of the Sol-Prime Core and warns you about the psychic drain. She works at the safehouse alchemy arrays.",
                                                        dialogue: "The Sol-Prime Ley Core... its current hums in your bloodstream, initiate. I can feel the violet nodes. Let me mix raw ether catalysts to fuel your spell banks.",
                                                        reaction: null,
                                                        happiness: 90,
                                                        affection: "Devoted",
                                                        affectionValue: 70,
                                                        willpower: 50,
                                                        corruption: 30,
                                                        hygiene: "Normal",
                                                        discipline: 70,
                                                        hunger: "Satiated",
                                                        respect: 80,
                                                        withdrawRisk: "None",
                                                        anger: 0,
                                                        defiance: 5,
                                                        fear: 20,
                                                        inventory: ["Ley-Catalyst Vials", "Obsidian Choker"],
                                                        currentJob: "Ether Synthesizer"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), nyra];
                                                      next.experience += 120;
                                                      setGameState(next);
                                                      triggerToast(`INT CHECK SUCCESS (Roll: ${roll} vs 15)! Nyra Free!`);
                                                    } else {
                                                      let next = { ...gameState };
                                                      next.combatState = {
                                                        enemyName: "Syndicate Enforcer Sentries",
                                                        enemyHp: 80,
                                                        enemyMaxHp: 80,
                                                        enemyShields: 30,
                                                        enemyMaxShields: 30,
                                                        isActive: true,
                                                        turnLog: "INT CHECK FAILURE! Cell systems locked down! Combat alerts sound off, prepare for combat!"
                                                      };
                                                      setGameState(next);
                                                      setActiveDialogue(null);
                                                      triggerToast(`🚨 NYRA DECRYPTION FAILURE (Roll: ${roll} vs 15)`);
                                                    }
                                                  }}
                                                  className="bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🧠 [Intellect Check] Decode Mystic Lock (0¤)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Nyra Rescued to Base
                                          </span>
                                        )}
                                      </>
                                    )}

                                    {activeDialogue?.startsWith("mira_voss") && (
                                      <>
                                        {activeDialogue === "mira_voss_intro" && (
                                          <>
                                            <button
                                              onClick={() => setActiveDialogue("mira_voss_career")}
                                              className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                            >
                                              💬 Inquire about her arena career
                                            </button>
                                            <button
                                              onClick={() => setActiveDialogue("mira_voss_offer")}
                                              className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                            >
                                              🤝 Offer her a place at your base
                                            </button>
                                          </>
                                        )}

                                        {(activeDialogue === "mira_voss_career" || activeDialogue === "mira_voss_offer") && (
                                          <button
                                            onClick={() => setActiveDialogue("mira_voss_intro")}
                                            className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                          >
                                            ↩️ Back
                                          </button>
                                        )}

                                        <button
                                          onClick={() => setActiveDialogue(null)}
                                          className="bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-400 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          🚪 Leave Pit
                                        </button>
                                      </>
                                    )}

                                    {activeDialogue === "lost_girl" && !gameState.baseNPCs?.some(c => c.id === "mia") && (
                                      <>
                                        <button
                                          onClick={() => {
                                            const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                            if ((gameState.baseNPCs || []).length >= maxCap) {
                                              triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                              return;
                                            }
                                            let next = { ...gameState };
                                            const mia = {
                                              name: "Mia",
                                              fee: 0,
                                              status: "in_party" as "available" | "hired" | "in_party" | "working",
                                              role: "Neural Aegis / Support Mage",
                                              bio: "An escaped corporate lab subject with dormant high-bandwidth neural forcefields. Grateful for your shelter.",
                                              avatar: "✨",
                                              equipment: {
                                                meleeWeapon: null,
                                                rangedWeapon: null,
                                                armor: "Tactical Flak Armor",
                                                headpiece: null,
                                                trinket: null
                                              }
                                            };
                                            const miaBaseNPC = {
                                              id: "mia",
                                              name: "Mia",
                                              role: "Base Specialist / Chef",
                                              avatar: "🌸",
                                              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                              description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
                                              dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
                                              reaction: null,
                                              happiness: 95,
                                              affection: "Warm",
                                              affectionValue: 78,
                                              willpower: 45,
                                              corruption: 10,
                                              hygiene: "Excellent",
                                              discipline: 60,
                                              hunger: "Satiated",
                                              respect: 85,
                                              withdrawRisk: "None",
                                              anger: 0,
                                              defiance: 5,
                                              fear: 15,
                                              inventory: ["Copper-Wire Ring"],
                                              currentJob: "Base Supply Chef"
                                            };
                                            next.companions.push(mia);
                                            next.party.push("Mia");
                                            next.baseNPCs = [...(next.baseNPCs || []), miaBaseNPC];
                                            next.experience += 60;
                                            setGameState(next);
                                            triggerToast("MIA JOINED YOUR PARTY AND SAFEHOUSE BASE!");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-emerald-400"
                                        >
                                          🤝 Invite to Hideout (Squad Teammate)
                                        </button>

                                        <button
                                          onClick={() => {
                                            const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                            if ((gameState.baseNPCs || []).length >= maxCap) {
                                              triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                              return;
                                            }
                                            let next = { ...gameState };
                                            const mia = {
                                              name: "Mia",
                                              fee: 0,
                                              status: "working" as "available" | "hired" | "in_party" | "working",
                                              role: "Safehouse Maid & Tech Analyst",
                                              bio: "Her neural implants are synced with your safehouse server nodes. She manages security algorithms and cooks synth-rations.",
                                              avatar: "🧹",
                                              equipment: {
                                                meleeWeapon: null,
                                                rangedWeapon: null,
                                                armor: null,
                                                headpiece: null,
                                                trinket: null
                                              }
                                            };
                                            const miaBaseNPC = {
                                              id: "mia",
                                              name: "Mia",
                                              role: "Base Specialist / Chef",
                                              avatar: "🌸",
                                              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                              description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
                                              dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
                                              reaction: null,
                                              happiness: 95,
                                              affection: "Warm",
                                              affectionValue: 78,
                                              willpower: 45,
                                              corruption: 10,
                                              hygiene: "Excellent",
                                              discipline: 60,
                                              hunger: "Satiated",
                                              respect: 85,
                                              withdrawRisk: "None",
                                              anger: 0,
                                              defiance: 5,
                                              fear: 15,
                                              inventory: ["Copper-Wire Ring"],
                                              currentJob: "Base Supply Chef"
                                            };
                                            next.companions.push(mia);
                                            next.baseNPCs = [...(next.baseNPCs || []), miaBaseNPC];
                                            next.experience += 80;
                                            setGameState(next);
                                            triggerToast("MIA BOUND AS SAFE-HOUSE MAID & RECRUITED TO BASE!");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          🔮 [Mindmance] Sync Neural Link (Maid servant)
                                        </button>

                                        {gameState.credits >= 30 ? (
                                          <button
                                            onClick={() => {
                                              const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                              if ((gameState.baseNPCs || []).length >= maxCap) {
                                                triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                return;
                                              }
                                              let next = { ...gameState };
                                              const miaBaseNPC = {
                                                id: "mia",
                                                name: "Mia",
                                                role: "Base Specialist / Chef",
                                                avatar: "🌸",
                                                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                                description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
                                                dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
                                                reaction: null,
                                                happiness: 95,
                                                affection: "Warm",
                                                affectionValue: 78,
                                                willpower: 45,
                                                corruption: 10,
                                                hygiene: "Excellent",
                                                discipline: 60,
                                                hunger: "Satiated",
                                                respect: 85,
                                                withdrawRisk: "None",
                                                anger: 0,
                                                defiance: 5,
                                                fear: 15,
                                                inventory: ["Copper-Wire Ring"],
                                                currentJob: "Base Supply Chef"
                                              };
                                              next.credits -= 30;
                                              next.experience += 100;
                                              next.inventory.push("Ether Mana-Cell (Mana)");
                                              next.baseNPCs = [...(next.baseNPCs || []), miaBaseNPC];
                                              setGameState(next);
                                              triggerToast("SAVED MIA! Guided her to your Safehouse Base");
                                              setActiveDialogue(null);
                                            }}
                                            className="bg-cyan-600 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-cyan-500"
                                          >
                                            🪙 Give 30¤ & Guide to Safehouse
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Need 30¤ to Save Her
                                          </span>
                                        )}
                                      </>
                                    )}

                                    <button
                                      onClick={() => setActiveDialogue(null)}
                                      className="bg-slate-950 border border-white/15 text-slate-400 hover:text-white hover:bg-slate-900 px-2.5 py-1 rounded text-3xs uppercase cursor-pointer"
                                    >
                                      Goodbye / Farewell
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          ) : (
                              // Custom Mini-Game rendering for Sanctuary Hacking Terminal
                              activePOIView === "terminal_hacking_puzzle" ? (
                                <motion.div
                                  key="terminal_hacking_puzzle"
                                  variants={slideInVariants}
                                  initial="initial"
                                  animate="animate"
                                  exit="exit"
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="bg-slate-950/95 border border-cyan-500/40 rounded-xl p-5 font-mono text-xs space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] max-w-2xl mx-auto w-full relative overflow-hidden"
                                >
                                  {/* CRT monitor overlays on cyberdeck face */}
                                  <div className="crt-screen-overlay pointer-events-none rounded-xl" />
                                  <div className="crt-scanline animate-scanline pointer-events-none rounded-xl" />
                                  <div className="crt-vignette pointer-events-none rounded-xl" />

                                  {/* Tactical trace warning glitching overlay when 2 or fewer attempts remain */}
                                  {hackingPuzzle && hackingPuzzle.status === "playing" && hackingPuzzle.attemptsLeft <= 2 && (
                                    <div className="absolute inset-0 bg-red-950/20 animate-glitch pointer-events-none z-[9] border-2 border-red-500/40" />
                                  )}

                                  {/* Hardware system dump warning grid flash on breach failure */}
                                  {hackingPuzzle && hackingPuzzle.status === "failure" && (
                                    <div className="absolute inset-0 bg-red-900/30 animate-glitch pointer-events-none z-[10] border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                                  )}
                                  {/* Header Console */}
                                  <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
                                    <div className="flex items-center gap-2">
                                      <Terminal className="text-cyan-400 animate-pulse" size={16} />
                                      <div>
                                        <h3 className="text-cyan-300 font-extrabold text-[10px] tracking-wider uppercase leading-none">📟 Cyberdeck Neural-Matrix Bypass v4.9</h3>
                                        <p className="text-[7px] text-slate-500 uppercase mt-1">Status: Active Connection • Secure Grid Bypass Mode</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                        Type: {hackingPuzzle ? hackingPuzzle.type.replace("_", " ") : "Ready"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* If no active puzzle, render initialization screen */}
                                  {(!hackingPuzzle || hackingPuzzle.status === "idle") ? (
                                    <div className="text-center py-6 space-y-4">
                                      <div className="inline-flex p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-full text-cyan-400 animate-pulse">
                                        <Cpu size={24} />
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-cyan-400 font-bold uppercase text-[10px] tracking-widest">Awaiting Interface Port Connection</p>
                                        <p className="text-slate-400 text-[10px] leading-relaxed max-w-md mx-auto">
                                          A secure terminal link has been detected. Jack in to initiate sequence decrypt bypass. Failing may trigger neural feedback damage or deploy security forces.
                                        </p>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto pt-2">
                                        <button
                                          onClick={() => {
                                            const intScore = gameState?.attributes?.int || 10;
                                            const netSlicerLevel = gameState?.skills?.netSlicer || 1;
                                            setHackingPuzzle(initHackingGame("sanctuary", intScore, netSlicerLevel));
                                          }}
                                          className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded text-3xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                                        >
                                          🔌 Jack In & Begin Decrypt
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActivePOIView("default");
                                            setHackingPuzzle(null);
                                          }}
                                          className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white px-4 py-2.5 rounded text-3xs uppercase tracking-wider cursor-pointer"
                                        >
                                          Abort Connection
                                        </button>
                                      </div>
                                    </div>
                                  ) : hackingPuzzle.status === "playing" ? (
                                    <div className="space-y-4">
                                      {/* Game Controls Guide */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 border border-white/[0.03] p-3 rounded-lg text-[10px]">
                                        <div className="space-y-1">
                                          <p className="text-slate-400 uppercase font-bold tracking-wider">🔒 Target Sequence Buffer:</p>
                                          <div className="flex gap-1.5 items-center pt-1">
                                            {hackingPuzzle.targets.map((t, idx) => (
                                              <span
                                                key={idx}
                                                className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2 py-1 rounded text-2xs font-extrabold tracking-wider"
                                              >
                                                {t}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                          <p className="text-slate-400 uppercase font-bold tracking-wider">📈 Memory Register Allocation:</p>
                                          <div className="flex gap-1 justify-end pt-1">
                                            {Array.from({ length: hackingPuzzle.maxBuffer }).map((_, idx) => {
                                              const filled = hackingPuzzle.buffer[idx];
                                              return (
                                                <span
                                                  key={idx}
                                                  className={`w-7 h-7 flex items-center justify-center rounded border font-extrabold text-[10px] ${
                                                    filled
                                                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.4)] animate-pulse"
                                                      : "bg-slate-950/80 border-white/5 text-slate-600"
                                                  }`}
                                                >
                                                  {filled || "__"}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Left Side: 6x6 Hex Matrix */}
                                        <div className="md:col-span-2 space-y-2">
                                          <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-slate-500">
                                            <span>Hex Memory Matrix</span>
                                            <span className="text-cyan-400 animate-pulse">
                                              Active Selection: {hackingPuzzle.activeLineType === "row" ? `ROW ${hackingPuzzle.activeLineIdx + 1}` : `COLUMN ${hackingPuzzle.activeLineIdx + 1}`}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-2 rounded-lg border border-cyan-500/10">
                                            {hackingPuzzle.grid.map((rowArr, rIdx) =>
                                              rowArr.map((cell, cIdx) => {
                                                const isSelectable =
                                                  hackingPuzzle.activeLineType === "row"
                                                    ? rIdx === hackingPuzzle.activeLineIdx
                                                    : cIdx === hackingPuzzle.activeLineIdx;
                                                const showHighlight = cell.isHighlighted; // NetSlicer Level 3 Perk
                                                
                                                return (
                                                  <button
                                                    key={`${rIdx}-${cIdx}`}
                                                    disabled={cell.isClicked || !isSelectable}
                                                    onClick={() => {
                                                      const newBuffer = [...hackingPuzzle.buffer, cell.hex];
                                                      const newGrid = [...hackingPuzzle.grid];
                                                      newGrid[rIdx][cIdx].isClicked = true;

                                                      // Check sequence match (Breach Protocol checks last N entries)
                                                      const isMatch = newBuffer.slice(-hackingPuzzle.targets.length).join(",") === hackingPuzzle.targets.join(",");

                                                      if (isMatch) {
                                                        triggerToast("BREACH PROTOCOL SUCCESS");
                                                        setHackingPuzzle(prev => prev ? {
                                                          ...prev,
                                                          buffer: newBuffer,
                                                          grid: newGrid,
                                                          status: "success"
                                                        } : null);
                                                      } else if (newBuffer.length >= hackingPuzzle.maxBuffer) {
                                                        // Buffer full: consume attempt, clear buffer, reset line
                                                        const newAttempts = hackingPuzzle.attemptsLeft - 1;
                                                        if (newAttempts <= 0) {
                                                          triggerToast("CRITICAL COGNITIVE DISCHARGE");
                                                          setHackingPuzzle(prev => prev ? {
                                                            ...prev,
                                                            buffer: newBuffer,
                                                            grid: newGrid,
                                                            attemptsLeft: 0,
                                                            status: "failure"
                                                          } : null);
                                                        } else {
                                                          triggerToast("BUFFER RESET - ATTEMPT LOST");
                                                          setHackingPuzzle(prev => prev ? {
                                                            ...prev,
                                                            buffer: [],
                                                            grid: newGrid,
                                                            attemptsLeft: newAttempts,
                                                            activeLineType: "row",
                                                            activeLineIdx: 0
                                                          } : null);
                                                        }
                                                      } else {
                                                        // Normal selection progression: swap row/col
                                                        const nextType = hackingPuzzle.activeLineType === "row" ? "col" : "row";
                                                        const nextIdx = hackingPuzzle.activeLineType === "row" ? cIdx : rIdx;
                                                        
                                                        setHackingPuzzle(prev => prev ? {
                                                          ...prev,
                                                          buffer: newBuffer,
                                                          grid: newGrid,
                                                          activeLineType: nextType,
                                                          activeLineIdx: nextIdx
                                                        } : null);
                                                      }
                                                    }}
                                                    className={`aspect-square flex flex-col justify-center items-center rounded text-[11px] font-mono font-bold transition-all relative ${
                                                      cell.isClicked
                                                        ? "bg-slate-900/40 border border-transparent text-slate-700 select-none cursor-not-allowed"
                                                        : isSelectable
                                                          ? showHighlight
                                                            ? "bg-cyan-950 border border-cyan-400 text-cyan-200 hover:bg-cyan-900 cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                                                            : "bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-900/60 cursor-pointer"
                                                          : showHighlight
                                                            ? "bg-emerald-950/20 border border-emerald-500/10 text-emerald-500 cursor-not-allowed"
                                                            : "bg-slate-950 text-slate-800 border border-transparent cursor-not-allowed"
                                                    }`}
                                                  >
                                                    <span>{cell.isClicked ? "--" : cell.hex}</span>
                                                    {showHighlight && !cell.isClicked && (
                                                      <span className="absolute bottom-0.5 right-0.5 text-[5px] text-emerald-400 animate-pulse font-extrabold">CLUE</span>
                                                    )}
                                                  </button>
                                                );
                                              })
                                            )}
                                          </div>
                                        </div>

                                        {/* Right Side: Diagnostics & Perks */}
                                        <div className="space-y-4">
                                          {/* Hacking Diagnostic Module */}
                                          <div className="bg-slate-900 border border-white/5 p-3 rounded-lg space-y-2">
                                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-white/5 pb-1">📶 Diagnostics Board</p>
                                            <div className="text-[10px] space-y-1.5 font-mono text-slate-400">
                                              <p className="flex justify-between">
                                                <span>Intrusion Attempts:</span>
                                                <span className={`${hackingPuzzle.attemptsLeft <= 1 ? "text-red-400 animate-pulse font-bold" : "text-white"}`}>
                                                  {hackingPuzzle.attemptsLeft} / {hackingPuzzle.maxAttempts}
                                                </span>
                                              </p>
                                              <p className="flex justify-between">
                                                <span>NetSlicer Skill:</span>
                                                <span className="text-cyan-400">Lv. {hackingPuzzle.netSlicerLevel}</span>
                                              </p>
                                              <p className="flex justify-between">
                                                <span>Software Clues:</span>
                                                <span className={hackingPuzzle.netSlicerLevel >= 3 ? "text-emerald-400" : "text-slate-500"}>
                                                  {hackingPuzzle.netSlicerLevel >= 3 ? "ACTIVE" : "INACTIVE (Lv 3 Req.)"}
                                                </span>
                                              </p>
                                              <p className="flex justify-between">
                                                <span>Connection Status:</span>
                                                <span className="text-cyan-400 animate-pulse">OVERLAYING...</span>
                                              </p>
                                            </div>
                                          </div>

                                          {/* Hacking Perks (NetSlicer Level Based Interactive Help!) */}
                                          <div className="space-y-2">
                                            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">💾 Cyberdeck Peripherals</p>
                                            
                                            {/* Buffer Perk */}
                                            <button
                                              disabled={hackingPuzzle.netSlicerLevel < 1 || hackingPuzzle.usedPerkBuffer}
                                              onClick={() => {
                                                setHackingPuzzle(prev => {
                                                  if (!prev) return null;
                                                  return {
                                                    ...prev,
                                                    maxBuffer: prev.maxBuffer + 2,
                                                    usedPerkBuffer: true
                                                  };
                                                });
                                                triggerToast("BUFFER EXPANDED (+2 SLOTS)");
                                              }}
                                              className={`w-full p-2.5 rounded border text-[10px] text-left flex justify-between items-center font-bold ${
                                                hackingPuzzle.netSlicerLevel < 1
                                                  ? "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
                                                  : hackingPuzzle.usedPerkBuffer
                                                    ? "bg-slate-900 border-white/5 text-slate-500 cursor-not-allowed line-through"
                                                    : "bg-cyan-950/40 border-cyan-500/20 text-cyan-300 hover:bg-cyan-950/80 cursor-pointer"
                                              }`}
                                            >
                                              <span>💾 Buffer Injector</span>
                                              <span className="text-[8px] text-cyan-400 uppercase font-black tracking-wider">
                                                {hackingPuzzle.netSlicerLevel < 1 ? "Locked (NS Lv.1)" : hackingPuzzle.usedPerkBuffer ? "Exhausted" : "Use once"}
                                              </span>
                                            </button>

                                            {/* Attempts Perk */}
                                            <button
                                              disabled={hackingPuzzle.netSlicerLevel < 2 || hackingPuzzle.usedPerkAttempts}
                                              onClick={() => {
                                                setHackingPuzzle(prev => {
                                                  if (!prev) return null;
                                                  return {
                                                    ...prev,
                                                    attemptsLeft: prev.attemptsLeft + 2,
                                                    usedPerkAttempts: true
                                                  };
                                                });
                                                triggerToast("CYCLES SYPHONED (+2 ATTEMPTS)");
                                              }}
                                              className={`w-full p-2.5 rounded border text-[10px] text-left flex justify-between items-center font-bold ${
                                                hackingPuzzle.netSlicerLevel < 2
                                                  ? "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
                                                  : hackingPuzzle.usedPerkAttempts
                                                    ? "bg-slate-900 border-white/5 text-slate-500 cursor-not-allowed line-through"
                                                    : "bg-emerald-950/40 border-emerald-500/20 text-emerald-300 hover:bg-emerald-950/80 cursor-pointer"
                                              }`}
                                            >
                                              <span>🔋 Siphon Connection Cycles</span>
                                              <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wider">
                                                {hackingPuzzle.netSlicerLevel < 2 ? "Locked (NS Lv.2)" : hackingPuzzle.usedPerkAttempts ? "Exhausted" : "Use once"}
                                              </span>
                                            </button>
                                          </div>

                                          {/* Abort */}
                                          <button
                                            onClick={() => {
                                              setActivePOIView("default");
                                              setHackingPuzzle(null);
                                              triggerToast("SEQUENCE ABORTED SAFELY");
                                            }}
                                            className="w-full bg-slate-900 hover:bg-red-950/30 hover:text-red-400 border border-white/5 p-2 rounded text-slate-400 text-3xs font-black uppercase text-center cursor-pointer transition-all uppercase tracking-wider"
                                          >
                                            🔌 Emergency Abort Link
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : hackingPuzzle.status === "success" ? (
                                    <div className="text-center py-6 space-y-4">
                                      <div className="inline-flex p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-emerald-400 animate-pulse">
                                        <CheckCircle size={24} />
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="text-emerald-400 font-extrabold uppercase text-[11px] tracking-widest flex items-center justify-center gap-1.5">
                                          DECRYPTION SUCCESSFUL
                                        </h4>
                                        <p className="text-slate-400 text-[10px] leading-relaxed max-w-sm mx-auto">
                                          The terminal's central encryption registers have been fully bypassed. Security authorization has been uploaded to your active Cyberdeck buffer.
                                        </p>
                                      </div>
                                      <button
                                        onClick={handleHackingSuccess}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 rounded text-3xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                      >
                                        Extract Database & Authorize
                                      </button>
                                    </div>
                                  ) : hackingPuzzle.status === "failure" ? (
                                    <div className="text-center py-6 space-y-4">
                                      <div className="inline-flex p-3 bg-red-950/40 border border-red-500/20 rounded-full text-red-400 animate-bounce">
                                        <XCircle size={24} />
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="text-red-400 font-extrabold uppercase text-[11px] tracking-widest flex items-center justify-center gap-1.5">
                                          🚨 COGNITIVE SYSTEM FAILSAFE TRIGGERED
                                        </h4>
                                        <p className="text-slate-400 text-[10px] leading-relaxed max-w-sm mx-auto">
                                          The terminal has initiated an emergency core dump. A neural feedback voltage loop has discharged directly back into your deck.
                                        </p>
                                      </div>
                                      <button
                                        onClick={handleHackingFailure}
                                        className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2.5 rounded text-3xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                                      >
                                        Acknowledge System Feedback
                                      </button>
                                    </div>
                                  ) : null}
                              </motion.div>
                              ) : (
                                // Regular Location Action option rows
                                <div className="space-y-4">
                                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                                    {activePOIView === "ventilation_shaft" && ventFailed
                                      ? "⚠️ CRITICAL LOCKDOWN: AIRLOCK BLADES SECURED. RESOLVE FAILURE:"
                                      : "OPERATIONAL RESPONSES PREPARED AT LOCATION:"}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(() => {
                                      let btns = activePOIView === "ventilation_shaft" && ventFailed
                                        ? ["Force Fan Blades (STR Check)", "Trigger EMP Burst (EMP Explosion!)", "Hack Fan Console (INT Check)"]
                                        : [...(MAP_POIS.find(p => p.id === activePOIView)?.buttons || [])];
                                      
                                      // ---- MAIN QUEST & SIDE QUEST DYNAMIC BUTTONS ----
                                      if (gameState) {
                                         // 9. DYNAMIC CAMPAIGN QUEST DIRECTOR OPERATIONAL HOOKS
                                         if (gameState?.campaignQuestsRegistry && gameState?.campaignQuestsRegistry.length > 0) {
                                           const currentPoiObj = MAP_POIS.find(p => p.id === activePOIView);
                                           const currentPoiName = (currentPoiObj?.name || "").toLowerCase();
                                           const currentPoiId = (activePOIView || "").toLowerCase();
                                           const currentDistrict = (currentPoiObj?.district || gameState.district || "").toLowerCase();

                                           gameState.campaignQuestsRegistry.forEach(quest => {
                                             if (quest.status !== "ACTIVE") return;

                                             const currentStage = quest.stages?.find(s => !s.completed);
                                             if (!currentStage) return;

                                             const targetPoiLower = (currentStage.targetPOI || "").toLowerCase();
                                             const targetPoiIdLower = (currentStage.targetPOIId || "").toLowerCase();
                                             const targetDistrictLower = (currentStage.targetDistrict || "").toLowerCase();

                                             const matchesThisPOI = 
                                               (targetPoiIdLower && targetPoiIdLower === currentPoiId) ||
                                               (targetPoiLower && (currentPoiName.includes(targetPoiLower) || currentPoiId.includes(targetPoiLower) || targetPoiLower.includes(currentPoiId))) ||
                                               (!targetPoiLower && targetDistrictLower && targetDistrictLower === currentDistrict);

                                             if (matchesThisPOI) {
                                               if (currentStage.linkedPOIActionId) {
                                                  // Lightweight actions are rendered by POIInteriorHub from the POI registry.
                                               } else if (currentStage.linkedPOISceneId) {
                                                  const linkedStep = currentStage.linkedPOISceneStepId ? `:${currentStage.linkedPOISceneStepId}` : "";
                                                  btns = btns.filter(button => !button.toLowerCase().startsWith(`[scene:${currentStage.linkedPOISceneId!.toLowerCase()}`));
                                                  btns.push(`[SCENE:${currentStage.linkedPOISceneId}${linkedStep}] 🎬 ${currentStage.title}`);
                                               } else if (currentStage.operationalPaths && currentStage.operationalPaths.length > 0) {
                                                  currentStage.operationalPaths.forEach(path => {
                                                    btns.push(`[QUEST: ${quest.id}:${currentStage.id}:${path.id}] ${path.label}`);
                                                  });
                                               } else {
                                                  btns.push(`[QUEST: ${quest.id}:${currentStage.id}] 🎯 ${currentStage.title} - ${currentStage.description}`);
                                               }
                                             }
                                           });
                                         }
                                      }
                                      
                                      if (gameState && gameState.stamina <= 35) {
                                        if (gameState.credits >= 25) {
                                          btns.push("💉 Emergency Adrenaline Dose (-25¤)");
                                        }
                                        if (gameState.hp > 12) {
                                          btns.push("💤 Heavy Rest on Back-Alley Grate (+20 Stamina, -10 HP)");
                                        }
                                        const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                                        if (!isPrologue) {
                                          btns.push("🚀 Fast-Travel Home to Sleep");
                                        }
                                      }
                                      return btns;
                                    })().map((action, idx) => {
                                      const isCompleted = isActionCompleted(activePOIView, action);
                                      const isEmergencyBtn = action.startsWith("💉") || action.startsWith("💤") || action.startsWith("🚀");
                                      return (
                                        <button
                                          key={idx}
                                          disabled={isCompleted}
                                          onClick={() => handleExecuteAction(action)}
                                          className={`text-left px-3.5 py-2.5 rounded-lg border font-mono text-xs transition-all flex items-center justify-between cursor-pointer group ${
                                            isCompleted
                                              ? "border-slate-950 bg-slate-950/40 text-slate-500 cursor-not-allowed opacity-50"
                                              : isEmergencyBtn
                                                ? "border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 hover:border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                                : activePOIView === "ventilation_shaft" && ventFailed
                                                  ? "border-red-500/30 bg-red-950/40 hover:bg-red-900/50 hover:border-red-500/60 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                                                  : "border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/30 text-white"
                                          }`}
                                        >
                                          <span className="truncate group-hover:text-cyan-300">
                                            {getPlayerActionLabel(action)} {isCompleted && " ✓ [SECURED]"}
                                          </span>
                                          <span className="text-[9px] text-slate-600 font-bold border border-white/5 px-1 rounded block flex-shrink-0 ml-2">
                                            {isCompleted ? "✓" : idx + 1}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )
                            )}
                          </AnimatePresence>
                        </div>

                          <span className="h-px bg-white/5 block" />

                          {/* Escape back to standard district map travel */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-mono text-[9px] hidden sm:inline">COORD NODES ALIGNED</span>
                            {(activeDialogue || gameState?.activeBranchingDialogue || squadDialogue) ? (
                              <div className="bg-slate-900/80 border border-slate-800 text-slate-500 font-mono text-[9px] font-bold px-3.5 py-2 rounded-lg flex items-center gap-2 select-none ml-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span>FINISH CONVERSATION TO DISCONNECT SCANNER</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActivePOIView(null);
                                  setActiveDialogue(null);
                                }}
                                className="bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-950 font-mono text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 animate-pulse cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] ml-auto"
                              >
                                <ArrowLeft size={12} /> Return to Holographic Map
                              </button>
                            )}
                          </div>
                        </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
                )}

                {/* ADVANCED ELECTRONIC TACTICAL COMBAT HUD */}
                <AnimatePresence>
                  {gameState.combatState?.isActive && gridCombat && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-panel-heavy border-red-500/40 rounded-2xl p-2 md:p-2.5 shadow-2xl flex flex-col gap-2 box-glow-pink h-[96vh] max-h-[96vh] overflow-hidden justify-between"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-rose-500/20 pb-1 gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Sword size={14} className="text-rose-500 animate-pulse" />
                          <h2 className="font-display font-black text-xs md:text-sm text-rose-400 uppercase tracking-wider leading-none">
                            Combat Grid
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] bg-rose-950 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold leading-none">
                            Active Conflict
                          </span>
                        </div>
                      </div>

                      {/* Initiative Queue Timeline */}
                      <div className="bg-slate-950/80 border border-rose-500/10 p-1 rounded-xl flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-black">TURN ORDER:</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1">
                          {gridCombat.turnOrder.map((id, index) => {
                            const unit = gridCombat.combatants.find(c => c.id === id);
                            if (!unit || unit.isDead) return null;
                            const isActive = index === gridCombat.currentTurnIdx;
                            const roleLabel = unit.id === "player" 
                              ? "YOU" 
                              : unit.isCompanion 
                                ? "SQUAD" 
                                : "ARES";
                            
                            return (
                              <React.Fragment key={id}>
                                {index > 0 && <span className="text-slate-700 font-mono text-[10px] select-none">→</span>}
                                <div
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono transition-all duration-300 flex-shrink-0 ${
                                    isActive
                                      ? "bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30 animate-pulse scale-105 font-black shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                                      : unit.team === "player"
                                        ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                                        : "bg-red-950/40 border-red-950/80 text-rose-300 hover:border-red-900/40"
                                  }`}
                                >
                                  <span className="text-[10px] select-none">{unit.avatar}</span>
                                  <div className="flex flex-col leading-none">
                                    <span className="font-bold truncate max-w-[65px] uppercase tracking-wide">{unit.name.split(" ")[0]}</span>
                                    <span className={`text-[6px] font-extrabold ${isActive ? "text-cyan-400 animate-pulse" : "text-slate-500"}`}>[{roleLabel}]</span>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      {/* Responsive Split Container for Grid on Left, Controls & Info on Right */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch w-full flex-1 min-h-0 overflow-hidden">
                        
                        {/* LEFT COLUMN: Map Only */}
                        <div className="lg:col-span-8 flex flex-col gap-1 w-full h-full min-h-0 justify-between">
                          
                          {/* Tactical Grid Map & Action Status Bar */}
                          <div className="w-full flex flex-col gap-1 h-full min-h-0 items-center justify-center">
                        <div className="flex flex-wrap justify-between items-center gap-2 text-[9px] font-mono text-slate-400 px-1 border-b border-white/5 pb-0.5 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-cyan-400 uppercase font-black tracking-wider flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              Acting: {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.name.split(" ")[0].toUpperCase()}
                            </span>
                            <span className="text-slate-700">|</span>
                            <span className="text-slate-500 font-bold">AP:</span>
                            <div className="flex gap-1 items-center">
                              {Array.from({ length: gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.maxAp || 2 }).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full border border-white/10 ${
                                    idx < (gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.ap || 0)
                                      ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                                      : "bg-slate-800"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-[8px] text-slate-500 uppercase tracking-wider">TAP CELLS TO MOVE/ATTACK • ARRAY [8x6]</span>
                        </div>

                        {/* Render the Grid */}
                        <div 
                          className="grid grid-cols-8 grid-rows-6 gap-1 p-1 border border-slate-800/80 rounded-xl relative box-glow-cyan select-none aspect-[8/6] max-h-[calc(96vh-115px)] max-w-full w-auto mx-auto flex-1 min-h-0 overflow-hidden"
                          style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800')",
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }}
                        >
                          {/* Dark immersive overlay layer to secure high-contrast readability */}
                          <div className="absolute inset-0 bg-slate-950/80 pointer-events-none z-0" />

                          {/* Grid Cell Loop */}
                          {Array.from({ length: 6 }).map((_, rIdx) =>
                            Array.from({ length: 8 }).map((__, cIdx) => {
                              const COMBAT_OBSTACLES = [[2, 1], [2, 4], [5, 2], [5, 3], [3, 0], [4, 5]];
                              const cellObj = gridCombat.interactiveObjects?.find(o => o.x === cIdx && o.y === rIdx);
                              const isObstacle = COMBAT_OBSTACLES.some(([ox, oy]) => {
                                if (ox === cIdx && oy === rIdx) {
                                  const matchingObj = gridCombat.interactiveObjects?.find(o => o.x === ox && o.y === oy);
                                  if (matchingObj) {
                                    return !matchingObj.isDestroyed;
                                  }
                                  return true;
                                }
                                return false;
                              });
                              const unit = gridCombat.combatants.find(c => c.x === cIdx && c.y === rIdx && !c.isDead);
                              
                              const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                              const isPlayerTurn = activeActor?.team === "player";
                              
                              // Movement Reachability Calculation
                              let reachable = false;
                              if (isPlayerTurn && activeActor && activeActor.ap > 0 && !isObstacle && !unit && gridCombat.selectedAction === "move") {
                                const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                reachable = d > 0 && d <= 2;
                              }

                              let hoverReachable = false;
                              if (isPlayerTurn && activeActor && activeActor.ap > 0 && !isObstacle && !unit && hoveredAction === "move") {
                                const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                hoverReachable = d > 0 && d <= 2;
                              }

                              // Targeting Calculation
                              let targetable = false;
                              if (isPlayerTurn && activeActor && activeActor.ap > 0) {
                                if (selectedSkill) {
                                  if (selectedSkill.scope === "enemy" || selectedSkill.scope === "all_enemies") {
                                    if (unit && unit.team === "enemy") {
                                      targetable = true;
                                    }
                                  } else if (selectedSkill.scope === "self") {
                                    if (unit && unit.id === "player") {
                                      targetable = true;
                                    }
                                  }
                                } else {
                                  // Attack targets
                                  if (unit && unit.team === "enemy") {
                                    if (gridCombat.selectedAction === "meleeAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      targetable = d === 1;
                                    } else if (gridCombat.selectedAction === "rangedAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      const maxRange = gameState?.equipment?.rangedWeapon === "Heavy Plasma Cannon" ? 4 : 3;
                                      targetable = d > 0 && d <= maxRange;
                                    } else if (gridCombat.selectedAction === "attack") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      targetable = d <= activeActor.range;
                                    }
                                  } else if (cellObj && !cellObj.isDestroyed) {
                                    // Destructible environmental objects can be targeted and shot!
                                    if (gridCombat.selectedAction === "meleeAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      targetable = d === 1;
                                    } else if (gridCombat.selectedAction === "rangedAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      const maxRange = gameState?.equipment?.rangedWeapon === "Heavy Plasma Cannon" ? 4 : 3;
                                      targetable = d > 0 && d <= maxRange;
                                    } else if (gridCombat.selectedAction === "attack") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      targetable = d <= activeActor.range;
                                    }
                                  }
                                }
                              }

                              let hoverTargetable = false;
                              if (isPlayerTurn && activeActor && activeActor.ap > 0) {
                                if (selectedSkill) {
                                  if (selectedSkill.scope === "enemy" || selectedSkill.scope === "all_enemies") {
                                    if (unit && unit.team === "enemy") {
                                      hoverTargetable = true;
                                    }
                                  } else if (selectedSkill.scope === "self") {
                                    if (unit && unit.id === "player") {
                                      hoverTargetable = true;
                                    }
                                  }
                                } else {
                                  if (unit && unit.team === "enemy") {
                                    if (hoveredAction === "meleeAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      hoverTargetable = d === 1;
                                    } else if (hoveredAction === "rangedAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      const maxRange = gameState?.equipment?.rangedWeapon === "Heavy Plasma Cannon" ? 4 : 3;
                                      hoverTargetable = d > 0 && d <= maxRange;
                                    } else if (hoveredAction === "spell" || hoveredAction === "mind" || hoveredAction === "neural") {
                                      hoverTargetable = true;
                                    }
                                  } else if (cellObj && !cellObj.isDestroyed) {
                                    if (hoveredAction === "meleeAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      hoverTargetable = d === 1;
                                    } else if (hoveredAction === "rangedAtk") {
                                      const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      const maxRange = gameState?.equipment?.rangedWeapon === "Heavy Plasma Cannon" ? 4 : 3;
                                      hoverTargetable = d > 0 && d <= maxRange;
                                    }
                                  }
                                }
                              }

                              return (
                                <div
                                  key={`${cIdx}-${rIdx}`}
                                  onMouseEnter={() => {
                                    if (unit) {
                                      setHoveredEntity({
                                        name: unit.name,
                                        avatar: unit.avatar || "👤",
                                        type: "unit",
                                        hp: `${unit.hp}/${unit.maxHp}`,
                                        shields: unit.shields,
                                        team: unit.team,
                                        statuses: unit.statuses || [],
                                        desc: unit.id === "player" ? "Your deployed operative. Controls active movement, strikes, and tactical skill selection." : `Active combat unit (${unit.team === "player" ? "Ally" : "Hostile"}).`
                                      });
                                    } else if (cellObj && !cellObj.isDestroyed) {
                                      setHoveredEntity({
                                        name: cellObj.name,
                                        avatar: cellObj.avatar,
                                        type: "object",
                                        hp: `${cellObj.hp}/${cellObj.maxHp}`,
                                        isHacked: cellObj.isHacked,
                                        desc: cellObj.description
                                      });
                                    } else if (isObstacle) {
                                      setHoveredEntity({
                                        name: "Tactical Barrier",
                                        avatar: "⚡",
                                        type: "obstacle",
                                        desc: "Impassable concrete structure providing high cover line-of-sight protection."
                                      });
                                    } else {
                                      setHoveredEntity(null);
                                    }
                                  }}
                                  onMouseLeave={() => setHoveredEntity(null)}
                                  onClick={() => {
                                    if (!isPlayerTurn || !activeActor) return;
                                    
                                    // 0. Execute Environmental Object Click Interaction (if no skill active)
                                    if (!selectedSkill && cellObj && !cellObj.isDestroyed && !cellObj.isHacked) {
                                      const dist = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                      
                                      if (cellObj.type === "terminal") {
                                        const isHacker = gameState?.archetype === "Outlaw Hacker";
                                        const canHack = isHacker || (dist <= 1);
                                        
                                        if (!canHack) {
                                          triggerToast("TOO FAR TO HACK (1 CELL REQ)");
                                          return;
                                        }
                                        
                                        if ((gameState?.mana || 0) < 10) {
                                          triggerToast("INSUFFICIENT ETHER (10 MP REQ)");
                                          return;
                                        }
                                        
                                        // Perform hack!
                                        setGameState(prev => {
                                          if (!prev) return null;
                                          return { ...prev, mana: Math.max(0, prev.mana - 10) };
                                        });
                                        
                                        setGridCombat(prev => {
                                          if (!prev) return null;
                                          const updatedObjs = prev.interactiveObjects?.map(o => {
                                            if (o.id === cellObj.id) {
                                              return {
                                                ...o,
                                                isHacked: true,
                                                color: "border-slate-800 text-slate-600 bg-slate-950/10",
                                                description: "Tech Mainframe [HACKED]"
                                              };
                                            }
                                            return o;
                                          }) || [];
                                          
                                          const updatedCombs = prev.combatants.map(c => {
                                            if (c.team === "enemy" && !c.isDead) {
                                              const nextHp = Math.max(0, c.hp - 20);
                                              const isDead = nextHp <= 0;
                                              return {
                                                ...c,
                                                hp: nextHp,
                                                silencedTurns: 2,
                                                statuses: [...(c.statuses || []).filter(s => s !== "Silenced"), "Silenced"],
                                                isDead
                                              };
                                            }
                                            if (c.id === activeActor.id) {
                                              return { ...c, ap: Math.max(0, c.ap - 1) };
                                            }
                                            return c;
                                          });
                                          
                                          return {
                                            ...prev,
                                            interactiveObjects: updatedObjs,
                                            combatants: updatedCombs,
                                            turnLog: `💻 TECH MAINFRAME HACKED: ${activeActor.name} overloaded the central terminal! Direct neural feedback shocked all active hostiles for 20 damage and silenced them for 2 turns! (-10 Mana, -1 AP)`
                                          };
                                        });
                                        
                                        triggerToast("GRID TERMINAL HACKED!");
                                        return;
                                      }
                                      
                                      if (cellObj.type === "shield_cover") {
                                        if (dist > 1) {
                                          triggerToast("TOO FAR TO ACTIVATE (1 CELL REQ)");
                                          return;
                                        }
                                        
                                        if (activeActor.ap < 1) {
                                          triggerToast("INSUFFICIENT ACTION POINTS");
                                          return;
                                        }
                                        
                                        // Activate Energy Cover!
                                        setGridCombat(prev => {
                                          if (!prev) return null;
                                          const updatedObjs = prev.interactiveObjects?.map(o => {
                                            if (o.id === cellObj.id) {
                                              return {
                                                ...o,
                                                isHacked: true,
                                                color: "border-slate-800 text-slate-600 bg-slate-950/10",
                                                description: "Energy Cover [ACTIVATED]"
                                              };
                                            }
                                            return o;
                                          }) || [];
                                          
                                          const updatedCombs = prev.combatants.map(c => {
                                            if (c.id === activeActor.id) {
                                              return { ...c, ap: Math.max(0, c.ap - 1) };
                                            }
                                            return c;
                                          });
                                          
                                          // Find player units adjacent to the shield cover
                                          updatedCombs.forEach(unit => {
                                            const uDist = Math.abs(unit.x - cellObj.x) + Math.abs(unit.y - cellObj.y);
                                            if (unit.team === "player" && uDist <= 1 && !unit.isDead) {
                                              unit.shields = Math.min(unit.maxShields || 50, unit.shields + 20);
                                            }
                                          });
                                          
                                          return {
                                            ...prev,
                                            interactiveObjects: updatedObjs,
                                            combatants: updatedCombs,
                                            turnLog: `🛰️ ENERGY COVER ACTIVATED: ${activeActor.name} deployed the electromagnetic cover! All adjacent allies gained +20 Shields! (-1 AP)`
                                          };
                                        });
                                        
                                        triggerToast("ENERGY DEFENSES ENERGIZED!");
                                        return;
                                      }
                                    }

                                    // 1. Execute Selected Class Skill
                                    if (selectedSkill) {
                                      if (targetable) {
                                        const cost = selectedSkill.cost;
                                        if (selectedSkill.costType === "MP" && (gameState?.mana || 0) < cost) {
                                          triggerToast("INSUFFICIENT ETHER (MP)");
                                          return;
                                        }
                                        if (selectedSkill.costType === "SP" && (gameState?.stamina || 0) < cost) {
                                          triggerToast("INSUFFICIENT STAMINA (SP)");
                                          return;
                                        }

                                        // Deduct mana or stamina cost from gameState
                                        setGameState(prev => {
                                          if (!prev) return null;
                                          const nextMana = selectedSkill.costType === "MP" ? Math.max(0, prev.mana - cost) : prev.mana;
                                          const nextStam = selectedSkill.costType === "SP" ? Math.max(0, prev.stamina - cost) : prev.stamina;
                                          return { ...prev, mana: nextMana, stamina: nextStam };
                                        });

                                        // Apply skill results in gridCombat
                                        setGridCombat(prev => {
                                          if (!prev) return null;
                                          let updatedCombs = prev.combatants.map(c => ({ ...c }));
                                          const pActor = updatedCombs.find(c => c.id === activeActor.id)!;
                                          pActor.ap = Math.max(0, pActor.ap - 1);

                                          let log = "";
                                          const skillName = selectedSkill.name;

                                          if (selectedSkill.scope === "enemy") {
                                            const enemyUnit = updatedCombs.find(c => c.x === cIdx && c.y === rIdx && !c.isDead)!;
                                            let dmg = 25;

                                            if (skillName.includes("Viper Strike")) {
                                              dmg = 35 + Math.floor((gameState?.attributes?.str || 10) * 1.5);
                                              enemyUnit.corrodedTurns = 3;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Corroded"), "Corroded"];
                                              log = `🗡️ VIPER STRIKE: Slashed ${enemyUnit.name} for ${dmg} physical damage and coated them in corrosion sludge (3 turns).`;
                                            } else if (skillName.includes("Phantom Dash")) {
                                              dmg = 45;
                                              pActor.x = Math.max(0, Math.min(7, enemyUnit.x + (enemyUnit.x > pActor.x ? -1 : 1)));
                                              pActor.y = enemyUnit.y;
                                              log = `👤 PHANTOM DASH: Teleported behind ${enemyUnit.name}, executing an ether backstab for ${dmg} barrier-bypassing physical damage!`;
                                            } else if (skillName.includes("Executioner's Wake")) {
                                              dmg = 55;
                                              log = `☠️ EXECUTIONER'S WAKE: Dealt massive ${dmg} impact damage.`;
                                              if (enemyUnit.hp - dmg <= 0) {
                                                log += " Target compromised! Mana cost partially refunded.";
                                                setGameState(g => g ? { ...g, mana: Math.min(g.maxMana, g.mana + Math.floor(cost / 2)) } : null);
                                              }
                                            } else if (skillName.includes("Ether Spark")) {
                                              dmg = 22 + Math.floor((gameState?.attributes?.eth || 10) * 1.3);
                                              log = `🔮 ETHER SPARK: Generated lay-resonance bolt striking ${enemyUnit.name} for ${dmg} magic damage.`;
                                            } else if (skillName.includes("Feedback Burn")) {
                                              dmg = 35;
                                              enemyUnit.silencedTurns = 2;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Silenced"), "Silenced"];
                                              log = `💥 FEEDBACK BURN: Overloaded neural chips of ${enemyUnit.name}, dealing ${dmg} burst damage and jamming connections (Silenced for 2 turns).`;
                                            } else if (skillName.includes("Bio-Electric Surge")) {
                                              dmg = 30;
                                              enemyUnit.glitchTurns = 2;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Glitched"), "Glitched"];
                                              log = `⚡ BIO-ELECTRIC SURGE: Released electric surge on ${enemyUnit.name} for ${dmg} shock damage, disabling active robots (Glitched for 2 turns).`;
                                            } else if (skillName.includes("Absolute Zero Code")) {
                                              dmg = 50;
                                              enemyUnit.stunnedTurns = 2;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Stunned"), "Stunned"];
                                              log = `❄️ ABSOLUTE ZERO CODE: Injected cryogenic freeze algorithm into ${enemyUnit.name}, causing ${dmg} damage and paralyzing them (Stunned for 2 turns).`;
                                            } else if (skillName.includes("ICE Disruption")) {
                                              dmg = 15;
                                              enemyUnit.glitchTurns = 3;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Glitched"), "Glitched"];
                                              log = `💻 ICE DISRUPTION: Corrupted host subroutines, dealing ${dmg} damage and lowering combat efficiency (Glitched for 3 turns).`;
                                            } else if (skillName.includes("Targeting Link")) {
                                              dmg = 20;
                                              enemyUnit.corrodedTurns = 2;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Corroded"), "Corroded"];
                                              log = `🎯 TARGETING LINK: Linked coordinate locks on ${enemyUnit.name}, dealing ${dmg} laser damage and exposing weaknesses (Corroded for 2 turns).`;
                                            } else if (skillName.includes("Systems Overload")) {
                                              dmg = 28;
                                              enemyUnit.stunnedTurns = 2;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Stunned"), "Stunned"];
                                              log = `🔋 SYSTEMS OVERLOAD: Triggered localized terminal shocks dealing ${dmg} overload damage and causing Stun for 2 turns.`;
                                            } else if (skillName.includes("Glitch Protocol")) {
                                              dmg = 15;
                                              pActor.shields = Math.min(pActor.maxShields || 50, pActor.shields + 20);
                                              log = `🛰️ GLITCH PROTOCOL: Extracted defensive grid code from ${enemyUnit.name} to reinforce yourself, dealing ${dmg} damage and adding +20 Shields!`;
                                            } else if (skillName.includes("Nano-Swarm Hack")) {
                                              dmg = 15;
                                              enemyUnit.corrodedTurns = 3;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Corroded"), "Corroded"];
                                              log = `🐜 NANO-SWARM HACK: Dispatched aerosol micro-nanites eating target hull. Dealt ${dmg} damage, inflicting acid corrosion (3 turns).`;
                                            } else if (skillName.includes("Satellite Guillotine")) {
                                              dmg = 60;
                                              log = `☄️ SATELLITE GUILLOTINE: Fired a high-orbit kinetic impact rod directly on ${enemyUnit.name} dealing ${dmg} heavy damage!`;
                                            } else if (skillName.includes("Mind Hack")) {
                                              dmg = 20;
                                              enemyUnit.panicTurns = 2;
                                              enemyUnit.statuses = [...(enemyUnit.statuses || []).filter(s => s !== "Panic"), "Panic"];
                                              log = `👁️ MIND HACK: Hijacked cognitive motor control of ${enemyUnit.name}, dealing ${dmg} damage and triggering severe System Panic!`;
                                            } else if (skillName.includes("Neural Overload")) {
                                              dmg = 25;
                                              log = `🧠 NEURAL OVERLOAD: Fired direct synapse shock wave dealing ${dmg} damage, completely bypassing shields!`;
                                            } else if (skillName.includes("Cerebro-Collapse")) {
                                              dmg = 60;
                                              const heal = 30;
                                              pActor.hp = Math.min(pActor.maxHp, pActor.hp + heal);
                                              log = `🥀 CEREBRO-COLLAPSE: Obliterated target cortex for ${dmg} psychic damage and drained synapses, healing yourself for +${heal} HP!`;
                                            }

                                            // Apply HP damage
                                            if (skillName.includes("Neural Overload") || skillName.includes("Phantom Dash")) {
                                              enemyUnit.hp = Math.max(0, enemyUnit.hp - dmg);
                                            } else {
                                              if (enemyUnit.shields > 0) {
                                                enemyUnit.shields -= dmg;
                                                if (enemyUnit.shields < 0) {
                                                  enemyUnit.hp += enemyUnit.shields;
                                                  enemyUnit.shields = 0;
                                                }
                                              } else {
                                                enemyUnit.hp -= dmg;
                                              }
                                              enemyUnit.hp = Math.max(0, enemyUnit.hp);
                                            }
                                            enemyUnit.isDead = enemyUnit.hp <= 0;

                                            // Sync enemy HP to gameState
                                            if (enemyUnit.id === "enemy-1" && gameState) {
                                              setGameState(g => {
                                                if (!g) return null;
                                                return {
                                                  ...g,
                                                  combatState: {
                                                    ...g.combatState!,
                                                    enemyHp: enemyUnit.hp,
                                                    enemyShields: enemyUnit.shields
                                                  }
                                                };
                                              });
                                            }
                                          } else if (selectedSkill.scope === "all_enemies") {
                                            let dmg = 30;
                                            if (skillName.includes("Razor Tempest")) {
                                              dmg = 30;
                                              updatedCombs.forEach(e => {
                                                if (e.team === "enemy" && !e.isDead) {
                                                  e.hp = Math.max(0, e.hp - dmg);
                                                  e.bleedTurns = 3;
                                                  e.statuses = [...(e.statuses || []).filter(s => s !== "Bleeding"), "Bleeding"];
                                                  e.isDead = e.hp <= 0;
                                                }
                                              });
                                              log = `🌪️ RAZOR TEMPEST: Whirled molecular edge sweeps dealing ${dmg} physical damage to ALL active enemies and applying Bleeding!`;
                                            } else if (skillName.includes("Quantum Singularity")) {
                                              dmg = 25;
                                              updatedCombs.forEach(e => {
                                                if (e.team === "enemy" && !e.isDead) {
                                                  e.hp = Math.max(0, e.hp - dmg);
                                                  e.stunnedTurns = 2;
                                                  e.statuses = [...(e.statuses || []).filter(s => s !== "Stunned"), "Stunned"];
                                                  e.isDead = e.hp <= 0;
                                                }
                                              });
                                              log = `🌌 QUANTUM SINGULARITY: Collapsed lay-gravity dealing ${dmg} void damage to ALL active enemies and pinning them (Stunned for 2 turns)!`;
                                            } else if (skillName.includes("Synaptic Cascade")) {
                                              dmg = 40;
                                              updatedCombs.forEach(e => {
                                                if (e.team === "enemy" && !e.isDead) {
                                                  e.hp = Math.max(0, e.hp - dmg);
                                                  e.stunnedTurns = 1;
                                                  e.statuses = [...(e.statuses || []).filter(s => s !== "Stunned"), "Stunned"];
                                                  e.isDead = e.hp <= 0;
                                                }
                                              });
                                              log = `🌀 SYNAPTIC CASCADE: Neural synapse meltdown dealing ${dmg} psychic damage to ALL active enemies, locking them in Sleep Stun!`;
                                            } else {
                                              updatedCombs.forEach(e => {
                                                if (e.team === "enemy" && !e.isDead) {
                                                  e.hp = Math.max(0, e.hp - dmg);
                                                  e.isDead = e.hp <= 0;
                                                }
                                              });
                                              log = `🔮 AREA BLAST: Cast ${skillName} dealing ${dmg} magic damage to ALL hostiles on grid!`;
                                            }

                                            const primaryEnemy = updatedCombs.find(c => c.id === "enemy-1");
                                            if (primaryEnemy && gameState) {
                                              setGameState(g => {
                                                if (!g) return null;
                                                return {
                                                  ...g,
                                                  combatState: {
                                                    ...g.combatState!,
                                                    enemyHp: primaryEnemy.hp,
                                                    enemyShields: primaryEnemy.shields
                                                  }
                                                };
                                              });
                                            }
                                          } else if (selectedSkill.scope === "self") {
                                            if (skillName.includes("Adrenaline Surge")) {
                                              pActor.ap = Math.min(pActor.maxAp + 2, pActor.ap + 2);
                                              pActor.overclockTurns = 2;
                                              pActor.statuses = [...(pActor.statuses || []).filter(s => s !== "Overclocked"), "Overclocked"];
                                              log = `⚡ ADRENALINE SURGE: Injected active adrenaline booster. Restored +2 AP and entered Overclock state!`;
                                            } else if (skillName.includes("Cyber-Celerity")) {
                                              pActor.overclockTurns = 3;
                                              pActor.statuses = [...(pActor.statuses || []).filter(s => s !== "Overclocked"), "Overclocked"];
                                              log = `🏃 CYBER-CELERITY: Clock rate multiplied. Grants high physical evasion (Overclocked for 3 turns)!`;
                                            } else if (skillName.includes("Net Shield")) {
                                              pActor.shields = Math.min(pActor.maxShields || 50, pActor.shields + 25);
                                              log = `🛡️ NET SHIELD: Configured defensive micro-firewalls, granting +25 active shields!`;
                                            } else if (skillName.includes("Ether Shroud")) {
                                              pActor.overclockTurns = 2;
                                              pActor.statuses = [...(pActor.statuses || []).filter(s => s !== "Overclocked"), "Overclocked"];
                                              log = `🌫️ ETHER SHROUD: Cloaked neural signature, gaining invincibility and +50% combat evasion for 2 turns!`;
                                            } else if (skillName.includes("Hallucinatory Echo")) {
                                              pActor.shields = Math.min(pActor.maxShields || 50, pActor.shields + 25);
                                              log = `👥 HALLUCINATORY ECHO: Projected 2 neural signature hologram clones, adding +25 Shields!`;
                                            }
                                          }

                                          if (gameState) {
                                            setGameState(g => g ? { ...g, hp: pActor.hp } : null);
                                          }

                                          setSelectedSkill(null);
                                          return {
                                            ...prev,
                                            combatants: updatedCombs,
                                            turnLog: `🔮 HIGH-TIER SKILL CAST: ${log}`
                                          };
                                        });

                                        triggerToast("HIGH-TIER SKILL CAST");
                                        return;
                                      }
                                    }

                                    // 2. Execute Attack on Destructible Environmental Object
                                    if (targetable && cellObj && !cellObj.isDestroyed && (gridCombat.selectedAction === "attack" || gridCombat.selectedAction === "meleeAtk" || gridCombat.selectedAction === "rangedAtk")) {
                                      let finalDamage = activeActor.damage;
                                      let weaponUsedName = "strike";

                                      if (gridCombat.selectedAction === "meleeAtk") {
                                        weaponUsedName = gameState?.equipment?.meleeWeapon || "tactical strike";
                                        finalDamage = 15 + Math.floor((gameState?.attributes?.str || 10) * 1.2);
                                      } else if (gridCombat.selectedAction === "rangedAtk") {
                                        weaponUsedName = gameState?.equipment?.rangedWeapon || "weapon shot";
                                        finalDamage = 12 + Math.floor((gameState?.attributes?.dex || 10) * 1.2);
                                      }

                                      const rollDmg = finalDamage + Math.floor(Math.random() * 5) - 2;

                                      setGridCombat(prev => {
                                        if (!prev) return null;
                                        let updatedObjs = prev.interactiveObjects?.map(o => ({ ...o })) || [];
                                        let updatedCombs = prev.combatants.map(c => ({ ...c }));
                                        const pActor = updatedCombs.find(c => c.id === activeActor.id)!;
                                        pActor.ap = Math.max(0, pActor.ap - 1);

                                        const targetObj = updatedObjs.find(o => o.id === cellObj.id)!;
                                        targetObj.hp = Math.max(0, targetObj.hp - rollDmg);
                                        let destructionLog = "";

                                        if (targetObj.hp <= 0) {
                                          targetObj.isDestroyed = true;
                                          if (targetObj.type === "battery") {
                                            updatedCombs.forEach(unit => {
                                              const dist = Math.abs(unit.x - targetObj.x) + Math.abs(unit.y - targetObj.y);
                                              if (dist <= 1 && !unit.isDead) {
                                                unit.hp = Math.max(0, unit.hp - 30);
                                                destructionLog += ` 💥 Plasma Sludge explosion sweeps sector: ${unit.name} sustained 30 fire damage!`;
                                                unit.isDead = unit.hp <= 0;
                                              }
                                            });

                                            const hitPlayer = updatedCombs.find(c => c.id === "player")!;
                                            if (gameState) {
                                              setGameState(g => g ? { ...g, hp: hitPlayer.hp } : null);
                                            }
                                          }
                                        }

                                        const objRemainingLog = targetObj.isDestroyed
                                          ? `💥 ${targetObj.name} BLOWN UP: System vaporized!${destructionLog}`
                                          : `🎯 Hit! ${targetObj.name} sustained ${rollDmg} damage. Integrity: (${targetObj.hp}/${targetObj.maxHp} HP).`;

                                        return {
                                          ...prev,
                                          interactiveObjects: updatedObjs,
                                          combatants: updatedCombs,
                                          turnLog: `⚔️ ENVIRONMENT ATTACK REPORT: ${activeActor.name} targeted ${targetObj.name} with ${weaponUsedName}! ${objRemainingLog}`
                                        };
                                      });

                                      triggerToast("OBJECT DAMAGED");
                                      return;
                                    }
                                    
                                    // 3. Execute move
                                    if (reachable && gridCombat.selectedAction === "move") {
                                      const updated = gridCombat.combatants.map(c => {
                                        if (c.id === activeActor.id) {
                                          return { ...c, x: cIdx, y: rIdx, ap: c.ap - 1 };
                                        }
                                        return c;
                                      });

                                      setGridCombat(prev => prev ? {
                                        ...prev,
                                        combatants: updated,
                                        turnLog: `⚡ ${activeActor.name} moved to sector coordinates [${cIdx}, ${rIdx}].`
                                      } : null);

                                      if (activeActor.id === "player" && gameState) {
                                        let ns = { ...gameState };
                                        setGameState(ns);
                                      }
                                      triggerToast("SECTOR MOVEMENT COMPLETE");
                                    }
                                    
                                    // Execute attack
                                    if (targetable && unit && (gridCombat.selectedAction === "attack" || gridCombat.selectedAction === "meleeAtk" || gridCombat.selectedAction === "rangedAtk")) {
                                      let finalDamage = activeActor.damage;
                                      let weaponUsedName = "unarmed strike";

                                      if (gridCombat.selectedAction === "meleeAtk") {
                                        const derived = getDerivedStats();
                                        weaponUsedName = gameState?.equipment?.meleeWeapon || "standard cyber-fists";
                                        finalDamage = 15 + Math.floor((gameState?.attributes?.str || 10) * 1.2) + derived.meleeAtk;
                                      } else if (gridCombat.selectedAction === "rangedAtk") {
                                        const derived = getDerivedStats();
                                        weaponUsedName = gameState?.equipment?.rangedWeapon || "integrated sidearm";
                                        finalDamage = 12 + Math.floor((gameState?.attributes?.dex || 10) * 1.2) + derived.rangeAtk;
                                      }

                                      const isOverclocked = activeActor.overclockTurns !== undefined && activeActor.overclockTurns > 0;
                                      const baseRollDmg = finalDamage + Math.floor(Math.random() * 7) - 3;
                                      const rollDmg = isOverclocked ? Math.floor(baseRollDmg * 1.8) : baseRollDmg;
                                      
                                      const updated = gridCombat.combatants.map(c => {
                                        if (c.id === unit.id) {
                                          let finalHp = c.hp;
                                          let finalShields = c.shields;
                                          if (finalShields > 0) {
                                            finalShields -= rollDmg;
                                            if (finalShields < 0) {
                                              finalHp += finalShields;
                                              finalShields = 0;
                                            }
                                          } else {
                                            finalHp -= rollDmg;
                                          }
                                          const isDead = finalHp <= 0;
                                          return { ...c, hp: Math.max(0, finalHp), shields: finalShields, isDead };
                                        }
                                        if (c.id === activeActor.id) {
                                          return { ...c, ap: c.ap - 1 };
                                        }
                                        return c;
                                      });

                                      const hitEnemy = updated.find(c => c.id === unit.id);
                                      const overclockMsg = isOverclocked ? " ⚡ DOUBLE STRIKE OVERCLOCK DETECTED!" : "";
                                      const enemyRemainingLog = hitEnemy?.isDead 
                                        ? `💥 ${hitEnemy.name} COMPROMISED: Systems overloaded and shattered!${overclockMsg}`
                                        : `🎯 Hit! ${hitEnemy?.name} sustained ${rollDmg} damage.${overclockMsg} Vitals: (${hitEnemy?.hp}/${hitEnemy?.maxHp} HP, ${hitEnemy?.shields} SHIELD).`;

                                      setGridCombat(prev => prev ? {
                                        ...prev,
                                        combatants: updated,
                                        turnLog: `⚔️ ATTACK REPORT: ${activeActor.name} engaged ${unit.name} using ${weaponUsedName}! ${enemyRemainingLog}`
                                      } : null);

                                      // Sync health back to primary gameState if the primary enemy or player was damaged
                                      if (gameState) {
                                        let ns = { ...gameState };
                                        if (unit.id === "enemy-1") {
                                          ns.combatState!.enemyHp = Math.max(0, hitEnemy?.hp || 0);
                                          ns.combatState!.enemyShields = hitEnemy?.shields || 0;
                                        }
                                        setGameState(ns);
                                      }
                                      triggerToast("STRIKE REGISTERED");
                                    }
                                  }}
                                  className={`relative z-10 rounded border w-full h-full flex items-center justify-center transition-all ${
                                    isObstacle 
                                      ? "bg-stripes-warning border-slate-900 bg-slate-900/40 text-slate-600"
                                      : reachable
                                        ? "border-cyan-400 bg-cyan-950/40 cursor-pointer animate-pulse shadow-[inset_0_0_6px_rgba(34,211,238,0.3)] hover:bg-cyan-900/40"
                                        : targetable
                                          ? "border-rose-500 bg-rose-950/40 cursor-pointer animate-pulse shadow-[inset_0_0_6px_rgba(239,68,68,0.3)] hover:bg-rose-900/40"
                                          : hoverReachable
                                            ? "border-cyan-500/80 bg-cyan-950/20 ring-2 ring-cyan-500/50 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
                                            : hoverTargetable
                                              ? "border-rose-500/80 bg-rose-950/20 ring-2 ring-rose-500/50 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer"
                                              : "border-white/[0.03] bg-slate-900/30 hover:bg-slate-900/50"
                                  }`}
                                >
                                  {/* Render 2.5D Interactive Object */}
                                  {cellObj && !cellObj.isDestroyed && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1 z-20 pointer-events-none animate-fadeIn">
                                      <div className={`w-11/12 h-11/12 rounded-lg border-2 flex flex-col items-center justify-center text-xs relative ${cellObj.color} shadow-lg shadow-black/80 backdrop-blur-xs`}>
                                        <span className="text-sm select-none animate-bounce-slow mt-1">{cellObj.avatar}</span>
                                        <span className="text-[6px] font-mono font-black scale-90 mt-0.5 tracking-tighter uppercase leading-none text-white select-none">{cellObj.name.split(" ")[0]}</span>
                                        {/* Object HP bar */}
                                        <div className="w-4/5 bg-slate-900 h-[2.5px] rounded-full overflow-hidden absolute bottom-1.5 border border-white/5">
                                          <div className="bg-emerald-400 h-full shadow-[0_0_4px_rgba(52,211,153,0.6)]" style={{ width: `${Math.max(0, Math.min(100, (cellObj.hp / cellObj.maxHp) * 100))}%` }} />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Fallback Obstacle Icon if no interactive object */}
                                  {isObstacle && !cellObj && <span className="text-[10px] opacity-30 select-none">⚡</span>}

                                  {/* Coordinates Hover Label */}
                                  <span className="absolute bottom-0.5 right-0.5 text-[7px] text-slate-800 font-mono select-none">
                                    {cIdx},{rIdx}
                                  </span>

                                  {/* Reachable Dot */}
                                  {(reachable || hoverReachable) && <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />}

                                  {/* Render 2.5D Standing Unit Token */}
                                  {unit && (
                                    <div
                                      className={`absolute inset-x-0 bottom-0 h-[125%] flex flex-col items-center justify-end pointer-events-none ${
                                        unit.id === activeActor?.id ? "z-30 scale-105 -translate-y-1" : "z-20"
                                      } transition-all duration-300`}
                                    >
                                      {/* Holographic Tactical Base Plate (Glows under character's feet) */}
                                      <div
                                        className={`w-[85%] h-[20px] rounded-[50%] absolute bottom-0 border-2 bg-slate-950/80 shadow-lg ${
                                          unit.team === "player"
                                            ? "border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                            : "border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                        } ${unit.id === activeActor?.id ? "animate-pulse border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.7)]" : ""}`}
                                      />

                                      {/* Standing Character Visual Miniature Card */}
                                      <div
                                        className={`w-[78%] h-[85%] absolute bottom-2 rounded-t-xl overflow-hidden border-2 flex flex-col justify-end shadow-2xl transition-all duration-300 ${
                                          unit.team === "player"
                                            ? "border-cyan-500/80 bg-gradient-to-t from-cyan-950/90 via-cyan-950/40 to-slate-950/30"
                                            : "border-red-500/80 bg-gradient-to-t from-red-950/90 via-red-950/40 to-slate-950/30"
                                        } ${unit.id === activeActor?.id ? "border-cyan-400 ring-2 ring-cyan-400/30" : ""}`}
                                      >
                                        {/* Unit Sprite Image */}
                                        {unit.image ? (
                                          <img
                                            src={unit.image}
                                            alt={unit.name}
                                            className={`w-full h-full filter contrast-[1.05] brightness-[1.02] ${
                                              unit.image.includes("body")
                                                ? "object-contain object-bottom p-0.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                                                : "object-cover object-top"
                                            } ${
                                              (unit.glitchTurns !== undefined && unit.glitchTurns > 0) || (unit.statuses?.includes("Glitched")) ? "animate-glitch opacity-85" : ""
                                            }`}
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className={`w-full h-full flex items-center justify-center bg-slate-900 ${
                                            (unit.glitchTurns !== undefined && unit.glitchTurns > 0) || (unit.statuses?.includes("Glitched")) ? "animate-glitch" : ""
                                          }`}>
                                            <span className="text-xl">{unit.avatar}</span>
                                          </div>
                                        )}

                                        {/* Holographic Active Laser Scanner Line */}
                                        {unit.id === activeActor?.id && (
                                          <div
                                            className={`absolute inset-x-0 h-0.5 pointer-events-none z-10 opacity-75 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-scanline ${
                                              unit.team === "player" ? "bg-cyan-400" : "bg-rose-500"
                                            }`}
                                          />
                                        )}

                                        {/* Futuristic Scanline Overlay */}
                                        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.15] mix-blend-overlay" />

                                        {/* Cybernetic Neon Glow Effect */}
                                        <div
                                          className={`absolute inset-0 bg-gradient-to-t opacity-30 pointer-events-none ${
                                            unit.team === "player"
                                              ? "from-cyan-500/40 to-transparent"
                                              : "from-red-500/40 to-transparent"
                                          }`}
                                        />

                                        {/* Mini Badge overlaying the avatar emoji */}
                                        <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-slate-950/90 border border-white/10 flex items-center justify-center text-[8px] shadow z-10 select-none">
                                          {unit.avatar}
                                        </div>

                                        {/* Short human-readable tactical label */}
                                        <div className="absolute top-1 right-1 px-1 bg-slate-950/80 rounded border border-white/5 text-[6px] font-mono font-bold leading-none scale-90 origin-top-right text-slate-300 tracking-tighter select-none z-10">
                                          {unit.id === "player" ? "YOU" : unit.name.split(" ")[0].toUpperCase()}
                                        </div>

                                        {/* Full Width Integrated Health and Shield Overlay with HP values underneath */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-white/10 p-0.5 flex flex-col gap-0.5 z-20">
                                          {unit.shields > 0 && (
                                            <div className="w-full bg-slate-900 h-[3px] rounded-full overflow-hidden">
                                              <div
                                                className="bg-cyan-400 h-full shadow-[0_0_4px_rgba(34,211,238,0.8)]"
                                                style={{ width: `${Math.max(0, Math.min(100, (unit.shields / unit.maxShields) * 100))}%` }}
                                              />
                                            </div>
                                          )}
                                          <div className="w-full bg-slate-900 h-[3px] rounded-full overflow-hidden">
                                            <div
                                              className="bg-red-500 h-full"
                                              style={{ width: `${Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100))}%` }}
                                            />
                                          </div>
                                          <div className="flex justify-between items-center text-[6px] font-mono font-black px-0.5 text-rose-300 scale-90 leading-none">
                                            <span>HP</span>
                                            <span>{unit.hp}/{unit.maxHp}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tiny floating status indicator icons */}
                                      <div className="absolute top-0 right-1 flex flex-col gap-0.5 pointer-events-none select-none z-40 scale-90">
                                        {unit.overclockTurns !== undefined && unit.overclockTurns > 0 && (
                                          <span className="text-[7px] text-amber-400 font-extrabold bg-slate-950/95 leading-none p-0.5 rounded border border-amber-500/40 shadow-md animate-pulse">⚡</span>
                                        )}
                                        {unit.glitchTurns !== undefined && unit.glitchTurns > 0 && (
                                          <span className="text-[7px] text-red-400 font-extrabold bg-slate-950/95 leading-none p-0.5 rounded border border-red-500/40 shadow-md animate-pulse">🔌</span>
                                        )}
                                        {unit.corrodedTurns !== undefined && unit.corrodedTurns > 0 && (
                                          <span className="text-[7px] text-emerald-400 font-extrabold bg-slate-950/95 leading-none p-0.5 rounded border border-emerald-500/40 shadow-md animate-pulse">💥</span>
                                        )}
                                        {unit.panicTurns !== undefined && unit.panicTurns > 0 && (
                                          <span className="text-[7px] text-fuchsia-400 font-extrabold bg-slate-950/95 leading-none p-0.5 rounded border border-fuchsia-500/40 shadow-md animate-pulse">🧠</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Controls Panel + Scanner + Log */}
                    <div className="lg:col-span-4 flex flex-col justify-between gap-1.5 w-full h-full min-h-0 overflow-y-auto pr-0.5">
                      {/* Controls Box */}
                      <div className="bg-slate-950/60 border border-white/5 p-2 rounded-xl shadow-xl flex flex-col gap-1.5 shrink-0">
                        <div className="border-b border-white/10 pb-1 flex justify-between items-center">
                          <span className="text-3xs font-mono font-black text-slate-400 uppercase tracking-widest">TACTICAL INTERFACE</span>
                          <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 font-mono font-black animate-pulse">READY</span>
                        </div>

                      {/* Controls Area */}
                      <div className="w-full flex flex-col gap-1.5">
                        {selectedSkill && (
                          <div className="bg-purple-950/50 border border-purple-500/40 p-1.5 rounded-lg flex justify-between items-center text-3xs font-mono animate-pulse shrink-0">
                            <div className="flex items-center gap-1.5 text-purple-300">
                              <span>{selectedSkill.icon}</span>
                              <span className="font-extrabold uppercase">{selectedSkill.name.split(" (")[0]}</span>
                              <span className="text-[8px] text-purple-400">({selectedSkill.cost} {selectedSkill.costType})</span>
                            </div>
                            <button
                              onClick={() => setSelectedSkill(null)}
                              className="text-red-400 hover:text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded bg-slate-950 cursor-pointer scale-90"
                            >
                              CANCEL
                            </button>
                          </div>
                        )}
                        {/* Player / Companion Turn Controls */}
                        {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.team === "player" ? (
                          <div className="flex flex-col gap-1.5 w-full animate-fadeIn">
                            {/* Tab Switching Headers */}
                            <div className="flex border-b border-white/10 pb-1 gap-1 overflow-x-auto scrollbar-none">
                              <button
                                onClick={() => setCombatActionTab("attacks")}
                                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                  combatActionTab === "attacks"
                                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                ⚔️ Attacks
                              </button>
                              <button
                                onClick={() => setCombatActionTab("skills")}
                                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                  combatActionTab === "skills"
                                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                🔮 Skills
                              </button>
                              <button
                                onClick={() => setCombatActionTab("support")}
                                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                  combatActionTab === "support"
                                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                🏃 Support
                              </button>
                            </div>

                            {/* Tab Contents + Persistent End Turn Button */}
                            <div className="flex flex-col gap-2 bg-slate-950/40 p-2 rounded-lg border border-white/5">
                              {/* Current Active Tab Content Action Buttons */}
                              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 w-full">
                                {combatActionTab === "support" && (
                                  <button
                                    onClick={() => {
                                      setGridCombat(prev => prev ? { ...prev, selectedAction: "move" } : null);
                                    }}
                                    onMouseEnter={() => setHoveredAction("move")}
                                    onMouseLeave={() => setHoveredAction(null)}
                                    className={`flex-1 font-mono font-black text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                      gridCombat.selectedAction === "move"
                                        ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                        : "bg-slate-900 border-white/5 text-cyan-400 hover:bg-slate-800"
                                    }`}
                                  >
                                    🚀 Move [1 AP]
                                  </button>
                                )}
                                {combatActionTab === "skills" && (
                                  <div className="col-span-2 flex flex-col gap-2 w-full">
                                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1 text-slate-400">
                                      <span className="uppercase tracking-wider font-extrabold text-purple-400">⚡ CLASS: {gameState?.archetype || "CYBER-BLADE"}{gameState?.mindmancerUnlocked ? " + MINDMANCER" : ""}</span>
                                      <span className="bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-slate-300 font-extrabold">LEVEL: {gameState?.level || 1}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                                      {(() => {
                                        const playerArchetype = gameState?.archetype || "Cyber-Blade";
                                        let archetypeSkillNames = {
                                          "Cyber-Blade": [
                                            "Viper Strike (Tier 1)",
                                            "Adrenaline Surge (Tier 2)",
                                            "Phantom Dash (Tier 3)",
                                            "Razor Tempest (Tier 4)",
                                            "Cyber-Celerity (Tier 5)",
                                            "Executioner's Wake (Tier 6)"
                                          ],
                                          "Techno-Mage": [
                                            "Ether Spark (Tier 1)",
                                            "Net Shield (Tier 2)",
                                            "Feedback Burn (Tier 3)",
                                            "Quantum Singularity (Tier 4)",
                                            "Bio-Electric Surge (Tier 5)",
                                            "Absolute Zero Code (Tier 6)"
                                          ],
                                          "Outlaw Hacker": [
                                            "ICE Disruption (Tier 1)",
                                            "Targeting Link (Tier 2)",
                                            "Systems Overload (Tier 3)",
                                            "Glitch Protocol (Tier 4)",
                                            "Nano-Swarm Hack (Tier 5)",
                                            "Satellite Guillotine (Tier 6)"
                                          ],
                                          "Mindmancer": [
                                            "Mind Hack (Tier 1)",
                                            "Neural Overload (Tier 2)",
                                            "Synaptic Cascade (Tier 3)",
                                            "Ether Shroud (Tier 4)",
                                            "Hallucinatory Echo (Tier 5)",
                                            "Cerebro-Collapse (Tier 6)"
                                          ]
                                        }[playerArchetype] || [];

                                        const mindmancerSpells = [
                                          "Mind Hack (Tier 1)",
                                          "Neural Overload (Tier 2)",
                                          "Synaptic Cascade (Tier 3)",
                                          "Ether Shroud (Tier 4)",
                                          "Hallucinatory Echo (Tier 5)",
                                          "Cerebro-Collapse (Tier 6)"
                                        ];

                                        if ((gameState?.mindmancerUnlocked || (gameState?.skills?.mindmancer && gameState.skills.mindmancer > 0)) && playerArchetype !== "Mindmancer") {
                                          archetypeSkillNames = [...archetypeSkillNames, ...mindmancerSpells];
                                        }

                                        return archetypeSkillNames.map((skillName, idx) => {
                                          const match = skillName.match(/\(Tier (\d+)\)/);
                                          const skillReqLevel = match ? parseInt(match[1], 10) : (idx + 1);
                                          const isUnlocked = (gameState?.level || 1) >= skillReqLevel;
                                          if (!isUnlocked) return null; // Hide locked skills in the combat panel

                                          const skillDetail = COMBAT_SKILL_DETAILS[skillName];
                                          const isSelected = selectedSkill?.name === skillName;

                                          if (!skillDetail) return null;

                                          return (
                                            <button
                                              key={skillName}
                                              onClick={() => {
                                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                                if (!activeActor || activeActor.ap < 1) {
                                                  triggerToast("NO ACTION POINTS LEFT! (AP REQ)");
                                                  return;
                                                }

                                                if (skillDetail.costType === "MP" && (gameState?.mana || 0) < skillDetail.cost) {
                                                  triggerToast("INSUFFICIENT ETHER! (MP REQ)");
                                                  return;
                                                }

                                                if (skillDetail.costType === "SP" && (gameState?.stamina || 0) < skillDetail.cost) {
                                                  triggerToast("INSUFFICIENT STAMINA! (SP REQ)");
                                                  return;
                                                }

                                                // Select skill and initiate grid targeting action mode
                                                setSelectedSkill(skillDetail);
                                                setGridCombat(prev => prev ? { ...prev, selectedAction: "spell" } : null);
                                                triggerToast("SKILL ARMED: CLICK TARGET CELLS ON THE MAP GRID!");
                                              }}
                                              className={`p-1.5 sm:p-2 rounded-lg border text-left flex flex-col justify-between transition-all font-mono leading-tight select-none relative overflow-hidden group ${
                                                isSelected
                                                  ? "bg-purple-950 text-purple-200 border-purple-400 ring-2 ring-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse"
                                                  : "bg-slate-900/60 border-white/5 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800 hover:text-white cursor-pointer"
                                              }`}
                                            >
                                              {/* Skill title & icon */}
                                              <div className="flex justify-between items-start gap-1 w-full flex-wrap sm:flex-nowrap">
                                                <span className={`text-2xs font-extrabold uppercase tracking-wide flex items-center gap-1 flex-wrap ${isSelected ? "text-purple-300" : "text-slate-200 group-hover:text-purple-400"}`}>
                                                  <span>{skillDetail.icon}</span> {skillDetail.name.split(" (")[0]}
                                                </span>
                                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0 border bg-slate-950 border-white/5 text-purple-400">
                                                  {skillDetail.cost} {skillDetail.costType}
                                                </span>
                                              </div>

                                              {/* Skill description */}
                                              <p className="text-3xs mt-1 font-sans leading-normal text-slate-400 group-hover:text-slate-300">
                                                {skillDetail.desc}
                                              </p>
                                            </button>
                                          );
                                        });
                                      })()}
                                    </div>
                                  </div>
                                )}
                                {combatActionTab === "attacks" && (
                                  <>
                             
                             <button
                               onClick={() => {
                                 setGridCombat(prev => prev ? { ...prev, selectedAction: "meleeAtk" } : null);
                               }}
                               onMouseEnter={() => setHoveredAction("meleeAtk")}
                               onMouseLeave={() => setHoveredAction(null)}
                               className={`flex-1 sm:flex-initial font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                 gridCombat.selectedAction === "meleeAtk"
                                   ? "bg-red-500 text-white border-red-400 font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                   : "bg-slate-900 border-white/5 text-red-400 hover:bg-slate-800"
                               }`}
                             >
                               🗡️ Strike [1 AP]
                             </button>

                             <button
                               onClick={() => {
                                 setGridCombat(prev => prev ? { ...prev, selectedAction: "rangedAtk" } : null);
                               }}
                               onMouseEnter={() => setHoveredAction("rangedAtk")}
                               onMouseLeave={() => setHoveredAction(null)}
                               className={`flex-1 sm:flex-initial font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                 gridCombat.selectedAction === "rangedAtk"
                                   ? "bg-orange-500 text-white border-orange-400 font-extrabold shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                   : "bg-slate-900 border-white/5 text-orange-400 hover:bg-slate-800"
                               }`}
                             >
                               🔫 Shoot [1 AP]
                             </button>

                                  </>
                                )}
                                {combatActionTab === "DISABLED_LEGACY_TAB_STALE" && (
                                  <>

                            {/* Ether Spell discharge */}
                            <button
                              onClick={() => {
                                if (!gameState) return;
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!activeActor || activeActor.ap < 1) {
                                  triggerToast("NO AP FOR SPELL");
                                  return;
                                }
                                if (gameState.mana < 15) {
                                  triggerToast("INSUFFICIENT ETHER");
                                  return;
                                }

                                // Apply massive spell damage directly to the primary enemy
                                const enemy = gridCombat.combatants.find(c => c.id === "enemy-1");
                                if (!enemy || enemy.isDead) {
                                  triggerToast("NO TARGET");
                                  return;
                                }

                                let mDmg = Math.floor(Math.random() * 16) + 30; // 30-45
                                if (gameState.inventory.includes("Coven Ether-deck v3")) {
                                  mDmg = Math.floor(mDmg * 1.35);
                                }

                                let ns = { ...gameState };
                                ns.mana = Math.max(0, ns.mana - 15);

                                const updated = gridCombat.combatants.map(c => {
                                  if (c.id === "enemy-1") {
                                    const finalHp = Math.max(0, c.hp - mDmg);
                                    const isDead = finalHp <= 0;
                                    return { ...c, hp: finalHp, isDead };
                                  }
                                  if (c.id === activeActor.id) {
                                    return { ...c, ap: c.ap - 1 };
                                  }
                                  return c;
                                });

                                ns.combatState!.enemyHp = updated.find(c => c.id === "enemy-1")?.hp || 0;
                                setGameState(ns);

                                setGridCombat(prev => prev ? {
                                  ...prev,
                                  combatants: updated,
                                  turnLog: `🔮 ETHER SPELL BURST: Cast Spell Slash on ${enemy.name}! Dealt ${mDmg} armor-bypassing magic damage. (-15 Mana)`
                                } : null);

                                triggerToast("SPELL DISCHARGED");
                              }}
                              onMouseEnter={() => setHoveredAction("spell")}
                              onMouseLeave={() => setHoveredAction(null)}
                              className="flex-1 sm:flex-initial bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-300 font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              🔮 Spell Plasma [-15 MP]
                            </button>


                             {/* Mindmancer Spells (Strictly locked if not reached) */}
                             {!!(gameState?.skills?.mindmancer && gameState.skills.mindmancer > 0 && !["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district)) && (
                               <button
                                 onClick={() => {
                                   if (!gameState) return;
                                   const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                   if (!activeActor || activeActor.ap < 1) {
                                     triggerToast("NO AP");
                                     return;
                                   }
                                   if (gameState.mana < 20) {
                                     triggerToast("INSUFFICIENT ETHER");
                                     return;
                                   }
 
                                   const enemy = gridCombat.combatants.find(c => c.id === "enemy-1");
                                   if (!enemy || enemy.isDead) return;
 
                                   let ns = { ...gameState };
                                   ns.mana = Math.max(0, ns.mana - 20);
 
                                   const updated = gridCombat.combatants.map(c => {
                                     if (c.id === "enemy-1") {
                                       const finalHp = Math.max(0, c.hp - 50);
                                       const isDead = finalHp <= 0;
                                       return { 
                                         ...c, 
                                         hp: finalHp, 
                                         panicTurns: 2,
                                         statuses: [...(c.statuses || []).filter(s => s !== "Panic"), "Panic"],
                                         isDead 
                                       };
                                     }
                                     if (c.id === activeActor.id) {
                                       return { ...c, ap: c.ap - 1 };
                                     }
                                     return c;
                                   });
 
                                   ns.combatState!.enemyHp = updated.find(c => c.id === "enemy-1")?.hp || 0;
                                   setGameState(ns);
 
                                   setGridCombat(prev => prev ? {
                                     ...prev,
                                     combatants: updated,
                                     turnLog: `🔮 MIND PSYCHIC HYPNOSIS: Bending ${enemy.name}'s synaptic currents. Forced system discharge dealing 50 damage and inflicting System Panic! (-20 Mana)`
                                   } : null);
                                   triggerToast("MIND HACK COMPLETE");
                                 }}
                                 onMouseEnter={() => setHoveredAction("mind")}
                                 onMouseLeave={() => setHoveredAction(null)}
                                 className="flex-1 sm:flex-initial bg-fuchsia-950/40 hover:bg-fuchsia-900 border border-fuchsia-500/40 text-fuchsia-300 font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider animate-pulse shadow-[0_0_8px_rgba(217,70,239,0.25)]"
                               >
                                 🧠 Mind Hack [-20 MP]
                               </button>
                             )}
 
                             {/* Tactical combat overclock */}
                             <button
                               onClick={() => {
                                 if (!gameState) return;
                                 const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                 if (!activeActor || activeActor.ap < 1) {
                                   triggerToast("NO AP");
                                   return;
                                 }
                                 if (gameState.stamina < 15) {
                                   triggerToast("INSUFFICIENT STAMINA");
                                   return;
                                 }
 
                                 let ns = { ...gameState };
                                 ns.stamina = Math.max(0, ns.stamina - 15);
 
                                 const updated = gridCombat.combatants.map(c => {
                                   if (c.id === "player") {
                                     return {
                                       ...c,
                                       ap: c.ap - 1,
                                       overclockTurns: 2,
                                       statuses: [...(c.statuses || []).filter(s => s !== "Overclocked"), "Overclocked"]
                                     };
                                   }
                                   return c;
                                 });
 
                                 setGameState(ns);
                                 setGridCombat(prev => prev ? {
                                   ...prev,
                                   combatants: updated,
                                   turnLog: `⚡ ADRENALINE OVERCLOCK ACTIVATED: Synapses overclocked! Grants +50% Evasion and double strike attack modifiers for 2 turns! (-15 Stamina)`
                                 } : null);
                                 triggerToast("SYSTEM OVERCLOCKED");
                               }}
                               className="flex-1 sm:flex-initial bg-amber-950/40 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                             >
                               ⚡ Overclock [-15 SP]
                             </button>
 
                             {/* Neural overload cyber hack */}
                             <button
                               onClick={() => {
                                 if (!gameState) return;
                                 const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                 if (!activeActor || activeActor.ap < 1) {
                                   triggerToast("NO AP");
                                   return;
                                 }
                                 if (gameState.mana < 25) {
                                   triggerToast("INSUFFICIENT ETHER");
                                   return;
                                 }
 
                                 const enemy = gridCombat.combatants.find(c => c.id === "enemy-1");
                                 if (!enemy || enemy.isDead) return;
 
                                 let ns = { ...gameState };
                                 ns.mana = Math.max(0, ns.mana - 25);
 
                                 let finalDmg = 35;
                                 const updated = gridCombat.combatants.map(c => {
                                   if (c.id === "enemy-1") {
                                     const finalHp = Math.max(0, c.hp - finalDmg);
                                     const isDead = finalHp <= 0;
                                     return { 
                                       ...c, 
                                       hp: finalHp, 
                                       glitchTurns: 2, 
                                       statuses: [...(c.statuses || []).filter(s => s !== "Glitched"), "Glitched"],
                                       isDead 
                                     };
                                   }
                                   if (c.id === activeActor.id) {
                                     return { ...c, ap: c.ap - 1 };
                                   }
                                   return c;
                                 });
 
                                 ns.combatState!.enemyHp = updated.find(c => c.id === "enemy-1")?.hp || 0;
                                 setGameState(ns);
 
                                 setGridCombat(prev => prev ? {
                                   ...prev,
                                   combatants: updated,
                                   turnLog: `🔌 NEURAL OVERLOAD HACK: Injected a digital neural spike directly into ${enemy.name}! Dealt ${finalDmg} damage bypassing shields completely and inflicting Glitched for 2 turns! (-25 Mana)`
                                 } : null);
                                 triggerToast("NEURAL OVERLOAD SENT");
                               }}
                               onMouseEnter={() => setHoveredAction("neural")}
                               onMouseLeave={() => setHoveredAction(null)}
                               className="flex-1 sm:flex-initial bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                             >
                               🔌 Neural Overload [-25 MP]
                             </button>
                                  </>
                                )}
                                {combatActionTab === "support" && (
                                  <>
                                    {/* Stimpack Consumable */}
                                    <button
                              onClick={() => {
                                if (!gameState) return;
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!activeActor || activeActor.ap < 1) {
                                  triggerToast("NO AP");
                                  return;
                                }

                                if (!gameState.inventory.includes("Nano Med-Stim (Heal)")) {
                                  triggerToast("NO MED-STIM IN INVENTORY DECK");
                                  return;
                                }

                                let ns = { ...gameState };
                                ns.inventory = ns.inventory.filter((item, idx) => idx !== ns.inventory.indexOf("Nano Med-Stim (Heal)"));

                                const updated = gridCombat.combatants.map(c => {
                                  if (c.id === activeActor.id) {
                                    return { ...c, hp: Math.min(c.maxHp, c.hp + 60), ap: c.ap - 1 };
                                  }
                                  return c;
                                });

                                ns.hp = updated.find(c => c.id === "player")?.hp || ns.hp;
                                setGameState(ns);

                                setGridCombat(prev => prev ? {
                                  ...prev,
                                  combatants: updated,
                                  turnLog: `💊 STIMPACK DETONATED: ${activeActor.name} injected medical nano-sealants, restoring +60 HP!`
                                } : null);
                                triggerToast("STIMPACK CONSUMED");
                              }}
                              className="flex-1 sm:flex-initial bg-amber-950/30 hover:bg-amber-900 border border-amber-500/30 text-amber-300 font-mono font-black text-3xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              💊 Stimpack
                            </button>
                                  </>
                                )}
                              </div>

                              {/* Persistent End Turn Trigger */}
                              <div className="w-full border-t border-white/5 pt-2.5">
<button
                              onClick={() => {
                                // Advance the turn queue
                                setGridCombat(prev => {
                                  if (!prev) return null;
                                  
                                  const updatedCombatants = prev.combatants.map(c => {
                                    const activeId = prev.turnOrder[prev.currentTurnIdx];
                                    if (c.id === activeId) {
                                      return { ...c, ap: c.maxAp };
                                    }
                                    return c;
                                  });

                                  let nextIdx = prev.currentTurnIdx;
                                  let foundAlive = false;
                                  let iterations = 0;

                                  while (iterations < prev.turnOrder.length) {
                                    nextIdx = (nextIdx + 1) % prev.turnOrder.length;
                                    const nextId = prev.turnOrder[nextIdx];
                                    const actor = updatedCombatants.find(c => c.id === nextId);
                                    if (actor && !actor.isDead) {
                                      foundAlive = true;
                                      break;
                                    }
                                    iterations++;
                                  }

                                  if (!foundAlive) return prev;

                                  const nextActor = updatedCombatants.find(c => c.id === prev.turnOrder[nextIdx])!;
                                  
                                  // Status decay & DOT processing
                                  let dotLog = "";
                                  if (nextActor.overclockTurns && nextActor.overclockTurns > 0) {
                                    nextActor.overclockTurns -= 1;
                                    if (nextActor.overclockTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Overclocked");
                                    }
                                  }
                                  if (nextActor.panicTurns && nextActor.panicTurns > 0) {
                                    nextActor.panicTurns -= 1;
                                    if (nextActor.panicTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Panic");
                                    }
                                  }
                                  if (nextActor.glitchTurns && nextActor.glitchTurns > 0) {
                                    nextActor.hp = Math.max(0, nextActor.hp - 10);
                                    nextActor.glitchTurns -= 1;
                                    dotLog += `🔌 Glitch active on ${nextActor.name}: dealt 10 electric discharge damage! `;
                                    if (nextActor.glitchTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Glitched");
                                    }
                                    if (nextActor.hp <= 0) {
                                      nextActor.isDead = true;
                                      dotLog += `💀 ${nextActor.name} short-circuited and collapsed! `;
                                    }
                                  }
                                  if (nextActor.corrodedTurns && nextActor.corrodedTurns > 0) {
                                    nextActor.hp = Math.max(0, nextActor.hp - 8);
                                    nextActor.corrodedTurns -= 1;
                                    dotLog += `💥 Corrosion active on ${nextActor.name}: dealt 8 acid damage! `;
                                    if (nextActor.corrodedTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Corroded");
                                    }
                                    if (nextActor.hp <= 0) {
                                      nextActor.isDead = true;
                                      dotLog += `💀 ${nextActor.name} was dissolved! `;
                                    }
                                  }
                                  if (nextActor.stunnedTurns && nextActor.stunnedTurns > 0) {
                                    nextActor.stunnedTurns -= 1;
                                    nextActor.ap = 0; // Set AP to 0 so they can't act
                                    dotLog += `💫 Stunned active on ${nextActor.name}: synapses frozen. Turn skipped! `;
                                    if (nextActor.stunnedTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Stunned");
                                    }
                                  }
                                  if (nextActor.silencedTurns && nextActor.silencedTurns > 0) {
                                    nextActor.silencedTurns -= 1;
                                    dotLog += `🔕 Silenced active on ${nextActor.name}: cerebral connection jammed. Skills blocked! `;
                                    if (nextActor.silencedTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Silenced");
                                    }
                                  }
                                  if (nextActor.bleedTurns && nextActor.bleedTurns > 0) {
                                    nextActor.hp = Math.max(0, nextActor.hp - 12);
                                    nextActor.bleedTurns -= 1;
                                    dotLog += `🩸 Bleeding active on ${nextActor.name}: dealt 12 physical bleeding damage! `;
                                    if (nextActor.bleedTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Bleeding");
                                    }
                                    if (nextActor.hp <= 0) {
                                      nextActor.isDead = true;
                                      dotLog += `💀 ${nextActor.name} bled out! `;
                                    }
                                  }

                                  // Sync back to main gameState
                                  if (gameState) {
                                    let ns = { ...gameState };
                                    if (nextActor.id === "player") {
                                      ns.hp = nextActor.hp;
                                    } else if (nextActor.id === "enemy-1") {
                                      ns.combatState!.enemyHp = nextActor.hp;
                                    }
                                    setGameState(ns);
                                  }

                                  return {
                                    ...prev,
                                    combatants: updatedCombatants,
                                    currentTurnIdx: nextIdx,
                                    selectedAction: "move" as const,
                                    turnLog: dotLog 
                                      ? `${dotLog} Turn advanced to ${nextActor.name}.`
                                      : `Turn advanced to ${nextActor.name}. AP fully restored.`
                                  };
                                });
                                triggerToast("TURN ENDED");
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-mono font-black text-xs py-2 rounded-lg transition-all cursor-pointer uppercase tracking-wider text-center flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                            >
                              ⏱️ End Turn
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                          /* Enemy AI Resolution panel */
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-red-950/20 border border-red-500/10 p-3 rounded-xl">
                            <span className="text-rose-400 font-mono text-3xs uppercase tracking-widest font-black animate-pulse flex items-center gap-1">
                              ⚠️ HOSTILE ACTION DETECTED: {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.name} IS FORMULATING ACTION PLANS...
                            </span>
                            <button
                              onClick={() => {
                                // Run enemy AI
                                const actor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!actor || actor.isDead) return;

                                // Find closest player-team target
                                const targets = gridCombat.combatants.filter(c => c.team === "player" && !c.isDead);
                                if (targets.length === 0) return;

                                let closestTarget = targets[0];
                                let minDist = 999;
                                targets.forEach(t => {
                                  const d = Math.abs(t.x - actor.x) + Math.abs(t.y - actor.y);
                                  if (d < minDist) {
                                    minDist = d;
                                    closestTarget = t;
                                  }
                                });

                                setGridCombat(prev => {
                                  if (!prev) return null;
                                  
                                  let updatedCombatants = prev.combatants.map(c => ({ ...c }));
                                  const livingActor = updatedCombatants.find(c => c.id === actor.id)!;
                                  let currentTarget = updatedCombatants.find(c => c.id === closestTarget.id)!;

                                  let movementLog = "";
                                  let attackLog = "";

                                  // Check Stun and System Panic debuffs
                                  const isStunned = livingActor.stunnedTurns !== undefined && livingActor.stunnedTurns > 0;
                                  const isPanicked = livingActor.panicTurns !== undefined && livingActor.panicTurns > 0;
                                  
                                  if (isStunned) {
                                    livingActor.ap = 0;
                                    attackLog = `💫 STUNNED: ${livingActor.name} is completely paralyzed and skips its action phase!`;
                                  } else if (isPanicked) {
                                    livingActor.hp = Math.max(0, livingActor.hp - 20);
                                    livingActor.isDead = livingActor.hp <= 0;
                                    livingActor.ap = 0;
                                    attackLog = `🧠 SYSTEM PANIC: ${livingActor.name} is hallucinating from psychic hypnosis! It fires its weapon inward, dealing 20 damage to itself!`;
                                  } else {
                                    // If out of attack range, move closer!
                                    if (minDist > livingActor.range) {
                                      // Pathing approximation: search cells within Manhattan distance 2
                                      let bestX = livingActor.x;
                                      let bestY = livingActor.y;
                                      let closestDistAfterMove = minDist;

                                      const isObstacle = (cx: number, cy: number) => {
                                        const hardcoded = [[3, 0], [4, 5]].some(([ox, oy]) => ox === cx && oy === cy);
                                        const dynamic = prev.interactiveObjects?.some(o => o.x === cx && o.y === cy && !o.isDestroyed) || false;
                                        return hardcoded || dynamic;
                                      };

                                      for (let dx = -2; dx <= 2; dx++) {
                                        for (let dy = -2; dy <= 2; dy++) {
                                          if (Math.abs(dx) + Math.abs(dy) <= 2) {
                                            const tx = livingActor.x + dx;
                                            const ty = livingActor.y + dy;

                                            // Bounds check
                                            if (tx >= 0 && tx < 8 && ty >= 0 && ty < 6) {
                                              const occupied = updatedCombatants.some(c => c.x === tx && c.y === ty && !c.isDead);
                                              if (!occupied && !isObstacle(tx, ty)) {
                                                const newD = Math.abs(tx - currentTarget.x) + Math.abs(ty - currentTarget.y);
                                                if (newD < closestDistAfterMove) {
                                                  closestDistAfterMove = newD;
                                                  bestX = tx;
                                                  bestY = ty;
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }

                                      livingActor.x = bestX;
                                      livingActor.y = bestY;
                                      livingActor.ap -= 1;
                                      movementLog = `${livingActor.name} maneuvers to [${bestX}, ${bestY}]. `;
                                      
                                      // Re-evaluate distance
                                      minDist = Math.abs(bestX - currentTarget.x) + Math.abs(bestY - currentTarget.y);
                                    }

                                    // If in range, attack!
                                    if (minDist <= livingActor.range && livingActor.ap > 0) {
                                      let enemyDmg = livingActor.damage + Math.floor(Math.random() * 5) - 2;
                                      
                                      // Glitched penalty: reduces damage output by 40%
                                      if (livingActor.glitchTurns !== undefined && livingActor.glitchTurns > 0) {
                                        enemyDmg = Math.floor(enemyDmg * 0.6);
                                      }

                                      // Check Overclock evasion
                                      const hasOverclock = currentTarget.overclockTurns !== undefined && currentTarget.overclockTurns > 0;
                                      const evaded = hasOverclock && Math.random() < 0.5;

                                      if (evaded) {
                                        attackLog = `💨 EVADED: ${livingActor.name} fired but you activated Adrenaline Overclock, dodging the attack completely!`;
                                        livingActor.ap -= 1;
                                      } else {
                                        if (currentTarget.shields > 0) {
                                          currentTarget.shields -= enemyDmg;
                                          if (currentTarget.shields < 0) {
                                            currentTarget.hp += currentTarget.shields;
                                            currentTarget.shields = 0;
                                          }
                                        } else {
                                          currentTarget.hp -= enemyDmg;
                                        }

                                        currentTarget.hp = Math.max(0, currentTarget.hp);
                                        currentTarget.isDead = currentTarget.hp <= 0;
                                        livingActor.ap -= 1;
                                        attackLog = `💥 ${livingActor.name} attacks ${currentTarget.name} dealing ${enemyDmg} damage directly! ${livingActor.glitchTurns && livingActor.glitchTurns > 0 ? "[Reduced by Glitch]" : ""}`;

                                        // Behemoth slime corrosion application
                                        if (livingActor.name.includes("Behemoth") && currentTarget.id === "player" && Math.random() < 0.5) {
                                          currentTarget.corrodedTurns = 2;
                                          currentTarget.statuses = [...(currentTarget.statuses || []).filter(s => s !== "Corroded"), "Corroded"];
                                          attackLog += ` 💥 Sludge splashes on you, causing CORROSION over time!`;
                                        }
                                      }
                                    }
                                  }

                                  // Reset actor's AP on turn end
                                  livingActor.ap = livingActor.maxAp;

                                  // Sync health to main state
                                  const mainPlayer = updatedCombatants.find(c => c.id === "player")!;
                                  if (gameState) {
                                    let ns = { ...gameState };
                                    ns.hp = mainPlayer.hp;
                                    setGameState(ns);
                                  }

                                  // Check defeat
                                  if (mainPlayer.hp <= 0) {
                                    return {
                                      ...prev,
                                      combatants: updatedCombatants,
                                      turnLog: `☠️ Player fell in combat! Conflict concluded.`
                                    };
                                  }

                                  // Advance turn queue
                                  let nextIdx = prev.currentTurnIdx;
                                  let foundAlive = false;
                                  let iterations = 0;

                                  while (iterations < prev.turnOrder.length) {
                                    nextIdx = (nextIdx + 1) % prev.turnOrder.length;
                                    const nextId = prev.turnOrder[nextIdx];
                                    const actorInQueue = updatedCombatants.find(c => c.id === nextId);
                                    if (actorInQueue && !actorInQueue.isDead) {
                                      foundAlive = true;
                                      break;
                                    }
                                    iterations++;
                                  }

                                  const nextActor = updatedCombatants.find(c => c.id === prev.turnOrder[nextIdx])!;
                                  
                                  // Status decay & DOT processing for nextActor
                                  let dotLog = "";
                                  if (nextActor.overclockTurns && nextActor.overclockTurns > 0) {
                                    nextActor.overclockTurns -= 1;
                                    if (nextActor.overclockTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Overclocked");
                                    }
                                  }
                                  if (nextActor.panicTurns && nextActor.panicTurns > 0) {
                                    nextActor.panicTurns -= 1;
                                    if (nextActor.panicTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Panic");
                                    }
                                  }
                                  if (nextActor.glitchTurns && nextActor.glitchTurns > 0) {
                                    nextActor.hp = Math.max(0, nextActor.hp - 10);
                                    nextActor.glitchTurns -= 1;
                                    dotLog += `🔌 Glitch active on ${nextActor.name}: dealt 10 electric discharge damage! `;
                                    if (nextActor.glitchTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Glitched");
                                    }
                                    if (nextActor.hp <= 0) {
                                      nextActor.isDead = true;
                                      dotLog += `💀 ${nextActor.name} short-circuited and collapsed! `;
                                    }
                                  }
                                  if (nextActor.corrodedTurns && nextActor.corrodedTurns > 0) {
                                    nextActor.hp = Math.max(0, nextActor.hp - 8);
                                    nextActor.corrodedTurns -= 1;
                                    dotLog += `💥 Corrosion active on ${nextActor.name}: dealt 8 acid damage! `;
                                    if (nextActor.corrodedTurns === 0) {
                                      nextActor.statuses = (nextActor.statuses || []).filter(s => s !== "Corroded");
                                    }
                                    if (nextActor.hp <= 0) {
                                      nextActor.isDead = true;
                                      dotLog += `💀 ${nextActor.name} was dissolved! `;
                                    }
                                  }

                                  // Sync back to main gameState
                                  if (gameState) {
                                    let ns = { ...gameState };
                                    if (nextActor.id === "player") {
                                      ns.hp = nextActor.hp;
                                    } else if (nextActor.id === "enemy-1") {
                                      ns.combatState!.enemyHp = nextActor.hp;
                                    }
                                    setGameState(ns);
                                  }

                                  const actionSum = movementLog || attackLog 
                                    ? `${movementLog}${attackLog}`
                                    : `${livingActor.name} bypassed tactical action.`;

                                  return {
                                    ...prev,
                                    combatants: updatedCombatants,
                                    currentTurnIdx: nextIdx,
                                    selectedAction: "move" as const,
                                    turnLog: dotLog 
                                      ? `${dotLog} AI MOVE: ${actionSum} Turn passed to ${nextActor.name}.`
                                      : `🤖 AI MOVE: ${actionSum} Turn passed to ${nextActor.name}.`
                                  };
                                });

                                triggerToast("ENEMY ACTION SOLVED");
                              }}
                              className="bg-red-500 hover:bg-red-400 text-slate-950 font-mono font-black text-3xs px-4 py-2 rounded-lg cursor-pointer transition-all uppercase tracking-wider animate-pulse ml-auto"
                            >
                              Let Enemy Act
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (!gameState) return;
                            if (Math.random() > 0.4) {
                              let nextState = { ...gameState };
                              nextState.combatState = null;
                              setGameState(nextState);
                              setGridCombat(null);
                              setLogs(prev => [
                                ...prev,
                                {
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  text: `🏃 ESCAPE DEPLOYED: You deploy active cloaking mesh and successfully broke contact back to security corridors.`,
                                  type: "narration",
                                  district: nextState.district,
                                  poi: nextState.poi
                                }
                              ]);
                              triggerToast("FLED COMBAT");
                            } else {
                              setGridCombat(prev => prev ? {
                                ...prev,
                                turnLog: "❌ EVASION REFUSED: Hostile interceptors block your flight path coordinates!"
                              } : null);
                              triggerToast("FLEE FAILED");
                            }
                          }}
                          className="w-full bg-slate-900 border border-white/10 hover:bg-slate-850 text-slate-300 font-mono font-black text-3xs py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider text-center flex items-center justify-center gap-1 mt-1.5"
                        >
                          🏃 Attempt Flee
                        </button>
                      </div>

                    </div>

                    {/* Hovered Entity Detailed Scanner Panel */}
                    {hoveredEntity ? (
                      <div className="bg-slate-950/95 border border-cyan-500/30 p-2 rounded-xl text-xs flex items-center gap-2.5 shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-fadeIn shrink-0">
                        <span className="text-lg shrink-0 p-1 bg-slate-900 border border-white/10 rounded-md select-none">{hoveredEntity.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-black text-cyan-400 uppercase tracking-wide flex items-center gap-1 text-[10px]">
                              {hoveredEntity.name}
                              {hoveredEntity.type === "object" && (
                                <span className={`text-[7px] px-1 py-0.5 rounded leading-none ${hoveredEntity.isHacked ? "bg-slate-900 text-slate-500 border border-white/5" : "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 font-black"}`}>
                                  {hoveredEntity.isHacked ? "HACKED" : "INTERACTIVE"}
                                </span>
                              )}
                            </span>
                            {hoveredEntity.hp && (
                              <span className="font-mono font-bold text-[9px] text-rose-300 shrink-0">
                                {hoveredEntity.hp} HP {hoveredEntity.shields > 0 && `(+${hoveredEntity.shields} SH)`}
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 font-sans mt-0.5 leading-tight line-clamp-2">{hoveredEntity.desc}</p>
                          {hoveredEntity.statuses && hoveredEntity.statuses.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <span className="text-[7px] font-mono font-black text-slate-500">STATUSES:</span>
                              {hoveredEntity.statuses.map((st: string) => (
                                <span key={st} className="text-[7px] font-mono font-black bg-amber-950/50 text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded leading-none uppercase animate-pulse">{st}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950/40 border border-white/[0.02] p-1.5 rounded-xl text-center text-[9px] text-slate-500 font-mono tracking-wide shrink-0">
                        🔍 HOVER OVER ANY UNIT, COVER, OR MAINBOARD
                      </div>
                    )}

                    {/* Combat Status Feed Log */}
                    <div className="bg-slate-950/95 border border-rose-500/30 p-1.5 rounded-xl text-amber-200 font-mono text-[9px] text-center font-semibold tracking-wide shadow-[0_0_8px_rgba(239,68,68,0.08)] leading-snug animate-pulse shrink-0">
                      <span className="text-rose-500 font-black mr-1">SYS LOG:</span>
                      {gridCombat.turnLog}
                    </div>

                  </div>
                </div>

                      {/* Tactical overlays: Defeat / Victory Check screens */}
                      {/* Player dead overlay */}
                      {gridCombat.combatants.find(c => c.id === "player")?.isDead && (
                        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-30 font-mono">
                          <span className="text-red-500 font-black text-3xl animate-bounce select-none">☠️ VITALS SHATTERED ☠️</span>
                          <p className="text-slate-400 text-3xs max-w-sm uppercase leading-relaxed">
                            Your bio-signatures flatlined in the grid database! Tactical shield matrices failed completely. Initiating emergency safehouse rescue protocol...
                          </p>
                          <button
                            onClick={() => {
                              if (!gameState) return;
                              let nextState = { ...gameState };
                              let narrative = "";
                              if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
                                nextState.hp = nextState.maxHp;
                                nextState.mana = nextState.maxMana;
                                nextState.combatState = null;
                                narrative = `☠️ CRITICAL OVERLOAD: Your bio-signatures flatlined in the catacombs! Fortunately, your squad-mate Vice injected an adrenaline micro-dose, resetting your critical vitals and dragging you back to safety. Let's try again!`;
                              } else {
                                const penalty = Math.floor(nextState.credits * 0.15);
                                nextState.credits -= penalty;
                                nextState.hp = 25;
                                nextState.poi = "Main Headquarters (The Hideout)";
                                nextState.district = "aurus";
                                setActiveRegionId("aurus");
                                setActivePOIView("hideout");
                                nextState.combatState = null;
                                narrative = `☠️ SYSTEM OVERRIDE TRAUMA: Bio-signatures flatlined in battle! Your emergency backup beacon auto-teleported your frame to Hideout medical bay. -${penalty}¤ Trauma deduction.`;
                              }

                              setGameState(nextState);
                              setGridCombat(null);
                              setLogs(prev => [
                                ...prev,
                                {
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  text: narrative,
                                  type: "system",
                                  district: nextState.district,
                                  poi: nextState.poi
                                }
                              ]);
                              triggerToast("BATTLE OVER: HEALED");
                            }}
                            className="bg-red-500 hover:bg-red-400 text-slate-950 font-black px-6 py-3 rounded-lg text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          >
                            Activate Auto-Rescue Beacon & Re-awaken
                          </button>
                        </div>
                      )}

                      {/* Enemies all dead victory overlay */}
                      {gridCombat.combatants.filter(c => c.team === "enemy" && !c.isDead).length === 0 && (
                        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-30 font-mono">
                          <span className="text-emerald-400 font-black text-3xl animate-pulse select-none">★ THREAT ELIMINATED ★</span>
                          <p className="text-slate-400 text-3xs max-w-sm uppercase leading-relaxed">
                            Airlock clear! All hostile signature feeds have been terminated. Recovery protocols have completed scanning.
                          </p>
                          <button
                            onClick={() => {
                              if (!gameState) return;
                              let nextState = { ...gameState };
                              const playerCombatant = gridCombat.combatants.find(c => c.id === "player");
                              if (playerCombatant) {
                                nextState.hp = playerCombatant.hp;
                              }
                              
                              const rewardC = Math.floor(Math.random() * 51) + 75; // 75-125
                              const expGained = 45;
                              nextState.credits += rewardC;
                              nextState.experience += expGained;

                              let narrative = `★ THREAT EXTERMINATED: You successfully cleared the area in tactical grid combat! Recovered +${rewardC}¤ and earned +${expGained} XP!`;

                              const enemyName = gameState.combatState?.enemyName || "";
                              const victorySceneId = gameState.combatState?.victorySceneId;
                              const victoryCompletionAction = gameState.combatState?.victoryCompletionAction;
                              if (victorySceneId) {
                                if (victoryCompletionAction) nextState.completedPOIActions = Array.from(new Set([...(nextState.completedPOIActions || []), victoryCompletionAction]));
                                setActiveDialogue(victorySceneId);
                                const victoryScene = { ...DEFAULT_POI_INTERACTIVE_SCENES, ...(nextState.poiInteractiveScenes || {}) }[victorySceneId];
                                if (victoryScene) setRelicStep(victoryScene.initialStepId as any);
                              }


                              if (nextState.experience >= 100) {
                                nextState.level += 1;
                                nextState.experience -= 100;
                                nextState.maxHp += 20;
                                nextState.maxMana += 15;
                                nextState.hp = nextState.maxHp;
                                nextState.mana = nextState.maxMana;
                                nextState.playerPerks = getPerksForLevel(nextState.level);
                                
                                narrative += `\n\n📶 SYSTEM LEVEL EXPANDED: Congratulations! Ascended to Level ${nextState.level}. Max health and mana stats fully restored!`;
                                
                                const unlockedPerk = nextState.level === 2 ? "Adrenaline Junkie" :
                                                     nextState.level === 3 ? "Cyber-Optimizer" :
                                                     nextState.level === 4 ? "Ether Conduit" :
                                                     nextState.level === 5 ? "Hardened Chassis" :
                                                     nextState.level === 6 ? "Lucky Jack" : null;
                                if (unlockedPerk) {
                                  narrative += `\n\n🧠 PASSIVE PERK INTEGRATED: Your synaptic cortex has adapted! [${unlockedPerk}] is now permanently active!`;
                                }
                              }

                              nextState.combatState = null;
                              const updatedLogs = [
                                ...logs,
                                {
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                                  text: narrative,
                                  type: "system" as const,
                                  district: nextState.district,
                                  poi: nextState.poi
                                }
                              ];
                              setGameState(nextState);
                              setGridCombat(null);
                              setLogs(updatedLogs);
                              triggerAutosave(nextState, updatedLogs);
                              triggerToast("BATTLE CLEAR: VICTORY!");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-lg text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          >
                            Download Reward Chips & Proceed
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* BOTTOM STATUS & DECK CONTROLS (MOVED BELOW MAP/SCANNER) */}
                {!gameState.combatState?.isActive && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1 text-left">
                    {/* ATMOSPHERE CARD */}
                    <div className="bg-slate-950/60 border border-white/10 p-3 rounded-xl flex items-center gap-2.5">
                      <div className="p-1.5 bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/30 text-amber-400 rounded-md flex-shrink-0">
                        <CloudLightning size={14} />
                      </div>
                      <div className="overflow-hidden font-mono">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider leading-none">ATMOSPHERE</span>
                        <p className="text-[11px] font-bold text-white uppercase truncate mt-1 leading-none">
                          {gameState.weather === "clear" && "Clear Skies ☀️"}
                          {gameState.weather === "rain" && "Acid Rain 🌧️"}
                          {gameState.weather === "snow" && "Neon Frost ❄️"}
                          {gameState.weather === "storm" && "Electro Storm ⚡"}
                          {gameState.weather === "heat" && "Thermal wave 🥵"}
                          {gameState.weather === "smog" && "Toxic Smog 😷"}
                          {(!gameState.weather || gameState.weather === "clear") && "Optimal skies ☀️"}
                        </p>
                        <span className="text-[7px] text-amber-500 block uppercase truncate font-semibold mt-1 leading-none">
                          {gameState.weather === "clear" && "Normal Stamina Rate"}
                          {gameState.weather === "rain" && "+2 Stamina Drain"}
                          {gameState.weather === "snow" && "+3 Stamina / -2 Ether"}
                          {gameState.weather === "storm" && "+5 Stamina / Static"}
                          {gameState.weather === "heat" && "+5 Stamina / Damage"}
                          {gameState.weather === "smog" && "+4 Stamina / HP Drain"}
                          {(!gameState.weather || gameState.weather === "clear") && "Optimal Skies"}
                        </span>
                      </div>
                    </div>

                    {/* HP CARD */}
                    <div className={`bg-slate-950/60 border p-3 rounded-xl flex flex-col justify-between transition-all duration-300 ${
                      gameState.hp < derived.maxHp * 0.35
                        ? "border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                        : "border-white/10"
                    }`}>
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1.5">
                        <span className="font-bold text-rose-400 flex items-center gap-1 uppercase text-[9px]">
                          <Heart size={10} className={`text-rose-500 ${gameState.hp < derived.maxHp * 0.35 ? "animate-bounce" : ""}`} /> HP
                        </span>
                        <span className="font-bold text-[#f5ebd5] text-[9px]">{gameState.hp} / {derived.maxHp}</span>
                      </div>
                      
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0 border border-white/5">
                        <motion.div
                          className="bg-rose-500 h-full rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          animate={{ width: `${Math.max(0, Math.min(100, (gameState.hp / derived.maxHp) * 100))}%` }}
                          transition={{ type: "spring", stiffness: 70, damping: 15 }}
                        />
                      </div>
                      <span className="text-[7.5px] font-mono mt-1 uppercase font-bold text-left leading-none">
                        {gameState.hp < derived.maxHp * 0.35 ? (
                          <span className="text-rose-400 font-extrabold tracking-widest animate-pulse">⚠️ CRITICAL</span>
                        ) : (
                          <span className="text-slate-500">CORES: OPTIMAL</span>
                        )}
                      </span>
                    </div>

                    {/* ETH CARD */}
                    <div className={`bg-slate-950/60 border p-3 rounded-xl flex flex-col justify-between transition-all duration-300 ${
                      gameState.mana === derived.maxMana
                        ? "border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                        : "border-white/10"
                    }`}>
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1.5">
                        <span className="font-bold text-cyan-400 flex items-center gap-1 uppercase text-[9px]">
                          <Zap size={10} className={`text-cyan-400 ${gameState.mana === derived.maxMana ? "animate-pulse" : ""}`} /> ETH
                        </span>
                        <span className="font-bold text-[#f5ebd5] text-[9px]">{gameState.mana} / {derived.maxMana}</span>
                      </div>
                      
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0 border border-white/5">
                        <motion.div
                          className="bg-cyan-500 h-full rounded-full shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                          animate={{ width: `${Math.max(0, Math.min(100, (gameState.mana / derived.maxMana) * 100))}%` }}
                          transition={{ type: "spring", stiffness: 70, damping: 15 }}
                        />
                      </div>
                      <span className="text-[7.5px] font-mono mt-1 uppercase font-bold text-left leading-none">
                        {gameState.mana === derived.maxMana ? (
                          <span className="text-cyan-400 font-extrabold tracking-widest animate-pulse">⚡ MAX ETHER</span>
                        ) : gameState.mana === 0 ? (
                          <span className="text-rose-400/80 font-semibold">DRAINED</span>
                        ) : (
                          <span className="text-slate-500">CALIBRATED</span>
                        )}
                      </span>
                    </div>

                    {/* STAMINA CARD */}
                    <div className="bg-slate-950/60 border border-white/10 p-3 rounded-xl flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1.5">
                        <span className="font-bold text-amber-500 flex items-center gap-1 uppercase text-[9px]">
                          <Activity size={10} className="text-amber-500 animate-pulse" /> STAMINA
                        </span>
                        <span className="font-bold text-[#f5ebd5] text-[9px]">{gameState.stamina ?? 100} / 100</span>
                      </div>
                      
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0 border border-white/5">
                        <motion.div
                          className="bg-amber-500 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                          animate={{ width: `${Math.max(0, Math.min(100, (gameState.stamina ?? 100)))}%` }}
                          transition={{ type: "spring", stiffness: 70, damping: 15 }}
                        />
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-500 mt-1 uppercase font-bold text-left leading-none">
                        {gameState.stamina === 0 ? "⚠️ EXHAUSTED" : "OPERATIONAL"}
                      </span>
                    </div>

                    {/* BALANCE & ACTIVE SECTOR */}
                    <div className="bg-slate-950/60 border border-white/10 p-3 rounded-xl flex justify-between items-center">
                      <div className="text-left font-mono">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider leading-none">BALANCE</span>
                        <p className="text-xs font-black text-amber-400 mt-1 leading-none">
                          {gameState.credits} <span className="text-[10px] font-normal text-slate-400">¤</span>
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider leading-none">ACTIVE SECTOR</span>
                        <span className="text-[9px] font-bold text-cyan-400 mt-1 block uppercase leading-none truncate max-w-[90px]">
                          {REGIONS.find(r => r.id === activeRegionId)?.name.split(" ")[0] || "Slums"}
                        </span>
                      </div>
                    </div>

                    {/* CHARACTER STATS & MENU BUTTONS */}
                    <div className="flex flex-col gap-1.5 justify-center">
                      <button
                        onClick={() => setGameTab("database")}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/30 hover:border-rose-400 text-rose-400 hover:text-white py-2 px-3 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        <Database size={13} />
                        <span>Character Stats</span>
                      </button>

                      <button
                        onClick={() => setIsGameMenuOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white py-2 px-3 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        <Menu size={13} />
                        <span>Menu</span>
                      </button>
                    </div>
                  </div>
                )}

                </div>
                </>
              )}

              {/* RIGHT COLUMN (12/12): PLAYER STATS DECK, INVENTORY, COMPANIONS AND ACTIVE TASKS */}
              {gameTab === "database" && (
                <div className="lg:col-span-12 flex flex-col gap-2.5 h-full flex-1 min-h-0 overflow-hidden">
                  {/* Return to Map bar & Sub-Tab Navigation Header */}
                  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-slate-950/80 border border-white/10 rounded-xl p-2.5 shadow-md gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGameTab("exploration")}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
                      >
                        <ArrowLeft size={13} className="text-cyan-400" /> Map
                      </button>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 hidden sm:flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        DATABASE
                      </span>
                    </div>

                    {/* Modular Sub-Tab Buttons */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 font-mono text-3xs">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 uppercase font-bold shrink-0 ${
                          activeTab === "overview" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        <User size={12} /> Profile
                      </button>
                      <button
                        onClick={() => setActiveTab("inventory")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 uppercase font-bold shrink-0 ${
                          activeTab === "inventory" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        <Briefcase size={12} /> Stash
                      </button>
                      <button
                        onClick={() => setActiveTab("gear")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 uppercase font-bold shrink-0 ${
                          activeTab === "gear" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        <Shield size={12} /> Gear
                      </button>
                      <button
                        onClick={() => setActiveTab("companions")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 uppercase font-bold shrink-0 ${
                          activeTab === "companions" ? "bg-rose-500/20 text-rose-300 border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        <Users size={12} /> Mercs
                      </button>
                      <button
                        onClick={() => setActiveTab("quests")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 uppercase font-bold shrink-0 ${
                          activeTab === "quests" ? "bg-amber-500/20 text-amber-300 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        <Award size={12} /> Quests
                      </button>
                      <button
                        onClick={() => setActiveTab("factions")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 uppercase font-bold shrink-0 ${
                          activeTab === "factions" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]" : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
                        }`}
                      >
                        <Shield size={12} /> Factions
                      </button>
                    </div>
                  </div>
                  
                  {/* MAIN SINGLE-SCREEN CONTENT VIEW CONTAINER */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-950/70 border border-white/10 rounded-xl shadow-2xl">
                    
                    {/* TAB 1: PROFILE & CHARACTER OVERVIEW */}
                    {activeTab === "overview" && (
                      <motion.div
                        key="overview-subtab"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-left"
                      >
                        {/* Bio & Integrity gauges */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                          <div className="glass-panel rounded-xl p-4 shadow-xl border border-cyan-500/20 flex flex-col gap-3 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                              {gameState.playerAvatarUrl ? (
                                <img
                                  src={gameState.playerAvatarUrl}
                                  alt="Operative"
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-14 rounded-xl object-cover border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
                                  {(gameState.playerName || gameState.archetype || "Cyber-Blade")[0]}
                                </div>
                              )}
                              <div>
                                <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-black leading-none block">GRID OPERATIVE IDENT</span>
                                <h3 className="text-white font-black text-base uppercase mt-1 leading-none">{gameState.playerName || gameState.archetype || "Rookie"}</h3>
                                <div className="text-[10px] uppercase font-bold text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-cyan-400">{gameState.playerRace || "Human"}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-rose-400">{gameState.archetype || "Cyber-Blade"}</span>
                                </div>
                                <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-1 font-sans">
                                  Age: {gameState.playerAge || 24} • BG: {gameState.playerBackground || "Street Rat"}
                                </p>
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider block mt-1 font-bold">LVL {gameState.level ?? 1} • EXP {gameState.experience ?? 0}/100</span>
                              </div>
                            </div>

                            {/* Customized Perks Section */}
                            {gameState.playerPerks && gameState.playerPerks.length > 0 && (
                              <div className="bg-slate-950/60 border border-white/5 p-2 rounded-lg text-left mt-1">
                                <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-1">🧠 INSTALLED PERKS</span>
                                <div className="flex flex-col gap-1">
                                  {gameState.playerPerks.map((pKey) => {
                                    const perkNames: Record<string, string> = {
                                      "adrenaline_junkie": "Adrenaline Junkie (+15% Melee Low-HP)",
                                      "cyber_optimizer": "Cyber-Optimizer (+10 Starting Shields)",
                                      "ether_conduit": "Ether Conduit (+2 MP/Turn)",
                                      "hardened_chassis": "Hardened Chassis (+20 Max HP)",
                                      "lucky_jack": "Lucky Jack (+40 starting credits)"
                                    };
                                    return (
                                      <span key={pKey} className="text-[9px] text-slate-300 font-sans flex items-center gap-1">
                                        <span className="text-cyan-500">◈</span> {perkNames[pKey] || pKey}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2.5 border-t border-white/10 pt-3">
                              {/* HP Gauge */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-3xs">
                                  <span className="text-rose-400 font-extrabold uppercase flex items-center gap-1"><Heart size={10} /> INTEGRITY STATUS (HP)</span>
                                  <span className="text-white font-bold">{gameState.hp} / {derived.maxHp}</span>
                                </div>
                                <div className="h-2 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                                  <motion.div 
                                    className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                                    animate={{ width: `${Math.min(100, (gameState.hp / derived.maxHp) * 100)}%` }}
                                    transition={{ type: "spring", stiffness: 70, damping: 15 }}
                                  />
                                </div>
                              </div>

                              {/* MP Gauge */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-3xs">
                                  <span className="text-cyan-400 font-extrabold uppercase flex items-center gap-1"><Zap size={10} /> ENERGY COGNITION (MP)</span>
                                  <span className="text-white font-bold">{gameState.mana} / {derived.maxMana}</span>
                                </div>
                                <div className="h-2 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                                  <motion.div 
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                                    animate={{ width: `${Math.min(100, (gameState.mana / derived.maxMana) * 100)}%` }}
                                    transition={{ type: "spring", stiffness: 70, damping: 15 }}
                                  />
                                </div>
                              </div>

                              {/* XP Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-3xs">
                                  <span className="text-indigo-400 font-extrabold uppercase flex items-center gap-1"><Award size={10} /> NEURAL INTEGRATION (XP)</span>
                                  <span className="text-white font-bold">{gameState.experience ?? 0}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                                  <motion.div 
                                    className="h-full rounded-full bg-indigo-500"
                                    animate={{ width: `${gameState.experience ?? 0}%` }}
                                    transition={{ type: "spring", stiffness: 70, damping: 15 }}
                                  />
                                </div>
                              </div>

                              {/* Level and Credits */}
                              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2 text-3xs">
                                <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                                  <span className="text-slate-500 uppercase block font-bold">LEDGER CASH</span>
                                  <p className="text-amber-400 font-black text-xs uppercase mt-0.5">{gameState.credits}¤</p>
                                </div>
                                <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                                  <span className="text-slate-500 uppercase block font-bold">SQUAD SIZE</span>
                                  <p className="text-white font-black text-xs uppercase mt-0.5">{gameState.party.length + 1} SQUAD</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Core Attributes & Skill Tree matrices */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                          <div className="glass-panel rounded-xl p-4 shadow-xl border border-white/10 flex flex-col gap-3">
                            <div className="border-b border-white/10 pb-1.5 flex justify-between items-center">
                              <span className="text-slate-300 text-3xs uppercase font-black tracking-widest flex items-center gap-1.5">
                                🛡️ Core Attribute Matrices
                              </span>
                              <span className="text-[9px] text-cyan-400 font-extrabold uppercase">LEVEL UP FOR +PTS</span>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-2 text-center">
                              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase font-bold">STR</span>
                                <span className="text-sm text-white font-black">{derived.str}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase font-bold">DEX</span>
                                <span className="text-sm text-white font-black">{derived.dex}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase font-bold">INT</span>
                                <span className="text-sm text-white font-black">{derived.int}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase font-bold">WILL</span>
                                <span className="text-sm text-white font-black">{derived.will}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 rounded border border-white/5">
                                <span className="text-[8px] text-slate-500 block uppercase font-bold">ETH</span>
                                <span className="text-sm text-cyan-400 font-black">{derived.eth}</span>
                              </div>
                            </div>

                            <div className="border-b border-white/10 pb-1 mt-1 flex justify-between items-center">
                              <span className="text-slate-300 text-3xs uppercase font-black tracking-widest flex items-center gap-1.5">
                                📶 ACTIVE SKILL TREES
                              </span>
                            </div>

                            <div className="space-y-2 text-xs font-mono">
                              <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-white/5">
                                <span className="text-slate-300 font-bold uppercase">⚔️ Cyber-Blade (Melee)</span>
                                <span className="text-cyan-400 font-black">LVL {gameState.skills?.cyberBlade ?? 1}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-white/5">
                                <span className="text-slate-300 font-bold uppercase">💾 Net-Slicer (Hacking)</span>
                                <span className="text-cyan-400 font-black">LVL {gameState.skills?.netSlicer ?? 1}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-white/5">
                                <span className="text-slate-300 font-bold uppercase">🛡️ Heavy Chrome (Defense)</span>
                                <span className="text-cyan-400 font-black">LVL {gameState.skills?.heavyChrome ?? 1}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-white/5">
                                <span className="text-slate-300 font-bold uppercase">🔮 MINDMANCER (Psychic)</span>
                                <span className={`font-black ${gameState.skills?.mindmancer ? "text-purple-400" : "text-slate-600 animate-pulse"}`}>
                                  {gameState.skills?.mindmancer ? `LVL ${gameState.skills.mindmancer}` : "LOCKED [PROLOGUE]"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 2: HARDWARE & CHROME GEAR UPLINKS */}
                    {activeTab === "gear" && (
                      <motion.div
                        key="gear-subtab"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-3 font-mono text-left"
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-slate-300 text-xs uppercase font-black tracking-widest flex items-center gap-1.5">
                            <Shield size={14} className="text-cyan-400" /> Active Hardware Uplinks & Equipment Slots
                          </span>
                          <span className="text-[10px] text-cyan-400 font-bold">MANAGEMENT READY</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(["meleeWeapon", "rangedWeapon", "armor", "headpiece", "trinket"] as const).map((slot) => {
                            const equippedItem = gameState.equipment?.[slot];
                            const details = equippedItem ? ITEM_METADATA[equippedItem] : null;
                            const slotLabel = slot === "meleeWeapon" ? "MELEE WEAPON" : slot === "rangedWeapon" ? "RANGED WEAPON" : slot;

                            return (
                              <div key={slot} className="p-3 bg-slate-950/80 border border-white/10 rounded-xl flex flex-col justify-between gap-2 shadow-md">
                                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                  <span className="text-slate-400 uppercase font-black tracking-wider text-[10px]">{slotLabel.toUpperCase()} SLOT</span>
                                  {equippedItem && (
                                    <button
                                      onClick={() => handleUnequipItem(slot)}
                                      className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-3xs uppercase px-2 py-0.5 rounded cursor-pointer transition-all font-bold"
                                    >
                                      Unequip
                                    </button>
                                  )}
                                </div>
                                {equippedItem ? (
                                  <div>
                                    <p className="font-extrabold text-cyan-400 uppercase text-xs leading-none flex items-center gap-1.5">
                                      {getItemIcon(equippedItem, details?.slot)}
                                      <span>{equippedItem}</span>
                                    </p>
                                    {details?.desc && (
                                      <p className="text-slate-400 text-[10px] font-sans leading-tight mt-1.5">{details.desc}</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-slate-600 italic text-[10px] py-2">No {slotLabel} equipped. Equip one from your Stash.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                  <AnimatePresence mode="wait">
                    
                    {/* TAB SLOT A: EQUIPMENT AND INVENTORY ITEMS */}
                    {activeTab === "inventory" && (
                      <motion.div
                        key="inventory-tab"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="space-y-4"
                      >
                        {/* Interactive local shop purchase options inside detailed views */}
                        {activePOIView && MAP_POIS.find(p => p.id === activePOIView)?.type === "shop" && (
                          <div className="bg-cyan-950/20 border border-cyan-400/15 p-3 rounded-lg space-y-3 font-mono">
                            <span className="text-[9px] text-cyan-400 font-extrabold tracking-wider uppercase block">
                              AVAILABLE IN-STORE HARDWARE:
                            </span>
                            <div className="space-y-2.5">
                              {getShopItemsForPOI(activePOIView).map((item) => {
                                const alreadyIn = gameState.inventory.includes(item.name);
                                return (
                                  <div key={item.name} className="flex justify-between items-center text-3xs border-b border-white/5 pb-2">
                                    <div className="text-left w-2/3 flex items-start gap-1.5">
                                      <div className="mt-0.5 shrink-0">
                                        {getItemIcon(item.name, ITEM_METADATA[item.name]?.slot)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-white uppercase">{item.name}</p>
                                        <p className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-none">{item.desc}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleBuyItemDirectly(item)}
                                      disabled={alreadyIn}
                                      className={`px-2 py-1.5 rounded font-black cursor-pointer uppercase ${
                                        alreadyIn
                                          ? "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed"
                                          : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                                      }`}
                                    >
                                      {alreadyIn ? "In Stash" : `${item.cost}¤`}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 text-left font-mono text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Your Gear Locker Slots</p>
                            
                            {/* Filter Chips */}
                            <div className="flex flex-wrap gap-1">
                              {(["all", "weapons", "cyberware", "consumables", "valuables"] as const).map((filter) => (
                                <button
                                  key={filter}
                                  onClick={() => setStashFilter(filter)}
                                  className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider transition-all font-bold border cursor-pointer ${
                                    stashFilter === filter
                                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                                      : "bg-slate-950/60 text-slate-400 hover:text-white border-white/5"
                                  }`}
                                >
                                  {filter}
                                </button>
                              ))}
                            </div>
                          </div>

                          {(() => {
                            const filteredInventory = [...gameState.inventory].filter(item => {
                              if (stashFilter === "all") return true;
                              if (stashFilter === "weapons") return item.toLowerCase().includes("blade") || item.toLowerCase().includes("laser") || item.toLowerCase().includes("fists");
                              if (stashFilter === "cyberware") return item.toLowerCase().includes("deck") || item.toLowerCase().includes("visor") || item.toLowerCase().includes("matrix") || item.toLowerCase().includes("core");
                              if (stashFilter === "consumables") return item.toLowerCase().includes("stim") || item.toLowerCase().includes("cell") || item.toLowerCase().includes("circuitry") || item.toLowerCase().includes("rusted");
                              if (stashFilter === "valuables") return !item.toLowerCase().includes("blade") && !item.toLowerCase().includes("laser") && !item.toLowerCase().includes("fists") && !item.toLowerCase().includes("deck") && !item.toLowerCase().includes("visor") && !item.toLowerCase().includes("matrix") && !item.toLowerCase().includes("core") && !item.toLowerCase().includes("stim") && !item.toLowerCase().includes("cell") && !item.toLowerCase().includes("circuitry") && !item.toLowerCase().includes("rusted");
                              return true;
                            }).sort((a, b) => a.localeCompare(b));

                            return filteredInventory.length === 0 ? (
                              <p className="p-4 bg-slate-950/60 border border-white/5 text-slate-600 rounded text-center text-2xs italic">
                                {stashFilter === "all" ? "Stash storage empty. Salvage districts to secure scrap chips." : `No items in category [${stashFilter}].`}
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {filteredInventory.map((item, index) => {
                                  const isScrap = item === "Rusted Circuitry";
                                  const isStim = item.includes("Stim") || item.includes("Cell");
                                  const details = ITEM_METADATA[item];
                                  const isEquipable = details && ["meleeWeapon", "rangedWeapon", "armor", "headpiece", "trinket"].includes(details.slot);

                                  let subtitle = "System Inventory Item";
                                  if (isScrap) subtitle = "Recycle Scavenge Scrap";
                                  else if (isStim) subtitle = "Combat Injector";
                                  else if (details && details.slot) {
                                    const slotDisplay = details.slot === "meleeWeapon" ? "MELEE WEAPON" : details.slot === "rangedWeapon" ? "RANGED WEAPON" : details.slot;
                                    subtitle = `${slotDisplay.toUpperCase()} HARDWARE`;
                                  }

                                  const rarity = details?.rarity || "common";

                                  return (
                                    <div
                                      key={index}
                                      className={`p-3.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border ${
                                        rarity === "legendary"
                                          ? "bg-amber-950/10 border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                                          : rarity === "epic"
                                            ? "bg-purple-950/10 border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                            : rarity === "deluxe"
                                              ? "bg-blue-950/10 border-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                              : "bg-slate-950/80 border-white/10 hover:border-white/20"
                                      }`}
                                    >
                                      <div className="text-left w-full sm:w-auto">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className={`font-black text-xs uppercase leading-none tracking-tight flex items-center gap-1.5 ${
                                            rarity === "legendary"
                                              ? "text-amber-400"
                                              : rarity === "epic"
                                                ? "text-purple-400"
                                                : rarity === "deluxe"
                                                  ? "text-blue-400"
                                                  : "text-slate-200"
                                          }`}>
                                            {getItemIcon(item, details?.slot)}
                                            <span>{item}</span>
                                          </p>
                                          
                                          {details?.rarity && (
                                            <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                              rarity === "legendary"
                                                ? "bg-amber-950/80 text-amber-300 border border-amber-500/20"
                                                : rarity === "epic"
                                                  ? "bg-purple-950/80 text-purple-300 border border-purple-500/20"
                                                  : rarity === "deluxe"
                                                    ? "bg-blue-950/80 text-blue-300 border border-blue-500/20"
                                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                            }`}>
                                              {rarity}
                                            </span>
                                          )}
                                        </div>
                                        
                                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                                          {subtitle}
                                        </p>
                                        
                                        {details?.desc && (
                                          <p className="text-slate-400 font-sans text-3xs mt-1.5 leading-snug max-w-md">
                                            {details.desc}
                                          </p>
                                        )}

                                        {details?.specialEffect && (
                                          <p className="text-rose-400 font-mono text-[9px] mt-1.5 bg-rose-950/10 border border-rose-500/10 rounded px-2 py-0.5 max-w-md flex items-center gap-1">
                                            <Sparkles size={10} className="shrink-0" />
                                            <span><strong>Effect:</strong> {details.specialEffect}</span>
                                          </p>
                                        )}
                                      </div>

                                      {/* Action items */}
                                      <div className="flex items-center gap-2 self-end sm:self-center">
                                        {isScrap && (
                                          <button
                                            onClick={handleRecycleScrapDirect}
                                            className="bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 text-3xs font-black uppercase px-2 py-1.5 rounded cursor-pointer"
                                          >
                                            Recycle (+30¤)
                                          </button>
                                        )}
                                        {isStim && (
                                          <button
                                            onClick={() => handleExecuteAction(`Consume ${item}`)}
                                            className="bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-3xs font-black uppercase px-2 py-1.5 rounded cursor-pointer animate-pulse"
                                          >
                                            Use
                                          </button>
                                        )}
                                        {isEquipable && (
                                          <button
                                            onClick={() => handleEquipItem(item)}
                                            className="bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-3xs font-black uppercase px-2.5 py-1.5 rounded cursor-pointer font-extrabold"
                                          >
                                            Equip
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          );
                        })()}
                      </div>

                        {/* General stats block summary */}
                        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg font-mono text-3xs text-left text-slate-400 space-y-1">
                          <p className="font-bold text-slate-300 uppercase">[Active Weapon Boosts]</p>
                          <p>• Alloy Weapon bonus: {gameState.inventory.includes("Apex Mantis electro-blade") ? "+25 Damage Slash Activated" : "+0 Base Damage (Find blade)"}</p>
                          <p>• Cyber hacker visor bonus: {gameState.inventory.includes("Smart-Targeting Visor") ? "+12 neural bypass bonus" : "+0 neural bypass (Find visor)"}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB SLOT B: COMPANION PARTY & BACKGROUND JOBS ENGINE */}
                    {activeTab === "companions" && (
                      <motion.div
                        key="companions-tab"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="space-y-4"
                      >
                        <p className="text-left font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold leading-none mb-1">
                          Hired Personnel database
                        </p>

                        <div className="space-y-2.5">
                          {(() => {
                            const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                            const filteredCompanions = gameState.companions.filter(comp => {
                              if (isPrologue) {
                                return comp.name === "Vice" || comp.name === "Tracker";
                              } else {
                                return comp.name !== "Vice" && comp.name !== "Tracker";
                              }
                            });

                            if (filteredCompanions.length === 0) {
                              return (
                                <p className="text-slate-500 text-center py-6 text-2xs italic border border-dashed border-white/5 rounded-lg">
                                  No companions currently recorded in this district sector database.
                                </p>
                              );
                            }

                            return filteredCompanions.map((comp) => {
                              const isHired = gameState.party.includes(comp.name);
                              const isWorking = comp.status === "working";
                              const isAvailable = comp.status === "available";

                              return (
                                <div
                                  key={comp.name}
                                  className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                                    isWorking
                                      ? "bg-amber-950/20 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                                      : isHired
                                        ? "bg-slate-950/80 border-cyan-500/20"
                                        : "bg-slate-950/40 border-white/5 opacity-80"
                                  }`}
                                >
                                  <div className="flex gap-3 items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {/* High-Resolution Tactical Portrait Showcase */}
                                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-900 shrink-0 flex items-center justify-center text-2xl shadow-[0_0_10px_rgba(6,182,212,0.15)] relative">
                                        {comp.image ? (
                                          <>
                                            <img src={comp.image} alt={comp.name} className="w-full h-full object-cover object-top filter contrast-[1.05] brightness-[1.02]" referrerPolicy="no-referrer" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                                            <span className="absolute bottom-1 right-1 text-[10px] select-none">{comp.avatar}</span>
                                          </>
                                        ) : (
                                          <span>{comp.avatar || "👤"}</span>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-extrabold text-slate-200 uppercase flex items-center gap-1 text-2xs leading-none">
                                          {comp.name} <span className="text-3xs text-slate-500 font-normal">({comp.role})</span>
                                        </p>
                                        <p className="text-[9px] text-slate-500 mt-1 italic font-sans leading-tight max-w-[260px] md:max-w-[340px]">{comp.bio}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Payout Tag */}
                                    {isWorking && (
                                      <span className="bg-amber-950 border border-amber-500/30 text-amber-300 font-black px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                                        WORK: +35¤/rest
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-3xs">
                                    {isAvailable && (
                                      <button
                                        onClick={() => {
                                          // Auto-travel to agency to hire
                                          setActivePOIView("agency");
                                          triggerToast(`Opening Nexus Agency desk to negotiate`);
                                        }}
                                        className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-2 py-1 rounded cursor-pointer"
                                      >
                                        Not Hired (Costs {comp.fee}¤)
                                      </button>
                                    )}

                                    {isHired && (
                                      <div className="flex flex-wrap gap-1.5">
                                        <button
                                          onClick={() => setEditingCompanionName(comp.name)}
                                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2 py-1 rounded cursor-pointer uppercase font-black"
                                        >
                                          ⚙️ Gear & Inv
                                        </button>
                                        <button
                                          onClick={() => handleTalkCompanion(comp)}
                                          className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                        >
                                          💬 Talk / Opinion
                                        </button>
                                        {!isPrologue && (
                                          <>
                                            <button
                                              onClick={() => handleAssignCompanionTask(comp.name, "Hacking Financial Databases")}
                                              className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                            >
                                              💼 Assign Job
                                            </button>
                                            <button
                                              onClick={() => handleDismissCompanion(comp.name)}
                                              className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                            >
                                              ❌ Dismiss
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {isWorking && (
                                      <button
                                        onClick={() => handleRecallCompanion(comp.name)}
                                        className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-2.5 py-1 rounded cursor-pointer uppercase"
                                      >
                                        Recall to Squad Team
                                      </button>
                                    )}

                                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">
                                      {comp.status.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </motion.div>
                    )}

                    {/* TAB SLOT C: QUEST LOG DIRECTIVE SCHEMAS */}
                    {activeTab === "quests" && (() => {
                      const allQuests = buildQuestJournal(gameState);
                      
                      // Filter based on questFilter state
                      const filteredQuests = allQuests.filter(q => {
                        if (questFilter === "all") return q.status === "ACTIVE";
                        if (questFilter === "main") return q.category === "Main Quest" && q.status === "ACTIVE";
                        if (questFilter === "side") return q.category === "Side Quest" && q.status === "ACTIVE";
                        if (questFilter === "completed") return q.status === "COMPLETED";
                        return true;
                      });

                      // Select current selected quest or fallback
                      const currentQuest = filteredQuests.find(q => q.id === selectedQuestId) || filteredQuests[0] || allQuests[0];

                      return (
                        <motion.div
                          key="quests-tab"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-4 font-mono text-xs text-left"
                        >
                          {/* Filter Bar */}
                          <div className="flex flex-wrap items-center gap-1 bg-slate-950/60 p-1 border border-white/5 rounded-md">
                            {(["all", "main", "side", "completed"] as const).map((filter) => {
                              const isActive = questFilter === filter;
                              let count = 0;
                              if (filter === "all") count = allQuests.filter(q => q.status === "ACTIVE").length;
                              else if (filter === "main") count = allQuests.filter(q => q.category === "Main Quest" && q.status === "ACTIVE").length;
                              else if (filter === "side") count = allQuests.filter(q => q.category === "Side Quest" && q.status === "ACTIVE").length;
                              else if (filter === "completed") count = allQuests.filter(q => q.status === "COMPLETED").length;

                              return (
                                <button
                                  key={filter}
                                  onClick={() => {
                                    setQuestFilter(filter);
                                    // Reset selectedQuestId to first in list
                                    const nextQuests = allQuests.filter(q => {
                                      if (filter === "all") return q.status === "ACTIVE";
                                      if (filter === "main") return q.category === "Main Quest" && q.status === "ACTIVE";
                                      if (filter === "side") return q.category === "Side Quest" && q.status === "ACTIVE";
                                      if (filter === "completed") return q.status === "COMPLETED";
                                      return true;
                                    });
                                    if (nextQuests.length > 0) {
                                      setSelectedQuestId(nextQuests[0].id);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer ${
                                    isActive
                                      ? "bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                                      : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {filter === "all" && "All Active"}
                                  {filter === "main" && "Main Directives"}
                                  {filter === "side" && "Side Contracts"}
                                  {filter === "completed" && "Completed Logs"}
                                  <span className={`px-1 rounded text-[8px] ${isActive ? "bg-amber-600 text-amber-100" : "bg-slate-900 text-slate-500"}`}>
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Dual-Pane Layout */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left Pane: Quest List */}
                            <div className="md:col-span-5 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                              {filteredQuests.length === 0 ? (
                                <div className="p-8 bg-slate-950/70 border border-white/5 text-slate-600 rounded-lg text-center text-3xs italic flex flex-col items-center justify-center gap-2">
                                  <BookOpen size={16} className="text-slate-700" />
                                  <span>No orders found matching filter. Speak to Jax at Neon Abyss Bar for rebellion work.</span>
                                </div>
                              ) : (
                                filteredQuests.map((q) => {
                                  const isSelected = currentQuest?.id === q.id;
                                  const completedObjCount = q.objectives.filter(o => o.completed).length;
                                  const totalObjCount = q.objectives.length;
                                  
                                  let categoryColor = "border-amber-500/10 text-amber-400 bg-amber-950/10";
                                  let categoryLabel = "MAIN";
                                  if (q.category === "Side Quest") {
                                    categoryColor = "border-purple-500/10 text-purple-400 bg-purple-950/10";
                                    categoryLabel = "SIDE";
                                  }

                                  return (
                                    <button
                                      key={q.id}
                                      onClick={() => setSelectedQuestId(q.id)}
                                      className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer relative ${
                                        isSelected
                                          ? "bg-slate-900/90 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)] text-white"
                                          : "bg-slate-950/50 border-white/5 text-slate-400 hover:bg-slate-900/40 hover:border-white/10"
                                      }`}
                                    >
                                      {/* Highlight Bar for selection */}
                                      {isSelected && (
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${q.category === "Main Quest" ? "bg-amber-500" : "bg-purple-500"}`} />
                                      )}

                                      <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${categoryColor}`}>
                                          {categoryLabel}
                                        </span>
                                        <span className="text-[8px] text-slate-500 tracking-wider font-extrabold uppercase">
                                          {completedObjCount}/{totalObjCount} OBJ
                                        </span>
                                      </div>

                                      <p className={`font-bold text-2xs truncate ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                                        {q.title}
                                      </p>

                                      {/* Mini Progress Bar */}
                                      <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-0.5">
                                        <div 
                                          className={`h-full transition-all duration-300 ${q.category === "Main Quest" ? "bg-amber-500" : "bg-purple-500"}`}
                                          style={{ width: `${(completedObjCount / totalObjCount) * 100}%` }}
                                        />
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>

                            {/* Right Pane: Selected Quest Detail */}
                            <div className="md:col-span-7 bg-slate-950/60 border border-white/5 rounded-lg p-3.5 space-y-4 max-h-[380px] overflow-y-auto">
                              {currentQuest ? (
                                <div className="space-y-4">
                                  {/* Header block */}
                                  <div className="space-y-1 pb-2 border-b border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">
                                        [ {currentQuest.category.toUpperCase()} PROTOCOL ]
                                      </span>
                                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 ${
                                        currentQuest.status === "COMPLETED"
                                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20"
                                          : "bg-amber-950/80 text-amber-400 border border-amber-500/20 animate-pulse"
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${currentQuest.status === "COMPLETED" ? "bg-emerald-400" : "bg-amber-400"}`} />
                                        {currentQuest.status}
                                      </span>
                                    </div>
                                    <h3 className="text-sm font-black text-slate-200 tracking-tight leading-snug uppercase">
                                      {currentQuest.title}
                                    </h3>
                                  </div>

                                  {/* Narrative Description */}
                                  <div className="space-y-1">
                                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">MISSION REPORT / INTEL</span>
                                    <p className="p-3 bg-slate-950/90 border border-white/5 rounded text-3xs text-slate-400 leading-relaxed italic">
                                      {currentQuest.description}
                                    </p>
                                  </div>

                                  {/* Tactical Objectives */}
                                  <div className="space-y-2">
                                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">TACTICAL OBJECTIVES</span>
                                    <div className="space-y-2">
                                      {currentQuest.objectives.map((obj) => (
                                        <div key={obj.id} className="p-2.5 bg-slate-900/40 border border-white/5 rounded flex flex-col gap-1.5">
                                          <div className="flex items-start gap-2">
                                            {obj.completed ? (
                                              <CheckCircle size={12} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                                            ) : (
                                              <div className="w-3 h-3 rounded-sm border border-amber-500/40 flex-shrink-0 mt-0.5 flex items-center justify-center text-amber-400 text-[8px] font-extrabold bg-amber-950/10">
                                                <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping" />
                                              </div>
                                            )}
                                            <span className={`text-3xs leading-normal ${obj.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                                              {obj.text}
                                            </span>
                                          </div>
                                          {/* Counter/Progress bar for count objectives */}
                                          {obj.target > 1 && (
                                            <div className="pl-5 space-y-1">
                                              <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                                <span>PROGRESS LEDGER</span>
                                                <span className={obj.completed ? "text-cyan-400" : "text-amber-400"}>{obj.current} / {obj.target}</span>
                                              </div>
                                              <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                                                <div 
                                                  className={`h-full transition-all duration-300 ${obj.completed ? "bg-cyan-500" : "bg-amber-500"}`}
                                                  style={{ width: `${(obj.current / obj.target) * 100}%` }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Narrative Chronology Logs */}
                                  {currentQuest.log && currentQuest.log.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">MISSION CHRONOLOGY / LOGS</span>
                                      <div className="p-2.5 bg-slate-950/90 border border-white/5 rounded font-mono text-3xs text-slate-500 space-y-1 max-h-[100px] overflow-y-auto">
                                        {currentQuest.log.map((logLine, lIdx) => (
                                          <div key={lIdx} className="flex gap-1.5 leading-relaxed">
                                            <span className="text-slate-600 flex-shrink-0">›</span>
                                            <span>{logLine}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rewards block */}
                                  <div className="space-y-2 pt-1 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">GRID SECURED REWARDS</span>
                                      {currentQuest.status === "COMPLETED" ? (
                                        <span className="text-[7px] text-cyan-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                                          <Check size={8} className="stroke-[3px]" /> REWARDS SYNCED TO LEDGER
                                        </span>
                                      ) : (
                                        <span className="text-[7px] text-amber-500/80 uppercase tracking-widest font-extrabold">
                                          INJECT TO DECK ON RESOLUTION
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {currentQuest.rewards.map((reward, rIdx) => {
                                        let icon = <Award size={10} className="text-amber-400" />;
                                        let label = "";
                                        if (reward.type === "credits") {
                                          icon = <Coins size={10} className="text-amber-400" />;
                                          label = `${reward.amount}¤ Credits`;
                                        } else if (reward.type === "experience") {
                                          icon = <Award size={10} className="text-cyan-400" />;
                                          label = `+${reward.amount} XP Units`;
                                        } else if (reward.type === "item") {
                                          icon = <Sparkles size={10} className="text-purple-400" />;
                                          label = `✦ ${reward.itemName}`;
                                        } else if (reward.type === "maxMana") {
                                          icon = <Zap size={10} className="text-sky-400" />;
                                          label = `+${reward.amount} Max Mana`;
                                        } else if (reward.type === "maxHp") {
                                          icon = <Heart size={10} className="text-rose-400" />;
                                          label = `+${reward.amount} Max HP`;
                                        }

                                        return (
                                          <div key={rIdx} className="p-2 bg-slate-900/70 border border-white/5 rounded flex items-center gap-2 text-3xs font-bold text-slate-300">
                                            {icon}
                                            <span className="truncate">{label}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-600 italic text-3xs gap-2">
                                  <Terminal size={24} className="text-slate-800 animate-pulse" />
                                  <span>SELECT DIRECTIVE TO INITIALIZE READOUT</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}

                    {activeTab === "factions" && (
                      <motion.div
                        key="factions-tab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4 font-mono text-xs text-left"
                      >
                        <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">FACTION DIRECTIVE & ALIGNMENTS</p>
                          <p className="text-3xs text-slate-500 font-sans leading-relaxed">
                            Reputation affects shop prices across POIs (Marv's Clinic and Nouveau Chrome) and changes dialogue nodes. Completing contracts and taking sides shapes how these factions perceive your operations.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Street Outlaws */}
                          {(() => {
                            const rep = gameState.reputations?.streetOutlaws ?? 50;
                            let status = "Neutral";
                            let statusColor = "text-slate-400 border-slate-500/20 bg-slate-950/40";
                            let rateDisplay = "Standard Rates";
                            if (rep >= 80) {
                              status = "Allied";
                              statusColor = "text-cyan-400 border-cyan-500/30 bg-cyan-950/30";
                              rateDisplay = "20% Shop Discount";
                            } else if (rep >= 61) {
                              status = "Friendly";
                              statusColor = "text-sky-400 border-sky-500/20 bg-sky-950/20";
                              rateDisplay = "10% Shop Discount";
                            } else if (rep <= 20) {
                              status = "Hostile";
                              statusColor = "text-rose-500 border-rose-500/30 bg-rose-950/30";
                              rateDisplay = "50% Price Markup";
                            } else if (rep <= 40) {
                              status = "Distant";
                              statusColor = "text-amber-500 border-amber-500/20 bg-amber-950/20";
                              rateDisplay = "20% Price Markup";
                            }

                            const tiers = FACTION_TIERS.streetOutlaws;
                            const activeTierIdx = getTierIndexForRepValue(rep);

                            return (
                              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3.5 relative overflow-hidden min-h-[300px]">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-extrabold text-cyan-400 uppercase tracking-wider text-xs">STREET OUTLAWS</h4>
                                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${statusColor}`}>
                                    {status}
                                  </span>
                                </div>
                                
                                <p className="text-slate-400 text-3xs font-sans leading-relaxed min-h-[50px]">
                                  Gritty neon hackers and cyber-punk syndicates controlling the black markets of Shatter Ridge. Allied with Dr. Marv's clinic.
                                </p>

                                <div className="space-y-1 relative">
                                  <div className="flex justify-between text-[8px] font-extrabold text-slate-500">
                                    <span>REP VALUE: {rep}%</span>
                                    <span>{rateDisplay}</span>
                                  </div>
                                  <div 
                                    className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5 relative cursor-help"
                                    onMouseEnter={() => setHoveredFaction("streetOutlaws")}
                                    onMouseLeave={() => setHoveredFaction(null)}
                                  >
                                    <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${rep}%` }} />
                                  </div>

                                  {/* Quick Hover Tooltip */}
                                  <AnimatePresence>
                                    {hoveredFaction === "streetOutlaws" && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900/95 border border-cyan-500/30 p-2.5 rounded-lg text-[9px] text-slate-300 z-10 pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                                      >
                                        <p className="font-extrabold text-cyan-400 uppercase tracking-widest leading-none mb-1">
                                          CURRENT: {status} ({rep}%)
                                        </p>
                                        <p className="text-[8px] text-slate-400 mb-1">
                                          Shop Rates: <span className="text-white font-bold">{rateDisplay}</span>
                                        </p>
                                        <div className="h-px bg-white/5 my-1" />
                                        <p className="text-[7.5px] text-cyan-500 font-bold uppercase tracking-wider">
                                          Click "INSPECT TIERS" for full details & penalties schema.
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 text-[9px] text-slate-400 space-y-1 mt-auto">
                                  <p className="font-extrabold text-slate-300 uppercase text-[8px] tracking-wider">ACTIVE MATRIX PERKS:</p>
                                  <p className="flex items-center gap-1">
                                    <span className={rep >= 61 ? "text-cyan-400 font-black" : "text-slate-600"}>•</span>
                                    <span className={rep >= 61 ? "text-slate-200" : "text-slate-500"}>Marv's Clinic Discounts</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <span className={rep >= 80 ? "text-cyan-400 font-black" : "text-slate-600"}>•</span>
                                    <span className={rep >= 80 ? "text-slate-200" : "text-slate-500"}>Special dialogue checks</span>
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">LEDGER METADATA</span>
                                  <button
                                    onClick={() => {
                                      setSelectedInspectTierIndex(activeTierIdx);
                                      setClickedFaction("streetOutlaws");
                                    }}
                                    className="flex items-center gap-1 text-[8.5px] text-cyan-400 hover:text-cyan-300 font-extrabold uppercase transition-all cursor-pointer"
                                  >
                                    <HelpCircle size={10} /> Inspect Tiers
                                  </button>
                                </div>

                                {/* Full Interactive Overlay inside Card */}
                                <AnimatePresence>
                                  {clickedFaction === "streetOutlaws" && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute inset-0 bg-slate-950/98 border border-cyan-500/30 rounded-xl p-4 flex flex-col z-20 font-mono text-left"
                                    >
                                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
                                        <div>
                                          <span className="text-[7.5px] text-cyan-400 font-extrabold tracking-widest block uppercase">STANDING INSPECTION MATRIX</span>
                                          <h5 className="font-extrabold text-white text-[10px] uppercase">STREET OUTLAWS TIERS</h5>
                                        </div>
                                        <button
                                          onClick={() => setClickedFaction(null)}
                                          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>

                                      {/* Horizontal tier mini-tabs */}
                                      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/5 mb-2.5 scrollbar-thin">
                                        {tiers.map((tier, idx) => {
                                          const isSelected = idx === selectedInspectTierIndex;
                                          const isPlayerActualTier = idx === activeTierIdx;
                                          return (
                                            <button
                                              key={tier.name}
                                              onClick={() => setSelectedInspectTierIndex(idx)}
                                              className={`px-1.5 py-1 text-[8px] font-extrabold uppercase rounded border cursor-pointer shrink-0 transition-all ${
                                                isSelected
                                                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                                                  : "bg-slate-900/60 text-slate-500 border-white/5 hover:text-slate-300"
                                              }`}
                                            >
                                              {tier.name} {isPlayerActualTier && "●"}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Tier content details */}
                                      {(() => {
                                        const t = tiers[selectedInspectTierIndex];
                                        const isPlayerActualTier = selectedInspectTierIndex === activeTierIdx;
                                        return (
                                          <div className="flex-1 flex flex-col justify-between space-y-2">
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${t.statusColor}`}>
                                                  {t.name} Standing
                                                </span>
                                                <span className="text-[8px] text-slate-500 font-extrabold">RANGE: {t.range}</span>
                                              </div>

                                              <div className="bg-slate-900/40 p-2 rounded border border-white/5 text-[9px] flex justify-between items-center">
                                                <span className="text-slate-500 uppercase text-[8px] font-bold">MERCHANT RATES:</span>
                                                <span className={`font-black uppercase text-[8.5px] ${
                                                  selectedInspectTierIndex <= 1 ? "text-emerald-400" : selectedInspectTierIndex >= 3 ? "text-rose-400" : "text-slate-300"
                                                }`}>
                                                  {t.pricing}
                                                </span>
                                              </div>

                                              <div className="space-y-1">
                                                <p className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">SYSTEM BENEFITS & DIRECTIVES:</p>
                                                <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                                                  {t.perks.map((p, pidx) => (
                                                    <p key={pidx} className="text-3xs text-slate-300 flex items-start gap-1 leading-normal font-sans">
                                                      <span className="text-cyan-400 text-[10px] leading-none shrink-0">•</span>
                                                      <span>{p}</span>
                                                    </p>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {isPlayerActualTier ? (
                                              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded p-1.5 text-center text-[8px] font-extrabold text-cyan-400 flex items-center justify-center gap-1 mt-auto">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse" />
                                                NEURAL SYNC ACTIVE: CURRENT STANDING STATE
                                              </div>
                                            ) : (
                                              <div className="bg-slate-900/60 border border-white/5 rounded p-1.5 text-center text-[8px] font-bold text-slate-500 mt-auto">
                                                REQUIRES REP RANGE: {t.range}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}

                          {/* Titan Logistics */}
                          {(() => {
                            const rep = gameState.reputations?.titanLogistics ?? 50;
                            let status = "Neutral";
                            let statusColor = "text-slate-400 border-slate-500/20 bg-slate-950/40";
                            let rateDisplay = "Standard Rates";
                            if (rep >= 80) {
                              status = "Allied";
                              statusColor = "text-amber-400 border-amber-500/30 bg-amber-950/30";
                              rateDisplay = "20% Shop Discount";
                            } else if (rep >= 61) {
                              status = "Friendly";
                              statusColor = "text-orange-400 border-orange-500/20 bg-orange-950/20";
                              rateDisplay = "10% Shop Discount";
                            } else if (rep <= 20) {
                              status = "Hostile";
                              statusColor = "text-rose-500 border-rose-500/30 bg-rose-950/30";
                              rateDisplay = "50% Price Markup";
                            } else if (rep <= 40) {
                              status = "Distant";
                              statusColor = "text-amber-500 border-amber-500/20 bg-amber-950/20";
                              rateDisplay = "20% Price Markup";
                            }

                            const tiers = FACTION_TIERS.titanLogistics;
                            const activeTierIdx = getTierIndexForRepValue(rep);

                            return (
                              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3.5 relative overflow-hidden min-h-[300px]">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-xs">TITAN LOGISTICS</h4>
                                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${statusColor}`}>
                                    {status}
                                  </span>
                                </div>
                                
                                <p className="text-slate-400 text-3xs font-sans leading-relaxed min-h-[50px]">
                                  Under-the-table military hardware shipping conglomerate operating regional transit channels and the Nexus Agency deck.
                                </p>

                                <div className="space-y-1 relative">
                                  <div className="flex justify-between text-[8px] font-extrabold text-slate-500">
                                    <span>REP VALUE: {rep}%</span>
                                    <span>{rateDisplay}</span>
                                  </div>
                                  <div 
                                    className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5 relative cursor-help"
                                    onMouseEnter={() => setHoveredFaction("titanLogistics")}
                                    onMouseLeave={() => setHoveredFaction(null)}
                                  >
                                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${rep}%` }} />
                                  </div>

                                  {/* Quick Hover Tooltip */}
                                  <AnimatePresence>
                                    {hoveredFaction === "titanLogistics" && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900/95 border border-amber-500/30 p-2.5 rounded-lg text-[9px] text-slate-300 z-10 pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                                      >
                                        <p className="font-extrabold text-amber-400 uppercase tracking-widest leading-none mb-1">
                                          CURRENT: {status} ({rep}%)
                                        </p>
                                        <p className="text-[8px] text-slate-400 mb-1">
                                          Shop Rates: <span className="text-white font-bold">{rateDisplay}</span>
                                        </p>
                                        <div className="h-px bg-white/5 my-1" />
                                        <p className="text-[7.5px] text-amber-500 font-bold uppercase tracking-wider">
                                          Click "INSPECT TIERS" for full details & penalties schema.
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 text-[9px] text-slate-400 space-y-1 mt-auto">
                                  <p className="font-extrabold text-slate-300 uppercase text-[8px] tracking-wider">ACTIVE MATRIX PERKS:</p>
                                  <p className="flex items-center gap-1">
                                    <span className={rep >= 61 ? "text-amber-400 font-black" : "text-slate-600"}>•</span>
                                    <span className={rep >= 61 ? "text-slate-200" : "text-slate-500"}>Transit cost reduction</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <span className={rep >= 80 ? "text-amber-400 font-black" : "text-slate-600"}>•</span>
                                    <span className={rep >= 80 ? "text-slate-200" : "text-slate-500"}>Elite weapons clearance</span>
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">LEDGER METADATA</span>
                                  <button
                                    onClick={() => {
                                      setSelectedInspectTierIndex(activeTierIdx);
                                      setClickedFaction("titanLogistics");
                                    }}
                                    className="flex items-center gap-1 text-[8.5px] text-amber-400 hover:text-amber-300 font-extrabold uppercase transition-all cursor-pointer"
                                  >
                                    <HelpCircle size={10} /> Inspect Tiers
                                  </button>
                                </div>

                                {/* Full Interactive Overlay inside Card */}
                                <AnimatePresence>
                                  {clickedFaction === "titanLogistics" && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute inset-0 bg-slate-950/98 border border-amber-500/30 rounded-xl p-4 flex flex-col z-20 font-mono text-left"
                                    >
                                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
                                        <div>
                                          <span className="text-[7.5px] text-amber-400 font-extrabold tracking-widest block uppercase">STANDING INSPECTION MATRIX</span>
                                          <h5 className="font-extrabold text-white text-[10px] uppercase">TITAN LOGISTICS TIERS</h5>
                                        </div>
                                        <button
                                          onClick={() => setClickedFaction(null)}
                                          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>

                                      {/* Horizontal tier mini-tabs */}
                                      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/5 mb-2.5 scrollbar-thin">
                                        {tiers.map((tier, idx) => {
                                          const isSelected = idx === selectedInspectTierIndex;
                                          const isPlayerActualTier = idx === activeTierIdx;
                                          return (
                                            <button
                                              key={tier.name}
                                              onClick={() => setSelectedInspectTierIndex(idx)}
                                              className={`px-1.5 py-1 text-[8px] font-extrabold uppercase rounded border cursor-pointer shrink-0 transition-all ${
                                                isSelected
                                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                                  : "bg-slate-900/60 text-slate-500 border-white/5 hover:text-slate-300"
                                              }`}
                                            >
                                              {tier.name} {isPlayerActualTier && "●"}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Tier content details */}
                                      {(() => {
                                        const t = tiers[selectedInspectTierIndex];
                                        const isPlayerActualTier = selectedInspectTierIndex === activeTierIdx;
                                        return (
                                          <div className="flex-1 flex flex-col justify-between space-y-2">
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${t.statusColor}`}>
                                                  {t.name} Standing
                                                </span>
                                                <span className="text-[8px] text-slate-500 font-extrabold">RANGE: {t.range}</span>
                                              </div>

                                              <div className="bg-slate-900/40 p-2 rounded border border-white/5 text-[9px] flex justify-between items-center">
                                                <span className="text-slate-500 uppercase text-[8px] font-bold">MERCHANT RATES:</span>
                                                <span className={`font-black uppercase text-[8.5px] ${
                                                  selectedInspectTierIndex <= 1 ? "text-emerald-400" : selectedInspectTierIndex >= 3 ? "text-rose-400" : "text-slate-300"
                                                }`}>
                                                  {t.pricing}
                                                </span>
                                              </div>

                                              <div className="space-y-1">
                                                <p className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">SYSTEM BENEFITS & DIRECTIVES:</p>
                                                <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                                                  {t.perks.map((p, pidx) => (
                                                    <p key={pidx} className="text-3xs text-slate-300 flex items-start gap-1 leading-normal font-sans">
                                                      <span className="text-amber-400 text-[10px] leading-none shrink-0">•</span>
                                                      <span>{p}</span>
                                                    </p>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {isPlayerActualTier ? (
                                              <div className="bg-amber-500/5 border border-amber-500/20 rounded p-1.5 text-center text-[8px] font-extrabold text-amber-400 flex items-center justify-center gap-1 mt-auto">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                                                NEURAL SYNC ACTIVE: CURRENT STANDING STATE
                                              </div>
                                            ) : (
                                              <div className="bg-slate-900/60 border border-white/5 rounded p-1.5 text-center text-[8px] font-bold text-slate-500 mt-auto">
                                                REQUIRES REP RANGE: {t.range}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}

                          {/* Ares Corporate */}
                          {(() => {
                            const rep = gameState.reputations?.aresCorporate ?? 50;
                            let status = "Neutral";
                            let statusColor = "text-slate-400 border-slate-500/20 bg-slate-950/40";
                            let rateDisplay = "Standard Rates";
                            if (rep >= 80) {
                              status = "Allied";
                              statusColor = "text-indigo-400 border-indigo-500/30 bg-indigo-950/30";
                              rateDisplay = "20% Shop Discount";
                            } else if (rep >= 61) {
                              status = "Friendly";
                              statusColor = "text-purple-400 border-purple-500/20 bg-purple-950/20";
                              rateDisplay = "10% Shop Discount";
                            } else if (rep <= 20) {
                              status = "Hostile";
                              statusColor = "text-rose-500 border-rose-500/30 bg-rose-950/30";
                              rateDisplay = "50% Price Markup";
                            } else if (rep <= 40) {
                              status = "Distant";
                              statusColor = "text-amber-500 border-amber-500/20 bg-amber-950/20";
                              rateDisplay = "20% Price Markup";
                            }

                            const tiers = FACTION_TIERS.aresCorporate;
                            const activeTierIdx = getTierIndexForRepValue(rep);

                            return (
                              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3.5 relative overflow-hidden min-h-[300px]">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-extrabold text-indigo-400 uppercase tracking-wider text-xs">ARES CORP</h4>
                                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${statusColor}`}>
                                    {status}
                                  </span>
                                </div>
                                
                                <p className="text-slate-400 text-3xs font-sans leading-relaxed min-h-[50px]">
                                  Elite militarized technology conglomerate running premium highwalk cyberware labs and Nouveau Chrome luxury showroom.
                                </p>

                                <div className="space-y-1 relative">
                                  <div className="flex justify-between text-[8px] font-extrabold text-slate-500">
                                    <span>REP VALUE: {rep}%</span>
                                    <span>{rateDisplay}</span>
                                  </div>
                                  <div 
                                    className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5 relative cursor-help"
                                    onMouseEnter={() => setHoveredFaction("aresCorporate")}
                                    onMouseLeave={() => setHoveredFaction(null)}
                                  >
                                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${rep}%` }} />
                                  </div>

                                  {/* Quick Hover Tooltip */}
                                  <AnimatePresence>
                                    {hoveredFaction === "aresCorporate" && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900/95 border border-indigo-500/30 p-2.5 rounded-lg text-[9px] text-slate-300 z-10 pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                                      >
                                        <p className="font-extrabold text-indigo-400 uppercase tracking-widest leading-none mb-1">
                                          CURRENT: {status} ({rep}%)
                                        </p>
                                        <p className="text-[8px] text-slate-400 mb-1">
                                          Showroom Rates: <span className="text-white font-bold">{rateDisplay}</span>
                                        </p>
                                        <div className="h-px bg-white/5 my-1" />
                                        <p className="text-[7.5px] text-indigo-400 font-bold uppercase tracking-wider">
                                          Click "INSPECT TIERS" for full details & penalties schema.
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 text-[9px] text-slate-400 space-y-1 mt-auto">
                                  <p className="font-extrabold text-slate-300 uppercase text-[8px] tracking-wider">ACTIVE MATRIX PERKS:</p>
                                  <p className="flex items-center gap-1">
                                    <span className={rep >= 61 ? "text-indigo-400 font-black" : "text-slate-600"}>•</span>
                                    <span className={rep >= 61 ? "text-slate-200" : "text-slate-500"}>Nouveau Chrome Discounts</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <span className={rep >= 80 ? "text-indigo-400 font-black" : "text-slate-600"}>•</span>
                                    <span className={rep >= 80 ? "text-slate-200" : "text-slate-500"}>Premium nanotech clearance</span>
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">LEDGER METADATA</span>
                                  <button
                                    onClick={() => {
                                      setSelectedInspectTierIndex(activeTierIdx);
                                      setClickedFaction("aresCorporate");
                                    }}
                                    className="flex items-center gap-1 text-[8.5px] text-indigo-400 hover:text-indigo-300 font-extrabold uppercase transition-all cursor-pointer"
                                  >
                                    <HelpCircle size={10} /> Inspect Tiers
                                  </button>
                                </div>

                                {/* Full Interactive Overlay inside Card */}
                                <AnimatePresence>
                                  {clickedFaction === "aresCorporate" && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute inset-0 bg-slate-950/98 border border-indigo-500/30 rounded-xl p-4 flex flex-col z-20 font-mono text-left"
                                    >
                                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
                                        <div>
                                          <span className="text-[7.5px] text-indigo-400 font-extrabold tracking-widest block uppercase">STANDING INSPECTION MATRIX</span>
                                          <h5 className="font-extrabold text-white text-[10px] uppercase">ARES CORP TIERS</h5>
                                        </div>
                                        <button
                                          onClick={() => setClickedFaction(null)}
                                          className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>

                                      {/* Horizontal tier mini-tabs */}
                                      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/5 mb-2.5 scrollbar-thin">
                                        {tiers.map((tier, idx) => {
                                          const isSelected = idx === selectedInspectTierIndex;
                                          const isPlayerActualTier = idx === activeTierIdx;
                                          return (
                                            <button
                                              key={tier.name}
                                              onClick={() => setSelectedInspectTierIndex(idx)}
                                              className={`px-1.5 py-1 text-[8px] font-extrabold uppercase rounded border cursor-pointer shrink-0 transition-all ${
                                                isSelected
                                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                                                  : "bg-slate-900/60 text-slate-500 border-white/5 hover:text-slate-300"
                                              }`}
                                            >
                                              {tier.name} {isPlayerActualTier && "●"}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Tier content details */}
                                      {(() => {
                                        const t = tiers[selectedInspectTierIndex];
                                        const isPlayerActualTier = selectedInspectTierIndex === activeTierIdx;
                                        return (
                                          <div className="flex-1 flex flex-col justify-between space-y-2">
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${t.statusColor}`}>
                                                  {t.name} Standing
                                                </span>
                                                <span className="text-[8px] text-slate-500 font-extrabold">RANGE: {t.range}</span>
                                              </div>

                                              <div className="bg-slate-900/40 p-2 rounded border border-white/5 text-[9px] flex justify-between items-center">
                                                <span className="text-slate-500 uppercase text-[8px] font-bold">MERCHANT RATES:</span>
                                                <span className={`font-black uppercase text-[8.5px] ${
                                                  selectedInspectTierIndex <= 1 ? "text-emerald-400" : selectedInspectTierIndex >= 3 ? "text-rose-400" : "text-slate-300"
                                                }`}>
                                                  {t.pricing}
                                                </span>
                                              </div>

                                              <div className="space-y-1">
                                                <p className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">SYSTEM BENEFITS & DIRECTIVES:</p>
                                                <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                                                  {t.perks.map((p, pidx) => (
                                                    <p key={pidx} className="text-3xs text-slate-300 flex items-start gap-1 leading-normal font-sans">
                                                      <span className="text-indigo-400 text-[10px] leading-none shrink-0">•</span>
                                                      <span>{p}</span>
                                                    </p>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>

                                            {isPlayerActualTier ? (
                                              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded p-1.5 text-center text-[8px] font-extrabold text-indigo-400 flex items-center justify-center gap-1 mt-auto">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" />
                                                NEURAL SYNC ACTIVE: CURRENT STANDING STATE
                                              </div>
                                            ) : (
                                              <div className="bg-slate-900/60 border border-white/5 rounded p-1.5 text-center text-[8px] font-bold text-slate-500 mt-auto">
                                                REQUIRES REP RANGE: {t.range}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </div>

              </div>
              )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* COMPANION TALK TRANS-COMM OPINION DIALOG MODAL OVERLAY */}
        <AnimatePresence>
          {companionOpinion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono"
            >
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full relative shadow-[0_0_30px_rgba(6,182,212,0.15)] text-left">
                <button
                  onClick={() => setCompanionOpinion(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
                
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
                  {companionOpinion.image ? (
                    <img
                      src={companionOpinion.image}
                      alt={companionOpinion.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-cyan-950 flex items-center justify-center border border-cyan-500/30 text-cyan-400 font-extrabold text-sm shadow-[0_0_10px_rgba(34,211,238,0.2)] flex-shrink-0">
                      {companionOpinion.name[0]}
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] text-cyan-400 uppercase tracking-widest block font-bold">OPERATIVE TRANS-COMM</span>
                    <h4 className="text-white font-extrabold text-sm uppercase">{companionOpinion.name}</h4>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-slate-200 text-xs leading-relaxed italic relative">
                  <span className="absolute -top-3 left-4 bg-slate-900 px-2 text-[9px] text-slate-500 uppercase">TRANSMISSION FEED</span>
                  "{companionOpinion.line}"
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setCompanionOpinion(null)}
                    className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all font-bold uppercase text-2xs px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Acknowledge Uplink
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className={`max-w-md w-full rounded-xl border p-6 font-mono relative shadow-2xl overflow-hidden ${
                  activePopup.type === "transit"
                    ? "border-cyan-500/50 bg-slate-900/90 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                    : activePopup.type === "loot"
                      ? "border-emerald-500/50 bg-slate-900/90 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                      : activePopup.type === "check_success"
                        ? "border-cyan-400/50 bg-slate-900/90 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                        : activePopup.type === "check_failure"
                          ? "border-red-500/50 bg-slate-900/90 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
                          : "border-slate-700 bg-slate-900/90 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                }`}
              >
                {/* Visual sci-fi scanner overlay beam */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    {activePopup.type === "check_failure" ? (
                      <div className="w-8 h-8 rounded-lg bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                        <AlertTriangle size={16} />
                      </div>
                    ) : activePopup.type === "loot" ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Briefcase size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Compass size={16} />
                      </div>
                    )}
                    <div className="text-left">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                        {activePopup.subtitle || "TACTICAL DECK NOTICE"}
                      </span>
                      <h3 className={`text-sm font-black tracking-wide uppercase ${
                        activePopup.type === "check_failure"
                          ? "text-red-400"
                          : activePopup.type === "loot"
                            ? "text-emerald-400"
                            : "text-cyan-400"
                      }`}>
                        {activePopup.title}
                      </h3>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    activePopup.type === "check_failure"
                      ? "bg-red-950/40 border-red-500/20 text-red-400"
                      : activePopup.type === "loot"
                        ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                        : "bg-cyan-950/40 border-cyan-500/20 text-cyan-400"
                  }`}>
                    {activePopup.type}
                  </span>
                </div>

                {/* Content text */}
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed text-left p-4 rounded-lg bg-slate-950/60 border border-white/5 whitespace-pre-wrap">
                  {activePopup.text}
                </p>

                {/* Footer Buttons */}
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setActivePopup(null)}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer border transition-all ${
                      activePopup.type === "check_failure"
                        ? "bg-gradient-to-r from-red-900 to-red-800 text-white border-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                        : activePopup.type === "loot"
                          ? "bg-gradient-to-r from-emerald-900 to-emerald-800 text-white border-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          : "bg-gradient-to-r from-cyan-900 to-cyan-800 text-white border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    }`}
                  >
                    CONFIRM COGNITION [OK]
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Shop Vendor Modal */}
        <AnimatePresence>
          {shopVendorOpen && gameState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col z-50"
              >
                {/* Visual Scanner Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 animate-pulse" />

                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap justify-between items-center bg-slate-950/40 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 rounded-lg">
                      <ShoppingCart size={20} className="animate-pulse" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] text-cyan-500 tracking-widest font-mono uppercase block font-bold">
                        SECURE MERCHANT NET v8.4
                      </span>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                        APEX ARMORY & ADVANCED GEAR STORE
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Credits Tracker */}
                    <div className="bg-slate-950/60 border border-white/10 px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono">
                      <Coins className="text-amber-400" size={16} />
                      <span className="text-slate-400 text-[9px] uppercase font-bold">CREDITS:</span>
                      <span className="text-amber-300 text-xs sm:text-sm font-black tracking-wide">{gameState.credits}¤</span>
                    </div>

                    <button
                      onClick={() => setShopVendorOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Shop Sub-header with Fast Action Recycler */}
                <div className="px-4 py-2.5 bg-cyan-950/20 border-b border-cyan-500/10 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span>Purchase deluxe and legendary gear to receive special stats and special effects!</span>
                  </div>

                  {gameState.inventory.includes("Rusted Circuitry") ? (
                    <button
                      onClick={() => {
                        let nextState = { ...gameState };
                        nextState.inventory = nextState.inventory.filter(i => i !== "Rusted Circuitry");
                        nextState.credits += 30;
                        setGameState(nextState);
                        setLogs(prev => [
                          ...prev,
                          {
                            id: crypto.randomUUID(),
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            text: "💰 VENDOR TRANSACTION: Recycled Rusted Circuitry directly at the store terminal counter! Received +30¤.",
                            type: "system",
                            district: nextState.district,
                            poi: nextState.poi
                          }
                        ]);
                        triggerToast("RECYCLED SCRAP: +30¤ CREDITS");
                      }}
                      className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-900 transition-all uppercase text-[10px] tracking-wider animate-pulse cursor-pointer"
                    >
                      ♻️ Quick Recycle 'Rusted Circuitry' (+30¤)
                    </button>
                  ) : (
                    <div className="text-slate-500 text-[10px] uppercase">No circuitry scrap in backpack</div>
                  )}
                </div>

                {/* Shop Categories & Catalog Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/20 grid grid-cols-1 md:grid-cols-4 gap-5 min-h-[40vh]">
                  {/* Category Sidebar */}
                  <div className="md:col-span-1 space-y-2.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block font-black text-left mb-1">
                      FILTER CATALOG
                    </span>
                    {[
                      { id: "all", label: "ALL HARDWARE" },
                      { id: "weapon", label: "WEAPONS" },
                      { id: "armor", label: "ARMOR SUITS" },
                      { id: "headpiece", label: "INTEGRATIONS" },
                      { id: "trinket", label: "TRINKETS & CORES" }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setShopFilter(cat.id)}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all flex justify-between items-center cursor-pointer ${
                          (cat.id === "all" ? shopFilter === "all" || !["weapon", "armor", "headpiece", "trinket"].includes(shopFilter) : shopFilter === cat.id)
                            ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                            : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <ChevronRight size={14} className="opacity-60" />
                      </button>
                    ))}

                    <div className="pt-4 border-t border-white/5">
                      <div className="bg-slate-900/40 border border-white/5 rounded-lg p-3 text-left font-mono text-[10px] text-slate-500 space-y-1.5">
                        <span className="font-extrabold text-slate-400 block uppercase tracking-wider">RARITY GUIDELINES:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-slate-200" />
                          <span className="text-slate-300">White: Common (+stats)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-blue-500 animate-pulse" />
                          <span className="text-blue-400">Blue: Deluxe (+stats, fx)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-purple-500 animate-pulse" />
                          <span className="text-purple-400">Purple: Epic (+high, fx)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-amber-500 animate-pulse" />
                          <span className="text-amber-400">Gold: Legendary (Unrivaled fx)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="md:col-span-3 overflow-y-auto pr-1 space-y-4 max-h-[50vh]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(ITEM_METADATA)
                        .filter(([name, details]) => {
                          if (details.slot === "consumable" || details.slot === "valuable" || details.slot === "weapon") return false;
                          if (shopFilter === "all" || !shopFilter) return true;
                          if (shopFilter === "weapon") return details.slot === "meleeWeapon" || details.slot === "rangedWeapon";
                          return details.slot === shopFilter;
                        })
                        .map(([name, details]) => {
                          const cost = getItemCost(name, details);
                          const isAffordable = gameState.credits >= cost;
                          const rarity = details.rarity || "common";

                          return (
                            <div
                              key={name}
                              className={`rounded-xl border p-4 font-mono text-left relative flex flex-col justify-between transition-all duration-300 ${
                                rarity === "legendary"
                                  ? "bg-amber-950/10 border-amber-500/30 hover:border-amber-400/60 shadow-[inset_0_0_15px_rgba(234,179,8,0.05)] hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                                  : rarity === "epic"
                                    ? "bg-purple-950/10 border-purple-500/30 hover:border-purple-400/60 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                    : rarity === "deluxe"
                                      ? "bg-blue-950/10 border-blue-500/30 hover:border-blue-400/60 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                      : "bg-slate-900/50 border-slate-700/60 hover:border-slate-500 hover:bg-slate-900/80"
                              }`}
                            >
                              <div>
                                {/* Card Header with Rarity and Slot */}
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                                    rarity === "legendary"
                                      ? "bg-amber-950 text-amber-300 border border-amber-500/20"
                                      : rarity === "epic"
                                        ? "bg-purple-950 text-purple-300 border border-purple-500/20"
                                        : rarity === "deluxe"
                                          ? "bg-blue-950 text-blue-300 border border-blue-500/20"
                                          : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}>
                                    {rarity}
                                  </span>

                                  <span className="text-[8px] text-slate-500 uppercase font-bold">
                                    {details.slot === "meleeWeapon"
                                      ? "Melee Weapon"
                                      : details.slot === "rangedWeapon"
                                        ? "Ranged Weapon"
                                        : details.slot}
                                  </span>
                                </div>

                                {/* Item Name */}
                                <h4 className={`text-sm font-black tracking-tight mb-1.5 flex items-center gap-1.5 ${
                                  rarity === "legendary"
                                    ? "text-amber-400 font-extrabold"
                                    : rarity === "epic"
                                      ? "text-purple-400"
                                      : rarity === "deluxe"
                                        ? "text-blue-400"
                                        : "text-slate-200"
                                }`}>
                                  {getItemIcon(name, details.slot)}
                                  <span>{name}</span>
                                </h4>

                                {/* Item description */}
                                <p className="text-[10px] text-slate-400 leading-normal mb-3">
                                  {details.desc}
                                </p>

                                {/* Stat modifiers */}
                                {details.stats && Object.keys(details.stats).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-3 bg-slate-950/40 p-2 rounded-md border border-white/5">
                                    {Object.entries(details.stats).map(([stat, val]) => (
                                      <span key={stat} className="text-[9px] text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded">
                                        {stat === "meleeAtk" ? "⚔️ Melee" : stat === "rangeAtk" ? "🔫 Ranged" : stat === "maxHp" ? "❤️ HP" : stat === "maxMana" ? "⚡ Mana" : stat === "startingShields" ? "🛡️ Shields" : stat.toUpperCase()}: +{val}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Special effect */}
                                {details.specialEffect && (
                                  <div className="text-[9px] text-rose-300 border border-rose-500/20 bg-rose-950/10 p-2 rounded-md mb-4 flex items-start gap-1">
                                    <Sparkles size={11} className="text-rose-400 shrink-0 mt-0.5" />
                                    <span>
                                      <strong className="text-rose-400 uppercase tracking-wide">Effect:</strong> {details.specialEffect}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price and Buy Button */}
                              <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                  <Coins size={14} className="text-amber-400" />
                                  <span className="text-amber-300 font-black text-xs sm:text-sm">{cost}¤</span>
                                </div>

                                <button
                                  onClick={() => {
                                    if (isAffordable) {
                                      let nextState = { ...gameState };
                                      nextState.credits -= cost;
                                      nextState.inventory.push(name);
                                      setGameState(nextState);
                                      setLogs(prev => [
                                        ...prev,
                                        {
                                          id: crypto.randomUUID(),
                                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                          text: `🛒 PURCHASE SUCCESS: Transferred ${cost}¤ credits. Added deluxe/legendary grade [${name}] to inventory stash!`,
                                          type: "system",
                                          district: nextState.district,
                                          poi: nextState.poi
                                        }
                                      ]);
                                      triggerToast(`BOUGHT: ${name}`);
                                    } else {
                                      triggerToast("INSUFFICIENT CREDITS");
                                    }
                                  }}
                                  disabled={!isAffordable}
                                  className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                    isAffordable
                                      ? "bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                                      : "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed"
                                  }`}
                                >
                                  {isAffordable ? "Deploy Hardware" : "Credits Short"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500 uppercase">Secure encrypted transaction logs</span>
                  <button
                    onClick={() => setShopVendorOpen(false)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                  >
                    CLOSE SHOP CONSOLE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Companion Equipment & Inventory Editor Modal */}
        <AnimatePresence>
          {editingCompanionName && gameState && (() => {
            const companion = gameState.companions.find(c => c.name === editingCompanionName);
            if (!companion) return null;
            
            // Make sure the companion has initialized equipment
            const compEquipment = companion.equipment || {
              meleeWeapon: null,
              rangedWeapon: null,
              armor: null,
              headpiece: null,
              trinket: null
            };

            const companionInv = companion.inventory || [];

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-mono text-xs"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col z-50 text-slate-200"
                >
                  {/* Visual Scanner Line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500 animate-pulse" />

                  {/* Modal Header */}
                  <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap justify-between items-center bg-slate-950/40 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-950/50 border border-purple-500/30 text-purple-400 rounded-lg">
                        <UserCog size={20} className="animate-pulse" />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] text-purple-500 tracking-widest font-mono uppercase block font-bold">
                          SQUAD INTERACTION PROTOCOL v9.1
                        </span>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                          Manage Companion: {companion.name}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-slate-950/60 border border-white/10 px-3 py-1 rounded text-[10px] text-slate-400">
                        Role: <span className="text-purple-400 font-extrabold uppercase">{companion.role}</span>
                      </div>
                      <button
                        onClick={() => setEditingCompanionName(null)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Two Column Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950/15">
                    
                    {/* LEFT COLUMN: BIO & PERSONAL INVENTORY */}
                    <div className="md:col-span-5 space-y-4">
                      {/* Companion Card */}
                      <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-left space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-950/30 border border-purple-500/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                            {companion.image ? (
                              <img src={companion.image} alt={companion.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xl">{companion.avatar || "👤"}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-white text-sm uppercase">{companion.name}</h3>
                            <p className="text-[10px] text-purple-400 font-semibold uppercase">{companion.role}</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-3xs italic leading-relaxed font-sans border-t border-white/5 pt-2">
                          "{companion.bio}"
                        </p>
                      </div>

                      {/* Companion Personal Inventory (Combat Belt) */}
                      <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-left space-y-3 flex flex-col">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                            <Briefcase size={12} className="text-purple-400" />
                            Personal Combat Belt ({companionInv.length}/4)
                          </span>
                        </div>

                        {/* Inventory List */}
                        {companionInv.length === 0 ? (
                          <p className="py-4 text-slate-500 text-center text-2xs italic border border-dashed border-white/5 rounded-lg">
                            Belt is empty. Transfer items to support this companion.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {companionInv.map((item, index) => {
                              const details = ITEM_METADATA[item];
                              return (
                                <div key={index} className="flex justify-between items-center bg-slate-900/60 border border-white/5 p-2 rounded text-3xs">
                                  <div className="flex items-center gap-1.5">
                                    {getItemIcon(item, details?.slot)}
                                    <span className="font-extrabold text-slate-200 uppercase">{item}</span>
                                  </div>
                                  <button
                                    onClick={() => handleTakeCompanionItem(companion.name, item)}
                                    className="px-2 py-1 bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 rounded border border-purple-500/20 transition-all font-bold uppercase text-[9px] cursor-pointer"
                                  >
                                    Take to Stash
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Transfer/Give from Player Stash */}
                        <div className="pt-3 border-t border-white/5 space-y-2">
                          <p className="text-[9px] text-slate-400 uppercase font-black">Give Consumable from Your Locker:</p>
                          {(() => {
                            const transferables = gameState.inventory.filter(item => 
                              item.includes("Stim") || item.includes("Cell") || item.includes("Circuitry") || item.includes("battery")
                            );
                            
                            if (transferables.length === 0) {
                              return <p className="text-[9px] text-slate-600 italic">No transferable consumables in your stash.</p>;
                            }

                            return (
                              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                                {transferables.map((item, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleGiveCompanionItem(companion.name, item)}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded border border-white/5 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    {getItemIcon(item, "consumable")}
                                    <span>+ {item.replace(" (Heal)", "").replace(" (Mana)", "")}</span>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: EQUIPMENT INTEGRATIONS */}
                    <div className="md:col-span-7 space-y-3">
                      <p className="text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Active Slot Hardware Integrations
                      </p>

                      {([
                        { key: "meleeWeapon", label: "Melee Weapon Input", icon: <Sword size={14} className="text-rose-400" /> },
                        { key: "rangedWeapon", label: "Ranged Weapon Array", icon: <Crosshair size={14} className="text-cyan-400" /> },
                        { key: "armor", label: "Body Armor Suit", icon: <Shield size={14} className="text-emerald-400" /> },
                        { key: "headpiece", label: "Neural integration visor", icon: <Cpu size={14} className="text-purple-400" /> },
                        { key: "trinket", label: "Sub-Cortex Battery Core", icon: <Gem size={14} className="text-amber-400" /> }
                      ] as const).map((slotInfo) => {
                        const equippedItemName = compEquipment[slotInfo.key];
                        const itemDetails = equippedItemName ? ITEM_METADATA[equippedItemName] : null;
                        const rarity = itemDetails?.rarity || "common";

                        // Find compatible items in player's inventory
                        const compatibleItems = gameState.inventory.filter(item => {
                          const met = ITEM_METADATA[item];
                          return met && met.slot === slotInfo.key;
                        });

                        return (
                          <div
                            key={slotInfo.key}
                            className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                              equippedItemName
                                ? rarity === "legendary"
                                  ? "bg-amber-950/10 border-amber-500/30"
                                  : rarity === "epic"
                                    ? "bg-purple-950/10 border-purple-500/30"
                                    : rarity === "deluxe"
                                      ? "bg-blue-950/10 border-blue-500/30"
                                      : "bg-slate-900 border-white/10"
                                : "bg-slate-900/40 border-dashed border-white/5 opacity-70"
                            }`}
                          >
                            {/* Slot Header */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                                {slotInfo.icon}
                                {slotInfo.label}
                              </span>
                              {equippedItemName && (
                                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  rarity === "legendary"
                                    ? "bg-amber-950 text-amber-300"
                                    : rarity === "epic"
                                      ? "bg-purple-950 text-purple-300"
                                      : rarity === "deluxe"
                                        ? "bg-blue-950 text-blue-300"
                                        : "bg-slate-800 text-slate-400"
                                }`}>
                                  {rarity}
                                </span>
                              )}
                            </div>

                            {/* Equipped Item Details */}
                            {equippedItemName ? (
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1">
                                  <h4 className={`text-xs font-black uppercase flex items-center gap-1.5 ${
                                    rarity === "legendary"
                                      ? "text-amber-400"
                                      : rarity === "epic"
                                        ? "text-purple-400"
                                        : rarity === "deluxe"
                                          ? "text-blue-400"
                                          : "text-slate-200"
                                  }`}>
                                    {getItemIcon(equippedItemName, slotInfo.key)}
                                    {equippedItemName}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 leading-normal font-sans">{itemDetails?.desc}</p>
                                  
                                  {/* Stats */}
                                  {itemDetails?.stats && Object.keys(itemDetails.stats).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(itemDetails.stats).map(([st, val]) => (
                                        <span key={st} className="text-[8px] font-bold bg-slate-950/60 border border-white/5 px-1 rounded text-cyan-400">
                                          {st === "meleeAtk" ? "⚔️ Melee" : st === "rangeAtk" ? "🔫 Ranged" : st === "maxHp" ? "❤️ HP" : st === "maxMana" ? "⚡ Mana" : st === "startingShields" ? "🛡️ Shields" : st.toUpperCase()}: +{val}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Special FX */}
                                  {itemDetails?.specialEffect && (
                                    <p className="text-rose-400 text-[8.5px] mt-1 italic flex items-center gap-1">
                                      <Sparkles size={10} />
                                      <span><strong>Effect:</strong> {itemDetails.specialEffect}</span>
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleUnequipCompanionItem(companion.name, slotInfo.key)}
                                  className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/20 hover:border-rose-400 text-rose-300 hover:text-white rounded text-[9px] transition-all font-black uppercase cursor-pointer shrink-0"
                                >
                                  Unequip
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9.5px] text-slate-500 italic">No gear equipped in this slot integration.</p>
                            )}

                            {/* Equip Dropdown list alternative (Direct Buttons to Equip) */}
                            {compatibleItems.length > 0 && (
                              <div className="mt-1 pt-2 border-t border-white/5 space-y-1">
                                <span className="text-[8.5px] text-slate-400 uppercase font-black block">Swap with Stash hardware:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {compatibleItems.map((item, idx) => {
                                    const details = ITEM_METADATA[item];
                                    const iRarity = details?.rarity || "common";
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => handleEquipCompanionItem(companion.name, slotInfo.key, item)}
                                        className={`px-2 py-1 text-[8.5px] font-extrabold uppercase rounded border transition-all cursor-pointer flex items-center gap-1 ${
                                          iRarity === "legendary"
                                            ? "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40"
                                            : iRarity === "epic"
                                              ? "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/40"
                                              : iRarity === "deluxe"
                                                ? "bg-blue-950/40 border-blue-500/30 text-blue-300 hover:bg-blue-900/40"
                                                : "bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-750"
                                        }`}
                                      >
                                        {getItemIcon(item, slotInfo.key)}
                                        <span>Equip {item}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500 uppercase">Equipped stat bonuses apply instantly to companion battles</span>
                    <button
                      onClick={() => setEditingCompanionName(null)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-950 to-slate-900 hover:from-purple-900 hover:to-purple-950 border border-purple-500/30 hover:border-purple-400 text-purple-400 font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                    >
                      CLOSE COMPANION SHELL
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Base Crew Management Screen (NPC Interaction Hub) */}
        {baseNPCManagerOpen && gameState && (
          <NPCBaseManagement
            isOpen={baseNPCManagerOpen}
            onClose={() => setBaseNPCManagerOpen(false)}
            gameState={gameState}
            setGameState={setGameState}
            triggerToast={triggerToast}
          />
        )}

        {/* Cyber-Lab Clinic Modal */}
        {cyberLabOpen && gameState && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 font-mono overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 p-6 border-b border-cyan-500/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔌</span>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-wider uppercase">AURUS SAFEHOUSE: CHROMIUM CLINIC</h3>
                    <p className="text-xs text-cyan-400">AUTHORIZED RIPPER-DOC WORKSTATION v4.8</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-3xs text-slate-500 uppercase font-bold">LIQUID CREDITS:</span>
                  <span className="text-cyan-400 font-black text-sm">{gameState.credits}¤</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-white/5">
                  Welcome to the safehouse Cyber-Lab. Here, you can splice military-grade neural chips and dermal reinforcements directly into your bio-structure. Cyberware stats integrate with combat triggers automatically.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      id: "Sub-dermal Armor",
                      name: "Sub-dermal Carapace Armor",
                      desc: "Splices flexible graphene plates into your skin layers. Permanently increases Max HP by +30, and automatically absorbs -5 kinetic/melee damage from enemy counter-strikes.",
                      cost: 120,
                      badge: "🛡️ STRUCTURAL",
                      badgeColor: "text-emerald-400 bg-emerald-950/50 border-emerald-500/30",
                      benefits: "+30 Max HP, Passive -5 Damage Mitigation"
                    },
                    {
                      id: "Neural Reflex-Boosters",
                      name: "Neural Reflex-Boosters",
                      desc: "Accelerates synaptic conductivity along your peripheral nervous system. Grants +2 DEX, and adds a passive +20% chance to completely evade enemy attacks in combat.",
                      cost: 100,
                      badge: "⚡ NEURAL SPEED",
                      badgeColor: "text-amber-400 bg-amber-950/50 border-amber-500/30",
                      benefits: "+2 DEX, 20% Evasion Strike Protection"
                    },
                    {
                      id: "Optical HUDs",
                      name: "Multi-Spectrum Optical HUD",
                      desc: "Overlays tactical battlefield projections over your primary retinas. Grants +2 INT, and adds a passive +25% chance to trigger CRITICAL OVERDRIVE! on physical, spell, or hack attacks, dealing +50% extra damage.",
                      cost: 80,
                      badge: "👁️ RETINAL SENSORS",
                      badgeColor: "text-purple-400 bg-purple-950/50 border-purple-500/30",
                      benefits: "+2 INT, +25% Critical Overdrive Chance"
                    }
                  ].map((cyber) => {
                    const isInstalled = gameState.installedCyberware?.includes(cyber.id);
                    const canAfford = gameState.credits >= cyber.cost;

                    const handleInstall = () => {
                      if (isInstalled) return;
                      if (!canAfford) {
                        triggerToast("INSUFFICIENT FUNDS: Need more Credits!");
                        return;
                      }

                      let nextState = { ...gameState };
                      nextState.credits -= cyber.cost;
                      if (!nextState.installedCyberware) {
                        nextState.installedCyberware = [];
                      }
                      nextState.installedCyberware.push(cyber.id);

                      // Apply permanent stat boosts
                      if (cyber.id === "Sub-dermal Armor") {
                        nextState.maxHp += 30;
                        nextState.hp += 30;
                      } else if (cyber.id === "Neural Reflex-Boosters") {
                        if (nextState.attributes) {
                          nextState.attributes.dex = (nextState.attributes.dex || 10) + 2;
                        }
                      } else if (cyber.id === "Optical HUDs") {
                        if (nextState.attributes) {
                          nextState.attributes.int = (nextState.attributes.int || 10) + 2;
                        }
                      }

                      setGameState(nextState);
                      triggerToast(`CYBERWARE INSTALLED: ${cyber.name} synchronized successfully!`);
                      
                      // Append log
                      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      setLogs(prev => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          timestamp: timeString,
                          text: `🔌 RIPPER-DOC SUCCESS: Installed ${cyber.name}. Credits deducted: -${cyber.cost}¤. Permanent benefits applied: ${cyber.benefits}.`,
                          type: "system",
                          district: nextState.district,
                          poi: nextState.poi
                        }
                      ]);
                    };

                    return (
                      <div key={cyber.id} className="p-4 bg-slate-950/60 rounded-xl border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cyber.badgeColor}`}>{cyber.badge}</span>
                            {isInstalled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-950 text-emerald-400">INSTALLED</span>
                            )}
                          </div>
                          <h4 className="text-white font-bold uppercase text-sm">{cyber.name}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">{cyber.desc}</p>
                          <div className="text-3xs text-cyan-400 uppercase font-black">BENEFIT: {cyber.benefits}</div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                          <div className="text-right">
                            <span className="text-3xs text-slate-500 uppercase block">PRICE</span>
                            <span className="text-white font-extrabold text-sm font-mono">{cyber.cost}¤</span>
                          </div>

                          <button
                            disabled={isInstalled}
                            onClick={handleInstall}
                            className={`px-4 py-2 rounded-lg font-bold uppercase text-2xs tracking-wider transition-all cursor-pointer w-full md:w-auto text-center ${
                              isInstalled
                                ? "bg-slate-800 border border-white/5 text-slate-500 cursor-not-allowed"
                                : canAfford
                                  ? "bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                                  : "bg-red-950/20 border border-red-500/20 text-red-400 cursor-not-allowed hover:bg-red-950/30"
                            }`}
                          >
                            {isInstalled ? "CHROMED" : canAfford ? "INSTALL CHROME" : "LACK CREDITS"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-950/40 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setCyberLabOpen(false)}
                  className="px-5 py-2.5 bg-slate-950 border border-rose-500/30 hover:bg-rose-950/60 hover:border-rose-400 text-rose-300 font-bold uppercase rounded-lg tracking-wider text-xs transition-all cursor-pointer"
                >
                  DISCONNECT CLINIC CORE
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Gear Modding Terminal Modal */}
        {gearModdingOpen && gameState && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 font-mono overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 p-6 border-b border-purple-500/20 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛠️</span>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-wider uppercase">AURUS SAFEHOUSE: GEAR MOD WORKBENCH</h3>
                    <p className="text-xs text-purple-400">TACTICAL ELEMENTAL INFUSION CALIBRATOR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-3xs text-slate-500 uppercase font-bold">LIQUID CREDITS:</span>
                  <span className="text-purple-400 font-black text-sm">{gameState.credits}¤</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-white/5">
                  Welcome to the Gear Modding workstation. Select any melee or ranged weapon in your loadout, then toggle between purchasing elemental infusions or utilizing raw salvage materials to craft advanced enhancements.
                </p>

                {/* Workbench Tab Selection */}
                <div className="flex border-b border-purple-500/20 bg-slate-950/50 p-1.5 rounded-xl border border-white/5">
                  <button
                    onClick={() => setWorkbenchTab("infusion")}
                    className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer flex items-center justify-center gap-2 ${
                      workbenchTab === "infusion"
                        ? "bg-purple-950/60 border border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                        : "border border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🔌 ELEMENTAL INFUSIONS (CREDITS)
                  </button>
                  <button
                    onClick={() => setWorkbenchTab("crafting")}
                    className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer flex items-center justify-center gap-2 ${
                      workbenchTab === "crafting"
                        ? "bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                        : "border border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🛠️ SCRAP CRAFTING (ASSEMBLY)
                  </button>
                </div>

                {/* Grid Layout: Select Weapon / Select Mod or Craft */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Weapon Selection */}
                  <div className="space-y-3">
                    <span className="text-slate-400 text-3xs uppercase font-black tracking-widest border-b border-white/10 pb-2 block">
                      1. SELECT WEAPON TO CALIBRATE
                    </span>
                    
                    {(() => {
                      const equippedMelee = gameState.equipment?.meleeWeapon;
                      const equippedRanged = gameState.equipment?.rangedWeapon;
                      
                      const inventoryWeapons = (gameState.inventory || []).filter(item => {
                        const l = item.toLowerCase();
                        return l.includes("blade") || l.includes("pistol") || l.includes("katana") || l.includes("smg") || l.includes("baton") || l.includes("slicer") || l.includes("focus");
                      });

                      const allWeapons = Array.from(new Set([
                        ...(equippedMelee ? [equippedMelee] : []),
                        ...(equippedRanged ? [equippedRanged] : []),
                        ...inventoryWeapons
                      ]));

                      if (allWeapons.length === 0) {
                        return (
                          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-lg text-slate-500 text-xs text-center italic">
                            No weapons detected in active loadout or inventory. Go find or purchase a weapon first!
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {allWeapons.map((wpn) => {
                            const isEquipped = wpn === equippedMelee || wpn === equippedRanged;
                            const isSelected = selectedWeaponForModding === wpn;
                            const activeMod = gameState.weaponMods?.[wpn];

                            return (
                              <button
                                key={wpn}
                                onClick={() => setSelectedWeaponForModding(wpn)}
                                className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition-all flex flex-col gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-950/40 border-purple-500/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                                    : "bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/15"
                                }`}
                              >
                                <div className="flex justify-between items-center w-full font-mono">
                                  <span className="font-extrabold text-cyan-400 text-2xs uppercase truncate">{wpn}</span>
                                  <div className="flex items-center gap-1.5">
                                    {isEquipped && (
                                      <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-bold">EQUIPPED</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-3xs mt-1 font-mono">
                                  <span className="text-slate-500">INFUSION MOD:</span>
                                  {activeMod ? (
                                    <span className={`font-black uppercase flex items-center gap-1 ${
                                      activeMod === "Toxic Vials" ? "text-emerald-400" :
                                      activeMod === "Bio-Shocks" ? "text-amber-400" :
                                      activeMod === "Plasma Heat Coil" ? "text-rose-400" :
                                      activeMod === "Cryo-Fluid Injector" ? "text-cyan-400" :
                                      activeMod === "Nano-Laser Sight" ? "text-red-400" : "text-purple-400"
                                    }`}>
                                      {activeMod === "Toxic Vials" ? "🧪 Toxic Vials" :
                                       activeMod === "Bio-Shocks" ? "⚡ Bio-Shocks" :
                                       activeMod === "Plasma Heat Coil" ? "🔥 Plasma Heat" :
                                       activeMod === "Cryo-Fluid Injector" ? "❄️ Cryo Injector" :
                                       activeMod === "Nano-Laser Sight" ? "🎯 Nano Laser" : "🌐 EMP Chamber"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 italic">None</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Column: Tab-Dependent Content */}
                  {workbenchTab === "infusion" ? (
                    /* Infusion Selection Column */
                    <div className="space-y-3">
                      <span className="text-slate-400 text-3xs uppercase font-black tracking-widest border-b border-white/10 pb-2 block">
                        2. SELECT INFUSION ATTACHMENT
                      </span>

                      {!selectedWeaponForModding ? (
                        <div className="p-6 bg-slate-950/40 border border-white/5 rounded-lg text-slate-500 text-xs text-center italic h-full flex items-center justify-center">
                          Please select a weapon on the left to calibrate modifications.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {[
                            {
                              id: "Toxic Vials",
                              name: "🧪 Bio-Toxic Vials",
                              desc: "Injects concentrated acidic neurotoxin into the striking core or ammunition feed.",
                              vulnerability: "VULNERABILITY EXPLOIT: Corporate Officers, Enforcers, and Organic Bosses take +25 Acid Damage (Normal enemies take +12).",
                              cost: 60,
                              icon: "🧪",
                              color: "hover:border-emerald-500/40 hover:bg-emerald-950/10 text-emerald-400 border-emerald-500/10 bg-emerald-950/20"
                            },
                            {
                              id: "Bio-Shocks",
                              name: "⚡ Bio-Electric Shock Capacitor",
                              desc: "Wires direct electrical micro-surges across physical impact and muzzle surfaces.",
                              vulnerability: "VULNERABILITY EXPLOIT: Mutants, Sludge Beasts, and Rust-Claw Orcs take +25 Shock Damage (Normal enemies take +12).",
                              cost: 60,
                              icon: "⚡",
                              color: "hover:border-amber-500/40 hover:bg-amber-950/10 text-amber-400 border-amber-500/10 bg-amber-950/20"
                            },
                            {
                              id: "Electromagnetic Chambers",
                              name: "🌐 Electromagnetic EMP Chamber",
                              desc: "Mounts high-capacity EMP generators directly into the firing/striking core.",
                              vulnerability: "VULNERABILITY EXPLOIT: Autonomous Security Drones, Sentinels, and Robotic Mechs take +25 EMP Damage (Normal enemies take +12).",
                              cost: 60,
                              icon: "🌐",
                              color: "hover:border-purple-500/40 hover:bg-purple-950/10 text-purple-400 border-purple-500/10 bg-purple-950/20"
                            }
                          ].map((mod) => {
                            const isCurrentlyApplied = gameState.weaponMods?.[selectedWeaponForModding] === mod.id;
                            const canAfford = gameState.credits >= mod.cost;

                            const handleApplyMod = () => {
                              if (!canAfford) {
                                triggerToast("INSUFFICIENT FUNDS: Elemental modules cost 60¤!");
                                    return;
                                  }

                                  let nextState = { ...gameState };
                                  nextState.credits -= mod.cost;
                                  if (!nextState.weaponMods) {
                                    nextState.weaponMods = {};
                                  }
                                  nextState.weaponMods[selectedWeaponForModding] = mod.id;

                                  setGameState(nextState);
                                  triggerToast(`MODIFICATION INSTALLED: ${selectedWeaponForModding} infused with ${mod.id}!`);

                                  // Append log
                                  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                  setLogs(prev => [
                                    ...prev,
                                    {
                                      id: crypto.randomUUID(),
                                      timestamp: timeString,
                                      text: `🛠️ WEAPON CALIBRATED: Mounted [${mod.id}] elemental attachment onto ${selectedWeaponForModding}. Deducted: -${mod.cost}¤.`,
                                      type: "system",
                                      district: nextState.district,
                                      poi: nextState.poi
                                    }
                                  ]);
                                };

                                return (
                                  <div 
                                    key={mod.id} 
                                    className={`p-3.5 rounded-xl border font-mono flex flex-col gap-2 transition-all ${
                                      isCurrentlyApplied 
                                        ? "border-purple-500/50 bg-purple-950/30 text-white" 
                                        : mod.color
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <span className="font-extrabold uppercase text-xs flex items-center gap-1.5">{mod.name}</span>
                                      {isCurrentlyApplied && (
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40 bg-purple-950 text-purple-300 animate-pulse">ACTIVE INFUSION</span>
                                      )}
                                    </div>
                                    
                                    <p className="text-3xs text-slate-400 leading-normal font-sans">{mod.desc}</p>
                                    <p className="text-[10px] text-purple-300 font-bold font-sans bg-purple-950/50 p-2 rounded border border-purple-500/20">{mod.vulnerability}</p>

                                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
                                      <span className="text-3xs text-slate-500 uppercase">COST: <span className="text-white font-extrabold">{mod.cost}¤</span></span>
                                      
                                      <button
                                        disabled={isCurrentlyApplied}
                                        onClick={handleApplyMod}
                                        className={`px-3 py-1.5 rounded text-4xs uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                                          isCurrentlyApplied
                                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                                            : canAfford
                                              ? "bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 hover:border-purple-400 text-purple-200"
                                              : "bg-red-950/20 text-red-400 cursor-not-allowed border border-red-500/20"
                                        }`}
                                      >
                                        {isCurrentlyApplied ? "CALIBRATED" : canAfford ? "MOUNT MOD (-60¤)" : "LACK CREDITS"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                    </div>
                  ) : (
                    /* Scrap Crafting Column */
                    <div className="space-y-4">
                      <span className="text-cyan-400 text-3xs uppercase font-black tracking-widest border-b border-cyan-500/20 pb-2 block">
                        2. ASSEMBLY &amp; SALVAGE COMBINATOR
                      </span>
                      
                      {/* Selected Target Weapon Indicator */}
                      <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between">
                        <span className="text-3xs text-slate-500 font-bold uppercase font-mono">TARGET CHASSIS:</span>
                        {selectedWeaponForModding ? (
                          <span className="text-xs text-cyan-400 font-black uppercase font-mono">{selectedWeaponForModding}</span>
                        ) : (
                          <span className="text-3xs text-red-400 font-bold uppercase animate-pulse font-mono">⚠️ NO WEAPON SELECTED</span>
                        )}
                      </div>

                      {/* Inventory Scraps Balance */}
                      <div className="bg-slate-950/40 border border-cyan-500/10 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block font-mono">REQUIRED COMPONENTS</span>
                        
                        <div className="space-y-2 font-mono">
                          {/* Component 1 */}
                          <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🔩</span>
                              <div>
                                <span className="font-bold text-slate-300 block">High-Grade Scrap Salvage</span>
                                <span className="text-[9px] text-slate-500 leading-none">Premium carbon-reinforced alloy scrap</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xs text-slate-500">OWNED:</span>
                              <span className={`font-mono font-bold px-2 py-0.5 rounded text-2xs ${
                                (gameState.inventory || []).filter(i => i === "High-Grade Scrap Salvage").length >= 1
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                                  : "bg-red-950 text-red-400 border border-red-500/20"
                              }`}>
                                {(gameState.inventory || []).filter(i => i === "High-Grade Scrap Salvage").length} / 1
                              </span>
                            </div>
                          </div>

                          {/* Component 2 */}
                          <div className="flex items-center justify-between text-xs pb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base">📟</span>
                              <div>
                                <span className="font-bold text-slate-300 block">Rusted Circuitry</span>
                                <span className="text-[9px] text-slate-500 leading-none">Scavenged copper-clad micro-cores</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xs text-slate-500">OWNED:</span>
                              <span className={`font-mono font-bold px-2 py-0.5 rounded text-2xs ${
                                (gameState.inventory || []).filter(i => i === "Rusted Circuitry").length >= 1
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                                  : "bg-red-950 text-red-400 border border-red-500/20"
                              }`}>
                                {(gameState.inventory || []).filter(i => i === "Rusted Circuitry").length} / 1
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Craft Button */}
                      {(() => {
                        const scrapCount = (gameState.inventory || []).filter(i => i === "High-Grade Scrap Salvage").length;
                        const circuitryCount = (gameState.inventory || []).filter(i => i === "Rusted Circuitry").length;
                        const canAssemble = scrapCount >= 1 && circuitryCount >= 1 && selectedWeaponForModding;

                        return (
                          <button
                            onClick={handleCraftWeaponMod}
                            disabled={!canAssemble}
                            className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 font-mono ${
                              canAssemble
                                ? "bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500 hover:border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                                : "bg-slate-950/40 border-white/5 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <span>🔧 COMBINE &amp; ASSEMBLE TIER-1 MOD</span>
                            <span className="text-4xs text-slate-400 font-medium font-sans">Combines 1x of each scrap to synthesize a random mod</span>
                          </button>
                        );
                      })()}

                      {/* Loot Table Preview */}
                      <div className="p-3 bg-slate-950/30 border border-white/5 rounded-xl space-y-2 font-mono">
                        <span className="text-3xs text-slate-500 font-black block tracking-wider uppercase">ROLLABLE UPGRADES INDEX (TIER-1)</span>
                        <div className="grid grid-cols-2 gap-2 text-4xs leading-relaxed text-slate-400 font-sans">
                          <div className="flex items-center gap-1.5"><span className="text-[10px]">🧪</span> <strong className="text-emerald-400">Bio-Toxic Vials</strong></div>
                          <div className="flex items-center gap-1.5"><span className="text-[10px]">⚡</span> <strong className="text-amber-400">Shock Capacitor</strong></div>
                          <div className="flex items-center gap-1.5"><span className="text-[10px]">🌐</span> <strong className="text-purple-400">EMP Chamber</strong></div>
                          <div className="flex items-center gap-1.5"><span className="text-[10px]">🔥</span> <strong className="text-rose-400">Plasma Heat Coil</strong></div>
                          <div className="flex items-center gap-1.5"><span className="text-[10px]">❄️</span> <strong className="text-cyan-400">Cryo-Fluid Injector</strong></div>
                          <div className="flex items-center gap-1.5"><span className="text-[10px]">🎯</span> <strong className="text-red-400">Nano-Laser Sight</strong></div>
                        </div>
                      </div>

                      {/* Material Requisition Terminal */}
                      <div className="p-3.5 bg-slate-950/60 border border-cyan-500/10 rounded-xl space-y-2.5 font-mono">
                        <span className="text-3xs text-cyan-500 font-black block tracking-wider uppercase">🔌 MATERIAL REQUISITION TERMINAL</span>
                        <p className="text-4xs text-slate-500 leading-relaxed font-sans">
                          Need additional scrap components? Requisition raw materials directly from Sector 4 black market channels.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => buyCraftingMaterial("High-Grade Scrap Salvage", 50)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 text-slate-300 font-bold uppercase rounded text-4xs transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span>BUY SCRAP x1</span>
                            <span className="text-cyan-400 font-mono">-50¤</span>
                          </button>
                          <button
                            onClick={() => buyCraftingMaterial("Rusted Circuitry", 30)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 text-slate-300 font-bold uppercase rounded text-4xs transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span>BUY CIRCUITRY x1</span>
                            <span className="text-cyan-400 font-mono">-30¤</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-slate-950/40 border-t border-white/5 flex justify-end flex-shrink-0">
                <button
                  onClick={() => {
                    setGearModdingOpen(false);
                    setSelectedWeaponForModding(null);
                  }}
                  className="px-5 py-2.5 bg-slate-950 border border-rose-500/30 hover:bg-rose-950/60 hover:border-rose-400 text-rose-300 font-bold uppercase rounded-lg tracking-wider text-xs transition-all cursor-pointer"
                >
                  LOCK DOWN WORKBENCH
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </main>

      {/* GAME CONTROL MENU POPUP */}
      <AnimatePresence>
        {isGameMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              className="glass-panel max-w-xs sm:max-w-sm w-full rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_35px_rgba(0,0,0,0.85)] space-y-5 text-center font-mono relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsGameMenuOpen(false);
                  setShowMainMenuConfirm(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Game Name & Logo Header */}
              <div className="flex flex-col items-center gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Flame size={28} />
                </div>
                <div>
                  <h2 className="font-display font-black tracking-wider text-xl text-white uppercase leading-none">
                    NEON <span className="text-rose-500 tracking-tight font-light">&amp;</span> ETHER
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-sans">Tactical RPG Deck</p>
                </div>
              </div>

              {/* Menu Controls vs Confirmation Prompt */}
              {showMainMenuConfirm ? (
                <div className="space-y-3.5 pt-1 text-left animate-fadeIn">
                  <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>Confirm Exit to Main Menu</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                      Are you sure you want to return to the Main Menu? Any unsaved progress in your current session will be lost.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => {
                        setShowMainMenuConfirm(false);
                        setIsGameMenuOpen(false);
                        setCurrentScreen("menu");
                        triggerToast("SESSION ENDED: RETURNED TO MAIN MENU");
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 border border-rose-400 text-white py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-950/50 active:scale-95"
                    >
                      <FolderOpen size={14} />
                      <span>Yes, Return to Main Menu</span>
                    </button>

                    <button
                      onClick={() => setShowMainMenuConfirm(false)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={() => {
                      setIsGameMenuOpen(false);
                      setIsSaveDeckOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Save size={15} />
                    <span>Save / Load Game</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsGameMenuOpen(false);
                      setIsDevStudioOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-950/80 to-purple-950/80 border border-violet-500/40 hover:border-violet-400 text-violet-300 hover:text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Code size={15} />
                    <span>RPG Dev Studio</span>
                  </button>

                  <button
                    onClick={() => setShowMainMenuConfirm(true)}
                    className="w-full flex items-center justify-center gap-2.5 bg-slate-900/90 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <FolderOpen size={15} />
                    <span>Main Menu</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsGameMenuOpen(false);
                      setShowMainMenuConfirm(false);
                    }}
                    className="w-full py-2.5 bg-slate-950/60 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Resume Game
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Neural Save Deck Module */}
      <SaveManager
        isOpen={isSaveDeckOpen}
        onClose={() => {
          setIsSaveDeckOpen(false);
          // Sync hasSave when closing Save Deck
          const keys = [
            "neon_ether_state",
            "neon_ether_state_slot1",
            "neon_ether_state_slot2",
            "neon_ether_state_slot3",
            "neon_ether_state_autosave"
          ];
          const found = keys.some(k => localStorage.getItem(k) !== null);
          setHasSave(found);
        }}
        gameState={gameState}
        logs={logs}
        onLoadSave={(state, savedLogs) => {
          handleRestoreStateAndLogs(state, savedLogs);
        }}
        triggerToast={triggerToast}
      />

      {/* Developer Studio Suite Modal */}
      <DevStudioModal
        isOpen={isDevStudioOpen}
        onClose={() => setIsDevStudioOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        onLaunchEncounterInGame={(enc) => {
          if (currentScreen !== "game") {
            setCurrentScreen("game");
          }
          setActivePOIView(null);
          setActiveDialogue(null);
          setGameTab("exploration");
          
          const enemies = (enc.combatants || []).filter(c => c.faction === "enemy");
          const primaryEnemy = enemies[0] || {
            name: enc.name,
            hp: 120,
            maxHp: 120,
            shields: 20,
            maxShields: 20
          };
          const totalEnemyHp = enemies.length > 0
            ? enemies.reduce((sum, e) => sum + (e.hp || 50), 0)
            : 120;
          const totalEnemyMaxHp = enemies.length > 0
            ? enemies.reduce((sum, e) => sum + (e.maxHp || 50), 0)
            : 120;
          const totalEnemyShields = enemies.length > 0
            ? enemies.reduce((sum, e) => sum + (e.shields || 0), 0)
            : 20;

          setGameState(prev => {
            const next = {
              ...prev,
              district: enc.district || prev.district || "conduit09",
              combatState: {
                enemyName: enc.name || primaryEnemy.name,
                enemyHp: totalEnemyHp,
                enemyMaxHp: totalEnemyMaxHp,
                enemyShields: totalEnemyShields,
                enemyMaxShields: totalEnemyShields,
                isActive: true,
                turnLog: `⚔️ CUSTOM ENCOUNTER INITIALIZED: ${enc.name}\n${enc.description || "Hostile forces detected on tactical grid."}`
              }
            };
            return next;
          });

          setLogs(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `⚔️ CUSTOM TACTICAL ENCOUNTER: "${enc.name}" engaged in district [${enc.district || gameState.district || "conduit09"}].`,
              type: "combat",
              district: enc.district || gameState.district || "conduit09",
              poi: enc.name
            }
          ]);
          triggerToast(`COMBAT DEPLOYED: ${(enc.name || "Encounter").toUpperCase()}`);
        }}
        onTriggerLiveEvent={(evt) => {
          if (currentScreen !== "game") {
            setCurrentScreen("game");
          }
          const firstChoice = evt.choices?.[0];
          if (firstChoice) {
            setGameState(prev => {
              const next = { ...prev };
              if (firstChoice.rewardCredits) next.credits += firstChoice.rewardCredits;
              if (firstChoice.rewardXP) next.experience += firstChoice.rewardXP;
              if (firstChoice.rewardItem && !next.inventory.includes(firstChoice.rewardItem)) {
                next.inventory = [firstChoice.rewardItem, ...next.inventory];
              }
              return next;
            });
          }
          setActivePopup({
            title: `⚡ ${evt.title.toUpperCase()}`,
            subtitle: "DYNAMIC WORLD EVENT",
            type: "check_success",
            text: `${evt.narrativeText}\n\nOutcome: ${firstChoice?.successOutcomeText || "Event triggered successfully in world stream!"}`
          });
          triggerToast(`EVENT TRIGGERED: ${evt.title.toUpperCase()}`);
        }}
        triggerToast={triggerToast}
      />

    </div>
  );
}
