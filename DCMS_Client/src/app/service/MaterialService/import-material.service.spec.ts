import { TestBed } from '@angular/core/testing';

import { ImportMaterialService } from './import-material.service';

describe('ImportMaterialService', () => {
  let service: ImportMaterialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportMaterialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
