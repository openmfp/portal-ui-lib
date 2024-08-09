import { NoopUserSettingsConfigService } from './user-settings-config.service';
import { LuigiNode } from '../../models/luigi';

describe('NoopUserSettingsConfigService', () => {
  let service: NoopUserSettingsConfigService;

  beforeEach(() => {
    service = new NoopUserSettingsConfigService();
  });

  describe('getUserSettings', () => {
    it('should return undefined', async () => {
      const mockLuigiNodes: Record<string, LuigiNode[]> = {
        category1: [{ label: 'Node 1' }, { label: 'Node 2' }],
        category2: [{ label: 'Node 3' }],
      };

      const result = await service.getUserSettings(mockLuigiNodes);

      expect(result).toBeUndefined();
    });

    it('should return undefined even with empty input', async () => {
      const emptyLuigiNodes: Record<string, LuigiNode[]> = {};

      const result = await service.getUserSettings(emptyLuigiNodes);

      expect(result).toBeUndefined();
    });

    it('should return a Promise that resolves to undefined', () => {
      const mockLuigiNodes: Record<string, LuigiNode[]> = {
        category: [{ label: 'Node' }],
      };

      expect(service.getUserSettings(mockLuigiNodes)).resolves.toBeUndefined();
    });
  });
});
