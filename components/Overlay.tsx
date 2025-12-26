
import React, { useState, useEffect } from 'react';
import { CameraMode } from '../types';

interface Props {
  isCapturing: boolean;
  mode: CameraMode;
  showGrid: boolean;
  exposure: number;
  onExposureChange: (v: number) => void;
}

const Overlay: React.FC<Props> = ({ isCapturing, mode, showGrid, exposure, onExposureChange }) => {
  const [focusPos, setFocusPos] = useState<{ x: number, y: number } | null>(null);
  const [faces, setFaces] = useState<{x: number, y: number, id: number}[]>([]);

  useEffect(() => {
    if (mode !== CameraMode.PHOTO && mode !== CameraMode.PORTRAIT && mode !== CameraMode.VISION) {
        setFaces([]);
        return;
    }
    const interval = setInterval(() => {
        if (Math.random() > 0.85) {
            setFaces([{ 
                x: 20 + Math.random() * 60, 
                y: 20 + Math.random() * 40, 
                id: Date.now() 
            }]);
        } else if (Math.random() > 0.95) {
            setFaces([]);
        }
    }, 3000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setFocusPos({ x: clientX, y: clientY });
    setFaces([]); 
    setTimeout(() => setFocusPos(null), 4000);
  };

  return (
    <div className="absolute inset-0 z-10 touch-none pointer-events-auto" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-150 ${isCapturing ? 'opacity-100' : 'opacity-0'}`} />

      {/* Face Boxes Sim */}
      {faces.map(face => (
          <div 
            key={face.id}
            className="absolute border border-yellow-400/40 w-32 h-32 transition-all duration-1000 ease-in-out"
            style={{ left: `${face.x}%`, top: `${face.y}%`, borderRadius: '4px' }}
          >
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-yellow-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-yellow-400" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-yellow-400" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-yellow-400" />
          </div>
      ))}

      {/* Vision Mode UI */}
      {mode === CameraMode.VISION && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="relative w-72 h-72 border border-white/10 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/10 to-transparent w-full h-1 bg-yellow-400 animate-[scan_3s_linear_infinite]" />
              
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-400 rounded-br-xl" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
              </div>
           </div>
        </div>
      )}

      {focusPos && (
        <div className="absolute flex items-center gap-4 animate-[focus_0.3s_ease-out]" style={{ left: focusPos.x - 40, top: focusPos.y - 40 }}>
          <div className="w-20 h-20 border border-yellow-400 relative">
            <div className="absolute top-1/2 left-0 w-1 h-[1px] bg-yellow-400 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-1 h-[1px] bg-yellow-400 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 h-1 w-[1px] bg-yellow-400 -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 h-1 w-[1px] bg-yellow-400 -translate-x-1/2" />
          </div>
          <div className="flex flex-col items-center gap-2 h-24">
             <div className="text-[9px] font-bold text-yellow-400">{exposure.toFixed(1)}</div>
             <div className="relative w-8 h-20 flex items-center justify-center">
                <input type="range" min="-2" max="2" step="0.1" value={exposure} onChange={(e) => onExposureChange(parseFloat(e.target.value))} className="absolute w-20 h-8 -rotate-90 bg-transparent cursor-pointer appearance-none z-20" />
                <div className="w-[0.5px] h-full bg-yellow-400/40" />
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg" style={{ bottom: `${((exposure + 2) / 4) * 100}%`, marginBottom: '-8px' }} />
             </div>
          </div>
        </div>
      )}

      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-1/3 w-[0.5px] h-full bg-white shadow-[0_0_1px_black]" />
          <div className="absolute left-2/3 w-[0.5px] h-full bg-white shadow-[0_0_1px_black]" />
          <div className="absolute top-1/3 h-[0.5px] w-full bg-white shadow-[0_0_1px_black]" />
          <div className="absolute top-2/3 h-[0.5px] w-full bg-white shadow-[0_0_1px_black]" />
        </div>
      )}

      <style>{`
        @keyframes focus { 0% { transform: scale(1.4); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 32px; width: 32px; background: transparent; }
      `}</style>
    </div>
  );
};

export default Overlay;
