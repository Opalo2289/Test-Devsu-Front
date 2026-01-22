import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Umbrales para calificación de métricas
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 }
};

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly isDevEnvironment = isDevMode();
  
  private metrics = new Map<string, WebVitalsMetric>();

  /**
   * Inicializa la captura de métricas Web Vitals
   */
  initWebVitals(): void {
    if (!this.isBrowser) return;

    // Largest Contentful Paint
    onLCP((metric) => this.handleMetric(metric));
    
    // First Contentful Paint
    onFCP((metric) => this.handleMetric(metric));
    
    // Cumulative Layout Shift
    onCLS((metric) => this.handleMetric(metric));
    
    // Interaction to Next Paint (reemplaza a FID)
    onINP((metric) => this.handleMetric(metric));
    
    // Time to First Byte
    onTTFB((metric) => this.handleMetric(metric));
  }

  /**
   * Procesa y almacena una métrica
   */
  private handleMetric(metric: Metric): void {
    const webVitalMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType || 'unknown'
    };

    this.metrics.set(metric.name, webVitalMetric);
    
    // Log en desarrollo
    if (this.isDevEnvironment) {
      this.logMetric(webVitalMetric);
    }
  }

  /**
   * Muestra la métrica en consola con formato visual
   */
  private logMetric(metric: WebVitalsMetric): void {
    const colors = {
      good: '#0CCE6B',
      'needs-improvement': '#FFA400',
      poor: '#FF4E42'
    };

    const color = colors[metric.rating];
    const icon = metric.rating === 'good' ? '✓' : metric.rating === 'needs-improvement' ? '⚠' : '✗';
    
    const value = metric.name === 'CLS' 
      ? metric.value.toFixed(3) 
      : `${Math.round(metric.value)}ms`;

    console.log(
      `%c ${icon} ${metric.name}: ${value} (${metric.rating})`,
      `color: ${color}; font-weight: bold; font-size: 12px;`
    );

    // Log adicional con detalles
    console.log(`   └─ Delta: ${metric.delta.toFixed(2)}, Navigation: ${metric.navigationType}`);
  }

  /**
   * Obtiene todas las métricas capturadas
   */
  getMetrics(): Map<string, WebVitalsMetric> {
    return new Map(this.metrics);
  }

  /**
   * Obtiene una métrica específica
   */
  getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Genera un reporte de todas las métricas
   */
  generateReport(): { metrics: WebVitalsMetric[]; summary: string } {
    const metricsArray = Array.from(this.metrics.values());
    
    const goodCount = metricsArray.filter(m => m.rating === 'good').length;
    const poorCount = metricsArray.filter(m => m.rating === 'poor').length;
    
    let summary: string;
    if (poorCount > 0) {
      summary = 'Necesita mejoras - Hay métricas con rendimiento pobre';
    } else if (goodCount === metricsArray.length) {
      summary = 'Excelente - Todas las métricas tienen buen rendimiento';
    } else {
      summary = 'Aceptable - Algunas métricas necesitan atención';
    }

    return { metrics: metricsArray, summary };
  }

  /**
   * Muestra un resumen visual en consola
   */
  logSummary(): void {
    if (!this.isDevEnvironment) return;

    const report = this.generateReport();
    
    console.log('%c📊 Web Vitals Summary', 'font-size: 14px; font-weight: bold; color: #1976D2;');
    console.log('─'.repeat(40));
    
    report.metrics.forEach(metric => {
      this.logMetric(metric);
    });
    
    console.log('─'.repeat(40));
    console.log(`%c${report.summary}`, 'font-style: italic;');
  }

  /**
   * Envía métricas a un endpoint de analytics (opcional)
   */
  sendToAnalytics(endpoint?: string): void {
    if (!this.isBrowser || this.metrics.size === 0) return;
    
    const metricsData = Array.from(this.metrics.values());
    
    if (endpoint) {
      // Enviar a endpoint personalizado
      navigator.sendBeacon?.(endpoint, JSON.stringify({
        metrics: metricsData,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Obtiene los umbrales de referencia para las métricas
   */
  getThresholds(): typeof THRESHOLDS {
    return THRESHOLDS;
  }
}
