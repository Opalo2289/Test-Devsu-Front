import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { HeaderComponent } from './header.component';
import { ThemeService } from '@core/services/theme.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let themeServiceMock: Partial<ThemeService>;

  beforeEach(async () => {
    themeServiceMock = {
      isDarkMode: signal(false).asReadonly(),
      toggleTheme: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header element', () => {
    const header = fixture.debugElement.query(By.css('.header'));
    expect(header).not.toBeNull();
  });

  it('should display BANCO title', () => {
    const title = fixture.debugElement.query(By.css('.header__title'));
    expect(title.nativeElement.textContent).toBe('BANCO');
  });

  it('should have a logo link that navigates to /productos', () => {
    const logoLink = fixture.debugElement.query(By.css('.header__logo'));
    expect(logoLink.attributes['routerLink']).toBe('/productos');
  });

  it('should render bank icon SVG', () => {
    const icon = fixture.debugElement.query(By.css('.header__icon'));
    expect(icon).not.toBeNull();
    expect(icon.nativeElement.tagName.toLowerCase()).toBe('svg');
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      const toggleButton = fixture.debugElement.query(By.css('.theme-toggle'));
      expect(toggleButton).not.toBeNull();
    });

    it('should call toggleTheme when button is clicked', () => {
      const toggleButton = fixture.debugElement.query(By.css('.theme-toggle'));
      toggleButton.nativeElement.click();
      
      expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
    });

    it('should show moon icon in light mode', () => {
      fixture.detectChanges();
      
      const icon = fixture.debugElement.query(By.css('.theme-toggle__icon'));
      expect(icon).not.toBeNull();
    });

    it('should have correct aria-label in light mode', () => {
      const toggleButton = fixture.debugElement.query(By.css('.theme-toggle'));
      expect(toggleButton.attributes['aria-label']).toBe('Cambiar a modo oscuro');
    });
  });
});
