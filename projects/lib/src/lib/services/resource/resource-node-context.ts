import { NodeContext } from '../../models';

export interface ResourceNodeContext extends Partial<NodeContext> {
  namespaceId?: string;
  portalContext: {
    crdGatewayApiUrl: string;
  };
}
