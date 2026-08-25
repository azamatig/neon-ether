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
