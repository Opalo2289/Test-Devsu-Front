import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ProductService } from './product.service';
import { Product } from '@features/products/models/product.model';
import { environment } from '@environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/bp/productos`;

  const mockProducts: Product[] = [
    {
      id: 'test-1',
      name: 'Producto 1',
      description: 'Descripción del producto 1',
      logo: 'https://example.com/logo1.png',
      date_release: '2025-01-01',
      date_revision: '2026-01-01'
    },
    {
      id: 'test-2',
      name: 'Producto 2',
      description: 'Descripción del producto 2',
      logo: 'https://example.com/logo2.png',
      date_release: '2025-02-01',
      date_revision: '2026-02-01'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return an array of products', () => {
      service.getProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProducts });
    });

    it('should return empty array when no products', () => {
      service.getProducts().subscribe(products => {
        expect(products).toEqual([]);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ data: [] });
    });
  });

  describe('getProductById', () => {
    it('should return a single product by ID', () => {
      service.getProductById('test-1').subscribe(product => {
        expect(product).toEqual(mockProducts[0]);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ data: mockProducts });
    });

    it('should return undefined when product not found', () => {
      service.getProductById('non-existent').subscribe(product => {
        expect(product).toBeUndefined();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ data: mockProducts });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', () => {
      const newProduct: Product = {
        id: 'new-1',
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        logo: 'https://example.com/new-logo.png',
        date_release: '2025-06-01',
        date_revision: '2026-06-01'
      };

      service.createProduct(newProduct).subscribe(response => {
        expect(response.message).toBe('Producto agregado exitosamente');
        expect(response.data).toEqual(newProduct);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush({ message: 'Producto agregado exitosamente', data: newProduct });
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', () => {
      const updatedProduct = { ...mockProducts[0], name: 'Producto Actualizado' };

      service.updateProduct('test-1', updatedProduct).subscribe(response => {
        expect(response.message).toBe('Producto actualizado exitosamente');
        expect(response.data.name).toBe('Producto Actualizado');
      });

      const req = httpMock.expectOne(`${apiUrl}/test-1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Producto actualizado exitosamente', data: updatedProduct });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', () => {
      service.deleteProduct('test-1').subscribe(response => {
        expect(response.message).toBe('Producto eliminado correctamente');
      });

      const req = httpMock.expectOne(`${apiUrl}/test-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Producto eliminado correctamente' });
    });
  });

  describe('verifyProductId', () => {
    it('should return true if product ID exists', () => {
      service.verifyProductId('test-1').subscribe(exists => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/verificacion/test-1`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if product ID does not exist', () => {
      service.verifyProductId('non-existent').subscribe(exists => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/verificacion/non-existent`);
      req.flush(false);
    });
  });
});
