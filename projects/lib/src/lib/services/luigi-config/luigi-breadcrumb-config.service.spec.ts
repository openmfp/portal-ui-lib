import { HEADER_BAR_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import {
  HeaderBarConfigService,
  HeaderBarService,
  NodeItem,
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

  it('should return undefined if headerBarConfig is not provided', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [HeaderBarService],
    });

    const noConfigService: HeaderBarService = TestBed.inject(HeaderBarService);
    const result = await noConfigService.getConfig();
    expect(result).toBeUndefined();
  });

  it('should propagate error from config service', async () => {
    const error = new Error('fail');
    headerBarConfigMock.getConfig.mockRejectedValue(error);

    await expect(service.getConfig()).rejects.toThrow('fail');
  });

  it('should return LuigiBreadcrumb with proper renderer', async () => {
    const leftRendererMock = jest.fn();
    const rightRendererMock = jest.fn();
    const mockConfig = {
      pendingItemLabel: 'Test',
      omitRoot: false,
      autoHide: true,
      leftRenderers: [leftRendererMock],
      rightRenderers: [rightRendererMock],
    };
    headerBarConfigMock.getConfig.mockResolvedValue(mockConfig);

    const breadcrumb = await service.getConfig();
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb?.pendingItemLabel).toBe('Test');
    expect(breadcrumb?.omitRoot).toBe(false);

    const container = document.createElement('div');
    const parent = document.createElement('div');
    parent.appendChild(container);

    const nodeItems: NodeItem[] = [{ pathSegment: 'p', label: 'L' }];
    const clickHandler = jest.fn();

    breadcrumb?.renderer(container, nodeItems, clickHandler);

    expect(container.style.display).toBe('flex');
    expect(container.style.position).toBe('static');

    expect(parent.style.display).toBe('flex');
    expect(parent.style.flexDirection).toBe('column');
    expect(parent.style.height).toBe('100%');

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

    expect(container.children.length).toBe(2);
  });

  it('should work with no renderers provided', async () => {
    const mockConfig = {
      pendingItemLabel: 'Empty',
      omitRoot: true,
      autoHide: false,
      leftRenderers: [],
      rightRenderers: [],
    };
    headerBarConfigMock.getConfig.mockResolvedValue(mockConfig);

    const breadcrumb = await service.getConfig();
    const container = document.createElement('div');
    breadcrumb?.renderer(container, [], jest.fn());

    expect(container.children.length).toBe(2);
    expect(container.querySelectorAll('div').length).toBe(2);
  });

  it('should create containers with correct styles', async () => {
    const mockConfig = {
      pendingItemLabel: 'Styles',
      omitRoot: false,
      autoHide: false,
      leftRenderers: [],
      rightRenderers: [],
    };
    headerBarConfigMock.getConfig.mockResolvedValue(mockConfig);

    const breadcrumb = await service.getConfig();
    const container = document.createElement('div');
    breadcrumb?.renderer(container, [], jest.fn());

    const [left, right] = container.children as any as HTMLDivElement[];

    expect(left.style.display).toBe('flex');
    expect(left.style.justifyContent).toBe('flex-start');
    expect(left.style.flexGrow).toBe('1');

    expect(right.style.display).toBe('flex');
    expect(right.style.justifyContent).toBe('flex-end');
  });
});
