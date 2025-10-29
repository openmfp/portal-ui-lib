import { EntityType, LuigiNode } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { NodeUtilsService } from '../luigi-nodes/node-utils.service';
import { Injectable, inject } from '@angular/core';

export interface AppSwitcherConfigService {
  getAppSwitcher(luigiNodes: LuigiNode[]);
}

interface NodeConfig {
  title: string;
  icon: string;
  link: string;
  selectionConditions?: {
    route: string;
    contextCriteria: {
      key: string;
      value: string;
    }[];
  };
}

@Injectable({ providedIn: 'root' })
export class AppSwitcherConfigServiceImpl implements AppSwitcherConfigService {
  private luigiCoreService = inject(LuigiCoreService);
  private nodeUtilsService = inject(NodeUtilsService);

  getAppSwitcher(luigiNodes: LuigiNode[]) {
    return {
      keepMainTitle: true,
      showSubTitle: false,
      itemRenderer: (item: any, slot: HTMLElement, appSwitcherApiObj) => {
        const a = document.createElement('a');
        a.setAttribute('class', 'fd-menu__link');
        a.addEventListener('click', (e) => {
          this.luigiCoreService.navigation().navigate(item.link);
          appSwitcherApiObj.closeDropDown();
          e.stopPropagation();
        });

        const span = document.createElement('span');
        span.setAttribute('class', 'fd-menu__addon-before');
        const i = document.createElement('i');
        i.setAttribute('class', 'sap-icon--' + item.icon);
        span.appendChild(i);

        const spanText: HTMLElement = document.createElement('span');
        spanText.setAttribute('class', 'fd-menu__title');
        spanText.innerText = item.title;
        a.appendChild(span);
        a.appendChild(spanText);
        slot.innerHTML = '';
        slot.appendChild(a);
      },
      items: this.getNodeItems(luigiNodes),
    };
  }

  private getNodeItems(luigiNodes: LuigiNode[]) {
    const items = (luigiNodes || [])
      .filter((node: LuigiNode) => {
        return (
          !node.hideFromNav &&
          node.entityType === EntityType.GLOBAL &&
          this.nodeUtilsService.isVisible(node)
        );
      })
      .map((node) => {
        const nodeConfig: NodeConfig = {
          title: node.label || '',
          icon: node.icon || '',
          link: '/' + node.pathSegment,
        };
        return nodeConfig;
      });

    return items?.length === 1 ? [] : items;
  }
}
