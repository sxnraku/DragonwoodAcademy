import React, { useState, useMemo } from 'react';
import { Ability, AbilityRank } from '../types';
import { PREDEFINED_ABILITIES } from '../constants';
import { Sparkles, Star } from 'lucide-react';
import { useLocalization } from '../i18n';

interface AbilitySelectionModalProps {
  dragonLevel: number;
  onAbilitySelect: (ability: Ability) => void;
}

const getRankProbabilities = (level: number): Record<AbilityRank, number> => {
    const baseProbs = { F:0, E:0, D:0, C:0, B:0, A:0, S:0, SS:0 };
    if (level < 10) { baseProbs.F=60; baseProbs.E=30; baseProbs.D=10; }
    else if (level < 25) { baseProbs.E=50; baseProbs.D=35; baseProbs.C=15; }
    else if (level < 50) { baseProbs.D=40; baseProbs.C=40; baseProbs.B=20; }
    else if (level < 100) { baseProbs.C=30; baseProbs.B=40; baseProbs.A=25; baseProbs.S=5; }
    else { baseProbs.B=20; baseProbs.A=40; baseProbs.S=30; baseProbs.SS=10; }
    return baseProbs as Record<AbilityRank, number>;
};

const selectRandomAbilityByRank = (rank: AbilityRank): Ability => {
    const abilitiesOfRank = PREDEFINED_ABILITIES.filter(a => a.rank === rank);
    return abilitiesOfRank[Math.floor(Math.random() * abilitiesOfRank.length)];
};

const getRandomWeightedRank = (probs: Record<AbilityRank, number>): AbilityRank => {
    const total = Object.values(probs).reduce((a,b) => a+b, 0);
    let rand = Math.random() * total;
    for (const rank in probs) {
        rand -= probs[rank as AbilityRank];
        if (rand <= 0) return rank as AbilityRank;
    }
    return AbilityRank.F; // Fallback
};

const rankColorMap: Record<AbilityRank, string> = {
    [AbilityRank.F]: 'border-gray-500 hover:bg-gray-700', [AbilityRank.E]: 'border-green-600 hover:bg-green-800',
    [AbilityRank.D]: 'border-blue-600 hover:bg-blue-800', [AbilityRank.C]: 'border-purple-600 hover:bg-purple-800',
    [AbilityRank.B]: 'border-yellow-600 hover:bg-yellow-800', [AbilityRank.A]: 'border-red-600 hover:bg-red-800',
    [AbilityRank.S]: 'border-orange-500 hover:bg-orange-700 animate-pulse',
    [AbilityRank.SS]: 'border-violet-500 hover:bg-violet-700 animate-pulse',
};

const AbilitySelectionModal: React.FC<AbilitySelectionModalProps> = ({ dragonLevel, onAbilitySelect }) => {
    const { t } = useLocalization();
    const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);

    const abilityChoices = useMemo(() => {
        const choices = new Set<Ability>();
        const rankProbs = getRankProbabilities(dragonLevel);
        while(choices.size < 3) {
            const rank = getRandomWeightedRank(rankProbs);
            const ability = selectRandomAbilityByRank(rank);
            if (ability) choices.add(ability);
        }
        return Array.from(choices);
    }, [dragonLevel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl text-white">
        <h2 className="text-4xl font-medieval text-center text-yellow-300 mb-2">{t('ability_modal_title')}</h2>
        <p className="text-center text-slate-300 mb-8">{t('ability_modal_subtitle')}</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
            {abilityChoices.map(ability => (
                <button 
                    key={ability.id}
                    onClick={() => setSelectedAbility(ability)}
                    className={`p-6 rounded-xl border-4 transition-all duration-300 flex flex-col h-full text-left bg-slate-900 ${
                        selectedAbility?.id === ability.id ? 'scale-105 bg-opacity-100 shadow-2xl' : 'bg-opacity-50'
                    } ${rankColorMap[ability.rank]}`}
                >
                    <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-2xl font-medieval text-yellow-200">{t(ability.nameKey)}</h3>
                        <p className={`px-3 py-1 text-sm font-black rounded-full ${rankColorMap[ability.rank].replace('border-','bg-').replace('hover:bg-','bg-')} text-white`}>
                            {ability.rank}
                        </p>
                    </div>
                    <p className="text-slate-300 text-sm mb-4 flex-grow">{t(ability.descriptionKey)}</p>
                    <p className="text-lg font-bold text-orange-300">{t('ability_power')}: {ability.power}</p>
                </button>
            ))}
        </div>

        <button
            onClick={() => selectedAbility && onAbilitySelect(selectedAbility)}
            disabled={!selectedAbility}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg text-xl transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
        >
            <Star className="w-6 h-6 mr-3" />
            {t('button_learn_ability')}
        </button>
      </div>
    </div>
  );
};

export default AbilitySelectionModal;