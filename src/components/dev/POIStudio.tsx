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
  Shield
} from "lucide-react";
import { MapPOI, MAP_POIS, REGIONS } from "../../data";
import { GameState } from "../../types";
import { CustomWorldItem } from "./ItemForgeStudio";
import { CustomCharacter } from "./NPCStudio";

export interface CustomPOIAction {
  id: string;
  label: string;
  desc: string;
  cost?: number;
  statCheck?: string; // e.g. "[Intelligence 12]"
  actionType: "dialogue" | "shop" | "combat" | "rumor" | "event" | "rest" | "custom";
  targetNpcId?: string;
  targetEventId?: string;
  rewardCredits?: number;
  rewardXP?: number;
}

export interface CustomPOIData {
  id: string;
  name: string;
  district: string;
  category: "safehouse" | "social" | "shop" | "combat" | "temple" | "quest" | "auction" | "medical";
  desc: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  bgImage?: string;
  isUnlocked: boolean;
  
  // Interior Activities
  actions: CustomPOIAction[];
  
  // Placed NPCs in this POI
  placedNPCIds: string[];

  // Combat Configuration (if combat POI)
  isCombatZone: boolean;
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

  // Entry Event Trigger
  entryEventId?: string;
}

interface POIStudioProps {
  customPOIs: CustomPOIData[];
  setCustomPOIs: React.Dispatch<React.SetStateAction<CustomPOIData[]>>;
  customItems: CustomWorldItem[];
  customNPCs: CustomCharacter[];
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
  onNavigateToPOI?: (poi: CustomPOIData) => void;
}

const PRESET_SCENIC_BACKGROUNDS = [
  { name: "Neon Cyber Bar / Club", url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800" },
  { name: "Underground Safehouse", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" },
  { name: "Cyber-Clinic Surgery", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800" },
  { name: "Dark Pit Arena", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800" },
  { name: "Black Market Slave Pens", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800" },
  { name: "Corporate Penthouse", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800" },
  { name: "Technomantic Cathedral", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800" },
  { name: "Rain-Slicked Canal Docks", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800" }
];

export const POIStudio: React.FC<POIStudioProps> = ({
  customPOIs,
  setCustomPOIs,
  customItems,
  customNPCs,
  gameState,
  setGameState,
  triggerToast,
  onNavigateToPOI
}) => {
  const [selectedPoiId, setSelectedPoiId] = useState<string>(customPOIs[0]?.id || "new");
  const [activeTab, setActiveTab] = useState<"overview" | "activities" | "npcs" | "combat">("overview");

  // Form state
  const [poiForm, setPoiForm] = useState<CustomPOIData>({
    id: `poi_${Date.now()}`,
    name: "The Velvet Coil (Syndicate Bar & Auction)",
    district: "aurus",
    category: "social",
    desc: "A subterranean neon bar where high-level corporate data couriers, hired blades, and contract auctioneers broker underworld deals.",
    x: 45,
    y: 55,
    bgImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
    isUnlocked: true,
    actions: [
      {
        id: "act_1",
        label: "Order Pure Synth-Whiskey",
        desc: "Restores 40 HP and relaxes neural tension. (15¤)",
        cost: 15,
        actionType: "rest",
        rewardCredits: 0
      },
      {
        id: "act_2",
        label: "Eavesdrop on Corporate Smugglers",
        desc: "[Perception 12] Listen in on private booth conversations.",
        statCheck: "[Perception 12]",
        actionType: "rumor",
        rewardXP: 30
      },
      {
        id: "act_3",
        label: "Inspect Holding Pens & Slave Auction",
        desc: "Step through the reinforced steel curtains into the private auction room.",
        actionType: "dialogue",
        targetNpcId: "Elena Rostova"
      }
    ],
    placedNPCIds: ["Elena Rostova", "Mira Voss"],
    isCombatZone: false,
    enemyUnitName: "Syndicate Bouncers",
    enemyHp: 140,
    enemyShields: 20,
    enemyAtk: 22,
    enemyDesc: "Heavy cyber-enforcers equipped with arc-batons.",
    isCapturable: true,
    victoryCredits: 120,
    victoryXP: 65,
    victoryItemDrop: "Singularity Overcharger"
  });

  const handleSelectExisting = (poi: CustomPOIData) => {
    setSelectedPoiId(poi.id);
    setPoiForm({ ...poi });
  };

  const handleCreateNew = () => {
    const newId = `poi_${Date.now()}`;
    const newPoi: CustomPOIData = {
      id: newId,
      name: "New District Location",
      district: gameState.district || "conduit09",
      category: "social",
      desc: "An atmospheric point of interest in the Megacity.",
      x: 50,
      y: 50,
      bgImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
      isUnlocked: true,
      actions: [
        {
          id: `act_${Date.now()}`,
          label: "Inquire with Locals",
          desc: "Gather intelligence on regional activities.",
          actionType: "rumor",
          rewardXP: 15
        }
      ],
      placedNPCIds: [],
      isCombatZone: false,
      enemyUnitName: "Hostile Squad",
      enemyHp: 100,
      enemyShields: 10,
      enemyAtk: 15,
      isCapturable: false,
      victoryCredits: 50,
      victoryXP: 25
    };
    setSelectedPoiId(newId);
    setPoiForm(newPoi);
  };

  const handleSavePOI = () => {
    if (!poiForm.name.trim()) {
      triggerToast("ERROR: POI Name is required!");
      return;
    }

    setCustomPOIs(prev => {
      const idx = prev.findIndex(p => p.id === poiForm.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = poiForm;
        return next;
      }
      return [...prev, poiForm];
    });

    triggerToast(`POI SAVED: "${poiForm.name}" registered to District Map!`);
  };

  const handleAddAction = () => {
    const newAct: CustomPOIAction = {
      id: `act_${Date.now()}`,
      label: "New Interior Action",
      desc: "Describe what happens when the player clicks this action.",
      actionType: "rumor",
      rewardCredits: 0,
      rewardXP: 20
    };
    setPoiForm({
      ...poiForm,
      actions: [...(poiForm.actions || []), newAct]
    });
  };

  const handleRemoveAction = (id: string) => {
    setPoiForm({
      ...poiForm,
      actions: (poiForm.actions || []).filter(a => a.id !== id)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden text-xs font-mono">
      
      {/* LEFT COLUMN: POI List & Categories */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden border-r border-cyan-500/20 pr-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <MapPin size={16} />
            <span>District Locations</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1 rounded font-bold uppercase cursor-pointer text-3xs transition-all"
          >
            + New POI
          </button>
        </div>

        <p className="text-3xs text-slate-400 font-sans">
          Design locations: Bars, Safehouses, Slave Auctions, Cyber-Clinics, and Combat Arenas with custom interior activities.
        </p>

        {/* POI List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {customPOIs.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-cyan-500/30 text-center text-slate-500 text-2xs">
              No custom POIs created yet. Click "+ New POI" to author custom interior locations!
            </div>
          ) : (
            customPOIs.map(poi => {
              const isSelected = selectedPoiId === poi.id;
              return (
                <div
                  key={poi.id}
                  onClick={() => handleSelectExisting(poi)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]" 
                      : "bg-slate-950/70 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-200 truncate">{poi.name}</span>
                    <span className={`text-3xs px-1.5 py-0.5 rounded font-bold uppercase ${
                      poi.isCombatZone ? "bg-red-950 text-red-300 border border-red-500/40" :
                      poi.category === "auction" ? "bg-purple-950 text-purple-300 border border-purple-500/40" :
                      poi.category === "shop" ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40" :
                      "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {poi.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-3xs text-slate-400">
                    <span className="capitalize text-cyan-400/80">District: {REGIONS[poi.district]?.name.split(" ")[0] || poi.district}</span>
                    <span>{poi.actions?.length || 0} Activities</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Full POI Architect Studio */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Top Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="text-cyan-400" size={18} />
            <div>
              <span className="font-bold text-sm text-white uppercase tracking-wider">{poiForm.name || "Untitled POI"}</span>
              <span className="text-3xs text-cyan-400 block uppercase font-mono">{REGIONS[poiForm.district]?.name || poiForm.district} • {poiForm.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePOI}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 rounded font-black uppercase cursor-pointer text-2xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              <Check size={13} /> Save POI
            </button>
            {customPOIs.some(p => p.id === poiForm.id) && (
              <button
                onClick={() => {
                  setCustomPOIs(prev => prev.filter(p => p.id !== poiForm.id));
                  triggerToast("POI deleted.");
                  handleCreateNew();
                }}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 p-1.5 rounded cursor-pointer"
                title="Delete POI"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 border-b border-white/10 pb-2">
          {[
            { id: "overview", label: "Location & Visuals", icon: MapPin },
            { id: "activities", label: `Activities (${poiForm.actions?.length || 0})`, icon: Activity },
            { id: "npcs", label: `Assigned NPCs (${poiForm.placedNPCIds?.length || 0})`, icon: Users },
            { id: "combat", label: poiForm.isCombatZone ? "Combat Arena (Active)" : "Combat Arena", icon: Swords }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold uppercase text-2xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & SCENIC VISUALS */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-3xs text-cyan-400 uppercase font-bold">POI Display Name</label>
                <input
                  type="text"
                  value={poiForm.name}
                  onChange={e => setPoiForm({ ...poiForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-cyan-400 uppercase font-bold">Assigned District Region</label>
                <select
                  value={poiForm.district}
                  onChange={e => setPoiForm({ ...poiForm, district: e.target.value })}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none uppercase"
                >
                  {Object.entries(REGIONS).map(([key, reg]) => (
                    <option key={key} value={key}>{reg.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-cyan-400 uppercase font-bold">Location Category</label>
                <select
                  value={poiForm.category}
                  onChange={e => setPoiForm({ ...poiForm, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none uppercase font-bold"
                >
                  <option value="social">🍸 Bar / Club / Lounge</option>
                  <option value="auction">⛓️ Slave Auction / Holding Pens</option>
                  <option value="shop">🏪 Merchant / Tech Showroom</option>
                  <option value="safehouse">🏡 Safehouse / Residential</option>
                  <option value="temple">🔮 Technomantic Temple</option>
                  <option value="medical">💉 Cyber-Clinic / Ripperdoc</option>
                  <option value="combat">⚔️ Hostile Combat Arena</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-3xs text-cyan-400 uppercase font-bold">Atmospheric Description</label>
              <textarea
                rows={3}
                value={poiForm.desc}
                onChange={e => setPoiForm({ ...poiForm, desc: e.target.value })}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-slate-200 text-2xs font-sans outline-none"
                placeholder="Describe the environment, neon lighting, crowd noise, and ambient smell..."
              />
            </div>

            {/* Scenic Background Banner Image */}
            <div className="border border-white/10 bg-slate-950/60 rounded-lg p-3 space-y-3">
              <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider block">Interior Scenic Artwork & Background</span>
              
              <div className="flex gap-3 items-center">
                {poiForm.bgImage && (
                  <img
                    src={poiForm.bgImage}
                    alt="poi bg preview"
                    className="w-28 h-18 object-cover rounded-lg border border-cyan-500 shadow-md"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={poiForm.bgImage || ""}
                    onChange={e => setPoiForm({ ...poiForm, bgImage: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded p-2 text-cyan-200 text-2xs outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-3xs text-slate-500">Displays as the atmospheric background when stepping inside this POI</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-3xs text-slate-400 uppercase font-bold block mb-1.5">Preset Cyberpunk Backgrounds:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PRESET_SCENIC_BACKGROUNDS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPoiForm({ ...poiForm, bgImage: preset.url })}
                      className="text-3xs bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400 text-slate-300 p-1.5 rounded truncate text-left cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERIOR ACTIVITIES & ACTIONS */}
        {activeTab === "activities" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider">
                Custom Activities Inside this Location
              </span>
              <button
                onClick={handleAddAction}
                className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1 rounded font-bold uppercase text-3xs cursor-pointer"
              >
                <Plus size={11} /> Add Action Button
              </button>
            </div>

            <div className="space-y-3">
              {(poiForm.actions || []).map((action, idx) => (
                <div key={action.id} className="border border-cyan-500/20 bg-slate-900/80 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-bold text-cyan-300 uppercase">Action #{idx + 1}</span>
                    <button
                      onClick={() => handleRemoveAction(action.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-3xs text-slate-400 uppercase font-bold">Button Label</label>
                      <input
                        type="text"
                        value={action.label}
                        onChange={e => {
                          const next = [...poiForm.actions];
                          next[idx].label = e.target.value;
                          setPoiForm({ ...poiForm, actions: next });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-slate-200 text-xs font-bold outline-none"
                        placeholder="e.g. Order Synth-Whiskey"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-3xs text-slate-400 uppercase font-bold">Action Type</label>
                      <select
                        value={action.actionType}
                        onChange={e => {
                          const next = [...poiForm.actions];
                          next[idx].actionType = e.target.value as any;
                          setPoiForm({ ...poiForm, actions: next });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-cyan-300 text-2xs outline-none uppercase font-bold"
                      >
                        <option value="rest">🍸 Rest / Order Drink</option>
                        <option value="rumor">👂 Eavesdrop / Gather Rumor</option>
                        <option value="dialogue">💬 Open Dialogue with NPC</option>
                        <option value="shop">🛒 Open Merchant Shop</option>
                        <option value="combat">⚔️ Initiate Combat</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Action Log / Outcome Description</label>
                    <textarea
                      rows={2}
                      value={action.desc}
                      onChange={e => {
                        const next = [...poiForm.actions];
                        next[idx].desc = e.target.value;
                        setPoiForm({ ...poiForm, actions: next });
                      }}
                      className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-slate-300 text-2xs font-sans outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <label className="text-3xs text-amber-400 uppercase font-bold">Cost (Credits ¤)</label>
                      <input
                        type="number"
                        value={action.cost || 0}
                        onChange={e => {
                          const next = [...poiForm.actions];
                          next[idx].cost = parseInt(e.target.value) || 0;
                          setPoiForm({ ...poiForm, actions: next });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded p-1 text-center text-amber-300 text-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-3xs text-purple-400 uppercase font-bold">XP Reward</label>
                      <input
                        type="number"
                        value={action.rewardXP || 0}
                        onChange={e => {
                          const next = [...poiForm.actions];
                          next[idx].rewardXP = parseInt(e.target.value) || 0;
                          setPoiForm({ ...poiForm, actions: next });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded p-1 text-center text-purple-300 text-2xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ASSIGNED NPCS */}
        {activeTab === "npcs" && (
          <div className="space-y-4">
            <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider block">
              Assign NPCs & Characters Present Inside this POI
            </span>
            <p className="text-3xs text-slate-400">
              Check the boxes below to place specific characters (Companions, Slaves in auction pens, Mercenaries, Merchants) inside this location.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {customNPCs.map(npc => {
                const isAssigned = (poiForm.placedNPCIds || []).includes(npc.name);
                return (
                  <div
                    key={npc.id}
                    onClick={() => {
                      const nextIds = isAssigned
                        ? poiForm.placedNPCIds.filter(n => n !== npc.name)
                        : [...(poiForm.placedNPCIds || []), npc.name];
                      setPoiForm({ ...poiForm, placedNPCIds: nextIds });
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isAssigned
                        ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        : "bg-slate-950/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={npc.portraitImage}
                        alt={npc.name}
                        className="w-9 h-9 object-cover rounded border border-cyan-500/30"
                      />
                      <div>
                        <span className="font-bold text-cyan-200 block">{npc.name}</span>
                        <span className="text-3xs text-slate-400">{npc.role} ({npc.characterType})</span>
                      </div>
                    </div>

                    <span className={`text-2xs font-bold px-2 py-0.5 rounded ${
                      isAssigned ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}>
                      {isAssigned ? "PRESENT" : "ABSENT"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COMBAT ARENA & ENCOUNTERS */}
        {activeTab === "combat" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-red-500/30 bg-red-950/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-2xs">
                <Swords size={16} />
                <span>Hostile Combat Zone Toggle</span>
              </div>
              <button
                onClick={() => setPoiForm({ ...poiForm, isCombatZone: !poiForm.isCombatZone })}
                className={`px-3 py-1 rounded font-bold uppercase text-2xs cursor-pointer transition-all ${
                  poiForm.isCombatZone
                    ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {poiForm.isCombatZone ? "COMBAT ACTIVE" : "PEACEFUL ZONE"}
              </button>
            </div>

            {poiForm.isCombatZone && (
              <div className="space-y-4 border border-red-500/20 bg-slate-950/80 p-3 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs text-red-400 uppercase font-bold">Enemy Squad / Boss Name</label>
                    <input
                      type="text"
                      value={poiForm.enemyUnitName || ""}
                      onChange={e => setPoiForm({ ...poiForm, enemyUnitName: e.target.value })}
                      className="w-full bg-slate-900 border border-red-500/30 rounded p-2 text-red-200 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs text-red-400 uppercase font-bold">Enemy Description / Lore</label>
                    <input
                      type="text"
                      value={poiForm.enemyDesc || ""}
                      onChange={e => setPoiForm({ ...poiForm, enemyDesc: e.target.value })}
                      className="w-full bg-slate-900 border border-red-500/30 rounded p-2 text-slate-300 text-2xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-3xs text-slate-400 uppercase">Enemy Total HP</label>
                    <input
                      type="number"
                      value={poiForm.enemyHp || 100}
                      onChange={e => setPoiForm({ ...poiForm, enemyHp: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-red-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-400 uppercase">Enemy Shields</label>
                    <input
                      type="number"
                      value={poiForm.enemyShields || 0}
                      onChange={e => setPoiForm({ ...poiForm, enemyShields: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-cyan-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-slate-400 uppercase">Attack Power</label>
                    <input
                      type="number"
                      value={poiForm.enemyAtk || 15}
                      onChange={e => setPoiForm({ ...poiForm, enemyAtk: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-center text-amber-300 text-xs"
                    />
                  </div>
                </div>

                {/* Capturable Mechanics & Loot */}
                <div className="border-t border-white/10 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-3xs text-purple-400 uppercase font-bold flex items-center gap-1.5">
                      <Lock size={12} /> Enemy Capturability (Subjugate / Capture as Slave after victory)
                    </label>
                    <input
                      type="checkbox"
                      checked={poiForm.isCapturable || false}
                      onChange={e => setPoiForm({ ...poiForm, isCapturable: e.target.checked })}
                      className="accent-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="text-3xs text-amber-400 uppercase font-bold">Victory Credits (¤)</label>
                      <input
                        type="number"
                        value={poiForm.victoryCredits || 0}
                        onChange={e => setPoiForm({ ...poiForm, victoryCredits: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-amber-500/30 rounded p-1.5 text-amber-300 text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-3xs text-purple-400 uppercase font-bold">Victory XP</label>
                      <input
                        type="number"
                        value={poiForm.victoryXP || 0}
                        onChange={e => setPoiForm({ ...poiForm, victoryXP: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-purple-500/30 rounded p-1.5 text-purple-300 text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-3xs text-cyan-400 uppercase font-bold">Victory Loot Item Drop</label>
                      <input
                        type="text"
                        value={poiForm.victoryItemDrop || ""}
                        onChange={e => setPoiForm({ ...poiForm, victoryItemDrop: e.target.value })}
                        className="w-full bg-slate-900 border border-cyan-500/30 rounded p-1.5 text-cyan-200 text-2xs"
                        placeholder="e.g. Singularity Overcharger"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
