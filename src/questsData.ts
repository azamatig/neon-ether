import { UnifiedQuest, GameState } from "./types";

export interface BaseProperty {
  id: string;
  name: string;
  district: string;
  cost: number;
  description: string;
  bannerImage: string;
  features: string[];
  turretSlots: number;
  maxCrewCapacity: number;
}

export const BASE_PROPERTIES: Record<string, BaseProperty> = {
  hideout: {
    id: "hideout",
    name: "Aurus Safehouse (The Hideout)",
    district: "aurus",
    cost: 0,
    description: "Your starter underground hideout beneath the rainy alleys of Aurus District. Equipped with a basic workbench, power relays, and server rack.",
    bannerImage: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=800",
    features: ["Basic Rest Quarters", "Stash Storage", "Passive Server Hacking", "Base Crew Management"],
    turretSlots: 2,
    maxCrewCapacity: 4
  },
  docks_bunker: {
    id: "docks_bunker",
    name: "Docks Subterranean Vault & Armory",
    district: "docks",
    cost: 650,
    description: "A heavily fortified naval armory bunker with automated blast shields, chemical resplicer labs, and direct access to the lower smuggling slipways.",
    bannerImage: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800",
    features: ["Reinforced Blast Doors (+40% Base Defenses)", "Heavy Weapon Workbench", "Chemical Lab (Stim Crafting)", "Wet Docks Smuggler Route"],
    turretSlots: 4,
    maxCrewCapacity: 8
  },
  satoshi_penthouse: {
    id: "satoshi_penthouse",
    name: "Satoshi Cyber-Penthouse & Zen Sanctum",
    district: "satoshi",
    cost: 1200,
    description: "A breathtaking high-rise penthouse suite overlooking glowing cherry blossom gardens. Houses an overclocked supercomputer array and private meditation gardens.",
    bannerImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800",
    features: ["Quantum Server Farm (+30% Passive Yields)", "Meditation Garden (+25 Max Mana Buff)", "Luxury Crew Suites", "High-Altitude Fast Travel Pad"],
    turretSlots: 3,
    maxCrewCapacity: 12
  },
  hyperion_spire: {
    id: "hyperion_spire",
    name: "Hyperion Neo-Cathedral Spire",
    district: "hyperion_cathedral",
    cost: 2500,
    description: "An ancient cyber-gothic high spire built directly above the planetary ley-line conduit. Amplifies all Technomancy and Mindmancer capabilities.",
    bannerImage: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=800",
    features: ["Ley-Conduit Altar (+50% Spell Power)", "Mindmancer Subjugation Chamber", "Orbital Telemetry Relay", "Impenetrable Force Barrier"],
    turretSlots: 6,
    maxCrewCapacity: 16
  }
};

export const DEFAULT_CAMPAIGN_QUESTS: UnifiedQuest[] = [
  // ==========================================
  // PROLOGUE & MAIN STORYLINE
  // ==========================================
  {
    id: "prologue",
    title: "Prologue: Subsurface AI Catacombs",
    category: "Main Quest",
    chapter: "Prologue",
    description: "Infiltrate Conduit 09 with Vice and Tracker to steal encrypted corporate database crystals from Ares Biotech.",
    narrativeBriefing: "The humidity in Conduit 09 is thick with the scent of ozone and copper runoff. Vice's combat HUD is blinking red. You have one operational window to breach the subterranean vault before Ares security cycles their encrypted frequencies.",
    giverNPC: "Vice",
    giverPOI: "Subsurface AI Catacombs (Conduit 09)",
    minLevel: 1,
    prerequisiteQuestId: "",
    nextQuestId: "outcast_directive",
    status: "ACTIVE",
    log: ["Infiltrated Level B4 corridors with squad. Terminal firewall located."],
    stages: [
      {
        id: "prologue_ventilation",
        stageIndex: 1,
        title: "Cross the Ventilation Shaft",
        description: "Slip through the variable-frequency fan blades or use an emergency override to reach the Security Sub-Terminal.",
        objectiveType: "interact_poi",
        targetPOI: "Ventilation Shaft (Entry Point)",
        targetPOIId: "ventilation_shaft",
        targetDistrict: "conduit09",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "ventilation_shaft:slip",
        linkedPOISceneId: "prologue_ventilation",
        linkedPOISceneStepId: "entry"
      },
      {
        id: "prologue_security_terminal",
        stageIndex: 2,
        title: "Bypass the Security Sub-Terminal",
        description: "Slice the alarm sub-grid and open the route to the Heavy Blast Door.",
        objectiveType: "hack_terminal",
        targetPOI: "Security Sub-Terminal",
        targetPOIId: "security_terminal",
        targetDistrict: "conduit09",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "security_terminal:bypass",
        linkedPOISceneId: "prologue_security_terminal",
        linkedPOISceneStepId: "console"
      },
      {
        id: "prologue_blast_door",
        stageIndex: 3,
        title: "Open the Heavy Blast Door",
        description: "Force the hydraulic valve while Vice and Tracker cover the corridor.",
        objectiveType: "interact_poi",
        targetPOI: "Heavy Blast Door",
        targetPOIId: "blast_door",
        targetDistrict: "conduit09",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "blast_door:pry",
        linkedPOISceneId: "prologue_blast_door",
        linkedPOISceneStepId: "door"
      },
      {
        id: "prologue_section_gate",
        stageIndex: 4,
        title: "Transit to Shatter-Ridge Core",
        description: "Use the Next Section Gate and complete the squad insertion briefing.",
        objectiveType: "interact_poi",
        targetPOI: "Next Section Gate (Transit)",
        targetPOIId: "section_gate",
        targetDistrict: "conduit09",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "section_gate:transit",
        linkedPOISceneId: "prologue_section_gate",
        linkedPOISceneStepId: "transit"
      },
      {
        id: "prologue_security_checkpoint",
        stageIndex: 5,
        title: "Disable the Shatter-Ridge Security Checkpoint",
        description: "Overclock the defensive grid and disable the checkpoint barrier.",
        objectiveType: "hack_terminal",
        targetPOI: "Shatter-Ridge Security Checkpoint",
        targetPOIId: "shatter_ridge_security_post",
        targetDistrict: "shatter_ridge_core",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "shatter_ridge_security_post:gate",
        linkedPOISceneId: "prologue_security_checkpoint",
        linkedPOISceneStepId: "checkpoint"
      },
      {
        id: "prologue_reactor_well",
        stageIndex: 6,
        title: "Cross the Shatter-Ridge Reactor Well",
        description: "Inspect the reactor well, then proceed through the maintenance route to the Main Array.",
        objectiveType: "interact_poi",
        targetPOI: "Shatter-Ridge Reactor Well",
        targetPOIId: "shatter_ridge_reactor_well",
        targetDistrict: "shatter_ridge_core",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "shatter_ridge_reactor_well:transit",
        linkedPOISceneId: "prologue_reactor_well",
        linkedPOISceneStepId: "well"
      },
      {
        id: "prologue_core_array",
        stageIndex: 7,
        title: "Defend the Core Array",
        description: "Destroy the autonomous security drones while Tracker bypasses the primary locks.",
        objectiveType: "kill_target",
        targetPOI: "Core Array Shatter-Ridge",
        targetPOIId: "main_array_core",
        targetDistrict: "shatter_ridge_core",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "main_array_core:defended",
        linkedPOISceneId: "prologue_core_array",
        linkedPOISceneStepId: "ambush"
      },
      {
        id: "prologue_vault_terminal",
        stageIndex: 8,
        title: "Hack the Sanctuary Terminal",
        description: "Decrypt the primary cyber-vault and extract the Ares Data Crystal.",
        objectiveType: "hack_terminal",
        targetPOI: "Sanctuary Hacking Terminal",
        targetPOIId: "terminal_hacking_puzzle",
        targetDistrict: "data_vault",
        targetItem: "Ares Data Crystal",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "terminal_hacking_puzzle:hacked",
        linkedPOISceneId: "prologue_vault_terminal",
        linkedPOISceneStepId: "terminal"
      },
      {
        id: "prologue_relic_altar",
        stageIndex: 9,
        title: "Survive the Relic Altar Ambush",
        description: "Investigate the relic, awaken Mindmancy, and repel the Ares strike team.",
        objectiveType: "kill_target",
        targetPOI: "Mysterious Relic Altar",
        targetPOIId: "relic_altar",
        targetDistrict: "data_vault",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "relic_altar:ambush_survived",
        linkedPOISceneId: "relic_altar",
        linkedPOISceneStepId: "intro"
      },
      {
        id: "prologue_escape",
        stageIndex: 10,
        title: "Escape to the Aurus Safehouse",
        description: "Resolve the captured officer's fate, salvage Tracker's gear, and escape with Vice to Aurus.",
        objectiveType: "custom_choice",
        targetPOI: "Mysterious Relic Altar",
        targetPOIId: "relic_altar",
        targetDistrict: "data_vault",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "prologue:escaped",
        linkedPOISceneId: "prologue_escape",
        linkedPOISceneStepId: "officer"
      }
    ],
    rewards: {
      credits: 250,
      experience: 150,
      items: ["Nano Med-Stim (Heal)", "Ether battery", "Vibroblade"],
      reputation: { streetOutlaws: 25, aresCorporate: -20 },
      worldUnlocks: {
        unlockBaseId: "hideout",
        unlockDistrictId: "aurus",
        unlockPerkOrSkill: "Mindmancer Unleashed"
      }
    }
  },

  {
    id: "outcast_directive",
    title: "Main Quest 1: Outcast Directive",
    category: "Main Quest",
    chapter: "Chapter 1: The Outcast Spark",
    description: "Traverse to Shatter Ridge Corridors in Downtown Region, seize the copper Technical Signal Core, and deliver it to Agent Jax at the Neon Abyss Bar.",
    narrativeBriefing: "Vice went dark during the vault evacuation. Agent Jax has tracked high-priority corporate telemetry to the derelict highwalks of Shatter Ridge. Recover the signal core before scavengers melt it down.",
    giverNPC: "Agent Jax",
    giverPOI: "Neon Abyss Bar (Conduit 09)",
    minLevel: 1,
    prerequisiteQuestId: "prologue",
    nextQuestId: "corporate_hunt",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "mq1_s1",
        stageIndex: 1,
        title: "Secure the Technical Signal Core",
        description: "Search the debris in Shatter Ridge Corridors (Downtown Region) and extract the core.",
        objectiveType: "collect_item",
        targetPOI: "Shatter Ridge Corridors",
        targetPOIId: "shatter_ridge",
        targetDistrict: "downtown",
        targetItem: "Technical Signal Core",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "outcast:core_secured",
        linkedPOISceneId: "outcast_core_recovery",
        linkedPOISceneStepId: "search",
        operationalPaths: [
          {
            id: "mq1_p1_search",
            label: "[Perception / DEX 11] Navigate high-voltage catwalks silently",
            checkType: "dex",
            checkValue: 11,
            outcomeDesc: "You slip past patrolling drones unnoticed and detach the core cleanly.",
            grantsBonusXP: 40
          },
          {
            id: "mq1_p1_fight",
            label: "[Combat] Obliterate the Orc scavenger guard squad",
            checkType: "none",
            outcomeDesc: "You gun down the scavengers and rip the core from their salvage wagon.",
            grantsBonusItem: "Rusted Circuitry"
          }
        ]
      },
      {
        id: "mq1_s2",
        stageIndex: 2,
        title: "Deliver Core to Agent Jax",
        description: "Meet Agent Jax at Neon Abyss Bar in Conduit 09 to decrypt the data stream.",
        objectiveType: "talk_npc",
        targetPOI: "Neon Abyss Bar",
        targetPOIId: "bar",
        targetDistrict: "conduit09",
        targetNPC: "Agent Jax",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "outcast:delivered",
        linkedPOISceneId: "outcast_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 200,
      experience: 120,
      items: ["Recruit's Shock-Baton", "Auxiliary Stimulant"],
      reputation: { streetOutlaws: 20, titanLogistics: 10 }
    }
  },

  {
    id: "corporate_hunt",
    title: "Main Quest 2: Corporate Hunt",
    category: "Main Quest",
    chapter: "Chapter 1: The Outcast Spark",
    description: "Travel to Sludge Conduits in Docks Region, engage the Toxic Sludge Behemoth to secure its Acid Beast Core, and deliver it to Chancellor Aria at Apex Armory.",
    narrativeBriefing: "The decoded telemetry revealed that Ares Biotech is dumping mutagenic chemicals into the Docks waterways to mask their illegal cybernetics tests. Eliminate the mutated monstrosity and seize the biological catalyst.",
    giverNPC: "Chancellor Aria",
    giverPOI: "Apex Armory (Downtown)",
    minLevel: 2,
    prerequisiteQuestId: "outcast_directive",
    nextQuestId: "syndicate_catalyst",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "mq2_s1",
        stageIndex: 1,
        title: "Defeat the Toxic Sludge Behemoth",
        description: "Infiltrate Sludge Conduits (Docks) and destroy the bio-engineered Behemoth.",
        objectiveType: "kill_target",
        targetPOI: "Sludge Conduits",
        targetPOIId: "sludge_conduits",
        targetDistrict: "docks",
        targetItem: "Acid Beast Core",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "corporate_hunt:behemoth_defeated",
        linkedPOISceneId: "corporate_hunt_behemoth",
        linkedPOISceneStepId: "hunt",
        operationalPaths: [
          {
            id: "mq2_p1_science",
            label: "[Intelligence 13] Synthesize chemical neutralizer before combat",
            checkType: "int",
            checkValue: 13,
            outcomeDesc: "The neutralizer melts the Behemoth's corrosive outer shell, making combat effortless!",
            grantsBonusXP: 50
          },
          {
            id: "mq2_p1_heavy",
            label: "[Strength 14] Slam the industrial pipe valves to crush the beast",
            checkType: "str",
            checkValue: 14,
            outcomeDesc: "A blast of superheated steam pins the beast to the bulkhead while you finish it off.",
            grantsBonusCredits: 75
          }
        ]
      },
      {
        id: "mq2_s2",
        stageIndex: 2,
        title: "Turn in Acid Beast Core to Chancellor Aria",
        description: "Deliver the Acid Beast Core to Chancellor Aria at Apex Armory in Downtown.",
        objectiveType: "talk_npc",
        targetPOI: "Apex Armory",
        targetPOIId: "armory",
        targetDistrict: "downtown",
        targetNPC: "Chancellor Aria",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "corporate_hunt:delivered",
        linkedPOISceneId: "corporate_hunt_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 280,
      experience: 160,
      items: ["Apex Mantis electro-blade", "Synthetic Muscle Splice"],
      reputation: { titanLogistics: 25, aresCorporate: -20 },
      worldUnlocks: {
        unlockBaseId: "docks_bunker",
        unlockDistrictId: "satoshi"
      }
    }
  },

  {
    id: "syndicate_catalyst",
    title: "Main Quest 3: Syndicate Catalyst",
    category: "Main Quest",
    chapter: "Chapter 2: The Corporate War",
    description: "Move to Satoshi Cyber-Shrine Gardens, meditate with the tech core to charge the Ley-Matrix, and return it to Priestess Morgana.",
    narrativeBriefing: "The ancient digital spirits of Satoshi Square hold the master decryption keys to Vice's holding facility. Align your neural cyberdeck with the celestial frequency matrix in the cherry blossom gardens.",
    giverNPC: "Priestess Morgana",
    giverPOI: "Satoshi Cyber-Shrine Gardens",
    minLevel: 3,
    prerequisiteQuestId: "corporate_hunt",
    nextQuestId: "hunt_for_vice",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "mq3_s1",
        stageIndex: 1,
        title: "Charge the Ley-Matrix at the Cyber-Shrine",
        description: "Meditate at the Satoshi Cyber-Shrine to harmonize your ether channels.",
        objectiveType: "interact_poi",
        targetPOI: "Satoshi Cyber-Shrine Gardens",
        targetPOIId: "neon_shrine",
        targetDistrict: "satoshi",
        targetItem: "Charged Ley-Matrix",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "syndicate:matrix_charged",
        linkedPOISceneId: "syndicate_charge_matrix",
        linkedPOISceneStepId: "shrine",
        operationalPaths: [
          {
            id: "mq3_p1_mind",
            label: "[Ether / Willpower 12] Enter deep Technomantic Trance",
            checkType: "will",
            checkValue: 12,
            outcomeDesc: "Your mind expands into the ley-stream. The matrix glows with intense violet energy!",
            grantsBonusXP: 60
          },
          {
            id: "mq3_p1_battery",
            label: "[Item] Overcharge shrine relays using an Ether Battery",
            checkType: "item",
            requiredItem: "Ether battery",
            outcomeDesc: "The battery fuels a surge of clean energy, instantly stabilizing the Ley-Matrix.",
            grantsBonusCredits: 50
          }
        ]
      },
      {
        id: "mq3_s2",
        stageIndex: 2,
        title: "Return Matrix to Priestess Morgana",
        description: "Deliver the Charged Ley-Matrix to Priestess Morgana in Satoshi Square.",
        objectiveType: "talk_npc",
        targetPOI: "The Iron Coven Temple",
        targetPOIId: "temple",
        targetDistrict: "satoshi",
        targetNPC: "Priestess Morgana",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "syndicate:matrix_delivered",
        linkedPOISceneId: "syndicate_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 320,
      experience: 180,
      items: ["Coven Ether-deck v3", "Legendary 'Doomsday' Singularity Core"],
      reputation: { streetOutlaws: 25 },
      worldUnlocks: {
        unlockBaseId: "satoshi_penthouse",
        unlockPerkOrSkill: "Mindmancer Synaptic Weaver"
      }
    }
  },

  {
    id: "hunt_for_vice",
    title: "Main Quest 4: The Hunt for Vice",
    category: "Main Quest",
    chapter: "Chapter 2: The Corporate War",
    description: "Infiltrate the Titan Logistics Freight Hub in Docks Region and hack the cargo terminal logs to isolate Vice's coordinates.",
    narrativeBriefing: "Priestess Morgana's charged matrix revealed a shipment ID routed from the Docks directly into Ares Biotech's black laboratory. Vice is being held in cryogenic stasis below Corporate Plaza.",
    giverNPC: "Cipher",
    giverPOI: "Club Afterlife VIP Lounge (Downtown)",
    minLevel: 3,
    prerequisiteQuestId: "syndicate_catalyst",
    nextQuestId: "rescue_vice",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "mq4_s1",
        stageIndex: 1,
        title: "Hack Freight Hub Cargo Terminal",
        description: "Infiltrate Titan Logistics Freight Hub (Docks) and extract transport logs.",
        objectiveType: "hack_terminal",
        targetPOI: "Titan Logistics Freight Hub",
        targetPOIId: "freight_hub",
        targetDistrict: "docks",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "hunt_for_vice:logs_acquired",
        linkedPOISceneId: "hunt_for_vice_freight_logs",
        linkedPOISceneStepId: "terminal",
        operationalPaths: [
          {
            id: "mq4_p1_bribe",
            label: "[Bribe 100¤] Pay off dock worker foreman for access codes",
            checkType: "credits",
            checkValue: 100,
            outcomeDesc: "The foreman pockets the cash and hands you a clean datachip with zero alarms triggered.",
            grantsBonusXP: 30
          },
          {
            id: "mq4_p1_slice",
            label: "[Net Slicer / INT 13] Slice terminal and plant false surveillance loops",
            checkType: "int",
            checkValue: 13,
            outcomeDesc: "You overwrite the security logs and extract the exact cryo-chamber cell number: B-12.",
            grantsBonusXP: 60
          }
        ]
      }
    ],
    rewards: {
      credits: 250,
      experience: 150,
      items: ["Smart-Targeting Visor"],
      reputation: { titanLogistics: 15 }
    }
  },

  {
    id: "rescue_vice",
    title: "Main Quest 5: Rescue Vice from Ares Cryo-Vault",
    category: "Main Quest",
    chapter: "Chapter 2: The Corporate War",
    description: "Infiltrate the subterranean cells beneath Ares Biotech Corporate Plaza (Downtown) and extract Vice from cryo-lockdown.",
    narrativeBriefing: "This is the big extraction. Ares corporate enforcers and automated defense mechs guard the Plaza sublevels. You must breach their perimeter, deactivate the cryo-containment seals, and get Vice out alive.",
    giverNPC: "Cipher",
    giverPOI: "Club Afterlife VIP Lounge (Downtown)",
    minLevel: 4,
    prerequisiteQuestId: "hunt_for_vice",
    nextQuestId: "singularity_ascension",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "mq5_s1",
        stageIndex: 1,
        title: "Bypass Plaza Checkpoint Defenses",
        description: "Assault or disable the automated laser grid guarding Corporate Plaza entrance.",
        objectiveType: "interact_poi",
        targetPOI: "Corporate Plaza Sublevels",
        targetPOIId: "corporate_plaza",
        targetDistrict: "downtown",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "rescue_vice:checkpoint_bypassed",
        linkedPOISceneId: "rescue_vice_plaza",
        linkedPOISceneStepId: "checkpoint",
        operationalPaths: [
          {
            id: "mq5_p1_guns",
            label: "[Combat] Heavy assault through the front security gates",
            checkType: "none",
            outcomeDesc: "You tear through the corporate guards with overwhelming firepower.",
            grantsBonusCredits: 120
          },
          {
            id: "mq5_p1_stealth",
            label: "[Stealth / DEX 14] Scale the ventilation shaft into Cryo-Bay B",
            checkType: "dex",
            checkValue: 14,
            outcomeDesc: "You drop silently onto the catwalk directly above the cryo-containment unit.",
            grantsBonusXP: 80
          }
        ]
      },
      {
        id: "mq5_s2",
        stageIndex: 2,
        title: "Thaw Cryo-Pod & Extract Vice",
        description: "Override Cryo-Pod B-12 and escort Vice back to the Safehouse.",
        objectiveType: "talk_npc",
        targetPOI: "Corporate Plaza Sublevels",
        targetPOIId: "corporate_plaza",
        targetDistrict: "downtown",
        targetNPC: "Vice",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "rescue_vice:extracted",
        linkedPOISceneId: "rescue_vice_plaza",
        linkedPOISceneStepId: "cryo_bay"
      }
    ],
    rewards: {
      credits: 500,
      experience: 250,
      items: ["Exo-Plated Mesh Armor", "Legendary 'Chrono-Shift' Reflex Augment"],
      reputation: { streetOutlaws: 40, aresCorporate: -40 },
      worldUnlocks: {
        recruitCompanionId: "Vice",
        unlockDistrictId: "hyperion_cathedral"
      }
    }
  },

  {
    id: "singularity_ascension",
    title: "Main Quest 6: The Singularity Ascension",
    category: "Main Quest",
    chapter: "Chapter 3: Technomantic Singularity",
    description: "Assault the Hyperion Neo-Cathedral summit, defeat the Archon Corporate AI, and claim the Singularity Core to reshape Megacity-9.",
    narrativeBriefing: "With Vice back in command, your shadow crew launches an all-out assault against the corporate elite. The Archon AI is channeling planetary ley energy atop the Hyperion spire to purge the slums. Strike now or perish.",
    giverNPC: "Vice",
    giverPOI: "Aurus Safehouse (The Hideout)",
    minLevel: 5,
    prerequisiteQuestId: "rescue_vice",
    nextQuestId: "",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "mq6_s1",
        stageIndex: 1,
        title: "Breach Hyperion Spire Gate",
        description: "Fight through the elite cyber-crusader vanguard at the cathedral gates.",
        objectiveType: "kill_target",
        targetPOI: "Hyperion Neo-Cathedral",
        targetPOIId: "hyperion_gate",
        targetDistrict: "hyperion_cathedral",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "singularity:spire_breached",
        linkedPOISceneId: "singularity_spire_gate",
        linkedPOISceneStepId: "gate"
      },
      {
        id: "mq6_s2",
        stageIndex: 2,
        title: "Confront and Destroy Archon Corporate AI",
        description: "Climb to the Ley-Altar summit and destroy the divine AI construct.",
        objectiveType: "kill_target",
        targetPOI: "Hyperion Ley-Altar Summit",
        targetPOIId: "hyperion_summit",
        targetDistrict: "hyperion_cathedral",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "singularity:archon_destroyed",
        linkedPOISceneId: "singularity_archon_confrontation",
        linkedPOISceneStepId: "altar",
        operationalPaths: [
          {
            id: "mq6_p1_mind",
            label: "[Mindmancer Level 3] Synaptic collapse the Archon's neural core",
            checkType: "mindmancer",
            checkValue: 3,
            outcomeDesc: "You rip the AI's consciousness apart with raw psychic fury!",
            grantsBonusXP: 150
          },
          {
            id: "mq6_p1_heavy",
            label: "[Heavy Firearms / STR 16] Obliterate the altar with heavy plasma",
            checkType: "str",
            checkValue: 16,
            outcomeDesc: "A direct railgun slug shatters the crystalline core into smoking fragments!",
            grantsBonusCredits: 300
          }
        ]
      }
    ],
    rewards: {
      credits: 1000,
      experience: 500,
      items: ["Heavy Plasma Cannon", "Archon's Kinetic Shock-Plate"],
      reputation: { streetOutlaws: 50, titanLogistics: 30, aresCorporate: -100 },
      worldUnlocks: {
        unlockBaseId: "hyperion_spire",
        unlockPerkOrSkill: "Avatar of the Singularity"
      }
    }
  },

  // ==========================================
  // SIDE STORIES & BOUNTY CONTRACTS
  // ==========================================
  {
    id: "chem_weaver_request",
    title: "Side Quest: Chem-Weaver's Request",
    category: "Side Quest",
    chapter: "Chapter 1: The Outcast Spark",
    description: "Collect 3x samples of Glowing Slime from the sludge conduits underneath the Docks, and bring them to Priestess Morgana.",
    narrativeBriefing: "Priestess Morgana requires bio-luminescent enzyme extracts from the Docks conduits to brew neuro-protective elixirs for the underground coven.",
    giverNPC: "Priestess Morgana",
    giverPOI: "Satoshi Cyber-Shrine Gardens",
    minLevel: 1,
    prerequisiteQuestId: "",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "cw_s1",
        stageIndex: 1,
        title: "Harvest 3x Glowing Slime",
        description: "Explore the toxic waterways in Docks Region to collect 3 slime samples.",
        objectiveType: "collect_item",
        targetPOI: "Sludge Conduits",
        targetPOIId: "sludge_conduits",
        targetDistrict: "docks",
        targetItem: "Glowing Slime",
        targetCount: 3,
        currentCount: 0,
        completed: false,
        completionAction: "chem_weaver:slime_harvested",
        linkedPOISceneId: "chem_weaver_harvest",
        linkedPOISceneStepId: "harvest"
      },
      {
        id: "cw_s2",
        stageIndex: 2,
        title: "Deliver Slime to Priestess Morgana",
        description: "Bring the 3 harvested samples to Priestess Morgana in Satoshi Square.",
        objectiveType: "talk_npc",
        targetPOI: "Satoshi Cyber-Shrine Gardens",
        targetPOIId: "temple",
        targetDistrict: "satoshi",
        targetNPC: "Priestess Morgana",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "chem_weaver:delivered",
        linkedPOISceneId: "chem_weaver_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 160,
      experience: 90,
      items: ["Nano Med-Stim (Heal)", "Ether battery x3"],
      reputation: { streetOutlaws: 15 }
    }
  },

  {
    id: "lost_drone_schematic",
    title: "Side Quest: The Lost Drone Schematic",
    category: "Side Quest",
    chapter: "Chapter 1: The Outcast Spark",
    description: "Hunt Rogue Rust-Claw Orcs in Shatter Ridge (Downtown) to secure the Experimental Drone Chip. Bring it to Jax or install it in your Hideout mainframe.",
    narrativeBriefing: "An Ares courier drone was shot down over Shatter Ridge by Rust-Claw cyborgs. The drone's neural flight chip contains automated defense firmware.",
    giverNPC: "Agent Jax",
    giverPOI: "Neon Abyss Bar",
    minLevel: 2,
    prerequisiteQuestId: "",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "drone_s1",
        stageIndex: 1,
        title: "Hunt Orcs & Secure Drone Chip",
        description: "Defeat the Rust-Claw Orc band in Shatter Ridge and recover the Experimental Drone Chip.",
        objectiveType: "kill_target",
        targetPOI: "Shatter Ridge Corridors",
        targetPOIId: "shatter_ridge",
        targetDistrict: "downtown",
        targetItem: "Experimental Drone Chip",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "drone:chip_recovered",
        linkedPOISceneId: "drone_chip_recovery",
        linkedPOISceneStepId: "ambush"
      },
      {
        id: "drone_s2",
        stageIndex: 2,
        title: "Deliver Chip to Jax or Base Security",
        description: "Turn in the chip to Agent Jax at the Neon Abyss Bar for credits, or install it directly at home.",
        objectiveType: "talk_npc",
        targetPOI: "Neon Abyss Bar",
        targetPOIId: "bar",
        targetDistrict: "conduit09",
        targetNPC: "Agent Jax",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "drone:resolved",
        linkedPOISceneId: "drone_chip_resolution",
        linkedPOISceneStepId: "choice"
      }
    ],
    rewards: {
      credits: 220,
      experience: 110,
      items: ["Syndicate Heavy Armor"],
      reputation: { streetOutlaws: 20 }
    }
  },

  {
    id: "smugglers_run",
    title: "Side Quest: The Smuggler's Run",
    category: "Side Quest",
    chapter: "Chapter 1: The Outcast Spark",
    description: "Recover the Stolen Weapon Crate from the Iron Anchor gang at Rusty Anchor Shipyard, and deliver it back to Titan Logistics Freight Hub.",
    narrativeBriefing: "A shipment of high-end vibroblades was hijacked by dockside pirates. Titan Logistics is offering clean credits and surplus weapons for its return.",
    giverNPC: "Titan Logistics Quartermaster",
    giverPOI: "Titan Logistics Freight Hub",
    minLevel: 2,
    prerequisiteQuestId: "",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "smug_s1",
        stageIndex: 1,
        title: "Raid Rusty Anchor Shipyard",
        description: "Assault the smuggler warehouse at Rusty Anchor Shipyard and seize the Stolen Weapon Crate.",
        objectiveType: "kill_target",
        targetPOI: "Rusty Anchor Shipyard",
        targetPOIId: "shipyard",
        targetDistrict: "docks",
        targetItem: "Stolen Weapon Crate",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "smugglers:crate_recovered",
        linkedPOISceneId: "smugglers_shipyard_raid",
        linkedPOISceneStepId: "raid"
      },
      {
        id: "smug_s2",
        stageIndex: 2,
        title: "Deliver Crate to Titan Freight Hub",
        description: "Hand over the recovered weapons to the Quartermaster at Titan Logistics Freight Hub.",
        objectiveType: "talk_npc",
        targetPOI: "Titan Logistics Freight Hub",
        targetPOIId: "freight_hub",
        targetDistrict: "docks",
        targetNPC: "Titan Logistics Quartermaster",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "smugglers:crate_delivered",
        linkedPOISceneId: "smugglers_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 200,
      experience: 100,
      items: ["Apex Mantis electro-blade"],
      reputation: { titanLogistics: 30 }
    }
  },

  {
    id: "cybernetic_harvest",
    title: "Side Quest: Cybernetic Harvest",
    category: "Side Quest",
    chapter: "Chapter 2: The Corporate War",
    description: "Ambush Ares patrols at the Highwalk Homicide Site in Downtown to harvest 2x Neural Regulators. Bring them back to Dr. Marv at his Docks Clinic.",
    narrativeBriefing: "Dr. Marv is running low on military neural processors needed to operate on wounded slum dwellers. Strip them from corrupt corporate enforcer squads.",
    giverNPC: "Dr. Marv",
    giverPOI: "Dr. Marv's Cyber-Clinic (Docks)",
    minLevel: 3,
    prerequisiteQuestId: "",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "harv_s1",
        stageIndex: 1,
        title: "Harvest 2x Neural Regulators",
        description: "Engage Downtown patrol units at the Highwalk Homicide Site to harvest processors.",
        objectiveType: "collect_item",
        targetPOI: "Highwalk Homicide Site",
        targetPOIId: "homicide_site",
        targetDistrict: "downtown",
        targetItem: "Neural Regulator",
        targetCount: 2,
        currentCount: 0,
        completed: false,
        completionAction: "harvest:regulators_acquired",
        linkedPOISceneId: "cybernetic_harvest_patrol",
        linkedPOISceneStepId: "ambush"
      },
      {
        id: "harv_s2",
        stageIndex: 2,
        title: "Deliver Regulators to Dr. Marv",
        description: "Bring the 2 Neural Regulators to Dr. Marv's Cyber-Clinic at the Docks.",
        objectiveType: "talk_npc",
        targetPOI: "Dr. Marv's Cyber-Clinic",
        targetPOIId: "marv_clinic",
        targetDistrict: "docks",
        targetNPC: "Dr. Marv",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "harvest:regulators_delivered",
        linkedPOISceneId: "cybernetic_harvest_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 260,
      experience: 130,
      items: ["Smart-Targeting Visor", "Nano Med-Stim (Heal)"],
      reputation: { streetOutlaws: 25 }
    }
  },

  {
    id: "nouveau_heist",
    title: "Side Quest: Nouveau Heist",
    category: "Side Quest",
    chapter: "Chapter 2: The Corporate War",
    description: "Formulate a plan with Cipher at Club Afterlife VIP Lounge to infiltrate the Nouveau Cybernetic Showroom in Downtown, bypass the shields, and secure the Prototype Singularity Battery.",
    narrativeBriefing: "The Nouveau Showroom is flaunting a prototype cold-fusion battery in their crystal display case. Cipher has forged a VIP keycard to get you past the lobby laser grid.",
    giverNPC: "Cipher",
    giverPOI: "Club Afterlife VIP Lounge",
    minLevel: 3,
    prerequisiteQuestId: "",
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "nouveau_s1",
        stageIndex: 1,
        title: "Secure VIP Keycard from Cipher",
        description: "Meet Cipher in Club Afterlife VIP Lounge to receive the security bypass keycard.",
        objectiveType: "talk_npc",
        targetPOI: "Club Afterlife VIP Lounge",
        targetPOIId: "club_afterlife",
        targetDistrict: "downtown",
        targetNPC: "Cipher",
        targetItem: "VIP Afterlife Keycard",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "nouveau:keycard_acquired",
        linkedPOISceneId: "nouveau_heist_briefing",
        linkedPOISceneStepId: "briefing"
      },
      {
        id: "nouveau_s2",
        stageIndex: 2,
        title: "Infiltrate Nouveau Showroom & Steal Battery",
        description: "Crack the pressure shields in Nouveau Showroom (Downtown) and extract the battery.",
        objectiveType: "interact_poi",
        targetPOI: "Nouveau Cybernetic Showroom",
        targetPOIId: "nouveau_chrome",
        targetDistrict: "downtown",
        targetItem: "Prototype Singularity Battery",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "nouveau:battery_stolen",
        linkedPOISceneId: "nouveau_showroom_heist",
        linkedPOISceneStepId: "showroom"
      },
      {
        id: "nouveau_s3",
        stageIndex: 3,
        title: "Deliver Battery to Cipher",
        description: "Return with the Singularity Battery to Cipher at Club Afterlife.",
        objectiveType: "talk_npc",
        targetPOI: "Club Afterlife VIP Lounge",
        targetPOIId: "club_afterlife",
        targetDistrict: "downtown",
        targetNPC: "Cipher",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "nouveau:battery_delivered",
        linkedPOISceneId: "nouveau_heist_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 380,
      experience: 160,
      items: ["Chrono-Shift Augment", "Prototype Singularity Battery"],
      reputation: { streetOutlaws: 30, aresCorporate: -25 }
    }
  },

  {
    id: "vice_retribution",
    title: "Companion Quest: Vice's Retribution",
    category: "Companion Story",
    chapter: "Chapter 2: The Corporate War",
    description: "Infiltrate the Ares secure server farm in Shatter Ridge (Downtown) to retrieve the Encrypted Ares Ledger and deliver it directly to Vice.",
    narrativeBriefing: "Vice has uncovered the identity of the corporate director who ordered her unit executed. The incriminating financial ledger is stored on a subterranean server node in Shatter Ridge.",
    giverNPC: "Vice",
    giverPOI: "Aurus Safehouse (The Hideout)",
    minLevel: 4,
    prerequisiteQuestId: "rescue_vice",
    requiredReputationFaction: "streetOutlaws",
    requiredReputationValue: 80,
    status: "NOT_STARTED",
    log: [],
    stages: [
      {
        id: "vr_s1",
        stageIndex: 1,
        title: "Retrieve Encrypted Ares Ledger",
        description: "Hack the server node at Shatter Ridge Corridors in Downtown Region.",
        objectiveType: "hack_terminal",
        targetPOI: "Shatter Ridge Corridors",
        targetPOIId: "shatter_ridge",
        targetDistrict: "downtown",
        targetItem: "Encrypted Ares Ledger",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "vice:ledger_acquired",
        linkedPOISceneId: "vice_ledger_hack",
        linkedPOISceneStepId: "server"
      },
      {
        id: "vr_s2",
        stageIndex: 2,
        title: "Hand Ledger to Vice",
        description: "Return to the Safehouse and give the ledger to Vice to seal her devotion.",
        objectiveType: "talk_npc",
        targetPOI: "Aurus Safehouse (The Hideout)",
        targetPOIId: "hideout",
        targetDistrict: "aurus",
        targetNPC: "Vice",
        targetCount: 1,
        currentCount: 0,
        completed: false,
        completionAction: "vice:ledger_delivered",
        linkedPOISceneId: "vice_ledger_turn_in",
        linkedPOISceneStepId: "delivery"
      }
    ],
    rewards: {
      credits: 450,
      experience: 280,
      items: ["Archon's Kinetic Shock-Plate"],
      reputation: { streetOutlaws: 50, aresCorporate: -50 }
    }
  }
];
