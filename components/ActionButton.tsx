
import React from 'react';

interface ActionButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick, disabled, icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-lg text-base transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transform hover:-translate-y-0.5"
    >
      {icon}
      {text}
    </button>
  );
};

export default ActionButton;
