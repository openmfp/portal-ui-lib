import { HEADER_BAR_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode } from '../../models';
import {
  HeaderBarConfigService,
  HeaderBarService,
} from './luigi-breadcrumb-config.service';
import { TestBed } from '@angular/core/testing';
import { MockProxy, mock } from 'jest-mock-extended';

describe('HeaderBarService', () => {
  let service: HeaderBarService;
  let headerBarConfigMock: MockProxy<HeaderBarConfigService>;

  beforeEach(() => {
    headerBarConfigMock = mock<HeaderBarConfigService>();

    TestBed.configureTestingModule({
      providers: [
        HeaderBarService,
        {
          provide: HEADER_BAR_CONFIG_SERVICE_INJECTION_TOKEN,
          useValue: headerBarConfigMock,
        },
      ],
    });

    service = TestBed.inject(HeaderBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBreadcrumbsConfig', () => {
    it('should return undefined if headerBarConfig is not provided', async () => {
      const headerBarServiceWithoutConfig = TestBed.inject(HeaderBarService);
      (headerBarServiceWithoutConfig as any).headerBarConfig = undefined;

      const result = await headerBarServiceWithoutConfig.getBreadcrumbsConfig();
      expect(result).toBeUndefined();
    });

    it('should return a LuigiBreadcrumb object with a custom renderer', async () => {
      const leftRendererMock = jest.fn();
      const rightRendererMock = jest.fn();
      const mockConfig = {
        pendingItemLabel: 'Test Label',
        omitRoot: false,
        autoHide: true,
        leftRenderers: [leftRendererMock],
        rightRenderers: [rightRendererMock],
      };

      headerBarConfigMock.getConfig.mockResolvedValue(mockConfig);

      const result = await service.getBreadcrumbsConfig();

      expect(result).toBeDefined();
      expect(result.pendingItemLabel).toBe('Test Label');
      expect(result.omitRoot).toBe(false);
      expect(result.autoHide).toBe(true);
      expect(result.renderer).toBeInstanceOf(Function);

      if (result) {
        const container = document.createElement('div');
        const nodeItems: LuigiNode[] = [{ pathSegment: 'test', label: 'Test' }];
        const clickHandler = () => {};

        const renderedContainer = result.renderer(
          container,
          nodeItems,
          clickHandler,
        );

        expect(renderedContainer.style.display).toBe('flex');
        expect(renderedContainer.style.width).toBe('calc(100% - 72px)');

        expect(leftRendererMock).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          nodeItems,
          clickHandler,
        );
        expect(rightRendererMock).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          nodeItems,
          clickHandler,
        );
      }
    });

    it('should handle multiple renderers', async () => {
      const leftRendererMock1 = jest.fn();
      const leftRendererMock2 = jest.fn();
      const mockConfig = {
        pendingItemLabel: 'Test',
        omitRoot: false,
        autoHide: true,
        leftRenderers: [leftRendererMock1, leftRendererMock2],
        rightRenderers: [],
      };

      headerBarConfigMock.getConfig.mockResolvedValue(mockConfig);

      const result = await service.getBreadcrumbsConfig();

      if (result) {
        const container = document.createElement('div');
        const nodeItems: LuigiNode[] = [];
        const clickHandler = () => {};

        result.renderer(container, nodeItems, clickHandler);

        expect(leftRendererMock1).toHaveBeenCalled();
        expect(leftRendererMock2).toHaveBeenCalled();
        expect(container.children[0].children.length).toBe(2);
      }
    });
  });
});
