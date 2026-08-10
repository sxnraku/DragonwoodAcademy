import React from 'react';

export const FantasyBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-x-hidden">
      {/* Dynamic Animated Gradient Layers */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(30, 27, 75, 0.75) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(88, 28, 135, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9) 0%, rgba(3, 7, 18, 0.98) 100%)
          `
        }}
      />

      {/* Medieval Castle/Magical Runes Subtle Grid Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25 15v30L30 60 5 45V15z' fill-opacity='0.4' fill='%23fbbf24' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glowing Ember Particles Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-2 h-2 rounded-full bg-amber-400/40 blur-[1px] animate-pulse" />
        <div className="absolute top-3/4 left-1/3 w-3 h-3 rounded-full bg-orange-500/30 blur-[2px] animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-yellow-300/40 blur-[1px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-2/3 right-1/5 w-3 h-3 rounded-full bg-red-400/30 blur-[2px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-purple-500/20 blur-[4px] animate-pulse [animation-delay:0.5s]" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-gray-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

export default FantasyBackground;
