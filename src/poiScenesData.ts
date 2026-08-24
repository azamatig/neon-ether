import { POIInteractiveEvent } from "./types";

export const DEFAULT_POI_INTERACTIVE_SCENES: Record<string, POIInteractiveEvent> = {
  relic_altar: {
    poiId: "relic_altar",
    poiName: "Mysterious Relic Altar",
    districtId: "conduit09",
    title: "ANOMALY SEQUENCE: OBSIDIAN ALTAR",
    initialStepId: "intro",
    linkedQuestId: "prologue",
    linkedStageId: "p_s3",
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
            targetStepId: "combat",
            triggerCombatEncounterId: "ares_ambush",
            variant: "purple"
          }
        ]
      }
    }
  },

  ventilation_shaft: {
    poiId: "ventilation_shaft",
    poiName: "Level B4 Ventilation Shaft",
    districtId: "conduit09",
    title: "CONDUIT 09 INFILTRATION CHUTE",
    initialStepId: "entry",
    linkedQuestId: "prologue",
    linkedStageId: "p_s1",
    steps: {
      entry: {
        id: "entry",
        badgeLabel: "SUB-SURFACE SECTOR ACCESS",
        stepTitle: "CONDUIT 09 PERIMETER",
        bannerTitle: "RUSTED VENTILATION CHUTE & EXHAUST GRATE",
        bannerImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800",
        narrativeText: "The air in the maintenance shaft is thick with steam and ionized exhaust. A heavy reinforced steel grating blocks the duct opening into Ares Biotech's server vaults. Vice and Tracker wait behind you, checking laser charges.",
        companions: [
          {
            id: "vice_vent",
            name: "Vice",
            role: "Point Scout",
            avatar: "🔫",
            color: "rose",
            text: "Screws are rusted tight. Either pry it open with raw leverage, or squeeze through the narrow air scrubber bypass."
          },
          {
            id: "tracker_vent",
            name: "Tracker",
            role: "Combat Hacker",
            avatar: "📟",
            color: "amber",
            text: "Ares surveillance drones cycle every four minutes. Whatever you do, make it quick."
          }
        ],
        choices: [
          {
            id: "v_pry",
            label: "🔧 [Strength 10] Pry open the grating with your crowbar",
            checkType: "str",
            checkValue: 10,
            outcomeNarrative: "With a grinding screech, the rusted bolts shear off, opening the main conduit shaft.",
            grantsXP: 25,
            targetPOIId: "blast_door",
            variant: "cyan"
          },
          {
            id: "v_squeeze",
            label: "🏃 [Dexterity 11] Squeeze through narrow maintenance air-filter",
            checkType: "dex",
            checkValue: 11,
            outcomeNarrative: "You slip silently through the grease trap and drop behind the heavy gate.",
            grantsXP: 30,
            targetPOIId: "blast_door",
            variant: "emerald"
          },
          {
            id: "v_banter",
            label: "💬 [Squad Check-In] Talk with Vice and Tracker",
            targetStepId: "squad_banter",
            variant: "amber"
          }
        ]
      },
      squad_banter: {
        id: "squad_banter",
        badgeLabel: "SQUAD COMMS ACTIVE",
        stepTitle: "INFILTRATION HUD CHATTER",
        bannerTitle: "SQUAD BRIEFING // SECTOR CONDUIT",
        bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
        narrativeText: "Vice adjusts her holographic tactical visor, scanning the blueprint coordinates of Ares Sector 9.",
        companions: [
          {
            id: "vice_plan",
            name: "Vice",
            role: "Point Scout",
            avatar: "🔫",
            color: "rose",
            text: "Our payday is on that central datapad. Stick close, watch the corners, and don't touch anything glowing unless you want to lose a limb."
          }
        ],
        choices: [
          {
            id: "v_return",
            label: "↩️ Return to Grate Entry",
            targetStepId: "entry",
            variant: "cyan"
          }
        ]
      }
    }
  },

  blast_door: {
    poiId: "blast_door",
    poiName: "Reinforced Hydraulic Blast Door",
    districtId: "conduit09",
    title: "LEVEL B4 SECURITY GATEWAY",
    initialStepId: "door_approach",
    linkedQuestId: "prologue",
    linkedStageId: "p_s2",
    steps: {
      door_approach: {
        id: "door_approach",
        badgeLabel: "HEAVY BULKHEAD SECURED",
        stepTitle: "BULKHEAD FIREWALL ACTIVE",
        bannerTitle: "ARES BIOTECH HEAVY TITANIUM BLAST GATE",
        bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
        narrativeText: "A four-inch solid titanium blast door bars the entrance to the inner sanctuary. Hydraulic pistons hiss as emergency locking clamps clamp into the floor. The terminal pedestal hums with an orange access lock.",
        companions: [
          {
            id: "tracker_door",
            name: "Tracker",
            role: "Combat Hacker",
            avatar: "📟",
            color: "amber",
            text: "The bypass chip has an encrypted hash loop. Slice into the ICE node or burn the hydraulic pressure lines."
          }
        ],
        choices: [
          {
            id: "bd_hack",
            label: "💻 [Intelligence 11] Hack security terminal ICE subroutine",
            checkType: "int",
            checkValue: 11,
            outcomeNarrative: "You inject a polymorphic brute-force packet. The status lights turn from flashing crimson to steady emerald, and the door groans open.",
            grantsXP: 40,
            targetPOIId: "relic_altar",
            variant: "cyan"
          },
          {
            id: "bd_plasma",
            label: "🔥 [Plasma Torch] Overload door actuator solenoid",
            checkType: "none",
            outcomeNarrative: "Superheated blue plasma cuts the secondary locking pins. The door slams down, clearing your passage.",
            grantsCredits: 50,
            targetPOIId: "relic_altar",
            variant: "rose"
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
