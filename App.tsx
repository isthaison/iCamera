
import React, { useState, useRef, useCallback, useEffect } from 'react';
import CameraEngine from './components/CameraEngine';
import Overlay from './components/Overlay';
import TopBar from './components/TopBar';
import ModeSelector from './components/ModeSelector';
import ZoomControls from './components/ZoomControls';
import SettingsTray from './components/SettingsTray';
import BottomBar from './components/BottomBar';
import GalleryOverlay from './components/GalleryOverlay';
import HorizonLevel from './components/HorizonLevel';
import { CapturedImage, CameraMode, AspectRatio, CameraFilter } from './types';

const App: React.FC = () => {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [mode, setMode] = useState<CameraMode>(CameraMode.PHOTO);
  const [zoom, setZoom] = useState(1);
  const [exposure, setExposure] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [showGallery, setShowGallery] = useState(false);
  const [torch, setTorch] = useState(false);
  const [hdr, setHdr] = useState(false);
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:3');
  const [filter, setFilter] = useState<CameraFilter>('None');
  const [proRaw, setProRaw] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const cameraRef = useRef<{ capture: (hdrEnabled: boolean, nightMode?: boolean, filter?: CameraFilter) => Promise<string | null> }>(null);

  const performCapture = async () => {
    setIsCapturing(true);
    if (window.navigator.vibrate) window.navigator.vibrate([20, 30, 20]);

    const isNight = mode === CameraMode.NIGHT;
    const imageUrl = await cameraRef.current?.capture(hdr, isNight, filter);
    
    if (imageUrl) {
      setImages(prev => [{
        id: Date.now().toString(),
        url: imageUrl,
        timestamp: Date.now(),
      }, ...prev]);
    }
    
    setTimeout(() => setIsCapturing(false), 150);
  };

  const handleCaptureClick = useCallback(async () => {
    if (isCapturing || countdown !== null) return;

    if (timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(interval);
            performCapture();
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    } else {
      performCapture();
    }
  }, [isCapturing, timer, countdown, hdr, mode, filter]);

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setTorch(false);
    setExposure(0);
    setZoom(1);
  };

  useEffect(() => {
    if (mode === CameraMode.SQUARE) setAspectRatio('1:1');
  }, [mode]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none">
      <TopBar 
        torch={torch} setTorch={setTorch} 
        hdr={hdr} setHdr={setHdr} 
        timer={timer} setTimer={setTimer} 
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} 
        facingMode={facingMode}
      />

      <SettingsTray 
        isOpen={isSettingsOpen}
        grid={showGrid} setGrid={setShowGrid}
        aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
        currentFilter={filter} setFilter={setFilter}
        proRaw={proRaw} setProRaw={setProRaw}
      />

      {/* Main Viewport */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        <CameraEngine 
          ref={cameraRef}
          facingMode={facingMode} 
          zoom={zoom} 
          exposure={exposure}
          torch={torch}
          onZoomChange={setZoom}
          aspectRatio={aspectRatio}
        />
        
        {countdown !== null && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="text-9xl font-black italic animate-bounce text-yellow-400">{countdown}</span>
          </div>
        )}

        <Overlay 
          isCapturing={isCapturing} 
          mode={mode} 
          showGrid={showGrid}
          exposure={exposure}
          onExposureChange={setExposure}
        />

        {showGrid && <HorizonLevel />}

        <ZoomControls currentZoom={zoom} setZoom={setZoom} />
      </div>

      {/* Controls Container */}
      <div className="h-60 bg-black flex flex-col justify-end pb-10 z-50">
        <ModeSelector currentMode={mode} setMode={setMode} />

        <BottomBar 
          mode={mode}
          isCapturing={isCapturing}
          lastImage={images[0]}
          onGalleryClick={() => setShowGallery(true)}
          onShutterClick={handleCaptureClick}
          onFlipClick={toggleFacingMode}
        />
      </div>

      {showGallery && (
        <GalleryOverlay 
          images={images} 
          onClose={() => setShowGallery(false)} 
          onDelete={deleteImage} 
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default App;
