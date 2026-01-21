import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from '@shared/components/header/header.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, HeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have title banco-productos', () => {
    expect(component.title).toBe('banco-productos');
  });

  it('should render header component', () => {
    const header = fixture.debugElement.query(By.css('app-header'));
    expect(header).not.toBeNull();
  });

  it('should render router outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).not.toBeNull();
  });

  it('should have main content container', () => {
    const mainContent = fixture.debugElement.query(By.css('.main-content'));
    expect(mainContent).not.toBeNull();
  });
});
