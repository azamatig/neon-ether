import React from "react";
import { motion } from "motion/react";
import { 
  Sword, 
  Crosshair, 
  ShieldAlert, 
  RotateCcw, 
  Activity, 
  Sparkles, 
  Flame, 
  Bot, 
  Heart, 
  ShieldCheck, 
  Radio, 
  Zap, 
  UserCheck 
} from "lucide-react";
import { GridCombatant, GridInteractiveObject, GameState } from "../../types";

export interface TacticalCombatViewProps {
  gridCombat: {
    combatants: GridCombatant[];
    turnOrder: string[];
    currentTurnIdx: number;
    selectedAction: "move" | "attack" | "meleeAtk" | "rangedAtk" | "spell" | "item" | null;
    turnLog: string;
    interactiveObjects?: GridInteractiveObject[];
  };
  gameState: GameState;
  combatActionTab: "attacks" | "skills" | "support";
  setCombatActionTab: (tab: "attacks" | "skills" | "support") => void;
  hoveredAction: "move" | "meleeAtk" | "rangedAtk" | "spell" | "mind" | "neural" | null;
  setHoveredAction: (action: "move" | "meleeAtk" | "rangedAtk" | "spell" | "mind" | "neural" | null) => void;
  hoveredEntity: any | null;
  setHoveredEntity: (entity: any | null) => void;
  selectedSkill: { name: string; cost: number; costType: "MP" | "SP"; desc: string; icon: string; scope: "enemy" | "self" | "all_enemies" } | null;
  setSelectedSkill: (skill: { name: string; cost: number; costType: "MP" | "SP"; desc: string; icon: string; scope: "enemy" | "self" | "all_enemies" } | null) => void;
  onMoveToCell: (x: number, y: number) => void;
  onSelectAction: (action: "move" | "meleeAtk" | "rangedAtk" | "spell" | "item" | null) => void;
  onAttackTarget: (targetId: string) => void;
  onInteractObject: (objectId: string) => void;
  onEndTurn: () => void;
  onFleeCombat: () => void;
  onDefeatReset: () => void;
  onVictoryClaim: () => void;
  triggerToast: (msg: string) => void;
}

export const TacticalCombatView: React.FC<TacticalCombatViewProps> = ({
  gridCombat,
  gameState,
  combatActionTab,
  setCombatActionTab,
  hoveredAction,
  setHoveredAction,
  hoveredEntity,
  setHoveredEntity,
  selectedSkill,
  setSelectedSkill,
  onMoveToCell,
  onSelectAction,
  onAttackTarget,
  onInteractObject,
  onEndTurn,
  onFleeCombat,
  onDefeatReset,
  onVictoryClaim,
  triggerToast
}) => {
  const currentActorId = gridCombat.turnOrder[gridCombat.currentTurnIdx];
  const activeActor = gridCombat.combatants.find(c => c.id === currentActorId);
  const isPlayerTurn = currentActorId === "player";
  const playerUnit = gridCombat.combatants.find(c => c.id === "player");

  const playerSkills = [
    { name: "Overclock Strike", cost: 10, costType: "MP" as const, desc: "Infuses weapon with blue ether, dealing 32 shock damage and inflicting Glitch.", icon: "⚡", scope: "enemy" as const },
    { name: "Nanite Shield Wall", cost: 15, costType: "MP" as const, desc: "Restores +35 Shields to player and grants nearby allies 10 Armor.", icon: "🛡️", scope: "self" as const },
    { name: "Thermal Discharge", cost: 20, costType: "MP" as const, desc: "Fires a wide wave of plasma dealing 25 Fire damage to all hostiles.", icon: "🔥", scope: "all_enemies" as const },
    { name: "Mindmance Neuro-Shock", cost: 12, costType: "MP" as const, desc: "Corrupts enemy nervous system, dealing 20 damage and silencing them for 2 turns.", icon: "🧠", scope: "enemy" as const }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel-heavy border-red-500/40 rounded-2xl p-2 md:p-2.5 shadow-2xl flex flex-col gap-2 box-glow-pink h-[96vh] max-h-[96vh] overflow-hidden justify-between relative"
    >
      {/* Top Header */}
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
            const combatant = gridCombat.combatants.find(c => c.id === id);
            if (!combatant) return null;
            const isCurrent = index === gridCombat.currentTurnIdx;
            const isDead = combatant.isDead;

            return (
              <div
                key={`${id}-${index}`}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-mono whitespace-nowrap transition-all duration-300 ${
                  isDead 
                    ? "bg-slate-900/40 border-slate-800 text-slate-600 line-through opacity-40" 
                    : isCurrent 
                      ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 font-extrabold shadow-[0_0_12px_rgba(34,211,238,0.4)] scale-105" 
                      : combatant.team === "player"
                        ? "bg-slate-900/60 border-slate-700 text-slate-300"
                        : "bg-rose-950/30 border-rose-900/60 text-rose-300"
                }`}
              >
                <span>{combatant.avatar}</span>
                <span className="uppercase font-bold tracking-tight">
                  {combatant.name.split(" ")[0]}
                </span>
                <span className="text-[7.5px] opacity-60">
                  [{combatant.team === "player" ? (combatant.id === "player" ? "YOU" : "SQUAD") : "ARES"}]
                </span>
                {index < gridCombat.turnOrder.length - 1 && (
                  <span className="text-slate-600 ml-1">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Tactical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-0 w-full overflow-hidden">
        
        {/* LEFT COLUMN: 8x6 Tactical Grid Map */}
        <div className="lg:col-span-8 flex flex-col gap-1 w-full h-full min-h-0 justify-between">
          <div className="w-full flex flex-col gap-1 h-full min-h-0 items-center justify-center">
            <div className="flex flex-wrap justify-between items-center gap-2 text-[9px] font-mono text-slate-400 px-1 border-b border-white/5 pb-0.5 shrink-0 w-full">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-cyan-400 uppercase font-black tracking-wider flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  ACTING: <span className="text-white font-bold">{activeActor?.name || "NONE"}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[9px] text-amber-400 flex items-center gap-1 font-bold">
                  AP: {Array.from({ length: activeActor?.ap || 0 }).map((_, i) => (
                    <span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  ))}
                  {(!activeActor?.ap || activeActor?.ap === 0) && <span className="text-slate-500 font-normal">0 (EXHAUSTED)</span>}
                </span>
              </div>
              <div className="text-[8px] text-slate-500 tracking-wider">
                TAP CELLS TO MOVE/ATTACK • ARRAY [8X6]
              </div>
            </div>

            {/* Grid Map Box */}
            <div 
              className="grid grid-cols-8 grid-rows-6 gap-1 p-1 border border-slate-800/80 rounded-xl relative box-glow-cyan select-none aspect-[8/6] max-h-[calc(96vh-115px)] max-w-full w-auto mx-auto flex-1 min-h-0 overflow-hidden"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] pointer-events-none" />

              {Array.from({ length: 6 }).map((_, y) => (
                Array.from({ length: 8 }).map((_, x) => {
                  const unit = gridCombat.combatants.find(c => c.x === x && c.y === y && !c.isDead);
                  const obj = gridCombat.interactiveObjects?.find(o => o.x === x && o.y === y && !o.isDestroyed);
                  const isObstacle = (x === 3 && y === 1) || (x === 4 && y === 3) || (x === 1 && y === 4);

                  const isPlayerOccupied = playerUnit && playerUnit.x === x && playerUnit.y === y;
                  const distance = playerUnit ? Math.abs(playerUnit.x - x) + Math.abs(playerUnit.y - y) : 99;
                  const reachable = isPlayerTurn && (playerUnit?.ap || 0) > 0 && distance <= 2 && !unit && !isObstacle && !obj;
                  const inAttackRange = isPlayerTurn && (playerUnit?.ap || 0) > 0 && unit && unit.team === "enemy" && distance <= (playerUnit?.range || 2);

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => {
                        if (!isPlayerTurn) {
                          triggerToast("WAIT FOR YOUR INITIATIVE PHASE!");
                          return;
                        }
                        if (unit && unit.team === "enemy") {
                          onAttackTarget(unit.id);
                        } else if (obj) {
                          onInteractObject(obj.id);
                        } else if (reachable) {
                          onMoveToCell(x, y);
                        }
                      }}
                      onMouseEnter={() => {
                        if (unit) setHoveredEntity(unit);
                        else if (obj) setHoveredEntity(obj);
                      }}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className={`relative z-10 rounded border w-full h-full flex items-center justify-center transition-all ${
                        isObstacle 
                          ? "bg-stripes-warning border-slate-900 bg-slate-900/40 text-slate-600"
                          : reachable
                            ? "bg-cyan-500/10 border-cyan-500/50 hover:bg-cyan-500/25 cursor-pointer shadow-[inset_0_0_10px_rgba(6,182,212,0.2)] animate-pulse"
                            : inAttackRange
                              ? "bg-rose-500/15 border-rose-500/60 hover:bg-rose-500/30 cursor-crosshair shadow-[inset_0_0_12px_rgba(244,63,94,0.3)] animate-pulse"
                              : "border-slate-800/30 bg-slate-900/10 hover:border-slate-700/50"
                      }`}
                    >
                      {/* Cell Coordinate stamp */}
                      <span className="absolute bottom-0.5 right-0.5 text-[6px] font-mono text-slate-700 select-none">
                        {x},{y}
                      </span>

                      {/* Interactive Objects */}
                      {obj && (
                        <div className={`w-full h-full p-0.5 rounded flex flex-col items-center justify-center text-center border ${obj.color} cursor-pointer hover:scale-105 transition-transform`}>
                          <span className="text-xs md:text-sm">{obj.avatar}</span>
                          <span className="text-[6px] font-mono font-bold uppercase tracking-tight truncate w-full">{obj.name.split(" ")[0]}</span>
                          <div className="w-4/5 bg-slate-950 h-0.5 rounded-full overflow-hidden mt-0.5">
                            <div className="bg-emerald-400 h-full" style={{ width: `${(obj.hp / obj.maxHp) * 100}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Tactical Combatants */}
                      {unit && (
                        <div className={`w-full h-full rounded flex flex-col items-center justify-between p-0.5 border relative overflow-hidden transition-all ${
                          unit.team === "player" 
                            ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]" 
                            : "border-rose-500 bg-rose-950/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                        }`}>
                          {unit.image ? (
                            <img 
                              src={unit.image} 
                              alt={unit.name} 
                              className={`w-full h-full object-cover rounded filter contrast-125 ${unit.image.includes("body") ? "object-top" : "object-center"}`} 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <span className="text-sm md:text-base my-auto">{unit.avatar}</span>
                          )}

                          {/* Overhead Badge */}
                          <div className="absolute top-0.5 left-0.5 flex items-center gap-0.5 bg-slate-950/90 px-1 py-0.2 rounded border border-white/10 text-[6px] font-mono font-black uppercase text-white">
                            <span>{unit.avatar}</span>
                            <span className="truncate max-w-[32px]">{unit.id === "player" ? "YOU" : unit.name.split(" ")[0]}</span>
                          </div>

                          {/* HP Bar */}
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 p-0.5 flex flex-col gap-0.2">
                            <div className="flex justify-between items-center text-[5.5px] font-mono text-slate-300 leading-none">
                              <span className="font-bold">HP</span>
                              <span>{unit.hp}/{unit.maxHp}</span>
                            </div>
                            <div className="w-full bg-slate-900 h-0.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${unit.team === "player" ? "bg-cyan-400" : "bg-rose-500"}`} 
                                style={{ width: `${Math.max(0, Math.min(100, (unit.hp / unit.maxHp) * 100))}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Controls Panel + Scanner + Log */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-1.5 w-full h-full min-h-0 overflow-y-auto pr-0.5">
          
          {/* Tactical Action Palette */}
          <div className="bg-slate-950/90 border border-cyan-500/20 rounded-xl p-2 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Crosshair size={12} className="text-cyan-400" /> TACTICAL INTERFACE
              </div>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                isPlayerTurn ? "bg-emerald-950 border-emerald-500/40 text-emerald-400" : "bg-slate-900 border-slate-700 text-slate-500"
              }`}>
                {isPlayerTurn ? "READY" : "STANDBY"}
              </span>
            </div>

            {/* Action Tabs */}
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setCombatActionTab("attacks")}
                className={`py-1 text-[8.5px] font-mono uppercase font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                  combatActionTab === "attacks" 
                    ? "bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]" 
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                ⚔️ Attacks
              </button>
              <button
                onClick={() => setCombatActionTab("skills")}
                className={`py-1 text-[8.5px] font-mono uppercase font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                  combatActionTab === "skills" 
                    ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]" 
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                🔮 Skills
              </button>
              <button
                onClick={() => setCombatActionTab("support")}
                className={`py-1 text-[8.5px] font-mono uppercase font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                  combatActionTab === "support" 
                    ? "bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                🏃 Support
              </button>
            </div>

            {/* Tab 1: Attacks */}
            {combatActionTab === "attacks" && (
              <div className="flex flex-col gap-1.5">
                <button
                  disabled={!isPlayerTurn || (playerUnit?.ap || 0) < 1}
                  onClick={() => onSelectAction("meleeAtk")}
                  className={`p-2 rounded-lg border font-mono text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
                    gridCombat.selectedAction === "meleeAtk"
                      ? "bg-rose-600 border-rose-300 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                      : "bg-slate-900/80 border-rose-500/30 text-rose-400 hover:bg-rose-950/40"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  ⚔️ STRIKE [1 AP]
                </button>
                <button
                  disabled={!isPlayerTurn || (playerUnit?.ap || 0) < 1}
                  onClick={() => onSelectAction("rangedAtk")}
                  className={`p-2 rounded-lg border font-mono text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
                    gridCombat.selectedAction === "rangedAtk"
                      ? "bg-amber-600 border-amber-300 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                      : "bg-slate-900/80 border-amber-500/30 text-amber-400 hover:bg-amber-950/40"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  🔫 SHOOT [1 AP]
                </button>
              </div>
            )}

            {/* Tab 2: Skills */}
            {combatActionTab === "skills" && (
              <div className="flex flex-col gap-1">
                {playerSkills.map((sk) => {
                  const isSelected = selectedSkill?.name === sk.name;
                  const canAfford = gameState.mana >= sk.cost && (playerUnit?.ap || 0) >= 1;

                  return (
                    <button
                      key={sk.name}
                      disabled={!isPlayerTurn || !canAfford}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSkill(null);
                          onSelectAction(null);
                        } else {
                          setSelectedSkill(sk);
                          onSelectAction("spell");
                          triggerToast(`SKILL ARMED: ${sk.name.toUpperCase()}`);
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-left font-mono transition-all flex flex-col gap-0.5 ${
                        isSelected 
                          ? "bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]" 
                          : "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-cyan-500/40"
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase flex items-center gap-1">
                          <span>{sk.icon}</span> {sk.name}
                        </span>
                        <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-500/30">
                          {sk.cost} MP
                        </span>
                      </div>
                      <p className="text-[7.5px] text-slate-400 font-sans leading-tight line-clamp-1">
                        {sk.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Support */}
            {combatActionTab === "support" && (
              <div className="flex flex-col gap-1.5">
                <button
                  disabled={!isPlayerTurn || (playerUnit?.ap || 0) < 1}
                  onClick={() => onSelectAction("move")}
                  className={`p-2 rounded-lg border font-mono text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
                    gridCombat.selectedAction === "move"
                      ? "bg-cyan-600 border-cyan-300 text-white shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                      : "bg-slate-900/80 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  🏃 MANEUVER / RELOCATE [1 AP]
                </button>
                <button
                  disabled={!isPlayerTurn || (playerUnit?.ap || 0) < 1 || gameState.hp >= gameState.maxHp}
                  onClick={() => onSelectAction("item")}
                  className="p-2 rounded-lg border font-mono text-[10px] font-black uppercase flex items-center justify-center gap-1.5 bg-slate-900/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  🧪 USE MED-STIM (+40 HP) [1 AP]
                </button>
              </div>
            )}

            {/* Bottom Turn Controls */}
            <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
              <button
                disabled={!isPlayerTurn}
                onClick={onEndTurn}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[9px] font-black uppercase rounded-lg border border-slate-600 transition-all flex items-center justify-center gap-1.5"
              >
                ⏱️ END TURN
              </button>
              <button
                disabled={!isPlayerTurn}
                onClick={onFleeCombat}
                className="w-full py-1.5 bg-slate-900/80 hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-rose-300 font-mono text-[9px] font-bold uppercase rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-1.5"
              >
                🏃 ATTEMPT FLEE
              </button>
            </div>
          </div>

          {/* Hovered Scanner Panel */}
          {hoveredEntity ? (
            <div className="bg-slate-950/90 border border-cyan-500/30 p-2 rounded-xl flex items-center gap-2.5 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
              <div className="w-10 h-10 rounded-lg border border-cyan-500/40 bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {hoveredEntity.image ? (
                  <img src={hoveredEntity.image} alt={hoveredEntity.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl">{hoveredEntity.avatar}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 font-mono">
                <div className="flex justify-between items-center leading-none">
                  <span className="text-[10px] font-black text-cyan-300 uppercase truncate">{hoveredEntity.name}</span>
                  <span className="text-[8px] font-bold text-slate-400">
                    HP: {hoveredEntity.hp}/{hoveredEntity.maxHp}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-tight line-clamp-2">{hoveredEntity.desc || hoveredEntity.description || "Active tactical entity signature."}</p>
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

      {/* Player Dead Overlay */}
      {gridCombat.combatants.find(c => c.id === "player")?.isDead && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-30 font-mono">
          <span className="text-red-500 font-black text-3xl animate-bounce select-none">☠️ VITALS SHATTERED ☠️</span>
          <p className="text-slate-400 text-xs max-w-sm uppercase leading-relaxed">
            Your bio-signatures flatlined in the grid database! Tactical shield matrices failed completely. Initiating emergency safehouse rescue protocol...
          </p>
          <button
            onClick={onDefeatReset}
            className="bg-red-500 hover:bg-red-400 text-slate-950 font-black px-6 py-3 rounded-lg text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          >
            Activate Auto-Rescue Beacon & Re-awaken
          </button>
        </div>
      )}

      {/* Enemies Eliminated Overlay */}
      {gridCombat.combatants.filter(c => c.team === "enemy" && !c.isDead).length === 0 && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-30 font-mono">
          <span className="text-emerald-400 font-black text-3xl animate-pulse select-none">★ THREAT ELIMINATED ★</span>
          <p className="text-slate-400 text-xs max-w-sm uppercase leading-relaxed">
            Airlock clear! All hostile signature feeds have been terminated. Recovery protocols have completed scanning.
          </p>
          <button
            onClick={onVictoryClaim}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-lg text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            Download Reward Chips & Proceed
          </button>
        </div>
      )}
    </motion.div>
  );
};
export default TacticalCombatView;
