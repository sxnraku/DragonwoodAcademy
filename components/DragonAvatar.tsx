import React from 'react';
import { Flame, Wind, Mountain, Waves, Zap, Moon, Sun, Sparkles } from 'lucide-react';

interface DragonAvatarProps {
  element: string;
  name: string;
  className?: string;
}

interface ElementStyle {
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
  icon: React.ElementType;
  badgeBg: string;
  label: string;
}

const elementStyles: Record<string, ElementStyle> = {
  Fogo: {
    bgGradient: 'from-amber-900 via-red-950 to-neutral-950',
    borderColor: 'border-amber-500/60',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    accentColor: 'text-amber-400',
    icon: Flame,
    badgeBg: 'bg-red-900/80 text-amber-300 border-amber-600/50',
    label: 'Fogo',
  },
  Vento: {
    bgGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    borderColor: 'border-teal-400/60',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    accentColor: 'text-teal-300',
    icon: Wind,
    badgeBg: 'bg-teal-900/80 text-teal-200 border-teal-500/50',
    label: 'Vento',
  },
  Terra: {
    bgGradient: 'from-amber-950 via-stone-900 to-neutral-950',
    borderColor: 'border-emerald-600/60',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    accentColor: 'text-emerald-400',
    icon: Mountain,
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
    label: 'Terra',
  },
  Água: {
    bgGradient: 'from-blue-950 via-indigo-950 to-slate-950',
    borderColor: 'border-cyan-400/60',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    accentColor: 'text-cyan-300',
    icon: Waves,
    badgeBg: 'bg-blue-900/80 text-cyan-200 border-cyan-500/50',
    label: 'Água',
  },
  Raio: {
    bgGradient: 'from-violet-950 via-purple-900 to-slate-950',
    borderColor: 'border-yellow-400/60',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    accentColor: 'text-yellow-300',
    icon: Zap,
    badgeBg: 'bg-purple-900/80 text-yellow-300 border-yellow-500/50',
    label: 'Raio',
  },
  Sombra: {
    bgGradient: 'from-purple-950 via-neutral-950 to-black',
    borderColor: 'border-purple-500/60',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    accentColor: 'text-purple-300',
    icon: Moon,
    badgeBg: 'bg-purple-950/90 text-purple-200 border-purple-600/50',
    label: 'Sombra',
  },
  Luz: {
    bgGradient: 'from-amber-950 via-yellow-950 to-slate-950',
    borderColor: 'border-amber-300/70',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    accentColor: 'text-amber-200',
    icon: Sun,
    badgeBg: 'bg-amber-900/80 text-yellow-100 border-amber-400/50',
    label: 'Luz',
  },
};

export const DragonAvatar: React.FC<DragonAvatarProps> = ({ element, name, className = '' }) => {
  const style = elementStyles[element] || elementStyles.Fogo;
  const ElementIcon = style.icon;

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br ${style.bgGradient} border-2 ${style.borderColor} shadow-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 group hover:border-yellow-400 ${className}`}
      style={{
        boxShadow: `0 0 25px ${style.glowColor}`,
      }}
    >
      {/* Background Magic Runes Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Decorative Outer Ring */}
      <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-dashed border-yellow-500/30 flex items-center justify-center animate-[spin_60s_linear_infinite]">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-yellow-400/20" />
      </div>

      {/* Dragon Crest Emblem SVG (Center) */}
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-transform duration-500 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dragon Silhouette Wings & Crest */}
          <path
            d="M100 25 C110 50, 140 45, 175 35 C150 70, 160 100, 135 125 C120 110, 110 120, 100 145 C90 120, 80 110, 65 125 C40 100, 50 70, 25 35 C60 45, 90 50, 100 25 Z"
            fill="currentColor"
            className={`${style.accentColor} opacity-25`}
          />
          {/* Inner Wing Spans */}
          <path
            d="M100 40 C115 65, 145 60, 165 50 C145 80, 148 100, 130 115 C115 105, 110 115, 100 135 C90 115, 85 105, 70 115 C52 100, 55 80, 35 50 C55 60, 85 65, 100 40 Z"
            fill="currentColor"
            className={`${style.accentColor} opacity-40`}
          />
          {/* Dragon Head / Horns Silhouette */}
          <path
            d="M100 50 L108 75 L125 78 L110 92 L115 110 L100 98 L85 110 L90 92 L75 78 L92 75 Z"
            fill="url(#dragonGold)"
          />
          {/* Glowing Eye Points */}
          <circle cx="95" cy="80" r="2.5" fill="#fef08a" />
          <circle cx="105" cy="80" r="2.5" fill="#fef08a" />

          {/* Gradients */}
          <defs>
            <linearGradient id="dragonGold" x1="75" y1="50" x2="125" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.5" stopColor="#eab308" />
              <stop offset="1" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Element Icon */}
        <div className={`-mt-6 p-2 rounded-full bg-slate-900/90 border ${style.borderColor} shadow-lg ${style.accentColor} flex items-center justify-center animate-bounce`}>
          <ElementIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom Element Badge */}
      <div className={`absolute bottom-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${style.badgeBg} flex items-center gap-1.5 shadow-md`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span>{name} • {style.label}</span>
      </div>
    </div>
  );
};

export default DragonAvatar;
