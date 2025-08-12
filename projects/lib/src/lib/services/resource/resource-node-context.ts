import { NodeContext } from '../../models';

export interface ResourceNodeContext extends Partial<NodeContext> {
  entity?: {
    metadata: {
      name: string;
      namespace: string;
    };
  };
  namespaceId?: string;
  portalContext: {
    crdGatewayApiUrl: string;
  };
}
