import { TestBed } from '@angular/core/testing';

import { NoopLuigiDataConfigService } from './luigi-data-config.service';

describe('LuigiDataConfigService', () => {
  let service: NoopLuigiDataConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoopLuigiDataConfigService],
    });
    service = TestBed.inject(NoopLuigiDataConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
