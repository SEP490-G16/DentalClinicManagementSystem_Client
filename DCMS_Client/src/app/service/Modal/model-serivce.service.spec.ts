import { TestBed } from '@angular/core/testing';

import { ModelSerivceService } from './model-serivce.service';

describe('ModelSerivceService', () => {
  let service: ModelSerivceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelSerivceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
