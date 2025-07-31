import { LuigiNode, NodeContext } from '../../models';
import { replaceDotsAndHyphensWithUnderscores } from '../../utilities/group-name-sanitizer';
import { ResourceService } from '../resource';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NodeContextProcessingService {
  private resourceService = inject(ResourceService);

  readAndStoreEntityInNodeContext(
    entityId: string,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ) {
    const group = entityNode.defineEntity?.graphqlEntity?.group;
    const kind = entityNode.defineEntity?.graphqlEntity?.kind;
    const queryPart = entityNode.defineEntity?.graphqlEntity?.query;

    if (!entityId || !group || !kind || !queryPart) {
      return;
    }

    const operation = replaceDotsAndHyphensWithUnderscores(group);
    this.resourceService
      .read(
        entityId,
        null,
        operation,
        kind,
        `query ($name: String!) { ${operation} { ${kind}(name: $name) ${queryPart} }}`,
        {
          portalContext: {
            crdGatewayApiUrl: ctx.portalContext.crdGatewayApiUrl,
          },
          token: ctx.token,
          accountId: entityId,
        },
      )
      .subscribe({
        next: (entity) => {
          // update the current already calculated by Luigi context for a node
          ctx.entity = entity;
          ctx.entityId = `${entity.metadata?.annotations?.['kcp.io/cluster']}/${entityId}`;
          // update the node context of sa node to contain the entity for future context calculations
          entityNode.context.entity = entity;
          entityNode.context.entityId = ctx.entityId;
        },
        error: (err) =>
          console.error(
            `Not able to read entity ${entityId} from ${operation}`,
          ),
      });
  }
}
