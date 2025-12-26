
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
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
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tính toán thông số crop dựa trên Aspect Ratio và kích thước cảm biến thực tế
   */
  const getCropDimensions = (v: HTMLVideoElement, ratio: AspectRatio) => {
    const w = v.videoWidth;
    const h = v.videoHeight;
    let targetW = w;
    let targetH = h;
    let sX = 0, sY = 0;

    if (ratio === '1:1') {
      const size = Math.min(w, h);
      targetW = targetH = size;
      sX = (w - size) / 2; sY = (h - size) / 2;
    } else if (ratio === '16:9') {
      // iPhone thường có cảm biến 4:3, chụp 16:9 là crop từ 4:3
      targetH = (w * 16) / 9;
      if (targetH > h) {
        targetH = h;
        targetW = (h * 9) / 16;
      }
      sX = (w - targetW) / 2;
      sY = (h - targetH) / 2;
    } else { // 4:3
      targetH = (w * 4) / 3;
      if (targetH > h) {
        targetH = h;
        targetW = (h * 3) / 4;
      }
      sX = (w - targetW) / 2;
      sY = (h - targetH) / 2;
    }

    return { sX, sY, targetW, targetH };
  };

  /**
   * Áp dụng Filter màu sắc vào Canvas Context
   */
  const applyFilterToCtx = (ctx: CanvasRenderingContext2D, filter: CameraFilter) => {
    ctx.filter = ''; // Reset
    switch (filter) {
      case 'Vivid': ctx.filter = 'saturate(1.6) contrast(1.1) brightness(1.05)'; break;
      case 'Noir': ctx.filter = 'grayscale(1) contrast(1.4) brightness(0.9)'; break;
      case 'Silvertone': ctx.filter = 'grayscale(0.8) sepia(0.2) contrast(1.2) brightness(1.1)'; break;
      case 'Dramatic': ctx.filter = 'contrast(1.7) saturate(0.7) brightness(0.85)'; break;
      default: ctx.filter = 'saturate(1.05) contrast(1.02)'; break;
    }
  };

  /**
   * Logic chụp ảnh chuẩn (Standard)
   */
  const processStandardCapture = (ctx: CanvasRenderingContext2D, v: HTMLVideoElement, crop: any) => {
    ctx.drawImage(v, crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
  };

  /**
   * Logic chụp ảnh HDR (Kết hợp 2 frames)
   */
  const processHDRCapture = async (ctx: CanvasRenderingContext2D, v: HTMLVideoElement, crop: any) => {
    const f1 = await createImageBitmap(v);
    await new Promise(r => setTimeout(r, 30));
    const f2 = await createImageBitmap(v);
    
    // Vẽ frame 1 làm nền
    ctx.drawImage(f1, crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
    
    // Chồng frame 2 với chế độ Soft Light để giữ chi tiết vùng sáng/tối
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.5;
    ctx.drawImage(f2, crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
    
    // Reset state
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  };

  /**
   * Logic chụp ảnh Night Mode (Stacking 8 frames)
   */
  const processNightCapture = async (ctx: CanvasRenderingContext2D, v: HTMLVideoElement, crop: any) => {
    const frames = [];
    for (let i = 0; i < 8; i++) {
      frames.push(await createImageBitmap(v));
      await new Promise(r => setTimeout(r, 60)); // Giả lập thời gian phơi sáng
    }

    ctx.globalAlpha = 1.0;
    ctx.drawImage(frames[0], crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
    
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.35;
    for (let i = 1; i < frames.length; i++) {
      ctx.drawImage(frames[i], crop.sX, crop.sY, crop.targetW, crop.targetH, 0, 0, crop.targetW, crop.targetH);
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  };

  useImperativeHandle(ref, () => ({
    capture: async (hdrEnabled: boolean, nightMode?: boolean, filter: CameraFilter = 'None') => {
      if (!videoRef.current) return null;
      const v = videoRef.current;
      const crop = getCropDimensions(v, aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = crop.targetW;
      canvas.height = crop.targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Áp dụng filter trước khi vẽ
      applyFilterToCtx(ctx, filter);

      if (nightMode) {
        await processNightCapture(ctx, v, crop);
      } else if (hdrEnabled) {
        await processHDRCapture(ctx, v, crop);
      } else {
        processStandardCapture(ctx, v, crop);
      }

      return canvas.toDataURL('image/jpeg', 0.95);
    }
  }));

  const startCamera = async () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: facingMode }, 
          width: { ideal: 3840 }, 
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        if (track) applyCameraConstraints(track, zoom, exposure, torch);
      }
      setError(null);
    } catch {
      setError("Camera Access Denied");
    }
  };

  const applyCameraConstraints = async (track: MediaStreamTrack, z: number, e: number, t: boolean) => {
    try {
      const caps: any = (track as any).getCapabilities?.() || {};
      const adv: any = {};
      if (caps.zoom) adv.zoom = Math.max(caps.zoom.min, Math.min(z, caps.zoom.max));
      if (caps.exposureCompensation) adv.exposureCompensation = Math.max(caps.exposureCompensation.min, Math.min(e, caps.exposureCompensation.max));
      if (caps.torch !== undefined || facingMode === 'environment') adv.torch = t;
      await track.applyConstraints({ advanced: [adv] } as any);
    } catch (err) {
      console.warn("Failed to apply constraints", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [facingMode]);

  useEffect(() => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) applyCameraConstraints(t, zoom, exposure, torch);
  }, [zoom, exposure, torch]);

  const style = aspectRatio === '1:1' ? { aspectRatio: '1/1', width: '100%' } : 
                aspectRatio === '16:9' ? { aspectRatio: '9/16', height: '100%' } : { aspectRatio: '3/4', height: '100%' };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      {error ? (
        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md text-center max-w-xs">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button onClick={startCamera} className="bg-white text-black px-6 py-2 rounded-full font-bold active:scale-95 transition-transform">
            Retry
          </button>
        </div>
      ) : (
        <div style={style} className="transition-all duration-500 ease-in-out">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
});

export default CameraEngine;
