import { TestBed } from '@angular/core/testing';

import { MaterialWarehouseService } from './material-warehouse.service';

describe('MaterialWarehouseService', () => {
  let service: MaterialWarehouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialWarehouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
