import React, { useState } from "react";
import { 
  Users, 
  UserCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  Heart, 
  ShieldAlert, 
  Lock, 
  Coins, 
  Check, 
  Image as ImageIcon, 
  Smile, 
  MessageSquare, 
  Briefcase, 
  Skull, 
  Flame, 
  Zap, 
  Eye, 
  UserPlus 
} from "lucide-react";
import { BaseNPC, CompanionState, GameState } from "../../types";
import { INITIAL_COMPANIONS } from "../../data";

export interface CustomDialogueChoiceOption {
  id: string;
  text: string;
  response: string;
  checkType?: "none" | "str" | "int" | "dex" | "will" | "mindmancer" | "credits" | "item";
  checkValue?: number;
  itemRequired?: string;
  cost?: number;
  outcome?: "none" | "recruit_party" | "recruit_base" | "buy_slave" | "start_combat" | "give_credits" | "give_item";
  rewardCredits?: number;
  rewardItem?: string;
}

export interface CustomCharacter {
  id: string;
  name: string;
  characterType: "companion" | "hireable" | "slave" | "capturable" | "story_npc";
  role: string;
  avatar: string;
  portraitImage: string;
  bodyImage?: string;
  bio: string;
  greetingDialogue: string;
  choices: CustomDialogueChoiceOption[];
  
  // Financial / Hiring / Auction details
  hiringFee?: number;
  slaveAuctionPrice?: number;
  collarStatus?: "Active Shock Collar" | "Subjugated Neural Link" | "Unlocked / Free";

  // Base Management & Psychological Stats
  happiness: number;
  affection: "Hostile" | "Distant" | "Amiable" | "Warm" | "Devoted";
  affectionValue: number;
  willpower: number;
  corruption: number;
  discipline: number;
  defiance: number;
  fear: number;
  anger: number;
  respect: number;
  hygiene: "Dirty" | "Normal" | "Excellent";
  hunger: "Starving" | "Hungry" | "Satiated" | "Well-fed";
  assignedJob: string;
  startingEquipment?: string[];
}

interface NPCStudioProps {
  customNPCs: CustomCharacter[];
  setCustomNPCs: React.Dispatch<React.SetStateAction<CustomCharacter[]>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerToast: (msg: string) => void;
}

const PRESET_AVATARS = ["👩‍🎤", "🥷", "🔮", "🦾", "🔫", "🌸", "✨", "🧹", "🗡️", "🦹", "⛓️", "👑"];

const PRESET_PORTRAITS = [
  { name: "Vice (Leader)", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
  { name: "Cyber-Ninja Scythe", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400" },
  { name: "Coven Witch Vex", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
  { name: "Gladiator Mira", url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=400" },
  { name: "Rescued Subject Mia", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400" },
  { name: "Corporate Suit Aria", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
  { name: "Heavy Merc Brick", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
  { name: "Syndicate Enforcer", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }
];

const PRESET_BODY_SHOTS = [
  { name: "Tactical Leather Duster", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600" },
  { name: "High-Tech Cybernetic Armor", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600" },
  { name: "Captive / Slave in Chains", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600" },
  { name: "Cyberpunk Streetwear", url: "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?auto=format&fit=crop&q=80&w=600" }
];

const JOBS_LIST = [
  "Defensive Security Guard",
  "Base Supply Chef",
  "Ether Synthesizer",
  "Hacker Network Operator",
  "Dojo Training Coach",
  "Safehouse Maid & Tech Analyst",
  "Idle / Chilling"
];

export const NPCStudio: React.FC<NPCStudioProps> = ({
  customNPCs,
  setCustomNPCs,
  gameState,
  setGameState,
  triggerToast
}) => {
  const [selectedId, setSelectedId] = useState<string>(customNPCs[0]?.id || "new");
  const [activeSubTab, setActiveSubTab] = useState<"identity" | "psychology" | "dialogue" | "appearance">("identity");

  // Form State
  const [npcForm, setNpcForm] = useState<CustomCharacter>({
    id: `npc_${Date.now()}`,
    name: "Elena Rostova",
    characterType: "slave",
    role: "Former Arasaka Bio-Chemist",
    avatar: "⛓️",
    portraitImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
    bodyImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600",
    bio: "Captured during a corporate extraction raid in the Upper Terraces. Sold off to the Under-Alley Auction Block with a sealed neural limiter.",
    greetingDialogue: "P-please don't shock me again... I know how to synthesize pure combat stimulants and calibrate neural chips if you just take me away from this pen.",
    hiringFee: 0,
    slaveAuctionPrice: 220,
    collarStatus: "Active Shock Collar",
    happiness: 35,
    affection: "Distant",
    affectionValue: 30,
    willpower: 60,
    corruption: 10,
    discipline: 75,
    defiance: 40,
    fear: 65,
    anger: 20,
    respect: 45,
    hygiene: "Dirty",
    hunger: "Hungry",
    assignedJob: "Ether Synthesizer",
    choices: [
      {
        id: "c1",
        text: "[Buy Freedom] Pay 220¤ to Auctioneer and Unlock Collar",
        response: "Elena clutches her throat as the magnetic collar clicks open. Tears fill her augmented eyes: 'You... you bought my deed just to set me free? I'll follow you to your base. My chemistry expertise is yours.'",
        checkType: "credits",
        cost: 220,
        outcome: "buy_slave"
      },
      {
        id: "c2",
        text: "[Mindmancer Level 2] Rewrite Neural Collar Frequency to obey you",
        response: "Purple ether waves ripple across the slave collar. Elena's defiance fades into serene devotion: 'Master... the neural noise has ceased. I am aligned with your directives.'",
        checkType: "mindmancer",
        checkValue: 2,
        outcome: "recruit_base"
      },
      {
        id: "c3",
        text: "[Intimidate - STR 13] Threaten the Auction Guards and pry her cage open",
        response: "You crush the titanium cell bars with raw cyberware force. The auction guards scatter in panic as Elena slips out!",
        checkType: "str",
        checkValue: 13,
        outcome: "recruit_party"
      }
    ]
  });

  const handleSelectExisting = (npc: CustomCharacter) => {
    setSelectedId(npc.id);
    setNpcForm({ ...npc });
  };

  const handleCreateNew = (type: CustomCharacter["characterType"] = "companion") => {
    const newId = `npc_${Date.now()}`;
    const newNpc: CustomCharacter = {
      id: newId,
      name: type === "slave" ? "Captive Asset" : type === "hireable" ? "Freelance Merc" : "New Operative",
      characterType: type,
      role: type === "slave" ? "Auctioned Captive" : "Tactical Specialist",
      avatar: type === "slave" ? "⛓️" : "🥷",
      portraitImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      bodyImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
      bio: "An enigmatic figure operating in the rain-slicked alleys of Megacity-9.",
      greetingDialogue: "What do you need, runner? Make it fast before corporate drones trace our comms.",
      hiringFee: type === "hireable" ? 120 : 0,
      slaveAuctionPrice: type === "slave" ? 200 : 0,
      collarStatus: type === "slave" ? "Active Shock Collar" : "Unlocked / Free",
      happiness: 70,
      affection: "Amiable",
      affectionValue: 50,
      willpower: 50,
      corruption: 20,
      discipline: 60,
      defiance: 20,
      fear: 10,
      anger: 10,
      respect: 50,
      hygiene: "Normal",
      hunger: "Satiated",
      assignedJob: "Defensive Security Guard",
      choices: [
        {
          id: "c1",
          text: "[Recruit] Invite to join active squad",
          response: "Sounds like a profitable contract. I'm in.",
          outcome: "recruit_party"
        }
      ]
    };
    setSelectedId(newId);
    setNpcForm(newNpc);
  };

  const handleSaveNPC = () => {
    if (!npcForm.name.trim()) {
      triggerToast("ERROR: Character Name is required!");
      return;
    }

    setCustomNPCs(prev => {
      const idx = prev.findIndex(n => n.id === npcForm.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = npcForm;
        return next;
      }
      return [...prev, npcForm];
    });

    triggerToast(`CHARACTER SAVED: "${npcForm.name}" registered!`);
  };

  // Direct injection to live game state!
  const handleDeployToLiveGame = () => {
    // 1. Add as companion if applicable
    const companionObj: CompanionState = {
      name: npcForm.name,
      fee: npcForm.hiringFee || 0,
      status: "in_party",
      role: npcForm.role,
      bio: npcForm.bio,
      avatar: npcForm.avatar,
      image: npcForm.portraitImage,
      equipment: {
        meleeWeapon: null,
        rangedWeapon: null,
        armor: null,
        headpiece: null,
        trinket: null
      },
      inventory: []
    };

    // 2. Add as Base NPC
    const baseNpcObj: BaseNPC = {
      id: npcForm.id,
      name: npcForm.name,
      role: npcForm.role,
      avatar: npcForm.avatar,
      image: npcForm.portraitImage,
      description: npcForm.bio,
      dialogue: npcForm.greetingDialogue,
      reaction: null,
      happiness: npcForm.happiness,
      affection: npcForm.affection,
      affectionValue: npcForm.affectionValue,
      willpower: npcForm.willpower,
      corruption: npcForm.corruption,
      hygiene: npcForm.hygiene,
      discipline: npcForm.discipline,
      hunger: npcForm.hunger,
      respect: npcForm.respect,
      withdrawRisk: "None",
      anger: npcForm.anger,
      defiance: npcForm.defiance,
      fear: npcForm.fear,
      inventory: ["Synthesized Bio-Stim", "Encrypted Datapad"],
      currentJob: npcForm.assignedJob
    };

    setGameState(prev => {
      const existingComp = prev.companions.some(c => c.name === npcForm.name);
      const existingBase = prev.baseNPCs?.some(b => b.id === npcForm.id || b.name === npcForm.name);

      return {
        ...prev,
        party: prev.party.includes(npcForm.name) ? prev.party : [...prev.party, npcForm.name],
        companions: existingComp 
          ? prev.companions.map(c => c.name === npcForm.name ? companionObj : c)
          : [...prev.companions, companionObj],
        baseNPCs: existingBase
          ? (prev.baseNPCs || []).map(b => (b.id === npcForm.id || b.name === npcForm.name) ? baseNpcObj : b)
          : [...(prev.baseNPCs || []), baseNpcObj]
      };
    });

    triggerToast(`LIVE INJECTION: "${npcForm.name}" added to Party and Safehouse Base!`);
  };

  const handleAddChoice = () => {
    const newChoice: CustomDialogueChoiceOption = {
      id: `c_${Date.now()}`,
      text: "[New Inquire Option] Ask about local contacts",
      response: "I know a few brokers down at Conduit 09.",
      checkType: "none",
      outcome: "none"
    };
    setNpcForm({
      ...npcForm,
      choices: [...(npcForm.choices || []), newChoice]
    });
  };

  const handleRemoveChoice = (id: string) => {
    setNpcForm({
      ...npcForm,
      choices: (npcForm.choices || []).filter(c => c.id !== id)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden text-xs font-mono">
      
      {/* LEFT COLUMN: NPC List & Creation Filters */}
      <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden border-r border-cyan-500/20 pr-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Users size={16} />
            <span>Character Roster</span>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleCreateNew("companion")}
              className="bg-cyan-600 hover:bg-cyan-500 text-black px-2 py-1 rounded font-bold uppercase cursor-pointer text-3xs"
              title="Add Recruitable Companion"
            >
              + Squad
            </button>
            <button
              onClick={() => handleCreateNew("slave")}
              className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded font-bold uppercase cursor-pointer text-3xs"
              title="Add Auction Captive / Slave"
            >
              + Slave/Captive
            </button>
          </div>
        </div>

        <p className="text-3xs text-slate-400 font-sans">
          Create & customize characters: Squad Companions, Hireables, Captives in Auction Pens, and Lore NPCs with stat checks.
        </p>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {customNPCs.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-cyan-500/30 text-center text-slate-500 text-2xs">
              No custom characters created yet. Use the top buttons to author companions, auction captives, or mercs!
            </div>
          ) : (
            customNPCs.map(npc => {
              const isSelected = selectedId === npc.id;
              return (
                <div
                  key={npc.id}
                  onClick={() => handleSelectExisting(npc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected 
                      ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]" 
                      : "bg-slate-950/70 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/60"
                  }`}
                >
                  <img
                    src={npc.portraitImage}
                    alt={npc.name}
                    className="w-10 h-10 object-cover rounded-md border border-cyan-500/30 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-200 truncate">{npc.name}</span>
                      <span className="text-sm">{npc.avatar}</span>
                    </div>
                    <div className="flex items-center justify-between text-3xs text-slate-400">
                      <span className="truncate">{npc.role}</span>
                      <span className={`px-1 rounded uppercase font-bold text-3xs ${
                        npc.characterType === "slave" ? "bg-purple-950 text-purple-300 border border-purple-500/30" :
                        npc.characterType === "companion" ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30" :
                        npc.characterType === "hireable" ? "bg-amber-950 text-amber-300 border border-amber-500/30" :
                        "bg-slate-900 text-slate-400"
                      }`}>
                        {npc.characterType}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Full Character Studio Editor */}
      <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{npcForm.avatar}</span>
            <div>
              <span className="font-bold text-sm text-white uppercase tracking-wider">{npcForm.name || "Untitled Character"}</span>
              <span className="text-3xs text-cyan-400 block uppercase font-mono">{npcForm.role} • {npcForm.characterType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeployToLiveGame}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold uppercase cursor-pointer text-2xs transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            >
              <UserPlus size={13} /> Deploy to Party & Base
            </button>
            <button
              onClick={handleSaveNPC}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1.5 rounded font-black uppercase cursor-pointer text-2xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              <Check size={13} /> Save Character
            </button>
            {customNPCs.some(n => n.id === npcForm.id) && (
              <button
                onClick={() => {
                  setCustomNPCs(prev => prev.filter(n => n.id !== npcForm.id));
                  triggerToast("Character removed.");
                  handleCreateNew();
                }}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 p-1.5 rounded cursor-pointer"
                title="Delete Character"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex gap-1 border-b border-white/10 pb-2">
          {[
            { id: "identity", label: "Identity & Role", icon: Users },
            { id: "appearance", label: "Portraits & Body Art", icon: ImageIcon },
            { id: "psychology", label: "Psychology & Base Stats", icon: Heart },
            { id: "dialogue", label: "Dialogue & Stat-Checks", icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold uppercase text-2xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: IDENTITY & ROLE */}
        {activeSubTab === "identity" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-3xs text-cyan-400 uppercase font-bold">Character Name</label>
                <input
                  type="text"
                  value={npcForm.name}
                  onChange={e => setNpcForm({ ...npcForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-cyan-400 uppercase font-bold">Archetype / Category</label>
                <select
                  value={npcForm.characterType}
                  onChange={e => setNpcForm({ ...npcForm, characterType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none uppercase font-bold"
                >
                  <option value="companion">🛡️ Recruitable Squad Companion</option>
                  <option value="slave">⛓️ Buyable Slave / Captive in Auction</option>
                  <option value="hireable">🪙 Hireable Freelance Mercenary</option>
                  <option value="capturable">💀 Capturable Combat Hostile</option>
                  <option value="story_npc">💬 Standard Lore / Story NPC</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-3xs text-cyan-400 uppercase font-bold">Role / Title</label>
                <input
                  type="text"
                  value={npcForm.role}
                  onChange={e => setNpcForm({ ...npcForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none"
                  placeholder="e.g. Bio-Chemist / Cyber-Infiltrator"
                />
              </div>
            </div>

            {/* Special Type Details (Auction Price, Collar, Fees) */}
            {npcForm.characterType === "slave" && (
              <div className="border border-purple-500/40 bg-purple-950/20 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold uppercase text-2xs">
                  <Lock size={14} />
                  <span>Auction Block & Restraint Parameters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-3xs text-purple-300 uppercase font-bold">Auction Price (Credits ¤)</label>
                    <input
                      type="number"
                      value={npcForm.slaveAuctionPrice || 200}
                      onChange={e => setNpcForm({ ...npcForm, slaveAuctionPrice: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-purple-500/30 rounded p-2 text-amber-300 text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs text-purple-300 uppercase font-bold">Collar & Restraint Mechanism</label>
                    <select
                      value={npcForm.collarStatus || "Active Shock Collar"}
                      onChange={e => setNpcForm({ ...npcForm, collarStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-purple-500/30 rounded p-2 text-purple-200 text-xs outline-none"
                    >
                      <option value="Active Shock Collar">⚡ Active Shock Collar (Syndicate Enforced)</option>
                      <option value="Subjugated Neural Link">🔮 Subjugated Neural Link (Mindmancer Controlled)</option>
                      <option value="Unlocked / Free">🔓 Unlocked / Liberated</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {npcForm.characterType === "hireable" && (
              <div className="border border-amber-500/40 bg-amber-950/20 rounded-lg p-3 space-y-2">
                <label className="text-3xs text-amber-300 uppercase font-bold">Mercenary Hiring Fee (Credits ¤)</label>
                <input
                  type="number"
                  value={npcForm.hiringFee || 100}
                  onChange={e => setNpcForm({ ...npcForm, hiringFee: parseInt(e.target.value) || 0 })}
                  className="w-full max-w-xs bg-slate-950 border border-amber-500/30 rounded p-2 text-amber-300 text-xs font-bold outline-none"
                />
              </div>
            )}

            {/* Bio */}
            <div className="space-y-1">
              <label className="text-3xs text-cyan-400 uppercase font-bold">Backstory & Bio</label>
              <textarea
                rows={3}
                value={npcForm.bio}
                onChange={e => setNpcForm({ ...npcForm, bio: e.target.value })}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-slate-300 text-2xs outline-none font-sans"
                placeholder="Describe their past, syndicates, and combat capabilities..."
              />
            </div>

            {/* Emoji Avatar Selector */}
            <div className="space-y-1">
              <label className="text-3xs text-cyan-400 uppercase font-bold">Avatar Icon</label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_AVATARS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => setNpcForm({ ...npcForm, avatar: emoji })}
                    className={`w-9 h-9 text-lg rounded border flex items-center justify-center cursor-pointer transition-all ${
                      npcForm.avatar === emoji
                        ? "bg-cyan-500 text-black border-cyan-300 scale-110 shadow"
                        : "bg-slate-900 border-white/10 hover:bg-slate-800"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTRAITS & BODY ART */}
        {activeSubTab === "appearance" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Portrait */}
              <div className="border border-cyan-500/30 bg-slate-950/60 rounded-lg p-3 space-y-3">
                <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider block">Headshot Portrait</span>
                <div className="flex gap-3 items-center">
                  <img
                    src={npcForm.portraitImage}
                    alt="portrait"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-cyan-500 shadow-md"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={npcForm.portraitImage}
                      onChange={e => setNpcForm({ ...npcForm, portraitImage: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-cyan-200 text-2xs outline-none"
                      placeholder="https://..."
                    />
                    <p className="text-3xs text-slate-500">Square ratio recommended (e.g. Unsplash portrait URL)</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-3xs text-slate-400 uppercase font-bold block mb-1.5">Preset Headshots:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_PORTRAITS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNpcForm({ ...npcForm, portraitImage: p.url })}
                        className="text-3xs bg-slate-900 hover:bg-cyan-950 border border-white/10 hover:border-cyan-400 text-slate-300 p-1.5 rounded truncate text-left cursor-pointer"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Body Picture */}
              <div className="border border-purple-500/30 bg-slate-950/60 rounded-lg p-3 space-y-3">
                <span className="text-3xs font-bold text-purple-400 uppercase tracking-wider block">Full Body Scenic Picture</span>
                <div className="flex gap-3 items-center">
                  {npcForm.bodyImage ? (
                    <img
                      src={npcForm.bodyImage}
                      alt="body"
                      className="w-20 h-28 object-cover rounded-lg border-2 border-purple-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-28 rounded-lg border border-dashed border-purple-500/40 flex items-center justify-center text-3xs text-slate-500">
                      No Body Art
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={npcForm.bodyImage || ""}
                      onChange={e => setNpcForm({ ...npcForm, bodyImage: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-purple-200 text-2xs outline-none"
                      placeholder="https://..."
                    />
                    <p className="text-3xs text-slate-500">Vertical ratio for dialogue overlays and inspections</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-3xs text-slate-400 uppercase font-bold block mb-1.5">Preset Full-Body Art:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_BODY_SHOTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNpcForm({ ...npcForm, bodyImage: p.url })}
                        className="text-3xs bg-slate-900 hover:bg-purple-950 border border-white/10 hover:border-purple-400 text-slate-300 p-1.5 rounded truncate text-left cursor-pointer"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PSYCHOLOGY & BASE STATS */}
        {activeSubTab === "psychology" && (
          <div className="space-y-4">
            
            {/* Safehouse Job Assignment */}
            <div className="space-y-1 border border-cyan-500/30 bg-slate-950/60 p-3 rounded-lg">
              <label className="text-3xs text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Briefcase size={12} /> Assigned Safehouse Base Job
              </label>
              <select
                value={npcForm.assignedJob}
                onChange={e => setNpcForm({ ...npcForm, assignedJob: e.target.value })}
                className="w-full bg-slate-900 border border-cyan-500/30 rounded p-2 text-cyan-200 text-xs outline-none font-bold"
              >
                {JOBS_LIST.map((job, idx) => (
                  <option key={idx} value={job}>{job}</option>
                ))}
              </select>
            </div>

            {/* Mind & Obedience Metrics */}
            <div className="border border-white/10 bg-slate-950/60 p-3 rounded-lg space-y-3">
              <span className="text-3xs font-bold text-white uppercase tracking-wider block">Psychological & Obedience Matrix</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-3xs text-rose-400 uppercase font-bold">Affection Tier</label>
                  <select
                    value={npcForm.affection}
                    onChange={e => setNpcForm({ ...npcForm, affection: e.target.value as any })}
                    className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-rose-300 text-xs outline-none"
                  >
                    <option value="Hostile">Hostile</option>
                    <option value="Distant">Distant</option>
                    <option value="Amiable">Amiable</option>
                    <option value="Warm">Warm</option>
                    <option value="Devoted">Devoted</option>
                  </select>
                </div>

                <div>
                  <label className="text-3xs text-emerald-400 uppercase font-bold">Happiness ({npcForm.happiness}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={npcForm.happiness}
                    onChange={e => setNpcForm({ ...npcForm, happiness: parseInt(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-3xs text-purple-400 uppercase font-bold">Willpower ({npcForm.willpower}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={npcForm.willpower}
                    onChange={e => setNpcForm({ ...npcForm, willpower: parseInt(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-3xs text-amber-400 uppercase font-bold">Defiance ({npcForm.defiance}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={npcForm.defiance}
                    onChange={e => setNpcForm({ ...npcForm, defiance: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-3xs text-blue-400 uppercase font-bold">Discipline ({npcForm.discipline}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={npcForm.discipline}
                    onChange={e => setNpcForm({ ...npcForm, discipline: parseInt(e.target.value) })}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-3xs text-red-400 uppercase font-bold">Fear ({npcForm.fear}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={npcForm.fear}
                    onChange={e => setNpcForm({ ...npcForm, fear: parseInt(e.target.value) })}
                    className="w-full accent-red-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-3xs text-cyan-400 uppercase font-bold">Respect ({npcForm.respect}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={npcForm.respect}
                    onChange={e => setNpcForm({ ...npcForm, respect: parseInt(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-3xs text-yellow-400 uppercase font-bold">Hunger State</label>
                  <select
                    value={npcForm.hunger}
                    onChange={e => setNpcForm({ ...npcForm, hunger: e.target.value as any })}
                    className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-yellow-300 text-xs outline-none"
                  >
                    <option value="Starving">Starving</option>
                    <option value="Hungry">Hungry</option>
                    <option value="Satiated">Satiated</option>
                    <option value="Well-fed">Well-fed</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DIALOGUE & STAT CHECKS */}
        {activeSubTab === "dialogue" && (
          <div className="space-y-4">
            {/* Opening Line */}
            <div className="space-y-1">
              <label className="text-3xs text-cyan-400 uppercase font-bold">Opening Greeting / Dialogue Node</label>
              <textarea
                rows={2}
                value={npcForm.greetingDialogue}
                onChange={e => setNpcForm({ ...npcForm, greetingDialogue: e.target.value })}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded p-2 text-slate-200 text-xs font-sans outline-none"
                placeholder="What this character says when approached..."
              />
            </div>

            {/* Choices list with stat checks */}
            <div className="border border-white/10 bg-slate-950/60 p-3 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold text-cyan-400 uppercase tracking-wider">
                  Player Dialogue Options & Stat-Check Prerequisites
                </span>
                <button
                  onClick={handleAddChoice}
                  className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-black px-2 py-1 rounded font-bold uppercase text-3xs cursor-pointer"
                >
                  <Plus size={11} /> Add Choice Node
                </button>
              </div>

              <div className="space-y-3">
                {(npcForm.choices || []).map((choice, idx) => (
                  <div key={choice.id} className="border border-cyan-500/20 bg-slate-900/80 p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-bold text-cyan-300 uppercase">Option #{idx + 1}</span>
                      <button
                        onClick={() => handleRemoveChoice(choice.id)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-3xs text-slate-400 uppercase font-bold">Player Choice Text (Include brackets for stat checks)</label>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={e => {
                            const next = [...npcForm.choices];
                            next[idx].text = e.target.value;
                            setNpcForm({ ...npcForm, choices: next });
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-slate-200 text-2xs outline-none"
                          placeholder="e.g. [Intelligence 14] Hack her security collar..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-3xs text-slate-400 uppercase font-bold">Stat Check Prerequisite</label>
                        <select
                          value={choice.checkType || "none"}
                          onChange={e => {
                            const next = [...npcForm.choices];
                            next[idx].checkType = e.target.value as any;
                            setNpcForm({ ...npcForm, choices: next });
                          }}
                          className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-cyan-300 text-2xs outline-none uppercase"
                        >
                          <option value="none">None (Free choice)</option>
                          <option value="int">🧠 [Intelligence Check]</option>
                          <option value="str">💪 [Strength Check]</option>
                          <option value="dex">⚡ [Dexterity Check]</option>
                          <option value="mindmancer">🔮 [Mindmancer Skill Check]</option>
                          <option value="credits">🪙 [Credit Payment]</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-3xs text-slate-400 uppercase font-bold">NPC Reply / Consequence Description</label>
                      <textarea
                        rows={2}
                        value={choice.response}
                        onChange={e => {
                          const next = [...npcForm.choices];
                          next[idx].response = e.target.value;
                          setNpcForm({ ...npcForm, choices: next });
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-slate-300 text-2xs font-sans outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-white/5">
                      <div>
                        <label className="text-3xs text-purple-400 uppercase font-bold">Action Outcome</label>
                        <select
                          value={choice.outcome || "none"}
                          onChange={e => {
                            const next = [...npcForm.choices];
                            next[idx].outcome = e.target.value as any;
                            setNpcForm({ ...npcForm, choices: next });
                          }}
                          className="w-full bg-slate-950 border border-purple-500/30 rounded p-1.5 text-purple-200 text-2xs outline-none"
                        >
                          <option value="none">None (Standard Dialogue)</option>
                          <option value="recruit_party">🤝 Recruit to Squad</option>
                          <option value="recruit_base">🏡 Send to Safehouse Base</option>
                          <option value="buy_slave">⛓️ Buy Freedom / Purchase Slave</option>
                          <option value="start_combat">⚔️ Trigger Tactical Combat</option>
                          <option value="give_credits">🪙 Grant Credits Reward</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
