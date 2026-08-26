import type { GameState, QuestStage, UnifiedQuest } from "./types";
import { DEFAULT_CAMPAIGN_QUESTS } from "./questsData";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * Returns the complete editable campaign catalog. Built-in quests are always
 * present, while saved Quest Studio entries override definitions with the same id.
 */
export function buildQuestCatalog(overrides: UnifiedQuest[] = []): UnifiedQuest[] {
  const quests = new Map<string, UnifiedQuest>();
  DEFAULT_CAMPAIGN_QUESTS.forEach(quest => quests.set(quest.id, clone(quest)));
  overrides.forEach(quest => {
    // The first Quest Studio prototype shipped a five-stage placeholder
    // prologue (p_s1...p_s5). Never let that stale save copy shadow the real
    // ten-stage world route authored in questsData.
    const isPlaceholderPrologue = quest.id === "prologue" && quest.stages.some(stage => /^p_s\d+$/.test(stage.id));
    if (!isPlaceholderPrologue) quests.set(quest.id, clone(quest));
  });
  return Array.from(quests.values());
}

function isLegacyMatch(entries: string[] | undefined, quest: UnifiedQuest): boolean {
  const title = quest.title.toLowerCase();
  const id = quest.id.toLowerCase();
  return (entries || []).some(entry => {
    const normalized = entry.toLowerCase();
    return normalized.includes(title) || normalized.includes(id.replaceAll("_", " "));
  });
}

function syncCollectStage(stage: QuestStage, state: GameState): QuestStage {
  if (stage.objectiveType !== "collect_item" || !stage.targetItem || stage.completed) return stage;
  const currentCount = state.inventory.filter(item => item === stage.targetItem).length;
  return {
    ...stage,
    currentCount: Math.min(currentCount, stage.targetCount || 1),
    completed: currentCount >= (stage.targetCount || 1)
  };
}

function syncStageFromWorld(stage: QuestStage, state: GameState): QuestStage {
  const collected = syncCollectStage(stage, state);
  if (!collected.completionAction || collected.completed) return collected;
  if (!(state.completedPOIActions || []).includes(collected.completionAction)) return collected;
  return { ...collected, currentCount: collected.targetCount || 1, completed: true };
}

/** Hydrates old saves and keeps the Quest Studio catalog available in normal gameplay. */
export function hydrateQuestSystem(state: GameState): GameState {
  const catalog = buildQuestCatalog(state.campaignQuestsRegistry || []);
  const campaignQuestsRegistry = catalog.map(quest => {
    const completed = isLegacyMatch(state.completedQuests, quest);
    const active = isLegacyMatch(state.activeQuests, quest);
    const stages = quest.stages.map(stage => syncStageFromWorld(stage, state));

    if (completed) {
      return {
        ...quest,
        status: "COMPLETED" as const,
        rewardClaimed: true,
        stages: stages.map(stage => ({
          ...stage,
          currentCount: stage.targetCount || 1,
          completed: true
        }))
      };
    }
    if (active) return { ...quest, status: "ACTIVE" as const, stages };
    return { ...quest, stages };
  });

  const poiInteractiveScenes = { ...(state.poiInteractiveScenes || {}) };
  if (poiInteractiveScenes.relic_altar?.linkedStageId === "p_s3") delete poiInteractiveScenes.relic_altar;
  return { ...state, campaignQuestsRegistry, poiInteractiveScenes };
}

/** Reconciles edited stage trigger keys with world events without touching definitions. */
export function synchronizeQuestProgress(state: GameState): GameState {
  const hydrated = hydrateQuestSystem(state);
  const registry = (hydrated.campaignQuestsRegistry || []).map(quest => {
    const stages = quest.stages.map(stage => syncStageFromWorld(stage, hydrated));
    return { ...quest, stages };
  });
  return { ...hydrated, campaignQuestsRegistry: registry };
}

function questLabel(quest: UnifiedQuest): string {
  return `${quest.title} - ${quest.description}`;
}

export function activateQuest(state: GameState, questId: string): GameState {
  const hydrated = hydrateQuestSystem(state);
  const registry = hydrated.campaignQuestsRegistry || [];
  const quest = registry.find(item => item.id === questId);
  if (!quest || quest.status === "COMPLETED") return hydrated;
  if ((quest.minLevel || 1) > hydrated.level) return hydrated;
  if (quest.requiredReputationFaction && (hydrated.reputations?.[quest.requiredReputationFaction] || 0) < (quest.requiredReputationValue || 0)) return hydrated;
  if (quest.prerequisiteQuestId) {
    const prerequisite = registry.find(item => item.id === quest.prerequisiteQuestId);
    if (!prerequisite || prerequisite.status !== "COMPLETED") return hydrated;
  }

  const nextRegistry = registry.map(item => item.id === questId ? { ...item, status: "ACTIVE" as const } : item);
  return {
    ...hydrated,
    campaignQuestsRegistry: nextRegistry,
    activeQuests: [
      ...hydrated.activeQuests.filter(entry => !isLegacyMatch([entry], quest)),
      questLabel(quest)
    ],
    completedQuests: hydrated.completedQuests.filter(entry => !isLegacyMatch([entry], quest))
  };
}

export function advanceQuestStage(state: GameState, questId: string, stageId?: string, amount = 1): GameState {
  const hydrated = activateQuest(state, questId);
  const registry = hydrated.campaignQuestsRegistry || [];
  const quest = registry.find(item => item.id === questId);
  if (!quest) return hydrated;
  const target = stageId ? quest.stages.find(stage => stage.id === stageId) : quest.stages.find(stage => !stage.completed);
  if (!target) return hydrated;

  const stages = quest.stages.map(stage => {
    if (stage.id !== target.id) return stage;
    const currentCount = Math.min((stage.currentCount || 0) + amount, stage.targetCount || 1);
    return { ...stage, currentCount, completed: currentCount >= (stage.targetCount || 1) };
  });
  const nextRegistry = registry.map(item => item.id === questId ? { ...item, stages } : item);
  return { ...hydrated, campaignQuestsRegistry: nextRegistry };
}

export function completeQuest(state: GameState, questId: string, grantRewards = true): GameState {
  let hydrated = hydrateQuestSystem(state);
  const registry = hydrated.campaignQuestsRegistry || [];
  const quest = registry.find(item => item.id === questId);
  if (!quest || quest.status === "COMPLETED") return hydrated;

  const shouldReward = grantRewards && !quest.rewardClaimed;
  const rewards = quest.rewards || {};
  const unlocks = rewards.worldUnlocks || {};
  const reputation = rewards.reputation || {};
  const completedQuest = {
    ...quest,
    status: "COMPLETED" as const,
    rewardClaimed: shouldReward || quest.rewardClaimed,
    stages: quest.stages.map(stage => ({ ...stage, currentCount: stage.targetCount || 1, completed: true }))
  };
  let nextRegistry = registry.map(item => item.id === questId ? completedQuest : item);

  let activeQuests = hydrated.activeQuests.filter(entry => !isLegacyMatch([entry], quest));
  const completedQuests = Array.from(new Set([...hydrated.completedQuests, quest.title]));
  if (quest.nextQuestId) {
    const nextQuest = nextRegistry.find(item => item.id === quest.nextQuestId);
    const reputationMet = !nextQuest?.requiredReputationFaction ||
      (hydrated.reputations?.[nextQuest.requiredReputationFaction] || 0) >= (nextQuest.requiredReputationValue || 0);
    const levelMet = !nextQuest || (nextQuest.minLevel || 1) <= hydrated.level;
    if (nextQuest && nextQuest.status !== "COMPLETED" && levelMet && reputationMet) {
      nextRegistry = nextRegistry.map(item => item.id === nextQuest.id ? { ...item, status: "ACTIVE" as const } : item);
      if (!activeQuests.some(entry => isLegacyMatch([entry], nextQuest))) activeQuests.push(questLabel(nextQuest));
    }
  }

  hydrated = {
    ...hydrated,
    campaignQuestsRegistry: nextRegistry,
    activeQuests,
    completedQuests,
    credits: hydrated.credits + (shouldReward ? rewards.credits || 0 : 0),
    experience: hydrated.experience + (shouldReward ? rewards.experience || 0 : 0),
    inventory: shouldReward ? [...hydrated.inventory, ...(rewards.items || [])] : hydrated.inventory,
    reputations: shouldReward ? {
      ...hydrated.reputations,
      streetOutlaws: (hydrated.reputations?.streetOutlaws || 0) + (reputation.streetOutlaws || 0),
      titanLogistics: (hydrated.reputations?.titanLogistics || 0) + (reputation.titanLogistics || 0),
      aresCorporate: (hydrated.reputations?.aresCorporate || 0) + (reputation.aresCorporate || 0)
    } : hydrated.reputations,
    unlockedBases: unlocks.unlockBaseId
      ? Array.from(new Set([...(hydrated.unlockedBases || ["hideout"]), unlocks.unlockBaseId]))
      : hydrated.unlockedBases,
    unlockedDistricts: unlocks.unlockDistrictId
      ? Array.from(new Set([...(hydrated.unlockedDistricts || []), unlocks.unlockDistrictId]))
      : hydrated.unlockedDistricts,
    unlockedPerks: unlocks.unlockPerkOrSkill
      ? Array.from(new Set([...(hydrated.unlockedPerks || []), unlocks.unlockPerkOrSkill]))
      : hydrated.unlockedPerks,
    party: unlocks.recruitCompanionId
      ? Array.from(new Set([...hydrated.party, unlocks.recruitCompanionId]))
      : hydrated.party,
    companions: unlocks.recruitCompanionId
      ? hydrated.companions.map(companion => companion.name.toLowerCase() === unlocks.recruitCompanionId!.toLowerCase()
        ? { ...companion, status: "in_party" as const }
        : companion)
      : hydrated.companions
  };
  return hydrated;
}

export function resetQuest(state: GameState, questId: string): GameState {
  const hydrated = hydrateQuestSystem(state);
  const registry = hydrated.campaignQuestsRegistry || [];
  const definition = buildQuestCatalog().find(item => item.id === questId);
  const current = registry.find(item => item.id === questId);
  if (!current) return hydrated;
  const reset = clone(definition || current);
  reset.status = "NOT_STARTED";
  reset.rewardClaimed = false;
  reset.stages = reset.stages.map(stage => ({ ...stage, currentCount: 0, completed: false }));
  return {
    ...hydrated,
    campaignQuestsRegistry: registry.map(item => item.id === questId ? reset : item),
    activeQuests: hydrated.activeQuests.filter(entry => !isLegacyMatch([entry], current)),
    completedQuests: hydrated.completedQuests.filter(entry => !isLegacyMatch([entry], current))
  };
}
