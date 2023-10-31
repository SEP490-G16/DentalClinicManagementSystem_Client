import { TestBed } from '@angular/core/testing';

import { MedicalProcedureGroupService } from './medical-procedure-group.service';

describe('MedicalProcedureGroupService', () => {
  let service: MedicalProcedureGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalProcedureGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
