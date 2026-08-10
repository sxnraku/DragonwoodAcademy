import React, { useState } from 'react';
import { Player, NPC, Rival, Item, Dragon, Equipment, EquipmentSlot } from '../types';
import RelationshipPanel from './RelationshipPanel';
import InventoryPanel from './InventoryPanel';
import RankingPanel from './RankingPanel';
import EquipmentPanel from './EquipmentPanel';
import { User, Shield, BarChart, Gem } from 'lucide-react';
import { useLocalization } from '../i18n';

interface SidePanelProps {
    player: Player;
    dragon: Dragon;
    npcs: NPC[];
    roster: Rival[];
    onUseItem: (itemId: string) => void;
    onEquipItem: (item: Equipment) => void;
    onUnequipItem: (slot: EquipmentSlot) => void;
}

type Tab = 'ranking' | 'relationships' | 'inventory' | 'equipment';

const SidePanel: React.FC<SidePanelProps> = ({ player, dragon, npcs, roster, onUseItem, onEquipItem, onUnequipItem }) => {
    const [activeTab, setActiveTab] = useState<Tab>('ranking');
    const { t } = useLocalization();

    const renderTabContent = () => {
        switch(activeTab) {
            case 'ranking':
                return <RankingPanel player={player} roster={roster} />;
            case 'relationships':
                return <RelationshipPanel npcs={npcs} relationships={player.relationships} />;
            case 'inventory':
                return <InventoryPanel inventory={player.inventory} dragon={dragon} onUseItem={onUseItem} />;
            case 'equipment':
                return <EquipmentPanel 
                            dragon={dragon} 
                            inventory={player.inventory} 
                            onEquip={onEquipItem}
                            onUnequip={onUnequipItem}
                        />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{tabName: Tab, icon: React.ReactNode, label: string}> = ({tabName, icon, label}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 flex items-center justify-center p-2 text-sm font-bold transition-colors duration-200 rounded-t-lg ${activeTab === tabName ? 'bg-slate-700 text-yellow-300' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            title={label}
        >
            {icon}
            <span className="hidden sm:inline ml-2">{label}</span>
        </button>
    );

    return (
        <div className="bg-slate-900 bg-opacity-50 rounded-xl border border-slate-600 shadow-lg h-full flex flex-col">
            <div className="flex border-b border-slate-600">
                <TabButton tabName="ranking" icon={<BarChart className="w-5 h-5"/>} label={t('tab_ranking')} />
                <TabButton tabName="relationships" icon={<User className="w-5 h-5"/>} label={t('tab_relationships')} />
                <TabButton tabName="equipment" icon={<Gem className="w-5 h-5"/>} label={t('tab_equipment')} />
                <TabButton tabName="inventory" icon={<Shield className="w-5 h-5"/>} label={t('tab_inventory')} />
            </div>
            <div className="p-4 flex-grow overflow-hidden">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SidePanel;