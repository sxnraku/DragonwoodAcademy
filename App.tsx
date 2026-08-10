import React, { useState, useCallback, useEffect } from 'react';
import { Player, Dragon, GameState, Interaction, NPC, Rival, Ability, AbilityRank, SavedGame, Equipment, EquipmentSlot, Item, Language } from './types';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import GameView from './components/GameView';
import { generateInitialDragon } from './services/aiService';
import { saveGame, loadGame, clearGame } from './services/storageService';
import { ACADEMY_SIZE, DRAGON_ELEMENTS, DRAGON_NAMES, PLAYER_NAMES, PREDEFINED_NPCS, SCHOOL_RANKS, STARTING_ABILITY, ACADEMY_ROSTER_PREFABS, ABILITY_MILESTONES, PREDEFINED_ABILITIES } from './constants';
import { LocalizationProvider, useLocalization } from './i18n';
import FantasyBackground from './components/FantasyBackground';

const MAX_HISTORY_LENGTH = 5;

const AppContent: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [dragon, setDragon] = useState<Dragon | null>(null);
  const [history, setHistory] = useState<Interaction[]>([]);
  const [academyRoster, setAcademyRoster] = useState<Rival[]>([]);
  const [actionOutcomeCache, setActionOutcomeCache] = useState<Record<string, string[]>>({});
  const [dailyActionsUsed, setDailyActionsUsed] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { language, t, isLocalizationLoaded } = useLocalization();

  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  const generateRivals = (): Rival[] => {
    const rivals: Rival[] = [];
    const getLevelForRank = (rank: number): number => {
        if (rank >= 80) return 2 + Math.floor(Math.random() * 13);
        if (rank >= 60) return 15 + Math.floor(Math.random() * 15);
        if (rank >= 40) return 30 + Math.floor(Math.random() * 20);
        if (rank >= 20) return 50 + Math.floor(Math.random() * 25);
        return 75 + Math.floor(Math.random() * 26);
    };
    const generateRivalAbilities = (level: number): Ability[] => {
        const abilities = [STARTING_ABILITY];
        const potentialAbilities = PREDEFINED_ABILITIES.filter(a => {
            if (level < 10) return a.rank === AbilityRank.F;
            if (level < 25) return a.rank === AbilityRank.E || a.rank === AbilityRank.D;
            if (level < 50) return a.rank === AbilityRank.C || a.rank === AbilityRank.B;
            return a.rank === AbilityRank.A || a.rank === AbilityRank.S || a.rank === AbilityRank.SS;
        });
        let attempts = 0;
        while(abilities.length < 4 && attempts < 10) {
            if (potentialAbilities.length > 0) {
                const newAbility = potentialAbilities[Math.floor(Math.random() * potentialAbilities.length)];
                if (!abilities.find(a => a.id === newAbility.id)) abilities.push(newAbility);
            }
            attempts++;
        }
        return abilities;
    };
    for (let i = 1; i < ACADEMY_SIZE; i++) {
        const firstName = getRandomItem(ACADEMY_ROSTER_PREFABS.firstNames);
        const lastName = getRandomItem(ACADEMY_ROSTER_PREFABS.lastNames);
        const rivalLevel = getLevelForRank(i);
        const rivalStats = {
            hp: 20 + rivalLevel * 2, attack: 5 + rivalLevel, defense: 5 + rivalLevel,
            speed: 5 + rivalLevel, mana: 15 + Math.floor(rivalLevel * 1.5),
        };
        rivals.push({
            id: `rival_${i}`, name: `${firstName} ${lastName}`, rank: i,
            dragon: {
                name: getRandomItem(DRAGON_NAMES), element: getRandomItem(DRAGON_ELEMENTS),
                level: rivalLevel, stats: rivalStats, currentHp: rivalStats.hp, currentMana: rivalStats.mana,
                abilities: generateRivalAbilities(rivalLevel),
            }
        });
    }
    return rivals.sort((a,b) => a.rank - b.rank);
  };

  useEffect(() => {
    if (!isLocalizationLoaded) return;
    const savedGame = loadGame();
    if (savedGame) {
      setPlayer(savedGame.player);
      setDragon(savedGame.dragon);
      setHistory(savedGame.history);
      setAcademyRoster(savedGame.academyRoster);
      setActionOutcomeCache(savedGame.actionOutcomeCache);
      setDailyActionsUsed(savedGame.dailyActionsUsed);
      setGameState(GameState.PLAYING);
    } else {
      setGameState(GameState.CHARACTER_CREATION);
    }
  }, [isLocalizationLoaded]);
  
  useEffect(() => {
    if (gameState !== GameState.LOADING && gameState !== GameState.CHARACTER_CREATION && player && dragon) {
      const gameData: SavedGame = { player, dragon, history, academyRoster, actionOutcomeCache, dailyActionsUsed, language };
      saveGame(gameData);
    }
  }, [player, dragon, history, academyRoster, actionOutcomeCache, dailyActionsUsed, gameState, language]);

  const handleCharacterCreate = useCallback(async (playerName: string, dragonName: string, dragonElement: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const initialRelationships: Record<string, number> = {};
      PREDEFINED_NPCS.forEach(npc => { initialRelationships[npc.id] = 0; });
      const newPlayer: Player = {
        name: playerName, day: 1, gold: 100, rank: ACADEMY_SIZE,
        schoolRankKey: SCHOOL_RANKS[0].rankKey, relationships: initialRelationships, inventory: [],
      };
      const initialDragonData = await generateInitialDragon(dragonName, dragonElement, language);
      const newDragon: Dragon = {
        name: dragonName, element: dragonElement, level: 1, xp: 0,
        stats: initialDragonData.stats, currentHp: initialDragonData.stats.hp, currentMana: initialDragonData.stats.mana,
        description: initialDragonData.description, imageUrl: `https://picsum.photos/seed/${dragonName}/400/400`,
        abilities: [STARTING_ABILITY], equipment: {},
      };
      setPlayer(newPlayer);
      setDragon(newDragon);
      setHistory([]);
      setAcademyRoster(generateRivals());
      setActionOutcomeCache({});
      setDailyActionsUsed([]);
      setGameState(GameState.PLAYING);
    } catch (e) {
      console.error("Failed to create character:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(t('error_character_creation'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  const handleRestart = () => {
      clearGame();
      setPlayer(null);
      setDragon(null);
      setHistory([]);
      setAcademyRoster([]);
      setActionOutcomeCache({});
      setDailyActionsUsed([]);
      setGameState(GameState.CHARACTER_CREATION);
      setError(null);
  };
  
  const handleAddHistoryEntry = (interaction: Interaction) => {
    setHistory(prevHistory => [interaction, ...prevHistory].slice(0, MAX_HISTORY_LENGTH));
  };

  const handleEquipItem = (item: Equipment) => {
    if (!player || !dragon) return;
    setPlayer(p => {
        if (!p) return null;
        // Remove item from inventory
        const itemIndex = p.inventory.findIndex(i => i.id === item.id);
        const newInventory = [...p.inventory];
        if (itemIndex > -1) newInventory.splice(itemIndex, 1);
        
        // Add previously equipped item back to inventory, if any
        const currentlyEquipped = dragon.equipment[item.slot];
        if (currentlyEquipped) newInventory.push(currentlyEquipped);
        
        return {...p, inventory: newInventory };
    });
    setDragon(d => d ? { ...d, equipment: { ...d.equipment, [item.slot]: item } } : null);
    handleAddHistoryEntry({ eventTitle: t('log_equip_title'), choiceText: t('log_equip_choice', { itemName: t(item.nameKey) }), outcome: { description: t('log_equip_outcome', { dragonName: dragon.name }) } });
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    if (!player || !dragon) return;
    const itemToUnequip = dragon.equipment[slot];
    if (!itemToUnequip) return;
    
    setPlayer(p => p ? { ...p, inventory: [...p.inventory, itemToUnequip] } : null);
    setDragon(d => {
        if (!d) return null;
        const newEquipment = { ...d.equipment };
        delete newEquipment[slot];
        return { ...d, equipment: newEquipment };
    });
    handleAddHistoryEntry({ eventTitle: t('log_unequip_title'), choiceText: t('log_unequip_choice', { itemName: t(itemToUnequip.nameKey) }), outcome: { description: t('log_unequip_outcome', { dragonName: dragon.name }) } });
  };

  const renderContent = () => {
    if (!isLocalizationLoaded) {
      return <p className="text-yellow-200 text-xl text-center animate-pulse">Loading Academy Archives...</p>;
    }
    
    switch (gameState) {
      case GameState.LOADING:
        return <p className="text-yellow-200 text-xl text-center animate-pulse">{t('loading_text')}</p>;
      case GameState.CHARACTER_CREATION:
        return (
          <CharacterCreationScreen
            onCharacterCreate={handleCharacterCreate}
            isLoading={isLoading}
            error={error}
            defaultPlayerName={getRandomItem(PLAYER_NAMES)}
            defaultDragonName={getRandomItem(DRAGON_NAMES)}
            dragonElements={DRAGON_ELEMENTS}
          />
        );
      case GameState.PLAYING:
      case GameState.LEVEL_UP:
      case GameState.ABILITY_SELECTION:
      case GameState.SHOP:
      case GameState.TOURNAMENT:
      case GameState.MAP_VIEW:
        if (player && dragon) {
          return <GameView 
                    player={player} 
                    dragon={dragon}
                    history={history}
                    npcs={PREDEFINED_NPCS}
                    academyRoster={academyRoster}
                    actionOutcomeCache={actionOutcomeCache}
                    dailyActionsUsed={dailyActionsUsed}
                    setPlayer={setPlayer}
                    setDragon={setDragon}
                    setAcademyRoster={setAcademyRoster}
                    setActionOutcomeCache={setActionOutcomeCache}
                    setDailyActionsUsed={setDailyActionsUsed}
                    onRestart={handleRestart}
                    onAddHistoryEntry={handleAddHistoryEntry}
                    onEquipItem={handleEquipItem}
                    onUnequipItem={handleUnequipItem}
                    initialGameState={gameState}
                 />;
        }
        return (
          <CharacterCreationScreen
            onCharacterCreate={handleCharacterCreate}
            isLoading={isLoading}
            error={error}
            defaultPlayerName={getRandomItem(PLAYER_NAMES)}
            defaultDragonName={getRandomItem(DRAGON_NAMES)}
            dragonElements={DRAGON_ELEMENTS}
          />
        );
      default:
        return <p>{t('loading_text')}</p>;
    }
  };

  return (
    <FantasyBackground>
      <header className="text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-medieval text-yellow-300 drop-shadow-[0_4px_10px_rgba(234,179,8,0.3)]">
          Dragonwood Academy
        </h1>
        <p className="text-lg text-yellow-100 mt-2">{t('app_subtitle')}</p>
      </header>
      <main className="w-full max-w-7xl">
        {renderContent()}
      </main>
    </FantasyBackground>
  );
};

const App: React.FC = () => (
  <LocalizationProvider>
    <AppContent />
  </LocalizationProvider>
);

export default App;