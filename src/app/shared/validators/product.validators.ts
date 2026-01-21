import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ProductService } from '@core/services/product.service';

/**
 * Validador que verifica que la fecha sea igual o mayor a la fecha actual
 */
export function minDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  // Parse the date parts from the input string (YYYY-MM-DD)
  const [year, month, day] = control.value.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);
  inputDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { minDate: { requiredDate: today.toISOString().split('T')[0] } };
  }

  return null;
}

/**
 * Validador asíncrono que verifica si el ID ya existe
 */
export function uniqueIdValidator(
  productService: ProductService,
  currentId?: string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    // Si estamos editando y el ID no cambió, no validar
    if (currentId && control.value === currentId) {
      return of(null);
    }

    // Debounce de 300ms para evitar muchas peticiones
    return timer(300).pipe(
      switchMap(() => productService.verifyProductId(control.value)),
      map((exists: boolean) => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  };
}
