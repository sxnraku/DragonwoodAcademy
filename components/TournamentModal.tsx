import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Dragon, Rival, Ability, Combatant } from '../types';
import { Swords, Trophy, Heart, BrainCircuit, Zap } from 'lucide-react';
import { useLocalization } from '../i18n';
import DragonAvatar from './DragonAvatar';

interface TournamentModalProps {
  player: Player;
  dragon: Dragon;
  roster: Rival[];
  setRoster: React.Dispatch<React.SetStateAction<Rival[]>>;
  onTournamentEnd: (rankChange: number, rewards: { gold: number }) => void;
  singleOpponent?: Rival;
}

interface DamagePopup {
  id: number;
  value: number;
}

const ProgressBar: React.FC<{current: number, max: number, colorClass: string, label?: string}> = ({current, max, colorClass, label}) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="w-full bg-slate-900/80 rounded-full h-4 border border-slate-600/60 overflow-hidden relative shadow-inner">
            <div
                className={`${colorClass} h-full rounded-full transition-all duration-500 shadow-md`}
                style={{ width: `${percentage}%` }}
            ></div>
            {label && <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{label}</span>}
        </div>
    );
};

interface CombatantDisplayProps {
    combatant: Dragon | Rival['dragon'];
    isPlayer: boolean;
    isHit: boolean;
    damagePopups: DamagePopup[];
}

const CombatantDisplay: React.FC<CombatantDisplayProps> = ({ combatant, isPlayer, isHit, damagePopups }) => {
    const hp = 'currentHp' in combatant ? combatant.currentHp : 0;
    const mana = 'currentMana' in combatant ? combatant.currentMana : 0;
    const element = combatant.element || 'Fogo';
    const { t } = useLocalization();

    return(
        <div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
            isHit ? 'animate-hit-shake border-red-500 bg-red-950/70 shadow-[0_0_35px_rgba(239,68,68,0.7)]' : 
            isPlayer ? 'border-blue-500/80 bg-slate-800/90 shadow-xl' : 'border-red-500/80 bg-slate-800/90 shadow-xl'
        }`}>
            {/* Slash Overlay when hit */}
            {isHit && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden rounded-2xl">
                    <svg className="w-44 h-44 animate-slash-effect text-red-500 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]" viewBox="0 0 100 100">
                        <path d="M 10 10 L 90 90 M 20 80 L 80 20" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
                    </svg>
                </div>
            )}

            {/* Floating Damage Numbers */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                {damagePopups.map(popup => (
                    <div key={popup.id} className="animate-float-damage text-2xl md:text-3xl font-black font-medieval text-red-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-1">
                        <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-bounce" />
                        -{popup.value} HP
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 shrink-0">
                    <DragonAvatar element={element} name={combatant.name} size="sm" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <h4 className="font-medieval text-2xl truncate text-yellow-200">{combatant.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-slate-700/80 px-2 py-0.5 rounded text-slate-300 font-semibold">{t('level_label')} {combatant.level}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-900/60 text-yellow-300 border border-yellow-500/30">{element}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2.5">
                <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-red-400 flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-red-500"/> HP</span>
                        <span className="text-slate-200">{hp} / {combatant.stats.hp}</span>
                    </div>
                    <ProgressBar current={hp} max={combatant.stats.hp} colorClass="bg-gradient-to-r from-red-600 to-green-500" />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-blue-400 flex items-center gap-1"><BrainCircuit className="w-3.5 h-3.5 text-blue-400"/> Mana</span>
                        <span className="text-slate-200">{mana} / {combatant.stats.mana}</span>
                    </div>
                    <ProgressBar current={mana} max={combatant.stats.mana} colorClass="bg-gradient-to-r from-blue-600 to-cyan-400" />
                </div>
            </div>
        </div>
    );
};

const TournamentModal: React.FC<TournamentModalProps> = ({ player, dragon, roster, setRoster, onTournamentEnd, singleOpponent }) => {
    const { t } = useLocalization();
    const [stage, setStage] = useState<'intro' | 'match' | 'results'>(singleOpponent ? 'match' : 'intro');
    const [opponents, setOpponents] = useState<Rival[]>(singleOpponent ? [singleOpponent] : []);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [wins, setWins] = useState(0);
    const [totalGoldReward, setTotalGoldReward] = useState(0);
    const [playerRankInTournament, setPlayerRankInTournament] = useState(player.rank);
    
    // Battle state
    const [log, setLog] = useState<{text: string, type: string}[]>([]);
    const [playerCombatant, setPlayerCombatant] = useState<Dragon>({...dragon, currentHp: dragon.stats.hp, currentMana: dragon.stats.mana });
    const [opponentCombatant, setOpponentCombatant] = useState<Rival['dragon'] | null>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [isBattleOver, setIsBattleOver] = useState(false);

    // VFX & Hit animation states
    const [isPlayerHit, setIsPlayerHit] = useState(false);
    const [isOpponentHit, setIsOpponentHit] = useState(false);
    const [playerPopups, setPlayerPopups] = useState<DamagePopup[]>([]);
    const [opponentPopups, setOpponentPopups] = useState<DamagePopup[]>([]);
    
    const logColorMap: Record<string, string> = {
        info: 'text-yellow-300 italic', player: 'text-green-400', opponent: 'text-red-400',
        mana: 'text-blue-400', turn: 'text-slate-400 font-bold',
        victory: 'text-green-300 font-bold text-lg animate-pulse',
        defeat: 'text-red-300 font-bold text-lg',
    };

    useEffect(() => {
        if (singleOpponent) {
            setOpponents([singleOpponent]);
            return;
        }
        const potentialOpponents = roster.filter(r => r.rank < player.rank).sort((a,b) => b.rank - a.rank).slice(0, 10);
        const selected: Rival[] = [];
        while(selected.length < 3 && potentialOpponents.length > 0) {
            const randomIndex = Math.floor(Math.random() * potentialOpponents.length);
            selected.push(potentialOpponents.splice(randomIndex, 1)[0]);
        }
        setOpponents(selected);
    }, [roster, player.rank, singleOpponent]);

    const addLog = useCallback((text: string, type: string) => setLog(prev => [...prev, {text, type}]), []);
    
    const startedMatchKeyRef = useRef<string>('');

    const triggerHitEffect = (target: 'player' | 'opponent', damage: number) => {
        const popup = { id: Date.now() + Math.random(), value: damage };
        if (target === 'player') {
            setIsPlayerHit(true);
            setPlayerPopups(prev => [...prev, popup]);
            setTimeout(() => setIsPlayerHit(false), 450);
            setTimeout(() => setPlayerPopups(prev => prev.filter(p => p.id !== popup.id)), 1200);
        } else {
            setIsOpponentHit(true);
            setOpponentPopups(prev => [...prev, popup]);
            setTimeout(() => setIsOpponentHit(false), 450);
            setTimeout(() => setOpponentPopups(prev => prev.filter(p => p.id !== popup.id)), 1200);
        }
    };

    const handleOpponentTurn = useCallback((overrideOc?: Combatant, overridePc?: Combatant) => {
        const oc = overrideOc || opponentCombatant;
        const pc = overridePc || playerCombatant;
        if (!oc || !pc || oc.currentHp <= 0 || pc.currentHp <= 0) return;

        const usableAbilities = oc.abilities.filter(a => a.manaCost <= oc.currentMana);
        const abilityToUse = (usableAbilities.length > 0 
            ? usableAbilities.sort((a,b) => b.power - a.power)[0] 
            : (oc.abilities.find(a => a.manaCost === 0) || oc.abilities[0])) || {
                id: 'tackle', power: 5, manaCost: 0, nameKey: 'ability_tackle_name', descriptionKey: '', rank: 'F' as any
            };

        const opponentDmg = Math.max(1, Math.floor((oc.stats.attack + abilityToUse.power) - pc.stats.defense / 2));
        const newPlayerHp = Math.max(0, pc.currentHp - opponentDmg);
        const newOpponentMana = Math.max(0, oc.currentMana - abilityToUse.manaCost);

        setOpponentCombatant({ ...oc, currentMana: newOpponentMana });
        setPlayerCombatant({ ...pc, currentHp: newPlayerHp });

        triggerHitEffect('player', opponentDmg);
        addLog(t('tournament_log_opponent_attack', { dragonName: oc.name, abilityName: t(abilityToUse.nameKey), damage: opponentDmg }), 'opponent');

        if (newPlayerHp <= 0) {
            addLog(t('tournament_log_player_defeated', { dragonName: dragon.name }), 'defeat');
            setIsBattleOver(true);
        } else {
            setIsPlayerTurn(true);
        }
    }, [opponentCombatant, playerCombatant, addLog, dragon.name, t]);
    
    const startMatch = useCallback(() => {
        if (currentMatchIndex >= opponents.length || !opponents[currentMatchIndex]) {
            setStage('results');
            return;
        }
        const opponent = opponents[currentMatchIndex];
        const initialPc = {...dragon, currentHp: dragon.stats.hp, currentMana: dragon.stats.mana };
        const initialOc = {...opponent.dragon, currentHp: opponent.dragon.stats.hp, currentMana: opponent.dragon.stats.mana};
        setPlayerCombatant(initialPc);
        setOpponentCombatant(initialOc);
        setIsBattleOver(false);
        setLog([]);
        setPlayerPopups([]);
        setOpponentPopups([]);
        
        addLog(t('tournament_log_match_start', { index: currentMatchIndex + 1, opponentName: opponent.name, rank: opponent.rank }), 'info');
        const playerGoesFirst = dragon.stats.speed >= opponent.dragon.stats.speed;
        setIsPlayerTurn(playerGoesFirst);
        
        if(!playerGoesFirst){
            setTimeout(() => handleOpponentTurn(initialOc, initialPc), 1000);
        }
    }, [currentMatchIndex, opponents, dragon, addLog, handleOpponentTurn, t]);
    
    const handlePlayerAction = (ability: Ability) => {
        if (!isPlayerTurn || isBattleOver || !opponentCombatant || !playerCombatant) return;
        if (playerCombatant.currentMana < ability.manaCost) {
            addLog(t('tournament_log_no_mana', { abilityName: t(ability.nameKey) }), 'mana');
            return;
        }

        setIsPlayerTurn(false);

        const playerDmg = Math.max(1, Math.floor((dragon.stats.attack + ability.power) - opponentCombatant.stats.defense / 2));
        const newOpponentHp = Math.max(0, opponentCombatant.currentHp - playerDmg);
        const newPlayerMana = Math.max(0, playerCombatant.currentMana - ability.manaCost);

        const nextPc = { ...playerCombatant, currentMana: newPlayerMana };
        const nextOc = { ...opponentCombatant, currentHp: newOpponentHp };

        setPlayerCombatant(nextPc);
        setOpponentCombatant(nextOc);

        triggerHitEffect('opponent', playerDmg);
        addLog(t('tournament_log_player_attack', { dragonName: dragon.name, abilityName: t(ability.nameKey), damage: playerDmg }), 'player');

        if (newOpponentHp <= 0) {
            addLog(t('tournament_log_opponent_defeated', { opponentDragonName: opponentCombatant.name }), 'victory');
            setIsBattleOver(true);
        } else {
            setTimeout(() => {
                handleOpponentTurn(nextOc, nextPc);
            }, 1000);
        }
    };

    const handleEndMatch = () => {
        const currentOpponent = opponents[currentMatchIndex];
        const playerWon = opponentCombatant ? opponentCombatant.currentHp <= 0 : false;
        
        if (playerWon && currentOpponent) {
            setWins(w => w + 1);
            const goldReward = 50 + (currentOpponent.dragon?.level || 1) * 2;
            setTotalGoldReward(g => g + goldReward);
            
            const rivalToUpdate = roster.find(r => r.id === currentOpponent.id);
            if (rivalToUpdate) {
                const newPlayerRank = rivalToUpdate.rank;
                const oldPlayerRank = playerRankInTournament;
                setPlayerRankInTournament(newPlayerRank);
                
                // Swap ranks
                setRoster(prevRoster => {
                    const newRoster = [...prevRoster];
                    const opponentIndex = newRoster.findIndex(r => r.id === rivalToUpdate.id);
                    if(opponentIndex !== -1) {
                         newRoster[opponentIndex] = { ...newRoster[opponentIndex], rank: oldPlayerRank };
                    }
                    return newRoster;
                });
            }
        }

        if (currentMatchIndex < opponents.length - 1) {
            setCurrentMatchIndex(cm => cm + 1);
        } else {
            setStage('results');
        }
    };

    useEffect(() => {
        const matchKey = `${stage}_${currentMatchIndex}`;
        if (stage === 'match' && startedMatchKeyRef.current !== matchKey) {
            startedMatchKeyRef.current = matchKey;
            startMatch();
        } else if (stage !== 'match') {
            startedMatchKeyRef.current = '';
        }
    }, [stage, currentMatchIndex, startMatch]);

    if (opponents.length === 0 && stage === 'intro') {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl p-8 w-full max-w-2xl text-center">
                    <h2 className="text-3xl font-medieval text-yellow-300 mb-4">{t('tournament_no_opponents_title')}</h2>
                    <p className="text-slate-300 mb-6">{t('tournament_no_opponents_desc')}</p>
                    <button onClick={() => onTournamentEnd(0, {gold: 0})} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg">{t('button_back')}</button>
                </div>
            </div>
        );
    }
    
    return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-yellow-500/80 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] p-6 md:p-8 w-full max-w-4xl text-white relative">
         <h2 className="text-4xl font-medieval text-center text-yellow-300 mb-4 flex items-center justify-center gap-4">
            {singleOpponent ? <Swords className="w-10 h-10 text-red-400 animate-pulse"/> : <Trophy className="w-10 h-10 text-yellow-400"/>} 
            {singleOpponent ? `Duelo contra ${singleOpponent.name}` : t('tournament_title')}
         </h2>
        
        {stage === 'intro' && (
            <div className="text-center">
                <p className="text-slate-300 mb-6">{t('tournament_intro_desc')}</p>
                <h3 className="text-xl font-bold text-yellow-200 mb-4">{t('tournament_opponents_list')}:</h3>
                <div className="flex justify-center gap-4 mb-8">
                    {opponents.map(op => <div key={op.id} className="bg-slate-700 p-3 rounded-md text-sm">#{op.rank} {op.name}</div>)}
                </div>
                <button onClick={() => setStage('match')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 text-lg rounded-lg shadow-lg shadow-green-900/50 transition-all transform hover:scale-105">{t('button_start')}</button>
            </div>
        )}

        {stage === 'match' && opponentCombatant && playerCombatant && (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CombatantDisplay combatant={playerCombatant} isPlayer={true} isHit={isPlayerHit} damagePopups={playerPopups} />
                    <CombatantDisplay combatant={opponentCombatant} isPlayer={false} isHit={isOpponentHit} damagePopups={opponentPopups} />
                </div>
                <div className="bg-slate-950 p-4 rounded-xl min-h-[150px] max-h-[25vh] mb-4 border border-slate-700 font-mono text-sm space-y-1.5 overflow-y-auto shadow-inner">
                    {log.map((logItem, i) => <p key={i} className={`animate-fade-in ${logColorMap[logItem.type] || 'text-slate-300'}`}>{logItem.text}</p>)}
                </div>

                {isBattleOver ? (
                    <button onClick={handleEndMatch} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-900/40 text-lg transition-all transform hover:scale-[1.01]">
                        {currentMatchIndex < opponents.length - 1 ? t('button_next_battle') : t('button_view_results')}
                    </button>
                ) : (
                    isPlayerTurn ? (
                        <div className="grid grid-cols-2 gap-3">
                           {playerCombatant.abilities.map(ability => (
                               <button key={ability.id} onClick={() => handlePlayerAction(ability)} disabled={playerCombatant.currentMana < ability.manaCost} className="bg-gradient-to-r from-amber-700 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed p-3 rounded-xl text-left shadow-md transition-all transform hover:scale-[1.02] border border-yellow-500/30">
                                   <p className="font-bold font-medieval text-lg text-yellow-100 flex items-center justify-between">
                                      {t(ability.nameKey)}
                                      <Zap className="w-4 h-4 text-yellow-300 opacity-80" />
                                   </p>
                                   <p className="text-xs text-blue-200 mt-1">{t('ability_manacost')}: {ability.manaCost} Mana</p>
                               </button>
                           ))}
                        </div>
                    ) : <p className="text-center text-lg italic animate-pulse text-yellow-300 font-medieval">{t('tournament_opponent_turn')}</p>
                )}
            </div>
        )}

        {stage === 'results' && (
            <div className="text-center py-6">
                <h3 className="text-3xl font-medieval text-yellow-200 mb-4">
                    {singleOpponent ? (wins > 0 ? "🎉 Vitória no Duelo!" : "💀 Derrota no Duelo") : t('tournament_results_title')}
                </h3>
                <p className="text-slate-200 text-lg mb-2">{t('tournament_results_wins', { wins, total: opponents.length })}</p>
                {!singleOpponent && (
                    <p className="text-slate-200 text-lg mb-2">{t('tournament_results_rank_change', { oldRank: player.rank, newRank: playerRankInTournament })}</p>
                )}
                <p className="text-slate-200 text-lg mb-6 flex items-center justify-center gap-2">
                   <span>💰</span> {t('tournament_results_gold', { gold: totalGoldReward })}
                </p>
                <button onClick={() => onTournamentEnd(singleOpponent ? 0 : player.rank - playerRankInTournament, {gold: totalGoldReward})} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-10 text-lg rounded-xl shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105">{t('button_close')}</button>
            </div>
        )}
      </div>
    </div>
    );
};

export default TournamentModal;