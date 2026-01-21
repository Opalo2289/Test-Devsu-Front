import { FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

import { minDateValidator, uniqueIdValidator } from './product.validators';
import { ProductService } from '@core/services/product.service';

describe('Product Validators', () => {
  describe('minDateValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const result = minDateValidator(control);
      expect(result).toBeNull();
    });

    it('should return null for today date', () => {
      // Use a date string format that won't have timezone issues
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const control = new FormControl(todayStr);
      const result = minDateValidator(control);
      expect(result).toBeNull();
    });

    it('should return null for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const year = futureDate.getFullYear();
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const futureDateStr = `${year}-${month}-${day}`;
      
      const control = new FormControl(futureDateStr);
      const result = minDateValidator(control);
      expect(result).toBeNull();
    });

    it('should return error for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const year = pastDate.getFullYear();
      const month = String(pastDate.getMonth() + 1).padStart(2, '0');
      const day = String(pastDate.getDate()).padStart(2, '0');
      const pastDateStr = `${year}-${month}-${day}`;
      
      const control = new FormControl(pastDateStr);
      const result = minDateValidator(control);
      expect(result).not.toBeNull();
      expect(result?.['minDate']).toBeDefined();
    });
  });

  describe('uniqueIdValidator', () => {
    let mockProductService: jest.Mocked<ProductService>;

    beforeEach(() => {
      mockProductService = {
        verifyProductId: jest.fn()
      } as unknown as jest.Mocked<ProductService>;
    });

    it('should return null for empty value', fakeAsync(() => {
      const validator = uniqueIdValidator(mockProductService);
      const control = new FormControl('');
      
      let result: unknown;
      validator(control).subscribe(r => result = r);
      tick();
      
      expect(result).toBeNull();
    }));

    it('should return null for value less than 3 characters', fakeAsync(() => {
      const validator = uniqueIdValidator(mockProductService);
      const control = new FormControl('ab');
      
      let result: unknown;
      validator(control).subscribe(r => result = r);
      tick();
      
      expect(result).toBeNull();
    }));

    it('should return null if editing same ID', fakeAsync(() => {
      const validator = uniqueIdValidator(mockProductService, 'existing-id');
      const control = new FormControl('existing-id');
      
      let result: unknown;
      validator(control).subscribe(r => result = r);
      tick();
      
      expect(result).toBeNull();
    }));

    it('should return idExists error if ID exists', fakeAsync(() => {
      mockProductService.verifyProductId.mockReturnValue(of(true));
      const validator = uniqueIdValidator(mockProductService);
      const control = new FormControl('new-id');
      
      let result: unknown;
      validator(control).subscribe(r => result = r);
      tick(350);
      
      expect(result).toEqual({ idExists: true });
    }));

    it('should return null if ID does not exist', fakeAsync(() => {
      mockProductService.verifyProductId.mockReturnValue(of(false));
      const validator = uniqueIdValidator(mockProductService);
      const control = new FormControl('new-id');
      
      let result: unknown;
      validator(control).subscribe(r => result = r);
      tick(350);
      
      expect(result).toBeNull();
    }));

    it('should return null on error', fakeAsync(() => {
      mockProductService.verifyProductId.mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      const validator = uniqueIdValidator(mockProductService);
      const control = new FormControl('test-id');
      
      let result: unknown;
      validator(control).subscribe(r => result = r);
      tick(350);
      
      expect(result).toBeNull();
    }));
  });
});
