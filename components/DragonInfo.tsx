import React, { useMemo } from 'react';
import { Dragon, AbilityRank, Stats, EquipmentSlot } from '../types';
import { Shield, Sword, Wind, Heart, Star, Sparkles, BrainCircuit } from 'lucide-react';
import { LEVEL_UP_XP } from '../constants';
import { useLocalization } from '../i18n';
import DragonAvatar from './DragonAvatar';

interface DragonInfoProps {
  dragon: Dragon;
}

const rankColorMap: Record<AbilityRank, string> = {
    [AbilityRank.F]: 'bg-gray-500 text-gray-100', [AbilityRank.E]: 'bg-green-700 text-green-100',
    [AbilityRank.D]: 'bg-blue-700 text-blue-100', [AbilityRank.C]: 'bg-purple-700 text-purple-100',
    [AbilityRank.B]: 'bg-yellow-700 text-yellow-100', [AbilityRank.A]: 'bg-red-700 text-red-100',
    [AbilityRank.S]: 'bg-orange-500 text-white animate-pulse',
    [AbilityRank.SS]: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white animate-pulse font-black',
};

const StatDisplay: React.FC<{ icon: React.ReactNode; label: string; baseValue: number; bonus: number }> = ({ icon, label, baseValue, bonus }) => {
    const total = baseValue + bonus;
    return (
        <div className="flex items-center text-slate-300" title={`${label}: ${baseValue} (Base) + ${bonus} (Equip) = ${total}`}>
            {icon}
            <span className="ml-2 font-semibold">{total}</span>
            {bonus > 0 && <span className="ml-1 text-green-400 text-xs">(+{bonus})</span>}
        </div>
    );
};


const ProgressBar: React.FC<{current: number, max: number, colorClass: string, label: string}> = ({current, max, colorClass, label}) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div title={label}>
            <div className="w-full bg-slate-700 rounded-full h-2.5 border border-slate-600">
                <div
                    className={`${colorClass} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const DragonInfo: React.FC<DragonInfoProps> = ({ dragon }) => {
  const { t } = useLocalization();

  const equipmentBonuses = useMemo(() => {
    const bonuses: Omit<Stats, 'currentHp' | 'currentMana'> = { hp: 0, attack: 0, defense: 0, speed: 0, mana: 0 };
    Object.values(dragon.equipment).forEach(item => {
        if (item) {
            for (const key in item.stats) {
                const statKey = key as keyof Stats;
                bonuses[statKey] += item.stats[statKey] || 0;
            }
        }
    });
    return bonuses;
  }, [dragon.equipment]);

  const effectiveStats = useMemo(() => {
    const effective: Stats = { ...dragon.stats };
    for (const key in equipmentBonuses) {
        const statKey = key as keyof Stats;
        effective[statKey] += equipmentBonuses[statKey];
    }
    return effective;
  }, [dragon.stats, equipmentBonuses]);

  const xpPercentage = (dragon.xp / LEVEL_UP_XP) * 100;

  return (
    <div className="bg-slate-900 bg-opacity-50 p-4 rounded-xl border border-slate-600 shadow-lg flex-grow flex flex-col">
      <h3 className="text-2xl font-medieval text-center text-yellow-300 mb-3">{dragon.name}</h3>
      <p className="text-center text-sm text-yellow-200 mb-4 -mt-2">{t('element_label')}: {t(`element_${dragon.element.toLowerCase()}`)}</p>
      <div className="aspect-square w-full rounded-lg mb-4">
        <DragonAvatar element={dragon.element} name={dragon.name} />
      </div>
      <p className="text-slate-300 text-sm italic mb-4 text-center">"{dragon.description}"</p>
      
      <div className="space-y-2 mb-4">
        <ProgressBar current={dragon.currentHp} max={effectiveStats.hp} colorClass="bg-red-500" label={`${t('stat_hp')}: ${dragon.currentHp}/${effectiveStats.hp}`} />
        <ProgressBar current={dragon.currentMana} max={effectiveStats.mana} colorClass="bg-blue-500" label={`${t('stat_mana')}: ${dragon.currentMana}/${effectiveStats.mana}`}/>
      </div>
      
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 mb-4 text-sm text-center">
        <StatDisplay icon={<Heart className="w-5 h-5 text-red-400" />} label={t('stat_hp')} baseValue={dragon.stats.hp} bonus={equipmentBonuses.hp} />
        <StatDisplay icon={<BrainCircuit className="w-5 h-5 text-blue-400" />} label={t('stat_mana')} baseValue={dragon.stats.mana} bonus={equipmentBonuses.mana} />
        <StatDisplay icon={<Sword className="w-5 h-5 text-orange-400" />} label={t('stat_attack')} baseValue={dragon.stats.attack} bonus={equipmentBonuses.attack} />
        <StatDisplay icon={<Shield className="w-5 h-5 text-sky-400" />} label={t('stat_defense')} baseValue={dragon.stats.defense} bonus={equipmentBonuses.defense} />
        <StatDisplay icon={<Wind className="w-5 h-5 text-green-400" />} label={t('stat_speed')} baseValue={dragon.stats.speed} bonus={equipmentBonuses.speed} />
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-medieval text-yellow-200 mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> {t('abilities_title')}</h4>
        <div className="flex flex-wrap gap-2">
            {dragon.abilities.map(ability => (
                <div key={ability.id} className="group relative">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${rankColorMap[ability.rank]}`}>
                        {t(ability.nameKey)}
                    </span>
                    <div className="absolute left-0 bottom-full mb-2 w-56 bg-slate-800 text-white text-xs rounded p-2 border border-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <p className="font-bold mb-1">({ability.rank}) {t(ability.nameKey)}</p>
                        <p>{t(ability.descriptionKey)}</p>
                        <p className="mt-1 font-semibold text-orange-300">{t('ability_power')}: {ability.power}</p>
                        <p className="font-semibold text-blue-300">{t('ability_manacost')}: {ability.manaCost}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center text-yellow-100 mb-1">
          <p className="flex items-center text-lg"><Star className="w-5 h-5 mr-2 text-yellow-400" /> {t('level_label')}: {dragon.level}</p>
          <p className="text-sm">XP: {dragon.xp} / {LEVEL_UP_XP}</p>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-500">
          <div
            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DragonInfo;