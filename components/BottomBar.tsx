
import React from 'react';
import GalleryPreview from './GalleryPreview';
import ShutterButton from './ShutterButton';
import { CameraMode, CapturedImage } from '../types';

interface Props {
  mode: CameraMode;
  isCapturing: boolean;
  isRecording: boolean;
  lastImage?: CapturedImage;
  onGalleryClick: () => void;
  onShutterClick: () => void;
  onBurstStart: () => void;
  onBurstEnd: () => void;
  onFlipClick: () => void;
  onVideoSnap?: () => void; // Chụp ảnh khi đang quay video
}

const BottomBar: React.FC<Props> = ({ 
  mode, isCapturing, isRecording, lastImage, onGalleryClick, onShutterClick, onBurstStart, onBurstEnd, onFlipClick, onVideoSnap 
}) => {
  return (
    <div className="flex items-center justify-around px-8 relative">
      <GalleryPreview lastImage={lastImage} onClick={onGalleryClick} />
      
      <div className="relative flex items-center justify-center">
        <ShutterButton 
          mode={mode} 
          isCapturing={isRecording || isCapturing} 
          onClick={onShutterClick} 
          onBurstStart={onBurstStart}
          onBurstEnd={onBurstEnd}
        />
        
        {/* Nút chụp ảnh khi đang quay video - iPhone Style */}
        {isRecording && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onVideoSnap?.();
            }}
            className="absolute -right-20 w-12 h-12 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-xl animate-in fade-in slide-in-from-left-4"
          >
            <div className="w-10 h-10 border-2 border-black/5 rounded-full" />
          </button>
        )}
      </div>

      <button 
        onClick={onFlipClick} 
        className={`w-12 h-12 bg-white/10 rounded-full flex items-center justify-center active:scale-90 active:bg-white/20 transition-all border border-white/5 ${isRecording ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default BottomBar;
