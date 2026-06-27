import { GameState, CompanionState } from "./types";

export interface Archetype {
  name: string;
  description: string;
  maxHp: number;
  maxMana: number;
  credits: number;
  startingEquipment: string[];
  specialty: string;
}

export const ARCHETYPES: Archetype[] = [
  {
    name: "Cyber-Blade",
    description: "A lethal street assassin weaving refined cyber-blade skills. High survivability and lethal physical force.",
    maxHp: 120,
    maxMana: 40,
    credits: 150,
    startingEquipment: ["Nano-alloy Katana", "Auxiliary Stimulant x2"],
    specialty: "Physical Combat & Assassination"
  },
  {
    name: "Techno-Mage",
    description: "A dark ether channeler bending awakened magical structures with top-tier hacker decks. High mana capacity and devastating spell capabilities.",
    maxHp: 90,
    maxMana: 100,
    credits: 100,
    startingEquipment: ["Coven Spell-Slicing Focus", "Ether battery x3"],
    specialty: "Spell Incantations & Ether Shielding"
  },
  {
    name: "Outlaw Hacker",
    description: "A rogue databroker manipulating networks and sub-routines. High initial corporate credits and cyber bypass tools.",
    maxHp: 100,
    maxMana: 70,
    credits: 220,
    startingEquipment: ["Horizon Smart-Pistol", "Icebreaker Override Core"],
    specialty: "System Manipulation & Strategic Ranged Combat"
  }
];

export const INITIAL_COMPANIONS: CompanionState[] = [
  {
    name: "Scythe",
    fee: 100,
    status: "available",
    role: "Infiltrator / Cyber-Ninja",
    bio: "Ex-Apex Cyber-Dynamics black-ops. Discarded after a botched corporate raid. Highly skilled with stealth, active camo, and mono-blade systems."
  },
  {
    name: "Vex",
    fee: 80,
    status: "available",
    role: "Techno-Mage Decryptor",
    bio: "Nerve-fried hacker hailing from the Iron Coven syndicates. Specializes in burning through firewalls and siphoning bank feeds."
  },
  {
    name: "Brick",
    fee: 90,
    status: "available",
    role: "Heavy Cyber-Orc Mercenary",
    bio: "A bio-engineered street enforcer measuring seven feet of alloy, muscle, and malice. Brings massive damage mitigation and heavy firearms."
  },
  {
    name: "Trigger",
    fee: 95,
    status: "available",
    role: "Vanguard Gunner / Heavy Marksman",
    bio: "Former syndicate heavy weapons expert. Carries a modified plasma rifle with long-range armor-piercing rounds."
  }
];

export const SHOP_ITEMS = [
  { name: "Apex Mantis electro-blade", cost: 120, slot: "Weapons", desc: "Surgical lightning weapon that cuts armor plates (+25 physical damage)." },
  { name: "Coven Ether-deck v3", cost: 150, slot: "Weapons", desc: "Magical amplification cyberdeck (+30% spell damage)." },
  { name: "Smart-Targeting Visor", cost: 80, slot: "Cyberware", desc: "Adds telemetry targeters (+15 damage to range/hacks)." },
  { name: "Exo-Plated Mesh Armor", cost: 140, slot: "Armor", desc: "Nanotube composite armor with 25% physical absorption." },
  { name: "Nano Med-Stim (Heal)", cost: 30, slot: "Consumable", desc: "Fully restores 60 HP instantly." },
  { name: "Ether Mana-Cell (Mana)", cost: 30, slot: "Consumable", desc: "Fully restores 50 Mana instantly." }
];

export interface ItemDetails {
  name: string;
  slot: "weapon" | "meleeWeapon" | "rangedWeapon" | "armor" | "headpiece" | "trinket" | "consumable" | "valuable";
  desc: string;
  stats?: {
    maxHp?: number;
    maxMana?: number;
    str?: number;
    dex?: number;
    int?: number;
    will?: number;
    eth?: number;
    meleeAtk?: number;
    rangeAtk?: number;
    startingShields?: number;
  };
}

export const ITEM_METADATA: Record<string, ItemDetails> = {
  "Nano-alloy Katana": {
    name: "Nano-alloy Katana",
    slot: "meleeWeapon",
    desc: "A carbon-folded edge with localized induction heating (+15 melee damage, +3 Str, +3 Dex).",
    stats: { meleeAtk: 15, str: 3, dex: 3 }
  },
  "Coven Spell-Slicing Focus": {
    name: "Coven Spell-Slicing Focus",
    slot: "meleeWeapon",
    desc: "An organic ether tuning matrix that aligns synaptic currents (+20 max mana, +4 Eth, +3 Int).",
    stats: { maxMana: 20, eth: 4, int: 3 }
  },
  "Horizon Smart-Pistol": {
    name: "Horizon Smart-Pistol",
    slot: "rangedWeapon",
    desc: "A tactical pistol linked directly to your ocular nodes (+12 range damage, +4 Dex).",
    stats: { rangeAtk: 12, dex: 4 }
  },
  "Tactical Cyber-SMG": {
    name: "Tactical Cyber-SMG",
    slot: "rangedWeapon",
    desc: "A rapid-firing firearm with smart telemetry recoil dampeners (+18 range damage, +3 Dex, +2 Int).",
    stats: { rangeAtk: 18, dex: 3, int: 2 }
  },
  "Apex Mantis electro-blade": {
    name: "Apex Mantis electro-blade",
    slot: "meleeWeapon",
    desc: "Surgical lightning weapon that cuts armor plates (+25 melee damage, +5 Str, +3 Dex).",
    stats: { meleeAtk: 25, str: 5, dex: 3 }
  },
  "Coven Ether-deck v3": {
    name: "Coven Ether-deck v3",
    slot: "meleeWeapon",
    desc: "Magical amplification cyberdeck (+30 max mana, +6 Eth, +5 Int).",
    stats: { maxMana: 30, eth: 6, int: 5 }
  },
  "Heavy Plasma Cannon": {
    name: "Heavy Plasma Cannon",
    slot: "rangedWeapon",
    desc: "Syndicate demolition railgun (+35 physical damage, -3 Dex, +5 Str).",
    stats: { rangeAtk: 35, dex: -3, str: 5 }
  },
  "Exo-Plated Mesh Armor": {
    name: "Exo-Plated Mesh Armor",
    slot: "armor",
    desc: "Nanotube composite armor with high density plating (+40 Max HP, +30 Shields, +4 Str).",
    stats: { maxHp: 40, startingShields: 30, str: 4 }
  },
  "Syndicate Heavy Armor": {
    name: "Syndicate Heavy Armor",
    slot: "armor",
    desc: "Slab alloy protection used by corporate enforcers (+60 Max HP, +40 Shields, -2 Dex).",
    stats: { maxHp: 60, startingShields: 40, dex: -2 }
  },
  "Nanoshell Vest": {
    name: "Nanoshell Vest",
    slot: "armor",
    desc: "Flexible kinetic dispersal wear (+25 Max HP, +15 Shields).",
    stats: { maxHp: 25, startingShields: 15 }
  },
  "Smart-Targeting Visor": {
    name: "Smart-Targeting Visor",
    slot: "headpiece",
    desc: "Adds telemetry targeters (+15 Max Mana, +4 Dex, +4 Int).",
    stats: { maxMana: 15, dex: 4, int: 4 }
  },
  "Technical Signal Core": {
    name: "Technical Signal Core",
    slot: "headpiece",
    desc: "Ocular HUD decryptor (+10 Max Mana, +4 Int, +3 Eth).",
    stats: { maxMana: 10, int: 4, eth: 3 }
  },
  "Titanium Alloy Headgear": {
    name: "Titanium Alloy Headgear",
    slot: "headpiece",
    desc: "Heavily reinforced helmet protecting brain co-processors (+20 Max HP, +5 Str, +3 Will).",
    stats: { maxHp: 20, str: 5, will: 3 }
  },
  "Charged Ley-Matrix": {
    name: "Charged Ley-Matrix",
    slot: "trinket",
    desc: "High-grade ley-line battery capturing ambient stray ether (+25 Max Mana, +5 Eth).",
    stats: { maxMana: 25, eth: 5 }
  },
  "Icebreaker Override Core": {
    name: "Icebreaker Override Core",
    slot: "trinket",
    desc: "Hacks network gate barriers (+10 Max Mana, +3 Int, +3 Eth).",
    stats: { maxMana: 10, int: 3, eth: 3 }
  },
  "Cyber-Totem of Outcasts": {
    name: "Cyber-Totem of Outcasts",
    slot: "trinket",
    desc: "A token constructed from broken motherboard circuits (+15 Max HP, +15 Max Mana, +3 Will).",
    stats: { maxHp: 15, maxMana: 15, will: 3 }
  },
  "Prismatic Ether Crystal": {
    name: "Prismatic Ether Crystal",
    slot: "trinket",
    desc: "Crystalline matrix glowing with neon magic power (+25 Max Mana, +5 Eth).",
    stats: { maxMana: 25, eth: 5 }
  },
  "Unstable Plasma Core": {
    name: "Unstable Plasma Core",
    slot: "trinket",
    desc: "Volatile containment cell pulsating energy (+10 Max HP, +10 Max Mana, +4 Str, +4 Dex).",
    stats: { maxHp: 10, maxMana: 10, str: 4, dex: 4 }
  },
  "Nano Med-Stim (Heal)": {
    name: "Nano Med-Stim (Heal)",
    slot: "consumable",
    desc: "Fully restores 60 HP instantly."
  },
  "Ether Mana-Cell (Mana)": {
    name: "Ether Mana-Cell (Mana)",
    slot: "consumable",
    desc: "Fully restores 50 Mana instantly."
  },
  "Auxiliary Stimulant x2": {
    name: "Auxiliary Stimulant x2",
    slot: "consumable",
    desc: "Double dose of adrenaline boosters."
  },
  "Auxiliary Stimulant": {
    name: "Auxiliary Stimulant",
    slot: "consumable",
    desc: "Adrenaline booster."
  },
  "Ether battery x3": {
    name: "Ether battery x3",
    slot: "consumable",
    desc: "Three high-density energy packs."
  },
  "Ether battery": {
    name: "Ether battery",
    slot: "consumable",
    desc: "High-density energy pack."
  },
  "Rusted Circuitry": {
    name: "Rusted Circuitry",
    slot: "valuable",
    desc: "Valuable system parts salvageable for scrap."
  },
  "Ares Keycard": {
    name: "Ares Keycard",
    slot: "valuable",
    desc: "Corporate security passcard."
  },
  "Shatter-Ridge Scrap Metal": {
    name: "Shatter-Ridge Scrap Metal",
    slot: "valuable",
    desc: "Dense alloy fragments from broken structural walls."
  }
};

export interface Region {
  id: string;
  name: string;
  description: string;
  bgImage: string;
}

export const REGIONS: Region[] = [
  {
    id: "conduit09",
    name: "Conduit 09",
    description: "The Subsurface AI Catacombs. Dripping water conduits, old server cabinets, and high-voltage feeder cables line this forgotten sector.",
    bgImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "shatter_ridge_core",
    name: "Shatter-Ridge Core",
    description: "The Core Array Shatter-Ridge. A hum of static electricity fills the air as heavy automated defense grids rotate on metal sliders.",
    bgImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "data_vault",
    name: "Data Vault Sanctuary",
    description: "The hyper-secure neural safe containing corporate database crystals. Neon security barriers guard the central vault altar.",
    bgImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "aurus",
    name: "Aurus District",
    description: "The gritty, neon-soaked rain corridors and crowded lower-level slums of Aurus District.",
    bgImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "docks",
    name: "Docks Region",
    description: "Heavy mechanical cargo loaders, dark oceanic slipways, and corrosive chemical waterways of Megacity-9.",
    bgImage: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "downtown",
    name: "Downtown Region",
    description: "Towering shiny holographic skyscrapers, deep skyway canyons, and heavily secured financial corridors.",
    bgImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "satoshi",
    name: "Satoshi Square Region",
    description: "The high-tech ancestral heart of Megacity-9. Combines glowing server columns with digital blossom gardens.",
    bgImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=1200"
  }
];

export interface MapPOI {
  id: string;
  name: string;
  district: string; // Region ID e.g. "conduit09", "shatter_ridge_core", "data_vault", "aurus", etc.
  description: string;
  image: string; // Scenic close-up inside the POI
  x: number; // percentage coordinate on map grids
  y: number; // percentage coordinate on map grids
  type: "safehouse" | "social" | "shop" | "hiring" | "arcane" | "combat" | "quest";
  buttons: string[];
}

export const MAP_POIS: MapPOI[] = [
  // ---- MAP 1: SUBSURFACE AI CATACOMBS (CONDUIT 09) ----
  {
    id: "ventilation_shaft",
    name: "Ventilation Shaft (Entry Point)",
    district: "conduit09",
    description: "A narrow, massive circular shaft with heavy metal fan blades spinning at high speed. Vice coordinates from his pocket interface: 'The fan rotors run on a variable frequency cycle. We can slip through during the 0.5-second lull. DEX will determine if you get sliced, rookie.' Tracker mutters: 'Move it. Patrol drones are scanning this sector.'",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=600",
    x: 15,
    y: 80,
    type: "quest",
    buttons: [
      "Slip through Vent (DEX Check)",
      "Talk to Vice & Tracker",
      "Scavenge Rusted Emergency Locker (Find Cyber-Ammo & Health Stimpack)",
      "Dismantle ventilation casing (Acquire Carbon Fiber Armor Plates)"
    ]
  },
  {
    id: "security_terminal",
    name: "Security Sub-Terminal",
    district: "conduit09",
    description: "A buzzing sub-grid terminal flashing corporate warning logs. Tracker gestures at the hardware: 'This sub-terminal bridges the outer perimeter alarm nodes. If you have the INT, you can bypass the firewall and scavenge some valuable copper Rusted Circuitry.' Vice laughs: 'I'll keep watch while you operate.'",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
    x: 45,
    y: 55,
    type: "quest",
    buttons: [
      "Bypass Sub-Terminal (INT Check)",
      "Search terminal wreckage for scrap",
      "Hack Secure Weapons Locker (Acquire Tactical Cyber-SMG!)",
      "Siphon auxiliary thermal battery (Recover +35 Mana)"
    ]
  },
  {
    id: "blast_door",
    name: "Heavy Blast Door",
    district: "conduit09",
    description: "A solid titanium bulkhead door blocking access to the core. Red security locks pulse defensively. Tracker spits: 'This thing is reinforced. You can either use pure physical force to pry open the auxiliary hydraulic valve, or find another way. What's your STR state looking like, rookie?'",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    x: 75,
    y: 40,
    type: "quest",
    buttons: [
      "Pry Open Valve (STR Check)",
      "Banter with Vice and Tracker",
      "Raid security guard barracks (Loot Nano Med-Stim & Flak Guard Armor)",
      "Interface with corporate supply bin (Extract Energy Batteries)"
    ]
  },
  {
    id: "section_gate",
    name: "Next Section Gate (Transit)",
    district: "conduit09",
    description: "A heavy transit hatch linking Conduit 09 directly to Shatter-Ridge Core. The digital terminal panel glows yellow. Tracker yells: 'The route is clear. Get inside! Once we seal this hatch, there is no returning back.' Vice nods solemnly: 'Get ready, the real array is just ahead.'",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=600",
    x: 90,
    y: 20,
    type: "quest",
    buttons: [
      "Proceed to Shatter-Ridge Core (Transit)"
    ]
  },

  // ---- MAP 2: CORE ARRAY SHATTER-RIDGE ----
  {
    id: "shatter_ridge_security_post",
    name: "Shatter-Ridge Security Checkpoint",
    district: "shatter_ridge_core",
    description: "A fortified cyber-barrier flashing defensive warnings. Heavy steel lockers line the checkpoint walls. To advance deeper, you must find a way to disable the barrier or search the lockers. Vice keeps a steady hand on his weapon: 'Corporate security was here recently. Watch the tripwires.'",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
    x: 20,
    y: 70,
    type: "quest",
    buttons: [
      "Overclock Security Gate (INT Check)",
      "Scavenge Security Chest (Find Exo-Plated Mesh Armor & Nano Med-Stim)",
      "Pep-Talk Vice & Tracker (Inspiration Dialogue)",
      "Move to Reactor Well (Proceed)"
    ]
  },
  {
    id: "shatter_ridge_reactor_well",
    name: "Shatter-Ridge Reactor Well",
    district: "shatter_ridge_core",
    description: "A boiling pool of toxic bio-coolant fluid casting eerie turquoise shadows. A suspended hydraulic arm holds a locked cargo crate directly over the pool. Tracker points: 'That crate was scheduled for shipping to Ares Elite Headquarters. It has premium tech inside if we can lower it.'",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=600",
    x: 50,
    y: 45,
    type: "quest",
    buttons: [
      "Pull Cargo Lever (STR Check)",
      "Salvage Bio-Reactor Core (Find Smart-Targeting Visor)",
      "Consult Squad on Tactics",
      "Proceed to Main Array (Transit)"
    ]
  },
  {
    id: "main_array_core",
    name: "Core Array Shatter-Ridge",
    district: "shatter_ridge_core",
    description: "A majestic array of glowing blue power cells humming in vertical columns. As Tracker begins a manual security check bypass, his terminal flashes a critical red warning! Tracker yells: 'System fault! The corporate mainframe rejected my encryption key! Hostile drones are deploying!' Vice unsheathes his plasma pistol: 'Engage combat systems!'",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600",
    x: 80,
    y: 30,
    type: "combat",
    buttons: [
      "Defend Core Array (Triggers Combat!)"
    ]
  },

  // ---- MAP 3: DATA VAULT SANCTUARY ----
  {
    id: "terminal_hacking_puzzle",
    name: "Sanctuary Hacking Terminal",
    district: "data_vault",
    description: "The primary cyber-vault terminal containing files of Ares Biotech. Hexadecimal encryption streams cycle across the glass console. Access is fully restricted. Your cyberdeck awaits input. Vice says: 'Hurry up! Hack the system and get the data!'",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    x: 35,
    y: 60,
    type: "quest",
    buttons: [
      "Initiate Terminal Hack (Mini-Game)"
    ]
  },
  {
    id: "relic_altar",
    name: "Mysterious Relic Altar",
    district: "data_vault",
    description: "Behind the hacked console, a heavy obsidian altar slides open, revealing a floating, golden relic device of unknown origin. It hums with a warm, terrifying psych-ether frequency. Vice looks tense: 'That's not corporate files. Don't touch it!' Tracker's eyes shine: 'Do it! Touch it... it represents infinite power.'",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
    x: 75,
    y: 40,
    type: "quest",
    buttons: [
      "Activate Mysterious Relic"
    ]
  },

  // ---- CHAPTER 1: AURUS DISTRICT ----
  {
    id: "hideout",
    name: "Aurus Safehouse (The Hideout)",
    district: "aurus",
    description: "Your secure safehouse tucked below the metal alleys of Aurus District. Cybermatic components, workbench monitors, and spare batteries line the walls. Vice is missing after the dramatic data vault escape, but you can rest safely here to reset your vital parameters.",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=600",
    x: 20,
    y: 75,
    type: "safehouse",
    buttons: [
      "Rest & Recover at Hideout",
      "Check Stash Inventory",
      "Manage Passive Server Work"
    ]
  },
  {
    id: "bar",
    name: "The Neon Abyss Bar",
    district: "aurus",
    description: "A dim, synth-pulsing cyberbar dripping in fuchsia lights. Mercs, street operators, and hackers lounge in leather booths behind holographic smoke. Agent Jax sits in the far booth planning rebellious runs, and maybe someone has info on Vice's whereabouts.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    x: 55,
    y: 60,
    type: "social",
    buttons: [
      "Talk to Agent Jax",
      "Order Spell-Enhanced Cocktail (-10¤)",
      "Eavesdrop on Mercs",
      "Search Booths for Trash Scrap"
    ]
  },
  {
    id: "armory",
    name: "Apex Armory (Underground Weapon Shop)",
    district: "aurus",
    description: "An underground weapon shop under heavy fluorescent lights. High-tier physical gear, weapon brackets, and custom attachments glow under plexiglass hooks. Chancellor Aria coordinates operations here, offering high-level credit payments.",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600",
    x: 82,
    y: 35,
    type: "shop",
    buttons: [
      "Talk to Chancellor Aria",
      "Purchase Advanced Gear",
      "Sell Scrap for Credits"
    ]
  },
  {
    id: "agency",
    name: "The Nexus Mercenary Agency",
    district: "aurus",
    description: "A private high-rise enlistment suite. Ambient water curtains partition glass desk offices. Recruiters help coordinate your active skill-tree progression and hire freelance operatives for automated servers.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
    x: 45,
    y: 20,
    type: "hiring",
    buttons: [
      "Consult Agent Recruiter",
      "Contract Hire Scythe (100¤)",
      "Contract Hire Vex (80¤)",
      "Contract Hire Brick (90¤)"
    ]
  },

  // ---- 2. DOCKS REGION ----
  {
    id: "freight_hub",
    name: "Titan Logistics Freight Hub",
    district: "docks",
    description: "A massive, floodlit hangar stacked with multi-story automatic containers. Robotic freighters lift heavy metal pallets. Operators trade illegal trans-shipments in the shadows.",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600",
    x: 25,
    y: 40,
    type: "social",
    buttons: [
      "Scavenge Shipping Containers",
      "Interface with Cargo Logs",
      "Inquire for Off-the-Record Freight Tasks"
    ]
  },
  {
    id: "black_market",
    name: "Sub-Sector 4 Black Market",
    district: "docks",
    description: "Docks outcasts trade illegal hardware here beneath humming high-voltage cables. Fenced security software, microchips, and modified cybernetic implants sit in open crates.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    x: 60,
    y: 25,
    type: "shop",
    buttons: [
      "Purchase Advanced Gear",
      "Trade in Tech Scrap (+20¤)"
    ]
  },
  {
    id: "sludge_conduits",
    name: "Sludge Conduits & Waterworks",
    district: "docks",
    description: "A toxic cybernetic sewer swamp flowing with radioactive waste under heavy grease clouds. Chem-filters and mechanical debris form a dangerous sludge territory. Home of the acid Mutant Sludge Behemoth.",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
    x: 75,
    y: 70,
    type: "combat",
    buttons: [
      "Hunt Toxic Swamp Beast",
      "Scavenge Glowing Slime pools",
      "Search Discarded Sewer Grates"
    ]
  },

  // ---- 3. DOWNTOWN REGION ----
  {
    id: "shatter_ridge",
    name: "Shatter Ridge Corridors",
    district: "downtown",
    description: "Narrow glass highwalk walkways and neon structural crevices spanning downtown towers. Highly volatile alleyway tunnels where rust-claw bypassers and canyon style outlaws ambush target drones.",
    image: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=600",
    x: 35,
    y: 75,
    type: "combat",
    buttons: [
      "Ambush Outlaw Scrap-Raiders",
      "Scavenge Rusted Mine Shafts",
      "Investigate Abandoned Power Terminal"
    ]
  },
  {
    id: "express_terminal",
    name: "Cyberspace Express Terminal",
    district: "downtown",
    description: "A fast, luminous monorail terminal. Corporate commuters flash their high-grade neural tokens. It connects downtown districts with incredible high-throughput speed.",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=600",
    x: 70,
    y: 40,
    type: "social",
    buttons: [
      "Listen to Commuter Feeds",
      "Hack Ticket Dispenser",
      "Board Downtown Express Loop"
    ]
  },
  {
    id: "corporate_plaza",
    name: "Ares Biotech Corporate Plaza",
    district: "downtown",
    description: "A spotless steel plaza representing the high-ground. Polished sky arches reflect corporate advertisements. Heavy defense androids monitor civilian badges constantly.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    x: 50,
    y: 15,
    type: "shop",
    buttons: [
      "Bribe Security Automated Bot (-15¤)",
      "View Ares Commercial Holograms"
    ]
  },

  // ---- 4. SATOSHI SQUARE REGION ----
  {
    id: "temple",
    name: "The Iron Coven Temple",
    district: "satoshi",
    description: "A glowing cathedral with columns constructed of infinite server processors and ancient runic stones. The air sparkles with pure bio-ether static. High Priestess Morgana trains aspirants here to command mystic tech currents.",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
    x: 45,
    y: 70,
    type: "arcane",
    buttons: [
      "Talk to Priestess Morgana",
      "Train Mana Capacity (+20 Max Mana) (-80¤)",
      "Meditate with the Core (+25 Mana)",
      "Examine Technomantic Matrix"
    ]
  },
  {
    id: "genesis_megatower",
    name: "Genesis Megatower Hub",
    district: "satoshi",
    description: "A magnificent architectural peak. Floating digital rings display cryptocurrency indexes. Technocrats and network executives gather under golden light columns.",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=600",
    x: 80,
    y: 40,
    type: "social",
    buttons: [
      "Trade Tech Futures Indexes",
      "Search Gold Garbage Trays"
    ]
  },
  {
    id: "neon_shrine",
    name: "Satoshi Cyber-Shrine Gardens",
    district: "satoshi",
    description: "A serene electronic garden where pink holographic cherry blossom leaves drift down onto quiet water basins. Ideal to rest your minds.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600",
    x: 20,
    y: 25,
    type: "safehouse",
    buttons: [
      "Meditate with Shrines (+10 HP, +15 Mana)",
      "Perform Ritual Tech Offering (-20¤)"
    ]
  }
];

export interface EnemyTemplate {
  name: string;
  hp: number;
  maxHp: number;
  shields: number;
  maxShields: number;
  attackText: string;
  damageRange: [number, number];
  creditReward: [number, number];
  expReward: number;
}

export const ENEMIES: Record<string, EnemyTemplate[]> = {
  shatter_ridge: [
    {
      name: "Shatter Ridge Scavenger",
      hp: 55,
      maxHp: 55,
      shields: 10,
      maxShields: 10,
      attackText: "slashes at you with a rusted titanium cleaver!",
      damageRange: [8, 15],
      creditReward: [40, 70],
      expReward: 30
    },
    {
      name: "Rogue Rust-Claw Orc",
      hp: 80,
      maxHp: 80,
      shields: 20,
      maxShields: 20,
      attackText: "fires a double-barrel custom shotgun point-blank!",
      damageRange: [12, 22],
      creditReward: [60, 110],
      expReward: 45
    }
  ],
  sludge_conduits: [
    {
      name: "Mutant Sludge Crawler",
      hp: 60,
      maxHp: 60,
      shields: 0,
      maxShields: 0,
      attackText: "spews highly corrosive toxic sludge on your leg guards!",
      damageRange: [10, 18],
      creditReward: [45, 80],
      expReward: 35
    },
    {
      name: "Toxic Sludge Behemoth",
      hp: 110,
      maxHp: 110,
      shields: 30,
      maxShields: 30,
      attackText: "slams down with giant machinery arms overgrown with slimy conduits!",
      damageRange: [15, 28],
      creditReward: [100, 160],
      expReward: 60
    }
  ]
};

export function getInitialState(archetype: Archetype): GameState {
  const isBlade = archetype.name === "Cyber-Blade";
  const isMage = archetype.name === "Techno-Mage";
  
  return {
    district: "conduit09", // Stored as lower case region identifier
    poi: "Ventilation Shaft (Entry Point)",
    hp: archetype.maxHp,
    maxHp: archetype.maxHp,
    mana: archetype.maxMana,
    maxMana: archetype.maxMana,
    credits: archetype.credits,
    party: [],
    activeQuests: ["Prologue: Subsurface AI Catacombs - Infiltrate Conduit 09 with Vice and Tracker to steal corporate database crystals from Ares Biotech."],
    completedQuests: [],
    inventory: [...archetype.startingEquipment],
    companions: [...INITIAL_COMPANIONS],
    combatState: null,
    archetype: archetype.name,
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
    completedPOIActions: []
  };
}
