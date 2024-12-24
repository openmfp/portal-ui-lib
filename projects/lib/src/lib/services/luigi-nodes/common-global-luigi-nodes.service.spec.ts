import { TestBed } from '@angular/core/testing';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { ERROR_COMPONENT_CONFIG } from '../../injection-tokens';
import { EntityType } from '../../models/entity';

describe('CommonGlobalLuigiNodesService', () => {
  let service: CommonGlobalLuigiNodesService;
  const mockErrorConfig = {
    someConfig: { property: 'value' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ERROR_COMPONENT_CONFIG,
          useValue: mockErrorConfig,
        },
      ],
    });
    service = TestBed.inject(CommonGlobalLuigiNodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getContentNotFoundGlobalNode', () => {
    it('should return correct error node structure', () => {
      const result = service.getContentNotFoundGlobalNode();

      expect(result).toEqual([
        {
          pathSegment: 'error',
          label: 'Content not found',
          hideFromNav: true,
          children: [
            {
              pathSegment: ':id',
              entityType: EntityType.ENTITY_ERROR,
              hideFromNav: true,
              hideSideNav: true,
              viewUrl: '/assets/openmfp-portal-ui-wc.js#error-component',
              context: {
                error: {
                  code: 404,
                  errorComponentConfig: mockErrorConfig,
                },
              },
              webcomponent: {
                selfRegistered: true,
              },
            },
          ],
        },
      ]);
    });
  });
});
