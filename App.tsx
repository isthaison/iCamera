
import React, { useState, useRef, useCallback, useEffect } from 'react';
import CameraEngine from './components/CameraEngine';
import Overlay from './components/Overlay';
import GalleryPreview from './components/GalleryPreview';
import { CapturedImage, CameraMode } from './types';

const App: React.FC = () => {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [mode, setMode] = useState<CameraMode>(CameraMode.PHOTO);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [showGallery, setShowGallery] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hdr, setHdr] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '16:9' | '1:1'>('4:3');
  const [showGrid, setShowGrid] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const cameraRef = useRef<{ capture: (hdrEnabled: boolean) => Promise<string | null> }>(null);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    const imageUrl = await cameraRef.current?.capture(hdr);
    if (imageUrl) {
      const newImage: CapturedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        timestamp: Date.now(),
      };
      setImages(prev => [newImage, ...prev]);
    }
    
    setTimeout(() => setIsCapturing(false), 150);
  }, [isCapturing, hdr]);

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setFlash(false);
    setExposure(0);
  };

  // Sync aspect ratio with mode for Square mode
  useEffect(() => {
    if (mode === CameraMode.SQUARE) {
      setAspectRatio('1:1');
    } else if (aspectRatio === '1:1' && mode === CameraMode.PHOTO) {
      setAspectRatio('4:3');
    }
  }, [mode]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${isSettingsOpen ? 'bg-black/90 h-auto pb-6' : 'bg-gradient-to-b from-black/80 to-transparent h-20'} pt-safe`}>
        <div className="flex items-center justify-between px-6 h-14">
          <button 
            onClick={() => setFlash(!flash)} 
            className={`p-2 transition-all active:scale-90 ${flash ? 'text-yellow-400' : 'text-white'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </button>

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center justify-center p-2 rounded-full bg-white/10 transition-transform ${isSettingsOpen ? 'rotate-180 bg-white/20' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button 
            onClick={() => setHdr(!hdr)} 
            className={`text-[10px] font-black uppercase transition-all ${hdr ? 'text-yellow-400' : 'text-white'}`}
          >
            HDR
          </button>
        </div>

        {/* Settings Tray */}
        <div className={`overflow-hidden transition-all duration-300 ${isSettingsOpen ? 'max-h-40 opacity-100 px-6 pt-2' : 'max-h-0 opacity-0'}`}>
          <div className="flex justify-around items-center gap-2">
            {/* Grid Toggle */}
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showGrid ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M12 4v16" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase text-white/60">Grid</span>
            </button>

            {/* Aspect Ratio Selector */}
            <div className="flex gap-2 bg-white/10 p-1 rounded-full">
              {(['4:3', '16:9', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    setAspectRatio(ratio);
                    if (ratio === '1:1') setMode(CameraMode.SQUARE);
                    else if (mode === CameraMode.SQUARE) setMode(CameraMode.PHOTO);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${aspectRatio === ratio ? 'bg-white text-black' : 'text-white/60'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Torch Toggle in Menu (Sync with top) */}
            <button 
              onClick={() => setFlash(!flash)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${flash ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase text-white/60">Flash</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Preview Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
        <CameraEngine 
          ref={cameraRef}
          facingMode={facingMode} 
          zoom={zoom} 
          exposure={exposure}
          torch={flash}
          onZoomChange={setZoom}
          aspectRatio={aspectRatio}
        />
        
        {/* Exposure Slider */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40">
           <div className="text-[10px] font-bold text-yellow-400 rotate-90 w-8 text-center">{exposure > 0 ? `+${exposure.toFixed(1)}` : exposure.toFixed(1)}</div>
           <div className="relative h-40 w-1 bg-white/20 rounded-full flex items-center justify-center">
             <input 
               type="range"
               min="-2"
               max="2"
               step="0.1"
               value={exposure}
               onChange={(e) => setExposure(parseFloat(e.target.value))}
               className="absolute h-40 w-12 opacity-0 cursor-pointer -rotate-180"
               style={{ writingMode: 'bt-lr' as any }}
             />
             <div 
               className="absolute w-6 h-6 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center pointer-events-none transition-all shadow-lg shadow-black/50"
               style={{ bottom: `${((exposure + 2) / 4) * 100}%`, transform: 'translateY(50%)' }}
             >
               <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 7V3m0 18v-4m0-10a5 5 0 100 10 5 5 0 000-10zm8.66 1.34l-2.83 2.83m-9.66 4l-2.83 2.83M5.34 5.34l2.83 2.83m9.66 4l2.83 2.83M21 12h-4M7 12H3" />
               </svg>
             </div>
           </div>
        </div>

        {/* Visual Overlays */}
        <Overlay 
          isCapturing={isCapturing} 
          mode={mode} 
          showGrid={showGrid}
        />
      </div>

      {/* Bottom Controls */}
      <div className="h-52 bg-black flex flex-col justify-end pb-10 z-50">
        <div className="flex justify-center gap-8 mb-8 text-[11px] font-bold tracking-widest uppercase">
          <button 
            onClick={() => setMode(CameraMode.SQUARE)}
            className={`transition-colors duration-200 ${mode === CameraMode.SQUARE ? 'text-yellow-400' : 'text-white/40'}`}
          >
            Square
          </button>
          <button 
            onClick={() => setMode(CameraMode.PHOTO)}
            className={`transition-colors duration-200 ${mode === CameraMode.PHOTO ? 'text-yellow-400' : 'text-white/40'}`}
          >
            Photo
          </button>
          <button 
            onClick={() => setMode(CameraMode.VIDEO)}
            className={`transition-colors duration-200 ${mode === CameraMode.VIDEO ? 'text-yellow-400' : 'text-white/40'}`}
          >
            Video
          </button>
        </div>

        <div className="flex items-center justify-around px-8">
          <GalleryPreview 
            lastImage={images[0]} 
            onClick={() => setShowGallery(true)} 
          />
          
          <button 
            onClick={handleCapture}
            className={`relative w-20 h-20 rounded-full border-[3px] border-white flex items-center justify-center transition-all active:scale-90 ${isCapturing ? 'scale-95' : ''}`}
          >
            <div className={`w-[66px] h-[66px] rounded-full transition-all duration-100 ${isCapturing ? 'bg-white/40 scale-90' : 'bg-white'}`} />
          </button>

          <button 
            onClick={toggleFacingMode}
            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center active:scale-90 active:bg-white/20 transition-all"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black p-4 flex flex-col pt-safe animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl font-bold tracking-tight">Library</h2>
            <button onClick={() => setShowGallery(false)} className="text-yellow-400 font-semibold px-2">Done</button>
          </div>
          <div className="grid grid-cols-3 gap-1 overflow-y-auto flex-1 pb-10">
            {images.map(img => (
              <img key={img.id} src={img.url} className="w-full aspect-square object-cover" />
            ))}
            {images.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center h-64 text-white/30 italic">
                No photos yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
