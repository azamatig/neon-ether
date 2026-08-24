import React, { useState } from "react";
import { 
  Scroll, 
  Sparkles, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Coins, 
  Award, 
  Gift, 
  MapPin, 
  ShieldAlert, 
  Check, 
  Play, 
  BookOpen 
} from "lucide-react";
import { GameState } from "../../types";
import { CustomWorldItem } from "./ItemForgeStudio";

export interface CustomQuestStep {
  id: string;
  description: string;
  targetPOI?: string;
  targetCount?: number;
  currentCount?: number;
}

export interface CustomQuestData {
  id: string;
  title: string;
  category: "main" | "side" | "faction" | "companion";
  desc: string;
  giverNPC?: string;
  steps: CustomQuestStep[];
  minLevel?: number;
  prereqQuest?: string;
  rewardCredits: number;
  rewardXP: number;
  rewardItems: string[];
  rewardReputation?: { faction: string; amount: number };
  rewardCompanion?: string;
  isActiveInGame?: boolean;
}

interface QuestStudioProps {
  customQuests: CustomQuestData[];
  setCustomQuests: React.Dispatch<React.SetStateAction<CustomQuestData[]>>;
  customItems: CustomWorldItem[];
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
}

export const QuestStudio: React.FC<QuestStudioProps> = ({
  customQuests,
  setCustomQuests,
  customItems,
  gameState,
  setGameState,
  triggerToast
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>(customQuests[0]?.id || "new");

  const [questForm, setQuestForm] = useState<CustomQuestData>({
    id: `quest_${Date.now()}`,
    title: "Contract: Subterranean AI Datavault",
    category: "side",
    desc: "An encrypted corporate datapad recovered from Conduit 09 points towards an abandoned underground server bunker. Infiltrate the vault, bypass corporate security, and extract the neural AI core.",
    giverNPC: "Agent Jax",
    steps: [
      {
        id: "s1",
        description: "Infiltrate Level B4 server vault in Conduit 09",
        targetPOI: "Subterranean Datacrypt",
        targetCount: 1,
        currentCount: 0
      },
      {
        id: "s2",
        description: "Decouple the Technomantic AI Core terminal",
        targetPOI: "Central Server Array",
        targetCount: 1,
        currentCount: 0
      }
    ],
    minLevel: 2,
    rewardCredits: 350,
    rewardXP: 120,
    rewardItems: ["Technical Signal Core", "Singularity Overcharger"],
    rewardReputation: { faction: "Netrunners Guild", amount: 15 }
  });

  const handleSelectExisting = (quest: CustomQuestData) => {
    setSelectedQuestId(quest.id);
    setQuestForm({ ...quest });
  };

  const handleCreateNew = () => {
    const newId = `quest_${Date.now()}`;
    const newQuest: CustomQuestData = {
      id: newId,
      title: "New Syndicate Contract",
      category: "side",
      desc: "A gritty contract brokered in the dark alleys of Megacity-9.",
      steps: [
        {
          id: `step_${Date.now()}`,
          description: "Investigate target location",
          targetCount: 1,
          currentCount: 0
        }
      ],
      rewardCredits: 150,
      rewardXP: 50,
      rewardItems: []
    };
    setSelectedQuestId(newId);
    setQuestForm(newQuest);
  };

  const handleSaveQuest = () => {
    if (!questForm.title.trim()) {
      triggerToast("ERROR: Quest Title is required!");
      return;
    }

    setCustomQuests(prev => {
      const idx = prev.findIndex(q => q.id === questForm.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = questForm;
        return next;
      }
      return [...prev, questForm];
    });

    triggerToast(`QUEST SAVED: "${questForm.title}" recorded!`);
  };

  const handleInjectIntoQuestLog = () => {
    const questString = `${questForm.title} - ${questForm.desc}`;
    setGameState(prev => ({
      ...prev,
      activeQuests: prev.activeQuests.includes(questString) ? prev.activeQuests : [...prev.activeQuests, questString]
    }));
    triggerToast(`ACTIVE OBJECTIVE: "${questForm.title}" added to Player Quest Log!`);
  };

  const handleCompleteQuestLive = () => {
    const questString = `${questForm.title} - ${questForm.desc}`;
    setGameState(prev => ({
      ...prev,
      activeQuests: prev.activeQuests.filter(q => !q.includes(questForm.title)),
      completedQuests: [...(prev.completedQuests || []), questForm.title],
      credits: prev.credits + (questForm.rewardCredits || 0),
      inventory: [...prev.inventory, ...(questForm.rewardItems || [])]
    }));
    triggerToast(`QUEST COMPLETED: Granted ${questForm.rewardCredits}¤ + XP & Rewards!`);
  };

  const handleAddStep = () => {
    const newStep: CustomQuestStep = {
      id: `s_${Date.now()}`,
      description: "New objective objective step...",
      targetCount: 1,
      currentCount: 0
    };
    setQuestForm({
      ...questForm,
      steps: [...(questForm.steps || []), newStep]
    });
  };

  const handleRemoveStep = (id: string) => {
    setQuestForm({
      ...questForm,
      steps: (questForm.steps || []).filter(s => s.id !== id)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden text-xs font-mono">
      
      {/* LEFT COLUMN: Quests List */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden border-r border-cyan-500/20 pr-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Scroll size={16} />
            <span>Quest Registry</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1 rounded font-bold uppercase cursor-pointer text-3xs transition-all"
          >
            + New Quest
          </button>
        </div>

        <p className="text-3xs text-slate-400 font-sans">
          Design multi-stage story quests, corporate bounties, and faction operations. Modify existing campaign contracts.
        </p>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {customQuests.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-cyan-500/30 text-center text-slate-500 text-2xs">
              No custom quests created yet. Click "+ New Quest" to author story arcs!
            </div>
          ) : (
            customQuests.map(quest => {
              const isSelected = selectedQuestId === quest.id;
              return (
                <div
                  key={quest.id}
                  onClick={() => handleSelectExisting(quest)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]" 
                      : "bg-slate-950/70 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-200 truncate">{quest.title}</span>
                    <span className={`text-3xs px-1.5 py-0.5 rounded font-bold uppercase ${
                      quest.category === "main" ? "bg-amber-950 text-amber-300 border border-amber-500/40" :
                      quest.category === "faction" ? "bg-purple-950 text-purple-300 border border-purple-500/40" :
                      "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {quest.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-3xs text-slate-400">
                    <span className="text-amber-400 font-bold">{quest.rewardCredits || 0}¤</span>
                    <span>{quest.steps?.length || 0} Objectives</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Quest Editor Form */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Header & Quick Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="text-cyan-400" size={18} />
            <span className="font-bold text-sm text-white uppercase tracking-wider">{questForm.title || "Untitled Quest"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInjectIntoQuestLog}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold uppercase cursor-pointer text-2xs transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            >
              <Play size={13} /> Activate in Game
            </button>
            <button
              onClick={handleCompleteQuestLive}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-3 py-1.5 rounded font-bold uppercase cursor-pointer text-2xs transition-all"
            >
              <CheckCircle size={13} /> Complete & Claim
            </button>
            <button
              onClick={handleSaveQuest}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1.5 rounded font-black uppercase cursor-pointer text-2xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              <Check size={13} /> Save Quest
            </button>
          </div>
        </div>

        {/* Core Quest Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Quest Title</label>
            <input
              type="text"
              value={questForm.title}
              onChange={e => setQuestForm({ ...questForm, title: e.target.value })}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-3xs text-cyan-400 uppercase font-bold">Category</label>
            <select
              value={questForm.category}
              onChange={e => setQuestForm({ ...questForm, category: e.target.value as any })}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none uppercase font-bold"
            >
              <option value="main">⭐ Main Story Operation</option>
              <option value="side">📜 Side Mercenary Contract</option>
              <option value="faction">⚔️ Faction Syndicate Job</option>
              <option value="companion">❤️ Companion Personal Arc</option>
            </select>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-1">
          <label className="text-3xs text-cyan-400 uppercase font-bold">Briefing & Lore Description</label>
          <textarea
            rows={3}
            value={questForm.desc}
            onChange={e => setQuestForm({ ...questForm, desc: e.target.value })}
            className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-slate-200 text-2xs font-sans outline-none"
            placeholder="Describe the contract parameters, target faction, and stakes..."
          />
        </div>

        {/* Objectives Pipeline */}
        <div className="border border-cyan-500/20 bg-slate-950/60 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider">
              Objective Sequence & Steps
            </span>
            <button
              onClick={handleAddStep}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-black px-2 py-1 rounded font-bold uppercase text-3xs cursor-pointer"
            >
              <Plus size={11} /> Add Step
            </button>
          </div>

          <div className="space-y-2">
            {(questForm.steps || []).map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2 bg-slate-900/80 border border-white/10 p-2 rounded">
                <span className="text-3xs font-bold text-cyan-400 w-6">#{idx + 1}</span>
                <input
                  type="text"
                  value={step.description}
                  onChange={e => {
                    const next = [...questForm.steps];
                    next[idx].description = e.target.value;
                    setQuestForm({ ...questForm, steps: next });
                  }}
                  className="flex-1 bg-slate-950 border border-white/10 rounded p-1.5 text-slate-200 text-2xs outline-none"
                  placeholder="Objective description..."
                />
                <input
                  type="text"
                  value={step.targetPOI || ""}
                  onChange={e => {
                    const next = [...questForm.steps];
                    next[idx].targetPOI = e.target.value;
                    setQuestForm({ ...questForm, steps: next });
                  }}
                  className="w-40 bg-slate-950 border border-white/10 rounded p-1.5 text-cyan-300 text-2xs outline-none"
                  placeholder="Target POI..."
                />
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Package */}
        <div className="border border-amber-500/30 bg-amber-950/15 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-2xs">
            <Award size={14} />
            <span>Completion Rewards Package</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-3xs text-amber-300 uppercase font-bold">Credit Reward (¤)</label>
              <input
                type="number"
                value={questForm.rewardCredits || 0}
                onChange={e => setQuestForm({ ...questForm, rewardCredits: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-amber-500/30 rounded p-2 text-amber-300 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-3xs text-purple-300 uppercase font-bold">XP Reward</label>
              <input
                type="number"
                value={questForm.rewardXP || 0}
                onChange={e => setQuestForm({ ...questForm, rewardXP: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-purple-500/30 rounded p-2 text-purple-300 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-3xs text-cyan-300 uppercase font-bold">Specific Item Reward</label>
              <input
                type="text"
                value={(questForm.rewardItems || []).join(", ")}
                onChange={e => setQuestForm({ ...questForm, rewardItems: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-2xs outline-none"
                placeholder="e.g. Singularity Overcharger"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
