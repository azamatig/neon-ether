import { GameState, CompanionState, QuestState } from "./types";
import vicePortrait from "./assets/characters/vice/vice_portrait.png";
import trackerPortrait from "./assets/characters/tracker/tracker_portrait.png";
import ventilationBg from "./assets/images/ventilation_bg.png";
import reactorWell from "./assets/images/reactor_well.png";
import subTermBg from "./assets/images/sub-term.png";
import heavyBlastDoorBg from "./assets/images/heavyblastdoor.png";
import transitBg from "./assets/images/transit.png";
import srScBg from "./assets/images/SR_SC.png";
import scCaBg from "./assets/images/SC_CA.png";
import aurusDistrictBg from "./assets/images/aurus-district.png";

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
    bio: "Ex-Apex Cyber-Dynamics black-ops. Discarded after a botched corporate raid. Highly skilled with stealth, active camo, and mono-blade systems.",
    avatar: "🥷",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Vex",
    fee: 80,
    status: "available",
    role: "Techno-Mage Decryptor",
    bio: "Nerve-fried hacker hailing from the Iron Coven syndicates. Specializes in burning through firewalls and siphoning bank feeds.",
    avatar: "🔮",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Brick",
    fee: 90,
    status: "available",
    role: "Heavy Cyber-Orc Mercenary",
    bio: "A bio-engineered street enforcer measuring seven feet of alloy, muscle, and malice. Brings massive damage mitigation and heavy firearms.",
    avatar: "🦾",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
  },
  {
    name: "Trigger",
    fee: 95,
    status: "available",
    role: "Vanguard Gunner / Heavy Marksman",
    bio: "Former syndicate heavy weapons expert. Carries a modified plasma rifle with long-range armor-piercing rounds.",
    avatar: "🔫",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"
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
  rarity?: "common" | "deluxe" | "epic" | "legendary";
  specialEffect?: string;
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
  // --- NEW COMMON ITEMS (WHITE) ---
  "Electric Baton": {
    name: "Electric Baton",
    slot: "meleeWeapon",
    rarity: "common",
    desc: "A low-cost shock baton designed to subdue targets (+6 melee damage, +1 Str).",
    stats: { meleeAtk: 6, str: 1 }
  },
  "Cheap Combat Armor": {
    name: "Cheap Combat Armor",
    slot: "armor",
    rarity: "common",
    desc: "Mass-produced corporate surplus armored vest (+15 Max HP, +5 Shields).",
    stats: { maxHp: 15, startingShields: 5 }
  },
  "Recruit's Shock-Baton": {
    name: "Recruit's Shock-Baton",
    slot: "meleeWeapon",
    rarity: "common",
    desc: "A standard security force baton. Delivers brief electrostatic discharge (+5 melee damage, +1 Str).",
    stats: { meleeAtk: 5, str: 1 }
  },
  "Corpo Security Pistol": {
    name: "Corpo Security Pistol",
    slot: "rangedWeapon",
    rarity: "common",
    desc: "Standard issue light semi-automatic pistol (+4 range damage, +1 Dex).",
    stats: { rangeAtk: 4, dex: 1 }
  },
  "Reinforced Kevlar Jacket": {
    name: "Reinforced Kevlar Jacket",
    slot: "armor",
    rarity: "common",
    desc: "A common protective vest lined with light alloy sheets (+15 Max HP, +5 Shields).",
    stats: { maxHp: 15, startingShields: 5 }
  },
  "Carbon-Mesh Visor": {
    name: "Carbon-Mesh Visor",
    slot: "headpiece",
    rarity: "common",
    desc: "A basic glare-shielding scanner visor (+5 Max Mana, +1 Int).",
    stats: { maxMana: 5, int: 1 }
  },
  "Copper-Wire Ring": {
    name: "Copper-Wire Ring",
    slot: "trinket",
    rarity: "common",
    desc: "A simple ring constructed from scrap wiring (+5 Max Mana, +1 Eth).",
    stats: { maxMana: 5, eth: 1 }
  },

  // --- EXISTING DELUXE ITEMS (BLUE) ---
  "Vibroblade": {
    name: "Vibroblade",
    slot: "meleeWeapon",
    rarity: "deluxe",
    desc: "A high-frequency vibrational blade that slices through heavy composite armor with ease (+12 melee damage, +2 Str, +2 Dex).",
    stats: { meleeAtk: 12, str: 2, dex: 2 }
  },
  "Battle Pistol BP132": {
    name: "Battle Pistol BP132",
    slot: "rangedWeapon",
    rarity: "deluxe",
    desc: "A heavy-caliber kinetic handgun known for its reliability and stopping power (+10 range damage, +2 Dex).",
    stats: { rangeAtk: 10, dex: 2 }
  },
  "Light Neon Leather Armor": {
    name: "Light Neon Leather Armor",
    slot: "armor",
    rarity: "deluxe",
    desc: "Stylish protective leather laced with glow-strips and kinetic dispersion fiber (+20 Max HP, +10 Shields).",
    stats: { maxHp: 20, startingShields: 10 }
  },
  "Nano-alloy Katana": {
    name: "Nano-alloy Katana",
    slot: "meleeWeapon",
    rarity: "deluxe",
    desc: "A carbon-folded edge with localized induction heating (+15 melee damage, +3 Str, +3 Dex).",
    specialEffect: "Monomolecular edge: Ignites a brief electrical spark on landing an AP strike.",
    stats: { meleeAtk: 15, str: 3, dex: 3 }
  },
  "Coven Spell-Slicing Focus": {
    name: "Coven Spell-Slicing Focus",
    slot: "meleeWeapon",
    rarity: "deluxe",
    desc: "An organic ether tuning matrix that aligns synaptic currents (+20 max mana, +4 Eth, +3 Int).",
    specialEffect: "Spell resonance: Direct magic spells cast cost 2 less Mana.",
    stats: { maxMana: 20, eth: 4, int: 3 }
  },
  "Horizon Smart-Pistol": {
    name: "Horizon Smart-Pistol",
    slot: "rangedWeapon",
    rarity: "deluxe",
    desc: "A tactical pistol linked directly to your ocular nodes (+12 range damage, +4 Dex).",
    specialEffect: "Target-Lock HUD: Reveals cloaked grid outlaws.",
    stats: { rangeAtk: 12, dex: 4 }
  },
  "Nanoshell Vest": {
    name: "Nanoshell Vest",
    slot: "armor",
    rarity: "deluxe",
    desc: "Flexible kinetic dispersal wear (+25 Max HP, +15 Shields).",
    specialEffect: "Kinetic absorption: Absorbs 10% of standard grid-combat impact.",
    stats: { maxHp: 25, startingShields: 15 }
  },
  "Smart-Targeting Visor": {
    name: "Smart-Targeting Visor",
    slot: "headpiece",
    rarity: "deluxe",
    desc: "Adds telemetry targeters (+15 Max Mana, +4 Dex, +4 Int).",
    specialEffect: "Optic zoom: Range attacks gain +1 grid unit targeting distance.",
    stats: { maxMana: 15, dex: 4, int: 4 }
  },
  "Technical Signal Core": {
    name: "Technical Signal Core",
    slot: "headpiece",
    rarity: "deluxe",
    desc: "Ocular HUD decryptor (+10 Max Mana, +4 Int, +3 Eth).",
    specialEffect: "Signal Boost: Decoupled code channels grant +2 Intellect.",
    stats: { maxMana: 10, int: 4, eth: 3 }
  },
  "Titanium Alloy Headgear": {
    name: "Titanium Alloy Headgear",
    slot: "headpiece",
    rarity: "deluxe",
    desc: "Heavily reinforced helmet protecting brain co-processors (+20 Max HP, +5 Str, +3 Will).",
    specialEffect: "Impact buffer: Reduces incoming head-shatter stun chances by 50%.",
    stats: { maxHp: 20, str: 5, will: 3 }
  },
  "Charged Ley-Matrix": {
    name: "Charged Ley-Matrix",
    slot: "trinket",
    rarity: "deluxe",
    desc: "High-grade ley-line battery capturing ambient stray ether (+25 Max Mana, +5 Eth).",
    specialEffect: "Ley siphon: Reclaims +4 Mana at the beginning of each player combat turn.",
    stats: { maxMana: 25, eth: 5 }
  },
  "Icebreaker Override Core": {
    name: "Icebreaker Override Core",
    slot: "trinket",
    rarity: "deluxe",
    desc: "Hacks network gate barriers (+10 Max Mana, +3 Int, +3 Eth).",
    specialEffect: "Icebreaker: Slicing secure firewalls becomes twice as efficient.",
    stats: { maxMana: 10, int: 3, eth: 3 }
  },
  "Cyber-Totem of Outcasts": {
    name: "Cyber-Totem of Outcasts",
    slot: "trinket",
    rarity: "deluxe",
    desc: "A token constructed from broken motherboard circuits (+15 Max HP, +15 Max Mana, +3 Will).",
    specialEffect: "Outcast resolve: Restores +5 HP upon triggering any terminal lock.",
    stats: { maxHp: 15, maxMana: 15, will: 3 }
  },
  "Prismatic Ether Crystal": {
    name: "Prismatic Ether Crystal",
    slot: "trinket",
    rarity: "deluxe",
    desc: "Crystalline matrix glowing with neon magic power (+25 Max Mana, +5 Eth).",
    specialEffect: "Rainbow pulse: Increases magic spell range by +1 grid tile.",
    stats: { maxMana: 25, eth: 5 }
  },
  "Unstable Plasma Core": {
    name: "Unstable Plasma Core",
    slot: "trinket",
    rarity: "deluxe",
    desc: "Volatile containment cell pulsating energy (+10 Max HP, +10 Max Mana, +4 Str, +4 Dex).",
    specialEffect: "Plasma leakage: Combat strikes deal +3 extra volatile heat damage.",
    stats: { maxHp: 10, maxMana: 10, str: 4, dex: 4 }
  },

  // --- EXISTING EPIC ITEMS (PURPLE) ---
  "Tactical Cyber-SMG": {
    name: "Tactical Cyber-SMG",
    slot: "rangedWeapon",
    rarity: "epic",
    desc: "A rapid-firing firearm with smart telemetry recoil dampeners (+18 range damage, +3 Dex, +2 Int).",
    specialEffect: "Burst-fire: Deals +15% more damage to outlaws on consecutive hits.",
    stats: { rangeAtk: 18, dex: 3, int: 2 }
  },
  "Apex Mantis electro-blade": {
    name: "Apex Mantis electro-blade",
    slot: "meleeWeapon",
    rarity: "epic",
    desc: "Surgical lightning weapon that cuts armor plates (+25 melee damage, +5 Str, +3 Dex).",
    specialEffect: "Armor melting: Decreases enemy armor ratings by 5 upon hit.",
    stats: { meleeAtk: 25, str: 5, dex: 3 }
  },
  "Coven Ether-deck v3": {
    name: "Coven Ether-deck v3",
    slot: "meleeWeapon",
    rarity: "epic",
    desc: "Magical amplification cyberdeck (+30 max mana, +6 Eth, +5 Int).",
    specialEffect: "Overdrive: Fully charges magic attributes, granting +2 Action Points at start.",
    stats: { maxMana: 30, eth: 6, int: 5 }
  },
  "Exo-Plated Mesh Armor": {
    name: "Exo-Plated Mesh Armor",
    slot: "armor",
    rarity: "epic",
    desc: "Nanotube composite armor with high density plating (+40 Max HP, +30 Shields, +4 Str).",
    specialEffect: "Aegis mesh: Regenerates +10 shields per turn under cover.",
    stats: { maxHp: 40, startingShields: 30, str: 4 }
  },
  "Syndicate Heavy Armor": {
    name: "Syndicate Heavy Armor",
    slot: "armor",
    rarity: "epic",
    desc: "Slab alloy protection used by corporate enforcers (+60 Max HP, +40 Shields, -2 Dex).",
    specialEffect: "Lead plating: Gain immunity to stun and paralysis effects.",
    stats: { maxHp: 60, startingShields: 40, dex: -2 }
  },

  // --- EXISTING & NEW LEGENDARY ITEMS (GOLD) ---
  "Heavy Plasma Cannon": {
    name: "Heavy Plasma Cannon",
    slot: "rangedWeapon",
    rarity: "legendary",
    desc: "Syndicate demolition railgun (+35 physical damage, -3 Dex, +5 Str).",
    specialEffect: "Singularity: Attacks deal heavy area of effect damage on a 4-tile distance.",
    stats: { rangeAtk: 35, dex: -3, str: 5 }
  },
  "Legendary 'Doomsday' Singularity Core": {
    name: "Legendary 'Doomsday' Singularity Core",
    slot: "trinket",
    rarity: "legendary",
    desc: "Volatile miniature black hole generator (+40 Max Mana, +5 Int, +5 Eth).",
    specialEffect: "Singularity: Direct spells hit with +50% explosive feedback.",
    stats: { maxMana: 40, int: 5, eth: 5 }
  },
  "Legendary 'Chrono-Shift' Reflex Augment": {
    name: "Legendary 'Chrono-Shift' Reflex Augment",
    slot: "headpiece",
    rarity: "legendary",
    desc: "Quantum cerebral accelerator syncing with nervous pathways (+25 Max HP, +6 Dex, +4 Str).",
    specialEffect: "Time Dilation: Start grid combat with +1 extra Action Point (AP).",
    stats: { maxHp: 25, dex: 6, str: 4 }
  },
  "Archon's Kinetic Shock-Plate": {
    name: "Archon's Kinetic Shock-Plate",
    slot: "armor",
    rarity: "legendary",
    desc: "Experimental force-field absorption chestplate (+80 Max HP, +50 Shields, +5 Str, +5 Will).",
    specialEffect: "Static Shielding: Take -5 damage from all enemy grid-attacks.",
    stats: { maxHp: 80, startingShields: 50, str: 5, will: 5 }
  },

  // --- CONSUMABLES & VALUABLES ---
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
  },
  "Synthetic Muscle Splice": {
    name: "Synthetic Muscle Splice",
    slot: "trinket",
    rarity: "deluxe",
    desc: "Increases strength and reflex speeds (+10 Max HP, +2 Str).",
    stats: { maxHp: 10, str: 2 }
  },
  "Chrono-Shift Augment": {
    name: "Chrono-Shift Augment",
    slot: "trinket",
    rarity: "epic",
    desc: "High-end corporate reflex booster (+15 Max HP, +30 Max Mana, +2 Dex).",
    stats: { maxHp: 15, maxMana: 30, dex: 2 }
  },
  "Stolen Weapon Crate": {
    name: "Stolen Weapon Crate",
    slot: "valuable",
    rarity: "deluxe",
    desc: "A heavy shipping crate carrying high-grade experimental kinetic rifles."
  },
  "Neural Regulator": {
    name: "Neural Regulator",
    slot: "valuable",
    rarity: "deluxe",
    desc: "Military-grade neural processor harvested from Ares defense drone patrol cores."
  },
  "Prototype Singularity Battery": {
    name: "Prototype Singularity Battery",
    slot: "valuable",
    rarity: "legendary",
    desc: "An extremely high-density energy battery containing cold-fusion containment fields."
  },
  "VIP Afterlife Keycard": {
    name: "VIP Afterlife Keycard",
    slot: "valuable",
    rarity: "deluxe",
    desc: "Cipher's personal security bypass keycard used for Club Afterlife VIP decks."
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
    bgImage: aurusDistrictBg
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
  },
  {
    id: "waste_barrens",
    name: "Grid Waste-Barrens",
    description: "The toxic outskirts of Megacity-9. Towering heaps of discarded mainframes, green-glowing radioactive runoff channels, and severe electromagnetic lightning storms define this unmapped frontier.",
    bgImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "kurogane_industrial",
    name: "Kurogane Heavy Industrial",
    description: "Multi-tiered heavy robotic factories and automated steel lifters. Deep orange sparks fly from high-pressure molten blast furnaces and magnetic crane routes.",
    bgImage: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "hyperion_cathedral",
    name: "Hyperion Neo-Cathedral",
    description: "A breathtaking cyber-gothic cathedral constructed around giant server arrays. Majestic digital stained-glass windows project vibrant violet patterns across hyper-conducting copper spires.",
    bgImage: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=1200"
  }
];

export interface TravelConnection {
  targetRegionId: string;
  label: string;
  x: number;
  y: number;
  direction: "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";
}

export const REGION_CONNECTIONS: Record<string, TravelConnection[]> = {
  aurus: [
    { targetRegionId: "docks", label: "WEST TRANSIT: THE DOCKS", x: 6, y: 50, direction: "W" },
    { targetRegionId: "downtown", label: "EAST TRANSIT: DOWNTOWN CORRIDORS", x: 94, y: 50, direction: "E" },
    { targetRegionId: "satoshi", label: "NORTH TRANSIT: SATOSHI SQUARE", x: 50, y: 10, direction: "N" }
  ],
  docks: [
    { targetRegionId: "aurus", label: "EAST TRANSIT: AURUS SLUMS", x: 94, y: 50, direction: "E" },
    { targetRegionId: "kurogane_industrial", label: "SOUTH TRANSIT: KUROGANE FACTORIES", x: 50, y: 90, direction: "S" }
  ],
  downtown: [
    { targetRegionId: "aurus", label: "WEST TRANSIT: AURUS SLUMS", x: 6, y: 50, direction: "W" },
    { targetRegionId: "satoshi", label: "NORTH-WEST: SATOSHI SQUARE", x: 30, y: 10, direction: "NW" },
    { targetRegionId: "hyperion_cathedral", label: "EAST: HYPERION CATHEDRAL", x: 94, y: 50, direction: "E" }
  ],
  satoshi: [
    { targetRegionId: "aurus", label: "SOUTH TRANSIT: AURUS SLUMS", x: 50, y: 90, direction: "S" },
    { targetRegionId: "downtown", label: "SOUTH-EAST: DOWNTOWN CORRIDORS", x: 82, y: 90, direction: "SE" },
    { targetRegionId: "waste_barrens", label: "NORTH: THE WASTELAND GRID", x: 50, y: 10, direction: "N" }
  ],
  waste_barrens: [
    { targetRegionId: "satoshi", label: "SOUTH TRANSIT: SATOSHI SQUARE", x: 50, y: 90, direction: "S" },
    { targetRegionId: "kurogane_industrial", label: "WEST: KUROGANE INDUSTRIAL", x: 6, y: 50, direction: "W" },
    { targetRegionId: "hyperion_cathedral", label: "EAST: HYPERION CATHEDRAL", x: 94, y: 50, direction: "E" }
  ],
  kurogane_industrial: [
    { targetRegionId: "docks", label: "NORTH TRANSIT: THE DOCKS", x: 50, y: 10, direction: "N" },
    { targetRegionId: "waste_barrens", label: "EAST TRANSIT: THE WASTELAND GRID", x: 94, y: 50, direction: "E" }
  ],
  hyperion_cathedral: [
    { targetRegionId: "downtown", label: "WEST TRANSIT: DOWNTOWN CORRIDORS", x: 6, y: 50, direction: "W" },
    { targetRegionId: "waste_barrens", label: "NORTH-WEST: THE WASTELAND GRID", x: 30, y: 10, direction: "NW" }
  ]
};

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
    image: ventilationBg,
    x: 15,
    y: 80,
    type: "quest",
    buttons: ["[SCENE:prologue_ventilation] Open Ventilation Breach Scene"]
  },
  {
    id: "security_terminal",
    name: "Security Sub-Terminal",
    district: "conduit09",
    description: "A buzzing sub-grid terminal flashing corporate warning logs. Tracker gestures at the hardware: 'This sub-terminal bridges the outer perimeter alarm nodes. If you have the INT, you can bypass the firewall and scavenge some valuable copper Rusted Circuitry.' Vice laughs: 'I'll keep watch while you operate.'",
    image: subTermBg,
    x: 45,
    y: 55,
    type: "quest",
    buttons: ["[SCENE:prologue_security_terminal] Open Security Terminal Scene"]
  },
  {
    id: "blast_door",
    name: "Heavy Blast Door",
    district: "conduit09",
    description: "A solid titanium bulkhead door blocking access to the core. Red security locks pulse defensively. Tracker spits: 'This thing is reinforced. You can either use pure physical force to pry open the auxiliary hydraulic valve, or find another way. What's your STR state looking like, rookie?'",
    image: heavyBlastDoorBg,
    x: 75,
    y: 40,
    type: "quest",
    buttons: ["[SCENE:prologue_blast_door] Open Heavy Blast Door Scene"]
  },
  {
    id: "section_gate",
    name: "Next Section Gate (Transit)",
    district: "conduit09",
    description: "A heavy transit hatch linking Conduit 09 directly to Shatter-Ridge Core. The digital terminal panel glows yellow. Tracker yells: 'The route is clear. Get inside! Once we seal this hatch, there is no returning back.' Vice nods solemnly: 'Get ready, the real array is just ahead.'",
    image: transitBg,
    x: 90,
    y: 20,
    type: "quest",
    buttons: ["[SCENE:prologue_section_gate] Open Shatter-Ridge Transit Scene"]
  },

  // ---- MAP 2: CORE ARRAY SHATTER-RIDGE ----
  {
    id: "shatter_ridge_security_post",
    name: "Shatter-Ridge Security Checkpoint",
    district: "shatter_ridge_core",
    description: "A fortified cyber-barrier flashing defensive warnings. Heavy steel lockers line the checkpoint walls. To advance deeper, you must find a way to disable the barrier or search the lockers. Vice keeps a steady hand on his weapon: 'Corporate security was here recently. Watch the tripwires.'",
    image: srScBg,
    x: 20,
    y: 70,
    type: "quest",
    buttons: ["[SCENE:prologue_security_checkpoint] Open Security Checkpoint Scene"]
  },
  {
    id: "shatter_ridge_reactor_well",
    name: "Shatter-Ridge Reactor Well",
    district: "shatter_ridge_core",
    description: "A boiling pool of toxic bio-coolant fluid casting eerie turquoise shadows. A suspended hydraulic arm holds a locked cargo crate directly over the pool. Tracker points: 'That crate was scheduled for shipping to Ares Elite Headquarters. It has premium tech inside if we can lower it.'",
    image: reactorWell,
    x: 50,
    y: 45,
    type: "quest",
    buttons: ["[SCENE:prologue_reactor_well] Open Reactor Well Scene"]
  },
  {
    id: "main_array_core",
    name: "Core Array Shatter-Ridge",
    district: "shatter_ridge_core",
    description: "A majestic array of glowing blue power cells humming in vertical columns. As Tracker begins a manual security check bypass, his terminal flashes a critical red warning! Tracker yells: 'System fault! The corporate mainframe rejected my encryption key! Hostile drones are deploying!' Vice unsheathes his plasma pistol: 'Engage combat systems!'",
    image: scCaBg,
    x: 80,
    y: 30,
    type: "combat",
    buttons: ["[SCENE:prologue_core_array] Open Core Array Defense Scene"]
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
    buttons: ["[SCENE:prologue_vault_terminal] Open Sanctuary Terminal Scene"]
  },
  {
    id: "relic_altar",
    name: "Mysterious Relic Altar",
    district: "data_vault",
    description: "Behind the hacked console, a heavy obsidian altar slides open. A floating, golden relic device of unknown origin hums with a warm, terrifying psych-ether frequency. Shadows dance across the cracked concrete wall, reflecting the relic's heartbeat-like pulse.",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
    x: 75,
    y: 40,
    type: "quest",
    buttons: ["[SCENE:relic_altar] Open Relic Altar Scene"]
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
      "Manage Passive Server Work",
      "Base Crew Management (NPCs)",
      "🔌 Access Cyber-Lab Clinic",
      "🛠️ Open Gear Modding Terminal"
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
      "Approach Lost, Frightened Girl",
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
  {
    id: "auction_market",
    name: "Slave & Outcast Auction Market",
    district: "aurus",
    description: "An underground syndicate trade room filled with low-level high-flicker sodium glow pipes. Here, the Cyber-Syndicate auctions contracts of debt-outcasts, recaptured corporate defectors, and specialized servant sub-systems. You can bid to purchase their absolute contract, rescue them to join your rebel safehouse base, or put them to work.",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=600",
    x: 65,
    y: 80,
    type: "hiring",
    buttons: [
      "Enter Auction Lobby",
      "Inspect Holdout Pens",
      "Bribe Syndicate Warden (-40¤)"
    ]
  },
  {
    id: "aurus_arena",
    name: "Aurus Fighting Arena (The Pit)",
    district: "aurus",
    description: "A dark, blood-spattered underground fighting ring wrapped in flickering high-voltage hazard fences. Ruthless street gangs and corporate scouts gather here to bet on contract combat slaves and cyber-gladiators who trade blood for survival. Here you can find Mira Voss, a fierce, contract fight slave who dominates the ring.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    x: 35,
    y: 88,
    type: "quest",
    buttons: [
      "Enter the Arena Pit",
      "Challenge Mira Voss to an Action-AP Duel (Melee Check)",
      "Buy Mira Voss's Arena Contract (-200¤)",
      "Gamble on Underground Arena Fight (-50¤)"
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
      "Accept 'The Smuggler's Run' Side-Quest",
      "Deliver Recovered Weapon Crate to Freight Hub",
      "Scavenge Shipping Containers",
      "Interface with Cargo Logs"
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
  {
    id: "shipyard",
    name: "Rusty Anchor Shipyard",
    district: "docks",
    description: "An abandoned, rust-colored drydock smelling of seawater and grease. Heavy cargo container cranes dangle unstable loads. The Iron Anchor syndicate gang uses this sector to hoard stolen pre-collapse military caches.",
    image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=600",
    x: 45,
    y: 80,
    type: "combat",
    buttons: [
      "Raid Syndicate Caches (Triggers Combat!)",
      "Steal Crane Master Control Key (DEX Check)",
      "Scavenge Submerged Hull for Scrap Metal"
    ]
  },
  {
    id: "marv_clinic",
    name: "Dr. Marv's Cyber-Genetics Clinic",
    district: "docks",
    description: "A dim medical office hidden behind a pressurized hatch in Sector 3 of the docks. Dr. Marv is an ex-Ares chief geneticist who went rogue. He stitches custom bio-circuitry and cyberware for outlaws. Marv needs rare neural regulators to complete his experimental bio-stims.",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=600",
    x: 15,
    y: 20,
    type: "shop",
    buttons: [
      "Talk to Dr. Marv (Accept Side-Quest: Cybernetic Harvest)",
      "Deliver Neural Regulators to Dr. Marv",
      "Undergo Experimental Bio-Splice (STR check)"
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
  {
    id: "nouveau_chrome",
    name: "Nouveau Cybernetic Showroom",
    district: "downtown",
    description: "A glamorous, high-security boutique showroom showcasing elite cyber-implants and legendary-class defensive gear behind pressurized glass shields. The snobbish hologram dealer looks down on street-level operators: 'Our wares require extreme credit liquidity, client.' Inquire here about high-stakes heist opportunities.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
    x: 85,
    y: 25,
    type: "shop",
    buttons: [
      "Inquire about 'Nouveau Heist' Side-Quest",
      "Hack Nouveau Pressure Shields (INT check)",
      "Loot Prototype Singularity Battery"
    ]
  },
  {
    id: "club_afterlife",
    name: "Club Afterlife VIP Lounge",
    district: "downtown",
    description: "The premier multi-tiered entertainment penthouse floating between skyway arches of Downtown. Wealthy corporate suits mingle with high-profile matrix data brokers in neon lounge pools. Agent Jax's ex-associate, Cipher, holds court in the VIP booth.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    x: 55,
    y: 55,
    type: "social",
    buttons: [
      "Talk to Cipher (VIP Deck - INT Check)",
      "Buy Round of Luxury Champagne (-30¤)",
      "Eavesdrop on Corporate Executives",
      "Slip VIP Keycard into pocket (DEX Check)"
    ]
  },
  {
    id: "homicide_site",
    name: "Highwalk Homicide Site",
    district: "downtown",
    description: "A corporate skybridge sealed off with flickering yellow holo-tape. An Ares internal security drone patrol is currently scanning a pool of blood and shredded server plates. Marv's target neural regulators might be found on these patrol units.",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
    x: 15,
    y: 40,
    type: "combat",
    buttons: [
      "Ambush Security Patrols (Triggers Combat!)",
      "Hack Rebel Courier's Cyberdeck (INT Check)",
      "Search Wreckage for Cargo Pass"
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
  },
  {
    id: "scavenger_outpost",
    name: "Scavenger Junkyard Outpost",
    district: "waste_barrens",
    description: "A gritty merchant settlement constructed underneath a collapsed orbital sky-line support beam. Discarded server mainframes are sieved for obsolete crypto ledgers and cyberware alloys.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    x: 50,
    y: 65,
    type: "quest",
    buttons: [
      "Sift through server junk (INT Check)",
      "Trade with Scrap-Merchant"
    ]
  },
  {
    id: "blast_furnace_07",
    name: "Heavy Blast Furnace 07",
    district: "kurogane_industrial",
    description: "Sizzling rivers of molten titanium flow through heavy automated sorting gates. Robotic lifters hum as warning sirens flash yellow. Interfacing with the main power grid control might be profitable, but highly risky.",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600",
    x: 45,
    y: 40,
    type: "combat",
    buttons: [
      "Overload automated grid line (HACK check)",
      "Inspect thermal pipes"
    ]
  },
  {
    id: "altar_column",
    name: "High-Voltage Altar Column",
    district: "hyperion_cathedral",
    description: "A massive cyber-gothic altar surrounded by humming copper spires and glowing blue stained-glass circuits. Cyber-nuns in dark hoods recite hexadecimal litanies to calibrate neural frequencies.",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=600",
    x: 50,
    y: 45,
    type: "arcane",
    buttons: [
      "Calibrate deck at the Ley-Matrix (Will Check)",
      "Recite high-level binary litany"
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
  ],
  shipyard: [
    {
      name: "Iron Anchor Smuggler",
      hp: 75,
      maxHp: 75,
      shields: 15,
      maxShields: 15,
      attackText: "fires a rusted automatic carbine with armor-piercing bullets!",
      damageRange: [11, 20],
      creditReward: [55, 90],
      expReward: 40
    },
    {
      name: "Heavy Cargo Loader Mech",
      hp: 120,
      maxHp: 120,
      shields: 40,
      maxShields: 40,
      attackText: "smashes down with massive hydraulic clamps!",
      damageRange: [16, 26],
      creditReward: [110, 180],
      expReward: 65
    }
  ],
  homicide_site: [
    {
      name: "Ares Patrol Drone",
      hp: 70,
      maxHp: 70,
      shields: 25,
      maxShields: 25,
      attackText: "discharges a high-intensity localized plasma burst!",
      damageRange: [12, 19],
      creditReward: [50, 85],
      expReward: 40
    },
    {
      name: "Skybridge Security Enforcer",
      hp: 100,
      maxHp: 100,
      shields: 50,
      maxShields: 50,
      attackText: "fires an electrified smart-carbine!",
      damageRange: [14, 24],
      creditReward: [90, 150],
      expReward: 55
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
    party: ["Vice", "Tracker"],
    activeQuests: [], // Compatibility field; authored quest status lives in campaignQuestsRegistry.
    completedQuests: [],
    structuredQuests: [
      {
        id: "prologue",
        title: "Subsurface AI Catacombs",
        category: "Main Quest",
        description: "Infiltrate Conduit 09 with Vice and Tracker to steal corporate database crystals from Ares Biotech.",
        status: "ACTIVE",
        objectives: [
          { id: "hack_terminal", text: "Hack the cyber-vault terminal to steal corporate data crystals from Ares Biotech", current: 0, target: 1, completed: false }
        ],
        rewards: [
          { type: "experience", amount: 100 },
          { type: "credits", amount: 150 }
        ],
        log: ["Infiltrated Level B4 corridors. Evading drone alerts."]
      }
    ],
    inventory: [...archetype.startingEquipment, "High-Grade Scrap Salvage", "High-Grade Scrap Salvage", "Rusted Circuitry", "Rusted Circuitry"],
    companions: [
      {
        name: "Vice",
        fee: 0,
        status: "in_party",
        role: "Tactical Leader",
        bio: "The veteran female leader of your shadow-running cell. Rebellious and sharp in her open-duster cyberpunk leather jacket and high-tech body-gilding cybernetics. Her tactical intuition is unmatched, and her modified plasma sidearm is always warm.",
        avatar: "👩‍🎤",
        image: vicePortrait,
        equipment: {
          meleeWeapon: "Vibroblade",
          rangedWeapon: "Battle Pistol BP132",
          armor: "Light Neon Leather Armor",
          headpiece: null,
          trinket: null
        },
        inventory: []
      },
      {
        name: "Tracker",
        fee: 0,
        status: "in_party",
        role: "Vanguard Operator",
        bio: "Your squad's scout and electronic warfare specialist. Cynical, precise, and obsessed with tracing optimal infiltration vectors.",
        avatar: "📟",
        image: trackerPortrait,
        equipment: {
          meleeWeapon: "Electric Baton",
          rangedWeapon: null,
          armor: "Cheap Combat Armor",
          headpiece: null,
          trinket: null
        },
        inventory: []
      },
      ...INITIAL_COMPANIONS
    ],
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
    completedPOIActions: [],
    stamina: 100,
    maxStamina: 100,
    weather: "clear",
    baseNPCs: [],
    activeBaseNPCId: null,
    safehouseDefenses: {
      securityLevel: 1,
      turrets: 0,
      shieldStrength: 100,
      fortifiedDoors: false,
      intrusionLogs: [
        "🔋 Safehouse initial power grid linked successfully.",
        "📡 Stealth frequency beacon activated - safehouse hidden from city radars."
      ]
    },
    reputations: {
      streetOutlaws: 50,
      titanLogistics: 50,
      aresCorporate: 30
    },
    activeBranchingDialogue: null
  };
}
