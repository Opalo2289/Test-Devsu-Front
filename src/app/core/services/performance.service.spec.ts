import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { PerformanceService } from './performance.service';

// Mock de web-vitals
const mockOnLCP = jest.fn();
const mockOnFCP = jest.fn();
const mockOnCLS = jest.fn();
const mockOnINP = jest.fn();
const mockOnTTFB = jest.fn();

type MetricCallback = (metric: unknown) => void;

jest.mock('web-vitals', () => ({
  onLCP: (callback: MetricCallback) => mockOnLCP(callback),
  onFCP: (callback: MetricCallback) => mockOnFCP(callback),
  onCLS: (callback: MetricCallback) => mockOnCLS(callback),
  onINP: (callback: MetricCallback) => mockOnINP(callback),
  onTTFB: (callback: MetricCallback) => mockOnTTFB(callback)
}));

describe('PerformanceService', () => {
  let service: PerformanceService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    TestBed.configureTestingModule({
      providers: [
        PerformanceService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(PerformanceService);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('initWebVitals()', () => {
    it('debería registrar listeners para todas las métricas', () => {
      service.initWebVitals();

      expect(mockOnLCP).toHaveBeenCalled();
      expect(mockOnFCP).toHaveBeenCalled();
      expect(mockOnCLS).toHaveBeenCalled();
      expect(mockOnINP).toHaveBeenCalled();
      expect(mockOnTTFB).toHaveBeenCalled();
    });

    it('debería pasar callbacks a los listeners', () => {
      service.initWebVitals();

      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('getMetrics()', () => {
    it('debería retornar un Map vacío inicialmente', () => {
      const metrics = service.getMetrics();

      expect(metrics).toBeInstanceOf(Map);
      expect(metrics.size).toBe(0);
    });

    it('debería retornar una copia del Map de métricas', () => {
      const metrics1 = service.getMetrics();
      const metrics2 = service.getMetrics();

      expect(metrics1).not.toBe(metrics2);
    });
  });

  describe('getMetric()', () => {
    it('debería retornar undefined si la métrica no existe', () => {
      const metric = service.getMetric('LCP');

      expect(metric).toBeUndefined();
    });
  });

  describe('generateReport()', () => {
    it('debería generar reporte con array vacío si no hay métricas', () => {
      const report = service.generateReport();

      expect(report.metrics).toEqual([]);
      expect(report.summary).toBeDefined();
    });

    it('debería tener una propiedad summary', () => {
      const report = service.generateReport();

      expect(typeof report.summary).toBe('string');
      expect(report.summary.length).toBeGreaterThan(0);
    });
  });

  describe('getThresholds()', () => {
    it('debería retornar los umbrales de métricas', () => {
      const thresholds = service.getThresholds();

      expect(thresholds).toHaveProperty('LCP');
      expect(thresholds).toHaveProperty('FCP');
      expect(thresholds).toHaveProperty('CLS');
      expect(thresholds).toHaveProperty('INP');
      expect(thresholds).toHaveProperty('TTFB');
    });

    it('cada umbral debería tener valores good y poor', () => {
      const thresholds = service.getThresholds();

      expect(thresholds.LCP).toEqual({ good: 2500, poor: 4000 });
      expect(thresholds.CLS).toEqual({ good: 0.1, poor: 0.25 });
    });
  });

  describe('logSummary()', () => {
    it('debería llamar a console.log en modo desarrollo', () => {
      service.logSummary();

      // En modo test, isDevMode() debería ser true
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('sendToAnalytics()', () => {
    it('no debería fallar si no hay endpoint', () => {
      expect(() => {
        service.sendToAnalytics();
      }).not.toThrow();
    });

    it('debería usar sendBeacon si está disponible', () => {
      const sendBeaconMock = jest.fn();
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true
      });

      // El método no enviará nada porque no hay métricas
      service.sendToAnalytics('https://example.com/analytics');
      
      // No se llama porque metrics.size === 0
      expect(sendBeaconMock).not.toHaveBeenCalled();
    });
  });

  describe('Server-side rendering', () => {
    it('no debería ejecutar en plataforma servidor', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          PerformanceService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const serverService = TestBed.inject(PerformanceService);
      
      // Reset mocks para verificar que no se llaman
      jest.clearAllMocks();
      
      serverService.initWebVitals();

      expect(mockOnLCP).not.toHaveBeenCalled();
      expect(mockOnFCP).not.toHaveBeenCalled();
    });
  });
});
