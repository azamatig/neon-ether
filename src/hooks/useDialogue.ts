import { useGame } from "../context/GameContext";
import { CompanionState } from "../types";

export function useDialogue() {
  const {
    activeDialogue,
    setActiveDialogue,
    relicStep,
    setRelicStep,
    squadDialogue,
    setSquadDialogue,
    companionOpinion,
    setCompanionOpinion,
    gameState,
    setGameState,
    addLog,
    triggerToast
  } = useGame();

  const startNPCConversation = (npcId: string) => {
    setActiveDialogue(npcId);
    addLog(`💬 ENGAGED CONVERSATION // TARGET: ${npcId.toUpperCase()}`, "action");
  };

  const endNPCConversation = () => {
    setActiveDialogue(null);
    setSquadDialogue(null);
  };

  const speakWithCompanion = (companion: CompanionState) => {
    if (!gameState) return;

    // Define companion opinions dynamically or by default
    let opinionLine = `Ready for active duty, Commander. Neural matrix calibrated at 100%.`;
    if (companion.name === "Vice") {
      opinionLine = `"Yo, Rookie. That cyberware is lookin' sweet, but your reflex buffers are laggin'. Let's go break some corporate toys."`;
    } else if (companion.name === "Tracker") {
      opinionLine = `"I have scanned regional infrastructure. Ares Enforcers are stepping up sweeps. Keep your head down and stay silent."`;
    } else if (companion.name === "Sledge") {
      opinionLine = `"Need me to smash a terminal? Or a head? Give the word, Boss. My chrome is heated up."`;
    }

    setCompanionOpinion({ name: companion.name, line: opinionLine, image: companion.image });
    addLog(`🗣️ TALKED WITH SQUADMATE: ${companion.name}`, "action");
    triggerToast(`SQUAD BRIEFING: ${companion.name}`);
  };

  const advanceRelicStory = (step: typeof relicStep) => {
    setRelicStep(step);
    addLog(`🌀 COGNITIVE LINK SYNCING // RELIC STEP: ${step.toUpperCase()}`, "narration");
  };

  return {
    activeDialogue,
    setActiveDialogue,
    relicStep,
    setRelicStep,
    squadDialogue,
    setSquadDialogue,
    companionOpinion,
    setCompanionOpinion,
    startNPCConversation,
    endNPCConversation,
    speakWithCompanion,
    advanceRelicStory
  };
}
