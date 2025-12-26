
import React from 'react';
import { CapturedImage } from '../types';

interface Props {
  images: CapturedImage[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const GalleryOverlay: React.FC<Props> = ({ images, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black p-4 flex flex-col pt-safe animate-in slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-bold tracking-tight">Photos & Videos</h2>
        <button onClick={onClose} className="text-yellow-400 font-semibold px-2">Done</button>
      </div>
      
      <div className="grid grid-cols-3 gap-1 overflow-y-auto flex-1 pb-10">
        {images.map(img => {
          const isVideo = img.url.startsWith('blob:');
          return (
            <div key={img.id} className="relative group aspect-square bg-white/5 rounded-sm overflow-hidden">
              {isVideo ? (
                <video src={img.url} className="w-full h-full object-cover" />
              ) : (
                <img src={img.url} className="w-full h-full object-cover" loading="lazy" />
              )}
              {isVideo && (
                <div className="absolute bottom-1 right-1 bg-black/40 px-1 rounded text-[8px] font-bold">VIDEO</div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-active:opacity-100 transition-opacity" />
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                className="absolute top-1 right-1 bg-black/60 backdrop-blur-md p-1.5 rounded-full"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
        {images.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 opacity-20">
            <span className="text-sm font-bold uppercase tracking-widest">No Media</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryOverlay;
