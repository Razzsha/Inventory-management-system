/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CommonLoginService } from './common-login.service';

describe('Service: CommonLogin', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonLoginService]
    });
  });

  it('should ...', inject([CommonLoginService], (service: CommonLoginService) => {
    expect(service).toBeTruthy();
  }));
});
