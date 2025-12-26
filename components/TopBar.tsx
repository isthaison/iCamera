
import React from 'react';
import { useCameraSettingsStore } from '../stores/cameraSettingsStore';
import { useUIStore } from '../stores/uiStore';

const TopBar: React.FC = () => {
  const cameraSettings = useCameraSettingsStore();
  const ui = useUIStore();
  const isFrontCamera = cameraSettings.facingMode === 'user';

  return (
    <div className={`absolute top-0 left-0 right-0 z-[60] transition-all duration-500 pt-safe ${ui.isSettingsOpen ? 'bg-black/40 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between px-6 h-14">
        {/* Quick Indicators (Left) */}
        <div className="flex items-center gap-4">
          {cameraSettings.torch && !isFrontCamera && (
            <div className="text-yellow-400 animate-pulse">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          {cameraSettings.hdr && (
            <span className="text-[10px] font-black text-yellow-400 border border-yellow-400/30 px-1 rounded-sm">HDR</span>
          )}
        </div>

        {/* Central Toggle Button */}
        <button
          onClick={() => ui.setIsSettingsOpen(!ui.isSettingsOpen)}
          className="flex flex-col items-center justify-center p-2 group transition-transform"
        >
          <div className={`transition-transform duration-500 ${ui.isSettingsOpen ? 'rotate-180' : 'rotate-0'}`}>
            <svg className="w-6 h-6 text-white/80 group-active:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {!ui.isSettingsOpen && (
             <div className="w-1 h-1 bg-yellow-400 rounded-full mt-0.5 animate-pulse" />
           )}
        </button>

        {/* Indicators (Right) */}
        <div className="flex items-center gap-3">
          {cameraSettings.timer > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-bold">{cameraSettings.timer}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
