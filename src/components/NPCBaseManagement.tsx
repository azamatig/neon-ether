import React, { useState } from "react";
import { 
  Heart, 
  Smile, 
  Zap, 
  Skull, 
  Sparkles, 
  ShieldAlert, 
  User, 
  Coffee, 
  Eye, 
  Lock, 
  X, 
  Shield, 
  Volume2, 
  UserCheck, 
  ArrowRightLeft, 
  Activity, 
  Flame,
  Award,
  BookOpen,
  Briefcase,
  Wand2
} from "lucide-react";
import { GameState, BaseNPC } from "../types";

interface NPCBaseManagementProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  triggerToast: (msg: string) => void;
}

type SubTab = "talk" | "gifts" | "activities" | "job" | "romance" | "inventory" | "security" | "dojo" | "missions" | "upgrades";

export default function NPCBaseManagement({
  isOpen,
  onClose,
  gameState,
  setGameState,
  triggerToast
}: NPCBaseManagementProps) {
  // Currently selected Base NPC
  const npcs = gameState.baseNPCs || [];
  const [selectedNPCId, setSelectedNPCId] = useState<string>(npcs[0]?.id || "aria");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("talk");
  const [selectedMissionId, setSelectedMissionId] = useState<string>("matrix_decrypt");
  const [deployNPCId, setDeployNPCId] = useState<string>("");

  React.useEffect(() => {
    if (npcs.length > 0 && !npcs.some(n => n.id === selectedNPCId)) {
      setSelectedNPCId(npcs[0].id);
    }
  }, [npcs, selectedNPCId]);

  if (!isOpen) return null;

  if (npcs.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto p-4 md:p-6 flex flex-col justify-center items-center font-mono select-none">
        {/* Decorative full screen cyber grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        {/* Main retro-cyber layout console card */}
        <div className="bg-[#121622] border-4 border-double border-red-500/50 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] z-10 text-[#f5ebd5] p-6">
          <div className="flex justify-between items-center border-b border-red-500/30 pb-4 mb-4">
            <div className="flex items-center gap-2 text-red-500 animate-pulse">
              <ShieldAlert size={22} />
              <span className="font-black text-xs md:text-sm tracking-widest uppercase">
                SAFEHOUSE COMMAND STATUS: UNMANNED / DESOLATE
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-red-500 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-xs space-y-4 text-slate-300 leading-relaxed overflow-y-auto pr-1">
            <div className="p-3.5 bg-red-950/30 border border-red-500/20 text-red-300 rounded-lg text-3xs uppercase tracking-wider font-semibold text-left">
              ⚠️ SYSTEM PROTOCOL WARNING:
              <p className="mt-1 text-slate-300 font-normal normal-case text-xs">
                Your safehouse headquarters is currently empty, desolate, and running on cold backup reactors. There are no operators allocated to defensive systems, nutrient kitchens, or hacking networks.
              </p>
            </div>

            <p className="text-slate-200 text-left">
              To expand your operations, you must explore other <span className="text-cyan-400 font-bold">Megacity-9 districts</span> and complete regional quests to find, rescue, or recruit specialized NPCs. Your safehouse can host up to <span className="text-amber-400 font-black">8 potential crew members</span>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                <span className="text-amber-400 font-bold block text-2xs uppercase">🌸 Mia (Lost Subject)</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Huddled at the Neon Abyss Bar in Aurus Slums. Rescue her from the rainy back-alleys.</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                <span className="text-amber-400 font-bold block text-2xs uppercase">👑 Chancellor Aria (Apex Rep)</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Stationed at Apex Armory. Complete her Chemical Hunt to persuade her to join.</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                <span className="text-amber-400 font-bold block text-2xs uppercase">👤 Scythe (Tactical Enforcer)</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Hirable at the Nexus Agency in Downtown. Sign her contract or persuade her.</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg">
                <span className="text-purple-400 font-bold block text-2xs uppercase">🧹 Evelyn, Talon, Kira (Slave Market)</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Bid on, purchase, or crack their holding pens at the Aurus Auction Market.</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-lg col-span-1 sm:col-span-2">
                <span className="text-cyan-400 font-bold block text-2xs uppercase">🔮 Priestess Morgana & 🕶️ Agent Jax</span>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Complete their Satoshi Square Ley-Matrix charging and Downtown Signal Core delivery to persuade them to join.</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 italic text-left">
              Once recruited, assign crew members to jobs (Supply Chef, Hacker Operator, Dojo Coach) to unlock passive income, custom consumable plates, and melee damage buffs when resting!
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 hover:border-red-500 font-bold uppercase text-xs transition-all tracking-widest cursor-pointer"
          >
            Close Terminal
          </button>
        </div>
      </div>
    );
  }

  const currentNPC = npcs.find(n => n.id === selectedNPCId) || npcs[0];

  const updateNPC = (updater: (npc: BaseNPC) => Partial<BaseNPC>, actionMessage: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.baseNPCs = (next.baseNPCs || []).map(n => {
        if (n.id === currentNPC.id) {
          const updatedFields = updater(n);
          return {
            ...n,
            ...updatedFields
          };
        }
        return n;
      });
      return next;
    });

    // Set immediate visual response in the RED block
    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.baseNPCs = (next.baseNPCs || []).map(n => {
        if (n.id === currentNPC.id) {
          return {
            ...n,
            reaction: actionMessage
          };
        }
        return n;
      });
      return next;
    });
  };

  const payCredits = (amount: number): boolean => {
    if (gameState.credits < amount) {
      triggerToast("ERROR: Insufficient credits for transaction!");
      return false;
    }
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        credits: prev.credits - amount
      };
    });
    return true;
  };

  const consumeStamina = (amount: number): boolean => {
    if (gameState.stamina < amount) {
      triggerToast("ERROR: You are too exhausted for this activity!");
      return false;
    }
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        stamina: Math.max(0, prev.stamina - amount)
      };
    });
    return true;
  };

  // 1. TALK ACTIONS
  const handleTalk = (option: string) => {
    if (option === "base_strategy") {
      let speech = "";
      if (currentNPC.id === "aria") {
        speech = "We need to secure the northern sector of the slum canals. The cyber-barriers are weak there. Focus on scraping high-grade Rusted Circuitry from security nodes so we can fund automatic turrets.";
      } else if (currentNPC.id === "mia") {
        speech = "I... I can keep the power units cleaned! And ensure our food supplies don't rot. Just let me know if you want me to cook synthetic meat for the guard patrols.";
      } else {
        speech = "My blades are sharpened, boss. Give me the word and I'll reinforce perimeter sector-C. Drones have been scanning the highwalks.";
      }
      updateNPC(n => ({
        respect: Math.min(100, n.respect + 8),
        happiness: Math.min(100, n.happiness + 5),
        dialogue: `"${speech}"`
      }), `SYSTEM: Consulted ${currentNPC.name} regarding headquarters defense. Respect increased!`);
    } 
    else if (option === "past_lore") {
      let speech = "";
      if (currentNPC.id === "aria") {
        speech = "Before the Biotech purge, I served as Prime Archon for the Apex Directorate. They branded me a defector because I refused to authorize human synapse wiping. Now, we rebuild from the ashes.";
      } else if (currentNPC.id === "mia") {
        speech = "My family worked the lower sewer pumps in Sub-level 12. When the corporate sludge floods happened, we were abandoned. I survived on synthetic stimulants until you pulled me out.";
      } else {
        speech = "I was born in a cybernetic birthing tube. No family, just a corporate barcodes under my left wrist collar. I broke out when their cyberware dampeners failed.";
      }
      updateNPC(n => ({
        affectionValue: Math.min(100, n.affectionValue + 12),
        willpower: Math.max(0, n.willpower - 5),
        dialogue: `"${speech}"`
      }), `SYSTEM: Listened deeply to ${currentNPC.name}'s intimate history. Affection surged!`);
    }
    else if (option === "flirt") {
      let speech = "";
      let reaction = "";
      let bonusAffection = 8;
      let bonusAnger = 0;
      
      if (currentNPC.id === "aria") {
        if (currentNPC.respect < 40) {
          speech = "Watch your tone, rookie. We are partners in rebellion, not street-dock romance toys. Keep your metrics professional.";
          reaction = "SYSTEM: Flirting rejected! She demands higher respect.";
          bonusAffection = -2;
          bonusAnger = 10;
        } else {
          speech = "You... possess an endearing persistence, commander. Let's focus on securing Megacity-9 first, though my neural core registers your warmth.";
          reaction = "SYSTEM: Highly successful advance! Affection increased, defiance lowered.";
        }
      } else if (currentNPC.id === "mia") {
        speech = "Oh! My neural temperature is spiking... Nobody has ever looked at me like that, Commander. I'll make sure to cook your favorite meal today!";
        reaction = "SYSTEM: She blushes intensely. Affection and happiness spiked!";
        bonusAffection = 15;
      } else {
        speech = "Hmph. Bold. I like a commander who takes direct tactical shots. Don't let it distract you in combat, though.";
        reaction = "SYSTEM: Cyber-ninja Scythe smirks. Affection and respect increased.";
        bonusAffection = 10;
      }

      updateNPC(n => ({
        affectionValue: Math.min(100, n.affectionValue + bonusAffection),
        anger: Math.min(30, n.anger + bonusAnger),
        defiance: Math.max(0, n.defiance - 6),
        dialogue: `"${speech}"`
      }), reaction);
    }
  };

  // 2. GIFTS
  const handleGift = (giftType: string) => {
    const npcId = currentNPC.id;

    if (giftType === "tech_salvage") {
      if (!payCredits(25)) return;
      
      const isLiked = ["aria", "talon", "kira", "morgana_base"].includes(npcId);
      
      const happinessBonus = isLiked ? 25 : 15;
      const respectBonus = isLiked ? 20 : 10;
      const affectionBonus = isLiked ? 15 : 6;
      
      let spokenDialogue = "Wow! Tech parts! I can use these to build or upgrade our gear!";
      if (npcId === "aria") {
        spokenDialogue = "Excellent. These micro-coils are highly compatible with our power grids. Your support is noted.";
      } else if (npcId === "scythe_base") {
        spokenDialogue = "Useful alloy shards. I'll reinforce my katana blade edge with this.";
      } else if (npcId === "mia") {
        spokenDialogue = "Wow! Tech parts! I can use these to fix the water filter in my bunk!";
      } else if (npcId === "talon") {
        spokenDialogue = "SYSTEM UPDATE: Hardware upgrade integrated. Direct sensory micro-capacitors recalibrated. Optimal gratitude response.";
      } else if (npcId === "kira") {
        spokenDialogue = "Sweet! These copper-mesh processors will double my hacking throughput. You're alright, boss.";
      } else if (npcId === "morgana_base") {
        spokenDialogue = "These cybernetic relays hum with the divine spark of the Machine-Mind. A sacred offering.";
      }

      updateNPC(n => ({
        happiness: Math.min(100, n.happiness + happinessBonus),
        respect: Math.min(100, n.respect + respectBonus),
        affectionValue: Math.min(100, (n.affectionValue || 0) + affectionBonus),
        dialogue: spokenDialogue
      }), `SYSTEM: Gifted High-Grade Scrap Salvage (-25¤). ${isLiked ? "★ FAVORED GIFT: Received double affection bonus!" : "Happiness & Respect boosted!"}`);
    } 
    else if (giftType === "stimulant") {
      if (!payCredits(50)) return;

      const isLiked = ["scythe_base", "jax_base"].includes(npcId);
      const isDisliked = ["aria", "mia"].includes(npcId);

      if (isDisliked) {
        let spokenDialogue = "I have no use for this.";
        let fearIncrease = 0;
        let happinessDecrease = 0;
        if (npcId === "aria") {
          spokenDialogue = "I have no interest in chemical dependencies, Commander. Keep these crude stimulants away from my console.";
          happinessDecrease = 15;
        } else if (npcId === "mia") {
          spokenDialogue = "P-please... I don't want any corporate chemicals. They... they did experiments on me with those in the labs...";
          fearIncrease = 20;
          happinessDecrease = 10;
        }

        updateNPC(n => ({
          happiness: Math.max(0, n.happiness - happinessDecrease),
          fear: Math.min(100, (n.fear || 0) + fearIncrease),
          dialogue: spokenDialogue
        }), `SYSTEM: Presented Stimulant. ⚠️ NPC REJECTED GIFT: Disliked item triggered custom reaction!`);
        return;
      }

      const willpowerBonus = isLiked ? 35 : 20;
      const affectionBonus = isLiked ? 24 : 12;
      const corruptionBonus = isLiked ? 10 : 5;
      
      let spokenDialogue = "This serum runs extremely hot... but my sensory core feels totally refreshed.";
      if (npcId === "scythe_base") {
        spokenDialogue = "Ah, this combat booster triggers an optimal adrenaline sweep. My blade speeds are peak. You know exactly what a soldier needs.";
      } else if (npcId === "jax_base") {
        spokenDialogue = "Oh yeah, that's the good stuff. Clears the static out of my visual filters. Let's hijack some nodes!";
      }

      updateNPC(n => ({
        willpower: Math.min(100, n.willpower + willpowerBonus),
        affectionValue: Math.min(100, (n.affectionValue || 0) + affectionBonus),
        corruption: Math.min(100, n.corruption + corruptionBonus),
        dialogue: spokenDialogue
      }), `SYSTEM: Injected Deluxe Synaptic Stimulant (-50¤). ${isLiked ? "★ FAVORED GIFT: Received double affection bonus!" : "Willpower increased significantly."}`);
    }
    else if (giftType === "synth_meal") {
      if (!payCredits(15)) return;

      const isLiked = ["mia", "evelyn"].includes(npcId);

      const happinessBonus = isLiked ? 25 : 12;
      const affectionBonus = isLiked ? 20 : 10;

      let spokenDialogue = "That was incredible. Real nutrient proteins are rare in the lower sectors.";
      if (npcId === "mia") {
        spokenDialogue = "Um... is this real soy-protein steak? It smells so amazing! Thank you so much, commander... you are so kind to me.";
      } else if (npcId === "evelyn") {
        spokenDialogue = "A hot, real meal? Oh, commander, you treat me like a real person, not just property. Thank you so much.";
      }

      updateNPC(n => ({
        hunger: "Well-fed",
        happiness: Math.min(100, n.happiness + happinessBonus),
        affectionValue: Math.min(100, (n.affectionValue || 0) + affectionBonus),
        hygiene: "Excellent",
        dialogue: spokenDialogue
      }), `SYSTEM: Served Gourmet Synthetic Nutrient Feast (-15¤). ${isLiked ? "★ FAVORED GIFT: Received double affection bonus!" : "Hunger status is now WELL-FED."}`);
    }
  };

  // 3. ACTIVITIES
  const handleActivity = (activity: string) => {
    if (activity === "patrol") {
      if (!consumeStamina(15)) return;
      updateNPC(n => ({
        discipline: Math.min(100, n.discipline + 15),
        respect: Math.min(100, n.respect + 12),
        fear: Math.max(0, n.fear - 10),
        hunger: "Hungry",
        dialogue: "Perimeter sweep completed. Two corporate drones were spotted and fried. Excellent tactical synergy, commander."
      }), `SYSTEM: Ran strategic grid patrol (-15 Stamina). Discipline & Respect gained. NPC is now Hungry.`);
    } 
    else if (activity === "meditation") {
      if (!consumeStamina(20)) return;
      updateNPC(n => ({
        willpower: Math.min(100, n.willpower + 15),
        corruption: Math.max(0, n.corruption - 15),
        affectionValue: Math.min(100, n.affectionValue + 8),
        dialogue: "The ambient bio-ether static has cleared. My neural processors feel beautifully aligned."
      }), `SYSTEM: Guided tech-coven neural meditation (-20 Stamina). Willpower boosted, Corruption purged.`);
    }
    else if (activity === "dojo") {
      if (!consumeStamina(25)) return;
      updateNPC(n => ({
        respect: Math.min(100, n.respect + 15),
        discipline: Math.min(100, n.discipline + 20),
        hygiene: "Dirty",
        dialogue: "Hah! Your melee guard stance is improving. That sparring circuit was intense."
      }), `SYSTEM: Conducted brutal Dojo training session (-25 Stamina). Respect & Discipline increased. Hygiene is now Dirty.`);
    }
  };

  // 4. JOBS
  const handleJobAssign = (jobName: string) => {
    updateNPC(n => ({
      currentJob: jobName,
      dialogue: `Directives accepted. Commencing active allocation: [${jobName.toUpperCase()}].`
    }), `SYSTEM: Reallocated ${currentNPC.name} to base module: "${jobName}".`);
  };

  // 5. ROMANCE
  const handleRomance = (action: string) => {
    if (action === "declare_love") {
      updateNPC(n => ({
        affectionValue: Math.min(100, n.affectionValue + 15),
        respect: Math.min(100, n.respect + 8),
        dialogue: n.id === "mia"
          ? "Commander... I... I love you too! My heart is beat-syncing so fast!"
          : "You speak with extreme conviction. Your emotional signal is fully authenticated inside my heart core."
      }), `SYSTEM: Formally declared romantic affection. Affection has surged!`);
    } 
    else if (action === "sync_link") {
      if (currentNPC.affectionValue < 50) {
        triggerToast("ERROR: Affection level must be at least 50 for direct Sync-Link!");
        return;
      }
      updateNPC(n => ({
        corruption: Math.min(100, n.corruption + 15),
        happiness: Math.min(100, n.happiness + 20),
        dialogue: "Warning: Synaptic firewall temporarily decoupled. This is... an incredibly intense connection..."
      }), `SYSTEM: Activated Direct Neuro-Psychic Sync-Link! Happiness boosted, Corruption increased.`);
    }
    else if (action === "propose_wife") {
      if (currentNPC.affectionValue < 80 || currentNPC.respect < 20) {
        triggerToast("ERROR: NPC must have at least 80 Affection and 20 Respect to accept marriage!");
        return;
      }
      updateNPC(n => ({
        affection: "Wife 💍",
        affectionValue: 100,
        happiness: 100,
        fear: 0,
        dialogue: n.id === "aria"
          ? "Yes. A thousand times yes, my love. Together, we shall rule this megacity and safeguard our people's synapses forever."
          : "I'm yours, Commander! Yes! I'll protect you and stay by your side until our battery life reaches zero!"
      }), `❤️ MARRY EVENT: You proposed to ${currentNPC.name} and she accepted! She is now your WIFE 💍. Affection maxed!`);
      triggerToast(`CONGRATULATIONS: ${currentNPC.name} is now your Wife!`);
    }
  };

  // 6. INVENTORY
  const handleGiveItem = (item: string) => {
    if (currentNPC.inventory.length >= 6) {
      triggerToast("ERROR: NPC personal inventory belt is full!");
      return;
    }
    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.inventory = next.inventory.filter(i => i !== item);
      next.baseNPCs = (next.baseNPCs || []).map(n => {
        if (n.id === currentNPC.id) {
          return {
            ...n,
            inventory: [...n.inventory, item]
          };
        }
        return n;
      });
      return next;
    });
    triggerToast(`Gave ${item} to ${currentNPC.name}`);
  };

  const handleTakeItem = (item: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.inventory = [...next.inventory, item];
      next.baseNPCs = (next.baseNPCs || []).map(n => {
        if (n.id === currentNPC.id) {
          return {
            ...n,
            inventory: n.inventory.filter(i => i !== item)
          };
        }
        return n;
      });
      return next;
    });
    triggerToast(`Retrieved ${item} from ${currentNPC.name}`);
  };

  const handleUpgradeDefenses = (type: "shield" | "turret" | "doors") => {
    if (type === "shield") {
      if (gameState.credits < 50) {
        triggerToast("ERROR: Insufficient credits (50¤ required)");
        return;
      }
      setGameState(prev => {
        if (!prev) return prev;
        const defenses = prev.safehouseDefenses || { securityLevel: 1, turrets: 0, shieldStrength: 100, fortifiedDoors: false, intrusionLogs: [] };
        const updatedLogs = [
          `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ⚡ SHIELD GRID CALIBRATION: Restored energy shields back to 100% capacity.`,
          ...defenses.intrusionLogs
        ];
        return {
          ...prev,
          credits: prev.credits - 50,
          safehouseDefenses: {
            ...defenses,
            shieldStrength: 100,
            intrusionLogs: updatedLogs
          }
        };
      });
      triggerToast("BASE ENERGY SHIELDS RECHARGED TO 100%!");
    } else if (type === "turret") {
      if (gameState.credits < 150) {
        triggerToast("ERROR: Insufficient credits (150¤ required)");
        return;
      }
      const defenses = gameState.safehouseDefenses || { securityLevel: 1, turrets: 0, shieldStrength: 100, fortifiedDoors: false, intrusionLogs: [] };
      if (defenses.turrets >= 4) {
        triggerToast("ERROR: Safehouse layout maxed at 4 active Sentry Turrets!");
        return;
      }
      setGameState(prev => {
        if (!prev) return prev;
        const d = prev.safehouseDefenses || { securityLevel: 1, turrets: 0, shieldStrength: 100, fortifiedDoors: false, intrusionLogs: [] };
        const updatedLogs = [
          `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ⚔️ DEFENSIVE DEPLOYMENT: Installed automated heavy Laser Sentry Turret [Turret-${d.turrets + 1}]. Security rating increased.`,
          ...d.intrusionLogs
        ];
        return {
          ...prev,
          credits: prev.credits - 150,
          safehouseDefenses: {
            ...d,
            turrets: d.turrets + 1,
            securityLevel: Math.min(5, d.securityLevel + 1),
            intrusionLogs: updatedLogs
          }
        };
      });
      triggerToast("AUTOMATED LASER TURRET INSTALLED!");
    } else if (type === "doors") {
      const d = gameState.safehouseDefenses || { securityLevel: 1, turrets: 0, shieldStrength: 100, fortifiedDoors: false, intrusionLogs: [] };
      if (d.fortifiedDoors) {
        triggerToast("ERROR: Blast doors are already reinforced with titanium sheeting!");
        return;
      }
      if (gameState.credits < 120) {
        triggerToast("ERROR: Insufficient credits (120¤ required)");
        return;
      }
      setGameState(prev => {
        if (!prev) return prev;
        const d = prev.safehouseDefenses || { securityLevel: 1, turrets: 0, shieldStrength: 100, fortifiedDoors: false, intrusionLogs: [] };
        const updatedLogs = [
          `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] 🛡️ INFRASTRUCTURE UPGRADE: Lined entry corridors with magnetic-latch heavy titanium blast-plates.`,
          ...d.intrusionLogs
        ];
        return {
          ...prev,
          credits: prev.credits - 120,
          safehouseDefenses: {
            ...d,
            fortifiedDoors: true,
            securityLevel: Math.min(5, d.securityLevel + 1),
            intrusionLogs: updatedLogs
          }
        };
      });
      triggerToast("BLAST DOORS UPGRADED TO TITANIUM PLATING!");
    }
  };

  const handleTrainAttribute = (attr: "str" | "dex" | "int") => {
    const hasCoach = (gameState.baseNPCs || []).some(n => n.currentJob === "Dojo Training Coach");
    const isDojoUpgraded = gameState.safehouseUpgrades?.dojoUpgraded;
    if (!hasCoach && !isDojoUpgraded) {
      triggerToast("TRAINING BLOCKED: You must allocate a Dojo Coach or construct the Dojo Combat Matrix!");
      return;
    }
    if (gameState.stamina < 15) {
      triggerToast("ERROR: You need at least 15 Stamina to train.");
      return;
    }
    if (gameState.credits < 40) {
      triggerToast("ERROR: Training programs require 40¤.");
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.stamina -= 15;
      next.credits -= 40;
      next.attributes = {
        ...next.attributes,
        [attr]: (next.attributes[attr] || 10) + 1
      };
      return next;
    });

    triggerToast(`Dojo Training Successful: +1 ${attr.toUpperCase()} attribute!`);
  };

  const handleTrainSkill = (skill: "cyberBlade" | "netSlicer" | "heavyChrome" | "mindmancer") => {
    const hasCoach = (gameState.baseNPCs || []).some(n => n.currentJob === "Dojo Training Coach");
    const isDojoUpgraded = gameState.safehouseUpgrades?.dojoUpgraded;
    if (!hasCoach && !isDojoUpgraded) {
      triggerToast("TRAINING BLOCKED: You must allocate a Dojo Coach or construct the Dojo Combat Matrix!");
      return;
    }
    if (gameState.stamina < 20) {
      triggerToast("ERROR: You need at least 20 Stamina to train.");
      return;
    }
    if (gameState.credits < 60) {
      triggerToast("ERROR: Weapon specialization drills require 60¤.");
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.stamina -= 20;
      next.credits -= 60;
      next.skills = {
        ...next.skills,
        [skill]: (next.skills[skill] || 0) + 1
      };
      return next;
    });

    triggerToast(`Dojo Drills Successful: +1 level in ${skill.toUpperCase()} skill tree!`);
  };

  const handleDeployNPC = (npcId: string, mId: string) => {
    const npc = (gameState.baseNPCs || []).find(n => n.id === npcId);
    if (!npc) {
      triggerToast("ERROR: No valid crew member selected.");
      return;
    }
    if (npc.injuryStatus === "Wounded") {
      triggerToast(`ERROR: ${npc.name} is currently injured and unfit for cyber runs!`);
      return;
    }

    const duration = mId === "matrix_decrypt" ? 2 : mId === "cargo_raid" ? 3 : 4;
    const missionName = mId === "matrix_decrypt" ? "Aurus Grid Decryption" : mId === "cargo_raid" ? "Corpo Cargo Depot Raid" : "Apex Security Node Infiltration";
    const riskLabel = mId === "matrix_decrypt" ? "Low" : mId === "cargo_raid" ? "Medium" : "High";

    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.baseNPCs = (next.baseNPCs || []).map(n => {
        if (n.id === npcId) {
          return { ...n, currentJob: `Mission: ${missionName}` };
        }
        return n;
      });

      const newMission = {
        id: Math.random().toString(36).substr(2, 9),
        npcId,
        missionId: mId,
        missionName,
        turnsLeft: duration,
        risk: riskLabel
      };
      next.crewMissions = [...(next.crewMissions || []), newMission];
      return next;
    });

    triggerToast(`PROTOCOL DEPLOYED: Sent ${npc.name} on off-screen run to ${missionName}!`);
  };

  const handlePurchaseUpgrade = (upgradeKey: "crewBunksExpanded" | "resplicerActive" | "decryptorActive" | "dojoUpgraded" | "kitchenUpgraded", cost: number) => {
    if (gameState.credits < cost) {
      triggerToast(`ERROR: Construction requires ${cost}¤.`);
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.credits -= cost;
      next.safehouseUpgrades = {
        ...next.safehouseUpgrades,
        [upgradeKey]: true
      };
      return next;
    });

    triggerToast("CONSTRUCTION ONLINE: Installed new physical room module in safehouse!");
  };

  const handleCraftStim = (stimName: string, cost: number) => {
    if (!gameState.inventory.includes("High-Grade Scrap Salvage")) {
      triggerToast("CRAFTING LOCKED: Splicer requires 1x 'High-Grade Scrap Salvage' module!");
      return;
    }
    if (gameState.credits < cost) {
      triggerToast(`CRAFTING LOCKED: Chemical elements cost ${cost}¤.`);
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next.credits -= cost;
      
      const idx = next.inventory.indexOf("High-Grade Scrap Salvage");
      if (idx > -1) {
        next.inventory.splice(idx, 1);
      }
      
      next.inventory.push(stimName);
      return next;
    });

    triggerToast(`CHEMLAB SUCCESS: Spliced ${stimName}!`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto p-4 md:p-6 flex flex-col justify-center items-center font-mono select-none">
      {/* Decorative full screen cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Main retro-cyber layout console card */}
      <div className="bg-[#1e2330] border-4 border-double border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] z-10 text-[#f5ebd5]">
        
        {/* Terminal Header with NPC Tabs */}
        <div className="bg-[#121622] px-6 py-4 border-b-2 border-slate-700 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2.5 text-rose-500">
            <Shield size={20} className="animate-pulse text-amber-500" />
            <span className="font-black text-xs md:text-sm tracking-widest text-slate-100 uppercase">
              BASE CREW COMMAND STATION & NPC MANAGEMENT
            </span>
          </div>

          {/* Quick tabs of available NPCs */}
          <div className="flex gap-2">
            {npcs.map(npc => (
              <button
                key={npc.id}
                onClick={() => {
                  setSelectedNPCId(npc.id);
                  updateNPC(n => ({ reaction: null }), "");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                  selectedNPCId === npc.id
                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-black"
                    : "bg-slate-900 border-white/5 hover:border-slate-500 text-slate-400 hover:text-white"
                }`}
              >
                <span>{npc.avatar}</span>
                <span>{npc.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-rose-500 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Three main column grid layout - faithfully reflecting screenshot zones */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto flex-1">
          
          {/* RED ZONE: Description, Speeches & Interaction Output */}
          <div className="lg:col-span-5 flex flex-col gap-3 min-h-[350px]">
            <div className="border border-red-500/50 bg-[#e7d9be] text-slate-950 p-4 rounded-xl flex-1 flex flex-col justify-between shadow-[inset_0_0_20px_rgba(239,68,68,0.06)] overflow-y-auto">
              <div>
                {/* NPC Name Title Ribbon Banner */}
                <div className="flex justify-center mb-4">
                  <div className="bg-[#b45309] border border-[#78350f] text-white px-6 py-1 rounded shadow-md relative font-bold text-xs tracking-widest uppercase">
                    <div className="absolute top-0 bottom-0 -left-2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[8px] border-r-[#b45309]" />
                    {currentNPC.name}
                    <div className="absolute top-0 bottom-0 -right-2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[8px] border-l-[#b45309]" />
                  </div>
                </div>

                {/* Narrative description (RED zone text) */}
                <p className="text-xs leading-relaxed italic text-slate-800 mb-4 font-sans text-left border-b border-amber-900/10 pb-3">
                  {currentNPC.description}
                </p>

                {/* NPC Speech section (RED zone text) */}
                <div className="bg-slate-950/5 border border-[#854d0e]/20 p-3 rounded-lg text-left mt-2">
                  <span className="text-[9px] text-[#78350f] font-black uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Volume2 size={12} className="text-amber-700 animate-pulse" /> {currentNPC.name} says:
                  </span>
                  <p className="text-xs font-semibold text-slate-900 leading-relaxed font-sans">
                    {currentNPC.dialogue}
                  </p>
                </div>
              </div>

              {/* Reaction Log Box */}
              {currentNPC.reaction && (
                <div className="mt-4 p-2.5 bg-[#fef3c7] border border-amber-500/30 rounded-lg text-left text-xs font-bold text-amber-900 animate-fadeIn font-mono">
                  {currentNPC.reaction}
                </div>
              )}
            </div>
            
            {/* Red Zone Boundary Label */}
            <div className="text-[10px] text-red-500/75 uppercase tracking-widest font-black text-left flex items-center gap-1 leading-none">
              <span>● RED ZONE :</span>
              <span className="text-slate-400">SPEECH DIRECTORY & INTERACTION LOGS</span>
            </div>
          </div>

          {/* BLUE ZONE: Model Illustration Card */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="border border-blue-500/60 bg-[#e7d9be] p-2.5 rounded-xl flex-1 flex flex-col overflow-hidden relative shadow-[0_0_15px_rgba(59,130,246,0.15)] min-h-[350px]">
              {/* Picture Frame */}
              <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex justify-center items-center">
                <img
                  src={currentNPC.image}
                  alt={currentNPC.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Cyber HUD Overlay inside frame */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 text-left">
                  <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest block">
                    {currentNPC.role}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 block font-mono">
                    ALLOCATED: {currentNPC.currentJob}
                  </span>
                </div>
                
                {/* Target marker overlays */}
                <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </div>

            {/* Blue Zone Boundary Label */}
            <div className="text-[10px] text-blue-400 uppercase tracking-widest font-black text-left flex items-center gap-1 leading-none">
              <span>● BLUE ZONE :</span>
              <span className="text-slate-400">NEURAL GRAPHIC MODEL FRAME</span>
            </div>
          </div>

          {/* YELLOW ZONE: NPC Stats Deck */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="border border-yellow-500/60 bg-[#e7d9be] text-slate-950 p-4 rounded-xl flex-1 flex flex-col justify-between shadow-[inset_0_0_15px_rgba(234,179,8,0.06)] overflow-y-auto">
              
              <div>
                {/* Loyalty Vitals Header Gauge */}
                <div className="bg-amber-950/10 border border-amber-900/15 p-2 rounded-lg flex items-center justify-between mb-4">
                  <div className="text-left">
                    <span className="text-[9px] text-[#78350f] font-black uppercase tracking-wider block">NEURAL SYNC CORE</span>
                    <span className="text-[11px] font-black uppercase text-slate-900">SYSTEM: ACTIVE</span>
                  </div>
                  <div className="w-24 bg-slate-950 h-3 rounded p-0.5 border border-amber-950/20">
                    <div className="bg-amber-500 h-full rounded transition-all duration-300" style={{ width: `${currentNPC.happiness}%` }} />
                  </div>
                </div>

                {/* Vitals Grid Rack */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  
                  {/* Happiness */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] leading-none mb-1">
                      <span className="font-black text-slate-500 flex items-center gap-1 uppercase">
                        <Smile size={12} className="text-amber-500" /> Happiness
                      </span>
                      <span className="font-bold text-slate-800">{currentNPC.happiness}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                      <div className="bg-amber-500 h-full rounded" style={{ width: `${currentNPC.happiness}%` }} />
                    </div>
                  </div>

                  {/* Affection Status */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] leading-none mb-1">
                      <span className="font-black text-slate-500 flex items-center gap-1 uppercase">
                        <Heart size={12} className="text-rose-500" /> Affection
                      </span>
                      <span className="font-bold text-rose-600 uppercase">{currentNPC.affection}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                      <div className="bg-rose-500 h-full rounded" style={{ width: `${currentNPC.affectionValue}%` }} />
                    </div>
                  </div>

                  {/* Willpower */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">WILLPOWER</span>
                    <p className="text-[12px] font-black text-slate-900 mt-0.5 flex items-center gap-1">
                      <Zap size={12} className="text-yellow-600" /> {currentNPC.willpower}
                    </p>
                  </div>

                  {/* Corruption */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">CORRUPTION</span>
                    <p className="text-[12px] font-black text-slate-900 mt-0.5 flex items-center gap-1">
                      <Skull size={12} className="text-purple-600" /> {currentNPC.corruption}/100
                    </p>
                  </div>

                  {/* Hygiene */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">HYGIENE</span>
                    <p className="text-[11px] font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                      <Sparkles size={12} /> {currentNPC.hygiene}
                    </p>
                  </div>

                  {/* Discipline */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">DISCIPLINE</span>
                    <p className="text-[12px] font-black text-slate-900 mt-0.5 flex items-center gap-1">
                      <Lock size={12} className="text-indigo-600" /> {currentNPC.discipline}
                    </p>
                  </div>

                  {/* Hunger */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">HUNGER</span>
                    <p className="text-[11px] font-black text-amber-700 mt-0.5 flex items-center gap-1">
                      <Coffee size={12} /> {currentNPC.hunger}
                    </p>
                  </div>

                  {/* Respect */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">RESPECT</span>
                    <p className="text-[12px] font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                      <User size={12} /> {currentNPC.respect}/100
                    </p>
                  </div>

                  {/* Withdraw Risk */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">WITHDRAW RISK</span>
                    <p className="text-[11px] font-black text-blue-700 mt-0.5 flex items-center gap-1">
                      <ShieldAlert size={12} /> {currentNPC.withdrawRisk}
                    </p>
                  </div>

                  {/* Anger */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">ANGER</span>
                    <p className="text-[12px] font-black text-rose-600 mt-0.5 flex items-center gap-1">
                      <Flame size={12} /> {currentNPC.anger}/30
                    </p>
                  </div>

                  {/* Defiance */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">DEFIANCE</span>
                    <p className="text-[12px] font-black text-amber-800 mt-0.5 flex items-center gap-1">
                      <Activity size={12} /> {currentNPC.defiance}/100
                    </p>
                  </div>

                  {/* Fear */}
                  <div className="bg-slate-950/5 border border-[#854d0e]/10 p-2 rounded-lg">
                    <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">FEAR</span>
                    <p className="text-[12px] font-black text-slate-700 mt-0.5 flex items-center gap-1">
                      <Eye size={12} /> {currentNPC.fear}/100
                    </p>
                  </div>

                </div>
              </div>

              {/* Character State Status Footer tags */}
              <div className="mt-4 pt-3 border-t border-[#854d0e]/15 flex justify-between items-center text-[10px] font-black uppercase text-slate-700">
                <span>Vitals Sync Code: OK</span>
                <span>Cell Relic Node: LOCKED</span>
              </div>

            </div>

            {/* Yellow Zone Boundary Label */}
            <div className="text-[10px] text-amber-500 uppercase tracking-widest font-black text-left flex items-center gap-1 leading-none">
              <span>● YELLOW ZONE :</span>
              <span className="text-slate-400">PERSONAL METRICS & LOYALTY GRID</span>
            </div>
          </div>

        </div>

        {/* GREEN ZONE: Interactive Options Bar */}
        <div className="p-4 bg-[#121622] border-t-2 border-slate-700 flex flex-col gap-3">
          
          {/* Sub-tabs Selection inside GREEN zone */}
          <div className="flex flex-wrap border-b border-white/10 pb-2 gap-1 md:gap-2">
            {[
              { id: "talk", label: "Talk Options", icon: <BookOpen size={13} /> },
              { id: "gifts", label: "Gifts & Food", icon: <Coffee size={13} /> },
              { id: "activities", label: "Activities", icon: <Award size={13} /> },
              { id: "job", label: "Job Allocation", icon: <Briefcase size={13} /> },
              { id: "romance", label: "Romance options", icon: <Heart size={13} /> },
              { id: "inventory", label: "Inventory Exchange", icon: <ArrowRightLeft size={13} /> },
              { id: "security", label: "Base Defenses", icon: <Shield size={13} /> },
              { id: "dojo", label: "Dojo & Stat Training", icon: <Activity size={13} /> },
              { id: "missions", label: "Crew Missions", icon: <Zap size={13} /> },
              { id: "upgrades", label: "Room Upgrades", icon: <Sparkles size={13} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as SubTab);
                  updateNPC(n => ({ reaction: null }), "");
                }}
                className={`px-3 py-1.5 rounded-md text-3xs font-black uppercase tracking-wider cursor-pointer border flex items-center gap-1.5 transition-all ${
                  activeSubTab === tab.id
                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                    : "bg-slate-950/60 border-white/5 hover:border-emerald-500/30 text-slate-400 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-tab Interactive Buttons panel */}
          <div className="min-h-[110px] flex items-center justify-center p-1 bg-slate-900/40 rounded-xl border border-white/5">
            
            {/* 1. TALK PANEL */}
            {activeSubTab === "talk" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full p-2">
                <button
                  onClick={() => handleTalk("base_strategy")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-amber-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-amber-500 mb-1">STRATEGIC COMMAND</p>
                  <p className="text-slate-400 leading-snug">Consult {currentNPC.name} about base defense strategy.</p>
                </button>
                <button
                  onClick={() => handleTalk("past_lore")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-amber-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-amber-500 mb-1">DEEP MEMORY INQUIRY</p>
                  <p className="text-slate-400 leading-snug">Ask about her life prior to the Megacity grid war.</p>
                </button>
                <button
                  onClick={() => handleTalk("flirt")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-amber-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-amber-500 mb-1">TACTICAL ADVANCE</p>
                  <p className="text-slate-400 leading-snug">Express personal interest / Flirt with her.</p>
                </button>
              </div>
            )}

            {/* 2. GIFTS PANEL */}
            {activeSubTab === "gifts" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full p-2">
                <button
                  onClick={() => handleGift("tech_salvage")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-emerald-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-emerald-400 mb-1">GIFT HARDWARE (-25¤)</p>
                  <p className="text-slate-400 leading-snug">Offer rare scrap micro-processors & wiring.</p>
                </button>
                <button
                  onClick={() => handleGift("stimulant")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-emerald-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-emerald-400 mb-1">STIMULANT SHOT (-50¤)</p>
                  <p className="text-slate-400 leading-snug">Inject custom physical combat adrenaline shot.</p>
                </button>
                <button
                  onClick={() => handleGift("synth_meal")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-emerald-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-emerald-400 mb-1">SYNTH FOOD PLATE (-15¤)</p>
                  <p className="text-slate-400 leading-snug">Serve gourmet synthetic protein steak meal.</p>
                </button>
              </div>
            )}

            {/* 3. ACTIVITIES PANEL */}
            {activeSubTab === "activities" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full p-2">
                <button
                  onClick={() => handleActivity("patrol")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-cyan-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-cyan-400 mb-1">CO-OPERATIVE PATROL</p>
                  <p className="text-slate-400 leading-snug">Guard boundaries together. Costs 15 Stamina.</p>
                </button>
                <button
                  onClick={() => handleActivity("meditation")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-cyan-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-cyan-400 mb-1">NET COVEN MEDITATION</p>
                  <p className="text-slate-400 leading-snug">Synchronize coven static minds. Costs 20 Stamina.</p>
                </button>
                <button
                  onClick={() => handleActivity("dojo")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-cyan-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-cyan-400 mb-1">MELEE TRAINING ROUNDS</p>
                  <p className="text-slate-400 leading-snug">Train tactical maneuvers. Costs 25 Stamina.</p>
                </button>
              </div>
            )}

            {/* 4. JOB ALLOCATION PANEL */}
            {activeSubTab === "job" && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full p-2">
                {[
                  { name: "Idle / Chilling", desc: "Allows full rest." },
                  { name: "Defensive Security Guard", desc: "Bolsters perimeter." },
                  { name: "Dojo Training Coach", desc: "Teaches combat techniques." },
                  { name: "Base Supply Chef", desc: "Keeps squads well-fed." },
                  { name: "Hacker Network Operator", desc: "Generates cash +40¤." }
                ].map((job, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJobAssign(job.name)}
                    className={`border text-left rounded-lg p-2.5 text-xs transition-all cursor-pointer ${
                      currentNPC.currentJob === job.name
                        ? "bg-emerald-950 border-emerald-400 text-emerald-200"
                        : "bg-[#242b3d] border-white/5 hover:border-emerald-500 text-slate-300"
                    }`}
                  >
                    <p className="font-black text-[9px] uppercase tracking-wider mb-1">
                      {idx === 0 ? "💤" : idx === 1 ? "🛡️" : idx === 2 ? "⚔️" : idx === 3 ? "🍗" : "💻"} {job.name.split(" / ")[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">{job.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 5. ROMANCE PANEL */}
            {activeSubTab === "romance" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full p-2">
                <button
                  onClick={() => handleRomance("declare_love")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-rose-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-rose-400 mb-1">DECLARE DEVOTED LOVE</p>
                  <p className="text-slate-400 leading-snug">Express permanent devotion & open your heart.</p>
                </button>
                <button
                  onClick={() => handleRomance("sync_link")}
                  className="bg-[#242b3d] hover:bg-slate-800 border border-white/10 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-rose-500"
                >
                  <p className="font-extrabold uppercase text-[10px] text-rose-400 mb-1">SYNAPTIC INTENSITY SYNC</p>
                  <p className="text-slate-400 leading-snug">Directly sync cortical firewalls. Needs 50+ Affection.</p>
                </button>
                <button
                  onClick={() => handleRomance("propose_wife")}
                  className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-slate-100 rounded-lg p-3 text-xs text-left cursor-pointer transition-all hover:border-rose-400 animate-pulse"
                >
                  <p className="font-extrabold uppercase text-[10px] text-rose-300 mb-1 flex items-center gap-1">
                    <UserCheck size={12} className="text-rose-400" /> PROPOSE MARRIAGE (WIFE 💍)
                  </p>
                  <p className="text-rose-200 leading-snug">Become life partners. Needs 80+ Affection.</p>
                </button>
              </div>
            )}

            {/* 6. INVENTORY EXCHANGE PANEL */}
            {activeSubTab === "inventory" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-2 text-left">
                {/* Left side: NPC inventory */}
                <div className="bg-slate-950/40 border border-white/5 p-2 rounded-lg">
                  <span className="text-[10px] text-amber-500 font-bold block uppercase mb-1.5">
                    {currentNPC.name}'s Combat Belt ({currentNPC.inventory.length}/6 slots)
                  </span>
                  {currentNPC.inventory.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic p-2">Empty combat belt slots.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {currentNPC.inventory.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTakeItem(item)}
                          className="bg-[#242b3d] hover:bg-rose-950/40 border border-white/5 text-[#f5ebd5] px-2 py-1.5 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer hover:border-rose-500 group"
                        >
                          <span>{item}</span>
                          <span className="text-[8px] text-slate-500 group-hover:text-rose-400 font-black ml-1 uppercase">Retrieve</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side: Player global stash inventory */}
                <div className="bg-slate-950/40 border border-white/5 p-2 rounded-lg">
                  <span className="text-[10px] text-cyan-400 font-bold block uppercase mb-1.5">
                    Player Stash Hardware ({gameState.inventory.length} items)
                  </span>
                  {gameState.inventory.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic p-2">No hardware items inside stash.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto">
                      {gameState.inventory.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleGiveItem(item)}
                          className="bg-[#242b3d] hover:bg-emerald-950/40 border border-white/5 text-[#f5ebd5] px-2 py-1.5 rounded text-[10px] transition-all flex items-center gap-1 cursor-pointer hover:border-emerald-500 group"
                        >
                          <span>{item}</span>
                          <span className="text-[8px] text-slate-500 group-hover:text-emerald-400 font-black ml-1 uppercase">Give</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. BASE DEFENSES PANEL */}
            {activeSubTab === "security" && (() => {
              const defenses = gameState.safehouseDefenses || {
                securityLevel: 1,
                turrets: 0,
                shieldStrength: 100,
                fortifiedDoors: false,
                intrusionLogs: []
              };
              const isRaidEnabled = gameState.completedQuests.length >= 3;

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full p-2 text-left">
                  {/* Left Column: Security Stats & Alerts */}
                  <div className="md:col-span-5 bg-slate-950/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-amber-500 font-bold block uppercase mb-2">
                        🛡️ Safehouse Security Status Dashboard
                      </span>

                      <div className="space-y-2 text-xs font-sans text-slate-200">
                        {/* Security Level Indicator */}
                        <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-white/5">
                          <span className="text-slate-400">Security Rating:</span>
                          <span className="text-cyan-400 font-extrabold">Level {defenses.securityLevel} / 5</span>
                        </div>

                        {/* Shields gauge */}
                        <div className="bg-slate-900/60 p-1.5 rounded border border-white/5 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Shield Capacitor:</span>
                            <span className="text-emerald-400 font-extrabold">{defenses.shieldStrength}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded transition-all duration-300" style={{ width: `${defenses.shieldStrength}%` }} />
                          </div>
                        </div>

                        {/* Laser Turrets count */}
                        <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-white/5">
                          <span className="text-slate-400">Sentry Laser Turrets:</span>
                          <span className="text-amber-500 font-extrabold">{defenses.turrets} / 4 Active</span>
                        </div>

                        {/* Titanium Blast Doors */}
                        <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-white/5">
                          <span className="text-slate-400">Titanium Blast Doors:</span>
                          <span className={`font-extrabold ${defenses.fortifiedDoors ? "text-emerald-400" : "text-rose-500"}`}>
                            {defenses.fortifiedDoors ? "REINFORCED" : "STANDARD DOORWAY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Threat Notification Box */}
                    <div className={`mt-3 p-2 rounded text-[11px] leading-snug border ${
                      isRaidEnabled 
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                        : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    }`}>
                      {isRaidEnabled ? (
                        <>
                          <span className="font-black block text-rose-400 mb-0.5 font-mono">⚠️ ALERT: RAID HAZARD HIGH</span>
                          Telemetric sigs have exposed this base! Resting at the hideout now carries a <strong>25% chance of corporate raid intrusion</strong>. Keep your shield batteries charged and sentry defenses active to repel tactical attackers!
                        </>
                      ) : (
                        <>
                          <span className="font-black block text-emerald-400 mb-0.5 font-mono">🛡️ SECURE COLD-BEACON</span>
                          Early chapters are protected. <strong>Tactical base raid threat is currently offline</strong> to let you focus on initial crew organization and sector scouting. Threat triggers start in Main Quest 3.
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Upgrade Terminal */}
                  <div className="md:col-span-4 bg-slate-950/40 border border-white/5 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase mb-1">
                      🛠️ Defense Engineering Options
                    </span>

                    {/* Shield Recharge Button */}
                    <button
                      onClick={() => handleUpgradeDefenses("shield")}
                      className="w-full bg-[#242b3d] hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500 text-left p-2 rounded text-xs transition-all flex flex-col cursor-pointer"
                    >
                      <span className="font-black text-emerald-400 uppercase text-[10px] mb-0.5">Recharge Shield Grid (-50¤)</span>
                      <span className="text-slate-400 text-[10px] leading-tight font-sans">Fully calibrate & refill base force-shield array.</span>
                    </button>

                    {/* Install Sentry Turret Button */}
                    <button
                      onClick={() => handleUpgradeDefenses("turret")}
                      disabled={defenses.turrets >= 4}
                      className={`w-full text-left p-2 rounded text-xs transition-all flex flex-col cursor-pointer ${
                        defenses.turrets >= 4 
                          ? "bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed" 
                          : "bg-[#242b3d] hover:bg-amber-950/40 border border-white/5 hover:border-amber-500"
                      }`}
                    >
                      <span className="font-black text-amber-500 uppercase text-[10px] mb-0.5">
                        Deploy Sentry Turret (-150¤)
                      </span>
                      <span className="text-slate-400 text-[10px] leading-tight font-sans">
                        {defenses.turrets >= 4 
                          ? "Fully armed. Maximum turret layout reached." 
                          : "Arm an automated high-energy laser turret in sector channels."}
                      </span>
                    </button>

                    {/* Fortified Blast Doors Button */}
                    <button
                      onClick={() => handleUpgradeDefenses("doors")}
                      disabled={defenses.fortifiedDoors}
                      className={`w-full text-left p-2 rounded text-xs transition-all flex flex-col cursor-pointer ${
                        defenses.fortifiedDoors 
                          ? "bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed" 
                          : "bg-[#242b3d] hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500"
                      }`}
                    >
                      <span className="font-black text-cyan-400 uppercase text-[10px] mb-0.5">
                        Titanium Door Plating (-120¤)
                      </span>
                      <span className="text-slate-400 text-[10px] leading-tight font-sans">
                        {defenses.fortifiedDoors 
                          ? "Armor active. Security hatches fully plated." 
                          : "Reinforce entry corridors with magnetic-latching heavy plates."}
                      </span>
                    </button>
                  </div>

                  {/* Right Column: Security Log */}
                  <div className="md:col-span-3 bg-slate-950/40 border border-white/5 p-3 rounded-lg flex flex-col h-full">
                    <span className="text-[10px] text-indigo-400 font-bold block uppercase mb-1.5">
                      📟 Decoupled Security Logs
                    </span>
                    <div className="bg-slate-950 p-2 border border-white/5 rounded flex-1 text-[9px] font-mono text-cyan-500 space-y-1.5 overflow-y-auto max-h-[160px] leading-snug">
                      {defenses.intrusionLogs.length === 0 ? (
                        <p className="text-slate-500 italic">No historical security logs recorded.</p>
                      ) : (
                        defenses.intrusionLogs.map((log, lIdx) => (
                          <div key={lIdx} className="border-b border-white/5 pb-1">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 8. DOJO & STAT TRAINING PANEL */}
            {activeSubTab === "dojo" && (() => {
              const hasCoach = (gameState.baseNPCs || []).some(n => n.currentJob === "Dojo Training Coach");
              const isDojoUpgraded = gameState.safehouseUpgrades?.dojoUpgraded;
              const isAuthorized = hasCoach || isDojoUpgraded;

              return (
                <div className="w-full p-2 text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div>
                      <span className="text-xs text-amber-400 font-extrabold block uppercase tracking-wider">
                        🥋 DOJO CORE ATTRIBUTE TRAINING SIMULATOR
                      </span>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Develop your primary attributes and cyber-specializations via synthetic tactical combat drills.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                        isAuthorized 
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
                          : "bg-red-950/40 border-red-500/30 text-red-400"
                      }`}>
                        {isAuthorized ? "● DOJO ONLINE" : "● TRAINING BLOCKED (NO COACH/MATRIX)"}
                      </span>
                    </div>
                  </div>

                  {!isAuthorized && (
                    <div className="p-3.5 bg-red-950/20 border border-red-500/30 text-red-300 rounded-lg text-xs leading-relaxed font-sans">
                      ⚠️ <strong>Dojo offline.</strong> Allocate an active crew member as a <strong>"Dojo Training Coach"</strong> in the <strong>Job Allocation</strong> tab, or build the <strong>Dojo Combat Matrix</strong> in Room Upgrades to begin physical combat exercises.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Panel: Primary Attributes */}
                    <div className="bg-slate-950/40 border border-white/5 p-3 rounded-lg space-y-3">
                      <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">
                        📈 Core Human Parameters (Requires: 15 Stamina | 40¤)
                      </span>
                      
                      <div className="space-y-2">
                        {/* Strength */}
                        <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-[#f5ebd5] text-xs uppercase block">💪 Strength (STR)</span>
                            <span className="text-[10px] text-slate-400 font-sans">Controls physical heavy damage and brute intimidation checks.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-black text-cyan-400">{gameState.attributes?.str || 10}</span>
                            <button
                              onClick={() => handleTrainAttribute("str")}
                              disabled={!isAuthorized}
                              className={`px-2 py-1 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Train
                            </button>
                          </div>
                        </div>

                        {/* Reflexes */}
                        <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-[#f5ebd5] text-xs uppercase block">⚡ Reflexes (DEX)</span>
                            <span className="text-[10px] text-slate-400 font-sans">Increases combat evasion rating and general agility.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-black text-cyan-400">{gameState.attributes?.dex || 10}</span>
                            <button
                              onClick={() => handleTrainAttribute("dex")}
                              disabled={!isAuthorized}
                              className={`px-2 py-1 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Train
                            </button>
                          </div>
                        </div>

                        {/* Intelligence */}
                        <div className="bg-slate-900/60 p-2.5 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-[#f5ebd5] text-xs uppercase block">🧠 Intelligence (INT)</span>
                            <span className="text-[10px] text-slate-400 font-sans">Amplifies cybernetic decrypt capacity and node hacks.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono font-black text-cyan-400">{gameState.attributes?.int || 10}</span>
                            <button
                              onClick={() => handleTrainAttribute("int")}
                              disabled={!isAuthorized}
                              className={`px-2 py-1 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Train
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Skill trees & Specializations */}
                    <div className="bg-slate-950/40 border border-white/5 p-3 rounded-lg space-y-3">
                      <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">
                        🗡️ Cyberweapon Combat Drills (Requires: 20 Stamina | 60¤)
                      </span>

                      <div className="space-y-2">
                        {/* CyberBlade */}
                        <div className="bg-slate-900/60 p-2 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-200 text-2xs block">🗡️ CYBERBLADE PRACTICE</span>
                            <span className="text-[9px] text-slate-500 font-sans">Primary melee damage coefficient.</span>
                          </div>
                          <div className="flex items-center gap-3.5">
                            <span className="text-xs font-mono font-bold text-amber-400">Lv. {gameState.skills?.cyberBlade || 0}</span>
                            <button
                              onClick={() => handleTrainSkill("cyberBlade")}
                              disabled={!isAuthorized}
                              className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Practice
                            </button>
                          </div>
                        </div>

                        {/* NetSlicer */}
                        <div className="bg-slate-900/60 p-2 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-200 text-2xs block">💻 NETSLICER DECRYPTION</span>
                            <span className="text-[9px] text-slate-500 font-sans">Unlocks deeper corporate network sub-gates.</span>
                          </div>
                          <div className="flex items-center gap-3.5">
                            <span className="text-xs font-mono font-bold text-amber-400">Lv. {gameState.skills?.netSlicer || 0}</span>
                            <button
                              onClick={() => handleTrainSkill("netSlicer")}
                              disabled={!isAuthorized}
                              className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Practice
                            </button>
                          </div>
                        </div>

                        {/* HeavyChrome */}
                        <div className="bg-slate-900/60 p-2 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-200 text-2xs block">🦾 HEAVYCHROME BULK</span>
                            <span className="text-[9px] text-slate-500 font-sans">Grants innate heavy armor mitigation and blast defense.</span>
                          </div>
                          <div className="flex items-center gap-3.5">
                            <span className="text-xs font-mono font-bold text-amber-400">Lv. {gameState.skills?.heavyChrome || 0}</span>
                            <button
                              onClick={() => handleTrainSkill("heavyChrome")}
                              disabled={!isAuthorized}
                              className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Practice
                            </button>
                          </div>
                        </div>

                        {/* Mindmancer */}
                        <div className="bg-slate-900/60 p-2 rounded border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-200 text-2xs block">🔮 MINDMANCER PROTOCOLS</span>
                            <span className="text-[9px] text-slate-500 font-sans">Improves conversational hacking & charisma-based checks.</span>
                          </div>
                          <div className="flex items-center gap-3.5">
                            <span className="text-xs font-mono font-bold text-amber-400">Lv. {gameState.skills?.mindmancer || 0}</span>
                            <button
                              onClick={() => handleTrainSkill("mindmancer")}
                              disabled={!isAuthorized}
                              className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase transition-all ${
                                isAuthorized 
                                  ? "bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Practice
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 9. CREW INFILTRATION MISSIONS PANEL */}
            {activeSubTab === "missions" && (() => {
              const activeMissions = gameState.crewMissions || [];
              
              // Find crew members who are eligible: not wounded, and not on an active mission
              const idleNPCs = (gameState.baseNPCs || []).filter(n => {
                const isOnMission = activeMissions.some(m => m.npcId === n.id);
                const isInjured = n.injuryStatus === "Wounded";
                return !isOnMission && !isInjured;
              });

              // Initial selection of NPC to deploy
              if (!deployNPCId && idleNPCs.length > 0) {
                setDeployNPCId(idleNPCs[0].id);
              }

              return (
                <div className="w-full p-2 text-left space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-xs text-cyan-400 font-extrabold block uppercase tracking-wider">
                      📡 TACTICAL SUB-GRID CREW INFILTRATION MISSIONS
                    </span>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Deploy your idle safehouse crew members on off-screen infiltration, intelligence, and scouting runs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Left Column: Mission Controls & Deployer */}
                    <div className="md:col-span-8 bg-slate-950/40 border border-white/5 p-3 rounded-lg space-y-3">
                      <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-wider">
                        🚀 Choose Operation & Allocate Operator
                      </span>

                      {/* Select Operator Dropdown */}
                      <div className="bg-slate-900/60 p-2 rounded border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div>
                          <label className="text-[9px] text-slate-400 font-mono uppercase block mb-1">Select Available Crew Member</label>
                          {idleNPCs.length === 0 ? (
                            <span className="text-2xs text-red-400 font-extrabold uppercase">⚠️ NO FREE CREW MEMBERS (ALL BUSY OR WOUNDED)</span>
                          ) : (
                            <select
                              value={deployNPCId}
                              onChange={(e) => setDeployNPCId(e.target.value)}
                              className="bg-[#121622] text-[#f5ebd5] border border-white/10 px-2 py-1 text-2xs rounded focus:outline-none focus:border-cyan-500 font-mono"
                            >
                              {idleNPCs.map(n => (
                                <option key={n.id} value={n.id}>
                                  {n.avatar} {n.name} - {n.role}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="bg-slate-950 p-2 rounded text-[10px] font-sans text-slate-400 border border-white/5 max-w-sm">
                          <strong>Deployment Guidelines:</strong> Crew runs take place off-screen and progress 1 turn whenever you <strong>Sleep/Rest</strong> at the safehouse. Careful: High risk operations may result in NPC injuries.
                        </div>
                      </div>

                      {/* Three Mission Profiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Decrypt Grid */}
                        <button
                          onClick={() => setSelectedMissionId("matrix_decrypt")}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer h-full ${
                            selectedMissionId === "matrix_decrypt"
                              ? "bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                              : "bg-[#121622]/60 border-white/5 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] text-emerald-400 font-black uppercase">Aurus Matrix Hack</span>
                            <p className="text-[9px] text-slate-400 mt-1 font-sans">Infiltrate the Aurus Slums proxy servers for local data codes.</p>
                          </div>
                          <div className="mt-3 space-y-1 text-[9px] font-mono border-t border-white/5 pt-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Duration:</span>
                              <span className="text-[#f5ebd5]">2 Turns</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Danger:</span>
                              <span className="text-emerald-400 font-extrabold uppercase">10% (Low)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reward:</span>
                              <span className="text-amber-400 font-bold">120¤ + Key</span>
                            </div>
                          </div>
                        </button>

                        {/* Cargo Raid */}
                        <button
                          onClick={() => setSelectedMissionId("cargo_raid")}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer h-full ${
                            selectedMissionId === "cargo_raid"
                              ? "bg-amber-950/20 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                              : "bg-[#121622]/60 border-white/5 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] text-amber-500 font-black uppercase">Depot Cargo Raid</span>
                            <p className="text-[9px] text-slate-400 mt-1 font-sans">Breach the secondary corporate freight stashes for equipment.</p>
                          </div>
                          <div className="mt-3 space-y-1 text-[9px] font-mono border-t border-white/5 pt-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Duration:</span>
                              <span className="text-[#f5ebd5]">3 Turns</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Danger:</span>
                              <span className="text-amber-500 font-extrabold uppercase">25% (Med)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reward:</span>
                              <span className="text-amber-400 font-bold">220¤ + Plate + Salvage</span>
                            </div>
                          </div>
                        </button>

                        {/* Apex Node */}
                        <button
                          onClick={() => setSelectedMissionId("apex_infiltration")}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer h-full ${
                            selectedMissionId === "apex_infiltration"
                              ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                              : "bg-[#121622]/60 border-white/5 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] text-rose-400 font-black uppercase">Apex Node Assault</span>
                            <p className="text-[9px] text-slate-400 mt-1 font-sans">Siphon the high-frequency ley-arrays on Apex executive sectors.</p>
                          </div>
                          <div className="mt-3 space-y-1 text-[9px] font-mono border-t border-white/5 pt-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Duration:</span>
                              <span className="text-[#f5ebd5]">4 Turns</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Danger:</span>
                              <span className="text-rose-400 font-extrabold uppercase">45% (High)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reward:</span>
                              <span className="text-amber-400 font-bold">450¤ + Stim + Blueprint</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Submit Deployment Button */}
                      <button
                        onClick={() => handleDeployNPC(deployNPCId, selectedMissionId)}
                        disabled={idleNPCs.length === 0}
                        className={`w-full py-2 border rounded font-black uppercase text-xs transition-all tracking-wider cursor-pointer ${
                          idleNPCs.length === 0
                            ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-400/30 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        }`}
                      >
                        ⚡ Deploy Operator to Sector Grid Protocol
                      </button>
                    </div>

                    {/* Right Column: Mission Logs & Progress */}
                    <div className="md:col-span-4 bg-slate-950/40 border border-white/5 p-3 rounded-lg flex flex-col h-full">
                      <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider mb-2">
                        📟 Active Infiltration Signals
                      </span>

                      <div className="bg-slate-950 p-2.5 border border-white/5 rounded flex-1 text-[10px] font-mono text-cyan-400 space-y-2.5 overflow-y-auto max-h-[220px]">
                        {activeMissions.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 italic">
                            No active off-screen runs detected.<br />Deploy an idle operator to start signal siphoning.
                          </div>
                        ) : (
                          activeMissions.map((m, idx) => {
                            const npc = (gameState.baseNPCs || []).find(n => n.id === m.npcId);
                            return (
                              <div key={idx} className="border border-white/5 p-2 bg-slate-900/60 rounded relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-cyan-950 text-cyan-400 text-[8px] font-bold px-1 rounded-bl">
                                  {m.risk} Risk
                                </div>
                                <span className="text-[#f5ebd5] font-black block uppercase tracking-tight text-[10px]">
                                  {npc?.avatar || "👤"} {npc?.name || "Unknown"}
                                </span>
                                <p className="text-slate-400 text-[9px] mt-0.5 leading-tight font-sans">
                                  {m.missionName}
                                </p>
                                <div className="mt-2 flex justify-between items-center text-[9px] border-t border-white/5 pt-1">
                                  <span className="text-slate-500 uppercase">Status:</span>
                                  <span className="text-amber-400 font-extrabold animate-pulse">
                                    ACTIVE ({m.turnsLeft} RESTS REMAINING)
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 10. ROOM UPGRADES & SPLICER PANEL */}
            {activeSubTab === "upgrades" && (() => {
              const upgrades = gameState.safehouseUpgrades || {
                crewBunksExpanded: false,
                resplicerActive: false,
                decryptorActive: false,
                dojoUpgraded: false,
                kitchenUpgraded: false
              };

              const scrapCount = gameState.inventory.filter(i => i === "High-Grade Scrap Salvage").length;

              return (
                <div className="w-full p-2 text-left space-y-4">
                  <div className="border-b border-white/5 pb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-xs text-amber-400 font-extrabold block uppercase tracking-wider">
                        🛠️ PHYSICAL SAFEHOUSE ROOM UPGRADES
                      </span>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Upgrade the physical infrastructure and install modular utility labs inside your desolate hideout.
                      </p>
                    </div>
                    <div className="text-[9px] font-mono px-2 py-0.5 bg-slate-900 border border-white/5 text-slate-400 rounded">
                      Available Construction Salvage: <strong className="text-cyan-400">{scrapCount}x High-Grade Scrap</strong>
                    </div>
                  </div>

                  {/* Upgrades Construction Board */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                    {/* 1. Crew quarters */}
                    <div className="bg-[#121622]/60 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-[#f5ebd5] uppercase">Crew Bunks</span>
                          <span className="text-[8px] font-bold px-1 bg-cyan-950 text-cyan-400 rounded uppercase">ROOM</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-snug mt-1">
                          Expand safehouse bunkers to increase crew limit from <strong>3 to 8 members</strong>.
                        </p>
                      </div>
                      <div className="pt-2">
                        {upgrades.crewBunksExpanded ? (
                          <div className="w-full text-center py-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase rounded text-[10px] tracking-widest">
                            Built
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchaseUpgrade("crewBunksExpanded", 200)}
                            className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold uppercase rounded text-[10px] tracking-wider transition-all cursor-pointer border border-cyan-400/30"
                          >
                            Build (-200¤)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Splicer Lab */}
                    <div className="bg-[#121622]/60 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-[#f5ebd5] uppercase">Re-Splicer</span>
                          <span className="text-[8px] font-bold px-1 bg-indigo-950 text-indigo-400 rounded uppercase">LAB</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-snug mt-1">
                          Install a Bio-Tech Splicer to synthesize custom stims and nano-med injectors from scrap.
                        </p>
                      </div>
                      <div className="pt-2">
                        {upgrades.resplicerActive ? (
                          <div className="w-full text-center py-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase rounded text-[10px] tracking-widest">
                            Built
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchaseUpgrade("resplicerActive", 300)}
                            className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold uppercase rounded text-[10px] tracking-wider transition-all cursor-pointer border border-cyan-400/30"
                          >
                            Build (-300¤)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3. Signal Decryptor */}
                    <div className="bg-[#121622]/60 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-[#f5ebd5] uppercase">Decryptor Node</span>
                          <span className="text-[8px] font-bold px-1 bg-rose-950 text-rose-400 rounded uppercase">TECH</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-snug mt-1">
                          Signal antenna to crack hidden networks, increasing decryption rates and hacking yields.
                        </p>
                      </div>
                      <div className="pt-2">
                        {upgrades.decryptorActive ? (
                          <div className="w-full text-center py-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase rounded text-[10px] tracking-widest">
                            Built
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchaseUpgrade("decryptorActive", 250)}
                            className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold uppercase rounded text-[10px] tracking-wider transition-all cursor-pointer border border-cyan-400/30"
                          >
                            Build (-250¤)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 4. Dojo Combat Matrix */}
                    <div className="bg-[#121622]/60 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-[#f5ebd5] uppercase">Combat Dojo</span>
                          <span className="text-[8px] font-bold px-1 bg-amber-950 text-amber-400 rounded uppercase">UTILITY</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-snug mt-1">
                          Allows training stats without an active Dojo Coach and doubles rest buff to +30%.
                        </p>
                      </div>
                      <div className="pt-2">
                        {upgrades.dojoUpgraded ? (
                          <div className="w-full text-center py-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase rounded text-[10px] tracking-widest">
                            Built
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchaseUpgrade("dojoUpgraded", 180)}
                            className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold uppercase rounded text-[10px] tracking-wider transition-all cursor-pointer border border-cyan-400/30"
                          >
                            Build (-180¤)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 5. Luxury Kitchen */}
                    <div className="bg-[#121622]/60 border border-white/5 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-[#f5ebd5] uppercase">Luxury Kitchen</span>
                          <span className="text-[8px] font-bold px-1 bg-emerald-950 text-emerald-400 rounded uppercase">ROOM</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-snug mt-1">
                          Upgrade cooking appliances. Supply Chef produces <strong>double Nutrient Plates</strong> per rest cycle!
                        </p>
                      </div>
                      <div className="pt-2">
                        {upgrades.kitchenUpgraded ? (
                          <div className="w-full text-center py-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase rounded text-[10px] tracking-widest">
                            Built
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchaseUpgrade("kitchenUpgraded", 150)}
                            className="w-full py-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold uppercase rounded text-[10px] tracking-wider transition-all cursor-pointer border border-cyan-400/30"
                          >
                            Build (-150¤)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Splicer Lab Interactive Section (Visible only when Built) */}
                  {upgrades.resplicerActive ? (
                    <div className="bg-slate-950/40 border border-white/5 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider">
                          🧪 BIO-TECH LAB RE-SPLICER EXPERIMENTS (ACTIVE)
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans">
                          Mix High-Grade Scrap Salvage with reactive chemicals.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Option 1: Nanite Health Injector */}
                        <div className="bg-slate-900/60 p-3 rounded border border-white/5 flex justify-between items-center gap-3">
                          <div>
                            <span className="text-2xs font-extrabold text-[#f5ebd5] uppercase block">🧪 Nanite Health Injector</span>
                            <span className="text-[10px] text-slate-400 font-sans leading-tight block mt-0.5">
                              Restore 50 HP and instantly cure a wounded base NPC during resting.
                            </span>
                          </div>
                          <button
                            onClick={() => handleCraftStim("Nanite Health Injector", 30)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-3xs px-2.5 py-1.5 rounded tracking-wider cursor-pointer transition-all border border-indigo-400/20 flex-shrink-0"
                          >
                            Splice (30¤ + Scrap)
                          </button>
                        </div>

                        {/* Option 2: Deluxe Combat Stimulant */}
                        <div className="bg-slate-900/60 p-3 rounded border border-white/5 flex justify-between items-center gap-3">
                          <div>
                            <span className="text-2xs font-extrabold text-[#f5ebd5] uppercase block">🔥 Deluxe Combat Stimulant</span>
                            <span className="text-[10px] text-slate-400 font-sans leading-tight block mt-0.5">
                              Provides immediate +20% damage amplification to active squads.
                            </span>
                          </div>
                          <button
                            onClick={() => handleCraftStim("Deluxe Combat Stimulant", 45)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-3xs px-2.5 py-1.5 rounded tracking-wider cursor-pointer transition-all border border-indigo-400/20 flex-shrink-0"
                          >
                            Splice (45¤ + Scrap)
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center bg-slate-950/10 border border-dashed border-white/5 rounded-lg text-slate-500 text-[10px]">
                      🔒 Bio-Tech Re-Splicer synthesis panel is currently offline. Build the <strong>Re-Splicer Lab</strong> module above to enable crafting.
                    </div>
                  )}
                </div>
              );
            })()}

          </div>

          {/* Green Zone Boundary Label */}
          <div className="flex justify-between items-center text-[10px] text-emerald-400 uppercase tracking-widest font-black leading-none">
            <span className="flex items-center gap-1">
              <span>● GREEN ZONE :</span>
              <span className="text-slate-400 font-bold">CORE INTERACTION & STRATEGIC COMMANDS</span>
            </span>
            <div className="flex gap-4">
              <span className="text-slate-500">Player Stamina: {gameState.stamina}/100</span>
              <span className="text-amber-500">Ledger: {gameState.credits}¤</span>
            </div>
          </div>

        </div>

        {/* Console Footing operations panel */}
        <div className="bg-[#121622] p-4 border-t-2 border-slate-700 flex justify-between items-center text-xs font-mono text-slate-500 uppercase font-black">
          <span>Holographic projection frequency: 450.21 MHz</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-400/40 text-slate-950 font-black uppercase rounded-lg tracking-widest transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            End Interaction & Exit
          </button>
        </div>

      </div>
    </div>
  );
}
