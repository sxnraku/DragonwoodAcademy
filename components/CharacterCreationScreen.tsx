import React, { useState } from 'react';
import { Flame, Wind, Mountain, Droplets, Zap, Moon, Sun, Laptop } from 'lucide-react';
import { useLocalization } from '../i18n';
import DesktopAppModal from './DesktopAppModal';

interface CharacterCreationScreenProps {
  onCharacterCreate: (playerName: string, dragonName: string, dragonElement: string) => void;
  isLoading: boolean;
  error: string | null;
  defaultPlayerName: string;
  defaultDragonName: string;
  dragonElements: string[];
}

const elementMap: Record<string, { icon: React.ElementType, color: string, selectedColor: string }> = {
  "Fogo": { icon: Flame, color: "text-red-400 border-slate-700 hover:border-red-500 hover:bg-red-900/30", selectedColor: "border-red-500 bg-red-800/50 scale-105" },
  "Vento": { icon: Wind, color: "text-green-400 border-slate-700 hover:border-green-500 hover:bg-green-900/30", selectedColor: "border-green-500 bg-green-800/50 scale-105" },
  "Terra": { icon: Mountain, color: "text-amber-600 border-slate-700 hover:border-amber-500 hover:bg-amber-900/30", selectedColor: "border-amber-500 bg-amber-800/50 scale-105" },
  "Água": { icon: Droplets, color: "text-blue-400 border-slate-700 hover:border-blue-500 hover:bg-blue-900/30", selectedColor: "border-blue-500 bg-blue-800/50 scale-105" },
  "Raio": { icon: Zap, color: "text-yellow-400 border-slate-700 hover:border-yellow-500 hover:bg-yellow-900/30", selectedColor: "border-yellow-500 bg-yellow-800/50 scale-105" },
  "Sombra": { icon: Moon, color: "text-indigo-400 border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/30", selectedColor: "border-indigo-500 bg-indigo-800/50 scale-105" },
  "Luz": { icon: Sun, color: "text-orange-300 border-slate-700 hover:border-orange-400 hover:bg-orange-900/30", selectedColor: "border-orange-400 bg-orange-800/50 scale-105" },
};

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({
  onCharacterCreate,
  isLoading,
  error,
  defaultPlayerName,
  defaultDragonName,
  dragonElements,
}) => {
  const [playerName, setPlayerName] = useState(defaultPlayerName);
  const [dragonName, setDragonName] = useState(defaultDragonName);
  const [selectedElement, setSelectedElement] = useState(dragonElements[0]);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const { t, language } = useLocalization();
  const isPt = language.startsWith('pt');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && dragonName.trim() && selectedElement) {
      onCharacterCreate(playerName, dragonName, selectedElement);
    }
  };

  return (
    <div className="bg-slate-800 bg-opacity-80 p-8 rounded-xl shadow-2xl border border-slate-700 max-w-2xl mx-auto animate-fade-in relative">
      {showDesktopModal && <DesktopAppModal onClose={() => setShowDesktopModal(false)} />}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-medieval text-yellow-300">{t('cc_title')}</h2>
        <button
          type="button"
          onClick={() => setShowDesktopModal(true)}
          className="bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors duration-200 flex items-center shadow-md border border-blue-400/30"
        >
          <Laptop className="w-4 h-4 mr-1.5" />
          {isPt ? 'App PC Nativo' : 'Native PC App'}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
          <div>
            <label htmlFor="playerName" className="block text-yellow-100 mb-2">{t('cc_player_name_label')}</label>
            <input
              id="playerName" type="text" value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="dragonName" className="block text-yellow-100 mb-2">{t('cc_dragon_name_label')}</label>
            <input
              id="dragonName" type="text" value={dragonName}
              onChange={(e) => setDragonName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
        </div>
        
        <div className="mb-8">
            <label className="block text-yellow-100 mb-3 text-center text-lg">{t('cc_element_label')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {dragonElements.map((element) => {
                  const Icon = elementMap[element]?.icon || Sun;
                  const colors = elementMap[element];
                  return (
                    <button
                        type="button" key={element} onClick={() => setSelectedElement(element)}
                        className={`p-4 rounded-xl text-center font-bold transition-all duration-300 border-2 flex flex-col items-center justify-center aspect-square transform hover:-translate-y-1 ${
                            selectedElement === element ? colors.selectedColor : colors.color
                        }`}
                    >
                        <Icon className={`w-10 h-10 mb-2 ${colors.color.split(' ')[0]}`} />
                        <span>{t(`element_${element.toLowerCase()}`)}</span>
                    </button>
                  )}
                )}
            </div>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        
        <button
          type="submit" disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('cc_loading_button')}
            </>
          ) : (
            t('cc_start_button')
          )}
        </button>
      </form>
    </div>
  );
};

export default CharacterCreationScreen;