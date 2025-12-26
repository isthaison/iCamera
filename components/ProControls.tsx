import React from "react";
import { useCameraSettingsStore } from "../stores/cameraSettingsStore";
import Slider from "./Slider";

const ProControls: React.FC = () => {
  const cameraSettings = useCameraSettingsStore();

  return (
    <div className="absolute top-20 left-4 right-4 z-[70] animate-in slide-in-from-top-5 duration-300">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Slider
            label="Zoom"
            min={0.5}
            max={100}
            step={0.1}
            value={cameraSettings.zoom}
            onChange={cameraSettings.setZoom}
            valueFormatter={(val) => `${val.toFixed(1)}x`}
          />
          <Slider
            label="Exposure"
            min={-10}
            max={10}
            step={1}
            value={cameraSettings.exposure}
            onChange={(val) => cameraSettings.setExposure(val)}
          />
          <Slider
            label="Shutter Speed"
            min={1}
            max={30000}
            step={1}
            value={cameraSettings.shutterSpeed}
            onChange={(val) => cameraSettings.setShutterSpeed(val)}
            valueFormatter={(val) =>
              val >= 1000
                ? `${(val / 1000).toFixed(1)}s`
                : `1/${Math.round(1000 / val)}`
            }
          />
          <Slider
            label="ISO"
            min={50}
            max={3200}
            step={50}
            value={cameraSettings.iso}
            onChange={(val) => cameraSettings.setIso(val)}
          />
        </div>
        <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-white/40">
          <span>ISO: {cameraSettings.iso}</span>
          <span>
            Shutter:{" "}
            {cameraSettings.shutterSpeed >= 1000
              ? `${(cameraSettings.shutterSpeed / 1000).toFixed(1)}s`
              : `1/${Math.round(1000 / cameraSettings.shutterSpeed)}s`}
          </span>
          <span>Focus: Auto</span>
        </div>
      </div>
    </div>
  );
};

export default ProControls;
