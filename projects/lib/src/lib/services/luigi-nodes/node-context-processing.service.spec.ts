import { LuigiCoreService } from '../luigi-core.service';
import { ResourceService } from '../resource';
import { NodeContextProcessingService } from './node-context-processing.service';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

describe('NodeContextProcessingService', () => {
  let service: NodeContextProcessingService;
  let mockResourceService: any;
  let mockLuigiCoreService: any;

  beforeEach(() => {
    mockResourceService = {
      read: jest.fn(),
    };

    mockLuigiCoreService = {
      getGlobalContext: jest.fn().mockReturnValue({}),
    };

    TestBed.configureTestingModule({
      providers: [
        NodeContextProcessingService,
        { provide: ResourceService, useValue: mockResourceService },
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
      ],
    });

    service = TestBed.inject(NodeContextProcessingService);
  });

  describe('readAndStoreEntityInNodeContext', () => {
    it('should not call read if required params are missing', () => {
      const node = { defineEntity: null } as any;
      const ctx = {} as any;
      service.readAndStoreEntityInNodeContext('', node, ctx);
      expect(mockResourceService.read).not.toHaveBeenCalled();
    });

    it('should call resourceService.read with correct parameters', () => {
      const entityId = 'entity123';
      const entity = { metadata: { name: 'entity123' } };

      const node: any = {
        defineEntity: {
          graphqlEntity: {
            group: 'test.group',
            kind: 'Account',
            query: '{ metadata { name } }',
          },
        },
        context: {},
      };

      const ctx: any = {};

      mockResourceService.read.mockReturnValue(of(entity));

      service.readAndStoreEntityInNodeContext(entityId, node, ctx);

      expect(mockResourceService.read).toHaveBeenCalledWith(
        'entity123',
        'test_group',
        'Account',
        'query ($name: String!) { test_group { Account(name: $name) { metadata { name } } }}',
        {},
      );

      expect(ctx.entity).toEqual(entity);
      expect(node.context.entity).toEqual(entity);
    });

    it('should use default values when defineEntity properties are missing', () => {
      const entityId = 'entity456';
      const entity = { metadata: { name: 'entity456' } };

      const node: any = {
        defineEntity: {},
        context: {},
      };

      const ctx: any = {};

      mockResourceService.read.mockReturnValue(of(entity));

      service.readAndStoreEntityInNodeContext(entityId, node, ctx);

      expect(mockResourceService.read).toHaveBeenCalledWith(
        'entity456',
        'core_openmfp_org',
        'Account',
        'query ($name: String!) { core_openmfp_org { Account(name: $name) { metadata { name annotations }} }}',
        {},
      );

      expect(ctx.entity).toEqual(entity);
      expect(node.context.entity).toEqual(entity);
    });

    it('should handle errors gracefully and log to console', (done) => {
      const entityId = 'entity789';

      const node: any = {
        defineEntity: {
          graphqlEntity: {
            group: 'broken.group',
            kind: 'Thing',
            query: '{ metadata { id } }',
          },
        },
        context: {},
      };

      const ctx: any = {};

      const error = new Error('Test error');
      mockResourceService.read.mockReturnValue(throwError(() => error));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.readAndStoreEntityInNodeContext(entityId, node, ctx);

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Not able to read entity entity789 from broken_group',
        );
        consoleSpy.mockRestore();
        done();
      }, 0);
    });
  });
});
