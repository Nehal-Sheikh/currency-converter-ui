import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const networkErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 0) {
        errorMessage = 'Network error: Please check your internet connection';
      } else if (error.status >= 500) {
        errorMessage = 'Server error: Something went wrong on our side';
      }
      console.error(errorMessage, error);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
