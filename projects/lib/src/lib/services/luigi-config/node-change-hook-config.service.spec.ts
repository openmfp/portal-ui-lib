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

  it('should call updateCrdGatewayUrlWithEntityPath with constructed path', () => {
    const prevNode = {} as any;
    const nextNode = {
      context: {},
      parent: {
        context: {
          entityContext: {
            account: {
              id: 'acc123',
            },
          },
        },
        parent: null,
      },
    } as any;

    service.nodeChangeHook(prevNode, nextNode);

    expect(
      mockGatewayService.updateCrdGatewayUrlWithEntityPath,
    ).toHaveBeenCalledWith(`${kcpRootOrgsPath}:org1:acc123`);
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
