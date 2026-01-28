import { LuigiNode } from '../models';
import { buildViewGroups } from './build-view-groups';

describe('buildViewGroups', () => {
  it('should build view group settings for nodes with preload urls', () => {
    const nodes = [
      {
        viewGroup: 'alpha',
        _preloadUrl: '/alpha',
        _requiredIFramePermissionsForViewGroup: { allow: ['camera'] },
      },
      {
        viewGroup: 'beta',
        _preloadUrl: '/beta',
      },
    ] as LuigiNode[];

    const result = buildViewGroups(nodes);

    expect(result).toEqual({
      alpha: {
        preloadUrl: '/alpha',
        requiredIFramePermissions: { allow: ['camera'] },
      },
      beta: {
        preloadUrl: '/beta',
        requiredIFramePermissions: undefined,
      },
    });
  });

  it('should ignore nodes without viewGroup or preload url', () => {
    const nodes = [
      {
        viewGroup: 'alpha',
      },
      {
        _preloadUrl: '/beta',
      },
      {
        viewGroup: 'gamma',
        _preloadUrl: '/gamma',
      },
    ] as LuigiNode[];

    const result = buildViewGroups(nodes);

    expect(result).toEqual({
      gamma: {
        preloadUrl: '/gamma',
        requiredIFramePermissions: undefined,
      },
    });
  });
});
