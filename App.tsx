
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
import { useCameraSettingsStore } from './stores/cameraSettingsStore';
import { useCaptureStore } from './stores/captureStore';
import { useGalleryStore } from './stores/galleryStore';
import { useUIStore } from './stores/uiStore';
import { useLocationStore } from './stores/locationStore';
import { useAIStore } from './stores/aiStore';
import { CameraMode } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const cameraSettings = useCameraSettingsStore();
  const capture = useCaptureStore();
  const gallery = useGalleryStore();
  const ui = useUIStore();
  const location = useLocationStore();
  const ai = useAIStore();
  const cameraRef = useRef<any>(null);
  const videoIntervalRef = useRef<any>(null);
  const burstIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Theo dõi vị trí
  useEffect(() => {
    if (location.locationEnabled && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          location.setCurrentCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          ui.addToast("Không thể lấy vị trí", "error");
        },
        { enableHighAccuracy: true }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      location.setCurrentCoords(null);
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [location.locationEnabled]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const performVisionAnalysis = async (base64Image: string) => {
    capture.setIsAnalyzing(true);
    capture.setVisionResult(null);
    try {
      if (!ai.geminiApiKey) {
        capture.setVisionResult({ raw: "Vui lòng nhập API key Gemini trong cài đặt." });
        return;
      }
      const genAI = new GoogleGenAI({ apiKey: ai.geminiApiKey });
      const pureBase64 = base64Image.split(',')[1];
      const response = await genAI.models.generateContent({
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
      capture.setVisionResult({ raw: Object.values(resJson).filter(v => v && v !== '...').join('\n') || "Không tìm thấy thông tin." });
      ui.addToast("Phân tích hoàn tất", "info");
    } catch (error) {
      capture.setVisionResult({ raw: "Lỗi AI." });
    } finally {
      capture.setIsAnalyzing(false);
    }
  };

  const performCapture = async (silent = false) => {
    if (!silent) capture.setIsCapturing(true);
    const imageUrl = await cameraRef.current?.capture();
    if (imageUrl) {
      const imageObj = {
        id: Date.now().toString(),
        url: imageUrl,
        timestamp: Date.now(),
        location: location.locationEnabled && location.currentCoords ? { ...location.currentCoords } : undefined
      };

      if (cameraSettings.mode === CameraMode.VISION) performVisionAnalysis(imageUrl);
      else gallery.addImage(imageObj);

      if (silent) ui.addToast("Đã lưu ảnh");
    }
    if (!silent) setTimeout(() => capture.setIsCapturing(false), 150);
  };

  const handleBurstStart = () => {
    if (cameraSettings.mode !== CameraMode.PHOTO || capture.isCapturing) return;
    capture.setIsBursting(true);
    burstIntervalRef.current = setInterval(() => {
      performCapture(true);
      capture.setBurstCount(prev => prev + 1);
    }, 150);
  };

  const handleBurstEnd = () => {
    if (capture.isBursting) {
      clearInterval(burstIntervalRef.current);
      capture.setIsBursting(false);
      ui.addToast(`Đã lưu ${capture.burstCount} ảnh burst`);
    }
  };

  const handleCaptureClick = useCallback(async () => {
    if (capture.isCapturing || cameraSettings.countdown !== null || capture.isAnalyzing) return;

    const isVideoMode = [CameraMode.VIDEO, CameraMode.SLOW_MOTION, CameraMode.TIMELAPSE].includes(cameraSettings.mode);

    if (isVideoMode) {
      if (capture.isRecording) {
        capture.setIsRecording(false);
        clearInterval(videoIntervalRef.current);
        const videoUrl = await cameraRef.current?.stopVideo();
        if (videoUrl) {
          gallery.addImage({
            id: Date.now().toString(),
            url: videoUrl,
            timestamp: Date.now(),
            location: location.locationEnabled && location.currentCoords ? { ...location.currentCoords } : undefined
          });
          ui.addToast("Video đã được lưu");
        } else {
          ui.addToast("Không thể lưu video", "error");
        }
        capture.resetVideoSeconds();
      } else {
        capture.setIsRecording(true);
        cameraRef.current?.startVideo(cameraSettings.mode);
        videoIntervalRef.current = setInterval(() => capture.incrementVideoSeconds(), 1000);
      }
      return;
    }

    if (cameraSettings.timer > 0) {
      cameraSettings.setCountdown(cameraSettings.timer);
      const interval = setInterval(() => {
        const currentCountdown = cameraSettings.countdown;
        if (currentCountdown === 1) {
          clearInterval(interval);
          performCapture();
          cameraSettings.setCountdown(null);
        } else if (currentCountdown !== null) cameraSettings.setCountdown(currentCountdown - 1);
      }, 1000);
    } else {
      performCapture();
    }
  }, [capture.isCapturing, capture.isRecording, cameraSettings.mode, cameraSettings.timer, cameraSettings.countdown, cameraSettings.hdr, cameraSettings.filter, capture.isAnalyzing, location.locationEnabled, location.currentCoords]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden select-none touch-none">
      <TopBar />
      <ToastContainer />

      {capture.isRecording && (
        <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse shadow-lg border border-white/20 backdrop-blur-md ${cameraSettings.mode === CameraMode.TIMELAPSE ? 'bg-orange-500/80' : 'bg-red-600/80'}`}>
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest">{formatTime(capture.videoSeconds)}</span>
        </div>
      )}

      {capture.isBursting && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 scale-110">
          <span className="text-lg font-black font-mono tracking-tighter text-yellow-400">{capture.burstCount}</span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-white/60">Burst</span>
        </div>
      )}

      <SettingsTray />

      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden mt-14">
        <CameraEngine
          ref={cameraRef}
          facingMode={cameraSettings.facingMode}
          zoom={cameraSettings.zoom}
          exposure={cameraSettings.exposure}
          torch={cameraSettings.torch}
          filter={cameraSettings.filter}
          onZoomChange={cameraSettings.setZoom}
          aspectRatio={cameraSettings.aspectRatio}
        />

        <div className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/5 text-[8px] font-mono text-white/40 pointer-events-none">
          {cameraSettings.mode === CameraMode.SLOW_MOTION ? '120 FPS' : cameraSettings.mode === CameraMode.TIMELAPSE ? '5 FPS' : '30 FPS'}<br/>
          {cameraSettings.aspectRatio} | {cameraSettings.filter !== 'None' ? cameraSettings.filter.toUpperCase() : 'NO FILTER'}
          {location.locationEnabled && location.currentCoords && <div className="text-yellow-400 mt-1 uppercase">📍 GPS Active</div>}
        </div>

        {capture.isCapturing && cameraSettings.mode === CameraMode.NIGHT && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin mb-6" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-yellow-400">Giữ yên máy...</span>
          </div>
        )}

        <Overlay
          isCapturing={capture.isCapturing}
          mode={cameraSettings.mode}
          showGrid={cameraSettings.showGrid}
          exposure={cameraSettings.exposure}
          onExposureChange={cameraSettings.setExposure}
        />

        {cameraSettings.showGrid && <HorizonLevel />}
        <ZoomDial currentZoom={cameraSettings.zoom} setZoom={cameraSettings.setZoom} />
      </div>

      {capture.visionResult && (
        <div className="absolute bottom-72 left-4 right-4 z-[80] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">Gemini Pro Vision</span>
              <button onClick={() => capture.setVisionResult(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="text-[13px] leading-relaxed text-white font-medium whitespace-pre-line">{capture.visionResult.raw}</div>
          </div>
        </div>
      )}

      <div className={`h-72 bg-black flex flex-col justify-end pb-12 z-50 transition-opacity duration-300 ${capture.isRecording ? 'opacity-80' : 'opacity-100'}`}>
        <ModeSelector currentMode={cameraSettings.mode} setMode={cameraSettings.setMode} />
        <BottomBar
          mode={cameraSettings.mode}
          isCapturing={capture.isCapturing || capture.isAnalyzing || capture.isBursting}
          isRecording={capture.isRecording}
          lastImage={gallery.images[0]}
          onGalleryClick={() => gallery.setShowGallery(true)}
          onShutterClick={handleCaptureClick}
          onBurstStart={handleBurstStart}
          onBurstEnd={handleBurstEnd}
          onFlipClick={cameraSettings.toggleFacingMode}
          onVideoSnap={() => performCapture(true)}
        />
      </div>

      {gallery.showGallery && (
        <GalleryOverlay
          images={gallery.images}
          onClose={() => gallery.setShowGallery(false)}
          onDelete={gallery.deleteImage}
        />
      )}
    </div>
  );
};

export default App;
