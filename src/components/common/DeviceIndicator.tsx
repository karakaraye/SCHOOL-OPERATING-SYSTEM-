import React, { useState, useRef, useEffect } from 'react';
import { useDevice } from '../../context/DeviceContext';
import { 
  Smartphone, 
  Laptop, 
  Sparkles, 
  Check, 
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react';

interface DeviceIndicatorProps {
  compact?: boolean;
}

export const DeviceIndicator: React.FC<DeviceIndicatorProps> = ({ compact = false }) => {
  const { 
    deviceType, 
    overrideDevice, 
    setOverrideDevice, 
    screenWidth, 
    screenHeight, 
    detectedHardware 
  } = useDevice();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPhone = deviceType === 'phone';

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
          isPhone
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        } ${compact ? 'text-[11px] px-2 py-0.5' : ''}`}
        title="Active device mode and recognition details"
      >
        <div className="flex items-center gap-1">
          {isPhone ? (
            <Smartphone size={compact ? 12 : 14} className="text-emerald-600 animate-pulse" />
          ) : (
            <Laptop size={compact ? 12 : 14} className="text-blue-600" />
          )}
          <span className="font-extrabold tracking-tight">
            {isPhone ? 'Phone' : 'Laptop'}
          </span>
        </div>

        {overrideDevice !== 'auto' && (
          <span className="text-[9px] font-black uppercase px-1 py-0.2 bg-white/80 rounded text-slate-500 border border-slate-200">
            Forced
          </span>
        )}

        <ChevronDown size={11} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-fade-in text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Device Recognition
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              {screenWidth}×{screenHeight}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 mb-2.5 px-1 leading-snug">
            System automatically tailors navigation, touch targets, and layout based on hardware recognition.
          </div>

          <div className="space-y-1">
            {/* Auto Detect Option */}
            <button
              type="button"
              onClick={() => {
                setOverrideDevice('auto');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                overrideDevice === 'auto'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={overrideDevice === 'auto' ? 'text-blue-600' : 'text-slate-400'} />
                <span>Auto-Detect Hardware</span>
              </div>
              {overrideDevice === 'auto' && <Check size={14} className="text-blue-600" />}
            </button>

            {/* Force Phone Mode */}
            <button
              type="button"
              onClick={() => {
                setOverrideDevice('phone');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                overrideDevice === 'phone'
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone size={14} className={overrideDevice === 'phone' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Simulate Phone View 📱</span>
              </div>
              {overrideDevice === 'phone' && <Check size={14} className="text-emerald-600" />}
            </button>

            {/* Force Laptop Mode */}
            <button
              type="button"
              onClick={() => {
                setOverrideDevice('laptop');
                setDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                overrideDevice === 'laptop'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Laptop size={14} className={overrideDevice === 'laptop' ? 'text-blue-600' : 'text-slate-400'} />
                <span>Simulate Laptop View 💻</span>
              </div>
              {overrideDevice === 'laptop' && <Check size={14} className="text-blue-600" />}
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 px-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers size={11} />
              <span>Platform:</span>
            </span>
            <span className="font-semibold text-slate-600 truncate max-w-[120px]">
              {detectedHardware.platform}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
