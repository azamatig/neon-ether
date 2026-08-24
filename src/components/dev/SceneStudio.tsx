import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Copy, 
  Play, 
  MapPin, 
  Sparkles, 
  Image as ImageIcon, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  GitBranch,
  Shield,
  Layers,
  Search,
  ExternalLink,
  RotateCcw
} from "lucide-react";
import { 
  GameState, 
  POIInteractiveEvent, 
  POISceneStep, 
  POISceneChoice, 
  POICompanionDialogue,
  UnifiedQuest,
  CustomPOIData
} from "../../types";
import { DEFAULT_POI_INTERACTIVE_SCENES } from "../../poiScenesData";
import { MAP_POIS, REGIONS } from "../../data";

export const PRESET_SCENE_BANNERS = [
  { name: "Obsidian Altar / Technomancy", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" },
  { name: "Cyberpunk Alley / Smog", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800" },
  { name: "High-Tech Corporate Vault", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800" },
  { name: "Neon Spire Penthouse / Bar", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800" },
  { name: "Underground Sludge Conduit", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800" },
  { name: "Dark Server Room Mainframe", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" }
];

interface SceneStudioProps {
  gameState?: GameState | null;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
  customPOIs?: CustomPOIData[];
  triggerToast: (msg: string) => void;
  onLaunchSceneLive?: (sceneId: string, initialStepId?: string) => void;
  selectedSceneIdToEdit?: string | null;
  initialSelectedSceneId?: string;
  onClearSelectedSceneId?: () => void;
}

export const SceneStudio: React.FC<SceneStudioProps> = ({
  gameState,
  setGameState,
  customPOIs = [],
  triggerToast,
  onLaunchSceneLive,
  selectedSceneIdToEdit,
  initialSelectedSceneId,
  onClearSelectedSceneId
}) => {
  const STORAGE_KEY_SCENES = "dev_studio_custom_scenes_v2";

  // Master scene registry combining defaults and dynamic custom scenes
  const [scenes, setScenes] = useState<Record<string, POIInteractiveEvent>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCENES);
      const savedParsed = saved ? JSON.parse(saved) : {};
      return {
        ...DEFAULT_POI_INTERACTIVE_SCENES,
        ...(gameState?.poiInteractiveScenes || {}),
        ...savedParsed
      };
    } catch (e) {
      return {
        ...DEFAULT_POI_INTERACTIVE_SCENES,
        ...(gameState?.poiInteractiveScenes || {})
      };
    }
  });

  const [activeSceneId, setActiveSceneId] = useState<string>(initialSelectedSceneId || selectedSceneIdToEdit || "relic_altar");
  const [activeStepId, setActiveStepId] = useState<string>("intro");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");

  // Sync with prop if opened from Quest Studio or POI Studio
  useEffect(() => {
    const targetSceneId = initialSelectedSceneId || selectedSceneIdToEdit;
    if (targetSceneId) {
      if (scenes[targetSceneId]) {
        setActiveSceneId(targetSceneId);
        const sc = scenes[targetSceneId];
        setActiveStepId(sc.initialStepId || Object.keys(sc.steps || {})[0] || "intro");
      }
      onClearSelectedSceneId?.();
    }
  }, [selectedSceneIdToEdit, initialSelectedSceneId, scenes]);

  // Persist scenes to localStorage and gameState
  const saveScenes = (updated: Record<string, POIInteractiveEvent>) => {
    setScenes(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SCENES, JSON.stringify(updated));
    } catch (e) {}

    if (setGameState) {
      setGameState(prev => ({
        ...prev,
        poiInteractiveScenes: updated
      }));
    }
  };

  const activeScene: POIInteractiveEvent | undefined = scenes[activeSceneId] || (Object.values(scenes)[0] as POIInteractiveEvent | undefined);
  const activeStep: POISceneStep | undefined = activeScene?.steps?.[activeStepId] || (activeScene?.steps ? (Object.values(activeScene.steps)[0] as POISceneStep | undefined) : undefined);

  // Available POIs from built-in MAP_POIS + customPOIs
  const allPOIs = [
    ...MAP_POIS.map(p => ({ id: p.id, name: p.name, district: p.district || "conduit09" })),
    ...customPOIs.map(p => ({ id: p.id, name: p.name, district: p.district || "conduit09" }))
  ];

  // Helper to create a brand new scene
  const handleCreateNewScene = () => {
    const newId = `scene_${Date.now().toString().slice(-6)}`;
    const newScene: POIInteractiveEvent = {
      id: newId,
      poiId: allPOIs[0]?.id || "relic_altar",
      poiName: allPOIs[0]?.name || "Mysterious Point of Interest",
      districtId: allPOIs[0]?.district || "conduit09",
      title: "NEW INTERACTIVE EVENT SEQUENCE",
      initialStepId: "intro",
      steps: {
        intro: {
          id: "intro",
          stepTitle: "ANOMALY DETECTED",
          bannerTitle: "AN UNKNOWN SECTOR ENCOUNTER",
          bannerImage: PRESET_SCENE_BANNERS[0].url,
          badgeLabel: "INTERACTIVE NODE INITIALIZED",
          narrativeText: "You enter the chamber. Low-frequency electromagnetic hums reverberate across the conduits. The path ahead branches into distinct operational vectors.",
          companions: [
            {
              id: "vice_note",
              name: "Vice",
              role: "Companion",
              avatar: "🔫",
              color: "rose",
              text: "Keep your guard up. I don't like the look of these thermal signatures."
            }
          ],
          choices: [
            {
              id: "opt_proceed",
              label: "🔎 [Inspect Area Mainframe]",
              targetStepId: "inspect",
              checkType: "none",
              outcomeNarrative: "You move forward and scan the primary terminals.",
              variant: "cyan"
            },
            {
              id: "opt_leave",
              label: "↩️ [Step Back and Leave Area]",
              targetStepId: "__EXIT__",
              checkType: "none",
              outcomeNarrative: "You carefully withdraw from the active node.",
              variant: "rose"
            }
          ]
        },
        inspect: {
          id: "inspect",
          stepTitle: "MAINFRAME ANALYSIS",
          bannerTitle: "DATA LOGS UNCOVERED",
          bannerImage: PRESET_SCENE_BANNERS[2].url,
          badgeLabel: "ANALYSIS PHASE",
          narrativeText: "The console flickers to life, revealing encrypted corporate communication logs and a bypass cipher.",
          companions: [],
          choices: [
            {
              id: "opt_hack",
              label: "💻 [Intelligence 12] Slice Firewall Cipher",
              targetStepId: "__EXIT__",
              checkType: "int",
              checkValue: 12,
              grantsXP: 45,
              grantsCredits: 120,
              outcomeNarrative: "You crack the encryption matrix cleanly, extracting 120¤ credits and classified data!",
              variant: "purple"
            },
            {
              id: "opt_back_intro",
              label: "↩️ Return to Chamber Entrance",
              targetStepId: "intro",
              checkType: "none",
              variant: "cyan"
            }
          ]
        }
      }
    };

    const next = { ...scenes, [newId]: newScene };
    saveScenes(next);
    setActiveSceneId(newId);
    setActiveStepId("intro");
    triggerToast(`CREATED NEW SCENE: "${newScene.title}"`);
  };

  // Helper to clone active scene
  const handleDuplicateScene = () => {
    if (!activeScene) return;
    const clonedId = `${activeSceneId}_copy_${Date.now().toString().slice(-4)}`;
    const clonedScene: POIInteractiveEvent = {
      ...JSON.parse(JSON.stringify(activeScene)),
      id: clonedId,
      title: `${activeScene.title} (Clone)`
    };
    const next = { ...scenes, [clonedId]: clonedScene };
    saveScenes(next);
    setActiveSceneId(clonedId);
    triggerToast(`DUPLICATED SCENE: ${clonedId}`);
  };

  // Helper to delete scene
  const handleDeleteScene = (idToDelete: string) => {
    if (Object.keys(scenes).length <= 1) {
      triggerToast("Cannot delete the last remaining scene!");
      return;
    }
    const next = { ...scenes };
    delete next[idToDelete];
    saveScenes(next);
    const firstRemaining = Object.keys(next)[0];
    setActiveSceneId(firstRemaining);
    setActiveStepId(next[firstRemaining]?.initialStepId || "intro");
    triggerToast(`DELETED SCENE: ${idToDelete}`);
  };

  // Helper to update active scene fields
  const handleUpdateSceneMeta = (fields: Partial<POIInteractiveEvent>) => {
    if (!activeScene) return;
    const updated = {
      ...scenes,
      [activeSceneId]: {
        ...activeScene,
        ...fields
      }
    };
    saveScenes(updated);
  };

  // Helper to update step fields
  const handleUpdateStep = (stepId: string, fields: Partial<POISceneStep>) => {
    if (!activeScene || !activeScene.steps[stepId]) return;
    const updated = {
      ...scenes,
      [activeSceneId]: {
        ...activeScene,
        steps: {
          ...activeScene.steps,
          [stepId]: {
            ...activeScene.steps[stepId],
            ...fields
          }
        }
      }
    };
    saveScenes(updated);
  };

  // Helper to add new step to active scene
  const handleAddStep = () => {
    if (!activeScene) return;
    const newStepKey = `node_${Object.keys(activeScene.steps || {}).length + 1}`;
    const newStep: POISceneStep = {
      id: newStepKey,
      stepTitle: `BRANCH NODE ${newStepKey.toUpperCase()}`,
      bannerTitle: `SECTOR DISCOVERY`,
      bannerImage: PRESET_SCENE_BANNERS[1].url,
      badgeLabel: "OPERATIONAL BRANCH",
      narrativeText: "You advance further into the operational sector.",
      companions: [],
      choices: [
        {
          id: `opt_${Date.now().toString().slice(-4)}`,
          label: "↩️ Return to Initial Point",
          targetStepId: activeScene.initialStepId || "intro",
          checkType: "none",
          variant: "cyan"
        }
      ]
    };

    const updated = {
      ...scenes,
      [activeSceneId]: {
        ...activeScene,
        steps: {
          ...activeScene.steps,
          [newStepKey]: newStep
        }
      }
    };
    saveScenes(updated);
    setActiveStepId(newStepKey);
    triggerToast(`ADDED NODE STEP: "${newStepKey}"`);
  };

  // Helper to delete step
  const handleDeleteStep = (stepKeyToDelete: string) => {
    if (!activeScene) return;
    if (Object.keys(activeScene.steps).length <= 1) {
      triggerToast("A scene must have at least one step!");
      return;
    }
    const nextSteps = { ...activeScene.steps };
    delete nextSteps[stepKeyToDelete];
    const newInitial = activeScene.initialStepId === stepKeyToDelete ? Object.keys(nextSteps)[0] : activeScene.initialStepId;
    
    const updated = {
      ...scenes,
      [activeSceneId]: {
        ...activeScene,
        initialStepId: newInitial,
        steps: nextSteps
      }
    };
    saveScenes(updated);
    setActiveStepId(newInitial);
    triggerToast(`DELETED STEP: ${stepKeyToDelete}`);
  };

  // Helper to launch test scene live
  const handleTestScene = () => {
    if (!activeScene) return;
    if (onLaunchSceneLive) {
      onLaunchSceneLive(activeSceneId, activeStepId);
    } else if (setGameState) {
      setGameState(prev => ({
        ...prev,
        activePOIScene: {
          sceneId: activeSceneId,
          currentStepId: activeStepId || activeScene.initialStepId || "intro",
          history: [activeStepId || activeScene.initialStepId || "intro"],
          variables: {}
        }
      }));
      triggerToast(`⚡ TEST LAUNCHED: "${activeScene.title}"`);
    }
  };

  const filteredSceneList = (Object.entries(scenes) as [string, POIInteractiveEvent][]).filter(([sId, sc]) => {
    const matchesSearch = (sc.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sc.poiName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = filterDistrict === "all" || sc.districtId === filterDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[600px] text-slate-200">
      {/* LEFT COLUMN: SCENE SELECTOR & MASTER LIST */}
      <div className="w-full lg:w-80 flex flex-col gap-2.5 shrink-0 bg-slate-900/90 border border-purple-500/30 rounded-xl p-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-purple-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-purple-300">SCENE REGISTRY</h2>
          </div>
          <button
            onClick={handleCreateNewScene}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-2xs font-black uppercase tracking-wider transition-all shadow cursor-pointer"
          >
            <Plus size={12} /> New Scene
          </button>
        </div>

        {/* Search & District Filter */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search scene, POI, ID..."
              className="w-full bg-slate-950 border border-slate-700/60 rounded pl-7 pr-2 py-1 text-2xs text-slate-200 placeholder-slate-500 outline-none"
            />
          </div>

          <select
            value={filterDistrict}
            onChange={e => setFilterDistrict(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/60 rounded px-2 py-1 text-2xs text-purple-300 outline-none cursor-pointer"
          >
            <option value="all">🌍 All Districts</option>
            {REGIONS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* List of Scenes */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[500px]">
          {filteredSceneList.map(([sId, sc]) => {
            const isSelected = sId === activeSceneId;
            const stepCount = Object.keys(sc.steps || {}).length;
            return (
              <div
                key={sId}
                onClick={() => {
                  setActiveSceneId(sId);
                  setActiveStepId(sc.initialStepId || Object.keys(sc.steps || {})[0] || "intro");
                }}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? "bg-purple-950/60 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-2xs font-black uppercase text-purple-200 truncate">
                    {sc.title || "Untitled Scene"}
                  </span>
                  <span className="text-4xs px-1.5 py-0.5 rounded bg-purple-900/70 text-purple-300 border border-purple-500/30 font-mono">
                    {stepCount} {stepCount === 1 ? "Node" : "Nodes"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-3xs text-slate-400">
                  <span className="truncate flex items-center gap-1">
                    <MapPin size={10} className="text-cyan-400 shrink-0" /> {sc.poiName}
                  </span>
                  <span className="text-4xs text-slate-500 font-mono">ID: {sId}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Test Scene Button */}
        <button
          onClick={handleTestScene}
          className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg text-2xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer mt-auto"
        >
          <Play size={13} fill="currentColor" /> Test Scene In Live Game
        </button>
      </div>

      {/* RIGHT COLUMN: ACTIVE SCENE & NODE WORKBENCH */}
      {activeScene ? (
        <div className="flex-1 flex flex-col gap-3 min-w-0 bg-slate-900/80 border border-slate-800 rounded-xl p-4 overflow-y-auto">
          {/* HEADER BAR: META INFO & CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-400/50 text-purple-300">
                <GitBranch size={18} />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  SCENE NODE EDITOR: {activeScene.title}
                </span>
                <p className="text-3xs text-slate-400">
                  Configure branching dialogue, companion interactions, hard stat checks, and narrative banners.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDuplicateScene}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-3xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                title="Duplicate this scene"
              >
                <Copy size={11} /> Clone Scene
              </button>
              <button
                onClick={() => handleDeleteScene(activeSceneId)}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-3xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                title="Delete this scene"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>

          {/* SCENE GLOBAL SETTINGS (ID, TITLE, POI, DISTRICT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-950/70 p-3 rounded-lg border border-purple-500/20">
            <div className="flex flex-col gap-1">
              <label className="text-4xs text-purple-300 uppercase font-bold">Scene Unique ID</label>
              <input
                type="text"
                value={activeScene.id || activeSceneId}
                onChange={e => handleUpdateSceneMeta({ id: e.target.value })}
                className="bg-slate-900 border border-purple-500/30 rounded px-2 py-1 text-2xs text-purple-200 font-mono outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-4xs text-purple-300 uppercase font-bold">Scene Title</label>
              <input
                type="text"
                value={activeScene.title || ""}
                onChange={e => handleUpdateSceneMeta({ title: e.target.value })}
                className="bg-slate-900 border border-purple-500/30 rounded px-2 py-1 text-2xs text-slate-100 outline-none"
                placeholder="e.g. ANOMALY SEQUENCE: OBSIDIAN ALTAR"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-4xs text-purple-300 uppercase font-bold">Target POI (World Anchor)</label>
              <select
                value={activeScene.poiId}
                onChange={e => {
                  const selectedPOI = allPOIs.find(p => p.id === e.target.value);
                  handleUpdateSceneMeta({
                    poiId: e.target.value,
                    poiName: selectedPOI ? selectedPOI.name : activeScene.poiName,
                    districtId: selectedPOI ? selectedPOI.district : activeScene.districtId
                  });
                }}
                className="bg-slate-900 border border-purple-500/30 rounded px-2 py-1 text-2xs text-cyan-300 outline-none cursor-pointer"
              >
                {allPOIs.map(p => (
                  <option key={p.id} value={p.id}>
                    📍 {p.name} ({p.district})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-4xs text-purple-300 uppercase font-bold">Initial Entry Step Node</label>
              <select
                value={activeScene.initialStepId || "intro"}
                onChange={e => handleUpdateSceneMeta({ initialStepId: e.target.value })}
                className="bg-slate-900 border border-purple-500/30 rounded px-2 py-1 text-2xs text-amber-300 font-mono outline-none cursor-pointer"
              >
                {Object.keys(activeScene.steps || {}).map(stepKey => (
                  <option key={stepKey} value={stepKey}>
                    🎬 Step: {stepKey}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP TABS STRIP */}
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-3xs font-bold text-slate-400 uppercase mr-1">Steps:</span>
              {Object.keys(activeScene.steps || {}).map(stepKey => {
                const isCurrentStep = stepKey === activeStepId;
                const isInitial = stepKey === activeScene.initialStepId;
                return (
                  <button
                    key={stepKey}
                    onClick={() => setActiveStepId(stepKey)}
                    className={`px-3 py-1.5 rounded-t text-2xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentStep
                        ? "bg-purple-950 border-t-2 border-l border-r border-purple-400 text-purple-200"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border-b border-slate-800"
                    }`}
                  >
                    <span>{stepKey}</span>
                    {isInitial && <span className="text-4xs text-amber-400 font-sans font-black">[ENTRY]</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAddStep}
              className="flex items-center gap-1 px-2 py-1 bg-purple-950/90 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded text-3xs font-bold uppercase cursor-pointer"
            >
              <Plus size={11} /> Add Node Step
            </button>
          </div>

          {/* ACTIVE STEP WORKBENCH */}
          {activeStep && (
            <div className="flex flex-col gap-3 bg-slate-950/80 border border-purple-500/20 rounded-xl p-4">
              {/* STEP HEADER & BANNER CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-4xs text-purple-300 uppercase font-bold">Node Step Key / Slug</label>
                  <input
                    type="text"
                    value={activeStep.id || activeStepId}
                    onChange={e => {
                      const newKey = e.target.value.trim();
                      if (!newKey || newKey === activeStepId) return;
                      const nextSteps = { ...activeScene.steps };
                      nextSteps[newKey] = { ...activeStep, id: newKey };
                      delete nextSteps[activeStepId];
                      const nextInitial = activeScene.initialStepId === activeStepId ? newKey : activeScene.initialStepId;
                      handleUpdateSceneMeta({ steps: nextSteps, initialStepId: nextInitial });
                      setActiveStepId(newKey);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-2xs text-purple-200 font-mono outline-none"
                    placeholder="e.g. intro, breach_vault, examine_altar"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-4xs text-purple-300 uppercase font-bold">Badge Subtitle Label</label>
                  <input
                    type="text"
                    value={activeStep.badgeLabel || activeStep.stepTitle || ""}
                    onChange={e => handleUpdateStep(activeStepId, { badgeLabel: e.target.value, stepTitle: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-2xs text-slate-200 outline-none"
                    placeholder="e.g. ANOMALY DETECTED, BREACH SEQUENCE"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-4xs text-purple-300 uppercase font-bold">Banner Headline</label>
                  <input
                    type="text"
                    value={activeStep.bannerTitle || ""}
                    onChange={e => handleUpdateStep(activeStepId, { bannerTitle: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-2xs text-amber-300 outline-none"
                    placeholder="e.g. A FLOATING RELIC OF UNKNOWN ORIGINS"
                  />
                </div>
              </div>

              {/* BANNER IMAGE SELECTION & PREVIEW */}
              <div className="flex flex-col gap-1.5 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-4xs text-cyan-300 uppercase font-bold flex items-center gap-1">
                    <ImageIcon size={11} /> Banner Cinematic Artwork (16:9 Widescreen)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-4xs text-slate-400">Quick Presets:</span>
                    {PRESET_SCENE_BANNERS.slice(0, 3).map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUpdateStep(activeStepId, { bannerImage: p.url })}
                        className="text-4xs px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 cursor-pointer"
                      >
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeStep.bannerImage || ""}
                    onChange={e => handleUpdateStep(activeStepId, { bannerImage: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-2xs text-cyan-200 outline-none"
                    placeholder="Paste direct image URL..."
                  />
                  {activeStep.bannerImage && (
                    <div className="w-20 h-9 rounded overflow-hidden border border-cyan-500/40 shrink-0">
                      <img src={activeStep.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* ATMOSPHERIC NARRATIVE PROSE */}
              <div className="flex flex-col gap-1">
                <label className="text-4xs text-amber-300 uppercase font-bold flex items-center justify-between">
                  <span>Atmospheric Story Prose & Narrative Text</span>
                  <span className="text-4xs text-slate-400">Markdown / Formatted text supported</span>
                </label>
                <textarea
                  value={activeStep.narrativeText || ""}
                  onChange={e => handleUpdateStep(activeStepId, { narrativeText: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-2xs text-slate-100 leading-relaxed outline-none focus:border-purple-400 resize-y"
                  placeholder="Describe the environment, the tension, sensory details, corporate alerts..."
                />
              </div>

              {/* COMPANION DIALOGUES SUB-SECTION */}
              <div className="flex flex-col gap-2 p-3 bg-slate-900/60 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="text-3xs font-black uppercase text-purple-300 flex items-center gap-1">
                    <MessageSquare size={12} className="text-purple-400" /> Companion In-Scene Dialogue & Banter
                  </span>
                  <button
                    onClick={() => {
                      const newComp: POICompanionDialogue = {
                        id: `comp_${Date.now().toString().slice(-4)}`,
                        name: "Vice",
                        role: "Companion",
                        avatar: "🔫",
                        color: "rose",
                        text: "I've got your back on this."
                      };
                      handleUpdateStep(activeStepId, {
                        companions: [...(activeStep.companions || []), newComp]
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/30 text-purple-300 rounded text-4xs font-bold uppercase cursor-pointer"
                  >
                    <Plus size={10} /> Add Companion Line
                  </button>
                </div>

                {(!activeStep.companions || activeStep.companions.length === 0) ? (
                  <p className="text-4xs text-slate-500 italic">No companion dialogue lines attached to this node.</p>
                ) : (
                  <div className="space-y-2">
                    {activeStep.companions.map((comp, cIdx) => (
                      <div key={comp.id || cIdx} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2 bg-slate-950/80 rounded border border-slate-800">
                        <div className="md:col-span-2 flex flex-col gap-1">
                          <input
                            type="text"
                            value={comp.name}
                            onChange={e => {
                              const nextComp = [...(activeStep.companions || [])];
                              nextComp[cIdx].name = e.target.value;
                              handleUpdateStep(activeStepId, { companions: nextComp });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-2xs text-purple-200 font-bold"
                            placeholder="Speaker Name"
                          />
                          <select
                            value={comp.color || "cyan"}
                            onChange={e => {
                              const nextComp = [...(activeStep.companions || [])];
                              nextComp[cIdx].color = e.target.value;
                              handleUpdateStep(activeStepId, { companions: nextComp });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-4xs text-slate-300"
                          >
                            <option value="rose">Rose (Vice)</option>
                            <option value="amber">Amber (Tracker)</option>
                            <option value="cyan">Cyan (Cyra)</option>
                            <option value="purple">Purple (Jax)</option>
                            <option value="emerald">Emerald</option>
                          </select>
                        </div>

                        <div className="md:col-span-9">
                          <textarea
                            value={comp.text}
                            onChange={e => {
                              const nextComp = [...(activeStep.companions || [])];
                              nextComp[cIdx].text = e.target.value;
                              handleUpdateStep(activeStepId, { companions: nextComp });
                            }}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-2xs text-slate-200 outline-none resize-none"
                            placeholder="Companion dialogue text..."
                          />
                        </div>

                        <div className="md:col-span-1 flex items-center justify-center">
                          <button
                            onClick={() => {
                              const nextComp = (activeStep.companions || []).filter((_, idx) => idx !== cIdx);
                              handleUpdateStep(activeStepId, { companions: nextComp });
                            }}
                            className="p-1 rounded bg-rose-950/60 text-rose-400 hover:text-rose-200 cursor-pointer"
                            title="Remove companion line"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BRANCHING CHOICES & HARD STAT CHECKS */}
              <div className="flex flex-col gap-2 p-3 bg-slate-900/60 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="text-3xs font-black uppercase text-cyan-300 flex items-center gap-1">
                    <ArrowRight size={12} className="text-cyan-400" /> Player Operational Choices & Stat Check Gates
                  </span>
                  <button
                    onClick={() => {
                      const newChoice: POISceneChoice = {
                        id: `opt_${Date.now().toString().slice(-4)}`,
                        label: "👉 [Take Action]",
                        targetStepId: "__EXIT__",
                        checkType: "none",
                        variant: "cyan"
                      };
                      handleUpdateStep(activeStepId, {
                        choices: [...(activeStep.choices || []), newChoice]
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded text-4xs font-bold uppercase cursor-pointer"
                  >
                    <Plus size={10} /> Add Branch Choice
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(activeStep.choices || []).map((choice, chIdx) => (
                    <div key={choice.id || chIdx} className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 flex flex-col gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        {/* Choice Label */}
                        <div className="md:col-span-6 flex flex-col gap-1">
                          <label className="text-4xs text-slate-400 uppercase font-bold">Button Label</label>
                          <input
                            type="text"
                            value={choice.label}
                            onChange={e => {
                              const nextChoices = [...(activeStep.choices || [])];
                              nextChoices[chIdx].label = e.target.value;
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-2xs text-slate-100 font-bold"
                            placeholder="e.g. 💻 [Intelligence 12] Slice Security Terminal"
                          />
                        </div>

                        {/* Next Target Step */}
                        <div className="md:col-span-3 flex flex-col gap-1">
                          <label className="text-4xs text-purple-300 uppercase font-bold">Target Next Step / Exit</label>
                          <select
                            value={choice.targetStepId || "__EXIT__"}
                            onChange={e => {
                              const nextChoices = [...(activeStep.choices || [])];
                              nextChoices[chIdx].targetStepId = e.target.value;
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="bg-slate-900 border border-purple-500/30 rounded px-2 py-1 text-2xs text-purple-200 font-mono outline-none cursor-pointer"
                          >
                            <option value="__EXIT__">🚪 [Exit Scene / Return to POI]</option>
                            <option value="__COMBAT__">⚔️ [Trigger Combat Encounter]</option>
                            {Object.keys(activeScene.steps || {}).map(sKey => (
                              <option key={sKey} value={sKey}>
                                🎬 Move to: {sKey}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Button Variant */}
                        <div className="md:col-span-2 flex flex-col gap-1">
                          <label className="text-4xs text-slate-400 uppercase font-bold">Theme Style</label>
                          <select
                            value={choice.variant || "cyan"}
                            onChange={e => {
                              const nextChoices = [...(activeStep.choices || [])];
                              nextChoices[chIdx].variant = e.target.value as any;
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-2xs text-slate-300 cursor-pointer"
                          >
                            <option value="cyan">Cyan (Tech / Scan)</option>
                            <option value="amber">Amber (Pragmatic / Pay)</option>
                            <option value="rose">Rose (Force / Aggressive)</option>
                            <option value="purple">Purple (Mindmancer / Psionic)</option>
                            <option value="emerald">Emerald (Bypass / Success)</option>
                          </select>
                        </div>

                        <div className="md:col-span-1 flex items-end justify-end pb-1">
                          <button
                            onClick={() => {
                              const nextChoices = (activeStep.choices || []).filter((_, idx) => idx !== chIdx);
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="p-1.5 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 cursor-pointer"
                            title="Delete choice"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Stat Check & Rewards Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900/70 p-2 rounded border border-slate-800/80">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-4xs text-amber-300 font-bold uppercase">Stat Check Gate</label>
                          <select
                            value={choice.checkType || "none"}
                            onChange={e => {
                              const nextChoices = [...(activeStep.choices || [])];
                              nextChoices[chIdx].checkType = e.target.value as any;
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-amber-200"
                          >
                            <option value="none">No Check (Unconditional)</option>
                            <option value="int">Intelligence Check</option>
                            <option value="str">Strength Check</option>
                            <option value="dex">Dexterity Check</option>
                            <option value="will">Willpower Check</option>
                            <option value="mindmancer">Mindmancer Perk Level</option>
                            <option value="credits">Credit Cost</option>
                            <option value="item">Required Item</option>
                          </select>
                        </div>

                        {choice.checkType && choice.checkType !== "none" && choice.checkType !== "item" && (
                          <div className="flex flex-col gap-0.5">
                            <label className="text-4xs text-amber-300 font-bold uppercase">DC Check Value / Cost</label>
                            <input
                              type="number"
                              value={choice.checkValue || 10}
                              onChange={e => {
                                const nextChoices = [...(activeStep.choices || [])];
                                nextChoices[chIdx].checkValue = Number(e.target.value);
                                handleUpdateStep(activeStepId, { choices: nextChoices });
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-amber-200 font-mono"
                            />
                          </div>
                        )}

                        {choice.checkType === "item" && (
                          <div className="flex flex-col gap-0.5">
                            <label className="text-4xs text-amber-300 font-bold uppercase">Required Item Name</label>
                            <input
                              type="text"
                              value={choice.requiredItem || ""}
                              onChange={e => {
                                const nextChoices = [...(activeStep.choices || [])];
                                nextChoices[chIdx].requiredItem = e.target.value;
                                handleUpdateStep(activeStepId, { choices: nextChoices });
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-amber-200"
                              placeholder="e.g. Encryption Keycard"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-0.5">
                          <label className="text-4xs text-emerald-400 font-bold uppercase">Reward Credits</label>
                          <input
                            type="number"
                            value={choice.grantsCredits || 0}
                            onChange={e => {
                              const nextChoices = [...(activeStep.choices || [])];
                              nextChoices[chIdx].grantsCredits = Number(e.target.value);
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-emerald-300 font-mono"
                            placeholder="0¤"
                          />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <label className="text-4xs text-purple-300 font-bold uppercase">Reward XP</label>
                          <input
                            type="number"
                            value={choice.grantsXP || 0}
                            onChange={e => {
                              const nextChoices = [...(activeStep.choices || [])];
                              nextChoices[chIdx].grantsXP = Number(e.target.value);
                              handleUpdateStep(activeStepId, { choices: nextChoices });
                            }}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-3xs text-purple-200 font-mono"
                            placeholder="0 XP"
                          />
                        </div>
                      </div>

                      {/* Outcome Text */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-4xs text-slate-400 font-bold uppercase">Choice Outcome Narrative (Logged upon selection)</label>
                        <input
                          type="text"
                          value={choice.outcomeNarrative || ""}
                          onChange={e => {
                            const nextChoices = [...(activeStep.choices || [])];
                            nextChoices[chIdx].outcomeNarrative = e.target.value;
                            handleUpdateStep(activeStepId, { choices: nextChoices });
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-3xs text-slate-300"
                          placeholder="e.g. You slice through the firewall with surgical precision, unlocking the vault."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP DELETE BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleDeleteStep(activeStepId)}
                  className="px-3 py-1 bg-rose-950/50 hover:bg-rose-900/80 border border-rose-500/30 text-rose-300 rounded text-3xs font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} /> Delete Step "{activeStepId}"
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 p-8 text-slate-400">
          <p>No scene selected. Click "+ New Scene" to create an interactive branching event.</p>
        </div>
      )}
    </div>
  );
};
