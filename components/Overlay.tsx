
import React, { useState, useEffect } from 'react';
import { CameraMode } from '../types';

interface Props {
  isCapturing: boolean;
  mode: CameraMode;
  showGrid: boolean;
}

const Overlay: React.FC<Props> = ({ isCapturing, mode, showGrid }) => {
  const [focusPos, setFocusPos] = useState<{ x: number, y: number } | null>(null);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setFocusPos({ x: clientX, y: clientY });
    
    // Auto-hide focus box
    setTimeout(() => {
      setFocusPos(null);
    }, 2000);
  };

  return (
    <div 
      className="absolute inset-0 z-10 touch-none pointer-events-auto"
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Shutter Blink */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-150 ${isCapturing ? 'opacity-100' : 'opacity-0'}`} />

      {/* Focus Box */}
      {focusPos && (
        <div 
          className="absolute w-20 h-20 border border-yellow-400 animate-[focus_0.3s_ease-out]"
          style={{ 
            left: focusPos.x - 40, 
            top: focusPos.y - 40,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2)'
          }}
        >
          <div className="absolute top-1/2 left-0 w-1 h-[1px] bg-yellow-400 -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-1 h-[1px] bg-yellow-400 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 h-1 w-[1px] bg-yellow-400 -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 h-1 w-[1px] bg-yellow-400 -translate-x-1/2" />
        </div>
      )}

      {/* Grid Lines */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute left-1/3 top-0 bottom-0 w-[0.5px] bg-white/80 shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
          <div className="absolute left-2/3 top-0 bottom-0 w-[0.5px] bg-white/80 shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-1/3 left-0 right-0 h-[0.5px] bg-white/80 shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-2/3 left-0 right-0 h-[0.5px] bg-white/80 shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
        </div>
      )}

      <style>{`
        @keyframes focus {
          0% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Overlay;
