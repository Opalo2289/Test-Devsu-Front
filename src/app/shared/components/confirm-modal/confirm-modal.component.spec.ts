import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when closed', () => {
    beforeEach(() => {
      component.isOpen = false;
      fixture.detectChanges();
    });

    it('should not render modal', () => {
      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(overlay).toBeNull();
    });
  });

  describe('when open', () => {
    beforeEach(() => {
      component.isOpen = true;
      component.message = '¿Estás seguro de eliminar este producto?';
      fixture.detectChanges();
    });

    it('should render modal', () => {
      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(overlay).not.toBeNull();
    });

    it('should display message', () => {
      const message = fixture.debugElement.query(By.css('.modal__message'));
      expect(message.nativeElement.textContent).toContain('¿Estás seguro de eliminar este producto?');
    });

    it('should display custom button texts', () => {
      component.confirmText = 'Eliminar';
      component.cancelText = 'No, cancelar';
      fixture.detectChanges();

      const confirmBtn = fixture.debugElement.query(By.css('.modal__btn--confirm'));
      const cancelBtn = fixture.debugElement.query(By.css('.modal__btn--cancel'));

      expect(confirmBtn.nativeElement.textContent).toContain('Eliminar');
      expect(cancelBtn.nativeElement.textContent).toContain('No, cancelar');
    });

    it('should emit confirm event when confirm button clicked', () => {
      const confirmSpy = jest.spyOn(component.confirm, 'emit');
      const confirmBtn = fixture.debugElement.query(By.css('.modal__btn--confirm'));
      
      confirmBtn.nativeElement.click();
      
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should emit cancel event when cancel button clicked', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');
      const cancelBtn = fixture.debugElement.query(By.css('.modal__btn--cancel'));
      
      cancelBtn.nativeElement.click();
      
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should emit cancel event when overlay clicked', () => {
      const cancelSpy = jest.spyOn(component.cancel, 'emit');
      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      
      overlay.nativeElement.click();
      
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should not emit events when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const confirmSpy = jest.spyOn(component.confirm, 'emit');
      const cancelSpy = jest.spyOn(component.cancel, 'emit');
      
      const confirmBtn = fixture.debugElement.query(By.css('.modal__btn--confirm'));
      const cancelBtn = fixture.debugElement.query(By.css('.modal__btn--cancel'));
      
      confirmBtn.nativeElement.click();
      cancelBtn.nativeElement.click();
      
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(cancelSpy).not.toHaveBeenCalled();
    });

    it('should show spinner when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.modal__spinner'));
      expect(spinner).not.toBeNull();
    });
  });
});
