/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PqGridService } from './pq-grid.service';

describe('Service: PqGrid', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PqGridService]
    });
  });

  it('should ...', inject([PqGridService], (service: PqGridService) => {
    expect(service).toBeTruthy();
  }));
});
