import { Inject } from '@angular/core';
import { HEADER_BAR_CONFIG_INJECTION_TOKEN } from '../../injection-tokens';
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
    clickHandler: (item: NodeItem) => void,
  ) => HTMLElement;
}

export interface LuigiBreadcrumbConfigService {
  getBreadcrumbsConfig(): Promise<LuigiBreadcrumb>;
}

export type RendererFn = LuigiBreadcrumb['renderer']

export interface HeaderBarConfig extends Omit<LuigiBreadcrumb, 'renderer'> {
  rightRenderers: RendererFn[];
  leftRenderers: RendererFn[];
}

export class HeaderBarService {
  constructor(@Inject(HEADER_BAR_CONFIG_INJECTION_TOKEN) private headerBarConfig: HeaderBarConfig) {
  }

  public async getBreadcrumbsConfig(): Promise<LuigiBreadcrumb | undefined> {
    if (!this.headerBarConfig) {
      return undefined
    }

    const { leftRenderers, rightRenderers, ...rest } = this.headerBarConfig;
    return {
      ...rest,
      renderer: (containerElement, nodeItems, clickHandler) => {
        containerElement.style.display = 'flex';

        const {rightContainer, leftContainer} = this.createRendererContainers()

        containerElement.appendChild(leftContainer);
        containerElement.appendChild(rightContainer);

        this.executeRenderes(leftContainer, leftRenderers, [nodeItems, clickHandler])
        this.executeRenderes(rightContainer, rightRenderers, [nodeItems, clickHandler])

        return containerElement
      },
    };
  };

  private executeRenderes(rootContainer: HTMLElement, renderers: RendererFn[], params: [NodeItem[], (item: NodeItem) => void]): void {
    renderers.forEach((renderer) => {
      const rendererContainer = document.createElement('div');
      rootContainer.appendChild(rendererContainer);

      renderer(rendererContainer, ...params)
    })
  }

  private createRendererContainers(): {rightContainer: HTMLDivElement, leftContainer: HTMLDivElement} {
    const rightContainer = document.createElement('div');
    const leftContainer = document.createElement('div');

    rightContainer.style.display = 'flex';
    rightContainer.style.justifyContent = 'flex-end';
    rightContainer.style.gap = '1em';

    leftContainer.style.display = 'flex';
    leftContainer.style.justifyContent = 'flex-start';
    leftContainer.style.gap = '1em';

    console.log(1)

    return {rightContainer, leftContainer}
  }
}
