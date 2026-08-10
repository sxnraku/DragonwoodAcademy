import React from 'react';
import { Location } from '../types';
import { ACADEMY_LOCATIONS } from '../constants';
import { X, MapPin, BookOpen, Swords, Sprout, Building } from 'lucide-react';
import { useLocalization } from '../i18n';

interface AcademyMapModalProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
}

const locationIcons: Record<string, React.ReactNode> = {
    library: <BookOpen className="w-12 h-12 text-amber-300" />,
    training_arena: <Swords className="w-12 h-12 text-red-400" />,
    whispering_gardens: <Sprout className="w-12 h-12 text-green-400" />,
    main_hall: <Building className="w-12 h-12 text-slate-400" />,
}

const AcademyMapModal: React.FC<AcademyMapModalProps> = ({ onLocationSelect, onClose }) => {
  const { t } = useLocalization();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X className="w-8 h-8"/>
        </button>
        <h2 className="text-4xl font-medieval text-center text-yellow-300 mb-2 flex items-center justify-center gap-4">
            <MapPin className="w-10 h-10"/> {t('map_title')}
        </h2>
        <p className="text-center text-lg text-slate-300 mb-8">{t('map_subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-4">
            {ACADEMY_LOCATIONS.map(location => (
                <button 
                    key={location.id} 
                    onClick={() => onLocationSelect(location)}
                    className="bg-slate-900 bg-opacity-50 p-6 rounded-xl border-2 border-slate-700 hover:border-yellow-500 hover:bg-slate-700 transition-all duration-300 text-left flex items-start gap-6 transform hover:-translate-y-1"
                >
                    <div className="flex-shrink-0 mt-1">
                        {locationIcons[location.id] || <MapPin className="w-12 h-12" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-medieval text-yellow-200">{t(location.nameKey)}</h3>
                        <p className="text-slate-300 mt-1">{t(location.descriptionKey)}</p>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyMapModal;