import React, { useState } from "react";
import { 
  MapPin, 
  Sparkles, 
  Store, 
  Swords, 
  Users, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  Eye, 
  Lock, 
  Activity, 
  Flame, 
  Zap, 
  Skull, 
  Gift, 
  ArrowRight,
  Shield,
  HeartPulse,
  Bed,
  DollarSign,
  Scroll,
  Radio,
  Copy,
  Compass,
  Layers,
  ChevronRight
} from "lucide-react";
import { MapPOI, MAP_POIS, REGIONS } from "../../data";
import { 
  GameState, 
  CustomPOIData, 
  CustomPOIAction, 
  POIInteractiveEvent,
  POIShopService,
  POIClinicService,
  POIRestService,
  POIAuctionService,
  POIAuctionLot,
  POIRumorsService,
  POIRumorItem,
  POIContractsService,
  POINpcsService
} from "../../types";
import { DEFAULT_POI_INTERACTIVE_SCENES } from "../../poiScenesData";
import { CustomWorldItem } from "./ItemForgeStudio";
import { CustomCharacter } from "./NPCStudio";

interface POIStudioProps {
  customPOIs: CustomPOIData[];
  setCustomPOIs: React.Dispatch<React.SetStateAction<CustomPOIData[]>>;
  customItems?: CustomWorldItem[];
  customNPCs?: CustomCharacter[];
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
  onNavigateToPOI?: (poi: CustomPOIData) => void;
  onOpenSceneInEditor?: (sceneId: string) => void;
}

const PRESET_SCENIC_BACKGROUNDS = [
  { name: "Neon Cyber Bar & Auction", url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800" },
  { name: "Underground Safehouse & Bunks", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" },
  { name: "Cyber-Clinic & Surgery Bay", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" },
  { name: "Dark Pit Combat Arena", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800" },
  { name: "Black Market Slave Pens", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800" },
  { name: "Corporate Penthouse Suites", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800" },
  { name: "Technomantic Cathedral Altar", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800" },
  { name: "Smuggler Canal Docks", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800" }
];

export const POIStudio: React.FC<POIStudioProps> = ({
  customPOIs,
  setCustomPOIs,
  customItems = [],
  customNPCs = [],
  gameState,
  setGameState,
  triggerToast,
  onNavigateToPOI,
  onOpenSceneInEditor
}) => {
  const [selectedPoiId, setSelectedPoiId] = useState<string>(customPOIs[0]?.id || "new");
  const [activeTab, setActiveTab] = useState<
    "general" | "map_coords" | "quest_scene" | "shop" | "clinic" | "rest" | "auction" | "contracts" | "rumors" | "npcs" | "actions"
  >("general");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");

  // Form State
  const [poiForm, setPoiForm] = useState<CustomPOIData>(() => {
    return customPOIs[0] || {
      id: `poi_${Date.now()}`,
      name: "The Velvet Coil (Underworld Cantina & Auction)",
      district: "aurus",
      category: "social",
      desc: "A subterranean neon bar where high-level corporate data couriers, hired blades, and contract auctioneers broker underworld deals.",
      x: 45,
      y: 55,
      bgImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
      isUnlocked: true,
      dangerRating: "Low",
      fastTravelCost: 0,
      questTrigger: {
        linkedSceneId: "relic_altar",
        triggerCondition: "manual_button",
        triggerButtonLabel: "⚡ Access Vault Infiltration Scene"
      },
      services: {
        shop: {
          enabled: true,
          merchantName: "Fixer Corvus",
          merchantTitle: "Smuggled Arms & Tech Dealer",
          greeting: "Got clean credits? Look around, but don't touch what you can't afford.",
          priceMultiplier: 1.0,
          allowSell: true,
          items: ["Health Stimpack", "Cyber-Ammo Pack", "Energy Cell", "Tactical Cyber-SMG"]
        },
        clinic: {
          enabled: false,
          doctorName: "Dr. Valerie Cross",
          healHpCost: 35,
          restoreManaCost: 40,
          cureDebuffsCost: 50,
          surgeryAvailable: true
        },
        rest: {
          enabled: true,
          innkeeperName: "Quartermaster Vane",
          rentRoomCost: 25,
          staminaRestore: 60,
          hpRestore: 30,
          advanceHours: 6,
          flavorText: "A reinforced soundproof pod with biometric seals and clean oxygen scrubbers."
        },
        auction: {
          enabled: true,
          auctioneerName: "Broker Malakor",
          description: "High-stakes underworld bidding pit. Slaves, bound operatives, and contraband prototypes sold to the highest bidder.",
          lots: [
            {
              id: "lot_blade_slave",
              name: "Talia - Resynced Syndicate Infiltrator (Slave / Contract)",
              type: "slave",
              price: 350,
              desc: "Captured during an Ares Biotech sweep. Bio-restraints active. Exceptional dexterity and covert lockpicking.",
              stats: "DEX: 15, Net-Slicing: Level 2, Stealth: High",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
              companionIdToRecruit: "talia_infiltrator"
            }
          ]
        },
        rumors: {
          enabled: true,
          informantName: "Whisper-Jack (Informant)",
          rumorList: [
            {
              id: "rumor_1",
              title: "The Sludge Conduit Altar Anomaly",
              text: "Scavengers claim the ancient technomantic altar in Conduit 09 is reacting to human biometric ether.",
              cost: 20,
              grantsXP: 45
            }
          ]
        },
        contracts: {
          enabled: true,
          boardTitle: "Local Bounty & Freelance Contract Terminal",
          boardDescription: "Official and underworld jobs commissioned in this district",
          availableQuestIds: []
        },
        npcs: {
          enabled: true,
          placedNPCIds: ["jax", "marv"]
        }
      },
      actions: [
        {
          id: "act_1",
          label: "Bribe the Bouncer for VIP Access",
          desc: "Pass 50 credits to gain entry to the backroom high-roller tables.",
          cost: 50,
          actionType: "custom",
          rewardXP: 30
        }
      ],
      placedNPCIds: ["jax", "marv"]
    };
  });

  // Select existing POI to edit
  const handleSelectPOI = (poi: CustomPOIData) => {
    setSelectedPoiId(poi.id);
    setPoiForm({
      ...poi,
      services: poi.services || {
        shop: { enabled: false },
        clinic: { enabled: false },
        rest: { enabled: false },
        auction: { enabled: false },
        contracts: { enabled: false },
        rumors: { enabled: false },
        npcs: { enabled: false }
      }
    });
  };

  // Create new blank POI
  const handleCreateNew = () => {
    const newPoi: CustomPOIData = {
      id: `poi_${Date.now()}`,
      name: "New District Outpost",
      district: filterDistrict !== "all" ? filterDistrict : "conduit09",
      category: "social",
      desc: "An atmospheric district location awaiting architecture.",
      x: 50,
      y: 50,
      bgImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
      isUnlocked: true,
      dangerRating: "Low",
      fastTravelCost: 0,
      services: {
        shop: { enabled: false },
        clinic: { enabled: false },
        rest: { enabled: false },
        auction: { enabled: false },
        contracts: { enabled: false },
        rumors: { enabled: false },
        npcs: { enabled: false }
      },
      actions: [],
      placedNPCIds: []
    };

    setCustomPOIs(prev => [...prev, newPoi]);
    setSelectedPoiId(newPoi.id);
    setPoiForm(newPoi);
    triggerToast("Created new World & Interior POI");
  };

  // Preset Archetype Quick Generator
  const handleApplyPresetTemplate = (presetType: string) => {
    let preset: Partial<CustomPOIData> = {};

    if (presetType === "cantina_auction") {
      preset = {
        name: "The Neon Siphon (Underworld Bar & Slave Auction)",
        category: "auction",
        dangerRating: "Low",
        bgImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
        desc: "Smoke-filled subterranean den where high-level data brokers and slave auctioneers ply their trade.",
        services: {
          shop: {
            enabled: true,
            merchantName: "Bartender Kael",
            merchantTitle: "Underworld Fixer & Mixologist",
            greeting: "What's your poison? Credits on the counter first.",
            items: ["Health Stimpack", "Cyber-Ammo Pack", "Energy Cell"],
            allowSell: true
          },
          auction: {
            enabled: true,
            auctioneerName: "Master Slaver Vance",
            description: "Live bidding pit for combat operatives, captive net-slicers, and black market cyberware.",
            lots: [
              {
                id: `lot_${Date.now()}_1`,
                name: "Captive Spec-Ops Net-Slicer (Slave)",
                type: "slave",
                price: 320,
                desc: "Equipped with military neuro-mesh. High hacking proficiency.",
                stats: "INT: 15, Net-Slicing: Level 3",
                companionIdToRecruit: "captive_slicer"
              }
            ]
          },
          rumors: {
            enabled: true,
            informantName: "Whispering Drone",
            rumorList: [
              {
                id: `rumor_${Date.now()}`,
                title: "Cargo Manifest Leak",
                text: "Ares Biotech convoy shipment arriving at midnight with unrefined energy batteries.",
                cost: 25,
                grantsXP: 50
              }
            ]
          }
        }
      };
    } else if (presetType === "cyber_clinic") {
      preset = {
        name: "Dr. Cross's Biomechanical Ripperdoc Bay",
        category: "medical",
        dangerRating: "Safe",
        bgImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
        desc: "A sterile underground surgery bay surrounded by whirring surgical arms and cryogenic coolant vats.",
        services: {
          clinic: {
            enabled: true,
            doctorName: "Dr. Valerie Cross",
            healHpCost: 30,
            restoreManaCost: 35,
            cureDebuffsCost: 50,
            surgeryAvailable: true
          },
          shop: {
            enabled: true,
            merchantName: "Medical Dispenser Unit",
            merchantTitle: "Pharmaceutical Synthesis Unit",
            items: ["Health Stimpack", "Nano Med-Stim", "Emergency Adrenaline Stim"],
            allowSell: true
          }
        }
      };
    } else if (presetType === "hotel_safehouse") {
      preset = {
        name: "Aurus Neon Safehouse & Sleeping Pods",
        category: "safehouse",
        dangerRating: "Safe",
        bgImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
        desc: "Reinforced blast-door apartment equipped with oxygen scrubbers, biometric locks, and sleeping pods.",
        services: {
          rest: {
            enabled: true,
            innkeeperName: "Concierge Subroutine",
            rentRoomCost: 20,
            staminaRestore: 80,
            hpRestore: 40,
            advanceHours: 8,
            flavorText: "Pressurized hermetic pod. Shields from external electromagnetic surveillance."
          }
        }
      };
    }

    setPoiForm(prev => ({
      ...prev,
      ...preset,
      services: {
        ...prev.services,
        ...(preset.services || {})
      }
    }));
    triggerToast(`Applied template: ${preset.name || presetType}`);
  };

  // Save POI Changes
  const handleSavePOI = () => {
    setCustomPOIs(prev => {
      const idx = prev.findIndex(p => p.id === poiForm.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = poiForm;
        return next;
      }
      return [...prev, poiForm];
    });

    // Also synchronize into gameState customPOIsRegistry
    setGameState(prev => {
      const currentRegistry = prev.customPOIsRegistry || [];
      const idx = currentRegistry.findIndex(p => p.id === poiForm.id);
      let nextReg = [...currentRegistry];
      if (idx >= 0) {
        nextReg[idx] = poiForm;
      } else {
        nextReg.push(poiForm);
      }
      return {
        ...prev,
        customPOIsRegistry: nextReg
      };
    });

    triggerToast(`Saved & Synced POI: "${poiForm.name}"`);
  };

  // Duplicate POI
  const handleDuplicatePOI = () => {
    const duplicated: CustomPOIData = {
      ...poiForm,
      id: `poi_${Date.now()}`,
      name: `${poiForm.name} (Copy)`,
      x: Math.min(90, poiForm.x + 5),
      y: Math.min(90, poiForm.y + 5)
    };

    setCustomPOIs(prev => [...prev, duplicated]);
    setSelectedPoiId(duplicated.id);
    setPoiForm(duplicated);
    triggerToast(`Duplicated POI to "${duplicated.name}"`);
  };

  // Delete POI
  const handleDeletePOI = () => {
    if (customPOIs.length <= 1) {
      triggerToast("Cannot delete the only remaining custom POI.");
      return;
    }

    setCustomPOIs(prev => prev.filter(p => p.id !== poiForm.id));
    const nextRemaining = customPOIs.find(p => p.id !== poiForm.id);
    if (nextRemaining) {
      setSelectedPoiId(nextRemaining.id);
      setPoiForm(nextRemaining);
    }
    triggerToast("Deleted POI.");
  };

  // Teleport in-game live
  const handleTestPOILive = () => {
    handleSavePOI();
    setGameState(prev => ({
      ...prev,
      district: poiForm.district,
      poi: poiForm.name
    }));

    if (onNavigateToPOI) {
      onNavigateToPOI(poiForm);
    }
    triggerToast(`🚀 Teleported into "${poiForm.name}" [${poiForm.district}]`);
  };

  // Filtered POI list
  const filteredPOIs = customPOIs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDist = filterDistrict === "all" || p.district === filterDistrict;
    return matchesSearch && matchesDist;
  });

  // Current district for visual map
  const activeRegion = REGIONS.find(r => r.id === poiForm.district) || REGIONS[0];

  // Available Scenes from DEFAULT_POI_INTERACTIVE_SCENES + gameState.poiInteractiveScenes
  const allScenes: Record<string, POIInteractiveEvent> = {
    ...DEFAULT_POI_INTERACTIVE_SCENES,
    ...(gameState.poiInteractiveScenes || {})
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[600px] text-slate-100 font-mono">
      
      {/* LEFT SIDEBAR: POI BROWSER & ARCHETYPES */}
      <div className="w-full lg:w-80 flex flex-col gap-3 shrink-0 bg-slate-950/90 border border-cyan-500/20 rounded-xl p-3 shadow-xl">
        
        {/* Header & Quick Action */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-cyan-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-white">World & Interior POIs</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-3xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_8px_rgba(6,182,212,0.4)]"
          >
            <Plus size={11} /> New POI
          </button>
        </div>

        {/* Preset Archetype Template Picker */}
        <div className="p-2 bg-slate-900/60 border border-white/5 rounded-lg flex flex-col gap-1.5">
          <span className="text-4xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={10} className="text-amber-400" /> Quick Archetype Generator:
          </span>
          <div className="grid grid-cols-3 gap-1 text-4xs">
            <button
              onClick={() => handleApplyPresetTemplate("cantina_auction")}
              className="px-1.5 py-1 rounded bg-purple-950/60 border border-purple-500/30 hover:border-purple-400 text-purple-200 font-bold truncate cursor-pointer"
            >
              🍸 Bar & Auction
            </button>
            <button
              onClick={() => handleApplyPresetTemplate("cyber_clinic")}
              className="px-1.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-200 font-bold truncate cursor-pointer"
            >
              🏥 Ripperdoc
            </button>
            <button
              onClick={() => handleApplyPresetTemplate("hotel_safehouse")}
              className="px-1.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 font-bold truncate cursor-pointer"
            >
              🏨 Safehouse
            </button>
          </div>
        </div>

        {/* Search & District Filter */}
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Search POIs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
          />

          <select
            value={filterDistrict}
            onChange={e => setFilterDistrict(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-xs text-slate-300 focus:border-cyan-400 outline-none cursor-pointer"
          >
            <option value="all">All World Districts</option>
            {REGIONS.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
            ))}
          </select>
        </div>

        {/* POI List */}
        <div className="flex-1 min-h-[300px] max-h-[450px] overflow-y-auto space-y-1.5 pr-1">
          {filteredPOIs.map(poi => {
            const isSelected = poi.id === poiForm.id;
            const svcs = poi.services || {};

            return (
              <button
                key={poi.id}
                onClick={() => handleSelectPOI(poi)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/80 border-cyan-400/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-900 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs truncate">{poi.name}</span>
                  <span className="text-4xs px-1.5 py-0.2 rounded bg-slate-950 border border-white/10 text-cyan-400 shrink-0 uppercase">
                    {poi.district}
                  </span>
                </div>

                <div className="flex items-center justify-between text-4xs text-slate-400">
                  <span>Coords: {poi.x}%, {poi.y}%</span>
                  <div className="flex items-center gap-1">
                    {svcs.shop?.enabled && <span title="Merchant Shop">🛒</span>}
                    {svcs.clinic?.enabled && <span title="Medical Clinic">🏥</span>}
                    {svcs.rest?.enabled && <span title="Rest Safehouse">🏨</span>}
                    {svcs.auction?.enabled && <span title="Underworld Auction">⛓️</span>}
                    {svcs.contracts?.enabled && <span title="Job Board">📜</span>}
                    {svcs.rumors?.enabled && <span title="Rumors">👂</span>}
                    {poi.questTrigger?.linkedSceneId && <span title="Quest Scene Linked">🎬</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: POI EDITOR */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 bg-slate-950/90 border border-cyan-500/20 rounded-xl p-4 shadow-xl">
        
        {/* Editor Top Bar & Tab Switcher */}
        <div className="flex flex-col gap-2 border-b border-white/10 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-3xs uppercase tracking-widest text-cyan-400 font-bold">POI ARCHITECT // {poiForm.id}</span>
              <h2 className="text-base font-black text-white">{poiForm.name}</h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleSavePOI}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              >
                <Check size={13} /> Save POI
              </button>

              <button
                onClick={handleDuplicatePOI}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Copy size={13} /> Duplicate
              </button>

              <button
                onClick={handleTestPOILive}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              >
                <Zap size={13} /> Test Live In-Game
              </button>

              <button
                onClick={handleDeletePOI}
                className="px-2 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold cursor-pointer"
                title="Delete POI"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Service Configuration Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "general" ? "bg-cyan-950 border border-cyan-400 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              📌 General & Atmosphere
            </button>

            <button
              onClick={() => setActiveTab("map_coords")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "map_coords" ? "bg-cyan-950 border border-cyan-400 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🗺️ Visual Map Pin ({poiForm.x}%, {poiForm.y}%)
            </button>

            <button
              onClick={() => setActiveTab("quest_scene")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "quest_scene" ? "bg-purple-950 border border-purple-400 text-purple-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🎬 Quest & Scene Trigger
            </button>

            <button
              onClick={() => setActiveTab("shop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "shop" ? "bg-amber-950 border border-amber-400 text-amber-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🛒 Shop {poiForm.services?.shop?.enabled ? "✓" : ""}
            </button>

            <button
              onClick={() => setActiveTab("clinic")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "clinic" ? "bg-emerald-950 border border-emerald-400 text-emerald-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🏥 Clinic {poiForm.services?.clinic?.enabled ? "✓" : ""}
            </button>

            <button
              onClick={() => setActiveTab("rest")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "rest" ? "bg-cyan-950 border border-cyan-400 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              🏨 Safehouse {poiForm.services?.rest?.enabled ? "✓" : ""}
            </button>

            <button
              onClick={() => setActiveTab("auction")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "auction" ? "bg-purple-950 border border-purple-400 text-purple-300" : "text-slate-400 hover:text-white"
              }`}
            >
              ⛓️ Auction {poiForm.services?.auction?.enabled ? "✓" : ""}
            </button>

            <button
              onClick={() => setActiveTab("contracts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "contracts" ? "bg-indigo-950 border border-indigo-400 text-indigo-300" : "text-slate-400 hover:text-white"
              }`}
            >
              📜 Job Board
            </button>

            <button
              onClick={() => setActiveTab("rumors")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "rumors" ? "bg-rose-950 border border-rose-400 text-rose-300" : "text-slate-400 hover:text-white"
              }`}
            >
              👂 Rumors
            </button>

            <button
              onClick={() => setActiveTab("actions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === "actions" ? "bg-slate-800 border border-cyan-400 text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Stat Checks ({poiForm.actions?.length || 0})
            </button>
          </div>
        </div>

        {/* TAB 1: GENERAL & ATMOSPHERE */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-1">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Location Display Name</label>
                <input
                  type="text"
                  value={poiForm.name}
                  onChange={e => setPoiForm({ ...poiForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Target District</label>
                  <select
                    value={poiForm.district}
                    onChange={e => setPoiForm({ ...poiForm, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-cyan-300 focus:border-cyan-400 outline-none cursor-pointer"
                  >
                    {REGIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Category Archetype</label>
                  <select
                    value={poiForm.category}
                    onChange={e => setPoiForm({ ...poiForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none cursor-pointer"
                  >
                    <option value="social">Social / Cantina / Bar</option>
                    <option value="shop">Marketplace / Arms Vendor</option>
                    <option value="medical">Clinic / Ripperdoc Bay</option>
                    <option value="safehouse">Safehouse / Pod Bunks</option>
                    <option value="auction">Underworld Auction & Slaves</option>
                    <option value="combat">Combat Arena / Zone</option>
                    <option value="temple">Technomantic Shrine</option>
                    <option value="quest">Quest Landmark</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Danger Rating</label>
                  <select
                    value={poiForm.dangerRating || "Low"}
                    onChange={e => setPoiForm({ ...poiForm, dangerRating: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-amber-300 focus:border-cyan-400 outline-none cursor-pointer"
                  >
                    <option value="Safe">Safe (Green Zone)</option>
                    <option value="Low">Low Danger (Yellow)</option>
                    <option value="Medium">Medium Danger (Orange)</option>
                    <option value="High">High Danger (Red)</option>
                    <option value="Lethal">Lethal (Purple/Black)</option>
                  </select>
                </div>

                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Fast-Travel Cost (Credits)</label>
                  <input
                    type="number"
                    value={poiForm.fastTravelCost || 0}
                    onChange={e => setPoiForm({ ...poiForm, fastTravelCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Atmospheric Narrative Description</label>
                <textarea
                  rows={4}
                  value={poiForm.desc}
                  onChange={e => setPoiForm({ ...poiForm, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Scenery Backdrop Picker */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Scenic Backdrop Artwork URL</label>
                <input
                  type="text"
                  value={poiForm.bgImage || ""}
                  onChange={e => setPoiForm({ ...poiForm, bgImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              {/* Preset Image Swatches */}
              <div>
                <span className="text-4xs uppercase font-bold text-slate-500 block mb-1">Preset Scenic Backdrops:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SCENIC_BACKGROUNDS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPoiForm({ ...poiForm, bgImage: preset.url })}
                      className="text-left p-1.5 rounded bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-400 text-4xs text-slate-300 truncate cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Image Preview */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 h-44 bg-slate-950">
                <img
                  src={poiForm.bgImage || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800"}
                  alt="Backdrop Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-3xs font-bold text-cyan-300">SCENERY PREVIEW</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL MAP PIN & COORDINATES */}
        {activeTab === "map_coords" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-cyan-500/20 rounded-xl">
              <div>
                <span className="text-2xs font-extrabold text-cyan-300 uppercase">Interactive District Grid Locator</span>
                <p className="text-3xs text-slate-400">Click anywhere on the map viewport to place or update this POI's pin coordinates.</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-white bg-slate-950 px-3 py-1 rounded border border-white/10">
                <span>X: <span className="text-cyan-400">{poiForm.x}%</span></span>
                <span>Y: <span className="text-cyan-400">{poiForm.y}%</span></span>
              </div>
            </div>

            {/* Interactive Clickable District Map Canvas */}
            <div
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setPoiForm({ ...poiForm, x: Math.max(5, Math.min(95, clickX)), y: Math.max(5, Math.min(95, clickY)) });
                triggerToast(`Pin updated to (${clickX}%, ${clickY}%)`);
              }}
              className="relative rounded-xl overflow-hidden border-2 border-cyan-500/40 h-80 bg-slate-950 cursor-crosshair group shadow-inner"
            >
              <img
                src={activeRegion.bgImage}
                alt={activeRegion.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60 filter saturate-150"
              />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:25px_25px]" />

              {/* Render Other POI Pins for Context */}
              {customPOIs.filter(p => p.district === poiForm.district && p.id !== poiForm.id).map(other => (
                <div
                  key={other.id}
                  style={{ left: `${other.x}%`, top: `${other.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 p-1 pointer-events-none opacity-50"
                >
                  <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-400 flex items-center justify-center text-4xs">
                    📍
                  </div>
                  <span className="absolute top-5 left-1/2 -translate-x-1/2 text-4xs text-slate-400 whitespace-nowrap bg-slate-950/80 px-1 rounded">
                    {other.name}
                  </span>
                </div>
              ))}

              {/* Active Draggable Pin Target */}
              <div
                style={{ left: `${poiForm.x}%`, top: `${poiForm.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-cyan-500 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,1)] flex items-center justify-center text-slate-950 font-bold text-xs animate-bounce">
                    📍
                  </div>
                  <span className="absolute -top-6 bg-cyan-950 border border-cyan-400 text-cyan-300 text-3xs font-black px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                    {poiForm.name} ({poiForm.x}%, {poiForm.y}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Adjusters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Horizontal Position X: {poiForm.x}%</label>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={poiForm.x}
                  onChange={e => setPoiForm({ ...poiForm, x: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Vertical Position Y: {poiForm.y}%</label>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={poiForm.y}
                  onChange={e => setPoiForm({ ...poiForm, y: parseInt(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUEST & SCENE TRIGGER */}
        {activeTab === "quest_scene" && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl">
              <span className="text-2xs font-extrabold text-purple-300 uppercase block">Interactive Scene & Cinematic Hook</span>
              <p className="text-3xs text-slate-300 mt-1">
                Link this physical POI directly to a multi-branching node sequence or quest heist from the Scene Studio.
              </p>
            </div>

            <div>
              <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Target Interactive Scene ID</label>
              <select
                value={poiForm.questTrigger?.linkedSceneId || ""}
                onChange={e => setPoiForm({
                  ...poiForm,
                  questTrigger: {
                    ...(poiForm.questTrigger || {}),
                    linkedSceneId: e.target.value || undefined
                  }
                })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-xs text-purple-200 focus:border-purple-400 outline-none cursor-pointer"
              >
                <option value="">-- No Scene Linked (Standard Interior Hub) --</option>
                {Object.entries(allScenes).map(([sId, sc]) => (
                  <option key={sId} value={sId}>{sc.title} ({sId})</option>
                ))}
              </select>
            </div>

            {poiForm.questTrigger?.linkedSceneId && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Trigger Execution Mode</label>
                    <select
                      value={poiForm.questTrigger?.triggerCondition || "manual_button"}
                      onChange={e => setPoiForm({
                        ...poiForm,
                        questTrigger: {
                          ...(poiForm.questTrigger || {}),
                          triggerCondition: e.target.value as any
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none cursor-pointer"
                    >
                      <option value="manual_button">Manual Button in Interior Hub</option>
                      <option value="always_on_enter">Intercept On Every Visit</option>
                      <option value="first_time_only">Intercept On First Visit Only</option>
                      <option value="if_active_quest">Trigger If Active Quest Matches</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Interactive Button Label</label>
                    <input
                      type="text"
                      value={poiForm.questTrigger?.triggerButtonLabel || "⚡ Launch Scene Event"}
                      onChange={e => setPoiForm({
                        ...poiForm,
                        questTrigger: {
                          ...(poiForm.questTrigger || {}),
                          triggerButtonLabel: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                {onOpenSceneInEditor && (
                  <button
                    onClick={() => onOpenSceneInEditor(poiForm.questTrigger?.linkedSceneId!)}
                    className="py-2 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} /> Open Target Scene in Scene Studio
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: SHOP / MERCHANT FACILITY */}
        {activeTab === "shop" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-amber-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase">Commercial Merchant & Trade Service</span>
                <p className="text-3xs text-slate-400">Allows players to purchase weaponry, tech stims, and sell scavenged inventory.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={poiForm.services?.shop?.enabled || false}
                  onChange={e => setPoiForm({
                    ...poiForm,
                    services: {
                      ...poiForm.services,
                      shop: {
                        ...(poiForm.services?.shop || {}),
                        enabled: e.target.checked
                      }
                    }
                  })}
                  className="accent-amber-400 w-4 h-4"
                />
                ENABLE SHOP
              </label>
            </div>

            {poiForm.services?.shop?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Merchant Name</label>
                    <input
                      type="text"
                      value={poiForm.services.shop.merchantName || "Fixer Corvus"}
                      onChange={e => setPoiForm({
                        ...poiForm,
                        services: {
                          ...poiForm.services,
                          shop: { ...poiForm.services?.shop, merchantName: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Merchant Title / Role</label>
                    <input
                      type="text"
                      value={poiForm.services.shop.merchantTitle || "Arms & Hardware Vendor"}
                      onChange={e => setPoiForm({
                        ...poiForm,
                        services: {
                          ...poiForm.services,
                          shop: { ...poiForm.services?.shop, merchantTitle: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Price Multiplier (e.g. 1.0, 1.25)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={poiForm.services.shop.priceMultiplier || 1.0}
                      onChange={e => setPoiForm({
                        ...poiForm,
                        services: {
                          ...poiForm.services,
                          shop: { ...poiForm.services?.shop, priceMultiplier: parseFloat(e.target.value) || 1.0 }
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-3xs uppercase font-bold text-slate-400 block">Stocked Items (comma separated)</label>
                  <textarea
                    rows={4}
                    value={(poiForm.services.shop.items || []).join(", ")}
                    onChange={e => setPoiForm({
                      ...poiForm,
                      services: {
                        ...poiForm.services,
                        shop: {
                          ...poiForm.services?.shop,
                          items: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                        }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-amber-200 outline-none"
                  />
                  <span className="text-4xs text-slate-500">Example: Health Stimpack, Cyber-Ammo Pack, Energy Cell, Tactical Cyber-SMG</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CLINIC & CYBERDOC */}
        {activeTab === "clinic" && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase">Cyber-Clinic & Surgery Bay</span>
                <p className="text-3xs text-slate-400">Heals HP, recharges psychic Ether/Mana pools, and cures conditions.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={poiForm.services?.clinic?.enabled || false}
                  onChange={e => setPoiForm({
                    ...poiForm,
                    services: {
                      ...poiForm.services,
                      clinic: {
                        ...(poiForm.services?.clinic || {}),
                        enabled: e.target.checked
                      }
                    }
                  })}
                  className="accent-emerald-400 w-4 h-4"
                />
                ENABLE CLINIC
              </label>
            </div>

            {poiForm.services?.clinic?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={poiForm.services.clinic.doctorName || "Dr. Valerie Cross"}
                    onChange={e => setPoiForm({
                      ...poiForm,
                      services: {
                        ...poiForm.services,
                        clinic: { ...poiForm.services?.clinic, doctorName: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Full HP Heal Cost (¤)</label>
                  <input
                    type="number"
                    value={poiForm.services.clinic.healHpCost || 35}
                    onChange={e => setPoiForm({
                      ...poiForm,
                      services: {
                        ...poiForm.services,
                        clinic: { ...poiForm.services?.clinic, healHpCost: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Mana Recharge Cost (¤)</label>
                  <input
                    type="number"
                    value={poiForm.services.clinic.restoreManaCost || 40}
                    onChange={e => setPoiForm({
                      ...poiForm,
                      services: {
                        ...poiForm.services,
                        clinic: { ...poiForm.services?.clinic, restoreManaCost: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: REST & SAFEHOUSE */}
        {activeTab === "rest" && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase">Rest & Sleeping Pod Safehouse</span>
                <p className="text-3xs text-slate-400">Allows resting to restore stamina/fatigue and advance time of day.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={poiForm.services?.rest?.enabled || false}
                  onChange={e => setPoiForm({
                    ...poiForm,
                    services: {
                      ...poiForm.services,
                      rest: {
                        ...(poiForm.services?.rest || {}),
                        enabled: e.target.checked
                      }
                    }
                  })}
                  className="accent-cyan-400 w-4 h-4"
                />
                ENABLE SAFEHOUSE REST
              </label>
            </div>

            {poiForm.services?.rest?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Room Rental Cost (¤)</label>
                  <input
                    type="number"
                    value={poiForm.services.rest.rentRoomCost ?? 25}
                    onChange={e => setPoiForm({
                      ...poiForm,
                      services: {
                        ...poiForm.services,
                        rest: { ...poiForm.services?.rest, rentRoomCost: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-3xs uppercase font-bold text-slate-400 block mb-1">Stamina Restore Amount</label>
                  <input
                    type="number"
                    value={poiForm.services.rest.staminaRestore || 60}
                    onChange={e => setPoiForm({
                      ...poiForm,
                      services: {
                        ...poiForm.services,
                        rest: { ...poiForm.services?.rest, staminaRestore: parseInt(e.target.value) || 0 }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: AUCTION & SLAVE / MERC RECRUITS */}
        {activeTab === "auction" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-purple-500/30 rounded-xl">
              <div>
                <span className="text-xs font-bold text-purple-300 uppercase">Underworld Auction & Slave Pens</span>
                <p className="text-3xs text-slate-400">Configure auction lots for captive slaves, mercenary shock-troopers, or contraband.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-purple-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={poiForm.services?.auction?.enabled || false}
                  onChange={e => setPoiForm({
                    ...poiForm,
                    services: {
                      ...poiForm.services,
                      auction: {
                        ...(poiForm.services?.auction || {}),
                        enabled: e.target.checked
                      }
                    }
                  })}
                  className="accent-purple-400 w-4 h-4"
                />
                ENABLE AUCTION
              </label>
            </div>

            {poiForm.services?.auction?.enabled && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xs font-bold text-slate-300">Auction Lots ({(poiForm.services.auction.lots || []).length})</span>
                  <button
                    onClick={() => {
                      const newLot: POIAuctionLot = {
                        id: `lot_${Date.now()}`,
                        name: "Syndicate Operative (Slave / Contract)",
                        type: "slave",
                        price: 300,
                        desc: "Bio-restrained tactical specialist.",
                        stats: "DEX: 14, STR: 12"
                      };
                      setPoiForm({
                        ...poiForm,
                        services: {
                          ...poiForm.services,
                          auction: {
                            ...poiForm.services?.auction,
                            lots: [...(poiForm.services?.auction?.lots || []), newLot]
                          }
                        }
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-3xs uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Auction Lot
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
                  {(poiForm.services.auction.lots || []).map((lot, lIdx) => (
                    <div key={lot.id} className="p-3 rounded-lg bg-slate-900 border border-purple-500/20 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={lot.name}
                          onChange={e => {
                            const lots = [...(poiForm.services?.auction?.lots || [])];
                            lots[lIdx].name = e.target.value;
                            setPoiForm({ ...poiForm, services: { ...poiForm.services, auction: { ...poiForm.services?.auction, lots } } });
                          }}
                          className="font-bold text-xs text-purple-200 bg-slate-950 px-2 py-1 rounded border border-white/10 w-2/3"
                        />
                        <button
                          onClick={() => {
                            const lots = poiForm.services?.auction?.lots?.filter((_, i) => i !== lIdx);
                            setPoiForm({ ...poiForm, services: { ...poiForm.services, auction: { ...poiForm.services?.auction, lots } } });
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Price (¤)"
                          value={lot.price}
                          onChange={e => {
                            const lots = [...(poiForm.services?.auction?.lots || [])];
                            lots[lIdx].price = parseInt(e.target.value) || 0;
                            setPoiForm({ ...poiForm, services: { ...poiForm.services, auction: { ...poiForm.services?.auction, lots } } });
                          }}
                          className="text-xs text-amber-300 bg-slate-950 px-2 py-1 rounded border border-white/10"
                        />

                        <select
                          value={lot.type}
                          onChange={e => {
                            const lots = [...(poiForm.services?.auction?.lots || [])];
                            lots[lIdx].type = e.target.value as any;
                            setPoiForm({ ...poiForm, services: { ...poiForm.services, auction: { ...poiForm.services?.auction, lots } } });
                          }}
                          className="text-xs text-white bg-slate-950 px-2 py-1 rounded border border-white/10 cursor-pointer"
                        >
                          <option value="slave">Slave Contract</option>
                          <option value="mercenary">Mercenary Operative</option>
                          <option value="cyberware">Rare Cyberware</option>
                          <option value="artifact">Contraband Artifact</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Description"
                        value={lot.desc}
                        onChange={e => {
                          const lots = [...(poiForm.services?.auction?.lots || [])];
                          lots[lIdx].desc = e.target.value;
                          setPoiForm({ ...poiForm, services: { ...poiForm.services, auction: { ...poiForm.services?.auction, lots } } });
                        }}
                        className="text-3xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-white/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: STAT-CHECK OPERATIONS & ACTIONS */}
        {activeTab === "actions" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold text-cyan-400 uppercase">Immediate Stat Checks & Operational Responses</span>
              <button
                onClick={() => {
                  const newAction: CustomPOIAction = {
                    id: `act_${Date.now()}`,
                    label: "Hack Local Sub-Terminal (INT Check)",
                    desc: "Bypass corporate firewall to extract encrypted data shards.",
                    statCheck: "[Intelligence 12]",
                    actionType: "custom",
                    rewardXP: 35,
                    rewardCredits: 50
                  };
                  setPoiForm({ ...poiForm, actions: [...(poiForm.actions || []), newAction] });
                }}
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-3xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Add Stat Check Action
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
              {(poiForm.actions || []).map((act, aIdx) => (
                <div key={act.id} className="p-3 bg-slate-900 border border-cyan-500/20 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={act.label}
                      onChange={e => {
                        const acts = [...(poiForm.actions || [])];
                        acts[aIdx].label = e.target.value;
                        setPoiForm({ ...poiForm, actions: acts });
                      }}
                      className="font-bold text-xs text-cyan-200 bg-slate-950 px-2 py-1 rounded border border-white/10 w-3/4"
                    />
                    <button
                      onClick={() => {
                        const acts = poiForm.actions.filter((_, i) => i !== aIdx);
                        setPoiForm({ ...poiForm, actions: acts });
                      }}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Prerequisite (e.g. [Strength 14], [Mindmancer Level 2])"
                    value={act.statCheck || ""}
                    onChange={e => {
                      const acts = [...(poiForm.actions || [])];
                      acts[aIdx].statCheck = e.target.value;
                      setPoiForm({ ...poiForm, actions: acts });
                    }}
                    className="text-3xs text-amber-300 bg-slate-950 px-2 py-1 rounded border border-white/10"
                  />

                  <input
                    type="text"
                    placeholder="Narrative Description"
                    value={act.desc || ""}
                    onChange={e => {
                      const acts = [...(poiForm.actions || [])];
                      acts[aIdx].desc = e.target.value;
                      setPoiForm({ ...poiForm, actions: acts });
                    }}
                    className="text-3xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-white/10"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
