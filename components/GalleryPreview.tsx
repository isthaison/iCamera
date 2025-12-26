
import React from 'react';
import { CapturedImage } from '../types';

interface Props {
  lastImage?: CapturedImage;
  onClick: () => void;
}

const GalleryPreview: React.FC<Props> = ({ lastImage, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
    >
      {lastImage ? (
        <img src={lastImage.url} className="w-full h-full object-cover" alt="Latest" />
      ) : (
        <div className="w-6 h-6 border-2 border-white/20 rounded-md" />
      )}
    </button>
  );
};

export default GalleryPreview;
