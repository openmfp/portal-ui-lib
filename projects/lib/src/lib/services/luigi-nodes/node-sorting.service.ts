import { LuigiNode, LuigiNodeCategory } from '../../models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NodeSortingService {
  constructor() {}

  markEntityRootChildren(nodes: LuigiNode[]) {
    nodes.forEach((child) => {
      child._entityRootChild = true;
    });
  }

  nodeComparison(a: LuigiNode, b: LuigiNode) {
    // set a default order to the end if not defined
    a.order = a.dxpOrder ?? a.order ?? 999;
    b.order = b.dxpOrder ?? b.order ?? 999;

    const orderA = a.order;
    const orderB = b.order;

    if (orderA < orderB) {
      return -1;
    } else if (orderA > orderB) {
      return 1;
    }

    // if orders are equal -> sort alphabetically by label
    if (!a.label && !b.label) {
      return 0; // both undefined, keep original order
    } else if (!a.label) {
      return 1; // a has no label, goes after b
    } else if (!b.label) {
      return -1; // b has no label, a goes before b
    }

    return a.label.localeCompare(b.label);
  }

  appendChildrenToSlot(
    nodes: LuigiNode[],
    slotNode: LuigiNode,
    children: LuigiNode[],
  ) {
    const slotIndex = nodes.indexOf(slotNode);

    if (slotNode.category) {
      const cat =
        (slotNode.category as LuigiNodeCategory).id ||
        (slotNode.category as LuigiNodeCategory).label ||
        ((slotNode.category as string).length > 0
          ? slotNode.category
          : undefined);
      if (cat) {
        children.forEach((node) => {
          node.category = cat;
        });
      }
    }

    nodes.splice(slotIndex + 1, 0, ...children);
  }

  sortNodes(nodes: LuigiNode[]): LuigiNode[] {
    const entityRootNodes: LuigiNode[] = [];
    const slottedChildrenMap = {};
    const otherChildren: LuigiNode[] = [];
    const slotNodes: LuigiNode[] = [];
    let defaultSlot;

    nodes.forEach((node) => {
      if (node._entityRootChild) {
        entityRootNodes.push(node);
        if (node.defineSlot) {
          slotNodes.push(node);
        } else if (node.defineSlot === '') {
          defaultSlot = node;
        }
      } else if (node.navSlot) {
        if (!slottedChildrenMap[node.navSlot]) {
          slottedChildrenMap[node.navSlot] = [];
        }
        slottedChildrenMap[node.navSlot].push(node);
      } else {
        otherChildren.push(node);
      }
    });

    const sortedNodes = [...entityRootNodes];

    const sortedOther = otherChildren.sort(this.nodeComparison);

    if (slotNodes.length > 0) {
      slotNodes.forEach((slotNode) => {
        if (!slotNode.defineSlot) {
          return;
        }

        if (slottedChildrenMap[slotNode.defineSlot]) {
          this.appendChildrenToSlot(
            sortedNodes,
            slotNode,
            slottedChildrenMap[slotNode.defineSlot].sort(this.nodeComparison),
          );
          delete slottedChildrenMap[slotNode.defineSlot];
        }
      });
    }

    // collect unassigned slotted nodes and add to default slot
    for (const slotId in slottedChildrenMap) {
      if (Object.prototype.hasOwnProperty.call(slottedChildrenMap, slotId)) {
        const unassignedSlotChildren = slottedChildrenMap[slotId];
        sortedOther.push(...unassignedSlotChildren.sort(this.nodeComparison));
      }
    }

    if (defaultSlot) {
      this.appendChildrenToSlot(sortedNodes, defaultSlot, sortedOther);
    } else {
      sortedNodes.push(...sortedOther);
    }

    // move nodes without categories to top
    const singleNodes: LuigiNode[] = [];
    const catNodes: LuigiNode[] = [];
    sortedNodes.forEach((node) => {
      (node.category ? catNodes : singleNodes).push(node);
    });

    return [...singleNodes, ...catNodes];
  }
}
