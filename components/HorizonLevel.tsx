
import React, { useState, useEffect } from 'react';

const HorizonLevel: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleMotion = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        setRotation(e.gamma);
      }
    };

    window.addEventListener('deviceorientation', handleMotion);
    return () => window.removeEventListener('deviceorientation', handleMotion);
  }, []);

  const isLevel = Math.abs(rotation) < 1;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <div className="relative w-40 flex items-center justify-between">
        {/* Left Mark */}
        <div 
          className={`h-[1px] w-8 transition-colors duration-200 ${isLevel ? 'bg-yellow-400' : 'bg-white/40'}`}
          style={{ transform: `translateY(${rotation * 0.5}px)` }}
        />
        {/* Center Gap for focus box */}
        <div className="w-12" />
        {/* Right Mark */}
        <div 
          className={`h-[1px] w-8 transition-colors duration-200 ${isLevel ? 'bg-yellow-400' : 'bg-white/40'}`}
          style={{ transform: `translateY(${-rotation * 0.5}px)` }}
        />
      </div>
    </div>
  );
};

export default HorizonLevel;
