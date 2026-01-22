import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'banco-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal reactivo para el estado del tema
  private readonly _isDarkMode = signal<boolean>(false);
  
  // Exponer como readonly para componentes
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    if (this.isBrowser) {
      // Inicializar tema desde localStorage o preferencia del sistema
      this.initializeTheme();

      // Efecto para sincronizar cambios con el DOM y localStorage
      effect(() => {
        const isDark = this._isDarkMode();
        this.applyTheme(isDark ? 'dark' : 'light');
        this.saveThemePreference(isDark ? 'dark' : 'light');
      });

      // Escuchar cambios en preferencia del sistema
      this.listenToSystemPreference();
    }
  }

  /**
   * Alterna entre modo claro y oscuro
   */
  toggleTheme(): void {
    this._isDarkMode.update(isDark => !isDark);
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this._isDarkMode.set(theme === 'dark');
  }

  /**
   * Obtiene el tema actual
   */
  getCurrentTheme(): Theme {
    return this._isDarkMode() ? 'dark' : 'light';
  }

  /**
   * Inicializa el tema basado en localStorage o preferencia del sistema
   */
  private initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    
    if (savedTheme) {
      // Usar tema guardado
      this._isDarkMode.set(savedTheme === 'dark');
    } else {
      // Usar preferencia del sistema
      const prefersDark = this.getSystemPreference();
      this._isDarkMode.set(prefersDark);
    }

    // Aplicar tema inmediatamente (antes del primer render)
    this.applyTheme(this._isDarkMode() ? 'dark' : 'light');
  }

  /**
   * Obtiene la preferencia del sistema operativo
   */
  private getSystemPreference(): boolean {
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Escucha cambios en la preferencia del sistema
   */
  private listenToSystemPreference(): void {
    if (!this.isBrowser) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Solo actualizar si no hay preferencia guardada
      if (!this.getSavedTheme()) {
        this._isDarkMode.set(e.matches);
      }
    });
  }

  /**
   * Aplica el tema al documento HTML
   */
  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Guarda la preferencia de tema en localStorage
   */
  private saveThemePreference(theme: Theme): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage no disponible
    }
  }

  /**
   * Obtiene el tema guardado en localStorage
   */
  private getSavedTheme(): Theme | null {
    if (!this.isBrowser) return null;
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // localStorage no disponible
    }
    return null;
  }

  /**
   * Limpia la preferencia guardada (vuelve a usar preferencia del sistema)
   */
  clearPreference(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
      this._isDarkMode.set(this.getSystemPreference());
    } catch {
      // localStorage no disponible
    }
  }
}
