import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }

  // مراقبة Core Web Vitals
  observeCoreWebVitals() {
    if (typeof window !== 'undefined') {
      // LCP (Largest Contentful Paint)
      this.observeLCP();
      
      // FID (First Input Delay)
      this.observeFID();
      
      // CLS (Cumulative Layout Shift)
      this.observeCLS();
      
      // FCP (First Contentful Paint)
      this.observeFCP();
    }
  }

  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.logMetric('LCP', lastEntry.startTime);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  observeFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.logMetric('FID', this.metrics.fid);
      });
    });
    observer.observe({ entryTypes: ['first-input'] });
  }

  observeCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
      this.logMetric('CLS', clsValue);
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }

  observeFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      this.metrics.fcp = firstEntry.startTime;
      this.logMetric('FCP', firstEntry.startTime);
    });
    observer.observe({ entryTypes: ['first-contentful-paint'] });
  }

  // مراقبة أداء الشبكة
  observeNetworkPerformance() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.network = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          total: navigation.loadEventEnd - navigation.fetchStart,
        };
        this.logMetric('Network Performance', this.metrics.network);
      }
    }
  }

  // مراقبة استخدام الذاكرة
  observeMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = performance.memory;
      this.metrics.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
      this.logMetric('Memory Usage', this.metrics.memory);
    }
  }

  // مراقبة أداء React
  observeReactPerformance() {
    if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      // React DevTools integration
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.isDisabled) {
        hook.isDisabled = false;
      }
    }
  }

  // تسجيل المقاييس
  logMetric(name, value) {
    console.log(`🚀 Performance Metric - ${name}:`, value);
    
    // إرسال البيانات إلى خدمة التحليلات (اختياري)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  // إرسال البيانات إلى التحليلات
  sendToAnalytics(name, value) {
    try {
      // يمكن إرسال البيانات إلى Google Analytics أو أي خدمة أخرى
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: value,
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  // الحصول على جميع المقاييس
  getMetrics() {
    return this.metrics;
  }

  // تنظيف المراقبين
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Utility functions for performance optimization
export const performanceUtils = {
  // تحسين تحميل الصور
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  // تحسين تحميل الخطوط
  preloadFonts(fonts) {
    if (typeof window !== 'undefined' && 'fonts' in document) {
      return Promise.all(
        fonts.map(font => document.fonts.load(font))
      );
    }
    return Promise.resolve();
  },

  // تحسين التخزين المؤقت
  cacheData(key, data, ttl = 5 * 60 * 1000) {
    if (typeof window !== 'undefined') {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
    }
  },

  getCachedData(key) {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          return parsed.data;
        }
        localStorage.removeItem(key);
      }
    }
    return null;
  },

  // تحسين التحميل المسبق
  preloadRoute(path) {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
    }
  },

  // تحسين التحميل المتأخر
  lazyLoad(importFn, fallback = null) {
    return dynamic(importFn, {
      loading: fallback,
      ssr: false,
    });
  },
};

// إنشاء instance واحد
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 