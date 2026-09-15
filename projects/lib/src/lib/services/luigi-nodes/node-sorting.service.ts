import { LuigiNode, LuigiNodeCategory } from '../../models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NodeSortingService {
  nodeOrder(node: LuigiNode) {
    node.order = node.dxpOrder ?? node.order ?? 999;
    return node.order;
  }

  markEntityRootChildren(nodes: LuigiNode[]) {
    nodes.forEach((child) => {
      child._entityRootChild = true;
    });
  }

  nodeComparison(a: LuigiNode, b: LuigiNode) {
    const orderA = (a.order = a.dxpOrder ?? a.order ?? 999);
    const orderB = (b.order = b.dxpOrder ?? b.order ?? 999);

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

  categoryOrder(node: LuigiNode) {
    if (node.category && typeof node.category !== 'string') {
      return node.category.order;
    }

    return undefined;
  }

  navigationLabel(node: LuigiNode) {
    if (node.category && typeof node.category !== 'string') {
      return node.category.label;
    }

    return typeof node.category === 'string'
      ? node.category
      : (node.label ?? '');
  }

  categoryKey(node: LuigiNode) {
    if (!node.category) {
      return undefined;
    }

    if (typeof node.category === 'string') {
      return node.category;
    }

    return node.category.id ?? node.category.label;
  }

  navigationComparison(a: LuigiNode, b: LuigiNode) {
    const categoryA = this.categoryKey(a);
    const categoryB = this.categoryKey(b);

    if (categoryA && categoryA === categoryB) {
      return this.nodeComparison(a, b);
    }

    const categoryOrderA = this.categoryOrder(a);
    const categoryOrderB = this.categoryOrder(b);

    if (categoryA && categoryOrderA === undefined) {
      if (categoryB && categoryOrderB === undefined) {
        return this.nodeComparison(a, b);
      }

      return 1;
    }

    if (categoryB && categoryOrderB === undefined) {
      return -1;
    }

    const orderA = categoryOrderA ?? this.nodeOrder(a);
    const orderB = categoryOrderB ?? this.nodeOrder(b);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return this.navigationLabel(a).localeCompare(this.navigationLabel(b));
  }

  sortNodes(nodes: LuigiNode[]): LuigiNode[] {
    const entityRootNodes: LuigiNode[] = [];
    const slottedChildrenMap: Record<string, LuigiNode[]> = {};
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

    const sortedOther = otherChildren.sort(
      this.navigationComparison.bind(this),
    );

    if (slotNodes.length > 0) {
      slotNodes.forEach((slotNode) => {
        if (!slotNode.defineSlot) {
          return;
        }

        if (slottedChildrenMap[slotNode.defineSlot]) {
          this.appendChildrenToSlot(
            sortedNodes,
            slotNode,
            slottedChildrenMap[slotNode.defineSlot].sort(
              this.navigationComparison.bind(this),
            ),
          );
          delete slottedChildrenMap[slotNode.defineSlot];
        }
      });
    }

    // collect unassigned slotted nodes and add to default slot
    for (const slotId in slottedChildrenMap) {
      if (Object.prototype.hasOwnProperty.call(slottedChildrenMap, slotId)) {
        const unassignedSlotChildren = slottedChildrenMap[slotId];
        sortedOther.push(
          ...unassignedSlotChildren.sort(this.navigationComparison.bind(this)),
        );
      }
    }

    if (defaultSlot) {
      this.appendChildrenToSlot(sortedNodes, defaultSlot, sortedOther);
    } else {
      sortedNodes.push(...sortedOther);
    }

    const orderedNodes: LuigiNode[] = [];
    const unorderedCategoryNodes: LuigiNode[] = [];
    sortedNodes.forEach((node) => {
      if (node.category && this.categoryOrder(node) === undefined) {
        unorderedCategoryNodes.push(node);
      } else {
        orderedNodes.push(node);
      }
    });

    return [...orderedNodes, ...unorderedCategoryNodes];
  }
}
