import React, { useState } from 'react';
import { Dragon, Stats } from '../types';
import { PlusCircle, MinusCircle, Heart, Sword, Shield, Wind, CheckCircle, BrainCircuit } from 'lucide-react';
import { useLocalization } from '../i18n';

interface LevelUpModalProps {
  dragon: Dragon;
  pointsToDistribute: number;
  onConfirm: (newStats: Stats) => void;
}

type StatKey = keyof Omit<Stats, ''>;

const StatRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  baseValue: number;
  increase: number;
  onIncrease: () => void;
  onDecrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}> = ({ label, icon, baseValue, increase, onIncrease, onDecrease, canIncrease, canDecrease }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-700">
    <div className="flex items-center">
        {icon}
        <span className="text-lg ml-3 w-24">{label}</span>
        <span className="font-bold text-xl text-yellow-300">{baseValue + increase}</span>
        {increase > 0 && <span className="ml-2 text-green-400 text-lg">+{increase}</span>}
    </div>
    <div className="flex items-center gap-3">
        <button onClick={onDecrease} disabled={!canDecrease} className="disabled:opacity-30 disabled:cursor-not-allowed">
            <MinusCircle className="w-8 h-8 text-red-400 hover:text-red-300 transition-colors" />
        </button>
        <button onClick={onIncrease} disabled={!canIncrease} className="disabled:opacity-30 disabled:cursor-not-allowed">
            <PlusCircle className="w-8 h-8 text-green-400 hover:text-green-300 transition-colors" />
        </button>
    </div>
  </div>
);

const LevelUpModal: React.FC<LevelUpModalProps> = ({ dragon, pointsToDistribute, onConfirm }) => {
  const [increases, setIncreases] = useState({ hp: 0, attack: 0, defense: 0, speed: 0, mana: 0 });
  const { t } = useLocalization();

  const totalPointsUsed = Object.values(increases).reduce((sum, val) => sum + val, 0);
  const remainingPoints = pointsToDistribute - totalPointsUsed;
  
  const handleIncrease = (stat: StatKey) => {
      if (remainingPoints > 0) {
          setIncreases(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
      }
  };

  const handleDecrease = (stat: StatKey) => {
      if (increases[stat] > 0) {
          setIncreases(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
      }
  };

  const handleConfirm = () => {
      if (remainingPoints === 0) {
          const newStats: Stats = {
              hp: dragon.stats.hp + increases.hp,
              attack: dragon.stats.attack + increases.attack,
              defense: dragon.stats.defense + increases.defense,
              speed: dragon.stats.speed + increases.speed,
              mana: dragon.stats.mana + increases.mana,
          };
          onConfirm(newStats);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl text-white">
        <h2 className="text-4xl font-medieval text-center text-yellow-300 mb-2">{t('level_up_title')}</h2>
        <p className="text-center text-slate-300 mb-6">{t('level_up_subtitle', { dragonName: dragon.name, level: dragon.level })}</p>
        
        <div className="bg-slate-900 p-4 rounded-lg mb-6">
            <h3 className="text-2xl font-bold text-center text-yellow-200">
                {t('level_up_points_label')}: <span className="text-green-400">{remainingPoints}</span>
            </h3>
        </div>

        <div className="space-y-3 mb-8">
            <StatRow 
                label={t('stat_hp')} icon={<Heart className="w-7 h-7 text-red-400" />}
                baseValue={dragon.stats.hp} increase={increases.hp}
                onIncrease={() => handleIncrease('hp')} onDecrease={() => handleDecrease('hp')}
                canIncrease={remainingPoints > 0} canDecrease={increases.hp > 0}
            />
            <StatRow 
                label={t('stat_mana')} icon={<BrainCircuit className="w-7 h-7 text-blue-400" />}
                baseValue={dragon.stats.mana} increase={increases.mana}
                onIncrease={() => handleIncrease('mana')} onDecrease={() => handleDecrease('mana')}
                canIncrease={remainingPoints > 0} canDecrease={increases.mana > 0}
            />
            <StatRow 
                label={t('stat_attack')} icon={<Sword className="w-7 h-7 text-orange-400" />}
                baseValue={dragon.stats.attack} increase={increases.attack}
                onIncrease={() => handleIncrease('attack')} onDecrease={() => handleDecrease('attack')}
                canIncrease={remainingPoints > 0} canDecrease={increases.attack > 0}
            />
            <StatRow 
                label={t('stat_defense')} icon={<Shield className="w-7 h-7 text-sky-400" />}
                baseValue={dragon.stats.defense} increase={increases.defense}
                onIncrease={() => handleIncrease('defense')} onDecrease={() => handleDecrease('defense')}
                canIncrease={remainingPoints > 0} canDecrease={increases.defense > 0}
            />
            <StatRow 
                label={t('stat_speed')} icon={<Wind className="w-7 h-7 text-green-400" />}
                baseValue={dragon.stats.speed} increase={increases.speed}
                onIncrease={() => handleIncrease('speed')} onDecrease={() => handleDecrease('speed')}
                canIncrease={remainingPoints > 0} canDecrease={increases.speed > 0}
            />
        </div>

        <button
            onClick={handleConfirm} disabled={remainingPoints !== 0}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg text-xl transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
        >
            <CheckCircle className="w-6 h-6 mr-3" />
            {t('button_confirm_stats')}
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;