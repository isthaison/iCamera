
import React, { useState } from 'react';
import { CapturedImage } from '../types';

interface Props {
  images: CapturedImage[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const GalleryOverlay: React.FC<Props> = ({ images, onClose, onDelete }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMedia = images.find(img => img.id === selectedId);

  const handleShare = async (img: CapturedImage) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const file = new File([blob], `iCamera_${img.id}.${img.url.startsWith('blob:') ? 'webm' : 'jpg'}`, { type: blob.type });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Chia sẻ từ iCamera',
        });
      } else {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = `iCamera_${img.id}`;
        link.click();
      }
    } catch (err) {
      console.error("Sharing failed", err);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col pt-safe animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-black/50 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex flex-col">
          <h2 className="text-xl font-black tracking-tight text-white">Thư viện</h2>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {images.length} mục phương tiện
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="bg-white/10 hover:bg-white/20 text-yellow-400 font-bold px-5 py-2 rounded-full transition-all active:scale-90"
        >
          Xong
        </button>
      </div>
      
      {/* Grid View */}
      <div className="grid grid-cols-3 gap-0.5 overflow-y-auto flex-1 pb-32 no-scrollbar">
        {images.map(img => {
          const isVideo = img.url.startsWith('blob:');
          return (
            <div 
              key={img.id} 
              onClick={() => setSelectedId(img.id)}
              className="relative aspect-square bg-white/[0.03] overflow-hidden active:opacity-70 transition-opacity cursor-pointer group"
            >
              {isVideo ? (
                <video src={img.url} className="w-full h-full object-cover" />
              ) : (
                <img src={img.url} className="w-full h-full object-cover" loading="lazy" />
              )}
              
              {isVideo && (
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1">
                   <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                   <span className="text-[8px] font-black text-white">VIDEO</span>
                </div>
              )}
            </div>
          );
        })}
        
        {images.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-40 gap-4 opacity-30">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em]">Trống</span>
          </div>
        )}
      </div>

      {/* Fullscreen Media Viewer */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col animate-in fade-in zoom-in-110 duration-300">
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 z-20 px-6 py-12 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
            <button onClick={() => setSelectedId(null)} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-xl rounded-full text-white active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black tracking-widest text-white/60 uppercase">Chi tiết</span>
              <span className="text-[11px] font-bold text-white">{formatDate(selectedMedia.timestamp)}</span>
              {selectedMedia.location && (
                <a 
                  href={`https://www.google.com/maps?q=${selectedMedia.location.lat},${selectedMedia.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-yellow-400 font-black tracking-tighter mt-1 flex items-center gap-1"
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  {selectedMedia.location.lat.toFixed(4)}, {selectedMedia.location.lng.toFixed(4)}
                </a>
              )}
            </div>
            <div className="w-10" />
          </div>

          {/* Media Content */}
          <div className="flex-1 flex items-center justify-center p-4">
            {selectedMedia.url.startsWith('blob:') ? (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
              />
            ) : (
              <img 
                src={selectedMedia.url} 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" 
                alt="Selected"
              />
            )}
          </div>

          {/* Bottom Actions */}
          <div className="px-10 pb-16 pt-6 bg-gradient-to-t from-black/80 to-transparent flex justify-around items-center gap-4">
            <button 
              onClick={() => handleShare(selectedMedia)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white group-active:scale-90 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" /></svg>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Chia sẻ</span>
            </button>

            <button 
              onClick={() => {
                onDelete(selectedMedia.id);
                setSelectedId(null);
              }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center group-active:scale-90 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500/60">Xóa bỏ</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default GalleryOverlay;
