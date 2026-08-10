import React, { useState, useMemo } from 'react';
import { NPC, Dragon } from '../types';
import { X, Sparkles, Eye } from 'lucide-react';
import { getScryingVision } from '../services/aiService';
import { useLocalization } from '../i18n';

interface ScryingPoolModalProps {
  npcs: NPC[];
  dragon: Dragon;
  onClose: () => void;
}

interface ScryingTarget {
    id: string;
    name: string;
    description: string;
}

const ScryingPoolModal: React.FC<ScryingPoolModalProps> = ({ npcs, dragon, onClose }) => {
    const { t, language } = useLocalization();

    const targets: ScryingTarget[] = useMemo(() => [
        { id: 'player_dragon', name: t('scrying_target_your_dragon', { dragonName: dragon.name }), description: dragon.description },
        ...npcs.map(npc => ({ id: npc.id, name: t(npc.nameKey), description: t(npc.descriptionKey) }))
    ], [npcs, dragon, t]);
    
    const [selectedTarget, setSelectedTarget] = useState<ScryingTarget>(targets[0]);
    const [vision, setVision] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFocus = () => {
        if (!selectedTarget || isLoading) return;
        
        setIsLoading(true);
        setVision(t('scrying_loading_vision'));

        const fetchVision = async () => {
            try {
                const responseText = await getScryingVision(selectedTarget.name, selectedTarget.description, language);
                setVision(responseText);
            } catch (e) {
                setVision(t('scrying_fallback_vision'));
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchVision();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-slate-800 border-2 border-purple-400 rounded-2xl shadow-2xl p-6 w-full max-w-2xl text-white flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-medieval text-purple-300 flex items-center gap-3"><Sparkles/> {t('scrying_pool_title')}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                 <p className="text-slate-300 mb-6 text-center">{t('scrying_pool_subtitle')}</p>

                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                    <select
                        value={selectedTarget.id}
                        onChange={(e) => setSelectedTarget(targets.find(t => t.id === e.target.value) || targets[0])}
                        className="w-full sm:flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        disabled={isLoading}
                    >
                        {targets.map(target => (
                            <option key={target.id} value={target.id}>{target.name}</option>
                        ))}
                    </select>
                     <button 
                        onClick={handleFocus}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <Eye className="w-5 h-5" />
                        {t('button_scrying')}
                    </button>
                </div>

                <div className="flex-grow bg-slate-900 rounded-lg p-6 min-h-[150px] flex items-center justify-center text-center border border-slate-700">
                     <p className="text-xl italic text-purple-200">
                        {vision ? `"${vision}"` : t('scrying_prompt')}
                     </p>
                </div>
            </div>
        </div>
    );
};

export default ScryingPoolModal;