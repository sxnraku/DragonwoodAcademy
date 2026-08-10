import { Player, Dragon, Interaction, Rival, SchoolRank, SavedGame, Language } from '../types';
import { PREDEFINED_NPCS, SCHOOL_RANKS, STARTING_ABILITY, ACADEMY_SIZE } from '../constants';

const SAVE_KEY = 'dragonwood_save_data_v3';

export const saveGame = (gameState: SavedGame): void => {
  try {
    const stateString = JSON.stringify(gameState);
    localStorage.setItem(SAVE_KEY, stateString);
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
};

export const clearGame = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error("Failed to clear game state:", error);
  }
};

export const loadGame = (): SavedGame | null => {
  try {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState === null) {
      return null;
    }
    const data = JSON.parse(savedState);
    
    // CRITICAL: Ensure essential data exists before proceeding.
    if (!data.player || !data.dragon) {
        console.warn("Save data is corrupted or incomplete. Clearing save.");
        clearGame();
        return null;
    }
    
    // Ensure data integrity on load
    const player: Player = data.player;
    const dragon: Dragon = data.dragon;
    const history: Interaction[] = data.history || [];
    const academyRoster: Rival[] = data.academyRoster || [];
    const actionOutcomeCache = data.actionOutcomeCache || {};
    const dailyActionsUsed = data.dailyActionsUsed || [];
    const language: Language | undefined = data.language;


    return { 
        player, 
        dragon, 
        history,
        academyRoster,
        actionOutcomeCache,
        dailyActionsUsed,
        language,
    };

  } catch (error) {
    console.error("Failed to load game state:", error);
    // If loading fails, it might be due to a corrupted save. Clearing it is safest.
    clearGame();
    return null;
  }
};
