import { LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN } from '../../injection-tokens';
import { LuigiNode, NodeContext } from '../../models';
import { Injectable, inject } from '@angular/core';

export interface NodeContextProcessingService {
  processNodeContext(
    entityId: string | undefined,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class NodeContextProcessingServiceImpl implements NodeContextProcessingService {
  private customNodeContextProcessingService =
    inject<NodeContextProcessingService>(
      LUIGI_CUSTOM_NODE_CONTEXT_PROCESSING_SERVICE_INJECTION_TOKEN as any,
      { optional: true },
    );

  async processNodeContext(
    entityId: string | undefined,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ): Promise<void> {
    await this.defaultProcessNodeContext(entityId, entityNode, ctx);
    await this.customNodeContextProcessingService?.processNodeContext(
      entityId,
      entityNode,
      ctx,
    );
  }

  private async defaultProcessNodeContext(
    entityId: string | undefined,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ): Promise<void> {
    entityNode.context.entityType = entityNode.defineEntity?.id;
  }
}
