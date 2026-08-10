import React from 'react';
import { Player, Rival } from '../types';
import { Trophy } from 'lucide-react';

interface RankingPanelProps {
  player: Player;
  roster: Rival[];
}

const RankingPanel: React.FC<RankingPanelProps> = ({ player, roster }) => {
    const fullRoster = [...roster, {
        id: 'player',
        name: player.name,
        rank: player.rank,
        dragon: { name: '', level: 0, element: '', stats: {hp:0, attack:0, defense:0, speed:0}, abilities: [] } // Dummy dragon
    } as Rival].sort((a, b) => a.rank - b.rank);

    const playerIndex = fullRoster.findIndex(r => r.id === 'player');
    const displayStart = Math.max(0, playerIndex - 5);
    const displayEnd = Math.min(fullRoster.length, playerIndex + 6);
    const displayRoster = fullRoster.slice(displayStart, displayEnd);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-medieval text-yellow-300 flex items-center mb-4">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Classificação da Academia
            </h3>
            <div className="space-y-2 overflow-y-auto flex-grow pr-2">
                {displayRoster.map(rival => (
                    <div 
                        key={rival.id} 
                        className={`flex justify-between items-center p-2 rounded-lg ${
                            rival.id === 'player' 
                            ? 'bg-yellow-800 bg-opacity-50 border border-yellow-600' 
                            : 'bg-slate-800 bg-opacity-50'
                        }`}
                    >
                        <div className="flex items-center">
                            <span className="font-bold text-lg text-slate-400 w-10">#{rival.rank}</span>
                            <span className={`font-semibold ${rival.id === 'player' ? 'text-yellow-200' : 'text-slate-200'}`}>{rival.name}</span>
                        </div>
                        {rival.id !== 'player' && <span className="text-xs text-slate-400">Nvl. {rival.dragon.level}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankingPanel;