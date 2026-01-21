import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule]
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
});
