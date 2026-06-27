import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY", // Fallback for building without crashing
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", apiKeyConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Game GM Action Endpoint
  app.post("/api/game/action", async (req, res) => {
    try {
      const { currentState, action } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured in the Secrets panel.",
        });
      }

      // Build a meticulous prompt instructing the GM to transform the current state
      const prompt = `
YOU ARE THE GAME MASTER ENGINE FOR "NEON & ETHER", A DARK CYBERPUNK-FANTASY SANDBOX RPG.
ADHERE STRICKTLY TO ALL ENGINE RULES AND OUTPUT SCHEMAS.

--- CURRENT GAME STATE ---
${JSON.stringify(currentState, null, 2)}

--- PLAYER ACTION ---
The player has executed the following action or option: "${action}"

--- YOUR INSTRUCTIONS AND WORLD RULES ---
1. You must act strictly as a data-driven, neutral-yet-evocative Game Master. Describe the outcome of the player's action with high sensory detail (smells of copper and smog, flickering holos, rain hitting cyberware) but keep it to 2-3 punchy, evocative sentences.
2. Update the state numbers realistically:
   - Rest/Sleep should restore HP and Mana to maximum, and can consume 5-10 Credits or advance story context.
   - Danger levels: Aurus District has low-to-medium threat; Docks District is highly dangerous and contains deadly smuggling rings, docks, and faction outposts.
   - Combat: If the action involves fighting, or exploring high-threat areas, you can trigger a combat encounter by populating 'combatState' with:
     * 'enemyName' (e.g., "Apex Heavy Enforcer", "Coven Spell-Slicer", "Rust-Claw Orc")
     * 'enemyHp' (e.g., 60) and 'enemyMaxHp' (e.g., 60)
     * 'enemyShields' (e.g., 20) and 'enemyMaxShields' (e.g., 20)
     * 'isActive': true
     * 'turnLog': "The enemy jumps out of a dark shipping container!"
     If a player is in combat, their choice must resolve the turn. Turn-based options are: Physical, Spell, Cyber, Item, Flee. If they take combat damage, reduce HP/Mana accordingly. Once enemy HP hits 0, award Credits (e.g., 50-150 credits) or items, and set 'combatState' to null.
   - Weapons and armor upgrades bought at the Apex Armory (e.g., "Mantis Electro-Blade", "Hyper-Smart Targeter", "Ceramic Plated Carapace") must be added to inventory and cost appropriate Credits. Update inventory list.
   - Hired companions from the Nexus Agency (e.g., "Scythe" the cyber-ninja, "Vex" the spell-hacker, "Brick" the combat-orc) must be listed in the companions array. Hiring them costs credits. You must change their status to 'hired' or 'in_party' and deduct fee credits. Player gets passive credits if companions status is 'working' (e.g. "+30 Credits gained from Vex hacking shell corps").
   - Manage quests: If a quest is picked up, add to activeQuests. If objective is achieved, remove from activeQuests and add to completedQuests, rewarding credits/items!

3. Format the rawOutput STRING using this exact text block format:
==================================================
DISTRICT: [Current Region Name] | POI: [Current Screen Name]
STATUS: [HP: X/X | Mana: X/X | Credits: X] | PARTY: [Active Companions]
==================================================
[NARRATION / MENU DESCRIPTION]
(2-3 punchy sentences describing the location, an NPC's dialogue, shop inventory, or companion stats if selected).

[QUEST LOG]
- [Active] Quest Name: Current objective.
- [Completed] Quest Name (if any finished this turn)

[INTERACTION BUTTONS]
1. [Interaction Option 1]
2. [Interaction Option 2]
3. [Travel Node Option 3]
4. [Return to Main Headquarters (Hideout)]

4. Ensure your entire output conforms to the requested JSON structure. Never output conversational responses before or after the JSON.
      `;

      // Set up the API call using gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the character-driven engine for Neon & Ether. You receive current state and player commands, then calculate and output the exact next state in structured JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rawOutput: { type: Type.STRING },
              narration: { type: Type.STRING },
              district: { type: Type.STRING },
              poi: { type: Type.STRING },
              hp: { type: Type.INTEGER },
              maxHp: { type: Type.INTEGER },
              mana: { type: Type.INTEGER },
              maxMana: { type: Type.INTEGER },
              credits: { type: Type.INTEGER },
              party: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              activeQuests: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              completedQuests: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              interactionButtons: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              inventory: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              companions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    fee: { type: Type.INTEGER },
                    status: { type: Type.STRING },
                    bio: { type: Type.STRING },
                    role: { type: Type.STRING }
                  },
                  required: ["name", "fee", "status", "bio", "role"]
                }
              },
              combatState: {
                type: Type.OBJECT,
                properties: {
                  enemyName: { type: Type.STRING },
                  enemyHp: { type: Type.INTEGER },
                  enemyMaxHp: { type: Type.INTEGER },
                  enemyShields: { type: Type.INTEGER },
                  enemyMaxShields: { type: Type.INTEGER },
                  isActive: { type: Type.BOOLEAN },
                  turnLog: { type: Type.STRING }
                },
                required: ["enemyName", "enemyHp", "enemyMaxHp", "enemyShields", "enemyMaxShields", "isActive", "turnLog"]
              }
            },
            required: [
              "rawOutput",
              "narration",
              "district",
              "poi",
              "hp",
              "maxHp",
              "mana",
              "maxMana",
              "credits",
              "party",
              "activeQuests",
              "completedQuests",
              "interactionButtons",
              "inventory",
              "companions"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsedGameResult = JSON.parse(responseText.trim());
      res.json(parsedGameResult);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to contact Game Master Engine" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neon & Ether server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
