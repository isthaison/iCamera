
import React, { useRef, useCallback, useEffect } from 'react';
import CameraEngine from './components/CameraEngine';
import Overlay from './components/Overlay';
import TopBar from './components/TopBar';
import ModeSelector from './components/ModeSelector';
import ZoomControls from './components/ZoomControls';
import SettingsTray from './components/SettingsTray';
import BottomBar from './components/BottomBar';
import GalleryOverlay from './components/GalleryOverlay';
import HorizonLevel from './components/HorizonLevel';
import { useCameraStore } from './store';
// Removed incorrect Type import from './types'
import { CameraMode } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const store = useCameraStore();
  const cameraRef = useRef<any>(null);
  const videoIntervalRef = useRef<any>(null);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const performVisionAnalysis = async (base64Image: string) => {
    store.setIsAnalyzing(true);
    try {
      // Initialize GoogleGenAI with API Key from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Remove data:image/jpeg;base64, prefix to get raw base64 data
      const pureBase64 = base64Image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Analyze this image. Identify any QR codes (extract link), text (OCR), faces (count and expression), and main objects. Return a brief summary in Vietnamese." },
            { inlineData: { mimeType: 'image/jpeg', data: pureBase64 } }
          ]
        },
        config: {
          temperature: 0.4,
        }
      });

      // Extract generated text directly from .text property
      const text = response.text || "Không có kết quả phân tích.";
      store.setVisionResult({ raw: text });
    } catch (error) {
      console.error("Vision Analysis Error:", error);
      store.setVisionResult({ raw: "Không thể phân tích hình ảnh này. Vui lòng thử lại." });
    } finally {
      store.setIsAnalyzing(false);
    }
  };

  const performCapture = async () => {
    store.setIsCapturing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(20);

    const isNight = store.mode === CameraMode.NIGHT;
    const imageUrl = await cameraRef.current?.capture(store.hdr, isNight, store.filter);
    
    if (imageUrl) {
      if (store.mode === CameraMode.VISION) {
        performVisionAnalysis(imageUrl);
      } else {
        store.addImage({
          id: Date.now().toString(),
          url: imageUrl,
          timestamp: Date.now(),
        });
      }
    }
    
    setTimeout(() => store.setIsCapturing(false), 200);
  };

  const handleCaptureClick = useCallback(async () => {
    if (store.isCapturing || store.countdown !== null || store.isAnalyzing) return;

    if (store.mode === CameraMode.VIDEO) {
      if (store.isRecording) {
        store.setIsRecording(false);
        clearInterval(videoIntervalRef.current);
        const videoUrl = await cameraRef.current?.stopVideo();
        if (videoUrl) {
          store.addImage({ id: Date.now().toString(), url: videoUrl, timestamp: Date.now() });
        }
        store.resetVideoSeconds();
      } else {
        store.setIsRecording(true);
        cameraRef.current?.startVideo();
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
        } else if (currentCountdown !== null) {
          store.setCountdown(currentCountdown - 1);
        }
      }, 1000);
    } else {
      performCapture();
    }
  }, [store.isCapturing, store.isRecording, store.mode, store.timer, store.countdown, store.hdr, store.filter, store.isAnalyzing]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none">
      <TopBar />

      {store.isRecording && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] bg-red-600 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-lg border border-white/20">
          <div className="w-2 h-2 bg-white rounded-full" />
          <span className="text-xs font-mono font-bold tracking-tight">{formatTime(store.videoSeconds)}</span>
        </div>
      )}

      <SettingsTray />

      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        <CameraEngine 
          ref={cameraRef}
          facingMode={store.facingMode} 
          zoom={store.zoom} 
          exposure={store.exposure}
          torch={store.torch}
          onZoomChange={store.setZoom}
          aspectRatio={store.aspectRatio}
        />
        
        {store.isCapturing && store.mode === CameraMode.NIGHT && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="w-14 h-14 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin mb-6" />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-yellow-400">Holding Steady...</span>
          </div>
        )}

        {store.isAnalyzing && (
          <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
             <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-2 border-yellow-400/30 rounded-full animate-ping" />
                <div className="absolute inset-0 border-b-2 border-yellow-400 rounded-full animate-spin" />
                <div className="absolute inset-4 flex items-center justify-center">
                   <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                   </svg>
                </div>
             </div>
             <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white animate-pulse">Vision Analyzing...</span>
          </div>
        )}

        {store.countdown !== null && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <span className="text-[12rem] font-black italic text-yellow-400 drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300">
              {store.countdown}
            </span>
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
        <ZoomControls currentZoom={store.zoom} setZoom={store.setZoom} />
      </div>

      {store.visionResult && (
        <div className="absolute bottom-64 left-4 right-4 z-[80] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 animate-in slide-in-from-bottom duration-500 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">Gemini Insight</span>
            </div>
            <button onClick={() => store.setVisionResult(null)} className="p-1 text-white/40 active:scale-90">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-sm leading-relaxed text-white/90 font-medium">
            {store.visionResult.raw}
          </p>
        </div>
      )}

      <div className="h-60 bg-black flex flex-col justify-end pb-10 z-50">
        <ModeSelector currentMode={store.mode} setMode={store.setMode} />
        <BottomBar 
          mode={store.mode}
          isCapturing={store.isRecording || store.isCapturing || store.isAnalyzing}
          lastImage={store.images[0]}
          onGalleryClick={() => store.setShowGallery(true)}
          onShutterClick={handleCaptureClick}
          onFlipClick={store.toggleFacingMode}
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
