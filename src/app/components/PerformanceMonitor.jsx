/* "use client";
import { useEffect } from 'react';
import performanceMonitor from '@/utils/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    performanceMonitor.observeCoreWebVitals();
    performanceMonitor.observeNetworkPerformance();
    performanceMonitor.observeMemoryUsage();
    performanceMonitor.observeReactPerformance();
    
    return () => {
      performanceMonitor.disconnect();
    };
  }, []);

  return null; 
}  */