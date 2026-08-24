import React, { useState } from "react";
import { 
  Crosshair, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Layers, 
  Bot, 
  Flame, 
  Zap, 
  Box, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { GridCombatant, GridInteractiveObject, GameState } from "../../types";

export interface CustomCombatEncounter {
  id: string;
  name: string;
  district: string;
  description: string;
  backgroundUrl: string;
  combatants: GridCombatant[];
  interactiveObjects: GridInteractiveObject[];
  rewardCredits: number;
  rewardExp: number;
  rewardItem?: string;
}

export interface TacticalEncounterStudioProps {
  encounters: CustomCombatEncounter[];
  setEncounters: React.Dispatch<React.SetStateAction<CustomCombatEncounter[]>>;
  gameState?: GameState | null;
  onLaunchEncounterInGame: (encounter: CustomCombatEncounter) => void;
  triggerToast: (msg: string) => void;
}

export const TacticalEncounterStudio: React.FC<TacticalEncounterStudioProps> = ({
  encounters,
  setEncounters,
  gameState,
  onLaunchEncounterInGame,
  triggerToast
}) => {
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>(
    encounters[0]?.id || "enc_conduit_ambush"
  );
  
  // Placement tool mode
  const [toolMode, setToolMode] = useState<"select" | "add_enemy" | "add_player" | "add_object" | "add_obstacle" | "erase">("select");
  const [selectedBrushUnit, setSelectedBrushUnit] = useState<{
    name: string;
    avatar: string;
    image?: string;
    team: "enemy" | "player";
    hp: number;
    maxHp: number;
    shields: number;
    maxShields: number;
    damage: number;
    range: number;
    ap: number;
    maxAp: number;
    color: string;
    initiative: number;
  }>({
    name: "Ares Cyber-Enforcer",
    avatar: "🥷",
    team: "enemy",
    hp: 85,
    maxHp: 85,
    shields: 20,
    maxShields: 20,
    damage: 24,
    range: 3,
    ap: 2,
    maxAp: 2,
    color: "border-rose-500 bg-rose-950/60",
    initiative: 12
  });

  const [selectedBrushObject, setSelectedBrushObject] = useState<{
    name: string;
    type: "terminal" | "battery" | "shield_cover";
    avatar: string;
    hp: number;
    maxHp: number;
    color: string;
    description: string;
  }>({
    name: "Volatile Ether Battery",
    type: "battery",
    avatar: "🔋",
    hp: 40,
    maxHp: 40,
    color: "border-cyan-400 bg-cyan-950/80 text-cyan-300",
    description: "Explodes violently when detonated, dealing 45 shock damage in an area."
  });

  const selectedEncounter = encounters.find(e => e.id === selectedEncounterId) || {
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
      },
      {
        id: "obj_terminal_1",
        name: "Ares Mainframe",
        type: "terminal" as const,
        x: 3,
        y: 4,
        hp: 50,
        maxHp: 50,
        isDestroyed: false,
        isHacked: false,
        avatar: "💻",
        color: "border-amber-400 bg-amber-950/80 text-amber-300",
        description: "Hackable grid terminal."
      }
    ],
    rewardCredits: 300,
    rewardExp: 60,
    rewardItem: "Military Stun Grenade"
  };

  const handleUpdateEncounter = (updated: CustomCombatEncounter) => {
    setEncounters(prev => {
      const idx = prev.findIndex(e => e.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
  };

  const handleCreateNewEncounter = () => {
    const newId = `enc_${Date.now().toString().slice(-4)}`;
    const newEnc: CustomCombatEncounter = {
      id: newId,
      name: "Tactical Skirmish Arena",
      district: gameState?.district || "conduit09",
      description: "Custom encounter crafted in GM Grid Spawner.",
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
        }
      ],
      interactiveObjects: [],
      rewardCredits: 250,
      rewardExp: 50
    };
    setEncounters(prev => [newEnc, ...prev]);
    setSelectedEncounterId(newId);
    triggerToast(`CREATED ENCOUNTER: [${newId}]`);
  };

  const handleDeleteEncounter = (id: string) => {
    setEncounters(prev => prev.filter(e => e.id !== id));
    if (selectedEncounterId === id) {
      setSelectedEncounterId(encounters.find(e => e.id !== id)?.id || "");
    }
    triggerToast(`DELETED ENCOUNTER: [${id}]`);
  };

  // Grid Cell Click Placement Handler
  const handleCellClick = (x: number, y: number) => {
    const existingCombatant = selectedEncounter.combatants.find(c => c.x === x && c.y === y);
    const existingObj = selectedEncounter.interactiveObjects.find(o => o.x === x && o.y === y);

    if (toolMode === "erase") {
      if (existingCombatant && existingCombatant.id !== "player") {
        handleUpdateEncounter({
          ...selectedEncounter,
          combatants: selectedEncounter.combatants.filter(c => !(c.x === x && c.y === y))
        });
        triggerToast(`ERASED UNIT AT (${x}, ${y})`);
      } else if (existingObj) {
        handleUpdateEncounter({
          ...selectedEncounter,
          interactiveObjects: selectedEncounter.interactiveObjects.filter(o => !(o.x === x && o.y === y))
        });
        triggerToast(`ERASED OBJECT AT (${x}, ${y})`);
      }
      return;
    }

    if (toolMode === "add_enemy" || toolMode === "add_player") {
      // Clear anything on this cell
      const filteredUnits = selectedEncounter.combatants.filter(c => !(c.x === x && c.y === y));
      const filteredObjs = selectedEncounter.interactiveObjects.filter(o => !(o.x === x && o.y === y));
      
      const newUnit: GridCombatant = {
        id: toolMode === "add_player" ? "player" : `enemy_${Date.now().toString().slice(-4)}`,
        name: selectedBrushUnit.name,
        team: selectedBrushUnit.team,
        hp: selectedBrushUnit.hp,
        maxHp: selectedBrushUnit.maxHp,
        shields: selectedBrushUnit.shields,
        maxShields: selectedBrushUnit.maxShields,
        damage: selectedBrushUnit.damage,
        range: selectedBrushUnit.range,
        ap: selectedBrushUnit.ap,
        maxAp: selectedBrushUnit.maxAp,
        color: selectedBrushUnit.color,
        initiative: selectedBrushUnit.initiative,
        avatar: selectedBrushUnit.avatar,
        x,
        y,
        isDead: false
      };

      // If repositioning player, remove old player
      const finalUnits = toolMode === "add_player" 
        ? filteredUnits.filter(u => u.id !== "player").concat(newUnit)
        : filteredUnits.concat(newUnit);

      handleUpdateEncounter({
        ...selectedEncounter,
        combatants: finalUnits,
        interactiveObjects: filteredObjs
      });
      triggerToast(`SPAWNED [${newUnit.name}] AT (${x}, ${y})`);
    } else if (toolMode === "add_object") {
      const filteredUnits = selectedEncounter.combatants.filter(c => !(c.x === x && c.y === y));
      const filteredObjs = selectedEncounter.interactiveObjects.filter(o => !(o.x === x && o.y === y));

      const newObj: GridInteractiveObject = {
        id: `obj_${Date.now().toString().slice(-4)}`,
        name: selectedBrushObject.name,
        type: selectedBrushObject.type,
        avatar: selectedBrushObject.avatar,
        hp: selectedBrushObject.hp,
        maxHp: selectedBrushObject.maxHp,
        color: selectedBrushObject.color,
        description: selectedBrushObject.description,
        x,
        y,
        isDestroyed: false,
        isHacked: false
      };

      handleUpdateEncounter({
        ...selectedEncounter,
        combatants: filteredUnits,
        interactiveObjects: filteredObjs.concat(newObj)
      });
      triggerToast(`PLACED [${newObj.name}] AT (${x}, ${y})`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full overflow-hidden">
      
      {/* LEFT COLUMN: Encounter Selector & Properties */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[11px] font-black text-cyan-300 uppercase flex items-center gap-1.5">
            <Crosshair size={13} className="text-cyan-400" /> ENCOUNTERS ({encounters.length})
          </span>
          <button
            onClick={handleCreateNewEncounter}
            className="p-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded transition-all cursor-pointer"
            title="Create New Encounter"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5 max-h-[160px]">
          {encounters.map(enc => (
            <div
              key={enc.id}
              onClick={() => setSelectedEncounterId(enc.id)}
              className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                selectedEncounterId === enc.id
                  ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div className="min-w-0">
                <div className="text-[9px] font-bold truncate text-slate-200">{enc.name}</div>
                <div className="text-[7.5px] text-slate-500 font-mono truncate uppercase">
                  {enc.district} • {enc.combatants.length} Units • {enc.interactiveObjects.length} Objs
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEncounter(enc.id);
                }}
                className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Selected Encounter Metadata Form */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5 text-[9px]">
          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Encounter Name</label>
            <input
              type="text"
              value={selectedEncounter.name}
              onChange={e => handleUpdateEncounter({ ...selectedEncounter, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200 focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1">Reward ¤</label>
              <input
                type="number"
                value={selectedEncounter.rewardCredits}
                onChange={e => handleUpdateEncounter({ ...selectedEncounter, rewardCredits: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 uppercase font-bold block mb-1">Reward XP</label>
              <input
                type="number"
                value={selectedEncounter.rewardExp}
                onChange={e => handleUpdateEncounter({ ...selectedEncounter, rewardExp: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 uppercase font-bold block mb-1">Item Drop (Optional)</label>
            <input
              type="text"
              value={selectedEncounter.rewardItem || ""}
              onChange={e => handleUpdateEncounter({ ...selectedEncounter, rewardItem: e.target.value })}
              placeholder="e.g. Military Cyber-Deck"
              className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Launch Live Skirmish Test Button */}
        <button
          onClick={() => onLaunchEncounterInGame(selectedEncounter)}
          className="mt-auto py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
        >
          <Play size={13} /> Launch Tactical Skirmish
        </button>
      </div>

      {/* MIDDLE COLUMN: 8x6 Tactical Grid Canvas */}
      <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between gap-2">
        <div className="flex justify-between items-center w-full border-b border-white/5 pb-1 text-[9px] font-mono">
          <span className="text-cyan-300 uppercase font-black flex items-center gap-1">
            <Layers size={13} className="text-cyan-400" /> TACTICAL BATTLEFIELD MATRIX [8X6]
          </span>
          <span className="text-slate-500">
            ACTIVE BRUSH: <span className="text-cyan-400 font-bold uppercase">{toolMode}</span>
          </span>
        </div>

        {/* 8x6 Grid Visualizer */}
        <div 
          className="grid grid-cols-8 grid-rows-6 gap-1 p-1 border border-slate-800 rounded-xl relative select-none aspect-[8/6] w-full max-h-[380px]"
          style={{
            backgroundImage: `url('${selectedEncounter.backgroundUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] pointer-events-none rounded-xl" />

          {Array.from({ length: 6 }).map((_, y) => (
            Array.from({ length: 8 }).map((_, x) => {
              const unit = selectedEncounter.combatants.find(c => c.x === x && c.y === y && !c.isDead);
              const obj = selectedEncounter.interactiveObjects.find(o => o.x === x && o.y === y && !o.isDestroyed);

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`relative z-10 rounded border flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                    unit 
                      ? unit.team === "player"
                        ? "border-cyan-400 bg-cyan-950/70 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                        : "border-rose-500 bg-rose-950/70 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                      : obj
                        ? "border-amber-400 bg-amber-950/70"
                        : "border-slate-800/40 bg-slate-900/20 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                  }`}
                >
                  <span className="absolute bottom-0.5 right-0.5 text-[6px] font-mono text-slate-600 select-none">
                    {x},{y}
                  </span>

                  {unit && (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-sm">{unit.avatar}</span>
                      <span className="text-[6.5px] font-bold text-white uppercase truncate max-w-[40px]">
                        {unit.name.split(" ")[0]}
                      </span>
                    </div>
                  )}

                  {obj && !unit && (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-xs">{obj.avatar}</span>
                      <span className="text-[6px] font-bold text-amber-300 uppercase truncate max-w-[40px]">
                        {obj.name.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>

        {/* Grid Stats Bar */}
        <div className="w-full flex justify-between items-center text-[8.5px] text-slate-400 font-mono border-t border-white/5 pt-1">
          <span>HOSTILES: {selectedEncounter.combatants.filter(c => c.team === "enemy").length}</span>
          <span>SQUAD / ALLIES: {selectedEncounter.combatants.filter(c => c.team === "player").length}</span>
          <span>INTERACTIVE TERMINALS/BATTERIES: {selectedEncounter.interactiveObjects.length}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Brush Palette & Object Library */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 overflow-y-auto">
        <span className="text-[11px] font-black text-cyan-300 uppercase flex items-center gap-1.5 border-b border-white/5 pb-2">
          <Sparkles size={13} className="text-cyan-400" /> PALETTE & BRUSH TOOL
        </span>

        {/* Tool Mode Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setToolMode("add_enemy")}
            className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg border flex items-center justify-center gap-1 transition-all ${
              toolMode === "add_enemy"
                ? "bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🥷 Place Enemy
          </button>

          <button
            onClick={() => setToolMode("add_player")}
            className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg border flex items-center justify-center gap-1 transition-all ${
              toolMode === "add_player"
                ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            ⚡ Place Player
          </button>

          <button
            onClick={() => setToolMode("add_object")}
            className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg border flex items-center justify-center gap-1 transition-all ${
              toolMode === "add_object"
                ? "bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔋 Place Object
          </button>

          <button
            onClick={() => setToolMode("erase")}
            className={`py-1.5 text-[8.5px] font-black uppercase rounded-lg border flex items-center justify-center gap-1 transition-all ${
              toolMode === "erase"
                ? "bg-slate-800 border-slate-400 text-white"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🧹 Eraser Tool
          </button>
        </div>

        {/* Enemy Preset Archetypes */}
        {toolMode === "add_enemy" && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
            <span className="text-[8.5px] font-black text-slate-400 uppercase">ENEMY PRESET TEMPLATES:</span>
            
            <button
              onClick={() => setSelectedBrushUnit({
                name: "Ares Cyber-Enforcer",
                avatar: "🥷",
                team: "enemy",
                hp: 85,
                maxHp: 85,
                shields: 20,
                maxShields: 20,
                damage: 24,
                range: 3,
                ap: 2,
                maxAp: 2,
                color: "border-rose-500 bg-rose-950/60",
                initiative: 12
              })}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-left hover:border-rose-500/50 flex items-center gap-2"
            >
              <span className="text-base">🥷</span>
              <div>
                <div className="text-[9px] font-bold text-slate-200">Ares Enforcer</div>
                <div className="text-[7.5px] text-slate-400">HP 85 • DMG 24 • RNG 3</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedBrushUnit({
                name: "Heavy Vanguard Mech",
                avatar: "🤖",
                team: "enemy",
                hp: 140,
                maxHp: 140,
                shields: 40,
                maxShields: 40,
                damage: 32,
                range: 2,
                ap: 2,
                maxAp: 2,
                color: "border-rose-600 bg-rose-950/80",
                initiative: 6
              })}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-left hover:border-rose-500/50 flex items-center gap-2"
            >
              <span className="text-base">🤖</span>
              <div>
                <div className="text-[9px] font-bold text-slate-200">Heavy Vanguard Mech</div>
                <div className="text-[7.5px] text-slate-400">HP 140 • DMG 32 • RNG 2</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedBrushUnit({
                name: "Technomancer Cultist",
                avatar: "🔮",
                team: "enemy",
                hp: 65,
                maxHp: 65,
                shields: 30,
                maxShields: 30,
                damage: 28,
                range: 4,
                ap: 2,
                maxAp: 2,
                color: "border-purple-500 bg-purple-950/60",
                initiative: 14
              })}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-left hover:border-purple-500/50 flex items-center gap-2"
            >
              <span className="text-base">🔮</span>
              <div>
                <div className="text-[9px] font-bold text-slate-200">Technomancer Cultist</div>
                <div className="text-[7.5px] text-slate-400">HP 65 • DMG 28 • RNG 4</div>
              </div>
            </button>
          </div>
        )}

        {/* Interactive Object Archetypes */}
        {toolMode === "add_object" && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
            <span className="text-[8.5px] font-black text-slate-400 uppercase">OBJECT PRESETS:</span>

            <button
              onClick={() => setSelectedBrushObject({
                name: "Ether Power Cell",
                type: "battery",
                avatar: "🔋",
                hp: 35,
                maxHp: 35,
                color: "border-cyan-400 bg-cyan-950/80 text-cyan-300",
                description: "Volatile battery."
              })}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-left hover:border-cyan-500/50 flex items-center gap-2"
            >
              <span className="text-base">🔋</span>
              <div>
                <div className="text-[9px] font-bold text-cyan-300">Ether Power Cell</div>
                <div className="text-[7.5px] text-slate-400">Volatile Explodable (35 HP)</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedBrushObject({
                name: "Security Terminal",
                type: "terminal",
                avatar: "💻",
                hp: 50,
                maxHp: 50,
                color: "border-amber-400 bg-amber-950/80 text-amber-300",
                description: "Hackable mainframe."
              })}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-left hover:border-amber-500/50 flex items-center gap-2"
            >
              <span className="text-base">💻</span>
              <div>
                <div className="text-[9px] font-bold text-amber-300">Security Terminal</div>
                <div className="text-[7.5px] text-slate-400">NetSlicer Hackable Matrix</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedBrushObject({
                name: "Hardened Nanite Cover",
                type: "shield_cover",
                avatar: "🛡️",
                hp: 80,
                maxHp: 80,
                color: "border-emerald-400 bg-emerald-950/80 text-emerald-300",
                description: "Blast-resistant cover."
              })}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-left hover:border-emerald-500/50 flex items-center gap-2"
            >
              <span className="text-base">🛡️</span>
              <div>
                <div className="text-[9px] font-bold text-emerald-300">Nanite Cover Wall</div>
                <div className="text-[7.5px] text-slate-400">Absorbs 80 ballistic damage</div>
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TacticalEncounterStudio;
