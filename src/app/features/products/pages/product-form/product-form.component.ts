import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';

import { ProductService } from '@core/services/product.service';
import { minDateValidator, uniqueIdValidator } from '@shared/validators/product.validators';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  productForm!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  productId = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupDateRevisionSync();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.productForm = this.fb.group({
      id: [
        '', 
        [
          Validators.required, 
          Validators.minLength(3), 
          Validators.maxLength(10)
        ],
        [uniqueIdValidator(this.productService)]
      ],
      name: [
        '', 
        [
          Validators.required, 
          Validators.minLength(5), 
          Validators.maxLength(100)
        ]
      ],
      description: [
        '', 
        [
          Validators.required, 
          Validators.minLength(10), 
          Validators.maxLength(200)
        ]
      ],
      logo: ['', [Validators.required]],
      date_release: [today, [Validators.required, minDateValidator]],
      date_revision: [{ value: '', disabled: true }, [Validators.required]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    } else {
      // En modo creación, calcular fecha de revisión inicial
      this.calculateRevisionDate(this.productForm.get('date_release')?.value);
    }
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          // Actualizar validador de ID para modo edición
          this.productForm.get('id')?.clearAsyncValidators();
          this.productForm.get('id')?.setAsyncValidators([
            uniqueIdValidator(this.productService, id)
          ]);
          
          this.productForm.patchValue({
            id: product.id,
            name: product.name,
            description: product.description,
            logo: product.logo,
            date_release: product.date_release,
            date_revision: product.date_revision
          });
          
          // Deshabilitar campo ID en modo edición
          this.productForm.get('id')?.disable();
        } else {
          this.error.set('Producto no encontrado');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar el producto');
        this.isLoading.set(false);
      }
    });
  }

  private setupDateRevisionSync(): void {
    this.productForm.get('date_release')?.valueChanges.subscribe((value) => {
      if (value) {
        this.calculateRevisionDate(value);
      }
    });
  }

  private calculateRevisionDate(releaseDate: string): void {
    if (!releaseDate) return;

    const date = new Date(releaseDate);
    date.setFullYear(date.getFullYear() + 1);
    const revisionDate = date.toISOString().split('T')[0];
    
    this.productForm.get('date_revision')?.setValue(revisionDate);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.productForm.getRawValue();
    const product: Product = {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description,
      logo: formValue.logo,
      date_release: formValue.date_release,
      date_revision: formValue.date_revision
    };

    if (this.isEditMode()) {
      this.updateProduct(product);
    } else {
      this.createProduct(product);
    }
  }

  private createProduct(product: Product): void {
    this.productService.createProduct(product).subscribe({
      next: () => {
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al crear el producto');
        this.isSubmitting.set(false);
      }
    });
  }

  private updateProduct(product: Product): void {
    this.productService.updateProduct(product.id, product).subscribe({
      next: () => {
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al actualizar el producto');
        this.isSubmitting.set(false);
      }
    });
  }

  onReset(): void {
    if (this.isEditMode()) {
      const id = this.productId();
      if (id) {
        this.loadProduct(id);
      }
    } else {
      this.productForm.reset();
      const today = new Date().toISOString().split('T')[0];
      this.productForm.patchValue({ date_release: today });
      this.calculateRevisionDate(today);
    }
  }

  private markFormAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para validación en template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'Este campo es requerido!';
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['minDate']) return 'La fecha debe ser igual o mayor a hoy';
    if (errors['idExists']) return 'ID no válido!';

    return 'Campo inválido';
  }
}
