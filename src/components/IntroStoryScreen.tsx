import React from "react";
import { Terminal, BookOpen, Cpu, Play, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { GameState } from "../types";

interface IntroStoryScreenProps {
  gameState: GameState;
  selectedArchetype: any;
  onAdjustBiometrics: () => void;
  onCommenceInfiltration: () => void;
}

export default function IntroStoryScreen({
  gameState,
  selectedArchetype,
  onAdjustBiometrics,
  onCommenceInfiltration
}: IntroStoryScreenProps) {
  return (
    <motion.div
      key="intro-story"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-7xl mx-auto w-full glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative p-6 md:p-8 flex flex-col gap-6 box-glow-cyan text-left font-mono"
    >
      {/* Top tag */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-extrabold">
            NEURAL UPLINK STABLE // SECTOR 4 SECURE CONDUIT
          </span>
        </div>
        <span className="font-mono text-3xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
          HEIST PRIORITY: ALPHA
        </span>
      </div>

      {/* Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Visual Banner column (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-xl border border-white/10 overflow-hidden shadow-2xl group h-48 md:h-64">
            {/* Widescreen visual banner */}
            <img
              src="https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=800"
              alt="Cyberpunk megacity night keyart"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="font-mono text-[8px] uppercase tracking-widest text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 inline-block mb-1.5 font-bold">
                [ LOCALITY PROFILE // MEGACITY-9 ]
              </span>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider leading-none">
                SECTOR 4 SLUMS
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">THE UNDERBELLY OF THE EMPIRE</p>
            </div>
          </div>

          {/* Operational parameters overlay */}
          <div className="bg-slate-950/70 border border-white/10 p-4 rounded-xl flex flex-col gap-3 font-mono text-left">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-black border-b border-white/5 pb-1">
              OPERATIVE BIO-CACHE
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                <span className="text-[9px] text-slate-500 block font-bold">CODENAME</span>
                <span className="text-white font-extrabold uppercase">{gameState.playerName}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                <span className="text-[9px] text-slate-500 block font-bold">SPECIES SPEC</span>
                <span className="text-rose-400 font-extrabold uppercase">{gameState.playerRace}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                <span className="text-[9px] text-slate-500 block font-bold">ARCHETYPE</span>
                <span className="text-cyan-400 font-extrabold uppercase">{selectedArchetype?.name?.replace("Cyber-", "")?.replace("Techno-", "") || "Blade"}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-white/5">
                <span className="text-[9px] text-slate-500 block font-bold">BACKGROUND</span>
                <span className="text-amber-400 font-extrabold uppercase">{gameState.playerBackground}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative prose & Controls Guide (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5 text-left">
          
          {/* Part 1: Lore and narrative */}
          <div className="bg-slate-950/40 border border-white/10 p-5 rounded-xl space-y-3.5">
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-rose-500" />
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">THE BRIEFING // THE SOL-PRIME GIG</h4>
            </div>
            
            <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
              <p>
                Welcome to <strong className="text-white">Megacity-9</strong>—a high-tech, low-life septic tank where corporate skyscrapers pierce the stratosphere like black chrome needles, and the remaining 99% choke on the radioactive sulfur-fog of Sector 4. Here, your neural cyberware is just leased property, your blood has a barcoded value, and human lives are traded in underground slave ledger books.
              </p>
              <p>
                Your crew leader, <strong className="text-rose-400 font-semibold">Vice</strong>—a heavy-metal smuggler and former Ares Biotech defector—has orchestrated the ultimate suicide heist. You are breaching the <strong className="text-cyan-400 font-semibold">Ares Biotech Deep Data Vault</strong> to steal the <em className="text-white not-italic font-bold">Sol-Prime Ley Core</em>. This relic isn't just data: it's a glowing, hyper-dense technomantic battery capable of merging raw psychic ether-waves with cold carbon-grid processors. If you extract it, you'll power your safehouse, feed your squad, and sever the corporate tracking collar forever.
              </p>
              <p className="border-l-2 border-red-500 pl-3 bg-red-950/20 py-2 rounded-r font-mono text-[11px] text-red-300">
                "Vice's voice crackles over your sub-dermal audio relay: 'No second chances, kid. Ares tactical enforcers are already sweeping the upper vents. Boot your deck, clear your buffers, and grab that core.'"
              </p>
            </div>
          </div>

          {/* Part 2: Controls and Guide panel */}
          <div className="bg-slate-950/70 border border-white/10 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className="text-cyan-400" />
              <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">TACTICAL GAMEPLAY INTERFACE INSTRUCTIONS</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Left: General controls */}
              <div className="space-y-2 border-r border-white/5 pr-2">
                <span className="font-mono text-[10px] text-cyan-400 font-black tracking-widest uppercase block mb-1">[ 🗺️ EXPLORATION ]</span>
                <ul className="space-y-1.5 list-disc pl-3 text-slate-400 leading-tight">
                  <li>
                    <strong className="text-slate-200">Regional map:</strong> Scan sectors and travel between 4 active regions.
                  </li>
                  <li>
                    <strong className="text-slate-200">Interact:</strong> Click on Points of Interest (POIs) to trigger events, unlock lockboxes, and start missions.
                  </li>
                  <li>
                    <strong className="text-slate-200">Gear up:</strong> Check your character database tab to manage weaponry, implants, and companion skills.
                  </li>
                </ul>
              </div>

              {/* Right: Combat controls */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-rose-500 font-black tracking-widest uppercase block mb-1">[ ⚔️ TURN-BASED COMBAT ]</span>
                <ul className="space-y-1.5 list-disc pl-3 text-slate-400 leading-tight">
                  <li>
                    <strong className="text-slate-200">Grid system:</strong> Move your token on a tactical tile grid. Movement costs 1 Action Point (AP) per grid tile.
                  </li>
                  <li>
                    <strong className="text-slate-200">Combat actions:</strong> Spend AP to perform melee strikes, ranged shots, or reload your weapons.
                  </li>
                  <li>
                    <strong className="text-slate-200">Mana (MP) spells:</strong> Unleash tactical spells and abilities to shield yourself or bypass enemy physical armors!
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex gap-4 items-center justify-between border-t border-white/5 pt-4">
            <button
              onClick={onAdjustBiometrics}
              className="text-slate-400 hover:text-white font-mono text-xs border border-white/10 px-4 py-2.5 rounded bg-slate-900/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Adjust Biometrics
            </button>

            <button
              onClick={onCommenceInfiltration}
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-display font-black text-xs uppercase py-2.5 px-6 rounded-lg tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] flex items-center gap-2"
            >
              <Play size={12} fill="currentColor" /> Commence Infiltration Routine <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
