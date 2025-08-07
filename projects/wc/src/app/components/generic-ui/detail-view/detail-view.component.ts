import { kubeConfigTemplate } from './kubeconfig-template';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { replaceDotsAndHyphensWithUnderscores } from '@openmfp/portal-ui-lib';
import {
  FieldDefinition,
  GatewayService,
  Resource,
  ResourceDefinition,
  ResourceNodeContext,
  ResourceService,
  generateGraphQLFields,
  getResourceValueByJsonPath,
} from '@openmfp/portal-ui-lib';
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
export class DetailViewComponent {
  private resourceService = inject(ResourceService);
  private gatewayService = inject(GatewayService);
  protected readonly getResourceValueByJsonPath = getResourceValueByJsonPath;

  LuigiClient = input<LuigiClient>();
  context = input<ResourceNodeContext>();
  resource = signal<Resource | null>(null);

  resourceDefinition: ResourceDefinition;
  workspacePath: string;
  resourceFields: FieldDefinition[];
  kcpCA: string = '';
  namespace: string;

  constructor() {
    effect(() => {
      this.workspacePath = this.gatewayService.resolveKcpPath(this.context());
      this.resourceFields =
        this.context().resourceDefinition.ui?.detailView?.fields ||
        defaultFields;
      this.resourceDefinition = this.context().resourceDefinition;
      const url = window.location.pathname;
      const namespaceMatch = url.match(/\/namespaces\/([^\/]+)/);
      this.namespace = namespaceMatch ? namespaceMatch[1] : this.LuigiClient().getNodeParams(true)?.['namespace'];
      this.readResource(this.namespace);
    });
  }

  private readResource(namespace: string): void {
    const fields = generateGraphQLFields(this.resourceFields);
    const queryOperation = replaceDotsAndHyphensWithUnderscores(
      this.resourceDefinition.group,
    );
    const kind = this.resourceDefinition.kind;

    this.resourceService
      .read(
        this.context().accountId,
        queryOperation,
        kind,
        fields,
        this.context(),
        namespace,
      )
      .subscribe({
        next: (result) => this.resource.set(result),
      });

    this.resourceService.readKcpCA(this.context()).subscribe({
      next: (kcpCA) => {
        this.kcpCA = kcpCA;
      },
    });
  }

  navigateToParent() {
    this.LuigiClient()
      .linkManager()
      .fromContext(this.context().parentNavigationContexts.at(-1))
      .navigate('/');
  }

  async downloadKubeConfig() {
    const kubeConfig = kubeConfigTemplate
      .replaceAll('<cluster-name>', this.context().accountId)
      .replaceAll('<server-url>', this.workspacePath)
      .replaceAll('<ca-data>', this.kcpCA)
      .replaceAll('<token>', this.context().token);

    const blob = new Blob([kubeConfig], { type: 'application/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubeconfig.yaml';
    a.click();
  }
}
