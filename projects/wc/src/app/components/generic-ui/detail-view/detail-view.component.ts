import {
  FieldDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../models/resource';
import { ResourceService } from '../services/resource.service';
import { generateFields } from '../utils/columns-to-gql-fields';
import { kubeConfigTemplate } from './kubeconfig-template';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import jsonpath from 'jsonpath';

const defaultFields: FieldDefinition[] = [
  {
    label: 'Display Name',
    property: 'spec.displayName',
  },
  {
    label: 'Name',
    property: 'metadata.name',
  },
  {
    label: 'Condition Status',
    property: 'status.conditions.status',
  },
  {
    label: 'Condition Type',
    property: 'status.conditions.type',
  },
];

const kcpCA =
  'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCakNDQWU2Z0F3SUJBZ0lRTVpzZWRjTE5DOWEvWFR2ZmErT091REFOQmdrcWhraUc5dzBCQVFzRkFEQWQKTVJzd0dRWURWUVFERXhKdmNHVnViV1p3TFd0amNDMXdhMmt0WTJFd0hoY05NalV3TVRBNU1UYzBOVE01V2hjTgpNelV3TVRBM01UYzBOVE01V2pBZE1Sc3dHUVlEVlFRREV4SnZjR1Z1Yldad0xXdGpjQzF3YTJrdFkyRXdnZ0VpCk1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRRGwrWHMrSFhrcDlRaWsxWXpWd3JhZlNUbU4KUm5aVXc0clVsTmYzTHZzM2F3Y05PN1hjZHRzZHZCRi84dmVBQlh4aDNhQWhwWDdwQ2FvanV0cmxHcGFzM1Z0bAoyamRseFE0eFY4ZS9ZNVNuZzVmY0d4NGtMWGZGT0xUK0QvKzgyVjZneWNNZkY3ZGtoVnNFSVB0dXZ0bktnakJPCkdla0o0SlpzT3I0cFNZdTU0b3FkVFpVWisrYVk3b2o0M0pxVUpTMjhZTVhTeWkwTGpjZXNjWWIxTTR3VVZmd1AKVkdmcUtVS1YrY3Z2enZ1TTZFd2VMTXJ2V3dLNmlycTYyaWdVMlRWZURJODRxVTN3R3UzTlVXaDJkUTNxSHBzbQpNTThydGE3Qnk3cWZkVXU3bHBaaHdXRXJIaGt4T3dnTk5VQ3c0ZFB5VzNjTHdaWmcrT3BZMEljN28raHJBZ01CCkFBR2pRakJBTUE0R0ExVWREd0VCL3dRRUF3SUNwREFQQmdOVkhSTUJBZjhFQlRBREFRSC9NQjBHQTFVZERnUVcKQkJUc2JvMndlTVBnd2cvR0ZkMzEvRGVkbHRHMmlUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFMZEpHTnFUZApncVFNc0xaRjBiZVRvTll5N1FFUFBaTmdDMzRhdzgvYTJQL3R4aVVVR0lXMVkweWVmQmc1WlJTUzRzTXllUTZrCmNMYXJEaFlFckpoMmZ5NTNPVHlSVk5YdW5oSHN4TDdoNE1mYjNpZFU1OGhDNURtdzEyRDQ1MFEwM2JiR3pNNlQKQ2JHQ2N1S1VEaDNGRkJYb3MvcUwvakQ2TE54OHFtQlkzT3V0T09BOGpDRjR2UXBFN1Erd283NlRrQTl6T3BlWQpGazhna3lac1JGcmJwditVbWFmVC9Ma2tKWUhQM0ZINjhpSXI2WEUyMmI2N0dTak9HamF1VDJ5ZUxZbDB3NFRxCjdobkRjakRrSllIRFpRYSs1MmhnYkhPVjRVcHhOQnZhcUhFZWphYUhFWkZKT0dMVUxJRzFWVTdGZFNPU0ZlZXoKYnl1VForSEtWdVlsTGc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0t';

@Component({
  selector: 'detail-view',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailViewComponent implements OnInit {
  private resourceService = inject(ResourceService);
  @ViewChild('dynamicPage', { static: true }) dynamicPage!: ElementRef;

  resource = signal<Resource | null>(null);
  resourceStatusReady = computed(() => {
    const resource = this.resource();
    if (!resource) {
      return 'Unknown';
    }

    const value = jsonpath.query(
      resource,
      `$.status.conditions[?(@.type=="Ready")].status`,
    );
    return value.length ? value[0] : 'Unknown';
  });

  nodeContext: NodeContext;
  resourceDefinition: ResourceDefinition;
  workspacePath: string;
  resourceFields: FieldDefinition[];

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.nodeContext = context;
    this.workspacePath = this.getKcpPath();
    this.resourceFields =
      context.resourceDefinition.ui?.detailView?.fields || defaultFields;
    this.resourceDefinition = context.resourceDefinition;
  }

  ngOnInit(): void {
    const fields = generateFields(this.resourceFields);
    const queryOperation = `${this.resourceDefinition.group.replaceAll('.', '_')}_${this.resourceDefinition.singular}`;

    this.resourceService
      .read(this.nodeContext.resourceId, queryOperation, fields)
      .subscribe({
        next: (result) => this.resource.set(result),
      });
  }

  navigateToParent(event) {
    event.preventDefault();
    this.LuigiClient.linkManager()
      .fromContext(this.nodeContext.parentNavigationContexts.at(-1))
      .navigate('/');
  }

  private getKcpPath() {
    return (
      new URL(
        this.nodeContext.portalContext.crdGatewayApiUrl.replace(
          '/graphql',
          `:${this.nodeContext.resourceId}/graphql`,
        ),
      ).pathname
        .split('/')
        .filter((s) => s.includes(':'))[0] ?? ''
    );
  }

  getStatusReady() {
    const value = jsonpath.query(
      this.resource,
      `$.status.conditions[?(@.type=="Ready")].status`,
    );
    return value.length ? value[0] : undefined;
  }

  async downloadKubeConfig() {
    const kubeConfig = kubeConfigTemplate
      .replaceAll('<cluster-name>', this.nodeContext.resourceId)
      .replaceAll('<server-url>', this.getKcpPath())
      .replaceAll('<ca-data>', kcpCA)
      .replaceAll('<token>', this.nodeContext.token);

    const blob = new Blob([kubeConfig], { type: 'application/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubeconfig.yaml';
    a.click();
  }
}
