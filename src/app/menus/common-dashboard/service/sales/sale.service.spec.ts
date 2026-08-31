/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SaleService } from './sale.service';

describe('Service: Sale', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaleService]
    });
  });

  it('should ...', inject([SaleService], (service: SaleService) => {
    expect(service).toBeTruthy();
  }));
});
