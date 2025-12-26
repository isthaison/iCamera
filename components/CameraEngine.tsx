
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { CameraFilter, AspectRatio } from '../types';

interface Props {
  facingMode: 'user' | 'environment';
  zoom: number;
  exposure: number;
  torch: boolean;
  onZoomChange: (zoom: number) => void;
  aspectRatio: AspectRatio;
}

const CameraEngine = forwardRef((props: Props, ref) => {
  const { facingMode, zoom, exposure, torch, aspectRatio } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const animationFrameRef = useRef<number>(0);

  // Loop vẽ video lên canvas để hỗ trợ quay phim có filter/crop
  const renderLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    const ctx = c.getContext('2d', { alpha: false });
    if (!ctx || v.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const w = v.videoWidth;
    const h = v.videoHeight;
    
    if (w > 0 && h > 0) {
      let targetW = w;
      let targetH = h;
      let sX = 0, sY = 0;

      // Tính toán crop dựa trên tỷ lệ khung hình
      if (aspectRatio === '1:1') {
        const size = Math.min(w, h);
        targetW = targetH = size;
        sX = (w - size) / 2; sY = (h - size) / 2;
      } else if (aspectRatio === '16:9') {
        // Portrait 9:16
        targetW = w;
        targetH = (w * 16) / 9;
        if (targetH > h) {
          targetH = h;
          targetW = (h * 9) / 16;
        }
        sX = (w - targetW) / 2;
        sY = (h - targetH) / 2;
      } else {
        // Standard 3:4
        targetW = w;
        targetH = (w * 4) / 3;
        if (targetH > h) {
          targetH = h;
          targetW = (h * 3) / 4;
        }
        sX = (w - targetW) / 2;
        sY = (h - targetH) / 2;
      }

      if (c.width !== targetW || c.height !== targetH) {
        c.width = targetW;
        c.height = targetH;
      }

      ctx.drawImage(v, sX, sY, targetW, targetH, 0, 0, targetW, targetH);
    }
    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [aspectRatio, isReady]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [renderLoop]);

  const getCropDimensions = (v: HTMLVideoElement, ratio: AspectRatio) => {
    const w = v.videoWidth;
    const h = v.videoHeight;
    let targetW = w, targetH = h, sX = 0, sY = 0;
    if (ratio === '1:1') {
      const size = Math.min(w, h);
      targetW = targetH = size; sX = (w - size) / 2; sY = (h - size) / 2;
    } else if (ratio === '16:9') {
      targetW = w; targetH = (w * 16) / 9;
      if (targetH > h) { targetH = h; targetW = (h * 9) / 16; }
      sX = (w - targetW) / 2; sY = (h - targetH) / 2;
    } else {
      targetW = w; targetH = (w * 4) / 3;
      if (targetH > h) { targetH = h; targetW = (h * 3) / 4; }
      sX = (w - targetW) / 2; sY = (h - targetH) / 2;
    }
    return { sX, sY, targetW, targetH };
  };

  useImperativeHandle(ref, () => ({
    capture: async (hdrEnabled: boolean, nightMode?: boolean, filter: CameraFilter = 'None') => {
      if (!videoRef.current || !isReady) return null;
      const v = videoRef.current;
      const crop = getCropDimensions(v, aspectRatio);
      const canvas = document.createElement('canvas');
      canvas.width = crop.targetW;
      canvas.height = crop.targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.filter = 'none';
      if (filter === 'Vivid') ctx.filter = 'saturate(1.6) contrast(1.1)';
      else if (filter === 'Noir') ctx.filter = 'grayscale(1) contrast(1.3)';
      else if (filter === 'Silvertone') ctx.filter = 'grayscale(0.8) sepia(0.2)';
      else if (filter === 'Dramatic') ctx.filter = 'contrast(1.5) brightness(0.9)';

      if (nightMode) {
        const frames = [];
        for (let i = 0; i < 8; i++) {
          frames.push(await createImageBitmap(v));
          await new Promise(r => setTimeout(r, 100));
        }
        ctx.drawImage(frames[0], crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.3;
        for (let i = 1; i < frames.length; i++) {
          ctx.drawImage(frames[i], crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
      } else if (hdrEnabled) {
        const f1 = await createImageBitmap(v);
        await new Promise(r => setTimeout(r, 40));
        const f2 = await createImageBitmap(v);
        ctx.drawImage(f1, crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
        ctx.globalCompositeOperation = 'soft-light';
        ctx.globalAlpha = 0.6;
        ctx.drawImage(f2, crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
      } else {
        ctx.drawImage(v, crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
      }

      return canvas.toDataURL('image/jpeg', 0.95);
    },
    startVideo: () => {
      if (!canvasRef.current) return;
      chunksRef.current = [];
      const stream = canvasRef.current.captureStream(30);
      
      // Thêm audio track từ mic vào video stream
      if (streamRef.current && streamRef.current.getAudioTracks().length > 0) {
        stream.addTrack(streamRef.current.getAudioTracks()[0]);
      }

      recorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current.start();
    },
    stopVideo: (): Promise<string> => {
      return new Promise((resolve) => {
        if (!recorderRef.current) return resolve('');
        recorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          resolve(URL.createObjectURL(blob));
        };
        recorderRef.current.stop();
      });
    }
  }));

  const startCamera = async () => {
    setIsReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
          setError(null);
          applyAdvancedConstraints();
        };
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Vui lòng cấp quyền truy cập camera và micro.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("Không tìm thấy camera trên thiết bị.");
      } else {
        setError("Không thể khởi động camera. Vui lòng thử lại.");
      }
    }
  };

  const applyAdvancedConstraints = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      try {
        const caps: any = (track as any).getCapabilities?.() || {};
        const adv: any = {};
        if (caps.zoom) {
          const targetZoom = Math.min(Math.max(zoom, caps.zoom.min), caps.zoom.max);
          adv.zoom = targetZoom;
        }
        if (caps.exposureCompensation) {
          const targetExp = Math.min(Math.max(exposure, caps.exposureCompensation.min), caps.exposureCompensation.max);
          adv.exposureCompensation = targetExp;
        }
        if (caps.torch !== undefined) {
          adv.torch = torch;
        }
        
        if (Object.keys(adv).length > 0) {
          await track.applyConstraints({ advanced: [adv] } as any);
        }
      } catch (e) {
        console.warn("Could not apply advanced constraints", e);
      }
    }
  };

  useEffect(() => { 
    startCamera(); 
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);
  
  useEffect(() => {
    if (isReady) {
      applyAdvancedConstraints();
    }
  }, [zoom, exposure, torch, isReady]);

  const previewStyle = aspectRatio === '1:1' ? { aspectRatio: '1/1', width: '100%' } : 
                aspectRatio === '16:9' ? { aspectRatio: '9/16', height: '100%' } : { aspectRatio: '3/4', height: '100%' };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center gap-6 px-10 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-red-500">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-sm font-medium text-white/60 leading-relaxed">{error}</p>
          <button 
            onClick={startCamera}
            className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div style={previewStyle} className="relative transition-all duration-500 shadow-2xl overflow-hidden bg-white/5">
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          )}
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className={`w-full h-full object-cover transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      )}
    </div>
  );
});

export default CameraEngine;
