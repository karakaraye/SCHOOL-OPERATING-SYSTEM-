import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type DeviceType = 'phone' | 'tablet' | 'laptop';
export type DeviceOverride = 'auto' | 'phone' | 'laptop';

interface DeviceContextType {
  deviceType: DeviceType;
  isPhone: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isMobile: boolean; // Phone or Tablet
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  overrideDevice: DeviceOverride;
  setOverrideDevice: (override: DeviceOverride) => void;
  detectedHardware: {
    isMobileUserAgent: boolean;
    hasTouchSupport: boolean;
    pixelRatio: number;
    platform: string;
  };
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const STORAGE_KEY = 'schoolos_device_override';

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Screen dimensions state
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Touch capability
  const [isTouch, setIsTouch] = useState(false);

  // Auto hardware detection state
  const [overrideDevice, setOverrideDeviceState] = useState<DeviceOverride>('auto');

  // Track window resize and touch capability
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      );
    };

    checkTouch();
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const setOverrideDevice = (override: DeviceOverride) => {
    setOverrideDeviceState(override);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, override);
    }
  };

  // Hardware detection details
  const detectedHardware = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        isMobileUserAgent: false,
        hasTouchSupport: false,
        pixelRatio: 1,
        platform: 'desktop',
      };
    }

    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pixelRatio = window.devicePixelRatio || 1;

    let platform = 'Laptop / Desktop';
    if (/iPhone/i.test(ua)) platform = 'iPhone';
    else if (/iPad/i.test(ua)) platform = 'iPad';
    else if (/Android/i.test(ua)) platform = 'Android Device';
    else if (isMobileUA) platform = 'Mobile Device';

    return {
      isMobileUserAgent: isMobileUA,
      hasTouchSupport: hasTouch,
      pixelRatio,
      platform,
    };
  }, []);

  // Compute detected device type based on responsive breakpoints & touch
  const detectedDeviceType: DeviceType = useMemo(() => {
    const { width } = dimensions;
    if (width < 768) {
      return 'phone';
    }
    if (width < 1024) {
      return 'tablet';
    }
    return 'laptop';
  }, [dimensions.width]);

  // Effective device type considering manual override
  const effectiveDeviceType: DeviceType = useMemo(() => {
    if (overrideDevice === 'phone') return 'phone';
    if (overrideDevice === 'laptop') return 'laptop';
    return detectedDeviceType;
  }, [overrideDevice, detectedDeviceType]);

  const isPhone = effectiveDeviceType === 'phone';
  const isTablet = effectiveDeviceType === 'tablet';
  const isLaptop = effectiveDeviceType === 'laptop';
  const isMobile = isPhone || isTablet;
  const orientation: 'portrait' | 'landscape' = dimensions.width >= dimensions.height ? 'landscape' : 'portrait';

  const value = useMemo(
    () => ({
      deviceType: effectiveDeviceType,
      isPhone,
      isTablet,
      isLaptop,
      isMobile,
      isTouch,
      orientation,
      screenWidth: dimensions.width,
      screenHeight: dimensions.height,
      overrideDevice,
      setOverrideDevice,
      detectedHardware,
    }),
    [
      effectiveDeviceType,
      isPhone,
      isTablet,
      isLaptop,
      isMobile,
      isTouch,
      orientation,
      dimensions.width,
      dimensions.height,
      overrideDevice,
      detectedHardware,
    ]
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

export const useDevice = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
