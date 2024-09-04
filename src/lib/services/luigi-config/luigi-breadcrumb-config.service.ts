import { LuigiNode } from '../../models';

export interface NodeItem extends LuigiNode {
  node?: LuigiNode;
  route?: string;
}

export interface LuigiBreadcrumb {
  pendingItemLabel: string;
  omitRoot: boolean;
  autoHide: boolean;
  clearBeforeRender?: boolean;
  renderer: (
    containerElement: HTMLElement,
    nodeItems: NodeItem[],
    clickHandler: (item: NodeItem) => void
  ) => HTMLElement;
}

export interface LuigiBreadcrumbConfigService {
  getBreadcrumbsConfig(): LuigiBreadcrumb;
}

export class NoopLuigiBreadcrumbConfigService
  implements LuigiBreadcrumbConfigService
{
  getBreadcrumbsConfig(): LuigiBreadcrumb {
    return undefined;
  }
}
