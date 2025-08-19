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
import {
  FieldDefinition,
  GatewayService,
  Resource,
  ResourceDefinition,
  ResourceNodeContext,
  ResourceService,
  generateGraphQLFields,
  getResourceValueByJsonPath,
  replaceDotsAndHyphensWithUnderscores,
} from '@openmfp/portal-ui-lib';
import {
  DynamicPageComponent,
  DynamicPageHeaderComponent,
  DynamicPageTitleComponent,
  LabelComponent,
  TextComponent,
  TitleComponent,
  ToolbarButtonComponent,
  ToolbarComponent,
} from '@ui5/webcomponents-ngx';
import { ValueCellComponent } from '../value-cell/value-cell.component';

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
    TitleComponent,
    TextComponent,
    ToolbarComponent,
    ToolbarButtonComponent,
    DynamicPageHeaderComponent,
    LabelComponent,
    ValueCellComponent,
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
  resourceId: string;

  constructor() {
    effect(() => {
      this.workspacePath = this.gatewayService.resolveKcpPath(this.context());
      this.resourceFields =
        this.context().resourceDefinition.ui?.detailView?.fields ||
        defaultFields;
      this.resourceDefinition = this.context().resourceDefinition;
      this.resourceId = this.context().entity.metadata.name;
      this.readResource();
    });
  }

  private readResource(): void {
    const fields = generateGraphQLFields(this.resourceFields);
    const queryOperation = replaceDotsAndHyphensWithUnderscores(
      this.resourceDefinition.group,
    );
    const kind = this.resourceDefinition.kind;

    this.resourceService
      .read(
        this.resourceId,
        queryOperation,
        kind,
        fields,
        this.context(),
        kind.toLowerCase() === 'account',
      )
      .subscribe({
        next: (result) => this.resource.set(result),
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
      .replaceAll('<ca-data>', this.context().kcpCA)
      .replaceAll('<token>', this.context().token);

    const blob = new Blob([kubeConfig], { type: 'application/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubeconfig.yaml';
    a.click();
  }
}
