
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
    
    // Giả lập nhận diện khuôn mặt liên tục để tăng tính trải nghiệm "Pro"
    const interval = setInterval(() => {
        if (Math.random() > 0.8) {
            setFaces([{ 
                x: 15 + Math.random() * 50, 
                y: 15 + Math.random() * 30, 
                id: Date.now() 
            }]);
        } else if (Math.random() > 0.9) {
            setFaces([]);
        }
    }, 2500);
    return () => clearInterval(interval);
  }, [mode]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setFocusPos({ x: clientX, y: clientY });
    setFaces([]); 
    setTimeout(() => setFocusPos(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-10 touch-none pointer-events-auto" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-150 ${isCapturing ? 'opacity-100' : 'opacity-0'}`} />

      {/* Face Recognition Boxes */}
      {faces.map(face => (
          <div 
            key={face.id}
            className="absolute border border-yellow-400/30 w-40 h-40 transition-all duration-1000 ease-in-out"
            style={{ left: `${face.x}%`, top: `${face.y}%`, borderRadius: '12px' }}
          >
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />
              <div className="absolute -top-6 left-0 text-[8px] font-bold text-yellow-400 uppercase tracking-tighter bg-black/20 px-1">Face Detected</div>
          </div>
      ))}

      {/* Vision Scanning UI */}
      {mode === CameraMode.VISION && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="relative w-80 h-80 border border-white/5 rounded-[3rem] overflow-hidden">
              {/* Scan Line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent w-full h-[2px] bg-yellow-400 animate-[scan_4s_ease-in-out_infinite]" />
              
              {/* Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-[2rem]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-[2rem]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-[2rem]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-[2rem]" />
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Scanner Active</div>
           </div>
        </div>
      )}

      {/* Manual Focus Box */}
      {focusPos && (
        <div className="absolute flex items-center gap-6 animate-[focus_0.2s_ease-out]" style={{ left: focusPos.x - 40, top: focusPos.y - 40 }}>
          <div className="w-20 h-20 border border-yellow-400 relative">
            <div className="absolute top-1/2 left-0 w-2 h-[1px] bg-yellow-400 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-2 h-[1px] bg-yellow-400 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 h-2 w-[1px] bg-yellow-400 -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 h-2 w-[1px] bg-yellow-400 -translate-x-1/2" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
             <div className="text-[10px] font-bold text-yellow-400 bg-black/40 px-1 rounded">{exposure > 0 ? `+${exposure.toFixed(1)}` : exposure.toFixed(1)}</div>
             <div className="relative w-10 h-24 flex items-center justify-center">
                <input 
                  type="range" 
                  min="-2" 
                  max="2" 
                  step="0.1" 
                  value={exposure} 
                  onChange={(e) => onExposureChange(parseFloat(e.target.value))} 
                  className="absolute w-24 h-10 -rotate-90 bg-transparent cursor-pointer appearance-none z-20" 
                />
                <div className="w-[1px] h-full bg-yellow-400/30" />
                <div 
                  className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center transition-all duration-75" 
                  style={{ bottom: `${((exposure + 2) / 4) * 100}%`, marginBottom: '-10px' }}
                >
                   <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3M12 21v-4m0-14l-2 2m2-2l2 2m-2 12l-2-2m2 2l2-2M7 12H3m18 0h-4M3 12l2-2m-2 2l2 2m12-2l2-2m-2 2l2 2" /></svg>
                </div>
             </div>
          </div>
        </div>
      )}

      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-1/3 w-[0.5px] h-full bg-white" />
          <div className="absolute left-2/3 w-[0.5px] h-full bg-white" />
          <div className="absolute top-1/3 h-[0.5px] w-full bg-white" />
          <div className="absolute top-2/3 h-[0.5px] w-full bg-white" />
        </div>
      )}

      <style>{`
        @keyframes focus { 0% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 40px; width: 40px; background: transparent; }
      `}</style>
    </div>
  );
};

export default Overlay;
