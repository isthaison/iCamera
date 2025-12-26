
import React from 'react';
import { CameraMode } from '../types';

interface Props {
  mode: CameraMode;
  isCapturing: boolean;
  onClick: () => void;
}

const ShutterButton: React.FC<Props> = ({ mode, isCapturing, onClick }) => {
  const isVideo = mode === CameraMode.VIDEO;
  const isVision = mode === CameraMode.VISION;

  return (
    <button 
      onClick={onClick}
      className="relative w-20 h-20 rounded-full border-[3px] border-white flex items-center justify-center transition-all active:scale-95"
    >
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isVideo 
            ? isCapturing 
              ? 'w-8 h-8 rounded-sm bg-red-600' 
              : 'w-16 h-16 rounded-full bg-red-600'
            : isVision
              ? isCapturing
                ? 'w-14 h-14 rounded-full bg-yellow-400/40 scale-90'
                : 'w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center'
              : isCapturing
                ? 'w-14 h-14 rounded-full bg-white/40 scale-90'
                : mode === CameraMode.NIGHT 
                  ? 'w-16 h-16 rounded-full bg-indigo-500' 
                  : 'w-16 h-16 rounded-full bg-white'
        }`} 
      >
        {isVision && !isCapturing && (
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </div>
      
      {isVideo && !isCapturing && (
        <div className="absolute inset-0 rounded-full border border-red-600/30 scale-110 animate-pulse" />
      )}

      {isVision && !isCapturing && (
        <div className="absolute inset-0 rounded-full border border-yellow-400/40 scale-110 animate-ping duration-[2000ms]" />
      )}
    </button>
  );
};

export default ShutterButton;
