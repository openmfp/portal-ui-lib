import { NodeChangeHookConfigServiceImpl } from './node-change-hook-config.service';
import { LuigiCoreService } from '../luigi-core.service';
import { HelpContext, LuigiNode } from '../../models/luigi';

describe('NodeChangeHookConfigServiceImpl', () => {
  let service: NodeChangeHookConfigServiceImpl;
  let mockLuigiCoreService: jest.Mocked<LuigiCoreService>;

  beforeEach(() => {
    mockLuigiCoreService = {
      navigation: jest.fn().mockReturnValue({
        navigate: jest.fn(),
      }),
    } as unknown as jest.Mocked<LuigiCoreService>;

    service = new NodeChangeHookConfigServiceImpl(mockLuigiCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('nodeChangeHook', () => {
    it('should navigate to initialRoute if conditions are met', () => {
      const prevNode: LuigiNode = {};
      const nextNode: LuigiNode = {
        initialRoute: '/initial-route',
        virtualTree: true,
      };
      const ctx = { helpContext: {} as HelpContext };

      service.nodeChangeHook(prevNode, nextNode, ctx);

      expect(mockLuigiCoreService.navigation().navigate).toHaveBeenCalledWith(
        '/initial-route'
      );
    });

    it('should not navigate if initialRoute is not set', () => {
      const prevNode: LuigiNode = {};
      const nextNode: LuigiNode = {
        virtualTree: true,
      };
      const ctx = { helpContext: {} as HelpContext };

      service.nodeChangeHook(prevNode, nextNode, ctx);

      expect(mockLuigiCoreService.navigation().navigate).not.toHaveBeenCalled();
    });

    it('should not navigate if virtualTree is not set', () => {
      const prevNode: LuigiNode = {};
      const nextNode: LuigiNode = {
        initialRoute: '/initial-route',
      };
      const ctx = { helpContext: {} as HelpContext };

      service.nodeChangeHook(prevNode, nextNode, ctx);

      expect(mockLuigiCoreService.navigation().navigate).not.toHaveBeenCalled();
    });

    it('should not navigate if _virtualTree is set', () => {
      const prevNode: LuigiNode = {};
      const nextNode: LuigiNode = {
        initialRoute: '/initial-route',
        virtualTree: true,
        _virtualTree: true,
      } as LuigiNode & { _virtualTree: boolean };
      const ctx = { helpContext: {} as HelpContext };

      service.nodeChangeHook(prevNode, nextNode, ctx);

      expect(mockLuigiCoreService.navigation().navigate).not.toHaveBeenCalled();
    });
  });
});
