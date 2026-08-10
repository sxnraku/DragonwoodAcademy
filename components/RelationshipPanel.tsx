import React from 'react';
import { NPC } from '../types';
import { Heart } from 'lucide-react';
import { useLocalization } from '../i18n';

interface RelationshipPanelProps {
  npcs: NPC[];
  relationships: Record<string, number>;
}

const AffinityHearts: React.FC<{ score: number }> = ({ score }) => {
    const totalHearts = 5;
    const filledHearts = Math.max(0, Math.min(totalHearts, Math.floor((score + 50) / 25)));
    
    return (
        <div className="flex">
            {Array.from({ length: totalHearts }).map((_, i) => (
                <Heart
                    key={i}
                    className={`w-5 h-5 ${i < filledHearts ? 'text-red-500 fill-current' : 'text-slate-600'}`}
                />
            ))}
        </div>
    );
};

const RelationshipPanel: React.FC<RelationshipPanelProps> = ({ npcs, relationships }) => {
  const { t } = useLocalization();
  
  return (
    <div className="space-y-4 overflow-y-auto flex-grow pr-2 h-full">
      {npcs.map(npc => {
          const affinity = relationships[npc.id] || 0;
          return (
              <div key={npc.id} className="group relative">
                  <div className="flex justify-between items-center">
                      <span className="font-bold text-yellow-100">{t(npc.nameKey)}</span>
                      <AffinityHearts score={affinity} />
                  </div>
                   <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 border border-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <p className="font-bold mb-1">{t(npc.nameKey)}</p>
                      <p className="italic mb-2">"{t(npc.descriptionKey)}"</p>
                      <hr className="border-slate-600 my-1" />
                      <p>{t('gender_label')}: {t(npc.genderKey)}</p>
                      <p>{t('status_label')}: {t(npc.maritalStatusKey)}</p>
                      <p>{t('affinity_label')}: {affinity}</p>
                  </div>
              </div>
          )
      })}
    </div>
  );
};

export default RelationshipPanel;