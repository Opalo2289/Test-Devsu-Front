import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '@core/services/product.service';
import { Product } from '../../models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: jest.Mocked<ProductService>;

  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'Tarjeta de Crédito',
      description: 'Tarjeta de crédito con beneficios',
      logo: 'https://example.com/logo1.png',
      date_release: '2025-01-01',
      date_revision: '2026-01-01'
    },
    {
      id: 'prod-2',
      name: 'Cuenta de Ahorros',
      description: 'Cuenta de ahorros con alta rentabilidad',
      logo: 'https://example.com/logo2.png',
      date_release: '2025-02-01',
      date_revision: '2026-02-01'
    },
    {
      id: 'prod-3',
      name: 'Préstamo Personal',
      description: 'Préstamo con tasa preferencial',
      logo: 'https://example.com/logo3.png',
      date_release: '2025-03-01',
      date_revision: '2026-03-01'
    }
  ];

  beforeEach(async () => {
    productServiceMock = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
      deleteProduct: jest.fn().mockReturnValue(of({ message: 'Eliminado' }))
    } as unknown as jest.Mocked<ProductService>;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load products on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(productServiceMock.getProducts).toHaveBeenCalled();
      expect(component.products()).toEqual(mockProducts);
      expect(component.isLoading()).toBe(false);
    }));

    it('should have loading state initially', () => {
      // Before detectChanges, component is not yet initialized
      expect(component.isLoading()).toBe(true);
    });

    it('should handle error when loading products fails', fakeAsync(() => {
      productServiceMock.getProducts.mockReturnValue(
        throwError(() => ({ message: 'Error de red' }))
      );
      
      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('Error de red');
      expect(component.isLoading()).toBe(false);
    }));
  });

  describe('search functionality', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should filter products by name', () => {
      component.searchTerm.set('tarjeta');
      
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].name).toBe('Tarjeta de Crédito');
    });

    it('should filter products by description', () => {
      component.searchTerm.set('rentabilidad');
      
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].id).toBe('prod-2');
    });

    it('should return all products when search is empty', () => {
      component.searchTerm.set('');
      
      expect(component.filteredProducts().length).toBe(3);
    });

    it('should be case insensitive', () => {
      component.searchTerm.set('TARJETA');
      
      expect(component.filteredProducts().length).toBe(1);
    });
  });

  describe('pagination', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should show 5 products by default', () => {
      expect(component.pageSize()).toBe(5);
      expect(component.pageIndex()).toBe(0);
      expect(component.paginatedProducts().length).toBe(3); // Only 3 mock products
      expect(component.totalPages()).toBe(1);
      expect(component.currentPage()).toBe(1);
    });

    it('should update page size correctly', () => {
      component.pageSize.set(10);
      component.pageIndex.set(0);
      expect(component.paginatedProducts().length).toBe(3);
      expect(component.totalPages()).toBe(1);
    });

    it('should show total results count', () => {
      expect(component.totalResults()).toBe(3);
    });

    it('should slice products by pageIndex and pageSize', () => {
      component.pageSize.set(2);
      component.pageIndex.set(0);
      expect(component.paginatedProducts().map(p => p.id)).toEqual(['prod-1', 'prod-2']);

      component.pageIndex.set(1);
      expect(component.paginatedProducts().map(p => p.id)).toEqual(['prod-3']);
      expect(component.currentPage()).toBe(2);
      expect(component.totalPages()).toBe(2);
    });

    it('should reset to first page when search changes', () => {
      component.pageSize.set(2);
      component.pageIndex.set(1);

      const input = document.createElement('input');
      input.value = 'tarjeta';
      component.onSearchChange({ target: input } as unknown as Event);

      expect(component.pageIndex()).toBe(0);
      expect(component.filteredProducts().length).toBe(1);
      expect(component.totalPages()).toBe(1);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('dropdown menu', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should toggle menu on button click', () => {
      expect(component.openMenuId()).toBeNull();
      
      component.toggleMenu('prod-1');
      expect(component.openMenuId()).toBe('prod-1');
      
      component.toggleMenu('prod-1');
      expect(component.openMenuId()).toBeNull();
    });

    it('should switch to different menu', () => {
      component.toggleMenu('prod-1');
      expect(component.openMenuId()).toBe('prod-1');
      
      component.toggleMenu('prod-2');
      expect(component.openMenuId()).toBe('prod-2');
    });

    it('should close menu', () => {
      component.openMenuId.set('prod-1');
      component.closeMenu();
      expect(component.openMenuId()).toBeNull();
    });
  });

  describe('delete functionality', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open delete confirmation modal', () => {
      const product = mockProducts[0];
      component.confirmDelete(product);

      expect(component.showDeleteModal()).toBe(true);
      expect(component.productToDelete()).toEqual(product);
    });

    it('should close delete modal on cancel', () => {
      component.confirmDelete(mockProducts[0]);
      component.cancelDelete();

      expect(component.showDeleteModal()).toBe(false);
      expect(component.productToDelete()).toBeNull();
    });

    it('should delete product and update list', fakeAsync(() => {
      component.confirmDelete(mockProducts[0]);
      component.deleteProduct();
      tick();

      expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('prod-1');
      expect(component.products().find(p => p.id === 'prod-1')).toBeUndefined();
      expect(component.showDeleteModal()).toBe(false);
    }));

    it('should handle delete error', fakeAsync(() => {
      productServiceMock.deleteProduct.mockReturnValue(
        throwError(() => ({ message: 'Error al eliminar' }))
      );

      component.confirmDelete(mockProducts[0]);
      component.deleteProduct();
      tick();

      expect(component.error()).toBe('Error al eliminar');
      expect(component.showDeleteModal()).toBe(false);
    }));
  });

  describe('date formatting', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should format date correctly', () => {
      // The formatDate uses toLocaleDateString which respects local timezone
      // Just verify it returns a string with date components
      const formatted = component.formatDate('2025-01-15');
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
      // Verify it contains year
      expect(formatted).toContain('2025');
    });

    it('should return a valid date string format', () => {
      const formatted = component.formatDate('2025-06-20');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('image error handling', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should hide image on error', () => {
      const mockEvent = {
        target: {
          style: { display: '' }
        }
      } as unknown as Event;

      component.onImageError(mockEvent);
      
      expect((mockEvent.target as HTMLImageElement).style.display).toBe('none');
    });
  });

  describe('track by function', () => {
    it('should return product id', () => {
      const product = mockProducts[0];
      const result = component.trackByProductId(0, product);
      expect(result).toBe('prod-1');
    });
  });
});
