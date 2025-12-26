
import React, { useRef, useState } from 'react';
import { CameraMode } from '../types';

interface Props {
  mode: CameraMode;
  isCapturing: boolean;
  onClick: () => void;
  onBurstStart: () => void;
  onBurstEnd: () => void;
}

const ShutterButton: React.FC<Props> = ({ mode, isCapturing, onClick, onBurstStart, onBurstEnd }) => {
  const isVideo = mode === CameraMode.VIDEO || mode === CameraMode.SLOW_MOTION || mode === CameraMode.TIMELAPSE;
  const isVision = mode === CameraMode.VISION;
  const isTimeLapse = mode === CameraMode.TIMELAPSE;
  const timerRef = useRef<any>(null);
  const [isHolding, setIsHolding] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    timerRef.current = setTimeout(() => {
      setIsHolding(true);
      if (mode === CameraMode.PHOTO) {
        onBurstStart();
      }
    }, 400);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isHolding) {
      if (mode === CameraMode.PHOTO) onBurstEnd();
      setIsHolding(false);
    } else {
      onClick();
    }
  };

  return (
    <div className="relative group">
      <button 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center transition-all active:scale-95 touch-none"
      >
        <div 
          className={`transition-all duration-300 ease-out ${
            isVideo 
              ? isCapturing 
                ? 'w-8 h-8 rounded-lg ' + (isTimeLapse ? 'bg-orange-500' : 'bg-red-600')
                : 'w-16 h-16 rounded-full ' + (isTimeLapse ? 'bg-orange-500' : 'bg-red-600')
              : isVision
                ? isCapturing
                  ? 'w-14 h-14 rounded-full bg-yellow-400/40 scale-90'
                  : 'w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600'
                : isCapturing || isHolding
                  ? 'w-14 h-14 rounded-full bg-white/50 scale-90'
                  : mode === CameraMode.NIGHT 
                    ? 'w-16 h-16 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                    : 'w-16 h-16 rounded-full bg-white'
          }`} 
        />
        
        {isHolding && mode === CameraMode.PHOTO && (
           <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping opacity-50" />
        )}
      </button>
      
      {isVideo && !isCapturing && (
        <div className={`absolute inset-0 rounded-full border scale-125 animate-pulse -z-10 ${isTimeLapse ? 'border-orange-500/30' : 'border-red-600/30'}`} />
      )}
    </div>
  );
};

export default ShutterButton;
