type PerformanceMetric = {
  name: string;
  value: number;
  timestamp: number;
  path?: string;
};

type PerformanceConfig = {
  enabled: boolean;
  dsn?: string;
  environment: 'development' | 'production';
};

const config: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV as 'development' | 'production',
};

export const performanceMonitor = {
  trackWebVitals: (metric: PerformanceMetric) => {
    if (!config.enabled) {
      console.log('[Performance]', metric.name, metric.value);
      return;
    }

    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      const data = {
        ...metric,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
      };
      navigator.sendBeacon('/api/analytics', JSON.stringify(data));
    }
  },

  trackError: (error: Error, context?: Record<string, unknown>) => {
    if (!config.enabled) {
      console.error('[Error]', error, context);
      return;
    }

    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      const data = {
        type: 'error',
        message: error.message,
        stack: error.stack,
        context,
        path: window.location.pathname,
        timestamp: Date.now(),
      };
      navigator.sendBeacon('/api/analytics', JSON.stringify(data));
    }
  },

  trackEvent: (name: string, data?: Record<string, unknown>) => {
    if (!config.enabled) {
      console.log('[Event]', name, data);
      return;
    }

    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      const eventData = {
        type: 'event',
        name,
        data,
        path: window.location.pathname,
        timestamp: Date.now(),
      };
      navigator.sendBeacon('/api/analytics', JSON.stringify(eventData));
    }
  },

  measurePerformance: (name: string, fn: () => Promise<void>) => {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      performanceMonitor.trackWebVitals({
        name,
        value: duration,
        timestamp: Date.now(),
      });
    });
  },
};

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            performanceMonitor.trackWebVitals({
              name: 'LCP',
              value: entry.startTime,
              timestamp: Date.now(),
            });
          }
          if (entry.entryType === 'first-input') {
            performanceMonitor.trackWebVitals({
              name: 'FID',
              value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
              timestamp: Date.now(),
            });
          }
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as LayoutShift;
            if (!layoutShiftEntry.hadRecentInput) {
              performanceMonitor.trackWebVitals({
                name: 'CLS',
                value: layoutShiftEntry.value,
                timestamp: Date.now(),
              });
            }
          }
        }
      });

      observer.observe({
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
      });
    } catch (e) {
      console.warn('Performance observer not supported');
    }
  }
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
