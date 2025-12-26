
import React from 'react';
import { CameraMode } from '../types';

interface Props {
  currentMode: CameraMode;
  setMode: (m: CameraMode) => void;
}

const ModeSelector: React.FC<Props> = ({ currentMode, setMode }) => {
  const modes = [
    { label: 'TIME-LAPSE', value: CameraMode.TIMELAPSE },
    { label: 'SLO-MO', value: CameraMode.SLOW_MOTION },
    { label: 'PRO', value: CameraMode.PRO },
    { label: 'VIDEO', value: CameraMode.VIDEO },
    { label: 'PHOTO', value: CameraMode.PHOTO },
    { label: 'PORTRAIT', value: CameraMode.PORTRAIT },
    { label: 'SQUARE', value: CameraMode.SQUARE },
    { label: 'NIGHT', value: CameraMode.NIGHT },
    { label: 'VISION', value: CameraMode.VISION },
  ];

  return (
    <div className="relative w-full overflow-hidden h-10 flex items-center justify-center mb-4">
      <div className="flex gap-6 px-10 overflow-x-auto no-scrollbar snap-x snap-center scroll-smooth">
        {modes.map(mode => (
          <button
            key={mode.value}
            onClick={() => setMode(mode.value)}
            className={`snap-center whitespace-nowrap text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${
              currentMode === mode.value ? 'text-yellow-400 scale-110' : 'text-white/40'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
      {/* Indicator */}
      <div className="absolute bottom-0 w-1 h-1 bg-yellow-400 rounded-full"></div>
    </div>
  );
};

export default ModeSelector;
