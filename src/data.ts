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

export interface Region {
  id: string;
  name: string;
  description: string;
  bgImage: string;
}

export const REGIONS: Region[] = [
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
  district: string; // Region ID e.g. "aurus", "docks", "downtown", "satoshi"
  description: string;
  image: string; // Scenic close-up inside the POI
  x: number; // percentage coordinate on map grids
  y: number; // percentage coordinate on map grids
  type: "safehouse" | "social" | "shop" | "hiring" | "arcane" | "combat";
  buttons: string[];
}

export const MAP_POIS: MapPOI[] = [
  // 1. AURUS DISTRICT
  {
    id: "hideout",
    name: "Main Headquarters (The Hideout)",
    district: "aurus",
    description: "Your secure safehouse tucked below the metal alleys of Aurus District. Cybermatic components, workbench monitors, and spare batteries line the walls. Here, you can rest safely to reset your vital parameters.",
    image: "/src/assets/images/scene_hideout_1782169616757.jpg",
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
    description: "A dim, synth-pulsing cyberbar dripping in fuchsia lights. Mercs, street operators, and hackers lounge in leather booths behind holographic smoke. Agent Jax sits in the far booth planning rebellious runs against corporate tracking nets.",
    image: "/src/assets/images/scene_neon_bar_1782169575784.jpg",
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
    name: "Apex Armory & Augment Labs",
    district: "aurus",
    description: "The clean clinical testing floors of Apex Corp arms distribution network. Modern weapon brackets glow under plexiglass hooks. Chancellor Aria coordinates strategic operations here, offering high-level credit payments for hazardous hunts.",
    image: "/src/assets/images/scene_apex_armory_1782169656111.jpg",
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
    description: "A private high-rise enlistment suite. Ambient water curtains partition glass desk offices. Elite freelance hackers, cyber-ninjas, and guards await high-stakes work orders here.",
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

  // 2. DOCKS REGION
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
    image: "/src/assets/images/scene_wetlands_1782169559223.jpg",
    x: 75,
    y: 70,
    type: "combat",
    buttons: [
      "Hunt Toxic Swamp Beast",
      "Scavenge Glowing Slime pools",
      "Search Discarded Sewer Grates"
    ]
  },

  // 3. DOWNTOWN REGION
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

  // 4. SATOSHI SQUARE REGION
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
    description: "A magnificent architectural peak. Floating digital rings display cryptocurrency indexes. Technocrats and elite network executives gather under golden light columns.",
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
  return {
    district: "aurus", // Stored as lower case region identifier
    poi: "Main Headquarters (The Hideout)",
    hp: archetype.maxHp,
    maxHp: archetype.maxHp,
    mana: archetype.maxMana,
    maxMana: archetype.maxMana,
    credits: archetype.credits,
    party: [],
    activeQuests: ["Main: Find Outcast Coordinator Agent Jax at 'The Neon Abyss Bar' located in Aurus District slums."],
    completedQuests: [],
    inventory: [...archetype.startingEquipment],
    companions: [...INITIAL_COMPANIONS],
    combatState: null,
    archetype: archetype.name,
    level: 1,
    experience: 0,
    day: 1,
    timeOfDay: "Morning"
  };
}
