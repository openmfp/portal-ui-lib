import { LuigiNode, NodeContext } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { NodeUtilsService } from './node-utils.service';
import { MockedObject } from 'vitest';

describe('NodeUtilsService', () => {
  let service: NodeUtilsService;
  let mockLuigiCoreService: MockedObject<LuigiCoreService>;

  beforeEach(() => {
    mockLuigiCoreService = {
      isFeatureToggleActive: vi.fn(),
      getGlobalContext: vi.fn(),
    } as unknown as MockedObject<LuigiCoreService>;

    service = new NodeUtilsService(mockLuigiCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('retrieveHelpContext', () => {
    it('should set the helpContext on the node and return true', () => {
      const context = { helpContext: { displayName: 'Test Help' } } as any;
      const node: LuigiNode = { context: {} as NodeContext };
      mockLuigiCoreService.getGlobalContext.mockReturnValue(context);

      const result = service.retrieveGlobalHelpContext()(node);

      expect(result).toBe(true);
      expect(node.context?.helpContext).toEqual(context.helpContext);
    });
  });

  describe('isVisible', () => {
    it('should return true if visibleForFeatureToggles is not set', () => {
      const node: LuigiNode = { context: {} as NodeContext };
      expect(service.isVisible(node)).toBe(true);
    });

    it('should return true if all feature toggles are active', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['feature1', 'feature2'],
        context: {} as NodeContext,
      };
      mockLuigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      expect(service.isVisible(node)).toBe(true);
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature1',
      );
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature2',
      );
    });

    it('should return false if any feature toggle is inactive', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['feature1', 'feature2'],
        context: {} as NodeContext,
      };
      mockLuigiCoreService.isFeatureToggleActive
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(service.isVisible(node)).toBe(false);
    });

    it('should handle negated feature toggles correctly', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['!feature1', 'feature2'],
        context: {} as NodeContext,
      };
      mockLuigiCoreService.isFeatureToggleActive
        .mockReturnValueOnce(false) // for 'feature1'
        .mockReturnValueOnce(true); // for 'feature2'

      expect(service.isVisible(node)).toBe(true);
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature1',
      );
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature2',
      );
    });

    it('should return false if a negated feature toggle is active', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['!feature1', 'feature2'],
        context: {} as NodeContext,
      };
      mockLuigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      expect(service.isVisible(node)).toBe(false);
    });
  });
});
