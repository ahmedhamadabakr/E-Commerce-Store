import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Image optimization utilities
export const imageUtils = {
  // تحسين حجم الصورة بناءً على الشاشة
  getOptimizedImageSize(width, height, maxWidth = 800) {
    if (width <= maxWidth) {
      return { width, height };
    }
    
    const ratio = width / height;
    const newWidth = maxWidth;
    const newHeight = Math.round(maxWidth / ratio);
    
    return { width: newWidth, height: newHeight };
  },

  // تحسين جودة الصورة
  getImageQuality(width) {
    if (width <= 400) return 80;
    if (width <= 800) return 85;
    if (width <= 1200) return 90;
    return 95;
  },

  // تحسين تنسيق الصورة
  getImageFormat() {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const avifSupported = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      
      if (avifSupported) return 'avif';
      if (webpSupported) return 'webp';
    }
    return 'jpeg';
  },

  // تحسين تحميل الصور
  preloadImages(imageUrls) {
    if (typeof window === 'undefined') return Promise.resolve();
    
    return Promise.all(
      imageUrls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  },

  // تحسين تحميل الصور المتأخر
  lazyLoadImage(element, src, placeholder = null) {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    observer.observe(element);
  },

  // تحسين تحميل الصور مع Blur
  getBlurDataURL() {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  },

  // تحسين تحميل الصور مع Progressive Loading
  progressiveLoadImage(img, lowResSrc, highResSrc) {
    if (typeof window === 'undefined') return;
    
    // تحميل الصورة منخفضة الدقة أولاً
    img.src = lowResSrc;
    
    // تحميل الصورة عالية الدقة في الخلفية
    const highResImg = new Image();
    highResImg.onload = () => {
      img.src = highResSrc;
      img.classList.add('loaded');
    };
    highResImg.src = highResSrc;
  },

  // تحسين تحميل الصور مع Responsive Images
  getResponsiveImageSrc(src, sizes = [400, 800, 1200, 1600]) {
    const format = this.getImageFormat();
    const baseUrl = src.split('?')[0];
    
    return sizes.map(size => {
      const quality = this.getImageQuality(size);
      return `${baseUrl}?w=${size}&q=${quality}&f=${format}`;
    });
  },

  // تحسين تحميل الصور مع WebP Fallback
  getWebPFallback(src) {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return {
      webp: webpSrc,
      original: src,
    };
  },

  // تحسين تحميل الصور مع Error Handling
  handleImageError(img, fallbackSrc) {
    img.onerror = () => {
      img.src = fallbackSrc;
      img.classList.add('error');
    };
  },

  // تحسين تحميل الصور مع Loading States
  createImageLoader() {
    return {
      loading: true,
      error: false,
      loaded: false,
    };
  },

  // تحسين تحميل الصور مع Caching
  cacheImage(src) {
    if (typeof window === 'undefined') return;
    
    const img = new Image();
    img.src = src;
    return img;
  },

  // تحسين تحميل الصور مع Compression
  compressImage(file, maxSize = 1024 * 1024) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = this.getOptimizedImageSize(img.width, img.height);
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const quality = this.getImageQuality(width);
        canvas.toBlob(resolve, 'image/jpeg', quality / 100);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },
};

// Image optimization hooks
export const useImageOptimization = () => {
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    loaded: false,
  });

  const loadImage = useCallback((src) => {
    setImageState({ loading: true, error: false, loaded: false });
    
    const img = new Image();
    img.onload = () => {
      setImageState({ loading: false, error: false, loaded: true });
    };
    img.onerror = () => {
      setImageState({ loading: false, error: true, loaded: false });
    };
    img.src = src;
  }, []);

  return { imageState, loadImage };
};

// Image optimization components
export const OptimizedImage = ({ src, alt, width, height, className, ...props }) => {
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    loaded: false,
  });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageState({ loading: false, error: false, loaded: true });
    };
    img.onerror = () => {
      setImageState({ loading: false, error: true, loaded: false });
    };
    img.src = src;
  }, [src]);

  if (imageState.error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageState.loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          imageState.loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}; 