
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { CameraFilter, AspectRatio, CameraMode } from '../types';
import { useCaptureStore } from '../stores/captureStore';

interface Props {
  facingMode: 'user' | 'environment';
  zoom: number;
  exposure: number;
  shutterSpeed: number;
  iso: number;
  torch: boolean;
  filter: CameraFilter;
  onZoomChange: (zoom: number) => void;
  aspectRatio: AspectRatio;
}

const CameraEngine = forwardRef((props: Props, ref) => {
  const { facingMode, zoom, exposure, shutterSpeed, iso, torch, aspectRatio, filter } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const animationFrameRef = useRef<number>(0);

  const { startVideo: storeStartVideo, stopVideo: storeStopVideo, setRecordingRefs } = useCaptureStore();

  const getFilterString = (f: CameraFilter) => {
    switch (f) {
      case 'Vivid': return 'saturate(1.6) contrast(1.1) brightness(1.05)';
      case 'Noir': return 'grayscale(1) contrast(1.4) brightness(0.9)';
      case 'Silvertone': return 'grayscale(0.6) sepia(0.3) contrast(1.1)';
      case 'Dramatic': return 'contrast(1.6) brightness(0.8) saturate(0.9)';
      default: return 'none';
    }
  };

  const renderLoop = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !isReady) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = c.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx || v.readyState < 2 || v.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const w = v.videoWidth;
    const h = v.videoHeight;
    let targetW = w, targetH = h, sX = 0, sY = 0;

    // Tính toán khung hình dựa trên Aspect Ratio
    if (aspectRatio === '1:1') {
      const size = Math.min(w, h);
      targetW = targetH = size; sX = (w - size) / 2; sY = (h - size) / 2;
    } else if (aspectRatio === '16:9') {
      targetW = w; targetH = (w * 16) / 9;
      if (targetH > h) { targetH = h; targetW = (h * 9) / 16; }
      sX = (w - targetW) / 2; sY = (h - targetH) / 2;
    } else {
      targetW = w; targetH = (w * 4) / 3;
      if (targetH > h) { targetH = h; targetW = (h * 3) / 4; }
      sX = (w - targetW) / 2; sY = (h - targetH) / 2;
    }

    // Cập nhật kích thước canvas nếu cần
    if (c.width !== targetW || c.height !== targetH) {
      c.width = targetW;
      c.height = targetH;
    }

    // ÁP DỤNG BỘ LỌC (FILTER) TRỰC TIẾP LÊN STREAM
    ctx.filter = getFilterString(filter);
    
    // Vẽ frame từ video lên canvas
    ctx.drawImage(v, sX, sY, targetW, targetH, 0, 0, targetW, targetH);

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [aspectRatio, isReady, filter]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [renderLoop]);

  const startCamera = async () => {
    setIsReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode }, 
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setIsReady(true);
            setError(null);
            applyAdvancedConstraints();
          } catch (e) {
            setError("Chạm để kích hoạt camera.");
          }
        };
      }
    } catch (err: any) {
      setError("Không thể truy cập camera.");
    }
  };

  const applyAdvancedConstraints = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      try {
        const caps: any = (track as any).getCapabilities?.() || {};
        const adv: any = {};
        
        // ZOOM (Hardware level)
        if (caps.zoom) {
          adv.zoom = Math.min(Math.max(zoom, caps.zoom.min), caps.zoom.max);
        }
        
        // EXPOSURE (Hardware level)
        if (caps.exposureCompensation) {
          adv.exposureCompensation = Math.min(Math.max(exposure, caps.exposureCompensation.min), caps.exposureCompensation.max);
        }
        
        // SHUTTER SPEED (Exposure Time)
        if (caps.exposureTime) {
          adv.exposureTime = Math.min(Math.max(shutterSpeed * 1000, caps.exposureTime.min), caps.exposureTime.max);
        }
        
        // ISO (Sensitivity)
        if (caps.iso) {
          adv.iso = Math.min(Math.max(iso, caps.iso.min), caps.iso.max);
        }
        
        // TORCH
        if (caps.torch !== undefined && facingMode === 'environment') {
          adv.torch = torch;
        }

        if (Object.keys(adv).length > 0) {
          await track.applyConstraints({ advanced: [adv] } as any);
        }
      } catch (e) {
        console.warn("Advanced constraints not fully supported", e);
      }
    }
  };

  useEffect(() => { startCamera(); }, [facingMode]);
  useEffect(() => { if (isReady) applyAdvancedConstraints(); }, [zoom, exposure, shutterSpeed, iso, torch, isReady]);

  useImperativeHandle(ref, () => ({
    capture: async () => {
      const c = canvasRef.current;
      if (!c || !isReady) return null;
      // Vì renderLoop đã vẽ filter lên canvas, ta chỉ cần xuất data
      return c.toDataURL('image/jpeg', 0.95);
    },
    startVideo: (mode: CameraMode) => {
      const canvas = canvasRef.current;
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.warn("Canvas not ready for video recording");
        return;
      }
      setRecordingRefs(null, canvas, streamRef.current);
      storeStartVideo(mode);
    },
    stopVideo: () => {
      return storeStopVideo();
    }
  }));

  const previewStyle = aspectRatio === '1:1' ? { aspectRatio: '1/1', width: '100%' } : 
                aspectRatio === '16:9' ? { aspectRatio: '9/16', height: '100%' } : { aspectRatio: '3/4', height: '100%' };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center gap-6 px-10 text-center z-50">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{error}</p>
          <button onClick={startCamera} className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Kích hoạt</button>
        </div>
      ) : (
        <div style={previewStyle} className="relative transition-all duration-700 shadow-2xl overflow-hidden bg-white/[0.02]">
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="w-full h-full object-cover transition-opacity duration-700 opacity-100" />
        </div>
      )}
    </div>
  );
});

export default CameraEngine;
