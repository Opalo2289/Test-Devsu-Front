import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageStore: Record<string, string> = {};

  // Mock de localStorage
  const localStorageMock = {
    getItem: jest.fn((key: string) => localStorageStore[key] || null),
    setItem: jest.fn((key: string, value: string) => { localStorageStore[key] = value; }),
    removeItem: jest.fn((key: string) => { delete localStorageStore[key]; }),
    clear: jest.fn(() => { localStorageStore = {}; })
  };

  // Mock de matchMedia
  const createMatchMediaMock = (prefersDark = false) => {
    return jest.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
  };

  const setupTestBed = (prefersDark = false) => {
    localStorageStore = {};
    jest.clearAllMocks();
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('data-theme');

    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    Object.defineProperty(window, 'matchMedia', { value: createMatchMediaMock(prefersDark), writable: true });

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    return TestBed.inject(ThemeService);
  };

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('debería crearse correctamente', () => {
    service = setupTestBed();
    expect(service).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('debería iniciar en modo claro cuando sistema prefiere claro', () => {
      service = setupTestBed(false);
      expect(service.isDarkMode()).toBe(false);
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('debería iniciar en modo oscuro cuando sistema prefiere oscuro', () => {
      service = setupTestBed(true);
      expect(service.isDarkMode()).toBe(true);
      expect(service.getCurrentTheme()).toBe('dark');
    });

    it('debería respetar preferencia guardada en localStorage sobre sistema', () => {
      localStorageStore['banco-theme'] = 'dark';
      Object.defineProperty(window, 'matchMedia', { value: createMatchMediaMock(false), writable: true });
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      
      service = TestBed.inject(ThemeService);
      expect(service.isDarkMode()).toBe(true);
    });
  });

  describe('toggleTheme()', () => {
    it('debería alternar de claro a oscuro', () => {
      service = setupTestBed(false);
      const initialDark = service.isDarkMode();
      
      service.toggleTheme();
      
      expect(service.isDarkMode()).toBe(!initialDark);
    });

    it('debería alternar de oscuro a claro', () => {
      service = setupTestBed(false);
      service.setTheme('dark');
      expect(service.isDarkMode()).toBe(true);
      
      service.toggleTheme();
      
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('setTheme()', () => {
    it('debería establecer tema oscuro', () => {
      service = setupTestBed(false);
      
      service.setTheme('dark');
      
      expect(service.isDarkMode()).toBe(true);
      expect(service.getCurrentTheme()).toBe('dark');
    });

    it('debería establecer tema claro', () => {
      service = setupTestBed(true);
      
      service.setTheme('light');
      
      expect(service.isDarkMode()).toBe(false);
      expect(service.getCurrentTheme()).toBe('light');
    });

    it('debería cambiar el estado isDarkMode a true', () => {
      service = setupTestBed(false);
      expect(service.isDarkMode()).toBe(false);
      
      service.setTheme('dark');
      
      expect(service.isDarkMode()).toBe(true);
    });

    it('debería cambiar el estado isDarkMode a false', () => {
      service = setupTestBed(true);
      expect(service.isDarkMode()).toBe(true);
      
      service.setTheme('light');
      
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('getCurrentTheme()', () => {
    it('debería retornar el tema actual correctamente', () => {
      service = setupTestBed(false);
      expect(service.getCurrentTheme()).toBe('light');
      
      service.setTheme('dark');
      expect(service.getCurrentTheme()).toBe('dark');
    });
  });

  describe('clearPreference()', () => {
    it('debería eliminar la preferencia de localStorage', () => {
      service = setupTestBed(false);
      service.setTheme('dark');
      
      service.clearPreference();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('banco-theme');
    });
  });

  describe('Plataforma servidor', () => {
    it('no debería fallar en SSR', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });

      const serverService = TestBed.inject(ThemeService);
      
      expect(() => {
        serverService.toggleTheme();
        serverService.setTheme('dark');
        serverService.clearPreference();
      }).not.toThrow();
    });
  });
});
