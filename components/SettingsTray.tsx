
import React from 'react';
import { useCameraStore } from '../store';
import { CameraFilter } from '../types';

const SettingsTray: React.FC = () => {
  const store = useCameraStore();
  const filters: CameraFilter[] = ['None', 'Vivid', 'Noir', 'Silvertone', 'Dramatic'];
  const isFrontCamera = store.facingMode === 'user';

  if (!store.isSettingsOpen) return null;

  const SettingButton = ({ active, onClick, icon, label, disabled = false }: any) => (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${disabled ? 'opacity-20' : 'opacity-100'}`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'bg-white/10 text-white'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-yellow-400' : 'text-white/40'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="absolute top-14 left-0 right-0 z-50 bg-black/80 px-6 py-8 animate-in slide-in-from-top-full duration-500 backdrop-blur-3xl border-b border-white/5 rounded-b-[3rem] shadow-2xl">
      <div className="max-w-md mx-auto space-y-10">
        
        {/* Main Toggles Grid */}
        <div className="grid grid-cols-4 gap-4">
          <SettingButton 
            label="Torch"
            disabled={isFrontCamera}
            active={store.torch}
            onClick={() => store.setTorch(!store.torch)}
            icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <SettingButton 
            label="HDR"
            active={store.hdr}
            onClick={() => store.setHdr(!store.hdr)}
            icon={<span className="text-xs font-black">HDR</span>}
          />
          <SettingButton 
            label="Grid"
            active={store.showGrid}
            onClick={() => store.setShowGrid(!store.showGrid)}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M12 4v16" /></svg>}
          />
          <SettingButton 
            label="Vị trí"
            active={store.locationEnabled}
            onClick={() => store.setLocationEnabled(!store.locationEnabled)}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
           <SettingButton 
            label={`${store.timer}s`}
            active={store.timer > 0}
            onClick={() => store.setTimer(store.timer === 0 ? 3 : store.timer === 3 ? 10 : 0)}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Aspect Ratio Picker */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-center text-white/20">Aspect Ratio</span>
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl self-center border border-white/5">
            {(['4:3', '16:9', '1:1'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => store.setAspectRatio(ratio)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${store.aspectRatio === ratio ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 active:scale-95'}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Scroll */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Styles</span>
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">{store.filter}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-2 mask-linear-fade">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => store.setFilter(f)}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className={`w-14 h-14 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${store.filter === f ? 'border-yellow-400 scale-110' : 'border-white/5 opacity-40 active:scale-95'}`}>
                  <div className={`w-full h-full bg-gradient-to-br ${
                    f === 'Noir' ? 'from-gray-700 to-black' : 
                    f === 'Vivid' ? 'from-blue-400 via-green-400 to-red-400' :
                    f === 'Dramatic' ? 'from-amber-700 to-indigo-950' :
                    f === 'Silvertone' ? 'from-gray-300 to-gray-600' : 'from-gray-600 to-gray-400'
                  }`} />
                </div>
                <span className={`text-[8px] font-black uppercase ${store.filter === f ? 'text-yellow-400' : 'text-white/20'}`}>{f}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTray;
