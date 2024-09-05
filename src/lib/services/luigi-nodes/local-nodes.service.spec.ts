import { NoopLocalNodesService } from './local-nodes.service';
import { LuigiNode } from '../../models';

describe('NoopLocalNodesService', () => {
  let service: NoopLocalNodesService;

  beforeEach(() => {
    service = new NoopLocalNodesService();
  });

  describe('getLocalNodes', () => {
    it('should return an empty array', async () => {
      const localNodes = await service.getLocalNodes();
      expect(localNodes).toEqual([]);
    });
  });

  describe('replaceServerNodesWithLocalOnes', () => {
    it('should return the original server nodes', async () => {
      const serverNodes: LuigiNode[] = [
        { label: 'Node 1', pathSegment: '/node1' },
        { label: 'Node 2', pathSegment: '/node2' },
      ];
      const currentEntities = ['entity1', 'entity2'];

      const replacedNodes = await service.replaceServerNodesWithLocalOnes(
        serverNodes,
        currentEntities
      );

      expect(replacedNodes).toEqual(serverNodes);
    });
  });
});
