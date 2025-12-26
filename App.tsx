
import React, { useRef, useCallback, useEffect } from 'react';
import CameraEngine from './components/CameraEngine';
import Overlay from './components/Overlay';
import TopBar from './components/TopBar';
import ModeSelector from './components/ModeSelector';
import ZoomDial from './components/ZoomDial';
import SettingsTray from './components/SettingsTray';
import BottomBar from './components/BottomBar';
import GalleryOverlay from './components/GalleryOverlay';
import HorizonLevel from './components/HorizonLevel';
import ToastContainer from './components/ToastContainer';
import { useCameraStore } from './store';
import { CameraMode } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const store = useCameraStore();
  const cameraRef = useRef<any>(null);
  const videoIntervalRef = useRef<any>(null);
  const burstIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Theo dõi vị trí
  useEffect(() => {
    if (store.locationEnabled && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          store.setCurrentCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          store.addToast("Không thể lấy vị trí", "error");
        },
        { enableHighAccuracy: true }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      store.setCurrentCoords(null);
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [store.locationEnabled]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const performVisionAnalysis = async (base64Image: string) => {
    store.setIsAnalyzing(true);
    store.setVisionResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const pureBase64 = base64Image.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `Bạn là trợ lý camera AI. Phân tích ảnh và trả về JSON súc tích: { "qr": "...", "text": "...", "faces": "...", "objects": "..." }. Trả lời bằng tiếng Việt.` },
            { inlineData: { mimeType: 'image/jpeg', data: pureBase64 } }
          ]
        },
        config: { responseMimeType: "application/json" }
      });
      const resJson = JSON.parse(response.text || "{}");
      store.setVisionResult({ raw: Object.values(resJson).filter(v => v && v !== '...').join('\n') || "Không tìm thấy thông tin." });
      store.addToast("Phân tích hoàn tất", "info");
    } catch (error) {
      store.setVisionResult({ raw: "Lỗi AI." });
    } finally {
      store.setIsAnalyzing(false);
    }
  };

  const performCapture = async (silent = false) => {
    if (!silent) store.setIsCapturing(true);
    const imageUrl = await cameraRef.current?.capture();
    if (imageUrl) {
      const imageObj = { 
        id: Date.now().toString(), 
        url: imageUrl, 
        timestamp: Date.now(),
        location: store.locationEnabled && store.currentCoords ? { ...store.currentCoords } : undefined
      };

      if (store.mode === CameraMode.VISION) performVisionAnalysis(imageUrl);
      else store.addImage(imageObj);
      
      if (silent) store.addToast("Đã lưu ảnh");
    }
    if (!silent) setTimeout(() => store.setIsCapturing(false), 150);
  };

  const handleBurstStart = () => {
    if (store.mode !== CameraMode.PHOTO || store.isCapturing) return;
    store.setIsBursting(true);
    burstIntervalRef.current = setInterval(() => {
      performCapture(true);
      store.setBurstCount(prev => prev + 1);
    }, 150);
  };

  const handleBurstEnd = () => {
    if (store.isBursting) {
      clearInterval(burstIntervalRef.current);
      store.setIsBursting(false);
      store.addToast(`Đã lưu ${store.burstCount} ảnh burst`);
    }
  };

  const handleCaptureClick = useCallback(async () => {
    if (store.isCapturing || store.countdown !== null || store.isAnalyzing) return;

    const isVideoMode = [CameraMode.VIDEO, CameraMode.SLOW_MOTION, CameraMode.TIMELAPSE].includes(store.mode);

    if (isVideoMode) {
      if (store.isRecording) {
        store.setIsRecording(false);
        clearInterval(videoIntervalRef.current);
        const videoUrl = await cameraRef.current?.stopVideo();
        if (videoUrl) {
          store.addImage({ 
            id: Date.now().toString(), 
            url: videoUrl, 
            timestamp: Date.now(),
            location: store.locationEnabled && store.currentCoords ? { ...store.currentCoords } : undefined
          });
          store.addToast("Video đã được lưu");
        }
        store.resetVideoSeconds();
      } else {
        store.setIsRecording(true);
        cameraRef.current?.startVideo(store.mode);
        videoIntervalRef.current = setInterval(() => store.incrementVideoSeconds(), 1000);
      }
      return;
    }

    if (store.timer > 0) {
      store.setCountdown(store.timer);
      const interval = setInterval(() => {
        const currentCountdown = useCameraStore.getState().countdown;
        if (currentCountdown === 1) {
          clearInterval(interval);
          performCapture();
          store.setCountdown(null);
        } else if (currentCountdown !== null) store.setCountdown(currentCountdown - 1);
      }, 1000);
    } else {
      performCapture();
    }
  }, [store.isCapturing, store.isRecording, store.mode, store.timer, store.countdown, store.hdr, store.filter, store.isAnalyzing, store.locationEnabled, store.currentCoords]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none touch-none">
      <TopBar />
      <ToastContainer />

      {store.isRecording && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow-lg border border-white/20 backdrop-blur-md ${store.mode === CameraMode.TIMELAPSE ? 'bg-orange-500/80' : 'bg-red-600/80'}`}>
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest">{formatTime(store.videoSeconds)}</span>
        </div>
      )}

      {store.isBursting && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 scale-110">
          <span className="text-lg font-black font-mono tracking-tighter text-yellow-400">{store.burstCount}</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/60">Burst</span>
        </div>
      )}

      <SettingsTray />

      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden mt-14">
        <CameraEngine 
          ref={cameraRef}
          facingMode={store.facingMode} 
          zoom={store.zoom} 
          exposure={store.exposure}
          torch={store.torch}
          filter={store.filter}
          onZoomChange={store.setZoom}
          aspectRatio={store.aspectRatio}
        />

        <div className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/5 text-[8px] font-mono text-white/40 pointer-events-none">
          {store.mode === CameraMode.SLOW_MOTION ? '120 FPS' : store.mode === CameraMode.TIMELAPSE ? '5 FPS' : '30 FPS'}<br/>
          {store.aspectRatio} | {store.filter !== 'None' ? store.filter.toUpperCase() : 'NO FILTER'}
          {store.locationEnabled && store.currentCoords && <div className="text-yellow-400 mt-1 uppercase">📍 GPS Active</div>}
        </div>
        
        {store.isCapturing && store.mode === CameraMode.NIGHT && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin mb-6" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-yellow-400">Giữ yên máy...</span>
          </div>
        )}

        <Overlay 
          isCapturing={store.isCapturing} 
          mode={store.mode} 
          showGrid={store.showGrid}
          exposure={store.exposure}
          onExposureChange={store.setExposure}
        />

        {store.showGrid && <HorizonLevel />}
        <ZoomDial currentZoom={store.zoom} setZoom={store.setZoom} />
      </div>

      {store.visionResult && (
        <div className="absolute bottom-72 left-4 right-4 z-[80] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">Gemini Pro Vision</span>
              <button onClick={() => store.setVisionResult(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="text-[13px] leading-relaxed text-white font-medium whitespace-pre-line">{store.visionResult.raw}</div>
          </div>
        </div>
      )}

      <div className={`h-72 bg-black flex flex-col justify-end pb-12 z-50 transition-opacity duration-300 ${store.isRecording ? 'opacity-80' : 'opacity-100'}`}>
        <ModeSelector currentMode={store.mode} setMode={store.setMode} />
        <BottomBar 
          mode={store.mode}
          isCapturing={store.isCapturing || store.isAnalyzing || store.isBursting}
          isRecording={store.isRecording}
          lastImage={store.images[0]}
          onGalleryClick={() => store.setShowGallery(true)}
          onShutterClick={handleCaptureClick}
          onBurstStart={handleBurstStart}
          onBurstEnd={handleBurstEnd}
          onFlipClick={store.toggleFacingMode}
          onVideoSnap={() => performCapture(true)}
        />
      </div>

      {store.showGallery && (
        <GalleryOverlay 
          images={store.images} 
          onClose={() => store.setShowGallery(false)} 
          onDelete={store.deleteImage} 
        />
      )}
    </div>
  );
};

export default App;
