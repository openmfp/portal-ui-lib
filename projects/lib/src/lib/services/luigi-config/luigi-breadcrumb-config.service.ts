import { Inject, Injectable, Optional } from '@angular/core';
import { HEADER_BAR_CONFIG_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
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

export type RendererFn = LuigiBreadcrumb['renderer']

export interface HeaderBarConfig extends Omit<LuigiBreadcrumb, 'renderer'> {
  rightRenderers: RendererFn[];
  leftRenderers: RendererFn[];
}

export interface HeaderBarConfigService {
  getConfig(): Promise<HeaderBarConfig>;
}

@Injectable({providedIn: 'root'})
export class HeaderBarService {
  constructor(@Optional() @Inject(HEADER_BAR_CONFIG_SERVICE_INJECTION_TOKEN) private headerBarConfig: HeaderBarConfigService) {
  }

  public async getConfig(): Promise<LuigiBreadcrumb | undefined> {
    if (!this.headerBarConfig) {
      return undefined
    }

    const { leftRenderers, rightRenderers, ...rest } = await this.headerBarConfig.getConfig();
    return {
      ...rest,
      renderer: (containerElement, nodeItems, clickHandler) => {
        containerElement.style.display = 'flex';
        containerElement.style.position = 'static';

        const parrent = containerElement.parentElement;
        if(parrent) {
          this.setParrentStyles(parrent);
        }

        const {rightContainer, leftContainer} = this.createRendererContainers()

        containerElement.appendChild(leftContainer);
        containerElement.appendChild(rightContainer);

        this.executeRenderes(leftContainer, leftRenderers, [nodeItems, clickHandler])
        this.executeRenderes(rightContainer, rightRenderers, [nodeItems, clickHandler])

        return containerElement
      },
    };
  };

  private setParrentStyles(parrent: HTMLElement): void {
    parrent.style.display = 'flex';
    parrent.style.flexDirection = 'column';
    parrent.style.height = '100%';
    parrent.style.marginTop = '0';
  }

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
    leftContainer.style.flexGrow = '1';

    return {rightContainer, leftContainer}
  }
}
