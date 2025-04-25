import {
  FieldDefinition,
  NodeContext,
  Resource,
  ResourceDefinition,
} from '../models/resource';
import { ResourceService } from '../services/resource.service';
import { generateGraphQLFields } from '../utils/columns-to-gql-fields';
import { getResourceValueByJsonPath } from '../utils/resource-field-by-path';
import { kubeConfigTemplate } from './kubeconfig-template';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
  signal,
} from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  BreadcrumbsComponent,
  BreadcrumbsItemComponent,
  DynamicPageComponent,
  DynamicPageHeaderComponent,
  DynamicPageTitleComponent,
  LabelComponent,
  TextComponent,
  TitleComponent,
  ToolbarButtonComponent,
  ToolbarComponent,
} from '@ui5/webcomponents-ngx';

const defaultFields: FieldDefinition[] = [
  {
    label: 'Workspace Status',
    jsonPathExpression: 'status.conditions[?(@.type=="Ready")].status',
    property: ['status.conditions.status', 'status.conditions.type'],
  },
];

@Component({
  selector: 'detail-view',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [
    DynamicPageComponent,
    DynamicPageTitleComponent,
    BreadcrumbsComponent,
    BreadcrumbsItemComponent,
    TitleComponent,
    TextComponent,
    ToolbarComponent,
    ToolbarButtonComponent,
    DynamicPageHeaderComponent,
    LabelComponent,
  ],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailViewComponent implements OnInit {
  private resourceService = inject(ResourceService);
  protected readonly getResourceValueByJsonPath = getResourceValueByJsonPath;

  resource = signal<Resource | null>(null);

  nodeContext: NodeContext;
  resourceDefinition: ResourceDefinition;
  workspacePath: string;
  resourceFields: FieldDefinition[];
  kcpCA: string = '';

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
    const fields = generateGraphQLFields(this.resourceFields);
    const queryOperation = `${this.resourceDefinition.group.replaceAll('.', '_')}_${this.resourceDefinition.singular}`;

    this.resourceService
      .read(this.nodeContext.resourceId, queryOperation, fields)
      .subscribe({
        next: (result) => this.resource.set(result),
      });

    this.resourceService.readKcpCA().subscribe({
      next: (kcpCA) => {
        this.kcpCA = kcpCA;
      },
    });
  }

  navigateToParent() {
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
      .replaceAll('<ca-data>', this.kcpCA)
      .replaceAll('<token>', this.nodeContext.token);

    const blob = new Blob([kubeConfig], { type: 'application/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubeconfig.yaml';
    a.click();
  }
}
