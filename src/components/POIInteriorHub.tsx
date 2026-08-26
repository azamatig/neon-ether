import React, { useState } from "react";
import {
  Store,
  HeartPulse,
  Bed,
  Users,
  Scroll,
  Radio,
  Swords,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Tag,
  Skull,
  Eye,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { activateQuest } from "../questEngine";
import {
  GameState,
  CustomPOIData,
  POIShopService,
  POIClinicService,
  POIRestService,
  POIAuctionService,
  POIContractsService,
  POIRumorsService,
  POINpcsService,
  CustomPOIAction,
  POIAuctionLot,
  POIRumorItem
} from "../types";
import { MapPOI, ITEM_METADATA } from "../data";

interface POIInteriorHubProps {
  poi: CustomPOIData | (MapPOI & Partial<CustomPOIData>);
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  triggerToast: (msg: string) => void;
  onLaunchQuestScene?: (sceneId: string, stepId?: string) => void;
  onStartDialogue?: (npcId: string, nodeId?: string) => void;
  onExecuteAction?: (actionName: string) => void;
  onReturnToMap?: () => void;
  completedActions?: string[];
  scannerMode?: boolean;
}

export const POIInteriorHub: React.FC<POIInteriorHubProps> = ({
  poi,
  gameState,
  setGameState,
  setLogs,
  triggerToast,
  onLaunchQuestScene,
  onStartDialogue,
  onExecuteAction,
  onReturnToMap,
  completedActions = [],
  scannerMode = false
}) => {
  // Extract services or provide intelligent defaults based on POI category
  const services = poi.services || {};

  // Local helper to compute cost based on ITEM_METADATA or defaults
  const getItemCostLocal = (itemName: string, details: any) => {
    if (itemName.includes("Mantis")) return 120;
    if (itemName.includes("Ether-deck")) return 140;
    if (itemName.includes("Heavy Plasma")) return 175;
    if (itemName.includes("Exo-Plated")) return 130;

    const itemRarity = details?.rarity || "common";
    switch (itemRarity) {
      case "common": return 50;
      case "deluxe": return 90;
      case "epic": return 130;
      case "legendary": return 190;
      default: return 60;
    }
  };
  
  // Service tabs are authored explicitly in POI Studio. Names, categories,
  // populated lists, and legacy POI types must never turn tabs on implicitly.
  const hasShop = services.shop?.enabled === true;
  const hasClinic = services.clinic?.enabled === true;
  const hasRest = services.rest?.enabled === true;
  const hasAuction = services.auction?.enabled === true;
  const hasContracts = services.contracts?.enabled === true;
  const hasRumors = services.rumors?.enabled === true;
  const hasNpcs = services.npcs?.enabled === true;
  const hasServiceTabs = hasShop || hasClinic || hasRest || hasAuction || hasContracts || hasRumors || hasNpcs;
  
  const [activeTab, setActiveTab] = useState<"overview" | "shop" | "clinic" | "rest" | "auction" | "contracts" | "rumors" | "npcs">("overview");
  const [actionResult, setActionResult] = useState<{ title: string; text: string; success: boolean } | null>(null);

  // Log generator helper
  const addSystemLog = (text: string, type: "narration" | "action" | "combat" | "system" = "system") => {
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text,
        type,
        district: poi.district,
        poi: poi.name
      }
    ]);
  };

  const executeLightweightAction = (action: CustomPOIAction) => {
    const checkType = action.checkType || "none";
    const target = action.checkValue || 10;
    let total = target;
    let success = true;
    if (["int", "str", "dex", "will"].includes(checkType)) {
      const stat = gameState.attributes?.[checkType as "int" | "str" | "dex" | "will"] || 10;
      total = Math.floor(Math.random() * 20) + 1 + stat;
      success = total >= target;
    } else if (checkType === "credits") {
      total = gameState.credits;
      success = total >= target;
    } else if (checkType === "mana") {
      total = gameState.mana;
      success = total >= target;
    } else if (checkType === "item") {
      success = gameState.inventory.includes(action.requiredItem || "");
      total = success ? 1 : 0;
    }

    setGameState(prev => {
      const next = { ...prev, inventory: [...prev.inventory], completedPOIActions: [...(prev.completedPOIActions || [])] };
      if (success) {
        if (checkType === "credits") next.credits -= target;
        if (checkType === "mana") next.mana -= target;
        if (checkType === "item" && action.consumeItem) {
          const index = next.inventory.indexOf(action.requiredItem || "");
          if (index >= 0) next.inventory.splice(index, 1);
        }
        next.credits += action.rewardCredits || 0;
        next.experience += action.rewardXP || 0;
        if (action.rewardItem) next.inventory.push(action.rewardItem);
        if (action.completionAction) next.completedPOIActions = Array.from(new Set([...next.completedPOIActions, action.completionAction]));
        if ((action.repeatMode || "once") === "once") next.completedPOIActions = Array.from(new Set([...next.completedPOIActions, `${poi.id}:action:${action.id}`]));
      } else {
        next.hp = Math.max(1, next.hp - (action.failureHpDamage || 0));
        next.mana = Math.max(0, next.mana - (action.failureManaDamage || 0));
      }
      return next;
    });

    const rollSuffix = checkType !== "none" ? ` (${total} vs ${target})` : "";
    const title = success ? action.successTitle || "ACTION SUCCESS" : action.failureTitle || "ACTION FAILED";
    const text = success ? action.successText || action.desc : action.failureText || `The attempt failed${rollSuffix}.`;
    setActionResult({ title, text, success });
    addSystemLog(`${success ? "✅" : "❌"} ${action.label}: ${text}${rollSuffix}`, success ? "action" : "system");
    triggerToast(`${title}${rollSuffix}`);
  };

  // ----------------------------------------------------
  // SHOP / MERCHANT LOGIC
  // ----------------------------------------------------
  const shopData: POIShopService = services.shop || {
    enabled: hasShop,
    merchantName: poi.name.includes("Black Market") ? "Fixer Corvus" : "Local Merchant",
    merchantTitle: "Arms & Smuggled Hardware Dealer",
    greeting: "Got clean credits? Look around, but don't touch what you can't afford.",
    priceMultiplier: 1.0,
    allowSell: true,
    items: ["Health Stimpack", "Cyber-Ammo Pack", "Energy Cell", "Tactical Cyber-SMG", "Nano Med-Stim"]
  };

  const shopItems = shopData.items || ["Health Stimpack", "Cyber-Ammo Pack", "Energy Cell"];

  const handleBuyItem = (itemName: string) => {
    const meta = ITEM_METADATA[itemName];
    const baseCost = getItemCostLocal(itemName, meta);
    const price = Math.round(baseCost * (shopData.priceMultiplier || 1.0));

    if (gameState.credits < price) {
      triggerToast(`⚠️ INSUFFICIENT CREDITS: Need ${price}¤ (You have ${gameState.credits}¤)`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      credits: prev.credits - price,
      inventory: [...prev.inventory, itemName]
    }));

    addSystemLog(`🛒 PURCHASED: [${itemName}] for ${price}¤ from ${shopData.merchantName || "the merchant"}.`);
    triggerToast(`Purchased ${itemName} (-${price}¤)`);
  };

  const handleSellItem = (itemName: string, idx: number) => {
    const meta = ITEM_METADATA[itemName];
    const baseCost = getItemCostLocal(itemName, meta);
    const sellPrice = Math.max(5, Math.round(baseCost * 0.5));

    setGameState(prev => {
      const nextInv = [...prev.inventory];
      nextInv.splice(idx, 1);
      return {
        ...prev,
        credits: prev.credits + sellPrice,
        inventory: nextInv
      };
    });

    addSystemLog(`💰 SOLD: [${itemName}] for +${sellPrice}¤.`);
    triggerToast(`Sold ${itemName} (+${sellPrice}¤)`);
  };

  // ----------------------------------------------------
  // CLINIC / MEDICAL LOGIC
  // ----------------------------------------------------
  const clinicData: POIClinicService = services.clinic || {
    enabled: hasClinic,
    doctorName: "Dr. Valerie Cross",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813629-43c24296541f?auto=format&fit=crop&q=80&w=200",
    healHpCost: 35,
    restoreManaCost: 40,
    cureDebuffsCost: 50,
    surgeryAvailable: true
  };

  const handleHealHP = () => {
    const cost = clinicData.healHpCost || 35;
    if (gameState.hp >= gameState.maxHp) {
      triggerToast("Systems already operating at 100% Integrity.");
      return;
    }
    if (gameState.credits < cost) {
      triggerToast(`⚠️ INSUFFICIENT CREDITS: Requires ${cost}¤`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      hp: prev.maxHp,
      credits: prev.credits - cost
    }));

    addSystemLog(`🏥 MEDICAL RESTORATION: ${clinicData.doctorName || "The Cyberdoc"} injected cellular nanites, restoring HP to full (${gameState.maxHp}/${gameState.maxHp}). Paid ${cost}¤.`);
    triggerToast(`HP Fully Restored! (-${cost}¤)`);
  };

  const handleRestoreMana = () => {
    const cost = clinicData.restoreManaCost || 40;
    if (gameState.mana >= gameState.maxMana) {
      triggerToast("Neural Ether reservoir is already at maximum capacity.");
      return;
    }
    if (gameState.credits < cost) {
      triggerToast(`⚠️ INSUFFICIENT CREDITS: Requires ${cost}¤`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      mana: prev.maxMana,
      credits: prev.credits - cost
    }));

    addSystemLog(`⚡ NEURAL RECHARGE: Siphoned high-grade coolant and bio-ether conduit. Restored Ether/Mana to maximum (${gameState.maxMana}/${gameState.maxMana}). Paid ${cost}¤.`);
    triggerToast(`Ether/Mana Fully Recharged! (-${cost}¤)`);
  };

  // ----------------------------------------------------
  // REST & SAFEHOUSE LOGIC
  // ----------------------------------------------------
  const restData: POIRestService = services.rest || {
    enabled: hasRest,
    innkeeperName: "Quartermaster Vane",
    rentRoomCost: 25,
    staminaRestore: 60,
    hpRestore: 30,
    advanceHours: 6,
    flavorText: "A reinforced soundproof pod with biometric seals and clean oxygen scrubbers."
  };

  const handleRentRoomAndRest = () => {
    const cost = restData.rentRoomCost || 25;
    if (gameState.credits < cost && cost > 0) {
      triggerToast(`⚠️ INSUFFICIENT CREDITS: Room rental requires ${cost}¤`);
      return;
    }

    setGameState(prev => {
      const nextTime = prev.timeOfDay === "Morning" ? "Afternoon" : prev.timeOfDay === "Afternoon" ? "Night" : "Morning";
      const nextDay = prev.timeOfDay === "Night" ? prev.day + 1 : prev.day;
      const nextStamina = Math.min(prev.maxStamina || 100, prev.stamina + (restData.staminaRestore || 60));
      const nextHp = Math.min(prev.maxHp, prev.hp + (restData.hpRestore || 30));

      return {
        ...prev,
        credits: Math.max(0, prev.credits - cost),
        stamina: nextStamina,
        hp: nextHp,
        timeOfDay: nextTime,
        day: nextDay
      };
    });

    addSystemLog(`🏨 REST COMPLETED: Slept in secure quarters. Restored +${restData.staminaRestore || 60} Stamina, +${restData.hpRestore || 30} HP. Time shifted to ${gameState.timeOfDay === "Morning" ? "Afternoon" : gameState.timeOfDay === "Afternoon" ? "Night" : "Morning"} (Day ${gameState.timeOfDay === "Night" ? gameState.day + 1 : gameState.day}). Paid ${cost}¤.`);
    triggerToast(`Rested and Recovered! (+${restData.staminaRestore || 60} Stamina)`);
  };

  // ----------------------------------------------------
  // AUCTION & SLAVE / MERC RECRUITS LOGIC
  // ----------------------------------------------------
  const defaultAuctionLots: POIAuctionLot[] = [
    {
      id: "lot_blade_slave",
      name: "Talia - Resynced Syndicate Infiltrator (Slave / Contract)",
      type: "slave",
      price: 350,
      desc: "Captured during an Ares Biotech sweep. Bio-restraints active. Exceptional dexterity and covert lockpicking.",
      stats: "DEX: 15, Net-Slicing: Level 2, Stealth: High",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      companionIdToRecruit: "talia_infiltrator"
    },
    {
      id: "lot_heavy_merc",
      name: "Garrison 'Iron' Vance (Heavy Mercenary)",
      type: "mercenary",
      price: 280,
      desc: "Ex-Corporate shock trooper with reinforced titanium plating and heavy riot shotgun mastery.",
      stats: "STR: 16, Heavy Chrome: Level 3, HP: 140",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      companionIdToRecruit: "garrison_heavy"
    },
    {
      id: "lot_prototype_implant",
      name: "Experimental Mind-Weaver Synapse Chip",
      type: "cyberware",
      price: 450,
      desc: "Black market neural amplifier capable of bending bio-electric signals and amplifying psychic spells.",
      stats: "Ether +25, Mindmancer Spell Potency +15%",
      avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200",
      itemIdToGrant: "Experimental Drone Chip"
    }
  ];

  const auctionData: POIAuctionService = services.auction || {
    enabled: hasAuction,
    auctioneerName: "Broker Malakor",
    description: "High-stakes underworld bidding pit. Slaves, bound operatives, and contraband prototypes sold to the highest bidder.",
    lots: defaultAuctionLots
  };

  const [auctionLots, setAuctionLots] = useState<POIAuctionLot[]>(auctionData.lots || defaultAuctionLots);

  const handlePurchaseAuctionLot = (lot: POIAuctionLot) => {
    if (gameState.credits < lot.price) {
      triggerToast(`⚠️ INSUFFICIENT CREDITS: Auction lot requires ${lot.price}¤ (You have ${gameState.credits}¤)`);
      return;
    }

    setGameState(prev => {
      let nextState = { ...prev, credits: prev.credits - lot.price };
      if (lot.itemIdToGrant) {
        nextState.inventory = [...nextState.inventory, lot.itemIdToGrant];
      }
      if (lot.companionIdToRecruit && !nextState.party.includes(lot.name)) {
        nextState.party = [...nextState.party, lot.name];
      }
      return nextState;
    });

    setAuctionLots(prev => prev.map(l => l.id === lot.id ? { ...l, purchased: true } : l));
    addSystemLog(`⛓️ AUCTION WON: Purchased [${lot.name}] for ${lot.price}¤. ${lot.companionIdToRecruit ? "New companion added to your roster." : "Item transferred to inventory."}`);
    triggerToast(`Won Auction Lot: ${lot.name}! (-${lot.price}¤)`);
  };

  // ----------------------------------------------------
  // RUMORS & INFORMANT LOGIC
  // ----------------------------------------------------
  const defaultRumors: POIRumorItem[] = [
    {
      id: "rumor_1",
      title: "The Sludge Conduit Altar Anomaly",
      text: "Scavengers claim the ancient technomantic altar in Conduit 09 is reacting to human biometric ether. Anyone with Mindmancer discipline can extract raw cognitive shards.",
      cost: 20,
      grantsXP: 45
    },
    {
      id: "rumor_2",
      title: "Ares Biotech Executive Transport",
      text: "A high-ranking corporate cipher courier is scheduled to pass through the Neon Spires district carrying decrypted passcodes.",
      cost: 35,
      grantsXP: 60,
      unlocksDistrictId: "neon_spires"
    },
    {
      id: "rumor_3",
      title: "Underground Relic Cache",
      text: "Behind the heavy blast door in the old catacombs lies an unbreached weapons crate from the pre-collapse corporate wars.",
      cost: 15,
      grantsXP: 30
    }
  ];

  const rumorData: POIRumorsService = services.rumors || {
    enabled: hasRumors,
    informantName: "Whisper-Jack (Informant)",
    rumorList: defaultRumors
  };

  const [rumorList, setRumorList] = useState<POIRumorItem[]>(rumorData.rumorList || defaultRumors);

  const handleBuyRumor = (rumor: POIRumorItem) => {
    const cost = rumor.cost || 0;
    if (cost > 0 && gameState.credits < cost) {
      triggerToast(`⚠️ INSUFFICIENT CREDITS: Informant demands ${cost}¤`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits - cost),
      experience: prev.experience + (rumor.grantsXP || 25),
      unlockedDistricts: rumor.unlocksDistrictId && !prev.unlockedDistricts?.includes(rumor.unlocksDistrictId)
        ? [...(prev.unlockedDistricts || []), rumor.unlocksDistrictId]
        : prev.unlockedDistricts
    }));

    setRumorList(prev => prev.map(r => r.id === rumor.id ? { ...r, heard: true } : r));
    addSystemLog(`👂 INTEL ACQUIRED: "${rumor.title}" - ${rumor.text} (+${rumor.grantsXP || 25} XP). Paid ${cost}¤.`);
    triggerToast(`Rumor Unlocked: +${rumor.grantsXP || 25} XP`);
  };

  // ----------------------------------------------------
  // CONTRACTS & JOB BOARD LOGIC
  // ----------------------------------------------------
  const availableQuests = (gameState.campaignQuestsRegistry || []).filter(q => 
    (services.contracts?.availableQuestIds?.includes(q.id) || !services.contracts?.availableQuestIds || services.contracts.availableQuestIds.length === 0) &&
    q.status === "NOT_STARTED"
  );

  const handleAcceptContract = (questId: string, questTitle: string) => {
    setGameState(prev => activateQuest(prev, questId));

    addSystemLog(`📜 CONTRACT ACCEPTED: "${questTitle}" signed at ${poi.name}. Objectives uploaded to datapad.`);
    triggerToast(`Contract Accepted: ${questTitle}`);
  };

  // ----------------------------------------------------
  // QUEST SCENE OVERRIDE TRIGGER
  // ----------------------------------------------------
  const linkedSceneId = poi.questTrigger?.linkedSceneId;
  const triggerLabel = poi.questTrigger?.triggerButtonLabel || "⚡ Launch Interactive Scene / Event";

  const renderActionButtons = () => ((poi.actions && poi.actions.length > 0) ? poi.actions : (poi.buttons || []).map((b, idx) => ({
    id: `action_${idx}`,
    label: b,
    desc: "Standard location interaction",
    actionType: "custom" as const
  }))).map((action: CustomPOIAction | any, idx: number) => {
    const actionLabel = action.label || action;
    const visibleLabel = String(actionLabel).replace(/^\[(?:SCENE|QUEST):[^\]]+\]\s*/i, "");
    const questLocked = !!action.requiredQuestId && !gameState.campaignQuestsRegistry?.some(quest => quest.id === action.requiredQuestId && quest.status === "ACTIVE");
    const isDone = completedActions.includes(`${poi.id}:action:${action.id}`) || completedActions.includes(`${poi.id}:${actionLabel}`);

    return (
      <button
        key={`poi-action-${idx}-${action.id || "no-id"}-${actionLabel}`}
        disabled={isDone || questLocked}
        onClick={() => {
          if (action.actionType === "dialogue" && action.targetNpcId && onStartDialogue) {
            onStartDialogue(action.targetNpcId);
          } else if (action.actionType === "scene" && action.targetSceneId && onLaunchQuestScene) {
            onLaunchQuestScene(action.targetSceneId);
          } else if (action.actionType === "shop") {
            setActiveTab("shop");
          } else if (action.actionType === "rest") {
            setActiveTab("rest");
          } else if (poi.actions?.includes(action)) {
            executeLightweightAction(action);
          } else if (onExecuteAction) {
            onExecuteAction(actionLabel);
          }
        }}
        className={`text-left p-3 rounded-lg border font-mono text-xs transition-all flex flex-col justify-between cursor-pointer group ${
          isDone || questLocked
            ? "border-slate-900 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50"
            : "border-cyan-500/20 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-400 text-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="font-bold group-hover:text-cyan-300">{visibleLabel}</span>
          {isDone && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
          {questLocked && <Lock size={13} className="text-amber-400 shrink-0" />}
        </div>
        {action.desc && <span className="text-3xs text-slate-400 mt-1 line-clamp-1">{action.desc}</span>}
        {action.statCheck && <span className="text-4xs text-amber-300 font-bold mt-1 uppercase">Prerequisite: {action.statCheck}</span>}
      </button>
    );
  });

  if (scannerMode) {
    return (
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-3 w-full h-full">
        {actionResult && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
            <div className={`max-w-md w-full rounded-xl border p-5 shadow-2xl ${actionResult.success ? "border-emerald-500/60 bg-emerald-950/90" : "border-rose-500/60 bg-rose-950/90"}`}>
              <h3 className={`font-black text-sm uppercase ${actionResult.success ? "text-emerald-300" : "text-rose-300"}`}>{actionResult.title}</h3>
              <p className="mt-2 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line">{actionResult.text}</p>
              <button onClick={() => setActionResult(null)} className="mt-4 px-4 py-2 rounded bg-slate-900 border border-white/20 text-xs font-bold cursor-pointer hover:bg-slate-800">Continue</button>
            </div>
          </div>
        )}
        <div className="lg:col-span-5 flex flex-col justify-between relative rounded-xl overflow-hidden border border-white/10 min-h-[220px] lg:min-h-[340px]">
          <img src={poi.bgImage || poi.image} alt={poi.name} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover select-none filter brightness-90 saturate-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/80" />
          <div className="p-2 z-10 flex justify-between bg-slate-950/80 border-b border-white/5 uppercase font-mono text-[9px] text-slate-400"><span>GRID LOCALITY FILE</span><span className="text-cyan-400 font-bold">STATUS: VISITED</span></div>
          <div className="p-3 z-10 font-mono"><span className="text-cyan-400 text-3xs tracking-wider uppercase font-extrabold">● NODE SCAN COMPLETE</span><p className="text-sm font-black text-white mt-0.5 uppercase">{poi.name}</p></div>
        </div>
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-2"><h4 className="text-3xs font-mono uppercase tracking-[0.15em] text-cyan-400 font-black">LOCAL DESCRIPTOR CONSOLE</h4><p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed font-medium">{poi.desc}</p></div>
          <div className="space-y-4"><p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">OPERATIONAL RESPONSES PREPARED AT LOCATION:</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{renderActionButtons()}</div></div>
          <div className="flex justify-end border-t border-white/5 pt-3">{onReturnToMap && <button onClick={onReturnToMap} className="bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-950 font-mono text-[10px] font-bold px-4 py-2 rounded-lg cursor-pointer"><ArrowLeft size={13} className="inline mr-1" />Return to Map</button>}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl text-slate-100 font-mono">
      {actionResult && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-xl border p-5 shadow-2xl ${actionResult.success ? "border-emerald-500/60 bg-emerald-950/90" : "border-rose-500/60 bg-rose-950/90"}`}>
            <h3 className={`font-black text-sm uppercase ${actionResult.success ? "text-emerald-300" : "text-rose-300"}`}>{actionResult.title}</h3>
            <p className="mt-2 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line">{actionResult.text}</p>
            <button onClick={() => setActionResult(null)} className="mt-4 px-4 py-2 rounded bg-slate-900 border border-white/20 text-xs font-bold cursor-pointer hover:bg-slate-800">Continue</button>
          </div>
        </div>
      )}
      
      {/* 1. TOP HEADER & ATMOSPHERIC BANNER */}
      <div className="relative border-b border-white/10 p-3 md:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-lg border border-cyan-400/40 bg-cyan-950/60 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
            {poi.category === "shop" ? <Store size={20} /> :
             poi.category === "medical" ? <HeartPulse size={20} /> :
             poi.category === "safehouse" ? <Bed size={20} /> :
             poi.category === "auction" ? <DollarSign size={20} /> :
             poi.category === "combat" ? <Swords size={20} /> :
             <Shield size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                {poi.district.toUpperCase()}
              </span>
              <span className={`text-3xs uppercase tracking-widest px-1.5 py-0.5 rounded font-bold border ${
                poi.dangerRating === "Lethal" ? "bg-red-950 border-red-500 text-red-300" :
                poi.dangerRating === "High" ? "bg-amber-950 border-amber-500 text-amber-300" :
                "bg-emerald-950 border-emerald-500 text-emerald-300"
              }`}>
                {poi.dangerRating || "Safe"} Sector
              </span>
            </div>
            <h2 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wide mt-0.5">
              {poi.name}
            </h2>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 z-10 flex-wrap">
          {linkedSceneId && onLaunchQuestScene && (
            <button
              onClick={() => onLaunchQuestScene(linkedSceneId, poi.questTrigger?.linkedSceneStepId)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-400/60 text-purple-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer animate-pulse"
            >
              <Zap size={14} className="text-purple-300" />
              <span>{triggerLabel}</span>
            </button>
          )}

          {onReturnToMap && (
            <button
              onClick={onReturnToMap}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
            >
              <ArrowLeft size={13} />
              <span>Return to Map</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MODULAR INTERIOR SERVICE TABS */}
      {hasServiceTabs && <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Shield size={13} /> Overview & Ops
        </button>

        {hasShop && (
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "shop"
                ? "bg-amber-950/80 border border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Store size={13} /> Merchant / Market
          </button>
        )}

        {hasClinic && (
          <button
            onClick={() => setActiveTab("clinic")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "clinic"
                ? "bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <HeartPulse size={13} /> Clinic & Cyberdoc
          </button>
        )}

        {hasRest && (
          <button
            onClick={() => setActiveTab("rest")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "rest"
                ? "bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Bed size={13} /> Rent Room / Safehouse
          </button>
        )}

        {hasAuction && (
          <button
            onClick={() => setActiveTab("auction")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "auction"
                ? "bg-purple-950/80 border border-purple-400/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <DollarSign size={13} /> Underworld Auction & Slaves
          </button>
        )}

        {hasContracts && <button
          onClick={() => setActiveTab("contracts")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "contracts"
              ? "bg-indigo-950/80 border border-indigo-400/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Scroll size={13} /> Job & Bounty Board ({availableQuests.length})
        </button>}

        {hasRumors && <button
          onClick={() => setActiveTab("rumors")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "rumors"
              ? "bg-rose-950/80 border border-rose-400/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
              : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Radio size={13} /> Rumors & Intel
        </button>}

        {hasNpcs && (
          <button
            onClick={() => setActiveTab("npcs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "npcs"
                ? "bg-pink-950/80 border border-pink-400/50 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Users size={13} /> Locals & NPCs
          </button>
        )}
      </div>}

      {/* 3. TAB CONTENT VIEWS */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* TAB A: OVERVIEW & IMMEDIATE AREA ACTIONS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Scenery Frame */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-white/10 min-h-[220px] max-h-[340px]">
              <img
                src={poi.bgImage || poi.image || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800"}
                alt={poi.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none filter brightness-90 saturate-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 font-mono">
                <span className="text-3xs uppercase text-cyan-400 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  COORDINATES: {poi.x}%, {poi.y}%
                </span>
                <p className="text-xs text-slate-200 mt-1 font-sans line-clamp-3">
                  {poi.desc}
                </p>
              </div>
            </div>

            {/* Actions & Stat Checks */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-2xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={13} /> Immediate Area Interactions
                </span>
                <span className="text-3xs text-slate-400">
                  {poi.actions?.length || 0} Actions Available
                </span>
              </div>

              {/* Action buttons list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {renderActionButtons()}
              </div>
            </div>
          </div>
        )}

        {/* TAB B: SHOP & BLACK MARKET */}
        {activeTab === "shop" && (
          <div className="flex flex-col gap-4">
            {/* Merchant Dialogue Header */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-amber-500/30 rounded-xl">
              <div className="w-12 h-12 rounded-lg border border-amber-400/50 bg-amber-950/60 flex items-center justify-center text-amber-300 shrink-0 font-bold text-lg">
                🛒
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-amber-300 uppercase">{shopData.merchantName}</h3>
                  <span className="text-2xs font-bold text-cyan-400">CREDITS: {gameState.credits}¤</span>
                </div>
                <p className="text-3xs text-slate-400 uppercase">{shopData.merchantTitle}</p>
                <p className="text-2xs text-slate-300 italic mt-1">"{shopData.greeting}"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Buy Items Column */}
              <div className="flex flex-col gap-2 p-3 bg-slate-950 border border-white/5 rounded-xl">
                <span className="text-2xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span>Available Hardware For Sale</span>
                  <span className="text-3xs text-slate-500">Markup: x{shopData.priceMultiplier || 1.0}</span>
                </span>
                
                <div className="flex flex-col gap-1.5">
                  {shopItems.map((item, idx) => {
                    const meta = ITEM_METADATA[item];
                    const baseCost = getItemCostLocal(item, meta);
                    const price = Math.round(baseCost * (shopData.priceMultiplier || 1.0));
                    const canAfford = gameState.credits >= price;

                    return (
                      <div
                        key={`shop-item-${idx}-${item}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 hover:border-amber-500/30 transition-all text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-200">{item}</span>
                          <span className="block text-3xs text-slate-500 uppercase">{meta?.slot || "Item"}</span>
                        </div>
                        <button
                          onClick={() => handleBuyItem(item)}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded text-2xs font-bold uppercase transition-all cursor-pointer ${
                            canAfford
                              ? "bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                              : "bg-slate-800 text-slate-600 cursor-not-allowed"
                          }`}
                        >
                          Buy {price}¤
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sell Items Column */}
              <div className="flex flex-col gap-2 p-3 bg-slate-950 border border-white/5 rounded-xl">
                <span className="text-2xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span>Your Inventory (Sell Scrap)</span>
                  <span className="text-3xs text-slate-500">{gameState.inventory.length} Items</span>
                </span>

                <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto">
                  {gameState.inventory.length === 0 ? (
                     <p className="text-2xs text-slate-600 italic p-3 text-center">Inventory empty.</p>
                  ) : (
                    gameState.inventory.map((item, idx) => {
                      const meta = ITEM_METADATA[item];
                      const baseCost = getItemCostLocal(item, meta);
                      const sellPrice = Math.max(5, Math.round(baseCost * 0.5));

                      return (
                        <div
                          key={`inventory-sell-${idx}-${item}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-white/5 text-xs"
                        >
                          <span className="font-medium text-slate-300">{item}</span>
                          <button
                            onClick={() => handleSellItem(item, idx)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-2xs font-bold uppercase cursor-pointer"
                          >
                            Sell +{sellPrice}¤
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: CLINIC & CYBERDOC */}
        {activeTab === "clinic" && (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
              <div className="w-12 h-12 rounded-lg border border-emerald-400/50 bg-emerald-950/60 flex items-center justify-center text-emerald-300 shrink-0 font-bold text-lg">
                🏥
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-emerald-300 uppercase">{clinicData.doctorName}</h3>
                <p className="text-3xs text-slate-400 uppercase">Licensed Black-Clinic Cyber-Surgeon</p>
                <p className="text-2xs text-slate-300 italic mt-1">"Lie down on the table. Nanite injections will sting, but they will restore your chassis."</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                    <HeartPulse size={14} /> Nanite Bio-Repair (HP)
                  </h4>
                  <p className="text-3xs text-slate-400 mt-1">
                    Inject cellular repair nanites. Completely restabilizes biological tissue and alloy chassis to 100%.
                  </p>
                  <div className="mt-2 text-2xs text-slate-300 font-bold">
                    Current HP: <span className="text-emerald-400">{gameState.hp} / {gameState.maxHp}</span>
                  </div>
                </div>
                <button
                  onClick={handleHealHP}
                  disabled={gameState.hp >= gameState.maxHp}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs uppercase transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  {gameState.hp >= gameState.maxHp ? "HP Full" : `Full Heal (-${clinicData.healHpCost || 35}¤)`}
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-cyan-500/30 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Zap size={14} /> Ether Core Re-Siphon (Mana)
                  </h4>
                  <p className="text-3xs text-slate-400 mt-1">
                    Connect to high-voltage psychic coolant tanks. Recharges neural synaptic ether capacity.
                  </p>
                  <div className="mt-2 text-2xs text-slate-300 font-bold">
                    Current Mana: <span className="text-cyan-400">{gameState.mana} / {gameState.maxMana}</span>
                  </div>
                </div>
                <button
                  onClick={handleRestoreMana}
                  disabled={gameState.mana >= gameState.maxMana}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  {gameState.mana >= gameState.maxMana ? "Mana Full" : `Recharge Mana (-${clinicData.restoreManaCost || 40}¤)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: HOTEL & SAFEHOUSE */}
        {activeTab === "rest" && (
          <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
            <div className="p-4 bg-slate-900/60 border border-cyan-500/30 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-cyan-400/50 bg-cyan-950/60 flex items-center justify-center text-cyan-300 shrink-0 font-bold text-lg">
                  🏨
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-cyan-300 uppercase">{restData.innkeeperName || "Secure Pod Bunk"}</h3>
                  <p className="text-3xs text-slate-400 uppercase">Reinforced Rest Bunks & Oxygen Chamber</p>
                </div>
              </div>

              <p className="text-2xs text-slate-300 italic bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                "{restData.flavorText || "Lock the hydraulic door, initiate neuro-sleep cycle, and let your bio-generators recover."}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-2xs">
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-3xs text-slate-500 uppercase block">Stamina Recovery</span>
                  <span className="font-bold text-cyan-400">+{restData.staminaRestore || 60} Stamina</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-white/5">
                  <span className="text-3xs text-slate-500 uppercase block">Time Shift</span>
                  <span className="font-bold text-amber-300">Advances Time Cycle</span>
                </div>
              </div>

              <button
                onClick={handleRentRoomAndRest}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer mt-1"
              >
                Rent Pod & Rest (-{restData.rentRoomCost || 25}¤)
              </button>
            </div>
          </div>
        )}

        {/* TAB E: AUCTION & SLAVE / MERC RECRUITS */}
        {activeTab === "auction" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-purple-500/30 rounded-xl">
              <div>
                <h3 className="text-xs font-extrabold text-purple-300 uppercase">{auctionData.auctioneerName || "The Syndicate Auction Pit"}</h3>
                <p className="text-3xs text-slate-400 uppercase">{auctionData.description || "Live Underworld Auction Bidding"}</p>
              </div>
              <span className="text-xs font-bold text-cyan-400">CREDITS: {gameState.credits}¤</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {auctionLots.map((lot, idx) => {
                const canAfford = gameState.credits >= lot.price && !lot.purchased;

                return (
                  <div
                    key={`auction-lot-${idx}-${lot.id}`}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                      lot.purchased
                        ? "bg-slate-950/40 border-slate-900 opacity-60"
                        : "bg-slate-950 border-purple-500/30 hover:border-purple-400"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {lot.avatar && (
                        <img
                          src={lot.avatar}
                          alt={lot.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-lg border border-purple-400/50 shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-4xs font-bold uppercase px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300">
                          {lot.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{lot.name}</h4>
                      </div>
                    </div>

                    <p className="text-3xs text-slate-400">{lot.desc}</p>
                    
                    {lot.stats && (
                      <div className="p-1.5 rounded bg-purple-950/40 border border-purple-500/20 text-4xs text-purple-300 font-mono">
                        {lot.stats}
                      </div>
                    )}

                    <button
                      onClick={() => handlePurchaseAuctionLot(lot)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded text-2xs font-bold uppercase transition-all cursor-pointer ${
                        lot.purchased
                          ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                          : canAfford
                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                            : "bg-slate-800 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {lot.purchased ? "✓ Acquired" : `Bid & Buy (${lot.price}¤)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB F: CONTRACTS & JOB BOARD */}
        {activeTab === "contracts" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-indigo-300 uppercase">
                  {services.contracts?.boardTitle || "Local Bounty & Freelance Contract Terminal"}
                </h3>
                <p className="text-3xs text-slate-400 uppercase">
                  {services.contracts?.boardDescription || "Official and underworld jobs commissioned in this district"}
                </p>
              </div>
            </div>

            {availableQuests.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border border-white/5 rounded-xl">
                <p className="text-xs text-slate-500">No active contracts available at this terminal right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableQuests.map((quest, idx) => (
                  <div
                    key={`contract-quest-${idx}-${quest.id}`}
                    className="p-3 bg-slate-950 border border-indigo-500/30 hover:border-indigo-400 rounded-xl flex flex-col justify-between gap-2 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-4xs font-bold px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/30 text-indigo-300 uppercase">
                          {quest.category}
                        </span>
                        <span className="text-3xs font-bold text-amber-300">+{quest.rewards?.credits || 100}¤ / +{quest.rewards?.experience || 50} XP</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-1">{quest.title}</h4>
                      <p className="text-3xs text-slate-400 mt-1">{quest.description}</p>
                    </div>

                    <button
                      onClick={() => handleAcceptContract(quest.id, quest.title)}
                      className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-2xs uppercase tracking-wider transition-all shadow-[0_0_8px_rgba(99,102,241,0.3)] cursor-pointer"
                    >
                      Sign & Accept Contract
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB G: RUMORS & INFORMANT */}
        {activeTab === "rumors" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-rose-300 uppercase">
                  {rumorData.informantName || "Underworld Whispers & Informant Logs"}
                </h3>
                <p className="text-3xs text-slate-400 uppercase">
                  Purchase secret rumors to uncover hidden lore, POI pins, and experience points
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rumorList.map((rumor, idx) => {
                const cost = rumor.cost || 0;
                const canBuy = gameState.credits >= cost && !rumor.heard;

                return (
                  <div
                    key={`rumor-item-${idx}-${rumor.id}`}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                      rumor.heard
                        ? "bg-slate-950/60 border-slate-800"
                        : "bg-slate-950 border-rose-500/30 hover:border-rose-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200">{rumor.title}</h4>
                        <span className="text-3xs font-bold text-cyan-400">+{rumor.grantsXP || 25} XP</span>
                      </div>
                      <p className="text-3xs text-slate-400 mt-1 italic">
                        {rumor.heard ? `"${rumor.text}"` : "🔒 [CONFIDENTIAL ENCRYPTED WHISPER]"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyRumor(rumor)}
                      disabled={!canBuy}
                      className={`w-full py-1.5 rounded text-2xs font-bold uppercase transition-all cursor-pointer ${
                        rumor.heard
                          ? "bg-slate-900 text-emerald-400 border border-emerald-500/20 cursor-default"
                          : canBuy
                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                            : "bg-slate-800 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {rumor.heard ? "✓ Decrypted & Heard" : `Bribe Informant (${cost}¤)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB H: RESIDENT NPCS */}
        {activeTab === "npcs" && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-pink-300 uppercase border-b border-white/10 pb-2">
              Characters Stationed In This Facility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(poi.placedNPCIds || []).map((npcId, idx) => (
                <div
                  key={`placed-npc-${idx}-${npcId}`}
                  className="p-3 bg-slate-950 border border-pink-500/30 hover:border-pink-400 rounded-xl flex items-center justify-between gap-3 transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{npcId.toUpperCase()}</h4>
                    <span className="text-3xs text-slate-500 uppercase">Stationed Resident</span>
                  </div>
                  {onStartDialogue && (
                    <button
                      onClick={() => onStartDialogue(npcId)}
                      className="px-3 py-1.5 rounded bg-pink-600 hover:bg-pink-500 text-white font-bold text-2xs uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={12} /> Talk
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
