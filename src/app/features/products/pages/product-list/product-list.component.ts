import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '@core/services/product.service';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ConfirmModalComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Estado
  products = signal<Product[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');
  pageSize = signal(5);
  pageIndex = signal(0);
  openMenuId = signal<string | null>(null);

  // Modal de eliminación
  showDeleteModal = signal(false);
  productToDelete = signal<Product | null>(null);
  isDeleting = signal(false);

  // Productos filtrados
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const products = this.products();
    
    if (!term) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  });

  // Productos paginados
  paginatedProducts = computed(() => {
    const size = this.pageSize();
    const pages = this.totalPages();
    const safeIndex = pages === 0 ? 0 : Math.min(this.pageIndex(), pages - 1);

    const start = safeIndex * size;
    const end = start + size;
    return this.filteredProducts().slice(start, end);
  });

  // Total de resultados
  totalResults = computed(() => this.filteredProducts().length);

  // Total de páginas (0 si no hay resultados)
  totalPages = computed(() => {
    const total = this.totalResults();
    const size = this.pageSize();
    return total === 0 ? 0 : Math.ceil(total / size);
  });

  // Página actual (1-based, 0 si no hay resultados)
  currentPage = computed(() => {
    const pages = this.totalPages();
    if (pages === 0) return 0;
    return Math.min(this.pageIndex(), pages - 1) + 1;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.pageIndex.set(0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar los productos');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.pageIndex.set(0);
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.pageIndex.set(0);
  }

  prevPage(): void {
    if (this.pageIndex() <= 0) return;
    this.pageIndex.update(i => Math.max(0, i - 1));
  }

  nextPage(): void {
    const pages = this.totalPages();
    if (pages === 0) return;
    const maxIndex = pages - 1;
    if (this.pageIndex() >= maxIndex) return;
    this.pageIndex.update(i => Math.min(maxIndex, i + 1));
  }

  toggleMenu(productId: string): void {
    if (this.openMenuId() === productId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(productId);
    }
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  editProduct(product: Product): void {
    this.closeMenu();
    this.router.navigate(['/productos/editar', product.id]);
  }

  confirmDelete(product: Product): void {
    this.closeMenu();
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }

  deleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.isDeleting.set(true);

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update(products => 
          products.filter(p => p.id !== product.id)
        );
        // Si al eliminar quedamos fuera del rango de páginas, ajusta.
        const pages = this.totalPages();
        if (pages === 0) {
          this.pageIndex.set(0);
        } else {
          const maxIndex = pages - 1;
          if (this.pageIndex() > maxIndex) this.pageIndex.set(maxIndex);
        }
        this.showDeleteModal.set(false);
        this.productToDelete.set(null);
        this.isDeleting.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al eliminar el producto');
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
