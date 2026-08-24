import React from "react";
import { Plus, Terminal } from "lucide-react";
import { motion } from "motion/react";

interface MainMenuScreenProps {
  hasSave: boolean;
  onNewGame: () => void;
  onLoadGame: () => void;
  onWipeSave: () => void;
}

export default function MainMenuScreen({
  hasSave,
  onNewGame,
  onLoadGame,
  onWipeSave
}: MainMenuScreenProps) {
  return (
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
          onClick={onNewGame}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold uppercase py-3 rounded-md transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          <Plus size={15} /> Deploy New Agent
        </button>

        <button
          onClick={onLoadGame}
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
            onClick={onWipeSave}
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
  );
}
