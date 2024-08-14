import { NodeUtilsService } from './node-utils.service';
import { LuigiCoreService } from '../luigi-core.service';
import { HelpContext, LuigiNode } from '../../models/luigi';

describe('NodeUtilsService', () => {
  let service: NodeUtilsService;
  let mockLuigiCoreService: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    mockLuigiCoreService = {
      isFeatureToggleActive: jest.fn(),
    } as unknown as jest.Mocked<LuigiCoreService>;

    service = new NodeUtilsService(mockLuigiCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('retrieveHelpContext', () => {
    it('should set the helpContext on the node and return true', () => {
      const helpContext: HelpContext = { displayName: 'Test Help' };
      const node: LuigiNode = { context: {} };

      const result = service.retrieveHelpContext(helpContext)(node);

      expect(result).toBe(true);
      expect(node.context.helpContext).toEqual(helpContext);
    });
  });

  describe('isVisible', () => {
    it('should return true if visibleForFeatureToggles is not set', () => {
      const node: LuigiNode = {};
      expect(service.isVisible(node)).toBe(true);
    });

    it('should return true if all feature toggles are active', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['feature1', 'feature2'],
      };
      mockLuigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      expect(service.isVisible(node)).toBe(true);
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature1'
      );
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature2'
      );
    });

    it('should return false if any feature toggle is inactive', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['feature1', 'feature2'],
      };
      mockLuigiCoreService.isFeatureToggleActive
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      expect(service.isVisible(node)).toBe(false);
    });

    it('should handle negated feature toggles correctly', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['!feature1', 'feature2'],
      };
      mockLuigiCoreService.isFeatureToggleActive
        .mockReturnValueOnce(false) // for 'feature1'
        .mockReturnValueOnce(true); // for 'feature2'

      expect(service.isVisible(node)).toBe(true);
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature1'
      );
      expect(mockLuigiCoreService.isFeatureToggleActive).toHaveBeenCalledWith(
        'feature2'
      );
    });

    it('should return false if a negated feature toggle is active', () => {
      const node: LuigiNode = {
        visibleForFeatureToggles: ['!feature1', 'feature2'],
      };
      mockLuigiCoreService.isFeatureToggleActive.mockReturnValue(true);

      expect(service.isVisible(node)).toBe(false);
    });
  });
});
