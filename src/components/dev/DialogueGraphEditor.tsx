import React, { useState } from "react";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  GitBranch, 
  Play, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Coins
} from "lucide-react";
import { GameState } from "../../types";

export interface CustomDialogueChoice {
  id: string;
  text: string;
  nextNodeId?: string;
  check?: {
    stat: "strength" | "dexterity" | "intelligence" | "charisma";
    val: number;
  };
  reward?: {
    type: "credits" | "item" | "exp" | "heal";
    value: string | number;
  };
  triggerCombat?: boolean;
}

export interface CustomDialogueNode {
  id: string;
  speaker: string;
  avatar: string;
  text: string;
  choices: CustomDialogueChoice[];
}

export interface DialogueGraphEditorProps {
  dialogueNodes: CustomDialogueNode[];
  setDialogueNodes: React.Dispatch<React.SetStateAction<CustomDialogueNode[]>>;
  gameState: GameState;
  triggerToast: (msg: string) => void;
  onTestDialogueInGame?: (dialogue: CustomDialogueNode) => void;
}

export const DialogueGraphEditor: React.FC<DialogueGraphEditorProps> = ({
  dialogueNodes,
  setDialogueNodes,
  gameState,
  triggerToast,
  onTestDialogueInGame
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    dialogueNodes[0]?.id || "node_ares_checkpoint"
  );

  // Active testing simulator state
  const [simActive, setSimActive] = useState(false);
  const [simCurrentNodeId, setSimCurrentNodeId] = useState<string | null>(null);
  const [simLog, setSimLog] = useState<string[]>([]);

  const selectedNode = dialogueNodes.find(n => n.id === selectedNodeId) || {
    id: "node_ares_checkpoint",
    speaker: "Ares Security Officer",
    avatar: "👮",
    text: "Halt! You are entering a restricted corporate conduit without cyber-clearance.",
    choices: [
      { id: "c1", text: "[Intelligence 12] Flash spoofed Ares Biotech access credentials.", check: { stat: "intelligence" as const, val: 12 }, nextNodeId: "node_passed" },
      { id: "c2", text: "[Strength 14] Slam the officer against the reinforced blast door.", check: { stat: "strength" as const, val: 14 }, triggerCombat: true },
      { id: "c3", text: "Back away slowly and return to the safehouse corridor.", nextNodeId: "node_exit" }
    ]
  };

  const handleUpdateNode = (updated: CustomDialogueNode) => {
    setDialogueNodes(prev => {
      const idx = prev.findIndex(n => n.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  };

  const handleAddChoice = () => {
    const newChoice: CustomDialogueChoice = {
      id: `choice_${Date.now()}`,
      text: "[Charisma 11] Negotiate a temporary passage fee.",
      check: { stat: "charisma", val: 11 },
      nextNodeId: "node_negotiated"
    };
    handleUpdateNode({
      ...selectedNode,
      choices: [...selectedNode.choices, newChoice]
    });
    triggerToast("ADDED DIALOGUE BRANCH CHOICE");
  };

  const handleRemoveChoice = (choiceId: string) => {
    handleUpdateNode({
      ...selectedNode,
      choices: selectedNode.choices.filter(c => c.id !== choiceId)
    });
  };

  const handleCreateNewNode = () => {
    const newId = `node_${Date.now().toString().slice(-4)}`;
    const newNode: CustomDialogueNode = {
      id: newId,
      speaker: "Shadow Broker Courier",
      avatar: "🕵️",
      text: "Keep your voice down. The corporate drones have ears in every conduit.",
      choices: [
        { id: `c_${Date.now()}_1`, text: "Show me the decrypted intelligence crystals.", nextNodeId: `${newId}_intel` },
        { id: `c_${Date.now()}_2`, text: "I have the 500 Credits ready for transfer.", reward: { type: "credits", value: 500 } }
      ]
    };
    setDialogueNodes(prev => [newNode, ...prev]);
    setSelectedNodeId(newId);
    triggerToast(`CREATED NODE: [${newId}]`);
  };

  const handleDeleteNode = (id: string) => {
    setDialogueNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(dialogueNodes.find(n => n.id !== id)?.id || "");
    }
    triggerToast(`DELETED NODE: [${id}]`);
  };

  // --- INTERACTIVE SIMULATOR ---
  const startSimulator = (startNodeId: string) => {
    setSimActive(true);
    setSimCurrentNodeId(startNodeId);
    setSimLog([`▶ SIMULATION INITIALIZED AT NODE [${startNodeId}]`]);
  };

  const currentSimNode = dialogueNodes.find(n => n.id === simCurrentNodeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
      {/* LEFT COLUMN: Node Tree Hierarchy */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[11px] font-black text-cyan-300 uppercase flex items-center gap-1.5">
            <GitBranch size={13} className="text-cyan-400" /> DIALOGUE GRAPH ({dialogueNodes.length})
          </span>
          <button
            onClick={handleCreateNewNode}
            className="p-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded transition-all cursor-pointer"
            title="Create New Node"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5 max-h-[220px]">
          {dialogueNodes.map(node => (
            <div
              key={node.id}
              onClick={() => {
                setSelectedNodeId(node.id);
                if (simActive) setSimCurrentNodeId(node.id);
              }}
              className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                selectedNodeId === node.id
                  ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{node.avatar || "💬"}</span>
                <div className="truncate">
                  <div className="text-[9px] font-bold truncate text-slate-200">{node.speaker}</div>
                  <div className="text-[7.5px] text-slate-500 font-mono truncate">{node.id} • {node.choices.length} Branches</div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node.id);
                }}
                className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => startSimulator(selectedNodeId)}
          className="mt-auto py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[9.5px] uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        >
          <Play size={12} /> Test In Live Simulator
        </button>
      </div>

      {/* MIDDLE & RIGHT COLUMN: Node Configurator & Live Branch Visualizer */}
      <div className="lg:col-span-9 flex flex-col gap-3 overflow-y-auto">
        
        {/* SIMULATOR OVERLAY BAR (If active) */}
        {simActive && currentSimNode && (
          <div className="bg-slate-950 border border-emerald-500/50 p-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col gap-2 font-mono">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
                  LIVE DIALOGUE RUNTIME TESTER • NODE: [{currentSimNode.id}]
                </span>
              </div>
              <button
                onClick={() => setSimActive(false)}
                className="text-[8.5px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-700 rounded"
              >
                EXIT SIMULATOR
              </button>
            </div>

            {/* Sim Dialogue Output */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg flex gap-3 items-start">
              <span className="text-2xl">{currentSimNode.avatar}</span>
              <div className="flex-1">
                <span className="text-[9.5px] font-black text-cyan-300 uppercase block mb-1">
                  {currentSimNode.speaker}
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  "{currentSimNode.text}"
                </p>
              </div>
            </div>

            {/* Sim Branch Options with Stat Checks */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[8px] text-slate-400 uppercase font-black">SELECT RESPONSE (PLAYER STATS EVALUATED DETERMINISTICALLY):</span>
              {currentSimNode.choices.map((choice, idx) => {
                let statPassed = true;
                let playerStatVal = 10;
                if (choice.check) {
                  playerStatVal = (gameState.stats as any)?.[choice.check.stat] || 10;
                  statPassed = playerStatVal >= choice.check.val;
                }

                return (
                  <button
                    key={choice.id || idx}
                    disabled={!statPassed && !!choice.check}
                    onClick={() => {
                      if (choice.triggerCombat) {
                        triggerToast("COMBAT TRIGGER DETECTED IN SIMULATOR!");
                        setSimLog(prev => [...prev, `⚔️ TRIGGERED TACTICAL COMBAT via response: "${choice.text}"`]);
                      } else if (choice.nextNodeId) {
                        const targetNode = dialogueNodes.find(n => n.id === choice.nextNodeId);
                        if (targetNode) {
                          setSimCurrentNodeId(choice.nextNodeId);
                          setSimLog(prev => [...prev, `→ Chose option [${choice.text}]. Transitioned to [${choice.nextNodeId}]`]);
                        } else {
                          triggerToast(`WARNING: Target node [${choice.nextNodeId}] not found!`);
                        }
                      } else if (choice.reward) {
                        triggerToast(`REWARD CLAIMED: ${choice.reward.type} (${choice.reward.value})`);
                        setSimLog(prev => [...prev, `🎁 REWARD: ${choice.reward?.type} +${choice.reward?.value}`]);
                      }
                    }}
                    className={`p-2 rounded-lg border text-left text-[9px] font-mono flex items-center justify-between transition-all ${
                      statPassed
                        ? "bg-slate-900 hover:bg-cyan-950/60 border-slate-700 hover:border-cyan-400 text-slate-200"
                        : "bg-slate-950/80 border-rose-900/40 text-rose-400/50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight size={11} className="text-cyan-400 flex-shrink-0" />
                      <span>{choice.text}</span>
                    </div>

                    {choice.check && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                        statPassed ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"
                      }`}>
                        {choice.check.stat.toUpperCase()} {playerStatVal}/{choice.check.val} {statPassed ? "✓ PASS" : "✗ FAIL"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* NODE EDITOR FORM */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-[11px] font-black text-cyan-300 uppercase flex items-center gap-1.5">
              <MessageSquare size={13} className="text-cyan-400" /> SCRIPTING NODE: [{selectedNode.id}]
            </span>
            <span className="text-[8px] text-slate-400 font-mono">
              BRANCH COUNT: {selectedNode.choices.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-[9px]">
            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1">Node ID</label>
              <input
                type="text"
                value={selectedNode.id}
                onChange={e => handleUpdateNode({ ...selectedNode, id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1">Speaker Name</label>
              <input
                type="text"
                value={selectedNode.speaker}
                onChange={e => handleUpdateNode({ ...selectedNode, speaker: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1">Speaker Icon / Emoji</label>
              <input
                type="text"
                value={selectedNode.avatar}
                onChange={e => handleUpdateNode({ ...selectedNode, avatar: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1 text-[9px]">Dialogue Body / Narrative Line</label>
            <textarea
              rows={2}
              value={selectedNode.text}
              onChange={e => handleUpdateNode({ ...selectedNode, text: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-cyan-400 outline-none font-sans text-xs"
            />
          </div>

          {/* BRANCHING CHOICES BUILDER */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-300 uppercase">
                INTERACTIVE CHOICES & STAT-CHECK PREREQUISITES
              </span>
              <button
                onClick={handleAddChoice}
                className="flex items-center gap-1 text-[8.5px] bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded cursor-pointer"
              >
                <Plus size={11} /> Add Choice Branch
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {selectedNode.choices.map((choice, index) => (
                <div key={choice.id || index} className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Choice text (e.g. [Intelligence 12] Hack terminal door lock...)"
                      value={choice.text}
                      onChange={e => {
                        const nextChoices = [...selectedNode.choices];
                        nextChoices[index] = { ...choice, text: e.target.value };
                        handleUpdateNode({ ...selectedNode, choices: nextChoices });
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-[9px] text-slate-200 focus:border-cyan-400 outline-none"
                    />
                    <button
                      onClick={() => handleRemoveChoice(choice.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Branch Settings */}
                  <div className="grid grid-cols-3 gap-2 text-[8.5px]">
                    <div>
                      <label className="text-slate-500 uppercase font-bold block mb-0.5">Target Next Node ID</label>
                      <input
                        type="text"
                        placeholder="e.g. node_hack_success"
                        value={choice.nextNodeId || ""}
                        onChange={e => {
                          const nextChoices = [...selectedNode.choices];
                          nextChoices[index] = { ...choice, nextNodeId: e.target.value };
                          handleUpdateNode({ ...selectedNode, choices: nextChoices });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 uppercase font-bold block mb-0.5">Stat Check Check Type</label>
                      <div className="flex gap-1">
                        <select
                          value={choice.check?.stat || "none"}
                          onChange={e => {
                            const stat = e.target.value as any;
                            const nextChoices = [...selectedNode.choices];
                            if (stat === "none") {
                              delete nextChoices[index].check;
                            } else {
                              nextChoices[index] = {
                                ...choice,
                                check: { stat, val: choice.check?.val || 12 }
                              };
                            }
                            handleUpdateNode({ ...selectedNode, choices: nextChoices });
                          }}
                          className="w-2/3 bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 outline-none"
                        >
                          <option value="none">No Stat Check</option>
                          <option value="strength">Strength</option>
                          <option value="dexterity">Dexterity</option>
                          <option value="intelligence">Intelligence</option>
                          <option value="charisma">Charisma</option>
                        </select>
                        {choice.check && (
                          <input
                            type="number"
                            placeholder="Val"
                            value={choice.check.val}
                            onChange={e => {
                              const nextChoices = [...selectedNode.choices];
                              nextChoices[index] = {
                                ...choice,
                                check: { ...choice.check!, val: parseInt(e.target.value) || 1 }
                              };
                              handleUpdateNode({ ...selectedNode, choices: nextChoices });
                            }}
                            className="w-1/3 bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 outline-none text-center"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!choice.triggerCombat}
                          onChange={e => {
                            const nextChoices = [...selectedNode.choices];
                            nextChoices[index] = { ...choice, triggerCombat: e.target.checked };
                            handleUpdateNode({ ...selectedNode, choices: nextChoices });
                          }}
                          className="accent-rose-500"
                        />
                        <span className="uppercase text-[8px] font-bold text-rose-400">Trigger Combat</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DialogueGraphEditor;
