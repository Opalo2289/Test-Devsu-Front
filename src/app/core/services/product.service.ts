import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  Product, 
  ProductResponse, 
  ProductCreateResponse, 
  ProductDeleteResponse 
} from '@features/products/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/bp/productos`;

  /**
   * Obtiene todos los productos financieros
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  /**
   * Crea un nuevo producto financiero
   */
  createProduct(product: Product): Observable<ProductCreateResponse> {
    return this.http.post<ProductCreateResponse>(this.apiUrl, product);
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(id: string, product: Partial<Product>): Observable<ProductCreateResponse> {
    return this.http.put<ProductCreateResponse>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Elimina un producto por su ID
   */
  deleteProduct(id: string): Observable<ProductDeleteResponse> {
    return this.http.delete<ProductDeleteResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Verifica si un ID de producto ya existe
   * Retorna true si existe, false si no existe
   */
  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verificacion/${id}`);
  }
}
