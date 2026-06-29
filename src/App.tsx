import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Database,
  Briefcase,
  Users,
  Award,
  BookOpen,
  MapPin,
  Heart,
  Zap,
  Coins,
  Shield,
  RotateCcw,
  Terminal,
  Play,
  ChevronRight,
  ShoppingCart,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Flame,
  ArrowRight,
  User,
  Activity,
  Sword,
  Clock,
  Save,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  X,
  Plus,
  Cpu,
  Gem,
  Crosshair,
  Pill,
  Settings,
  Check,
  Edit,
  UserCog,
  CloudLightning
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import WeatherOverlay from "./components/WeatherOverlay";
import NPCBaseManagement from "./components/NPCBaseManagement";

import { LogMessage, GameState, CompanionState, QuestState, QuestObjective, QuestReward } from "./types";
import {
  ARCHETYPES,
  SHOP_ITEMS,
  INITIAL_COMPANIONS,
  getInitialState,
  MAP_POIS,
  REGIONS,
  ENEMIES,
  MapPOI,
  Region,
  ITEM_METADATA,
  ItemDetails
} from "./data";

const getItemIcon = (itemName: string, slot?: string) => {
  const nameLower = itemName.toLowerCase();
  
  if (nameLower.includes("pistol") || nameLower.includes("smg") || nameLower.includes("rifle") || nameLower.includes("cannon") || nameLower.includes("revolver") || nameLower.includes("gun")) {
    return <Crosshair size={14} className="text-cyan-400" />;
  }
  if (nameLower.includes("katana") || nameLower.includes("blade") || nameLower.includes("baton") || nameLower.includes("fists") || nameLower.includes("slicer") || nameLower.includes("sword") || nameLower.includes("dagger")) {
    return <Sword size={14} className="text-rose-400" />;
  }
  if (nameLower.includes("armor") || nameLower.includes("vest") || nameLower.includes("plate") || nameLower.includes("jacket")) {
    return <Shield size={14} className="text-emerald-400" />;
  }
  if (nameLower.includes("visor") || nameLower.includes("helmet") || nameLower.includes("headgear") || nameLower.includes("chip") || nameLower.includes("processor") || nameLower.includes("deck")) {
    return <Cpu size={14} className="text-purple-400" />;
  }
  if (nameLower.includes("matrix") || nameLower.includes("core") || nameLower.includes("totem") || nameLower.includes("crystal") || nameLower.includes("augment") || nameLower.includes("relic") || nameLower.includes("ring")) {
    return <Gem size={14} className="text-amber-400" />;
  }
  if (nameLower.includes("stim") || nameLower.includes("heal") || nameLower.includes("cell") || nameLower.includes("mana") || nameLower.includes("battery")) {
    return <Pill size={14} className="text-sky-400" />;
  }
  if (nameLower.includes("circuitry") || nameLower.includes("scrap") || nameLower.includes("hardware") || nameLower.includes("parts")) {
    return <Settings size={14} className="text-slate-400" />;
  }
  
  if (slot === "meleeWeapon") return <Sword size={14} className="text-rose-400" />;
  if (slot === "rangedWeapon") return <Crosshair size={14} className="text-cyan-400" />;
  if (slot === "armor") return <Shield size={14} className="text-emerald-400" />;
  if (slot === "headpiece") return <Cpu size={14} className="text-purple-400" />;
  if (slot === "trinket") return <Gem size={14} className="text-amber-400" />;
  if (slot === "consumable") return <Pill size={14} className="text-sky-400" />;
  if (slot === "valuable") return <Settings size={14} className="text-slate-400" />;
  
  return <Briefcase size={14} className="text-slate-400" />;
};

export function syncStructuredQuests(state: GameState): QuestState[] {
  const quests: QuestState[] = state.structuredQuests ? [...state.structuredQuests] : [];

  const getOrCreate = (id: string, defaults: Partial<QuestState>): QuestState => {
    let q = quests.find(item => item.id === id);
    if (!q) {
      q = {
        id,
        title: defaults.title || "",
        category: defaults.category || "Side Quest",
        description: defaults.description || "",
        status: "NOT_STARTED",
        objectives: defaults.objectives || [],
        rewards: defaults.rewards || [],
        log: defaults.log || [],
        ...defaults
      };
      quests.push(q);
    }
    return q;
  };

  // 1. Prologue
  const prologueActive = state.activeQuests.some(q => q.includes("Prologue"));
  const prologueCompleted = state.completedQuests.some(q => q.includes("Prologue"));
  if (prologueActive || prologueCompleted) {
    const q = getOrCreate("prologue", {
      title: "Subsurface AI Catacombs",
      category: "Main Quest",
      description: "Infiltrate Conduit 09 with Vice and Tracker to steal corporate database crystals from Ares Biotech.",
      objectives: [{ id: "hack_terminal", text: "Hack cyber-vault terminal and retrieve crystals", current: prologueCompleted ? 1 : 0, target: 1, completed: prologueCompleted }],
      rewards: [{ type: "credits", amount: 150 }, { type: "experience", amount: 100 }]
    });
    if (prologueCompleted) {
      q.status = "COMPLETED";
      q.objectives[0].current = 1;
      q.objectives[0].completed = true;
    } else {
      q.status = "ACTIVE";
    }
  }

  // 2. Outcast Directive
  const outcastActive = state.activeQuests.some(q => q.includes("Outcast") || q.includes("Technical Signal Core"));
  const outcastCompleted = state.completedQuests.some(q => q.includes("Outcast"));
  if (outcastActive || outcastCompleted) {
    const q = getOrCreate("outcast_directive", {
      title: "Outcast Directive",
      category: "Main Quest",
      description: "Traverse to Shatter Ridge Corridors in Downtown Region, seize the copper Technical Signal Core, and deliver it to Agent Jax at the Neon Abyss Bar.",
      objectives: [
        { id: "secure_core", text: "Secure the Technical Signal Core inside Shatter Ridge Corridors", current: state.inventory.includes("Technical Signal Core") || outcastCompleted ? 1 : 0, target: 1, completed: state.inventory.includes("Technical Signal Core") || outcastCompleted },
        { id: "deliver_core", text: "Deliver the Technical Signal Core to Agent Jax at Neon Abyss Bar", current: outcastCompleted ? 1 : 0, target: 1, completed: outcastCompleted }
      ],
      rewards: [{ type: "credits", amount: 150 }, { type: "experience", amount: 100 }]
    });
    q.objectives[0].current = state.inventory.includes("Technical Signal Core") || outcastCompleted ? 1 : 0;
    q.objectives[0].completed = state.inventory.includes("Technical Signal Core") || outcastCompleted;
    q.objectives[1].current = outcastCompleted ? 1 : 0;
    q.objectives[1].completed = outcastCompleted;
    if (outcastCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (state.inventory.includes("Technical Signal Core")) {
        q.log = ["Secured the Technical Signal Core from the highwalk corridors. Proceeding to Agent Jax."];
      } else {
        q.log = ["Searching the debris in Shatter Ridge Corridors for the signal module."];
      }
    }
  }

  // 3. Corporate Hunt
  const corpActive = state.activeQuests.some(q => q.includes("Corporate Hunt") || q.includes("Acid Beast Core"));
  const corpCompleted = state.completedQuests.some(q => q.includes("Corporate Hunt") || q.includes("Sewers Functioning") || q.includes("Sewer lines are functioning") || state.completedQuests.some(q => q.includes("Outcast")));
  if (corpActive || corpCompleted) {
    const q = getOrCreate("corporate_hunt", {
      title: "Corporate Hunt",
      category: "Main Quest",
      description: "Travel to Sludge Conduits in Docks Region, engage the Toxic Sludge Behemoth to secure its Acid Beast Core, and deliver it to Chancellor Aria.",
      objectives: [
        { id: "defeat_behemoth", text: "Defeat Toxic Sludge Behemoth to obtain Acid Beast Core", current: state.inventory.includes("Acid Beast Core") || corpCompleted ? 1 : 0, target: 1, completed: state.inventory.includes("Acid Beast Core") || corpCompleted },
        { id: "deliver_core", text: "Deliver Acid Beast Core to Chancellor Aria at the Apex Armory", current: corpCompleted ? 1 : 0, target: 1, completed: corpCompleted }
      ],
      rewards: [{ type: "credits", amount: 200 }, { type: "experience", amount: 120 }, { type: "item", itemName: "Apex Mantis electro-blade" }]
    });
    q.objectives[0].current = state.inventory.includes("Acid Beast Core") || corpCompleted ? 1 : 0;
    q.objectives[0].completed = state.inventory.includes("Acid Beast Core") || corpCompleted;
    q.objectives[1].current = corpCompleted ? 1 : 0;
    q.objectives[1].completed = corpCompleted;
    if (corpCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (state.inventory.includes("Acid Beast Core")) {
        q.log = ["Sludge Behemoth liquidated. Core secured! Deliver it to Chancellor Aria at the Apex Armory."];
      } else {
        q.log = ["Investigating the hazardous sludge pipelines under Docks Region."];
      }
    }
  }

  // 4. Syndicate Catalyst
  const syndicateActive = state.activeQuests.some(q => q.includes("Syndicate Catalyst") || q.includes("Charged Ley-Matrix"));
  const syndicateCompleted = state.completedQuests.some(q => q.includes("Syndicate Catalyst") || state.completedQuests.some(q => q.includes("Outcast")));
  if (syndicateActive || syndicateCompleted) {
    const q = getOrCreate("syndicate_catalyst", {
      title: "Syndicate Catalyst",
      category: "Main Quest",
      description: "Move to Satoshi Cyber-Shrine Gardens, Meditate with the tech core to charge the Ley-Matrix, and return it to Priestess Morgana.",
      objectives: [
        { id: "charge_matrix", text: "Meditate at the Satoshi Cyber-Shrine to charge the Ley-Matrix", current: state.inventory.includes("Charged Ley-Matrix") || syndicateCompleted ? 1 : 0, target: 1, completed: state.inventory.includes("Charged Ley-Matrix") || syndicateCompleted },
        { id: "deliver_matrix", text: "Return the Charged Ley-Matrix to Priestess Morgana", current: syndicateCompleted ? 1 : 0, target: 1, completed: syndicateCompleted }
      ],
      rewards: [{ type: "credits", amount: 180 }, { type: "experience", amount: 100 }, { type: "maxMana", amount: 30 }]
    });
    q.objectives[0].current = state.inventory.includes("Charged Ley-Matrix") || syndicateCompleted ? 1 : 0;
    q.objectives[0].completed = state.inventory.includes("Charged Ley-Matrix") || syndicateCompleted;
    q.objectives[1].current = syndicateCompleted ? 1 : 0;
    q.objectives[1].completed = syndicateCompleted;
    if (syndicateCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (state.inventory.includes("Charged Ley-Matrix")) {
        q.log = ["Matrix charged with pure technomantic celestial stream. Deliver it back to Priestess Morgana."];
      } else {
        q.log = ["Travel to the Cyber-Shrine Gardens and focus your energy."];
      }
    }
  }

  // 5. Hunt for Vice
  const huntViceActive = state.activeQuests.some(q => q.includes("The Hunt for Vice"));
  const huntViceCompleted = state.completedQuests.some(q => q.includes("The Hunt for Vice")) || state.activeQuests.some(q => q.includes("Rescue Vice")) || state.completedQuests.some(q => q.includes("Vice Rescued") || q.includes("Chapter 1 Completed"));
  if (huntViceActive || huntViceCompleted) {
    const q = getOrCreate("hunt_for_vice", {
      title: "The Hunt for Vice",
      category: "Main Quest",
      description: "Infiltrate the Titan Logistics Freight Hub in Docks Region and hack the cargo terminal logs to isolate Vice's coordinates.",
      objectives: [
        { id: "hack_cargo_terminal", text: "Hack the Freight Hub Cargo Logs", current: huntViceCompleted ? 1 : 0, target: 1, completed: huntViceCompleted }
      ],
      rewards: [{ type: "experience", amount: 80 }]
    });
    q.objectives[0].current = huntViceCompleted ? 1 : 0;
    q.objectives[0].completed = huntViceCompleted;
    if (huntViceCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      q.log = ["Analyze the commercial networks or hack direct terminal portals at the Docks Freight Hub."];
    }
  }

  // 6. Rescue Vice (Chapter 1 Conclusion)
  const rescueViceActive = state.activeQuests.some(q => q.includes("Rescue Vice"));
  const rescueViceCompleted = state.completedQuests.some(q => q.includes("Vice Rescued") || q.includes("Chapter 1 Completed"));
  if (rescueViceActive || rescueViceCompleted) {
    const q = getOrCreate("rescue_vice", {
      title: "Rescue Vice",
      category: "Main Quest",
      description: "Infiltrate the subterranean cells beneath Ares Biotech Corporate Plaza (Downtown district) and extract your leader Vice from cryo-lockdown.",
      objectives: [
        { id: "bypass_security", text: "Bypass or defeat the plaza checkpoint defenses", current: state.completedPOIActions?.includes("corporate_plaza:security_bypassed") || rescueViceCompleted ? 1 : 0, target: 1, completed: !!state.completedPOIActions?.includes("corporate_plaza:security_bypassed") || rescueViceCompleted },
        { id: "release_vice", text: "Extract Vice from cryogenic chamber", current: rescueViceCompleted ? 1 : 0, target: 1, completed: rescueViceCompleted }
      ],
      rewards: [{ type: "credits", amount: 300 }, { type: "experience", amount: 150 }, { type: "item", itemName: "Vice (Companion Joined)" }]
    });
    q.objectives[0].current = state.completedPOIActions?.includes("corporate_plaza:security_bypassed") || rescueViceCompleted ? 1 : 0;
    q.objectives[0].completed = !!state.completedPOIActions?.includes("corporate_plaza:security_bypassed") || rescueViceCompleted;
    q.objectives[1].current = rescueViceCompleted ? 1 : 0;
    q.objectives[1].completed = rescueViceCompleted;
    if (rescueViceCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (state.completedPOIActions?.includes("corporate_plaza:security_bypassed")) {
        q.log = ["Security floor breached. Descend using the staff elevator and release Vice from Cryo-locked Chamber B-12."];
      } else {
        q.log = ["Breach the heavy defense systems guarding the Corporate Plaza checkroom."];
      }
    }
  }

  // 7. Chem-Weaver's Request (Side Quest)
  const chemActive = state.activeQuests.some(q => q.includes("Chem-Weaver"));
  const chemCompleted = state.completedQuests.some(q => q.includes("Chem-Weaver"));
  if (chemActive || chemCompleted) {
    const slimeCount = state.inventory.filter(i => i === "Glowing Slime").length;
    const q = getOrCreate("chem_weaver_request", {
      title: "Chem-Weaver's Request",
      category: "Side Quest",
      description: "Collect 3x samples of Glowing Slime from the sludge conduits underneath the Docks, and bring them to Priestess Morgana.",
      objectives: [
        { id: "collect_slimes", text: "Harvest 3x Glowing Slime samples from Docks", current: chemCompleted ? 3 : slimeCount, target: 3, completed: chemCompleted || slimeCount >= 3 },
        { id: "deliver_slimes", text: "Deliver slimes to Priestess Morgana", current: chemCompleted ? 1 : 0, target: 1, completed: chemCompleted }
      ],
      rewards: [{ type: "credits", amount: 150 }, { type: "experience", amount: 90 }, { type: "maxMana", amount: 50 }]
    });
    q.objectives[0].current = chemCompleted ? 3 : slimeCount;
    q.objectives[0].completed = chemCompleted || slimeCount >= 3;
    q.objectives[1].current = chemCompleted ? 1 : 0;
    q.objectives[1].completed = chemCompleted;
    if (chemCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      q.log = [`Currently carrying ${slimeCount}/3 bio-active sludge capsules. Explore Sludge Conduits POI in Docks region.`];
    }
  }

  // 8. Lost Drone Schematic (Side Quest)
  const droneActive = state.activeQuests.some(q => q.includes("Drone"));
  const droneCompleted = state.completedQuests.some(q => q.includes("Drone"));
  if (droneActive || droneCompleted) {
    const hasChip = state.inventory.includes("Experimental Drone Chip");
    const q = getOrCreate("lost_drone_schematic", {
      title: "The Lost Drone Schematic",
      category: "Side Quest",
      description: "Hunt Rogue Rust-Claw Orcs in Shatter Ridge (Downtown) to secure the Experimental Drone Chip. Bring it to Jax or install it in your Hideout mainframe.",
      objectives: [
        { id: "hunt_orcs", text: "Hunt Orcs and secure the Drone Chip", current: hasChip || droneCompleted ? 1 : 0, target: 1, completed: hasChip || droneCompleted },
        { id: "resolve_chip", text: "Deliver to Agent Jax (+200¤) OR install in Hideout Security (+50% Shields)", current: droneCompleted ? 1 : 0, target: 1, completed: droneCompleted }
      ],
      rewards: [{ type: "credits", amount: 200 }, { type: "experience", amount: 100 }]
    });
    q.objectives[0].current = hasChip || droneCompleted ? 1 : 0;
    q.objectives[0].completed = hasChip || droneCompleted;
    q.objectives[1].current = droneCompleted ? 1 : 0;
    q.objectives[1].completed = droneCompleted;
    if (droneCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (hasChip) {
        q.log = ["Experimental Drone Chip recovered! Choose to give it to Jax or install it in your Base Security Mainframe."];
      } else {
        q.log = ["Locate the rogue Rust-Claw Orc band in the highwalk passages of Shatter Ridge and recover the chip."];
      }
    }
  }

  // 9. Docks Contract: The Smuggler's Run (Side Quest)
  const smugActive = state.activeQuests.some(q => q.includes("Smuggler's Run"));
  const smugCompleted = state.completedQuests.some(q => q.includes("Smuggler's Run"));
  if (smugActive || smugCompleted) {
    const hasCrate = state.inventory.includes("Stolen Weapon Crate");
    const q = getOrCreate("smugglers_run", {
      title: "The Smuggler's Run",
      category: "Side Quest",
      description: "Recover the high-grade Stolen Weapon Crate from the Iron Anchor gang at the Rusty Anchor Shipyard, and deliver it back to Titan Logistics Freight Hub.",
      objectives: [
        { id: "defeat_smugglers", text: "Defeat the Iron Anchor smugglers at the Rusty Anchor Shipyard", current: hasCrate || smugCompleted ? 1 : 0, target: 1, completed: hasCrate || smugCompleted },
        { id: "deliver_parts", text: "Deliver recovered Weapon Crate to Titan Logistics Freight Hub", current: smugCompleted ? 1 : 0, target: 1, completed: smugCompleted }
      ],
      rewards: [{ type: "credits", amount: 160 }, { type: "experience", amount: 100 }, { type: "item", itemName: "Vibroblade" }]
    });
    q.objectives[0].current = hasCrate || smugCompleted ? 1 : 0;
    q.objectives[0].completed = hasCrate || smugCompleted;
    q.objectives[1].current = smugCompleted ? 1 : 0;
    q.objectives[1].completed = smugCompleted;
    if (smugCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (hasCrate) {
        q.log = ["Weapon crate secured! Proceed to the Titan Logistics Freight Hub at the Docks to deliver it."];
      } else {
        q.log = ["Interrogate the thugs or raid the stash inside the Rusty Anchor Shipyard."];
      }
    }
  }

  // 10. Side-Quest: Cybernetic Harvest (Side Quest)
  const harvestActive = state.activeQuests.some(q => q.includes("Cybernetic Harvest") || q.includes("Neural Regulator"));
  const harvestCompleted = state.completedQuests.some(q => q.includes("Cybernetic Harvest"));
  if (harvestActive || harvestCompleted) {
    const regCount = state.inventory.filter(i => i === "Neural Regulator").length;
    const q = getOrCreate("cybernetic_harvest", {
      title: "Cybernetic Harvest",
      category: "Side Quest",
      description: "Ambushes Ares patrols at the Highwalk Homicide Site in Downtown to harvest 2x Neural Regulators. Bring them back to Dr. Marv at his Docks Clinic.",
      objectives: [
        { id: "harvest_regulators", text: "Harvest 2x Neural Regulators from Downtown Patrols", current: harvestCompleted ? 2 : regCount, target: 2, completed: harvestCompleted || regCount >= 2 },
        { id: "deliver_regulators", text: "Deliver regulators to Dr. Marv's Cyber-Clinic (Docks)", current: harvestCompleted ? 1 : 0, target: 1, completed: harvestCompleted }
      ],
      rewards: [{ type: "credits", amount: 250 }, { type: "experience", amount: 120 }, { type: "item", itemName: "Smart-Targeting Visor" }]
    });
    q.objectives[0].current = harvestCompleted ? 2 : regCount;
    q.objectives[0].completed = harvestCompleted || regCount >= 2;
    q.objectives[1].current = harvestCompleted ? 1 : 0;
    q.objectives[1].completed = harvestCompleted;
    if (harvestCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      q.log = [`Siphoned ${regCount}/2 Neural Regulators. Ambush patrols at Highwalk Homicide Site (Downtown).`];
    }
  }

  // 11. Side-Quest: Nouveau Heist (Side Quest)
  const heistActive = state.activeQuests.some(q => q.includes("Nouveau Heist") || q.includes("Prototype Singularity Battery"));
  const heistCompleted = state.completedQuests.some(q => q.includes("Nouveau Heist"));
  if (heistActive || heistCompleted) {
    const hasCard = state.inventory.includes("VIP Afterlife Keycard");
    const hasBattery = state.inventory.includes("Prototype Singularity Battery");
    const q = getOrCreate("nouveau_heist", {
      title: "Nouveau Heist",
      category: "Side Quest",
      description: "Formulate a plan with Cipher at Club Afterlife VIP Lounge to infiltrate the Nouveau Cybernetic Showroom in Downtown, bypass the shields, and secure the Prototype Singularity Battery.",
      objectives: [
        { id: "secure_keycard", text: "Secure VIP Keycard from Cipher or Club Afterlife", current: hasCard || hasBattery || heistCompleted ? 1 : 0, target: 1, completed: hasCard || hasBattery || heistCompleted },
        { id: "crack_showroom", text: "Crack the Nouveau Showroom pressure shields to loot the Battery", current: hasBattery || heistCompleted ? 1 : 0, target: 1, completed: hasBattery || heistCompleted },
        { id: "deliver_battery", text: "Bring the Prototype Singularity Battery to Cipher at Club Afterlife", current: heistCompleted ? 1 : 0, target: 1, completed: heistCompleted }
      ],
      rewards: [{ type: "credits", amount: 350 }, { type: "experience", amount: 150 }, { type: "item", itemName: "Unstable Plasma Core" }]
    });
    q.objectives[0].current = hasCard || hasBattery || heistCompleted ? 1 : 0;
    q.objectives[0].completed = hasCard || hasBattery || heistCompleted;
    q.objectives[1].current = hasBattery || heistCompleted ? 1 : 0;
    q.objectives[1].completed = hasBattery || heistCompleted;
    q.objectives[2].current = heistCompleted ? 1 : 0;
    q.objectives[2].completed = heistCompleted;
    if (heistCompleted) {
      q.status = "COMPLETED";
    } else {
      q.status = "ACTIVE";
      if (hasBattery) {
        q.log = ["Prototype Singularity Battery secured! Deliver it back to Cipher in Club Afterlife."];
      } else if (hasCard) {
        q.log = ["VIP Keycard acquired. Head to Nouveau Cybernetic Showroom in Downtown and bypass their security."];
      } else {
        q.log = ["Meet with Cipher in the Downtown VIP Lounge of Club Afterlife."];
      }
    }
  }

  return quests;
}

export default function App() {
  // Screens: "menu" | "game" | "character_select" | "intro_story"
  const [currentScreen, setCurrentScreen] = useState<"menu" | "game" | "character_select" | "intro_story">("menu");
  
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- CHARACTER CUSTOMIZATION STATES ---
  const [customName, setCustomName] = useState("Kaelen");
  const [customAge, setCustomAge] = useState(24);
  const [customRace, setCustomRace] = useState("Human");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300");
  const [customBackground, setCustomBackground] = useState("Street Rat");
  const [selectedPerks, setSelectedPerks] = useState<string[]>(["Hardened Chassis"]);
  const [statPointsPool, setStatPointsPool] = useState(10);
  const [addedStats, setAddedStats] = useState({
    str: 0,
    dex: 0,
    int: 0,
    will: 0,
    eth: 0,
  });
  const [previewSkillTreeClass, setPreviewSkillTreeClass] = useState<string>("Cyber-Blade");
  
  // Custom manual terminal commands
  const [customInput, setCustomInput] = useState("");
  
  // Tabs for inventory deck
  const [activeTab, setActiveTab] = useState<"inventory" | "companions" | "quests">("inventory");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [questFilter, setQuestFilter] = useState<"all" | "main" | "side" | "completed">("all");

  // Gameplay view screens inside game mode: "exploration" | "database"
  const [gameTab, setGameTab] = useState<"exploration" | "database">("exploration");

  // Toggle log expansion
  const [expandLogs, setExpandLogs] = useState(false);

  // Stash Filter for Inventory sorting
  const [stashFilter, setStashFilter] = useState<"all" | "weapons" | "cyberware" | "consumables" | "valuables">("all");

  // State to track which companion is being edited in the detailed gear manager
  const [editingCompanionName, setEditingCompanionName] = useState<string | null>(null);

  // State to track whether the Base NPC Management modal is open
  const [baseNPCManagerOpen, setBaseNPCManagerOpen] = useState(false);

  // Shop Filter for buying items
  const [shopFilter, setShopFilter] = useState<string>("all");

  // Active Companion opinion bubble
  const [companionOpinion, setCompanionOpinion] = useState<{ name: string; line: string } | null>(null);
  
  // Highlighting selected companion in roster
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionState | null>(null);
  
  // Detailed Map View: ID of POI the player is currently viewing close-up inside the map box. 
  // If null, the player is viewing the global Holographic Region Map.
  const [activePOIView, setActivePOIView] = useState<string | null>(null);
  
  // Region currently focused on the global Holographic Map
  const [activeRegionId, setActiveRegionId] = useState<string>("aurus");
  
  // Dialogue state: ID of active NPC dialogue ("jax" | "aria" | "morgana" | "recruiter" | null)
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);

  // Squad dialogue state for conversations with Vice & Tracker
  const [squadDialogue, setSquadDialogue] = useState<{
    sceneId: "banter" | "peptalk" | "tactics";
    nodeId: string;
  } | null>(null);

  // In-your-face beautiful HUD notification popup
  const [activePopup, setActivePopup] = useState<{
    title: string;
    subtitle?: string;
    type: "transit" | "loot" | "check_success" | "check_failure" | "action_success";
    text: string;
  } | null>(null);

  // Advanced Shop vendor popup modal
  const [shopVendorOpen, setShopVendorOpen] = useState(false);

  // Cost calculator helper based on rarity and specific items
  const getItemCost = (itemName: string, details: any) => {
    if (itemName.includes("Mantis")) return 120;
    if (itemName.includes("Ether-deck")) return 140;
    if (itemName.includes("Heavy Plasma")) return 175;
    if (itemName.includes("Exo-Plated")) return 130;
    
    const itemRarity = details.rarity || "common";
    switch (itemRarity) {
      case "common": return 50;
      case "deluxe": return 90;
      case "epic": return 130;
      case "legendary": return 190;
      default: return 60;
    }
  };

  // Helper to compute derived stats including active equipment
  const getDerivedStats = () => {
    if (!gameState) {
      return {
        maxHp: 100,
        maxMana: 50,
        startingShields: 0,
        str: 10,
        dex: 10,
        int: 10,
        will: 10,
        eth: 10,
        meleeAtk: 0,
        rangeAtk: 0
      };
    }
    let maxHp = gameState.maxHp || 100;
    let maxMana = gameState.maxMana || 50;
    let startingShields = 0;

    // Apply active perks
    if (gameState.playerPerks?.includes("Hardened Chassis")) {
      maxHp += 20;
    }
    if (gameState.playerPerks?.includes("Cyber-Optimizer")) {
      startingShields += 10;
    }
    
    let str = gameState.attributes?.str || 10;
    let dex = gameState.attributes?.dex || 10;
    let int = gameState.attributes?.int || 10;
    let will = gameState.attributes?.will || 10;
    let eth = gameState.attributes?.eth || 10;

    let meleeAtk = 0;
    let rangeAtk = 0;

    const eq = gameState.equipment;
    if (eq) {
      const slots = ["meleeWeapon", "rangedWeapon", "armor", "headpiece", "trinket"] as const;
      slots.forEach(slot => {
        const itemName = eq[slot];
        if (itemName) {
          const details = ITEM_METADATA[itemName];
          if (details && details.stats) {
            const st = details.stats;
            if (st.maxHp) maxHp += st.maxHp;
            if (st.maxMana) maxMana += st.maxMana;
            if (st.startingShields) startingShields += st.startingShields;
            if (st.str) str += st.str;
            if (st.dex) dex += st.dex;
            if (st.int) int += st.int;
            if (st.will) will += st.will;
            if (st.eth) eth += st.eth;
            if (st.meleeAtk) meleeAtk += st.meleeAtk;
            if (st.rangeAtk) rangeAtk += st.rangeAtk;
          }
        }
      });
    }

    return {
      maxHp,
      maxMana,
      startingShields,
      str,
      dex,
      int,
      will,
      eth,
      meleeAtk,
      rangeAtk
    };
  };

  // Squad dialogue system configurations with companions Vice and Tracker
  const SQUAD_DIALOGUES: Record<
    "banter" | "peptalk" | "tactics",
    Record<
      string,
      {
        speakerName: string;
        speakerRole: string;
        portrait: string;
        text: string;
        choices: {
          text: string;
          nodeId: string | null;
          effect?: (state: any) => any;
        }[];
      }
    >
  > = {
    banter: {
      start: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "We're almost at the core, recruit. Tracker is sweating bullets and my plasma battery is only at seventy percent. How's your gear holding up?",
        choices: [
          {
            text: "My cybernetics are primed. We can handle whatever Ares throws at us.",
            nodeId: "vesper_confident"
          },
          {
            text: "This operation is getting hot. Is the payout really worth the risk?",
            nodeId: "vesper_worried"
          },
          {
            text: "Let's keep chatter on silent channels. Corporate scanners are active.",
            nodeId: "tracker_agrees"
          }
        ]
      },
      vesper_confident: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "Confidence is cheap, kid. But I like the fire in your circuit board. Keep that SMG ready—I'm getting faint energy spikes ahead. We're not alone in these shafts.",
        choices: [
          { text: "Roger that. Let's advance. (Exit Conversation)", nodeId: null }
        ]
      },
      vesper_worried: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "Always is, rookie. The Ares database crystals contain bio-synthetic schemas that the Outcast union will buy for ten thousand credits. We split that, and we can finally afford tickets out of Megacity-9 slums. Hang tight.",
        choices: [
          { text: "Understood. Let's get it done. (Exit Conversation)", nodeId: null }
        ]
      },
      tracker_agrees: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "The kid is right, Vice. Shut your grill. If their auditory arrays pick up your voice, we'll have an entire squad of Ares Enforcers sealing the vents. Focus on prying that valve.",
        choices: [
          { text: "Acknowledged. Staying silent. (Exit Conversation)", nodeId: null }
        ]
      }
    },
    peptalk: {
      start: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "Damn, look at those energy tripwires flashing. If we step on those, the defensive system will slice us into cyber-scrap. Tracker, can you hack it?",
        choices: [
          {
            text: "We've survived this far. Tracker, take your time. Vice and I have your back.",
            nodeId: "pep_trust"
          },
          {
            text: "If we panic, we're dead. Take a deep breath and clear your mind.",
            nodeId: "pep_calm",
            effect: (state) => {
              state.mana = Math.min(state.maxMana || 50, state.mana + 15);
              return state;
            }
          },
          {
            text: "Remember who we're doing this for. The Outcasts are counting on us.",
            nodeId: "pep_outcasts",
            effect: (state) => {
              state.hp = Math.min(state.maxHp || 100, state.hp + 15);
              return state;
            }
          }
        ]
      },
      pep_trust: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "Damn straight. I've got my railgun locked on the main corridor. No corporate drone is getting past me while Tracker does his magic. Let's do this!",
        choices: [
          { text: "Prepare yourself. (Exit Conversation)", nodeId: null }
        ]
      },
      pep_calm: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "Appreciate the neural grounding, kid. The ionization level is dropping in my sensors. Bypassing the security gate registers now... (You feel your own cognitive deck stabilize, gaining +15 Mana!)",
        choices: [
          { text: "Excellent. (Exit Conversation)", nodeId: null }
        ]
      },
      pep_outcasts: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "For the Union! Those suits in Megacity-9 towers think we're just scrap metal. Let's show them what outcast grit can do. I feel a surge of overdrive in my chassis! (Your squad is inspired, restoring +15 HP!)",
        choices: [
          { text: "For the Union. (Exit Conversation)", nodeId: null }
        ]
      }
    },
    tactics: {
      start: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "The main array core is just behind the next bulk door. The terminal registers show three heavy sentry drones patrolling the column. If we charge in blind, we'll be surrounded in seconds. What's the plan, recruit?",
        choices: [
          {
            text: "I'll lead the charge as a distraction. You two flank them.",
            nodeId: "tac_charge"
          },
          {
            text: "Let's siphon the bio-reactor core to cause a localized power blackout first.",
            nodeId: "tac_sabotage"
          },
          {
            text: "We set up an ambush right here, drawing them into this narrow reactor well.",
            nodeId: "tac_ambush"
          }
        ]
      },
      tac_charge: {
        speakerName: "Vice",
        speakerRole: "Heavy Weapons & Smuggler",
        portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        text: "Bold. Insane, but bold. I'll cover you with high-caliber plasma suppressive fire. The moment they target you, I'll melt their sensor lenses from the dark.",
        choices: [
          { text: "Sounds like a plan. (Exit Conversation)", nodeId: null }
        ]
      },
      tac_sabotage: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "Incredibly smart. Siphoning the reactor well will overload their recharge docks, shutting down their auxiliary energy shields! That gives us a massive combat advantage.",
        choices: [
          { text: "Let's execute it. (Exit Conversation)", nodeId: null }
        ]
      },
      tac_ambush: {
        speakerName: "Tracker",
        speakerRole: "Decker & Squad Leader",
        portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        text: "A tactical choke point. Yes, the narrow bridge of the reactor well restricts their flight patterns. We'll bottleneck them easily. You've got a sharp tactical processor, Vesper.",
        choices: [
          { text: "Agreed. Let's move. (Exit Conversation)", nodeId: null }
        ]
      }
    }
  };

  // Helper function to dynamically modify POI descriptions based on actions done
  const getPOIDescription = (poiId: string | null) => {
    if (!poiId || !gameState) return "";
    const basePOI = MAP_POIS.find(p => p.id === poiId);
    if (!basePOI) return "";

    const completed = gameState.completedPOIActions || [];

    if (poiId === "ventilation_shaft") {
      const scavDone = completed.includes("ventilation_shaft:scavenge");
      const casingDone = completed.includes("ventilation_shaft:casing");
      if (scavDone && casingDone) {
        return "A dark, cramped aerospace ventilation shaft. The emergency locker is open and empty. The loose metal casing has been completely removed from the frame. Only the spinning cooling fan remains.";
      } else if (scavDone) {
        return "A dark, cramped aerospace ventilation shaft. The rusted emergency locker is open and empty, but a loose carbon-reinforced casing is still attached to the duct.";
      } else if (casingDone) {
        return "A dark, cramped aerospace ventilation shaft. The ventilation casing has been dismantled, but a rusted emergency locker is still locked in the corner.";
      }
    }

    if (poiId === "security_terminal") {
      const lockerDone = completed.includes("security_terminal:locker");
      const batteryDone = completed.includes("security_terminal:battery");
      if (lockerDone && batteryDone) {
        return "A monitoring station with offline terminals. The weapons locker stands open and looted, and the auxiliary thermal battery cell socket is dark and empty.";
      } else if (lockerDone) {
        return "A monitoring station. The weapons locker stands open and empty. The auxiliary thermal battery cell is still humming in its socket.";
      } else if (batteryDone) {
        return "A monitoring station. The thermal battery cell is gone, but the secure heavy weapons locker remains locked.";
      }
    }

    if (poiId === "blast_door") {
      const barracksDone = completed.includes("blast_door:barracks");
      const binDone = completed.includes("blast_door:bin");
      if (barracksDone && binDone) {
        return "A massive, multi-layered hydraulic blast barrier. The nearby guard barracks are cleared out, and the corporate supply bin has been fully raided.";
      } else if (barracksDone) {
        return "A massive blast barrier. The guard barracks are empty, but the locked corporate supply bin is still intact.";
      } else if (binDone) {
        return "A massive blast barrier. The supply bin has been emptied, but the guard barracks are still unsearched.";
      }
    }

    if (poiId === "shatter_ridge_security_post") {
      const scavDone = completed.includes("shatter_ridge_security_post:scavenge");
      const gateDone = completed.includes("shatter_ridge_security_post:gate");
      if (scavDone && gateDone) {
        return "A fortified cyber-barrier checkpoint. The steel lockers lie open and ransacked. The defensive tripwires and security gate are permanently overloaded and inactive.";
      } else if (scavDone) {
        return "A fortified cyber-barrier checkpoint. The steel lockers are completely empty. Red defensive warning lights continue to flash across the security gate.";
      } else if (gateDone) {
        return "A fortified cyber-barrier checkpoint. The defensive tripwires are deactivated, but the heavy steel lockers remain locked.";
      }
    }

    if (poiId === "shatter_ridge_reactor_well") {
      const leverDone = completed.includes("shatter_ridge_reactor_well:lever");
      const coreDone = completed.includes("shatter_ridge_reactor_well:reactor_core");
      if (leverDone && coreDone) {
        return "A boiling pool of toxic bio-coolant fluid. The suspended cargo crate has been lowered and looted, and the bio-reactor core is dark and quiet.";
      } else if (leverDone) {
        return "A boiling pool of toxic bio-coolant. The cargo crate has been lowered and emptied, but the bio-reactor core is still hum-charging.";
      } else if (coreDone) {
        return "A boiling pool of toxic bio-coolant. The bio-reactor core has been dismantled, but the cargo crate still hangs overhead.";
      }
    }

    return basePOI.description;
  };

  // Helper to determine if an action button has already been consumed
  const isActionCompleted = (poiId: string | null, actionText: string) => {
    if (!poiId || !gameState || !gameState.completedPOIActions) return false;
    const clean = actionText.toLowerCase();
    if (poiId === "ventilation_shaft") {
      if (clean.includes("scavenge") && gameState.completedPOIActions.includes("ventilation_shaft:scavenge")) return true;
      if (clean.includes("dismantle") && gameState.completedPOIActions.includes("ventilation_shaft:casing")) return true;
      if (clean.includes("slip") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("force fan") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("trigger emp") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("hack fan") && gameState.completedPOIActions.includes("ventilation_shaft:slip")) return true;
      if (clean.includes("talk to") && gameState.completedPOIActions.includes("ventilation_shaft:talk_to_vice_tracker")) return true;
    }
    if (poiId === "security_terminal") {
      if (clean.includes("bypass") && gameState.completedPOIActions.includes("security_terminal:bypass")) return true;
      if (clean.includes("wreckage") && gameState.completedPOIActions.includes("security_terminal:wreckage")) return true;
      if (clean.includes("locker") && gameState.completedPOIActions.includes("security_terminal:locker")) return true;
      if (clean.includes("siphon") && gameState.completedPOIActions.includes("security_terminal:battery")) return true;
    }
    if (poiId === "blast_door") {
      if (clean.includes("pry") && gameState.completedPOIActions.includes("blast_door:pry")) return true;
      if (clean.includes("barracks") && gameState.completedPOIActions.includes("blast_door:barracks")) return true;
      if (clean.includes("supply") && gameState.completedPOIActions.includes("blast_door:bin")) return true;
      if (clean.includes("banter") && gameState.completedPOIActions.includes("blast_door:banter")) return true;
    }
    if (poiId === "shatter_ridge_security_post") {
      if (clean.includes("overclock") && gameState.completedPOIActions.includes("shatter_ridge_security_post:gate")) return true;
      if (clean.includes("scavenge") && gameState.completedPOIActions.includes("shatter_ridge_security_post:scavenge")) return true;
      if (clean.includes("pep-talk") && gameState.completedPOIActions.includes("shatter_ridge_security_post:peptalk")) return true;
    }
    if (poiId === "shatter_ridge_reactor_well") {
      if (clean.includes("pull") && gameState.completedPOIActions.includes("shatter_ridge_reactor_well:lever")) return true;
      if (clean.includes("salvage") && gameState.completedPOIActions.includes("shatter_ridge_reactor_well:reactor_core")) return true;
      if (clean.includes("tactics") && gameState.completedPOIActions.includes("shatter_ridge_reactor_well:tactics")) return true;
    }
    return false;
  };

  const handleEquipItem = (itemName: string) => {
    if (!gameState) return;
    const details = ITEM_METADATA[itemName];
    if (!details || !details.slot) return;
    const slot = details.slot as "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket";

    let nextState = { ...gameState };
    if (!nextState.equipment) {
      nextState.equipment = { meleeWeapon: null, rangedWeapon: null, armor: null, headpiece: null, trinket: null };
    }

    const previousItem = nextState.equipment[slot];
    if (previousItem) {
      nextState.inventory.push(previousItem);
    }

    nextState.equipment[slot] = itemName;
    nextState.inventory = nextState.inventory.filter((item, idx) => idx !== nextState.inventory.indexOf(itemName));

    setGameState(nextState);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotDisplay = slot === "meleeWeapon" ? "MELEE WEAPON" : slot === "rangedWeapon" ? "RANGED WEAPON" : slot;
    const logText = previousItem 
      ? `🔄 EQUIPMENT SWAPPED: Unequipped ${previousItem} and equipped ${itemName} into ${slotDisplay.toUpperCase()} slot!`
      : `🛡️ EQUIPMENT EQUIP: Equipped ${itemName} into ${slotDisplay.toUpperCase()} slot!`;

    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: logText,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    triggerToast(`EQUIPPED: ${itemName}`);
  };

  const handleUnequipItem = (slot: "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket") => {
    if (!gameState || !gameState.equipment) return;
    const itemName = gameState.equipment[slot];
    if (!itemName) return;

    let nextState = { ...gameState };
    nextState.inventory.push(itemName);
    nextState.equipment[slot] = null;

    setGameState(nextState);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slotDisplay = slot === "meleeWeapon" ? "MELEE WEAPON" : slot === "rangedWeapon" ? "RANGED WEAPON" : slot;
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🛡️ EQUIPMENT UNEQUIP: Unequipped ${itemName} from ${slotDisplay.toUpperCase()} slot. Returned to stash inventory.`,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    triggerToast(`UNEQUIPPED: ${itemName}`);
  };

  const handleEquipCompanionItem = (companionName: string, slot: "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket", itemName: string) => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp) return;
    
    if (!comp.equipment) {
      comp.equipment = {
        meleeWeapon: null,
        rangedWeapon: null,
        armor: null,
        headpiece: null,
        trinket: null
      };
    }
    
    const currentEquipped = comp.equipment[slot];
    
    // Remove from player inventory
    next.inventory = next.inventory.filter((item, idx) => idx !== next.inventory.indexOf(itemName));
    
    // Return previous item to player inventory
    if (currentEquipped) {
      next.inventory.push(currentEquipped);
    }
    
    comp.equipment[slot] = itemName;
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🛡️ MERCENARY GEAR COMPLETED: Equipped ${itemName} on ${companionName.toUpperCase()} into their ${slot.toUpperCase()} slot!`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Equipped on ${companionName}: ${itemName}`);
  };

  const handleUnequipCompanionItem = (companionName: string, slot: "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket") => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp || !comp.equipment) return;
    
    const currentEquipped = comp.equipment[slot];
    if (!currentEquipped) return;
    
    next.inventory.push(currentEquipped);
    comp.equipment[slot] = null;
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `🛡️ MERCENARY GEAR STRIPPED: Unequipped ${currentEquipped} from ${companionName.toUpperCase()}'s ${slot.toUpperCase()} slot. Returned to stash.`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Unequipped ${currentEquipped} from ${companionName}`);
  };

  const handleGiveCompanionItem = (companionName: string, itemName: string) => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp) return;
    
    if (!comp.inventory) {
      comp.inventory = [];
    }
    
    next.inventory = next.inventory.filter((item, idx) => idx !== next.inventory.indexOf(itemName));
    comp.inventory.push(itemName);
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `📦 ITEM TRANSFERRED: Transferred '${itemName}' from global stash to ${companionName.toUpperCase()}'s combat belt inventory.`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Transferred ${itemName} to ${companionName}`);
  };

  const handleTakeCompanionItem = (companionName: string, itemName: string) => {
    if (!gameState) return;
    let next = { ...gameState };
    const comp = next.companions.find(c => c.name === companionName);
    if (!comp || !comp.inventory) return;
    
    comp.inventory = comp.inventory.filter((item, idx) => idx !== comp.inventory.indexOf(itemName));
    next.inventory.push(itemName);
    setGameState(next);
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `📦 ITEM TRANSFERRED: Retrieved '${itemName}' from ${companionName.toUpperCase()}'s combat belt inventory into global stash.`,
        type: "system",
        district: next.district,
        poi: next.poi
      }
    ]);
    triggerToast(`Retrieved ${itemName} from ${companionName}`);
  };
  
  // Success toast indicators
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [hasSave, setHasSave] = useState(false);

  // Ventilation Shaft failure state for richer branch options
  const [ventFailed, setVentFailed] = useState(false);

  // Tactical grid-based combat structures
  interface GridCombatant {
    id: string;
    name: string;
    team: 'player' | 'enemy';
    hp: number;
    maxHp: number;
    shields: number;
    maxShields: number;
    x: number;
    y: number;
    avatar: string;
    color: string;
    range: number;
    damage: number;
    ap: number;
    maxAp: number;
    initiative: number;
    isDead: boolean;
    isCompanion?: boolean;
  }

  interface GridCombatState {
    combatants: GridCombatant[];
    turnOrder: string[];
    currentTurnIdx: number;
    selectedAction: "move" | "attack" | "spell" | "item" | null;
    turnLog: string;
  }

  const [gridCombat, setGridCombat] = useState<GridCombatState | null>(null);

  // Hex matching hacking mini-game state
  const [hackingPuzzle, setHackingPuzzle] = useState<{
    targets: { hex: string; matched: boolean }[];
    options: string[];
    selectedTargetIdx: number | null;
    status: "idle" | "playing" | "success" | "failure";
  } | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Dismiss companion from squad entirely
  const handleDismissCompanion = (companionName: string) => {
    if (!gameState) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextState = { ...gameState };
    
    // Set status to available
    const comp = nextState.companions.find(c => c.name === companionName);
    if (comp) {
      comp.status = "available";
    }
    
    // Remove from party
    nextState.party = nextState.party.filter(name => name !== companionName);
    
    setGameState(nextState);
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: `⚙️ ROSTER UPDATE: Discharged contractor [${companionName}] from active squad. They have returned to the Nexus Agency suite.`,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    triggerToast(`${companionName} dismissed from squad`);
  };

  // Companion talk feedback opinions
  const handleTalkCompanion = (comp: CompanionState) => {
    if (!gameState) return;
    
    const companionLines: Record<string, Record<string, string>> = {
      Scythe: {
        docks: "The seawater around these slipways is highly contaminated. Watch your footing on those rusty cargo loaders. Keep a blade ready, I smell scavengers.",
        downtown: "Too many high-resolution cameras down these sky canyons. If an automated security bot scans our profile, we'll be in high security before sunrise.",
        satoshi: "All these glowing server shrines hum too loud. High technomancy and cybernetics... it's a volatile brew. Keep your distance from Morgana's ley cores.",
        default: "I've seen empires crumble under Megacity-9 slums. Jax is a decent coordinator, but when the bullets fly, trust your alloy blade first."
      },
      Vex: {
        docks: "I'm siphoning shipping manifest logs from these automatic logistics nodes! Lots of corporate contraband flowing here. Want me to slice open a cargo hatch?",
        downtown: "Look at those massive corporate firewalls! Ares Biotech has incredible security layers. My deck is heating up just scanning them. Pure digital bliss!",
        satoshi: "High Priestess Morgana is the real deal! Technomancy at its finest. I can feel the pure static ley currents charging my network visor. Let me hack the temple columns!",
        default: "Aurus slums are alright if you don't mind the neon acid rain. Need some local transaction overrides? Just ask Vex."
      },
      Brick: {
        docks: "Smells like rotten seaweed and mechanical grease. Perfect. Let those giant mutant sludge beasts crawl out... my electro-fists are hungry for a crush.",
        downtown: "If those fancy corporate enforcers look at us wrong, my alloy knuckles are going straight through their chrome faceplates. Keep moving.",
        satoshi: "All these digital cherry trees are fake holograms, but the server exhaust vents are perfect for warming up my hydraulic hydraulics.",
        default: "We need bigger stims and thicker armor meshes. But for now, my custom double-barreled shotgun has plenty of explosive scrap shells."
      }
    };

    const currentRegionId = gameState.district || "aurus";
    const companionData = companionLines[comp.name] || { default: "Let's keep moving. Megacity-9 doesn't sleep." };
    const dialogueLine = companionData[currentRegionId] || companionData.default;

    setCompanionOpinion({
      name: comp.name,
      line: dialogueLine
    });
  };

  // Tactical grid-based combat initialization helper
  const initGridCombat = (
    enemyName: string,
    enemyHp: number,
    enemyMaxHp: number,
    enemyShields: number,
    enemyMaxShields: number,
    district: string,
    party: string[],
    archetype: string
  ) => {
    let pRange = archetype === "Cyber-Blade" ? 1 : 3;
    let pDmg = archetype === "Cyber-Blade" ? 22 : archetype === "Techno-Mage" ? 28 : 18;
    let pAvatar = archetype === "Cyber-Blade" ? "⚔️" : archetype === "Techno-Mage" ? "🔮" : "🔫";
    let pShields = 0;

    if (gameState?.inventory.includes("Tactical Cyber-SMG")) {
      pRange = 3;
      pDmg = Math.max(pDmg, 24);
      pAvatar = "🔫";
    }
    if (gameState?.inventory.includes("Carbon Fiber Armor Plates")) {
      pShields += 30;
    }
    if (gameState?.inventory.includes("Tactical Flak Armor")) {
      pShields += 45;
    }
    if (gameState?.inventory.includes("Cyber-Ammo")) {
      pDmg += 6;
    }

    const combatants: GridCombatant[] = [
      {
        id: "player",
        name: `You (${archetype})`,
        team: "player",
        hp: gameState?.hp || 100,
        maxHp: gameState?.maxHp || 100,
        shields: pShields,
        maxShields: pShields,
        x: 1,
        y: 2,
        avatar: pAvatar,
        color: "border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]",
        range: pRange,
        damage: pDmg,
        ap: 2,
        maxAp: 2,
        initiative: 12 + Math.floor(Math.random() * 5),
        isDead: false
      }
    ];

    // Prologue companions
    if (["conduit09", "shatter_ridge_core"].includes(district)) {
      combatants.push({
        id: "vice",
        name: "Vice (Companion)",
        team: "player",
        hp: 120,
        maxHp: 120,
        shields: 0,
        maxShields: 0,
        x: 1,
        y: 1,
        avatar: "🔫",
        color: "border-rose-500 text-rose-400",
        range: 3,
        damage: 16,
        ap: 2,
        maxAp: 2,
        initiative: 14,
        isDead: false,
        isCompanion: true
      });
      combatants.push({
        id: "tracker",
        name: "Tracker (Companion)",
        team: "player",
        hp: 90,
        maxHp: 90,
        shields: 0,
        maxShields: 0,
        x: 0,
        y: 3,
        avatar: "📟",
        color: "border-amber-500 text-amber-400",
        range: 3,
        damage: 12,
        ap: 2,
        maxAp: 2,
        initiative: 13,
        isDead: false,
        isCompanion: true
      });
    } else if (district === "data_vault") {
      combatants.push({
        id: "vice",
        name: "Vice (Companion)",
        team: "player",
        hp: 75,
        maxHp: 120,
        shields: 0,
        maxShields: 0,
        x: 1,
        y: 1,
        avatar: "🔫",
        color: "border-rose-500 text-rose-400",
        range: 3,
        damage: 16,
        ap: 2,
        maxAp: 2,
        initiative: 14,
        isDead: false,
        isCompanion: true
      });
    } else {
      // Chapter 1 onwards
      party.forEach((name, idx) => {
        if (name === "Scythe") {
          combatants.push({
            id: "scythe",
            name: "Scythe (Companion)",
            team: "player",
            hp: 100,
            maxHp: 100,
            shields: 10,
            maxShields: 10,
            x: 0,
            y: idx + 1,
            avatar: "🥷",
            color: "border-teal-500 text-teal-400",
            range: 1,
            damage: 24,
            ap: 2,
            maxAp: 2,
            initiative: 16,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Vex") {
          combatants.push({
            id: "vex",
            name: "Vex (Companion)",
            team: "player",
            hp: 80,
            maxHp: 80,
            shields: 0,
            maxShields: 0,
            x: 0,
            y: idx + 1,
            avatar: "🔮",
            color: "border-purple-500 text-purple-400",
            range: 4,
            damage: 26,
            ap: 2,
            maxAp: 2,
            initiative: 11,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Brick") {
          combatants.push({
            id: "brick",
            name: "Brick (Companion)",
            team: "player",
            hp: 150,
            maxHp: 150,
            shields: 30,
            maxShields: 30,
            x: 0,
            y: idx + 1,
            avatar: "🦾",
            color: "border-stone-500 text-stone-400",
            range: 1,
            damage: 18,
            ap: 2,
            maxAp: 2,
            initiative: 8,
            isDead: false,
            isCompanion: true
          });
        } else if (name === "Trigger") {
          combatants.push({
            id: "trigger",
            name: "Trigger (Companion)",
            team: "player",
            hp: 95,
            maxHp: 95,
            shields: 15,
            maxShields: 15,
            x: 0,
            y: idx + 1,
            avatar: "🔫",
            color: "border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
            range: 4,
            damage: 20,
            ap: 2,
            maxAp: 2,
            initiative: 12,
            isDead: false,
            isCompanion: true
          });
        }
      });
    }

    // Add primary enemy
    const isBoss = enemyName.includes("Behemoth") || enemyName.includes("Ares Prime") || enemyName.includes("Special Ops Commander");
    combatants.push({
      id: "enemy-1",
      name: enemyName,
      team: "enemy",
      hp: enemyHp,
      maxHp: enemyMaxHp,
      shields: enemyShields,
      maxShields: enemyMaxShields,
      x: 6,
      y: 2,
      avatar: isBoss ? "👹" : enemyName.includes("Drone") ? "🤖" : "🕴️",
      color: "border-red-500 text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
      range: isBoss ? 2 : enemyName.includes("Drone") ? 3 : 2,
      damage: isBoss ? 24 : 14,
      ap: 2,
      maxAp: 2,
      initiative: 10 + Math.floor(Math.random() * 4),
      isDead: false
    });

    // Add 1 auxiliary enemy if not solo weak mob
    if (enemyHp >= 40) {
      const isMech = enemyName.includes("Drone") || enemyName.includes("Security");
      combatants.push({
        id: "enemy-2",
        name: isMech ? "Sentry Watcher Drone" : "Corporate Patrol Guard",
        team: "enemy",
        hp: Math.floor(enemyHp * 0.45) || 25,
        maxHp: Math.floor(enemyHp * 0.45) || 25,
        shields: 0,
        maxShields: 0,
        x: 7,
        y: isMech ? 1 : 3,
        avatar: isMech ? "🛸" : "👮",
        color: "border-red-400 text-red-400",
        range: isMech ? 3 : 2,
        damage: isMech ? 8 : 10,
        ap: 2,
        maxAp: 2,
        initiative: 11,
        isDead: false
      });
    }

    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
    const turnOrder = sorted.map(c => c.id);

    return {
      combatants,
      turnOrder,
      currentTurnIdx: 0,
      selectedAction: "move" as const,
      turnLog: `Tactical grid combat initialized. All units deployed. ${sorted[0].name} has the initiative!`
    };
  };

  // Sync grid combat with game state combat changes
  useEffect(() => {
    if (gameState?.combatState?.isActive && !gridCombat) {
      const combat = gameState.combatState;
      const initialGrid = initGridCombat(
        combat.enemyName,
        combat.enemyHp,
        combat.enemyMaxHp,
        combat.enemyShields,
        combat.enemyMaxShields,
        gameState.district,
        gameState.party,
        gameState.archetype
      );
      setGridCombat(initialGrid);
    } else if (!gameState?.combatState?.isActive && gridCombat) {
      setGridCombat(null);
    }
  }, [gameState?.combatState?.isActive]);

  // Check if save exists on load
  useEffect(() => {
    const savedState = localStorage.getItem("neon_ether_state");
    if (savedState) {
      setHasSave(true);
    }
  }, []);

  // Scroll to latest logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Command keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== "game" || !gameState || isLoading) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      
      const buttons = gameState.combatState?.isActive
        ? ["Physical Attack", "Spell Slash", "Cyber Hack", "Quick Item", "Attempt Flee"]
        : activePOIView 
          ? (activePOIView === "ventilation_shaft" && ventFailed
            ? ["Force Fan Blades (STR Check)", "Trigger EMP Burst (EMP Explosion!)", "Hack Fan Console (INT Check)"]
            : (MAP_POIS.find(p => p.id === activePOIView)?.buttons || []))
          : [];
        
      const keyIndex = parseInt(e.key) - 1;
      if (keyIndex >= 0 && keyIndex < buttons.length) {
        e.preventDefault();
        handleExecuteAction(buttons[keyIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, isLoading, currentScreen, activePOIView]);

  // Load from LocalStorage
  const handleLoadGame = () => {
    const savedState = localStorage.getItem("neon_ether_state");
    const savedLogs = localStorage.getItem("neon_ether_logs");
    if (savedState && savedLogs) {
      try {
        const parsedState = JSON.parse(savedState);
        // Clean migration of old state variables
        const isBlade = parsedState.archetype === "Cyber-Blade";
        const isMage = parsedState.archetype === "Techno-Mage";
        const migratedState: GameState = {
          district: "aurus",
          poi: "Main Headquarters (The Hideout)",
          hp: 100,
          maxHp: 100,
          mana: 50,
          maxMana: 50,
          credits: 100,
          party: [],
          activeQuests: [],
          completedQuests: [],
          inventory: [],
          companions: [],
          combatState: null,
          archetype: "Cyber-Blade",
          level: 1,
          experience: 0,
          day: 1,
          timeOfDay: "Morning",
          attributes: {
            str: isBlade ? 14 : isMage ? 9 : 10,
            dex: isBlade ? 15 : isMage ? 11 : 13,
            int: isBlade ? 10 : isMage ? 14 : 15,
            will: isBlade ? 11 : isMage ? 12 : 11,
            eth: isBlade ? 10 : isMage ? 15 : 11,
          },
          skills: {
            cyberBlade: isBlade ? 3 : isMage ? 1 : 1,
            netSlicer: isBlade ? 1 : isMage ? 2 : 3,
            heavyChrome: isBlade ? 2 : isMage ? 1 : 1,
            mindmancer: isMage ? 1 : 0
          },
          equipment: {
            meleeWeapon: null,
            rangedWeapon: null,
            armor: null,
            headpiece: null,
            trinket: null
          },
          ...parsedState
        };

        // Migrate old weapon slot if exists
        if (migratedState.equipment && (migratedState.equipment as any).weapon) {
          const oldWeapon = (migratedState.equipment as any).weapon;
          delete (migratedState.equipment as any).weapon;
          const details = ITEM_METADATA[oldWeapon];
          if (details && details.slot === "meleeWeapon") {
            migratedState.equipment.meleeWeapon = oldWeapon;
          } else if (details && details.slot === "rangedWeapon") {
            migratedState.equipment.rangedWeapon = oldWeapon;
          } else {
            migratedState.equipment.meleeWeapon = oldWeapon;
          }
        }
        setGameState(migratedState);
        setLogs(JSON.parse(savedLogs));
        setActiveRegionId(migratedState.district || "aurus");
        
        // If they were at a POI, open its detailed view
        const targetPOI = MAP_POIS.find(p => p.name === migratedState.poi);
        if (targetPOI) {
          setActivePOIView(targetPOI.id);
        }
        
        setCurrentScreen("game");
        triggerToast("VIRTUAL MEMORY STREAM RESTORED SUCCESS");
      } catch (e) {
        console.error("Failed to restore save game file", e);
        triggerToast("CRITICAL FAIL: CORRUPTED DATA DECK");
      }
    } else {
      triggerToast("FAILED: NO RESIDUAL CELL RECOVERY FILE FOUND");
    }
  };

  // Save changes to localStorage manually
  const handleSaveGame = () => {
    if (gameState) {
      localStorage.setItem("neon_ether_state", JSON.stringify(gameState));
      localStorage.setItem("neon_ether_logs", JSON.stringify(logs));
      setHasSave(true);
      triggerToast("NUCLEUS SAVE CHANNEL SYNCED [OK]");
    }
  };

  // Wipe Save completely and return to main menu
  const handleRestartFull = () => {
    localStorage.removeItem("neon_ether_state");
    localStorage.removeItem("neon_ether_logs");
    setGameState(null);
    setLogs([]);
    setHasSave(false);
    setActivePOIView(null);
    setActiveDialogue(null);
    setCurrentScreen("menu");
    triggerToast("AGENT CONSPIRACY PURGED COMPLETELY");
  };

  // Skip Intro and begin Chapter 1 in Aurus Hideout base
  const handleSkipIntro = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Seed initial baseNPCs if missing
    const starterNPCs = [
      {
        id: "aria",
        name: "Chancellor Aria",
        role: "High Commander",
        avatar: "👑",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
        description: "You catch Aria standing inside your headquarters, analyzing holo-maps of the Megacity grid sectors. Clad in a dark leather officer outfit, she carries a severe authority that demands absolute discipline.",
        dialogue: "Master. It is excellent to see you. The base is operational, but we must expand our parameters. State your directives or allocate me to research protocols.",
        reaction: null,
        happiness: 80,
        affection: "Amiable",
        affectionValue: 65,
        willpower: 82,
        corruption: 39,
        hygiene: "Normal",
        discipline: 90,
        hunger: "Well-fed",
        respect: 21,
        withdrawRisk: "None",
        anger: 0,
        defiance: 0,
        fear: 0,
        inventory: ["Corpo Security Pistol", "Cheap Combat Armor"],
        currentJob: "Idle / Chilling"
      },
      {
        id: "mia",
        name: "Mia",
        role: "Base Specialist",
        avatar: "🌸",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
        description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
        dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
        reaction: null,
        happiness: 95,
        affection: "Warm",
        affectionValue: 78,
        willpower: 45,
        corruption: 10,
        hygiene: "Excellent",
        discipline: 60,
        hunger: "Satiated",
        respect: 85,
        withdrawRisk: "None",
        anger: 0,
        defiance: 5,
        fear: 15,
        inventory: ["Copper-Wire Ring"],
        currentJob: "Base Supply Chef"
      },
      {
        id: "scythe_base",
        name: "Scythe",
        role: "Security Coordinator",
        avatar: "👤",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
        description: "Scythe sits quietly on an ammo crate, field-stripping her customized monoblade. The ambient neon light reflects off her active camo plating.",
        dialogue: "Report, Boss. Perimeter sensor sweeps are green, but corporate signal sniffers are active nearby. Give me a target, or I'll run another patrol.",
        reaction: null,
        happiness: 75,
        affection: "Amiable",
        affectionValue: 50,
        willpower: 95,
        corruption: 20,
        hygiene: "Normal",
        discipline: 85,
        hunger: "Well-fed",
        respect: 75,
        withdrawRisk: "None",
        anger: 10,
        defiance: 15,
        fear: 5,
        inventory: ["Nano-alloy Katana"],
        currentJob: "Defensive Security Guard"
      }
    ];

    setGameState(prev => {
      // If gameState is not loaded (e.g. from main menu), initialize with the Cyber-Blade archetype
      const current = prev || getInitialState(ARCHETYPES[0]);
      
      return {
        ...current,
        district: "aurus",
        poi: "Aurus Safehouse (The Hideout)",
        activeQuests: [
          "Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."
        ],
        completedQuests: ["Prologue: Data Vault Infiltration"],
        stamina: 100,
        maxStamina: 100,
        credits: Math.max(current.credits, 450), // Provide test currency for gifting & testing
        baseNPCs: [],
        activeBaseNPCId: null,
        safehouseDefenses: current.safehouseDefenses || {
          securityLevel: 1,
          turrets: 0,
          shieldStrength: 100,
          fortifiedDoors: false,
          intrusionLogs: [
            "🔋 Safehouse initial power grid linked successfully.",
            "📡 Stealth frequency beacon activated - safehouse hidden from city radars."
          ]
        }
      };
    });

    setLogs(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: "⚡ NEURAL MATRIX SYNC OVERRIDE: Skip initiated. Prologue bypassed, Chapter 1 unlocked. Welcome to Aurus Base Headquarters.",
        type: "system"
      },
      ...prev
    ]);

    setActivePOIView("hideout");
    setActiveDialogue(null);
    setCurrentScreen("game");
    triggerToast("CHAPTER 1 BEGUN: BASE CREW CONSOLE OPENED");
  };

  // Helper alert notifier
  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 4000);
  };

  // Unified helper to calculate stamina loss, weather debuffs, and random weather transitions on travel
  const handleStaminaAndWeatherOnTravel = (
    state: GameState,
    isRegionChange: boolean,
    destinationName: string
  ): { nextState: GameState; warningText: string | null; logs: LogMessage[] } => {
    let nextState = { ...state };
    let logs: LogMessage[] = [];
    let warningText: string | null = null;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Calculate base cost
    let staminaCost = isRegionChange ? 15 : 8;

    // 2. Weather adjustments to stamina cost
    const activeWeather = nextState.weather || "clear";
    if (activeWeather === "rain") {
      staminaCost += 2;
    } else if (activeWeather === "snow") {
      staminaCost += 3;
    } else if (activeWeather === "storm") {
      staminaCost += 5;
    } else if (activeWeather === "heat") {
      staminaCost += 5;
    } else if (activeWeather === "smog") {
      staminaCost += 4;
    }

    // 3. Deduct stamina
    const previousStamina = nextState.stamina;
    nextState.stamina = Math.max(0, nextState.stamina - staminaCost);
    const finalStamina = nextState.stamina;

    const logsText: string[] = [];
    logsText.push(`🔋 STAMINA DECREASED: Consumed ${staminaCost} stamina points during transit to "${destinationName}" (Remaining: ${finalStamina}/100).`);

    // 4. Apply weather debuffs on health/mana
    if (activeWeather === "smog") {
      // Holographic smog drains HP and Mana due to toxic exposure
      nextState.hp = Math.max(5, nextState.hp - 3);
      nextState.mana = Math.max(0, nextState.mana - 3);
      logsText.push(`😷 TOXIC SMOG INHALED: Severe neon pollution in area. Suffered minor organic degradation: -3 HP, -3 Ether.`);
    } else if (activeWeather === "heat") {
      // Extreme heat has 25% chance of applying minor damage or dehydrating
      if (Math.random() < 0.3) {
        nextState.hp = Math.max(5, nextState.hp - 5);
        logsText.push(`🥵 HEATSTROKE WARNING: Core temperatures exceeded safe limits during transit through thermal zones: -5 HP.`);
      }
    } else if (activeWeather === "storm") {
      // Static discharges
      if (Math.random() < 0.25) {
        nextState.hp = Math.max(5, nextState.hp - 4);
        logsText.push(`⚡ LIGHTNING STATIC STRIKE: Ambient magnetic storms caused static discharge into neural implants: -4 HP.`);
      }
    } else if (activeWeather === "snow") {
      // Chilled / acidic frost reduces active Mana slightly
      nextState.mana = Math.max(0, nextState.mana - 2);
      logsText.push(`❄️ ACID FROST COOLING: Severe cybernetic temperature drop. Drained minor neural energy: -2 Ether.`);
    }

    // 5. Check if stamina has reached 0
    if (finalStamina === 0 && previousStamina > 0) {
      warningText = "⚠️ SYSTEM BLACKOUT: Your stamina is fully depleted! You are severely exhausted. Return to the Safehouse to rest/sleep.";
      logsText.push(`🚨 CRITICAL EMERGENCY: Stamina depleted to 0%. Locomotor and hacking modules locked in Safe Mode. You cannot perform further operations until you Rest/Sleep at Aurus Safehouse!`);
    }

    // 6. Roll for new weather (45% chance on travel/region change)
    if (Math.random() < 0.45) {
      const weatherPool: ("clear" | "rain" | "snow" | "storm" | "heat" | "smog")[] = [
        "clear", "clear", "rain", "snow", "storm", "heat", "smog"
      ];
      const newWeather = weatherPool[Math.floor(Math.random() * weatherPool.length)];
      if (newWeather !== activeWeather) {
        nextState.weather = newWeather;
        const weatherNames = {
          clear: "Clear/Optimal Skies ☀️",
          rain: "Acid Rain Storm 🌧️ (+2 Stamina Drain)",
          snow: "Neon Frost Snow ❄️ (+3 Stamina Drain, -2 Ether on Travel)",
          storm: "Magnetic Lightning Storm ⚡ (+5 Stamina Drain, Static Strike Risk)",
          heat: "Thermal Overheat waves 🥵 (+5 Stamina Drain, Dehydration Risk)",
          smog: "Toxic Holographic Smog 😷 (+4 Stamina Drain, -3 HP/-3 Ether on Travel)"
        };
        logsText.push(`🌤️ WEATHER CORRIDOR UPDATE: Climatology grid shifted. Current conditions: ${weatherNames[newWeather]}.`);
      }
    }

    // Transform logsText array into LogMessage structures
    logsText.forEach(txt => {
      logs.push({
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: txt,
        type: "system",
        district: nextState.district,
        poi: nextState.poi
      });
    });

    return { nextState, warningText, logs };
  };

  // Deploy fresh agent from archetype select
  const handleDeployAgent = async () => {
    setIsLoading(true);
    const initial = getInitialState(selectedArchetype);
    
    // Set custom properties
    initial.playerName = customName.trim() || "Kaelen";
    initial.playerAge = customAge;
    initial.playerRace = customRace;
    initial.playerAvatarUrl = customAvatarUrl;
    initial.playerBackground = customBackground;
    initial.playerPerks = selectedPerks;
    
    // Establish base attributes
    const baseAttrs = { ...initial.attributes };
    
    // Add player's distributed stat points
    baseAttrs.str = (baseAttrs.str || 10) + addedStats.str;
    baseAttrs.dex = (baseAttrs.dex || 10) + addedStats.dex;
    baseAttrs.int = (baseAttrs.int || 10) + addedStats.int;
    baseAttrs.will = (baseAttrs.will || 10) + addedStats.will;
    baseAttrs.eth = (baseAttrs.eth || 10) + addedStats.eth;
    
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
    } else if (customRace === "Neuro-Elf") {
      baseAttrs.int += 2;
      baseAttrs.will += 2;
      baseAttrs.str -= 1;
    } else if (customRace === "Chrome-Dwarf") {
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
    
    // Apply Perk modifiers during creation
    if (selectedPerks.includes("Lucky Jack")) {
      initial.credits += 40;
    }
    if (selectedPerks.includes("Hardened Chassis")) {
      initial.maxHp = (initial.maxHp || 100) + 20;
      initial.hp = initial.maxHp;
    }
    
    initial.attributes = baseAttrs;
    
    const welcomeLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `DEPLOYED AGENT [${initial.playerName}] (${customRace} ${selectedArchetype.name}) into Megacity-9 slums. Background: ${customBackground}. Perks: ${selectedPerks.join(", ") || "None"}. Initial gear established: ${initial.inventory.join(", ")}. Primary credits balance: ${initial.credits}¤.\n\nYour organic cybernetic cortex aligns with sol-prime parameters. The neon glow hums underneath your heels.\n\nSelect districts on the overland map to scan. Enter POIs to trigger local interaction consoles.`,
      type: "system",
      district: initial.district,
      poi: initial.poi
    };

    setLogs([welcomeLog]);
    setGameState(initial);
    setActiveRegionId("conduit09");
    setActivePOIView("ventilation_shaft"); // Start initialized right inside the Ventilation Shaft detailed view!
    setCurrentScreen("intro_story");
    setIsLoading(false);
  };

  // Switch active region of the map
  const handleSwitchRegion = (regionId: string) => {
    const reg = REGIONS.find(r => r.id === regionId);
    if (!reg || !gameState) return;

    // Check if player is currently in the prologue
    if (["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district)) {
      triggerToast("SYSTEM ERROR: LOCAL COGNITIVE BOUNDS ENGAGED - HEIST IN PROGRESS");
      return;
    }

    if (gameState.stamina <= 0) {
      triggerToast("STAMINA EXHAUSTED: Transit channel locked. You must rest/sleep at Aurus Safehouse.");
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `❌ TRANSIT INTERRUPTED: Monorail interface refused neural link. Locomotor stamina depleted (0/100). Return to Aurus Safehouse immediately.`,
          type: "system",
          district: gameState.district,
          poi: gameState.poi
        }
      ]);
      return;
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Auto-travel to the first POI in that region to maintain visual cohesion
    const firstPOI = MAP_POIS.find(p => p.district === regionId);
    let nextState = { ...gameState };
    
    if (firstPOI) {
      nextState.district = regionId;
      nextState.poi = firstPOI.name;
      setActivePOIView(firstPOI.id);
    }
    
    setActiveRegionId(regionId);

    // Deduct stamina and process weather consequences
    const travelResult = handleStaminaAndWeatherOnTravel(nextState, true, reg.name);
    nextState = travelResult.nextState;
    setGameState(nextState);

    const log: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: timeString,
      text: `[TRANSIT CHANNEL OPEN]: Deployed magnetic monorail to ${reg.name}. Scanning coordinates at local POI: ${firstPOI ? firstPOI.name : "Highwalks"}...`,
      type: "system",
      district: regionId,
      poi: firstPOI ? firstPOI.name : "Transit Node"
    };
    setLogs(prev => [...prev, log, ...travelResult.logs]);

    if (travelResult.warningText) {
      triggerToast(travelResult.warningText);
    }
  };

  // Interactive local actions calculation
  const handleExecuteAction = async (actionText: string) => {
    if (!gameState || isLoading || !actionText.trim()) return;
    
    setIsLoading(true);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add command to log list
    const actionLog: LogMessage = {
      id: crypto.randomUUID(),
      timestamp: timeString,
      text: `> ${actionText}`,
      type: "action",
      district: gameState.district,
      poi: gameState.poi
    };

    setLogs(prev => [...prev, actionLog]);
    
    // Short artificial delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let nextState = { ...gameState };
    if (!nextState.completedPOIActions) {
      nextState.completedPOIActions = [];
    }
    let narrative = "";
    let logType: LogMessage["type"] = "narration";

    const cleanAction = actionText.toLowerCase();

    const isRestAction = cleanAction.includes("rest & recover") || cleanAction.includes("rest and sleep");
    const isEmergencyAdrenaline = cleanAction.includes("emergency adrenaline dose");
    const isEmergencyGrate = cleanAction.includes("heavy rest on back-alley grate");
    const isFastTravelHome = cleanAction.includes("fast-travel home to sleep");
    const isEmergency = isEmergencyAdrenaline || isEmergencyGrate || isFastTravelHome;

    // 1. Stamina depletion guard: block standard actions if stamina is 0 and it's not a rest/emergency/combat action
    if (gameState.stamina <= 0 && !isRestAction && !isEmergency && !gameState.combatState?.isActive) {
      setIsLoading(false);
      triggerToast("STAMINA EXHAUSTED: Rest/Sleep required.");
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `❌ ACTION REJECTED: Neural stamina fully depleted (0/100). Perform an Emergency Action or Rest/Sleep immediately!`,
          type: "system",
          district: gameState.district,
          poi: gameState.poi
        }
      ]);
      return;
    }

    // 2. Handle Emergency actions
    if (isEmergency) {
      if (isEmergencyAdrenaline) {
        if (nextState.credits >= 25) {
          nextState.credits -= 25;
          nextState.stamina = Math.min(100, nextState.stamina + 40);
          narrative = `💉 ADRENALINE DEPOT UNLEASHED: Injected an emergency military-grade adrenaline serum into your spinal port (-25¤). Neural stamina recharged to ${nextState.stamina}/100. Let's move!`;
          triggerToast("Injected Adrenaline: +40 Stamina");
        } else {
          narrative = `❌ INSUFFICIENT FUNDS: An Emergency Adrenaline Dose requires 25¤. Your current balance is ${nextState.credits}¤.`;
          triggerToast("Insufficient Credits!");
        }
      } else if (isEmergencyGrate) {
        const hpLoss = 10;
        if (nextState.hp > 12) {
          nextState.hp -= hpLoss;
          nextState.stamina = Math.min(100, nextState.stamina + 20);
          narrative = `💤 UNCOMFORTABLE BACK-ALLEY INTERMISSION: Rested on a vibrating hot-steam ventilation grate under radioactive neon pollution. Recharged +20 Stamina, but sustained severe body chassis soreness and toxic exposure: -${hpLoss} HP. Current Stamina: ${nextState.stamina}/100, HP: ${nextState.hp}/${nextState.maxHp}.`;
          triggerToast("Took Back-Alley Nap: +20 Stamina, -10 HP");
        } else {
          narrative = `❌ CRITICAL HP WARNING: Your health (${nextState.hp} HP) is too low to safely sleep on the contaminated back-alley grates. You would not survive the toxic exposure!`;
          triggerToast("HP Too Low to Sleep on Grates!");
        }
      } else if (isFastTravelHome) {
        if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
          narrative = `❌ TRANSIT ERROR: Cognitive bounds engaged. Heist operations are in progress; fast travel is blocked.`;
          triggerToast("Fast Travel Blocked!");
        } else {
          // Perform home sleep
          nextState.district = "aurus";
          nextState.poi = "Aurus Safehouse (The Hideout)";
          setActiveRegionId("aurus");
          setActivePOIView("hideout");
          
          nextState.hp = nextState.maxHp;
          nextState.mana = nextState.maxMana;
          nextState.stamina = nextState.maxStamina; // FULL REPLENISH!
          nextState.weather = "clear"; // RESET WEATHER!
          nextState.timeOfDay = "Morning";
          nextState.day += 1;

          let passiveText = "";
          
          // Core companion node wages
          let totalWage = 0;
          nextState.companions.forEach(c => {
            if (c.status === "working") totalWage += 35;
          });
          if (totalWage > 0) {
            nextState.credits += totalWage;
            passiveText += `\n\n💎 CREW HARVEST DECK: Hired mercenaries delivered automated sub-node payout: +${totalWage}¤.`;
          }

          // Base Crew Jobs Passive Production
          const baseNPCsList = nextState.baseNPCs || [];

          // Hacker Network Operators
          const hackerCount = baseNPCsList.filter(n => n.currentJob === "Hacker Network Operator").length;
          if (hackerCount > 0) {
            const earnings = hackerCount * 45;
            nextState.credits += earnings;
            passiveText += `\n\n💻 HACKER NETWORK INCOME: ${hackerCount} base operator(s) tapped corporate bank sub-nodes: +${earnings}¤ deposited.`;
          }

          // Base Supply Chefs (with Luxury Kitchen support)
          const chefCount = baseNPCsList.filter(n => n.currentJob === "Base Supply Chef").length;
          if (chefCount > 0) {
            const isKitchenUpgraded = nextState.safehouseUpgrades?.kitchenUpgraded;
            const mealsPerChef = isKitchenUpgraded ? 2 : 1;
            const totalMeals = chefCount * mealsPerChef;
            for (let i = 0; i < totalMeals; i++) {
              nextState.inventory.push("Synthetic Nutrient Plate");
            }
            passiveText += `\n\n🍗 CHEF KITCHEN BATCH: ${chefCount} base chef(s) prepped ${totalMeals} hot meals ${isKitchenUpgraded ? "[Luxury Kitchen x2 Boost!]" : ""}: placed in stash.`;
          }

          // Dojo Training Coaches (with Dojo Mat Expansion support)
          const coachCount = baseNPCsList.filter(n => n.currentJob === "Dojo Training Coach").length;
          const isDojoUpgraded = nextState.safehouseUpgrades?.dojoUpgraded;
          if (coachCount > 0 || isDojoUpgraded) {
            nextState.dojoBuffActive = true;
            const bonusPct = isDojoUpgraded ? "+30%" : "+15%";
            passiveText += `\n\n⚔️ DOJO TRAINING CALIBRATION: Dojo coaches & automated combat mats fine-tuned your blades: granted ${bonusPct} Melee damage for your next combat encounter!`;
          }

          // Process Crew Infiltration & Recon Sub-Grid Missions
          if (nextState.crewMissions && nextState.crewMissions.length > 0) {
            const remainingMissions: typeof nextState.crewMissions = [];
            for (const mission of nextState.crewMissions) {
              const updatedMission = { ...mission, turnsLeft: mission.turnsLeft - 1 };
              const targetNPC = (nextState.baseNPCs || []).find(n => n.id === mission.npcId);
              const npcName = targetNPC ? targetNPC.name : "Your operator";

              if (updatedMission.turnsLeft <= 0) {
                // Resolve mission outcome!
                // Risk-based roll (low: 10%, medium: 25%, high: 45%)
                const riskVal = mission.risk.toLowerCase();
                const riskPct = riskVal === "high" ? 0.45 : riskVal === "medium" ? 0.25 : 0.10;
                const gotInjured = Math.random() < riskPct;

                if (gotInjured) {
                  // NPC injured
                  if (targetNPC) {
                    targetNPC.injuryStatus = "Wounded";
                    targetNPC.happiness = Math.max(0, targetNPC.happiness - 25);
                    targetNPC.dialogue = "Ugh... they detected my signature during the sub-grid run. It was a setup! I need medical attention in the hideout bunk.";
                    targetNPC.currentJob = "Idle / Chilling";
                  }
                  nextState.inventory.push("High-Grade Scrap Salvage");
                  passiveText += `\n\n⚠️ INFILTRATION ALERT: ${npcName} triggered alarms on the run to ${mission.missionName}! They returned wounded and bleeding. Managed to drag back 1x 'High-Grade Scrap Salvage' but needs rest.`;
                  triggerToast(`${npcName} returned WOUNDED from mission!`);
                } else {
                  // Mission succeeded cleanly!
                  let rewardsText = "";
                  if (mission.missionId === "matrix_decrypt") {
                    nextState.credits += 120;
                    nextState.inventory.push("Encrypted Decrypt Key");
                    rewardsText = "120¤ and 1x 'Encrypted Decrypt Key'";
                  } else if (mission.missionId === "cargo_raid") {
                    nextState.credits += 220;
                    nextState.inventory.push("Synthetic Nutrient Plate");
                    nextState.inventory.push("High-Grade Scrap Salvage");
                    rewardsText = "220¤, 1x 'Synthetic Nutrient Plate', and 1x 'High-Grade Scrap Salvage'";
                  } else {
                    // apex_infiltration
                    nextState.credits += 450;
                    nextState.inventory.push("Deluxe Combat Stimulant");
                    nextState.inventory.push("Heavy Sentry Blueprint");
                    rewardsText = "450¤, 1x 'Deluxe Combat Stimulant', and 1x 'Heavy Sentry Blueprint'";
                  }

                  if (targetNPC) {
                    targetNPC.injuryStatus = "Healthy";
                    targetNPC.happiness = Math.min(100, targetNPC.happiness + 15);
                    targetNPC.dialogue = "System bypassed! Core sub-nodes downloaded successfully, commander. The rewards have been delivered to stash.";
                    targetNPC.currentJob = "Idle / Chilling";
                  }

                  passiveText += `\n\n📟 MISSION SUCCESS: ${npcName} bypassed all corporate ice blocks at ${mission.missionName}! Delivered ${rewardsText} to your safehouse stash.`;
                  triggerToast(`${npcName} COMPLETED Sub-Grid Run!`);
                }
              } else {
                remainingMissions.push(updatedMission);
                passiveText += `\n\n📡 SUB-GRID RUN IN PROGRESS: ${npcName} is active in cyberspace bypassing nodes at ${mission.missionName} (${updatedMission.turnsLeft} turns left).`;
              }
            }
            nextState.crewMissions = remainingMissions;
          }

          narrative = `🚀 TELEPORTED HOME & SLEPT: Triggered emergency secure beacon. Recalled to Aurus Safehouse. You immediately collapsed onto your medical bunk and fell into a deep dreamless sleep. Woke up refreshed the next morning: Stamina and Vitals fully restored to 100%! Weather is now Clear.${passiveText}`;
          triggerToast("Returned Home and Slept: 100% restored!");
        }
      }

      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: narrative,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      setIsLoading(false);
      return;
    }

    // 3. Deduct stamina for executing a standard action if we're not in combat, not a region switch, and not resting
    const isRegionSwitch = cleanAction.includes("switch region");
    if (!gameState.combatState?.isActive && !isRestAction && !isRegionSwitch) {
      let actionStaminaCost = 5;
      const activeWeather = nextState.weather || "clear";
      if (activeWeather === "rain") actionStaminaCost += 1;
      else if (activeWeather === "snow") actionStaminaCost += 2;
      else if (activeWeather === "storm" || activeWeather === "heat" || activeWeather === "smog") actionStaminaCost += 3;

      nextState.stamina = Math.max(0, nextState.stamina - actionStaminaCost);
    }

    // ---- REGION SWITCH TRANSLATION PASS ----
    if (cleanAction.includes("switch region:") || cleanAction.includes("switch region")) {
      setIsLoading(false);
      if (cleanAction.includes("docks")) handleSwitchRegion("docks");
      else if (cleanAction.includes("downtown")) handleSwitchRegion("downtown");
      else if (cleanAction.includes("satoshi")) handleSwitchRegion("satoshi");
      else if (cleanAction.includes("aurus")) handleSwitchRegion("aurus");
      return;
    }

    // ---- COMBAT ACTIONS RESOLUTION ----
    if (gameState.combatState?.isActive) {
      const combat = { ...gameState.combatState };

      if (cleanAction.includes("physical attack") || cleanAction.includes("strike") || cleanAction.includes("blade")) {
        let pDmg = Math.floor(Math.random() * 11) + 15; // 15-25 base
        
        if (nextState.inventory.includes("Apex Mantis electro-blade")) {
          pDmg += 25;
        }
        if (nextState.inventory.includes("Smart-Targeting Visor")) {
          pDmg += 12;
        }

        let buffText = "";
        if (nextState.dojoBuffActive) {
          const isDojoUpgraded = nextState.safehouseUpgrades?.dojoUpgraded;
          const pct = isDojoUpgraded ? 0.30 : 0.15;
          const bonus = Math.floor(pDmg * pct);
          pDmg += bonus;
          buffText = isDojoUpgraded ? " [Dojo Buff +30%]" : " [Dojo Buff +15%]";
        }

        if (combat.enemyShields > 0) {
          const rem = combat.enemyShields - pDmg;
          if (rem < 0) {
            combat.enemyShields = 0;
            combat.enemyHp += rem;
          } else {
            combat.enemyShields = rem;
          }
        } else {
          combat.enemyHp -= pDmg;
        }

        narrative = `⚔️ STRIKE RETALIATED: You flash your blade into ${combat.enemyName}! Dealt ${pDmg} physical damage.${buffText}`;
      }
      else if (cleanAction.includes("spell slash") || cleanAction.includes("spend mp") || cleanAction.includes("plasma")) {
        if (nextState.mana < 15) {
          narrative = "⚠️ COGNITIVE STABLE FAULT: Insufficient ETHER flow. Your spell fizzled! (-0 Mana)";
        } else {
          nextState.mana -= 15;
          let mDmg = Math.floor(Math.random() * 16) + 30; // 30-45
          if (nextState.inventory.includes("Coven Ether-deck v3")) {
            mDmg = Math.floor(mDmg * 1.35);
          }
          combat.enemyHp -= mDmg;
          narrative = `🔮 ETHER DISCHARGE: Cast Spell Slash on ${combat.enemyName}! Dealt ${mDmg} armor-bypassing magic damage. (-15 Mana)`;
        }
      }
      else if (cleanAction.includes("cyber hack") || cleanAction.includes(" ransomware") || cleanAction.includes("hack")) {
        let hDmg = Math.floor(Math.random() * 8) + 12; 
        if (nextState.inventory.includes("Smart-Targeting Visor")) {
          hDmg += 8;
        }
        combat.enemyHp -= hDmg;
        narrative = `💾 NODE OVERLOAD: You inject a system-overload ransomware trigger! Dealt ${hDmg} neuro-bypass damage directly.`;
      }
      else if (cleanAction.includes("mind hack")) {
        if (nextState.mana < 20) {
          narrative = "⚠️ COGNITIVE STABLE FAULT: Insufficient ETHER flow. Your psychic hypnosis failed! (-0 Mana)";
        } else {
          nextState.mana -= 20;
          combat.enemyHp = Math.max(0, combat.enemyHp - 50);
          narrative = `🔮 MIND HACK: You bend the synaptic currents of ${combat.enemyName}! Hypnotized for 2 turns. The hostile turns its weapon inward, blasting its own systems for 50 damage! (-20 Mana)`;
        }
      }
      else if (cleanAction.includes("neural overload")) {
        if (nextState.mana < 35) {
          narrative = "⚠️ COGNITIVE STABLE FAULT: Insufficient ETHER flow. Your neural overload failed! (-0 Mana)";
        } else {
          nextState.mana -= 35;
          const roll = Math.random();
          if (roll <= 0.40) {
            combat.enemyHp = 0;
            narrative = `🔮 NEURAL OVERLOAD SUCCESS: A devastating psych-ether spike ruptures the brain synapses of ${combat.enemyName}! Instant critical shutdown! (-35 Mana)`;
          } else {
            nextState.hp = Math.max(1, nextState.hp - 15);
            narrative = `🔮 NEURAL OVERLOAD FAIL: You focus your psychic ether beam, but ${combat.enemyName}'s firewall resists the impact! You suffer 15 points of traumatic psychic feedback. (-35 Mana)`;
          }
        }
      }
      else if (cleanAction.includes("quick item") || cleanAction.includes("med-stim") || cleanAction.includes("consume heal")) {
        if (nextState.inventory.includes("Nano Med-Stim (Heal)")) {
          nextState.hp = Math.min(nextState.maxHp, nextState.hp + 60);
          nextState.inventory = nextState.inventory.filter((item, idx) => idx !== nextState.inventory.indexOf("Nano Med-Stim (Heal)"));
          narrative = "💊 MED-STIM INJECTED: Bio-metrics successfully repaired by +60 Health!";
        } else {
          narrative = "⚠️ CRITICAL FAILURE: No 'Nano Med-Stim (Heal)' inside your current inventory deck!";
        }
      }
      else if (cleanAction.includes("attempt flee") || cleanAction.includes("flee") || cleanAction.includes("evade")) {
        if (Math.random() > 0.4) {
          nextState.combatState = null;
          nextState.dojoBuffActive = false;
          setGameState(nextState);
          setLogs(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              timestamp: timeString,
              text: `🏃 ESCAPE DEPLOYED: You deploy active cloaking mesh and successfully broke contact back to security.`,
              type: "narration",
              district: nextState.district,
              poi: nextState.poi
            }
          ]);
          setIsLoading(false);
          return;
        } else {
          narrative = "❌ EVASION REFUSED: The hostile intercepts your flank coordinate channel. Safe flight blocked!";
        }
      }

      // Check of death
      if (combat.enemyHp <= 0) {
        const rewardC = Math.floor(Math.random() * 51) + 75; // 75-125
        const expGained = 45;
        nextState.credits += rewardC;
        nextState.experience += expGained;

        narrative += `\n\n★ THREAT EXTERMINATED: ${combat.enemyName} collasped with heavy spark leaks. You recover +${rewardC}¤ and earn +${expGained} XP!`;

        // Check Prologue map transitions on combat victory
        if (combat.enemyName.includes("Security Drones") || combat.enemyName.includes("Autonomous Security Drones")) {
          nextState.district = "data_vault";
          nextState.poi = "Sanctuary Hacking Terminal";
          setActiveRegionId("data_vault");
          setActivePOIView("terminal_hacking_puzzle");
          nextState.activeQuests = ["Prologue: Data Vault Sanctuary - Hack the cyber-vault terminal to steal corporate data crystals from Ares Biotech."];
          narrative += `\n\n🛡️ SECURITY BYPASSED: The final security drone sparks and explodes! Vice gestures to a heavy floor industrial lift elevator: 'Move, recruit! Before they lock down the entire sector! Get inside the core vault chamber.' You travel to the Data Vault Sanctuary.`;
        }
        else if (combat.enemyName.includes("Corporate Enforcers") || combat.enemyName.includes("Ambush")) {
          nextState.poi = "Mysterious Relic Altar";
          setActivePOIView("relic_altar");
          setActiveDialogue("post_combat_tracker");
          nextState.activeQuests = ["Prologue: Interrogate captured Ares Security Officer, make him override locks, and salvage Tracker's gear to escape."];
          narrative += `\n\n🛡️ AMBUSH SURVIVED: The smoke clears. Tracker lies lifeless near the breached blast door, killed in the opening gunfight. You and the wounded Vice have cornered the surviving Ares Security Officer! Interrogate him above to discover an escape route and override the sector blast doors.`;
        }

        // Check Quest item collection
        if (combat.enemyName === "Toxic Sludge Behemoth" && nextState.activeQuests.some(q => q.includes("Corporate Hunt"))) {
          nextState.inventory.push("Acid Beast Core");
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Corporate Hunt"));
          nextState.activeQuests.push("Objective: Deliver the 'Acid Beast Core' to Chancellor Aria at Apex Armory.");
          narrative += "\n\n🎒 OBJECTIVE COLLECTED: Dislodged the rare green pulsating 'Acid Beast Core'. Advance to Chancellor Aria to deliver the asset.";
        }

        if (combat.enemyName === "Rogue Rust-Claw Orc" && nextState.activeQuests.some(q => q.includes("Drone Schematic"))) {
          if (!nextState.inventory.includes("Experimental Drone Chip")) {
            nextState.inventory.push("Experimental Drone Chip");
            narrative += "\n\n🎒 OBJECTIVE COLLECTED: The Orc sparks as its crude battery cell explodes. Among the scrap, you salvage a gleaming, experimental copper-plated microchip! 'Experimental Drone Chip' obtained. Deliver it to Jax at the Neon Abyss Bar or install it in your Hideout Base Security mainframe!";
          }
        }

        if (combat.enemyName === "Iron Anchor Smuggler" || combat.enemyName === "Heavy Cargo Loader Mech") {
          if (nextState.activeQuests.some(q => q.includes("Smuggler's Run")) && !nextState.inventory.includes("Stolen Weapon Crate")) {
            nextState.inventory.push("Stolen Weapon Crate");
            narrative += "\n\n🎒 OBJECTIVE COLLECTED: Sifting through the debris of the Iron Anchor smuggler, you recover a heavy steel crate wrapped in lead seals: 'Stolen Weapon Crate' acquired. Bring it back to the Titan Logistics Freight Hub!";
          }
        }

        if (combat.enemyName === "Ares Patrol Drone" || combat.enemyName === "Skybridge Security Enforcer") {
          if (nextState.activeQuests.some(q => q.includes("Cybernetic Harvest"))) {
            const currentRegs = nextState.inventory.filter(i => i === "Neural Regulator").length;
            if (currentRegs < 2) {
              nextState.inventory.push("Neural Regulator");
              narrative += `\n\n🎒 OBJECTIVE COLLECTED: You extract a glowing, fluid-cooled cylinder from the enforcer's central CPU matrix! Got: 'Neural Regulator' (${currentRegs + 1}/2). Bring 2x of these back to Dr. Marv at the Docks!`;
            }
          }
        }

        if (combat.enemyName === "Ares Plasma Sentinel") {
          if (!nextState.completedPOIActions.includes("corporate_plaza:security_bypassed")) {
            nextState.completedPOIActions.push("corporate_plaza:security_bypassed");
          }
          narrative += "\n\n🔓 SECURITY OVERRIDDEN: The heavy automated Sentinel crashes to the ground, sparking violently. The staff lift is now unlocked. Use it to descend to the cryogenic detention sub-level!";
        }

        // Level Up
        if (nextState.experience >= 100) {
          nextState.level += 1;
          nextState.experience -= 100;
          nextState.maxHp += 20;
          nextState.maxMana += 15;
          nextState.hp = nextState.maxHp;
          nextState.mana = nextState.maxMana;
          narrative += `\n\n📶 SYSTEM LEVEL EXPANDED: Congratulations! Ascended to Level ${nextState.level}. Max health and mana stats fully restored!`;
        }

        nextState.combatState = null;
        nextState.dojoBuffActive = false;
        logType = "system";
      } else {
        // Enemy Counter-Attacks
        const eDmg = Math.floor(Math.random() * 11) + 12; // 12-22
        nextState.hp -= eDmg;
        narrative += `\n\n⚠️ HOSTILE REACTION: ${combat.enemyName} strikes back, dealing ${eDmg} kinetic damage to your armor.`;

        if (nextState.hp <= 0) {
          if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
            // PROLOGUE GAME OVER / RETRY
            nextState.hp = nextState.maxHp;
            nextState.mana = nextState.maxMana;
            nextState.combatState = null;
            nextState.dojoBuffActive = false;
            narrative += `\n\n☠️ CRITICAL OVERLOAD: Your bio-signatures flatlined in the catacombs! Fortunately, your squad-mate Vice injected an adrenaline micro-dose, resetting your critical vitals and dragging you back to safety. Let's try again!`;
            logType = "system";
          } else {
            // PLAYER DOWNED
            const penalty = Math.floor(nextState.credits * 0.15);
            nextState.credits -= penalty;
            nextState.hp = 25;
            nextState.poi = "Main Headquarters (The Hideout)";
            nextState.district = "aurus";
            setActiveRegionId("aurus");
            setActivePOIView("hideout");
            nextState.combatState = null;
            nextState.dojoBuffActive = false;
            narrative += `\n\n☠️ SYSTEM OVERRIDE TRAUMA: Bio-signatures flatlined! Your emergency backup beacon auto-teleported your frame to Hideout medical bay. -${penalty}¤ Trauma deduction.`;
            logType = "system";
          }
        } else {
          combat.turnLog = `Enemy HP: ${combat.enemyHp}/${combat.enemyMaxHp}. Action requested!`;
          nextState.combatState = combat;
          logType = "combat";
        }
      }
    } 
    // ---- EXPLORATION MODE RESOLUTIONS ----
    else {
      // 1. BASE JOBS PROGRESSION TICK
      const advanceTimeAndProgressJobs = (state: GameState) => {
        // Advance clock
        if (state.timeOfDay === "Morning") {
          state.timeOfDay = "Afternoon";
        } else if (state.timeOfDay === "Afternoon") {
          state.timeOfDay = "Night";
        } else {
          state.timeOfDay = "Morning";
          state.day += 1;
        }

        // Passive companion payouts on mornings
        if (state.timeOfDay === "Morning") {
          let totalWage = 0;
          state.companions.forEach(c => {
            if (c.status === "working") totalWage += 35;
          });
          if (totalWage > 0) {
            state.credits += totalWage;
            return `\n\n💎 AUTOMATED SERVERS PAYMENT: Hired personnel finished deep mining sub-nodes. +${totalWage}¤ transferred to credits cache.`;
          }
        }
        return "";
      };

      // ---- SPECIFIC HOOKS ----
      
      // Consumables use / consume
      if (cleanAction.startsWith("consume ")) {
        const itemToConsume = nextState.inventory.find(item => cleanAction.includes(item.toLowerCase()));
        if (itemToConsume) {
          const itemLower = itemToConsume.toLowerCase();
          const idx = nextState.inventory.indexOf(itemToConsume);
          if (idx > -1) {
            nextState.inventory.splice(idx, 1);
          }
          
          let healText = "";
          if (itemLower.includes("nutrient") || itemLower.includes("plate") || itemLower.includes("synthetic nutrient plate")) {
            const healAmt = 45;
            const oldHp = nextState.hp;
            nextState.hp = Math.min(nextState.maxHp, nextState.hp + healAmt);
            const healed = nextState.hp - oldHp;
            
            const stamAmt = 35;
            const oldStam = nextState.stamina;
            nextState.stamina = Math.min(nextState.maxStamina, nextState.stamina + stamAmt);
            const stamRestored = nextState.stamina - oldStam;

            healText = `🍗 SYNTH-NUTRIENT CONSUMED: You enjoyed a warm, freshly prepared 'Synthetic Nutrient Plate'. Repolarized +${healed} HP and recharged +${stamRestored} Stamina!`;
            triggerToast(`Consumed Nutrient Plate: +${healed} HP, +${stamRestored} Stamina`);
          } else if (itemLower.includes("stim") || itemLower.includes("heal")) {
            const healAmt = 60;
            const oldHp = nextState.hp;
            nextState.hp = Math.min(nextState.maxHp, nextState.hp + healAmt);
            const healed = nextState.hp - oldHp;
            healText = `💊 BIO-STIMULANT DEPLOYED: You consumed '${itemToConsume}'. Repolarized +${healed} HP! Current: ${nextState.hp}/${nextState.maxHp}`;
            triggerToast(`Repaired +${healed} HP`);
          } else if (itemLower.includes("cell") || itemLower.includes("mana")) {
            const manaAmt = 40;
            const oldMana = nextState.mana;
            nextState.mana = Math.min(nextState.maxMana, nextState.mana + manaAmt);
            const recharged = nextState.mana - oldMana;
            healText = `⚡ ETHER CHARGE INSTALLED: You consumed '${itemToConsume}'. Recharged +${recharged} Mana! Current: ${nextState.mana}/${nextState.maxMana}`;
            triggerToast(`Recharged +${recharged} Mana`);
          } else {
            healText = `📦 ITEM CONSUMED: You consumed '${itemToConsume}', but its neural effects were neutral.`;
          }
          
          setGameState(nextState);
          setLogs(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              timestamp: timeString,
              text: healText,
              type: "system",
              district: nextState.district,
              poi: nextState.poi
            }
          ]);
          setIsLoading(false);
          return;
        } else {
          narrative = `⚠️ USE FAILURE: No matching item found inside inventory stash!`;
        }
      }

      // Rest at base
      if (cleanAction.includes("rest & recover") || cleanAction.includes("rest and sleep")) {
        nextState.hp = nextState.maxHp;
        nextState.mana = nextState.maxMana;
        nextState.stamina = nextState.maxStamina; // Restores stamina completely!
        nextState.weather = "clear"; // Resets weather after a full night's rest!
        nextState.timeOfDay = "Morning";
        nextState.day += 1;
        
        let passiveText = "";
        
        // 1. Core wages for hired companions on nodes
        let totalWage = 0;
        nextState.companions.forEach(c => {
          if (c.status === "working") totalWage += 35;
        });
        if (totalWage > 0) {
          nextState.credits += totalWage;
          passiveText += `\n\n💎 CREW HARVEST DECK: Hired mercenaries delivered automated sub-node payout: +${totalWage}¤.`;
        }

        // 2. Base Crew Jobs Passive Production
        const baseNPCsList = nextState.baseNPCs || [];

        // Hacker Network Operators
        const hackerCount = baseNPCsList.filter(n => n.currentJob === "Hacker Network Operator").length;
        if (hackerCount > 0) {
          const earnings = hackerCount * 45;
          nextState.credits += earnings;
          passiveText += `\n\n💻 HACKER NETWORK INCOME: ${hackerCount} base operator(s) tapped corporate bank sub-nodes: +${earnings}¤ deposited.`;
        }

        // Base Supply Chefs (with Luxury Kitchen support)
        const chefCount = baseNPCsList.filter(n => n.currentJob === "Base Supply Chef").length;
        if (chefCount > 0) {
          const isKitchenUpgraded = nextState.safehouseUpgrades?.kitchenUpgraded;
          const mealsPerChef = isKitchenUpgraded ? 2 : 1;
          const totalMeals = chefCount * mealsPerChef;
          for (let i = 0; i < totalMeals; i++) {
            nextState.inventory.push("Synthetic Nutrient Plate");
          }
          passiveText += `\n\n🍗 CHEF KITCHEN BATCH: ${chefCount} base chef(s) prepped ${totalMeals} hot meals ${isKitchenUpgraded ? "[Luxury Kitchen x2 Boost!]" : ""}: placed in stash.`;
        }

        // Dojo Training Coaches (with Dojo Mat Expansion support)
        const coachCount = baseNPCsList.filter(n => n.currentJob === "Dojo Training Coach").length;
        const isDojoUpgraded = nextState.safehouseUpgrades?.dojoUpgraded;
        if (coachCount > 0 || isDojoUpgraded) {
          nextState.dojoBuffActive = true;
          const bonusPct = isDojoUpgraded ? "+30%" : "+15%";
          passiveText += `\n\n⚔️ DOJO TRAINING CALIBRATION: Dojo coaches & automated combat mats fine-tuned your blades: granted ${bonusPct} Melee damage for your next combat encounter!`;
        }

        // Process Crew Infiltration & Recon Sub-Grid Missions
        if (nextState.crewMissions && nextState.crewMissions.length > 0) {
          const remainingMissions: typeof nextState.crewMissions = [];
          for (const mission of nextState.crewMissions) {
            const updatedMission = { ...mission, turnsLeft: mission.turnsLeft - 1 };
            const targetNPC = (nextState.baseNPCs || []).find(n => n.id === mission.npcId);
            const npcName = targetNPC ? targetNPC.name : "Your operator";

            if (updatedMission.turnsLeft <= 0) {
              // Resolve mission outcome!
              // Risk-based roll (low: 10%, medium: 25%, high: 45%)
              const riskVal = mission.risk.toLowerCase();
              const riskPct = riskVal === "high" ? 0.45 : riskVal === "medium" ? 0.25 : 0.10;
              const gotInjured = Math.random() < riskPct;

              if (gotInjured) {
                // NPC injured
                if (targetNPC) {
                  targetNPC.injuryStatus = "Wounded";
                  targetNPC.happiness = Math.max(0, targetNPC.happiness - 25);
                  targetNPC.dialogue = "Ugh... they detected my signature during the sub-grid run. It was a setup! I need medical attention in the hideout bunk.";
                  targetNPC.currentJob = "Idle / Chilling";
                }
                nextState.inventory.push("High-Grade Scrap Salvage");
                passiveText += `\n\n⚠️ INFILTRATION ALERT: ${npcName} triggered alarms on the run to ${mission.missionName}! They returned wounded and bleeding. Managed to drag back 1x 'High-Grade Scrap Salvage' but needs rest.`;
                triggerToast(`${npcName} returned WOUNDED from mission!`);
              } else {
                // Mission succeeded cleanly!
                let rewardsText = "";
                if (mission.missionId === "matrix_decrypt") {
                  nextState.credits += 120;
                  nextState.inventory.push("Encrypted Decrypt Key");
                  rewardsText = "120¤ and 1x 'Encrypted Decrypt Key'";
                } else if (mission.missionId === "cargo_raid") {
                  nextState.credits += 220;
                  nextState.inventory.push("Synthetic Nutrient Plate");
                  nextState.inventory.push("High-Grade Scrap Salvage");
                  rewardsText = "220¤, 1x 'Synthetic Nutrient Plate', and 1x 'High-Grade Scrap Salvage'";
                } else {
                  // apex_infiltration
                  nextState.credits += 450;
                  nextState.inventory.push("Deluxe Combat Stimulant");
                  nextState.inventory.push("Heavy Sentry Blueprint");
                  rewardsText = "450¤, 1x 'Deluxe Combat Stimulant', and 1x 'Heavy Sentry Blueprint'";
                }

                if (targetNPC) {
                  targetNPC.injuryStatus = "Healthy";
                  targetNPC.happiness = Math.min(100, targetNPC.happiness + 15);
                  targetNPC.dialogue = "System bypassed! Core sub-nodes downloaded successfully, commander. The rewards have been delivered to stash.";
                  targetNPC.currentJob = "Idle / Chilling";
                }

                passiveText += `\n\n📟 MISSION SUCCESS: ${npcName} bypassed all corporate ice blocks at ${mission.missionName}! Delivered ${rewardsText} to your safehouse stash.`;
                triggerToast(`${npcName} COMPLETED Sub-Grid Run!`);
              }
            } else {
              remainingMissions.push(updatedMission);
              passiveText += `\n\n📡 SUB-GRID RUN IN PROGRESS: ${npcName} is active in cyberspace bypassing nodes at ${mission.missionName} (${updatedMission.turnsLeft} turns left).`;
            }
          }
          nextState.crewMissions = remainingMissions;
        }

        narrative = `💤 REST PROTOCOLS COMPLETE: Rested on safehouse medical bunk. Cybernetic channels completely drained and fully calibrated to 100% capacity.${passiveText}`;

        // Safehouse Intrusion & Tactical Base Raids (disabled until Quest 3 / completedQuests.length >= 3)
        const isRaidEnabled = (nextState.completedQuests || []).length >= 3;
        if (isRaidEnabled) {
          const defenses = nextState.safehouseDefenses || {
            securityLevel: 1,
            turrets: 0,
            shieldStrength: 100,
            fortifiedDoors: false,
            intrusionLogs: []
          };
          
          // 25% chance of corporate sweep raid intrusion
          if (Math.random() < 0.25) {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // If shield capacitors are high (e.g. above 40%), the shield grid blocks the intrusion completely, absorbing the blow!
            if (defenses.shieldStrength > 40) {
              const shieldDamage = 45 - (defenses.fortifiedDoors ? 15 : 0);
              const remainingShield = Math.max(0, defenses.shieldStrength - shieldDamage);
              
              const absorbLog = `[${timeStr}] 📡 INCIDENT DEFLECTED: Security grid detected an Ares tracker probe. Energy shields absorbed the sweep (-${shieldDamage}% Shield energy). No breach occurred.`;
              
              nextState.safehouseDefenses = {
                ...defenses,
                shieldStrength: remainingShield,
                intrusionLogs: [absorbLog, ...(defenses.intrusionLogs || [])]
              };
              narrative += `\n\n🛡️ SECURITY WARNING: Corporate scanner sweep deflected! Safehouse energy shields absorbed the tracking telemetry probe, but shield capacitors took damage. Recharge them in the Base Defenses console!`;
            } else {
              // Shield capacitor is depleted! Infiltration breach occurs!
              const breachLog = `[${timeStr}] 🚨 SEC-GRID BREACHED: Elite corporate Strike Team bypassed weak shields and infiltrated Aurus Hideout! Base defenses engaged.`;
              
              // Sentry turrets reduce the intruder's initial health/shields before the grid combat begins
              const baseEnemyHp = 100;
              const enemyHpDamage = defenses.turrets * 20; // 20 damage per active turret
              const actualEnemyHp = Math.max(30, baseEnemyHp - enemyHpDamage);
              
              nextState.safehouseDefenses = {
                ...defenses,
                shieldStrength: 0,
                intrusionLogs: [breachLog, ...(defenses.intrusionLogs || [])]
              };

              nextState.combatState = {
                enemyName: "Ares Assault Commander (Base Raider)",
                enemyHp: actualEnemyHp,
                enemyMaxHp: baseEnemyHp,
                enemyShields: Math.max(0, 30 - (defenses.turrets * 5)),
                enemyMaxShields: 30,
                isActive: true,
                turnLog: `🚨 ALARM: BASE SEC-GRID BREACHED! An elite corporate Strike Commando team led by an Ares Assault Commander has traced your telemetrics and breached the safehouse! Automated turrets dealt damage to the intruder as they entered. Defend the core safehouse node!`
              };

              narrative += `\n\n🚨 ALARM CLAXONS BLARING: BREACH DETECTED! While you were sleeping, an elite Ares Corp tactical team breached our lower sewer entrance! Automated turrets have engaged, but the Commander is inside the main hub. PREPARE TO DEFEND THE HIDEOUT!`;

              setActivePopup({
                title: "🚨 SAFEHOUSE BREACHED!",
                subtitle: "TACTICAL BASE RAID ENGAGED",
                type: "combat_warning",
                text: `Warning: An elite corporate Strike Commando team has breached your perimeter lock! Sentry turrets have engaged, dealing ${enemyHpDamage} initial damage to the invaders. Defend your base operations now!`
              });
            }
          }
        }
      }
      
      // ---- PROLOGUE MAP 1: SUBSURFACE AI CATACOMBS (CONDUIT 09) ----
      
      // Ventilation Shaft
      else if (cleanAction.includes("slip through vent")) {
        const dex = nextState.attributes?.dex || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + dex;
        if (roll >= 23) {
          nextState.experience += 25;
          nextState.completedPOIActions.push("ventilation_shaft:slip");
          narrative = `🎯 DEX CHECK SUCCESS (Roll: ${roll} vs 23): You calibrate your speed servos perfectly, sliding through the spinning blades during the sub-second frequency lull! Vice whispers: 'Damn, kid. Clean slip.' Earned +25 XP.`;
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setActivePopup({
            title: "SLIPPED THROUGH VENTILATION",
            subtitle: "DEX CHECK SUCCESS",
            type: "transit",
            text: `You calibrated your speed servos perfectly (Roll: ${roll} vs 23) and slipped safely through the giant spinning rotor blades! You drop down into the glowing monitoring sub-station. Earned +25 XP.`
          });
        } else {
          const dmg = 20;
          nextState.hp = Math.max(10, nextState.hp - dmg);
          nextState.experience += 10;
          setVentFailed(true);
          narrative = `⚠️ DEX CHECK FAILURE (Roll: ${roll} vs 23): The heavy spinning fan blade strikes your back chassis! Sparks fly as you are pinned inside the duct. Dealt ${dmg} kinetic damage. Alarms begin to beep softly! You are STUCK in the ventilation shaft. You must choose an emergency override response immediately before security arrives.`;
          setActivePopup({
            title: "FAN BLADES INTERCEPTED",
            subtitle: "DEX CHECK FAILURE",
            type: "check_failure",
            text: `The massive spinning fan blade strikes your back chassis (Roll: ${roll} vs 23)! Sparks fly as you are pinned inside the duct. You suffered 20 kinetic damage. Solve the lockdown immediately!`
          });
        }
      }
      else if (cleanAction.includes("force fan blades (str check)") || cleanAction.includes("force fan")) {
        const str = nextState.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + str;
        nextState.completedPOIActions.push("ventilation_shaft:slip");
        if (roll >= 15) {
          narrative = `💥 STR CHECK SUCCESS (Roll: ${roll} vs 15): With a guttural growl, you wrench the auxiliary hydraulic shaft. The massive blades halt with a screeching metallic tear! You scramble through, but the noise was immense! Alarm beacons begin to spin.`;
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          
          // Trigger alarm combat!
          nextState.combatState = {
            enemyName: "Ares Sentry Drone (Alerted)",
            enemyHp: 40,
            enemyMaxHp: 40,
            enemyShields: 10,
            enemyMaxShields: 10,
            isActive: true,
            turnLog: "The screeching fan tear has alerted the nearby sector! A rapid sentry drone deploys from the ceiling vents with guns hot!"
          };
          setActivePopup({
            title: "FAN BLADES WRENCHED",
            subtitle: "STR CHECK SUCCESS",
            type: "check_success",
            text: `With raw strength (Roll: ${roll} vs 15), you wrenched the hydraulic rotor! The blade screeched and seized, letting you scramble through. However, the deafening noise has alerted an autonomous security patrol! Prepare for combat!`
          });
        } else {
          narrative = `❌ STR CHECK FAILURE (Roll: ${roll} vs 15): You attempt to force the rotor, but the titanium alloy is too rigid! The blades spin faster, tearing into your cybernetics for 15 damage and sounding the sector alarms! Sentry units are converging!`;
          nextState.hp = Math.max(10, nextState.hp - 15);
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          
          nextState.combatState = {
            enemyName: "Ares Security Drone (Group Ambush)",
            enemyHp: 50,
            enemyMaxHp: 50,
            enemyShields: 15,
            enemyMaxShields: 15,
            isActive: true,
            turnLog: "Alarms are blaring! You fall out of the ventilation shaft right in front of an alerted security patrol!"
          };
          setActivePopup({
            title: "ROTOR OVERRIDE FAILURE",
            subtitle: "STR CHECK FAILURE",
            type: "check_failure",
            text: `The titanium blade was too rigid (Roll: ${roll} vs 15)! Your arm joints suffered 15 fatigue damage, and sector alarms have been triggered. Hostile units are converging on your position!`
          });
        }
      }
      else if (cleanAction.includes("trigger emp burst") || cleanAction.includes("emp explosion")) {
        nextState.completedPOIActions.push("ventilation_shaft:slip");
        narrative = `⚡ LOUD EMP EXPLOSION: You override your cyberdeck battery, releasing a raw, unstable EMP blast! The ventilation fan sparks violently and explodes in a shower of blue fire. You are thrown forward into the Security Sub-Terminal, taking 10 damage from the shockwave. The blast has completely fried the sector's grid, sounding emergency sirens!`;
        nextState.hp = Math.max(10, nextState.hp - 10);
        nextState.poi = "Security Sub-Terminal";
        setActivePOIView("security_terminal");
        setVentFailed(false);
        
        nextState.combatState = {
          enemyName: "Alerted Patrol Guard (EMP Intercept)",
          enemyHp: 45,
          enemyMaxHp: 45,
          enemyShields: 10,
          enemyMaxShields: 10,
          isActive: true,
          turnLog: "The EMP explosion blacked out the corridor! Alerted patrol guards breach the entrance with sub-machine railguns flashing!"
        };
        setActivePopup({
          title: "EMP BLAST OVERRIDE",
          subtitle: "SYSTEM GRID OVERLOAD",
          type: "check_failure",
          text: "You overloaded your cyberdeck's cognitive battery cell, releasing a blind high-frequency EMP blast! The rotor exploded in blue sparks, blowing you into the sub-station with 10 damage. A heavy security patrol has breached the darkened intersection!"
        });
      }
      else if (cleanAction.includes("hack fan console (int check)") || cleanAction.includes("hack fan")) {
        const intVal = nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + intVal;
        nextState.completedPOIActions.push("ventilation_shaft:slip");
        if (roll >= 16) {
          narrative = `💾 INT CHECK SUCCESS (Roll: ${roll} vs 16): You patch your neural link directly into the exposed fan relay. Executing a quiet loop-bypass script, the heavy blades spin down to a complete, silent halt. You slide through safely. Vice pats your shoulder: 'Smart hack, rookie.'`;
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          setActivePopup({
            title: "CONSOLE RELAY OVERRIDE",
            subtitle: "INT CHECK SUCCESS",
            type: "check_success",
            text: `You bypassed the local airlock controller relay (Roll: ${roll} vs 16)! The blades spun down to a silent, complete halt, letting you slide through with perfect stealth.`
          });
        } else {
          narrative = `⚠️ INT CHECK FAILURE (Roll: ${roll} vs 16): Your override script causes a short circuit! A small pop sounds, and the fan controller starts burning. You take 10 kinetic damage, and the sparks alert a security drone!`;
          nextState.hp = Math.max(10, nextState.hp - 10);
          nextState.poi = "Security Sub-Terminal";
          setActivePOIView("security_terminal");
          setVentFailed(false);
          
          nextState.combatState = {
            enemyName: "Ares Sentry Drone (Short-Circuit Alert)",
            enemyHp: 40,
            enemyMaxHp: 40,
            enemyShields: 5,
            enemyMaxShields: 5,
            isActive: true,
            turnLog: "The burning fan controller sounds a local short-circuit alarm! A patrol drone hovers down to investigate!"
          };
          setActivePopup({
            title: "RELAY FIREWALL FAULT",
            subtitle: "INT CHECK FAILURE",
            type: "check_failure",
            text: `A severe short-circuit feedback shocked your neural deck (Roll: ${roll} vs 16), dealing 10 damage. The burning relay console triggered a silent short-circuit alarm, summoning an investigation drone!`
          });
        }
      }
      else if (nextState.district === "conduit09" && (cleanAction.includes("talk to vice") || cleanAction.includes("talk to tracker") || cleanAction.includes("banter"))) {
        setSquadDialogue({ sceneId: "banter", nodeId: "start" });
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("scavenge rusted emergency locker") || cleanAction.includes("emergency locker")) {
        nextState.inventory.push("Cyber-Ammo");
        nextState.inventory.push("Nano Med-Stim (Heal)");
        nextState.hp = Math.min(nextState.maxHp, nextState.hp + 15);
        nextState.completedPOIActions.push("ventilation_shaft:scavenge");
        narrative = `🔍 EMERGENCY SUPPLIES SCAVENGED: You crack open a rusty corporate locker on the ventilation catwalk! Inside you find a box of high-density Cyber-Ammo (+6 Gun Damage) and a Nano Med-Stim (Heal) (+60 HP). You also patch your minor armor scrapings, restoring +15 HP!`;
        setActivePopup({
          title: "EMERGENCY SUPPLIES SCAVENGED",
          subtitle: "CONDUIT 09 LOCKER LOOT",
          type: "loot",
          text: "You cracked open a rusty emergency locker on the catwalk. Inside, you secured high-density Cyber-Ammo (+6 Gun Damage), a Nano Med-Stim (Heal) (+60 HP), and patched your armor scrapings (+15 HP)!"
        });
      }
      else if (cleanAction.includes("dismantle ventilation casing") || cleanAction.includes("ventilation casing")) {
        nextState.inventory.push("Carbon Fiber Armor Plates");
        nextState.completedPOIActions.push("ventilation_shaft:casing");
        narrative = `🛠️ CASING SALVAGED: Using a laser-ratchet, you carefully unscrew and dismantle the lightweight, carbon-reinforced ventilation housing. This is high-grade aerospace defense plating! You acquire Carbon Fiber Armor Plates (Grants +30 starting Combat Shields).`;
        setActivePopup({
          title: "CASING DISMANTLED",
          subtitle: "CATWALK METAL RECOVERED",
          type: "loot",
          text: "Using a laser-ratchet, you dismantled the carbon-reinforced ventilation casing. You salvaged a piece of premium Carbon Fiber Armor Plates (+30 starting Combat Shields)!"
        });
      }

      // Security Sub-Terminal
      else if (cleanAction.includes("bypass sub-terminal")) {
        const intVal = nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + intVal;
        nextState.completedPOIActions.push("security_terminal:bypass");
        if (roll >= 23) {
          nextState.experience += 25;
          nextState.inventory.push("Rusted Circuitry");
          narrative = `🎯 INT CHECK SUCCESS (Roll: ${roll} vs 23): You slice the alarm sub-grid gracefully, rendering the outer perimeter completely blind! You salvage a piece of valuable 'Rusted Circuitry' copper scrap from the motherboard. Tracker grunts: 'Efficient work.' Earned +25 XP.`;
          nextState.poi = "Heavy Blast Door";
          setActivePOIView("blast_door");
          setActivePopup({
            title: "SUB-TERMINAL BYPASSED",
            subtitle: "INT CHECK SUCCESS",
            type: "transit",
            text: `You sliced the alarm sub-grid with stealth precision (Roll: ${roll} vs 23), rendering local cameras completely blind! You salvaged a piece of 'Rusted Circuitry' copper scrap. Transiting to the Heavy Blast Door. Earned +25 XP.`
          });
        } else {
          nextState.mana = Math.max(0, nextState.mana - 15);
          nextState.experience += 10;
          narrative = `⚠️ INT CHECK FAILURE (Roll: ${roll} vs 23): An electrostatic firewall feedback discharges directly into your deck! Your mana flow drops by -15. But you force an emergency override to clear the block. Earned +10 XP.`;
          nextState.poi = "Heavy Blast Door";
          setActivePOIView("blast_door");
          setActivePopup({
            title: "SUB-GRID FIREWALL BACKFIRE",
            subtitle: "INT CHECK FAILURE",
            type: "check_failure",
            text: `An electrostatic firewall backfired directly into your cyberdeck (Roll: ${roll} vs 23)! Your mana pool dropped by -15. However, you successfully forced an emergency transit shunt to the Heavy Blast Door.`
          });
        }
      }
      else if (cleanAction.includes("search terminal wreckage")) {
        nextState.completedPOIActions.push("security_terminal:wreckage");
        if (Math.random() > 0.4) {
          nextState.inventory.push("Rusted Circuitry");
          narrative = "🔍 SCAVENGE SUCCESS: You unscrew the auxiliary panel and slide out a piece of copper 'Rusted Circuitry' scrap! This can be recycled at the Apex Armory.";
          setActivePopup({
            title: "WRECKAGE SALVAGED",
            subtitle: "TERMINAL SCRAP ACQUIRED",
            type: "loot",
            text: "You unscrewed the charred sub-terminal motherboard panel and safely extracted a piece of recyclable 'Rusted Circuitry' copper scrap!"
          });
        } else {
          narrative = "🔍 SCAVENGE EMPTY: The sub-terminal circuits are completely charred and useless.";
          setActivePopup({
            title: "WRECKAGE STRIPPED",
            subtitle: "SCAVENGE ENCOUNTERED EMPTY",
            type: "check_failure",
            text: "The sub-terminal circuits are completely melted and charred of anything recyclable."
          });
        }
      }
      else if (cleanAction.includes("hack secure weapons locker") || cleanAction.includes("weapons locker")) {
        nextState.inventory.push("Tactical Cyber-SMG");
        nextState.completedPOIActions.push("security_terminal:locker");
        narrative = `🔓 WEAPONS LOCKER OVERRIDDEN: You link your cyberdeck directly to the armory cabinet's heavy locking pins. Following a brief bypass, the door swings open to reveal a polished, matte-black Tactical Cyber-SMG! You now have a lethal firearm in your equipment deck.`;
        setActivePopup({
          title: "ARMORY ACCESS UNLOCKED",
          subtitle: "WEAPONS LOCKER BYPASS",
          type: "loot",
          text: "You bypassed the secure weapons locker mainframe interface! Inside, you secured a pristine, matte-black Tactical Cyber-SMG! [Your basic combat range is expanded to 3, and base combat damage is increased to 24!]"
        });
      }
      else if (cleanAction.includes("siphon auxiliary thermal battery") || cleanAction.includes("thermal battery")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 35);
        nextState.completedPOIActions.push("security_terminal:battery");
        narrative = `⚡ POWER RECOVERED: You stick direct conductive copper lead clips into the humming sub-grid thermal battery cell. A warm, blue wave of raw electrostatic currents surge back into your cognitive deck, restoring +35 Mana!`;
        setActivePopup({
          title: "THERMAL CELL ENERGY SIPHONED",
          subtitle: "AUXILIARY CONDENSER SIPHON",
          type: "loot",
          text: "You connected direct conductive clamps to the battery capacitor. A high-voltage electrostatic wave surged back into your cognitive deck, restoring +35 Mana!"
        });
      }

      // Heavy Blast Door
      else if (cleanAction.includes("pry open valve") || cleanAction.includes("pry open door")) {
        const strVal = nextState.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + strVal;
        nextState.completedPOIActions.push("blast_door:pry");
        if (roll >= 23) {
          nextState.experience += 25;
          narrative = `🎯 STR CHECK SUCCESS (Roll: ${roll} vs 23): You grip the mechanical hydraulic valve and twist it with raw hydraulic force! The massive titanium doors hiss open. Vice nods: 'Whoa. Mind your power limits, brute!' Earned +25 XP.`;
          nextState.poi = "Next Section Gate (Transit)";
          setActivePOIView("section_gate");
          setActivePopup({
            title: "BLAST GATE VALVE PRYED",
            subtitle: "STR CHECK SUCCESS",
            type: "transit",
            text: `You twisted the heavy hydraulic rotary valve with extreme physical force (Roll: ${roll} vs 23)! The thick blast doors hiss open. Proceeding to the transit gate section. Earned +25 XP.`
          });
        } else {
          const dmg = 10;
          nextState.hp = Math.max(10, nextState.hp - dmg);
          nextState.experience += 10;
          narrative = `⚠️ STR CHECK FAILURE (Roll: ${roll} vs 23): Your hydraulic servos scream under the strain! You suffer ${dmg} points of internal system fatigue. Tracker steps up and uses his manual heavy cutter to melt the latch. Earned +10 XP.`;
          nextState.poi = "Next Section Gate (Transit)";
          setActivePOIView("section_gate");
          setActivePopup({
            title: "VALVE COUPLING STUCK",
            subtitle: "STR CHECK FAILURE",
            type: "check_failure",
            text: `Your joints failed to budge the rusted hydraulic valve (Roll: ${roll} vs 23), suffering 10 physical fatigue damage. Tracker was forced to use his heavy plasma cutter to bypass the seal. Transited to the Next Section Gate.`
          });
        }
      }
      else if (cleanAction.includes("raid security guard barracks") || cleanAction.includes("guard barracks")) {
        nextState.inventory.push("Nano Med-Stim (Heal)");
        nextState.inventory.push("Tactical Flak Armor");
        nextState.completedPOIActions.push("blast_door:barracks");
        narrative = `🎒 BARRACKS LOOTED: You slip into an abandoned security guard shift-room. You pry open a steel footlocker and find a fresh Nano Med-Stim (Heal) (+60 HP) and a heavy, high-tech piece of Tactical Flak Armor (+45 starting Combat Shields)!`;
        setActivePopup({
          title: "SECURITY BARRACKS LOOTED",
          subtitle: "GUARD ROOM SEARCH",
          type: "loot",
          text: "You broke into the abandoned barracks shift footlocker. You salvaged a Nano Med-Stim (Heal) (+60 HP) and heavy Tactical Flak Armor (+45 starting Combat Shields)!"
        });
      }
      else if (cleanAction.includes("interface with corporate supply bin") || cleanAction.includes("supply bin")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 30);
        nextState.credits += 45;
        nextState.completedPOIActions.push("blast_door:bin");
        narrative = `💰 CASH & BATTERIES DISCOVERED: You jack into an encrypted Ares corporate supply locker. The terminal unlocks, dispensing direct battery cells (+30 Mana) and a secure voucher credit-chip worth +45¤!`;
        setActivePopup({
          title: "SUPPLY BIN ACCESS OVERRIDDEN",
          subtitle: "SECURE FILES RAIDED",
          type: "loot",
          text: "You sliced the corporate supply cabinet security deck. It dispensed high-capacity battery units (+30 Mana) and secure union credit vouchers worth +45¤!"
        });
      }

      // Next Section Gate (Transit to Map 2)
      else if (cleanAction.includes("proceed to shatter-ridge core")) {
        nextState.district = "shatter_ridge_core";
        nextState.poi = "Shatter-Ridge Security Checkpoint";
        setActiveRegionId("shatter_ridge_core");
        setActivePOIView("shatter_ridge_security_post");
        nextState.activeQuests = ["Prologue: Shatter-Ridge - Infiltrate deeper to disable the defensive cyber-barriers."];
        narrative = "🚀 TRANSITING DISTRICT: You climb through the heavy gate and seal it behind you. You emerge inside the heavily guarded checkpoint of the Shatter-Ridge Core. Steel security lockers line the barrier corridor.";
        setActivePopup({
          title: "SHATTER-RIDGE CORE ACCESS",
          subtitle: "DISTRICT TRANSLATION",
          type: "transit",
          text: "You climb through the heavy gate and seal it behind you. You emerge inside the heavily guarded checkpoint of the Shatter-Ridge Core district. Scan the local defensive barrier console."
        });
      }

      // ---- PROLOGUE MAP 2: SHATTER-RIDGE CORE ----
      else if (cleanAction.includes("overclock security gate") || cleanAction.includes("overclock gate")) {
        const intVal = nextState.attributes?.int || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(intVal / 4);
        nextState.completedPOIActions.push("shatter_ridge_security_post:gate");
        if (roll >= 16) {
          nextState.experience += 25;
          narrative = `🎯 INT CHECK SUCCESS (Roll: ${roll} vs 16): You overclock the security gate grid capacitors, causing a localized power short-circuit that melts the security beam nodes! Earned +25 XP.`;
          setActivePopup({
            title: "GATE COUPLINGS MELTED",
            subtitle: "INT CHECK SUCCESS",
            type: "check_success",
            text: `You overclocked the security gate capacitors perfectly (Roll: ${roll} vs 16)! A surge of high-voltage sparks melted the defensive beam grids, disabling the alarm tripwires permanently. Earned +25 XP.`
          });
        } else {
          nextState.mana = Math.max(0, nextState.mana - 15);
          nextState.hp = Math.max(10, nextState.hp - 10);
          narrative = `❌ INT CHECK FAILURE (Roll: ${roll} vs 16): The security gate console registers unauthorized decryption! An electrostatic feedback shock drains -15 Mana and deals 10 damage before you force-shut the grid down.`;
          setActivePopup({
            title: "GATE RESISTOR SHOCK",
            subtitle: "INT CHECK FAILURE",
            type: "check_failure",
            text: `Decryption attempt failed (Roll: ${roll} vs 16)! A feedback wave surged into your cortex, dealing 10 physical shock damage and draining -15 Mana before you successfully shut down the local subnet alarm nodes.`
          });
        }
      }
      else if (cleanAction.includes("scavenge security chest") || cleanAction.includes("security chest")) {
        nextState.inventory.push("Exo-Plated Mesh Armor");
        nextState.inventory.push("Nano Med-Stim (Heal)");
        nextState.completedPOIActions.push("shatter_ridge_security_post:scavenge");
        narrative = `🔍 CHEST SECURED: You crack open a steel corporate chest behind the guard barrier. Inside, you salvage Exo-Plated Mesh Armor (+40 Max HP, +30 Shields, +4 Str) and a Nano Med-Stim (Heal) (+60 HP)!`;
        setActivePopup({
          title: "SECURITY CHEST UNLOCKED",
          subtitle: "SCAVENGE SUCCESS",
          type: "loot",
          text: "You broke into the steel corporate security locker! Inside, you secured premium Exo-Plated Mesh Armor (+40 Max HP, +30 Shields, +4 Str) and a fresh Nano Med-Stim (Heal) (+60 HP)!"
        });
      }
      else if (cleanAction.includes("pep-talk") || cleanAction.includes("pep talk") || cleanAction.includes("inspiration dialogue")) {
        setSquadDialogue({ sceneId: "peptalk", nodeId: "start" });
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("move to reactor well") || cleanAction.includes("reactor well")) {
        nextState.poi = "Shatter-Ridge Reactor Well";
        setActivePOIView("shatter_ridge_reactor_well");
        narrative = `🚀 TRANSITING SUB-SECTION: You slip past the deactivated checkpoint and move deeper down the steel catwalk. Eerie turquoise glowing steam rises from the toxic reactor pool.`;
        setActivePopup({
          title: "REACTOR WELL ACCESSED",
          subtitle: "SUB-SECTION TRANSIT",
          type: "transit",
          text: "You move past the security checkpoint and approach the Shatter-Ridge Reactor Well. Analyze the cargo lever mechanism and the bio-reactor core."
        });
      }
      else if (cleanAction.includes("pull cargo lever") || cleanAction.includes("cargo lever")) {
        const strVal = nextState.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(strVal / 4);
        nextState.completedPOIActions.push("shatter_ridge_reactor_well:lever");
        if (roll >= 15) {
          nextState.experience += 25;
          nextState.inventory.push("Unstable Plasma Core");
          narrative = `🎯 STR CHECK SUCCESS (Roll: ${roll} vs 15): You grip the mechanical lever and pull down with hydraulic assist! The crane groans and lowers the cargo crate safely onto the catwalk, allowing you to salvage an Unstable Plasma Core! Earned +25 XP.`;
          setActivePopup({
            title: "CARGO CRATE SECURED",
            subtitle: "STR CHECK SUCCESS",
            type: "loot",
            text: `You pulled down the massive hydraulic cargo crane lever (Roll: ${roll} vs 15)! The crane groaned and deposited the container right in front of you. Inside, you secured an Unstable Plasma Core (+10 Max HP, +10 Max Mana, +4 Str, +4 Dex)! Earned +25 XP.`
          });
        } else {
          nextState.hp = Math.max(10, nextState.hp - 15);
          narrative = `❌ STR CHECK FAILURE (Roll: ${roll} vs 15): You attempt to yank the rusted crane lever, but the heavy gears seize up and snap! Sparks explode in your face, dealing 15 kinetic damage and locking the cargo crate permanently.`;
          setActivePopup({
            title: "HYDRAULIC COUPLING FAULT",
            subtitle: "STR CHECK FAILURE",
            type: "check_failure",
            text: `The mechanical lever seized up under your strain (Roll: ${roll} vs 15)! A heavy gear snapped, bursting sparks into your face for 15 kinetic damage and locking the cargo crate permanently.`
          });
        }
      }
      else if (cleanAction.includes("salvage bio-reactor core") || cleanAction.includes("bio-reactor core") || cleanAction.includes("salvage bio-reactor")) {
        nextState.inventory.push("Smart-Targeting Visor");
        nextState.completedPOIActions.push("shatter_ridge_reactor_well:reactor_core");
        narrative = `🔍 CORE EXTRACTED: You carefully bypass the bio-reactor's external ventilation cooling vents and extract its ocular telemetry analyzer, securing a high-tech Smart-Targeting Visor (+15 Max Mana, +4 Dex, +4 Int)!`;
        setActivePopup({
          title: "TELEMETRY VISOR SALVAGED",
          subtitle: "REACTOR CORE EXTRACTED",
          type: "loot",
          text: "You carefully bypassed the bio-cooler and dismantled the reactor's sensor stack! Inside, you secured a premium Smart-Targeting Visor (+15 Max Mana, +4 Dex, +4 Int)!"
        });
      }
      else if (cleanAction.includes("consult squad") || cleanAction.includes("tactics")) {
        setSquadDialogue({ sceneId: "tactics", nodeId: "start" });
        setIsLoading(false);
        return;
      }
      else if (cleanAction.includes("proceed to main array") || cleanAction.includes("main array")) {
        nextState.poi = "Core Array Shatter-Ridge";
        setActivePOIView("main_array_core");
        narrative = `🚀 ADVANCING TO CORE: You climb up the vertical structural ladders to the main cavernous hangar. Massive vertical server column rows glow in deep electric blue, hum-charging the central grid mainframe.`;
        setActivePopup({
          title: "CORE ARRAY INTERCEPTED",
          subtitle: "MAIN HANGAR ENTRY",
          type: "transit",
          text: "You climb up the metal ladders to the main Core Array cavern. Huge columns hum loudly. Defend Tracker while he bypasses the primary locks!"
        });
      }
      else if (cleanAction.includes("defend core array") || cleanAction.includes("triggers combat")) {
        nextState.combatState = {
          enemyName: "3x Autonomous Security Drones",
          enemyHp: 130,
          enemyMaxHp: 130,
          enemyShields: 30,
          enemyMaxShields: 30,
          isActive: true,
          turnLog: "Three floating discs with revolving red sensors descend from the grid ceiling, hum-charging their laser cannons!"
        };
        narrative = "💥 COMBAT INITIATED: The automated security network is fully alert! Secure the perimeter and destroy the security drones!";
        logType = "combat";
      }

      // ---- PROLOGUE MAP 3: DATA VAULT SANCTUARY ----
      else if (cleanAction.includes("activate mysterious relic")) {
        setActiveDialogue("relic_awakening");
        narrative = "💥 NEURAL CONTACT DETECTED: You touch the floating golden relic, triggering a massive psychic feedback surge in your brain cells! Read the high-priority alarm dialogue box above immediately to proceed.";
        setActivePopup({
          title: "NEURAL CONTACT REGISTERED",
          subtitle: "ALTAIC ENERGY SURGE",
          type: "loot",
          text: "You touch the cold, floating metallic edges of the golden relic. Instantly, a massive electrostatic wave flashes across your neural cortex, uploading cryptic pre-collapse bio-schemas. Read the high-priority dialog above!"
        });
      }

      // Approach Lost, Frightened Girl (Mia recruitment)
      else if (cleanAction.includes("approach lost") || cleanAction.includes("frightened girl") || cleanAction.includes("lost, frightened girl")) {
        setActiveDialogue("lost_girl");
        narrative = "You carefully approach the shivering figure huddled behind the neon crates. Read the high-priority dialogue overlay above to interact.";
        setIsLoading(false);
        return;
      }

      // Check Inventory Stash
      else if (cleanAction.includes("check stash") || cleanAction.includes("stash inventory")) {
        narrative = `🎒 STORAGE AUDIT: Current items stored in physical slots: ${nextState.inventory.length > 0 ? nextState.inventory.join(", ") : "None"}. Balance liquidity: ${nextState.credits}¤.`;
      }

      // Base Crew Management / NPC Interaction Hub
      else if (cleanAction.includes("base crew management") || cleanAction.includes("base npc manager")) {
        setBaseNPCManagerOpen(true);
        narrative = "📡 CONSOLE UPLINK SECURED: Initiated high-frequency encryption sync with safehouse staff. Displaying Base Crew Command Station...";
        setIsLoading(false);
        return;
      }

      // Bar Dialog Jax / Talk Jax
      else if (cleanAction.includes("talk to agent jax") || cleanAction.includes("agent jax")) {
        setActiveDialogue("jax");
        narrative = "You initiate secure transmission layer with Agent Jax.";
        setIsLoading(false);
        return;
      }

      // Order synthetic drink
      else if (cleanAction.includes("order spell-enhanced cocktail") || cleanAction.includes("cocktail") || cleanAction.includes("drink")) {
        if (nextState.credits >= 10) {
          nextState.credits -= 10;
          nextState.mana = Math.min(nextState.maxMana, nextState.mana + 30);
          narrative = "🍸 ORDER DISPENSED: Slipped a glowing magenta synth-cocktail. Bio-ether levels recharged (+30 Mana)!";
          setActivePopup({
            title: "SYNTH-COCKTAIL DISPENSED",
            subtitle: "RECOGNITION FLUID RECEIVED",
            type: "check_success",
            text: "You down the glowing magenta synthetic drink. A warm, vibrating bio-ether energy surges through your nervous system!\n\nRecharged +30 Mana!"
          });
        } else {
          narrative = "❌ INSUFFICIENT LIQUIDITY: The bartender spits on the floor. 'Get some real currency.'";
          setActivePopup({
            title: "TRANSACTION REFUSED",
            subtitle: "LIQUIDITY RUNOUT",
            type: "check_failure",
            text: "The bartender looks at your empty ledger and spits on the concrete floor. 'Get some real currency, rookie.'"
          });
        }
      }

      // Eavesdrop on thugs
      else if (cleanAction.includes("eavesdrop")) {
        narrative = "📻 AUDIOWALL HACKED: Overheard conversation feeds:\n- 'Aria at Apex showroom is distributing heavy weapons if you clear out water monsters in the Docks Region...'\n- 'Jax is in a serious pick, the outpatient team got ambushed Downtown inside Shatter Ridge...'";
        setActivePopup({
          title: "AUDIOWALL INTERCEPT",
          subtitle: "EAVESDROP SUCCESS",
          type: "check_success",
          text: "📻 SECURE FEED INTERCEPT OVERLAY:\n\n• \"Aria at Apex showroom is distributing heavy weapons if you clear out water monsters in the Docks Region...\"\n\n• \"Jax is in a serious pick, the outpatient team got ambushed Downtown inside Shatter Ridge...\"\n\n• \"I heard the local weapon vendors restocked deluxe/legendary items under the hood!\""
        });
      }

      // Search Booths
      else if (cleanAction.includes("search booths") || cleanAction.includes("trash scrap")) {
        if (Math.random() > 0.4) {
          nextState.inventory.push("Rusted Circuitry");
          narrative = "🔍 SCAVENGE SUCCESS: Pulled a functional copper piece of 'Rusted Circuitry' scrap from behind leather benches! Sell this at Apex Armory.";
          setActivePopup({
            title: "SCRAP RECOVERED",
            subtitle: "SCAVENGE SUCCESS",
            type: "loot",
            text: "You reached deep behind the sticky leather benches and salvaged a piece of functional copper 'Rusted Circuitry' scrap! This can be recycled for credits at the Apex Armory."
          });
        } else {
          narrative = "🔍 SCAVENGE EMPTY: Only sticky chemical residue and empty drug cylinders detected.";
          setActivePopup({
            title: "SCAVENGE DRY",
            subtitle: "SCAVENGE EMPTY",
            type: "check_failure",
            text: "You searched thoroughly underneath the booths but found only sticky chemical residue and empty drug cylinders."
          });
        }
      }

      // Enter Auction Lobby
      else if (cleanAction.includes("enter auction lobby") || cleanAction.includes("auction lobby") || cleanAction.includes("enter slave")) {
        setActiveDialogue("auction_lobby");
        narrative = "You step into the dimly-lit syndicate bidding lounge. Cages line the perimeter under orange light tubes.";
        setIsLoading(false);
        return;
      }

      // Inspect Holdout Pens
      else if (cleanAction.includes("inspect holdout pens") || cleanAction.includes("holdout pens") || cleanAction.includes("inspect outcast")) {
        setActiveDialogue("inspect_pens");
        narrative = "You walk through the holding blocks, reviewing the cold carbon-steel enclosures of captured escapees.";
        setIsLoading(false);
        return;
      }

      // Bribe Syndicate Warden
      else if (cleanAction.includes("bribe syndicate warden") || cleanAction.includes("bribe warden")) {
        if (nextState.credits >= 40) {
          nextState.credits -= 40;
          nextState.completedPOIActions.push("auction_market:bribed");
          narrative = "💰 WARDEN BRIBED: You slip a cold ledger block containing 40¤ into the warden's glove. Active bid prices reduced by 25%!";
          setActivePopup({
            title: "WARDEN BRIBED",
            subtitle: "MARKET OVERRIDE ACTIVE",
            type: "check_success",
            text: "You slipped 40¤ to the Syndicate Warden. He pockets it and flips off the active telemetry monitors. All bids are now cheaper!"
          });
        } else {
          narrative = "❌ TRANSACTION FAILURE: Warden scowls. 'You think forty copper bits buy you silence here?'";
          setActivePopup({
            title: "TRANSACTION REJECTED",
            subtitle: "INSUFFICIENT LIQUIDITY",
            type: "check_failure",
            text: "The Warden sneers at your small balance ledger. 'You think forty copper bits buy you silence here? Move along.'"
          });
        }
      }

      // Talk Aria
      else if (cleanAction.includes("talk to chancellor aria") || cleanAction.includes("chancellor aria")) {
        setActiveDialogue("aria");
        narrative = "You establish connection interface with Chancellor Aria.";
        setIsLoading(false);
        return;
      }

      // Sell scrap
      else if (cleanAction.includes("sell scrap") || cleanAction.includes("sell ") && cleanAction.includes("circuitry")) {
        if (nextState.inventory.includes("Rusted Circuitry")) {
          nextState.inventory = nextState.inventory.filter(i => i !== "Rusted Circuitry");
          nextState.credits += 30;
          narrative = "💰 TRANS-RECEIVER CLEARED: Disposed of Rusted Circuitry scrap to automated recycler. Recovered +30¤.";
          setActivePopup({
            title: "SCRAP RECYCLED",
            subtitle: "AUTOMATED RECYCLER",
            type: "loot",
            text: "You loaded the Rusted Circuitry scrap into the slot. The machine clanks, shreds, and registers a trade. Transfer complete!\n\nEarned +30¤ Credits!"
          });
        } else {
          narrative = "⚠️ recycler refused: No 'Rusted Circuitry' detected under active equipment list.";
          setActivePopup({
            title: "RECYCLER ERROR",
            subtitle: "SCRAP REJECTED",
            type: "check_failure",
            text: "The automated terminal's red scanner flashes. No 'Rusted Circuitry' detected in your stash inventory. Recycler sequence aborted."
          });
        }
      }

      // Buy shop items
      else if (cleanAction.includes("purchase advanced") || cleanAction.includes("purchase item") || cleanAction.includes("gear")) {
        setShopVendorOpen(true);
        narrative = "🛒 SHOP VENDOR CONSOLE INITIALIZED: Accessing the localized neural network shop. Complete your equipment upgrades from the interactive terminal modal now!";
      }

      // Talk Recruiter
      else if (cleanAction.includes("consult agent recruiter") || cleanAction.includes("vesper")) {
        setActiveDialogue("recruiter");
        narrative = "You approach Nexus Coordinator Agent Vesper.";
        setIsLoading(false);
        return;
      }

      // Hire Crew triggers
      else if (cleanAction.includes("contract hire") || cleanAction.includes("hire ")) {
        const name = cleanAction.includes("scythe") ? "Scythe" : cleanAction.includes("vex") ? "Vex" : "Brick";
        const target = nextState.companions.find(c => c.name === name);
        if (target) {
          if (target.status !== "available") {
            narrative = `⚠️ INTEGRATION FAIL: Operator ${target.name} is already deployed on active squad database registry.`;
          } else if (nextState.credits >= target.fee) {
            nextState.credits -= target.fee;
            target.status = "in_party";
            nextState.party.push(target.name);
            narrative = `🤝 ROSTER ALIGNED: Contractor ${target.name} signed deployment agreements! Allocated job slots available at Hideout.`;
          } else {
            narrative = `❌ CREDIT FAIL: Operative ${target.name} requests ${target.fee}¤ starting payment. Balance insufficient.`;
          }
        }
      }

      // Talk Priestess Morgana
      else if (cleanAction.includes("talk to priestess morgana") || cleanAction.includes("morgana")) {
        setActiveDialogue("morgana");
        narrative = "Establishing telepathic link with High Priestess Morgana.";
        setIsLoading(false);
        return;
      }

      // Meditate Satoshi Square / Temple Core
      else if (cleanAction.includes("meditate with the core") || cleanAction.includes("meditate")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 35);
        narrative = "🧘 ETHER ABSORB: You sit silently inside the server cooling grid. Pure static energy enters your core (+35 Mana recovered).";

        if (nextState.activeQuests.some(q => q.includes("Syndicate Catalyst"))) {
          nextState.inventory.push("Charged Ley-Matrix");
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Syndicate Catalyst"));
          nextState.activeQuests.push("Objective: Return 'Charged Ley-Matrix' to High Priestess Morgana in Satoshi Square Coven.");
          narrative += "\n\n🎒 OBJECTIVE COLLECTED: The black cube hums and glows with volatile violet plasma! 'Charged Ley-Matrix' obtained.";
        }
      }

      // Meditate Shrines (Satoshi Gardens)
      else if (cleanAction.includes("meditate with shrines")) {
        nextState.hp = Math.min(nextState.maxHp, nextState.hp + 10);
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 15);
        narrative = "🌸 ZEN CHIPPED: The synthetic cherry petals float over your body. Partially recovered health and mana streams (+10 HP, +15 Mana).";
      }

      // Perform offering at Shrine
      else if (cleanAction.includes("perform ritual tech offering")) {
        if (nextState.credits >= 20) {
          nextState.credits -= 20;
          nextState.mana = nextState.maxMana;
          narrative = "🌸 COVEN GRACE: Siphoned 20¤ as digital offering. Your cybernetic mana channels are fully charged!";
        } else {
          narrative = "❌ INSUFFICIENT FUNDS: No digital change recorded under active network logs.";
        }
      }

      // Train Mana capacity at Temple
      else if (cleanAction.includes("train mana capacity") || cleanAction.includes("train mana")) {
        if (nextState.credits >= 80) {
          nextState.credits -= 80;
          nextState.maxMana += 20;
          nextState.mana = nextState.maxMana;
          narrative = "🧬 NEURAL EXPANSION: Successfully augmented your cortex limits! +20 Maximum ETHER capacity permanently installed.";
        } else {
          narrative = "❌ SHORT ON CREDITS: High Priestess Morgana shakes her head. 'Mind training requires a donation of 80¤.'";
        }
      }

      // ---- COMBAT SPOTS INITIATE ----
      
      // Shatter Ridge combat
      else if (cleanAction.includes("ambush outlaw") || cleanAction.includes("engage combat") || cleanAction.includes("canyon outlaws")) {
        const templates = ENEMIES.shatter_ridge;
        const roll = templates[Math.floor(Math.random() * templates.length)];
        
        nextState.combatState = {
          enemyName: roll.name,
          enemyHp: roll.hp,
          enemyMaxHp: roll.maxHp,
          enemyShields: roll.shields,
          enemyMaxShields: roll.maxShields,
          isActive: true,
          turnLog: `${roll.name} drops from a highwalk structural beam with auto-pistols aimed!`
        };
        narrative = `💥 COMBAT INITIALIZED: Ambushed by a hostile ${roll.name}! Deploy defense systems immediately.`;
        logType = "combat";
      }

      // Outlaw Mine scavenger
      else if (cleanAction.includes("scavenge rusted mine") || cleanAction.includes("rusted mine") || cleanAction.includes("mine shaft")) {
        if (Math.random() > 0.4) {
          if (!nextState.inventory.includes("Technical Signal Core") && nextState.activeQuests.some(q => q.includes("Outcast Directive"))) {
            nextState.inventory.push("Technical Signal Core");
            nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Outcast Directive"));
            nextState.activeQuests.push("Objective: Deliver the 'Technical Signal Core' to Agent Jax at the Neon Abyss Bar.");
            narrative = "★ SEARCH DISCOVERY: You hack open a locked container inside the creaking highwalk elevator shafts! Got quest item: 'Technical Signal Core'. Deliver this back to Agent Jax.";
          } else {
            nextState.inventory.push("Nano Med-Stim (Heal)");
            narrative = "🔍 SCAVENGE SUCCESS: Salvaged an unused corporate medical stimpack ('Nano Med-Stim (Heal)') from an empty highwalk crate!";
          }
        } else {
          narrative = "🔍 SCAVENGE FAILURE: Ground sensors show only heavy iron oxide sludge and metallic scrap dust.";
        }
      }

      // Sludge Conduits combat (Wetlands / sewer replacement)
      else if (cleanAction.includes("hunt toxic swamp") || cleanAction.includes("hunt toxic") || cleanAction.includes("sludge crawler")) {
        const templates = ENEMIES.sludge_conduits;
        let roll = templates[0]; // Crawler
        
        // Spawn boss if quest is active and not finished
        if (nextState.activeQuests.some(q => q.includes("Sludge Behemoth") || q.includes("Corporate Hunt"))) {
          roll = templates[1]; // Behemoth Boss!
        }

        nextState.combatState = {
          enemyName: roll.name,
          enemyHp: roll.hp,
          enemyMaxHp: roll.maxHp,
          enemyShields: roll.shields,
          enemyMaxShields: roll.maxShields,
          isActive: true,
          turnLog: `The radioactive crawler slithers out of hot bubbling acid runoff conduits!`
        };
        narrative = `💥 COMBAT INITIALIZED: Confronted by hostile mutant ${roll.name}! Heavy toxic gas warnings triggered.`;
        logType = "combat";
      }

      // Scan shipping container / Scavenge sewers
      else if (cleanAction.includes("scavenge shipping") || cleanAction.includes("container") || cleanAction.includes("scavenge glowing")) {
        if (Math.random() > 0.5) {
          nextState.inventory.push("Ether Mana-Cell (Mana)");
          narrative = "🔍 SCAVENGE SUCCESS: Extracted a fully charged battery cells 'Ether Mana-Cell (Mana)' from discarded industrial containers!";
        } else {
          nextState.hp = Math.max(15, nextState.hp - 15);
          narrative = "⚠️ ACID LEAK HAZARD: You slipped on a chemically corroded valve. Spent coolant burned through leg chassis! Dealt -15 corrosion damage.";
        }
      }

      // ---- MAIN QUEST & SIDE QUEST ACTION HANDLERS ----
      else if (cleanAction.includes("interface with cargo logs") || cleanAction.includes("cargo logs") || cleanAction.includes("cargo terminal")) {
        if (nextState.activeQuests.some(q => q.includes("The Hunt for Vice"))) {
          const int = nextState.attributes?.int || 10;
          const netSlicer = nextState.skills?.netSlicer || 1;
          const roll = Math.floor(Math.random() * 20) + 1 + int + (netSlicer * 2);
          
          if (roll >= 18) {
            nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("The Hunt for Vice"));
            nextState.activeQuests.push("Main Quest: Rescue Vice - Infiltrate the sub-level detention cells beneath Ares Biotech Corporate Plaza (Downtown) and extract Vice.");
            if (!nextState.inventory.includes("Decrypted Ares Transit Token")) {
              nextState.inventory.push("Decrypted Ares Transit Token");
            }
            narrative = `💾 SECURITY BYPASSED (Roll: ${roll} vs 18): You hacked the main cargo logistics node! You successfully decrypted transport manifests showing Vice was shipped to cryogenic detainment sub-levels underneath the Ares Biotech Corporate Plaza in Downtown district. You also siphoned a 'Decrypted Ares Transit Token' to assist with infiltration!`;
            setActivePopup({
              title: "💾 SECURITY BYPASSED",
              subtitle: "LOGISTICS ARCHIVE BREACHED",
              type: "check_success",
              text: `With superb neural execution (Roll: ${roll} vs 18), you bypassed the Titan Logistics security nodes. You isolated the transport log for Subject ID: Vice.\n\nDestination: Cryo-Locked Detainment Bay B, beneath Ares Biotech Corporate Plaza, Downtown.\n\nYou have also siphoned an encrypted 'Decrypted Ares Transit Token' into your active stash database!`
            });
          } else {
            nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("The Hunt for Vice"));
            nextState.activeQuests.push("Main Quest: Rescue Vice - Infiltrate the sub-level detention cells beneath Ares Biotech Corporate Plaza (Downtown) and extract Vice.");
            nextState.hp = Math.max(10, nextState.hp - 20);
            narrative = `⚠️ BACKLASH ERROR (Roll: ${roll} vs 18): You attempted to crack the node, but a proxy-firewall triggered a neural feedback loop! Dealt -20 cognitive feedback damage. However, before the terminal fully locked down, you copied a fragmented transfer log: Vice has been transported to the cryogenic detention block under Ares Biotech Corporate Plaza in Downtown!`;
            setActivePopup({
              title: "⚠️ NEURAL BACKLASH",
              subtitle: "FIREWALL TRAP ENGAGED",
              type: "check_failure",
              text: `The terminal detected your intrusion vector (Roll: ${roll} vs 18). A feedback voltage shock surge scorched your synapse arrays, dealing -20 HP damage!\n\nHowever, a partial transfer manifest was successfully cached:\n\nSubject ID: Vice has been relocated to the cryogenic holding block beneath Ares Biotech Corporate Plaza (Downtown Region). Proceed there immediately!`
            });
          }
        } else {
          narrative = "The cargo terminal lists hundreds of thousands of active logistics lines for Megacity-9. Without a specific query key or active mission, the grid-hash remains unreadable.";
        }
      }
      else if (cleanAction.includes("bribe security automated bot")) {
        if (nextState.credits >= 15) {
          nextState.credits -= 15;
          if (!nextState.completedPOIActions.includes("corporate_plaza:bot_bribed")) {
            nextState.completedPOIActions.push("corporate_plaza:bot_bribed");
          }
          narrative = "💰 BOT BYPASSED: Slipped 15¤ into the automated bot's service slider. Active plaza security scan sensitivity reduced (+4 bonus to infiltration hacks!).";
          setActivePopup({
            title: "BOT CALIBRATION MODIFIED",
            subtitle: "SECURITY SCAN BYPASSED",
            type: "check_success",
            text: "You inserted 15¤ into the bot's micro-ledger. A gear clicks, and its orange lens flashes green. The local scanner sweeps are temporarily adjusted to filter out your neural signature.\n\nGain +4 bonus to security hacking checks at the Plaza!"
          });
        } else {
          narrative = "❌ TRANSACTION ABORTED: The automated security bot buzzes: 'LIQUIDITY DEFICIT. RETRACTING SYSTEM PERMISSION.'";
        }
      }
      else if (cleanAction.includes("view ares commercial holograms") || cleanAction.includes("ares commercial holograms")) {
        nextState.mana = Math.min(nextState.maxMana, nextState.mana + 15);
        narrative = "📺 HOLOGRAPHIC OVERLAY: You stand beneath towering 3D renders of biotech chimeras and armor frames. A calming neural ripple from the projectors refreshes your cognitive arrays (+15 Mana).";
        setActivePopup({
          title: "ARES CORP PROMOTION",
          subtitle: "HOLOGRAPHIC CHANNELS SYNCED",
          type: "loot",
          text: "A grand voice echoes from glowing glass structures:\n\n'Ares Biotech: Designing the perfect tomorrow, today.'\n\nYour neural deck interfaces with the high-concept visual carrier waves, siphoning active ether streams. Recovered +15 Mana!"
        });
      }
      else if (cleanAction.includes("assault plaza guards")) {
        nextState.combatState = {
          enemyName: "Ares Plasma Sentinel",
          enemyHp: 110,
          enemyMaxHp: 110,
          enemyShields: 40,
          enemyMaxShields: 40,
          isActive: true,
          turnLog: "The heavy automated Plasma Sentinel activates its dual heavy laser turrets and slides on ceiling tracks into a defensive formation!"
        };
        narrative = "💥 ELITE ENGAGEMENT: You draw weapons and charge the checkpoint! The Plasma Sentinel rotates on steel tracks and engages!";
        logType = "combat";
      }
      else if (cleanAction.includes("hack security mainframe")) {
        const bribed = nextState.completedPOIActions?.includes("corporate_plaza:bot_bribed");
        const int = nextState.attributes?.int || 10;
        const netSlicer = nextState.skills?.netSlicer || 1;
        const bonus = bribed ? 4 : 0;
        const roll = Math.floor(Math.random() * 20) + 1 + int + (netSlicer * 2) + bonus;

        if (roll >= 18) {
          nextState.completedPOIActions.push("corporate_plaza:security_bypassed");
          narrative = `💾 MAINBOARD OVERRIDDEN (Roll: ${roll} vs 18): You successfully bypassed the security checkpoint terminal! Staff lift unlocked.`;
          setActivePopup({
            title: "💾 DECRYPT COMPLETE",
            subtitle: "MAINBOARD COVERT OVERRIDE",
            type: "check_success",
            text: `With brilliant neural flow (Roll: ${roll} vs 18), you bypassed the security nodes. You looped the video feeds and injected a simulated security authorization. The heavy titanium elevator slides open smoothly. You step inside to descend to the detention sub-level!`
          });
        } else {
          nextState.combatState = {
            enemyName: "Ares Plasma Sentinel",
            enemyHp: 110,
            enemyMaxHp: 110,
            enemyShields: 60, // Boosted shields due to alarm
            enemyMaxShields: 60,
            isActive: true,
            turnLog: "🚨 ALERT: SECURITY BREACH DETECTED! Sentry guns deploy with emergency combat shielding!"
          };
          narrative = `🚨 SECURITY ALARM (Roll: ${roll} vs 18): You failed the override hack! Red strobe lights spin. An Ares Plasma Sentinel with boosted defense shields deploys immediately!`;
          logType = "combat";
        }
      }
      else if (cleanAction.includes("forge clearance credentials")) {
        nextState.completedPOIActions.push("corporate_plaza:security_bypassed");
        narrative = "🔑 CLEARANCE CONFIRMED: Presenting the forged credentials, the terminal's red scanners flash green. Staff lift unlocked.";
        setActivePopup({
          title: "🔑 CLEARANCE CONFIRMED",
          subtitle: "TRANSIT BADGE ACCEPTED",
          type: "check_success",
          text: "You slot the Decrypted Ares Transit Token or cast a subtle Mindmance signal. The checkpoint scanners green-light your access. The elevator doors open cleanly!"
        });
      }
      else if (cleanAction.includes("breach cryo-detention unit")) {
        nextState.completedPOIActions.push("corporate_plaza:detention_floor");
        narrative = "🔓 SUB-LEVEL BREACHED: You take the lift down to the chilling, frost-covered cryogenic detention cells. Vice is locked in Chamber B-12!";
        setActivePopup({
          title: "🔓 SUB-LEVEL BREACHED",
          subtitle: "CRYO-LOCKDOWN MODE ACTIVE",
          type: "combat_warning",
          text: "The sub-level air is freezing. Ice crystals cling to heavy tubes. Vice is suspended in a thick glass cryo-pod, his life signs stable but locked at zero kelvin. Choose your method to trigger the emergency eject!"
        });
      }
      else if (cleanAction.includes("force emergency cryo-release valve")) {
        const str = nextState.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + str;
        
        if (roll >= 16) {
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Rescue Vice") && !q.includes("The Hunt for Vice"));
          nextState.completedQuests.push("Chapter 1 Completed: Vice Rescued from Cryo-Detention");
          
          const viceIdx = nextState.companions.findIndex(c => c.name === "Vice");
          if (viceIdx >= 0) {
            nextState.companions[viceIdx].status = "in_party";
          } else {
            nextState.companions.push({
              name: "Vice",
              fee: 0,
              status: "in_party",
              role: "Tactical Leader",
              bio: "The veteran leader of your shadow-running cell. Armed with years of combat telemetry, tactical insight, and a modified plasma sidearm.",
              avatar: "🔫",
              equipment: {
                meleeWeapon: "Vibroblade",
                rangedWeapon: "Battle Pistol BP132",
                armor: "Light Neon Leather Armor",
                headpiece: null,
                trinket: null
              },
              inventory: []
            });
          }
          if (!nextState.party.includes("Vice")) {
            nextState.party.push("Vice");
          }

          const viceBaseNPC = {
            id: "vice",
            name: "Vice",
            role: "Weapons & Field Coordinator",
            avatar: "🔫",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
            description: "Vice stands tall, adjusting his specialized heavy plasma pistol. His cybernetic eye flickers as he reviews battle tactical logs. His loyalty to you is absolute.",
            dialogue: "Kid, you came for me. Respect. The Safehouse is looking amazing, let's start planning our next strike on the corporate structures.",
            reaction: null,
            happiness: 90,
            affection: "Warm",
            affectionValue: 75,
            willpower: 80,
            corruption: 15,
            hygiene: "Normal",
            discipline: 75,
            hunger: "Satiated",
            respect: 80,
            withdrawRisk: "None",
            anger: 0,
            defiance: 0,
            fear: 0,
            inventory: ["Heavy Plasma Pistol", "Reinforced Flak Guard"],
            currentJob: "Defensive Security Guard"
          };
          nextState.baseNPCs = [...(nextState.baseNPCs || []), viceBaseNPC];
          nextState.credits += 300;
          nextState.experience += 150;

          setActivePopup({
            title: "🔓 CHAPTER 1 COMPLETED!",
            subtitle: "VICE HAS BEEN EXTRACTED",
            type: "check_success",
            text: "The cryo-glass seal cracks (Roll: " + roll + " vs 16), releasing pressurized white nitrogen gas. Vice stumbles out of the pod, coughing and shivering but grinning. He slams his organic fist onto your armored shoulder:\n\n'Kid... you came. You actually breached an Ares security plaza for me. Respect.'\n\nReward: Vice joins your Hideout Base & active party squad!\n+300¤ Credits, +150 XP!\n\nSpeak to Agent Jax at Neon Abyss Bar to prepare for Chapter 2!"
          });
          narrative = `💪 VALVE FORCED (Roll: ${roll} vs 16): You put your back into the emergency lever and rip open the manual cryo-coolant valve! Vice ejects safely.`;
        } else {
          nextState.hp = Math.max(10, nextState.hp - 20);
          narrative = `❌ VALVE RESISTED (Roll: ${roll} vs 16): You strained against the heavy rusted valve, but it refused to turn, venting freezing coolant onto your arms (-20 HP). Choose another vector!`;
        }
      }
      else if (cleanAction.includes("override cryogenic suspension")) {
        const int = nextState.attributes?.int || 10;
        const netSlicer = nextState.skills?.netSlicer || 1;
        const roll = Math.floor(Math.random() * 20) + 1 + int + (netSlicer * 2);

        if (roll >= 16) {
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Rescue Vice") && !q.includes("The Hunt for Vice"));
          nextState.completedQuests.push("Chapter 1 Completed: Vice Rescued from Cryo-Detention");
          
          const viceIdx = nextState.companions.findIndex(c => c.name === "Vice");
          if (viceIdx >= 0) {
            nextState.companions[viceIdx].status = "in_party";
          } else {
            nextState.companions.push({
              name: "Vice",
              fee: 0,
              status: "in_party",
              role: "Tactical Leader",
              bio: "The veteran leader of your shadow-running cell. Armed with years of combat telemetry, tactical insight, and a modified plasma sidearm.",
              avatar: "🔫",
              equipment: {
                meleeWeapon: "Vibroblade",
                rangedWeapon: "Battle Pistol BP132",
                armor: "Light Neon Leather Armor",
                headpiece: null,
                trinket: null
              },
              inventory: []
            });
          }
          if (!nextState.party.includes("Vice")) {
            nextState.party.push("Vice");
          }

          const viceBaseNPC = {
            id: "vice",
            name: "Vice",
            role: "Weapons & Field Coordinator",
            avatar: "🔫",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
            description: "Vice stands tall, adjusting his specialized heavy plasma pistol. His cybernetic eye flickers as he reviews battle tactical logs. His loyalty to you is absolute.",
            dialogue: "Kid, you came for me. Respect. The Safehouse is looking amazing, let's start planning our next strike on the corporate structures.",
            reaction: null,
            happiness: 90,
            affection: "Warm",
            affectionValue: 75,
            willpower: 80,
            corruption: 15,
            hygiene: "Normal",
            discipline: 75,
            hunger: "Satiated",
            respect: 80,
            withdrawRisk: "None",
            anger: 0,
            defiance: 0,
            fear: 0,
            inventory: ["Heavy Plasma Pistol", "Reinforced Flak Guard"],
            currentJob: "Defensive Security Guard"
          };
          nextState.baseNPCs = [...(nextState.baseNPCs || []), viceBaseNPC];
          nextState.credits += 300;
          nextState.experience += 150;

          setActivePopup({
            title: "🔓 CHAPTER 1 COMPLETED!",
            subtitle: "VICE HAS BEEN EXTRACTED",
            type: "check_success",
            text: "The cryo-glass seal cracks (Roll: " + roll + " vs 16), releasing pressurized white nitrogen gas. Vice stumbles out of the pod, coughing and shivering but grinning. He slams his organic fist onto your armored shoulder:\n\n'Kid... you came. You actually breached an Ares security plaza for me. Respect.'\n\nReward: Vice joins your Hideout Base & active party squad!\n+300¤ Credits, +150 XP!\n\nSpeak to Agent Jax at Neon Abyss Bar to prepare for Chapter 2!"
          });
          narrative = `💻 OVERRIDE SUCCESSFUL (Roll: ${roll} vs 16): You bypassed the cryo-computer's thermal governor! The warm air defrost cycle engages. Vice is safely released!`;
        } else {
          nextState.hp = Math.max(10, nextState.hp - 15);
          narrative = `❌ OVERRIDE FAILURE (Roll: ${roll} vs 16): The system detected your terminal exploit and locked out further hacks, releasing a cryogenic frost blast (-15 HP). Choose another vector!`;
        }
      }
      else if (cleanAction.includes("short-circuit power grid coupling")) {
        if (nextState.mana >= 30) {
          nextState.mana -= 30;
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Rescue Vice") && !q.includes("The Hunt for Vice"));
          nextState.completedQuests.push("Chapter 1 Completed: Vice Rescued from Cryo-Detention");
          
          const viceIdx = nextState.companions.findIndex(c => c.name === "Vice");
          if (viceIdx >= 0) {
            nextState.companions[viceIdx].status = "in_party";
          } else {
            nextState.companions.push({
              name: "Vice",
              fee: 0,
              status: "in_party",
              role: "Tactical Leader",
              bio: "The veteran leader of your shadow-running cell. Armed with years of combat telemetry, tactical insight, and a modified plasma sidearm.",
              avatar: "🔫",
              equipment: {
                meleeWeapon: "Vibroblade",
                rangedWeapon: "Battle Pistol BP132",
                armor: "Light Neon Leather Armor",
                headpiece: null,
                trinket: null
              },
              inventory: []
            });
          }
          if (!nextState.party.includes("Vice")) {
            nextState.party.push("Vice");
          }

          const viceBaseNPC = {
            id: "vice",
            name: "Vice",
            role: "Weapons & Field Coordinator",
            avatar: "🔫",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
            description: "Vice stands tall, adjusting his specialized heavy plasma pistol. His cybernetic eye flickers as he reviews battle tactical logs. His loyalty to you is absolute.",
            dialogue: "Kid, you came for me. Respect. The Safehouse is looking amazing, let's start planning our next strike on the corporate structures.",
            reaction: null,
            happiness: 90,
            affection: "Warm",
            affectionValue: 75,
            willpower: 80,
            corruption: 15,
            hygiene: "Normal",
            discipline: 75,
            hunger: "Satiated",
            respect: 80,
            withdrawRisk: "None",
            anger: 0,
            defiance: 0,
            fear: 0,
            inventory: ["Heavy Plasma Pistol", "Reinforced Flak Guard"],
            currentJob: "Defensive Security Guard"
          };
          nextState.baseNPCs = [...(nextState.baseNPCs || []), viceBaseNPC];
          nextState.credits += 300;
          nextState.experience += 150;

          setActivePopup({
            title: "🔓 CHAPTER 1 COMPLETED!",
            subtitle: "VICE HAS BEEN EXTRACTED",
            type: "check_success",
            text: "The cryo-glass seal cracks, releasing pressurized white nitrogen gas. Vice stumbles out of the pod, coughing and shivering but grinning. He slams his organic fist onto your armored shoulder:\n\n'Kid... you came. You actually breached an Ares security plaza for me. Respect.'\n\nReward: Vice joins your Hideout Base & active party squad!\n+300¤ Credits, +150 XP!\n\nSpeak to Agent Jax at Neon Abyss Bar to prepare for Chapter 2!"
          });
          narrative = "⚡ SYSTEM SHORT-CIRCUITED: You channel 30 Mana directly into the cryo-grid power couplers, forcing an automated emergency failsafe eject! Vice is released!";
        } else {
          narrative = "⚠️ INSUFFICIENT ENERGY: You do not have 30 Mana available to overload the power couplers!";
        }
      }
      else if (cleanAction.includes("hunt rust-claw orcs")) {
        nextState.combatState = {
          enemyName: "Rogue Rust-Claw Orc",
          enemyHp: 90,
          enemyMaxHp: 90,
          enemyShields: 20,
          enemyMaxShields: 20,
          isActive: true,
          turnLog: "The heavy Orc roars, swinging a crude electrified scrap-mace!"
        };
        narrative = "💥 COMBAT INITIALIZED: You corner the rogue Rust-Claw Orc scavengers in Shatter Ridge! Deploy weapons!";
        logType = "combat";
      }
      else if (cleanAction.includes("deliver drone chip to jax")) {
        if (nextState.inventory.includes("Experimental Drone Chip")) {
          nextState.inventory = nextState.inventory.filter(i => i !== "Experimental Drone Chip");
          nextState.credits += 200;
          nextState.experience += 100;
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Drone"));
          nextState.completedQuests.push("Side Quest: The Lost Drone Schematic (Delivered to Jax)");
          narrative = "💰 SCHEMATIC DELIVERED: You delivered the experimental microchip to Agent Jax at the Neon Abyss Bar! Recovered +200¤ and +100 XP.";
          setActivePopup({
            title: "💰 QUEST COMPLETED",
            subtitle: "DRONE SCHEMATIC DELIVERED",
            type: "loot",
            text: "Jax takes the dense, glowing microchip with a smirk:\n\n'Incredible work. The Outcasts thank you, rookie. This chip has enough flight telemetry data to give us sector air superiority! Here are your credits.'\n\nReward: +200¤ Credits, +100 XP!"
          });
        }
      }
      else if (cleanAction.includes("install chip in base security")) {
        if (nextState.inventory.includes("Experimental Drone Chip")) {
          nextState.inventory = nextState.inventory.filter(i => i !== "Experimental Drone Chip");
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Drone"));
          nextState.completedQuests.push("Side Quest: The Lost Drone Schematic (Installed in Hideout)");
          
          if (!nextState.safehouseDefenses) {
            nextState.safehouseDefenses = {
              securityLevel: 1,
              turrets: 0,
              shieldStrength: 100,
              fortifiedDoors: false,
              intrusionLogs: []
            };
          }
          nextState.safehouseDefenses.securityLevel += 1;
          nextState.safehouseDefenses.shieldStrength = Math.min(250, nextState.safehouseDefenses.shieldStrength + 50);
          nextState.safehouseDefenses.intrusionLogs.push(`📡 Experimental drone telemetry chip synchronized. Shielding boosted by 50%. Security Level escalated to ${nextState.safehouseDefenses.securityLevel}.`);
          
          narrative = "🔧 BASE INTEGRATION: You installed the Drone Chip directly into the Hideout's mainframe grid! Permanent shield and defense boost applied!";
          setActivePopup({
            title: "🔧 BASE UPGRADED",
            subtitle: "DRONE TELEMETRY INTEGRATED",
            type: "check_success",
            text: "You slot the experimental microchip into the Hideout security terminal. Automated micro-drones deploy around the safehouse perimeter, weaving an advanced defense grid!\n\nSafehouse Security Level increased!\nBase Shield Strength +50%!"
          });
        }
      }
      
      // ==========================================
      // ---- EXPANDED DOCKS & DOWNTOWN POIs ----
      // ==========================================

      // 1. Titan Logistics Freight Hub & Smuggler's Run Quest actions
      else if (cleanAction.includes("accept 'the smuggler's run'")) {
        if (nextState.activeQuests.some(q => q.includes("Smuggler")) || nextState.completedQuests.some(q => q.includes("Smuggler"))) {
          narrative = "⚠️ CONTRACT RECORDED: You have already accepted or finished this contract under your active mission database.";
        } else {
          nextState.activeQuests.push("Side Quest: Smuggler's Run - Secure the Stolen Weapon Crate from the Iron Anchor gang at the Rusty Anchor Shipyard.");
          narrative = "📜 CONTRACT SIGNED: Siphoned the 'Smuggler's Run' contract details into your neural interface. Travel to the Rusty Anchor Shipyard POI to locate the contraband.";
          setActivePopup({
            title: "📜 CONTRACT SIGNED",
            subtitle: "SMUGGLER'S RUN ENGAGED",
            type: "check_success",
            text: "Titan Logistics Wharf-master Jack looks over his shoulder:\n\n'Alright, streetrunner. A heavy crate of high-grade experimental kinetic rifles was stolen by those Iron Anchor low-lifes at the Rusty Anchor Shipyard.\n\nRecover that crate and bring it back, and we'll pay you 160¤ plus a custom-vibrated titanium blade.'\n\nObjective: Raid the Rusty Anchor Shipyard (Combat POI)!"
          });
        }
      }
      else if (cleanAction.includes("deliver recovered weapon crate")) {
        if (nextState.inventory.includes("Stolen Weapon Crate")) {
          nextState.inventory = nextState.inventory.filter(i => i !== "Stolen Weapon Crate");
          nextState.credits += 160;
          nextState.experience += 100;
          if (!nextState.inventory.includes("Vibroblade")) {
            nextState.inventory.push("Vibroblade");
          }
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Smuggler"));
          nextState.completedQuests.push("Side Quest: The Smuggler's Run (Completed)");
          narrative = "💰 SHIPMENT RECOVERED: Delivered the stolen crate to Titan Logistics! Rewarded +160¤, +100 XP, and a custom Vibroblade weapon!";
          setActivePopup({
            title: "💰 CONTRACT COMPLETED",
            subtitle: "SMUGGLER'S RUN INVOICED",
            type: "loot",
            text: "Jack smiles with missing steel teeth, slotting the heavy crate into an automated freight pneumatic tube:\n\n'Smooth run, kid. You hit those Iron Anchor thugs hard. Here are your credits, and as promised, a premium-grade Vibroblade.'\n\nReward: +160¤ Credits, +100 XP, and 'Vibroblade' weapon added to inventory!"
          });
        } else {
          narrative = "❌ CONTRA-KEYS OFFLINE: You do not carry the 'Stolen Weapon Crate' in your inventory deck. Seek out the Shipyard first!";
        }
      }

      // 2. Rusty Anchor Shipyard actions
      else if (cleanAction.includes("raid syndicate caches")) {
        const templates = ENEMIES.shipyard;
        const isQuestActive = nextState.activeQuests.some(q => q.includes("Smuggler"));
        const roll = isQuestActive ? templates[1] : templates[0]; // Elite mech if quest active, otherwise standard smuggler

        nextState.combatState = {
          enemyName: roll.name,
          enemyHp: roll.hp,
          enemyMaxHp: roll.maxHp,
          enemyShields: roll.shields,
          enemyMaxShields: roll.maxShields,
          isActive: true,
          turnLog: isQuestActive 
            ? "A towering Heavy Cargo Loader Mech boots up with glowing crimson optics, blocking your path!"
            : "An Iron Anchor Smuggler raises his rifle and shouts: 'Look what we got here! Flesh for the grinder!'"
        };
        narrative = `💥 COMBAT INITIALIZED: Confronted by hostile ${roll.name}! Deploy tactical weapon systems!`;
        logType = "combat";
      }
      else if (cleanAction.includes("steal crane master control key")) {
        const dex = nextState.attributes?.dex || 10;
        const netSlicer = nextState.skills?.netSlicer || 1;
        const roll = Math.floor(Math.random() * 20) + 1 + dex + (netSlicer * 2);

        if (roll >= 15) {
          if (!nextState.inventory.includes("Carbon-Mesh Visor")) {
            nextState.inventory.push("Carbon-Mesh Visor");
          }
          nextState.experience += 25;
          narrative = `🔓 LOCKPICK SUCCESS (Roll: ${roll} vs 15): You slickly bypass the lock on the high-reach crane cabin and secure an advanced 'Carbon-Mesh Visor' and +25 XP!`;
          setActivePopup({
            title: "🔓 BYPASS COMPLETED",
            subtitle: "CRANE CABIN LOOTED",
            type: "check_success",
            text: `Superb manual finesse (Roll: ${roll} vs 15). You popped the pressurized seal of the Crane cabin, finding a corporate courier's leftover crate.\n\nAcquired: 'Carbon-Mesh Visor' added to stash!\nGain: +25 XP!`
          });
        } else {
          nextState.hp = Math.max(10, nextState.hp - 15);
          nextState.stamina = Math.max(0, nextState.stamina - 10);
          narrative = `🚨 SECURITY ALERT (Roll: ${roll} vs 15): You snapped a structural wire, triggering a pneumatic alarm trap! Freezing steam dealt -15 HP and -10 Stamina.`;
        }
      }
      else if (cleanAction.includes("scavenge submerged hull")) {
        if (Math.random() > 0.4) {
          nextState.credits += 30;
          narrative = "🔍 SCAVENGE SUCCESS: You climbed inside the half-submerged freighter hull and siphoned 30¤ worth of active copper micro-cables!";
        } else {
          nextState.hp = Math.max(15, nextState.hp - 10);
          narrative = "⚠️ SHARP CORROSION: You slipped on rusty structural plates. Scratched your leg plates (-10 HP).";
        }
      }

      // 3. Dr. Marv's Clinic actions
      else if (cleanAction.includes("talk to dr. marv") || cleanAction.includes("accept side-quest: cybernetic harvest")) {
        if (nextState.activeQuests.some(q => q.includes("Harvest")) || nextState.completedQuests.some(q => q.includes("Harvest"))) {
          narrative = "⚠️ PATIENT ENCRYPTED: Dr. Marv waving you off. 'You already have my blueprint tasks in your logs, patient.'";
        } else {
          nextState.activeQuests.push("Side Quest: Cybernetic Harvest - Harvest 2x Neural Regulators by ambushing patrols at the Highwalk Homicide Site (Downtown).");
          narrative = "📜 PATIENT RECORDED: Accepted Dr. Marv's contract. Travel to Downtown's Highwalk Homicide Site to ambush patrol units and secure the parts.";
          setActivePopup({
            title: "🧬 SPECIALIZED BIO-CONTRACT",
            subtitle: "CYBERNETIC HARVEST ENGAGED",
            type: "check_success",
            text: "Dr. Marv wipes a bloody laser scalpel, his mechanical eye zooming in on your torso:\n\n'Look here, streetrunner. Ares automated defense drones patrol the Highwalk Homicide Site in Downtown district. Their primary processors contain military-grade Neural Regulators.\n\nBring me two of those regulators to help stabilize my bio-stimulants, and I will reward you with 250¤ and a premium smart-targeting visor.'\n\nObjective: Hunt Patrol Drones at the Homicide Site!"
          });
        }
      }
      else if (cleanAction.includes("deliver neural regulators to dr. marv") || cleanAction.includes("deliver neural regulators")) {
        const regs = nextState.inventory.filter(i => i === "Neural Regulator").length;
        if (regs >= 2) {
          // Remove 2x regulators
          let removed = 0;
          nextState.inventory = nextState.inventory.filter(item => {
            if (item === "Neural Regulator" && removed < 2) {
              removed++;
              return false;
            }
            return true;
          });
          nextState.credits += 250;
          nextState.experience += 120;
          if (!nextState.inventory.includes("Smart-Targeting Visor")) {
            nextState.inventory.push("Smart-Targeting Visor");
          }
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Harvest"));
          nextState.completedQuests.push("Side Quest: Cybernetic Harvest (Completed)");
          narrative = "🧬 NEURAL REGULATORS SECURED: Delivered the 2x regulators to Dr. Marv! Rewarded +250¤, +120 XP, and a rare 'Smart-Targeting Visor'!";
          setActivePopup({
            title: "🧬 SYSTEM STABILIZED",
            subtitle: "CYBERNETIC HARVEST COMPLETE",
            type: "loot",
            text: "Dr. Marv plugs the fluid-cooled regulators into his bio-synth machine with a sigh of relief:\n\n'Superb specimens. Clean matrix, no feedback corrosion. Take this visor, runner. It links directly with your tactical interface to boost overall damage.'\n\nReward: +250¤ Credits, +120 XP, and 'Smart-Targeting Visor' added to inventory (+12 bonus damage to combat strikes!)"
          });
        } else {
          narrative = `❌ LOGS DETECTED LIQUIDITY GAP: You only have ${regs}/2 Neural Regulators. Ambush patrols at Highwalk Homicide Site in Downtown region first!`;
        }
      }
      else if (cleanAction.includes("undergo experimental bio-splice")) {
        if (nextState.completedPOIActions.includes("marv_clinic:bio_spliced")) {
          narrative = "⚠️ CHROMOSOME ERROR: Dr. Marv shakes his head. 'I can't splice you again, runner. Your central nervous grid would collapse into mush!'";
        } else {
          const str = nextState.attributes?.str || 10;
          const roll = Math.floor(Math.random() * 20) + 1 + str;

          if (roll >= 16) {
            nextState.completedPOIActions.push("marv_clinic:bio_spliced");
            nextState.maxHp += 15;
            nextState.hp = nextState.maxHp;
            nextState.experience += 30;
            narrative = `🧬 BIO-SPLICE SUCCESSFUL (Roll: ${roll} vs 16): Dr. Marv weaves advanced synthetic muscles directly into your chest plates! Permanent Max HP +15 and health fully restored!`;
            setActivePopup({
              title: "🧬 EVOLUTION INSTALLED",
              subtitle: "EXPERIMENTAL BIO-SPLICE",
              type: "check_success",
              text: `With high-tensile pain tolerance (Roll: ${roll} vs 16), you survived the raw cybernetic suture process without anesthetic.\n\nYour muscular-skeletal framework is reinforced with synthetic titanium weaves!\n\nPermanent Boost: Max HP +15 (Current Max: ${nextState.maxHp})!`
            });
          } else {
            nextState.hp = Math.max(10, nextState.hp - 25);
            nextState.stamina = Math.max(0, nextState.stamina - 20);
            narrative = `🧬 SURGICAL CRITICAL REJECTION (Roll: ${roll} vs 16): Your chromosomes rejected the synthetic material. Your blood vessels swelled painfully (-25 HP, -20 Stamina).`;
          }
        }
      }

      // 4. Club Afterlife VIP Lounge actions
      else if (cleanAction.includes("talk to cipher")) {
        if (nextState.inventory.includes("VIP Afterlife Keycard") || nextState.inventory.includes("Prototype Singularity Battery")) {
          narrative = "💬 VIP CHAT: Cipher waves his glass. 'We already have the plan running, runner. Go secure that Prototype battery from Nouveau!'";
        } else {
          const int = nextState.attributes?.int || 10;
          const netSlicer = nextState.skills?.netSlicer || 1;
          const roll = Math.floor(Math.random() * 20) + 1 + int + (netSlicer * 2);

          if (roll >= 14) {
            if (!nextState.inventory.includes("VIP Afterlife Keycard")) {
              nextState.inventory.push("VIP Afterlife Keycard");
            }
            nextState.experience += 30;
            narrative = `💬 INTELLIGENCE INSIGHT (Roll: ${roll} vs 14): You smoothly convinced Cipher of your hacking credentials. He hands you his personal 'VIP Afterlife Keycard' to assist with the Nouveau heist!`;
            setActivePopup({
              title: "💬 CIPHER CONVINCED",
              subtitle: "VIP SECURITY TRANSIT INJECTION",
              type: "check_success",
              text: "Cipher nods slowly, his neon green visor glowing under his hood:\n\n'You've got real balls, runner. Okay, take my VIP security pass keycard. It interfaces directly with the Nouveau Cybernetic Showroom's pressure terminal, giving you +2 hack bonus.\n\nGet me that Prototype Singularity Battery from their safe. Go!'"
            });
          } else {
            narrative = `💬 TRUST LEVEL INSUFFICIENT (Roll: ${roll} vs 14): Cipher remains unimpressed. 'You're small-time, runner. If you want this keycard, buy me high-grade champagne or slip it from my pocket.'`;
          }
        }
      }
      else if (cleanAction.includes("buy round of luxury champagne")) {
        if (nextState.credits >= 30) {
          nextState.credits -= 30;
          nextState.hp = Math.min(nextState.maxHp, nextState.hp + 35);
          nextState.mana = Math.min(nextState.maxMana, nextState.mana + 35);
          narrative = "🍾 CHAMPAGNE POURED: Siphoned 30¤. You drink the icy, oxygen-fused synthetic champagne. High-grade molecular repair (+35 HP, +35 Mana)!";
        } else {
          narrative = "❌ CREDIT TRANSACTION SHIELD: High-priority champagne requires 30¤. Trans-funds blocked.";
        }
      }
      else if (cleanAction.includes("eavesdrop on corporate executives")) {
        nextState.experience += 15;
        narrative = "👂 INTEL FILTERED: You slip close to a corporate VIP booth. You intercept localized audio feeds showing that Nouveau's safe shields can be bypassed easily if you hack their mainframe terminal with a VIP Afterlife Keycard!";
      }
      else if (cleanAction.includes("slip vip keycard into pocket")) {
        if (nextState.inventory.includes("VIP Afterlife Keycard")) {
          narrative = "⚠️ DECK DETECTED: You already have a 'VIP Afterlife Keycard' inside your pockets.";
        } else {
          const dex = nextState.attributes?.dex || 10;
          const roll = Math.floor(Math.random() * 20) + 1 + dex;

          if (roll >= 15) {
            nextState.inventory.push("VIP Afterlife Keycard");
            nextState.experience += 25;
            narrative = `🕵️ SLEIGHT OF HAND SUCCESS (Roll: ${roll} vs 15): You smoothly bumped into Cipher and slipped his 'VIP Afterlife Keycard' from his neon duster pocket!`;
          } else {
            nextState.hp = Math.max(10, nextState.hp - 15);
            nextState.stamina = Math.max(0, nextState.stamina - 15);
            narrative = `🚨 PICKPOCKET CAUGHT (Roll: ${roll} vs 15): Cipher notices your manual intrusion! His bodyguard shoves you roughly into a plasma partition (-15 HP, -15 Stamina).`;
          }
        }
      }

      // 5. Nouveau Cybernetic Showroom actions
      else if (cleanAction.includes("inquire about 'nouveau heist'")) {
        if (nextState.activeQuests.some(q => q.includes("Heist")) || nextState.completedQuests.some(q => q.includes("Heist"))) {
          narrative = "⚠️ HEIST ENGAGED: Heist blueprints are already registered under your neural deck logs.";
        } else {
          nextState.activeQuests.push("Side Quest: Nouveau Heist - Meet Cipher at Club Afterlife, get a VIP Keycard, and steal the Prototype Singularity Battery from Nouveau Showroom.");
          narrative = "📜 HEIST CONTRACT RECORDED: Infiltrate Club Afterlife to formulate a plan with Cipher to crack the Nouveau Cybernetic Showroom shields.";
          setActivePopup({
            title: "💎 HEIST OF NOUVEAU SHOWROOM",
            subtitle: "HIGH-SECURITY INFILTRATION",
            type: "check_success",
            text: "You review the showroom blueprints. The luxury Prototype Singularity Battery is stored behind polarized electromagnetic kinetic force shields.\n\nTo steal it, you'll need Cipher's VIP Afterlife Keycard or an exceptionally high intelligence software exploit."
          });
        }
      }
      else if (cleanAction.includes("hack nouveau pressure shields")) {
        if (nextState.completedPOIActions.includes("nouveau_chrome:shields_hacked")) {
          narrative = "⚠️ MAINBOARD DECRYPTED: The pressure shields are already disabled. The glass pod is wide open.";
        } else {
          const hasCard = nextState.inventory.includes("VIP Afterlife Keycard");
          const int = nextState.attributes?.int || 10;
          const netSlicer = nextState.skills?.netSlicer || 1;
          const bonus = hasCard ? 5 : 0;
          const roll = Math.floor(Math.random() * 20) + 1 + int + (netSlicer * 2) + bonus;

          if (roll >= 17) {
            nextState.completedPOIActions.push("nouveau_chrome:shields_hacked");
            nextState.experience += 40;
            narrative = `💾 PRESSURE SHIELDS DEACTIVATED (Roll: ${roll} vs 17): You bypassed their high-grade terminal governor! The electromagnetic shields slide down. The Prototype Singularity Battery is exposed!`;
            setActivePopup({
              title: "💾 BYPASS COMPLETED",
              subtitle: "EM SHIELDS OFFLINE",
              type: "check_success",
              text: `With exquisite mathematical execution (Roll: ${roll} vs 17), you overloaded their pressure grid.\n\nThe blue lasers flicker out of existence. The glass containment pod slides into the deck, exposing the core prize!`
            });
          } else {
            nextState.hp = Math.max(10, nextState.hp - 20);
            narrative = `🚨 SECURITY LASER OVERRIDE (Roll: ${roll} vs 17): A thermal defense laser fires directly into your arm plate! Dealt -20 HP damage.`;
          }
        }
      }
      else if (cleanAction.includes("loot prototype singularity battery")) {
        if (!nextState.completedPOIActions.includes("nouveau_chrome:shields_hacked")) {
          narrative = "❌ FORCE SHIELDS ONLINE: An indigo kinetic field blocks your hand. Deactivate the pressure shields or keycard access first!";
        } else if (nextState.inventory.includes("Prototype Singularity Battery") || nextState.completedQuests.some(q => q.includes("Nouveau Heist"))) {
          narrative = "⚠️ INVENTORY RECORDED: You already secured the Prototype Singularity Battery.";
        } else {
          nextState.inventory.push("Prototype Singularity Battery");
          narrative = "🎒 PRIZE SECURED: You snatched the heavy, pulsing 'Prototype Singularity Battery' from the pedestal! Take this back to Cipher at Club Afterlife VIP Lounge to complete the quest!";
          setActivePopup({
            title: "💎 PROTOTYPE SECURED",
            subtitle: "NOUVEAU HEIST PRIZE IN STASH",
            type: "loot",
            text: "You lift the pulsing, multi-core cybernetic battery cell. Its core containment fluid burns with cold neon-white light.\n\nDeliver this back to Cipher at Club Afterlife VIP Deck to claim your major credits payout!"
          });
        }
      }

      // Heist delivery
      else if (cleanAction.includes("bring the prototype singularity battery") || (cleanAction.includes("deliver") && cleanAction.includes("battery") && nextState.poi === "Club Afterlife VIP Lounge")) {
        if (nextState.inventory.includes("Prototype Singularity Battery")) {
          nextState.inventory = nextState.inventory.filter(i => i !== "Prototype Singularity Battery");
          nextState.credits += 350;
          nextState.experience += 150;
          if (!nextState.inventory.includes("Unstable Plasma Core")) {
            nextState.inventory.push("Unstable Plasma Core");
          }
          nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Heist"));
          nextState.completedQuests.push("Side Quest: Nouveau Heist (Completed)");
          narrative = "💰 HEIST COMPLETED: Delivered the singularity battery to Cipher! Rewarded +350¤, +150 XP, and a rare 'Unstable Plasma Core'!";
          setActivePopup({
            title: "💰 HEIST INVOICED",
            subtitle: "NOUVEAU SHOWROOM BREACHED",
            type: "loot",
            text: "Cipher's face lights up as he takes the glowing white battery:\n\n'Incredible! You actually did it! This battery has enough cold-fusion power to fuel our entire network subnet node for a year.\n\nHere's your cut, plus a weapon component of extreme power.'\n\nReward: +350¤ Credits, +150 XP, and 'Unstable Plasma Core' added to inventory!"
          });
        }
      }

      // 6. Highwalk Homicide Site actions
      else if (cleanAction.includes("ambush security patrols") || cleanAction.includes("ambush security")) {
        const templates = ENEMIES.homicide_site;
        const roll = templates[Math.floor(Math.random() * templates.length)];

        nextState.combatState = {
          enemyName: roll.name,
          enemyHp: roll.hp,
          enemyMaxHp: roll.maxHp,
          enemyShields: roll.shields,
          enemyMaxShields: roll.maxShields,
          isActive: true,
          turnLog: "The security drone activates defense arrays, sweeping the skybridge with heavy smart-carbines!"
        };
        narrative = `💥 COMBAT INITIALIZED: Ambushed ${roll.name} on the skybridge sky-arch! Deploy shields!`;
        logType = "combat";
      }
      else if (cleanAction.includes("hack rebel courier's cyberdeck") || cleanAction.includes("hack rebel courier")) {
        const int = nextState.attributes?.int || 10;
        const netSlicer = nextState.skills?.netSlicer || 1;
        const roll = Math.floor(Math.random() * 20) + 1 + int + (netSlicer * 2);

        if (roll >= 15) {
          nextState.credits += 80;
          nextState.experience += 25;
          narrative = `💾 COURIER DECRYPTED (Roll: ${roll} vs 15): You bypassed the dead courier's biometric lock! Siphoned 80¤ and harvested useful matrix schematics (+25 XP).`;
        } else {
          nextState.mana = Math.max(0, nextState.mana - 20);
          narrative = `⚠️ CYBERDECK BURST ERROR (Roll: ${roll} vs 15): The courier deck's self-destruct thermite coil triggered, discharging a neural feedback spike (-20 Mana).`;
        }
      }
      else if (cleanAction.includes("search wreckage for cargo pass")) {
        if (Math.random() > 0.5) {
          nextState.credits += 50;
          narrative = "🔍 SEARCH DISCOVERY: You found a discarded Ares Cargo Ledger key containing +50¤!";
        } else {
          if (!nextState.inventory.includes("Shatter-Ridge Scrap Metal")) {
            nextState.inventory.push("Shatter-Ridge Scrap Metal");
          }
          narrative = "🔍 SEARCH SUCCESS: You salvaged 1x 'Shatter-Ridge Scrap Metal' from the shredded drone chassis!";
        }
      }

      else if (cleanAction.includes("harvest glowing slime pool")) {
        const count = nextState.inventory.filter(i => i === "Glowing Slime").length;
        if (count < 3) {
          nextState.inventory.push("Glowing Slime");
          const nextCount = count + 1;
          narrative = `🧪 SLIME HARVESTED: You successfully scraped a sample of 'Glowing Slime' from the hot sludge conduits. Gathered (${nextCount}/3) samples.`;
          setActivePopup({
            title: "🧪 SLIME SAMPLE SECURED",
            subtitle: "BIO-ACTIVE HARVEST",
            type: "loot",
            text: `You carefully extracted a glowing, reactive chemical slime sample into a sterile glass capsule.\n\nSamples secured: ${nextCount}/3\n\nReturn to Priestess Morgana at Satoshi Square Temple once you have 3 samples!`
          });
        } else {
          narrative = "🧪 HARVEST COMPLETED: You already carry the maximum 3x Glowing Slime samples needed for Priestess Morgana's request.";
        }
      }

      // Standard default exploration narrative
      else {
        const tickLogMsg = advanceTimeAndProgressJobs(nextState);
        narrative = `Refreshed tracking data channels at ${nextState.poi}. Atmospheric pollution levels high. Static wind currents. Net connection offline.${tickLogMsg}`;
      }
    }

    setGameState(nextState);
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: timeString,
        text: narrative,
        type: logType,
        district: nextState.district,
        poi: nextState.poi
      }
    ]);
    setCustomInput("");
    setIsLoading(false);
  };

  // Switch companion to manual task allocations
  const handleAssignCompanionTask = (companionName: string, task: string) => {
    if (!gameState) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextState = { ...gameState };
    const comp = nextState.companions.find(c => c.name === companionName);
    
    if (comp) {
      comp.status = "working";
      nextState.party = nextState.party.filter(name => name !== companionName);
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `⚙️ PERSONNEL ALLOCATED: Placed ${companionName} on node task: "${task}". They are now collecting +35¤ on every restful night cycle.`,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      triggerToast(`${companionName} allocated to server job`);
    }
    setSelectedCompanion(null);
  };

  // Bring working mercenary back into companion group
  const handleRecallCompanion = (companionName: string) => {
    if (!gameState) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let nextState = { ...gameState };
    const comp = nextState.companions.find(c => c.name === companionName);
    
    if (comp && comp.status === "working") {
      comp.status = "in_party";
      nextState.party.push(companionName);
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: timeString,
          text: `⚙️ PERSONNEL RECALLED: Operative ${companionName} recalled and deployed directly into your tactical squad.`,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      triggerToast(`${companionName} returned to active party`);
    }
  };

  // Buy item button helper
  const handleBuyItemDirectly = (item: { name: string; cost: number }) => {
    if (!gameState) return;
    if (gameState.credits >= item.cost) {
      let nextState = { ...gameState };
      nextState.credits -= item.cost;
      nextState.inventory.push(item.name);
      
      setGameState(nextState);
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🛒 CONVEYOR DISPATCHED: Transferred ${item.cost}¤. Stored upgraded equipment [${item.name}] into inventory stash slot.`,
          type: "system",
          district: nextState.district,
          poi: nextState.poi
        }
      ]);
      triggerToast(`PURCHASED ${item.name} SUCCESS`);
    } else {
      triggerToast("TRANSACTION REFUSED: INSUFFICIENT CREDITS");
    }
  };

  // Get dynamic merchant stock based on active POI
  const getShopItemsForPOI = (poiId: string) => {
    if (poiId === "marv_clinic") {
      return [
        { name: "Nano Med-Stim (Heal)", cost: 25, slot: "Consumable", desc: "Fully restores 60 HP instantly. Dr. Marv's discounted rate!" },
        { name: "Ether Mana-Cell (Mana)", cost: 30, slot: "Consumable", desc: "Fully restores 50 ETHER instantly." },
        { name: "Smart-Targeting Visor", cost: 70, slot: "Cyberware", desc: "Adds telemetry targeters (+15 damage to range/hacks)." },
        { name: "Synthetic Muscle Splice", cost: 100, slot: "Cyberware", desc: "Increases strength and reflex speeds (+10 Max HP)." }
      ];
    }
    if (poiId === "nouveau_chrome") {
      return [
        { name: "Apex Mantis electro-blade", cost: 110, slot: "Weapons", desc: "Surgical lightning weapon that cuts armor plates (+25 physical damage)." },
        { name: "Exo-Plated Mesh Armor", cost: 130, slot: "Armor", desc: "Nanotube composite armor with 25% physical absorption." },
        { name: "Unstable Plasma Core", cost: 200, slot: "Material", desc: "High-yield energy module required for highwalk plasma hacks." },
        { name: "Chrono-Shift Augment", cost: 250, slot: "Cyberware", desc: "High-end corporate reflex booster (+15 Max HP, +30 ETHER, +2 DEX)." }
      ];
    }
    return SHOP_ITEMS;
  };

  // Sell scrap helper
  const handleRecycleScrapDirect = () => {
    handleExecuteAction("Sell circuitry scrap for credits.");
  };

  const derived = getDerivedStats();

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans flex flex-col antialiased relative selection:bg-rose-500 selection:text-white p-0 m-0 overflow-x-hidden">
      
      {/* Background Ambient Glowing Orbs - Frosted Glass Aesthetics */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-[550px] h-[550px] rounded-full bg-rose-500/10 blur-[150px] animate-pulse-slow" />
        <div className="absolute top-[50%] left-[60%] w-[350px] h-[350px] rounded-full bg-violet-600/5 blur-[120px] animate-pulse-slow" />
        
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-x-0 top-0 h-full opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* HEADER BAR */}
      <div className="z-10 bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4 px-6 md:px-8 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1">
              <Sparkles size={11} /> CORE OFFLINE SANDBOX ENGINE
            </span>
            <h1 className="font-display font-extrabold tracking-wider text-xl text-white uppercase leading-none mt-0.5">
              NEON <span className="text-rose-500 tracking-tight font-light">&amp;</span> ETHER
            </h1>
          </div>
        </div>

        {/* Global Notifications and Save Operations */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {gameState && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipIntro}
                className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-all font-mono text-4xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-pulse"
              >
                ⚡ Skip Intro (Base Crew)
              </button>
              <button
                onClick={handleSaveGame}
                className="bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all font-mono text-4xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              >
                <Save size={12} /> Save Matrix
              </button>
              <button
                onClick={handleRestartFull}
                className="bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 transition-all font-mono text-4xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider cursor-pointer"
              >
                Reset Module
              </button>
            </div>
          )}
          <span className="h-5 w-px bg-white/10 hidden sm:inline" />
          <div className="bg-slate-900/60 border border-white/5 text-slate-300 px-3 py-1.5 rounded-md flex items-center gap-2 text-[11px]">
            <Activity size={13} className="text-cyan-400 animate-pulse" />
            <span>GRID DECK:</span>
            <span className="text-cyan-400 font-bold block">STANDALONE</span>
          </div>
        </div>
      </div>

      {/* SAVE TOAST POPUP */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-md border border-cyan-500/30 bg-slate-950/90 text-cyan-400 font-mono text-xs flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 z-10 transition-all justify-center">

        <AnimatePresence mode="wait">
          
          {/* ==============================================
              SCREEN 1: GAMEPLAY MAIN MENU
             ============================================== */}
          {currentScreen === "menu" && (
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
                  onClick={() => setCurrentScreen("character_select")}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold uppercase py-3 rounded-md transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <Plus size={15} /> Deploy New Agent
                </button>

                <button
                  onClick={handleLoadGame}
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
                    onClick={handleRestartFull}
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
          )}

          {/* ==============================================
              SCREEN 2: ARCHETYPE PORTRAIT SELECTOR
             ============================================== */}
          {currentScreen === "character_select" && (
            <motion.div
              key="character-select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto w-full glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative p-6 md:p-8 flex flex-col gap-6"
            >
              {/* Back button to main menu */}
              <button
                onClick={() => {
                  setCurrentScreen("menu");
                }}
                className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-mono border border-white/5 px-2 py-1 rounded bg-slate-900/60 transition-all cursor-pointer z-10"
              >
                <ArrowLeft size={13} /> Back to Terminal
              </button>

              {/* Title Header */}
              <div className="text-center pt-4 pb-2 border-b border-white/5">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold block mb-1">
                  [ COGNITIVE UPLINK REGISTRATION ]
                </span>
                <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-wider leading-none">
                  OPERATIVE SPECIFICATION SHEET
                </h2>
                <p className="text-3xs text-slate-500 font-mono mt-1.5 uppercase">
                  INITIALIZE BIOMETRICS, SYSTEM HARDWARE PROTOCOLS, AND SECURE MEMORY SYNAPSES
                </p>
              </div>

              {/* Real-time calculated statistics for preview */}
              {(() => {
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
                } else if (customRace === "Neuro-Elf") {
                  selectedRaceMods.int += 2;
                  selectedRaceMods.will += 2;
                  selectedRaceMods.str -= 1;
                } else if (customRace === "Chrome-Dwarf") {
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
                if (selectedPerks.includes("Hardened Chassis")) previewHp += 20;

                let previewCredits = selectedArchetype.credits;
                if (customBackground === "Street Rat") previewCredits += 20;
                if (customBackground === "Ex-Corp Agent") previewCredits += 50;
                if (customBackground === "Glitched Specimen") previewCredits -= 30;
                if (selectedPerks.includes("Lucky Jack")) previewCredits += 40;

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
                  { name: "Neuro-Elf", bonus: "+2 Int, +2 Will, -1 Str", desc: "Ether-sensitive neuron networks." },
                  { name: "Chrome-Dwarf", bonus: "+2 Will, +2 Str, -1 Dex", desc: "Reinforced titanium skeletal plates." }
                ];

                const backgroundOptions = [
                  { name: "Street Rat", bonus: "+20 Credits, +1 Dex", desc: "Scavenging courier inside level 1 slums." },
                  { name: "Ex-Corp Agent", bonus: "+50 Credits, -10 HP, +1 Int", desc: "Former security analyst fleeing Biotech Tower." },
                  { name: "Glitched Specimen", bonus: "+20 Max HP, -30 Credits", desc: "Illicit mind-bender subject breakouts." },
                  { name: "Grid Drifter", bonus: "+1 Str, +1 Will", desc: "Hardened wanderer mapping outer deserts." }
                ];

                const perkOptions = [
                  { id: "adrenaline_junkie", name: "Adrenaline Junkie", desc: "+15% Melee damage at low health (<40% HP)" },
                  { id: "cyber_optimizer", name: "Cyber-Optimizer", desc: "+10 starting combat shielding permanently" },
                  { id: "ether_conduit", name: "Ether Conduit", desc: "Regenerate +2 Ether MP at start of every combat turn" },
                  { id: "hardened_chassis", name: "Hardened Chassis", desc: "+20 Max HP permanent core integrity boost" },
                  { id: "lucky_jack", name: "Lucky Jack", desc: "+40 starting Credits bonus from hacked accounts" }
                ];

                const skillTrees: Record<string, { name: string; cost: string; desc: string; icon: string }[]> = {
                  "Cyber-Blade": [
                    { name: "Viper Strike (Tier 1)", cost: "10 MP", desc: "Melee blow dealing +150% physical damage with a chemical armor-dissolving corrosion debuff.", icon: "⚔️" },
                    { name: "Adrenaline Surge (Tier 2)", cost: "15 MP", desc: "Inject fast combat-stimulants, granting +2 AP and +15% Critical Hit Chance for 2 turns.", icon: "⚡" },
                    { name: "Phantom Dash (Tier 3)", cost: "20 MP", desc: "Bypass defensive fields to blink behind a target, performing a guaranteed 300% backstab crit.", icon: "👤" }
                  ],
                  "Techno-Mage": [
                    { name: "Ether Spark (Tier 1)", cost: "8 MP", desc: "Bends ambient ley structures to fire a direct energy bolt, dealing 18 Ether damage.", icon: "🔮" },
                    { name: "Net Shield (Tier 2)", cost: "12 MP", desc: "Materialize an active firewall barrier over your neural interface, granting +15 Shields.", icon: "🛡️" },
                    { name: "Feedback Burn (Tier 3)", cost: "22 MP", desc: "Overload target cerebral deck terminals, causing a spell explosion for 35 damage and 1 turn Silence.", icon: "💥" }
                  ],
                  "Outlaw Hacker": [
                    { name: "ICE Disruption (Tier 1)", cost: "10 MP", desc: "Inject corrupted software into enemy combat sub-routines, lowering accuracy by 30%.", icon: "💻" },
                    { name: "Targeting Link (Tier 2)", cost: "12 MP", desc: "Paint the target with an orbital micro-laser, boosting all ranged damage they take by +25%.", icon: "🎯" },
                    { name: "Systems Overload (Tier 3)", cost: "25 MP", desc: "Trigger remote battery/munition discharges, inflicting 28 range damage and stun.", icon: "🔋" }
                  ],
                  "Mindmancer": [
                    { name: "Mind Hack (Tier 1)", cost: "15 MP", desc: "Direct synaptic rewrite, hacking target motor functions and forcing them to attack allies.", icon: "👁️" },
                    { name: "Neural Overload (Tier 2)", cost: "20 MP", desc: "Psychic cortex shock inflicting 25 damage, completely ignoring physical armor layers.", icon: "🧠" },
                    { name: "Synaptic Cascade (Tier 3)", cost: "30 MP", desc: "Meltdown blast on all nearby targets dealing 40 psychic damage, locking brains in vegetative sleep.", icon: "🌀" }
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

                const handleTogglePerk = (perkId: string) => {
                  if (selectedPerks.includes(perkId)) {
                    setSelectedPerks(prev => prev.filter(p => p !== perkId));
                  } else {
                    if (selectedPerks.length >= 2) {
                      triggerToast("MAXIMUM OF 2 PERKS CAN BE CONFIGURED");
                    } else {
                      setSelectedPerks(prev => [...prev, perkId]);
                    }
                  }
                };

                const randomizeName = () => {
                  const names = ["Kaelen_X", "Valerie_Dex", "Cipher_09", "Vance_Street", "Zero_Net", "Specter_V", "Rogue_Prime", "Echo_Chrome", "Rift_Blade", "Viper_T"];
                  const selected = names[Math.floor(Math.random() * names.length)];
                  setCustomName(selected);
                };

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* COLUMN 1: IDENTITY & ORIGIN (col-span-4) */}
                    <div className="lg:col-span-4 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col gap-5 font-mono text-left">
                      <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                        👤 IDENTITY COGNITION
                      </span>
                      
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 uppercase font-bold block">OPERATIVE CODENAME</label>
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
                            className="bg-slate-900 border border-cyan-500/20 text-cyan-400 text-sm px-3 py-2 rounded hover:bg-cyan-950/40 cursor-pointer flex items-center justify-center"
                          >
                            🎲
                          </button>
                        </div>
                      </div>

                      {/* Age selection */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold">
                          <span>COGNITIVE CYCLE AGE</span>
                          <span className="text-cyan-400 font-extrabold text-sm">{customAge} YEARS</span>
                        </div>
                        <input
                          type="range"
                          min="18"
                          max="70"
                          value={customAge}
                          onChange={(e) => setCustomAge(parseInt(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>

                      {/* Race dropdown list */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 uppercase font-bold block">GENETIC SPECIES SPEC</label>
                        <div className="grid grid-cols-1 gap-1.5 max-h-[165px] overflow-y-auto pr-1">
                          {raceOptions.map((r) => (
                            <button
                              key={r.name}
                              onClick={() => setCustomRace(r.name)}
                              className={`text-left p-2 rounded border text-xs leading-normal transition-all flex justify-between items-center cursor-pointer ${
                                customRace === r.name
                                  ? "bg-cyan-950/50 border-cyan-400 text-white"
                                  : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:bg-slate-900"
                              }`}
                            >
                              <div className="max-w-[70%]">
                                <p className="font-extrabold text-xs uppercase tracking-wide text-slate-200">{r.name}</p>
                                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{r.desc}</p>
                              </div>
                              <span className="text-[10px] font-black text-rose-400 bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 shrink-0">{r.bonus}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Portrait thumbnail selection list - NOW LARGER */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 uppercase font-bold block">UPLINK PORTRAIT CHROME</label>
                        <div className="flex justify-between items-center gap-3 bg-slate-900/85 p-3 rounded-lg border border-white/10">
                          <img
                            src={customAvatarUrl}
                            alt="Selected custom portrait"
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded-lg border-2 border-cyan-400 grayscale-0 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex-shrink-0"
                          />
                          <div className="grid grid-cols-5 gap-1.5 flex-1">
                            {portraitChoices.map((p, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCustomAvatarUrl(p.url)}
                                className={`w-11 h-11 rounded-lg overflow-hidden border transition-all cursor-pointer relative ${
                                  customAvatarUrl === p.url ? "border-cyan-400 ring-2 ring-cyan-400/40 grayscale-0 opacity-100" : "border-white/5 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                                }`}
                              >
                                <img src={p.url} alt="option" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Background selection list */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 uppercase font-bold block">OPERATIVE CHRONOLOGY BACKGROUND</label>
                        <div className="grid grid-cols-1 gap-1.5 max-h-[165px] overflow-y-auto pr-1">
                          {backgroundOptions.map((bg) => (
                            <button
                              key={bg.name}
                              onClick={() => setCustomBackground(bg.name)}
                              className={`text-left p-2 rounded border text-xs leading-normal transition-all flex justify-between items-center cursor-pointer ${
                                customBackground === bg.name
                                  ? "bg-cyan-950/50 border-cyan-400 text-white"
                                  : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:bg-slate-900"
                              }`}
                            >
                              <div className="max-w-[70%]">
                                <p className="font-extrabold text-xs uppercase tracking-wide text-slate-200">{bg.name}</p>
                                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{bg.desc}</p>
                              </div>
                              <span className="text-[10px] font-black text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 shrink-0">{bg.bonus}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 2: ARCHETYPE, STAT ALLOCATION & PERKS (col-span-4) */}
                    <div className="lg:col-span-4 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col gap-5 font-mono text-left">
                      <span className="text-xs uppercase tracking-wider text-rose-500 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                        🧬 CLASS &amp; COMBAT STATISTICS
                      </span>

                      {/* Class Selection buttons */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 uppercase font-bold block">SELECT COGNITIVE ARCHETYPE CLASS</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ARCHETYPES.map((arch) => (
                            <button
                              key={arch.name}
                              onClick={() => {
                                setSelectedArchetype(arch);
                                setPreviewSkillTreeClass(arch.name);
                              }}
                              className={`py-3 px-1.5 rounded-lg text-center border font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                selectedArchetype.name === arch.name
                                  ? "bg-gradient-to-b from-cyan-950/50 to-slate-900 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                                  : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:bg-slate-900"
                              }`}
                            >
                              <span className="text-xs uppercase font-black truncate max-w-full block">{arch.name.replace("Cyber-", "").replace("Techno-", "").replace("Outlaw ", "")}</span>
                              <span className="text-[9px] text-rose-400 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 font-black uppercase tracking-wider">
                                {arch.name === "Cyber-Blade" ? "Blade" : arch.name === "Techno-Mage" ? "Spell" : "Hacks"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stat allocation +/- */}
                      <div className="bg-slate-900/85 border border-white/10 p-3.5 rounded-lg flex flex-col gap-2.5 relative">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                          <span className="text-xs uppercase font-black text-slate-300">ATTRIBUTE MATRICES</span>
                          <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-black animate-pulse">
                            {statPointsPool} POINTS POOL
                          </span>
                        </div>

                        <div className="space-y-2 mt-1">
                          {[
                            { key: "str", name: "STR (STRENGTH)", desc: "Physical armor, physical damage scaling." },
                            { key: "dex", name: "DEX (DEXTERITY)", desc: "Reflex speed, blade skills & dodge rate." },
                            { key: "int", name: "INT (INTELLIGENCE)", desc: "Cyberware compatibility, deck bypass speed." },
                            { key: "will", name: "WILL (WILLPOWER)", desc: "Cognitive ether defenses, spell shielding." },
                            { key: "eth", name: "ETH (ETHER COGNITION)", desc: "Raw mental energy pools, spell potency." }
                          ].map((s) => {
                            const currentVal = s.key === "str" ? previewStr : s.key === "dex" ? previewDex : s.key === "int" ? previewInt : s.key === "will" ? previewWill : previewEth;
                            const addedCount = addedStats[s.key as "str" | "dex" | "int" | "will" | "eth"];
                            
                            return (
                              <div key={s.key} className="flex justify-between items-center text-xs p-2 bg-slate-950/50 rounded-lg border border-white/5 leading-normal">
                                <div className="text-left max-w-[65%]">
                                  <p className="font-extrabold text-xs text-slate-200">{s.name}</p>
                                  <p className="text-[10px] text-slate-400 leading-tight font-sans mt-0.5">{s.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Minus button */}
                                  <button
                                    onClick={() => handleStatChange(s.key as any, -1)}
                                    disabled={addedCount === 0}
                                    className={`w-6 h-6 rounded-md text-center font-black text-sm transition-all border flex items-center justify-center cursor-pointer ${
                                      addedCount > 0
                                        ? "bg-slate-900 border-white/10 text-rose-400 hover:bg-slate-800"
                                        : "bg-slate-950 border-white/5 text-slate-700 cursor-not-allowed"
                                    }`}
                                  >
                                    -
                                  </button>
                                  <span className="text-sm text-white font-extrabold w-6 text-center">
                                    {currentVal}
                                  </span>
                                  {/* Plus button */}
                                  <button
                                    onClick={() => handleStatChange(s.key as any, 1)}
                                    disabled={statPointsPool === 0}
                                    className={`w-6 h-6 rounded-md text-center font-black text-sm transition-all border flex items-center justify-center cursor-pointer ${
                                      statPointsPool > 0
                                        ? "bg-cyan-950 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900"
                                        : "bg-slate-950 border-white/5 text-slate-700 cursor-not-allowed"
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Perks Selection List */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold">
                          <span>UPLINK SKILL PERKS SETUP</span>
                          <span className="text-cyan-400 font-extrabold">{selectedPerks.length} / 2 CONFIGURED</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {perkOptions.map((perk) => {
                            const isInstalled = selectedPerks.includes(perk.id);
                            return (
                              <button
                                key={perk.id}
                                onClick={() => handleTogglePerk(perk.id)}
                                className={`text-left p-2 rounded border text-xs leading-normal transition-all flex justify-between items-center cursor-pointer ${
                                  isInstalled
                                    ? "bg-cyan-950/50 border-cyan-400 text-white font-semibold"
                                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:bg-slate-900"
                                }`}
                              >
                                <div className="max-w-[75%]">
                                  <p className="font-extrabold text-xs uppercase tracking-wide text-slate-200">{perk.name}</p>
                                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">{perk.desc}</p>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${isInstalled ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-950 text-slate-600 border-white/5"}`}>
                                  {isInstalled ? "Active" : "Unlock"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 3: CLASS SKILL TREE PREVIEW & DEPLOYMENT (col-span-4) */}
                    <div className="lg:col-span-4 bg-slate-950/70 border border-white/10 p-5 rounded-xl flex flex-col justify-between gap-5 font-mono text-left">
                      
                      {/* Skill tree tabs - MINDMANCER TAB HIDDEN AS SPOILER PREVENTER */}
                      <div className="flex flex-col gap-3 flex-1">
                        <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                          📶 ACTIVE SKILL TREE PREVIEWS
                        </span>

                        {/* Skill tree tabs selectors - ONLY show 3 core start classes */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {["Cyber-Blade", "Techno-Mage", "Outlaw Hacker"].map((clName) => (
                            <button
                              key={clName}
                              onClick={() => setPreviewSkillTreeClass(clName)}
                              className={`py-2 px-1 rounded-md text-center border font-extrabold transition-all cursor-pointer text-xs uppercase ${
                                previewSkillTreeClass === clName
                                  ? "bg-cyan-950/50 border-cyan-500/50 text-cyan-400"
                                  : "bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60"
                              }`}
                            >
                              {clName === "Cyber-Blade" ? "Blade" : clName === "Techno-Mage" ? "Mage" : "Hacker"}
                            </button>
                          ))}
                        </div>

                        {/* Abilities corresponding to the previewSkillTreeClass tab */}
                        <div className="bg-slate-900/60 border border-white/10 p-3 rounded-lg flex-1 flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5 text-slate-400 uppercase font-black leading-none">
                            <span>Abilities &amp; Spells List</span>
                            <span>Class Level Unlocks</span>
                          </div>

                          <div className="flex flex-col gap-2 overflow-y-auto max-h-[190px] pr-1 mt-0.5">
                            {skillTrees[previewSkillTreeClass === "Mindmancer" ? "Cyber-Blade" : previewSkillTreeClass]?.map((sk, idx) => (
                              <div key={idx} className="bg-slate-950/60 border border-white/5 p-2 rounded-md text-xs leading-normal">
                                <div className="flex justify-between items-center font-extrabold text-xs text-slate-200">
                                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                                    <span>{sk.icon}</span> {sk.name}
                                  </span>
                                  <span className="text-cyan-400 text-[10px] bg-slate-900 border border-white/10 px-2 py-0.5 rounded-md font-bold shrink-0">{sk.cost}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-normal text-left font-sans">{sk.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Summary & Deploy button block */}
                      <div className="bg-slate-900/85 border border-white/10 p-4 rounded-lg flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1.5 text-xs font-extrabold text-slate-400">
                          <span>SUMMARY REGISTRY</span>
                          <span className="text-cyan-400 text-3xs font-black tracking-widest">STATUS.CONFIRMED</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 text-center text-xs leading-tight">
                          <div className="bg-slate-950/50 border border-white/5 p-1.5 rounded-md">
                            <span className="text-[9px] text-slate-500 block font-bold uppercase mb-0.5">HEALTH</span>
                            <span className="text-white font-extrabold text-xs">{previewHp} HP</span>
                          </div>
                          <div className="bg-slate-950/50 border border-white/5 p-1.5 rounded-md">
                            <span className="text-[9px] text-slate-500 block font-bold uppercase mb-0.5">ETHER</span>
                            <span className="text-cyan-400 font-extrabold text-xs">{selectedArchetype.maxMana} MP</span>
                          </div>
                          <div className="bg-slate-950/50 border border-white/5 p-1.5 rounded-md">
                            <span className="text-[9px] text-slate-500 block font-bold uppercase mb-0.5">CREDITS</span>
                            <span className="text-amber-400 font-extrabold text-xs">{previewCredits}¤</span>
                          </div>
                        </div>

                        <button
                          onClick={handleDeployAgent}
                          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 text-center font-display font-extrabold rounded-lg py-2.5 text-xs tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.99] uppercase flex items-center justify-center gap-2"
                        >
                          <Play size={12} fill="currentColor" /> Deploy Operative
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* ==============================================
              SCREEN 2.5: INTRO STORY & CONTROLS GUIDE
             ============================================== */}
          {currentScreen === "intro_story" && gameState && (
            <motion.div
              key="intro-story"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-5xl mx-auto w-full glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative p-6 md:p-8 flex flex-col gap-6 box-glow-cyan text-left font-mono"
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
                        <span className="text-cyan-400 font-extrabold uppercase">{selectedArchetype.name.replace("Cyber-", "").replace("Techno-", "")}</span>
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
                        In <strong className="text-white">Megacity-9</strong>, meat is cheap and data is the ultimate currency. Beneath the towering chrome peaks of the Biotech conglomerates, the radioactive fog of Sector 4 acts as your sanctuary and your hunting ground.
                      </p>
                      <p>
                        Your contact, a broken corporate defector, sold you a keycard and a dream: the <strong className="text-cyan-400 font-semibold">Sector 9 Data Vault</strong>. Inside lies the <em className="text-white not-italic font-semibold">Sol-Prime Ley Core</em>—an infinite, self-sustaining energy matrix. If you crack the vault and extract the core, you buy your ticket out of these rusted alleys forever.
                      </p>
                      <p className="border-l-2 border-cyan-400 pl-3 bg-cyan-950/20 py-2 rounded-r font-mono text-[11px] text-cyan-300">
                        "Your gear is locked. Your neural buffers are clear. The vent shafts of Conduit-09 are open. There's no turning back."
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
                      onClick={() => {
                        setCurrentScreen("character_select");
                      }}
                      className="text-slate-400 hover:text-white font-mono text-xs border border-white/10 px-4 py-2.5 rounded bg-slate-900/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft size={13} /> Adjust Biometrics
                    </button>

                    <button
                      onClick={() => {
                        setCurrentScreen("game");
                        triggerToast("NEURAL INTERFACE LOCKED. WELCOME BACK, RUNNER.");
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-display font-black text-xs uppercase py-2.5 px-6 rounded-lg tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] flex items-center gap-2"
                    >
                      <Play size={12} fill="currentColor" /> Commence Infiltration Routine <ArrowRight size={13} />
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* ==============================================
              SCREEN 3: ACTIVE GAMEPLAY GRID
             ============================================== */}
          {currentScreen === "game" && gameState && (
            <motion.div
              key="active-game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 w-full animate-fadeIn relative"
            >
              <WeatherOverlay weather={gameState.weather || "clear"} />
              {/* TACTICAL HUD SWITCH - IMMERSIVE MINIMALIST CONTROL PANEL */}
              {!gameState.combatState?.isActive && (
                <div className="flex border border-white/10 rounded-xl overflow-hidden bg-slate-950/40 backdrop-blur-md p-1.5 font-mono text-xs w-full max-w-xl mx-auto shadow-lg z-10 relative">
                  <button
                    onClick={() => setGameTab("exploration")}
                    className={`flex-1 py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-extrabold tracking-wider ${
                      gameTab === "exploration"
                        ? "bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                        : "text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    <Compass size={13} className={gameTab === "exploration" ? "animate-spin-slow" : ""} />
                    Missions &amp; Map
                  </button>
                  <button
                    onClick={() => setGameTab("database")}
                    className={`flex-1 py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-extrabold tracking-wider ${
                      gameTab === "database"
                        ? "bg-gradient-to-r from-rose-950/60 to-rose-900/40 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                        : "text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    <Database size={13} />
                    Operative Database
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT COLUMN (12/12): MAIN CORE CONSOLE FEED, DETAILED SCENERY OR INTERACTION DECKS */}
              {gameTab === "exploration" && (
                <div className="lg:col-span-12 flex flex-col gap-6">

                {/* DOCK BAR STATUS GAUGES WITH HIGHEST VISUAL INTEGRITY */}
                {!gameState.combatState?.isActive && (
                  <div className="glass-panel rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
                    
                    {/* District / Coordinate Node info with travel status indicator */}
                    <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-br from-cyan-900/50 to-slate-900 border border-cyan-500/30 text-cyan-400 rounded-md">
                        <MapPin size={16} />
                      </div>
                      <div className="overflow-hidden font-mono text-left">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">COORDINATE</span>
                        <p className="text-[11px] font-bold text-white uppercase truncate mt-0.5">
                          {gameState.poi}
                        </p>
                        <span className="text-[9px] text-cyan-400 block uppercase truncate font-semibold">
                          {REGIONS.find(r => r.id === gameState.district)?.name || "Slums"}
                        </span>
                      </div>
                    </div>

                    {/* WEATHER CONDITIONS NODE */}
                    <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-500/30 text-amber-400 rounded-md">
                        <CloudLightning size={16} />
                      </div>
                      <div className="overflow-hidden font-mono text-left">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">ATMOSPHERE</span>
                        <p className="text-[11px] font-bold text-white uppercase truncate mt-0.5">
                          {gameState.weather === "clear" && "Clear Skies ☀️"}
                          {gameState.weather === "rain" && "Acid Rain 🌧️"}
                          {gameState.weather === "snow" && "Neon Frost ❄️"}
                          {gameState.weather === "storm" && "Electro Storm ⚡"}
                          {gameState.weather === "heat" && "Thermal wave 🥵"}
                          {gameState.weather === "smog" && "Toxic Smog 😷"}
                          {(!gameState.weather || gameState.weather === "clear") && "Optimal skies ☀️"}
                        </p>
                        <span className="text-[7.5px] text-amber-500 block uppercase truncate font-semibold">
                          {gameState.weather === "clear" && "Normal Stamina Rate"}
                          {gameState.weather === "rain" && "+2 Stamina Drain / Wet"}
                          {gameState.weather === "snow" && "+3 Stamina / -2 Ether"}
                          {gameState.weather === "storm" && "+5 Stamina / Static Risk"}
                          {gameState.weather === "heat" && "+5 Stamina / Damage Risk"}
                          {gameState.weather === "smog" && "+4 Stamina / HP & MP Drain"}
                          {(!gameState.weather || gameState.weather === "clear") && "No Active Debuffs"}
                        </span>
                      </div>
                    </div>

                    {/* HP GAUGE RACK */}
                    <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1">
                        <span className="font-bold text-rose-400 flex items-center gap-1 uppercase">
                          <Heart size={11} className="text-rose-500" /> Vital Core
                        </span>
                        <span className="font-bold text-[#f5ebd5]">{gameState.hp} / {derived.maxHp}</span>
                      </div>
                      
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          style={{ width: `${Math.max(0, Math.min(100, (gameState.hp / derived.maxHp) * 100))}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase font-bold text-left leading-none">
                        {gameState.hp < 35 ? "STATUS: CRITICAL EXHAUSTION" : "CORES: OPTIMAL PARAMETER"}
                      </span>
                    </div>

                    {/* MP GAUGE RACK */}
                    <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1">
                        <span className="font-bold text-cyan-400 flex items-center gap-1 uppercase">
                          <Zap size={11} className="text-cyan-400" /> Ether Stream
                        </span>
                        <span className="font-bold text-[#f5ebd5]">{gameState.mana} / {derived.maxMana}</span>
                      </div>
                      
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                          style={{ width: `${Math.max(0, Math.min(100, (gameState.mana / derived.maxMana) * 100))}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase font-bold text-left leading-none">
                        COGNITIVE CHIP CALIBRATED
                      </span>
                    </div>

                    {/* STAMINA/FATIGUE GAUGE RACK */}
                    <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none mb-1">
                        <span className="font-bold text-amber-500 flex items-center gap-1 uppercase">
                          <Activity size={11} className="text-amber-500 animate-pulse" /> Stamina Core
                        </span>
                        <span className="font-bold text-[#f5ebd5]">{gameState.stamina ?? 100} / 100</span>
                      </div>
                      
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                          style={{ width: `${Math.max(0, Math.min(100, (gameState.stamina ?? 100)))}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase font-bold text-left leading-none">
                        {gameState.stamina === 0 ? "⚠️ EXHAUSTED: REST" : "ACTUATORS: OPERATIONAL"}
                      </span>
                    </div>

                    {/* Credits & level widget details */}
                    <div className="bg-slate-950/60 border border-white/10 p-2.5 rounded-lg flex justify-between items-center">
                      <div className="text-left">
                        <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wider">BALANCE</span>
                        <p className="text-sm font-mono font-black text-amber-400 mt-0.5 leading-none">
                          {gameState.credits} <span className="text-[10px] font-normal text-slate-400">¤</span>
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">SKILLS NODE</span>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5 text-xs font-bold leading-none">
                          <span className="text-[#efe8d4]">LVL {gameState.level ?? 1}</span>
                          <span className="text-slate-500 text-[10px]">({gameState.experience ?? 0}/100)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* THE HIGHEST CRAFTED CENTRAL SCREEN MAP OR POI BLUEPRINT SCENE */}
                {!gameState.combatState?.isActive && (
                  <div className="glass-panel rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100 flex flex-col gap-4 box-glow-cyan">
                  
                  {/* Header Selector Switch for holographic routing */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Compass size={16} className="text-cyan-400" />
                      <span className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-100">
                        {activePOIView ? `DETAILED LOCAL SCANNER: ${gameState.poi}` : "HOLOGRAPHIC TRANSIT REGION INTERCEPT"}
                      </span>
                    </div>

                    {/* Regional Switch Panel on top of Holographic view */}
                    {!activePOIView && (
                      <div className="flex flex-wrap gap-1 font-mono text-3xs">
                        {REGIONS.map(r => {
                          const isPrologueRegion = ["conduit09", "shatter_ridge_core", "data_vault"].includes(r.id);
                          const currentIsPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                          const isDisabled = currentIsPrologue && !isPrologueRegion;
                          return (
                            <button
                              key={r.id}
                              onClick={() => {
                                if (isDisabled) {
                                  triggerToast("SYSTEM LOCKED: FINISH HEIST OBJECTIVE FIRST");
                                  return;
                                }
                                handleSwitchRegion(r.id);
                              }}
                              className={`px-2.5 py-1 rounded border transition-all cursor-pointer ${
                                activeRegionId === r.id
                                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                                  : isDisabled
                                    ? "bg-slate-950/20 text-slate-700 border-dashed border-white/5 cursor-not-allowed"
                                    : "bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-900/80 hover:text-white"
                              }`}
                            >
                              {isDisabled ? `🔒 ${r.name.split(" ")[0]}` : r.name.split(" ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    
                    {/* VIEW A: DETAILED GLOBAL REGION GRID */}
                    {!activePOIView ? (
                      <motion.div
                        key="global-map"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative bg-slate-950 border border-white/10 rounded-xl h-[280px] md:h-[320px] overflow-hidden shadow-inner flex flex-col items-center justify-center p-4 group"
                        id="holographic-tactical-map"
                      >
                        {/* Selected Region Background Map Imagery with Cyberpunk tint */}
                        <div className="absolute inset-0 z-0">
                          <img
                            src={REGIONS.find(r => r.id === activeRegionId)?.bgImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"}
                            alt="Cyberpunk Sector Grid"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-20 filter saturate-150 contrast-125 select-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-transparent to-slate-950" />
                          
                          {/* Radial glowing core map layout decoration */}
                          <div className="absolute inset-x-0 top-0 h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        </div>

                        {/* Scan status tag overlay */}
                        <div className="absolute top-3 left-3 bg-slate-900/90 border border-white/10 px-2.5 py-1 rounded text-3xs font-mono text-slate-400 shadow flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          <span>SECTOR SCAN: {REGIONS.find(r => r.id === activeRegionId)?.name.toUpperCase()} ACCESSIBLE</span>
                        </div>

                        {/* Interactive District Pins Map Grid */}
                        <div className="absolute inset-x-0 h-full w-full max-w-2xl mx-auto z-10">
                          {MAP_POIS.filter(poi => poi.district === activeRegionId).map((p) => {
                            const isCurrentlyHere = gameState.poi === p.name;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  if (gameState.stamina <= 0) {
                                    triggerToast("STAMINA EXHAUSTED: Transit locked. Rest at Aurus Safehouse to restore.");
                                    setLogs(prev => [
                                      ...prev,
                                      {
                                        id: crypto.randomUUID(),
                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        text: `❌ NAVIGATION ERROR: Cannot walk to "${p.name}". Neural fatigue locks locomotive motor core. REST required.`,
                                        type: "system",
                                        district: gameState.district,
                                        poi: gameState.poi
                                      }
                                    ]);
                                    return;
                                  }

                                  // Update game POI
                                  let nextState = { ...gameState };
                                  nextState.poi = p.name;
                                  nextState.district = p.district;
                                  
                                  const travelResult = handleStaminaAndWeatherOnTravel(nextState, false, p.name);
                                  nextState = travelResult.nextState;
                                  setGameState(nextState);

                                  // Enter local POI Detailed View automatically!
                                  setActivePOIView(p.id);
                                  
                                  // Print log
                                  setLogs(prev => [
                                    ...prev,
                                    {
                                      id: crypto.randomUUID(),
                                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                      text: `[TRANSIT COMMITTED]: Safe arrival coordinates established at "${p.name}". Initialized local area detail blueprint.`,
                                      type: "system",
                                      district: p.district,
                                      poi: p.name
                                    },
                                    ...travelResult.logs
                                  ]);

                                  if (travelResult.warningText) {
                                    triggerToast(travelResult.warningText);
                                  }
                                }}
                                className="absolute transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1 rounded-lg group/pin"
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                              >
                                {/* Blinker Node */}
                                <div className="relative flex items-center justify-center">
                                  <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-45 duration-1000 ${isCurrentlyHere ? "bg-cyan-400" : "bg-rose-500"}`} />
                                  <div
                                    className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 shadow-lg transition-all transform group-hover/pin:scale-135 ${
                                      isCurrentlyHere
                                        ? "bg-cyan-400 border-white shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                                        : p.type === "combat"
                                          ? "bg-rose-500 border-rose-950 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                                          : p.type === "shop"
                                            ? "bg-amber-400 border-amber-950"
                                            : "bg-slate-300 border-slate-900"
                                    }`}
                                  />
                                  
                                  {/* Holographic Tooltip above pin on hover */}
                                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950/95 border border-white/20 whitespace-nowrap px-2.5 py-1.5 rounded-md shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-all pointer-events-none scale-90 group-hover/pin:scale-100 z-50 text-left font-mono">
                                    <p className="text-2xs font-extrabold text-white flex items-center gap-1">
                                      <span className={`w-1 h-1 rounded-full ${isCurrentlyHere ? "bg-cyan-400" : "bg-slate-400"}`} />
                                      {p.name.toUpperCase()}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">{p.type} node</p>
                                    {isCurrentlyHere && <p className="text-[8.5px] text-cyan-400 mt-0.5">✓ CURRENT COORDINATE</p>}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Fallback notification */}
                        <div className="absolute bottom-3 text-center text-4xs font-mono text-slate-500 uppercase tracking-widest pointer-events-none select-none z-10">
                          HOLOGRAPHIC SCAN RATIO 1.15.SCALE SECURE
                        </div>
                      </motion.div>
                    ) : (
                      
                      // VIEW B: IMAGES OF THE DETALED POI MAP SCANNER (THE LOCAL CLOSE-UP BLUEPRINT SCREEN!)
                      <motion.div
                        key="detailed-poi-view"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-7 bg-slate-950/95 border border-cyan-500/30 rounded-2xl p-6 md:p-8 min-h-[420px] lg:min-h-[460px] shadow-[0_0_35px_rgba(6,182,212,0.05),inset_0_0_40px_rgba(34,211,238,0.05)]"
                      >
                        {/* Left half: POI scenery illustration frame */}
                        <div className="lg:col-span-5 flex flex-col justify-between relative rounded-xl overflow-hidden border border-white/10 group min-h-[220px] lg:min-h-[360px]">
                          {/* Main Close-up Illustrated Photo of local environment */}
                          <img
                            src={MAP_POIS.find(p => p.id === activePOIView)?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"}
                            alt={gameState.poi}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover select-none filter brightness-90 saturate-125 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/80 z-10" />

                          {/* Scanner visual laser lines overlay */}
                          <div className="absolute inset-x-0 h-0.5 bg-cyan-400/30 blur-[2px] shadow-[0_0_10px_rgba(34,211,238,0.5)] top-[10%] animate-pulse z-10" />
                          <div className="absolute inset-x-0 top-0 h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] z-10" />

                          {/* Top Tag info inside image */}
                          <div className="p-3.5 z-10 flex justify-between items-center bg-slate-950/80 backdrop-blur-sm border-b border-white/5 uppercase font-mono text-[9px] text-slate-400">
                            <span>GRID LOCALITY FILE</span>
                            <span className="text-cyan-400 font-bold">STATUS: VISITED</span>
                          </div>

                          {/* Lower scene metadata over image overlay */}
                          <div className="p-4.5 z-10 font-mono">
                            <span className="text-cyan-400 text-3xs tracking-wider uppercase font-extrabold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              NODE AREA SCAN COMPLETE
                            </span>
                            <p className="text-sm font-black font-display text-white mt-1 uppercase tracking-wide">
                              {MAP_POIS.find(p => p.id === activePOIView)?.name.replace("Main Headquarters ", "")}
                            </p>
                          </div>
                        </div>

                        {/* Right half: Detailed text and local operational interaction terminal */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                          <div className="space-y-3">
                            <h4 className="text-3xs font-mono uppercase tracking-[0.15em] text-cyan-400 font-black">
                              LOCAL DESCRIPTOR CONSOLE
                            </h4>
                            <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-left font-medium">
                              {getPOIDescription(activePOIView)}
                            </p>
                          </div>

                          {/* Dynamic NPC Dialog or Scene Buttons depending on dialogue engagement */}
                          <div className="border-t border-white/5 pt-4">
                            {squadDialogue ? (
                              (() => {
                                const node = SQUAD_DIALOGUES[squadDialogue.sceneId]?.[squadDialogue.nodeId];
                                if (!node) return null;
                                return (
                                  <div className="bg-slate-950/95 border border-cyan-500/50 rounded-xl p-5 relative flex flex-col gap-4 font-mono shadow-2xl box-glow text-left">
                                    <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                      <span className="text-cyan-400 font-extrabold text-[12px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                        <Compass size={14} className="text-cyan-500" /> SQUAD TRANSMISSION CONDUIT
                                      </span>
                                      <span className="text-3xs text-cyan-500 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                                        {squadDialogue.sceneId} interaction
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start text-left">
                                      <div className="relative flex-shrink-0">
                                        <img
                                          src={node.portrait}
                                          alt={node.speakerName}
                                          referrerPolicy="no-referrer"
                                          className="w-16 h-16 object-cover rounded-xl border-2 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-950" />
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <div>
                                          <h4 className="text-sm font-extrabold text-cyan-300">{node.speakerName}</h4>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{node.speakerRole}</p>
                                        </div>
                                        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-white/5">
                                          "{node.text}"
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                      {node.choices.map((choice, cIdx) => (
                                        <button
                                          key={cIdx}
                                          onClick={() => {
                                            if (choice.effect && gameState) {
                                              let updated = choice.effect({ ...gameState });
                                              setGameState(updated);
                                            }
                                            if (choice.nodeId !== undefined) {
                                              if (choice.nodeId === null) {
                                                setSquadDialogue(null);
                                                if (gameState) {
                                                  let next = { ...gameState };
                                                  if (!next.completedPOIActions) next.completedPOIActions = [];
                                                  if (squadDialogue.sceneId === "banter") {
                                                    next.completedPOIActions.push("ventilation_shaft:talk_to_vice_tracker");
                                                    next.completedPOIActions.push("blast_door:banter");
                                                  } else if (squadDialogue.sceneId === "peptalk") {
                                                    next.completedPOIActions.push("shatter_ridge_security_post:peptalk");
                                                  } else if (squadDialogue.sceneId === "tactics") {
                                                    next.completedPOIActions.push("shatter_ridge_reactor_well:tactics");
                                                  }
                                                  setGameState(next);
                                                }
                                              } else {
                                                setSquadDialogue({
                                                  sceneId: squadDialogue.sceneId,
                                                  nodeId: choice.nodeId
                                                });
                                              }
                                            }
                                          }}
                                          className="text-left w-full px-4 py-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-400 text-cyan-100 font-mono text-xs transition-all flex items-center justify-between cursor-pointer group"
                                        >
                                          <span>&gt; {choice.text}</span>
                                          <span className="text-[10px] text-cyan-500/60 group-hover:text-cyan-300 font-bold">SELECT</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()
                            ) : activeDialogue ? (
                              activeDialogue === "relic_awakening" ? (
                                <div className="bg-slate-950/95 border border-purple-500/50 rounded-xl p-5 relative flex flex-col gap-4 font-mono shadow-2xl box-glow-pink">
                                  <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                                    <span className="text-purple-400 font-extrabold text-[12px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                      <Zap size={14} className="text-purple-500" /> NEURAL SYSTEM SHOCKWAVE
                                    </span>
                                    <span className="text-3xs text-purple-500 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 uppercase">MINDMANCER TRANSFORMATION</span>
                                  </div>
                                  
                                  <div className="flex flex-col md:flex-row gap-4 items-center md:items-start text-left">
                                    <div className="relative">
                                      <div className="w-16 h-16 rounded-full bg-purple-500/20 absolute inset-0 animate-ping" />
                                      <img
                                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200"
                                        alt="Relic portrait"
                                        referrerPolicy="no-referrer"
                                        className="w-16 h-16 object-cover rounded-xl border-2 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.5)] flex-shrink-0"
                                      />
                                    </div>
                                    <div className="text-[11px] space-y-2 text-slate-300 flex-1">
                                      <p className="text-purple-300 font-black uppercase text-xs">MINDMANCER UNLOCK SEQUENCE</p>
                                      <p className="text-slate-100 font-sans text-xs leading-relaxed">
                                        The moment your fingers brush against the warm, floating golden relic, a massive, brilliant pulse of purple light flashes!
                                        <br /><br />
                                        A psychic feedback shockwave rips into your neural pathways, rewriting your cortex cells. Your vision turns deep violet as the <span className="text-purple-400 font-bold">MINDMANCER powers awaken</span>!
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Vice dialog */}
                                    <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg flex gap-2.5">
                                      <span className="text-xl">🔫</span>
                                      <div className="text-[10px] text-left">
                                        <p className="font-bold text-rose-400 uppercase leading-none">Vice</p>
                                        <span className="text-4xs text-slate-500 block mt-0.5 uppercase">Companion</span>
                                        <p className="text-slate-300 font-sans text-3xs leading-normal italic mt-1">
                                          "Whoa, kid! Your eyes... they are glowing purple! Mind your levels, something is breaching the containment walls!"
                                        </p>
                                      </div>
                                    </div>

                                    {/* Tracker dialog */}
                                    <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg flex gap-2.5">
                                      <span className="text-xl">📟</span>
                                      <div className="text-[10px] text-left">
                                        <p className="font-bold text-amber-400 uppercase leading-none">Tracker</p>
                                        <span className="text-4xs text-slate-500 block mt-0.5 uppercase">Companion</span>
                                        <p className="text-slate-300 font-sans text-3xs leading-normal italic mt-1">
                                          "Multiple corporate signatures dropping in from the ventilation ducts! Ares Enforcers have found us! Settle your brain and draw your steel!"
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-slate-900/60 border border-red-500/20 p-2.5 rounded text-3xs text-slate-400 font-sans leading-relaxed text-left">
                                    ⚠️ <span className="text-red-400 font-bold">AMBUSH ALERT:</span> Ares Corporate Enforcers have blown the security barrier and are surrounding the altar with weapons drawn. Wield your new Mindmancer powers of <span className="text-purple-400 font-bold">Mind Hack</span> and <span className="text-purple-400 font-bold">Neural Overload</span> to defend your squad!
                                  </div>

                                  <div className="flex justify-center pt-1.5">
                                    <button
                                      onClick={() => {
                                        if (!gameState) return;
                                        let nextState = { ...gameState };
                                        
                                        // Debuff player: reduce max HP by 25, set mana to highly unstable
                                        nextState.maxHp = Math.max(50, nextState.maxHp - 25);
                                        nextState.hp = Math.min(nextState.hp, nextState.maxHp);
                                        
                                        // Mid-Battle Ability Unlock: Grant the player 2 absolute Mindmancer spells
                                        if (nextState.skills) {
                                          nextState.skills.mindmancer = 1; // Unlock Mindmancer spells
                                        }
                                        
                                        // Spawn Ambush Encounter: Ares Corporate Enforcers
                                        nextState.combatState = {
                                          enemyName: "Ares Corporate Enforcers (Ambush)",
                                          enemyHp: 160,
                                          enemyMaxHp: 160,
                                          enemyShields: 20,
                                          enemyMaxShields: 20,
                                          isActive: true,
                                          turnLog: "A heavy security breach blast door explodes! Ares Corporate Enforcers flood the sanctuary with automatic laser rifles! Tracker is struck by a lethal shot! Vice is heavily wounded!"
                                        };
                                        
                                        setActiveDialogue(null);
                                        setGameState(nextState);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: `💥 NEURAL AWAKENING & AMBUSH: Your neural structures are rewritten with raw psychic energy! Mindmancer spells unlocked: Mind Hack & Neural Overload.\n\nAres Biotech Enforcers have ambushed the sanctuary! Defend your squad!`,
                                            type: "combat",
                                            district: nextState.district,
                                            poi: nextState.poi
                                          }
                                        ]);
                                        triggerToast("COMBAT START: AWAKENING AMBUSH");
                                      }}
                                      className="bg-purple-600 hover:bg-purple-500 hover:scale-105 border border-purple-400 text-white font-mono font-black text-xs px-6 py-3.5 rounded-xl cursor-pointer transition-all uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                    >
                                      ⚡ [Brace for Impact] Fight Ares Enforcers
                                    </button>
                                  </div>
                                </div>
                              ) : activeDialogue === "post_combat_tracker" ? (
                                <div className="bg-slate-950/95 border border-red-500/30 rounded-xl p-4 relative flex flex-col gap-3 font-mono shadow-xl">
                                  <div className="flex justify-between items-center border-b border-red-500/20 pb-2">
                                    <span className="text-red-500 font-extrabold text-[11px] uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                      <AlertTriangle size={14} /> Interrogation & Discovery Scene
                                    </span>
                                    <span className="text-3xs text-slate-500">BLAST DOORS SECURED</span>
                                  </div>
                                  
                                  {/* Interrogation of Ares Security Officer */}
                                  <div className="bg-slate-900/50 border border-red-500/20 p-3 rounded-lg flex flex-col gap-2">
                                    <div className="flex gap-3 items-start">
                                      <img
                                        src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=200"
                                        alt="Ares Security Officer portrait"
                                        referrerPolicy="no-referrer"
                                        className="w-14 h-14 object-cover rounded-md border border-red-500/40 filter grayscale flex-shrink-0"
                                      />
                                      <div className="text-[10px] space-y-1 text-slate-300 flex-1">
                                        <p className="text-red-400 font-extrabold uppercase text-left">Ares Security Officer (Captured)</p>
                                        <p className="text-3xs text-slate-500 leading-none text-left">FACTION: Ares Biotech Corporate Security</p>
                                        <p className="text-slate-300 font-sans text-2xs italic leading-relaxed pt-1.5 text-left">
                                          "P-please! Don't shoot! I'm just a contractor! The secondary assault squads are sealing the upper ventilation shaft... but the heavy service tunnels under Level B4 are still completely clear! Here, I'll bypass the terminal lock... *clank*... look, the heavy magnetic blast doors are fully open now! Just let me live!"
                                        </p>
                                      </div>
                                    </div>
                                    <div className="border-t border-red-500/10 pt-2 text-3xs text-slate-400 text-left">
                                      <span className="text-cyan-400 font-bold">📢 PLAYER INTERROGATION:</span> "How many of your squad are left, and where is the safest route out of this complex?"
                                    </div>
                                  </div>

                                  {/* Tracker Betrayal Logs Discovery */}
                                  <div className="bg-cyan-950/25 border border-cyan-500/30 p-3 rounded-lg text-left">
                                    <p className="text-[10px] font-black text-cyan-400 uppercase leading-none mb-1 flex items-center gap-1.5">
                                      <span>🎒</span> SALVAGING TRACKER'S GEAR & SECURE DATAPAD
                                    </p>
                                    <p className="text-slate-400 text-3xs font-sans leading-relaxed">
                                      You salvage Tracker's lifeless body, recovering his <strong className="text-slate-200">Electric Baton</strong>, <strong className="text-slate-200">Cheap Combat Armor</strong>, and secure credits.
                                    </p>
                                    <div className="mt-2 bg-slate-950/80 border border-cyan-500/20 p-2 rounded font-mono text-[9px] text-cyan-300/90 leading-normal">
                                      <p className="font-extrabold text-red-400 mb-0.5">📂 SECURE DECRYPTED LOG: "ARES_CONTRACT_PLAN_B"</p>
                                      <p className="italic">
                                        "Plan B Protocol: If the hacker group fails or triggers security alarms, initiate containment lockdown. Retrieve decrypted database crystals. Leave the rookie and Vice behind as corporate scapegoats to take the fall. Escape solo via the private shuttle bay."
                                      </p>
                                      <p className="text-3xs text-slate-500 mt-1 uppercase font-bold">
                                        ★ DISCOVERY: Tracker was never on your side. He was Plan B to betray you.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-slate-900/40 border border-white/5 p-2 rounded text-3xs text-slate-400 font-sans leading-relaxed text-left">
                                    Vice leans heavily against the altar, bleeding from a plasma burn: "The blast doors are open, and now we know the truth about Tracker's betrayal. The cowardly rat was going to leave us to rot. But we have a witness here. What are you going to do with this security officer, rookie?"
                                  </div>

                                  {/* Post-combat choices */}
                                  <div className="flex flex-col sm:flex-row gap-2 pt-2 text-3xs uppercase justify-start">
                                    <button
                                      onClick={() => {
                                        let next = { ...gameState! };
                                        next.district = "aurus";
                                        next.poi = "Main Headquarters (The Hideout)";
                                        next.party = [];
                                        next.activeQuests = ["Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."];
                                        next.completedQuests.push("Traitor Discovered (Ares Security Executed)");
                                        setGameState(next);
                                        setActiveRegionId("aurus");
                                        setActivePOIView("hideout");
                                        setActiveDialogue(null);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: "💥 NO WITNESSES: You double-tap the Ares Security Officer. In Megacity-9, loose ends get you killed. Carrying the heavy Ares Data Crystal and Tracker's salvaged gear, you support the wounded Vice, escaping through Level B4's overridden doors. You split up in the slums to evade corporate heat. Chapter 1 Begins.",
                                            type: "narration",
                                            district: "aurus",
                                            poi: "Main Headquarters (The Hideout)"
                                          }
                                        ]);
                                        triggerToast("CHAPTER 1 BEGUN: ARRIVED AT AURUS DISTRICT");
                                      }}
                                      className="bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-200 font-bold px-3 py-2.5 rounded-lg cursor-pointer text-center flex-1"
                                    >
                                      [Double Tap] Kill Officer
                                    </button>

                                    <button
                                      onClick={() => {
                                        let next = { ...gameState! };
                                        next.district = "aurus";
                                        next.poi = "Main Headquarters (The Hideout)";
                                        next.party = [];
                                        if (next.skills) {
                                          next.skills.mindmancer += 1;
                                        }
                                        next.activeQuests = ["Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."];
                                        next.completedQuests.push("Mind-Shattered Security (Officer Subjugated)");
                                        setGameState(next);
                                        setActiveRegionId("aurus");
                                        setActivePOIView("hideout");
                                        setActiveDialogue(null);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: "🔮 SYNAPTIC OVERRIDE: Your eyes glow purple as you rewrite the Officer's memory, erasing his mind of your identities. With Tracker's salvaged gear and decrypted betrayal logs, you escape through Level B4's doors with the wounded Vice. Chapter 1 Begins.",
                                            type: "narration",
                                            district: "aurus",
                                            poi: "Main Headquarters (The Hideout)"
                                          }
                                        ]);
                                        triggerToast("CHAPTER 1 BEGUN: MINDMANCER UNLOCKED (+1 Skill)");
                                      }}
                                      className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold px-3 py-2.5 rounded-lg cursor-pointer text-center flex-1 animate-pulse"
                                    >
                                      [Mindmance] Subjugate & Wipe Memory
                                    </button>

                                    <button
                                      onClick={() => {
                                        let next = { ...gameState! };
                                        next.district = "aurus";
                                        next.poi = "Main Headquarters (The Hideout)";
                                        next.party = [];
                                        next.activeQuests = ["Chapter 1: Aurus District - You are lying low in Megacity-9 slums. Vice is missing after you split up to escape. Find his whereabouts. Speak to Agent Jax at the Neon Abyss Bar."];
                                        next.completedQuests.push("Officer Pacified (Sedative Injected)");
                                        setGameState(next);
                                        setActiveRegionId("aurus");
                                        setActivePOIView("hideout");
                                        setActiveDialogue(null);
                                        
                                        setLogs(prev => [
                                          ...prev,
                                          {
                                            id: crypto.randomUUID(),
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            text: "💊 CLINICAL SEDATION: You inject a high-strength medical sedative into the Officer, knocking him out cold for 12 hours. Grabbing Tracker's salvaged gear and reading his decrypted betrayal logs, you make a swift escape with Vice through B4. Chapter 1 Begins.",
                                            type: "narration",
                                            district: "aurus",
                                            poi: "Main Headquarters (The Hideout)"
                                          }
                                        ]);
                                        triggerToast("CHAPTER 1 BEGUN: ARRIVED AT AURUS DISTRICT");
                                      }}
                                      className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold px-3 py-2.5 rounded-lg cursor-pointer text-center flex-1"
                                    >
                                      [Sedate] Inject Sedative & Flee
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-slate-900/60 border border-cyan-400/20 rounded-lg p-3 relative flex items-start gap-3">
                                  {/* NPC small avatar */}
                                  <img
                                    src={
                                      activeDialogue === "jax"
                                        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
                                        : activeDialogue === "aria"
                                          ? "/src/assets/images/npc_aria_portrait_1782169594302.jpg"
                                          : activeDialogue === "morgana"
                                            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                                            : activeDialogue === "lost_girl"
                                              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                                              : activeDialogue === "auction_lobby"
                                                ? "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=200"
                                                : activeDialogue === "inspect_pens"
                                                  ? "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=200"
                                                  : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                                    }
                                    alt="NPC portrait"
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 object-cover rounded-md border border-white/15 shadow flex-shrink-0"
                                  />

                                <div className="space-y-1 font-mono text-[11px] flex-1 text-left">
                                  <p className="text-cyan-400 font-bold uppercase leading-none">
                                    {activeDialogue === "jax" ? "Agent Jax" : activeDialogue === "aria" ? "Chancellor Aria" : activeDialogue === "morgana" ? "Priestess Morgana" : activeDialogue === "lost_girl" ? "Mia" : activeDialogue === "auction_lobby" ? "Syndicate Auctioneer" : activeDialogue === "inspect_pens" ? "Holding Cell Warden" : "Agent Vesper"}
                                  </p>
                                  <p className="text-[9px] text-slate-500 uppercase font-semibold">
                                    {activeDialogue === "jax" ? "Outcast Coordinator" : activeDialogue === "aria" ? "Corporative Representative" : activeDialogue === "morgana" ? "Coven Technomancer" : activeDialogue === "lost_girl" ? "Lost Corporate Subject" : activeDialogue === "auction_lobby" ? "Outcast Contract Trader" : activeDialogue === "inspect_pens" ? "Security Detainee Monitor" : "Nexus Recruiter"}
                                  </p>
                                  <span className="h-px bg-white/5 block my-1" />
                                  <p className="text-slate-300 font-sans text-2xs leading-relaxed italic">
                                    {activeDialogue === "jax"
                                      ? gameState.inventory.includes("Technical Signal Core")
                                        ? "Amazing effort! You delivered the Technical Signal Core. I'm injecting 150¤ into your grid ledger and clearing active corporate tracking nodes."
                                        : gameState.activeQuests.some(q => q.includes("The Hunt for Vice"))
                                          ? "The clock is ticking. You must traverse to the Titan Logistics Freight Hub in Docks Region, interface with their cargo manifest logs, and isolate Vice's coordinates!"
                                          : gameState.activeQuests.some(q => q.includes("Rescue Vice"))
                                            ? "We found Vice! He is cryogenic-frozen in Detention Bay B underneath the Ares Biotech Corporate Plaza in Downtown. Bring him home, recruit!"
                                            : gameState.completedQuests.some(q => q.includes("Vice Rescued") || q.includes("Chapter 1 Completed"))
                                              ? "Outstanding work breaking Vice out of that corporate cryogenic block! We are building a genuine resistance cell here. Prepare your safehouse upgrades and Dojo training - we strike the corporate sectors in Chapter 2!"
                                              : gameState.completedQuests.some(q => q.includes("Outcast"))
                                                ? "Hold on, rookie! My covert antennas just sniffed an encrypted corporate report. Your cell leader Vice didn't slip through the net clean. He was captured by Ares Tactical! They shipped him out of slums. Go to the Titan Logistics Freight Hub in Docks, hack their transport logs, and find out where they've put him!"
                                                : "The tracking satellite signals are narrowing down. Traverse to Shatter Ridge Corridors in Downtown Region, seize that copper Technical Signal Core, and deliver it!"
                                      : activeDialogue === "aria"
                                        ? gameState.inventory.includes("Acid Beast Core")
                                          ? "Outstanding operation. The sewer lines are functioning beautifully. Here is your salary, and I have authorized an 'Apex Mantis electro-blade' inside stash storage."
                                          : gameState.completedQuests.some(q => q.includes("Corporate Hunt"))
                                            ? "The corporate board records your diagnostic work with high honor, mercenary. Keep doing business with Apex."
                                            : "A radioactive Mutant Sludge Behemoth is nesting in the Docks Sludge Conduits. Hunt it down, extract its chemical Acid Beast Core, and deliver it."
                                        : activeDialogue === "morgana"
                                          ? gameState.inventory.includes("Charged Ley-Matrix")
                                            ? "The bio-frequencies are secure. I will inject high-magic Ether calibrations directly into your cognitive deck. Maximum mana capacity raised!"
                                            : gameState.completedQuests.some(q => q.includes("Syndicate Catalyst"))
                                              ? gameState.activeQuests.some(q => q.includes("Chem-Weaver's Request"))
                                                ? `Bring me 3x Glowing Slime samples from the Docks Sludge Conduits. You currently have ${gameState.inventory.filter(i => i === "Glowing Slime").length}/3 samples.`
                                                : gameState.completedQuests.some(q => q.includes("Chem-Weaver's Request"))
                                                  ? "The bio-sludge catalyst is perfect. The technomantic ley-matrix hums with clean celestial current. Bless you, child."
                                                  : "Your neural system is harmonized with the techno-magic flow, initiate. Walk in shadow."
                                              : "Take my uncharged server matrix, traverse to the Cyber-shrine Gardens in Satoshi Square Region, and Meditate with the tech core to charge the Ley-Matrix."
                                          : activeDialogue === "lost_girl"
                                            ? gameState.companions.some(c => c.name === "Mia")
                                              ? "Mia looks up at you with happy, sparkling eyes: 'Thank you for giving me a home and saving my life, commander! I'll do my absolute best to support you.'"
                                              : "P-please... don't report me to Ares Biotech security... I escaped when the mainframe crashed. My neural cortex is overloading and I have no credentials, no credits, and nowhere to go... can you help me?"
                                            : activeDialogue === "auction_lobby"
                                              ? "The syndicate auction floor is roaring! Today we are selling the premium servitude contracts of captured outcasts and cyber-laborers. Place your bids immediately or leave the trading ring!"
                                              : activeDialogue === "inspect_pens"
                                                ? "You walk down the wet, rusty steel corridors of the holding blocks. Outcasts of all shapes look through the glowing security bars with fear and hope. You can purchase their cell key to release them to your base, or ignore them."
                                                : "Welcome to Nexus Agency. Elite field support Scythe (Ninja), Vex (Mage), and Brick (Orc) are waiting for hire. Choose below."
                                      }
                                  </p>

                                  {/* Branching Response Action Buttons inside Dialogue Overlay */}
                                  <div className="flex flex-wrap gap-1.5 pt-2.5">
                                    
                                    {/* Dialogue Accept/Complete action switches */}
                                    {activeDialogue === "jax" && (
                                      gameState.inventory.includes("Technical Signal Core") ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.credits += 150;
                                            next.experience += 80;
                                            next.inventory = next.inventory.filter(i => i !== "Technical Signal Core");
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Technical Signal Core") && !q.includes("Outcast Directive"));
                                            next.completedQuests.push("Outcast Directive: Secured signal jammer core from waste-raiders.");
                                            setGameState(next);
                                            triggerToast("COMPLETED: OUTCAST DIRECTIVE (+150¤)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-cyan-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-cyan-400"
                                        >
                                          Deliver Signal Core (+150¤)
                                        </button>
                                      ) : !gameState.activeQuests.some(q => q.includes("Outcast")) && !gameState.completedQuests.some(q => q.includes("Outcast")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Outcast Directive: Move to Shatter Ridge Corridors (Downtown Region) and secure the Technical Signal Core for Jax.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: OUTCAST DIRECTIVE");
                                          }}
                                          className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-cyan-900"
                                        >
                                          Accept Assignment
                                        </button>
                                      ) : gameState.completedQuests.some(q => q.includes("Outcast")) && !gameState.activeQuests.some(q => q.includes("The Hunt for Vice") || q.includes("Rescue Vice")) && !gameState.completedQuests.some(q => q.includes("Vice Rescued") || q.includes("Chapter 1 Completed")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Main Quest: The Hunt for Vice - Visit the Docks' Freight Hub and hack the cargo terminal logs to locate Vice's cryogenic holding block.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED MAIN QUEST: THE HUNT FOR VICE");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-purple-500 text-slate-950 font-bold px-2.5 py-1.5 rounded text-3xs uppercase cursor-pointer hover:bg-purple-400 animate-pulse"
                                        >
                                          Accept Quest: The Hunt for Vice
                                        </button>
                                      ) : null
                                    )}

                                    {activeDialogue === "jax" && gameState.completedQuests.some(q => q.includes("Outcast")) && !gameState.activeQuests.some(q => q.includes("Drone Schematic")) && !gameState.completedQuests.some(q => q.includes("Drone Schematic")) && (
                                      <button
                                        onClick={() => {
                                          let next = { ...gameState };
                                          next.activeQuests.push("Side Quest: The Lost Drone Schematic - Hunt Rogue Rust-Claw Orcs in Shatter Ridge (Downtown) to recover the Experimental Drone Chip.");
                                          setGameState(next);
                                          triggerToast("ACCEPTED QUEST: DRONE SCHEMATIC");
                                          setActiveDialogue(null);
                                        }}
                                        className="bg-blue-950 text-blue-300 border border-blue-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-blue-900"
                                      >
                                        Inquire about Lost Drone Chip
                                      </button>
                                    )}

                                    {activeDialogue === "jax" && gameState.inventory.includes("Experimental Drone Chip") && (
                                      <button
                                        onClick={() => {
                                          let next = { ...gameState };
                                          next.inventory = next.inventory.filter(i => i !== "Experimental Drone Chip");
                                          next.credits += 200;
                                          next.experience += 100;
                                          next.activeQuests = next.activeQuests.filter(q => !q.includes("Drone"));
                                          next.completedQuests.push("Side Quest: The Lost Drone Schematic (Delivered to Jax)");
                                          setGameState(next);
                                          triggerToast("COMPLETED: DRONE SCHEMATIC (+200¤)");
                                          setActiveDialogue(null);
                                        }}
                                        className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-emerald-400 animate-pulse"
                                      >
                                        Deliver Drone Chip to Jax (+200¤)
                                      </button>
                                    )}

                                    {activeDialogue === "aria" && !gameState.completedQuests.some(q => q.includes("Corporate Hunt")) && (
                                      gameState.inventory.includes("Acid Beast Core") ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.credits += 180;
                                            next.experience += 90;
                                            next.inventory = next.inventory.filter(i => i !== "Acid Beast Core");
                                            next.inventory.push("Apex Mantis electro-blade");
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Acid Beast Core"));
                                            next.completedQuests.push("Corporate Hunt: Collect mutant chemical core in Sewage.");
                                            setGameState(next);
                                            triggerToast("COMPLETED: CORPORATE HUNT (+180¤ +Apex Electro-Blade)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-cyan-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Deliver Acid Beast Core (+180¤)
                                        </button>
                                      ) : !gameState.activeQuests.some(q => q.includes("Corporate Hunt") || q.includes("Sludge Behemoth")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Corporate Hunt: Travel to Sludge Conduits (Docks Region) and engage the Toxic Sludge Behemoth to secure its Acid Beast Core.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: CORPORATE HUNT");
                                          }}
                                          className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Accept License
                                        </button>
                                      ) : null
                                    )}

                                    {activeDialogue === "morgana" && !gameState.completedQuests.some(q => q.includes("Syndicate Catalyst")) && (
                                      gameState.inventory.includes("Charged Ley-Matrix") ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.maxMana += 25;
                                            next.mana = next.maxMana;
                                            next.credits += 120;
                                            next.experience += 70;
                                            next.inventory = next.inventory.filter(i => i !== "Charged Ley-Matrix");
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Ley-Matrix") && !q.includes("Syndicate Catalyst"));
                                            next.completedQuests.push("Syndicate Catalyst: Meditated at Cyber Shi-Shrines.");
                                            setGameState(next);
                                            triggerToast("COMPLETED: COVEN Ley alignment (+120¤ +25 Max Mana)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-cyan-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Deliver Charged Matrix (+120¤)
                                        </button>
                                      ) : !gameState.activeQuests.some(q => q.includes("Syndicate Catalyst")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Syndicate Catalyst: Move to Satoshi Cyber-Shrine Gardens (Satoshi Square Region) and Meditate with the tech core to charge the matrix.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: COVEN SYNDICATE CATALYST");
                                          }}
                                          className="bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          Accept Initiation
                                        </button>
                                      ) : null
                                    )}

                                    {activeDialogue === "morgana" && gameState.completedQuests.some(q => q.includes("Syndicate Catalyst")) && (
                                      !gameState.activeQuests.some(q => q.includes("Chem-Weaver")) && !gameState.completedQuests.some(q => q.includes("Chem-Weaver")) ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.activeQuests.push("Side Quest: Chem-Weaver's Request - Retrieve 3x Glowing Slime samples from the Docks Sludge Conduits.");
                                            setGameState(next);
                                            triggerToast("ACCEPTED QUEST: CHEM-WEAVER'S REQUEST");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-purple-950 text-purple-300 border border-purple-500/40 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-purple-900 animate-pulse"
                                        >
                                          Accept Side Quest: Chem-Weaver's Request
                                        </button>
                                      ) : gameState.activeQuests.some(q => q.includes("Chem-Weaver")) && gameState.inventory.filter(i => i === "Glowing Slime").length >= 3 ? (
                                        <button
                                          onClick={() => {
                                            let next = { ...gameState };
                                            next.credits += 150;
                                            next.experience += 90;
                                            next.maxMana += 50;
                                            next.mana = next.maxMana;
                                            // remove 3 slimes
                                            let count = 0;
                                            next.inventory = next.inventory.filter(item => {
                                              if (item === "Glowing Slime" && count < 3) {
                                                count++;
                                                return false;
                                              }
                                              return true;
                                            });
                                            next.activeQuests = next.activeQuests.filter(q => !q.includes("Chem-Weaver"));
                                            next.completedQuests.push("Side Quest: Chem-Weaver's Request (Completed)");
                                            setGameState(next);
                                            triggerToast("COMPLETED: CHEM-WEAVER'S REQUEST (+150¤ +50 Max Mana!)");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-emerald-400"
                                        >
                                          Deliver 3x Glowing Slimes
                                        </button>
                                      ) : null
                                    )}

                                    {activeDialogue === "auction_lobby" && (
                                      <>
                                        {/* Bid for Evelyn */}
                                        {!gameState.baseNPCs?.some(n => n.id === "evelyn") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 90 : 120;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const evelyn = {
                                                        id: "evelyn",
                                                        name: "Evelyn",
                                                        role: "Maid Servitude Specialist",
                                                        avatar: "🧹",
                                                        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
                                                        description: "Evelyn was a cyber-genetic engineer before severe medical debts got her sold to the syndicate under absolute servitude. She wears clean butler-style lace cuffs and sweeps base server nodes.",
                                                        dialogue: "Master... the safehouse energy grids have been fine-tuned and calibrated to peak performance. Tell me how I can serve you today.",
                                                        reaction: null,
                                                        happiness: 45,
                                                        affection: "Reserved",
                                                        affectionValue: 35,
                                                        willpower: 55,
                                                        corruption: 15,
                                                        hygiene: "Excellent",
                                                        discipline: 75,
                                                        hunger: "Hungry",
                                                        respect: 40,
                                                        withdrawRisk: "None",
                                                        anger: 15,
                                                        defiance: 20,
                                                        fear: 40,
                                                        inventory: ["Tech-repair Screwdriver"],
                                                        currentJob: "Base Maintenance Maid"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), evelyn];
                                                      next.experience += 75;
                                                      setGameState(next);
                                                      triggerToast(`EVELYN CONTRACT PURCHASED (+75 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🧹 Bid on Evelyn ({price}¤) [Guaranteed Win]
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Evelyn
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const mind = gameState.skills?.mindmancer || 0;
                                                    if (mind >= 1) {
                                                      let next = { ...gameState };
                                                      const bluffPrice = isBribed ? 60 : 80;
                                                      if (next.credits >= bluffPrice) {
                                                        next.credits -= bluffPrice;
                                                        const evelyn = {
                                                          id: "evelyn",
                                                          name: "Evelyn",
                                                          role: "Maid Servitude Specialist",
                                                          avatar: "🧹",
                                                          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
                                                          description: "Evelyn was a cyber-genetic engineer before severe medical debts got her sold to the syndicate under absolute servitude. She wears clean butler-style lace cuffs and sweeps base server nodes.",
                                                          dialogue: "Master... the safehouse energy grids have been fine-tuned and calibrated to peak performance. Tell me how I can serve you today.",
                                                          reaction: null,
                                                          happiness: 45,
                                                          affection: "Reserved",
                                                          affectionValue: 35,
                                                          willpower: 55,
                                                          corruption: 15,
                                                          hygiene: "Excellent",
                                                          discipline: 75,
                                                          hunger: "Hungry",
                                                          respect: 40,
                                                          withdrawRisk: "None",
                                                          anger: 15,
                                                          defiance: 20,
                                                          fear: 40,
                                                          inventory: ["Tech-repair Screwdriver"],
                                                          currentJob: "Base Maintenance Maid"
                                                        };
                                                        next.baseNPCs = [...(next.baseNPCs || []), evelyn];
                                                        next.experience += 100;
                                                        setGameState(next);
                                                        triggerToast(`BLUFF SUCCESS: Bought Evelyn for ${bluffPrice}¤!`);
                                                      } else {
                                                        triggerToast("INSUFFICIENT CREDITS FOR BLUFF");
                                                      }
                                                    } else {
                                                      triggerToast("REQUIRES MINDMANCER LEVEL 1");
                                                    }
                                                  }}
                                                  className="bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🔮 [Mindmancer 1] Social Bluff Bid ({isBribed ? 60 : 80}¤)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Evelyn Contract Acquired
                                          </span>
                                        )}

                                        {/* Bid for Talon */}
                                        {!gameState.baseNPCs?.some(n => n.id === "talon") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 135 : 180;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const talon = {
                                                        id: "talon",
                                                        name: "Talon",
                                                        role: "Chrome Base Sentinel",
                                                        avatar: "🤖",
                                                        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
                                                        description: "A heavily-chromed cybernetic enforcer and former pit-gladiator purchased from the syndicate arenas. He stands tall, checking the ballistic shell loaders in his pneumatic arm gaskets.",
                                                        dialogue: "Orders, Boss. My pneumatic pistons are pressurized and ready to breach. Any corporate rat coming through those hideout doors will get iron-crushed.",
                                                        reaction: null,
                                                        happiness: 60,
                                                        affection: "Distant",
                                                        affectionValue: 20,
                                                        willpower: 85,
                                                        corruption: 35,
                                                        hygiene: "Normal",
                                                        discipline: 80,
                                                        hunger: "Well-fed",
                                                        respect: 65,
                                                        withdrawRisk: "None",
                                                        anger: 25,
                                                        defiance: 10,
                                                        fear: 10,
                                                        inventory: ["Pneumatic Gauntlet Key"],
                                                        currentJob: "Hideout Sentry Guard"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), talon];
                                                      next.experience += 85;
                                                      setGameState(next);
                                                      triggerToast(`TALON CONTRACT PURCHASED (+85 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🤖 Bid on Talon ({price}¤) [Guaranteed Win]
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Talon
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const str = gameState.attributes?.str || 10;
                                                    const roll = Math.floor(Math.random() * 20) + 1 + str;
                                                    const bluffPrice = isBribed ? 90 : 120;
                                                    if (roll >= 15) {
                                                      let next = { ...gameState };
                                                      if (next.credits >= bluffPrice) {
                                                        next.credits -= bluffPrice;
                                                        const talon = {
                                                          id: "talon",
                                                          name: "Talon",
                                                          role: "Chrome Base Sentinel",
                                                          avatar: "🤖",
                                                          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                                                          description: "A heavily-chromed cybernetic enforcer and former pit-gladiator purchased from the syndicate arenas. He stands tall, checking the ballistic shell loaders in his pneumatic arm gaskets.",
                                                          dialogue: "Orders, Boss. My pneumatic pistons are pressurized and ready to breach. Any corporate rat coming through those hideout doors will get iron-crushed.",
                                                          reaction: null,
                                                          happiness: 60,
                                                          affection: "Distant",
                                                          affectionValue: 20,
                                                          willpower: 85,
                                                          corruption: 35,
                                                          hygiene: "Normal",
                                                          discipline: 80,
                                                          hunger: "Well-fed",
                                                          respect: 65,
                                                          withdrawRisk: "None",
                                                          anger: 25,
                                                          defiance: 10,
                                                          fear: 10,
                                                          inventory: ["Pneumatic Gauntlet Key"],
                                                          currentJob: "Hideout Sentry Guard"
                                                        };
                                                        next.baseNPCs = [...(next.baseNPCs || []), talon];
                                                        next.experience += 110;
                                                        setGameState(next);
                                                        triggerToast(`STR INTIMIDATION SUCCESS! Bought Talon for ${bluffPrice}¤!`);
                                                      } else {
                                                        triggerToast("INSUFFICIENT CREDITS FOR INTIMIDATION");
                                                      }
                                                    } else {
                                                      triggerToast(`STR INTIMIDATION FAIL (Roll: ${roll} vs 15): Bidders laughed!`);
                                                    }
                                                  }}
                                                  className="bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🦾 [Strength Check] Intimidate Competitors ({isBribed ? 90 : 120}¤)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Talon Contract Acquired
                                          </span>
                                        )}
                                      </>
                                    )}

                                    {activeDialogue === "inspect_pens" && (
                                      <>
                                        {!gameState.baseNPCs?.some(n => n.id === "kira") ? (
                                          (() => {
                                            const isBribed = gameState.completedPOIActions?.includes("auction_market:bribed");
                                            const price = isBribed ? 150 : 200;
                                            return (
                                              <>
                                                {gameState.credits >= price ? (
                                                  <button
                                                    onClick={() => {
                                                      const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                      if ((gameState.baseNPCs || []).length >= maxCap) {
                                                        triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                        return;
                                                      }
                                                      let next = { ...gameState };
                                                      next.credits -= price;
                                                      const kira = {
                                                        id: "kira",
                                                        name: "Kira",
                                                        role: "Cyber-Hacker Specialist",
                                                        avatar: "💻",
                                                        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                                        description: "Kira is a prodigy netrunner whom you rescued from the syndicate holdout cages. She sits cross-legged on a server crate with her portable deck glowing bright teal.",
                                                        dialogue: "Yo, Boss! Hacked three corporate escrow channels while you were out. Automated credits are trickling into our balance logs as we speak!",
                                                        reaction: null,
                                                        happiness: 80,
                                                        affection: "Grateful",
                                                        affectionValue: 60,
                                                        willpower: 70,
                                                        corruption: 10,
                                                        hygiene: "Excellent",
                                                        discipline: 65,
                                                        hunger: "Satiated",
                                                        respect: 70,
                                                        withdrawRisk: "None",
                                                        anger: 5,
                                                        defiance: 15,
                                                        fear: 15,
                                                        inventory: ["Cracked Cyberdeck Module"],
                                                        currentJob: "Automated Data Thief"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), kira];
                                                      next.experience += 90;
                                                      setGameState(next);
                                                      triggerToast(`RESCUED KIRA (+90 XP)`);
                                                    }}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                  >
                                                    🔓 Rescued Kira / Buy Key ({price}¤)
                                                  </button>
                                                ) : (
                                                  <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                                    Need {price}¤ for Kira Key
                                                  </span>
                                                )}

                                                <button
                                                  onClick={() => {
                                                    const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                                    if ((gameState.baseNPCs || []).length >= maxCap) {
                                                      triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                      return;
                                                    }
                                                    const intelligence = gameState.attributes?.int || 10;
                                                    const roll = Math.floor(Math.random() * 20) + 1 + intelligence;
                                                    if (roll >= 18) {
                                                      let next = { ...gameState };
                                                      const kira = {
                                                        id: "kira",
                                                        name: "Kira",
                                                        role: "Cyber-Hacker Specialist",
                                                        avatar: "💻",
                                                        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                                        description: "Kira is a prodigy netrunner whom you rescued from the syndicate holdout cages. She sits cross-legged on a server crate with her portable deck glowing bright teal.",
                                                        dialogue: "Yo, Boss! Hacked three corporate escrow channels while you were out. Automated credits are trickling into our balance logs as we speak!",
                                                        reaction: null,
                                                        happiness: 80,
                                                        affection: "Grateful",
                                                        affectionValue: 60,
                                                        willpower: 70,
                                                        corruption: 10,
                                                        hygiene: "Excellent",
                                                        discipline: 65,
                                                        hunger: "Satiated",
                                                        respect: 70,
                                                        withdrawRisk: "None",
                                                        anger: 5,
                                                        defiance: 15,
                                                        fear: 15,
                                                        inventory: ["Cracked Cyberdeck Module"],
                                                        currentJob: "Automated Data Thief"
                                                      };
                                                      next.baseNPCs = [...(next.baseNPCs || []), kira];
                                                      next.experience += 150;
                                                      setGameState(next);
                                                      triggerToast(`INT CHECK SUCCESS (Roll: ${roll} vs 18)! Kira Hacked Free!`);
                                                    } else {
                                                      // Trigger Alarm Combat!
                                                      let next = { ...gameState };
                                                      next.combatState = {
                                                        enemyName: "Syndicate Shock-Guard (Group Ambush)",
                                                        enemyHp: 65,
                                                        enemyMaxHp: 65,
                                                        enemyShields: 20,
                                                        enemyMaxShields: 20,
                                                        isActive: true,
                                                        turnLog: "INT CHECK FAILURE! Hacking attempt detected! Red laser grid alarm activated and Warden dispatched Shock-Guards to neutralize you!"
                                                      };
                                                      setGameState(next);
                                                      setActiveDialogue(null);
                                                      triggerToast(`🚨 HACK FAILURE (Roll: ${roll} vs 18): ALARMS DETECTED!`);
                                                    }
                                                  }}
                                                  className="bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                                >
                                                  🧠 [Intellect Check] Decrypt Latch Code (0¤, Alert Risk)
                                                </button>
                                              </>
                                            );
                                          })()
                                        ) : (
                                          <span className="text-[10px] text-slate-500 border border-dashed border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Kira Rescued to Safehouse Base
                                          </span>
                                        )}
                                      </>
                                    )}

                                    {activeDialogue === "lost_girl" && !gameState.baseNPCs?.some(c => c.id === "mia") && (
                                      <>
                                        <button
                                          onClick={() => {
                                            const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                            if ((gameState.baseNPCs || []).length >= maxCap) {
                                              triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                              return;
                                            }
                                            let next = { ...gameState };
                                            const mia = {
                                              name: "Mia",
                                              fee: 0,
                                              status: "in_party" as "available" | "hired" | "in_party" | "working",
                                              role: "Neural Aegis / Support Mage",
                                              bio: "An escaped corporate lab subject with dormant high-bandwidth neural forcefields. Grateful for your shelter.",
                                              avatar: "✨",
                                              equipment: {
                                                meleeWeapon: null,
                                                rangedWeapon: null,
                                                armor: "Tactical Flak Armor",
                                                headpiece: null,
                                                trinket: null
                                              }
                                            };
                                            const miaBaseNPC = {
                                              id: "mia",
                                              name: "Mia",
                                              role: "Base Specialist / Chef",
                                              avatar: "🌸",
                                              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                              description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
                                              dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
                                              reaction: null,
                                              happiness: 95,
                                              affection: "Warm",
                                              affectionValue: 78,
                                              willpower: 45,
                                              corruption: 10,
                                              hygiene: "Excellent",
                                              discipline: 60,
                                              hunger: "Satiated",
                                              respect: 85,
                                              withdrawRisk: "None",
                                              anger: 0,
                                              defiance: 5,
                                              fear: 15,
                                              inventory: ["Copper-Wire Ring"],
                                              currentJob: "Base Supply Chef"
                                            };
                                            next.companions.push(mia);
                                            next.party.push("Mia");
                                            next.baseNPCs = [...(next.baseNPCs || []), miaBaseNPC];
                                            next.experience += 60;
                                            setGameState(next);
                                            triggerToast("MIA JOINED YOUR PARTY AND SAFEHOUSE BASE!");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-emerald-400"
                                        >
                                          🤝 Invite to Hideout (Squad Teammate)
                                        </button>

                                        <button
                                          onClick={() => {
                                            const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                            if ((gameState.baseNPCs || []).length >= maxCap) {
                                              triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                              return;
                                            }
                                            let next = { ...gameState };
                                            const mia = {
                                              name: "Mia",
                                              fee: 0,
                                              status: "working" as "available" | "hired" | "in_party" | "working",
                                              role: "Safehouse Maid & Tech Analyst",
                                              bio: "Her neural implants are synced with your safehouse server nodes. She manages security algorithms and cooks synth-rations.",
                                              avatar: "🧹",
                                              equipment: {
                                                meleeWeapon: null,
                                                rangedWeapon: null,
                                                armor: null,
                                                headpiece: null,
                                                trinket: null
                                              }
                                            };
                                            const miaBaseNPC = {
                                              id: "mia",
                                              name: "Mia",
                                              role: "Base Specialist / Chef",
                                              avatar: "🌸",
                                              image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                              description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
                                              dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
                                              reaction: null,
                                              happiness: 95,
                                              affection: "Warm",
                                              affectionValue: 78,
                                              willpower: 45,
                                              corruption: 10,
                                              hygiene: "Excellent",
                                              discipline: 60,
                                              hunger: "Satiated",
                                              respect: 85,
                                              withdrawRisk: "None",
                                              anger: 0,
                                              defiance: 5,
                                              fear: 15,
                                              inventory: ["Copper-Wire Ring"],
                                              currentJob: "Base Supply Chef"
                                            };
                                            next.companions.push(mia);
                                            next.baseNPCs = [...(next.baseNPCs || []), miaBaseNPC];
                                            next.experience += 80;
                                            setGameState(next);
                                            triggerToast("MIA BOUND AS SAFE-HOUSE MAID & RECRUITED TO BASE!");
                                            setActiveDialogue(null);
                                          }}
                                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer"
                                        >
                                          🔮 [Mindmance] Sync Neural Link (Maid servant)
                                        </button>

                                        {gameState.credits >= 30 ? (
                                          <button
                                            onClick={() => {
                                              const maxCap = gameState.safehouseUpgrades?.crewBunksExpanded ? 8 : 3;
                                              if ((gameState.baseNPCs || []).length >= maxCap) {
                                                triggerToast(`RECRUITMENT FAILED: Safehouse quarters fully occupied (${(gameState.baseNPCs || []).length}/${maxCap})! Expand your quarters first.`);
                                                return;
                                              }
                                              let next = { ...gameState };
                                              const miaBaseNPC = {
                                                id: "mia",
                                                name: "Mia",
                                                role: "Base Specialist / Chef",
                                                avatar: "🌸",
                                                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
                                                description: "Mia is cleaning the server stacks in the safehouse core. Her posture is fragile but her eyes show a deep, quiet gratitude for rescuing her from the slums.",
                                                dialogue: "Um... hello, commander. Thank you so much for bringing me here. It's so warm and safe compared to the rainy back-alleys. I've prepared a hot meal if you are hungry.",
                                                reaction: null,
                                                happiness: 95,
                                                affection: "Warm",
                                                affectionValue: 78,
                                                willpower: 45,
                                                corruption: 10,
                                                hygiene: "Excellent",
                                                discipline: 60,
                                                hunger: "Satiated",
                                                respect: 85,
                                                withdrawRisk: "None",
                                                anger: 0,
                                                defiance: 5,
                                                fear: 15,
                                                inventory: ["Copper-Wire Ring"],
                                                currentJob: "Base Supply Chef"
                                              };
                                              next.credits -= 30;
                                              next.experience += 100;
                                              next.inventory.push("Ether Mana-Cell (Mana)");
                                              next.baseNPCs = [...(next.baseNPCs || []), miaBaseNPC];
                                              setGameState(next);
                                              triggerToast("SAVED MIA! Guided her to your Safehouse Base");
                                              setActiveDialogue(null);
                                            }}
                                            className="bg-cyan-600 text-white font-bold px-2 py-1 rounded text-3xs uppercase cursor-pointer hover:bg-cyan-500"
                                          >
                                            🪙 Give 30¤ & Guide to Safehouse
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-slate-600 border border-white/5 p-1 rounded font-mono uppercase bg-slate-950/40">
                                            Need 30¤ to Save Her
                                          </span>
                                        )}
                                      </>
                                    )}

                                    <button
                                      onClick={() => setActiveDialogue(null)}
                                      className="bg-slate-950 border border-white/15 text-slate-400 hover:text-white hover:bg-slate-900 px-2.5 py-1 rounded text-3xs uppercase cursor-pointer"
                                    >
                                      Goodbye / Farewell
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          ) : (
                              // Custom Mini-Game rendering for Sanctuary Hacking Terminal
                              activePOIView === "terminal_hacking_puzzle" ? (
                                <div className="bg-slate-950/95 border border-cyan-400/30 rounded-xl p-4 font-mono text-xs space-y-3 shadow-lg">
                                  <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                    <span className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase text-3xs tracking-widest">
                                      <Terminal size={14} className="text-cyan-400 animate-pulse" /> Cyberdeck Decryption Module v3.15
                                    </span>
                                    <span className="text-[9px] text-slate-500 uppercase">INT BUFFER RATIO: {gameState?.attributes?.int || 10}</span>
                                  </div>
                                  
                                  {(!hackingPuzzle || hackingPuzzle.status === "idle") ? (
                                    <div className="text-center py-4 space-y-3">
                                      <p className="text-slate-400 text-3xs leading-relaxed max-w-md mx-auto">
                                        The Ares Biotech cyber-vault terminal is protected by standard dual-stage hex encryption. Match the target registers to bypass the local alarms.
                                      </p>
                                      <button
                                        onClick={() => {
                                          setHackingPuzzle({
                                            targets: [
                                              { hex: "0x4F", matched: false },
                                              { hex: "0xE9", matched: false },
                                              { hex: "0xA2", matched: false },
                                              { hex: "0x7C", matched: false }
                                            ],
                                            options: ["0x3B", "0x4F", "0x1A", "0xE9", "0x8D", "0xA2", "0xD4", "0x7C"].sort(() => Math.random() - 0.5),
                                            selectedTargetIdx: null,
                                            status: "playing"
                                          });
                                        }}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded text-3xs uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                                      >
                                        Initialize Decryption Subroutines
                                      </button>
                                    </div>
                                  ) : hackingPuzzle.status === "playing" ? (
                                    <div className="space-y-4 py-1">
                                      <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold">
                                        {hackingPuzzle.selectedTargetIdx === null 
                                          ? "1. Select an encrypted register block below" 
                                          : "2. Click the matching hex key from the decryption pool"}
                                      </p>
                                      
                                      {/* Targets */}
                                      <div className="grid grid-cols-4 gap-2">
                                        {hackingPuzzle.targets.map((t, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => {
                                              if (t.matched) return;
                                              setHackingPuzzle(prev => prev ? { ...prev, selectedTargetIdx: idx } : null);
                                            }}
                                            className={`p-3 rounded-lg border font-bold text-center transition-all cursor-pointer flex flex-col justify-between items-center min-h-[55px] ${
                                              t.matched
                                                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] cursor-default"
                                                : hackingPuzzle.selectedTargetIdx === idx
                                                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                                  : "bg-slate-900 border-white/5 text-slate-300 hover:border-white/15"
                                            }`}
                                          >
                                            <span className="text-4xs text-slate-500 uppercase tracking-widest leading-none block mb-1">REG {idx + 1}</span>
                                            <span className="text-[11px] block">{t.matched ? "✓ OPENED" : t.hex}</span>
                                          </button>
                                        ))}
                                      </div>

                                      {/* Key Pool Options */}
                                      <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-3">
                                        {hackingPuzzle.options.map((opt, idx) => (
                                          <button
                                            key={idx}
                                            disabled={hackingPuzzle.selectedTargetIdx === null}
                                            onClick={() => {
                                              if (hackingPuzzle.selectedTargetIdx === null) return;
                                              const target = hackingPuzzle.targets[hackingPuzzle.selectedTargetIdx];
                                              if (target.hex === opt) {
                                                const newTargets = [...hackingPuzzle.targets];
                                                newTargets[hackingPuzzle.selectedTargetIdx] = { ...target, matched: true };
                                                
                                                const isFinished = newTargets.every(t => t.matched);
                                                setHackingPuzzle(prev => {
                                                  if (!prev) return null;
                                                  return {
                                                    ...prev,
                                                    targets: newTargets,
                                                    selectedTargetIdx: null,
                                                    status: isFinished ? "success" : "playing"
                                                  };
                                                });
                                                triggerToast("REGISTER UNLOCKED");
                                              } else {
                                                triggerToast("KEY MISMATCH - CYBER-DECK RETRYING");
                                                setHackingPuzzle(prev => prev ? { ...prev, selectedTargetIdx: null } : null);
                                              }
                                            }}
                                            className={`p-2.5 rounded border transition-all text-center text-[10px] ${
                                              hackingPuzzle.selectedTargetIdx === null
                                                ? "bg-slate-950/40 border-white/5 text-slate-600 cursor-not-allowed"
                                                : "bg-slate-900/80 border-cyan-500/15 text-slate-300 hover:bg-slate-850 hover:border-cyan-400/50 cursor-pointer"
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : hackingPuzzle.status === "success" ? (
                                    <div className="text-center py-4 space-y-3">
                                      <p className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                                        <CheckCircle size={14} /> SECURITY SCHEMAS DECRYPTED - FULL DOWNLOAD READY
                                      </p>
                                      <p className="text-slate-400 text-3xs leading-relaxed max-w-sm mx-auto">
                                        The corporate database has been successfully copied. The locking pins on the Golden Relic Chamber have completely retracted.
                                      </p>
                                      <button
                                        onClick={() => {
                                          let nextState = { ...gameState! };
                                          nextState.poi = "Mysterious Relic Altar";
                                          setActivePOIView("relic_altar");
                                          nextState.inventory.push("Ares Data Crystal");
                                          nextState.experience += 50;
                                          setActivePopup({
                                            title: "DATABASE COPIED",
                                            subtitle: "HEX DECRYPTION SUCCESS",
                                            type: "loot",
                                            text: "You successfully bypassed the Ares mainframe and extracted the Ares Data Crystal! The secure lockpins holding the golden relic chamber have fully retracted. Access the altar immediately."
                                          });
                                          setGameState(nextState);
                                          setHackingPuzzle(null);
                                          
                                          setLogs(prev => [
                                            ...prev,
                                            {
                                              id: crypto.randomUUID(),
                                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                              text: "💾 DECRYPTION SUCCESS: You safely extract the 'Ares Data Crystal' into your inventory stash. The heavy security door behind the terminal slides back silently, revealing a glowing chamber with a floating golden relic on a black altar...",
                                              type: "narration",
                                              district: nextState.district,
                                              poi: nextState.poi
                                            }
                                          ]);
                                          triggerToast("HACK COMPLETE: COPIED DATA");
                                        }}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded text-3xs uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                      >
                                        Extract Database & Access Relic
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                // Regular Location Action option rows
                                <div className="space-y-4">
                                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                                    {activePOIView === "ventilation_shaft" && ventFailed
                                      ? "⚠️ CRITICAL LOCKDOWN: AIRLOCK BLADES SECURED. RESOLVE FAILURE:"
                                      : "OPERATIONAL RESPONSES PREPARED AT LOCATION:"}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(() => {
                                      let btns = activePOIView === "ventilation_shaft" && ventFailed
                                        ? ["Force Fan Blades (STR Check)", "Trigger EMP Burst (EMP Explosion!)", "Hack Fan Console (INT Check)"]
                                        : [...(MAP_POIS.find(p => p.id === activePOIView)?.buttons || [])];
                                      
                                      // ---- MAIN QUEST & SIDE QUEST DYNAMIC BUTTONS ----
                                      if (gameState) {
                                        const activeQ = gameState.activeQuests || [];
                                        const completedActions = gameState.completedPOIActions || [];
                                        const inv = gameState.inventory || [];
                                        const skills = gameState.skills || {};

                                        // 1. Rescue Vice Main Quest at Corporate Plaza
                                        if (activePOIView === "corporate_plaza" && activeQ.some(q => q.includes("Rescue Vice"))) {
                                          if (completedActions.includes("corporate_plaza:security_bypassed")) {
                                            if (completedActions.includes("corporate_plaza:detention_floor")) {
                                              btns.push("💪 Force emergency cryo-release valve (STR Check)");
                                              btns.push("💻 Override cryogenic suspension program (INT Check)");
                                              btns.push("⚡ Short-circuit power grid coupling (Costs 30 Mana)");
                                            } else {
                                              btns.push("🔓 Breach Cryo-Detention Unit (Extract Vice)");
                                            }
                                          } else {
                                            btns.push("⚔️ Assault Plaza Guards (Open Combat)");
                                            btns.push("💾 Hack Security Mainframe (INT Check)");
                                            if (inv.includes("Decrypted Ares Transit Token") || (skills.mindmancer && skills.mindmancer >= 1)) {
                                              btns.push("🔑 Forge Clearance Credentials (Easy)");
                                            }
                                          }
                                        }

                                        // 2. Drone Schematic Side Quest at Shatter Ridge & Bar
                                        if (activePOIView === "shatter_ridge" && activeQ.some(q => q.includes("Drone Schematic"))) {
                                          if (!inv.includes("Experimental Drone Chip")) {
                                            btns.push("Hunt Rust-Claw Orcs for Drone Chip (Side Quest)");
                                          } else {
                                            btns.push("Install Chip in Base Security Grid");
                                          }
                                        }
                                        if (activePOIView === "bar" && activeQ.some(q => q.includes("Drone Schematic")) && inv.includes("Experimental Drone Chip")) {
                                          btns.push("Deliver Drone Chip to Jax");
                                        }

                                        // 3. Chem-Weaver's Request Side Quest at Sludge Conduits & Temple
                                        if (activePOIView === "sludge_conduits" && activeQ.some(q => q.includes("Chem-Weaver's Request"))) {
                                          const slimesCount = inv.filter(i => i === "Glowing Slime").length;
                                          if (slimesCount < 3) {
                                            btns.push("Harvest Glowing Slime pool (Side Quest)");
                                          }
                                        }
                                        if (activePOIView === "temple" && activeQ.some(q => q.includes("Chem-Weaver's Request"))) {
                                          const slimesCount = inv.filter(i => i === "Glowing Slime").length;
                                          if (slimesCount >= 3) {
                                            btns.push("Deliver 3x Slimes to Priestess Morgana");
                                          }
                                        }
                                      }
                                      
                                      if (gameState && gameState.stamina <= 35) {
                                        if (gameState.credits >= 25) {
                                          btns.push("💉 Emergency Adrenaline Dose (-25¤)");
                                        }
                                        if (gameState.hp > 12) {
                                          btns.push("💤 Heavy Rest on Back-Alley Grate (+20 Stamina, -10 HP)");
                                        }
                                        const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                                        if (!isPrologue) {
                                          btns.push("🚀 Fast-Travel Home to Sleep");
                                        }
                                      }
                                      return btns;
                                    })().map((action, idx) => {
                                      const isCompleted = isActionCompleted(activePOIView, action);
                                      const isEmergencyBtn = action.startsWith("💉") || action.startsWith("💤") || action.startsWith("🚀");
                                      return (
                                        <button
                                          key={idx}
                                          disabled={isCompleted}
                                          onClick={() => handleExecuteAction(action)}
                                          className={`text-left px-3.5 py-2.5 rounded-lg border font-mono text-xs transition-all flex items-center justify-between cursor-pointer group ${
                                            isCompleted
                                              ? "border-slate-950 bg-slate-950/40 text-slate-500 cursor-not-allowed opacity-50"
                                              : isEmergencyBtn
                                                ? "border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 hover:border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                                : activePOIView === "ventilation_shaft" && ventFailed
                                                  ? "border-red-500/30 bg-red-950/40 hover:bg-red-900/50 hover:border-red-500/60 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                                                  : "border-white/5 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/30 text-white"
                                          }`}
                                        >
                                          <span className="truncate group-hover:text-cyan-300">
                                            {action} {isCompleted && " ✓ [SECURED]"}
                                          </span>
                                          <span className="text-[9px] text-slate-600 font-bold border border-white/5 px-1 rounded block flex-shrink-0 ml-2">
                                            {isCompleted ? "✓" : idx + 1}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <span className="h-px bg-white/5 block" />

                          {/* Escape back to standard district map travel */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-mono text-[9px] hidden sm:inline">COORD NODES ALIGNED</span>
                            <button
                              onClick={() => {
                                setActivePOIView(null);
                                setActiveDialogue(null);
                              }}
                              className="bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-950 font-mono text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 animate-pulse cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] ml-auto"
                            >
                              <ArrowLeft size={12} /> Return to Holographic Map
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
                )}

                {/* ADVANCED ELECTRONIC TACTICAL COMBAT HUD */}
                <AnimatePresence>
                  {gameState.combatState?.isActive && gridCombat && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-panel-heavy border-red-500/40 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col gap-5 box-glow-pink overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-rose-500/20 pb-3 gap-2">
                        <div>
                          <span className="font-display font-black text-base text-rose-400 flex items-center gap-2 uppercase tracking-wider animate-pulse">
                            <Sword size={18} className="text-rose-500" /> TACTICAL COMBAT SEQUENCE
                          </span>
                          <p className="text-4xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">GRID MATRIX ALPHA-9: SQUAD-BASED CONFLICT</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider font-extrabold">
                            CONFLICT BOUND
                          </span>
                        </div>
                      </div>

                      {/* Initiative Queue Timeline */}
                      <div className="bg-slate-950/60 border border-white/5 p-2 rounded-xl flex flex-col gap-1">
                        <span className="text-4xs font-mono text-slate-500 uppercase tracking-widest font-black text-left">Initiative Timeline Queue:</span>
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
                          {gridCombat.turnOrder.map((id, index) => {
                            const unit = gridCombat.combatants.find(c => c.id === id);
                            if (!unit || unit.isDead) return null;
                            const isActive = index === gridCombat.currentTurnIdx;
                            return (
                              <div
                                key={id}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-3xs font-mono transition-all duration-300 flex-shrink-0 ${
                                  isActive
                                    ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/20 animate-pulse scale-105"
                                    : unit.team === "player"
                                      ? "bg-slate-900/60 border-slate-700 text-slate-300"
                                      : "bg-red-950/30 border-red-900/50 text-red-300"
                                }`}
                              >
                                <span>{unit.avatar}</span>
                                <span className="font-bold truncate max-w-[80px]">{unit.name.split(" ")[0]}</span>
                                <span className="text-slate-500 text-4xs">({unit.initiative} INI)</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tactical Grid Map & Stats Bar */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* 8x6 Cyber Grid Container */}
                        <div className="lg:col-span-3 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-3xs font-mono text-slate-400 px-1">
                            <span className="flex items-center gap-1"><Compass size={10} className="text-cyan-400" /> TAP CELLS TO MOVE [RANGE 2] / ATTACK WITH MELEE OR GUNS</span>
                            <span>INTERIOR CORRIDOR ARRAY [8x6]</span>
                          </div>

                          {/* Render the Grid */}
                          <div className="grid grid-cols-8 gap-1.5 p-3 bg-slate-950/95 border border-slate-800/80 rounded-xl relative overflow-hidden box-glow-cyan select-none min-h-[220px] sm:min-h-[280px]">
                            {/* Grid Cell Loop */}
                            {Array.from({ length: 6 }).map((_, rIdx) =>
                              Array.from({ length: 8 }).map((__, cIdx) => {
                                const COMBAT_OBSTACLES = [[2, 1], [2, 4], [5, 2], [5, 3], [3, 0], [4, 5]];
                                const isObstacle = COMBAT_OBSTACLES.some(([ox, oy]) => ox === cIdx && oy === rIdx);
                                const unit = gridCombat.combatants.find(c => c.x === cIdx && c.y === rIdx && !c.isDead);
                                
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                const isPlayerTurn = activeActor?.team === "player";
                                
                                // Movement Reachability Calculation
                                let reachable = false;
                                if (isPlayerTurn && activeActor && activeActor.ap > 0 && !isObstacle && !unit && gridCombat.selectedAction === "move") {
                                  const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                  reachable = d > 0 && d <= 2;
                                }

                                // Targeting Calculation
                                let targetable = false;
                                if (isPlayerTurn && activeActor && activeActor.ap > 0 && unit && unit.team === "enemy") {
                                  if (gridCombat.selectedAction === "meleeAtk") {
                                    const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                    targetable = d === 1;
                                  } else if (gridCombat.selectedAction === "rangedAtk") {
                                    const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                    const maxRange = gameState?.equipment?.rangedWeapon === "Heavy Plasma Cannon" ? 4 : 3;
                                    targetable = d > 0 && d <= maxRange;
                                  } else if (gridCombat.selectedAction === "attack") {
                                    const d = Math.abs(cIdx - activeActor.x) + Math.abs(rIdx - activeActor.y);
                                    targetable = d <= activeActor.range;
                                  }
                                }

                                return (
                                  <div
                                    key={`${cIdx}-${rIdx}`}
                                    onClick={() => {
                                      if (!isPlayerTurn || !activeActor) return;
                                      
                                      // Execute move
                                      if (reachable && gridCombat.selectedAction === "move") {
                                        const updated = gridCombat.combatants.map(c => {
                                          if (c.id === activeActor.id) {
                                            return { ...c, x: cIdx, y: rIdx, ap: c.ap - 1 };
                                          }
                                          return c;
                                        });

                                        setGridCombat(prev => prev ? {
                                          ...prev,
                                          combatants: updated,
                                          turnLog: `⚡ ${activeActor.name} moved to sector coordinates [${cIdx}, ${rIdx}].`
                                        } : null);

                                        // Sync player coordinates or state if it's the main player
                                        if (activeActor.id === "player" && gameState) {
                                          let ns = { ...gameState };
                                          setGameState(ns);
                                        }
                                        triggerToast("SECTOR MOVEMENT COMPLETE");
                                      }
                                      
                                      // Execute attack
                                      if (targetable && unit && (gridCombat.selectedAction === "attack" || gridCombat.selectedAction === "meleeAtk" || gridCombat.selectedAction === "rangedAtk")) {
                                        let finalDamage = activeActor.damage;
                                        let weaponUsedName = "unarmed strike";

                                        if (gridCombat.selectedAction === "meleeAtk") {
                                          const derived = getDerivedStats();
                                          weaponUsedName = gameState?.equipment?.meleeWeapon || "standard cyber-fists";
                                          finalDamage = 15 + Math.floor((gameState?.attributes?.str || 10) * 1.2) + derived.meleeAtk;
                                        } else if (gridCombat.selectedAction === "rangedAtk") {
                                          const derived = getDerivedStats();
                                          weaponUsedName = gameState?.equipment?.rangedWeapon || "integrated sidearm";
                                          finalDamage = 12 + Math.floor((gameState?.attributes?.dex || 10) * 1.2) + derived.rangeAtk;
                                        }

                                        const rollDmg = finalDamage + Math.floor(Math.random() * 7) - 3;
                                        const updated = gridCombat.combatants.map(c => {
                                          if (c.id === unit.id) {
                                            let finalHp = c.hp;
                                            let finalShields = c.shields;
                                            if (finalShields > 0) {
                                              finalShields -= rollDmg;
                                              if (finalShields < 0) {
                                                finalHp += finalShields;
                                                finalShields = 0;
                                              }
                                            } else {
                                              finalHp -= rollDmg;
                                            }
                                            const isDead = finalHp <= 0;
                                            return { ...c, hp: Math.max(0, finalHp), shields: finalShields, isDead };
                                          }
                                          if (c.id === activeActor.id) {
                                            return { ...c, ap: c.ap - 1 };
                                          }
                                          return c;
                                        });

                                        const hitEnemy = updated.find(c => c.id === unit.id);
                                        const enemyRemainingLog = hitEnemy?.isDead 
                                          ? `💥 ${hitEnemy.name} COMPROMISED: Systems overloaded and shattered!`
                                          : `🎯 Hit! ${hitEnemy?.name} sustained ${rollDmg} damage. Vitals: (${hitEnemy?.hp}/${hitEnemy?.maxHp} HP, ${hitEnemy?.shields} SHIELD).`;

                                        setGridCombat(prev => prev ? {
                                          ...prev,
                                          combatants: updated,
                                          turnLog: `⚔️ ATTACK REPORT: ${activeActor.name} engaged ${unit.name} using ${weaponUsedName}! ${enemyRemainingLog}`
                                        } : null);

                                        // Sync health back to primary gameState if the primary enemy or player was damaged
                                        if (gameState) {
                                          let ns = { ...gameState };
                                          if (unit.id === "enemy-1") {
                                            ns.combatState!.enemyHp = Math.max(0, hitEnemy?.hp || 0);
                                            ns.combatState!.enemyShields = hitEnemy?.shields || 0;
                                          }
                                          setGameState(ns);
                                        }
                                        triggerToast("STRIKE REGISTERED");
                                      }
                                    }}
                                    className={`relative rounded border aspect-square flex items-center justify-center transition-all ${
                                      isObstacle 
                                        ? "bg-stripes-warning border-slate-900 bg-slate-900/40 text-slate-600"
                                        : reachable
                                          ? "border-cyan-400 bg-cyan-950/40 cursor-pointer animate-pulse shadow-[inset_0_0_6px_rgba(34,211,238,0.3)] hover:bg-cyan-900/40"
                                          : targetable
                                            ? "border-rose-500 bg-rose-950/40 cursor-pointer animate-pulse shadow-[inset_0_0_6px_rgba(239,68,68,0.3)] hover:bg-rose-900/40"
                                            : "border-white/[0.03] bg-slate-900/30 hover:bg-slate-900/50"
                                    }`}
                                  >
                                    {/* Obstacle Icon */}
                                    {isObstacle && <span className="text-[10px] opacity-30 select-none">⚡</span>}

                                    {/* Coordinates Hover Label */}
                                    <span className="absolute bottom-0.5 right-0.5 text-[7px] text-slate-800 font-mono select-none">
                                      {cIdx},{rIdx}
                                    </span>

                                    {/* Reachable Dot */}
                                    {reachable && <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />}

                                    {/* Render Unit Token */}
                                    {unit && (
                                      <div
                                        className={`w-4/5 h-4/5 rounded-full border-2 flex flex-col items-center justify-center relative shadow-lg ${unit.color} ${
                                          unit.id === activeActor?.id ? "ring-2 ring-cyan-400 animate-pulse scale-105" : ""
                                        }`}
                                      >
                                        <span className="text-xs select-none">{unit.avatar}</span>
                                        
                                        {/* Simple Mini Health / Shield indicator */}
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-full max-w-[28px] h-1 bg-slate-950 rounded overflow-hidden flex">
                                          {unit.shields > 0 && (
                                            <div 
                                              className="bg-cyan-400 h-full" 
                                              style={{ width: `${(unit.shields / unit.maxShields) * 100}%` }} 
                                            />
                                          )}
                                          <div 
                                            className="bg-red-500 h-full flex-1" 
                                            style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} 
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Sidebar: Combatants Details list */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex flex-col gap-3 font-mono text-3xs">
                          <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10 pb-1.5 block">Tactical Roster:</span>
                          <div className="flex-1 space-y-2 max-h-[190px] lg:max-h-[250px] overflow-y-auto pr-1">
                            {gridCombat.combatants.map(c => {
                              if (c.isDead) return null;
                              return (
                                <div key={c.id} className="bg-slate-950/40 border border-white/[0.03] p-1.5 rounded flex justify-between items-center">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">{c.avatar}</span>
                                    <div>
                                      <p className="font-bold text-slate-300 leading-none">{c.name.split(" ")[0]}</p>
                                      <p className="text-[7px] text-slate-500 leading-none mt-0.5">X:{c.x}, Y:{c.y} • AP:{c.ap}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-red-400 leading-none">{c.hp}/{c.maxHp} HP</p>
                                    {c.shields > 0 && <p className="text-cyan-400 text-[7px] leading-none mt-0.5">{c.shields} SHLD</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick active combatant turn indicator */}
                          <div className="bg-slate-950 border border-cyan-500/20 p-2 rounded-lg text-left">
                            <span className="text-[8px] text-cyan-400 block uppercase font-bold leading-none mb-1">Acting Now:</span>
                            <span className="text-[10px] text-white font-extrabold block uppercase tracking-wide truncate">
                              {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[8px] text-slate-500 font-black">AP:</span>
                              <div className="flex gap-1">
                                {Array.from({ length: gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.maxAp || 2 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      idx < (gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.ap || 0)
                                        ? "bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"
                                        : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Combat Status Feed Log */}
                      <div className="bg-slate-950/95 border border-rose-500/30 p-4 rounded-xl text-amber-200 font-mono text-xs sm:text-sm md:text-base text-center font-bold tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <span className="text-rose-500 font-black mr-2">SYS LOG:</span>
                        {gridCombat.turnLog}
                      </div>

                      {/* Controls Area */}
                      <div className="border-t border-white/5 pt-3 flex flex-col md:flex-row gap-3 items-center justify-between">
                        {/* Player / Companion Turn Controls */}
                        {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.team === "player" ? (
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button
                              onClick={() => {
                                setGridCombat(prev => prev ? { ...prev, selectedAction: "move" } : null);
                              }}
                              className={`flex-1 md:flex-initial font-mono font-black text-3xs px-4 py-3 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                gridCombat.selectedAction === "move"
                                  ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                  : "bg-slate-900 border-white/5 text-cyan-400 hover:bg-slate-800"
                              }`}
                            >
                              🚀 Move Position [AP: 1]
                            </button>
                            
                             <button
                               onClick={() => {
                                 setGridCombat(prev => prev ? { ...prev, selectedAction: "meleeAtk" } : null);
                               }}
                               className={`flex-1 md:flex-initial font-mono font-black text-3xs px-4 py-3 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                 gridCombat.selectedAction === "meleeAtk"
                                   ? "bg-red-500 text-white border-red-400 font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                   : "bg-slate-900 border-white/5 text-red-400 hover:bg-slate-800"
                               }`}
                             >
                               🗡️ Melee Strike [AP: 1]
                             </button>

                             <button
                               onClick={() => {
                                 setGridCombat(prev => prev ? { ...prev, selectedAction: "rangedAtk" } : null);
                               }}
                               className={`flex-1 md:flex-initial font-mono font-black text-3xs px-4 py-3 rounded-lg border transition-all cursor-pointer uppercase tracking-wider ${
                                 gridCombat.selectedAction === "rangedAtk"
                                   ? "bg-orange-500 text-white border-orange-400 font-extrabold shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                   : "bg-slate-900 border-white/5 text-orange-400 hover:bg-slate-800"
                               }`}
                             >
                               🔫 Ranged Shoot [AP: 1]
                             </button>

                            {/* Ether Spell discharge */}
                            <button
                              onClick={() => {
                                if (!gameState) return;
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!activeActor || activeActor.ap < 1) {
                                  triggerToast("NO AP FOR SPELL DISCHARGE");
                                  return;
                                }
                                if (gameState.mana < 15) {
                                  triggerToast("INSUFFICIENT ETHER COGNITIVE STABLE");
                                  return;
                                }

                                // Apply massive spell damage directly to the primary enemy
                                const enemy = gridCombat.combatants.find(c => c.id === "enemy-1");
                                if (!enemy || enemy.isDead) {
                                  triggerToast("NO HOSTILE TARGET ACQUIRED");
                                  return;
                                }

                                let mDmg = Math.floor(Math.random() * 16) + 30; // 30-45
                                if (gameState.inventory.includes("Coven Ether-deck v3")) {
                                  mDmg = Math.floor(mDmg * 1.35);
                                }

                                let ns = { ...gameState };
                                ns.mana = Math.max(0, ns.mana - 15);

                                const updated = gridCombat.combatants.map(c => {
                                  if (c.id === "enemy-1") {
                                    const finalHp = Math.max(0, c.hp - mDmg);
                                    const isDead = finalHp <= 0;
                                    return { ...c, hp: finalHp, isDead };
                                  }
                                  if (c.id === activeActor.id) {
                                    return { ...c, ap: c.ap - 1 };
                                  }
                                  return c;
                                });

                                ns.combatState!.enemyHp = updated.find(c => c.id === "enemy-1")?.hp || 0;
                                setGameState(ns);

                                setGridCombat(prev => prev ? {
                                  ...prev,
                                  combatants: updated,
                                  turnLog: `🔮 ETHER SPELL BURST: Cast Spell Slash on ${enemy.name}! Dealt ${mDmg} armor-bypassing magic damage. (-15 Mana)`
                                } : null);

                                triggerToast("SPELL DISCHARGED");
                              }}
                              className="flex-1 md:flex-initial bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-300 font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              🔮 Spell Plasma [-15 Mana]
                            </button>

                            {/* Mindmancer Spells (Strictly locked if not reached) */}
                            {!!(gameState?.skills?.mindmancer && gameState.skills.mindmancer > 0 && !["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district)) && (
                              <button
                                onClick={() => {
                                  if (!gameState) return;
                                  const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                  if (!activeActor || activeActor.ap < 1) {
                                    triggerToast("NO AP");
                                    return;
                                  }
                                  if (gameState.mana < 20) {
                                    triggerToast("INSUFFICIENT ETHER");
                                    return;
                                  }

                                  const enemy = gridCombat.combatants.find(c => c.id === "enemy-1");
                                  if (!enemy || enemy.isDead) return;

                                  let ns = { ...gameState };
                                  ns.mana = Math.max(0, ns.mana - 20);

                                  const updated = gridCombat.combatants.map(c => {
                                    if (c.id === "enemy-1") {
                                      const finalHp = Math.max(0, c.hp - 50);
                                      const isDead = finalHp <= 0;
                                      return { ...c, hp: finalHp, isDead };
                                    }
                                    if (c.id === activeActor.id) {
                                      return { ...c, ap: c.ap - 1 };
                                    }
                                    return c;
                                  });

                                  ns.combatState!.enemyHp = updated.find(c => c.id === "enemy-1")?.hp || 0;
                                  setGameState(ns);

                                  setGridCombat(prev => prev ? {
                                    ...prev,
                                    combatants: updated,
                                    turnLog: `🔮 MIND PSYCHIC HYPNOSIS: Bending ${enemy.name}'s synaptic currents. Forced system discharge dealing 50 damage! (-20 Mana)`
                                  } : null);
                                  triggerToast("MIND HACK COMPLETE");
                                }}
                                className="flex-1 md:flex-initial bg-fuchsia-950/40 hover:bg-fuchsia-900 border border-fuchsia-500/40 text-fuchsia-300 font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider animate-pulse shadow-[0_0_8px_rgba(217,70,239,0.25)]"
                              >
                                🧠 Mind Hack [-20 Mana]
                              </button>
                            )}

                            {/* Stimpack Consumable */}
                            <button
                              onClick={() => {
                                if (!gameState) return;
                                const activeActor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!activeActor || activeActor.ap < 1) {
                                  triggerToast("NO AP");
                                  return;
                                }

                                if (!gameState.inventory.includes("Nano Med-Stim (Heal)")) {
                                  triggerToast("NO MED-STIM IN INVENTORY DECK");
                                  return;
                                }

                                let ns = { ...gameState };
                                ns.inventory = ns.inventory.filter((item, idx) => idx !== ns.inventory.indexOf("Nano Med-Stim (Heal)"));

                                const updated = gridCombat.combatants.map(c => {
                                  if (c.id === activeActor.id) {
                                    return { ...c, hp: Math.min(c.maxHp, c.hp + 60), ap: c.ap - 1 };
                                  }
                                  return c;
                                });

                                ns.hp = updated.find(c => c.id === "player")?.hp || ns.hp;
                                setGameState(ns);

                                setGridCombat(prev => prev ? {
                                  ...prev,
                                  combatants: updated,
                                  turnLog: `💊 STIMPACK DETONATED: ${activeActor.name} injected medical nano-sealants, restoring +60 HP!`
                                } : null);
                                triggerToast("STIMPACK CONSUMED");
                              }}
                              className="flex-1 md:flex-initial bg-amber-950/30 hover:bg-amber-900 border border-amber-500/30 text-amber-300 font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              💊 Consume Stimpack
                            </button>

                            <button
                              onClick={() => {
                                // Advance the turn queue
                                setGridCombat(prev => {
                                  if (!prev) return null;
                                  
                                  const updatedCombatants = prev.combatants.map(c => {
                                    const activeId = prev.turnOrder[prev.currentTurnIdx];
                                    if (c.id === activeId) {
                                      return { ...c, ap: c.maxAp };
                                    }
                                    return c;
                                  });

                                  let nextIdx = prev.currentTurnIdx;
                                  let foundAlive = false;
                                  let iterations = 0;

                                  while (iterations < prev.turnOrder.length) {
                                    nextIdx = (nextIdx + 1) % prev.turnOrder.length;
                                    const nextId = prev.turnOrder[nextIdx];
                                    const actor = updatedCombatants.find(c => c.id === nextId);
                                    if (actor && !actor.isDead) {
                                      foundAlive = true;
                                      break;
                                    }
                                    iterations++;
                                  }

                                  if (!foundAlive) return prev;

                                  const nextActor = updatedCombatants.find(c => c.id === prev.turnOrder[nextIdx])!;
                                  return {
                                    ...prev,
                                    combatants: updatedCombatants,
                                    currentTurnIdx: nextIdx,
                                    selectedAction: "move" as const,
                                    turnLog: `Turn advanced to ${nextActor.name}. AP fully restored.`
                                  };
                                });
                                triggerToast("TURN ENDED");
                              }}
                              className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-mono font-black text-3xs px-4 py-3 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                            >
                              ⏱️ End Turn
                            </button>
                          </div>
                        ) : (
                          /* Enemy AI Resolution panel */
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-red-950/20 border border-red-500/10 p-3 rounded-xl">
                            <span className="text-rose-400 font-mono text-3xs uppercase tracking-widest font-black animate-pulse flex items-center gap-1">
                              ⚠️ HOSTILE ACTION DETECTED: {gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx])?.name} IS FORMULATING ACTION PLANS...
                            </span>
                            <button
                              onClick={() => {
                                // Run enemy AI
                                const actor = gridCombat.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
                                if (!actor || actor.isDead) return;

                                // Find closest player-team target
                                const targets = gridCombat.combatants.filter(c => c.team === "player" && !c.isDead);
                                if (targets.length === 0) return;

                                let closestTarget = targets[0];
                                let minDist = 999;
                                targets.forEach(t => {
                                  const d = Math.abs(t.x - actor.x) + Math.abs(t.y - actor.y);
                                  if (d < minDist) {
                                    minDist = d;
                                    closestTarget = t;
                                  }
                                });

                                setGridCombat(prev => {
                                  if (!prev) return null;
                                  
                                  let updatedCombatants = prev.combatants.map(c => ({ ...c }));
                                  const livingActor = updatedCombatants.find(c => c.id === actor.id)!;
                                  let currentTarget = updatedCombatants.find(c => c.id === closestTarget.id)!;

                                  let movementLog = "";
                                  let attackLog = "";

                                  // If out of attack range, move closer!
                                  if (minDist > livingActor.range) {
                                    // Pathing approximation: search cells within Manhattan distance 2
                                    let bestX = livingActor.x;
                                    let bestY = livingActor.y;
                                    let closestDistAfterMove = minDist;

                                    const COMBAT_OBSTACLES = [[2, 1], [2, 4], [5, 2], [5, 3], [3, 0], [4, 5]];
                                    const isObstacle = (cx: number, cy: number) => COMBAT_OBSTACLES.some(([ox, oy]) => ox === cx && oy === cy);

                                    for (let dx = -2; dx <= 2; dx++) {
                                      for (let dy = -2; dy <= 2; dy++) {
                                        if (Math.abs(dx) + Math.abs(dy) <= 2) {
                                          const tx = livingActor.x + dx;
                                          const ty = livingActor.y + dy;

                                          // Bounds check
                                          if (tx >= 0 && tx < 8 && ty >= 0 && ty < 6) {
                                            const occupied = updatedCombatants.some(c => c.x === tx && c.y === ty && !c.isDead);
                                            if (!occupied && !isObstacle(tx, ty)) {
                                              const newD = Math.abs(tx - currentTarget.x) + Math.abs(ty - currentTarget.y);
                                              if (newD < closestDistAfterMove) {
                                                closestDistAfterMove = newD;
                                                bestX = tx;
                                                bestY = ty;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }

                                    livingActor.x = bestX;
                                    livingActor.y = bestY;
                                    livingActor.ap -= 1;
                                    movementLog = `${livingActor.name} maneuvers to [${bestX}, ${bestY}]. `;
                                    
                                    // Re-evaluate distance
                                    minDist = Math.abs(bestX - currentTarget.x) + Math.abs(bestY - currentTarget.y);
                                  }

                                  // If in range, attack!
                                  if (minDist <= livingActor.range && livingActor.ap > 0) {
                                    const enemyDmg = livingActor.damage + Math.floor(Math.random() * 5) - 2;
                                    
                                    if (currentTarget.shields > 0) {
                                      currentTarget.shields -= enemyDmg;
                                      if (currentTarget.shields < 0) {
                                        currentTarget.hp += currentTarget.shields;
                                        currentTarget.shields = 0;
                                      }
                                    } else {
                                      currentTarget.hp -= enemyDmg;
                                    }

                                    currentTarget.hp = Math.max(0, currentTarget.hp);
                                    currentTarget.isDead = currentTarget.hp <= 0;
                                    livingActor.ap -= 1;
                                    attackLog = `💥 ${livingActor.name} attacks ${currentTarget.name} dealing ${enemyDmg} damage directly!`;
                                  }

                                  // Reset actor's AP on turn end
                                  livingActor.ap = livingActor.maxAp;

                                  // Sync health to main state
                                  const mainPlayer = updatedCombatants.find(c => c.id === "player")!;
                                  if (gameState) {
                                    let ns = { ...gameState };
                                    ns.hp = mainPlayer.hp;
                                    setGameState(ns);
                                  }

                                  // Check defeat
                                  if (mainPlayer.hp <= 0) {
                                    return {
                                      ...prev,
                                      combatants: updatedCombatants,
                                      turnLog: `☠️ Player fell in combat! Conflict concluded.`
                                    };
                                  }

                                  // Advance turn queue
                                  let nextIdx = prev.currentTurnIdx;
                                  let foundAlive = false;
                                  let iterations = 0;

                                  while (iterations < prev.turnOrder.length) {
                                    nextIdx = (nextIdx + 1) % prev.turnOrder.length;
                                    const nextId = prev.turnOrder[nextIdx];
                                    const actorInQueue = updatedCombatants.find(c => c.id === nextId);
                                    if (actorInQueue && !actorInQueue.isDead) {
                                      foundAlive = true;
                                      break;
                                    }
                                    iterations++;
                                  }

                                  const nextActor = updatedCombatants.find(c => c.id === prev.turnOrder[nextIdx])!;
                                  const actionSum = movementLog || attackLog 
                                    ? `${movementLog}${attackLog}`
                                    : `${livingActor.name} bypassed tactical action.`;

                                  return {
                                    ...prev,
                                    combatants: updatedCombatants,
                                    currentTurnIdx: nextIdx,
                                    selectedAction: "move" as const,
                                    turnLog: `🤖 AI MOVE: ${actionSum} Turn passed to ${nextActor.name}.`
                                  };
                                });

                                triggerToast("ENEMY ACTION SOLVED");
                              }}
                              className="bg-red-500 hover:bg-red-400 text-slate-950 font-mono font-black text-3xs px-4 py-2 rounded-lg cursor-pointer transition-all uppercase tracking-wider animate-pulse ml-auto"
                            >
                              Let Enemy Act
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (!gameState) return;
                            if (Math.random() > 0.4) {
                              let nextState = { ...gameState };
                              nextState.combatState = null;
                              setGameState(nextState);
                              setGridCombat(null);
                              setLogs(prev => [
                                ...prev,
                                {
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  text: `🏃 ESCAPE DEPLOYED: You deploy active cloaking mesh and successfully broke contact back to security corridors.`,
                                  type: "narration",
                                  district: nextState.district,
                                  poi: nextState.poi
                                }
                              ]);
                              triggerToast("FLED COMBAT");
                            } else {
                              setGridCombat(prev => prev ? {
                                ...prev,
                                turnLog: "❌ EVASION REFUSED: Hostile interceptors block your flight path coordinates!"
                              } : null);
                              triggerToast("FLEE FAILED");
                            }
                          }}
                          className="w-full md:w-auto bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-mono font-black text-3xs px-4 py-3.5 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Attempt Flee
                        </button>
                      </div>

                      {/* Tactical overlays: Defeat / Victory Check screens */}
                      {/* Player dead overlay */}
                      {gridCombat.combatants.find(c => c.id === "player")?.isDead && (
                        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-30 font-mono">
                          <span className="text-red-500 font-black text-3xl animate-bounce select-none">☠️ VITALS SHATTERED ☠️</span>
                          <p className="text-slate-400 text-3xs max-w-sm uppercase leading-relaxed">
                            Your bio-signatures flatlined in the grid database! Tactical shield matrices failed completely. Initiating emergency safehouse rescue protocol...
                          </p>
                          <button
                            onClick={() => {
                              if (!gameState) return;
                              let nextState = { ...gameState };
                              let narrative = "";
                              if (["conduit09", "shatter_ridge_core", "data_vault"].includes(nextState.district)) {
                                nextState.hp = nextState.maxHp;
                                nextState.mana = nextState.maxMana;
                                nextState.combatState = null;
                                narrative = `☠️ CRITICAL OVERLOAD: Your bio-signatures flatlined in the catacombs! Fortunately, your squad-mate Vice injected an adrenaline micro-dose, resetting your critical vitals and dragging you back to safety. Let's try again!`;
                              } else {
                                const penalty = Math.floor(nextState.credits * 0.15);
                                nextState.credits -= penalty;
                                nextState.hp = 25;
                                nextState.poi = "Main Headquarters (The Hideout)";
                                nextState.district = "aurus";
                                setActiveRegionId("aurus");
                                setActivePOIView("hideout");
                                nextState.combatState = null;
                                narrative = `☠️ SYSTEM OVERRIDE TRAUMA: Bio-signatures flatlined in battle! Your emergency backup beacon auto-teleported your frame to Hideout medical bay. -${penalty}¤ Trauma deduction.`;
                              }

                              setGameState(nextState);
                              setGridCombat(null);
                              setLogs(prev => [
                                ...prev,
                                {
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  text: narrative,
                                  type: "system",
                                  district: nextState.district,
                                  poi: nextState.poi
                                }
                              ]);
                              triggerToast("BATTLE OVER: HEALED");
                            }}
                            className="bg-red-500 hover:bg-red-400 text-slate-950 font-black px-6 py-3 rounded-lg text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          >
                            Activate Auto-Rescue Beacon & Re-awaken
                          </button>
                        </div>
                      )}

                      {/* Enemies all dead victory overlay */}
                      {gridCombat.combatants.filter(c => c.team === "enemy" && !c.isDead).length === 0 && (
                        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-30 font-mono">
                          <span className="text-emerald-400 font-black text-3xl animate-pulse select-none">★ THREAT ELIMINATED ★</span>
                          <p className="text-slate-400 text-3xs max-w-sm uppercase leading-relaxed">
                            Airlock clear! All hostile signature feeds have been terminated. Recovery protocols have completed scanning.
                          </p>
                          <button
                            onClick={() => {
                              if (!gameState) return;
                              let nextState = { ...gameState };
                              const playerCombatant = gridCombat.combatants.find(c => c.id === "player");
                              if (playerCombatant) {
                                nextState.hp = playerCombatant.hp;
                              }
                              
                              const rewardC = Math.floor(Math.random() * 51) + 75; // 75-125
                              const expGained = 45;
                              nextState.credits += rewardC;
                              nextState.experience += expGained;

                              let narrative = `★ THREAT EXTERMINATED: You successfully cleared the area in tactical grid combat! Recovered +${rewardC}¤ and earned +${expGained} XP!`;

                              const enemyName = gameState.combatState?.enemyName || "";
                              if (enemyName.includes("Drone") || enemyName.includes("Sentry")) {
                                nextState.district = "data_vault";
                                nextState.poi = "Sanctuary Hacking Terminal";
                                setActiveRegionId("data_vault");
                                setActivePOIView("terminal_hacking_puzzle");
                                nextState.activeQuests = ["Prologue: Data Vault Sanctuary - Hack the cyber-vault terminal to steal corporate data crystals from Ares Biotech."];
                                narrative += `\n\n🛡️ SECURITY BYPASSED: The security drones spark and crash to the floor! Vice gestures to a heavy floor industrial lift elevator: 'Move, recruit! Before they lock down the entire sector! Get inside the core vault chamber.' You travel to the Data Vault Sanctuary.`;
                              }
                              else if (enemyName.includes("Enforcer") || enemyName.includes("Ambush") || enemyName.includes("Commander")) {
                                nextState.poi = "Mysterious Relic Altar";
                                setActivePOIView("relic_altar");
                                setActiveDialogue("post_combat_tracker");
                                nextState.activeQuests = ["Prologue: Interrogate captured Ares Security Officer, make him override locks, and salvage Tracker's gear to escape."];
                                narrative += `\n\n🛡️ AMBUSH SURVIVED: The smoke clears. Tracker lies lifeless near the breached blast door, killed in the opening gunfight. You and the wounded Vice have cornered the surviving Ares Security Officer! Interrogate him above to discover an escape route and override the sector blast doors.`;
                              }
                              else if (enemyName.includes("Behemoth") && nextState.activeQuests.some(q => q.includes("Corporate Hunt"))) {
                                nextState.inventory.push("Acid Beast Core");
                                nextState.activeQuests = nextState.activeQuests.filter(q => !q.includes("Corporate Hunt"));
                                nextState.activeQuests.push("Objective: Deliver the 'Acid Beast Core' to Chancellor Aria at Apex Armory.");
                                narrative += "\n\n🎒 OBJECTIVE COLLECTED: Dislodged the rare green pulsating 'Acid Beast Core'. Advance to Chancellor Aria to deliver the asset.";
                              }

                              if (nextState.experience >= 100) {
                                nextState.level += 1;
                                nextState.experience -= 100;
                                nextState.maxHp += 20;
                                nextState.maxMana += 15;
                                nextState.hp = nextState.maxHp;
                                nextState.mana = nextState.maxMana;
                                narrative += `\n\n📶 SYSTEM LEVEL EXPANDED: Congratulations! Ascended to Level ${nextState.level}. Max health and mana stats fully restored!`;
                              }

                              nextState.combatState = null;
                              setGameState(nextState);
                              setGridCombat(null);
                              setLogs(prev => [
                                ...prev,
                                {
                                  id: crypto.randomUUID(),
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  text: narrative,
                                  type: "system",
                                  district: nextState.district,
                                  poi: nextState.poi
                                }
                              ]);
                              triggerToast("BATTLE CLEAR: VICTORY!");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-lg text-xs uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          >
                            Download Reward Chips & Proceed
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* THE HISTORIC RPG NARRATIVE CORE TERMINAL (LOGS CONSOLE) */}
                {/* DE-CLUTTERED COLLAPSIBLE CYBERDECK TRANSMISSION FEED */}
                {!gameState.combatState?.isActive && (
                  <div className="glass-panel rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="font-mono text-3xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Terminal size={14} className="text-cyan-400 animate-pulse" />
                        Cyberdeck Console Transmission Feed
                      </span>
                      <button
                        onClick={() => setExpandLogs(!expandLogs)}
                        className="text-4xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 px-2 py-1 rounded bg-slate-950/40 cursor-pointer transition-all hover:bg-slate-900 font-black uppercase"
                      >
                        {expandLogs ? "[-] COLLAPSE BACKLOG" : "[+] EXPAND HISTORY"}
                      </button>
                    </div>

                    {/* Narrative Scroll panel block */}
                    <div 
                      className={`bg-slate-950/60 rounded-xl p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-3.5 border border-white/5 relative box-glow-cyan transition-all duration-300 ${
                        expandLogs ? "h-[260px]" : "h-[90px]"
                      }`}
                    >
                      {(expandLogs ? logs : logs.slice(-2)).map((log) => (
                        <div key={log.id} className="text-left transition-all">
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 tracking-wider mb-0.5 leading-none font-bold">
                            <span>[{log.timestamp}]</span>
                            {log.poi && <span className="text-cyan-500/75 uppercase">@{log.poi.replace("Main Headquarters ", "")}</span>}
                            
                            {log.type === "action" && <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/10 px-1 py-0.2 rounded text-[8px] uppercase">OPERATIVE</span>}
                            {log.type === "combat" && <span className="bg-rose-950 text-rose-400 border border-rose-500/10 px-1 py-0.2 rounded text-[8px] uppercase">TACTICAL</span>}
                            {log.type === "system" && <span className="bg-slate-900 text-slate-300 border border-white/10 px-1 py-0.2 rounded text-[8px] uppercase">SYSTEM</span>}
                          </div>
                          <p
                            className={`whitespace-pre-line text-xs tracking-wide leading-relaxed pl-1 pl-1 ${
                              log.type === "action"
                                ? "text-cyan-300 font-bold"
                                : log.type === "combat"
                                  ? "text-rose-400"
                                  : log.type === "system"
                                    ? "text-amber-200"
                                    : "text-slate-300 font-sans leading-relaxed text-2xs"
                            }`}
                          >
                            {log.text}
                          </p>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}

              </div>
            )}

              {/* RIGHT COLUMN (12/12): PLAYER STATS DECK, INVENTORY, COMPANIONS AND ACTIVE TASKS */}
              {gameTab === "database" && (
                <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* CHARACTER SHEET PROFILE CARD */}
                  <div className="lg:col-span-4 flex flex-col gap-6 font-mono text-left animate-fadeIn">
                    {/* Bio block */}
                    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-cyan-500/10 flex flex-col gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl -mr-8 -mt-8" />
                      
                      <div className="flex items-center gap-3">
                        {gameState.playerAvatarUrl ? (
                          <img
                            src={gameState.playerAvatarUrl}
                            alt="Operative"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
                            {(gameState.playerName || gameState.archetype || "Cyber-Blade")[0]}
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-black leading-none block">GRID OPERATIVE IDENT</span>
                          <h3 className="text-white font-black text-sm uppercase mt-1 leading-none">{gameState.playerName || gameState.archetype || "Rookie"}</h3>
                          <div className="text-[10px] uppercase font-bold text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="text-cyan-400">{gameState.playerRace || "Human"}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-rose-400">{gameState.archetype || "Cyber-Blade"}</span>
                          </div>
                          <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-1 font-sans">
                            Age: {gameState.playerAge || 24} • BG: {gameState.playerBackground || "Street Rat"}
                          </p>
                          <span className="text-slate-500 text-[9px] uppercase tracking-wider block mt-1">LVL {gameState.level ?? 1} • EXP {gameState.experience ?? 0}/100</span>
                        </div>
                      </div>

                      {/* Customized Perks Section */}
                      {gameState.playerPerks && gameState.playerPerks.length > 0 && (
                        <div className="bg-slate-950/60 border border-white/5 p-2 rounded-lg text-left mt-1">
                          <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-1">🧠 INSTALLED PERKS</span>
                          <div className="flex flex-col gap-1">
                            {gameState.playerPerks.map((pKey) => {
                              const perkNames: Record<string, string> = {
                                "adrenaline_junkie": "Adrenaline Junkie (+15% Melee Low-HP)",
                                "cyber_optimizer": "Cyber-Optimizer (+10 Starting Shields)",
                                "ether_conduit": "Ether Conduit (+2 MP/Turn)",
                                "hardened_chassis": "Hardened Chassis (+20 Max HP)",
                                "lucky_jack": "Lucky Jack (+40 starting credits)"
                              };
                              return (
                                <span key={pKey} className="text-[9px] text-slate-300 font-sans flex items-center gap-1">
                                  <span className="text-cyan-500">◈</span> {perkNames[pKey] || pKey}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3.5 border-t border-white/5 pt-4">
                        {/* HP Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-3xs">
                            <span className="text-rose-400 font-extrabold uppercase flex items-center gap-1"><Heart size={10} /> INTEGRITY STATUS (HP)</span>
                            <span className="text-white font-bold">{gameState.hp} / {derived.maxHp}</span>
                          </div>
                          <div className="h-2 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all duration-300"
                              style={{ width: `${Math.min(100, (gameState.hp / derived.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* MP Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-3xs">
                            <span className="text-cyan-400 font-extrabold uppercase flex items-center gap-1"><Zap size={10} /> ENERGY COGNITION (MP)</span>
                            <span className="text-white font-bold">{gameState.mana} / {derived.maxMana}</span>
                          </div>
                          <div className="h-2 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-300"
                              style={{ width: `${Math.min(100, (gameState.mana / derived.maxMana) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* XP Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-3xs">
                            <span className="text-indigo-400 font-extrabold uppercase flex items-center gap-1"><Award size={10} /> NEURAL INTEGRATION (XP)</span>
                            <span className="text-white font-bold">{gameState.experience ?? 0}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden p-0.5">
                            <div 
                              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                              style={{ width: `${gameState.experience ?? 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Level and Credits */}
                        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3 text-3xs">
                          <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                            <span className="text-slate-500 uppercase block font-bold">LEDGER CASH</span>
                            <p className="text-amber-400 font-black text-xs uppercase mt-0.5">{gameState.credits}¤</p>
                          </div>
                          <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                            <span className="text-slate-500 uppercase block font-bold">TEAM PARTY SIZE</span>
                            <p className="text-white font-black text-xs uppercase mt-0.5">{gameState.party.length + 1} SQUAD</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CORE ATTRIBUTES & SKILL TREES */}
                    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-4 font-mono">
                      <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                        <span className="text-slate-400 text-3xs uppercase font-black tracking-widest flex items-center gap-1.5">
                          🛡️ Core Attribute Matrices
                        </span>
                        <span className="text-[9px] text-cyan-400 font-extrabold uppercase">LEVEL UP FOR +PTS</span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">STR</span>
                          <span className="text-xs text-white font-black">{derived.str}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">DEX</span>
                          <span className="text-xs text-white font-black">{derived.dex}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">INT</span>
                          <span className="text-xs text-white font-black">{derived.int}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">WILL</span>
                          <span className="text-xs text-white font-black">{derived.will}</span>
                        </div>
                        <div className="bg-slate-950/60 p-1.5 rounded border border-white/5">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">ETH</span>
                          <span className="text-xs text-cyan-400 font-black">{derived.eth}</span>
                        </div>
                      </div>

                      <div className="border-b border-white/10 pb-1 mt-1 flex justify-between items-center">
                        <span className="text-slate-400 text-3xs uppercase font-black tracking-widest flex items-center gap-1.5">
                          📶 ACTIVE SKILL TREES
                        </span>
                      </div>

                      <div className="space-y-2 text-3xs font-mono">
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">⚔️ Cyber-Blade (Melee)</span>
                          <span className="text-cyan-400 font-black">LVL {gameState.skills?.cyberBlade ?? 1}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">💾 Net-Slicer (Hacking)</span>
                          <span className="text-cyan-400 font-black">LVL {gameState.skills?.netSlicer ?? 1}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">🛡️ Heavy Chrome (Defense)</span>
                          <span className="text-cyan-400 font-black">LVL {gameState.skills?.heavyChrome ?? 1}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-slate-950/40 rounded border border-white/5">
                          <span className="text-slate-300 font-bold uppercase">🔮 MINDMANCER (Psychic)</span>
                          <span className={`font-black ${gameState.skills?.mindmancer ? "text-purple-400" : "text-slate-600 animate-pulse"}`}>
                            {gameState.skills?.mindmancer ? `LVL ${gameState.skills.mindmancer}` : "LOCKED [PROLOGUE]"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIVE HARWARE & CHROME EQUIPMENT STATUS */}
                    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-3 font-mono">
                      <span className="text-slate-400 text-3xs uppercase font-black tracking-widest border-b border-white/10 pb-2 flex items-center gap-1.5">
                        <Shield size={12} className="text-cyan-400" /> Active Hardware Uplinks
                      </span>
                      <div className="space-y-2 text-3xs">
                        {(["meleeWeapon", "rangedWeapon", "armor", "headpiece", "trinket"] as const).map((slot) => {
                          const equippedItem = gameState.equipment?.[slot];
                          const details = equippedItem ? ITEM_METADATA[equippedItem] : null;
                          const slotLabel = slot === "meleeWeapon" ? "MELEE WEAPON" : slot === "rangedWeapon" ? "RANGED WEAPON" : slot;

                          return (
                            <div key={slot} className="p-2.5 bg-slate-950/60 border border-white/5 rounded-lg flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 uppercase font-bold tracking-wider text-[9px]">{slotLabel.toUpperCase()} SLOT</span>
                                {equippedItem && (
                                  <button
                                    onClick={() => handleUnequipItem(slot)}
                                    className="bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-4xs uppercase px-1.5 py-0.5 rounded cursor-pointer transition-all font-bold"
                                  >
                                    Unequip
                                  </button>
                                )}
                              </div>
                              {equippedItem ? (
                                <div>
                                  <p className="font-extrabold text-cyan-400 uppercase text-2xs leading-none">{equippedItem}</p>
                                  {details?.desc && (
                                    <p className="text-slate-400 text-[10px] font-sans leading-tight mt-1">{details.desc}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-slate-600 italic text-[10px]">No {slotLabel} equipped. Find and equip one from your inventory.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SENSORY WORLDCLOCK DATE COMPONENT */}
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-left font-mono text-3xs text-slate-500 space-y-2.5 relative">
                      <div className="flex justify-between items-center text-slate-400 text-2xs leading-none">
                        <span className="flex items-center gap-1 uppercase font-bold text-cyan-400">
                          <Clock size={12} /> Temporal State
                        </span>
                        <span className="text-[10px] text-white font-bold bg-white/5 px-2 py-0.5 rounded uppercase">
                          DAY {gameState.day ?? 1} • {gameState.timeOfDay || "Morning"}
                        </span>
                      </div>
                      <p className="leading-snug">
                        Time progresses on regional transit travels or medical recuperations. Server crews pay dividends every morning. Safe operations require consistent parameters monitoring.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN DATABASE HUD */}
                  <div className="lg:col-span-8 flex flex-col gap-6 animate-fadeIn">

                    {/* ADVANCED EQUIP DECK HUD */}
                    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col gap-4">
                  <div className="flex border-b border-white/15 text-xs font-mono">
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className={`flex-1 pb-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold ${
                        activeTab === "inventory" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Briefcase size={12} /> Stash
                    </button>
                    <button
                      onClick={() => setActiveTab("companions")}
                      className={`flex-1 pb-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold ${
                        activeTab === "companions" ? "text-rose-400 border-b-2 border-rose-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Users size={12} /> Mercs
                    </button>
                    <button
                      onClick={() => setActiveTab("quests")}
                      className={`flex-1 pb-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-bold ${
                        activeTab === "quests" ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Award size={12} /> Quests
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    
                    {/* TAB SLOT A: EQUIPMENT AND INVENTORY ITEMS */}
                    {activeTab === "inventory" && (
                      <motion.div
                        key="inventory-tab"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="space-y-4"
                      >
                        {/* Interactive local shop purchase options inside detailed views */}
                        {activePOIView && MAP_POIS.find(p => p.id === activePOIView)?.type === "shop" && (
                          <div className="bg-cyan-950/20 border border-cyan-400/15 p-3 rounded-lg space-y-3 font-mono">
                            <span className="text-[9px] text-cyan-400 font-extrabold tracking-wider uppercase block">
                              AVAILABLE IN-STORE HARDWARE:
                            </span>
                            <div className="space-y-2.5">
                              {getShopItemsForPOI(activePOIView).map((item) => {
                                const alreadyIn = gameState.inventory.includes(item.name);
                                return (
                                  <div key={item.name} className="flex justify-between items-center text-3xs border-b border-white/5 pb-2">
                                    <div className="text-left w-2/3 flex items-start gap-1.5">
                                      <div className="mt-0.5 shrink-0">
                                        {getItemIcon(item.name, ITEM_METADATA[item.name]?.slot)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-white uppercase">{item.name}</p>
                                        <p className="text-[8.5px] text-slate-400 font-sans mt-0.5 leading-none">{item.desc}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleBuyItemDirectly(item)}
                                      disabled={alreadyIn}
                                      className={`px-2 py-1.5 rounded font-black cursor-pointer uppercase ${
                                        alreadyIn
                                          ? "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed"
                                          : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                                      }`}
                                    >
                                      {alreadyIn ? "In Stash" : `${item.cost}¤`}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 text-left font-mono text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Your Gear Locker Slots</p>
                            
                            {/* Filter Chips */}
                            <div className="flex flex-wrap gap-1">
                              {(["all", "weapons", "cyberware", "consumables", "valuables"] as const).map((filter) => (
                                <button
                                  key={filter}
                                  onClick={() => setStashFilter(filter)}
                                  className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider transition-all font-bold border cursor-pointer ${
                                    stashFilter === filter
                                      ? "bg-cyan-500 text-slate-950 border-cyan-400"
                                      : "bg-slate-950/60 text-slate-400 hover:text-white border-white/5"
                                  }`}
                                >
                                  {filter}
                                </button>
                              ))}
                            </div>
                          </div>

                          {(() => {
                            const filteredInventory = [...gameState.inventory].filter(item => {
                              if (stashFilter === "all") return true;
                              if (stashFilter === "weapons") return item.toLowerCase().includes("blade") || item.toLowerCase().includes("laser") || item.toLowerCase().includes("fists");
                              if (stashFilter === "cyberware") return item.toLowerCase().includes("deck") || item.toLowerCase().includes("visor") || item.toLowerCase().includes("matrix") || item.toLowerCase().includes("core");
                              if (stashFilter === "consumables") return item.toLowerCase().includes("stim") || item.toLowerCase().includes("cell") || item.toLowerCase().includes("circuitry") || item.toLowerCase().includes("rusted");
                              if (stashFilter === "valuables") return !item.toLowerCase().includes("blade") && !item.toLowerCase().includes("laser") && !item.toLowerCase().includes("fists") && !item.toLowerCase().includes("deck") && !item.toLowerCase().includes("visor") && !item.toLowerCase().includes("matrix") && !item.toLowerCase().includes("core") && !item.toLowerCase().includes("stim") && !item.toLowerCase().includes("cell") && !item.toLowerCase().includes("circuitry") && !item.toLowerCase().includes("rusted");
                              return true;
                            }).sort((a, b) => a.localeCompare(b));

                            return filteredInventory.length === 0 ? (
                              <p className="p-4 bg-slate-950/60 border border-white/5 text-slate-600 rounded text-center text-2xs italic">
                                {stashFilter === "all" ? "Stash storage empty. Salvage districts to secure scrap chips." : `No items in category [${stashFilter}].`}
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2">
                                {filteredInventory.map((item, index) => {
                                  const isScrap = item === "Rusted Circuitry";
                                  const isStim = item.includes("Stim") || item.includes("Cell");
                                  const details = ITEM_METADATA[item];
                                  const isEquipable = details && ["meleeWeapon", "rangedWeapon", "armor", "headpiece", "trinket"].includes(details.slot);

                                  let subtitle = "System Inventory Item";
                                  if (isScrap) subtitle = "Recycle Scavenge Scrap";
                                  else if (isStim) subtitle = "Combat Injector";
                                  else if (details && details.slot) {
                                    const slotDisplay = details.slot === "meleeWeapon" ? "MELEE WEAPON" : details.slot === "rangedWeapon" ? "RANGED WEAPON" : details.slot;
                                    subtitle = `${slotDisplay.toUpperCase()} HARDWARE`;
                                  }

                                  const rarity = details?.rarity || "common";

                                  return (
                                    <div
                                      key={index}
                                      className={`p-3.5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all border ${
                                        rarity === "legendary"
                                          ? "bg-amber-950/10 border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                                          : rarity === "epic"
                                            ? "bg-purple-950/10 border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                            : rarity === "deluxe"
                                              ? "bg-blue-950/10 border-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                              : "bg-slate-950/80 border-white/10 hover:border-white/20"
                                      }`}
                                    >
                                      <div className="text-left w-full sm:w-auto">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className={`font-black text-xs uppercase leading-none tracking-tight flex items-center gap-1.5 ${
                                            rarity === "legendary"
                                              ? "text-amber-400"
                                              : rarity === "epic"
                                                ? "text-purple-400"
                                                : rarity === "deluxe"
                                                  ? "text-blue-400"
                                                  : "text-slate-200"
                                          }`}>
                                            {getItemIcon(item, details?.slot)}
                                            <span>{item}</span>
                                          </p>
                                          
                                          {details?.rarity && (
                                            <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                              rarity === "legendary"
                                                ? "bg-amber-950/80 text-amber-300 border border-amber-500/20"
                                                : rarity === "epic"
                                                  ? "bg-purple-950/80 text-purple-300 border border-purple-500/20"
                                                  : rarity === "deluxe"
                                                    ? "bg-blue-950/80 text-blue-300 border border-blue-500/20"
                                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                            }`}>
                                              {rarity}
                                            </span>
                                          )}
                                        </div>
                                        
                                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                                          {subtitle}
                                        </p>
                                        
                                        {details?.desc && (
                                          <p className="text-slate-400 font-sans text-3xs mt-1.5 leading-snug max-w-md">
                                            {details.desc}
                                          </p>
                                        )}

                                        {details?.specialEffect && (
                                          <p className="text-rose-400 font-mono text-[9px] mt-1.5 bg-rose-950/10 border border-rose-500/10 rounded px-2 py-0.5 max-w-md flex items-center gap-1">
                                            <Sparkles size={10} className="shrink-0" />
                                            <span><strong>Effect:</strong> {details.specialEffect}</span>
                                          </p>
                                        )}
                                      </div>

                                      {/* Action items */}
                                      <div className="flex items-center gap-2 self-end sm:self-center">
                                        {isScrap && (
                                          <button
                                            onClick={handleRecycleScrapDirect}
                                            className="bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 text-3xs font-black uppercase px-2 py-1.5 rounded cursor-pointer"
                                          >
                                            Recycle (+30¤)
                                          </button>
                                        )}
                                        {isStim && (
                                          <button
                                            onClick={() => handleExecuteAction(`Consume ${item}`)}
                                            className="bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-3xs font-black uppercase px-2 py-1.5 rounded cursor-pointer animate-pulse"
                                          >
                                            Use
                                          </button>
                                        )}
                                        {isEquipable && (
                                          <button
                                            onClick={() => handleEquipItem(item)}
                                            className="bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-3xs font-black uppercase px-2.5 py-1.5 rounded cursor-pointer font-extrabold"
                                          >
                                            Equip
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          );
                        })()}
                      </div>

                        {/* General stats block summary */}
                        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg font-mono text-3xs text-left text-slate-400 space-y-1">
                          <p className="font-bold text-slate-300 uppercase">[Active Weapon Boosts]</p>
                          <p>• Alloy Weapon bonus: {gameState.inventory.includes("Apex Mantis electro-blade") ? "+25 Damage Slash Activated" : "+0 Base Damage (Find blade)"}</p>
                          <p>• Cyber hacker visor bonus: {gameState.inventory.includes("Smart-Targeting Visor") ? "+12 neural bypass bonus" : "+0 neural bypass (Find visor)"}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB SLOT B: COMPANION PARTY & BACKGROUND JOBS ENGINE */}
                    {activeTab === "companions" && (
                      <motion.div
                        key="companions-tab"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="space-y-4"
                      >
                        <p className="text-left font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold leading-none mb-1">
                          Hired Personnel database
                        </p>

                        <div className="space-y-2.5">
                          {(() => {
                            const isPrologue = ["conduit09", "shatter_ridge_core", "data_vault"].includes(gameState.district);
                            const filteredCompanions = gameState.companions.filter(comp => {
                              if (isPrologue) {
                                return comp.name === "Vice" || comp.name === "Tracker";
                              } else {
                                return comp.name !== "Vice" && comp.name !== "Tracker";
                              }
                            });

                            if (filteredCompanions.length === 0) {
                              return (
                                <p className="text-slate-500 text-center py-6 text-2xs italic border border-dashed border-white/5 rounded-lg">
                                  No companions currently recorded in this district sector database.
                                </p>
                              );
                            }

                            return filteredCompanions.map((comp) => {
                              const isHired = gameState.party.includes(comp.name);
                              const isWorking = comp.status === "working";
                              const isAvailable = comp.status === "available";

                              return (
                                <div
                                  key={comp.name}
                                  className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                                    isWorking
                                      ? "bg-amber-950/20 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                                      : isHired
                                        ? "bg-slate-950/80 border-cyan-500/20"
                                        : "bg-slate-950/40 border-white/5 opacity-80"
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-extrabold text-slate-200 uppercase flex items-center gap-1 text-2xs leading-none">
                                        {comp.name} <span className="text-3xs text-slate-500 font-normal">({comp.role})</span>
                                      </p>
                                      <p className="text-[9px] text-slate-500 mt-1 italic font-sans">{comp.bio}</p>
                                    </div>
                                    
                                    {/* Payout Tag */}
                                    {isWorking && (
                                      <span className="bg-amber-950 border border-amber-500/30 text-amber-300 font-black px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                                        WORK: +35¤/rest
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-3xs">
                                    {isAvailable && (
                                      <button
                                        onClick={() => {
                                          // Auto-travel to agency to hire
                                          setActivePOIView("agency");
                                          triggerToast(`Opening Nexus Agency desk to negotiate`);
                                        }}
                                        className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-2 py-1 rounded cursor-pointer"
                                      >
                                        Not Hired (Costs {comp.fee}¤)
                                      </button>
                                    )}

                                    {isHired && (
                                      <div className="flex flex-wrap gap-1.5">
                                        <button
                                          onClick={() => setEditingCompanionName(comp.name)}
                                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2 py-1 rounded cursor-pointer uppercase font-black"
                                        >
                                          ⚙️ Gear & Inv
                                        </button>
                                        <button
                                          onClick={() => handleTalkCompanion(comp)}
                                          className="bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                        >
                                          💬 Talk / Opinion
                                        </button>
                                        {!isPrologue && (
                                          <>
                                            <button
                                              onClick={() => handleAssignCompanionTask(comp.name, "Hacking Financial Databases")}
                                              className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                            >
                                              💼 Assign Job
                                            </button>
                                            <button
                                              onClick={() => handleDismissCompanion(comp.name)}
                                              className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 px-2 py-1 rounded cursor-pointer uppercase font-bold"
                                            >
                                              ❌ Dismiss
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {isWorking && (
                                      <button
                                        onClick={() => handleRecallCompanion(comp.name)}
                                        className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 px-2.5 py-1 rounded cursor-pointer uppercase"
                                      >
                                        Recall to Squad Team
                                      </button>
                                    )}

                                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">
                                      {comp.status.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </motion.div>
                    )}

                    {/* TAB SLOT C: QUEST LOG DIRECTIVE SCHEMAS */}
                    {activeTab === "quests" && (() => {
                      const allQuests = syncStructuredQuests(gameState);
                      
                      // Filter based on questFilter state
                      const filteredQuests = allQuests.filter(q => {
                        if (questFilter === "all") return q.status === "ACTIVE";
                        if (questFilter === "main") return q.category === "Main Quest" && q.status === "ACTIVE";
                        if (questFilter === "side") return q.category === "Side Quest" && q.status === "ACTIVE";
                        if (questFilter === "completed") return q.status === "COMPLETED";
                        return true;
                      });

                      // Select current selected quest or fallback
                      const currentQuest = filteredQuests.find(q => q.id === selectedQuestId) || filteredQuests[0] || allQuests[0];

                      return (
                        <motion.div
                          key="quests-tab"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-4 font-mono text-xs text-left"
                        >
                          {/* Filter Bar */}
                          <div className="flex flex-wrap items-center gap-1 bg-slate-950/60 p-1 border border-white/5 rounded-md">
                            {(["all", "main", "side", "completed"] as const).map((filter) => {
                              const isActive = questFilter === filter;
                              let count = 0;
                              if (filter === "all") count = allQuests.filter(q => q.status === "ACTIVE").length;
                              else if (filter === "main") count = allQuests.filter(q => q.category === "Main Quest" && q.status === "ACTIVE").length;
                              else if (filter === "side") count = allQuests.filter(q => q.category === "Side Quest" && q.status === "ACTIVE").length;
                              else if (filter === "completed") count = allQuests.filter(q => q.status === "COMPLETED").length;

                              return (
                                <button
                                  key={filter}
                                  onClick={() => {
                                    setQuestFilter(filter);
                                    // Reset selectedQuestId to first in list
                                    const nextQuests = allQuests.filter(q => {
                                      if (filter === "all") return q.status === "ACTIVE";
                                      if (filter === "main") return q.category === "Main Quest" && q.status === "ACTIVE";
                                      if (filter === "side") return q.category === "Side Quest" && q.status === "ACTIVE";
                                      if (filter === "completed") return q.status === "COMPLETED";
                                      return true;
                                    });
                                    if (nextQuests.length > 0) {
                                      setSelectedQuestId(nextQuests[0].id);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-3xs font-extrabold uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer ${
                                    isActive
                                      ? "bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                                      : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {filter === "all" && "All Active"}
                                  {filter === "main" && "Main Directives"}
                                  {filter === "side" && "Side Contracts"}
                                  {filter === "completed" && "Completed Logs"}
                                  <span className={`px-1 rounded text-[8px] ${isActive ? "bg-amber-600 text-amber-100" : "bg-slate-900 text-slate-500"}`}>
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Dual-Pane Layout */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left Pane: Quest List */}
                            <div className="md:col-span-5 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                              {filteredQuests.length === 0 ? (
                                <div className="p-8 bg-slate-950/70 border border-white/5 text-slate-600 rounded-lg text-center text-3xs italic flex flex-col items-center justify-center gap-2">
                                  <BookOpen size={16} className="text-slate-700" />
                                  <span>No orders found matching filter. Speak to Jax at Neon Abyss Bar for rebellion work.</span>
                                </div>
                              ) : (
                                filteredQuests.map((q) => {
                                  const isSelected = currentQuest?.id === q.id;
                                  const completedObjCount = q.objectives.filter(o => o.completed).length;
                                  const totalObjCount = q.objectives.length;
                                  
                                  let categoryColor = "border-amber-500/10 text-amber-400 bg-amber-950/10";
                                  let categoryLabel = "MAIN";
                                  if (q.category === "Side Quest") {
                                    categoryColor = "border-purple-500/10 text-purple-400 bg-purple-950/10";
                                    categoryLabel = "SIDE";
                                  }

                                  return (
                                    <button
                                      key={q.id}
                                      onClick={() => setSelectedQuestId(q.id)}
                                      className={`w-full text-left p-2.5 rounded-lg border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer relative ${
                                        isSelected
                                          ? "bg-slate-900/90 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)] text-white"
                                          : "bg-slate-950/50 border-white/5 text-slate-400 hover:bg-slate-900/40 hover:border-white/10"
                                      }`}
                                    >
                                      {/* Highlight Bar for selection */}
                                      {isSelected && (
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${q.category === "Main Quest" ? "bg-amber-500" : "bg-purple-500"}`} />
                                      )}

                                      <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${categoryColor}`}>
                                          {categoryLabel}
                                        </span>
                                        <span className="text-[8px] text-slate-500 tracking-wider font-extrabold uppercase">
                                          {completedObjCount}/{totalObjCount} OBJ
                                        </span>
                                      </div>

                                      <p className={`font-bold text-2xs truncate ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                                        {q.title}
                                      </p>

                                      {/* Mini Progress Bar */}
                                      <div className="w-full bg-slate-950 h-1 rounded overflow-hidden mt-0.5">
                                        <div 
                                          className={`h-full transition-all duration-300 ${q.category === "Main Quest" ? "bg-amber-500" : "bg-purple-500"}`}
                                          style={{ width: `${(completedObjCount / totalObjCount) * 100}%` }}
                                        />
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>

                            {/* Right Pane: Selected Quest Detail */}
                            <div className="md:col-span-7 bg-slate-950/60 border border-white/5 rounded-lg p-3.5 space-y-4 max-h-[380px] overflow-y-auto">
                              {currentQuest ? (
                                <div className="space-y-4">
                                  {/* Header block */}
                                  <div className="space-y-1 pb-2 border-b border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">
                                        [ {currentQuest.category.toUpperCase()} PROTOCOL ]
                                      </span>
                                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 ${
                                        currentQuest.status === "COMPLETED"
                                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20"
                                          : "bg-amber-950/80 text-amber-400 border border-amber-500/20 animate-pulse"
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${currentQuest.status === "COMPLETED" ? "bg-emerald-400" : "bg-amber-400"}`} />
                                        {currentQuest.status}
                                      </span>
                                    </div>
                                    <h3 className="text-sm font-black text-slate-200 tracking-tight leading-snug uppercase">
                                      {currentQuest.title}
                                    </h3>
                                  </div>

                                  {/* Narrative Description */}
                                  <div className="space-y-1">
                                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">MISSION REPORT / INTEL</span>
                                    <p className="p-3 bg-slate-950/90 border border-white/5 rounded text-3xs text-slate-400 leading-relaxed italic">
                                      {currentQuest.description}
                                    </p>
                                  </div>

                                  {/* Tactical Objectives */}
                                  <div className="space-y-2">
                                    <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">TACTICAL OBJECTIVES</span>
                                    <div className="space-y-2">
                                      {currentQuest.objectives.map((obj) => (
                                        <div key={obj.id} className="p-2.5 bg-slate-900/40 border border-white/5 rounded flex flex-col gap-1.5">
                                          <div className="flex items-start gap-2">
                                            {obj.completed ? (
                                              <CheckCircle size={12} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                                            ) : (
                                              <div className="w-3 h-3 rounded-sm border border-amber-500/40 flex-shrink-0 mt-0.5 flex items-center justify-center text-amber-400 text-[8px] font-extrabold bg-amber-950/10">
                                                <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping" />
                                              </div>
                                            )}
                                            <span className={`text-3xs leading-normal ${obj.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                                              {obj.text}
                                            </span>
                                          </div>
                                          {/* Counter/Progress bar for count objectives */}
                                          {obj.target > 1 && (
                                            <div className="pl-5 space-y-1">
                                              <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                                <span>PROGRESS LEDGER</span>
                                                <span className={obj.completed ? "text-cyan-400" : "text-amber-400"}>{obj.current} / {obj.target}</span>
                                              </div>
                                              <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                                                <div 
                                                  className={`h-full transition-all duration-300 ${obj.completed ? "bg-cyan-500" : "bg-amber-500"}`}
                                                  style={{ width: `${(obj.current / obj.target) * 100}%` }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Narrative Chronology Logs */}
                                  {currentQuest.log && currentQuest.log.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">MISSION CHRONOLOGY / LOGS</span>
                                      <div className="p-2.5 bg-slate-950/90 border border-white/5 rounded font-mono text-3xs text-slate-500 space-y-1 max-h-[100px] overflow-y-auto">
                                        {currentQuest.log.map((logLine, lIdx) => (
                                          <div key={lIdx} className="flex gap-1.5 leading-relaxed">
                                            <span className="text-slate-600 flex-shrink-0">›</span>
                                            <span>{logLine}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rewards block */}
                                  <div className="space-y-2 pt-1 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-extrabold">GRID SECURED REWARDS</span>
                                      {currentQuest.status === "COMPLETED" ? (
                                        <span className="text-[7px] text-cyan-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                                          <Check size={8} className="stroke-[3px]" /> REWARDS SYNCED TO LEDGER
                                        </span>
                                      ) : (
                                        <span className="text-[7px] text-amber-500/80 uppercase tracking-widest font-extrabold">
                                          INJECT TO DECK ON RESOLUTION
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {currentQuest.rewards.map((reward, rIdx) => {
                                        let icon = <Award size={10} className="text-amber-400" />;
                                        let label = "";
                                        if (reward.type === "credits") {
                                          icon = <Coins size={10} className="text-amber-400" />;
                                          label = `${reward.amount}¤ Credits`;
                                        } else if (reward.type === "experience") {
                                          icon = <Award size={10} className="text-cyan-400" />;
                                          label = `+${reward.amount} XP Units`;
                                        } else if (reward.type === "item") {
                                          icon = <Sparkles size={10} className="text-purple-400" />;
                                          label = `✦ ${reward.itemName}`;
                                        } else if (reward.type === "maxMana") {
                                          icon = <Zap size={10} className="text-sky-400" />;
                                          label = `+${reward.amount} Max Mana`;
                                        } else if (reward.type === "maxHp") {
                                          icon = <Heart size={10} className="text-rose-400" />;
                                          label = `+${reward.amount} Max HP`;
                                        }

                                        return (
                                          <div key={rIdx} className="p-2 bg-slate-900/70 border border-white/5 rounded flex items-center gap-2 text-3xs font-bold text-slate-300">
                                            {icon}
                                            <span className="truncate">{label}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-600 italic text-3xs gap-2">
                                  <Terminal size={24} className="text-slate-800 animate-pulse" />
                                  <span>SELECT DIRECTIVE TO INITIALIZE READOUT</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}

                  </AnimatePresence>

                </div>

              </div>

            </div>
          )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* COMPANION TALK TRANS-COMM OPINION DIALOG MODAL OVERLAY */}
        <AnimatePresence>
          {companionOpinion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono"
            >
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full relative shadow-[0_0_30px_rgba(6,182,212,0.15)] text-left">
                <button
                  onClick={() => setCompanionOpinion(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
                
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-500/30 text-cyan-400 font-extrabold text-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    {companionOpinion.name[0]}
                  </div>
                  <div>
                    <span className="text-[9px] text-cyan-400 uppercase tracking-widest block font-bold">OPERATIVE TRANS-COMM</span>
                    <h4 className="text-white font-extrabold text-sm uppercase">{companionOpinion.name}</h4>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-slate-200 text-xs leading-relaxed italic relative">
                  <span className="absolute -top-3 left-4 bg-slate-900 px-2 text-[9px] text-slate-500 uppercase">TRANSMISSION FEED</span>
                  "{companionOpinion.line}"
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setCompanionOpinion(null)}
                    className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all font-bold uppercase text-2xs px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Acknowledge Uplink
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className={`max-w-md w-full rounded-xl border p-6 font-mono relative shadow-2xl overflow-hidden ${
                  activePopup.type === "transit"
                    ? "border-cyan-500/50 bg-slate-900/90 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                    : activePopup.type === "loot"
                      ? "border-emerald-500/50 bg-slate-900/90 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                      : activePopup.type === "check_success"
                        ? "border-cyan-400/50 bg-slate-900/90 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                        : activePopup.type === "check_failure"
                          ? "border-red-500/50 bg-slate-900/90 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
                          : "border-slate-700 bg-slate-900/90 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                }`}
              >
                {/* Visual sci-fi scanner overlay beam */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    {activePopup.type === "check_failure" ? (
                      <div className="w-8 h-8 rounded-lg bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                        <AlertTriangle size={16} />
                      </div>
                    ) : activePopup.type === "loot" ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Briefcase size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Compass size={16} />
                      </div>
                    )}
                    <div className="text-left">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                        {activePopup.subtitle || "TACTICAL DECK NOTICE"}
                      </span>
                      <h3 className={`text-sm font-black tracking-wide uppercase ${
                        activePopup.type === "check_failure"
                          ? "text-red-400"
                          : activePopup.type === "loot"
                            ? "text-emerald-400"
                            : "text-cyan-400"
                      }`}>
                        {activePopup.title}
                      </h3>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    activePopup.type === "check_failure"
                      ? "bg-red-950/40 border-red-500/20 text-red-400"
                      : activePopup.type === "loot"
                        ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                        : "bg-cyan-950/40 border-cyan-500/20 text-cyan-400"
                  }`}>
                    {activePopup.type}
                  </span>
                </div>

                {/* Content text */}
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed text-left p-4 rounded-lg bg-slate-950/60 border border-white/5 whitespace-pre-wrap">
                  {activePopup.text}
                </p>

                {/* Footer Buttons */}
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setActivePopup(null)}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer border transition-all ${
                      activePopup.type === "check_failure"
                        ? "bg-gradient-to-r from-red-900 to-red-800 text-white border-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                        : activePopup.type === "loot"
                          ? "bg-gradient-to-r from-emerald-900 to-emerald-800 text-white border-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          : "bg-gradient-to-r from-cyan-900 to-cyan-800 text-white border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    }`}
                  >
                    CONFIRM COGNITION [OK]
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Shop Vendor Modal */}
        <AnimatePresence>
          {shopVendorOpen && gameState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col z-50"
              >
                {/* Visual Scanner Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 animate-pulse" />

                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap justify-between items-center bg-slate-950/40 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 rounded-lg">
                      <ShoppingCart size={20} className="animate-pulse" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] text-cyan-500 tracking-widest font-mono uppercase block font-bold">
                        SECURE MERCHANT NET v8.4
                      </span>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                        APEX ARMORY & ADVANCED GEAR STORE
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Credits Tracker */}
                    <div className="bg-slate-950/60 border border-white/10 px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono">
                      <Coins className="text-amber-400" size={16} />
                      <span className="text-slate-400 text-[9px] uppercase font-bold">CREDITS:</span>
                      <span className="text-amber-300 text-xs sm:text-sm font-black tracking-wide">{gameState.credits}¤</span>
                    </div>

                    <button
                      onClick={() => setShopVendorOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Shop Sub-header with Fast Action Recycler */}
                <div className="px-4 py-2.5 bg-cyan-950/20 border-b border-cyan-500/10 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span>Purchase deluxe and legendary gear to receive special stats and special effects!</span>
                  </div>

                  {gameState.inventory.includes("Rusted Circuitry") ? (
                    <button
                      onClick={() => {
                        let nextState = { ...gameState };
                        nextState.inventory = nextState.inventory.filter(i => i !== "Rusted Circuitry");
                        nextState.credits += 30;
                        setGameState(nextState);
                        setLogs(prev => [
                          ...prev,
                          {
                            id: crypto.randomUUID(),
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            text: "💰 VENDOR TRANSACTION: Recycled Rusted Circuitry directly at the store terminal counter! Received +30¤.",
                            type: "system",
                            district: nextState.district,
                            poi: nextState.poi
                          }
                        ]);
                        triggerToast("RECYCLED SCRAP: +30¤ CREDITS");
                      }}
                      className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-900 transition-all uppercase text-[10px] tracking-wider animate-pulse cursor-pointer"
                    >
                      ♻️ Quick Recycle 'Rusted Circuitry' (+30¤)
                    </button>
                  ) : (
                    <div className="text-slate-500 text-[10px] uppercase">No circuitry scrap in backpack</div>
                  )}
                </div>

                {/* Shop Categories & Catalog Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/20 grid grid-cols-1 md:grid-cols-4 gap-5 min-h-[40vh]">
                  {/* Category Sidebar */}
                  <div className="md:col-span-1 space-y-2.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block font-black text-left mb-1">
                      FILTER CATALOG
                    </span>
                    {[
                      { id: "all", label: "ALL HARDWARE" },
                      { id: "weapon", label: "WEAPONS" },
                      { id: "armor", label: "ARMOR SUITS" },
                      { id: "headpiece", label: "INTEGRATIONS" },
                      { id: "trinket", label: "TRINKETS & CORES" }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setShopFilter(cat.id)}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold font-mono transition-all flex justify-between items-center cursor-pointer ${
                          (cat.id === "all" ? shopFilter === "all" || !["weapon", "armor", "headpiece", "trinket"].includes(shopFilter) : shopFilter === cat.id)
                            ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                            : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <ChevronRight size={14} className="opacity-60" />
                      </button>
                    ))}

                    <div className="pt-4 border-t border-white/5">
                      <div className="bg-slate-900/40 border border-white/5 rounded-lg p-3 text-left font-mono text-[10px] text-slate-500 space-y-1.5">
                        <span className="font-extrabold text-slate-400 block uppercase tracking-wider">RARITY GUIDELINES:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-slate-200" />
                          <span className="text-slate-300">White: Common (+stats)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-blue-500 animate-pulse" />
                          <span className="text-blue-400">Blue: Deluxe (+stats, fx)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-purple-500 animate-pulse" />
                          <span className="text-purple-400">Purple: Epic (+high, fx)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded bg-amber-500 animate-pulse" />
                          <span className="text-amber-400">Gold: Legendary (Unrivaled fx)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="md:col-span-3 overflow-y-auto pr-1 space-y-4 max-h-[50vh]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(ITEM_METADATA)
                        .filter(([name, details]) => {
                          if (details.slot === "consumable" || details.slot === "valuable" || details.slot === "weapon") return false;
                          if (shopFilter === "all" || !shopFilter) return true;
                          if (shopFilter === "weapon") return details.slot === "meleeWeapon" || details.slot === "rangedWeapon";
                          return details.slot === shopFilter;
                        })
                        .map(([name, details]) => {
                          const cost = getItemCost(name, details);
                          const isAffordable = gameState.credits >= cost;
                          const rarity = details.rarity || "common";

                          return (
                            <div
                              key={name}
                              className={`rounded-xl border p-4 font-mono text-left relative flex flex-col justify-between transition-all duration-300 ${
                                rarity === "legendary"
                                  ? "bg-amber-950/10 border-amber-500/30 hover:border-amber-400/60 shadow-[inset_0_0_15px_rgba(234,179,8,0.05)] hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                                  : rarity === "epic"
                                    ? "bg-purple-950/10 border-purple-500/30 hover:border-purple-400/60 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                    : rarity === "deluxe"
                                      ? "bg-blue-950/10 border-blue-500/30 hover:border-blue-400/60 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                      : "bg-slate-900/50 border-slate-700/60 hover:border-slate-500 hover:bg-slate-900/80"
                              }`}
                            >
                              <div>
                                {/* Card Header with Rarity and Slot */}
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                                    rarity === "legendary"
                                      ? "bg-amber-950 text-amber-300 border border-amber-500/20"
                                      : rarity === "epic"
                                        ? "bg-purple-950 text-purple-300 border border-purple-500/20"
                                        : rarity === "deluxe"
                                          ? "bg-blue-950 text-blue-300 border border-blue-500/20"
                                          : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}>
                                    {rarity}
                                  </span>

                                  <span className="text-[8px] text-slate-500 uppercase font-bold">
                                    {details.slot === "meleeWeapon"
                                      ? "Melee Weapon"
                                      : details.slot === "rangedWeapon"
                                        ? "Ranged Weapon"
                                        : details.slot}
                                  </span>
                                </div>

                                {/* Item Name */}
                                <h4 className={`text-sm font-black tracking-tight mb-1.5 flex items-center gap-1.5 ${
                                  rarity === "legendary"
                                    ? "text-amber-400 font-extrabold"
                                    : rarity === "epic"
                                      ? "text-purple-400"
                                      : rarity === "deluxe"
                                        ? "text-blue-400"
                                        : "text-slate-200"
                                }`}>
                                  {getItemIcon(name, details.slot)}
                                  <span>{name}</span>
                                </h4>

                                {/* Item description */}
                                <p className="text-[10px] text-slate-400 leading-normal mb-3">
                                  {details.desc}
                                </p>

                                {/* Stat modifiers */}
                                {details.stats && Object.keys(details.stats).length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-3 bg-slate-950/40 p-2 rounded-md border border-white/5">
                                    {Object.entries(details.stats).map(([stat, val]) => (
                                      <span key={stat} className="text-[9px] text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded">
                                        {stat === "meleeAtk" ? "⚔️ Melee" : stat === "rangeAtk" ? "🔫 Ranged" : stat === "maxHp" ? "❤️ HP" : stat === "maxMana" ? "⚡ Mana" : stat === "startingShields" ? "🛡️ Shields" : stat.toUpperCase()}: +{val}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Special effect */}
                                {details.specialEffect && (
                                  <div className="text-[9px] text-rose-300 border border-rose-500/20 bg-rose-950/10 p-2 rounded-md mb-4 flex items-start gap-1">
                                    <Sparkles size={11} className="text-rose-400 shrink-0 mt-0.5" />
                                    <span>
                                      <strong className="text-rose-400 uppercase tracking-wide">Effect:</strong> {details.specialEffect}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price and Buy Button */}
                              <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1">
                                  <Coins size={14} className="text-amber-400" />
                                  <span className="text-amber-300 font-black text-xs sm:text-sm">{cost}¤</span>
                                </div>

                                <button
                                  onClick={() => {
                                    if (isAffordable) {
                                      let nextState = { ...gameState };
                                      nextState.credits -= cost;
                                      nextState.inventory.push(name);
                                      setGameState(nextState);
                                      setLogs(prev => [
                                        ...prev,
                                        {
                                          id: crypto.randomUUID(),
                                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                          text: `🛒 PURCHASE SUCCESS: Transferred ${cost}¤ credits. Added deluxe/legendary grade [${name}] to inventory stash!`,
                                          type: "system",
                                          district: nextState.district,
                                          poi: nextState.poi
                                        }
                                      ]);
                                      triggerToast(`BOUGHT: ${name}`);
                                    } else {
                                      triggerToast("INSUFFICIENT CREDITS");
                                    }
                                  }}
                                  disabled={!isAffordable}
                                  className={`px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                    isAffordable
                                      ? "bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                                      : "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed"
                                  }`}
                                >
                                  {isAffordable ? "Deploy Hardware" : "Credits Short"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500 uppercase">Secure encrypted transaction logs</span>
                  <button
                    onClick={() => setShopVendorOpen(false)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                  >
                    CLOSE SHOP CONSOLE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Companion Equipment & Inventory Editor Modal */}
        <AnimatePresence>
          {editingCompanionName && gameState && (() => {
            const companion = gameState.companions.find(c => c.name === editingCompanionName);
            if (!companion) return null;
            
            // Make sure the companion has initialized equipment
            const compEquipment = companion.equipment || {
              meleeWeapon: null,
              rangedWeapon: null,
              armor: null,
              headpiece: null,
              trinket: null
            };

            const companionInv = companion.inventory || [];

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-mono text-xs"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col z-50 text-slate-200"
                >
                  {/* Visual Scanner Line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500 animate-pulse" />

                  {/* Modal Header */}
                  <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap justify-between items-center bg-slate-950/40 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-950/50 border border-purple-500/30 text-purple-400 rounded-lg">
                        <UserCog size={20} className="animate-pulse" />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] text-purple-500 tracking-widest font-mono uppercase block font-bold">
                          SQUAD INTERACTION PROTOCOL v9.1
                        </span>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                          Manage Companion: {companion.name}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-slate-950/60 border border-white/10 px-3 py-1 rounded text-[10px] text-slate-400">
                        Role: <span className="text-purple-400 font-extrabold uppercase">{companion.role}</span>
                      </div>
                      <button
                        onClick={() => setEditingCompanionName(null)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Two Column Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950/15">
                    
                    {/* LEFT COLUMN: BIO & PERSONAL INVENTORY */}
                    <div className="md:col-span-5 space-y-4">
                      {/* Companion Card */}
                      <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-left space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-950/30 border border-purple-500/20 overflow-hidden flex items-center justify-center text-xl shrink-0">
                            {companion.avatar || "👤"}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-white text-sm uppercase">{companion.name}</h3>
                            <p className="text-[10px] text-purple-400 font-semibold uppercase">{companion.role}</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-3xs italic leading-relaxed font-sans border-t border-white/5 pt-2">
                          "{companion.bio}"
                        </p>
                      </div>

                      {/* Companion Personal Inventory (Combat Belt) */}
                      <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-left space-y-3 flex flex-col">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                            <Briefcase size={12} className="text-purple-400" />
                            Personal Combat Belt ({companionInv.length}/4)
                          </span>
                        </div>

                        {/* Inventory List */}
                        {companionInv.length === 0 ? (
                          <p className="py-4 text-slate-500 text-center text-2xs italic border border-dashed border-white/5 rounded-lg">
                            Belt is empty. Transfer items to support this companion.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {companionInv.map((item, index) => {
                              const details = ITEM_METADATA[item];
                              return (
                                <div key={index} className="flex justify-between items-center bg-slate-900/60 border border-white/5 p-2 rounded text-3xs">
                                  <div className="flex items-center gap-1.5">
                                    {getItemIcon(item, details?.slot)}
                                    <span className="font-extrabold text-slate-200 uppercase">{item}</span>
                                  </div>
                                  <button
                                    onClick={() => handleTakeCompanionItem(companion.name, item)}
                                    className="px-2 py-1 bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 rounded border border-purple-500/20 transition-all font-bold uppercase text-[9px] cursor-pointer"
                                  >
                                    Take to Stash
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Transfer/Give from Player Stash */}
                        <div className="pt-3 border-t border-white/5 space-y-2">
                          <p className="text-[9px] text-slate-400 uppercase font-black">Give Consumable from Your Locker:</p>
                          {(() => {
                            const transferables = gameState.inventory.filter(item => 
                              item.includes("Stim") || item.includes("Cell") || item.includes("Circuitry") || item.includes("battery")
                            );
                            
                            if (transferables.length === 0) {
                              return <p className="text-[9px] text-slate-600 italic">No transferable consumables in your stash.</p>;
                            }

                            return (
                              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                                {transferables.map((item, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleGiveCompanionItem(companion.name, item)}
                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded border border-white/5 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    {getItemIcon(item, "consumable")}
                                    <span>+ {item.replace(" (Heal)", "").replace(" (Mana)", "")}</span>
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: EQUIPMENT INTEGRATIONS */}
                    <div className="md:col-span-7 space-y-3">
                      <p className="text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Active Slot Hardware Integrations
                      </p>

                      {([
                        { key: "meleeWeapon", label: "Melee Weapon Input", icon: <Sword size={14} className="text-rose-400" /> },
                        { key: "rangedWeapon", label: "Ranged Weapon Array", icon: <Crosshair size={14} className="text-cyan-400" /> },
                        { key: "armor", label: "Body Armor Suit", icon: <Shield size={14} className="text-emerald-400" /> },
                        { key: "headpiece", label: "Neural integration visor", icon: <Cpu size={14} className="text-purple-400" /> },
                        { key: "trinket", label: "Sub-Cortex Battery Core", icon: <Gem size={14} className="text-amber-400" /> }
                      ] as const).map((slotInfo) => {
                        const equippedItemName = compEquipment[slotInfo.key];
                        const itemDetails = equippedItemName ? ITEM_METADATA[equippedItemName] : null;
                        const rarity = itemDetails?.rarity || "common";

                        // Find compatible items in player's inventory
                        const compatibleItems = gameState.inventory.filter(item => {
                          const met = ITEM_METADATA[item];
                          return met && met.slot === slotInfo.key;
                        });

                        return (
                          <div
                            key={slotInfo.key}
                            className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                              equippedItemName
                                ? rarity === "legendary"
                                  ? "bg-amber-950/10 border-amber-500/30"
                                  : rarity === "epic"
                                    ? "bg-purple-950/10 border-purple-500/30"
                                    : rarity === "deluxe"
                                      ? "bg-blue-950/10 border-blue-500/30"
                                      : "bg-slate-900 border-white/10"
                                : "bg-slate-900/40 border-dashed border-white/5 opacity-70"
                            }`}
                          >
                            {/* Slot Header */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-1">
                              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                                {slotInfo.icon}
                                {slotInfo.label}
                              </span>
                              {equippedItemName && (
                                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  rarity === "legendary"
                                    ? "bg-amber-950 text-amber-300"
                                    : rarity === "epic"
                                      ? "bg-purple-950 text-purple-300"
                                      : rarity === "deluxe"
                                        ? "bg-blue-950 text-blue-300"
                                        : "bg-slate-800 text-slate-400"
                                }`}>
                                  {rarity}
                                </span>
                              )}
                            </div>

                            {/* Equipped Item Details */}
                            {equippedItemName ? (
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1">
                                  <h4 className={`text-xs font-black uppercase flex items-center gap-1.5 ${
                                    rarity === "legendary"
                                      ? "text-amber-400"
                                      : rarity === "epic"
                                        ? "text-purple-400"
                                        : rarity === "deluxe"
                                          ? "text-blue-400"
                                          : "text-slate-200"
                                  }`}>
                                    {getItemIcon(equippedItemName, slotInfo.key)}
                                    {equippedItemName}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 leading-normal font-sans">{itemDetails?.desc}</p>
                                  
                                  {/* Stats */}
                                  {itemDetails?.stats && Object.keys(itemDetails.stats).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(itemDetails.stats).map(([st, val]) => (
                                        <span key={st} className="text-[8px] font-bold bg-slate-950/60 border border-white/5 px-1 rounded text-cyan-400">
                                          {st === "meleeAtk" ? "⚔️ Melee" : st === "rangeAtk" ? "🔫 Ranged" : st === "maxHp" ? "❤️ HP" : st === "maxMana" ? "⚡ Mana" : st === "startingShields" ? "🛡️ Shields" : st.toUpperCase()}: +{val}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Special FX */}
                                  {itemDetails?.specialEffect && (
                                    <p className="text-rose-400 text-[8.5px] mt-1 italic flex items-center gap-1">
                                      <Sparkles size={10} />
                                      <span><strong>Effect:</strong> {itemDetails.specialEffect}</span>
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleUnequipCompanionItem(companion.name, slotInfo.key)}
                                  className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/20 hover:border-rose-400 text-rose-300 hover:text-white rounded text-[9px] transition-all font-black uppercase cursor-pointer shrink-0"
                                >
                                  Unequip
                                </button>
                              </div>
                            ) : (
                              <p className="text-[9.5px] text-slate-500 italic">No gear equipped in this slot integration.</p>
                            )}

                            {/* Equip Dropdown list alternative (Direct Buttons to Equip) */}
                            {compatibleItems.length > 0 && (
                              <div className="mt-1 pt-2 border-t border-white/5 space-y-1">
                                <span className="text-[8.5px] text-slate-400 uppercase font-black block">Swap with Stash hardware:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {compatibleItems.map((item, idx) => {
                                    const details = ITEM_METADATA[item];
                                    const iRarity = details?.rarity || "common";
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => handleEquipCompanionItem(companion.name, slotInfo.key, item)}
                                        className={`px-2 py-1 text-[8.5px] font-extrabold uppercase rounded border transition-all cursor-pointer flex items-center gap-1 ${
                                          iRarity === "legendary"
                                            ? "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40"
                                            : iRarity === "epic"
                                              ? "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/40"
                                              : iRarity === "deluxe"
                                                ? "bg-blue-950/40 border-blue-500/30 text-blue-300 hover:bg-blue-900/40"
                                                : "bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-750"
                                        }`}
                                      >
                                        {getItemIcon(item, slotInfo.key)}
                                        <span>Equip {item}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500 uppercase">Equipped stat bonuses apply instantly to companion battles</span>
                    <button
                      onClick={() => setEditingCompanionName(null)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-950 to-slate-900 hover:from-purple-900 hover:to-purple-950 border border-purple-500/30 hover:border-purple-400 text-purple-400 font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                    >
                      CLOSE COMPANION SHELL
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Base Crew Management Screen (NPC Interaction Hub) */}
        {baseNPCManagerOpen && gameState && (
          <NPCBaseManagement
            isOpen={baseNPCManagerOpen}
            onClose={() => setBaseNPCManagerOpen(false)}
            gameState={gameState}
            setGameState={setGameState}
            triggerToast={triggerToast}
          />
        )}

      </main>

    </div>
  );
}
