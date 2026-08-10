import React from 'react';
import { Item, Dragon, Equipment } from '../types';
import { Package, PlusCircle } from 'lucide-react';
import { useLocalization } from '../i18n';

interface InventoryPanelProps {
  inventory: Item[];
  dragon: Dragon;
  onUseItem: (itemId: string) => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, dragon, onUseItem }) => {
  const { t } = useLocalization();
  const consumableItems = inventory.filter(item => !('slot' in item));
  
  const itemCounts = consumableItems.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || { ...item, count: 0 });
    acc[item.id].count++;
    return acc;
  }, {} as Record<string, Item & { count: number }>);

  const isUsable = (item: Item): boolean => {
      switch(item.id) {
        case 'sm_health_potion':
            return dragon.currentHp < dragon.stats.hp;
        default:
            return false; // For now, only potions are usable
      }
  };

  return (
    <div className="h-full flex flex-col">
        <h3 className="text-xl font-medieval text-yellow-300 flex items-center mb-4">
            <Package className="w-5 h-5 mr-2 text-yellow-400" />
            {t('inventory_consumables_title')}
        </h3>
        <div className="space-y-3 overflow-y-auto flex-grow pr-2">
            {Object.values(itemCounts).length > 0 ? (
                Object.values(itemCounts).map(item => (
                    <div key={item.id} className="group relative bg-slate-800 p-2 rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-slate-200">{t(item.nameKey)}</span>
                                <span className="font-bold text-yellow-200 ml-2">x{item.count}</span>
                            </div>
                            <button 
                                onClick={() => onUseItem(item.id)}
                                disabled={!isUsable(item)}
                                className="bg-green-700 hover:bg-green-600 text-white font-bold text-xs py-1 px-2 rounded-md transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <PlusCircle className="w-4 h-4" /> {t('button_use')}
                            </button>
                        </div>
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-700 text-white text-xs rounded p-2 border border-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <p>{t(item.descriptionKey)}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-slate-400 italic text-center mt-4">{t('inventory_empty_consumables')}</p>
            )}
        </div>
    </div>
  );
};

export default InventoryPanel;