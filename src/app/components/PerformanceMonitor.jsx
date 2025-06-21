"use client";
import { useEffect } from 'react';
import performanceMonitor from '../../utils/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // بدء مراقبة الأداء
    performanceMonitor.observeCoreWebVitals();
    performanceMonitor.observeNetworkPerformance();
    performanceMonitor.observeMemoryUsage();
    performanceMonitor.observeReactPerformance();
    
    // تنظيف عند إلغاء المكون
    return () => {
      performanceMonitor.disconnect();
    };
  }, []);

  return null; // لا يعرض أي شيء
} 