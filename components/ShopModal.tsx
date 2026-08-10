import React from 'react';
import { Item } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Coins, X, ShoppingCart } from 'lucide-react';
import { useLocalization } from '../i18n';

interface ShopModalProps {
  playerGold: number;
  onBuy: (item: Item) => void;
  onClose: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ playerGold, onBuy, onClose }) => {
  const { t } = useLocalization();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-3xl text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X className="w-8 h-8"/>
        </button>
        <h2 className="text-4xl font-medieval text-center text-yellow-300 mb-2 flex items-center justify-center gap-4">
            <ShoppingCart className="w-10 h-10"/> {t('shop_title')}
        </h2>
        <div className="text-center text-lg text-yellow-100 mb-6 flex items-center justify-center gap-2">
            {t('shop_your_gold')}: <Coins className="w-5 h-5 text-yellow-400"/> <span className="font-bold">{playerGold}</span>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            {SHOP_ITEMS.map(item => (
                <div key={item.id} className="bg-slate-900 p-4 rounded-lg flex items-center justify-between gap-4 border border-slate-700">
                    <div>
                        <h3 className="text-xl font-bold text-yellow-200">{t(item.nameKey)}</h3>
                        <p className="text-sm text-slate-300">{t(item.descriptionKey)}</p>
                    </div>
                    <div className="text-right">
                        <button 
                            onClick={() => onBuy(item)}
                            disabled={playerGold < item.cost}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Coins className="w-5 h-5" /> {item.cost}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ShopModal;