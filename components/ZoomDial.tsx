
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
  currentZoom: number;
  setZoom: (z: number) => void;
}

const ZoomDial: React.FC<Props> = ({ currentZoom, setZoom }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [active, setActive] = useState(false);
  const hideTimeout = useRef<any>(null);

  const presets = [0.5, 1, 2, 3, 5];
  const minZoom = 0.5;
  const maxZoom = 10;
  
  const zoomToProgress = useCallback((z: number) => (z - minZoom) / (maxZoom - minZoom), []);
  const progressToZoom = useCallback((p: number) => minZoom + p * (maxZoom - minZoom), []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDragging.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    
    setActive(true);
    const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const newZoom = progressToZoom(progress);
    setZoom(parseFloat(newZoom.toFixed(1)));

    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setActive(false), 1500);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    setActive(true);
    startX.current = e.clientX;
    scrollStart.current = containerRef.current.scrollLeft;
    containerRef.current.setPointerCapture(e.pointerId);
    clearTimeout(hideTimeout.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const delta = (startX.current - e.clientX) * 1.2; // Độ nhạy dial
    containerRef.current.scrollLeft = scrollStart.current + delta;
    
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const newZoom = progressToZoom(progress);
    setZoom(parseFloat(newZoom.toFixed(1)));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    hideTimeout.current = setTimeout(() => setActive(false), 1500);
  };

  // Đồng bộ hóa khi nhấn các nút preset
  useEffect(() => {
    if (!active && !isDragging.current && containerRef.current) {
      const { scrollWidth, clientWidth } = containerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const target = zoomToProgress(currentZoom) * maxScroll;
      containerRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [currentZoom, active, zoomToProgress]);

  return (
    <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 z-40 select-none touch-none">
      
      {/* Zoom Presets - iOS Style Pill Buttons */}
      <div className="flex items-center gap-2 p-1 bg-black/30 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl scale-110">
        {presets.map(p => {
          const isSelected = Math.abs(currentZoom - p) < 0.1;
          return (
            <button
              key={p}
              onClick={() => {
                setZoom(p);
                setActive(true);
                setTimeout(() => setActive(false), 1500);
              }}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 active:scale-90 ${
                isSelected 
                  ? 'bg-white text-black font-black scale-100' 
                  : 'text-white/80 font-bold hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] tracking-tighter">
                {p === 0.5 ? '.5' : p}
              </span>
            </button>
          );
        })}
      </div>

      {/* Numerical Display - Appearing above the dial */}
      <div className={`transition-all duration-500 transform ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div className="bg-yellow-400 px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)]">
           <span className="text-[10px] font-black text-black tracking-widest uppercase">
            {currentZoom.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Enhanced Ruler Dial */}
      <div className={`relative w-full h-12 flex items-center justify-center transition-all duration-500 ${active ? 'opacity-100' : 'opacity-20 grayscale pointer-events-none'}`}>
        {/* Center Needle Overlay */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[1.5px] h-8 bg-yellow-400 z-20 pointer-events-none">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-lg" />
        </div>

        {/* The Scrollable Ruler */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex items-end gap-[10px] overflow-x-auto no-scrollbar px-[50%] h-full pb-2 cursor-grab active:cursor-grabbing scroll-smooth mask-fade-edges"
          style={{ touchAction: 'none' }}
        >
          {Array.from({ length: 96 }).map((_, i) => {
            const isMajor = i % 10 === 0;
            const isHalf = i % 5 === 0 && !isMajor;
            
            return (
              <div key={i} className="flex flex-col items-center flex-shrink-0">
                <div 
                  className={`w-[1px] rounded-full transition-all duration-300 ${
                    isMajor 
                      ? 'h-6 bg-white/70 w-[1.5px]' 
                      : isHalf 
                        ? 'h-4 bg-white/40' 
                        : 'h-2.5 bg-white/20'
                  }`} 
                />
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Hiệu ứng mờ dần ở hai cạnh để tạo cảm giác vòng cung 3D */
        .mask-fade-edges {
          mask-image: linear-gradient(to right, 
            transparent 0%, 
            black 30%, 
            black 70%, 
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(to right, 
            transparent 0%, 
            black 30%, 
            black 70%, 
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
};

export default ZoomDial;
