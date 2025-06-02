import { LuigiNode, NodeContext } from '../../models';
import { LuigiCoreService } from '../luigi-core.service';
import { ResourceService } from '../resource';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NodeContextProcessingService {
  private resourceService = inject(ResourceService);
  private luigiCoreService = inject(LuigiCoreService);

  readAndStoreEntityInNodeContext(
    entityId: string,
    entityNode: LuigiNode,
    ctx: NodeContext,
  ) {
    const group =
      entityNode.defineEntity?.graphqlEntity?.group || 'core.openmfp.org';
    const kind = entityNode.defineEntity?.graphqlEntity?.kind || 'Account';
    const queryPart =
      entityNode.defineEntity?.graphqlEntity?.query ||
      '{ metadata { name annotations }}';

    if (!entityId || !group || !kind || !queryPart) {
      return;
    }

    const operation = group.replaceAll('.', '_');
    this.resourceService
      .read(
        entityId,
        operation,
        kind,
        `query ($name: String!) { ${operation} { ${kind}(name: $name) ${queryPart} }}`,
        this.luigiCoreService.getGlobalContext(),
      )
      .subscribe({
        next: (entity) => {
          // update the current already calculated by Luigi context for a node
          ctx.entity = entity;
          // update the node context of sa node to contain the entity for future context calculations
          entityNode.context.entity = entity;
        },
        error: (err) =>
          console.error(
            `Not able to read entity ${entityId} from ${operation}`,
          ),
      });
  }
}
