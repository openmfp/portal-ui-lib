import { kcpRootOrgsPath } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { GatewayService } from '../resource';
import { NodeChangeHookConfigServiceImpl } from './node-change-hook-config.service';
import { TestBed } from '@angular/core/testing';

describe('NodeChangeHookConfigServiceImpl', () => {
  let service: NodeChangeHookConfigServiceImpl;
  let mockLuigiCoreService: any;
  let mockGatewayService: any;

  beforeEach(() => {
    mockLuigiCoreService = {
      navigation: jest.fn().mockReturnValue({
        navigate: jest.fn(),
      }),
      getGlobalContext: jest.fn().mockReturnValue({ organization: 'org1' }),
    };

    mockGatewayService = {
      updateCrdGatewayUrlWithEntityPath: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NodeChangeHookConfigServiceImpl,
        { provide: LuigiCoreService, useValue: mockLuigiCoreService },
        { provide: GatewayService, useValue: mockGatewayService },
      ],
    });

    service = TestBed.inject(NodeChangeHookConfigServiceImpl);
  });

  it('should navigate when initialRoute and virtualTree exist and _virtualTree does not exist', () => {
    const prevNode = {} as any;
    const nextNode = {
      initialRoute: '/some/path',
      virtualTree: true,
      context: {},
    } as any;

    service.nodeChangeHook(prevNode, nextNode);

    expect(mockLuigiCoreService.navigation().navigate).toHaveBeenCalledWith(
      '/some/path',
    );
  });

  it('should call update the crd gateway url constructed kcp path, based on the succession of entities read', () => {
    const prevNode = {} as any;
    const nextNode = {
      context: {
        entityContext: {
          account: {
            id: 'child',
          },
        },
      },
      parent: {
        context: {
          entityContext: {
            account: {
              id: 'parent-2',
            },
          },
        },
        parent: {
          context: {},
          parent: {
            context: {
              entityContext: {
                account: {
                  id: 'parent-1',
                },
              },
            },
            parent: {
              context: {
                entityContext: {
                  account: {
                    id: 'parent-0',
                  },
                },
              },
            },
          },
        },
      },
    } as any;

    service.nodeChangeHook(prevNode, nextNode);

    expect(
      mockGatewayService.updateCrdGatewayUrlWithEntityPath,
    ).toHaveBeenCalledWith('root:orgs:org1:parent-0:parent-1:parent-2:child');
  });

  it('should use context.kcpPath if present', () => {
    const prevNode = {} as any;
    const nextNode = {
      context: {
        kcpPath: 'custom/path',
      },
      parent: null,
    } as any;

    service.nodeChangeHook(prevNode, nextNode);

    expect(
      mockGatewayService.updateCrdGatewayUrlWithEntityPath,
    ).toHaveBeenCalledWith('custom/path');
  });
});
