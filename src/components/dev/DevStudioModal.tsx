import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  MapPin, 
  Package, 
  Users, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  X, 
  Zap, 
  Coins, 
  MessageSquare,
  Scroll,
  Layers,
  Terminal,
  Swords,
  Play,
  RotateCcw
} from "lucide-react";
import { GridCombatant, GameState, UnifiedQuest, CustomPOIData } from "../../types";
import { MAP_POIS, MapPOI, REGIONS, Region, ITEM_METADATA, ItemDetails } from "../../data";
import { DEFAULT_CAMPAIGN_QUESTS } from "../../questsData";
import { DEFAULT_CAMPAIGN_NPCS } from "../../npcsData";
import { DialogueGraphEditor, CustomDialogueNode } from "./DialogueGraphEditor";
import { QuestGraphEditor, CustomQuest } from "./QuestGraphEditor";
import { TacticalEncounterStudio, CustomCombatEncounter } from "./TacticalEncounterStudio";
import { ItemForgeStudio, CustomWorldItem } from "./ItemForgeStudio";
import { NPCStudio, CustomCharacter } from "./NPCStudio";
import { POIStudio } from "./POIStudio";
import { SceneStudio } from "./SceneStudio";
import { QuestStudio } from "./QuestStudio";
import { EventStudio, CustomWorldEvent } from "./EventStudio";

export interface DevStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState?: GameState | null;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
  customPOIs?: MapPOI[];
  setCustomPOIs?: React.Dispatch<React.SetStateAction<MapPOI[]>>;
  customItems?: ItemDetails[];
  setCustomItems?: React.Dispatch<React.SetStateAction<ItemDetails[]>>;
  customNPCs?: any[];
  setCustomNPCs?: React.Dispatch<React.SetStateAction<any[]>>;
  customDialogues?: CustomDialogueNode[];
  setCustomDialogues?: React.Dispatch<React.SetStateAction<CustomDialogueNode[]>>;
  customQuests?: CustomQuest[];
  setCustomQuests?: React.Dispatch<React.SetStateAction<CustomQuest[]>>;
  customEncounters?: CustomCombatEncounter[];
  setCustomEncounters?: React.Dispatch<React.SetStateAction<CustomCombatEncounter[]>>;
  onLaunchEncounterInGame?: (encounter: CustomCombatEncounter) => void;
  onTriggerLiveEvent?: (event: CustomWorldEvent) => void;
  triggerToast: (msg: string) => void;
  activeDistrict?: string;
}

export const DevStudioModal: React.FC<DevStudioModalProps> = ({
  isOpen,
  onClose,
  gameState,
  setGameState,
  triggerToast,
  activeDistrict = "conduit09",
  onLaunchEncounterInGame,
  onTriggerLiveEvent
}) => {
  // --- LOCAL PERSISTENCE STORAGE KEYS ---
  const STORAGE_KEY_ITEMS = "dev_studio_custom_items_v2";
  const STORAGE_KEY_NPCS = "dev_studio_custom_npcs_v2";
  const STORAGE_KEY_POIS = "dev_studio_custom_pois_v2";
  const STORAGE_KEY_QUESTS = "dev_studio_custom_quests_v2";
  const STORAGE_KEY_EVENTS = "dev_studio_custom_events_v2";
  const STORAGE_KEY_ENCOUNTERS = "dev_studio_custom_encounters_v2";

  // --- STATE FOR ADVANCED CONTENT STUDIOS ---
  const [customItems, setCustomItems] = useState<CustomWorldItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "item_prototype_singularity_gun",
        name: "Singularity Rail-Pistol Mk.IV",
        description: "An illegal electromagnetic hand-cannon siphoning void energy. Overcharges damage against heavily shielded corporate bosses.",
        type: "weapon",
        slot: "rangedWeapon",
        rarity: "legendary",
        cost: 650,
        stats: { rangedAtk: 48, dex: 3, int: 2 },
        worldPlacements: [
          { type: "vendor", targetVendor: "Aria at Apex Armory", buyCost: 650 },
          { type: "loot_table", targetDistrict: "shatter_ridge_core", dropChance: 35 }
        ],
        icon: "🔫",
        image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "item_ether_nanite_stim",
        name: "Hyper-Ether Regenerator",
        description: "Military-grade syringe that instantly reconstructs bio-matter and restores full Ether mana reservoir.",
        type: "consumable",
        rarity: "epic",
        cost: 140,
        stats: { hpRestore: 80, manaRestore: 60 },
        worldPlacements: [
          { type: "vendor", targetVendor: "Dr. Marv's Cyber-Clinic", buyCost: 140 }
        ],
        icon: "💉"
      }
    ];
  });

  const [customNPCs, setCustomNPCs] = useState<CustomCharacter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NPCS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CAMPAIGN_NPCS;
  });

  const [customPOIs, setCustomPOIs] = useState<CustomPOIData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POIS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "poi_cyber_speakeasy",
        name: "The Neon Lotus Underground Lounge",
        district: "conduit09",
        type: "interior_hub",
        x: 62,
        y: 38,
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
        description: "A subterranean neon bar bathed in magenta ultraviolet light and synthwave bass. Fixers, rogue deckers, and bounty hunters gather here to trade black-market data.",
        interiorActivities: [
          {
            id: "act_drink",
            label: "Order Overclocked Bio-Synth Cocktail",
            desc: "The potent synth-cocktail surges through your cybernetic conduits (+40 Mana, +20 HP).",
            actionType: "rest",
            cost: 15,
            rewardCredits: 0
          },
          {
            id: "act_rumors",
            label: "Eavesdrop on Syndicate Fixers",
            desc: "You intercept encrypted frequencies discussing an unguarded Arasaka tech shipment in Shatter Ridge!",
            actionType: "rumor"
          }
        ]
      }
    ];
  });

  const [customQuests, setCustomQuests] = useState<UnifiedQuest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [customEvents, setCustomEvents] = useState<CustomWorldEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "event_fallen_courier",
        title: "Travel Encounter: Fallen Courier in Docks Canal",
        triggerType: "travel_region",
        triggerRegion: "all",
        bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
        narrativeText: "While cutting through the rain-slicked maintenance canal under the transit overpass, you spot the lifeless body of an augmented woman slumped against a rusted bulkhead. Her chest cavity glows with a pulsating technomantic relic crystal, and a secure corporate datapad is clutched in her grip.",
        choices: [
          {
            id: "opt_1",
            text: "[Intelligence 14] Decrypt the dead courier's datapad and extract relic frequencies",
            checkType: "int",
            checkValue: 14,
            successOutcomeText: "Your cyberdeck slices past the encrypted firewall! You recover corporate coordinates and safely extract the pulsating Ether Core (+180¤, +50 XP, +Singularity Overcharger).",
            failureOutcomeText: "The firewall triggers a neural shockwave! (-25 HP, datapad self-deletes).",
            rewardCredits: 180,
            rewardXP: 50,
            rewardItem: "Singularity Rail-Pistol Mk.IV"
          },
          {
            id: "opt_2",
            text: "[Perception] Quickly loot valuables before corporate drones arrive",
            checkType: "none",
            successOutcomeText: "You quickly swipe 60¤ credits and a stimpack before slipping into the shadows.",
            rewardCredits: 60,
            rewardXP: 25
          }
        ]
      }
    ];
  });

  const [customEncounters, setCustomEncounters] = useState<CustomCombatEncounter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENCOUNTERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "enc_conduit_ambush",
        name: "Conduit 09 Sector Ambush",
        district: "conduit09",
        description: "A squad of Ares Security enforcers has cordoned off the maintenance gateway.",
        backgroundUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800",
        combatants: [
          {
            id: "player",
            name: "You",
            team: "player",
            hp: gameState?.hp ?? 100,
            maxHp: gameState?.maxHp ?? 100,
            shields: 30,
            maxShields: 30,
            x: 1,
            y: 2,
            avatar: "⚡",
            color: "border-cyan-400 bg-cyan-950/60",
            range: 2,
            damage: 30,
            ap: 2,
            maxAp: 2,
            initiative: 15,
            isDead: false
          },
          {
            id: "enemy_1",
            name: "Ares Enforcer Lead",
            team: "enemy",
            hp: 90,
            maxHp: 90,
            shields: 20,
            maxShields: 20,
            x: 6,
            y: 2,
            avatar: "🥷",
            color: "border-rose-500 bg-rose-950/60",
            range: 3,
            damage: 25,
            ap: 2,
            maxAp: 2,
            initiative: 12,
            isDead: false
          },
          {
            id: "enemy_2",
            name: "Vanguard Droid",
            team: "enemy",
            hp: 60,
            maxHp: 60,
            shields: 10,
            maxShields: 10,
            x: 5,
            y: 4,
            avatar: "🤖",
            color: "border-rose-500 bg-rose-950/60",
            range: 2,
            damage: 18,
            ap: 2,
            maxAp: 2,
            initiative: 8,
            isDead: false
          }
        ],
        interactiveObjects: [
          {
            id: "obj_battery_1",
            name: "Ether Battery",
            type: "battery" as const,
            x: 4,
            y: 2,
            hp: 40,
            maxHp: 40,
            isDestroyed: false,
            isHacked: false,
            avatar: "🔋",
            color: "border-cyan-400 bg-cyan-950/80 text-cyan-300",
            description: "Volatile battery."
          }
        ],
        rewardCredits: 300,
        rewardExp: 60,
        rewardItem: "Military Stun Grenade"
      }
    ];
  });

  // Save to LocalStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(customItems));
    } catch (e) {}
  }, [customItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NPCS, JSON.stringify(customNPCs));
    } catch (e) {}
  }, [customNPCs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POIS, JSON.stringify(customPOIs));
    } catch (e) {}
  }, [customPOIs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(customQuests));
    } catch (e) {}
  }, [customQuests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(customEvents));
    } catch (e) {}
  }, [customEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENCOUNTERS, JSON.stringify(customEncounters));
    } catch (e) {}
  }, [customEncounters]);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"pois" | "scenes" | "npcs" | "items" | "quests" | "events" | "encounters" | "export">("pois");
  const [selectedSceneIdForEditor, setSelectedSceneIdForEditor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // --- JSON EXPORT ---
  const getFullExportJson = () => {
    const exportBundle = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: "4.1.0",
        title: "Masters of Raana & Cyberpunk RPG Content Expansion Pack",
        author: gameState.playerName || "GameMaster"
      },
      customPOIs,
      customNPCs,
      customItems,
      customQuests,
      customEvents,
      customEncounters,
      poiInteractiveScenes: gameState.poiInteractiveScenes || {}
    };
    return JSON.stringify(exportBundle, null, 2);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(getFullExportJson());
    setCopied(true);
    triggerToast("FULL CAMPAIGN MODULE EXPORT COPIED TO CLIPBOARD!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.customPOIs) setCustomPOIs(data.customPOIs);
      if (data.customNPCs) setCustomNPCs(data.customNPCs);
      if (data.customItems) setCustomItems(data.customItems);
      if (data.customQuests) setCustomQuests(data.customQuests);
      if (data.customEvents) setCustomEvents(data.customEvents);
      if (data.customEncounters) setCustomEncounters(data.customEncounters);
      if (data.poiInteractiveScenes) {
        setGameState(prev => ({
          ...prev,
          poiInteractiveScenes: {
            ...(prev.poiInteractiveScenes || {}),
            ...data.poiInteractiveScenes
          }
        }));
      }
      triggerToast("CAMPAIGN MODULE SUCCESSFULLY IMPORTED & LOADED!");
    } catch (e) {
      triggerToast("ERROR: Invalid JSON module format!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 md:p-4 select-none font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-slate-950 border border-cyan-500/40 rounded-2xl w-full max-w-7xl h-[94vh] max-h-[920px] shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-slate-200"
      >
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-500/20 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/90 border border-cyan-400/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Wrench size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-black uppercase tracking-wider text-cyan-300">
                  DEVELOPER & NARRATIVE GM STUDIO
                </h1>
                <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                  CONTENT ARCHITECT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Author and customize POIs, recruitable NPCs & captives, dynamic events, weapons, and deterministic quests in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick GM Cheat Injector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-[10px]">
              <span className="text-amber-400 font-bold">¤ {gameState.credits}</span>
              <button 
                onClick={() => {
                  setGameState(prev => ({ ...prev, credits: prev.credits + 1000 }));
                  triggerToast("+1,000¤ ADDED TO PLAYER LEDGER!");
                }}
                className="text-cyan-400 hover:text-cyan-200 font-black ml-1 uppercase cursor-pointer"
              >
                [+1k Credits]
              </button>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => {
                  setGameState(prev => ({ ...prev, hp: prev.maxHp, mana: prev.maxMana }));
                  triggerToast("HP & MANA FULLY RESTORED!");
                }}
                className="text-emerald-400 hover:text-emerald-200 font-black uppercase cursor-pointer"
              >
                [Full Heal]
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-800 hover:border-rose-500/50 bg-slate-900 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              title="Close Dev Studio"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-cyan-500/20 bg-slate-950/90 shrink-0 px-4 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("pois")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "pois"
                ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin size={15} className="text-cyan-400" /> 
            <span>World & Interior POIs</span>
            <span className="text-3xs bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30 text-cyan-400 font-bold">{customPOIs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("scenes")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "scenes"
                ? "border-purple-400 text-purple-300 bg-purple-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap size={15} className="text-purple-400" /> 
            <span>Interactive Scenes & Nodes</span>
            <span className="text-3xs bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-500/30 text-purple-400 font-bold">
              {Object.keys(gameState?.poiInteractiveScenes || {}).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("npcs")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "npcs"
                ? "border-pink-400 text-pink-300 bg-pink-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={15} className="text-pink-400" /> 
            <span>Characters & Companions</span>
            <span className="text-3xs bg-pink-950/80 px-1.5 py-0.2 rounded border border-pink-500/30 text-pink-400 font-bold">{customNPCs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "items"
                ? "border-amber-400 text-amber-300 bg-amber-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package size={15} className="text-amber-400" /> 
            <span>Item Forge & World Placer</span>
            <span className="text-3xs bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30 text-amber-400 font-bold">{customItems.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("quests")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "quests"
                ? "border-emerald-400 text-emerald-300 bg-emerald-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scroll size={15} className="text-emerald-400" /> 
            <span>Quest Director</span>
            <span className="text-3xs bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30 text-emerald-400 font-bold">{customQuests.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "events"
                ? "border-rose-400 text-rose-300 bg-rose-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap size={15} className="text-rose-400" /> 
            <span>Dynamic Events & Travel</span>
            <span className="text-3xs bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/30 text-rose-400 font-bold">{customEvents.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("encounters")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "encounters"
                ? "border-red-500 text-red-300 bg-red-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Swords size={15} className="text-red-400" /> 
            <span>Tactical Grid Spawner</span>
            <span className="text-3xs bg-red-950/80 px-1.5 py-0.2 rounded border border-red-500/30 text-red-400 font-bold">{customEncounters.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 ml-auto whitespace-nowrap cursor-pointer ${
              activeTab === "export"
                ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal size={15} /> <span>Campaign Module Hub</span>
          </button>
        </div>

        {/* WORKSPACE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          
          {/* TAB 1: WORLD & INTERIOR POI ARCHITECT */}
          {activeTab === "pois" && (
            <POIStudio
              customPOIs={customPOIs}
              setCustomPOIs={setCustomPOIs}
              customNPCs={customNPCs}
              gameState={gameState}
              setGameState={setGameState}
              triggerToast={triggerToast}
            />
          )}

          {/* TAB 1.5: INTERACTIVE SCENE & NODE STUDIO */}
          {activeTab === "scenes" && (
            <SceneStudio
              gameState={gameState}
              setGameState={setGameState}
              customPOIs={customPOIs}
              initialSelectedSceneId={selectedSceneIdForEditor || undefined}
              triggerToast={triggerToast}
            />
          )}

          {/* TAB 2: NPC & COMPANION STUDIO */}
          {activeTab === "npcs" && (
            <NPCStudio
              customNPCs={customNPCs}
              setCustomNPCs={setCustomNPCs}
              customPOIs={customPOIs}
              gameState={gameState}
              setGameState={setGameState}
              triggerToast={triggerToast}
            />
          )}

          {/* TAB 3: ITEM FORGE & WORLD PLACER */}
          {activeTab === "items" && (
            <ItemForgeStudio
              customItems={customItems}
              setCustomItems={setCustomItems}
              customPOIs={customPOIs}
              gameState={gameState}
              setGameState={setGameState}
              triggerToast={triggerToast}
            />
          )}

          {/* TAB 4: QUEST DIRECTOR */}
          {activeTab === "quests" && (
            <QuestStudio
              customQuests={customQuests}
              setCustomQuests={setCustomQuests}
              customPOIs={customPOIs}
              customItems={customItems}
              gameState={gameState}
              setGameState={setGameState}
              triggerToast={triggerToast}
              onOpenSceneInEditor={(sceneId) => {
                setSelectedSceneIdForEditor(sceneId);
                setActiveTab("scenes");
              }}
            />
          )}

          {/* TAB 5: DYNAMIC WORLD & TRAVEL EVENTS */}
          {activeTab === "events" && (
            <EventStudio
              customEvents={customEvents}
              setCustomEvents={setCustomEvents}
              customItems={customItems}
              gameState={gameState}
              setGameState={setGameState}
              triggerToast={triggerToast}
              onLaunchEventLive={(evt) => {
                if (typeof onTriggerLiveEvent === "function") {
                  onTriggerLiveEvent(evt);
                } else {
                  // Fallback: pop up in game
                  setGameState(prev => ({
                    ...prev,
                    credits: prev.credits + (evt.choices[0]?.rewardCredits || 0),
                    experience: prev.experience + (evt.choices[0]?.rewardXP || 0)
                  }));
                  triggerToast(`EVENT TEST TRIGGERED: "${evt.title}"`);
                }
                onClose();
              }}
            />
          )}

          {/* TAB 6: TACTICAL GRID ENCOUNTER SPAWNER */}
          {activeTab === "encounters" && (
            <TacticalEncounterStudio
              encounters={customEncounters}
              setEncounters={setCustomEncounters}
              gameState={gameState}
              onLaunchEncounterInGame={(enc) => {
                if (typeof onLaunchEncounterInGame === "function") {
                  onLaunchEncounterInGame(enc);
                } else {
                  triggerToast(`DEPLOYING ENCOUNTER: ${enc.name.toUpperCase()}`);
                }
                onClose();
              }}
              triggerToast={triggerToast}
            />
          )}

          {/* TAB 7: CAMPAIGN MODULE HUB / JSON SERIALIZER */}
          {activeTab === "export" && (
            <div className="flex flex-col gap-4 h-full bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-3">
                <div>
                  <span className="text-sm font-black text-cyan-300 uppercase flex items-center gap-2">
                    <Terminal size={16} className="text-cyan-400" /> CAMPAIGN EXPANSION PACK EXPORTER & IMPORTER
                  </span>
                  <p className="text-2xs text-slate-400 font-sans mt-0.5">
                    Export your custom POIs, recruitable NPCs, forged items, quests, travel events, and tactical encounters as a single JSON module file.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyJson}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "COPIED TO CLIPBOARD!" : "COPY CAMPAIGN JSON"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-2xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/20 text-center">
                  <div className="text-cyan-400 font-bold text-base">{customPOIs.length}</div>
                  <div className="text-slate-400 uppercase text-3xs">World & Interior POIs</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-purple-500/20 text-center">
                  <div className="text-purple-400 font-bold text-base">{customNPCs.length}</div>
                  <div className="text-slate-400 uppercase text-3xs">Authored Characters</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/20 text-center">
                  <div className="text-amber-400 font-bold text-base">{customItems.length}</div>
                  <div className="text-slate-400 uppercase text-3xs">Forged Items & Loot</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/20 text-center">
                  <div className="text-emerald-400 font-bold text-base">{customQuests.length}</div>
                  <div className="text-slate-400 uppercase text-3xs">Quests & Storylines</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-red-500/20 text-center">
                  <div className="text-red-400 font-bold text-base">{customEncounters.length}</div>
                  <div className="text-slate-400 uppercase text-3xs">Tactical Encounters</div>
                </div>
              </div>

              <textarea
                readOnly
                value={getFullExportJson()}
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs text-cyan-300 font-mono select-all focus:outline-none overflow-y-auto leading-relaxed"
              />
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default DevStudioModal;
