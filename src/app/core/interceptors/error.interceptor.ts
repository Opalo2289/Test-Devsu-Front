import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Error del cliente
        errorMessage = error.error.message;
      } else {
        // Error del servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Solicitud inválida';
            break;
          case 404:
            errorMessage = error.error?.message || 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status}`;
        }
      }

      console.error('Error HTTP:', errorMessage, error);
      return throwError(() => ({ message: errorMessage, status: error.status, error: error.error }));
    })
  );
};
