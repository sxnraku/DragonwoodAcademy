import React, { useState, useEffect, useCallback } from 'react';
import { Player, Dragon, Stats, Interaction, NPC, EventOutcome, GameState, Ability, Item, Rival, Location, TrainingType, Equipment, EquipmentSlot } from '../types';
import PlayerStats from './PlayerStats';
import DragonInfo from './DragonInfo';
import ActionButton from './ActionButton';
import DialogueBox from './DialogueBox';
import LevelUpModal from './LevelUpModal';
import AbilitySelectionModal from './AbilitySelectionModal';
import ShopModal from './ShopModal';
import TournamentModal from './TournamentModal';
import SidePanel from './SidePanel';
import AcademyMapModal from './AcademyMapModal';
import ScryingPoolModal from './ScryingPoolModal';
import TrainingRegimenModal from './TrainingRegimenModal';
import DesktopAppModal from './DesktopAppModal';
import { NpcInteractionModal } from './NpcInteractionModal';
import { generateActionOutcomes } from '../services/aiService';
import { useLocalization } from '../i18n';
import { 
    ACADEMY_SIZE, 
    LEVEL_UP_XP, 
    STAT_POINTS_PER_LEVEL, 
    ABILITY_MILESTONES, 
    SCHOOL_RANKS, 
    SHOP_ITEMS, 
    TOURNAMENT_LEVEL_TRIGGERS,
    TRAINING_REGIMENS,
    STAT_BONUS_CHANCE,
    STAT_TRAINING_XP_GAIN,
    ELEMENTAL_TRAINING_XP_GAIN
} from '../constants';
import { ShoppingCart, Map, Dumbbell, Beef, Sparkles, Bed, Users, LogOut } from 'lucide-react';

interface GameViewProps {
  player: Player;
  dragon: Dragon;
  history: Interaction[];
  npcs: NPC[];
  academyRoster: Rival[];
  actionOutcomeCache: Record<string, string[]>;
  dailyActionsUsed: string[];
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  setDragon: React.Dispatch<React.SetStateAction<Dragon | null>>;
  setAcademyRoster: React.Dispatch<React.SetStateAction<Rival[]>>;
  setActionOutcomeCache: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setDailyActionsUsed: React.Dispatch<React.SetStateAction<string[]>>;
  onRestart: () => void;
  onAddHistoryEntry: (interaction: Interaction) => void;
  onEquipItem: (item: Equipment) => void;
  onUnequipItem: (slot: EquipmentSlot) => void;
  initialGameState: GameState;
}

const GameView: React.FC<GameViewProps> = ({ 
    player, dragon, history, npcs, academyRoster, actionOutcomeCache, dailyActionsUsed,
    setPlayer, setDragon, setAcademyRoster, setActionOutcomeCache, setDailyActionsUsed,
    onRestart, onAddHistoryEntry, onEquipItem, onUnequipItem, initialGameState
}) => {
  const { t, language } = useLocalization();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [message, setMessage] = useState<string>(t('day_start_message', { day: player.day, dragonName: dragon.name }));
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isScrying, setIsScrying] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [interactingNpc, setInteractingNpc] = useState<NPC | null>(null);
  const [showDesktopModal, setShowDesktopModal] = useState<boolean>(false);
  const [duelOpponent, setDuelOpponent] = useState<Rival | null>(null);

  const handleStartNpcDuel = (npc: NPC) => {
    const npcLevel = Math.max(1, dragon.level + (Math.random() > 0.5 ? 1 : 0));
    const npcStats = {
      hp: 25 + npcLevel * 3,
      attack: 6 + npcLevel,
      defense: 6 + npcLevel,
      speed: 6 + npcLevel,
      mana: 20 + npcLevel * 2,
    };
    const elementMap: Record<string, string> = {
      'elara_swiftwood': 'Vento',
      'bren_stonehand': 'Terra',
      'seraphina_moonshadow': 'Sombra',
      'kael_stormrider': 'Raio',
    };
    const rivalNpc: Rival = {
      id: `npc_duel_${npc.id}`,
      name: t(npc.nameKey),
      rank: Math.max(1, player.rank - 2),
      dragon: {
        name: `Dragão de ${t(npc.nameKey).split(' ')[0]}`,
        level: npcLevel,
        element: elementMap[npc.id] || 'Fogo',
        stats: npcStats,
        currentHp: npcStats.hp,
        currentMana: npcStats.mana,
        abilities: dragon.abilities,
      }
    };
    setDuelOpponent(rivalNpc);
    setGameState(GameState.TOURNAMENT);
  };
  
  const grantXp = useCallback((xpGained: number) => {
      setDragon(d => {
        if (!d) return null;
        let newXp = d.xp + xpGained;
        let newLevel = d.level;
        let leveledUp = false;
        
        while (newXp >= LEVEL_UP_XP) {
            newXp -= LEVEL_UP_XP;
            newLevel += 1;
            leveledUp = true;
        }

        if (leveledUp) {
            setMessage(prev => `${prev} ${t('level_up_message', { dragonName: d.name, level: newLevel })}`);
            setTimeout(() => setGameState(GameState.LEVEL_UP), 500);
        }

        return { ...d, xp: newXp, level: newLevel };
      });
  }, [setDragon, t]);

  const handleLocationSelect = (location: Location) => {
    if (dailyActionsUsed.includes('Explorar')) {
      setMessage(t('explore_used_message'));
      setGameState(GameState.PLAYING);
      return;
    }
    
    setDailyActionsUsed(prev => [...prev, 'Explorar']);
    setCurrentLocation(location);
    setGameState(GameState.PLAYING);
    setMessage(t('location_arrival_message', { locationName: t(location.nameKey) }));
  };
  
  const handleTrainingRegimenSelect = (regimenType: TrainingType) => {
    if (!dragon || dailyActionsUsed.includes('Treinar')) return;
    
    setIsTraining(false);
    setDailyActionsUsed(prev => [...prev, 'Treinar']);
    
    const regimen = TRAINING_REGIMENS.find(r => r.id === regimenType);
    if (!regimen) return;

    let xpGained = 0;
    let statBonusMessage = "";

    if (regimen.stat) {
        xpGained = STAT_TRAINING_XP_GAIN.min + Math.floor(Math.random() * (STAT_TRAINING_XP_GAIN.max - STAT_TRAINING_XP_GAIN.min + 1));
        if (Math.random() < STAT_BONUS_CHANCE) {
            setDragon(d => {
                if (!d) return null;
                statBonusMessage = ` ${t('stat_bonus_message', { dragonName: d.name, statName: t(`stat_${regimen.stat!}`) })}`;
                const newStats = { ...d.stats, [regimen.stat!]: d.stats[regimen.stat!] + 1 };
                return { ...d, stats: newStats };
            });
        }
    } else {
        xpGained = ELEMENTAL_TRAINING_XP_GAIN.min + Math.floor(Math.random() * (ELEMENTAL_TRAINING_XP_GAIN.max - ELEMENTAL_TRAINING_XP_GAIN.min + 1));
    }
    
    grantXp(xpGained);
    setMessage(t('training_start_message', { regimenName: t(regimen.nameKey) }));
    
    const fetchAIText = async () => {
        let outcomeText = t('training_fallback_message', { regimenName: t(regimen.nameKey) });
        try {
            const cacheKey = `Treinar_${regimenType}`;
            const cachedOutcomes = actionOutcomeCache[cacheKey] || [];
            
            if (cachedOutcomes.length > 0) {
                outcomeText = cachedOutcomes[0];
                setActionOutcomeCache(prev => ({ ...prev, [cacheKey]: prev[cacheKey].slice(1) }));
            } else {
                const newOutcomes = await generateActionOutcomes('Treinar', dragon.name, dragon.element, language, regimenType);
                if (newOutcomes && newOutcomes.length > 0) {
                    outcomeText = newOutcomes[0];
                    setActionOutcomeCache(prev => ({ ...prev, [cacheKey]: newOutcomes.slice(1) }));
                }
            }
        } catch (e) {
            console.error(`Failed to get outcomes for training:`, e);
        } finally {
            setMessage(outcomeText + statBonusMessage);
        }
    };
    fetchAIText();
  };

  const handleAction = (action: string) => {
    if (!dragon || dailyActionsUsed.includes(action) || action === 'Treinar') return;
    
    setDailyActionsUsed(prev => [...prev, action]);
    grantXp(10 + Math.floor(Math.random() * 6));
    setMessage(t('action_start_message', { action: t(`action_${action.toLowerCase()}`) }));

    const fetchAIText = async () => {
        let outcomeText = t('action_fallback_message', { action: t(`action_${action.toLowerCase()}`) });
        try {
            const cacheKey = action;
            const cachedOutcomes = actionOutcomeCache[cacheKey] || [];
            if (cachedOutcomes.length > 0) {
                outcomeText = cachedOutcomes[0];
                setActionOutcomeCache(prev => ({ ...prev, [cacheKey]: prev[cacheKey].slice(1) }));
            } else {
                const newOutcomes = await generateActionOutcomes(action, dragon.name, dragon.element, language);
                if (newOutcomes && newOutcomes.length > 0) {
                    outcomeText = newOutcomes[0];
                    setActionOutcomeCache(prev => ({ ...prev, [cacheKey]: newOutcomes.slice(1) }));
                }
            }
        } catch (e) {
            console.error(`Failed to get outcomes for ${action}:`, e);
        } finally {
            setMessage(outcomeText);
        }
    };
    fetchAIText();
  };

  const handleStatDistribution = (newStats: Stats) => {
    if (!dragon || !player) return;

    const hpDiff = newStats.hp - dragon.stats.hp;
    const manaDiff = newStats.mana - dragon.stats.mana;
    setDragon(d => (d ? { ...d, stats: newStats, currentHp: d.currentHp + hpDiff, currentMana: d.currentMana + manaDiff } : null));
    setMessage(t('stats_confirmed_message', { dragonName: dragon.name }));

    const newSchoolRankKey = SCHOOL_RANKS.slice().reverse().find(r => dragon.level >= r.level)?.rankKey || player.schoolRankKey;
    if (newSchoolRankKey !== player.schoolRankKey) {
      setPlayer(p => (p ? { ...p, schoolRankKey: newSchoolRankKey } : null));
      setMessage(prev => `${prev} ${t('rank_up_message', { rankName: t(newSchoolRankKey) })}`);
    }

    if (ABILITY_MILESTONES.includes(dragon.level)) {
      setTimeout(() => setGameState(GameState.ABILITY_SELECTION), 300);
    } else if (TOURNAMENT_LEVEL_TRIGGERS.includes(dragon.level)) {
      setTimeout(() => setGameState(GameState.TOURNAMENT), 300);
    } else {
      setGameState(GameState.PLAYING);
    }
  };

  const handleAbilitySelected = (ability: Ability) => {
    if (!dragon) return;
    setDragon(d => (d ? { ...d, abilities: [...d.abilities, ability] } : null));
    setMessage(t('ability_learned_message', { dragonName: dragon.name, abilityName: t(ability.nameKey) }));

    if (TOURNAMENT_LEVEL_TRIGGERS.includes(dragon.level)) {
      setTimeout(() => setGameState(GameState.TOURNAMENT), 300);
    } else {
      setGameState(GameState.PLAYING);
    }
  };

  const handleBuyItem = (item: Item) => {
      setPlayer(p => {
          if (!p || p.gold < item.cost) {
            if (p) setMessage(t('shop_no_gold'));
            return p;
          }
          setMessage(t('shop_buy_success', { itemName: t(item.nameKey) }));
          return {...p, gold: p.gold - item.cost, inventory: [...p.inventory, item] };
      });
  };

  const handleUseItem = (itemId: string) => {
    if (!player || !dragon) return;
    const item = player.inventory.find(i => i.id === itemId);
    if (!item) return;

    let itemUsed = false;
    switch (item.id) {
        case 'sm_health_potion':
            if (dragon.currentHp < dragon.stats.hp) {
                setDragon(d => d ? { ...d, currentHp: Math.min(d.stats.hp, d.currentHp + 20) } : null);
                setMessage(t('item_used_sm_health_potion', { dragonName: dragon.name }));
                itemUsed = true;
            } else {
                setMessage(t('item_used_full_health', { dragonName: dragon.name }));
            }
            break;
    }
    if (itemUsed) {
        setPlayer(p => {
            if (!p) return null;
            const itemIndex = p.inventory.findIndex(i => i.id === itemId);
            if (itemIndex > -1) {
                const newInventory = [...p.inventory];
                newInventory.splice(itemIndex, 1);
                return { ...p, inventory: newInventory };
            }
            return p;
        });
    }
  };
  
  const handleTournamentEnd = (rankChange: number, rewards: {gold: number}) => {
      if (duelOpponent) {
          if (rewards.gold > 0) {
              setMessage(`Venceste o duelo contra ${duelOpponent.name}! Recebeste ${rewards.gold} moedas de ouro.`);
          } else {
              setMessage(`Foste derrotado no duelo contra ${duelOpponent.name}. O teu dragão recuperou a consciência com 1 HP.`);
          }
      } else {
          setMessage(t('tournament_end_message', { rankChange: rankChange > 0 ? `+${rankChange}` : rankChange, gold: rewards.gold }));
      }
      setPlayer(p => p ? { ...p, rank: Math.max(1, p.rank - rankChange), gold: p.gold + rewards.gold } : null);
      setDragon(d => d ? { ...d, currentHp: Math.max(1, d.currentHp) } : null);
      setDuelOpponent(null);
      setGameState(GameState.PLAYING);
  };

  const handleEndDay = () => {
      setPlayer(p => p ? { ...p, day: p.day + 1 } : null);
      setDragon(d => d ? { ...d, currentHp: d.stats.hp, currentMana: d.stats.mana } : null);
      setDailyActionsUsed([]);
      setCurrentLocation(null);
      setMessage(t('new_day_message', { dragonName: dragon.name }));
  };

  const handleNpcInteract = async (npcId: string) => {
    const npcToTalkTo = npcs.find(n => n.id === npcId);
    if (npcToTalkTo) {
        setInteractingNpc(npcToTalkTo);
    }
  };

  const handleLeaveLocation = () => {
    if (!currentLocation) return;
    setMessage(t('location_leave_message', { locationName: t(currentLocation.nameKey) }));
    setCurrentLocation(null);
  };

  const renderModals = () => {
    if (!player || !dragon) return null;
    
    if (showDesktopModal) {
      return <DesktopAppModal onClose={() => setShowDesktopModal(false)} />;
    }
    if (isScrying) {
        return <ScryingPoolModal npcs={npcs} dragon={dragon} onClose={() => setIsScrying(false)} />;
    }
    if (isTraining) {
        return <TrainingRegimenModal onSelect={handleTrainingRegimenSelect} onClose={() => setIsTraining(false)} />;
    }
    if (interactingNpc) {
        return <NpcInteractionModal 
            npc={interactingNpc} player={player} setPlayer={setPlayer}
            onAddHistoryEntry={onAddHistoryEntry}
            onStartDuel={handleStartNpcDuel}
            onClose={() => {
                setMessage(t('conversation_end_message', { npcName: t(interactingNpc.nameKey) }));
                setInteractingNpc(null);
                setCurrentLocation(null);
            }}
        />;
    }
    switch(gameState) {
        case GameState.LEVEL_UP:
            return <LevelUpModal dragon={dragon} pointsToDistribute={STAT_POINTS_PER_LEVEL} onConfirm={handleStatDistribution} />;
        case GameState.ABILITY_SELECTION:
            return <AbilitySelectionModal dragonLevel={dragon.level} onAbilitySelect={handleAbilitySelected} />;
        case GameState.SHOP:
            return <ShopModal playerGold={player.gold} onBuy={handleBuyItem} onClose={() => setGameState(GameState.PLAYING)} />;
        case GameState.TOURNAMENT:
            return <TournamentModal player={player} dragon={dragon} roster={academyRoster} setRoster={setAcademyRoster} onTournamentEnd={handleTournamentEnd} singleOpponent={duelOpponent ?? undefined} />;
        case GameState.MAP_VIEW:
            return <AcademyMapModal onLocationSelect={handleLocationSelect} onClose={() => setGameState(GameState.PLAYING)} />;
        default: return null;
    }
  };

  const renderActionPanel = () => {
    if (currentLocation) {
        const npcsInLocation = npcs.filter(npc => currentLocation.npcIds.includes(npc.id));
        return (
            <div className="animate-fade-in">
                <h3 className="text-xl font-medieval text-yellow-300 text-center mb-4">{t('in_location_title', { locationName: t(currentLocation.nameKey) })}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {npcsInLocation.map(npc => (
                        <ActionButton key={npc.id} text={t('action_talk', { npcName: t(npc.nameKey) })} onClick={() => handleNpcInteract(npc.id)} icon={<Users className="w-5 h-5 mr-2" />} />
                    ))}
                    <ActionButton text={t('action_leave')} onClick={handleLeaveLocation} icon={<LogOut className="w-5 h-5 mr-2" />} />
                </div>
            </div>
        );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
        <ActionButton text={t('action_explore')} onClick={() => setGameState(GameState.MAP_VIEW)} disabled={dailyActionsUsed.includes('Explorar')} icon={<Map className="w-5 h-5 mr-2" />} />
        <ActionButton text={t('action_train')} onClick={() => setIsTraining(true)} disabled={dailyActionsUsed.includes('Treinar')} icon={<Dumbbell className="w-5 h-5 mr-2" />} />
        <ActionButton text={t('action_feed')} onClick={() => handleAction('Alimentar')} disabled={dailyActionsUsed.includes('Alimentar')} icon={<Beef className="w-5 h-5 mr-2" />} />
        <ActionButton text={t('action_scry')} onClick={() => setIsScrying(true)} icon={<Sparkles className="w-5 h-5 mr-2" />} />
        <ActionButton text={t('action_shop')} onClick={() => setGameState(GameState.SHOP)} icon={<ShoppingCart className="w-5 h-5 mr-2" />} />
        <ActionButton text={t('action_end_day')} onClick={handleEndDay} icon={<Bed className="w-5 h-5 mr-2" />} />
      </div>
    );
  };

  return (
    <>
      {renderModals()}
      <div className="w-full h-full p-4 md:p-6 bg-slate-800 bg-opacity-70 rounded-2xl shadow-2xl border border-slate-700 grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
        <div className="lg:col-span-1 flex flex-col gap-6">
          {player && <PlayerStats player={player} onRestart={onRestart} totalPlayers={ACADEMY_SIZE} onOpenDesktopModal={() => setShowDesktopModal(true)} />}
          {dragon && <DragonInfo dragon={dragon} />}
        </div>

        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-900 bg-opacity-50 p-6 rounded-xl border border-slate-600">
          <div className="flex-grow">
            <DialogueBox message={message} />
          </div>
          <div className="mt-6">
            {renderActionPanel()}
          </div>
        </div>

         <div className="lg:col-span-1 flex flex-col gap-6">
            {player && dragon && <SidePanel player={player} dragon={dragon} npcs={npcs} roster={academyRoster} onUseItem={handleUseItem} onEquipItem={onEquipItem} onUnequipItem={onUnequipItem} />}
         </div>
      </div>
    </>
  );
};

export default GameView;