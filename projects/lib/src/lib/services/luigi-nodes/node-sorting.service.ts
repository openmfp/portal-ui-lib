import { Injectable } from '@angular/core';
import { LuigiNode, LuigiNodeCategory } from '../../models';
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
    // set default order to the end if not defined
    a.order = a.dxpOrder || a.order || '999';
    b.order = b.dxpOrder || b.order || '999';

    if (a.order < b.order) {
      return -1;
    } else if (a.order > b.order) {
      return 1;
    }

    // if orders are equal -> sort alphabetically by label
    return a.label?.localeCompare(b.label);
  }

  appendChildrenToSlot(
    nodes: LuigiNode[],
    slotNode: LuigiNode,
    children: LuigiNode[]
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
    const entityRootNodes = [];
    const slottedChildrenMap = {};
    const otherChildren = [];
    const slotNodes = [];
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
        if (slottedChildrenMap[slotNode.defineSlot]) {
          this.appendChildrenToSlot(
            sortedNodes,
            slotNode,
            slottedChildrenMap[slotNode.defineSlot].sort(this.nodeComparison)
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
    const singleNodes = [];
    const catNodes = [];
    sortedNodes.forEach((node) => {
      (node.category ? catNodes : singleNodes).push(node);
    });

    return [...singleNodes, ...catNodes];
  }
}
