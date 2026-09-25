import { LuigiNode, NetworkVisibility, NodeContext } from '../../models';
import { I18nService } from '../i18n.service';
import { EnvConfigService } from '../portal';
import { VPNService } from './vpn.service';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockedObject } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('VPNService', () => {
  let envConfigServiceMock: MockedObject<EnvConfigService>;
  let i18nServiceMock: MockedObject<I18nService>;
  let fetchMock: ReturnType<typeof vi.fn>;

  const createService = () => {
    TestBed.configureTestingModule({
      providers: [
        VPNService,
        { provide: EnvConfigService, useValue: envConfigServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
      ],
    });
    return TestBed.inject(VPNService);
  };

  beforeEach(() => {
    envConfigServiceMock = mock();
    i18nServiceMock = mock();
    i18nServiceMock.translationTable = { en: {} };
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks the user as in VPN when no vpnCheckUrl is configured', async () => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({} as any);

    const service = createService();
    await service.whenReady();

    expect(fetchMock).not.toHaveBeenCalled();
    const node: LuigiNode = {
      networkVisibility: NetworkVisibility.INTERNAL,
      context: {} as NodeContext,
    };
    expect(service.applyNetworkVisibility(node)).toBe(node);
  });

  it('marks the user as in VPN when the env config cannot be read', async () => {
    envConfigServiceMock.getEnvConfig.mockRejectedValue(new Error('boom'));

    const service = createService();
    await service.whenReady();

    expect(fetchMock).not.toHaveBeenCalled();
    const node: LuigiNode = {
      networkVisibility: NetworkVisibility.INTERNAL,
      context: {} as NodeContext,
    };
    expect(service.applyNetworkVisibility(node)).toBe(node);
  });

  it('probes the configured vpnCheckUrl to determine VPN reachability', async () => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({
      vpnCheckUrl: 'https://internal.example',
    } as any);
    fetchMock.mockResolvedValue({} as Response);

    const service = createService();
    await service.whenReady();

    expect(fetchMock).toHaveBeenCalledWith('https://internal.example', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    const node: LuigiNode = {
      networkVisibility: NetworkVisibility.INTERNAL,
      context: {} as NodeContext,
    };
    expect(service.applyNetworkVisibility(node)).toBe(node);
  });

  it('passes non-internal nodes through unchanged', async () => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({
      vpnCheckUrl: 'https://internal.example',
    } as any);
    fetchMock.mockRejectedValue(new Error('unreachable'));

    const service = createService();
    await service.whenReady();

    const internetNode: LuigiNode = {
      networkVisibility: NetworkVisibility.INTERNET,
      context: {} as NodeContext,
    };
    const noVisibilityNode: LuigiNode = { context: {} as NodeContext };
    expect(service.applyNetworkVisibility(internetNode)).toBe(internetNode);
    expect(service.applyNetworkVisibility(noVisibilityNode)).toBe(
      noVisibilityNode,
    );
  });

  it('converts internal nodes to the no-vpn web component when not reachable', async () => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({
      vpnCheckUrl: 'https://internal.example',
    } as any);
    fetchMock.mockRejectedValue(new Error('unreachable'));

    const service = createService();
    await service.whenReady();

    const node: LuigiNode = {
      pathSegment: 'extension',
      networkVisibility: NetworkVisibility.INTERNAL,
      visibleForPlugin: true,
      children: [{ pathSegment: 'child', context: {} as NodeContext }],
      context: {} as NodeContext,
    };
    const converted = service.applyNetworkVisibility(node);

    expect(converted).not.toBe(node);
    expect(converted.viewUrl).toBe('/assets/openmfp-portal-ui-wc.js#no-vpn');
    expect(converted.webcomponent).toEqual({
      selfRegistered: true,
      type: 'module',
    });
    expect(converted.context).toEqual({ translationTable: { en: {} } });
    expect(converted.networkVisibility).toBeUndefined();
    expect(converted.visibleForPlugin).toBeUndefined();
    expect(converted.children).toEqual([]);
    expect(converted.statusBadge).toEqual({ label: 'VPN', type: 'informative' });
    expect(converted.pathSegment).toBe('extension');
  });

  it('keeps an existing status badge when converting', async () => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({
      vpnCheckUrl: 'https://internal.example',
    } as any);
    fetchMock.mockRejectedValue(new Error('unreachable'));

    const service = createService();
    await service.whenReady();

    const node: LuigiNode = {
      networkVisibility: NetworkVisibility.INTERNAL,
      statusBadge: { label: 'BETA', type: 'informative' },
      context: {} as NodeContext,
    };
    const converted = service.applyNetworkVisibility(node);

    expect(converted.statusBadge).toEqual({ label: 'BETA', type: 'informative' });
  });

  it('honours setVPN overrides', async () => {
    envConfigServiceMock.getEnvConfig.mockResolvedValue({
      vpnCheckUrl: 'https://internal.example',
    } as any);
    fetchMock.mockRejectedValue(new Error('unreachable'));

    const service = createService();
    await service.whenReady();

    service.setVPN(true);
    const node: LuigiNode = {
      networkVisibility: NetworkVisibility.INTERNAL,
      context: {} as NodeContext,
    };
    expect(service.applyNetworkVisibility(node)).toBe(node);
  });
});
