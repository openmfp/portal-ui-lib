import { LuigiNode } from '../models';

export const buildViewGroups = (nodes: LuigiNode[]) => {
  const viewGroups = {};
  nodes.forEach((node) => {
    if (node.viewGroup && node._preloadUrl) {
      viewGroups[node.viewGroup] = {
        preloadUrl: node._preloadUrl,
        requiredIFramePermissions: node._requiredIFramePermissionsForViewGroup,
      };
    }
  });

  return viewGroups;
};
