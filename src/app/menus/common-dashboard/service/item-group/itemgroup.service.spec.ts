/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ItemgroupService } from './itemgroup.service';

describe('Service: Itemgroup', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ItemgroupService]
    });
  });

  it('should ...', inject([ItemgroupService], (service: ItemgroupService) => {
    expect(service).toBeTruthy();
  }));
});
