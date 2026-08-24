import { useGame } from "../context/GameContext";
import { QuestState, GameState } from "../types";

export function useQuest() {
  const { gameState, setGameState, questFilter, setQuestFilter, addLog, triggerToast } = useGame();

  const getFilteredQuests = (): QuestState[] => {
    if (!gameState || !gameState.structuredQuests) return [];
    
    return gameState.structuredQuests.filter(q => {
      if (questFilter === "all") return q.status === "ACTIVE";
      if (questFilter === "main") return q.category === "Main Quest" && q.status === "ACTIVE";
      if (questFilter === "side") return q.category === "Side Quest" && q.status === "ACTIVE";
      if (questFilter === "completed") return q.status === "COMPLETED";
      return true;
    });
  };

  const startQuest = (questId: string) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev || !prev.structuredQuests) return prev;
      
      const updatedQuests = prev.structuredQuests.map(q => {
        if (q.id === questId && q.status === "NOT_STARTED") {
          addLog(`📟 NEW CONTRACT ACCEPTED: "${q.title}"`, "action");
          triggerToast(`QUEST STARTED: ${q.title}`);
          return { ...q, status: "ACTIVE" as const };
        }
        return q;
      });

      return {
        ...prev,
        structuredQuests: updatedQuests,
        activeQuests: [...prev.activeQuests, questId]
      };
    });
  };

  const claimQuestReward = (questId: string) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev || !prev.structuredQuests) return prev;

      const quest = prev.structuredQuests.find(q => q.id === questId);
      if (!quest || quest.status !== "COMPLETED" || quest.rewardClaimed) return prev;

      let nextState = { ...prev };
      
      // Process rewards
      quest.rewards.forEach(reward => {
        if (reward.type === "credits" && reward.amount) {
          nextState.credits += reward.amount;
          addLog(`💰 REWARD CLAIMED: +${reward.amount} Credits`, "system");
        } else if (reward.type === "experience" && reward.amount) {
          nextState.experience += reward.amount;
          addLog(`⭐ REWARD CLAIMED: +${reward.amount} EXP`, "system");
          
          // Level up check
          const expNeeded = nextState.level * 1000;
          if (nextState.experience >= expNeeded) {
            nextState.level += 1;
            nextState.experience -= expNeeded;
            nextState.maxHp += 15;
            nextState.maxMana += 10;
            nextState.hp = nextState.maxHp;
            nextState.mana = nextState.maxMana;
            addLog(`🌟 LEVEL UP! You reached LEVEL ${nextState.level}! Max HP & Mana increased!`, "system");
            triggerToast(`LEVEL UP: REACHED LEVEL ${nextState.level}!`);
          }
        } else if (reward.type === "item" && reward.itemName) {
          nextState.inventory.push(reward.itemName);
          addLog(`📦 REWARD CLAIMED: Obtained item '${reward.itemName}'`, "system");
        }
      });

      // Mark reward as claimed
      nextState.structuredQuests = nextState.structuredQuests.map(q => {
        if (q.id === questId) {
          return { ...q, rewardClaimed: true };
        }
        return q;
      });

      triggerToast(`REWARDS CLAIMED FOR: ${quest.title}`);
      return nextState;
    });
  };

  return {
    questFilter,
    setQuestFilter,
    getFilteredQuests,
    startQuest,
    claimQuestReward
  };
}
