import React, { useState } from 'react';
import { Dragon, Item, Equipment, EquipmentSlot, Stats } from '../types';
import { Gem, Shield, Star, Heart, BrainCircuit, Wind, Sword } from 'lucide-react';
import { useLocalization } from '../i18n';

interface EquipmentPanelProps {
  dragon: Dragon;
  inventory: Item[];
  onEquip: (item: Equipment) => void;
  onUnequip: (slot: EquipmentSlot) => void;
}

const slotIcons: Record<EquipmentSlot, React.ReactNode> = {
    [EquipmentSlot.ARMOR]: <Shield className="w-8 h-8 text-sky-400"/>,
    [EquipmentSlot.CLAWS]: <Sword className="w-8 h-8 text-orange-400"/>,
    [EquipmentSlot.TALISMAN]: <Star className="w-8 h-8 text-yellow-400"/>,
};

const StatDifferenceTooltip: React.FC<{
    itemToEquip: Equipment;
    currentlyEquipped?: Equipment;
}> = ({ itemToEquip, currentlyEquipped }) => {
    const { t } = useLocalization();
    const differences: { stat: keyof Stats, diff: number }[] = [];
    const statKeys: (keyof Stats)[] = ['hp', 'mana', 'attack', 'defense', 'speed'];

    statKeys.forEach(stat => {
        const toEquipStat = itemToEquip.stats[stat] || 0;
        const equippedStat = currentlyEquipped?.stats[stat] || 0;
        const diff = toEquipStat - equippedStat;
        if (diff !== 0) {
            differences.push({ stat, diff });
        }
    });

    if (differences.length === 0) {
        return <p className="text-slate-400">{t('tooltip_no_change')}</p>;
    }

    return (
        <div className="space-y-1">
            {differences.map(({ stat, diff }) => (
                <p key={stat} className={diff > 0 ? 'text-green-400' : 'text-red-400'}>
                    {t(`stat_${stat}`)}: {diff > 0 ? `+${diff}` : diff}
                </p>
            ))}
        </div>
    );
};

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ dragon, inventory, onEquip, onUnequip }) => {
    const { t } = useLocalization();
    const equipmentItems = inventory.filter(item => 'slot' in item) as Equipment[];

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-medieval text-yellow-300 flex items-center mb-4">
                <Gem className="w-5 h-5 mr-2 text-yellow-400" />
                {t('equipment_title')}
            </h3>
            
            {/* Equipped Items */}
            <div className="space-y-3 mb-4">
                {Object.values(EquipmentSlot).map(slot => {
                    const equippedItem = dragon.equipment[slot];
                    return (
                        <div key={slot} className="bg-slate-800 p-3 rounded-lg flex items-center gap-4 border border-slate-700">
                           <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center">
                                {slotIcons[slot]}
                           </div>
                           <div className="flex-grow">
                                <h4 className="text-sm text-slate-400">{t(`slot_${slot}`)}</h4>
                                {equippedItem ? (
                                    <p className="font-bold text-yellow-200">{t(equippedItem.nameKey)}</p>
                                ) : (
                                    <p className="text-slate-500 italic">{t('slot_empty')}</p>
                                )}
                           </div>
                           {equippedItem && (
                                <button onClick={() => onUnequip(slot)} className="text-xs bg-red-800 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                                   {t('button_unequip')}
                                </button>
                           )}
                        </div>
                    )
                })}
            </div>

            {/* Inventory */}
            <h4 className="text-lg font-medieval text-yellow-200 mb-2">{t('inventory_title')}</h4>
            <div className="space-y-2 overflow-y-auto flex-grow pr-2">
                {equipmentItems.length > 0 ? (
                    equipmentItems.map(item => (
                        <div key={item.id} className="group relative bg-slate-800 p-2 rounded-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-slate-200">{t(item.nameKey)}</span>
                                    <p className="text-xs text-slate-400">{t(`slot_${item.slot}`)}</p>
                                </div>
                                <button 
                                    onClick={() => onEquip(item)}
                                    className="bg-green-700 hover:bg-green-600 text-white font-bold text-xs py-1 px-2 rounded-md transition-colors duration-200"
                                >
                                    {t('button_equip')}
                                </button>
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 w-52 bg-slate-700 text-white text-xs rounded p-3 border border-slate-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                <p className="font-bold mb-1">{t(item.nameKey)}</p>
                                <p className="italic mb-2">{t(item.descriptionKey)}</p>
                                <hr className="border-slate-600 my-1"/>
                                <StatDifferenceTooltip itemToEquip={item} currentlyEquipped={dragon.equipment[item.slot]}/>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 italic text-center mt-4">{t('inventory_empty_equipment')}</p>
                )}
            </div>
        </div>
    );
};

export default EquipmentPanel;
