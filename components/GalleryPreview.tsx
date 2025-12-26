
import React from 'react';
import { CapturedImage } from '../types';

interface Props {
  lastImage?: CapturedImage;
  onClick: () => void;
}

const GalleryPreview: React.FC<Props> = ({ lastImage, onClick }) => {
  const isVideo = lastImage?.url.startsWith('blob:');

  return (
    <button 
      onClick={onClick}
      className="relative w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center active:scale-90 transition-all shadow-lg group"
    >
      {lastImage ? (
        <>
          {isVideo ? (
            <video src={lastImage.url} className="w-full h-full object-cover" />
          ) : (
            <img src={lastImage.url} className="w-full h-full object-cover" alt="Latest" />
          )}
          <div className="absolute inset-0 bg-black/10 group-active:bg-black/40 transition-colors" />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-6 h-6 border-[1.5px] border-white/20 rounded-lg flex items-center justify-center">
           <div className="w-2 h-2 bg-white/10 rounded-full" />
        </div>
      )}
    </button>
  );
};

export default GalleryPreview;
