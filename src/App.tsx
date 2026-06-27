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
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { LogMessage, GameState, CompanionState } from "./types";
import {
  ARCHETYPES,
  SHOP_ITEMS,
  INITIAL_COMPANIONS,
  getInitialState,
  MAP_POIS,
  REGIONS,
  ENEMIES,
  MapPOI,
  Region
} from "./data";

export default function App() {
  // Screens: "menu" | "game" | "character_select"
  const [currentScreen, setCurrentScreen] = useState<"menu" | "game" | "character_select">("menu");
  
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom manual terminal commands
  const [customInput, setCustomInput] = useState("");
  
  // Tabs for inventory deck
  const [activeTab, setActiveTab] = useState<"inventory" | "companions" | "quests">("inventory");

  // Gameplay view screens inside game mode: "exploration" | "database"
  const [gameTab, setGameTab] = useState<"exploration" | "database">("exploration");

  // Toggle log expansion
  const [expandLogs, setExpandLogs] = useState(false);

  // Stash Filter for Inventory sorting
  const [stashFilter, setStashFilter] = useState<"all" | "weapons" | "cyberware" | "consumables" | "valuables">("all");

  // Active Companion opinion bubble
  const [companionOpinion, setCompanionOpinion] = useState<{ name: string; line: string } | null>(null);
  
  // Highlighting selected companion in roster
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionState | null>(null);
  
  // Detailed Map View: ID of POI the player is currently viewing close-up inside the map box. 
  // If null, the player is viewing the global Holographic Region Map.
  const [activePOIView, setActivePOIView] = useState<string | null>(null);
  
  // Region currently focused on the global Holographic Map
  const [activeRegionId, setActiveRegionId] = useState<string>("aurus");
  
  // Dialogue state: ID of active NPC dialogue ("jax" | "aria" | "morgana" | "recruiter" | null)
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  
  // Success toast indicators
  const [saveToast, setSaveToast] = useState<string | null>(null);
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
    color: string;
    range: number;
    damage: number;
    ap: number;
    maxAp: number;
    initiative: number;
    isDead: boolean;
    isCompanion?: boolean;
  }

  interface GridCombatState {
    combatants: GridCombatant[];
    turnOrder: string[];
    currentTurnIdx: number;
    selectedAction: "move" | "attack" | "spell" | "item" | null;
    turnLog: string;
  }

  const [gridCombat, setGridCombat] = useState<GridCombatState | null>(null);

  // Hex matching hacking mini-game state
  const [hackingPuzzle, setHackingPuzzle] = useState<{
    targets: { hex: string; matched: boolean }[];
    options: string[];
    selectedTargetIdx: number | null;
    status: "idle" | "playing" | "success" | "failure";
  } | null>(null);

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
      line: dialogueLine
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
    const pRange = archetype === "Cyber-Blade" ? 1 : 3;
    const pDmg = archetype === "Cyber-Blade" ? 22 : archetype === "Techno-Mage" ? 28 : 18;
    const pAvatar = archetype === "Cyber-Blade" ? "⚔️" : archetype === "Techno-Mage" ? "🔮" : "🔫";

    const combatants: GridCombatant[] = [
      {
        id: "player",
        name: `You (${archetype})`,
        team: "player",
        hp: gameState?.hp || 100,
        maxHp: gameState?.maxHp || 100,
        shields: 0,
        maxShields: 0,
        x: 1,
        y: 2,
        avatar: pAvatar,
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
        avatar: "🔫",
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
        avatar: "🔫",
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
            color: "border-stone-500 text-stone-400",
            range: 1,
            damage: 18,
            ap: 2,
            maxAp: 2,
            initiative: 8,
            isDead: false,
            isCompanion: true
          });
        }
      });
    }

    // Add primary enemy
    const isBoss = enemyName.includes("Behemoth") || enemyName.includes("Ares Prime") || enemyName.includes("Special Ops Commander");
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
      avatar: isBoss ? "👹" : enemyName.includes("Drone") ? "🤖" : "🕴️",
      color: "border-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
      range: isBoss ? 2 : enemyName.includes("Drone") ? 3 : 2,
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
        color: "border-red-400 text-red-400",
        range: isMech ? 3 : 2,
        damage: isMech ? 8 : 10,
        ap: 2,
        maxAp: 2,
        initiative: 11,
        isDead: false
      });
    }

    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
    const turnOrder = sorted.map(c => c.id);

    return {
      combatants,
      turnOrder,
      currentTurnIdx: 0,
      selectedAction: "move" as const,
      turnLog: `Tactical grid combat initialized. All units deployed. ${sorted[0].name} has the initiative!`
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

  // Check if save exists on load
  useEffect(() => {
    const savedState = localStorage.getItem("neon_ether_state");
    if (savedState) {
      setHasSave(true);
    }
  }, []);

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

  // Load from LocalStorage
  const handleLoadGame = () => {
    const savedState = localStorage.getItem("neon_ether_state");
    const savedLogs = localStorage.getItem("neon_ether_logs");
    if (savedState && savedLogs) {
      try {
        const parsedState = JSON.parse(savedState);
        // Clean migration of old state variables
        const isBlade = parsedState.archetype === "Cyber-Blade";
        const isMage = parsedState.archetype === "Techno-Mage";
        const migratedState: GameState = {
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
            mindmancer: 0
          },
          ...parsedState
        };
        setGameState(migratedState);
        setLogs(JSON.parse(savedLogs));
        setActiveRegionId(migratedState.district || "aurus");
        
        // If they were at a POI, open its detailed view
        const targetPOI = MAP_POIS.find(p => p.name === migratedState.poi);
        if (targetPOI) {
          setActivePOIView(targetPOI.id);
        }
        
        setCurrentScreen("game");
        triggerToast("VIRTUAL MEMORY STREAM RESTORED SUCCESS");
      } catch (e) {
        console.error("Failed to restore save game file", e);
        triggerToast("CRITICAL FAIL: CORRUPTED DATA DECK");
      }
    } else {
      triggerToast("FAILED: NO RESIDUAL CELL RECOVERY FILE FOUND");
    }
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

  // Wipe Save completely and return to main menu
  const handleRestartFull = () => {
    localStorage.removeItem("neon_ether_state");
    localStorage.removeItem("neon_ether_logs");
    setGameState(null);
    setLogs([]);
    setHasSave(false);
    setActivePOIView(null);
    setActiveDialogue(null);
    setCurrentScreen("menu");
    triggerToast("AGENT CONSPIRACY PURGED COMPLETELY");
  };

  // Helper alert notifier
  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);
  };

  // Deploy fresh agent from archetype select
  const handleDeployAgent = async () => {
    setIsLoading(true);
    const initial = getInitialState(selectedArchetype);
    
    const welcomeLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `DEPLOYED AGENT [${initial.archetype}] into Megacity-9 slums. Initial equipment established: ${initial.inventory.join(", ")}. Primary credits balance: ${initial.credits}¤.\n\nYour organic cybernetic cortex aligns with sol-prime parameters. The neon glow hums underneath your heels.\n\nSelect districts on the overland map to scan. Enter POIs to trigger local interaction consoles.`,
      type: "system",
      district: initial.district,
      poi: initial.poi
    };

    setLogs([welcomeLog]);
    setGameState(initial);
    setActiveRegionId("conduit09");
    setActivePOIView("ventilation_shaft"); // Start initialized right inside the Ventilation Shaft detailed view!
    setCurrentScreen("game");
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
    
    // Auto-travel to the first POI in that region to maintain visual cohesion
    const firstPOI = MAP_POIS.find(p => p.district === regionId);
    let nextState = { ...gameState };
    
    if (firstPOI) {
      nextState.district = regionId;
      nextState.poi = firstPOI.name;
      setActivePOIView(firstPOI.id);
    }
    
    setActiveRegionId(regionId);
    setGameState(nextState);

    const log: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: timeString,
      text: `[TRANSIT CHANNEL OPEN]: Deployed magnetic monorail to ${reg.name}. Scanning coordinates at local POI: ${firstPOI ? firstPOI.name : "Highwalks"}...`,
      type: "system",
      district: regionId,
      poi: firstPOI ? firstPOI.name : "Transit Node"
    };
    setLogs(prev => [...prev, log]);
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
    let narrative = "";
    let logType: LogMessage["type"] = "narration";

    const cleanAction = actionText.toLowerCase();

    // ---- REGION SWITCH TRANSLATION PASS ----
    if (cleanAction.includes("switch region:") || cleanAction.includes("switch region")) {
      setIsLoading(false);
      if (cleanAction.includes("docks")) handleSwitchRegion("docks");
      else if (cleanAction.includes("downtown")) handleSwitchRegion("downtown");
      else if (cleanAction.includes("satoshi")) handleSwitchRegion("satoshi");
      else if (cleanAction.includes("aurus")) handleSwitchRegion("aurus");
      return;
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

        narrative = `⚔️ STRIKE RETALIATED: You flash your blade into ${combat.enemyName}! Dealt ${pDmg} physical damage.`;
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
          combat.enemyHp -= mDmg;
          narrative = `🔮 ETHER DISCHARGE: Cast Spell Slash on ${combat.enemyName}! Dealt ${mDmg} armor-bypassing magic damage. (-15 Mana)`;
        }
      }
      else if (cleanAction.includes("cyber hack") || cleanAction.includes(" ransomware") || cleanAction.includes("hack")) {
        let hDmg = Math.floor(Math.random() * 8) + 12; 
        if (nextState.inventory.includes("Smart-Targeting Visor")) {
          hDmg += 8;
        }
        combat.enemyHp -= hDmg;
        narrative = `💾 NODE OVERLOAD: You inject a system-overload ransomware trigger! Dealt ${hDmg} neuro-bypass damage directly.`;
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
          setGameState(nextState);
          setLogs(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              timestamp: timeString,
              text: `🏃 ESCAPE DEPLOYED: You deploy active cloaking mesh and successfully broke contact back to security.`,
              type: "narration",
              district: nextState.district,
              poi: nextState.poi
            }
          ]);
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

        // Check Prologue map transitions on combat victory
        if (combat.enemyName.includes("Security Drones") || combat.enemyName.includes("Autonomous Security Drones")) {
          nextState.district = "data_vault";
          nextState.poi = "Sanctuary Hacking Terminal";
          setActiveRegionId("data_vault");
          setActivePOIView("terminal_hacking_puzzle");
          nextState.activeQuests = ["Prologue: Data Vault Sanctuary - Hack the cyber-vault terminal to steal corporate data crystals from Ares Biotech."];
          narrative += `\n\n🛡️ SECURITY BYPASSED: The final security drone sparks and explodes! Vice gestures to a heavy floor industrial lift elevator: 'Move, recruit! Before they lock down the entire sector! Get inside the core vault chamber.' You travel to the Data Vault Sanctuary.`;
        }
        else if (combat.enemyName.includes("Corporate Enforcers") || combat.enemyName.includes("Ambush")) {
          nextState.poi = "Mysterious Relic Altar";
          setActivePOIView("relic_altar");
          setActiveDialogue("post_combat_tracker");
          nextState.activeQuests = ["Prologue: Choose the fate of the dying Tracker and escape to Aurus District Safe-house."];
          narrative += `\n\n🛡️ AMBUSH SURVIVED: The last corporate enforcer drops. Tracker lies on the bloody steel floor, breathing his final heavy breaths. Vice, wounded and leaning against the altar, gasps: 'That traitor... he was about to sell us out. Check his belt.'\n\nYou retrieve a decrypted datapad proving Tracker was under contract to assassinate you and Vice once the data was secured! Choose Tracker's fate above.`;
        }

        // Check Quest item collection
        if (combat.enemyName === "Toxic Sludge Behemoth" && nextState.activeQuests.some(q => q.includes("Corporate Hunt"))) {
          nextState.inventory.push("Acid Beast Core");
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Corporate Hunt"));
          nextState.activeQuests.push("Objective: Deliver the 'Acid Beast Core' to Chancellor Aria at Apex Armory.");
          narrative += "\n\n🎒 OBJECTIVE COLLECTED: Dislodged the rare green pulsating 'Acid Beast Core'. Advance to Chancellor Aria to deliver the asset.";
        }

        // Level Up
        if (nextState.experience >= 100) {
          nextState.level += 1;
          nextState.experience -= 100;
          nextState.maxHp += 20;
          nextState.maxMana += 15;
          nextState.hp = nextState.maxHp;
          nextState.mana = nextState.maxMana;
          narrative += `\n\n📶 SYSTEM LEVEL EXPANDED: Congratulations! Ascended to Level ${nextState.level}. Max health and mana stats fully restored!`;
        }

        nextState.combatState = null;
        logType = "system";
      } else {
        // Enemy Counter-Attacks
        const eDmg = Math.floor(Math.random() * 11) + 12; // 12-22
        nextState.hp -= eDmg;
        narrative += `\n\n⚠️ HOSTILE REACTION: ${combat.enemyName} strikes back, dealing ${eDmg} kinetic damage to your armor.`;

        if (nextState.hp <= 0) {
          if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
            // PROLOGUE GAME OVER / RETRY
            nextState.hp = nextState.maxHp;
            nextState.mana = nextState.maxMana;
            nextState.combatState = null;
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
      
      // Rest at base
      if (cleanAction.includes("rest & recover") || cleanAction.includes("rest and sleep")) {
        nextState.hp = nextState.maxHp;
        nextState.mana = nextState.maxMana;
        nextState.timeOfDay = "Morning";
        nextState.day += 1;
        
        let passiveText = "";
        let totalWage = 0;
        nextState.companions.forEach(c => {
          if (c.status === "working") totalWage += 35;
        });
        if (totalWage > 0) {
          nextState.credits += totalWage;
          passiveText = `\n\n💎 CREW HARVEST DECK: Allocated hackers delivered automated credits payout: +${totalWage}¤.`;
        }

        narrative = `💤 REST PROTOCOLS COMPLETE: Rested on safehouse medical bunk. Cybernetic channels completely drained and fully calibrated to 100% capacity.${passiveText}`;
      }
      
      // ---- PROLOGUE MAP 1: SUBSURFACE AI CATACOMBS (CONDUIT 09) ----
      
      // Ventilation Shaft
      else if (cleanAction.includes("slip through vent")) {
        const dex = nextState.attributes?.dex || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + dex;
        if (roll >= 23) {
          nextState.experience += 25;
          narrative = `🎯 DEX CHECK SUCCESS (Roll: ${roll} vs 23): You calibrate your speed servos perfectly, sliding through the spinning blades during the sub-second frequency lull! Vice whispers: 'Damn, kid. Clean slip.' Earned +25 XP.`;
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
        } else {
          const dmg = 20;
          nextState.hp = Math.max(10, nextState.hp - dmg);
          nextState.experience += 10;
          setVentFailed(true);
          narrative = `⚠️ DEX CHECK FAILURE (Roll: ${roll} vs 23): The heavy spinning fan blade strikes your back chassis! Sparks fly as you are pinned inside the duct. Dealt ${dmg} kinetic damage. Alarms begin to beep softly! You are STUCK in the ventilation shaft. You must choose an emergency override response immediately before security arrives.`;
        }
      }
      else if (cleanAction.includes("force fan blades (str check)") || cleanAction.includes("force fan")) {
        const str = nextState.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + str;
        if (roll >= 15) {
          narrative = `💥 STR CHECK SUCCESS (Roll: ${roll} vs 15): With a guttural growl, you wrench the auxiliary hydraulic shaft. The massive blades halt with a screeching metallic tear! You scramble through, but the noise was immense! Alarm beacons begin to spin.`;
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          
          // Trigger alarm combat!
          nextState.combatState = {
            enemyName: "Ares Sentry Drone (Alerted)",
            enemyHp: 40,
            enemyMaxHp: 40,
            enemyShields: 10,
            enemyMaxShields: 10,
            isActive: true,
            turnLog: "The screeching fan tear has alerted the nearby sector! A rapid sentry drone deploys from the ceiling vents with guns hot!"
          };
        } else {
          narrative = `❌ STR CHECK FAILURE (Roll: ${roll} vs 15): You attempt to force the rotor, but the titanium alloy is too rigid! The blades spin faster, tearing into your cybernetics for 15 damage and sounding the sector alarms! Sentry units are converging!`;
          nextState.hp = Math.max(10, nextState.hp - 15);
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          
          nextState.combatState = {
            enemyName: "Ares Security Drone (Group Ambush)",
            enemyHp: 50,
            enemyMaxHp: 50,
            enemyShields: 15,
            enemyMaxShields: 15,
            isActive: true,
            turnLog: "Alarms are blaring! You fall out of the ventilation shaft right in front of an alerted security patrol!"
          };
        }
      }
      else if (cleanAction.includes("trigger emp burst") || cleanAction.includes("emp explosion")) {
        narrative = `⚡ LOUD EMP EXPLOSION: You override your cyberdeck battery, releasing a raw, unstable EMP blast! The ventilation fan sparks violently and explodes in a shower of blue fire. You are thrown forward into the Security Sub-Terminal, taking 10 damage from the shockwave. The blast has completely fried the sector's grid, sounding emergency sirens!`;
        nextState.hp = Math.max(10, nextState.hp - 10);
        nextState.poi = "Security Sub-Terminal";
        setActivePOIView("security_terminal");
        setVentFailed(false);
        
        nextState.combatState = {
          enemyName: "Alerted Patrol Guard (EMP Intercept)",
          enemyHp: 45,
          enemyMaxHp: 45,
          enemyShields: 10,
          enemyMaxShields: 10,
          isActive: true,
          turnLog: "The EMP explosion blacked out the corridor! Alerted patrol guards breach the entrance with sub-machine railguns flashing!"
        };
      }
      else if (cleanAction.includes("hack fan console (int check)") || cleanAction.includes("hack fan")) {
        const intVal = nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + intVal;
        if (roll >= 16) {
          narrative = `💾 INT CHECK SUCCESS (Roll: ${roll} vs 16): You patch your neural link directly into the exposed fan relay. Executing a quiet loop-bypass script, the heavy blades spin down to a complete, silent halt. You slide through safely. Vice pats your shoulder: 'Smart hack, rookie.'`;
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
        } else {
          narrative = `⚠️ INT CHECK FAILURE (Roll: ${roll} vs 16): Your override script causes a short circuit! A small pop sounds, and the fan controller starts burning. You take 10 kinetic damage, and the sparks alert a security drone!`;
          nextState.hp = Math.max(10, nextState.hp - 10);
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          
          nextState.combatState = {
            enemyName: "Ares Sentry Drone (Short-Circuit Alert)",
            enemyHp: 40,
            enemyMaxHp: 40,
            enemyShields: 5,
            enemyMaxShields: 5,
            isActive: true,
            turnLog: "The burning fan controller sounds a local short-circuit alarm! A patrol drone hovers down to investigate!"
          };
        }
      }
      else if (nextState.district === "conduit09" && (cleanAction.includes("talk to vice") || cleanAction.includes("talk to tracker") || cleanAction.includes("banter"))) {
        narrative = `💬 AMBIENT CONDUIT FEED:
- Vice: 'We're looking for server node 09-D. Keep your head on a swivel. If Tracker's decryption is off, we'll be fighting our way out.'
- Tracker: 'My keys are flawless. Just focus on prying any heavy bulkheads we find, recruit.'`;
      }

      // Security Sub-Terminal
      else if (cleanAction.includes("bypass sub-terminal")) {
        const intVal = nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + intVal;
        if (roll >= 23) {
          nextState.experience += 25;
          nextState.inventory.push("Rusted Circuitry");
          narrative = `🎯 INT CHECK SUCCESS (Roll: ${roll} vs 23): You slice the alarm sub-grid gracefully, rendering the outer perimeter completely blind! You salvage a piece of valuable 'Rusted Circuitry' copper scrap from the motherboard. Tracker grunts: 'Efficient work.' Earned +25 XP.`;
          nextState.poi = "Heavy Blast Door";
          setActivePOIView("blast_door");
        } else {
          nextState.mana = Math.max(0, nextState.mana - 15);
          nextState.experience += 10;
          narrative = `⚠️ INT CHECK FAILURE (Roll: ${roll} vs 23): An electrostatic firewall feedback discharges directly into your deck! Your mana flow drops by -15. But you force an emergency override to clear the block. Earned +10 XP.`;
          nextState.poi = "Heavy Blast Door";
          setActivePOIView("blast_door");
        }
      }
      else if (cleanAction.includes("search terminal wreckage")) {
        if (Math.random() > 0.4) {
          nextState.inventory.push("Rusted Circuitry");
          narrative = "🔍 SCAVENGE SUCCESS: You unscrew the auxiliary panel and slide out a piece of copper 'Rusted Circuitry' scrap! This can be recycled at the Apex Armory.";
        } else {
          narrative = "🔍 SCAVENGE EMPTY: The sub-terminal circuits are completely charred and useless.";
        }
      }

      // Heavy Blast Door
      else if (cleanAction.includes("pry open valve") || cleanAction.includes("pry open door")) {
        const strVal = nextState.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + strVal;
        if (roll >= 23) {
          nextState.experience += 25;
          narrative = `🎯 STR CHECK SUCCESS (Roll: ${roll} vs 23): You grip the mechanical hydraulic valve and twist it with raw hydraulic force! The massive titanium doors hiss open. Vice nods: 'Whoa. Mind your power limits, brute!' Earned +25 XP.`;
          nextState.poi = "Next Section Gate (Transit)";
          setActivePOIView("section_gate");
        } else {
          const dmg = 10;
          nextState.hp = Math.max(10, nextState.hp - dmg);
          nextState.experience += 10;
          narrative = `⚠️ STR CHECK FAILURE (Roll: ${roll} vs 23): Your hydraulic servos scream under the strain! You suffer ${dmg} points of internal system fatigue. Tracker steps up and uses his manual heavy cutter to melt the latch. Earned +10 XP.`;
          nextState.poi = "Next Section Gate (Transit)";
          setActivePOIView("section_gate");
        }
      }

      // Next Section Gate (Transit to Map 2)
      else if (cleanAction.includes("proceed to shatter-ridge core")) {
        nextState.district = "shatter_ridge_core";
        nextState.poi = "Core Array Shatter-Ridge";
        setActiveRegionId("shatter_ridge_core");
        setActivePOIView("main_array_core");
        nextState.activeQuests = ["Prologue: Core Array Shatter-Ridge - Defend Tracker while he bypasses the primary mainframe lock."];
        narrative = "🚀 TRANSITING SECTION: You climb through the heavy gate and seal it behind you. A huge cavernous hangar of the Core Array Shatter-Ridge stretches ahead. The glowing blue crystals hum loudly.";
      }

      // ---- PROLOGUE MAP 2: SHATTER-RIDGE CORE ----
      else if (cleanAction.includes("defend core array") || cleanAction.includes("triggers combat")) {
        nextState.combatState = {
          enemyName: "3x Autonomous Security Drones",
          enemyHp: 130,
          enemyMaxHp: 130,
          enemyShields: 30,
          enemyMaxShields: 30,
          isActive: true,
          turnLog: "Three floating discs with revolving red sensors descend from the grid ceiling, hum-charging their laser cannons!"
        };
        narrative = "💥 COMBAT INITIATED: The automated security network is fully alert! Secure the perimeter and destroy the security drones!";
        logType = "combat";
      }

      // ---- PROLOGUE MAP 3: DATA VAULT SANCTUARY ----
      else if (cleanAction.includes("activate mysterious relic")) {
        // Debuff player: reduce max HP by 25, set mana to highly unstable
        nextState.maxHp = Math.max(50, nextState.maxHp - 25);
        nextState.hp = Math.min(nextState.hp, nextState.maxHp);
        
        // Mid-Battle Ability Unlock: Grant the player 2 absolute Mindmancer spells
        if (nextState.skills) {
          nextState.skills.mindmancer = 1; // Unlock Mindmancer spells
        }
        
        // Spawn Ambush Encounter: Ares Corporate Enforcers
        nextState.combatState = {
          enemyName: "Ares Corporate Enforcers (Ambush)",
          enemyHp: 160,
          enemyMaxHp: 160,
          enemyShields: 20,
          enemyMaxShields: 20,
          isActive: true,
          turnLog: "A heavy security breach blast door explodes! Ares Corporate Enforcers flood the sanctuary with automatic laser rifles! Tracker is struck by a lethal shot! Vice is heavily wounded!"
        };
        
        narrative = "💥 ALARM SIGNAL DETECTED: The moment you touch the floating golden relic, a massive psychic feedback shockwave rips into your neural pathways, reducing your maximum vitals! Your eyes spark with purple energy... the MINDMANCER powers have awakened inside your cortex! Mid-Battle spells unlocked: Mind Hack and Neural Overload!\n\nSuddenly, the vault walls detonate. Ares Corporate Enforcers ambush you!";
        logType = "combat";
      }

      // Check Inventory Stash
      else if (cleanAction.includes("check stash") || cleanAction.includes("stash inventory")) {
        narrative = `🎒 STORAGE AUDIT: Current items stored in physical slots: ${nextState.inventory.length > 0 ? nextState.inventory.join(", ") : "None"}. Balance liquidity: ${nextState.credits}¤.`;
      }

      // Bar Dialog Jax / Talk Jax
      else if (cleanAction.includes("talk to agent jax") || cleanAction.includes("agent jax")) {
        setActiveDialogue("jax");
        narrative = "You initiate secure transmission layer with Agent Jax.";
        setIsLoading(false);
        return;
      }

      // Order synthetic drink
      else if (cleanAction.includes("order spell-enhanced cocktail") || cleanAction.includes("cocktail") || cleanAction.includes("drink")) {
        if (nextState.credits >= 10) {
          nextState.credits -= 10;
          nextState.mana = Math.min(nextState.maxMana, nextState.mana + 30);
          narrative = "🍸 ORDER DISPENSED: Slipped a glowing magenta synth-cocktail. Bio-ether levels recharged (+30 Mana)!";
        } else {
          narrative = "❌ INSUFFICIENT LIQUIDITY: The bartender spits on the floor. 'Get some real currency.'";
        }
      }

      // Eavesdrop on thugs
      else if (cleanAction.includes("eavesdrop")) {
        narrative = "📻 AUDIOWALL HACKED: Overheard conversation feeds:\n- 'Aria at Apex showroom is distributing heavy weapons if you clear out water monsters in the Docks Region...'\n- 'Jax is in a serious pick, the outpatient team got ambushed Downtown inside Shatter Ridge...'";
      }

      // Search Booths
      else if (cleanAction.includes("search booths") || cleanAction.includes("trash scrap")) {
        if (Math.random() > 0.4) {
          nextState.inventory.push("Rusted Circuitry");
          narrative = "🔍 SCAVENGE SUCCESS: Pulled a functional copper piece of 'Rusted Circuitry' scrap from behind leather benches! Sell this at Apex Armory.";
        } else {
          narrative = "🔍 SCAVENGE EMPTY: Only sticky chemical residue and empty drug cylinders detected.";
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
        } else {
          narrative = "⚠️ recycler refused: No 'Rusted Circuitry' detected under active equipment list.";
        }
      }

      // Buy shop items
      else if (cleanAction.includes("purchase advanced") || cleanAction.includes("purchase item") || cleanAction.includes("gear")) {
        narrative = "🛒 ELECTRONIC CATALOG OPENED: Select your purchase directly from the physical equipment panels inside the Docks/Aurus terminal slots below!";
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

        if (nextState.activeQuests.some(q => q.includes("Syndicate Catalyst"))) {
          nextState.inventory.push("Charged Ley-Matrix");
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Syndicate Catalyst"));
          nextState.activeQuests.push("Objective: Return 'Charged Ley-Matrix' to High Priestess Morgana in Satoshi Square Coven.");
          narrative += "\n\n🎒 OBJECTIVE COLLECTED: The black cube hums and glows with volatile violet plasma! 'Charged Ley-Matrix' obtained.";
        }
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
          if (!nextState.inventory.includes("Technical Signal Core") && nextState.activeQuests.some(q => q.includes("Outcast Directive"))) {
            nextState.inventory.push("Technical Signal Core");
            nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Outcast Directive"));
            nextState.activeQuests.push("Objective: Deliver the 'Technical Signal Core' to Agent Jax at the Neon Abyss Bar.");
            narrative = "★ SEARCH DISCOVERY: You hack open a locked container inside the creaking highwalk elevator shafts! Got quest item: 'Technical Signal Core'. Deliver this back to Agent Jax.";
          } else {
            nextState.inventory.push("Nano Med-Stim (Heal)");
            narrative = "🔍 SCAVENGE SUCCESS: Salvaged an unused corporate medical stimpack ('Nano Med-Stim (Heal)') from an empty highwalk crate!";
          }
        } else {
          narrative = "🔍 SCAVENGE FAILURE: Ground sensors show only heavy iron oxide sludge and metallic scrap dust.";
        }
      }

      // Sludge Conduits combat (Wetlands / sewer replacement)
      else if (cleanAction.includes("hunt toxic swamp") || cleanAction.includes("hunt toxic") || cleanAction.includes("sludge crawler")) {
        const templates = ENEMIES.sludge_conduits;
        let roll = templates[0]; // Crawler
        
        // Spawn boss if quest is active and not finished
        if (nextState.activeQuests.some(q => q.includes("Sludge Behemoth") || q.includes("Corporate Hunt"))) {
          roll = templates[1]; // Behemoth Boss!
        }

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

      // Standard default exploration narrative
      else {
        const tickLogMsg = advanceTimeAndProgressJobs(nextState);
        narrative = `Refreshed tracking data channels at ${nextState.poi}. Atmospheric pollution levels high. Static wind currents. Net connection offline.${tickLogMsg}`;
      }
    }

    setGameState(nextState);
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: narrative,
        type: logType,
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
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

  // Sell scrap helper
  const handleRecycleScrapDirect = () => {
    handleExecuteAction("Sell circuitry scrap for credits.");
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans flex flex-col antialiased relative selection:bg-rose-500 selection:text-white p-0 m-0 overflow-x-hidden">
      
      {/* Background Ambient Glowing Orbs - Frosted Glass Aesthetics */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-[550px] h-[550px] rounded-full bg-rose-500/10 blur-[150px] animate-pulse-slow" />
        <div className="absolute top-[50%] left-[60%] w-[350px] h-[350px] rounded-full bg-violet-600/5 blur-[120px] animate-pulse-slow" />
        
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-x-0 top-0 h-full opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* HEADER BAR */}
      <div className="z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 md:px-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1">
              <Sparkles size={11} /> CORE OFFLINE SANDBOX ENGINE
            </span>
            <h1 className="font-display font-extrabold tracking-wider text-xl text-white uppercase leading-none mt-0.5">
              NEON <span className="text-rose-500 tracking-tight font-light">&amp;</span> ETHER
            </h1>
          </div>
        </div>

        {/* Global Notifications and Save Operations */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {gameState && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveGame}
                className="bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all font-mono text-4xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              >
                <Save size={12} /> Save Matrix
              </button>
              <button
                onClick={handleRestartFull}
                className="bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 transition-all font-mono text-4xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider cursor-pointer"
              >
                Reset Module
              </button>
            </div>
          )}
          <span className="h-5 w-px bg-white/10 hidden sm:inline" />
          <div className="bg-slate-900/60 border border-white/5 text-slate-300 px-3 py-1.5 rounded-md flex items-center gap-2 text-[11px]">
            <Activity size={13} className="text-cyan-400 animate-pulse" />
            <span>GRID DECK:</span>
            <span className="text-cyan-400 font-bold block">STANDALONE</span>
          </div>
        </div>
      </div>

      {/* SAVE TOAST POPUP */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-md border border-cyan-500/30 bg-slate-950/90 text-cyan-400 font-mono text-xs flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 z-10 transition-all justify-center">

        <AnimatePresence mode="wait">
          
          {/* ==============================================
              SCREEN 1: GAMEPLAY MAIN MENU
             ============================================== */}
          {currentScreen === "menu" && (
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-xl mx-auto w-full glass-panel-heavy rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative p-8 text-center flex flex-col gap-8 box-glow-cyan"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold glow-cyan block mb-2">
                  CYBERNETIC COGNITIVE MODULE v3.3
                </span>
                <h2 className="font-display font-black text-4xl text-white tracking-widest uppercase">
                  NEON <span className="text-rose-500">&amp;</span> ETHER
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-cyan-500 via-rose-500 to-transparent mx-auto my-4" />
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
                  Navigate high-magic technomancy and client-authoritative offline loops underneath Megacity-9. Connect with specialized operatives, fulfill corporate hunting licenses, and secure digital ley cores.
                </p>
              </div>

              {/* ACTION COMMAND DECKS */}
              <div className="flex flex-col gap-3 max-w-xs w-full mx-auto font-mono text-xs">
                <button
                  onClick={() => setCurrentScreen("character_select")}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold uppercase py-3 rounded-md transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <Plus size={15} /> Deploy New Agent
                </button>

                <button
                  onClick={handleLoadGame}
                  disabled={!hasSave}
                  className={`w-full border py-3 rounded-md transition-all flex items-center justify-center gap-2 uppercase font-semibold ${
                    hasSave
                      ? "bg-slate-900/60 hover:bg-slate-800/80 border-cyan-500/20 text-cyan-300 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.05)]"
                      : "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <Terminal size={14} /> Restore Session State
                </button>

                {hasSave && (
                  <button
                    onClick={handleRestartFull}
                    className="w-full bg-slate-950/30 hover:bg-rose-950/20 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 font-medium py-3.5 rounded-md transition-all cursor-pointer uppercase text-2xs tracking-widest block"
                  >
                    Wipe Stored Save Matrix
                  </button>
                )}
              </div>

              {/* Lower visual metadata indicators */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-[10px] font-mono text-slate-500">
                <div className="text-left">
                  <p className="font-bold text-slate-400 uppercase">LOCAL CLIENT STORAGE:</p>
                  <p>{hasSave ? "✓ RESTORATION SECTOR LOCKED" : "∅ VACANT MODULE COMPONENT"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-400 uppercase">OFFLINE ENGINE STATED:</p>
                  <p className="text-cyan-400">STATUS.STABLE_READY</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==============================================
              SCREEN 2: ARCHETYPE PORTRAIT SELECTOR
             ============================================== */}
          {currentScreen === "character_select" && (
            <motion.div
              key="character-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative p-6 md:p-8 gap-6"
            >
              {/* Back button to main menu */}
              <button
                onClick={() => setCurrentScreen("menu")}
                className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-mono border border-white/5 px-2 py-1 rounded bg-slate-900/60 transition-all cursor-pointer"
              >
                <ArrowLeft size={13} /> Back to Terminal
              </button>

              <div className="md:col-span-5 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col justify-between mt-8 md:mt-0">
                <div>
                  <span className="font-mono text-3xs uppercase tracking-[0.2em] text-cyan-400 font-black block mb-2">[SELECTION PROFILE]</span>
                  <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-wider leading-none">
                    OPERATIVE FILE
                  </h3>
                  <div className="w-10 h-0.5 bg-cyan-400 my-3" />
                  
                  <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-sans">
                    <p>
                      Before establishing neural uplink to Megacity-9 slums, select your database file record profile. Each sector profile injects customized credits and combat resources.
                    </p>
                    <div className="border border-white/10 bg-white/5 p-3 rounded-md font-mono text-[10px] text-slate-300">
                      "Each neural file begins at level 1 with automated base parameters inside the Aurus Safehouse District."
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[10px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-cyan-400" /> Complete Offline Sandbox Loop
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-cyan-400" /> Immersive Detailed POI View
                  </p>
                </div>
              </div>

              {/* Specializations selectors */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="font-mono text-3xs uppercase tracking-[0.15em] text-cyan-400 block font-bold">[COGNITIVE ARCHETYPES LIST]</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {ARCHETYPES.map((arch) => (
                      <button
                        key={arch.name}
                        onClick={() => setSelectedArchetype(arch)}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          selectedArchetype.name === arch.name
                            ? "bg-gradient-to-r from-cyan-950/30 to-rose-950/10 border-cyan-400/80 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            : "bg-slate-900/40 border-white/5 text-slate-300 hover:border-white/20 hover:bg-slate-900/60"
                        }`}
                      >
                        <div>
                          <p className="font-display font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                            {arch.name}
                            {selectedArchetype.name === arch.name && <Sparkles size={11} className="text-cyan-400 animate-spin" />}
                          </p>
                          <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-1">{arch.description}</p>
                        </div>
                        <ChevronRight size={16} className={selectedArchetype.name === arch.name ? "text-cyan-400" : "text-slate-500"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Bio Metric Board */}
                <div className="bg-slate-950/80 border border-white/10 p-4 rounded-xl flex flex-col gap-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">SYSTEM SPECIALTY</span>
                    <span className="text-[10px] font-black tracking-wide text-rose-400">{selectedArchetype.specialty}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center leading-none">
                    <div className="bg-slate-900/80 border border-white/5 p-2 rounded-lg">
                      <Heart size={14} className="text-rose-500 mx-auto mb-1" />
                      <span className="text-[8px] text-slate-400 block uppercase">Max HP</span>
                      <span className="text-xs font-black text-rose-400 block mt-1">{selectedArchetype.maxHp} HP</span>
                    </div>
                    <div className="bg-slate-900/80 border border-white/5 p-2 rounded-lg">
                      <Zap size={14} className="text-cyan-400 mx-auto mb-1" />
                      <span className="text-[8px] text-slate-400 block uppercase">Max Ether</span>
                      <span className="text-xs font-black text-cyan-400 block mt-1">{selectedArchetype.maxMana} MP</span>
                    </div>
                    <div className="bg-slate-900/80 border border-white/5 p-2 rounded-lg">
                      <Coins size={14} className="text-amber-400 mx-auto mb-1" />
                      <span className="text-[8px] text-slate-400 block uppercase">Credits Cache</span>
                      <span className="text-xs font-black text-amber-400 block mt-1">{selectedArchetype.credits}¤</span>
                    </div>
                  </div>

                  <div className="text-[10px] bg-slate-900/20 p-2.5 rounded border border-white/5">
                    <span className="font-bold text-slate-200 block">INITIAL GEAR IN MATRIX:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedArchetype.startingEquipment.map((eq, i) => (
                        <span key={i} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[9px] border border-white/5">{eq}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit trigger button */}
                <button
                  onClick={handleDeployAgent}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 text-center font-display font-extrabold rounded-xl py-3.5 text-xs tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.99] uppercase flex items-center justify-center gap-2"
                >
                  <Play size={14} fill="currentColor" /> Initialize Neural Uplink
                </button>
              </div>
            </motion.div>
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
              className="flex flex-col gap-6 w-full animate-fadeIn"
            >
              {/* TACTICAL HUD SWITCH - IMMERSIVE MINIMALIST CONTROL PANEL */}
              <div className="flex border border-white/10 rounded-xl overflow-hidden bg-slate-950/40 backdrop-blur-md p-1.5 font-mono text-xs w-full max-w-xl mx-auto shadow-lg z-10 relative">
                <button
                  onClick={() => setGameTab("exploration")}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-extrabold tracking-wider ${
                    gameTab === "exploration"
                      ? "bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Compass size={13} className={gameTab === "exploration" ? "animate-spin-slow" : ""} />
                  Missions &amp; Map
                </button>
                <button
                  onClick={() => setGameTab("database")}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-extrabold tracking-wider ${
                    gameTab === "database"
                      ? "bg-gradient-to-r from-rose-950/60 to-rose-900/40 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                      : "text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Database size={13} />
                  Operative Database
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT COLUMN (12/12): MAIN CORE CONSOLE FEED, DETAILED SCENERY OR INTERACTION DECKS */}
              {gameTab === "exploration" && (
                <div className="lg:col-span-12 flex flex-col gap-6">

                {/* DOCK BAR STATUS GAUGES WITH HIGHEST VISUAL INTEGRITY */}
                <div className="glass-panel rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  
                  {/* District / Coordinate Node info with travel status indicator */}
                  <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-cyan-900/50 to-slate-900 border border-cyan-500/30 text-cyan-400 rounded-md">
                      <MapPin size={16} />
                    </div>
                    <div className="overflow-hidden font-mono text-left">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">COORDINATE</span>
                      <p className="text-[11px] font-bold text-white uppercase truncate mt-0.5">
                        {gameState.poi}
                      </p>
                      <span className="text-[9px] text-cyan-400 block uppercase truncate font-semibold">
                        {REGIONS.find(r => r.id === gameState.district)?.name || "Slums"}
                      </span>
                    </div>
                  </div>

                  {/* HP GAUGE RACK */}
                  <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1">
                      <span className="font-bold text-rose-400 flex items-center gap-1 uppercase">
                        <Heart size={11} className="text-rose-500" /> Vital Core
                      </span>
                      <span className="font-bold text-[#f5ebd5]">{gameState.hp} / {gameState.maxHp}</span>
                    </div>
                    
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                        style={{ width: `${Math.max(0, Math.min(100, (gameState.hp / gameState.maxHp) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase font-bold text-left leading-none">
                      {gameState.hp < 35 ? "STATUS: CRITICAL EXHAUSTION" : "CORES: OPTIMAL PARAMETER"}
                    </span>
                  </div>

                  {/* MP GAUGE RACK */}
                  <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1">
                      <span className="font-bold text-cyan-400 flex items-center gap-1 uppercase">
                        <Zap size={11} className="text-cyan-400" /> Ether Stream
                      </span>
                      <span className="font-bold text-[#f5ebd5]">{gameState.mana} / {gameState.maxMana}</span>
                    </div>
                    
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                        style={{ width: `${Math.max(0, Math.min(100, (gameState.mana / gameState.maxMana) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase font-bold text-left leading-none">
                      COGNITIVE CHIP CALIBRATED
                    </span>
                  </div>

                  {/* Credits & level widget details */}
                  <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex justify-between items-center">
                    <div className="text-left">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wider">BALANCE</span>
                      <p className="text-sm font-mono font-black text-amber-400 mt-0.5 leading-none">
                        {gameState.credits} <span className="text-[10px] font-normal text-slate-400">¤</span>
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">SKILLS NODE</span>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5 text-xs font-bold leading-none">
                        <span className="text-[#efe8d4]">LVL {gameState.level ?? 1}</span>
                        <span className="text-slate-500 text-[10px]">({gameState.experience ?? 0}/100)</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* THE HIGHEST CRAFTED CENTRAL SCREEN MAP OR POI BLUEPRINT SCENE */}
                <div className="glass-panel rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100 flex flex-col gap-4 box-glow-cyan">
                  
                  {/* Header Selector Switch for holographic routing */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Compass size={16} className="text-cyan-400" />
                      <span className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-100">
                        {activePOIView ? `DETAILED LOCAL SCANNER: ${gameState.poi}` : "HOLOGRAPHIC TRANSIT REGION INTERCEPT"}
                      </span>
                    </div>

                    {/* Regional Switch Panel on top of Holographic view */}
                    {!activePOIView && (
                      <div className="flex flex-wrap gap-1 font-mono text-3xs">
                        {REGIONS.map(r => {
                          const isPrologueRegion = ["conduit09", "shatter_ridge_core", "data_vault"].includes(r.id);
                          const currentIsPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                          const isDisabled = currentIsPrologue && !isPrologueRegion;
                          return (
                            <button
                              key={r.id}
                              onClick={() => {
                                if (isDisabled) {
                                  triggerToast("SYSTEM LOCKED: FINISH HEIST OBJECTIVE FIRST");
                                  return;
                                }
                                handleSwitchRegion(r.id);
                              }}
                              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                                activeRegionId === r.id
                                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                                  : isDisabled
                                    ? "bg-slate-950/20 text-slate-700 border-dashed border-white/5 cursor-not-allowed"
                                    : "bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-900/80 hover:text-white"
                              }`}
                            >
                              {isDisabled ? `🔒 ${r.name.split(" ")[0]}` : r.name.split(" ")[0]}
                            </button>
                          );
                        })}
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
                        className="relative bg-slate-950 border border-white/10 rounded-xl h-[280px] md:h-[320px] overflow-hidden shadow-inner flex flex-col items-center justify-center p-4 group"
                        id="holographic-tactical-map"
                      >
                        {/* Selected Region Background Map Imagery with Cyberpunk tint */}
                        <div className="absolute inset-0 z-0">
                          <img
                            src={REGIONS.find(r => r.id === activeRegionId)?.bgImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"}
                            alt="Cyberpunk Sector Grid"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-20 filter saturate-150 contrast-125 select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-transparent to-slate-950" />
                          
                          {/* Radial glowing core map layout decoration */}
                          <div className="absolute inset-x-0 top-0 h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        </div>

                        {/* Scan status tag overlay */}
                        <div className="absolute top-3 left-3 bg-slate-900/90 border border-white/10 px-2.5 py-1 rounded text-3xs font-mono text-slate-400 shadow flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          <span>SECTOR SCAN: {REGIONS.find(r => r.id === activeRegionId)?.name.toUpperCase()} ACCESSIBLE</span>
                        </div>

                        {/* Interactive District Pins Map Grid */}
                        <div className="absolute inset-x-0 h-full w-full max-w-2xl mx-auto z-10">
                          {MAP_POIS.filter(poi => poi.district === activeRegionId).map((p) => {
                            const isCurrentlyHere = gameState.poi === p.name;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  // Update game POI
                                  let nextState = { ...gameState };
                                  nextState.poi = p.name;
                                  nextState.district = p.district;
                                  setGameState(nextState);
                                  // Enter local POI Detailed View automatically!
                                  setActivePOIView(p.id);
                                  
                                  // Print log
                                  setLogs(prev => [
                                    ...prev,
                                    {
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                      text: `[TRANSIT COMMITTED]: Safe arrival coordinates established at "${p.name}". Initialized local area detail blueprint.`,
                                      type: "system",
                                      district: p.district,
                                      poi: p.name
                                    }
                                  ]);
                                }}
                                className="absolute transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-lg group/pin"
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                              >
                                {/* Blinker Node */}
                                <div className="relative flex items-center justify-center">
                                  <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-45 duration-1000 ${isCurrentlyHere ? "bg-cyan-400" : "bg-rose-500"}`} />
                                  <div
                                    className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 shadow-lg transition-all transform group-hover/pin:scale-135 ${
                                      isCurrentlyHere
                                        ? "bg-cyan-400 border-white shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                                        : p.type === "combat"
                                          ? "bg-rose-500 border-rose-950 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                                          : p.type === "shop"
                                            ? "bg-amber-400 border-amber-950"
                                            : "bg-slate-300 border-slate-900"
                                    }`}
                                  />
                                  
                                  {/* Holographic Tooltip above pin on hover */}
                                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950/95 border border-white/20 whitespace-nowrap px-2.5 py-1.5 rounded-md shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-all pointer-events-none scale-90 group-hover/pin:scale-100 z-50 text-left font-mono">
                                    <p className="text-2xs font-extrabold text-white flex items-center gap-1">
                                      <span className={`w-1 h-1 rounded-full ${isCurrentlyHere ? "bg-cyan-400" : "bg-slate-400"}`} />
                                      {p.name.toUpperCase()}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{p.type} node</p>
                                    {isCurrentlyHere && <p className="text-[8.5px] text-cyan-400 mt-0.5">✓ CURRENT COORDINATE</p>}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Fallback notification */}
                        <div className="absolute bottom-3 text-center text-4xs font-mono text-slate-500 uppercase tracking-widest pointer-events-none select-none z-10">
                          HOLOGRAPHIC SCAN RATIO 1.15.SCALE SECURE
                        </div>
                      </motion.div>
                    ) : (
                      
                      // VIEW B: IMAGES OF THE DETALED POI MAP SCANNER (THE LOCAL CLOSE-UP BLUEPRINT SCREEN!)
                      <motion.div
                        key="detailed-poi-view"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 min-h-[280px] md:min-h-[320px] shadow-[inset_0_0_30px_rgba(34,211,238,0.03)]"
                      >
                        {/* Left half: POI scenery illustration frame */}
                        <div className="md:col-span-5 flex flex-col justify-between relative rounded-lg overflow-hidden border border-white/10 group min-h-[140px]">
                          {/* Main Close-up Illustrated Photo of local environment */}
                          <img
                            src={MAP_POIS.find(p => p.id === activePOIView)?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"}
                            alt={gameState.poi}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover select-none filter brightness-90 saturate-125"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/80 z-10" />

                          {/* Scanner visual laser lines overlay */}
                          <div className="absolute inset-x-0 h-0.5 bg-cyan-400/30 blur-[2px] shadow-[0_0_10px_rgba(34,211,238,0.5)] top-[10%] animate-pulse z-10" />
                          <div className="absolute inset-x-0 top-0 h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] z-10" />

                          {/* Top Tag info inside image */}
                          <div className="p-2 z-10 flex justify-between items-center bg-slate-950/80 backdrop-blur-sm border-b border-white/5 uppercase font-mono text-[9px] text-slate-400">
                            <span>GRID LOCALITY FILE</span>
                            <span className="text-cyan-400">STATUS: VISITED</span>
                          </div>

                          {/* Lower scene metadata over image overlay */}
                          <div className="p-3 z-10 font-mono">
                            <span className="text-cyan-400 text-3xs tracking-wider uppercase font-extrabold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              NODE AREA SCAN
                            </span>
                            <p className="text-xs font-bold font-display text-white mt-1 uppercase">
                              {MAP_POIS.find(p => p.id === activePOIView)?.name.replace("Main Headquarters ", "")}
                            </p>
                          </div>
                        </div>

                        {/* Right half: Detailed text and local operational interaction terminal */}
                        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-3xs font-mono uppercase tracking-[0.15em] text-cyan-400 font-bold">
                              LOCAL DESCRIPTOR CONSOLE
                            </h4>
                            <p className="text-slate-300 text-xs font-sans leading-relaxed">
                              {MAP_POIS.find(p => p.id === activePOIView)?.description}
                            </p>
                          </div>

                          {/* Dynamic NPC Dialog or Scene Buttons depending on dialogue engagement */}
                          <div className="border-t border-white/5 pt-3">
                            {activeDialogue ? (
                              activeDialogue === "post_combat_tracker" ? (
                                <div className="bg-slate-950/95 border border-red-500/30 rounded-xl p-4 relative flex flex-col gap-3 font-mono shadow-xl">
                                  <div className="flex justify-between items-center border-b border-red-500/20 pb-2">
                                    <span className="text-red-500 font-extrabold text-[11px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                      <AlertTriangle size={14} /> Traitor's Judgment Scene
                                    </span>
                                    <span className="text-3xs text-slate-500">CONDUIT DATA SECURED</span>
                                  </div>
                                  
                                  <div className="flex gap-3 items-start">
                                    <img
                                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                                      alt="Tracker portrait"
                                      referrerPolicy="no-referrer"
                                      className="w-14 h-14 object-cover rounded-md border border-red-500/30 filter grayscale flex-shrink-0"
                                    />
                                    <div className="text-[10px] space-y-1 text-slate-300 flex-1">
                                      <p className="text-red-400 font-extrabold uppercase text-left">Tracker (Dying)</p>
                                      <p className="text-3xs text-slate-500 leading-none text-left">ROLE: Tactical Co-Supervisor (Traitor)</p>
                                      <p className="text-slate-300 font-sans text-2xs italic leading-relaxed pt-1 text-left">
                                        "cough... cough... You think... you won, rookie? Ares Biotech... owns Megacity-9. If you don't hand... the data... to them... you're both dead..."
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-slate-900/40 border border-white/5 p-2 rounded text-3xs text-slate-400 font-sans leading-relaxed text-left">
                                    Vice leans heavily against the altar, bleeding from a plasma burn: "The tracker pad lists Ares' direct assassination protocol. He was paid to wipe us after the data download. He's dying, but we can't leave witnesses. What are you going to do, rookie?"
                                  </div>

                                  {/* Post-combat choices */}
                                  <div className="flex flex-col sm:flex-row gap-2 pt-2 text-3xs uppercase justify-start">
                                    <button
                                      onClick={() => {
                                        let next = { ...gameState! };
                                        next.district = "aurus";
                                        next.poi = "Main Headquarters (The Hideout)";
                                        next.activeQuests = ["Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."];
                                        next.completedQuests.push("Traitors Get No Mercy (Killed Tracker)");
                                        setGameState(next);
                                        setActiveRegionId("aurus");
                                        setActivePOIView("hideout");
                                        setActiveDialogue(null);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: "💥 TRAITOR ELIMINATED: You double-tap Tracker with a clean round. There is no space for traitors in the slums. Carrying the heavy data crystal and helping the wounded Vice, you slip through the cooling vents as the alarm sirens begin blaring. After a grueling trek, you arrive at the Aurus District Safehouse. You split up to bypass scanners, and Vice has gone dark. Chapter 1 Begins.",
                                            type: "narration",
                                            district: "aurus",
                                            poi: "Main Headquarters (The Hideout)"
                                          }
                                        ]);
                                        triggerToast("CHAPTER 1 BEGUN: ARRIVED AT AUREUS DISTRICT");
                                      }}
                                      className="bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-200 font-bold px-3 py-2.5 rounded-lg cursor-pointer text-center"
                                    >
                                      [Double Tap] Kill Tracker
                                    </button>

                                    <button
                                      onClick={() => {
                                        let next = { ...gameState! };
                                        next.district = "aurus";
                                        next.poi = "Main Headquarters (The Hideout)";
                                        if (next.skills) {
                                          next.skills.mindmancer += 1;
                                        }
                                        next.activeQuests = ["Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."];
                                        next.completedQuests.push("Mind-Shattered Traitor (Subjugated Tracker)");
                                        setGameState(next);
                                        setActiveRegionId("aurus");
                                        setActivePOIView("hideout");
                                        setActiveDialogue(null);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: "🔮 TRACKER SUBJUGATED: Your eyes glow purple with newly awakened Mindmancer power! You reach into Tracker's dying cortex, rewriting his neurons. He overrides the emergency lockdown doors, wipes his own memory of your involvement, and collapses. You escape with the wounded Vice to the Aurus District Safehouse, your Mindmancer skill expanding. Chapter 1 Begins.",
                                            type: "narration",
                                            district: "aurus",
                                            poi: "Main Headquarters (The Hideout)"
                                          }
                                        ]);
                                        triggerToast("CHAPTER 1 BEGUN: MINDMANCER UNLOCKED (+1 Skill)");
                                      }}
                                      className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold px-3 py-2.5 rounded-lg cursor-pointer text-center animate-pulse"
                                    >
                                      [Mindmance] Subjugate Traitor
                                    </button>

                                    <button
                                      onClick={() => {
                                        let next = { ...gameState! };
                                        next.district = "aurus";
                                        next.poi = "Main Headquarters (The Hideout)";
                                        next.activeQuests = ["Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."];
                                        next.completedQuests.push("Pacified Traitor (Sedated Tracker)");
                                        setGameState(next);
                                        setActiveRegionId("aurus");
                                        setActivePOIView("hideout");
                                        setActiveDialogue(null);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: "💊 SEDATED & FLED: You inject a high-strength corporate medical sedative into Tracker, silencing his alerts, and quickly flee into the shadows with Vice before the tactical squad breaches. You lay low inside the Aurus District Safehouse. Chapter 1 Begins.",
                                            type: "narration",
                                            district: "aurus",
                                            poi: "Main Headquarters (The Hideout)"
                                          }
                                        ]);
                                        triggerToast("CHAPTER 1 BEGUN: ARRIVED AT AUREUS DISTRICT");
                                      }}
                                      className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold px-3 py-2.5 rounded-lg cursor-pointer text-center"
                                    >
                                      [Sedate] Inject Sedative & Flee
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-slate-900/60 border border-cyan-400/20 rounded-lg p-3 relative flex items-start gap-3">
                                {/* NPC small avatar */}
                                <img
                                  src={
                                    activeDialogue === "jax"
                                      ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                                      : activeDialogue === "aria"
                                        ? "/src/assets/images/npc_aria_portrait_1782169594302.jpg"
                                        : activeDialogue === "morgana"
                                          ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                                          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                                  }
                                  alt="NPC portrait"
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 object-cover rounded-md border border-white/15 shadow flex-shrink-0"
                                />

                                <div className="space-y-1 font-mono text-[11px] flex-1 text-left">
                                  <p className="text-cyan-400 font-bold uppercase leading-none">
                                    {activeDialogue === "jax" ? "Agent Jax" : activeDialogue === "aria" ? "Chancellor Aria" : activeDialogue === "morgana" ? "Priestess Morgana" : "Agent Vesper"}
                                  </p>
                                  <p className="text-[9px] text-slate-500 uppercase font-semibold">
                                    {activeDialogue === "jax" ? "Outcast Coordinator" : activeDialogue === "aria" ? "Corporative Representative" : activeDialogue === "morgana" ? "Coven Technomancer" : "Nexus Recruiter"}
                                  </p>
                                  <span className="h-px bg-white/5 block my-1" />
                                  <p className="text-slate-300 font-sans text-2xs leading-relaxed italic">
                                    {activeDialogue === "jax"
                                      ? gameState.inventory.includes("Technical Signal Core")
                                        ? "Amazing effort! You delivered the Technical Signal Core. I'm injecting 150¤ into your grid ledger and clearing active corporate tracking nodes."
                                        : gameState.completedQuests.some(q => q.includes("Outcast"))
                                          ? "Greetings, hero. Cyber-transmissions over Aurus slums are safe. You're written into outcast Union history."
                                          : "The tracking satellite signals are narrowing down. Traverse to Shatter Ridge Corridors in Downtown Region, seize that copper Technical Signal Core, and deliver it!"
                                      : activeDialogue === "aria"
                                        ? gameState.inventory.includes("Acid Beast Core")
                                          ? "Outstanding operation. The sewer lines are functioning beautifully. Here is your salary, and I have authorized an 'Apex Mantis electro-blade' inside stash storage."
                                          : gameState.completedQuests.some(q => q.includes("Corporate Hunt"))
                                            ? "The corporate board records your diagnostic work with high honor, mercenary. Keep doing business with Apex."
                                            : "A radioactive Mutant Sludge Behemoth is nesting in the Docks Sludge Conduits. Hunt it down, extract its chemical Acid Beast Core, and deliver it."
                                        : activeDialogue === "morgana"
                                          ? gameState.inventory.includes("Charged Ley-Matrix")
                                            ? "The bio-frequencies are secure. I will inject high-magic Ether calibrations directly into your cognitive deck. Maximum mana capacity raised!"
                                            : gameState.completedQuests.some(q => q.includes("Syndicate Catalyst"))
                                              ? "Your neural system is harmonized with the techno-magic flow, initiate. Walk in shadow."
                                              : "Take my uncharged server matrix, traverse to the Cyber-shrine Gardens in Satoshi Square Region, and Meditate with the tech core to charge the Ley-Matrix."
                                          : "Welcome to Nexus Agency. Elite field support Scythe (Ninja), Vex (Mage), and Brick (Orc) are waiting for hire. Choose below."
                                    }
                                  </p>

                                  {/* Branching Response Action Buttons inside Dialogue Overlay */}
                                  <div className="flex flex-wrap gap-1.5 pt-2.5">
                                    
                                    {/* Dialogue Accept/Complete action switches */}
                                    {activeDialogue === "jax" && !gameState.completedQuests.some(q => q.includes("Outcast")) && (
                                      gameState.inventory.includes("Technical Signal Core") ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.credits += 150;
                                            next.experience += 80;
                                            next.inventory = next.inventory.filter(i => i !== "Technical Signal Core");
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Technical Signal Core") && !q.includes("Outcast Directive"));
                                            next.completedQuests.push("Outcast Directive: Secured signal jammer core from waste-raiders.");
                                            setGameState(next);
                                            triggerToast("COMPLETED: OUTCAST DIRECTIVE (+150¤)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-cyan-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Deliver Signal Core (+150¤)
                                        </button>
                                      ) : !gameState.activeQuests.some(q => q.includes("Outcast")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Outcast Directive: Move to Shatter Ridge Corridors (Downtown Region) and secure the Technical Signal Core for Jax.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: OUTCAST DIRECTIVE");
                                          }}
                                          className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Accept Assignment
                                        </button>
                                      ) : null
                                    )}

                                    {activeDialogue === "aria" && !gameState.completedQuests.some(q => q.includes("Corporate Hunt")) && (
                                      gameState.inventory.includes("Acid Beast Core") ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.credits += 180;
                                            next.experience += 90;
                                            next.inventory = next.inventory.filter(i => i !== "Acid Beast Core");
                                            next.inventory.push("Apex Mantis electro-blade");
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Acid Beast Core"));
                                            next.completedQuests.push("Corporate Hunt: Collect mutant chemical core in Sewage.");
                                            setGameState(next);
                                            triggerToast("COMPLETED: CORPORATE HUNT (+180¤ +Apex Electro-Blade)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-cyan-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Deliver Acid Beast Core (+180¤)
                                        </button>
                                      ) : !gameState.activeQuests.some(q => q.includes("Corporate Hunt") || q.includes("Sludge Behemoth")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Corporate Hunt: Travel to Sludge Conduits (Docks Region) and engage the Toxic Sludge Behemoth to secure its Acid Beast Core.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: CORPORATE HUNT");
                                          }}
                                          className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Accept License
                                        </button>
                                      ) : null
                                    )}

                                    {activeDialogue === "morgana" && !gameState.completedQuests.some(q => q.includes("Syndicate Catalyst")) && (
                                      gameState.inventory.includes("Charged Ley-Matrix") ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.maxMana += 25;
                                            next.mana = next.maxMana;
                                            next.credits += 120;
                                            next.experience += 70;
                                            next.inventory = next.inventory.filter(i => i !== "Charged Ley-Matrix");
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Ley-Matrix") && !q.includes("Syndicate Catalyst"));
                                            next.completedQuests.push("Syndicate Catalyst: Meditated at Cyber Shi-Shrines.");
                                            setGameState(next);
                                            triggerToast("COMPLETED: COVEN Ley alignment (+120¤ +25 Max Mana)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-cyan-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Deliver Charged Matrix (+120¤)
                                        </button>
                                      ) : !gameState.activeQuests.some(q => q.includes("Syndicate Catalyst")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Syndicate Catalyst: Move to Satoshi Cyber-Shrine Gardens (Satoshi Square Region) and Meditate with the tech core to charge the matrix.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: COVEN SYNDICATE CATALYST");
                                          }}
                                          className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Accept Initiation
                                        </button>
                                      ) : null
                                    )}

                                    <button
                                      onClick={() => setActiveDialogue(null)}
                                      className="bg-slate-950 border border-white/15 text-slate-400 hover:text-white hover:bg-slate-900 px-2.5 py-1 rounded text-3xs uppercase cursor-pointer"
                                    >
                                      Goodbye / Farewell
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          ) : (
                              // Custom Mini-Game rendering for Sanctuary Hacking Terminal
                              activePOIView === "terminal_hacking_puzzle" ? (
                                <div className="bg-slate-950/95 border border-cyan-400/30 rounded-xl p-4 font-mono text-xs space-y-3 shadow-lg">
                                  <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                    <span className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase text-3xs tracking-widest">
                                      <Terminal size={14} className="text-cyan-400 animate-pulse" /> Cyberdeck Decryption Module v3.15
                                    </span>
                                    <span className="text-[9px] text-slate-500 uppercase">INT BUFFER RATIO: {gameState?.attributes?.int || 10}</span>
                                  </div>
                                  
                                  {(!hackingPuzzle || hackingPuzzle.status === "idle") ? (
                                    <div className="text-center py-4 space-y-3">
                                      <p className="text-slate-400 text-3xs leading-relaxed max-w-md mx-auto">
                                        The Ares Biotech cyber-vault terminal is protected by standard dual-stage hex encryption. Match the target registers to bypass the local alarms.
                                      </p>
                                      <button
                                        onClick={() => {
                                          setHackingPuzzle({
                                            targets: [
                                              { hex: "0x4F", matched: false },
                                              { hex: "0xE9", matched: false },
                                              { hex: "0xA2", matched: false },
                                              { hex: "0x7C", matched: false }
                                            ],
                                            options: ["0x3B", "0x4F", "0x1A", "0xE9", "0x8D", "0xA2", "0xD4", "0x7C"].sort(() => Math.random() - 0.5),
                                            selectedTargetIdx: null,
                                            status: "playing"
                                          });
                                        }}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded text-3xs uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                                      >
                                        Initialize Decryption Subroutines
                                      </button>
                                    </div>
                                  ) : hackingPuzzle.status === "playing" ? (
                                    <div className="space-y-4 py-1">
                                      <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold">
                                        {hackingPuzzle.selectedTargetIdx === null 
                                          ? "1. Select an encrypted register block below" 
                                          : "2. Click the matching hex key from the decryption pool"}
                                      </p>
                                      
                                      {/* Targets */}
                                      <div className="grid grid-cols-4 gap-2">
                                        {hackingPuzzle.targets.map((t, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => {
                                              if (t.matched) return;
                                              setHackingPuzzle(prev => prev ? { ...prev, selectedTargetIdx: idx } : null);
                                            }}
                                            className={`p-3 rounded-lg border font-bold text-center transition-all cursor-pointer flex flex-col justify-between items-center min-h-[55px] ${
                                              t.matched
                                                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] cursor-default"
                                                : hackingPuzzle.selectedTargetIdx === idx
                                                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                                  : "bg-slate-900 border-white/5 text-slate-300 hover:border-white/15"
                                            }`}
                                          >
                                            <span className="text-4xs text-slate-500 uppercase tracking-widest leading-none block mb-1">REG {idx + 1}</span>
                                            <span className="text-[11px] block">{t.matched ? "✓ OPENED" : t.hex}</span>
                                          </button>
                                        ))}
                                      </div>

                                      {/* Key Pool Options */}
                                      <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-3">
                                        {hackingPuzzle.options.map((opt, idx) => (
                                          <button
                                            key={idx}
                                            disabled={hackingPuzzle.selectedTargetIdx === null}
                                            onClick={() => {
                                              if (hackingPuzzle.selectedTargetIdx === null) return;
                                              const target = hackingPuzzle.targets[hackingPuzzle.selectedTargetIdx];
                                              if (target.hex === opt) {
                                                const newTargets = [...hackingPuzzle.targets];
                                                newTargets[hackingPuzzle.selectedTargetIdx] = { ...target, matched: true };
                                                
                                                const isFinished = newTargets.every(t => t.matched);
                                                setHackingPuzzle(prev => {
                                                  if (!prev) return null;
                                                  return {
                                                    ...prev,
                                                    targets: newTargets,
                                                    selectedTargetIdx: null,
                                                    status: isFinished ? "success" : "playing"
                                                  };
                                                });
                                                triggerToast("REGISTER UNLOCKED");
                                              } else {
                                                triggerToast("KEY MISMATCH - CYBER-DECK RETRYING");
                                                setHackingPuzzle(prev => prev ? { ...prev, selectedTargetIdx: null } : null);
                                              }
                                            }}
                                            className={`p-2.5 rounded border transition-all text-center text-[10px] ${
                                              hackingPuzzle.selectedTargetIdx === null
                                                ? "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
                                                : "bg-slate-900/80 border-cyan-500/15 text-slate-300 hover:bg-slate-850 hover:border-cyan-400/50 cursor-pointer"
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : hackingPuzzle.status === "success" ? (
                                    <div className="text-center py-4 space-y-3">
                                      <p className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                                        <CheckCircle size={14} /> SECURITY SCHEMAS DECRYPTED - FULL DOWNLOAD READY
                                      </p>
                                      <p className="text-slate-400 text-3xs leading-relaxed max-w-sm mx-auto">
                                        The corporate database has been successfully copied. The locking pins on the Golden Relic Chamber have completely retracted.
                                      </p>
                                      <button
                                        onClick={() => {
                                          let nextState = { ...gameState! };
                                          nextState.poi = "Mysterious Relic Altar";
                                          setActivePOIView("relic_altar");
                                          nextState.inventory.push("Ares Data Crystal");
                                          nextState.experience += 50;
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
                                          triggerToast("HACK COMPLETE: COPIED DATA");
                                        }}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded text-3xs uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                      >
                                        Extract Database & Access Relic
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                // Regular Location Action option rows
                                <div className="space-y-4">
                                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                                    {activePOIView === "ventilation_shaft" && ventFailed
                                      ? "⚠️ CRITICAL LOCKDOWN: AIRLOCK BLADES SECURED. RESOLVE FAILURE:"
                                      : "OPERATIONAL RESPONSES PREPARED AT LOCATION:"}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(activePOIView === "ventilation_shaft" && ventFailed
                                      ? ["Force Fan Blades (STR Check)", "Trigger EMP Burst (EMP Explosion!)", "Hack Fan Console (INT Check)"]
                                      : (MAP_POIS.find(p => p.id === activePOIView)?.buttons || [])
                                    ).map((action, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleExecuteAction(action)}
                                        className={`text-left px-3.5 py-2.5 rounded-lg border font-mono text-xs transition-all flex items-center justify-between cursor-pointer group ${
                                          activePOIView === "ventilation_shaft" && ventFailed
                                            ? "border-red-500/30 bg-red-950/40 hover:bg-red-900/50 hover:border-red-500/60 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                                            : "border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/30 text-white"
                                        }`}
                                      >
                                        <span className="truncate group-hover:text-cyan-300">{action}</span>
                                        <span className="text-[9px] text-slate-600 font-bold border border-white/5 px-1 rounded block flex-shrink-0 ml-2">
                                          {idx + 1}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <span className="h-px bg-white/5 block" />

                          {/* Escape back to standard district map travel */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-mono text-[9px] hidden sm:inline">COORD NODES ALIGNED</span>
                            <button
                              onClick={() => {
                                setActivePOIView(null);
                                setActiveDialogue(null);
                              }}
                              className="bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-950 font-mono text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 animate-pulse cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] ml-auto"
                            >
                              <ArrowLeft size={12} /> Return to Holographic Map
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* ADVANCED ELECTRONIC TACTICAL COMBAT HUD */}
                <AnimatePresence>
                  {gameState.combatState?.isActive && gridCombat && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-panel-heavy border-red-500/40 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col gap-5 box-glow-pink overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-rose-500/20 pb-3 gap-2">
                        <div>
                          <span className="font-display font-black text-base text-rose-400 flex items-center gap-2 uppercase tracking-wider animate-pulse">
                            <Sword size={18} className="text-rose-500" /> TACTICAL COMBAT SEQUENCE
                          </span>
                          <p className="text-4xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">GRID MATRIX ALPHA-9: SQUAD-BASED CONFLICT</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider font-extrabold">
                            CONFLICT BOUND
                          </span>
                        </div>
                      </div>

                      {/* Initiative Queue Timeline */}
                      <div className="bg-slate-950/60 border border-white/5 p-2 rounded-xl flex flex-col gap-1">
                        <span className="text-4xs font-mono text-slate-500 uppercase tracking-widest font-black text-left">Initiative Timeline Queue:</span>
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
                          {gridCombat.turnOrder.map((id, index) => {
                            const unit = gridCombat.combatants.find(c => c.id === id);
                            if (!unit || unit.isDead) return null;
                            const isActive = index === gridCombat.currentTurnIdx;
                            return (
                              <div
                                key={id}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-3xs font-mono transition-all duration-300 flex-shrink-0 ${
                                  isActive
                                    ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/20 animate-pulse scale-105"
                                    : unit.team === "player"
                                      ? "bg-slate-900/60 border-slate-700 text-slate-300"
                                      : "bg-red-950/30 border-red-900/50 text-red-300"
                                }`}
                              >
                                <span>{unit.avatar}</span>
                                <span className="font-bold truncate max-w-[80px]">{unit.name.split(" ")[0]}</span>
                                <span className="text-slate-500 text-4xs">({unit.initiative} INI)</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tactical Grid Map & Stats Bar */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* 8x6 Cyber Grid Container */}
                        <div className="lg:col-span-3 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-3xs font-mono text-slate-400 px-1">
                            <span className="flex items-center gap-1"><Compass size={10} className="text-cyan-400" /> TAP CELLS TO MOVE [RANGE 2] / ATTACK WITH MELEE OR GUNS</span>
                            <span>INTERIOR CORRIDOR ARRAY [8x6]</span>
                          </div>

                          {/* Render the Grid */}
                          <div className="grid grid-cols-8 gap-1.5 p-3 bg-slate-950/95 border border-slate-800/80 rounded-xl relative overflow-hidden box-glow-cyan select-none min-h-[220px] sm:min-h-[280px]">
                            {/* Grid Cell Loop */}
                            {Array.from({ length: 6 }).map((_, rIdx) =>
                              Array.from({ length: 8 }).map((__, cIdx) => {
                                const COMBAT_OBSTACLES = [[2, 1], [2, 4], [5, 2], [5, 3], [3, 0], [4, 5]];
                                const isObstacle = COMBAT_OBSTACLES.some(([ox, oy]) => ox === cIdx && oy === rIdx);
                                const unit = gridCombat.combatants.find(c => c.x === cIdx && c.y === rIdx && !c.isDead);
                                
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                const isPlayerTurn = activeActor?.team === "player";
                                
                                // Movement Reachability Calculation
                                let reachable = false;
                                if (isPlayerTurn && activeActor && activeActor.ap > 0 && !isObstacle && !unit && gridCombat.selectedAction === "move") {
                                  const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                  reachable = d > 0 && d <= 2;
                                }

                                // Targeting Calculation
                                let targetable = false;
                                if (isPlayerTurn && activeActor && activeActor.ap > 0 && unit && unit.team === "enemy" && gridCombat.selectedAction === "attack") {
                                  const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                  targetable = d <= activeActor.range;
                                }

                                return (
                                  <div
                                    key={`${cIdx}-${rIdx}`}
                                    onClick={() => {
                                      if (!isPlayerTurn || !activeActor) return;
                                      
                                      // Execute move
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

                                        // Sync player coordinates or state if it's the main player
                                        if (activeActor.id === "player" && gameState) {
                                          let ns = { ...gameState };
                                          setGameState(ns);
                                        }
                                        triggerToast("SECTOR MOVEMENT COMPLETE");
                                      }
                                      
                                      // Execute attack
                                      if (targetable && unit && gridCombat.selectedAction === "attack") {
                                        const rollDmg = activeActor.damage + Math.floor(Math.random() * 7) - 3;
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
                                        const enemyRemainingLog = hitEnemy?.isDead 
                                          ? `💥 ${hitEnemy.name} COMPROMISED: Systems overloaded and shattered!`
                                          : `🎯 Hit! ${hitEnemy?.name} sustained ${rollDmg} damage. Vitals: (${hitEnemy?.hp}/${hitEnemy?.maxHp} HP, ${hitEnemy?.shields} SHIELD).`;

                                        setGridCombat(prev => prev ? {
                                          ...prev,
                                          combatants: updated,
                                          turnLog: `⚔️ ATTACK REPORT: ${activeActor.name} engaged ${unit.name} with weapon array! ${enemyRemainingLog}`
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
                                    className={`relative rounded border aspect-square flex items-center justify-center transition-all ${
                                      isObstacle 
                                        ? "bg-stripes-warning border-slate-900 bg-slate-900/40 text-slate-600"
                                        : reachable
                                          ? "border-cyan-400 bg-cyan-950/40 cursor-pointer animate-pulse shadow-[inset_0_0_6px_rgba(34,211,238,0.3)] hover:bg-cyan-900/40"
                                          : targetable
                                            ? "border-rose-500 bg-rose-950/40 cursor-pointer animate-pulse shadow-[inset_0_0_6px_rgba(239,68,68,0.3)] hover:bg-rose-900/40"
                                            : "border-white/[0.03] bg-slate-900/30 hover:bg-slate-900/50"
                                    }`}
                                  >
                                    {/* Obstacle Icon */}
                                    {isObstacle && <span className="text-[10px] opacity-30 select-none">⚡</span>}

                                    {/* Coordinates Hover Label */}
                                    <span className="absolute bottom-0.5 right-0.5 text-[7px] text-slate-800 font-mono select-none">
                                      {cIdx},{rIdx}
                                    </span>

                                    {/* Reachable Dot */}
                                    {reachable && <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />}

                                    {/* Render Unit Token */}
                                    {unit && (
                                      <div
                                        className={`w-4/5 h-4/5 rounded-full border-2 flex flex-col items-center justify-center relative shadow-lg ${unit.color} ${
                                          unit.id === activeActor?.id ? "ring-2 ring-cyan-400 animate-pulse scale-105" : ""
                                        }`}
                                      >
                                        <span className="text-xs select-none">{unit.avatar}</span>
                                        
                                        {/* Simple Mini Health / Shield indicator */}
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-full max-w-[28px] h-1 bg-slate-950 rounded overflow-hidden flex">
                                          {unit.shields > 0 && (
                                            <div 
                                              className="bg-cyan-400 h-full" 
                                              style={{ width: `${(unit.shields / unit.maxShields) * 100}%` }} 
                                            />
                                          )}
                                          <div 
                                            className="bg-red-500 h-full flex-1" 
                                            style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} 
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Sidebar: Combatants Details list */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex flex-col gap-3 font-mono text-3xs">
                          <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10 pb-1.5 block">Tactical Roster:</span>
                          <div className="flex-1 space-y-2 max-h-[190px] lg:max-h-[250px] overflow-y-auto pr-1">
                            {gridCombat.combatants.map(c => {
                              if (c.isDead) return null;
                              return (
                                <div key={c.id} className="bg-slate-950/40 border border-white/[0.03] p-1.5 rounded flex justify-between items-center">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">{c.avatar}</span>
                                    <div>
                                      <p className="font-bold text-slate-300 leading-none">{c.name.split(" ")[0]}</p>
                                      <p className="text-[7px] text-slate-500 leading-none mt-0.5">X:{c.x}, Y:{c.y} • AP:{c.ap}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-red-400 leading-none">{c.hp}/{c.maxHp} HP</p>
                                    {c.shields > 0 && <p className="text-cyan-400 text-[7px] leading-none mt-0.5">{c.shields} SHLD</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick active combatant turn indicator */}
                          <div className="bg-slate-950 border border-cyan-500/20 p-2 rounded-lg text-left">
                            <span className="text-[8px] text-cyan-400 block uppercase font-bold leading-none mb-1">Acting Now:</span>
                            <span className="text-[10px] text-white font-extrabold block uppercase tracking-wide truncate">
                              {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[8px] text-slate-500 font-black">AP:</span>
                              <div className="flex gap-1">
                                {Array.from({ length: gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.maxAp || 2 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      idx < (gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.ap || 0)
                                        ? "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                                        : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Combat Status Feed Log */}
                      <div className="bg-slate-950 border border-rose-500/10 p-2.5 rounded-lg text-rose-300 font-mono text-[10px] text-center italic tracking-wider">
                        {gridCombat.turnLog}
                      </div>

                      {/* Controls Area */}
                      <div className="border-t border-white/5 pt-3 flex flex-col md:flex-row gap-3 items-center justify-between">
                        {/* Player / Companion Turn Controls */}
                        {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.team === "player" ? (
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                              onClick={() => {
                                setGridCombat(prev => prev ? { ...prev, selectedAction: "move" } : null);
                              }}
                              className={`flex-1 md:flex-initial font-mono font-black text-3xs px-4 py-3 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                gridCombat.selectedAction === "move"
                                  ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                  : "bg-slate-900 border-white/5 text-cyan-400 hover:bg-slate-800"
                              }`}
                            >
                              🚀 Move Position [AP: 1]
                            </button>
                            
                            <button
                              onClick={() => {
                                setGridCombat(prev => prev ? { ...prev, selectedAction: "attack" } : null);
                              }}
                              className={`flex-1 md:flex-initial font-mono font-black text-3xs px-4 py-3 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                gridCombat.selectedAction === "attack"
                                  ? "bg-rose-500 text-white border-rose-400 font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                  : "bg-slate-900 border-white/5 text-rose-400 hover:bg-slate-800"
                              }`}
                            >
                              ⚔️ Strike / Shoot [AP: 1]
                            </button>

                            {/* Ether Spell discharge */}
                            <button
                              onClick={() => {
                                if (!gameState) return;
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!activeActor || activeActor.ap < 1) {
                                  triggerToast("NO AP FOR SPELL DISCHARGE");
                                  return;
                                }
                                if (gameState.mana < 15) {
                                  triggerToast("INSUFFICIENT ETHER COGNITIVE STABLE");
                                  return;
                                }

                                // Apply massive spell damage directly to the primary enemy
                                const enemy = gridCombat.combatants.find(c => c.id === "enemy-1");
                                if (!enemy || enemy.isDead) {
                                  triggerToast("NO HOSTILE TARGET ACQUIRED");
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
                              className="flex-1 md:flex-initial bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-300 font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              🔮 Spell Plasma [-15 Mana]
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
                                    turnLog: `🔮 MIND PSYCHIC HYPNOSIS: Bending ${enemy.name}'s synaptic currents. Forced system discharge dealing 50 damage! (-20 Mana)`
                                  } : null);
                                  triggerToast("MIND HACK COMPLETE");
                                }}
                                className="flex-1 md:flex-initial bg-fuchsia-950/40 hover:bg-fuchsia-900 border border-fuchsia-500/40 text-fuchsia-300 font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider animate-pulse shadow-[0_0_8px_rgba(217,70,239,0.25)]"
                              >
                                🧠 Mind Hack [-20 Mana]
                              </button>
                            )}

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
                              className="flex-1 md:flex-initial bg-amber-950/30 hover:bg-amber-900 border border-amber-500/30 text-amber-300 font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              💊 Consume Stimpack
                            </button>

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
                                  return {
                                    ...prev,
                                    combatants: updatedCombatants,
                                    currentTurnIdx: nextIdx,
                                    selectedAction: "move" as const,
                                    turnLog: `Turn advanced to ${nextActor.name}. AP fully restored.`
                                  };
                                });
                                triggerToast("TURN ENDED");
                              }}
                              className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              ⏱️ End Turn
                            </button>
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

                                  // If out of attack range, move closer!
                                  if (minDist > livingActor.range) {
                                    // Pathing approximation: search cells within Manhattan distance 2
                                    let bestX = livingActor.x;
                                    let bestY = livingActor.y;
                                    let closestDistAfterMove = minDist;

                                    const COMBAT_OBSTACLES = [[2, 1], [2, 4], [5, 2], [5, 3], [3, 0], [4, 5]];
                                    const isObstacle = (cx: number, cy: number) => COMBAT_OBSTACLES.some(([ox, oy]) => ox === cx && oy === cy);

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
                                    const enemyDmg = livingActor.damage + Math.floor(Math.random() * 5) - 2;
                                    
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
                                    attackLog = `💥 ${livingActor.name} attacks ${currentTarget.name} dealing ${enemyDmg} damage directly!`;
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
                                  const actionSum = movementLog || attackLog 
                                    ? `${movementLog}${attackLog}`
                                    : `${livingActor.name} bypassed tactical action.`;

                                  return {
                                    ...prev,
                                    combatants: updatedCombatants,
                                    currentTurnIdx: nextIdx,
                                    selectedAction: "move" as const,
                                    turnLog: `🤖 AI MOVE: ${actionSum} Turn passed to ${nextActor.name}.`
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
                          className="w-full md:w-auto bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-mono font-black text-3xs px-4 py-3.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Attempt Flee
                        </button>
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
                              if (enemyName.includes("Drone") || enemyName.includes("Sentry")) {
                                nextState.district = "data_vault";
                                nextState.poi = "Sanctuary Hacking Terminal";
                                setActiveRegionId("data_vault");
                                setActivePOIView("terminal_hacking_puzzle");
                                nextState.activeQuests = ["Prologue: Data Vault Sanctuary - Hack the cyber-vault terminal to steal corporate data crystals from Ares Biotech."];
                                narrative += `\n\n🛡️ SECURITY BYPASSED: The security drones spark and crash to the floor! Vice gestures to a heavy floor industrial lift elevator: 'Move, recruit! Before they lock down the entire sector! Get inside the core vault chamber.' You travel to the Data Vault Sanctuary.`;
                              }
                              else if (enemyName.includes("Enforcer") || enemyName.includes("Ambush") || enemyName.includes("Commander")) {
                                nextState.poi = "Mysterious Relic Altar";
                                setActivePOIView("relic_altar");
                                setActiveDialogue("post_combat_tracker");
                                nextState.activeQuests = ["Prologue: Choose the fate of the dying Tracker and escape to Aurus District Safe-house."];
                                narrative += `\n\n🛡️ AMBUSH SURVIVED: The last corporate enforcer drops. Tracker lies on the bloody steel floor, breathing his final heavy breaths. Vice, wounded and leaning against the altar, gasps: 'That traitor... he was about to sell us out. Check his belt.'\n\nYou retrieve a decrypted datapad proving Tracker was under contract to assassinate you and Vice once the data was secured! Choose Tracker's fate above.`;
                              }
                              else if (enemyName.includes("Behemoth") && nextState.activeQuests.some(q => q.includes("Corporate Hunt"))) {
                                nextState.inventory.push("Acid Beast Core");
                                nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Corporate Hunt"));
                                nextState.activeQuests.push("Objective: Deliver the 'Acid Beast Core' to Chancellor Aria at Apex Armory.");
                                narrative += "\n\n🎒 OBJECTIVE COLLECTED: Dislodged the rare green pulsating 'Acid Beast Core'. Advance to Chancellor Aria to deliver the asset.";
                              }

                              if (nextState.experience >= 100) {
                                nextState.level += 1;
                                nextState.experience -= 100;
                                nextState.maxHp += 20;
                                nextState.maxMana += 15;
                                nextState.hp = nextState.maxHp;
                                nextState.mana = nextState.maxMana;
                                narrative += `\n\n📶 SYSTEM LEVEL EXPANDED: Congratulations! Ascended to Level ${nextState.level}. Max health and mana stats fully restored!`;
                              }

                              nextState.combatState = null;
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

                {/* THE HISTORIC RPG NARRATIVE CORE TERMINAL (LOGS CONSOLE) */}
                {/* DE-CLUTTERED COLLAPSIBLE CYBERDECK TRANSMISSION FEED */}
                <div className="glass-panel rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-mono text-3xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Terminal size={14} className="text-cyan-400 animate-pulse" />
                      Cyberdeck Console Transmission Feed
                    </span>
                    <button
                      onClick={() => setExpandLogs(!expandLogs)}
                      className="text-4xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 px-2 py-1 rounded bg-slate-950/40 cursor-pointer transition-all hover:bg-slate-900 font-black uppercase"
                    >
                      {expandLogs ? "[-] COLLAPSE BACKLOG" : "[+] EXPAND HISTORY"}
                    </button>
                  </div>

                  {/* Narrative Scroll panel block */}
                  <div 
                    className={`bg-slate-950/60 rounded-xl p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-3.5 border border-white/5 relative box-glow-cyan transition-all duration-300 ${
                      expandLogs ? "h-[260px]" : "h-[90px]"
                    }`}
                  >
                    {(expandLogs ? logs : logs.slice(-2)).map((log) => (
                      <div key={log.id} className="text-left transition-all">
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 tracking-wider mb-0.5 leading-none font-bold">
                          <span>[{log.timestamp}]</span>
                          {log.poi && <span className="text-cyan-500/75 uppercase">@{log.poi.replace("Main Headquarters ", "")}</span>}
                          
                          {log.type === "action" && <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/10 px-1 py-0.2 rounded text-[8px] uppercase">OPERATIVE</span>}
                          {log.type === "combat" && <span className="bg-rose-950 text-rose-400 border border-rose-500/10 px-1 py-0.2 rounded text-[8px] uppercase">TACTICAL</span>}
                          {log.type === "system" && <span className="bg-slate-900 text-slate-300 border border-white/10 px-1 py-0.2 rounded text-[8px] uppercase">SYSTEM</span>}
                        </div>
                        <p
                          className={`whitespace-pre-line text-xs tracking-wide leading-relaxed pl-1 ${
                            log.type === "action"
                              ? "text-cyan-300 font-bold"
                              : log.type === "combat"
                                ? "text-rose-400"
                                : log.type === "system"
                                  ? "text-amber-200"
                                  : "text-slate-300 font-sans leading-relaxed text-2xs"
                          }`}
                        >
                          {log.text}
                        </p>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>

              </div>
            )}

              {/* RIGHT COLUMN (12/12): PLAYER STATS DECK, INVENTORY, COMPANIONS AND ACTIVE TASKS */}
              {gameTab === "database" && (
                <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* CHARACTER SHEET PROFILE CARD */}
                  <div className="lg:col-span-4 flex flex-col gap-6 font-mono text-left animate-fadeIn">
                    {/* Bio block */}
                    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-cyan-500/10 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl -mr-8 -mt-8" />
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                          {(gameState.archetype || "Cyber-Blade")[0]}
                        </div>
                        <div>
                          <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-black leading-none block">GRID OPERATIVE IDENT</span>
                          <h3 className="text-white font-black text-sm uppercase mt-0.5 leading-none">{gameState.archetype || "Cyber-Blade"}</h3>
                          <span className="text-slate-500 text-3xs uppercase tracking-wider block mt-1">LVL {gameState.level ?? 1} • EXP {gameState.experience ?? 0}/100</span>
                        </div>
                      </div>

                      <div className="space-y-3.5 border-t border-white/5 pt-4">
                        {/* HP Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-3xs">
                            <span className="text-rose-400 font-extrabold uppercase flex items-center gap-1"><Heart size={10} /> INTEGRITY STATUS (HP)</span>
                            <span className="text-white font-bold">{gameState.hp} / {gameState.maxHp}</span>
                          </div>
                          <div className="h-2 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all duration-300"
                              style={{ width: `${Math.min(100, (gameState.hp / gameState.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* MP Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-3xs">
                            <span className="text-cyan-400 font-extrabold uppercase flex items-center gap-1"><Zap size={10} /> ENERGY COGNITION (MP)</span>
                            <span className="text-white font-bold">{gameState.mana} / {gameState.maxMana}</span>
                          </div>
                          <div className="h-2 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-300"
                              style={{ width: `${Math.min(100, (gameState.mana / gameState.maxMana) * 100)}%` }}
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
                            <div 
                              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                              style={{ width: `${gameState.experience ?? 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Level and Credits */}
                        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3 text-3xs">
                          <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                            <span className="text-slate-500 uppercase block font-bold">LEDGER CASH</span>
                            <p className="text-amber-400 font-black text-xs uppercase mt-0.5">{gameState.credits}¤</p>
                          </div>
                          <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                            <span className="text-slate-500 uppercase block font-bold">TEAM PARTY SIZE</span>
                            <p className="text-white font-black text-xs uppercase mt-0.5">{gameState.party.length + 1} SQUAD</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CORE ATTRIBUTES & SKILL TREES */}
                    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-4 font-mono">
                      <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                        <span className="text-slate-400 text-3xs uppercase font-black tracking-widest flex items-center gap-1.5">
                          🛡️ Core Attribute Matrices
                        </span>
                        <span className="text-[9px] text-cyan-400 font-extrabold uppercase">LEVEL UP FOR +PTS</span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">STR</span>
                          <span className="text-xs text-white font-black">{gameState.attributes?.str ?? 10}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">DEX</span>
                          <span className="text-xs text-white font-black">{gameState.attributes?.dex ?? 10}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">INT</span>
                          <span className="text-xs text-white font-black">{gameState.attributes?.int ?? 10}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">WILL</span>
                          <span className="text-xs text-white font-black">{gameState.attributes?.will ?? 10}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">ETH</span>
                          <span className="text-xs text-cyan-400 font-black">{gameState.attributes?.eth ?? 10}</span>
                        </div>
                      </div>

                      <div className="border-b border-white/10 pb-1 mt-1 flex justify-between items-center">
                        <span className="text-slate-400 text-3xs uppercase font-black tracking-widest flex items-center gap-1.5">
                          📶 ACTIVE SKILL TREES
                        </span>
                      </div>

                      <div className="space-y-2 text-3xs font-mono">
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">⚔️ Cyber-Blade (Melee)</span>
                          <span className="text-cyan-400 font-black">LVL {gameState.skills?.cyberBlade ?? 1}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">💾 Net-Slicer (Hacking)</span>
                          <span className="text-cyan-400 font-black">LVL {gameState.skills?.netSlicer ?? 1}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">🛡️ Heavy Chrome (Defense)</span>
                          <span className="text-cyan-400 font-black">LVL {gameState.skills?.heavyChrome ?? 1}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">🔮 MINDMANCER (Psychic)</span>
                          <span className={`font-black ${gameState.skills?.mindmancer ? "text-purple-400" : "text-slate-600 animate-pulse"}`}>
                            {gameState.skills?.mindmancer ? `LVL ${gameState.skills.mindmancer}` : "LOCKED [PROLOGUE]"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIVE HARWARE & CHROME EQUIPMENT STATUS */}
                    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-3 font-mono">
                      <span className="text-slate-400 text-3xs uppercase font-black tracking-widest border-b border-white/10 pb-2 flex items-center gap-1.5">
                        <Shield size={12} className="text-cyan-400" /> Active Hardware Uplinks
                      </span>
                      <div className="space-y-2 text-3xs">
                        {gameState.inventory.includes("Apex Mantis electro-blade") ? (
                          <div className="p-2.5 bg-cyan-950/20 border border-cyan-400/20 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-cyan-300 uppercase">Apex Mantis electro-blade</span>
                            <span className="text-cyan-400 font-black">[+25 MELEE ATK]</span>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-lg text-slate-500">
                            Melee Slot: Standard alloy fist [0%]
                          </div>
                        )}

                        {gameState.inventory.includes("Technical Signal Core") ? (
                          <div className="p-2.5 bg-indigo-950/20 border border-indigo-400/20 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-indigo-300 uppercase">Technical Signal Core</span>
                            <span className="text-indigo-400 font-black">[SATELLITE JAM]</span>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-lg text-slate-500">
                            Aux Slot: Decrypted network visor
                          </div>
                        )}

                        {gameState.inventory.includes("Charged Ley-Matrix") ? (
                          <div className="p-2.5 bg-rose-950/20 border border-rose-400/20 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-rose-300 uppercase">Charged Ley-Matrix</span>
                            <span className="text-rose-400 font-black">[+30% MAGIC COMP]</span>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-lg text-slate-500">
                            Ether Deck: Basic bio-couplers
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SENSORY WORLDCLOCK DATE COMPONENT */}
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-left font-mono text-3xs text-slate-500 space-y-2.5 relative">
                      <div className="flex justify-between items-center text-slate-400 text-2xs leading-none">
                        <span className="flex items-center gap-1 uppercase font-bold text-cyan-400">
                          <Clock size={12} /> Temporal State
                        </span>
                        <span className="text-[10px] text-white font-bold bg-white/5 px-2 py-0.5 rounded uppercase">
                          DAY {gameState.day ?? 1} • {gameState.timeOfDay || "Morning"}
                        </span>
                      </div>
                      <p className="leading-snug">
                        Time progresses on regional transit travels or medical recuperations. Server crews pay dividends every morning. Safe operations require consistent parameters monitoring.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN DATABASE HUD */}
                  <div className="lg:col-span-8 flex flex-col gap-6 animate-fadeIn">

                    {/* ADVANCED EQUIP DECK HUD */}
                    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col gap-4">
                  <div className="flex border-b border-white/15 text-xs font-mono">
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className={`flex-1 pb-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold ${
                        activeTab === "inventory" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Briefcase size={12} /> Stash
                    </button>
                    <button
                      onClick={() => setActiveTab("companions")}
                      className={`flex-1 pb-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold ${
                        activeTab === "companions" ? "text-rose-400 border-b-2 border-rose-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Users size={12} /> Mercs
                    </button>
                    <button
                      onClick={() => setActiveTab("quests")}
                      className={`flex-1 pb-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold ${
                        activeTab === "quests" ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Award size={12} /> Quests
                    </button>
                  </div>

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
                              {SHOP_ITEMS.map((item) => {
                                const alreadyIn = gameState.inventory.includes(item.name);
                                return (
                                  <div key={item.name} className="flex justify-between items-center text-3xs border-b border-white/5 pb-2">
                                    <div className="text-left w-2/3">
                                      <p className="font-bold text-white uppercase">{item.name}</p>
                                      <p className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-none">{item.desc}</p>
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
                                return (
                                  <div
                                    key={index}
                                    className="p-3 bg-slate-950/80 border border-white/10 rounded-lg flex justify-between items-center transition-all hover:border-white/20"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-200 text-2xs uppercase leading-none">{item}</p>
                                      <p className="text-[9px] text-slate-500 mt-1 uppercase">
                                        {isScrap ? "Recycle Scavenge Scrap" : isStim ? "Combat Injector" : "Equipped Enhancement"}
                                      </p>
                                    </div>

                                    {/* Action items */}
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
                          {gameState.companions.map((comp) => {
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
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-extrabold text-slate-200 uppercase flex items-center gap-1 text-2xs leading-none">
                                      {comp.name} <span className="text-3xs text-slate-500 font-normal">({comp.role})</span>
                                    </p>
                                    <p className="text-[9px] text-slate-500 mt-1 italic font-sans">{comp.bio}</p>
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
                                        onClick={() => handleTalkCompanion(comp)}
                                        className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                      >
                                        💬 Talk / Opinion
                                      </button>
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
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* TAB SLOT C: QUEST LOG DIRECTIVE SCHEMAS */}
                    {activeTab === "quests" && (
                      <motion.div
                        key="quests-tab"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="space-y-4 font-mono text-xs text-left"
                      >
                        <div className="space-y-2.5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Active Mission Orders</p>
                          {gameState.activeQuests.length === 0 ? (
                            <p className="p-4 bg-slate-950/70 border border-white/5 text-slate-600 rounded text-center text-2xs italic">
                              No active combat orders. Talk to Jax at Neon Abyss Bar for rebellion work.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {gameState.activeQuests.map((q, idx) => (
                                <div key={idx} className="p-3 bg-slate-950/60 border border-amber-500/20 text-amber-300 rounded-lg text-3xs leading-relaxed flex items-start gap-2">
                                  <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                                  <span>{q}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-white/5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Historics Completed Slots</p>
                          {gameState.completedQuests.length === 0 ? (
                            <p className="p-2 bg-slate-950/40 text-slate-600 text-3xs italic text-center rounded">
                              No successful corporate resolutions logged.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {gameState.completedQuests.map((q, idx) => (
                                <div key={idx} className="p-2.5 bg-slate-950/90 border border-cyan-500/10 text-cyan-400 rounded text-3xs flex items-center gap-2">
                                  <CheckCircle size={12} className="text-cyan-400 flex-shrink-0" />
                                  <span className="line-through opacity-75">{q}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                </div>

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
                  <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-500/30 text-cyan-400 font-extrabold text-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    {companionOpinion.name[0]}
                  </div>
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

      </main>

    </div>
  );
}
