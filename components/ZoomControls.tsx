
import React from 'react';

interface Props {
  currentZoom: number;
  setZoom: (z: number) => void;
}

const ZoomControls: React.FC<Props> = ({ currentZoom, setZoom }) => {
  const levels = [0.5, 1, 2, 5];
  
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-40 border border-white/5">
      {levels.map(level => (
        <button
          key={level}
          onClick={() => setZoom(level)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
            currentZoom === level ? 'bg-white text-black scale-110' : 'text-white/60 hover:text-white'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

export default ZoomControls;
