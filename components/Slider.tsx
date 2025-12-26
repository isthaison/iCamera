import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  label,
  showValue = true,
  valueFormatter,
  className = '',
  orientation = 'horizontal',
  disabled = false,
  size = 'md'
}) => {
  const formatValue = (val: number) => {
    if (valueFormatter) return valueFormatter(val);
    return val.toString();
  };

  const sizeClasses = {
    sm: {
      container: 'py-0.5',
      label: 'text-[8px]',
      value: 'text-[9px] min-w-[32px]',
      slider: 'h-2',
      thumb: { width: 18, height: 18 }
    },
    md: {
      container: 'py-1',
      label: 'text-[8px]',
      value: 'text-[10px] min-w-[40px]',
      slider: 'h-3',
      thumb: { width: 24, height: 24 }
    },
    lg: {
      container: 'py-1.5',
      label: 'text-[10px]',
      value: 'text-[11px] min-w-[48px]',
      slider: 'h-4',
      thumb: { width: 28, height: 28 }
    }
  };

  const currentSize = sizeClasses[size];

  const sliderClass = orientation === 'vertical'
    ? `absolute w-10 h-24 -rotate-90 bg-transparent cursor-pointer appearance-none z-20 ${currentSize.slider}`
    : `flex-1 ${currentSize.slider} bg-white/20 rounded-lg appearance-none cursor-pointer slider-pro ${className}`;

  const containerClass = orientation === 'vertical'
    ? 'relative w-10 h-24 flex items-center justify-center'
    : `flex items-center gap-2 ${currentSize.container}`;

  return (
    <>
      <div className="flex flex-col gap-2">
        {label && (
          <span className={`${currentSize.label} font-black uppercase tracking-widest text-white/60`}>
            {label}
          </span>
        )}

        <div className={containerClass}>
          {showValue && orientation === 'horizontal' && (
            <span className={`${currentSize.value} font-mono text-yellow-400`}>
              {formatValue(value)}
            </span>
          )}

          {orientation === 'vertical' ? (
            <div className="relative w-10 h-24 flex items-center justify-center">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                disabled={disabled}
                className={sliderClass}
              />
              <div className="w-[1px] h-full bg-yellow-400/30" />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center transition-all duration-75"
                style={{
                  bottom: `${((value - min) / (max - min)) * 100}%`,
                  marginBottom: '-10px'
                }}
              >
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3M12 21v-4m0-14l-2 2m2-2l2 2m-2 12l-2-2m2 2l2-2M7 12H3m18 0h-4M3 12l2-2m-2 2l2 2m12-2l2-2m-2 2l2 2" />
                </svg>
              </div>
            </div>
          ) : (
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              disabled={disabled}
              className={sliderClass}
            />
          )}

          {showValue && orientation === 'vertical' && (
            <div className={`${currentSize.value} font-bold text-yellow-400 bg-black/40 px-1 rounded mt-2`}>
              {value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .slider-pro {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.2);
          outline: none;
          touch-action: none;
        }
        .slider-pro::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: ${currentSize.thumb.width}px;
          height: ${currentSize.thumb.height}px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
          border: 2px solid rgba(255,255,255,0.3);
          transition: all 0.15s ease;
        }
        .slider-pro::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6);
        }
        .slider-pro::-webkit-slider-thumb:active {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(251, 191, 36, 0.8);
        }
        .slider-pro::-moz-range-thumb {
          width: ${currentSize.thumb.width}px;
          height: ${currentSize.thumb.height}px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
          transition: all 0.15s ease;
        }
        .slider-pro::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6);
        }
        .slider-pro::-moz-range-thumb:active {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(251, 191, 36, 0.8);
        }
        .slider-pro:focus {
          outline: none;
        }
      `}</style>
    </>
  );
};

export default Slider;