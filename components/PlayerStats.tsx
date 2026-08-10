import React from 'react';
import { Player } from '../types';
import { User, Award, Coins, Power, BarChart, Calendar, Laptop } from 'lucide-react';
import { useLocalization } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface PlayerStatsProps {
  player: Player;
  onRestart: () => void;
  totalPlayers: number;
  onOpenDesktopModal?: () => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, onRestart, totalPlayers, onOpenDesktopModal }) => {
  const { t, language } = useLocalization();
  const isPt = language.startsWith('pt');
  
  return (
    <div className="bg-slate-900 bg-opacity-50 p-4 rounded-xl border border-slate-600 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-medieval text-yellow-300 flex items-center">
            <User className="w-6 h-6 mr-2 text-yellow-400" />
            {player.name}
        </h3>
        <button 
            onClick={onRestart}
            className="text-sm bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition-colors duration-200 flex items-center"
            title={t('restart_button_title')}
        >
            <Power className="w-4 h-4 mr-1" />
            {t('restart_button')}
        </button>
      </div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <LanguageSwitcher />
        {onOpenDesktopModal && (
          <button
            onClick={onOpenDesktopModal}
            className="bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors duration-200 flex items-center shadow-md border border-blue-400/30"
            title={isPt ? "Instalar App de PC Nativo" : "Install Native PC App"}
          >
            <Laptop className="w-3.5 h-3.5 mr-1" />
            {isPt ? 'App PC' : 'PC App'}
          </button>
        )}
      </div>
      <div className="space-y-2 text-yellow-100">
        <p className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-yellow-400" /> 
            {t('day_label')}: <span className="font-bold ml-2">{player.day}</span>
        </p>
        <p className="flex items-center" title={`${t('rank_label')}: ${player.rank} ${t('of')} ${totalPlayers}`}>
            <BarChart className="w-5 h-5 mr-2 text-yellow-400" /> 
            {t('rank_label')}: <span className="font-bold ml-2">#{player.rank}</span> <span className='text-xs ml-1'>/{totalPlayers}</span>
        </p>
         <p className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-400" /> 
            {t('title_label')}: <span className="font-bold ml-2">{t(player.schoolRankKey)}</span>
        </p>
        <p className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-yellow-400" />
            {t('gold_label')}: <span className="font-bold ml-2">{player.gold}</span>
        </p>
      </div>
    </div>
  );
};

export default PlayerStats;