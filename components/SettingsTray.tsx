
import React from 'react';
import { AspectRatio, CameraFilter } from '../types';

interface Props {
  isOpen: boolean;
  grid: boolean;
  setGrid: (v: boolean) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (v: AspectRatio) => void;
  currentFilter: CameraFilter;
  setFilter: (v: CameraFilter) => void;
  proRaw: boolean;
  setProRaw: (v: boolean) => void;
}

const SettingsTray: React.FC<Props> = ({ 
  isOpen, grid, setGrid, aspectRatio, setAspectRatio, currentFilter, setFilter, proRaw, setProRaw 
}) => {
  const filters: CameraFilter[] = ['None', 'Vivid', 'Noir', 'Silvertone', 'Dramatic'];

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 left-0 right-0 z-40 bg-black/90 px-6 py-4 animate-in slide-in-from-top duration-300 backdrop-blur-xl border-b border-white/10">
      <div className="space-y-6">
        {/* Toggles */}
        <div className="flex justify-around items-center">
          <button onClick={() => setGrid(!grid)} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${grid ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M12 4v16" />
              </svg>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Grid</span>
          </button>

          <button onClick={() => setProRaw(!proRaw)} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${proRaw ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white/10 border-white/20 text-white'}`}>
              <span className="text-[8px] font-black">RAW</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">ProRAW</span>
          </button>
        </div>

        {/* Aspect Ratio */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-center text-white/30">Aspect Ratio</span>
          <div className="flex gap-2 bg-white/5 p-1 rounded-full self-center">
            {(['4:3', '16:9', '1:1'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${aspectRatio === ratio ? 'bg-white text-black' : 'text-white/40'}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Slider */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-center text-white/30">Filters</span>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className={`w-12 h-12 rounded-lg border-2 transition-all ${currentFilter === f ? 'border-yellow-400 scale-110 shadow-lg shadow-yellow-400/20' : 'border-white/10 opacity-60'}`}>
                  <div className={`w-full h-full rounded bg-gradient-to-br ${
                    f === 'Noir' ? 'from-gray-700 to-black' : 
                    f === 'Vivid' ? 'from-blue-400 via-green-400 to-red-400' :
                    f === 'Dramatic' ? 'from-amber-600 to-blue-900' :
                    f === 'Silvertone' ? 'from-gray-300 to-gray-600' : 'from-gray-500 to-gray-500'
                  }`} />
                </div>
                <span className={`text-[8px] font-bold ${currentFilter === f ? 'text-yellow-400' : 'text-white/40'}`}>{f}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTray;
