import React, { useState } from "react";
import { 
  Scroll, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  Coins, 
  Layers, 
  Save, 
  Compass, 
  ShieldAlert,
  ArrowRight,
  Flame,
  Zap
} from "lucide-react";
import { GameState, District } from "../../types";
import { REGIONS } from "../../data";

export interface CustomQuestStage {
  id: string;
  order: number;
  objective: string;
  poiTarget?: string;
  isCompleted?: boolean;
}

export interface CustomQuest {
  id: string;
  title: string;
  category: "main" | "side" | "faction" | "bounty";
  district: District;
  description: string;
  stages: CustomQuestStage[];
  rewardCredits: number;
  rewardExp: number;
  rewardItem?: string;
}

export interface QuestGraphEditorProps {
  customQuests: CustomQuest[];
  setCustomQuests: React.Dispatch<React.SetStateAction<CustomQuest[]>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
}

export const QuestGraphEditor: React.FC<QuestGraphEditorProps> = ({
  customQuests,
  setCustomQuests,
  gameState,
  setGameState,
  triggerToast
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>(
    customQuests[0]?.id || "quest_covert_data_extraction"
  );

  const selectedQuest = customQuests.find(q => q.id === selectedQuestId) || {
    id: "quest_covert_data_extraction",
    title: "Black-Market Data Extraction",
    category: "side" as const,
    district: "conduit09" as District,
    description: "Infiltrate the lower maintenance catacombs, hack the encrypted server relay, and deliver the crystal drive to the Hideout.",
    stages: [
      { id: "s1", order: 1, objective: "Navigate to Conduit 09 Maintenance Bay and locate the Sub-Terminal.", poiTarget: "Maintenance Sub-Terminal" },
      { id: "s2", order: 2, objective: "Bypass firewall encryption matrix using [Intelligence 12].", poiTarget: "Cryptographic Node" },
      { id: "s3", order: 3, objective: "Evade Ares Security Enforcers and deliver extracted memory crystals to Vice.", poiTarget: "Hideout Briefing Room" }
    ],
    rewardCredits: 350,
    rewardExp: 80,
    rewardItem: "Military Cyber-Deck"
  };

  const handleUpdateQuest = (updated: CustomQuest) => {
    setCustomQuests(prev => {
      const idx = prev.findIndex(q => q.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  };

  const handleAddStage = () => {
    const nextOrder = (selectedQuest.stages?.length || 0) + 1;
    const newStage: CustomQuestStage = {
      id: `stage_${Date.now()}`,
      order: nextOrder,
      objective: "Eliminate hostile patrol and retrieve corporate passcode.",
      poiTarget: "Sector Checkpoint"
    };
    handleUpdateQuest({
      ...selectedQuest,
      stages: [...selectedQuest.stages, newStage]
    });
    triggerToast("ADDED QUEST OBJECTIVE STAGE");
  };

  const handleCreateNewQuest = () => {
    const newId = `quest_${Date.now().toString().slice(-4)}`;
    const newQuest: CustomQuest = {
      id: newId,
      title: "New Sector Contract",
      category: "side",
      district: "conduit09",
      description: "Deterministic tactical contract authored in GM Studio.",
      stages: [
        { id: `s_${Date.now()}_1`, order: 1, objective: "Scout suspicious energy spikes in sector." }
      ],
      rewardCredits: 200,
      rewardExp: 50
    };
    setCustomQuests(prev => [newQuest, ...prev]);
    setSelectedQuestId(newId);
    triggerToast(`CREATED QUEST: [${newId}]`);
  };

  const handleDeleteQuest = (id: string) => {
    setCustomQuests(prev => prev.filter(q => q.id !== id));
    if (selectedQuestId === id) {
      setSelectedQuestId(customQuests.find(q => q.id !== id)?.id || "");
    }
    triggerToast(`DELETED QUEST: [${id}]`);
  };

  const handleInjectQuestIntoLiveGame = () => {
    const questText = `${selectedQuest.title}: ${selectedQuest.stages[0]?.objective || selectedQuest.description}`;
    setGameState(prev => {
      if (prev.activeQuests.includes(questText)) return prev;
      return {
        ...prev,
        activeQuests: [questText, ...prev.activeQuests]
      };
    });
    triggerToast(`QUEST [${selectedQuest.title.toUpperCase()}] INJECTED INTO LIVE JOURNAL!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* LEFT COLUMN: Quest Hierarchy */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[11px] font-black text-cyan-300 uppercase flex items-center gap-1.5">
            <Scroll size={13} className="text-cyan-400" /> QUEST GRAPH ({customQuests.length})
          </span>
          <button
            onClick={handleCreateNewQuest}
            className="p-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded transition-all cursor-pointer"
            title="Create New Quest"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5 max-h-[220px]">
          {customQuests.map(q => (
            <div
              key={q.id}
              onClick={() => setSelectedQuestId(q.id)}
              className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                selectedQuestId === q.id
                  ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="min-w-0">
                <div className="text-[9px] font-bold truncate text-slate-200">{q.title}</div>
                <div className="text-[7.5px] text-slate-500 font-mono truncate uppercase">
                  {q.district} • {q.category} • {q.stages?.length || 0} Stages
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuest(q.id);
                }}
                className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleInjectQuestIntoLiveGame}
          className="mt-auto py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-[9.5px] uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
        >
          <Sparkles size={12} /> Inject Quest Into Live Game
        </button>
      </div>

      {/* RIGHT COLUMN: Quest Editor Form */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[11px] font-black text-cyan-300 uppercase flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-400" /> QUEST ARCHITECT: [{selectedQuest.id}]
          </span>
          <span className="text-[8px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold uppercase">
            {selectedQuest.category} CONTRACT
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-[9px]">
          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Quest ID</label>
            <input
              type="text"
              value={selectedQuest.id}
              onChange={e => handleUpdateQuest({ ...selectedQuest, id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Quest Title</label>
            <input
              type="text"
              value={selectedQuest.title}
              onChange={e => handleUpdateQuest({ ...selectedQuest, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">District Target</label>
            <select
              value={selectedQuest.district}
              onChange={e => handleUpdateQuest({ ...selectedQuest, district: e.target.value as District })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            >
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-slate-400 uppercase font-bold block mb-1 text-[9px]">Quest Briefing & Lore</label>
          <textarea
            rows={2}
            value={selectedQuest.description}
            onChange={e => handleUpdateQuest({ ...selectedQuest, description: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-400 outline-none font-sans text-xs"
          />
        </div>

        {/* STAGES / OBJECTIVES TIMELINE */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1.5">
              <Compass size={12} className="text-cyan-400" /> SEQUENTIAL OBJECTIVE STAGES ({selectedQuest.stages.length})
            </span>
            <button
              onClick={handleAddStage}
              className="flex items-center gap-1 text-[8.5px] bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded cursor-pointer"
            >
              <Plus size={11} /> Add Stage
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {selectedQuest.stages.map((stage, idx) => (
              <div key={stage.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex items-center gap-2">
                <span className="text-[9px] font-black text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Step {idx + 1}
                </span>

                <input
                  type="text"
                  placeholder="Objective description..."
                  value={stage.objective}
                  onChange={e => {
                    const nextStages = [...selectedQuest.stages];
                    nextStages[idx] = { ...stage, objective: e.target.value };
                    handleUpdateQuest({ ...selectedQuest, stages: nextStages });
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-[9px] text-slate-200 focus:border-cyan-400 outline-none"
                />

                <input
                  type="text"
                  placeholder="Target POI"
                  value={stage.poiTarget || ""}
                  onChange={e => {
                    const nextStages = [...selectedQuest.stages];
                    nextStages[idx] = { ...stage, poiTarget: e.target.value };
                    handleUpdateQuest({ ...selectedQuest, stages: nextStages });
                  }}
                  className="w-1/4 bg-slate-900 border border-slate-700 rounded p-1.5 text-[8.5px] text-slate-300 outline-none"
                />

                <button
                  onClick={() => {
                    handleUpdateQuest({
                      ...selectedQuest,
                      stages: selectedQuest.stages.filter(s => s.id !== stage.id)
                    });
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* REWARD POOL */}
        <div className="grid grid-cols-3 gap-3 text-[9px] pt-2 border-t border-white/5">
          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Reward Credits (¤)</label>
            <input
              type="number"
              value={selectedQuest.rewardCredits}
              onChange={e => handleUpdateQuest({ ...selectedQuest, rewardCredits: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Reward Experience (XP)</label>
            <input
              type="number"
              value={selectedQuest.rewardExp}
              onChange={e => handleUpdateQuest({ ...selectedQuest, rewardExp: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Bonus Item Drop</label>
            <input
              type="text"
              placeholder="e.g. Acid Beast Core"
              value={selectedQuest.rewardItem || ""}
              onChange={e => handleUpdateQuest({ ...selectedQuest, rewardItem: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestGraphEditor;
