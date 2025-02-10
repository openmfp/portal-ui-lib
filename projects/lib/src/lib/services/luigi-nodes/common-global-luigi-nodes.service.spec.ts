import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { I18nService } from '../i18n.service';
import { CommonGlobalLuigiNodesService } from './common-global-luigi-nodes.service';
import { ERROR_COMPONENT_CONFIG } from '../../injection-tokens';
import { EntityType } from '../../models/entity';

describe('CommonGlobalLuigiNodesService', () => {
  let service: CommonGlobalLuigiNodesService;
  let i18nService: I18nService;
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
        provideHttpClient(),
      ],
    });
    service = TestBed.inject(CommonGlobalLuigiNodesService);
    i18nService = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getContentNotFoundGlobalNode', () => {
    it('should return correct error node structure', () => {
      const translationTable = { en: {}, de: {} };
      i18nService.translationTable = translationTable;

      const result = service.getContentNotFoundGlobalNode();

      expect(result).toEqual([
        {
          pathSegment: 'error',
          label: 'Content not found',
          order: '1000',
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
                translationTable,
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
