import { LuigiNode, LuigiNodeIFramePermissions } from '../models';

export const buildViewGroups = (nodes: LuigiNode[]) => {
  const viewGroups: Record<
    string,
    {
      preloadUrl?: string;
      requiredIFramePermissions?: LuigiNodeIFramePermissions;
    }
  > = {};
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
