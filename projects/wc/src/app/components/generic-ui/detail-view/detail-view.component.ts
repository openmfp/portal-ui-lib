import {
  FieldDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../models/resource';
import { ResourceService } from '../services/resource.service';
import { generateGraphQLFields } from '../utils/columns-to-gql-fields';
import { getResourceValueByJsonPath } from '../utils/resource-field-by-path';
import { kcpCA, kubeConfigTemplate } from './kubeconfig-template';
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

const requiredFields: FieldDefinition[] = [
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
  protected readonly getResourceValueByJsonPath = getResourceValueByJsonPath;

  resource = signal<Resource | null>(null);
  resourceStatusReady = computed(() => {
    const resource = this.resource();
    if (!resource) {
      return undefined;
    }

    return getResourceValueByJsonPath(resource, {
      property: 'status.conditions[?(@.type=="Ready")].status',
    });
  });

  nodeContext: NodeContext;
  resourceDefinition: ResourceDefinition;
  workspacePath: string;
  additionalFields: FieldDefinition[];

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.nodeContext = context;
    this.workspacePath = this.getKcpPath();
    this.additionalFields =
      context.resourceDefinition.ui?.detailView?.fields || [];
    this.resourceDefinition = context.resourceDefinition;
  }

  ngOnInit(): void {
    const fields = generateGraphQLFields([
      ...requiredFields,
      ...this.additionalFields,
    ]);
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
