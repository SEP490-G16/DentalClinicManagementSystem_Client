import { TestBed } from '@angular/core/testing';

import { PaidMaterialUsageService } from './paid-material-usage.service';

describe('PaidMaterialUsageService', () => {
  let service: PaidMaterialUsageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaidMaterialUsageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
