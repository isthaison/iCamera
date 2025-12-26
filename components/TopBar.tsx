
import React from 'react';

interface Props {
  torch: boolean;
  setTorch: (v: boolean) => void;
  hdr: boolean;
  setHdr: (v: boolean) => void;
  timer: number;
  setTimer: (v: 0 | 3 | 10) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  facingMode: 'user' | 'environment';
}

const TopBar: React.FC<Props> = ({ 
  torch, 
  setTorch, 
  hdr, 
  setHdr, 
  timer, 
  setTimer, 
  isSettingsOpen, 
  setIsSettingsOpen,
  facingMode
}) => {
  const isFrontCamera = facingMode === 'user';

  return (
    <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${isSettingsOpen ? 'bg-black/90' : 'bg-gradient-to-b from-black/80 to-transparent'} pt-safe`}>
      <div className="flex items-center justify-between px-6 h-14">
        {/* Torch Toggle Button */}
        <button 
          onClick={() => !isFrontCamera && setTorch(!torch)} 
          disabled={isFrontCamera}
          className={`p-2 transition-all active:scale-90 ${torch ? 'text-yellow-400' : 'text-white'} ${isFrontCamera ? 'opacity-20' : 'opacity-100'}`}
          aria-label="Toggle Torch"
        >
          {torch ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </button>

        <button 
          onClick={() => setTimer(timer === 0 ? 3 : timer === 3 ? 10 : 0)} 
          className={`flex items-center gap-1 p-2 rounded-full transition-all ${timer > 0 ? 'text-yellow-400' : 'text-white'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timer > 0 && <span className="text-[10px] font-bold">{timer}s</span>}
        </button>

        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`flex items-center justify-center p-2 rounded-full bg-white/10 transition-transform ${isSettingsOpen ? 'rotate-180 bg-white/20' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button onClick={() => setHdr(!hdr)} className={`text-[10px] font-black uppercase transition-all px-2 ${hdr ? 'text-yellow-400' : 'text-white'}`}>
          HDR
        </button>
      </div>
    </div>
  );
};

export default TopBar;
