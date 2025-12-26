
import React from 'react';
import { CameraMode } from '../types';

interface Props {
  mode: CameraMode;
  isCapturing: boolean;
  onClick: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

const ShutterButton: React.FC<Props> = ({ mode, isCapturing, onClick }) => {
  const getInnerClass = () => {
    if (isCapturing) return 'scale-90 bg-white/50';
    if (mode === CameraMode.VIDEO) return 'bg-red-500 rounded-sm scale-75';
    if (mode === CameraMode.NIGHT) return 'bg-indigo-400';
    return 'bg-white';
  };

  return (
    <button 
      onClick={onClick}
      className="relative w-20 h-20 rounded-full border-[3px] border-white flex items-center justify-center transition-all active:scale-90"
    >
      <div className={`w-[66px] h-[66px] rounded-full transition-all duration-300 ease-out ${getInnerClass()}`} />
      
      {mode === CameraMode.VIDEO && !isCapturing && (
        <div className="absolute inset-0 rounded-full border border-red-500/30 scale-110 animate-pulse" />
      )}
    </button>
  );
};

export default ShutterButton;
