import { create } from "zustand";
import { CameraMode } from "../types";

// Use a ref for chunks to avoid Zustand state issues
const chunksRef = { current: [] as Blob[] };

interface VisionResult {
  qr?: string;
  text?: string;
  faces?: string;
  objects?: string;
  raw?: string;
}

interface CaptureState {
  isCapturing: boolean;
  isRecording: boolean;
  isAnalyzing: boolean;
  isBursting: boolean;
  burstCount: number;
  visionResult: VisionResult | null;
  videoSeconds: number;

  // Recording refs (will be set by component)
  recorder: MediaRecorder | null;
  canvas: HTMLCanvasElement | null;
  stream: MediaStream | null;

  setIsCapturing: (val: boolean) => void;
  setIsRecording: (val: boolean) => void;
  setIsAnalyzing: (val: boolean) => void;
  setIsBursting: (val: boolean) => void;
  setBurstCount: (val: number | ((prev: number) => number)) => void;
  setVisionResult: (res: VisionResult | null) => void;
  incrementVideoSeconds: () => void;
  resetVideoSeconds: () => void;

  // Recording methods
  setRecordingRefs: (
    recorder: MediaRecorder | null,
    canvas: HTMLCanvasElement | null,
    stream: MediaStream | null
  ) => void;
  startVideo: (mode: CameraMode) => void;
  stopVideo: () => Promise<string | null>;
}

export const useCaptureStore = create<CaptureState>((set, get) => ({
  isCapturing: false,
  isRecording: false,
  isAnalyzing: false,
  isBursting: false,
  burstCount: 0,
  visionResult: null,
  videoSeconds: 0,

  recorder: null,
  canvas: null,
  stream: null,

  setIsCapturing: (isCapturing) => set({ isCapturing }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsBursting: (isBursting) =>
    set({ isBursting, burstCount: isBursting ? 0 : 0 }),
  setBurstCount: (val) =>
    set((state) => ({
      burstCount: typeof val === "function" ? val(state.burstCount) : val,
    })),
  setVisionResult: (visionResult) => set({ visionResult }),
  incrementVideoSeconds: () =>
    set((state) => ({ videoSeconds: state.videoSeconds + 1 })),
  resetVideoSeconds: () => set({ videoSeconds: 0 }),

  setRecordingRefs: (recorder, canvas, stream) =>
    set({ recorder, canvas, stream }),

  startVideo: (mode: CameraMode) => {
    const { canvas, stream, setIsRecording } = get();
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.warn("Cannot start video recording: canvas not ready");
      return;
    }
    if (typeof canvas.captureStream !== "function") {
      console.error("Canvas captureStream not supported in this browser");
      return;
    }
    chunksRef.current = [];

    let fps = 30;
    if (mode === CameraMode.TIMELAPSE) fps = 10;
    if (mode === CameraMode.SLOW_MOTION) fps = 60;

    const canvasStream = canvas.captureStream(fps);
    console.log(
      "Canvas stream tracks:",
      canvasStream.getTracks().map((t) => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
      }))
    );

    if (
      stream &&
      mode !== CameraMode.SLOW_MOTION &&
      mode !== CameraMode.TIMELAPSE
    ) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack.clone());
        console.log("Added audio track");
      }
    }

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=h264,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=h264",
      "video/webm",
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=avc1",
    ];

    const supportedMimeType = mimeTypes.find((type) =>
      MediaRecorder.isTypeSupported(type)
    );

    const recorderOptions: any = {
      videoBitsPerSecond:
        mode === CameraMode.SLOW_MOTION
          ? 12000000
          : mode === CameraMode.TIMELAPSE
          ? 2000000
          : 8000000,
      audioBitsPerSecond: 128000,
    };
    if (supportedMimeType) {
      recorderOptions.mimeType = supportedMimeType;
    }

    const recorder = new MediaRecorder(canvasStream, recorderOptions);
    set({ recorder });

    recorder.ondataavailable = (e) => {
      console.log("ondataavailable", e.data.size);
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        console.log("chunks length", chunksRef.current.length);
      }
    };

    recorder.onerror = (e) => {
      console.error("MediaRecorder error:", e);
    };

    recorder.onstop = () => {
      console.log("MediaRecorder stopped");
    };

    recorder.onstart = () => {
      console.log("MediaRecorder started");
    };

    try {
      recorder.start();
      setIsRecording(true);
      console.log(
        `Started recording with mimeType: ${supportedMimeType}, bitrate: ${recorderOptions.videoBitsPerSecond}bps`
      );
    } catch (error) {
      console.error("Failed to start MediaRecorder:", error);
      setIsRecording(false);
    }
  },

  stopVideo: (): Promise<string | null> => {
    return new Promise((resolve) => {
      const { recorder, setIsRecording } = get();
      console.log("chunks in stop", chunksRef.current.length);
      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        resolve(
          chunksRef.current.length > 0
            ? URL.createObjectURL(
                new Blob(chunksRef.current, { type: "video/webm" })
              )
            : null
        );
        return;
      }
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url =
          chunksRef.current.length > 0 ? URL.createObjectURL(blob) : null;
        console.log(
          `Recording stopped, blob size: ${blob.size} bytes, type: ${mimeType}`
        );
        chunksRef.current = [];
        setIsRecording(false);
        resolve(url);
      };
      recorder.stop();
    });
  },
}));
