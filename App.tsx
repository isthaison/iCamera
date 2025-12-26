
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
    store.setVisionResult(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const pureBase64 = base64Image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { 
              text: `Bạn là trợ lý camera thông minh. Phân tích ảnh này và trả về kết quả ngắn gọn theo các mục:
              1. QR Code: (Link hoặc thông tin nếu có)
              2. Văn bản: (Trích xuất text quan trọng)
              3. Khuôn mặt: (Số lượng, biểu cảm)
              4. Vật thể: (Tên vật thể chính)
              Trả lời bằng tiếng Việt, súc tích trong 3-4 dòng.` 
            },
            { inlineData: { mimeType: 'image/jpeg', data: pureBase64 } }
          ]
        },
        config: {
          temperature: 0.4,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const text = response.text || "Không tìm thấy thông tin cụ thể.";
      store.setVisionResult({ raw: text });
      
      // Haptic feedback khi có kết quả
      if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
      
    } catch (error) {
      console.error("Vision Analysis Error:", error);
      store.setVisionResult({ raw: "Lỗi kết nối AI. Vui lòng kiểm tra lại mạng." });
    } finally {
      store.setIsAnalyzing(false);
    }
  };

  const performCapture = async () => {
    store.setIsCapturing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(15);

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
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[60] bg-red-600 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow-lg border border-white/20">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest">{formatTime(store.videoSeconds)}</span>
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
          onZoomChange={store.setZoom}
          aspectRatio={store.aspectRatio}
        />
        
        {store.isCapturing && store.mode === CameraMode.NIGHT && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin mb-6" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-yellow-400">Giữ yên máy...</span>
          </div>
        )}

        {store.isAnalyzing && (
          <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
             <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-yellow-400 rounded-full animate-spin" />
             </div>
             <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white animate-pulse">Đang nhận diện...</span>
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

      {/* Dynamic Insight Card */}
      {store.visionResult && (
        <div className="absolute bottom-64 left-4 right-4 z-[80] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400/80">Gemini Vision AI</span>
              </div>
              <button 
                onClick={() => store.setVisionResult(null)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full active:scale-90 transition-transform"
              >
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="text-[13px] leading-relaxed text-white/90 font-medium whitespace-pre-line">
              {store.visionResult.raw}
            </div>
            
            <button className="mt-5 w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-colors">
              Sao chép kết quả
            </button>
          </div>
        </div>
      )}

      <div className="h-64 bg-black flex flex-col justify-end pb-12 z-50">
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
