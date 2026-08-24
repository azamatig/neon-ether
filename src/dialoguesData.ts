import { GameState } from "./types";

export interface DialogueChoice {
  text: string;
  nodeId: string;
  prereqText?: string;
  prereq?: (state: GameState) => boolean;
  onSelect?: (state: GameState) => GameState;
}

export interface DialogueNode {
  title: string;
  role: string;
  image: string;
  text: string | ((state: GameState) => string);
  choices: DialogueChoice[];
}

export const BRANCHING_DIALOGUES: Record<"jax" | "marv" | "cipher", Record<string, DialogueNode>> = {
  jax: {
    start: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "Rookie, good to see you. The street is a wire-thin path of sparks. The Outlaws are preparing for a massive push against corporate checkpoints in Chapter 2, but we need supplies and secure channels. What's your current status?",
      choices: [
        { text: "I'm looking for contract work.", nodeId: "contracts_hub" },
        { text: "Tell me about the Street Outlaws' vision.", nodeId: "outlaws_lore" },
        {
          text: "🔮 Peek into his surface thoughts",
          nodeId: "jax_mindmance",
          prereqText: "[Requires Mindmancer Level 1]",
          prereq: (s) => (s.skills?.mindmancer || 0) >= 1,
          onSelect: (s) => {
            if (s.reputations) {
              s.reputations.streetOutlaws = Math.min(100, s.reputations.streetOutlaws + 10);
            }
            return s;
          }
        },
        { text: "Understood. I will come back later.", nodeId: "exit" }
      ]
    },
    outlaws_lore: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "Vision? We don't have time for poetry, kid. We are the discarded cells of Megacity-9. Ares corporate elite breathes pure air, while our lungs collapse in sulfur-smog Sewage. We want a clean override of the city grids. True agency, offline from corporate neural relays.",
      choices: [
        { text: "How can I support the cause?", nodeId: "contracts_hub" },
        { text: "Understood. Let's talk about other affairs.", nodeId: "start" }
      ]
    },
    jax_mindmance: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "[SUCCESS] Your eyes flicker with faint purple static. You tap his cognitive field. Instantly, your brain is flooded with the scream of air-raid alarms, holographic battle layouts of the Satoshi checkpoints, and a deep, aching sorrow for lost comrades... Jax rubs his temple, squinting at you: 'Did you feel that chill? Damn under-city draft. You have some strange eyes, kid. But I respect your focus.' (Reputation: +10 Street Outlaws)",
      choices: [
        { text: "Let's discuss our operations.", nodeId: "start" }
      ]
    },
    contracts_hub: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "What operation details are you trying to finalize, rookie?",
      choices: [
        {
          text: "Deliver Technical Signal Core",
          nodeId: "deliver_core_success",
          prereqText: "[Requires Technical Signal Core]",
          prereq: (s) => s.inventory.includes("Technical Signal Core"),
          onSelect: (s) => {
            s.inventory = s.inventory.filter(i => i !== "Technical Signal Core");
            s.credits += 150;
            s.experience += 100;
            if (s.reputations) {
              s.reputations.streetOutlaws = Math.min(100, s.reputations.streetOutlaws + 15);
            }
            s.completedQuests.push("Side Quest: Delivered Signal Core to Jax");
            return s;
          }
        },
        {
          text: "Deliver Experimental Drone Chip",
          nodeId: "deliver_drone_success",
          prereqText: "[Requires Experimental Drone Chip]",
          prereq: (s) => s.inventory.includes("Experimental Drone Chip"),
          onSelect: (s) => {
            s.inventory = s.inventory.filter(i => i !== "Experimental Drone Chip");
            s.credits += 200;
            s.experience += 100;
            s.activeQuests = s.activeQuests.filter(q => !q.includes("Drone"));
            if (s.reputations) {
              s.reputations.streetOutlaws = Math.min(100, s.reputations.streetOutlaws + 15);
            }
            s.completedQuests.push("Side Quest: Drone Schematic Delivered to Jax");
            return s;
          }
        },
        { text: "Check my active Street Outlaws reputation Standing", nodeId: "reputation_outlaws" },
        { text: "Let me look at other options.", nodeId: "start" }
      ]
    },
    deliver_core_success: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "Unbelievable work, rookie! The Technical Signal Core's raw data matrices will keep our encrypted wireless feeds fully synchronized, shielding our safehouse beacon from local security trackers. Take your payment, you've earned it! (+150¤, +100 XP, +15 Street Outlaws Rep)",
      choices: [
        { text: "Excellent.", nodeId: "start" }
      ]
    },
    deliver_drone_success: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: "This schematic is pure military gold! With these experimental flight templates, our security drones will completely out-maneuver Ares air interceptors! Your payment is fully processed. (+200¤, +100 XP, +15 Street Outlaws Rep)",
      choices: [
        { text: "Glad to assist.", nodeId: "start" }
      ]
    },
    reputation_outlaws: {
      title: "Agent Jax",
      role: "Outcast Coordinator",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      text: (s: GameState) => {
        const score = s.reputations?.streetOutlaws ?? 50;
        let standing = "Neutral Outcast";
        if (score >= 80) standing = "Rebel Hero (15% Store Discount)";
        else if (score >= 60) standing = "Amiable Comrade (10% Store Discount)";
        else if (score < 40) standing = "Untrusted Stray (No Discount)";
        return `Your active faction score with the Street Outlaws is ${score}%. They view you as a [${standing}]. Standing affects future item pricing and unlocks exclusive resistance contracts in Chapter 2!`;
      },
      choices: [
        { text: "Back to operations.", nodeId: "contracts_hub" }
      ]
    }
  },
  marv: {
    start: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "Wipes black motor oil and synthetic blood off his latex apron. 'Need a clean patch, some adrenaline stims, or some fresh cybernetic chrome? Don't ask where I source my carbon-mesh, and we'll get along fine.'",
      choices: [
        {
          text: "💬 Ask about his previous corporate work at Ares",
          nodeId: "marv_ares_lore",
          prereqText: "[Requires Intelligence Check 12]",
          prereq: (s) => (s.attributes?.int || 10) >= 12,
          onSelect: (s) => {
            s.experience += 30;
            if (s.reputations) {
              s.reputations.aresCorporate = Math.min(100, s.reputations.aresCorporate + 15);
            }
            return s;
          }
        },
        { text: "Tell me about the Cybernetic Harvest contract.", nodeId: "harvest_info" },
        {
          text: "🔮 Force his mind to reveal his secret prototype blueprints",
          nodeId: "marv_mindmance",
          prereqText: "[Requires Mindmancer Level 2]",
          prereq: (s) => (s.skills?.mindmancer || 0) >= 2,
          onSelect: (s) => {
            if (!s.inventory.includes("Smart-Targeting Visor")) {
              s.inventory.push("Smart-Targeting Visor");
            }
            if (s.reputations) {
              s.reputations.aresCorporate = Math.min(100, s.reputations.aresCorporate + 10);
            }
            return s;
          }
        },
        {
          text: "I need to undergo experimental bio-splice.",
          nodeId: "undergo_bio_splice",
          prereq: (s) => !s.completedPOIActions?.includes("marv_clinic:bio_spliced")
        },
        { text: "I must leave now.", nodeId: "exit" }
      ]
    },
    undergo_bio_splice: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "Interested in our premium bio-splitting suture? It stitches advanced synthetic muscle fibers directly into your heart valves. It is extremely painful. If your body rejects it, you'll suffer severe systemic fatigue.",
      choices: [
        {
          text: "💪 Let's begin the bio-splice",
          nodeId: "bio_splice_success",
          prereqText: "[Requires Strength Check 13]",
          prereq: (s) => (s.attributes?.str || 10) >= 13,
          onSelect: (s) => {
            if (!s.completedPOIActions) s.completedPOIActions = [];
            s.completedPOIActions.push("marv_clinic:bio_spliced");
            s.maxHp += 15;
            s.hp = s.maxHp;
            s.experience += 30;
            return s;
          }
        },
        {
          text: "Let's undergo standard gamble splice (Roll Luck).",
          nodeId: "bio_splice_gamble"
        },
        { text: "On second thought, nevermind.", nodeId: "start" }
      ]
    },
    bio_splice_success: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "Superb physical constitution! You didn't even flinch. The synthetic weave binds perfectly to your chest, boosting your cardiovascular threshold permanently. (+15 Max HP, Health Fully Restored!)",
      choices: [
        { text: "Superb.", nodeId: "start" }
      ]
    },
    bio_splice_gamble: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: (s: GameState) => {
        const str = s.attributes?.str || 10;
        const roll = Math.floor(Math.random() * 20) + 1 + str;
        if (roll >= 16) {
          return `[ROLL SUCCESS: ${roll} vs 16] Your body successfully fused with the synthetic fibers! Dr. Marv smiles: 'Incredible luck, runner. Permanent Boost: Max HP +15, health fully restored!'`;
        } else {
          return `[ROLL CRITICAL FAILURE: ${roll} vs 16] Your central nervous system rejected the synthetics! You sweat heavily as your arteries swell in agony. Dr. Marv sighs: 'A clinical rejection. You survived, but you are severely weakened.' (-25 HP, -20 Stamina)`;
        }
      },
      choices: [
        {
          text: "Acknowledge results.",
          nodeId: "start",
          onSelect: (s: GameState) => {
            if (!s.completedPOIActions) s.completedPOIActions = [];
            const str = s.attributes?.str || 10;
            const roll = Math.floor(Math.random() * 20) + 1 + str;
            if (roll >= 16) {
              s.completedPOIActions.push("marv_clinic:bio_spliced");
              s.maxHp += 15;
              s.hp = s.maxHp;
              s.experience += 30;
            } else {
              s.completedPOIActions.push("marv_clinic:bio_spliced");
              s.hp = Math.max(10, s.hp - 25);
              s.stamina = Math.max(0, s.stamina - 20);
            }
            return s;
          }
        }
      ]
    },
    marv_ares_lore: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "You ask too many questions, patient. But... you've got an eye for corporate branding. Yes, I was a Senior Prosthesis Designer for Ares Biotech. I quit when the Executive Board ordered me to harvest neural bio-nodes from healthy under-city subjects. I fled with three cases of experimental cyberware prototypes. Ares is keeping my silence, and I keep theirs. Keep this quiet. (+15 Ares Corporate Rep, +30 XP)",
      choices: [
        { text: "Your secret is safe with me, Doctor.", nodeId: "start" }
      ]
    },
    marv_mindmance: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "[SUCCESS] Your gaze drills into Marv's mechanical optic. A tiny purple spark arches across his cybernetic lens. His shoulders drop, and his voice grows monotone: 'The locked... metal floor crate... code is 4F-FF-55... Inside is an experimental sensor visor...' He suddenly blinks, shaking his head with a violent grunt: 'What the... what did you just do? My optic short-circuited. Bah, wait, you found my spare visor? Take it and get out of my sight!' (Acquired: 'Smart-Targeting Visor', +10 Ares Rep!)",
      choices: [
        { text: "Thanks for the visor.", nodeId: "start" }
      ]
    },
    harvest_info: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "Ares automated patrol drones scout the Highwalk Homicide Site Downtown. Their main control boards carry fluid-cooled Neural Regulators. Bring me two of those pristine regulators, and I'll pay you 250¤ plus a custom Smart-Targeting Visor.",
      choices: [
        {
          text: "Deliver 2x Neural Regulators",
          nodeId: "harvest_delivery_success",
          prereqText: "[Requires 2x Neural Regulators]",
          prereq: (s: GameState) => s.inventory.filter(i => i === "Neural Regulator").length >= 2,
          onSelect: (s: GameState) => {
            let count = 0;
            s.inventory = s.inventory.filter(i => {
              if (i === "Neural Regulator" && count < 2) {
                count++;
                return false;
              }
              return true;
            });
            s.credits += 250;
            s.experience += 120;
            if (!s.inventory.includes("Smart-Targeting Visor")) {
              s.inventory.push("Smart-Targeting Visor");
            }
            s.activeQuests = s.activeQuests.filter(q => !q.includes("Harvest"));
            if (s.reputations) {
              s.reputations.aresCorporate = Math.min(100, s.reputations.aresCorporate + 20);
            }
            s.completedQuests.push("Side Quest: Cybernetic Harvest Delivered");
            return s;
          }
        },
        {
          text: "Accept the contract details.",
          nodeId: "harvest_accept",
          prereq: (s: GameState) => !s.activeQuests.some(q => q.includes("Harvest")) && !s.completedQuests.some(q => q.includes("Harvest")),
          onSelect: (s: GameState) => {
            s.activeQuests.push("Side Quest: Cybernetic Harvest - Harvest 2x Neural Regulators by ambushing patrols at the Highwalk Homicide Site.");
            return s;
          }
        },
        { text: "Check my active Ares Corporate Reputation standing", nodeId: "reputation_ares" },
        { text: "Understood, Doctor.", nodeId: "start" }
      ]
    },
    harvest_delivery_success: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "Incredible specimens! The neural relays are pristine, completely free of feedback carbon-scab. I've wired 250¤ into your grid deck and injected the smart-targeting telemetry scripts into your visor storage! Pleasure doing business, streetrunner. (+250¤, +120 XP, +20 Ares Rep, 'Smart-Targeting Visor')",
      choices: [
        { text: "Excellent.", nodeId: "start" }
      ]
    },
    harvest_accept: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: "Contract recorded in your neural logs. Highwalk skybridges are heavily patrolled, so keep your weapons charged and wait for drone scanning windows.",
      choices: [
        { text: "Understood.", nodeId: "start" }
      ]
    },
    reputation_ares: {
      title: "Dr. Marv",
      role: "Underground Surgeon",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
      text: (s: GameState) => {
        const score = s.reputations?.aresCorporate ?? 30;
        let standing = "Suspicious Rogue";
        if (score >= 70) standing = "Valued Associate (15% Nano-stim discount)";
        else if (score >= 50) standing = "Neutral Client (10% Nano-stim discount)";
        return `Your active standing with Ares Biotech Corporation is ${score}%. They categorize you as a [${standing}]. Siphoning or completing corporate salvage operations alters this index.`;
      },
      choices: [
        { text: "Back.", nodeId: "harvest_info" }
      ]
    }
  },
  cipher: {
    start: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "Sips high-oxygen, self-chilling synthetic champagne inside his custom VIP velvet booth. 'Ah, the rising street runner. My neural sensors record high levels of code activity in your cyberdeck. What digital mischief are we compiling today?'",
      choices: [
        {
          text: "Discuss security mainframes and high-level hacks",
          nodeId: "slicing_lore",
          prereqText: "[Requires NetSlicer Level 2]",
          prereq: (s) => (s.skills?.netSlicer || 0) >= 2,
          onSelect: (s) => {
            if (!s.inventory.includes("VIP Afterlife Keycard")) {
              s.inventory.push("VIP Afterlife Keycard");
            }
            if (s.reputations) {
              s.reputations.titanLogistics = Math.min(100, s.reputations.titanLogistics + 15);
            }
            return s;
          }
        },
        { text: "Let's discuss the Nouveau Cybernetic Showroom Heist.", nodeId: "heist_info" },
        {
          text: "🔮 Perform a silent mind-hack into his memory arrays",
          nodeId: "cipher_mindmance",
          prereqText: "[Requires Mindmancer Level 1]",
          prereq: (s) => (s.skills?.mindmancer || 0) >= 1,
          onSelect: (s) => {
            if (s.reputations) {
              s.reputations.titanLogistics = Math.min(100, s.reputations.titanLogistics + 15);
            }
            if (!s.completedPOIActions) s.completedPOIActions = [];
            if (!s.completedPOIActions.includes("cipher:decrypted_code")) {
              s.completedPOIActions.push("cipher:decrypted_code");
            }
            return s;
          }
        },
        { text: "Just looking around.", nodeId: "exit" }
      ]
    },
    slicing_lore: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "Ha! You understand the code. Hacking isn't just typing digits; it's like bending the electronic ether of Megacity-9. I can tell you're a true slicer. Take my personal Afterlife VIP keycard. It bypasses security shields and gives you +2 extra attempt cycles on any Nouveau showroom terminals! (Acquired: 'VIP Afterlife Keycard', +15 Titan Logistics Rep)",
      choices: [
        { text: "This is extremely helpful, thank you.", nodeId: "start" }
      ]
    },
    cipher_mindmance: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "[SUCCESS] Your gaze burns violet. A silent stream of sub-vocal commands overflows Cipher's optic nodes. A brief memory cascade floods your mind... 'Nouveau showroom high-security vault bypass sequence: 5F-AA-BD-FF...' Cipher blink-resets his visor, smiling: 'Whoa. Did you see that spark? The bar's electrical relays must be leaking plasma. Let's stay focused, alright?' (Unlocked decryption sequence clue for Nouveau Heist! +15 Titan Logistics Rep)",
      choices: [
        { text: "Thank you, Cipher.", nodeId: "start" }
      ]
    },
    heist_info: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "Nouveau's luxury showroom has a prototype Singularity Battery cell behind polarized energy grids. If you slip inside, override their safe, and bring that battery to me, I'll pay you 350¤ and hand you an Unstable Plasma Core. Deal?",
      choices: [
        {
          text: "Deliver Prototype Singularity Battery",
          nodeId: "heist_delivery_success",
          prereqText: "[Requires Prototype Singularity Battery]",
          prereq: (s: GameState) => s.inventory.includes("Prototype Singularity Battery"),
          onSelect: (s: GameState) => {
            s.inventory = s.inventory.filter(i => i !== "Prototype Singularity Battery");
            s.credits += 350;
            s.experience += 150;
            if (!s.inventory.includes("Unstable Plasma Core")) {
              s.inventory.push("Unstable Plasma Core");
            }
            s.activeQuests = s.activeQuests.filter(q => !q.includes("Heist"));
            if (s.reputations) {
              s.reputations.titanLogistics = Math.min(100, s.reputations.titanLogistics + 25);
            }
            s.completedQuests.push("Side Quest: Nouveau Heist Complete");
            return s;
          }
        },
        {
          text: "Inquire about the heist.",
          nodeId: "heist_accept",
          prereq: (s: GameState) => !s.activeQuests.some(q => q.includes("Heist")) && !s.completedQuests.some(q => q.includes("Heist")),
          onSelect: (s: GameState) => {
            s.activeQuests.push("Side Quest: Nouveau Heist - Meet Cipher at Club Afterlife, get a VIP Keycard, and steal the Prototype Singularity Battery from Nouveau Showroom.");
            return s;
          }
        },
        { text: "Check Titan Logistics reputation standing instead.", nodeId: "reputation_titan" },
        { text: "Let me think about it.", nodeId: "start" }
      ]
    },
    heist_delivery_success: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "Magnificent execution, runner! The cold-fusion power of this battery is enough to run my private server cluster for a decade. I've processed your 350¤ wire and unlocked the premium Unstable Plasma Core from my cache! Faction reputation updated. (+350¤, +150 XP, +25 Titan Logistics Rep, 'Unstable Plasma Core')",
      choices: [
        { text: "Wonderful.", nodeId: "start" }
      ]
    },
    heist_accept: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: "Superb. You'll need an Afterlife VIP keycard to disable their pressure shield easily, otherwise the hacking mainframe puzzle will burn through your attempts fast. Get to work!",
      choices: [
        { text: "Understood.", nodeId: "start" }
      ]
    },
    reputation_titan: {
      title: "Cipher",
      role: "Elite Code Broker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: (s: GameState) => {
        const score = s.reputations?.titanLogistics ?? 50;
        let standing = "Independent Contractor";
        if (score >= 80) standing = "Valued Partner (15% Upgrade & Shipyard discount)";
        else if (score >= 60) standing = "Trusted Hauler (10% Upgrade discount)";
        return `Your active score with Titan Logistics is ${score}%. They record your status as [${standing}]. Standing lowers safehouse construction costs and unlocks premium black-market items.`;
      },
      choices: [
        { text: "Back to heist contracts.", nodeId: "heist_info" }
      ]
    }
  }
};
