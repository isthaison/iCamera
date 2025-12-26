
import React from 'react';
import GalleryPreview from './GalleryPreview';
import ShutterButton from './ShutterButton';
import { CameraMode, CapturedImage } from '../types';

interface Props {
  mode: CameraMode;
  isCapturing: boolean;
  lastImage?: CapturedImage;
  onGalleryClick: () => void;
  onShutterClick: () => void;
  onFlipClick: () => void;
}

const BottomBar: React.FC<Props> = ({ 
  mode, isCapturing, lastImage, onGalleryClick, onShutterClick, onFlipClick 
}) => {
  return (
    <div className="flex items-center justify-around px-8">
      <GalleryPreview lastImage={lastImage} onClick={onGalleryClick} />
      
      <ShutterButton 
        mode={mode} 
        isCapturing={isCapturing} 
        onClick={onShutterClick} 
      />

      <button 
        onClick={onFlipClick} 
        className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center active:scale-90 active:bg-white/20 transition-all"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
};

export default BottomBar;
