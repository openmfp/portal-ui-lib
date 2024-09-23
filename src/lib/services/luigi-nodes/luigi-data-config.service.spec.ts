import { TestBed } from '@angular/core/testing';

import { PortalLuigiDataConfigService } from './luigi-data-config.service';

describe('LuigiDataConfigService', () => {
  let service: PortalLuigiDataConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PortalLuigiDataConfigService],
    });
    service = TestBed.inject(PortalLuigiDataConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
