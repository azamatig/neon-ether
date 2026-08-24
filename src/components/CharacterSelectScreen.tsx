import React from "react";
import { ArrowLeft, Sparkles, Cpu, Coins, User, Skull, Shuffle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useGame } from "../context/GameContext";
import { ARCHETYPES, getInitialState } from "../data";
import { LogMessage } from "../types";

// Helper to derive perks based on Level
function getPerksForLevel(level: number): string[] {
  const perks: string[] = [];
  if (level >= 2) {
    perks.push("adrenaline_junkie");
    perks.push("Adrenaline Junkie");
  }
  if (level >= 3) {
    perks.push("cyber_optimizer");
    perks.push("Cyber-Optimizer");
  }
  if (level >= 4) {
    perks.push("ether_conduit");
    perks.push("Ether Conduit");
  }
  return perks;
}

export default function CharacterSelectScreen() {
  const {
    setCurrentScreen,
    selectedArchetype,
    setSelectedArchetype,
    customName,
    setCustomName,
    customAge,
    setCustomAge,
    customRace,
    setCustomRace,
    customAvatarUrl,
    setCustomAvatarUrl,
    customBackground,
    setCustomBackground,
    selectedPerks,
    setSelectedPerks,
    charSelectStep,
    setCharSelectStep,
    statPointsPool,
    setStatPointsPool,
    addedStats,
    setAddedStats,
    previewSkillTreeClass,
    setPreviewSkillTreeClass,
    setLogs,
    setGameState,
    setActiveRegionId,
    setActivePOIView,
    setIsLoading,
    triggerToast
  } = useGame();

  const selectedBaseStats = {
    str: selectedArchetype.name === "Cyber-Blade" ? 14 : selectedArchetype.name === "Techno-Mage" ? 9 : 10,
    dex: selectedArchetype.name === "Cyber-Blade" ? 15 : selectedArchetype.name === "Techno-Mage" ? 11 : 13,
    int: selectedArchetype.name === "Cyber-Blade" ? 10 : selectedArchetype.name === "Techno-Mage" ? 14 : 15,
    will: selectedArchetype.name === "Cyber-Blade" ? 11 : selectedArchetype.name === "Techno-Mage" ? 12 : 11,
    eth: selectedArchetype.name === "Cyber-Blade" ? 10 : selectedArchetype.name === "Techno-Mage" ? 15 : 11,
  };

  const selectedRaceMods = { str: 0, dex: 0, int: 0, will: 0, eth: 0 };
  if (customRace === "Human") {
    selectedRaceMods.str += 1;
    selectedRaceMods.dex += 1;
  } else if (customRace === "Cyborg") {
    selectedRaceMods.dex += 2;
    selectedRaceMods.int += 1;
    selectedRaceMods.will -= 1;
  } else if (customRace === "Mutant") {
    selectedRaceMods.str += 2;
    selectedRaceMods.eth += 2;
    selectedRaceMods.int -= 2;
  } else if (customRace === "Elf" || customRace === "Neuro-Elf") {
    selectedRaceMods.int += 2;
    selectedRaceMods.will += 2;
    selectedRaceMods.str -= 1;
  } else if (customRace === "Dwarf" || customRace === "Chrome-Dwarf") {
    selectedRaceMods.str += 2;
    selectedRaceMods.will += 2;
    selectedRaceMods.dex -= 1;
  }

  const selectedBgMods = { str: 0, dex: 0, int: 0, will: 0, eth: 0 };
  if (customBackground === "Street Rat") {
    selectedBgMods.dex += 1;
  } else if (customBackground === "Ex-Corp Agent") {
    selectedBgMods.int += 1;
  } else if (customBackground === "Glitched Specimen") {
    selectedBgMods.str += 1;
    selectedBgMods.eth += 1;
  } else if (customBackground === "Grid Drifter") {
    selectedBgMods.str += 1;
    selectedBgMods.will += 1;
  }

  const previewStr = selectedBaseStats.str + selectedRaceMods.str + selectedBgMods.str + addedStats.str;
  const previewDex = selectedBaseStats.dex + selectedRaceMods.dex + selectedBgMods.dex + addedStats.dex;
  const previewInt = selectedBaseStats.int + selectedRaceMods.int + selectedBgMods.int + addedStats.int;
  const previewWill = selectedBaseStats.will + selectedRaceMods.will + selectedBgMods.will + addedStats.will;
  const previewEth = selectedBaseStats.eth + selectedRaceMods.eth + selectedBgMods.eth + addedStats.eth;

  let previewHp = selectedArchetype.maxHp;
  if (customBackground === "Ex-Corp Agent") previewHp -= 10;
  if (customBackground === "Glitched Specimen") previewHp += 20;

  let previewCredits = selectedArchetype.credits;
  if (customBackground === "Street Rat") previewCredits += 20;
  if (customBackground === "Ex-Corp Agent") previewCredits += 50;
  if (customBackground === "Glitched Specimen") previewCredits -= 30;

  const portraitChoices = [
    { name: "Blade", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
    { name: "Mage", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
    { name: "Hacker", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200" },
    { name: "Rebel", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" },
    { name: "Mercenary", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200" }
  ];

  const raceOptions = [
    { name: "Human", bonus: "+1 Str, +1 Dex", desc: "Adaptable biological genome." },
    { name: "Cyborg", bonus: "+2 Dex, +1 Int, -1 Will", desc: "Refined mechanoid micro-coils." },
    { name: "Mutant", bonus: "+2 Str, +2 Eth, -2 Int", desc: "Radiation-infused chemical muscle." },
    { name: "Elf", bonus: "+2 Int, +2 Will, -1 Str", desc: "Ether-sensitive neuron networks." },
    { name: "Dwarf", bonus: "+2 Will, +2 Str, -1 Dex", desc: "Reinforced titanium skeletal plates." }
  ];

  const backgroundOptions = [
    { name: "Street Rat", bonus: "+20 Credits, +1 Dex", desc: "Scavenging courier inside level 1 slums." },
    { name: "Ex-Corp Agent", bonus: "+50 Credits, -10 HP, +1 Int", desc: "Former security analyst fleeing Biotech Tower." },
    { name: "Glitched Specimen", bonus: "+20 Max HP, -30 Credits", desc: "Illicit mind-bender subject breakouts." },
    { name: "Grid Drifter", bonus: "+1 Str, +1 Will", desc: "Hardened wanderer mapping outer deserts." }
  ];

  const ALL_12_PERKS = [
    { id: "Genius", name: "Genius", icon: "🧠", desc: "+2 Intelligence. Makes systems hacking and INT checks significantly easier." },
    { id: "Iron Will", name: "Iron Will", icon: "🛡️", desc: "+2 Willpower. Prevents flatlining, reviving you at 25% HP once per combat encounter." },
    { id: "Street Smart", name: "Street Smart", icon: "💸", desc: "+30 starting Credits. Unlocks illegal back-alley street negotiations." },
    { id: "Adrenaline Rush", name: "Adrenaline Rush", icon: "⚡", desc: "Gain +15% overall physical and elemental damage when HP is below 40%." },
    { id: "Cybernetic Optimizer", name: "Cybernetic Optimizer", icon: "🔋", desc: "Start every combat encounter with +15 active energy Shields." },
    { id: "Ether Conduit", name: "Ether Conduit", icon: "🔮", desc: "Siphon ambient ley lines to regenerate +2 MP at the start of every combat turn." },
    { id: "Hardened Chassis", name: "Hardened Chassis", icon: "🦾", desc: "+30 Max HP permanent health boost to organic carbon-plates." },
    { id: "Shadow Operative", name: "Shadow Operative", icon: "👤", desc: "+1 Dexterity. Enhances digital and manual evasion checks by +20%." },
    { id: "Heavy Hitter", name: "Heavy Hitter", icon: "⚔️", desc: "+1 Strength. Melee kinetic blows deal +10% additional physical damage." },
    { id: "Apex Reflexes", name: "Apex Reflexes", icon: "🏃", desc: "+2 Dexterity. Increases active combat critical hit chance by +10%." },
    { id: "Technomancer Catalyst", name: "Technomancer Catalyst", icon: "🌪️", desc: "+1 Ether. Focuses technomancy relays, dealing +15% spell-slash damage." },
    { id: "Surprise Tactics", name: "Surprise Tactics", icon: "🎯", desc: "Unleash rapid fire, starting the first combat turn of a battle with +1 AP." },
    { id: "Mindmancer Acolyte", name: "Mindmancer Acolyte", icon: "👁️", desc: "Dual-class into Mindmancer. Gain mental manipulation (Mind Control, Persuasion, Memory Wipe) in all chapters and dialogues." }
  ];

  const skillTrees: Record<string, { name: string; cost: string; desc: string; icon: string }[]> = {
    "Cyber-Blade": [
      { name: "Viper Strike (Tier 1)", cost: "10 MP", desc: "Melee blow dealing +150% physical damage with a chemical armor-dissolving corrosion debuff.", icon: "⚔️" },
      { name: "Adrenaline Surge (Tier 2)", cost: "15 MP", desc: "Inject fast combat-stimulants, granting +2 AP and +15% Critical Hit Chance for 2 turns.", icon: "⚡" },
      { name: "Phantom Dash (Tier 3)", cost: "20 MP", desc: "Bypass defensive fields to blink behind a target, performing a guaranteed 300% backstab crit.", icon: "👤" },
      { name: "Razor Tempest (Tier 4)", cost: "25 MP", desc: "Unleash a whirlwind of molecular edge sweeps, dealing 30 Physical damage to all targets and bleeding them.", icon: "🌪️" },
      { name: "Cyber-Celerity (Tier 5)", cost: "18 MP", desc: "Accelerate neural clock-rate, dodging the next 2 physical attacks completely.", icon: "🏃" },
      { name: "Executioner's Wake (Tier 6)", cost: "35 MP", desc: "Ultimate single-target execution, dealing massive 55 damage. If the target dies, immediately refunds 50% mana.", icon: "☠️" }
    ],
    "Techno-Mage": [
      { name: "Ether Spark (Tier 1)", cost: "8 MP", desc: "Bends ambient ley structures to fire a direct energy bolt, dealing 18 Ether damage.", icon: "🔮" },
      { name: "Net Shield (Tier 2)", cost: "12 MP", desc: "Materialize an active firewall barrier over your neural interface, granting +15 Shields.", icon: "🛡️" },
      { name: "Feedback Burn (Tier 3)", cost: "22 MP", desc: "Overload target cerebral deck terminals, causing a spell explosion for 35 damage and 1 turn Silence.", icon: "💥" },
      { name: "Quantum Singularity (Tier 4)", cost: "28 MP", desc: "Force-collapse local gravity, pulling all hostiles together, dealing 25 void damage, and pinning them down (Stun).", icon: "🌌" },
      { name: "Bio-Electric Surge (Tier 5)", cost: "20 MP", desc: "Chain cyber-organic lightning through up to 3 hostiles, inflicting 30 shock damage and disabling robotic components.", icon: "⚡" },
      { name: "Absolute Zero Code (Tier 6)", cost: "40 MP", desc: "Freeze target CPU units entirely, dealing 50 frost-code damage and completely incapacitating them for 2 turns.", icon: "❄️" }
    ],
    "Outlaw Hacker": [
      { name: "ICE Disruption (Tier 1)", cost: "10 MP", desc: "Inject corrupted software into enemy combat sub-routines, lowering accuracy by 30%.", icon: "💻" },
      { name: "Targeting Link (Tier 2)", cost: "12 MP", desc: "Paint the target with an orbital micro-laser, boosting all ranged damage they take by +25%.", icon: "🎯" },
      { name: "Systems Overload (Tier 3)", cost: "25 MP", desc: "Trigger remote battery/munition discharges, inflicting 28 range damage and stun.", icon: "🔋" },
      { name: "Glitch Protocol (Tier 4)", cost: "18 MP", desc: "Siphon active shield energy from hostiles, turning their own protective grids into a massive defensive shield (+20 Shields).", icon: "🛰️" },
      { name: "Nano-Swarm Hack (Tier 5)", cost: "22 MP", desc: "Reprogram nanite aerosol injectors to eat away enemy components, dealing 12 corrosion damage per turn for 3 turns.", icon: "🐜" },
      { name: "Satellite Guillotine (Tier 6)", cost: "35 MP", desc: "Command a decommissioned spy satellite to fire a high-orbit kinetic rod on the grid, dealing 55 heavy impact damage.", icon: "☄️" }
    ],
    "Mindmancer": [
      { name: "Mind Hack (Tier 1)", cost: "15 MP", desc: "Direct synaptic rewrite, hacking target motor functions and forcing them to attack allies.", icon: "👁️" },
      { name: "Neural Overload (Tier 2)", cost: "20 MP", desc: "Psychic cortex shock inflicting 25 damage, completely ignoring physical armor layers.", icon: "🧠" },
      { name: "Synaptic Cascade (Tier 3)", cost: "30 MP", desc: "Meltdown blast on all nearby targets dealing 40 psychic damage, locking brains in vegetative sleep.", icon: "🌀" },
      { name: "Ether Shroud (Tier 4)", cost: "18 MP", desc: "Banish yourself to the digital ether plane, becoming completely untargetable and immune to damage for 1 turn.", icon: "🌫️" },
      { name: "Hallucinatory Echo (Tier 5)", cost: "24 MP", desc: "Clone your neural signature, creating 2 holograms that absorb incoming single-target spells.", icon: "👥" },
      { name: "Cerebro-Collapse (Tier 6)", cost: "45 MP", desc: "Total psychic execution. Obliterates target neural paths for 60 psychic damage, transferring 50% of the damage dealt as active health to yourself.", icon: "🥀" }
    ]
  };

  const handleStatChange = (stat: "str" | "dex" | "int" | "will" | "eth", amount: number) => {
    if (amount > 0 && statPointsPool > 0) {
      setAddedStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
      setStatPointsPool(prev => prev - 1);
    } else if (amount < 0 && addedStats[stat] > 0) {
      setAddedStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
      setStatPointsPool(prev => prev + 1);
    }
  };

  const randomizeName = () => {
    const names = ["Kaelen_X", "Valerie_Dex", "Cipher_09", "Vance_Street", "Zero_Net", "Specter_V", "Rogue_Prime", "Echo_Chrome", "Rift_Blade", "Viper_T"];
    const selected = names[Math.floor(Math.random() * names.length)];
    setCustomName(selected);
  };

  const handleDeployAgent = async () => {
    setIsLoading(true);
    const initial = getInitialState(selectedArchetype);
    
    // Set custom properties
    initial.playerName = customName.trim() || "Kaelen";
    initial.playerAge = customAge;
    initial.playerRace = customRace;
    initial.playerAvatarUrl = customAvatarUrl;
    initial.playerBackground = customBackground;
    initial.playerPerks = [...selectedPerks, ...getPerksForLevel(initial.level || 1)];
    
    // Establish base attributes
    const baseAttrs = { ...initial.attributes };
    
    // Add player's distributed stat points
    baseAttrs.str = (baseAttrs.str || 10) + addedStats.str;
    baseAttrs.dex = (baseAttrs.dex || 10) + addedStats.dex;
    baseAttrs.int = (baseAttrs.int || 10) + addedStats.int;
    baseAttrs.will = (baseAttrs.will || 10) + addedStats.will;
    baseAttrs.eth = (baseAttrs.eth || 10) + addedStats.eth;

    // Apply selected starting perks stat bonuses
    if (selectedPerks.includes("Genius")) {
      baseAttrs.int = (baseAttrs.int || 10) + 2;
    }
    if (selectedPerks.includes("Iron Will")) {
      baseAttrs.will = (baseAttrs.will || 10) + 2;
    }
    if (selectedPerks.includes("Shadow Operative")) {
      baseAttrs.dex = (baseAttrs.dex || 10) + 1;
    }
    if (selectedPerks.includes("Heavy Hitter")) {
      baseAttrs.str = (baseAttrs.str || 10) + 1;
    }
    if (selectedPerks.includes("Apex Reflexes")) {
      baseAttrs.dex = (baseAttrs.dex || 10) + 2;
    }
    if (selectedPerks.includes("Technomancer Catalyst")) {
      baseAttrs.eth = (baseAttrs.eth || 10) + 1;
    }
    if (selectedPerks.includes("Hardened Chassis")) {
      initial.maxHp = (initial.maxHp || 100) + 30;
      initial.hp = initial.maxHp;
    }
    if (selectedPerks.includes("Street Smart")) {
      initial.credits += 30;
    }
    if (selectedPerks.includes("Lucky Jack")) {
      initial.credits += 40;
    }
    
    // Apply Race stat modifiers
    if (customRace === "Human") {
      baseAttrs.str += 1;
      baseAttrs.dex += 1;
    } else if (customRace === "Cyborg") {
      baseAttrs.dex += 2;
      baseAttrs.int += 1;
      baseAttrs.will -= 1;
    } else if (customRace === "Mutant") {
      baseAttrs.str += 2;
      baseAttrs.eth += 2;
      baseAttrs.int -= 2;
    } else if (customRace === "Elf" || customRace === "Neuro-Elf") {
      baseAttrs.int += 2;
      baseAttrs.will += 2;
      baseAttrs.str -= 1;
    } else if (customRace === "Dwarf" || customRace === "Chrome-Dwarf") {
      baseAttrs.str += 2;
      baseAttrs.will += 2;
      baseAttrs.dex -= 1;
    }
    
    // Apply Background modifiers
    if (customBackground === "Street Rat") {
      initial.credits += 20;
      baseAttrs.dex += 1;
    } else if (customBackground === "Ex-Corp Agent") {
      initial.credits += 50;
      initial.maxHp = Math.max(40, (initial.maxHp || 100) - 10);
      initial.hp = initial.maxHp;
      baseAttrs.int += 1;
    } else if (customBackground === "Glitched Specimen") {
      initial.maxHp = (initial.maxHp || 100) + 20;
      initial.hp = initial.maxHp;
      initial.credits = Math.max(10, initial.credits - 30);
      baseAttrs.str += 1;
      baseAttrs.eth += 1;
    } else if (customBackground === "Grid Drifter") {
      baseAttrs.str += 1;
      baseAttrs.will += 1;
    }
    
    initial.attributes = baseAttrs;
    
    // Apply Mindmancer dual-class configurations
    if (selectedPerks.includes("Mindmancer Acolyte") || selectedArchetype.name === "Techno-Mage") {
      initial.mindmancerUnlocked = true;
      if (initial.skills) {
        initial.skills.mindmancer = Math.max(initial.skills.mindmancer || 0, 1);
      }
    }
    
    const welcomeLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `DEPLOYED AGENT [${initial.playerName}] (${customRace} ${selectedArchetype.name}) into Megacity-9 slums. Background: ${customBackground}. Cognitive passives fully integrated. Initial gear established: ${initial.inventory.join(", ")}. Primary credits balance: ${initial.credits}¤.\n\nYour organic cybernetic cortex aligns with sol-prime parameters. The neon glow hums underneath your heels.\n\nSelect districts on the overland map to scan. Enter POIs to trigger local interaction consoles.`,
      type: "system",
      district: initial.district,
      poi: initial.poi
    };

    setLogs([welcomeLog]);
    setGameState(initial);
    setActiveRegionId("conduit09");
    setActivePOIView("ventilation_shaft");
    setCurrentScreen("intro_story");
    setIsLoading(false);
  };

  const handleTogglePerk = (perkId: string) => {
    if (selectedPerks.includes(perkId)) {
      setSelectedPerks(prev => prev.filter(p => p !== perkId));
    } else {
      if (selectedPerks.length >= 2) {
        triggerToast("MAXIMUM OF 2 STARTING PERKS ALLOWED!");
        return;
      }
      setSelectedPerks(prev => [...prev, perkId]);
    }
  };

  return (
    <motion.div
      key="character-select"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-7xl mx-auto w-full glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative p-6 md:p-8 flex flex-col gap-5 text-left font-mono"
    >
      {/* Back button to main menu */}
      <button
        onClick={() => {
          setCurrentScreen("menu");
        }}
        className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-mono border border-white/5 px-2 py-1 rounded bg-slate-900/60 transition-all cursor-pointer z-10 animate-fade-in"
      >
        <ArrowLeft size={13} /> Back to Terminal
      </button>

      {/* Compact Title Header with Steps */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center pt-2 pb-4 border-b border-white/5 gap-3">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-400 font-bold block mb-0.5">
            [ COGNITIVE REGISTRATION ]
          </span>
          <h2 className="font-display font-extrabold text-lg text-white uppercase tracking-wider leading-none">
            OPERATIVE CONFIGURATION
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase">
            INITIALIZE BIOMETRICS &amp; SYNAPSE INTEGRATION
          </p>
        </div>
        
        {/* Visual Step Tracker */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button 
            onClick={() => charSelectStep > 1 && setCharSelectStep(1)}
            className={`px-3 py-1.5 rounded border transition-all ${
              charSelectStep === 1 
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 font-black shadow-[0_0_8px_rgba(6,182,212,0.15)]" 
                : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
            }`}
          >
            1. IDENTITY
          </button>
          <div className="w-4 h-[1px] bg-white/10" />
          <button 
            onClick={() => charSelectStep > 1 && setCharSelectStep(2)}
            disabled={charSelectStep < 1}
            className={`px-3 py-1.5 rounded border transition-all ${
              charSelectStep === 2 
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 font-black shadow-[0_0_8px_rgba(6,182,212,0.15)]" 
                : charSelectStep > 2 
                  ? "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  : "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            2. MATRIX
          </button>
          <div className="w-4 h-[1px] bg-white/10" />
          <button 
            onClick={() => charSelectStep > 2 && setCharSelectStep(3)}
            disabled={charSelectStep < 2}
            className={`px-3 py-1.5 rounded border transition-all ${
              charSelectStep === 3 
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 font-black shadow-[0_0_8px_rgba(6,182,212,0.15)]" 
                : charSelectStep > 3 
                  ? "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  : "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            3. PERKS
          </button>
        </div>
      </div>

      {/* STEP 1: IDENTITY COGNITION */}
      {charSelectStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
          {/* COLUMN 1: PORTRAIT SELECTOR & BIO */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                👤 COGNITIVE BIOMETRICS
              </span>
              
              {/* Name input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">OPERATIVE CODENAME</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value.slice(0, 18))}
                    className="flex-1 bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm text-white uppercase focus:border-cyan-400 outline-none font-semibold"
                    placeholder="Enter Name..."
                  />
                  <button
                    onClick={randomizeName}
                    title="Randomize Name"
                    className="bg-slate-900 border border-cyan-500/20 text-cyan-400 text-sm px-3.5 py-2 rounded hover:bg-cyan-950/40 cursor-pointer flex items-center justify-center transition-all"
                  >
                    <Shuffle size={14} />
                  </button>
                </div>
              </div>

              {/* Age select */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">BIOLOGICAL AGE</label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={customAge}
                  onChange={(e) => setCustomAge(Math.max(18, Math.min(120, parseInt(e.target.value) || 24)))}
                  className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none font-semibold"
                />
              </div>

              {/* Avatar Url choose */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">FACIAL RECONSTRUCTION MATRIX</label>
                <div className="grid grid-cols-5 gap-2">
                  {portraitChoices.map((choice) => (
                    <button
                      key={choice.name}
                      onClick={() => setCustomAvatarUrl(choice.url)}
                      className={`relative aspect-square rounded overflow-hidden border cursor-pointer transition-all ${
                        customAvatarUrl === choice.url ? "border-cyan-400 scale-105 shadow-[0_0_8px_rgba(6,182,212,0.4)]" : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={choice.url} alt={choice.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview portrait */}
            <div className="flex gap-4 items-center bg-slate-900/60 p-4 rounded-lg border border-white/5">
              <div className="w-16 h-16 rounded overflow-hidden border-2 border-cyan-500/30 shrink-0">
                <img src={customAvatarUrl} alt="Current portrait preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-500 uppercase font-extrabold block">CYBERNETIC CODENAME ID</span>
                <p className="text-white font-black uppercase text-sm leading-none mt-0.5">{customName || "UNREGISTERED"}</p>
                <p className="text-cyan-400 text-[10px] mt-1 uppercase font-bold">AGE {customAge} // SPEC: {customRace}</p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: SPECIES & BACKGROUND */}
          <div className="lg:col-span-7 bg-slate-950/40 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wider text-rose-500 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                🧬 RACE SPECIFICATION
              </span>

              {/* Species Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {raceOptions.map((race) => (
                  <button
                    key={race.name}
                    onClick={() => setCustomRace(race.name)}
                    className={`p-3 rounded border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      customRace === race.name
                        ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_10px_rgba(239,68,68,0.15)] text-white"
                        : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-rose-500/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold text-xs uppercase tracking-wider">{race.name}</span>
                      <span className="text-[9px] font-bold bg-slate-950 px-2 py-0.5 rounded border border-white/5 text-rose-400">{race.bonus}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic font-sans">{race.desc}</p>
                  </button>
                ))}
              </div>

              <span className="text-xs uppercase tracking-wider text-amber-500 font-bold block border-b border-white/5 pb-1.5 pt-2 flex items-center gap-1.5">
                📜 HISTORIC CONSTRUCTS
              </span>

              {/* Background Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => setCustomBackground(bg.name)}
                    className={`p-3 rounded border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      customBackground === bg.name
                        ? "bg-amber-950/20 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.15)] text-white"
                        : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-amber-500/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold text-xs uppercase tracking-wider">{bg.name}</span>
                      <span className="text-[9px] font-bold bg-slate-950 px-2 py-0.5 rounded border border-white/5 text-amber-400">{bg.bonus}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic font-sans">{bg.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Advance to step 2 */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                onClick={() => setCharSelectStep(2)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs px-6 py-3 rounded-lg cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
              >
                Assemble Matrix Core <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MATRIX CALIBRATION */}
      {charSelectStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
          {/* COLUMN 1: ARCHETYPE DECKS */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                🧠 OPERATIVE ARCHETYPE
              </span>

              {/* Archetypes */}
              <div className="flex flex-col gap-2">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.name}
                    onClick={() => {
                      setSelectedArchetype(arch);
                      setPreviewSkillTreeClass(arch.name);
                    }}
                    className={`p-3.5 rounded-lg border text-left flex flex-col gap-1.5 transition-all cursor-pointer relative overflow-hidden group ${
                      selectedArchetype.name === arch.name
                        ? "bg-cyan-950/20 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-white"
                        : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-cyan-500/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full z-10">
                      <span className="font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
                        {arch.name === "Cyber-Blade" ? "⚔️" : arch.name === "Techno-Mage" ? "🔮" : "💻"} {arch.name}
                      </span>
                      <span className="text-[9px] font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 text-cyan-400 uppercase tracking-widest">
                        {arch.credits}¤ CREDITS
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans z-10 leading-normal">{arch.description}</p>
                    <div className="text-[10px] font-mono font-bold text-slate-300 z-10 border-t border-white/5 pt-1.5 mt-0.5 flex gap-3 flex-wrap">
                      <span>HP: <strong className="text-white">{arch.maxHp}</strong></span>
                      <span>ENERGY: <strong className="text-purple-400">{arch.maxMana}</strong></span>
                      <span>GEAR: <strong className="text-amber-400 uppercase">{arch.startingEquipment.slice(0, 2).join(", ")}</strong></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected stats readout summary */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-slate-300 space-y-2 text-xs">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">CORE ARCHETYPE ATTRIBUTES</span>
              <div className="grid grid-cols-5 gap-2 text-center font-mono">
                <div className="p-1.5 bg-slate-950 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">STR</span>
                  <span className="text-white font-extrabold text-sm">{selectedBaseStats.str}</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">DEX</span>
                  <span className="text-white font-extrabold text-sm">{selectedBaseStats.dex}</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">INT</span>
                  <span className="text-white font-extrabold text-sm">{selectedBaseStats.int}</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">WILL</span>
                  <span className="text-white font-extrabold text-sm">{selectedBaseStats.will}</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded border border-white/5">
                  <span className="text-[9px] text-slate-500 block">ETH</span>
                  <span className="text-purple-400 font-extrabold text-sm">{selectedBaseStats.eth}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: ATTRIBUTE DISTRIBUTOR & SKILL TREE PREVIEW */}
          <div className="lg:col-span-7 bg-slate-950/40 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs uppercase tracking-wider text-rose-500 font-bold block flex items-center gap-1.5">
                  ⚡ SYNAPSE CALIBRATION
                </span>
                <span className="text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded text-rose-400 animate-pulse font-mono">
                  MATRIX POINTS POOL: {statPointsPool}
                </span>
              </div>

              {/* Stat selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "str", name: "Strength (STR)", desc: "Increases kinetic damage & physical fortitude.", val: previewStr, base: selectedBaseStats.str, currentAdd: addedStats.str },
                  { id: "dex", name: "Dexterity (DEX)", desc: "Increases evasion, grid speed & lockpicking.", val: previewDex, base: selectedBaseStats.dex, currentAdd: addedStats.dex },
                  { id: "int", name: "Intelligence (INT)", desc: "Eases firewall hacking & cerebral deck overrides.", val: previewInt, base: selectedBaseStats.int, currentAdd: addedStats.int },
                  { id: "will", name: "Willpower (WILL)", desc: "Amplifies status resistance & neural shield charges.", val: previewWill, base: selectedBaseStats.will, currentAdd: addedStats.will },
                  { id: "eth", name: "Ether (ETH)", desc: "Boosts technomancy spell-slash multiplier & energy pools.", val: previewEth, base: selectedBaseStats.eth, currentAdd: addedStats.eth }
                ].map((stat) => (
                  <div key={stat.id} className="p-3 bg-slate-900/40 border border-white/5 rounded-lg flex flex-col justify-between gap-1.5 text-left font-mono">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs text-white uppercase tracking-wider">{stat.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatChange(stat.id as any, -1)}
                          disabled={stat.currentAdd <= 0}
                          className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-black transition-all ${
                            stat.currentAdd > 0 ? "border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/30 cursor-pointer" : "border-white/5 text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          -
                        </button>
                        <span className="text-xs text-white font-black w-5 text-center">{stat.val}</span>
                        <button
                          onClick={() => handleStatChange(stat.id as any, 1)}
                          disabled={statPointsPool <= 0}
                          className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-black transition-all ${
                            statPointsPool > 0 ? "border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/30 cursor-pointer" : "border-white/5 text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans leading-tight leading-normal">{stat.desc}</p>
                    <span className="text-[8px] text-slate-400 font-bold block bg-slate-950/50 px-1.5 py-0.5 rounded w-fit self-start uppercase tracking-wider">
                      Base: {stat.base} + Race: {selectedRaceMods[stat.id as keyof typeof selectedRaceMods]} + Background: {selectedBgMods[stat.id as keyof typeof selectedBgMods]} + Custom: {stat.currentAdd}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav controls */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                onClick={() => setCharSelectStep(1)}
                className="text-slate-400 hover:text-slate-200 font-mono text-xs border border-white/5 px-4 py-2.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer uppercase"
              >
                Back to Spec
              </button>
              <button
                onClick={() => setCharSelectStep(3)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs px-6 py-3 rounded-lg cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
              >
                Map Cortex Perks <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PERK MAPPING */}
      {charSelectStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
          {/* COLUMN 1: INTRO EXPLANATORY */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                ⚡ MATRIX SYNC CHANNELS
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans leading-normal">
                Select up to <strong className="text-cyan-400">2 core starting perks</strong> to solder into your biological cerebral circuit boards.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-sans leading-normal">
                These options grant powerful passive multipliers, combat triggers, or additional credits to kickstart your campaign under Megacity-9.
              </p>
              
              <div className="bg-slate-900/60 p-3.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">PERK CHANNELS ENGAGED:</span>
                <p className="text-white text-sm font-black mt-1 uppercase font-mono">
                  {selectedPerks.length === 0 ? "∅ ZERO CIRCUITS MAPPED" : `${selectedPerks.length} / 2 ACTIVE`}
                </p>
                <div className="flex gap-1 mt-2">
                  {selectedPerks.map((p) => (
                    <span key={p} className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Character sheet overview summary block */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 font-mono text-slate-300 text-xs text-left space-y-1.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold border-b border-white/5 pb-1">SUMMARY SHEET CONFIG</span>
              <p className="uppercase font-bold text-slate-200">NAME: <span className="text-white font-black">{customName || "Kaelen"}</span></p>
              <p className="uppercase font-bold text-slate-400">RACE: <span className="text-rose-400 font-extrabold">{customRace}</span></p>
              <p className="uppercase font-bold text-slate-400">BACKGROUND: <span className="text-amber-400 font-extrabold">{customBackground}</span></p>
              <p className="uppercase font-bold text-slate-400">ARCHETYPE: <span className="text-cyan-400 font-extrabold">{selectedArchetype.name}</span></p>
              <div className="grid grid-cols-5 gap-1 text-center font-bold text-[10px] text-white pt-1">
                <span className="bg-slate-950 p-1 rounded border border-white/5">S:{previewStr}</span>
                <span className="bg-slate-950 p-1 rounded border border-white/5">D:{previewDex}</span>
                <span className="bg-slate-950 p-1 rounded border border-white/5">I:{previewInt}</span>
                <span className="bg-slate-950 p-1 rounded border border-white/5">W:{previewWill}</span>
                <span className="bg-slate-950 p-1 rounded border border-white/5">E:{previewEth}</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: PERK DECK SELECTION CONTAINER */}
          <div className="lg:col-span-8 bg-slate-950/40 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
            <div className="space-y-3.5">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                🧠 COGNITIVE RELAYS MATRIX
              </span>

              {/* Grid of perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {ALL_12_PERKS.map((perk) => {
                  const isSelected = selectedPerks.includes(perk.id);
                  return (
                    <button
                      key={perk.id}
                      onClick={() => handleTogglePerk(perk.id)}
                      className={`p-3 rounded-lg border text-left flex gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-950/20 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)] text-white"
                          : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-purple-500/20 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-base shrink-0">{perk.icon}</span>
                      <div className="space-y-0.5 text-xs">
                        <span className="font-extrabold uppercase tracking-wide block">{perk.name}</span>
                        <p className="text-[10px] text-slate-400 font-sans leading-normal leading-tight">{perk.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav controls */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                onClick={() => setCharSelectStep(2)}
                className="text-slate-400 hover:text-slate-200 font-mono text-xs border border-white/5 px-4 py-2.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer uppercase"
              >
                Back to Synapse
              </button>
              <button
                onClick={handleDeployAgent}
                className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs px-7 py-3.5 rounded-xl cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-[1.03]"
              >
                ⚡ COMMENCE INFILTRATION ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
