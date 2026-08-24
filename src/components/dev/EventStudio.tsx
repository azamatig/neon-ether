import React, { useState } from "react";
import { 
  Zap, 
  Sparkles, 
  MapPin, 
  Compass, 
  Plus, 
  Trash2, 
  Check, 
  Eye, 
  Play, 
  AlertTriangle, 
  Image as ImageIcon, 
  Award, 
  Swords, 
  ShieldAlert, 
  UserPlus 
} from "lucide-react";
import { GameState } from "../../types";
import { REGIONS } from "../../data";
import { CustomWorldItem } from "./ItemForgeStudio";

export interface CustomEventChoice {
  id: string;
  text: string;
  checkType?: "none" | "str" | "int" | "dex" | "will" | "mindmancer" | "credits" | "item";
  checkValue?: number;
  cost?: number;
  itemRequired?: string;
  successOutcomeText: string;
  failureOutcomeText?: string;
  rewardCredits?: number;
  rewardXP?: number;
  rewardItem?: string;
  triggerCombat?: boolean;
  combatEnemyName?: string;
  recruitCompanion?: string;
}

export interface CustomWorldEvent {
  id: string;
  title: string;
  triggerType: "travel_region" | "poi_entry" | "random_exploration";
  triggerRegion?: string; // region id or "all"
  triggerPOIId?: string;
  bannerImage: string;
  narrativeText: string;
  choices: CustomEventChoice[];
}

interface EventStudioProps {
  customEvents: CustomWorldEvent[];
  setCustomEvents: React.Dispatch<React.SetStateAction<CustomWorldEvent[]>>;
  customItems: CustomWorldItem[];
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
  onLaunchEventLive: (event: CustomWorldEvent) => void;
}

const PRESET_EVENT_BANNERS = [
  { name: "Corpse in Rain Canal", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800" },
  { name: "Syndicate Ambush", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800" },
  { name: "Glowing Ancient Relic", url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800" },
  { name: "Abandoned Datavault", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" },
  { name: "Corporate Checkpoint", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800" },
  { name: "Wounded Hacker Alley", url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800" }
];

export const EventStudio: React.FC<EventStudioProps> = ({
  customEvents,
  setCustomEvents,
  customItems,
  gameState,
  setGameState,
  triggerToast,
  onLaunchEventLive
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(customEvents[0]?.id || "new");

  const [eventForm, setEventForm] = useState<CustomWorldEvent>({
    id: `event_${Date.now()}`,
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
        successOutcomeText: "Your cyberdeck slices past the encrypted firewall! You recover the encrypted corporate blueprint coordinates and safely extract the pulsating Ether Core (+180¤, +50 XP, +Singularity Overcharger).",
        failureOutcomeText: "The firewall detects your probe and triggers a localized neural shockwave! (-25 HP, Datapad auto-deletes).",
        rewardCredits: 180,
        rewardXP: 50,
        rewardItem: "Singularity Overcharger"
      },
      {
        id: "opt_2",
        text: "[Mindmancer Level 2] Channel psychic resonance into the dead courier's neural echo",
        checkType: "mindmancer",
        checkValue: 2,
        successOutcomeText: "Purple synaptic sparks illuminate the rainy alley. The courier's lingering soul reveals the location of a secret Arasaka cache in Conduit 09 (+100 XP, +250¤).",
        rewardCredits: 250,
        rewardXP: 100
      },
      {
        id: "opt_3",
        text: "[Perception] Search for nearby tracks and ambushers",
        checkType: "none",
        successOutcomeText: "You quickly spot fresh footprints leading up the catwalk. You loot 60¤ from her coat pocket before corporate drones arrive.",
        rewardCredits: 60,
        rewardXP: 25
      }
    ]
  });

  const handleSelectExisting = (evt: CustomWorldEvent) => {
    setSelectedEventId(evt.id);
    setEventForm({ ...evt });
  };

  const handleCreateNew = (type: CustomWorldEvent["triggerType"] = "travel_region") => {
    const newId = `event_${Date.now()}`;
    const newEvt: CustomWorldEvent = {
      id: newId,
      title: type === "travel_region" ? "Travel Encounter: Rainstorm Ambush" : "POI Event: Shady Deal",
      triggerType: type,
      triggerRegion: "all",
      bannerImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
      narrativeText: "A sudden incident unfolds in the rain-soaked shadows of Megacity-9...",
      choices: [
        {
          id: `c_${Date.now()}`,
          text: "[Investigate] Step closer and analyze the scene",
          checkType: "none",
          successOutcomeText: "You carefully observe the situation and secure valuable intelligence (+30 XP).",
          rewardXP: 30
        }
      ]
    };
    setSelectedEventId(newId);
    setEventForm(newEvt);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) {
      triggerToast("ERROR: Event Title is required!");
      return;
    }

    setCustomEvents(prev => {
      const idx = prev.findIndex(e => e.id === eventForm.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = eventForm;
        return next;
      }
      return [...prev, eventForm];
    });

    triggerToast(`EVENT SAVED: "${eventForm.title}" active in world triggers!`);
  };

  const handleAddChoice = () => {
    const newChoice: CustomEventChoice = {
      id: `c_${Date.now()}`,
      text: "[New Option] Attempt tactical maneuver",
      checkType: "none",
      successOutcomeText: "Your action succeeds cleanly (+20 XP).",
      rewardXP: 20
    };
    setEventForm({
      ...eventForm,
      choices: [...(eventForm.choices || []), newChoice]
    });
  };

  const handleRemoveChoice = (id: string) => {
    setEventForm({
      ...eventForm,
      choices: (eventForm.choices || []).filter(c => c.id !== id)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden text-xs font-mono">
      
      {/* LEFT COLUMN: Events List */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden border-r border-cyan-500/20 pr-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Zap size={16} />
            <span>Dynamic Events Registry</span>
          </div>
          <button
            onClick={() => handleCreateNew("travel_region")}
            className="bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1 rounded font-bold uppercase cursor-pointer text-3xs transition-all"
          >
            + New Event
          </button>
        </div>

        <p className="text-3xs text-slate-400 font-sans">
          Create dynamic world events triggered on District Travel, POI Entry, or Exploration. Include stat checks, combat, and relic loot!
        </p>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {customEvents.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-cyan-500/30 text-center text-slate-500 text-2xs">
              No dynamic events authored yet. Click "+ New Event" to create travel encounters!
            </div>
          ) : (
            customEvents.map(evt => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => handleSelectExisting(evt)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]" 
                      : "bg-slate-950/70 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-200 truncate">{evt.title}</span>
                    <span className={`text-3xs px-1.5 py-0.5 rounded font-bold uppercase ${
                      evt.triggerType === "travel_region" ? "bg-amber-950 text-amber-300 border border-amber-500/40" :
                      evt.triggerType === "poi_entry" ? "bg-purple-950 text-purple-300 border border-purple-500/40" :
                      "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                    }`}>
                      {evt.triggerType === "travel_region" ? "🚗 Travel" : evt.triggerType === "poi_entry" ? "🚪 POI Entry" : "🎲 Explore"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-3xs text-slate-400">
                    <span className="truncate text-slate-400">{evt.choices?.length || 0} Interactive Choices</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Event Studio Editor */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Header & Quick Launch Test Runner */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            <span className="font-bold text-sm text-white uppercase tracking-wider">{eventForm.title || "Untitled Event"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLaunchEventLive(eventForm)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold uppercase cursor-pointer text-2xs transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)] animate-pulse"
            >
              <Play size={13} /> Test & Trigger Live in Game
            </button>
            <button
              onClick={handleSaveEvent}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1.5 rounded font-black uppercase cursor-pointer text-2xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              <Check size={13} /> Save Event
            </button>
            {customEvents.some(e => e.id === eventForm.id) && (
              <button
                onClick={() => {
                  setCustomEvents(prev => prev.filter(e => e.id !== eventForm.id));
                  triggerToast("Event removed.");
                  handleCreateNew();
                }}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 p-1.5 rounded cursor-pointer"
                title="Delete Event"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Core Event Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Event Title</label>
            <input
              type="text"
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Trigger Context</label>
            <select
              value={eventForm.triggerType}
              onChange={e => setEventForm({ ...eventForm, triggerType: e.target.value as any })}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none uppercase font-bold"
            >
              <option value="travel_region">🚗 On District Travel</option>
              <option value="poi_entry">🚪 On POI Entry</option>
              <option value="random_exploration">🎲 On Random Exploration</option>
            </select>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-1">
          <label className="text-3xs text-cyan-400 uppercase font-bold">Hard-Boiled Narrative Story Text</label>
          <textarea
            rows={3}
            value={eventForm.narrativeText}
            onChange={e => setEventForm({ ...eventForm, narrativeText: e.target.value })}
            className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-slate-200 text-2xs font-sans outline-none leading-relaxed"
            placeholder="Describe what the player encounters, atmospheric details, weather, corpses, weapons, cyberware..."
          />
        </div>

        {/* Scenic Artwork Banner */}
        <div className="border border-white/10 bg-slate-950/60 rounded-lg p-3 space-y-3">
          <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider block">Event Scenic Illustration Artwork</span>
          <div className="flex gap-3 items-center">
            {eventForm.bannerImage && (
              <img
                src={eventForm.bannerImage}
                alt="event banner"
                className="w-28 h-16 object-cover rounded-lg border border-cyan-500 shadow-md"
              />
            )}
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={eventForm.bannerImage}
                onChange={e => setEventForm({ ...eventForm, bannerImage: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-cyan-200 text-2xs outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="text-3xs text-slate-400 uppercase font-bold block mb-1.5">Preset Artwork:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESET_EVENT_BANNERS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setEventForm({ ...eventForm, bannerImage: preset.url })}
                  className="text-3xs bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400 text-slate-300 p-1.5 rounded truncate text-left cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Choices with Stat Checks & Outcomes */}
        <div className="border border-cyan-500/20 bg-slate-950/60 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider">
              Interactive Choices & Stat Checks
            </span>
            <button
              onClick={handleAddChoice}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-black px-2 py-1 rounded font-bold uppercase text-3xs cursor-pointer"
            >
              <Plus size={11} /> Add Choice Node
            </button>
          </div>

          <div className="space-y-3">
            {(eventForm.choices || []).map((choice, idx) => (
              <div key={choice.id} className="border border-cyan-500/20 bg-slate-900/80 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-bold text-cyan-300 uppercase">Choice #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveChoice(choice.id)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Choice Label (Include stat brackets e.g. [Intelligence 14])</label>
                    <input
                      type="text"
                      value={choice.text}
                      onChange={e => {
                        const next = [...eventForm.choices];
                        next[idx].text = e.target.value;
                        setEventForm({ ...eventForm, choices: next });
                      }}
                      className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-slate-200 text-2xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Stat Check Prerequisite</label>
                    <select
                      value={choice.checkType || "none"}
                      onChange={e => {
                        const next = [...eventForm.choices];
                        next[idx].checkType = e.target.value as any;
                        setEventForm({ ...eventForm, choices: next });
                      }}
                      className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-cyan-300 text-2xs outline-none uppercase"
                    >
                      <option value="none">None (Standard Choice)</option>
                      <option value="int">🧠 [Intelligence Check]</option>
                      <option value="str">💪 [Strength Check]</option>
                      <option value="dex">⚡ [Dexterity Check]</option>
                      <option value="mindmancer">🔮 [Mindmancer Skill Check]</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 uppercase font-bold">Outcome Story Text</label>
                  <textarea
                    rows={2}
                    value={choice.successOutcomeText}
                    onChange={e => {
                      const next = [...eventForm.choices];
                      next[idx].successOutcomeText = e.target.value;
                      setEventForm({ ...eventForm, choices: next });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-slate-300 text-2xs font-sans outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-white/5">
                  <div>
                    <label className="text-3xs text-amber-400 uppercase font-bold">Credits Reward</label>
                    <input
                      type="number"
                      value={choice.rewardCredits || 0}
                      onChange={e => {
                        const next = [...eventForm.choices];
                        next[idx].rewardCredits = parseInt(e.target.value) || 0;
                        setEventForm({ ...eventForm, choices: next });
                      }}
                      className="w-full bg-slate-950 border border-amber-500/30 rounded p-1 text-center text-amber-300 text-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-purple-400 uppercase font-bold">XP Reward</label>
                    <input
                      type="number"
                      value={choice.rewardXP || 0}
                      onChange={e => {
                        const next = [...eventForm.choices];
                        next[idx].rewardXP = parseInt(e.target.value) || 0;
                        setEventForm({ ...eventForm, choices: next });
                      }}
                      className="w-full bg-slate-950 border border-purple-500/30 rounded p-1 text-center text-purple-300 text-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-3xs text-cyan-400 uppercase font-bold">Item Drop</label>
                    <input
                      type="text"
                      value={choice.rewardItem || ""}
                      onChange={e => {
                        const next = [...eventForm.choices];
                        next[idx].rewardItem = e.target.value;
                        setEventForm({ ...eventForm, choices: next });
                      }}
                      className="w-full bg-slate-950 border border-cyan-500/30 rounded p-1 text-cyan-200 text-2xs"
                      placeholder="Item name..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
