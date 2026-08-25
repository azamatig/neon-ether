import { POIInteractiveEvent } from "./types";

export const DEFAULT_POI_INTERACTIVE_SCENES: Record<string, POIInteractiveEvent> = {
  prologue_ventilation: {
    id: "prologue_ventilation",
    poiId: "ventilation_shaft",
    poiName: "Ventilation Shaft (Entry Point)",
    districtId: "conduit09",
    title: "CONDUIT 09: VENTILATION BREACH",
    initialStepId: "entry",
    linkedQuestId: "prologue",
    linkedStageId: "prologue_ventilation",
    steps: {
      entry: {
        id: "entry", stepTitle: "VENTILATION SHAFT", bannerTitle: "VARIABLE-FREQUENCY ROTOR ARRAY",
        bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
        narrativeText: "A massive circular shaft blocks the insertion route. Heavy fan blades leave only a half-second opening. Vice watches the patrol feed while Tracker calculates the rotor cycle.",
        companions: [
          { id: "vice_vent", name: "Vice", role: "Tactical Leader", avatar: "🔫", color: "rose", text: "The fan cycle drops for half a second. Move cleanly, rookie." },
          { id: "tracker_vent", name: "Tracker", role: "Electronic Warfare", avatar: "📟", color: "amber", text: "Patrol drones are scanning this sector. Pick a method." }
        ],
        choices: [
          { id: "vent_dex", label: "Slip through Vent [DEX 23]", checkType: "dex", checkValue: 23, grantsXP: 25, completionAction: "ventilation_shaft:slip", targetPOIId: "security_terminal", outcomeNarrative: "You cross during the rotor lull and drop into the Security Sub-Terminal.", failureNarrative: "The rotor clips your armor and pins you inside the shaft.", failureHpDamage: 20, failureTargetStepId: "emergency", variant: "cyan" },
          { id: "vent_locker", label: "Scavenge Rusted Emergency Locker", grantsItem: "Nano Med-Stim (Heal)", grantsHp: 15, outcomeNarrative: "You recover a med-stim and patch the damage to your armor.", targetStepId: "entry", variant: "emerald" },
          { id: "vent_casing", label: "Dismantle Ventilation Casing", grantsItem: "Carbon Fiber Armor Plates", outcomeNarrative: "The aerospace casing yields a usable carbon-fiber plate.", targetStepId: "entry", variant: "amber" }
        ]
      },
      emergency: {
        id: "emergency", stepTitle: "EMERGENCY ROTOR OVERRIDE", bannerTitle: "FAN BLADES INTERCEPTED",
        bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
        narrativeText: "The failed crossing has jammed you between the blades. Alarms are rising; override the rotor before security arrives.",
        choices: [
          { id: "vent_str", label: "Force Fan Blades [STR 15]", checkType: "str", checkValue: 15, completionAction: "ventilation_shaft:slip", targetPOIId: "security_terminal", outcomeNarrative: "You wrench the hydraulic rotor to a stop and force your way through.", failureNarrative: "The coupling snaps and tears into your armor.", failureHpDamage: 15, failureTargetStepId: "emergency", variant: "rose" },
          { id: "vent_int", label: "Hack Fan Console [INT 16]", checkType: "int", checkValue: 16, completionAction: "ventilation_shaft:slip", targetPOIId: "security_terminal", outcomeNarrative: "Your loop-bypass spins the blades down in complete silence.", failureNarrative: "Neural feedback burns through the relay.", failureHpDamage: 10, failureTargetStepId: "emergency", variant: "cyan" },
          { id: "vent_emp", label: "Trigger Emergency EMP Burst", completionAction: "ventilation_shaft:slip", targetPOIId: "security_terminal", failureHpDamage: 10, outcomeNarrative: "The EMP destroys the rotor controller and throws you into the next chamber.", variant: "purple" }
        ]
      }
    }
  },
  prologue_security_terminal: {
    id: "prologue_security_terminal", poiId: "security_terminal", poiName: "Security Sub-Terminal", districtId: "conduit09",
    title: "CONDUIT 09: SECURITY SUB-TERMINAL", initialStepId: "console", linkedQuestId: "prologue", linkedStageId: "prologue_security_terminal",
    steps: { console: {
      id: "console", stepTitle: "OUTER PERIMETER SUB-GRID", bannerTitle: "ARES SECURITY SUB-TERMINAL",
      bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
      narrativeText: "A buzzing corporate terminal bridges the outer alarm network. Its copper motherboard and auxiliary battery remain exposed.",
      companions: [{ id: "tracker_terminal", name: "Tracker", role: "Electronic Warfare", avatar: "📟", color: "amber", text: "Bypass the firewall and the blast-door corridor goes blind." }],
      choices: [
        { id: "terminal_bypass", label: "Bypass Sub-Terminal [INT 23]", checkType: "int", checkValue: 23, grantsXP: 25, grantsItem: "Rusted Circuitry", completionAction: "security_terminal:bypass", targetPOIId: "blast_door", outcomeNarrative: "The alarm subnet collapses and the route to the blast door opens.", failureNarrative: "The firewall drains your deck, but the emergency shunt still opens the route.", failureManaDamage: 15, failureTargetStepId: "forced_exit", variant: "cyan" },
        { id: "terminal_scrap", label: "Search Terminal Wreckage", grantsItem: "Rusted Circuitry", outcomeNarrative: "You recover recyclable copper circuitry.", targetStepId: "console", variant: "amber" },
        { id: "terminal_locker", label: "Hack Secure Weapons Locker", grantsItem: "Tactical Cyber-SMG", outcomeNarrative: "The locker releases a compact tactical SMG.", targetStepId: "console", variant: "rose" },
        { id: "terminal_battery", label: "Siphon Auxiliary Thermal Battery", grantsMana: 35, outcomeNarrative: "The thermal capacitor restores your cognitive power reserve.", targetStepId: "console", variant: "purple" }
      ]
    }, forced_exit: {
      id: "forced_exit", stepTitle: "EMERGENCY SHUNT", bannerTitle: "FIREWALL BACKFIRE",
      bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
      narrativeText: "The firewall burns out, but Tracker forces the transit shunt. The Heavy Blast Door is now accessible.",
      choices: [{ id: "terminal_forced_continue", label: "Proceed to Heavy Blast Door", completionAction: "security_terminal:bypass", targetPOIId: "blast_door", variant: "emerald" }]
    }}
  },
  prologue_blast_door: {
    id: "prologue_blast_door", poiId: "blast_door", poiName: "Heavy Blast Door", districtId: "conduit09",
    title: "CONDUIT 09: HEAVY BLAST DOOR", initialStepId: "door", linkedQuestId: "prologue", linkedStageId: "prologue_blast_door",
    steps: { door: {
      id: "door", stepTitle: "HYDRAULIC SECURITY SEAL", bannerTitle: "TITANIUM BLAST DOOR",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      narrativeText: "A titanium bulkhead blocks the core route. Its auxiliary hydraulic valve can be forced while the squad covers the corridor.",
      companions: [{ id: "vice_door", name: "Vice", role: "Tactical Leader", avatar: "🔫", color: "rose", text: "Put your weight into the valve. Tracker will cut the latch if your servos fail." }],
      choices: [
        { id: "door_pry", label: "Pry Open Valve [STR 23]", checkType: "str", checkValue: 23, grantsXP: 25, completionAction: "blast_door:pry", targetPOIId: "section_gate", outcomeNarrative: "The hydraulic valve turns and the titanium doors hiss open.", failureNarrative: "Your servos buckle; Tracker cuts the latch after the strain damages you.", failureHpDamage: 10, failureTargetStepId: "tracker_cut", variant: "rose" },
        { id: "door_barracks", label: "Raid Security Guard Barracks", grantsItem: "Tactical Flak Armor", outcomeNarrative: "You recover flak armor from an abandoned shift locker.", targetStepId: "door", variant: "amber" },
        { id: "door_supply", label: "Interface with Corporate Supply Bin", grantsCredits: 45, grantsMana: 30, outcomeNarrative: "The cabinet dispenses battery cells and corporate credit vouchers.", targetStepId: "door", variant: "cyan" }
      ]
    }, tracker_cut: {
      id: "tracker_cut", stepTitle: "TRACKER OVERRIDE", bannerTitle: "LATCH CUT OPEN",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      narrativeText: "Tracker's plasma cutter melts the failed latch. The transit gate beyond is clear.",
      choices: [{ id: "door_continue", label: "Continue to Section Gate", completionAction: "blast_door:pry", targetPOIId: "section_gate", variant: "emerald" }]
    }}
  },
  prologue_section_gate: {
    id: "prologue_section_gate", poiId: "section_gate", poiName: "Next Section Gate (Transit)", districtId: "conduit09",
    title: "TRANSIT: SHATTER-RIDGE INSERTION", initialStepId: "transit", linkedQuestId: "prologue", linkedStageId: "prologue_section_gate",
    steps: { transit: {
      id: "transit", stepTitle: "DISTRICT TRANSIT", bannerTitle: "SHATTER-RIDGE CORE ACCESS",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      narrativeText: "Hydraulic gears release the section seal. Beyond it lies the fortified Shatter-Ridge checkpoint.",
      companions: [
        { id: "vice_transit", name: "Vice", role: "Tactical Leader", avatar: "🔫", color: "rose", text: "Once this gate closes there is no clean retreat." },
        { id: "tracker_transit", name: "Tracker", role: "Electronic Warfare", avatar: "📟", color: "amber", text: "The defensive barrier is the first priority." }
      ],
      choices: [{ id: "transit_enter", label: "Proceed to Shatter-Ridge Core", completionAction: "section_gate:transit", unlockDistrictId: "shatter_ridge_core", targetPOIId: "shatter_ridge_security_post", outcomeNarrative: "The squad seals the hatch and enters Shatter-Ridge Core.", variant: "emerald" }]
    }}
  },
  prologue_security_checkpoint: {
    id: "prologue_security_checkpoint", poiId: "shatter_ridge_security_post", poiName: "Shatter-Ridge Security Checkpoint", districtId: "shatter_ridge_core",
    title: "SHATTER-RIDGE SECURITY CHECKPOINT", initialStepId: "checkpoint", linkedQuestId: "prologue", linkedStageId: "prologue_security_checkpoint",
    steps: { checkpoint: {
      id: "checkpoint", stepTitle: "DEFENSIVE CYBER-BARRIER", bannerTitle: "SHATTER-RIDGE CHECKPOINT",
      bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
      narrativeText: "A fortified cyber-barrier guards the lower catwalk. Corporate lockers and active tripwires line the checkpoint.",
      choices: [
        { id: "checkpoint_hack", label: "Overclock Security Gate [INT 16]", checkType: "int", checkValue: 16, grantsXP: 25, completionAction: "shatter_ridge_security_post:gate", targetPOIId: "shatter_ridge_reactor_well", outcomeNarrative: "The capacitors overload and melt the defensive beam nodes.", failureNarrative: "Feedback burns through your deck before the barrier finally collapses.", failureHpDamage: 10, failureManaDamage: 15, failureTargetStepId: "checkpoint_forced", variant: "cyan" },
        { id: "checkpoint_chest", label: "Scavenge Security Chest", grantsItem: "Exo-Plated Mesh Armor", outcomeNarrative: "You recover premium mesh armor from the checkpoint locker.", targetStepId: "checkpoint", variant: "amber" }
      ]
    }, checkpoint_forced: {
      id: "checkpoint_forced", stepTitle: "BARRIER COLLAPSED", bannerTitle: "GRID FEEDBACK DISCHARGE",
      bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
      narrativeText: "The grid shocks your cortex, but its capacitors burn out. The Reactor Well route is open.",
      choices: [{ id: "checkpoint_continue", label: "Move to Reactor Well", completionAction: "shatter_ridge_security_post:gate", targetPOIId: "shatter_ridge_reactor_well", variant: "emerald" }]
    }}
  },
  prologue_reactor_well: {
    id: "prologue_reactor_well", poiId: "shatter_ridge_reactor_well", poiName: "Shatter-Ridge Reactor Well", districtId: "shatter_ridge_core",
    title: "SHATTER-RIDGE REACTOR WELL", initialStepId: "well", linkedQuestId: "prologue", linkedStageId: "prologue_reactor_well",
    steps: { well: {
      id: "well", stepTitle: "BIO-COOLANT REACTOR", bannerTitle: "TOXIC REACTOR WELL",
      bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
      narrativeText: "Toxic coolant boils below a maintenance catwalk. A cargo crane and exposed telemetry core can be salvaged before the squad advances.",
      choices: [
        { id: "reactor_lever", label: "Pull Cargo Lever [STR 15]", checkType: "str", checkValue: 15, grantsXP: 25, grantsItem: "Unstable Plasma Core", outcomeNarrative: "The crane lowers a sealed cargo crate onto the catwalk.", failureNarrative: "The seized coupling snaps and showers you with sparks.", failureHpDamage: 15, failureTargetStepId: "well", targetStepId: "well", variant: "rose" },
        { id: "reactor_core", label: "Salvage Bio-Reactor Core", grantsItem: "Smart-Targeting Visor", outcomeNarrative: "You extract the reactor's ocular telemetry analyzer.", targetStepId: "well", variant: "cyan" },
        { id: "reactor_continue", label: "Proceed to Main Array", completionAction: "shatter_ridge_reactor_well:transit", targetPOIId: "main_array_core", outcomeNarrative: "The squad climbs into the cavernous Core Array hangar.", variant: "emerald" }
      ]
    }}
  },
  prologue_core_array: {
    id: "prologue_core_array", poiId: "main_array_core", poiName: "Core Array Shatter-Ridge", districtId: "shatter_ridge_core",
    title: "CORE ARRAY DEFENSE", initialStepId: "ambush", linkedQuestId: "prologue", linkedStageId: "prologue_core_array",
    steps: { ambush: {
      id: "ambush", stepTitle: "AUTONOMOUS DEFENSE GRID", bannerTitle: "SECURITY DRONES DEPLOYED",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      narrativeText: "Tracker's key is rejected. Three autonomous security drones descend between the blue server columns and charge their laser cannons.",
      companions: [{ id: "vice_core", name: "Vice", role: "Tactical Leader", avatar: "🔫", color: "rose", text: "Defend Tracker. I will hold the left firing lane." }],
      choices: [{ id: "core_combat", label: "Defend Core Array", combat: { enemyName: "3x Autonomous Security Drones", enemyHp: 130, enemyShields: 30, turnLog: "Three security drones descend from the grid ceiling and charge their laser cannons.", victorySceneId: "prologue_core_transit", victoryCompletionAction: "main_array_core:defended" }, outcomeNarrative: "The autonomous defense grid engages.", variant: "rose" }]
    }}
  },
  prologue_core_transit: {
    id: "prologue_core_transit", poiId: "main_array_core", poiName: "Core Array Shatter-Ridge", districtId: "shatter_ridge_core",
    title: "TRANSIT: DATA VAULT SANCTUARY", initialStepId: "lift", linkedQuestId: "prologue", linkedStageId: "prologue_core_array",
    steps: { lift: {
      id: "lift", stepTitle: "CORE ARRAY SECURED", bannerTitle: "INDUSTRIAL LIFT TO DATA VAULT",
      bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      narrativeText: "The final drone crashes between the server columns. Vice opens the industrial lift before Ares can seal the sanctuary.",
      companions: [{ id: "vice_lift", name: "Vice", role: "Tactical Leader", avatar: "🔫", color: "rose", text: "Move. The database crystal is one level below us." }],
      choices: [{ id: "lift_descend", label: "Descend into Data Vault Sanctuary", unlockDistrictId: "data_vault", targetPOIId: "terminal_hacking_puzzle", outcomeNarrative: "The lift descends into the primary Ares data sanctuary.", variant: "emerald" }]
    }}
  },
  prologue_vault_terminal: {
    id: "prologue_vault_terminal", poiId: "terminal_hacking_puzzle", poiName: "Sanctuary Hacking Terminal", districtId: "data_vault",
    title: "DATA VAULT SANCTUARY", initialStepId: "terminal", linkedQuestId: "prologue", linkedStageId: "prologue_vault_terminal",
    steps: { terminal: {
      id: "terminal", stepTitle: "PRIMARY CYBER-VAULT", bannerTitle: "ARES DATABASE CRYSTAL TERMINAL",
      bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
      narrativeText: "Hexadecimal encryption streams cycle across the primary vault terminal. The Ares Data Crystal is locked behind its ICE matrix.",
      companions: [{ id: "vice_vault", name: "Vice", role: "Tactical Leader", avatar: "🔫", color: "rose", text: "Hurry up. Their strike teams are already moving." }],
      choices: [{ id: "vault_hack", label: "Initiate Terminal Hack", triggerHackingPuzzleType: "sanctuary", outcomeNarrative: "You connect your cyberdeck to the primary ICE matrix.", variant: "cyan" }]
    }}
  },
  prologue_escape: {
    id: "prologue_escape", poiId: "relic_altar", poiName: "Mysterious Relic Altar", districtId: "data_vault",
    title: "PROLOGUE FINALE: ESCAPE", initialStepId: "officer", linkedQuestId: "prologue", linkedStageId: "prologue_escape",
    steps: { officer: {
      id: "officer", stepTitle: "CAPTURED ARES OFFICER", bannerTitle: "TRACKER'S BETRAYAL EXPOSED",
      bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
      narrativeText: "Tracker lies dead beside the breached altar. His decrypted datapad proves he intended to abandon the squad as corporate scapegoats. A captured Ares officer has opened the service tunnels. Decide his fate and escape with Vice.",
      companions: [{ id: "vice_escape", name: "Vice", role: "Wounded Tactical Leader", avatar: "🔫", color: "rose", text: "The blast doors are open and now we know the truth. What happens to the witness, rookie?" }],
      choices: [
        { id: "escape_execute", label: "[Double Tap] Execute the Officer", completionAction: "prologue:escaped", completeQuestId: "prologue", clearParty: true, unlockDistrictId: "aurus", targetPOIId: "hideout", outcomeNarrative: "You eliminate the witness, salvage Tracker's gear, and escape with Vice into the Aurus slums.", variant: "rose" },
        { id: "escape_mind", label: "[Mindmance] Subjugate and Wipe Memory", completionAction: "prologue:escaped", completeQuestId: "prologue", clearParty: true, grantsMindmancerSkill: 1, unlockDistrictId: "aurus", targetPOIId: "hideout", outcomeNarrative: "You erase the officer's memory and escape through the service tunnels with Vice.", variant: "purple" },
        { id: "escape_sedate", label: "[Sedate] Inject Sedative and Flee", completionAction: "prologue:escaped", completeQuestId: "prologue", clearParty: true, unlockDistrictId: "aurus", targetPOIId: "hideout", outcomeNarrative: "The officer collapses under the sedative. You take Tracker's gear and escape to Aurus.", variant: "emerald" }
      ]
    }}
  },
  relic_altar: {
    poiId: "relic_altar",
    poiName: "Mysterious Relic Altar",
    districtId: "data_vault",
    title: "ANOMALY SEQUENCE: OBSIDIAN ALTAR",
    initialStepId: "intro",
    linkedQuestId: "prologue",
    linkedStageId: "prologue_relic_altar",
    steps: {
      intro: {
        id: "intro",
        badgeLabel: "ANOMALY SEQUENCE INITIALIZED",
        stepTitle: "ANOMALY SEQUENCE INITIALIZED",
        bannerTitle: "A FLOATING RELIC OF UNKNOWN ORIGINS",
        bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
        narrativeText: "The golden, multi-faceted device hovers three inches above the heavy obsidian altar. It radiates a heartbeat-like pulse of violet energy. It bypasses your cyberdeck's firewall indicators, humming in the back of your skull.",
        companions: [
          {
            id: "vice_intro",
            name: "Vice",
            role: "Companion",
            avatar: "🔫",
            color: "rose",
            text: "Careful, rookie. Those thermal readings are off the charts. It's radiating an unshielded cerebral broadcaster field. We came here for corporate databases, not to get our brains fried by ancient hardware. Leave it alone."
          },
          {
            id: "tracker_intro",
            name: "Tracker",
            role: "Companion",
            avatar: "📟",
            color: "amber",
            text: "We are in an active black-site, Vice. The blast doors are sealing, and corporate hit squads are coming. If that device can bypass firewall decrypters, we need it. Reach out, kid. Desperate times demand desperate weapons."
          }
        ],
        choices: [
          {
            id: "opt_examine",
            label: "🔎 [Examine Relic Frequencies]",
            targetStepId: "examine",
            checkType: "none",
            outcomeNarrative: "You calibrate your scanning sensor array and align receiver lenses with the pulsing relic casing.",
            variant: "cyan"
          },
          {
            id: "opt_vice",
            label: "💬 \"Vice, is there any way to analyze this safely?\"",
            targetStepId: "discuss_vice",
            checkType: "none",
            outcomeNarrative: "You gesture toward Vice to get a tactical opinion.",
            variant: "rose"
          },
          {
            id: "opt_tracker",
            label: "💬 \"Tracker, you seem awfully eager to risk my life here.\"",
            targetStepId: "discuss_tracker",
            checkType: "none",
            outcomeNarrative: "You look directly at Tracker's whirring optical cameras.",
            variant: "amber"
          },
          {
            id: "opt_touch",
            label: "⚡ [Reach out and touch the Relic]",
            targetStepId: "awakening",
            checkType: "none",
            outcomeNarrative: "You reach forward with an outstretched hand, disregarding your firewall warning alerts.",
            variant: "purple"
          }
        ]
      },

      examine: {
        id: "examine",
        badgeLabel: "SCANNING GRID SPECTRUM",
        stepTitle: "SCANNING GRID SPECTRUM",
        bannerTitle: "[CYBERDECK SCAN] HIGH-ETHER FREQUENCY",
        bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
        narrativeText: "You sync your deck to perform a non-contact resonance analysis. The readout spikes into warning thresholds. The energy signature is cognitive, resembling an ancient neural network's architecture. It operates directly on mental bio-electricity.",
        companions: [
          {
            id: "vice_examine",
            name: "Vice",
            role: "Companion",
            avatar: "🔫",
            color: "rose",
            text: "See that? Your ocular indicators are flickering already. Step back before that mental hum triggers a total cerebral bleed!"
          },
          {
            id: "tracker_examine",
            name: "Tracker",
            role: "Companion",
            avatar: "📟",
            color: "amber",
            text: "It's already syncing with your bio-signature. It wants a host, kid. Grab it. Stop hesitating before we get cornered like rats."
          }
        ],
        choices: [
          {
            id: "opt_examine_vice",
            label: "💬 \"Is there any way to insulate the connection, Vice?\"",
            targetStepId: "discuss_vice",
            variant: "rose"
          },
          {
            id: "opt_examine_touch",
            label: "⚡ [Touch the pulsing gold alloy]",
            targetStepId: "awakening",
            variant: "purple"
          }
        ]
      },

      discuss_vice: {
        id: "discuss_vice",
        badgeLabel: "SQUAD LOGS: ADVISORY",
        stepTitle: "SQUAD LOGS: ADVISORY",
        bannerTitle: "[CONSULTING VICE] TECHNICAL CONCERNS",
        bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
        narrativeText: "Vice stands close with his particle rifle raised, his tactical eye keeping a watchful lock on the exit corridor. He shakes his head, his face grim. He warns that pre-collapse neural code could permanently fry your cortex.",
        companions: [
          {
            id: "vice_advice",
            name: "Vice",
            role: "Companion",
            avatar: "🔫",
            color: "rose",
            text: "There is no safe way to load pre-collapse neural code. If you touch that, it'll dump raw, unfiltered cognitive files straight into your cerebral deck. Best case, you get a severe skull migraine. Worst case, your cortex turns into charcoal."
          }
        ],
        choices: [
          {
            id: "opt_vice_to_tracker",
            label: "💬 \"Tracker, what's your take on this?\"",
            targetStepId: "discuss_tracker",
            variant: "amber"
          },
          {
            id: "opt_vice_touch",
            label: "⚡ [Take the risk. Touch the Relic]",
            targetStepId: "awakening",
            variant: "purple"
          }
        ]
      },

      discuss_tracker: {
        id: "discuss_tracker",
        badgeLabel: "SQUAD LOGS: ADVISORY",
        stepTitle: "SQUAD LOGS: ADVISORY",
        bannerTitle: "[CONSULTING TRACKER] TACTICAL RISK ASSESSMENT",
        bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
        narrativeText: "Tracker leans against a pillar, checking his weapon's ammo counter. He has a tight, cold smile on his scarred face, his gaze locked on the golden energy pulse. He encourages you to reach out and seize the advantage.",
        companions: [
          {
            id: "tracker_advice",
            name: "Tracker",
            role: "Companion",
            avatar: "📟",
            color: "amber",
            text: "We're low-life runners, rookie. Every step in Megacity-9 is a gamble. Playing it safe gets you a shallow grave in the sewers. I'd rather take a direct psychic spike and have a fighting chance than sit here waiting for Ares executioners to hollow us out."
          }
        ],
        choices: [
          {
            id: "opt_tracker_to_vice",
            label: "💬 \"Vice has serious doubts about this.\"",
            targetStepId: "discuss_vice",
            variant: "rose"
          },
          {
            id: "opt_tracker_touch",
            label: "⚡ [Grab the Relic] \"Let's do this.\"",
            targetStepId: "awakening",
            variant: "purple"
          }
        ]
      },

      awakening: {
        id: "awakening",
        badgeLabel: "BIOMASS SYNAPSE ENGAGEMENT",
        stepTitle: "BIOMASS SYNAPSE ENGAGEMENT",
        bannerTitle: "SYNAPTIC MERGE AWAKENING",
        bannerImage: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=800",
        narrativeText: "You extend your hand and brush your fingers against the warm, gold-etched casing of the relic.\n\nInstantly, your vision is blown out by a blinding flash of violet light! A terrifying psychic shockwave rips into your temples, rearranging your synaptic cells. Your mind burns as ancient mental protocols fuse directly with your neural framework.",
        companions: [
          {
            id: "vice_awakening",
            name: "Vice",
            role: "Companion",
            avatar: "🔫",
            color: "rose",
            text: "Whoa! Kid! Your eyes... they are glowing purple! Settle your heartbeat! We've got massive sound reports breaching the outer perimeter!"
          },
          {
            id: "tracker_awakening",
            name: "Tracker",
            role: "Companion",
            avatar: "📟",
            color: "amber",
            text: "The ventilation shaft covers are blowing open! Ares Biotech Enforcers have arrived! Ready your weapons, recruit! It's do or die!"
          }
        ],
        choices: [
          {
            id: "opt_awakening_next",
            label: "⚠️ [Perimeter Breach Alarm] Steel your senses",
            targetStepId: "breach",
            variant: "rose"
          }
        ]
      },

      breach: {
        id: "breach",
        badgeLabel: "TACTICAL CRISIS: ENGAGED",
        stepTitle: "TACTICAL CRISIS: ENGAGED",
        bannerTitle: "⚠ IMMINENT THREAT DETECTED: PERIMETER BREACH",
        bannerImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800",
        narrativeText: "Before the neural code can even settle, a massive rumble shakes the stone chamber! The heavy outer blast door is violently blown inward in a cascade of metal shards and plaster dust.\n\nThrough the smoke, a heavily armed tactical squad of Ares Corporate Enforcers advances, their automatic laser rifles painting the room with lethal red targeting beams!",
        companions: [
          {
            id: "vice_breach",
            name: "Vice",
            role: "Companion",
            avatar: "🔫",
            color: "rose",
            text: "They're inside! Sector lockdown has initiated! Guard your flanks! Don't let them pin us down in this altar room!"
          },
          {
            id: "tracker_breach",
            name: "Tracker",
            role: "Companion",
            avatar: "📟",
            color: "amber",
            text: "I see high-caliber lasers painting the altar! They are targeting the recruit while they're syncing with the database crystal! Get behind cover!"
          }
        ],
        choices: [
          {
            id: "opt_breach_next",
            label: "🛡️ [Tracker steps forward] Brace for impact",
            targetStepId: "sacrifice",
            variant: "amber"
          }
        ]
      },

      sacrifice: {
        id: "sacrifice",
        badgeLabel: "SQUAD CASUALTY DETECTED",
        stepTitle: "SQUAD CASUALTY DETECTED",
        bannerTitle: "🩸 CRITICAL CASUALTY: TRACKER DOWN",
        bannerImage: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800",
        narrativeText: "You are still paralyzed by the high-frequency synaptic merging, helpless as an Ares elite sniper aligns a laser beam directly onto your temples.\n\nSensing the threat, Tracker lunges in front of your neural deck! The superheated plasma shot rips straight through his central processor core. Metal shreds, sparks cascade, and with a terrible mechanical shriek, Tracker collapses onto the stone floor, his vitals flatlining.",
        companions: [
          {
            id: "vice_sacrifice",
            name: "Vice",
            role: "Companion",
            avatar: "👩‍🎤",
            color: "rose",
            text: "NO! Tracker! You absolute idiot... why did you do that?! His central energy matrix is ruptured... he's leaking direct reactor plasma!"
          },
          {
            id: "tracker_dying",
            name: "Tracker (Dying)",
            role: "Companion",
            avatar: "📟",
            color: "amber",
            text: "*Glitch static*... Rook... don't let... them take the crystal... Vice... escape..."
          }
        ],
        choices: [
          {
            id: "opt_sacrifice_next",
            label: "⚡ [The Mindmancy awakens in righteous fury]",
            targetStepId: "awakened_fury",
            variant: "purple"
          }
        ]
      },

      awakened_fury: {
        id: "awakened_fury",
        badgeLabel: "COGNITIVE PROTOCOL ACTIVE",
        stepTitle: "COGNITIVE PROTOCOL ACTIVE",
        bannerTitle: "🔮 HYPER-CONSCIOUS UNLEASHED: MINDMANCER",
        bannerImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
        narrativeText: "Tracker's chassis lies silent, venting smoking radioactive coolant. Vice is pinned behind a metal terminal block, return-firing desperately:\n\n'Tracker is down! His power core is completely flatlined! Rookie, whatever that gold relic did to your mind, you have to unleash it now! SQUEEZE THEIR CHIPS! BURST THEIR BRAINS!'\n\nYou stand up, your temples pulsing with raw purple energy. The neural block is gone. You are ready.",
        companions: [
          {
            id: "vice_furious",
            name: "Vice (Furious)",
            role: "Companion",
            avatar: "👩‍🎤",
            color: "rose",
            text: "His spark is gone, rookie... completely flatlined. I'm pinned down behind this backup console. Squeeze their neural chips! Burn them to the ground with that mindmancy!"
          }
        ],
        choices: [
          {
            id: "opt_combat_start",
            label: "🔮 [Wield the Relic's Mindmancy] Engage Ambushers",
            unlockMindmancer: true,
            maxHpDelta: -25,
            combat: {
              enemyName: "Ares Corporate Enforcers (Ambush)",
              enemyHp: 160,
              enemyShields: 20,
              turnLog: "Ares Corporate Enforcers breach the sanctuary and open fire.",
              victorySceneId: "prologue_escape",
              victoryCompletionAction: "relic_altar:ambush_survived"
            },
            variant: "purple"
          }
        ]
      }
    }
  },

  outcast_briefing: {
    id: "outcast_briefing", poiId: "bar", poiName: "The Neon Abyss Bar", districtId: "aurus", title: "OUTCAST DIRECTIVE", initialStepId: "briefing", linkedQuestId: "outcast_directive",
    steps: { briefing: { id: "briefing", stepTitle: "AGENT JAX BRIEFING", bannerTitle: "TECHNICAL SIGNAL CORE CONTRACT", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Jax traces an Ares telemetry core to the derelict Shatter Ridge highwalks. Recover it before the scavengers strip its encryption lattice.", companions: [{ id: "jax_outcast", name: "Agent Jax", role: "Outcast Coordinator", avatar: "🕶️", color: "cyan", text: "Bring me the Technical Signal Core intact. I need its routing table." }], choices: [{ id: "accept_outcast", label: "Accept Outcast Directive", activateQuestId: "outcast_directive", targetPOIId: "shatter_ridge", outcomeNarrative: "The Shatter Ridge coordinates upload to your map.", variant: "emerald" }] } }
  },
  outcast_core_recovery: {
    id: "outcast_core_recovery", poiId: "shatter_ridge", poiName: "Shatter Ridge Corridors", districtId: "downtown", title: "OUTCAST: CORE RECOVERY", initialStepId: "search", linkedQuestId: "outcast_directive", linkedStageId: "mq1_s1",
    steps: { search: { id: "search", stepTitle: "SCAVENGER INTERCEPT", bannerTitle: "SHATTER RIDGE HIGHWALKS", bannerImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=800", narrativeText: "Rust-Claw scavengers drag an active copper signal core across the high-voltage catwalks.", choices: [
      { id: "outcast_stealth", label: "Navigate Catwalks Silently [DEX 11]", checkType: "dex", checkValue: 11, grantsXP: 40, grantsItem: "Technical Signal Core", completionAction: "outcast:core_secured", targetPOIId: "bar", outcomeNarrative: "You detach the core without alerting the patrol.", failureNarrative: "A patrol drone catches your movement. Reassess the route.", failureHpDamage: 10, failureTargetStepId: "search", variant: "cyan" },
      { id: "outcast_fight", label: "Attack the Scavenger Guard", combat: { enemyName: "Rogue Rust-Claw Orc", enemyHp: 80, enemyShields: 20, turnLog: "The scavenger guard opens fire across the highwalk.", victorySceneId: "outcast_core_victory", victoryCompletionAction: "outcast:core_secured" }, variant: "rose" }
    ] } }
  },
  outcast_core_victory: {
    id: "outcast_core_victory", poiId: "shatter_ridge", poiName: "Shatter Ridge Corridors", districtId: "downtown", title: "CORE SECURED", initialStepId: "loot", linkedQuestId: "outcast_directive", linkedStageId: "mq1_s1",
    steps: { loot: { id: "loot", stepTitle: "SCAVENGER WAGON CAPTURED", bannerTitle: "TECHNICAL SIGNAL CORE RECOVERED", bannerImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=800", narrativeText: "The scavenger guard collapses. The copper Technical Signal Core is still active inside the salvage wagon.", choices: [{ id: "take_outcast_core", label: "Take Core and Return to Jax", grantsItem: "Technical Signal Core", grantsCredits: 0, completionAction: "outcast:core_secured", targetPOIId: "bar", variant: "emerald" }] } }
  },
  outcast_turn_in: {
    id: "outcast_turn_in", poiId: "bar", poiName: "The Neon Abyss Bar", districtId: "aurus", title: "OUTCAST DIRECTIVE: DELIVERY", initialStepId: "delivery", linkedQuestId: "outcast_directive", linkedStageId: "mq1_s2",
    steps: { delivery: { id: "delivery", stepTitle: "AGENT JAX", bannerTitle: "SIGNAL CORE DECRYPTION", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Jax opens a shielded receiver case and waits for the Technical Signal Core.", choices: [{ id: "deliver_outcast", label: "Deliver Technical Signal Core", checkType: "item", requiredItem: "Technical Signal Core", consumeItem: true, completionAction: "outcast:delivered", completeQuestId: "outcast_directive", outcomeNarrative: "Jax decrypts the Ares telemetry stream and transfers your payment.", variant: "emerald" }] } }
  },
  corporate_hunt_briefing: {
    id: "corporate_hunt_briefing", poiId: "armory", poiName: "Apex Armory (Underground Weapon Shop)", districtId: "aurus", title: "CORPORATE HUNT", initialStepId: "briefing", linkedQuestId: "corporate_hunt",
    steps: { briefing: { id: "briefing", stepTitle: "CHANCELLOR ARIA", bannerTitle: "ARES MUTAGENIC DISCHARGE", bannerImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800", narrativeText: "Aria identifies an Ares-engineered creature feeding in the Docks waterworks. Its Acid Beast Core is required as evidence.", companions: [{ id: "aria_hunt", name: "Chancellor Aria", role: "Armory Chancellor", avatar: "⚔️", color: "amber", text: "Kill the Behemoth and bring me its core. Do not rupture the catalyst." }], choices: [{ id: "accept_hunt", label: "Accept Corporate Hunt", activateQuestId: "corporate_hunt", targetPOIId: "sludge_conduits", variant: "emerald" }] } }
  },
  corporate_hunt_behemoth: {
    id: "corporate_hunt_behemoth", poiId: "sludge_conduits", poiName: "Sludge Conduits & Waterworks", districtId: "docks", title: "CORPORATE HUNT: BEHEMOTH", initialStepId: "hunt", linkedQuestId: "corporate_hunt", linkedStageId: "mq2_s1",
    steps: { hunt: { id: "hunt", stepTitle: "TOXIC CONTACT", bannerTitle: "SLUDGE BEHEMOTH LAIR", bannerImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800", narrativeText: "A bio-engineered Behemoth rises from the radioactive runoff, its Acid Beast Core visible beneath a corroded shell.", choices: [
      { id: "hunt_science", label: "Synthesize Neutralizer [INT 13]", checkType: "int", checkValue: 13, grantsXP: 50, combat: { enemyName: "Toxic Sludge Behemoth", enemyHp: 90, enemyShields: 0, turnLog: "The neutralized Behemoth lunges from the runoff.", victorySceneId: "corporate_hunt_victory", victoryCompletionAction: "corporate_hunt:behemoth_defeated" }, failureNarrative: "The compound destabilizes before injection.", failureTargetStepId: "hunt", variant: "cyan" },
      { id: "hunt_attack", label: "Engage Toxic Sludge Behemoth", combat: { enemyName: "Toxic Sludge Behemoth", enemyHp: 150, enemyShields: 20, turnLog: "The Behemoth sprays corrosive sludge across the conduit.", victorySceneId: "corporate_hunt_victory", victoryCompletionAction: "corporate_hunt:behemoth_defeated" }, variant: "rose" }
    ] } }
  },
  corporate_hunt_victory: {
    id: "corporate_hunt_victory", poiId: "sludge_conduits", poiName: "Sludge Conduits & Waterworks", districtId: "docks", title: "ACID CORE RECOVERED", initialStepId: "core", linkedQuestId: "corporate_hunt", linkedStageId: "mq2_s1",
    steps: { core: { id: "core", stepTitle: "BEHEMOTH ELIMINATED", bannerTitle: "ACID BEAST CORE", bannerImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800", narrativeText: "The Behemoth collapses and exposes its pulsating catalyst core.", choices: [{ id: "take_acid_core", label: "Extract Core and Return to Aria", grantsItem: "Acid Beast Core", completionAction: "corporate_hunt:behemoth_defeated", targetPOIId: "armory", variant: "emerald" }] } }
  },
  corporate_hunt_turn_in: {
    id: "corporate_hunt_turn_in", poiId: "armory", poiName: "Apex Armory (Underground Weapon Shop)", districtId: "aurus", title: "CORPORATE HUNT: TURN IN", initialStepId: "delivery", linkedQuestId: "corporate_hunt", linkedStageId: "mq2_s2",
    steps: { delivery: { id: "delivery", stepTitle: "CHANCELLOR ARIA", bannerTitle: "BIO-CATALYST EVIDENCE", bannerImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800", narrativeText: "Aria's containment vessel is ready for the Acid Beast Core.", choices: [{ id: "deliver_acid", label: "Deliver Acid Beast Core", checkType: "item", requiredItem: "Acid Beast Core", consumeItem: true, completionAction: "corporate_hunt:delivered", completeQuestId: "corporate_hunt", variant: "emerald" }] } }
  },
  syndicate_briefing: {
    id: "syndicate_briefing", poiId: "temple", poiName: "The Iron Coven Temple", districtId: "satoshi", title: "SYNDICATE CATALYST", initialStepId: "briefing", linkedQuestId: "syndicate_catalyst",
    steps: { briefing: { id: "briefing", stepTitle: "PRIESTESS MORGANA", bannerTitle: "LEY-MATRIX RITUAL", bannerImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800", narrativeText: "Morgana requires a charged Ley-Matrix to decode the corporate frequencies surrounding Vice.", companions: [{ id: "morgana_matrix", name: "Priestess Morgana", role: "Coven Technomancer", avatar: "🔮", color: "purple", text: "Take the matrix into the Cyber-Shrine gardens and align it with the ley-stream." }], choices: [{ id: "accept_syndicate", label: "Accept Syndicate Catalyst", activateQuestId: "syndicate_catalyst", targetPOIId: "neon_shrine", variant: "emerald" }] } }
  },
  syndicate_charge_matrix: {
    id: "syndicate_charge_matrix", poiId: "neon_shrine", poiName: "Satoshi Cyber-Shrine Gardens", districtId: "satoshi", title: "LEY-MATRIX CHARGING", initialStepId: "shrine", linkedQuestId: "syndicate_catalyst", linkedStageId: "mq3_s1",
    steps: { shrine: { id: "shrine", stepTitle: "CYBER-SHRINE", bannerTitle: "CELESTIAL FREQUENCY ALIGNMENT", bannerImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800", narrativeText: "Holographic blossoms orbit the dormant Ley-Matrix as the shrine opens a channel into the ether stream.", choices: [
      { id: "matrix_will", label: "Enter Technomantic Trance [WILL 12]", checkType: "will", checkValue: 12, grantsXP: 60, grantsItem: "Charged Ley-Matrix", completionAction: "syndicate:matrix_charged", outcomeNarrative: "The matrix ignites with stable violet energy.", failureNarrative: "The ley-stream rejects the unstable synchronization.", failureTargetStepId: "shrine", variant: "purple" },
      { id: "matrix_battery", label: "Overcharge with Ether Battery", checkType: "item", requiredItem: "Ether battery", consumeItem: true, grantsCredits: 50, grantsItem: "Charged Ley-Matrix", completionAction: "syndicate:matrix_charged", variant: "cyan" },
      { id: "matrix_return", label: "Return Charged Matrix to Morgana", checkType: "item", requiredItem: "Charged Ley-Matrix", targetStepId: "__EXIT__", targetPOIId: "temple", variant: "emerald" }
    ] } }
  },
  syndicate_turn_in: {
    id: "syndicate_turn_in", poiId: "temple", poiName: "The Iron Coven Temple", districtId: "satoshi", title: "SYNDICATE CATALYST: RETURN", initialStepId: "delivery", linkedQuestId: "syndicate_catalyst", linkedStageId: "mq3_s2",
    steps: { delivery: { id: "delivery", stepTitle: "PRIESTESS MORGANA", bannerTitle: "CHARGED MATRIX DELIVERED", bannerImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800", narrativeText: "Morgana extends both hands toward the charged matrix.", choices: [{ id: "deliver_matrix", label: "Deliver Charged Ley-Matrix", checkType: "item", requiredItem: "Charged Ley-Matrix", consumeItem: true, completionAction: "syndicate:matrix_delivered", completeQuestId: "syndicate_catalyst", variant: "emerald" }] } }
  },
  hunt_for_vice_briefing: {
    id: "hunt_for_vice_briefing", poiId: "club_afterlife", poiName: "Club Afterlife VIP Lounge", districtId: "downtown", title: "THE HUNT FOR VICE", initialStepId: "briefing", linkedQuestId: "hunt_for_vice",
    steps: { briefing: { id: "briefing", stepTitle: "CIPHER'S TRACE", bannerTitle: "ARES CRYO-SHIPMENT ID", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Cipher isolates a Titan Logistics shipment ID connected to an Ares cryogenic holding block.", companions: [{ id: "cipher_trace", name: "Cipher", role: "Data Broker", avatar: "💻", color: "cyan", text: "The freight terminal has the chamber coordinates. Slice it or buy access." }], choices: [{ id: "accept_hunt_vice", label: "Begin the Hunt for Vice", activateQuestId: "hunt_for_vice", targetPOIId: "freight_hub", variant: "emerald" }] } }
  },
  hunt_for_vice_freight_logs: {
    id: "hunt_for_vice_freight_logs", poiId: "freight_hub", poiName: "Titan Logistics Freight Hub", districtId: "docks", title: "FREIGHT LOG INFILTRATION", initialStepId: "terminal", linkedQuestId: "hunt_for_vice", linkedStageId: "mq4_s1",
    steps: { terminal: { id: "terminal", stepTitle: "TITAN CARGO TERMINAL", bannerTitle: "CRYO-SHIPMENT DATABASE", bannerImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800", narrativeText: "The freight terminal indexes millions of corporate cargo lines. Vice's cryo-shipment is buried inside the encrypted manifest.", choices: [
      { id: "logs_bribe", label: "Pay Dock Foreman [100¤]", checkType: "credits", checkValue: 100, grantsXP: 30, completionAction: "hunt_for_vice:logs_acquired", completeQuestId: "hunt_for_vice", outcomeNarrative: "The foreman provides Chamber B-12 coordinates.", variant: "amber" },
      { id: "logs_slice", label: "Slice Cargo Terminal [INT 13]", checkType: "int", checkValue: 13, grantsXP: 60, completionAction: "hunt_for_vice:logs_acquired", completeQuestId: "hunt_for_vice", outcomeNarrative: "The manifest reveals Vice in Cryo-Chamber B-12 beneath Corporate Plaza.", failureNarrative: "The terminal ICE rejects the intrusion.", failureManaDamage: 20, failureTargetStepId: "terminal", variant: "cyan" }
    ] } }
  },
  rescue_vice_plaza: {
    id: "rescue_vice_plaza", poiId: "corporate_plaza", poiName: "Ares Biotech Corporate Plaza", districtId: "downtown", title: "RESCUE VICE", initialStepId: "checkpoint", linkedQuestId: "rescue_vice", linkedStageId: "mq5_s1",
    steps: {
      checkpoint: { id: "checkpoint", stepTitle: "PLAZA CHECKPOINT", bannerTitle: "ARES LASER GRID", bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", narrativeText: "Automated sentinels guard the staff lift leading to Cryo-Bay B-12.", choices: [
        { id: "plaza_stealth", label: "Scale Maintenance Shaft [DEX 14]", checkType: "dex", checkValue: 14, grantsXP: 80, completionAction: "rescue_vice:checkpoint_bypassed", targetStepId: "cryo_bay", outcomeNarrative: "You bypass the checkpoint and drop above the cryo bay.", failureNarrative: "The security grid detects your approach.", failureHpDamage: 15, failureTargetStepId: "checkpoint", variant: "cyan" },
        { id: "plaza_assault", label: "Assault the Plaza Guards", combat: { enemyName: "Ares Plasma Sentinel", enemyHp: 110, enemyShields: 40, turnLog: "The ceiling-mounted Plasma Sentinel engages.", victorySceneId: "rescue_vice_after_checkpoint", victoryCompletionAction: "rescue_vice:checkpoint_bypassed" }, variant: "rose" }
      ] },
      cryo_bay: { id: "cryo_bay", stepTitle: "CRYO-BAY B-12", bannerTitle: "VICE IN CRYO-LOCKDOWN", bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800", narrativeText: "Vice is suspended behind frost-covered glass. Three release vectors remain available.", choices: [
        { id: "cryo_force", label: "Force Emergency Valve [STR 16]", checkType: "str", checkValue: 16, completionAction: "rescue_vice:extracted", completeQuestId: "rescue_vice", outcomeNarrative: "The valve tears open and Vice ejects safely.", failureNarrative: "Freezing coolant burns your arms.", failureHpDamage: 20, failureTargetStepId: "cryo_bay", variant: "rose" },
        { id: "cryo_hack", label: "Override Cryogenic Suspension", triggerHackingPuzzleType: "cryo_bypass", variant: "cyan" },
        { id: "cryo_mana", label: "Short-Circuit Grid [30 Mana]", checkType: "mana", checkValue: 30, completionAction: "rescue_vice:extracted", completeQuestId: "rescue_vice", outcomeNarrative: "The technomantic surge releases Vice from the pod.", variant: "purple" }
      ] }
    }
  },
  rescue_vice_after_checkpoint: {
    id: "rescue_vice_after_checkpoint", poiId: "corporate_plaza", poiName: "Ares Biotech Corporate Plaza", districtId: "downtown", title: "CHECKPOINT BREACHED", initialStepId: "continue", linkedQuestId: "rescue_vice", linkedStageId: "mq5_s1",
    steps: { continue: { id: "continue", stepTitle: "CRYO-BAY B-12", bannerTitle: "VICE IN CRYO-LOCKDOWN", bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800", narrativeText: "The destroyed sentinel exposes the staff lift. Below, Vice is suspended behind frost-covered glass.", choices: [
      { id: "post_combat_cryo_force", label: "Force Emergency Valve [STR 16]", checkType: "str", checkValue: 16, completionAction: "rescue_vice:extracted", completeQuestId: "rescue_vice", failureNarrative: "Freezing coolant burns your arms.", failureHpDamage: 20, failureTargetStepId: "continue", variant: "rose" },
      { id: "post_combat_cryo_hack", label: "Override Cryogenic Suspension", triggerHackingPuzzleType: "cryo_bypass", variant: "cyan" },
      { id: "post_combat_cryo_mana", label: "Short-Circuit Grid [30 Mana]", checkType: "mana", checkValue: 30, completionAction: "rescue_vice:extracted", completeQuestId: "rescue_vice", variant: "purple" }
    ] } }
  },
  chem_weaver_briefing: {
    id: "chem_weaver_briefing", poiId: "temple", poiName: "The Iron Coven Temple", districtId: "satoshi", title: "CHEM-WEAVER'S REQUEST", initialStepId: "briefing", linkedQuestId: "chem_weaver_request",
    steps: { briefing: { id: "briefing", stepTitle: "PRIESTESS MORGANA", bannerTitle: "BIO-LUMINESCENT REAGENTS", bannerImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800", narrativeText: "Morgana needs three living slime cultures from the Docks conduits for a neuro-protective elixir.", choices: [{ id: "accept_chem", label: "Accept Chem-Weaver's Request", activateQuestId: "chem_weaver_request", targetPOIId: "sludge_conduits", variant: "emerald" }] } }
  },
  chem_weaver_harvest: {
    id: "chem_weaver_harvest", poiId: "sludge_conduits", poiName: "Sludge Conduits & Waterworks", districtId: "docks", title: "GLOWING SLIME HARVEST", initialStepId: "harvest", linkedQuestId: "chem_weaver_request", linkedStageId: "cw_s1",
    steps: { harvest: { id: "harvest", stepTitle: "TOXIC WATERWAY", bannerTitle: "BIO-ACTIVE SLIME POOLS", bannerImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800", narrativeText: "Three stable cultures pulse beneath a layer of corrosive runoff.", choices: [{ id: "collect_slime", label: "Extract Three Cultures [INT 10]", checkType: "int", checkValue: 10, grantsItem: "Glowing Slime", grantsItemQuantity: 3, completionAction: "chem_weaver:slime_harvested", targetPOIId: "temple", failureNarrative: "The first sample ruptures. Recalibrate the extractor.", failureHpDamage: 8, failureTargetStepId: "harvest", variant: "cyan" }] } }
  },
  chem_weaver_turn_in: {
    id: "chem_weaver_turn_in", poiId: "temple", poiName: "The Iron Coven Temple", districtId: "satoshi", title: "CHEM-WEAVER: DELIVERY", initialStepId: "delivery", linkedQuestId: "chem_weaver_request", linkedStageId: "cw_s2",
    steps: { delivery: { id: "delivery", stepTitle: "PRIESTESS MORGANA", bannerTitle: "SLIME CULTURES DELIVERED", bannerImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800", narrativeText: "Morgana opens three sealed culture chambers beside the alchemical loom.", choices: [{ id: "deliver_slime", label: "Deliver 3x Glowing Slime", checkType: "item", requiredItem: "Glowing Slime", requiredItemQuantity: 3, consumeItem: true, completionAction: "chem_weaver:delivered", completeQuestId: "chem_weaver_request", variant: "emerald" }] } }
  },
  drone_schematic_briefing: {
    id: "drone_schematic_briefing", poiId: "bar", poiName: "The Neon Abyss Bar", districtId: "aurus", title: "THE LOST DRONE SCHEMATIC", initialStepId: "briefing", linkedQuestId: "lost_drone_schematic",
    steps: { briefing: { id: "briefing", stepTitle: "AGENT JAX", bannerTitle: "DOWNED ARES COURIER", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Rust-Claw raiders recovered a neural flight chip from an Ares courier drone over Shatter Ridge.", choices: [{ id: "accept_drone", label: "Recover the Drone Chip", activateQuestId: "lost_drone_schematic", targetPOIId: "shatter_ridge", variant: "emerald" }] } }
  },
  drone_chip_recovery: {
    id: "drone_chip_recovery", poiId: "shatter_ridge", poiName: "Shatter Ridge Corridors", districtId: "downtown", title: "DRONE CHIP RECOVERY", initialStepId: "ambush", linkedQuestId: "lost_drone_schematic", linkedStageId: "drone_s1",
    steps: { ambush: { id: "ambush", stepTitle: "RUST-CLAW CAMP", bannerTitle: "COURIER WRECK LOCATED", bannerImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=800", narrativeText: "A Rust-Claw brute guards the courier wreck and its intact Experimental Drone Chip.", choices: [{ id: "drone_fight", label: "Ambush Rust-Claw Orcs", combat: { enemyName: "Rogue Rust-Claw Orc", enemyHp: 95, enemyShields: 20, turnLog: "The Rust-Claw raiders defend the wreck.", victorySceneId: "drone_chip_victory", victoryCompletionAction: "drone:chip_recovered" }, variant: "rose" }, { id: "drone_steal", label: "Steal Chip [DEX 13]", checkType: "dex", checkValue: 13, grantsItem: "Experimental Drone Chip", completionAction: "drone:chip_recovered", targetPOIId: "bar", failureNarrative: "The raiders spot your hand inside the wreck.", failureHpDamage: 12, failureTargetStepId: "ambush", variant: "cyan" }] } }
  },
  drone_chip_victory: {
    id: "drone_chip_victory", poiId: "shatter_ridge", poiName: "Shatter Ridge Corridors", districtId: "downtown", title: "DRONE CHIP SECURED", initialStepId: "loot", linkedQuestId: "lost_drone_schematic", linkedStageId: "drone_s1",
    steps: { loot: { id: "loot", stepTitle: "COURIER WRECK", bannerTitle: "EXPERIMENTAL FLIGHT CORE", bannerImage: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=800", narrativeText: "The raiders fall, leaving the drone's neural chip exposed.", choices: [{ id: "take_drone_chip", label: "Take Experimental Drone Chip", grantsItem: "Experimental Drone Chip", completionAction: "drone:chip_recovered", targetPOIId: "bar", variant: "emerald" }] } }
  },
  drone_chip_resolution: {
    id: "drone_chip_resolution", poiId: "bar", poiName: "The Neon Abyss Bar", districtId: "aurus", title: "DRONE SCHEMATIC: RESOLUTION", initialStepId: "choice", linkedQuestId: "lost_drone_schematic", linkedStageId: "drone_s2",
    steps: { choice: { id: "choice", stepTitle: "AGENT JAX", bannerTitle: "FLIGHT CORE DECRYPTION", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Jax can fence the chip, or its firmware can be retained for the Hideout defense grid.", choices: [{ id: "give_chip_jax", label: "Deliver Chip to Jax", checkType: "item", requiredItem: "Experimental Drone Chip", consumeItem: true, completionAction: "drone:resolved", completeQuestId: "lost_drone_schematic", variant: "emerald" }, { id: "install_chip", label: "Retain Firmware for Base Security", checkType: "item", requiredItem: "Experimental Drone Chip", consumeItem: true, grantsCredits: 50, completionAction: "drone:resolved", completeQuestId: "lost_drone_schematic", variant: "cyan" }] } }
  },
  smugglers_briefing: {
    id: "smugglers_briefing", poiId: "freight_hub", poiName: "Titan Logistics Freight Hub", districtId: "docks", title: "THE SMUGGLER'S RUN", initialStepId: "briefing", linkedQuestId: "smugglers_run",
    steps: { briefing: { id: "briefing", stepTitle: "TITAN QUARTERMASTER", bannerTitle: "HIJACKED WEAPON SHIPMENT", bannerImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800", narrativeText: "Iron Anchor pirates seized a crate of military vibroblades and moved it to Rusty Anchor Shipyard.", choices: [{ id: "accept_smugglers", label: "Accept Smuggler's Run", activateQuestId: "smugglers_run", targetPOIId: "shipyard", variant: "emerald" }] } }
  },
  smugglers_shipyard_raid: {
    id: "smugglers_shipyard_raid", poiId: "shipyard", poiName: "Rusty Anchor Shipyard", districtId: "docks", title: "SHIPYARD RAID", initialStepId: "raid", linkedQuestId: "smugglers_run", linkedStageId: "smug_s1",
    steps: { raid: { id: "raid", stepTitle: "IRON ANCHOR WAREHOUSE", bannerTitle: "STOLEN WEAPON CRATE", bannerImage: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800", narrativeText: "Dock pirates fortify the warehouse holding Titan's stolen weapons.", choices: [{ id: "raid_smugglers", label: "Storm the Warehouse", combat: { enemyName: "Iron Anchor Smuggler Captain", enemyHp: 120, enemyShields: 25, turnLog: "The Iron Anchor crew opens fire from the gantries.", victorySceneId: "smugglers_raid_victory", victoryCompletionAction: "smugglers:crate_recovered" }, variant: "rose" }, { id: "steal_crate", label: "Use Crane Controls [INT 12]", checkType: "int", checkValue: 12, grantsItem: "Stolen Weapon Crate", completionAction: "smugglers:crate_recovered", targetPOIId: "freight_hub", failureNarrative: "The crane alarm exposes the intrusion.", failureTargetStepId: "raid", variant: "cyan" }] } }
  },
  smugglers_raid_victory: {
    id: "smugglers_raid_victory", poiId: "shipyard", poiName: "Rusty Anchor Shipyard", districtId: "docks", title: "SHIPMENT RECOVERED", initialStepId: "loot", linkedQuestId: "smugglers_run", linkedStageId: "smug_s1",
    steps: { loot: { id: "loot", stepTitle: "WAREHOUSE SECURED", bannerTitle: "TITAN WEAPON CRATE", bannerImage: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800", narrativeText: "The marked Titan crate remains sealed behind the fallen pirates.", choices: [{ id: "take_weapon_crate", label: "Recover Stolen Weapon Crate", grantsItem: "Stolen Weapon Crate", completionAction: "smugglers:crate_recovered", targetPOIId: "freight_hub", variant: "emerald" }] } }
  },
  smugglers_turn_in: {
    id: "smugglers_turn_in", poiId: "freight_hub", poiName: "Titan Logistics Freight Hub", districtId: "docks", title: "SMUGGLER'S RUN: DELIVERY", initialStepId: "delivery", linkedQuestId: "smugglers_run", linkedStageId: "smug_s2",
    steps: { delivery: { id: "delivery", stepTitle: "TITAN QUARTERMASTER", bannerTitle: "SHIPMENT RETURNED", bannerImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800", narrativeText: "The quartermaster verifies the crate's seal and opens a payment channel.", choices: [{ id: "deliver_crate", label: "Deliver Stolen Weapon Crate", checkType: "item", requiredItem: "Stolen Weapon Crate", consumeItem: true, completionAction: "smugglers:crate_delivered", completeQuestId: "smugglers_run", variant: "emerald" }] } }
  },
  cybernetic_harvest_briefing: {
    id: "cybernetic_harvest_briefing", poiId: "marv_clinic", poiName: "Dr. Marv's Cyber-Genetics Clinic", districtId: "docks", title: "CYBERNETIC HARVEST", initialStepId: "briefing", linkedQuestId: "cybernetic_harvest",
    steps: { briefing: { id: "briefing", stepTitle: "DR. MARV", bannerTitle: "NEURAL REGULATOR SHORTAGE", bannerImage: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=800", narrativeText: "Marv needs two military neural regulators from the Ares patrol at the Highwalk Homicide Site.", choices: [{ id: "accept_harvest", label: "Accept Cybernetic Harvest", activateQuestId: "cybernetic_harvest", targetPOIId: "homicide_site", variant: "emerald" }] } }
  },
  cybernetic_harvest_patrol: {
    id: "cybernetic_harvest_patrol", poiId: "homicide_site", poiName: "Highwalk Homicide Site", districtId: "downtown", title: "ARES PATROL HARVEST", initialStepId: "ambush", linkedQuestId: "cybernetic_harvest", linkedStageId: "harv_s1",
    steps: { ambush: { id: "ambush", stepTitle: "CORPORATE PATROL", bannerTitle: "MILITARY PROCESSORS DETECTED", bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", narrativeText: "Two Ares enforcers carry intact neural regulator modules.", choices: [{ id: "harvest_attack", label: "Ambush Ares Patrol", combat: { enemyName: "Ares Neural Patrol", enemyHp: 125, enemyShields: 35, turnLog: "The corporate patrol returns fire.", victorySceneId: "cybernetic_harvest_victory", victoryCompletionAction: "harvest:regulators_acquired" }, variant: "rose" }, { id: "harvest_disable", label: "Disable Their Cyberware [INT 14]", checkType: "int", checkValue: 14, grantsItem: "Neural Regulator", grantsItemQuantity: 2, completionAction: "harvest:regulators_acquired", targetPOIId: "marv_clinic", failureNarrative: "The patrol hardens its network against your intrusion.", failureManaDamage: 12, failureTargetStepId: "ambush", variant: "cyan" }] } }
  },
  cybernetic_harvest_victory: {
    id: "cybernetic_harvest_victory", poiId: "homicide_site", poiName: "Highwalk Homicide Site", districtId: "downtown", title: "REGULATORS HARVESTED", initialStepId: "loot", linkedQuestId: "cybernetic_harvest", linkedStageId: "harv_s1",
    steps: { loot: { id: "loot", stepTitle: "PATROL DISABLED", bannerTitle: "TWO NEURAL REGULATORS", bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", narrativeText: "Both military processor housings survived the firefight.", choices: [{ id: "take_regulators", label: "Harvest 2x Neural Regulator", grantsItem: "Neural Regulator", grantsItemQuantity: 2, completionAction: "harvest:regulators_acquired", targetPOIId: "marv_clinic", variant: "emerald" }] } }
  },
  cybernetic_harvest_turn_in: {
    id: "cybernetic_harvest_turn_in", poiId: "marv_clinic", poiName: "Dr. Marv's Cyber-Genetics Clinic", districtId: "docks", title: "CYBERNETIC HARVEST: DELIVERY", initialStepId: "delivery", linkedQuestId: "cybernetic_harvest", linkedStageId: "harv_s2",
    steps: { delivery: { id: "delivery", stepTitle: "DR. MARV", bannerTitle: "PROCESSORS DELIVERED", bannerImage: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=800", narrativeText: "Marv prepares two sterile sockets for the recovered regulators.", choices: [{ id: "deliver_regulators", label: "Deliver 2x Neural Regulator", checkType: "item", requiredItem: "Neural Regulator", requiredItemQuantity: 2, consumeItem: true, completionAction: "harvest:regulators_delivered", completeQuestId: "cybernetic_harvest", variant: "emerald" }] } }
  },
  nouveau_heist_briefing: {
    id: "nouveau_heist_briefing", poiId: "club_afterlife", poiName: "Club Afterlife VIP Lounge", districtId: "downtown", title: "NOUVEAU HEIST", initialStepId: "briefing", linkedQuestId: "nouveau_heist", linkedStageId: "nouveau_s1",
    steps: { briefing: { id: "briefing", stepTitle: "CIPHER", bannerTitle: "SHOWROOM ACCESS PACKAGE", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Cipher slides a forged VIP keycard across the table and marks the prototype battery display.", choices: [{ id: "accept_nouveau", label: "Take VIP Keycard and Begin Heist", activateQuestId: "nouveau_heist", grantsItem: "VIP Afterlife Keycard", completionAction: "nouveau:keycard_acquired", targetPOIId: "nouveau_chrome", variant: "emerald" }] } }
  },
  nouveau_showroom_heist: {
    id: "nouveau_showroom_heist", poiId: "nouveau_chrome", poiName: "Nouveau Cybernetic Showroom", districtId: "downtown", title: "NOUVEAU SHOWROOM HEIST", initialStepId: "showroom", linkedQuestId: "nouveau_heist", linkedStageId: "nouveau_s2",
    steps: { showroom: { id: "showroom", stepTitle: "PRESSURE SHIELD ARRAY", bannerTitle: "SINGULARITY BATTERY DISPLAY", bannerImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800", narrativeText: "The prototype battery floats behind electromagnetic pressure shields.", choices: [{ id: "use_vip_card", label: "Spoof VIP Maintenance Access", checkType: "item", requiredItem: "VIP Afterlife Keycard", consumeItem: true, grantsItem: "Prototype Singularity Battery", completionAction: "nouveau:battery_stolen", targetPOIId: "club_afterlife", variant: "cyan" }, { id: "hack_showroom", label: "Crack Shield Controller [INT 15]", checkType: "int", checkValue: 15, grantsItem: "Prototype Singularity Battery", completionAction: "nouveau:battery_stolen", targetPOIId: "club_afterlife", failureNarrative: "The pressure shield discharges into your cyberdeck.", failureManaDamage: 20, failureTargetStepId: "showroom", variant: "purple" }] } }
  },
  nouveau_heist_turn_in: {
    id: "nouveau_heist_turn_in", poiId: "club_afterlife", poiName: "Club Afterlife VIP Lounge", districtId: "downtown", title: "NOUVEAU HEIST: DELIVERY", initialStepId: "delivery", linkedQuestId: "nouveau_heist", linkedStageId: "nouveau_s3",
    steps: { delivery: { id: "delivery", stepTitle: "CIPHER", bannerTitle: "PROTOTYPE SECURED", bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e5?auto=format&fit=crop&q=80&w=800", narrativeText: "Cipher's insulated case is ready for the stolen battery.", choices: [{ id: "deliver_battery", label: "Deliver Prototype Singularity Battery", checkType: "item", requiredItem: "Prototype Singularity Battery", consumeItem: true, completionAction: "nouveau:battery_delivered", completeQuestId: "nouveau_heist", variant: "emerald" }] } }
  },
  vice_retribution_briefing: {
    id: "vice_retribution_briefing", poiId: "hideout", poiName: "Aurus Safehouse", districtId: "aurus", title: "VICE'S RETRIBUTION", initialStepId: "briefing", linkedQuestId: "vice_retribution",
    steps: { briefing: { id: "briefing", stepTitle: "VICE", bannerTitle: "ARES BLACK LEDGER", bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800", narrativeText: "Vice identifies the Shatter Ridge server holding the financial ledger behind her unit's execution order.", choices: [{ id: "accept_retribution", label: "Help Vice Retrieve the Ledger", activateQuestId: "vice_retribution", targetPOIId: "shatter_ridge", variant: "rose" }] } }
  },
  vice_ledger_hack: {
    id: "vice_ledger_hack", poiId: "shatter_ridge", poiName: "Shatter Ridge Corridors", districtId: "downtown", title: "ARES LEDGER BREACH", initialStepId: "server", linkedQuestId: "vice_retribution", linkedStageId: "vr_s1",
    steps: { server: { id: "server", stepTitle: "SECURE SERVER FARM", bannerTitle: "ARES FINANCIAL BLACKSITE", bannerImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800", narrativeText: "A counter-intrusion daemon protects the encrypted ledger archive.", choices: [{ id: "hack_ledger", label: "Decrypt Ledger [INT 15]", checkType: "int", checkValue: 15, grantsItem: "Encrypted Ares Ledger", completionAction: "vice:ledger_acquired", targetPOIId: "hideout", failureNarrative: "The daemon burns the current intrusion route.", failureManaDamage: 20, failureTargetStepId: "server", variant: "cyan" }, { id: "mind_ledger", label: "Psychic Tunnel [Mindmancer 2]", checkType: "mindmancer", checkValue: 6, grantsItem: "Encrypted Ares Ledger", completionAction: "vice:ledger_acquired", targetPOIId: "hideout", variant: "purple" }] } }
  },
  vice_ledger_turn_in: {
    id: "vice_ledger_turn_in", poiId: "hideout", poiName: "Aurus Safehouse", districtId: "aurus", title: "VICE'S RETRIBUTION: LEDGER", initialStepId: "delivery", linkedQuestId: "vice_retribution", linkedStageId: "vr_s2",
    steps: { delivery: { id: "delivery", stepTitle: "VICE", bannerTitle: "THE PROOF", bannerImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800", narrativeText: "Vice scans the ledger and finally sees the names behind the massacre.", choices: [{ id: "deliver_ledger", label: "Give Encrypted Ares Ledger to Vice", checkType: "item", requiredItem: "Encrypted Ares Ledger", consumeItem: true, completionAction: "vice:ledger_delivered", completeQuestId: "vice_retribution", variant: "rose" }] } }
  },
  shatter_ridge_security_post: {
    poiId: "shatter_ridge_security_post",
    poiName: "Shatter Ridge Security Checkpoint",
    districtId: "downtown",
    title: "DOWNTOWN SECTOR PERIMETER",
    initialStepId: "post_entry",
    linkedQuestId: "outcast_directive",
    linkedStageId: "mq1_s1",
    steps: {
      post_entry: {
        id: "post_entry",
        badgeLabel: "DISTRICT INTERSECTION",
        stepTitle: "SHATTER RIDGE ENTRANCE",
        bannerTitle: "DERELICT HIGHWALK CHECKPOINT & DRONE POST",
        bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
        narrativeText: "High above the flooded street level, rusted iron walkways connect the industrial spires of Shatter Ridge. Scavenger beacons flicker through the smog.",
        companions: [
          {
            id: "jax_comms",
            name: "Agent Jax (Comms)",
            role: "Fixer",
            avatar: "🕶️",
            color: "cyan",
            text: "The technical signal core is buried in the scrap mounds near the high catwalks. Don't let the local Orc scavengers dismantle it."
          }
        ],
        choices: [
          {
            id: "sr_search",
            label: "🔎 [Dexterity 11] Slip past the sentry towers to retrieve the Core",
            checkType: "dex",
            checkValue: 11,
            outcomeNarrative: "You evade the spotlights and extract the glowing copper core undamaged.",
            grantsXP: 50,
            grantsItem: "Technical Signal Core",
            variant: "emerald"
          },
          {
            id: "sr_fight",
            label: "⚔️ [Combat] Eliminate the Orc Scavenger sentries",
            checkType: "none",
            outcomeNarrative: "You ambush the scavenger outpost, taking the core and scavenging extra credits from their stash.",
            grantsCredits: 120,
            grantsItem: "Technical Signal Core",
            variant: "rose"
          }
        ]
      }
    }
  },

  sludge_conduits: {
    poiId: "sludge_conduits",
    poiName: "The Sludge Conduits & Drainage Slipways",
    districtId: "docks",
    title: "DOCKS TOXIC CHANNEL",
    initialStepId: "slipway",
    linkedQuestId: "corporate_hunt",
    linkedStageId: "mq2_s1",
    steps: {
      slipway: {
        id: "slipway",
        badgeLabel: "BIO-MUTATION HAZARD",
        stepTitle: "CHEMICAL RUNOFF SLIPWAY",
        bannerTitle: "SLUDGE BEHEMOTH NESTING SLIPWAYS",
        bannerImage: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800",
        narrativeText: "Bubbling green chemical waste pours into the brackish ocean bay. A massive monstrosity of flesh, chrome, and bubbling acid surfaces from the drainage conduit.",
        companions: [
          {
            id: "aria_comms",
            name: "Chancellor Aria",
            role: "Apex Overseer",
            avatar: "⚔️",
            color: "amber",
            text: "That beast is a byproduct of Ares illegal mutagen tests. Extract its Acid Core intact and bring it to Apex Armory."
          }
        ],
        choices: [
          {
            id: "sc_chem",
            label: "🧪 [Intelligence 13] Synthesize neutralizing aerosol compound",
            checkType: "int",
            checkValue: 13,
            outcomeNarrative: "The chemical spray neutralizes the beast's corrosive outer shell, letting you safely cut out the core.",
            grantsXP: 70,
            grantsItem: "Acid Beast Core",
            variant: "cyan"
          },
          {
            id: "sc_slam",
            label: "💥 [Strength 14] Slam heavy hydraulic drainage valve",
            checkType: "str",
            checkValue: 14,
            outcomeNarrative: "A crushing surge of high-pressure seawater pins the behemoth, allowing you to tear free the core.",
            grantsCredits: 150,
            grantsItem: "Acid Beast Core",
            variant: "amber"
          }
        ]
      }
    }
  }
};
