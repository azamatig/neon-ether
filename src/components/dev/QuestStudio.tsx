import React, { useState, useMemo } from "react";
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
  BookOpen,
  ArrowRight,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Layers,
  Home,
  UserCheck,
  Zap,
  Terminal,
  Crosshair,
  Search,
  RotateCcw,
  FastForward,
  Compass,
  Cpu,
  BrainCircuit,
  Eye,
  Sliders
} from "lucide-react";
import { GameState, UnifiedQuest, QuestStage, QuestOperationalPath, QuestWorldUnlocks, POIInteractiveEvent, CustomPOIData } from "../../types";
import { CustomWorldItem } from "./ItemForgeStudio";
import { BASE_PROPERTIES, DEFAULT_CAMPAIGN_QUESTS } from "../../questsData";
import { DEFAULT_POI_INTERACTIVE_SCENES } from "../../poiScenesData";
import { MAP_POIS } from "../../data";
import { activateQuest, advanceQuestStage, buildQuestCatalog, completeQuest, resetQuest } from "../../questEngine";

interface QuestStudioProps {
  customQuests: UnifiedQuest[];
  setCustomQuests: React.Dispatch<React.SetStateAction<UnifiedQuest[]>>;
  customPOIs?: CustomPOIData[];
  customItems?: CustomWorldItem[];
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
  onOpenSceneInEditor?: (sceneId: string) => void;
}

export const QuestStudio: React.FC<QuestStudioProps> = ({
  customQuests,
  setCustomQuests,
  customPOIs = [],
  customItems = [],
  gameState,
  setGameState,
  triggerToast,
  onOpenSceneInEditor
}) => {
  // Available standard and campaign quest registry (merged)
  const allQuests = useMemo(() => {
    const map = new Map<string, UnifiedQuest>();
    // Load default campaign quests first
    DEFAULT_CAMPAIGN_QUESTS.forEach(q => map.set(q.id, q));
    // Override with custom / edited quests
    customQuests.forEach(q => map.set(q.id, q));
    return Array.from(map.values());
  }, [customQuests]);

  const [selectedQuestId, setSelectedQuestId] = useState<string>(allQuests[0]?.id || "prologue");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "Main Quest" | "Side Quest" | "Companion Story">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSequenceFlow, setShowSequenceFlow] = useState<boolean>(true);

  // Form State
  const selectedQuest = useMemo(() => {
    return allQuests.find(q => q.id === selectedQuestId) || allQuests[0] || DEFAULT_CAMPAIGN_QUESTS[0];
  }, [allQuests, selectedQuestId]);

  const [questForm, setQuestForm] = useState<UnifiedQuest>(selectedQuest);

  // Synchronize form when selectedQuest changes
  const handleSelectQuest = (q: UnifiedQuest) => {
    setSelectedQuestId(q.id);
    setQuestForm(JSON.parse(JSON.stringify(q)));
  };

  // Filtered Quest List
  const filteredQuests = useMemo(() => {
    return allQuests.filter(q => {
      if (filterCategory !== "ALL" && q.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchDesc = q.description.toLowerCase().includes(query);
        const matchChapter = q.chapter?.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchChapter;
      }
      return true;
    });
  }, [allQuests, filterCategory, searchQuery]);

  // Main Storyline Sequence Chain for Visualizer
  const mainQuestChain = useMemo(() => {
    const mainQuests = allQuests.filter(q => q.category === "Main Quest");
    // Sort by sequence: prologue first, then follow nextQuestId links
    const sorted: UnifiedQuest[] = [];
    let current: UnifiedQuest | undefined = mainQuests.find(q => q.id === "prologue" || !q.prerequisiteQuestId);
    const visited = new Set<string>();
    
    while (current && !visited.has(current.id)) {
      sorted.push(current);
      visited.add(current.id);
      current = mainQuests.find(q => q.id === current?.nextQuestId);
    }

    // Append any unlinked main quests
    mainQuests.forEach(q => {
      if (!visited.has(q.id)) sorted.push(q);
    });

    return sorted;
  }, [allQuests]);

  // All combined POIs for dropdown selection
  const allAvailablePOIs = useMemo(() => {
    const mapPois = MAP_POIS.map(p => ({ id: p.id, name: p.name, district: p.district }));
    const custom = customPOIs.map(p => ({ id: p.id, name: p.name, district: p.district }));
    return [...mapPois, ...custom];
  }, [customPOIs]);

  // All available items for reward selection
  const allAvailableItems = useMemo(() => {
    const baseItems = [
      "Nano Med-Stim (Heal)", "Ether battery", "Recruit's Shock-Baton", "Vibroblade",
      "Apex Mantis electro-blade", "Heavy Plasma Cannon", "Exo-Plated Mesh Armor",
      "Syndicate Heavy Armor", "Archon's Kinetic Shock-Plate", "Smart-Targeting Visor",
      "Legendary 'Chrono-Shift' Reflex Augment", "Legendary 'Doomsday' Singularity Core",
      "Synthetic Muscle Splice", "Coven Ether-deck v3", "Prototype Singularity Battery",
      "Technical Signal Core", "Acid Beast Core", "Charged Ley-Matrix", "Encrypted Ares Ledger"
    ];
    const custom = customItems.map(i => i.name);
    return Array.from(new Set([...baseItems, ...custom]));
  }, [customItems]);

  // Current Quest Status in Live Game State
  const liveQuestStatus = useMemo(() => {
    return gameState.campaignQuestsRegistry?.find(q => q.id === questForm.id)?.status || "NOT_STARTED";
  }, [gameState.campaignQuestsRegistry, questForm.id]);

  // Handler: Save Quest Form
  const handleSaveQuest = () => {
    if (!questForm.title.trim()) {
      triggerToast("ERROR: Quest Title cannot be empty!");
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

    // Also update campaignQuestsRegistry in gameState for immediate live sync
    setGameState(prev => {
      const reg = buildQuestCatalog(prev.campaignQuestsRegistry || customQuests);
      const idx = reg.findIndex(q => q.id === questForm.id);
      let updatedReg: UnifiedQuest[];
      if (idx >= 0) {
        updatedReg = [...reg];
        const liveQuest = reg[idx];
        updatedReg[idx] = {
          ...questForm,
          status: liveQuest.status,
          rewardClaimed: liveQuest.rewardClaimed,
          stages: questForm.stages.map(stage => {
            const liveStage = liveQuest.stages.find(item => item.id === stage.id);
            return liveStage
              ? { ...stage, currentCount: liveStage.currentCount, completed: liveStage.completed }
              : stage;
          })
        };
      } else {
        updatedReg = [...reg, questForm];
      }
      return {
        ...prev,
        campaignQuestsRegistry: updatedReg
      };
    });

    triggerToast(`QUEST SAVED: "${questForm.title}" registered in campaign engine!`);
  };

  // Handler: Create New Quest with Preset
  const handleCreateNewQuest = (preset: "main" | "side" | "companion" = "side") => {
    const newId = `quest_${Date.now()}`;
    let newQuest: UnifiedQuest;

    if (preset === "main") {
      newQuest = {
        id: newId,
        title: "Main Quest: Corporate Infiltration",
        category: "Main Quest",
        chapter: "Chapter 2: The Corporate War",
        description: "Breach the fortified sublevels of Ares Biotech and retrieve the core cipher.",
        narrativeBriefing: "High-level corporate communications intercepted from the downtown grid confirm a secret transport. Strike before the cipher is wiped.",
        giverNPC: "Agent Jax",
        giverPOI: "Neon Abyss Bar",
        minLevel: 3,
        prerequisiteQuestId: questForm.id || "prologue",
        nextQuestId: "",
        status: "NOT_STARTED",
        log: [],
        stages: [
          {
            id: `s1_${Date.now()}`,
            stageIndex: 1,
            title: "Infiltrate Corporate Sub-Vault",
            description: "Locate and hack the primary security terminal.",
            objectiveType: "hack_terminal",
            targetPOI: "Subterranean Datacrypt",
            targetDistrict: "conduit09",
            targetCount: 1,
            currentCount: 0,
            completed: false,
            operationalPaths: [
              {
                id: `p1_${Date.now()}`,
                label: "[Hacking - INT 12] Slice the terminal firewalls cleanly",
                checkType: "int",
                checkValue: 12,
                outcomeDesc: "You bypass the alarms and extract the master cipher without triggering reinforcements.",
                grantsBonusXP: 50
              },
              {
                id: `p2_${Date.now()}`,
                label: "[Heavy Assault] Overload the power generators by force",
                checkType: "none",
                outcomeDesc: "Explosions shatter the containment field, but automated turrets activate!",
                grantsBonusCredits: 100
              }
            ]
          }
        ],
        rewards: {
          credits: 400,
          experience: 200,
          items: ["Exo-Plated Mesh Armor"],
          reputation: { streetOutlaws: 25, aresCorporate: -30 },
          worldUnlocks: {
            unlockBaseId: "docks_bunker"
          }
        }
      };
    } else if (preset === "companion") {
      newQuest = {
        id: newId,
        title: "Companion Quest: Ghost in the Machine",
        category: "Companion Story",
        chapter: "Chapter 2: The Corporate War",
        description: "Aid your companion in tracking down the rogue hacker who wiped their neural memory.",
        narrativeBriefing: "A fragmented memory chip has resurfaced on the black market. Escort your ally to recover their stolen past.",
        giverNPC: "Nyx, The Void Slicer",
        giverPOI: "Neon Abyss Bar",
        minLevel: 2,
        status: "NOT_STARTED",
        log: [],
        stages: [
          {
            id: `s1_${Date.now()}`,
            stageIndex: 1,
            title: "Interrogate Black Market Fixer",
            description: "Meet the informant at Club Afterlife VIP Lounge.",
            objectiveType: "talk_npc",
            targetPOI: "Club Afterlife VIP Lounge",
            targetDistrict: "downtown",
            targetNPC: "Cipher",
            targetCount: 1,
            currentCount: 0,
            completed: false
          }
        ],
        rewards: {
          credits: 300,
          experience: 180,
          items: ["Chrono-Shift Augment"],
          reputation: { streetOutlaws: 30 },
          worldUnlocks: {
            recruitCompanionId: "Nyx, The Void Slicer"
          }
        }
      };
    } else {
      newQuest = {
        id: newId,
        title: "Side Contract: Slum Outpost Raid",
        category: "Side Quest",
        chapter: "Chapter 1: The Outcast Spark",
        description: "Assault a rogue cyber-gang outpost and seize their stolen energy batteries.",
        narrativeBriefing: "Street gangs have cut the power to the local clinic. Neutralize their enforcers and restore power to the neighborhood.",
        giverNPC: "Dr. Marv",
        giverPOI: "Dr. Marv's Cyber-Clinic",
        minLevel: 1,
        status: "NOT_STARTED",
        log: [],
        stages: [
          {
            id: `s1_${Date.now()}`,
            stageIndex: 1,
            title: "Recover Stolen Energy Batteries",
            description: "Defeat the gang scavengers in Shatter Ridge Corridors.",
            objectiveType: "collect_item",
            targetPOI: "Shatter Ridge Corridors",
            targetDistrict: "downtown",
            targetItem: "Ether battery",
            targetCount: 2,
            currentCount: 0,
            completed: false
          },
          {
            id: `s2_${Date.now()}`,
            stageIndex: 2,
            title: "Deliver Batteries to Dr. Marv",
            description: "Return to the clinic at the Docks to power up life support.",
            objectiveType: "talk_npc",
            targetPOI: "Dr. Marv's Cyber-Clinic",
            targetDistrict: "docks",
            targetNPC: "Dr. Marv",
            targetCount: 1,
            currentCount: 0,
            completed: false
          }
        ],
        rewards: {
          credits: 220,
          experience: 110,
          items: ["Nano Med-Stim (Heal)"],
          reputation: { streetOutlaws: 20 }
        }
      };
    }

    setCustomQuests(prev => [...prev, newQuest]);
    setSelectedQuestId(newId);
    setQuestForm(newQuest);
    triggerToast(`CREATED NEW QUEST: "${newQuest.title}"`);
  };

  // Handler: Delete Quest
  const handleDeleteQuest = (id: string) => {
    if (confirm("Are you sure you want to delete this quest from the campaign registry?")) {
      setCustomQuests(prev => prev.filter(q => q.id !== id));
      const remaining = allQuests.filter(q => q.id !== id);
      if (remaining.length > 0) {
        setSelectedQuestId(remaining[0].id);
        setQuestForm(JSON.parse(JSON.stringify(remaining[0])));
      }
      triggerToast("Quest removed from registry.");
    }
  };

  // ============================================================
  // STAGE MANAGEMENT HANDLERS
  // ============================================================
  const handleAddStage = () => {
    const nextIdx = (questForm.stages?.length || 0) + 1;
    const newStage: QuestStage = {
      id: `stage_${Date.now()}`,
      stageIndex: nextIdx,
      title: `Stage ${nextIdx}: Investigate Target`,
      description: "Perform operational objective at designated location.",
      objectiveType: "interact_poi",
      targetPOI: "Shatter Ridge Corridors",
      targetDistrict: "downtown",
      targetCount: 1,
      currentCount: 0,
      completed: false,
      operationalPaths: []
    };

    setQuestForm(prev => ({
      ...prev,
      stages: [...(prev.stages || []), newStage]
    }));
  };

  const handleUpdateStage = (index: number, updated: Partial<QuestStage>) => {
    setQuestForm(prev => {
      const stages = [...prev.stages];
      stages[index] = { ...stages[index], ...updated };
      return { ...prev, stages };
    });
  };

  const handleRemoveStage = (index: number) => {
    setQuestForm(prev => {
      const stages = prev.stages.filter((_, i) => i !== index).map((s, i) => ({
        ...s,
        stageIndex: i + 1
      }));
      return { ...prev, stages };
    });
  };

  const handleMoveStage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questForm.stages.length) return;

    setQuestForm(prev => {
      const stages = [...prev.stages];
      const temp = stages[index];
      stages[index] = stages[targetIndex];
      stages[targetIndex] = temp;
      return {
        ...prev,
        stages: stages.map((s, i) => ({ ...s, stageIndex: i + 1 }))
      };
    });
  };

  // Operational Path Sub-handlers with Presets
  const handleAddOperationalPath = (stageIndex: number, preset?: "combat" | "stealth" | "social" | "mindmancer") => {
    let newPath: QuestOperationalPath;
    if (preset === "combat") {
      newPath = {
        id: `path_combat_${Date.now()}`,
        label: "[Combat - STR 12] Breaching Assault & Heavy Elimination",
        checkType: "str",
        checkValue: 12,
        outcomeDesc: "Overwhelmed defensive forces with devastating kinetic force and heavy ordnance.",
        grantsBonusXP: 35,
        grantsBonusCredits: 50
      };
    } else if (preset === "stealth") {
      newPath = {
        id: `path_stealth_${Date.now()}`,
        label: "[Stealth - DEX 14] Optical Cloak & Vent Infiltration",
        checkType: "dex",
        checkValue: 14,
        outcomeDesc: "Slipped through heat sensors undetected, bypassing all perimeter surveillance.",
        grantsBonusXP: 45,
        grantsBonusCredits: 75
      };
    } else if (preset === "social") {
      newPath = {
        id: `path_social_${Date.now()}`,
        label: "[Hacking - INT 13] Neural ICE Slicer & Social Spoofing",
        checkType: "int",
        checkValue: 13,
        outcomeDesc: "Injected root exploit into the central databank, extracting target intel cleanly.",
        grantsBonusXP: 50,
        grantsBonusCredits: 100
      };
    } else if (preset === "mindmancer") {
      newPath = {
        id: `path_mind_${Date.now()}`,
        label: "[Mindmancer Level 1] Ether Telepathic Command & Sensory Wipe",
        checkType: "mindmancer",
        checkValue: 1,
        outcomeDesc: "Unleashed an ethereal psionic wave, reprogramming target synapses to comply instantly.",
        grantsBonusXP: 60,
        grantsBonusCredits: 120
      };
    } else {
      newPath = {
        id: `path_${Date.now()}`,
        label: "[Custom Tactical Path] Describe action approach...",
        checkType: "none",
        checkValue: 10,
        outcomeDesc: "Outcome resulting from this tactical path.",
        grantsBonusXP: 25,
        grantsBonusCredits: 40
      };
    }

    setQuestForm(prev => {
      const stages = [...prev.stages];
      const stage = stages[stageIndex];
      stage.operationalPaths = [...(stage.operationalPaths || []), newPath];
      return { ...prev, stages };
    });
  };

  const [testRollResult, setTestRollResult] = useState<{ pathId: string; text: string; success: boolean } | null>(null);

  const handleSimulateRoll = (path: QuestOperationalPath) => {
    const checkType = path.checkType || "none";
    const dc = path.checkValue || 10;
    const d20 = Math.floor(Math.random() * 20) + 1;
    let statMod = 0;
    let statName = "Base";

    if (checkType === "int") {
      statMod = gameState.attributes?.int || 10;
      statName = "INT";
    } else if (checkType === "str") {
      statMod = gameState.attributes?.str || 10;
      statName = "STR";
    } else if (checkType === "dex") {
      statMod = gameState.attributes?.dex || 10;
      statName = "DEX";
    } else if (checkType === "will") {
      statMod = gameState.attributes?.will || 10;
      statName = "WILL";
    } else if (checkType === "mindmancer") {
      const hasMind = gameState.mindmancerUnlocked;
      const success = hasMind;
      setTestRollResult({
        pathId: path.id,
        text: success ? `🔮 Mindmancer Active (PASSED check DC ${dc})` : `❌ Mindmancer Locked (FAILED check)`,
        success
      });
      return;
    } else if (checkType === "credits") {
      const success = (gameState.credits || 0) >= dc;
      setTestRollResult({
        pathId: path.id,
        text: success ? `💰 Credits ${gameState.credits}¤ >= ${dc}¤ (PASSED)` : `❌ Credits ${gameState.credits}¤ < ${dc}¤ (FAILED)`,
        success
      });
      return;
    } else if (checkType === "item") {
      const hasItem = path.requiredItem ? gameState.inventory?.includes(path.requiredItem) : true;
      setTestRollResult({
        pathId: path.id,
        text: hasItem ? `📦 Item '${path.requiredItem}' found in stash (PASSED)` : `❌ Item '${path.requiredItem}' missing (FAILED)`,
        success: hasItem
      });
      return;
    }

    const total = d20 + statMod;
    const success = total >= dc;
    setTestRollResult({
      pathId: path.id,
      text: `🎲 Rolled 1d20 (${d20}) + ${statName} (${statMod}) = ${total} vs DC ${dc} ➔ ${success ? "PASSED!" : "FAILED!"}`,
      success
    });
  };

  const handleUpdateOperationalPath = (stageIndex: number, pathIndex: number, updated: Partial<QuestOperationalPath>) => {
    setQuestForm(prev => {
      const stages = [...prev.stages];
      const stage = stages[stageIndex];
      if (stage.operationalPaths) {
        stage.operationalPaths[pathIndex] = { ...stage.operationalPaths[pathIndex], ...updated };
      }
      return { ...prev, stages };
    });
  };

  const handleRemoveOperationalPath = (stageIndex: number, pathIndex: number) => {
    setQuestForm(prev => {
      const stages = [...prev.stages];
      const stage = stages[stageIndex];
      if (stage.operationalPaths) {
        stage.operationalPaths = stage.operationalPaths.filter((_, i) => i !== pathIndex);
      }
      return { ...prev, stages };
    });
  };

  // ============================================================
  // LIVE GAME MASTER QUEST TESTER ACTIONS
  // ============================================================
  const handleLiveActivateQuest = () => {
    setGameState(prev => activateQuest(prev, questForm.id));

    triggerToast(`LIVE HUD: "${questForm.title}" is now ACTIVE in player quest log!`);
  };

  const handleLiveAdvanceStage = () => {
    setGameState(prev => advanceQuestStage(prev, questForm.id));
    triggerToast(`LIVE ADVANCE: Advanced Stage for "${questForm.title}"!`);
  };

  const handleLiveCompleteQuest = () => {
    const rewards = questForm.rewards || {};
    const worldUnlocks = rewards.worldUnlocks || {};

    setGameState(prev => completeQuest(prev, questForm.id));

    let unlockMsg = `COMPLETED: "${questForm.title}"! +${rewards.credits || 0}¤, +${rewards.experience || 0} XP`;
    if (worldUnlocks.unlockBaseId) {
      const baseInfo = BASE_PROPERTIES[worldUnlocks.unlockBaseId];
      unlockMsg += ` | 🏠 UNLOCKED BASE DEED: ${baseInfo?.name || worldUnlocks.unlockBaseId}`;
    }
    if (questForm.nextQuestId) {
      const nextQ = allQuests.find(q => q.id === questForm.nextQuestId);
      unlockMsg += ` ➔ CHAINED NEXT: ${nextQ?.title || questForm.nextQuestId}`;
    }

    triggerToast(unlockMsg);
  };

  const handleLiveResetQuest = () => {
    setGameState(prev => resetQuest(prev, questForm.id));
    triggerToast(`RESET: "${questForm.title}" reset to Not Started.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden text-xs font-mono select-none">
      
      {/* ============================================================ */}
      {/* LEFT COLUMN: QUEST DIRECTORY & SEARCH & SEQUENCE BREADCRUMB  */}
      {/* ============================================================ */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden border-r border-cyan-500/20 pr-3">
        
        {/* Header & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Scroll size={16} />
            <span>Campaign Quests</span>
            <span className="text-3xs bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40 text-cyan-300">
              {allQuests.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCreateNewQuest("side")}
              className="bg-emerald-600 hover:bg-emerald-500 text-black px-2 py-1 rounded font-bold uppercase cursor-pointer text-3xs transition-all flex items-center gap-1 shadow-sm"
              title="Create new Side Bounty"
            >
              <Plus size={12} /> Side
            </button>
            <button
              onClick={() => handleCreateNewQuest("main")}
              className="bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded font-bold uppercase cursor-pointer text-3xs transition-all flex items-center gap-1 shadow-sm"
              title="Create new Main Campaign Step"
            >
              <Plus size={12} /> Main Arc
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {(["ALL", "Main Quest", "Side Quest", "Companion Story"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-0.8 rounded text-3xs uppercase font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? "bg-cyan-500 text-black font-black"
                  : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-white/5"
              }`}
            >
              {cat === "ALL" ? "All Arcs" : cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search quest titles, chapters, districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg pl-7 pr-3 py-1.5 text-2xs text-slate-200 outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Quests Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredQuests.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-cyan-500/20 text-center text-slate-500 text-2xs">
              No matching quests found. Click "+ Main Arc" or "+ Side" to author one!
            </div>
          ) : (
            filteredQuests.map((quest, idx) => {
              const isSelected = selectedQuestId === quest.id;
              const isCompleted = gameState.completedQuests?.some(q => q.includes(quest.title) || q.includes(quest.id));
              const isActive = gameState.activeQuests?.some(q => q.includes(quest.title) || q.includes(quest.id));
              const hasPrereq = !!quest.prerequisiteQuestId;
              const hasNext = !!quest.nextQuestId;

              return (
                <div
                  key={quest.id}
                  onClick={() => handleSelectQuest(quest)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected 
                      ? "bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]" 
                      : "bg-slate-950/80 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyan-200 text-2xs truncate">
                          {quest.title}
                        </span>
                      </div>
                      {quest.chapter && (
                        <span className="text-3xs text-slate-400 truncate">
                          {quest.chapter}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCompleted ? (
                        <span className="text-3xs px-1.5 py-0.2 rounded font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-0.5">
                          <Check size={9} /> DONE
                        </span>
                      ) : isActive ? (
                        <span className="text-3xs px-1.5 py-0.2 rounded font-black uppercase bg-cyan-950 text-cyan-300 border border-cyan-400/50 flex items-center gap-0.5 animate-pulse">
                          <Play size={8} /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-3xs px-1 py-0.2 rounded font-bold uppercase bg-slate-900 text-slate-500 border border-slate-800">
                          IDLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sequence Badges */}
                  <div className="flex items-center gap-1 text-3xs flex-wrap">
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      quest.category === "Main Quest" ? "bg-amber-950/90 text-amber-300 border border-amber-500/30" :
                      quest.category === "Companion Story" ? "bg-purple-950/90 text-purple-300 border border-purple-500/30" :
                      "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {quest.category}
                    </span>

                    {hasPrereq && (
                      <span className="bg-slate-900 text-slate-400 px-1 py-0.2 rounded border border-white/5 truncate max-w-[120px]">
                        Req: {quest.prerequisiteQuestId}
                      </span>
                    )}

                    {hasNext && (
                      <span className="bg-cyan-950/70 text-cyan-300 px-1 py-0.2 rounded border border-cyan-500/20 truncate max-w-[120px]">
                        ➔ Next: {quest.nextQuestId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-3xs text-slate-400 pt-0.5 border-t border-white/5">
                    <span className="text-amber-400 font-bold">¤ {quest.rewards?.credits || 0}</span>
                    <span>{quest.stages?.length || 0} Stages</span>
                    {quest.rewards?.worldUnlocks?.unlockBaseId && (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <Home size={10} /> Base Unlock
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Storyline Flowchart Toggle */}
        <div className="pt-2 border-t border-cyan-500/20">
          <button
            onClick={() => setShowSequenceFlow(!showSequenceFlow)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-3xs font-bold uppercase transition-all"
          >
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Layers size={13} />
              <span>Main Arc Progression Chain ({mainQuestChain.length})</span>
            </span>
            {showSequenceFlow ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showSequenceFlow && (
            <div className="mt-2 p-2 bg-slate-950 rounded-lg border border-cyan-500/20 max-h-40 overflow-y-auto custom-scrollbar space-y-1.5">
              {mainQuestChain.map((mq, i) => (
                <div 
                  key={mq.id}
                  onClick={() => handleSelectQuest(mq)}
                  className={`p-1.5 rounded flex items-center justify-between text-3xs cursor-pointer transition-all ${
                    selectedQuestId === mq.id
                      ? "bg-amber-950/80 text-amber-300 border border-amber-500/50"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-black text-amber-400">{i + 1}.</span>
                    <span className="truncate">{mq.title}</span>
                  </div>
                  {i < mainQuestChain.length - 1 && (
                    <ArrowDown size={10} className="text-slate-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: RICH QUEST EDITOR, OBJECTIVES, REWARDS & LIVE GM */}
      {/* ============================================================ */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar">
        
        {/* TOP BAR: Header & Live GM Cheat Inspector */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-xl border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950 border border-cyan-400/50 rounded-lg text-cyan-400">
              <BookOpen size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase text-cyan-300 tracking-wider">
                  QUEST EDITOR & ARCHITECT
                </span>
                <span className={`text-3xs px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                  liveQuestStatus === "COMPLETED" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" :
                  liveQuestStatus === "ACTIVE" ? "bg-cyan-950 text-cyan-300 border border-cyan-400/50 animate-pulse" :
                  "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  Live Status: {liveQuestStatus}
                </span>
              </div>
              <span className="text-3xs text-slate-400 font-sans">
                ID: <code className="text-cyan-400">{questForm.id}</code>
              </span>
            </div>
          </div>

          {/* GM Live Playtest Control Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleLiveActivateQuest}
              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 font-bold uppercase text-3xs flex items-center gap-1 transition-all cursor-pointer"
              title="Activate this quest in current game session"
            >
              <Play size={11} /> Activate Live
            </button>

            <button
              onClick={handleLiveCompleteQuest}
              className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-3xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Instantly complete quest and claim all items, base deeds, and chain next quest"
            >
              <CheckCircle size={11} /> Auto-Complete & Grant
            </button>

            <button
              onClick={handleLiveResetQuest}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 font-bold uppercase text-3xs flex items-center gap-1 transition-all cursor-pointer"
              title="Reset quest to Not Started"
            >
              <RotateCcw size={11} /> Reset
            </button>

            <button
              onClick={handleSaveQuest}
              className="px-3 py-1 rounded bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-black uppercase text-3xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] ml-1"
            >
              <Check size={13} /> Save Quest
            </button>
          </div>
        </div>

        {/* SECTION 1: CORE IDENTITY & STORY BRIEFING */}
        <div className="p-3 bg-slate-950 rounded-xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-1.5">
            <Sliders size={14} />
            <span>1. Quest Identity & Narrative Arc</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Title */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-3xs text-slate-400 uppercase font-bold">Quest Title *</label>
              <input
                type="text"
                value={questForm.title}
                onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
                placeholder="e.g. Main Quest 2: Corporate Hunt"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-slate-400 uppercase font-bold">Category</label>
              <select
                value={questForm.category}
                onChange={(e) => setQuestForm({ ...questForm, category: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="Main Quest">Main Quest</option>
                <option value="Side Quest">Side Quest</option>
                <option value="Faction Contract">Faction Contract</option>
                <option value="Companion Story">Companion Story</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Chapter */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-slate-400 uppercase font-bold">Chapter / Arc</label>
              <select
                value={questForm.chapter || "Prologue"}
                onChange={(e) => setQuestForm({ ...questForm, chapter: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1.5 text-2xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="Prologue">Prologue</option>
                <option value="Chapter 1: The Outcast Spark">Chapter 1: The Outcast Spark</option>
                <option value="Chapter 2: The Corporate War">Chapter 2: The Corporate War</option>
                <option value="Chapter 3: Technomantic Singularity">Chapter 3: Technomantic Singularity</option>
                <option value="Endgame">Endgame</option>
              </select>
            </div>

            {/* Giver NPC */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-slate-400 uppercase font-bold">Quest Giver NPC</label>
              <input
                type="text"
                value={questForm.giverNPC || ""}
                onChange={(e) => setQuestForm({ ...questForm, giverNPC: e.target.value })}
                className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
                placeholder="e.g. Agent Jax, Vice, Dr. Marv"
              />
            </div>

            {/* Giver POI */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-slate-400 uppercase font-bold">Giver Location (POI)</label>
              <input
                type="text"
                value={questForm.giverPOI || ""}
                onChange={(e) => setQuestForm({ ...questForm, giverPOI: e.target.value })}
                className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
                placeholder="e.g. Neon Abyss Bar"
              />
            </div>

            {/* Min Level */}
            <div className="flex flex-col gap-1">
              <label className="text-3xs text-slate-400 uppercase font-bold">Min Recommended Level</label>
              <input
                type="number"
                min={1}
                max={10}
                value={questForm.minLevel || 1}
                onChange={(e) => setQuestForm({ ...questForm, minLevel: parseInt(e.target.value) || 1 })}
                className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* Short HUD Description */}
          <div className="flex flex-col gap-1">
            <label className="text-3xs text-slate-400 uppercase font-bold">Short HUD Objective Summary</label>
            <input
              type="text"
              value={questForm.description}
              onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
              className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
              placeholder="Summary displayed in top HUD tracker..."
            />
          </div>

          {/* Narrative Story Briefing */}
          <div className="flex flex-col gap-1">
            <label className="text-3xs text-slate-400 uppercase font-bold">Hardboiled Story Briefing & Transmission Log</label>
            <textarea
              rows={2}
              value={questForm.narrativeBriefing || ""}
              onChange={(e) => setQuestForm({ ...questForm, narrativeBriefing: e.target.value })}
              className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none resize-none font-sans leading-relaxed"
              placeholder="Atmospheric cyberpunk narrative briefing..."
            />
          </div>
        </div>

        {/* SECTION 2: SEQUENCING & PREREQUISITES */}
        <div className="p-3 bg-slate-950 rounded-xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Layers size={14} />
              <span>2. Campaign Sequence & Progression Link</span>
            </div>
            <span className="text-3xs text-slate-500">
              Chain quests together in linear or branching order
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prerequisite Quest */}
            <div className="flex flex-col gap-1.5 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <label className="text-3xs text-amber-400 font-bold uppercase flex items-center gap-1">
                <ShieldAlert size={12} /> Prerequisite Quest (Must Complete First)
              </label>
              <select
                value={questForm.prerequisiteQuestId || ""}
                onChange={(e) => setQuestForm({ ...questForm, prerequisiteQuestId: e.target.value })}
                className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1.5 text-2xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="">-- No Prerequisite (Available Immediately) --</option>
                {allQuests
                  .filter(q => q.id !== questForm.id)
                  .map(q => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.category})
                    </option>
                  ))}
              </select>
              <span className="text-3xs text-slate-500 font-sans">
                This quest stays locked until the selected prerequisite quest is marked completed.
              </span>
            </div>

            {/* Next Quest in Sequence */}
            <div className="flex flex-col gap-1.5 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <label className="text-3xs text-cyan-400 font-bold uppercase flex items-center gap-1">
                <ArrowRight size={12} /> Chained Next Quest (Auto-Starts On Complete)
              </label>
              <select
                value={questForm.nextQuestId || ""}
                onChange={(e) => setQuestForm({ ...questForm, nextQuestId: e.target.value })}
                className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1.5 text-2xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="">-- No Follow-up (Arc Completes Here) --</option>
                {allQuests
                  .filter(q => q.id !== questForm.id)
                  .map(q => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.category})
                    </option>
                  ))}
              </select>
              <span className="text-3xs text-slate-500 font-sans">
                When this quest is turned in, the selected quest will automatically activate in the player's log.
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <label className="text-3xs text-fuchsia-400 font-bold uppercase">Required Reputation</label>
              <div className="grid grid-cols-2 gap-2">
                <select value={questForm.requiredReputationFaction || ""} onChange={(e) => setQuestForm({ ...questForm, requiredReputationFaction: (e.target.value || undefined) as UnifiedQuest["requiredReputationFaction"] })} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-2xs text-slate-200">
                  <option value="">No reputation gate</option><option value="streetOutlaws">Street Outlaws</option><option value="titanLogistics">Titan Logistics</option><option value="aresCorporate">Ares Corporate</option>
                </select>
                <input type="number" value={questForm.requiredReputationValue || 0} onChange={(e) => setQuestForm({ ...questForm, requiredReputationValue: Number(e.target.value) })} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-2xs text-slate-200" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MULTI-STAGE OBJECTIVES & OPERATIONAL PATHS */}
        <div className="p-3 bg-slate-950 rounded-xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Crosshair size={14} />
              <span>3. Multi-Stage Objectives & Tactical Paths ({questForm.stages?.length || 0})</span>
            </div>

            <button
              onClick={handleAddStage}
              className="bg-cyan-600 hover:bg-cyan-500 text-black px-2.5 py-1 rounded font-bold uppercase cursor-pointer text-3xs transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus size={12} /> Add Stage
            </button>
          </div>

          {/* Stages List */}
          <div className="space-y-3">
            {questForm.stages?.map((stage, sIdx) => (
              <div 
                key={stage.id || sIdx}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col gap-2.5"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-black text-2xs border border-cyan-500/30">
                      STAGE {stage.stageIndex || sIdx + 1}
                    </span>
                    <span className="font-bold text-slate-200 text-2xs">
                      {stage.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveStage(sIdx, "up")}
                      disabled={sIdx === 0}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                      title="Move stage up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMoveStage(sIdx, "down")}
                      disabled={sIdx === questForm.stages.length - 1}
                      className="p-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                      title="Move stage down"
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      onClick={() => handleRemoveStage(sIdx)}
                      className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 ml-1"
                      title="Delete stage"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stage Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Stage Title</label>
                    <input
                      type="text"
                      value={stage.title}
                      onChange={(e) => handleUpdateStage(sIdx, { title: e.target.value })}
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-2xs text-slate-200 outline-none"
                      placeholder="e.g. Defeat Behemoth at Sludge Conduits"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Objective Action Type</label>
                    <select
                      value={stage.objectiveType}
                      onChange={(e) => handleUpdateStage(sIdx, { objectiveType: e.target.value as any })}
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-2xs text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="hack_terminal">💻 Hack Cyber-Terminal</option>
                      <option value="kill_target">⚔️ Assault & Kill Target</option>
                      <option value="interact_poi">📍 Infiltrate / Interact with POI</option>
                      <option value="talk_npc">💬 Meet & Talk to NPC</option>
                      <option value="collect_item">📦 Collect / Recover Item</option>
                      <option value="custom_choice">⚙️ Custom Tactical Choice</option>
                    </select>
                  </div>
                </div>

                {/* Stage Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-3xs text-slate-400 uppercase font-bold">Stage Instructions</label>
                  <input
                    type="text"
                    value={stage.description}
                    onChange={(e) => handleUpdateStage(sIdx, { description: e.target.value })}
                    className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-2xs text-slate-200 outline-none"
                    placeholder="Specific instruction given to the player..."
                  />
                </div>

                {/* Linked POI, NPC, Item targets */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs text-cyan-300 uppercase font-bold flex items-center justify-between">
                      <span>Target POI</span>
                      <span className="text-4xs text-slate-400 font-normal">Location Anchor</span>
                    </label>
                    <select
                      value={stage.targetPOI || ""}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const foundPOI = allAvailablePOIs.find(p => p.name === selectedVal || p.id === selectedVal);
                        handleUpdateStage(sIdx, { 
                          targetPOI: selectedVal,
                          targetPOIId: foundPOI?.id,
                          targetDistrict: foundPOI?.district || stage.targetDistrict || "conduit09"
                        });
                      }}
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-2xs text-cyan-200 outline-none cursor-pointer"
                    >
                      <option value="">-- Select Target POI --</option>
                      {allAvailablePOIs.map(p => (
                        <option key={p.id} value={p.name}>
                          📍 {p.name} ({p.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-3xs text-emerald-300 uppercase font-bold">Completion Event Key</label>
                    <input
                      type="text"
                      value={stage.completionAction || ""}
                      onChange={(e) => handleUpdateStage(sIdx, { completionAction: e.target.value || undefined })}
                      className="bg-slate-950 border border-emerald-700/60 focus:border-emerald-400 rounded-lg px-2 py-1 text-2xs text-emerald-200 outline-none font-mono"
                      placeholder="poi_id:action"
                      title="The completedPOIActions event that advances this stage in the live game"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Target District</label>
                    <select
                      value={stage.targetDistrict || "conduit09"}
                      onChange={(e) => handleUpdateStage(sIdx, { targetDistrict: e.target.value })}
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-2xs text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="conduit09">Conduit 09 (Subsurface)</option>
                      <option value="aurus">Aurus District (Slums)</option>
                      <option value="downtown">Downtown District</option>
                      <option value="docks">The Docks District</option>
                      <option value="satoshi">Satoshi District (Cyber-Garden)</option>
                      <option value="waste_barrens">Waste Barrens</option>
                      <option value="hyperion_cathedral">Hyperion Neo-Cathedral</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Target Item / NPC</label>
                    <input
                      type="text"
                      value={stage.targetItem || stage.targetNPC || ""}
                      onChange={(e) => handleUpdateStage(sIdx, { targetItem: e.target.value, targetNPC: e.target.value })}
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-2xs text-slate-200 outline-none"
                      placeholder="e.g. Acid Beast Core"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-3xs text-slate-400 uppercase font-bold">Target Count</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={stage.targetCount || 1}
                      onChange={(e) => handleUpdateStage(sIdx, { targetCount: parseInt(e.target.value) || 1 })}
                      className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-2xs text-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Sub-Section: Linked Interactive POI Event & Cinematic Nodes */}
                <div className="mt-1 p-2.5 bg-slate-950/90 rounded-lg border border-purple-500/30 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-1.5">
                    <span className="text-3xs font-bold text-purple-300 uppercase flex items-center gap-1">
                      <Zap size={12} className="text-purple-400" /> Linked POI Interactive Event / Scene
                    </span>
                    <div className="flex items-center gap-2">
                      {stage.linkedPOISceneId && onOpenSceneInEditor && (
                        <button
                          type="button"
                          onClick={() => onOpenSceneInEditor(stage.linkedPOISceneId!)}
                          className="px-2 py-0.5 rounded bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 text-4xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                        >
                          🛠️ Open In Scene Editor
                        </button>
                      )}
                      <span className="text-4xs text-purple-300/70 font-mono">
                        {stage.linkedPOISceneId ? `Linked: ${stage.linkedPOISceneId}` : "Standard Objective"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-4xs text-purple-300 font-bold uppercase">POI Scene Event</label>
                      <select
                        value={stage.linkedPOISceneId || ""}
                        onChange={(e) => {
                          const newSceneKey = e.target.value || undefined;
                          const sceneRegistry: Record<string, POIInteractiveEvent> = {
                            ...DEFAULT_POI_INTERACTIVE_SCENES,
                            ...(gameState?.poiInteractiveScenes || {})
                          };
                          const pickedScene = newSceneKey ? sceneRegistry[newSceneKey] : undefined;
                          const firstStep = pickedScene ? (pickedScene.initialStepId || Object.keys(pickedScene.steps || {})[0] || "intro") : undefined;

                          handleUpdateStage(sIdx, { 
                            linkedPOISceneId: newSceneKey,
                            linkedPOISceneStepId: firstStep
                          });
                        }}
                        className="bg-slate-900 border border-purple-500/40 rounded px-2 py-1 text-2xs text-purple-200 outline-none cursor-pointer"
                      >
                        <option value="">-- No Scene Attached (Standard POI Visit) --</option>
                        {Object.entries({
                          ...DEFAULT_POI_INTERACTIVE_SCENES,
                          ...(gameState?.poiInteractiveScenes || {})
                        } as Record<string, POIInteractiveEvent>).map(([sceneKey, scene]) => (
                          <option key={sceneKey} value={sceneKey}>
                            ⚡ {scene.title} ({scene.poiName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-4xs text-purple-300 font-bold uppercase">Initial Entry Step / Node</label>
                      {stage.linkedPOISceneId ? (
                        (() => {
                          const sceneRegistry: Record<string, POIInteractiveEvent> = {
                            ...DEFAULT_POI_INTERACTIVE_SCENES,
                            ...(gameState?.poiInteractiveScenes || {})
                          };
                          const sc = sceneRegistry[stage.linkedPOISceneId];
                          const availableSteps = sc?.steps ? Object.entries(sc.steps) : [];
                          
                          return (
                            <select
                              value={stage.linkedPOISceneStepId || sc?.initialStepId || "intro"}
                              onChange={(e) => handleUpdateStage(sIdx, { linkedPOISceneStepId: e.target.value })}
                              className="bg-slate-900 border border-purple-500/40 rounded px-2 py-1 text-2xs text-amber-300 font-mono outline-none cursor-pointer"
                            >
                              {availableSteps.length > 0 ? (
                                availableSteps.map(([sKey, step]) => (
                                  <option key={sKey} value={sKey}>
                                    🎬 {sKey} - {step.bannerTitle || step.stepTitle || "Step"}
                                  </option>
                                ))
                              ) : (
                                <option value="intro">🎬 intro (Entry Node)</option>
                              )}
                            </select>
                          );
                        })()
                      ) : (
                        <input
                          type="text"
                          disabled
                          value="-- Select a Scene first --"
                          className="bg-slate-900/50 border border-slate-800 rounded px-2 py-1 text-2xs text-slate-500 cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>

                  {stage.linkedPOISceneId && (
                    <div className="p-2 bg-purple-950/30 rounded border border-purple-500/20 text-3xs font-mono space-y-1">
                      {(() => {
                        const sceneRegistry: Record<string, POIInteractiveEvent> = {
                          ...DEFAULT_POI_INTERACTIVE_SCENES,
                          ...(gameState?.poiInteractiveScenes || {})
                        };
                        const sc = sceneRegistry[stage.linkedPOISceneId];
                        if (!sc) return <p className="text-amber-400">⚠️ Scene '{stage.linkedPOISceneId}' will be created on first trigger.</p>;
                        const stepCount = Object.keys(sc.steps || {}).length;
                        return (
                          <div>
                            <p className="text-purple-300 font-bold flex items-center justify-between">
                              <span>🎬 {sc.title}</span>
                              <span className="text-4xs text-slate-400 font-normal">{stepCount} Interactive Node Steps</span>
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.keys(sc.steps || {}).map(sKey => (
                                <span key={sKey} className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-500/30 text-purple-200 text-4xs">
                                  {sKey}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Sub-Section: Tactical & Skill Check Operational Paths */}
                <div className="mt-1 p-2.5 bg-slate-950/80 rounded-lg border border-amber-500/20 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="text-3xs font-bold text-amber-400 uppercase flex items-center gap-1">
                      <BrainCircuit size={12} className="text-amber-400" /> Multi-Operational Tactical Approaches
                    </span>
                    
                    {/* Quick Preset Generators */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleAddOperationalPath(sIdx, "combat")}
                        className="px-2 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-3xs font-bold uppercase transition-all flex items-center gap-1"
                        title="Add Combat/Breach Tactical Path"
                      >
                        ⚔️ +Combat
                      </button>
                      <button
                        onClick={() => handleAddOperationalPath(sIdx, "stealth")}
                        className="px-2 py-0.5 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-3xs font-bold uppercase transition-all flex items-center gap-1"
                        title="Add Stealth/Vent Infiltration Path"
                      >
                        🥷 +Stealth
                      </button>
                      <button
                        onClick={() => handleAddOperationalPath(sIdx, "social")}
                        className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-3xs font-bold uppercase transition-all flex items-center gap-1"
                        title="Add Hacking/Social Engineering Path"
                      >
                        💬 +Hacking
                      </button>
                      <button
                        onClick={() => handleAddOperationalPath(sIdx, "mindmancer")}
                        className="px-2 py-0.5 rounded bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-3xs font-bold uppercase transition-all flex items-center gap-1"
                        title="Add Mindmancer Psionic Path"
                      >
                        🔮 +Mindmancer
                      </button>
                      <button
                        onClick={() => handleAddOperationalPath(sIdx)}
                        className="text-3xs text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded border border-white/10 uppercase font-bold"
                      >
                        + Custom
                      </button>
                    </div>
                  </div>

                  {stage.operationalPaths && stage.operationalPaths.length > 0 ? (
                    <div className="space-y-2">
                      {stage.operationalPaths.map((path, pIdx) => (
                        <div key={path.id || pIdx} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={path.label}
                              onChange={(e) => handleUpdateOperationalPath(sIdx, pIdx, { label: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2.5 py-1 text-2xs text-amber-200 font-bold outline-none"
                              placeholder="e.g. [Hacking - INT 12] Slice rear terminal"
                            />
                            <button
                              onClick={() => handleSimulateRoll(path)}
                              className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-3xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0"
                              title="Simulate Roll vs Player Stats"
                            >
                              🎲 Test Roll
                            </button>
                            <button
                              onClick={() => handleRemoveOperationalPath(sIdx, pIdx)}
                              className="text-rose-400 hover:text-rose-200 p-1 bg-rose-950/40 rounded border border-rose-500/20"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {testRollResult && testRollResult.pathId === path.id && (
                            <div className={`p-1.5 rounded text-3xs font-mono border ${testRollResult.success ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300" : "bg-rose-950/80 border-rose-500/40 text-rose-300"}`}>
                              {testRollResult.text}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-500">Check:</span>
                              <select
                                value={path.checkType || "none"}
                                onChange={(e) => handleUpdateOperationalPath(sIdx, pIdx, { checkType: e.target.value as any })}
                                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-slate-200 outline-none flex-1"
                              >
                                <option value="none">None (Direct)</option>
                                <option value="int">Intelligence (INT)</option>
                                <option value="str">Strength (STR)</option>
                                <option value="dex">Dexterity (DEX)</option>
                                <option value="will">Willpower (WILL)</option>
                                <option value="mindmancer">Mindmancer Skill</option>
                                <option value="credits">Credits Cost</option>
                                <option value="item">Required Item</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-500">DC / Req:</span>
                              <input
                                type="number"
                                value={path.checkValue || 10}
                                onChange={(e) => handleUpdateOperationalPath(sIdx, pIdx, { checkValue: parseInt(e.target.value) || 0 })}
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-slate-200 outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-500">+XP:</span>
                              <input
                                type="number"
                                value={path.grantsBonusXP || 0}
                                onChange={(e) => handleUpdateOperationalPath(sIdx, pIdx, { grantsBonusXP: parseInt(e.target.value) || 0 })}
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-emerald-400 outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-3xs text-slate-500">+Credits:</span>
                              <input
                                type="number"
                                value={path.grantsBonusCredits || 0}
                                onChange={(e) => handleUpdateOperationalPath(sIdx, pIdx, { grantsBonusCredits: parseInt(e.target.value) || 0 })}
                                className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-amber-400 outline-none"
                              />
                            </div>
                          </div>

                          <input
                            type="text"
                            value={path.outcomeDesc}
                            onChange={(e) => handleUpdateOperationalPath(sIdx, pIdx, { outcomeDesc: e.target.value })}
                            className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-2 py-1 text-2xs text-slate-300 outline-none"
                            placeholder="Narrative outcome description when path is chosen..."
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-3xs text-slate-600 italic">
                      No branching paths added (Default objective flow will be used). Use buttons above to add Combat, Stealth, Hacking, or Mindmancer paths.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: REWARDS & DETERMINISTIC WORLD UNLOCKS */}
        <div className="p-3 bg-slate-950 rounded-xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-1.5">
            <Gift size={14} />
            <span>4. Quest Rewards, Faction Gains & Deterministic World Unlocks</span>
          </div>

          {/* Currency & XP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <label className="text-3xs text-amber-400 font-bold uppercase flex items-center gap-1">
                <Coins size={12} /> Credit Payout (¤)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                value={questForm.rewards?.credits || 0}
                onChange={(e) => setQuestForm({
                  ...questForm,
                  rewards: { ...questForm.rewards, credits: parseInt(e.target.value) || 0 }
                })}
                className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-2xs text-amber-300 font-bold outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <label className="text-3xs text-emerald-400 font-bold uppercase flex items-center gap-1">
                <Award size={12} /> Experience Points (XP)
              </label>
              <input
                type="number"
                min={0}
                step={25}
                value={questForm.rewards?.experience || 0}
                onChange={(e) => setQuestForm({
                  ...questForm,
                  rewards: { ...questForm.rewards, experience: parseInt(e.target.value) || 0 }
                })}
                className="bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-lg px-2.5 py-1 text-2xs text-emerald-300 font-bold outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <label className="text-3xs text-cyan-400 font-bold uppercase flex items-center gap-1">
                <Zap size={12} /> Outlaw Rep Impact
              </label>
              <input
                type="number"
                value={questForm.rewards?.reputation?.streetOutlaws || 0}
                onChange={(e) => setQuestForm({
                  ...questForm,
                  rewards: {
                    ...questForm.rewards,
                    reputation: {
                      ...questForm.rewards?.reputation,
                      streetOutlaws: parseInt(e.target.value) || 0
                    }
                  }
                })}
                className="bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-2xs text-cyan-300 font-bold outline-none"
              />
            </div>
          </div>

          {/* Reward Items Multi-Select / Tag list */}
          <div className="flex flex-col gap-1.5 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <label className="text-3xs text-purple-400 font-bold uppercase flex items-center gap-1">
              <Gift size={12} /> Reward Items Granted to Player Inventory
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {questForm.rewards?.items?.map((item, idx) => (
                <span 
                  key={idx}
                  className="bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-3xs font-bold flex items-center gap-1"
                >
                  {item}
                  <button
                    onClick={() => {
                      const nextItems = questForm.rewards.items?.filter((_, i) => i !== idx);
                      setQuestForm({
                        ...questForm,
                        rewards: { ...questForm.rewards, items: nextItems }
                      });
                    }}
                    className="text-rose-400 hover:text-rose-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                id="reward-item-picker"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-lg px-2.5 py-1 text-2xs text-slate-200 outline-none cursor-pointer"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    const currentItems = questForm.rewards?.items || [];
                    if (!currentItems.includes(e.target.value)) {
                      setQuestForm({
                        ...questForm,
                        rewards: {
                          ...questForm.rewards,
                          items: [...currentItems, e.target.value]
                        }
                      });
                    }
                    e.target.value = "";
                  }
                }}
              >
                <option value="">+ Select Item to add to quest rewards...</option>
                {allAvailableItems.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {/* WORLD UNLOCKS: BASE DEEDS, DISTRICT GATES, COMPANIONS & PERKS */}
          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Home size={14} />
                <span>Deterministic World Unlocks & Base Deeds</span>
              </div>
              <span className="text-3xs text-emerald-500/80 font-sans">
                Permanent upgrades triggered upon quest turn-in
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Unlock Base Property Deed */}
              <div className="flex flex-col gap-1">
                <label className="text-3xs text-emerald-300 uppercase font-bold flex items-center gap-1">
                  <Home size={11} /> Unlock Base Property Deed
                </label>
                <select
                  value={questForm.rewards?.worldUnlocks?.unlockBaseId || ""}
                  onChange={(e) => setQuestForm({
                    ...questForm,
                    rewards: {
                      ...questForm.rewards,
                      worldUnlocks: {
                        ...questForm.rewards?.worldUnlocks,
                        unlockBaseId: e.target.value || undefined
                      }
                    }
                  })}
                  className="bg-slate-950 border border-emerald-500/30 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="">-- No Base Deed Unlocked --</option>
                  <option value="docks_bunker">Docks Subterranean Vault Bunker (650¤ - Heavy Turrets)</option>
                  <option value="satoshi_penthouse">Satoshi Cyber-Penthouse & Zen Sanctum (1,200¤ - Server Array)</option>
                  <option value="hyperion_spire">Hyperion Neo-Cathedral Spire (2,500¤ - Ley-Line Power)</option>
                </select>
              </div>

              {/* Unlock Fast-Travel District Pass */}
              <div className="flex flex-col gap-1">
                <label className="text-3xs text-emerald-300 uppercase font-bold flex items-center gap-1">
                  <Compass size={11} /> Unlock District Fast-Travel Gate Pass
                </label>
                <select
                  value={questForm.rewards?.worldUnlocks?.unlockDistrictId || ""}
                  onChange={(e) => setQuestForm({
                    ...questForm,
                    rewards: {
                      ...questForm.rewards,
                      worldUnlocks: {
                        ...questForm.rewards?.worldUnlocks,
                        unlockDistrictId: e.target.value || undefined
                      }
                    }
                  })}
                  className="bg-slate-950 border border-emerald-500/30 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="">-- No District Gate Unlocked --</option>
                  <option value="satoshi">Satoshi District (Cyber-Garden)</option>
                  <option value="waste_barrens">Waste Barrens (Radiation Badlands)</option>
                  <option value="hyperion_cathedral">Hyperion Neo-Cathedral Summit</option>
                </select>
              </div>

              {/* Recruit Companion / Outcast */}
              <div className="flex flex-col gap-1">
                <label className="text-3xs text-emerald-300 uppercase font-bold flex items-center gap-1">
                  <UserCheck size={11} /> Recruit Companion / Rescue Outcast
                </label>
                <input
                  type="text"
                  value={questForm.rewards?.worldUnlocks?.recruitCompanionId || ""}
                  onChange={(e) => setQuestForm({
                    ...questForm,
                    rewards: {
                      ...questForm.rewards,
                      worldUnlocks: {
                        ...questForm.rewards?.worldUnlocks,
                        recruitCompanionId: e.target.value || undefined
                      }
                    }
                  })}
                  className="bg-slate-950 border border-emerald-500/30 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
                  placeholder="e.g. Vice, Nyx, Mia, Cipher"
                />
              </div>

              {/* Exclusive Skill or Perk */}
              <div className="flex flex-col gap-1">
                <label className="text-3xs text-emerald-300 uppercase font-bold flex items-center gap-1">
                  <BrainCircuit size={11} /> Grant Exclusive Skill or Global Perk
                </label>
                <input
                  type="text"
                  value={questForm.rewards?.worldUnlocks?.unlockPerkOrSkill || ""}
                  onChange={(e) => setQuestForm({
                    ...questForm,
                    rewards: {
                      ...questForm.rewards,
                      worldUnlocks: {
                        ...questForm.rewards?.worldUnlocks,
                        unlockPerkOrSkill: e.target.value || undefined
                      }
                    }
                  })}
                  className="bg-slate-950 border border-emerald-500/30 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-2xs text-slate-200 outline-none"
                  placeholder="e.g. Mindmancer Synaptic Weaver, Avatar of Singularity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-cyan-500/20">
          <button
            onClick={() => handleDeleteQuest(questForm.id)}
            className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-3xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} /> Delete Quest
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateNewQuest("side")}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-3xs font-bold uppercase transition-all cursor-pointer"
            >
              + Create Another
            </button>

            <button
              onClick={handleSaveQuest}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-2xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)]"
            >
              <Check size={14} /> Save Quest to Campaign
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
