import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductFormComponent } from './product-form.component';
import { ProductService } from '@core/services/product.service';
import { Product } from '../../models/product.model';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceMock: jest.Mocked<ProductService>;
  let routerMock: jest.Mocked<Router>;
  let activatedRouteMock: { snapshot: { paramMap: { get: jest.Mock } } };

  // Usar fecha futura para evitar errores de validación minDate
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setMonth(futureDate.getMonth() + 1);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  const revisionDate = new Date(futureDate);
  revisionDate.setFullYear(revisionDate.getFullYear() + 1);
  const revisionDateStr = revisionDate.toISOString().split('T')[0];

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Tarjeta de Crédito',
    description: 'Tarjeta de crédito con beneficios especiales',
    logo: 'https://example.com/logo.png',
    date_release: futureDateStr,
    date_revision: revisionDateStr
  };

  const setupTestBed = async (routeParams: { id?: string } = {}) => {
    productServiceMock = {
      getProductById: jest.fn().mockReturnValue(of(mockProduct)),
      createProduct: jest.fn().mockReturnValue(of({ message: 'Creado', data: mockProduct })),
      updateProduct: jest.fn().mockReturnValue(of({ message: 'Actualizado', data: mockProduct })),
      verifyProductId: jest.fn().mockReturnValue(of(false))
    } as unknown as jest.Mocked<ProductService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn((key: string) => routeParams[key as keyof typeof routeParams] || null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, RouterTestingModule, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Create mode', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.productForm.get('id')?.value).toBe('');
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('description')?.value).toBe('');
      expect(component.productForm.get('logo')?.value).toBe('');
    });

    it('should be in create mode', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('should auto-calculate revision date', fakeAsync(() => {
      const releaseDate = '2025-06-15';
      component.productForm.get('date_release')?.setValue(releaseDate);
      tick();

      const revisionDate = component.productForm.get('date_revision')?.value;
      expect(revisionDate).toBe('2026-06-15');
    }));

    describe('validations', () => {
      it('should require ID', () => {
        const idControl = component.productForm.get('id');
        idControl?.setValue('');
        expect(idControl?.hasError('required')).toBe(true);
      });

      it('should require ID minimum 3 characters', () => {
        const idControl = component.productForm.get('id');
        idControl?.setValue('ab');
        expect(idControl?.hasError('minlength')).toBe(true);
      });

      it('should require ID maximum 10 characters', () => {
        const idControl = component.productForm.get('id');
        idControl?.setValue('12345678901');
        expect(idControl?.hasError('maxlength')).toBe(true);
      });

      it('should require name minimum 5 characters', () => {
        const nameControl = component.productForm.get('name');
        nameControl?.setValue('Test');
        expect(nameControl?.hasError('minlength')).toBe(true);
      });

      it('should require name maximum 100 characters', () => {
        const nameControl = component.productForm.get('name');
        nameControl?.setValue('a'.repeat(101));
        expect(nameControl?.hasError('maxlength')).toBe(true);
      });

      it('should require description minimum 10 characters', () => {
        const descControl = component.productForm.get('description');
        descControl?.setValue('Short');
        expect(descControl?.hasError('minlength')).toBe(true);
      });

      it('should require description maximum 200 characters', () => {
        const descControl = component.productForm.get('description');
        descControl?.setValue('a'.repeat(201));
        expect(descControl?.hasError('maxlength')).toBe(true);
      });

      it('should require logo', () => {
        const logoControl = component.productForm.get('logo');
        logoControl?.setValue('');
        expect(logoControl?.hasError('required')).toBe(true);
      });

      it('should validate release date is not in the past', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateControl = component.productForm.get('date_release');
        dateControl?.setValue(yesterday.toISOString().split('T')[0]);
        expect(dateControl?.hasError('minDate')).toBe(true);
      });
    });

    describe('form submission', () => {
      it('should not submit if form is invalid', () => {
        component.onSubmit();
        expect(productServiceMock.createProduct).not.toHaveBeenCalled();
      });

      it('should create product when form is valid', fakeAsync(() => {
        const today = new Date().toISOString().split('T')[0];
        
        component.productForm.patchValue({
          id: 'new-prod',
          name: 'Nuevo Producto',
          description: 'Descripción del nuevo producto financiero',
          logo: 'https://example.com/logo.png',
          date_release: today
        });

        // Clear async validators for test
        component.productForm.get('id')?.clearAsyncValidators();
        component.productForm.get('id')?.updateValueAndValidity();
        tick();

        component.onSubmit();
        tick();

        expect(productServiceMock.createProduct).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
      }));

      it('should handle create error', fakeAsync(() => {
        productServiceMock.createProduct.mockReturnValue(
          throwError(() => ({ message: 'Error al crear' }))
        );

        const today = new Date().toISOString().split('T')[0];
        component.productForm.patchValue({
          id: 'new-prod',
          name: 'Nuevo Producto',
          description: 'Descripción del nuevo producto financiero',
          logo: 'https://example.com/logo.png',
          date_release: today
        });

        component.productForm.get('id')?.clearAsyncValidators();
        component.productForm.get('id')?.updateValueAndValidity();
        tick();

        component.onSubmit();
        tick();

        expect(component.error()).toBe('Error al crear');
        expect(component.isSubmitting()).toBe(false);
      }));
    });

    describe('reset functionality', () => {
      it('should reset form in create mode', () => {
        component.productForm.patchValue({
          id: 'test',
          name: 'Test Product'
        });

        component.onReset();

        expect(component.productForm.get('id')?.value).toBeFalsy();
        expect(component.productForm.get('name')?.value).toBeFalsy();
      });
    });
  });

  describe('Edit mode', () => {
    beforeEach(async () => {
      await setupTestBed({ id: 'prod-1' });
    });

    it('should be in edit mode', fakeAsync(() => {
      tick();
      expect(component.isEditMode()).toBe(true);
    }));

    it('should load existing product', fakeAsync(() => {
      tick();
      expect(productServiceMock.getProductById).toHaveBeenCalledWith('prod-1');
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
    }));

    it('should disable ID field', fakeAsync(() => {
      tick();
      expect(component.productForm.get('id')?.disabled).toBe(true);
    }));

    it('should update product on submit', fakeAsync(() => {
      tick();
      
      // El formulario ya está cargado con el producto, solo modificamos
      component.productForm.get('name')?.setValue('Producto Actualizado');
      
      // Asegurar que el formulario está válido
      component.productForm.get('id')?.clearAsyncValidators();
      component.productForm.get('id')?.updateValueAndValidity();
      fixture.detectChanges();
      tick();

      // Verificar que el formulario es válido antes de enviar
      expect(component.productForm.valid).toBe(true);
      
      component.onSubmit();
      tick();

      expect(productServiceMock.updateProduct).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/productos']);
    }));

    it('should reload product on reset', fakeAsync(() => {
      tick();
      component.productForm.get('name')?.setValue('Modified');
      
      productServiceMock.getProductById.mockClear();
      component.onReset();
      tick();

      expect(productServiceMock.getProductById).toHaveBeenCalledWith('prod-1');
    }));
  });

  describe('Edit mode - product not found', () => {
    it('should handle product not found', async () => {
      const notFoundServiceMock = {
        getProductById: jest.fn().mockReturnValue(of(undefined)),
        createProduct: jest.fn(),
        updateProduct: jest.fn(),
        verifyProductId: jest.fn().mockReturnValue(of(false))
      } as unknown as jest.Mocked<ProductService>;

      const notFoundRouteMock = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue('non-existent')
          }
        }
      };

      await TestBed.configureTestingModule({
        imports: [ProductFormComponent, RouterTestingModule, ReactiveFormsModule],
        providers: [
          { provide: ProductService, useValue: notFoundServiceMock },
          { provide: Router, useValue: { navigate: jest.fn() } },
          { provide: ActivatedRoute, useValue: notFoundRouteMock }
        ]
      }).compileComponents();

      const notFoundFixture = TestBed.createComponent(ProductFormComponent);
      const notFoundComponent = notFoundFixture.componentInstance;
      notFoundFixture.detectChanges();

      await notFoundFixture.whenStable();

      expect(notFoundComponent.error()).toBe('Producto no encontrado');
    });
  });

  describe('helper methods', () => {
    beforeEach(async () => {
      await setupTestBed();
    });

    it('should return correct error message for required', () => {
      component.productForm.get('name')?.setValue('');
      component.productForm.get('name')?.markAsTouched();
      
      expect(component.getFieldError('name')).toBe('Este campo es requerido!');
    });

    it('should return correct error message for minlength', () => {
      component.productForm.get('name')?.setValue('abc');
      component.productForm.get('name')?.markAsTouched();
      
      expect(component.getFieldError('name')).toContain('Mínimo');
    });

    it('should identify invalid field correctly', () => {
      component.productForm.get('name')?.setValue('');
      component.productForm.get('name')?.markAsTouched();
      
      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('should not identify valid field as invalid', () => {
      component.productForm.get('name')?.setValue('Valid Product Name');
      
      expect(component.isFieldInvalid('name')).toBe(false);
    });
  });
});
