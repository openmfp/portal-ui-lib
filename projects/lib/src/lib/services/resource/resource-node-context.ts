import { NodeContext } from '../../models';

export interface ResourceNodeContext extends Partial<NodeContext> {
  portalContext: {
    crdGatewayApiUrl: string;
  };
}
