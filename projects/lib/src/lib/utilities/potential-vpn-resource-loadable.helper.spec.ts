import { potentialVPNResourceLoadable } from './potential-vpn-resource-loadable.helper';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('potentialVPNResourceLoadable', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves false without probing when no url is provided', async () => {
    await expect(potentialVPNResourceLoadable()).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('resolves true and probes with a no-cors HEAD request when the resource loads', async () => {
    (fetch as any).mockResolvedValue(new Response());

    await expect(
      potentialVPNResourceLoadable('https://internal.example'),
    ).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith('https://internal.example', {
      method: 'HEAD',
      mode: 'no-cors',
    });
  });

  it('resolves false when the resource is not reachable', async () => {
    (fetch as any).mockRejectedValue(new Error('unreachable'));

    await expect(
      potentialVPNResourceLoadable('https://internal.example'),
    ).resolves.toBe(false);
  });
});
