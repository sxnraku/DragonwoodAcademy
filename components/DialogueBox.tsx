
import React from 'react';

interface DialogueBoxProps {
  message: string;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ message }) => {
  return (
    <div className="min-h-[120px] bg-black bg-opacity-40 p-4 rounded-lg border border-slate-500 relative">
      <p className="text-lg text-slate-200 leading-relaxed">{message}</p>
    </div>
  );
};

export default DialogueBox;
