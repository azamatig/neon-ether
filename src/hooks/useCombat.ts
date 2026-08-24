import { useGame } from "../context/GameContext";
import { GridCombatState, GridCombatant } from "../types";

export function useCombat() {
  const {
    gridCombat,
    setGridCombat,
    combatActionTab,
    setCombatActionTab,
    hoveredAction,
    setHoveredAction,
    hoveredEntity,
    setHoveredEntity,
    selectedSkill,
    setSelectedSkill,
    gameState,
    setGameState,
    addLog,
    triggerToast
  } = useGame();

  const isCombatActive = !!(gameState?.combatState?.isActive && gridCombat);

  const selectSkillAction = (skill: { 
    name: string; 
    cost: number; 
    costType: "MP" | "SP"; 
    desc: string; 
    icon: string; 
    scope: "enemy" | "self" | "all_enemies" 
  }) => {
    const activeActor = gridCombat?.combatants.find(c => c.id === gridCombat.turnOrder[gridCombat.currentTurnIdx]);
    if (!activeActor || activeActor.ap < 1) {
      triggerToast("INSUFFICIENT ACTION POINTS (AP)!");
      return;
    }

    // Spend cost check
    if (skill.costType === "MP") {
      const playerMana = gameState?.mana || 0;
      if (playerMana < skill.cost) {
        triggerToast("NOT ENOUGH ENERGY (MP)!");
        return;
      }
    } else {
      const activeActorSp = activeActor.ap; // Simplified cost checks
      if (activeActorSp < skill.cost) {
        triggerToast("INSUFFICIENT COMBAT STAMINA (AP)!");
        return;
      }
    }

    setSelectedSkill(skill);
    setGridCombat(prev => prev ? { ...prev, selectedAction: "spell" } : null);
    triggerToast(`SKILL ARMED: ${skill.name.toUpperCase()}`);
  };

  const clearSelectedCombatAction = () => {
    setSelectedSkill(null);
    setGridCombat(prev => prev ? { ...prev, selectedAction: null } : null);
  };

  const endCombatTurn = () => {
    if (!gridCombat) return;

    const currentTurnIdx = (gridCombat.currentTurnIdx + 1) % gridCombat.turnOrder.length;
    setGridCombat(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentTurnIdx,
        selectedAction: null,
        turnLog: `${prev.turnLog}\n⏩ ADVANCED TURN TO ${prev.turnOrder[currentTurnIdx].toUpperCase()}`
      };
    });

    addLog(`⏩ Tactical combat turn advanced to next combatant in queue`, "combat");
  };

  return {
    gridCombat,
    setGridCombat,
    combatActionTab,
    setCombatActionTab,
    hoveredAction,
    setHoveredAction,
    hoveredEntity,
    setHoveredEntity,
    selectedSkill,
    setSelectedSkill,
    isCombatActive,
    selectSkillAction,
    clearSelectedCombatAction,
    endCombatTurn
  };
}
