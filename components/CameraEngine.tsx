
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';

interface Props {
  facingMode: 'user' | 'environment';
  zoom: number;
  exposure: number;
  torch: boolean;
  onZoomChange: (zoom: number) => void;
  aspectRatio: '4:3' | '16:9' | '1:1';
}

const CameraEngine = forwardRef((props: Props, ref) => {
  const { facingMode, zoom, exposure, torch, onZoomChange, aspectRatio } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    capture: async (hdrEnabled: boolean) => {
      if (!videoRef.current) return null;
      
      const video = videoRef.current;
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      // Calculate crop based on aspect ratio
      let targetWidth = width;
      let targetHeight = height;
      let startX = 0;
      let startY = 0;

      if (aspectRatio === '1:1') {
        const size = Math.min(width, height);
        targetWidth = size;
        targetHeight = size;
        startX = (width - size) / 2;
        startY = (height - size) / 2;
      } else if (aspectRatio === '16:9') {
        // Landscape 16:9 crop for mobile (usually portrait sensors)
        // WebRTC height is often the larger dimension on mobile
        const sensorIsPortrait = height > width;
        if (sensorIsPortrait) {
          targetHeight = (width * 16) / 9;
          if (targetHeight > height) {
            targetHeight = height;
            targetWidth = (height * 9) / 16;
          }
          startX = (width - targetWidth) / 2;
          startY = (height - targetHeight) / 2;
        } else {
          targetWidth = width;
          targetHeight = (width * 9) / 16;
          startX = 0;
          startY = (height - targetHeight) / 2;
        }
      } else { // 4:3
        const sensorIsPortrait = height > width;
        if (sensorIsPortrait) {
          targetHeight = (width * 4) / 3;
          if (targetHeight > height) {
            targetHeight = height;
            targetWidth = (height * 3) / 4;
          }
          startX = (width - targetWidth) / 2;
          startY = (height - targetHeight) / 2;
        } else {
          targetWidth = width;
          targetHeight = (width * 3) / 4;
          startX = 0;
          startY = (height - targetHeight) / 2;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const drawFrame = (v: HTMLVideoElement) => {
        ctx.drawImage(v, startX, startY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
      };

      if (!hdrEnabled) {
        ctx.filter = 'contrast(1.1) saturate(1.1) brightness(1.02)';
        drawFrame(video);
      } else {
        const frame1 = await createImageBitmap(video);
        await new Promise(r => setTimeout(r, 40));
        const frame2 = await createImageBitmap(video);

        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.filter = 'brightness(1.0) contrast(1.05)';
        ctx.drawImage(frame1, startX, startY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

        ctx.globalCompositeOperation = 'soft-light';
        ctx.filter = 'brightness(0.8) contrast(1.4) saturate(1.3) blur(0.5px)';
        ctx.globalAlpha = 0.6;
        ctx.drawImage(frame2, startX, startY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.filter = 'none';

        const finalPassCanvas = document.createElement('canvas');
        finalPassCanvas.width = targetWidth;
        finalPassCanvas.height = targetHeight;
        const fCtx = finalPassCanvas.getContext('2d');
        if (fCtx) {
          fCtx.filter = 'saturate(1.1) contrast(1.05)';
          fCtx.drawImage(canvas, 0, 0);
          return finalPassCanvas.toDataURL('image/jpeg', 0.95);
        }
      }
      
      return canvas.toDataURL('image/jpeg', 0.92);
    }
  }));

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        const track = stream.getVideoTracks()[0];
        if (track) {
          applyCameraConstraints(track, zoom, exposure, torch);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Camera Access Failed", err);
      setError("Please allow camera permissions");
    }
  };

  const applyCameraConstraints = async (track: MediaStreamTrack, currentZoom: number, currentExposure: number, currentTorch: boolean) => {
    if (!track || track.readyState !== 'live') return;

    try {
      const capabilities: any = (track as any).getCapabilities?.() || {};
      const advanced: any = {};

      if (capabilities.zoom) {
        advanced.zoom = Math.max(capabilities.zoom.min, Math.min(currentZoom, capabilities.zoom.max));
      }

      if (capabilities.exposureCompensation) {
        advanced.exposureCompensation = Math.max(capabilities.exposureCompensation.min, Math.min(currentExposure, capabilities.exposureCompensation.max));
      }

      if (capabilities.torch !== undefined) {
        advanced.torch = currentTorch;
      } else if (facingMode === 'environment') {
        advanced.torch = currentTorch;
      }

      if (Object.keys(advanced).length > 0) {
        await track.applyConstraints({ advanced: [advanced] } as any);
      }
    } catch (e) {
      console.warn("Failed to apply track constraints:", e);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [facingMode]);

  useEffect(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      applyCameraConstraints(track, zoom, exposure, torch);
    }
  }, [zoom, exposure, torch]);

  // CSS for aspect ratio preview
  const getPreviewStyles = (): React.CSSProperties => {
    if (aspectRatio === '1:1') return { aspectRatio: '1 / 1', width: '100%', maxHeight: '100%' };
    if (aspectRatio === '16:9') return { aspectRatio: '9 / 16', height: '100%', maxWidth: '100%' };
    return { aspectRatio: '3 / 4', height: '100%', maxWidth: '100%' };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
      {error ? (
        <div className="text-center p-8 bg-black/50 rounded-xl backdrop-blur-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={startCamera} 
            className="px-6 py-2 bg-white text-black font-bold rounded-full"
          >
            Retry
          </button>
        </div>
      ) : (
        <div style={getPreviewStyles()} className="relative transition-all duration-300">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        </div>
      )}
    </div>
  );
});

export default CameraEngine;
