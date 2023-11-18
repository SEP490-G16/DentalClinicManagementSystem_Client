import { TestBed } from '@angular/core/testing';

import { MaterialUsageReportService } from './material-usage-report.service';

describe('MaterialUsageReportService', () => {
  let service: MaterialUsageReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialUsageReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
