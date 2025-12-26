
import React, { useState, useEffect } from 'react';
import { CameraMode } from '../types';
import Slider from './Slider';

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
    // Không focus nếu chạm vào vùng điều khiển dưới cùng
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    if (clientY > window.innerHeight - 280) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
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
          </div>
      ))}

      {/* Vision Scanning UI */}
      {mode === CameraMode.VISION && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="relative w-72 h-72 border border-white/5 rounded-[3rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent w-full h-[2px] bg-yellow-400 animate-[scan_4s_ease-in-out_infinite]" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-[2rem]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-[2rem]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-[2rem]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-[2rem]" />
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
            <Slider
              min={-2}
              max={2}
              step={0.1}
              value={exposure}
              onChange={onExposureChange}
              orientation="vertical"
              showValue={true}
              size="md"
            />
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
      `}</style>
    </div>
  );
};

export default Overlay;
