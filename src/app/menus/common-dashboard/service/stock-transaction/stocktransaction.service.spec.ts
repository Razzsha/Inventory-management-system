/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StocktransactionService } from './stocktransaction.service';

describe('Service: Stocktransaction', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StocktransactionService]
    });
  });

  it('should ...', inject([StocktransactionService], (service: StocktransactionService) => {
    expect(service).toBeTruthy();
  }));
});
