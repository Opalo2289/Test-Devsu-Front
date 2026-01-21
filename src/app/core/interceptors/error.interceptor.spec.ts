import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { errorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    const testData = { data: 'test' };

    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual(testData);
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(testData);
  });

  it('should handle 400 Bad Request error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBe('Solicitud inválida');
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ name: 'BadRequestError' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should use custom message from 400 response', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBe('El ID ya existe');
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'El ID ya existe' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 404 Not Found error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBe('Recurso no encontrado');
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('should use custom message from 404 response', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBe('Producto no encontrado');
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Producto no encontrado' }, { status: 404, statusText: 'Not Found' });
  });

  it('should handle 500 Server Error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBe('Error interno del servidor');
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle unknown error status', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(503);
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 503, statusText: 'Service Unavailable' });
  });
});
