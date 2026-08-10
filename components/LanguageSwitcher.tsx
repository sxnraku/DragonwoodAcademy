import React from 'react';
import { useLocalization } from '../i18n';
import { Language } from '../types';
import { Languages } from 'lucide-react';

const languageOptions: { code: Language, name: string }[] = [
    { code: 'pt-PT', name: 'Português (PT)' },
    { code: 'pt-BR', name: 'Português (BR)' },
    { code: 'en', name: 'English' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLocalization();

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-5 h-5 text-yellow-400" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as Language)}
        className="bg-slate-700 text-white border border-slate-600 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        {languageOptions.map(opt => (
          <option key={opt.code} value={opt.code}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
