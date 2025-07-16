import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  EnvConfigService,
  I18nService,
  LuigiCoreService,
  Resource,
  ResourceDefinition,
  ResourceNodeContext,
  ResourceService,
  generateGraphQLFields,
} from '@openmfp/portal-ui-lib';
import {
  ButtonComponent,
  InputComponent,
  LabelComponent,
  OptionComponent,
  SelectComponent,
} from '@ui5/webcomponents-ngx';

@Component({
  selector: 'organization-management',
  standalone: true,
  imports: [
    LabelComponent,
    InputComponent,
    ButtonComponent,
    OptionComponent,
    SelectComponent,
    FormsModule,
  ],
  templateUrl: './organization-management.component.html',
  styleUrl: './organization-management.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationManagementComponent implements OnInit {
  private i18nService = inject(I18nService);
  private resourceService = inject(ResourceService);
  private luigiCoreService = inject(LuigiCoreService);
  private envConfigService = inject(EnvConfigService);
  context = input<ResourceNodeContext>();
  LuigiClient = input<LuigiClient>();

  texts: any = {};
  organizations = signal<string[]>([]);
  organizationToSwitch: string;
  newOrganization: string;

  constructor() {
    effect(() => {
      const ctx = this.context();
      if (ctx) {
        this.i18nService.translationTable = ctx.translationTable;
        this.texts = this.readTranslations();
      }
    });
  }

  ngOnInit(): void {
    this.readOrganizations();
  }

  setOrganizationToSwitch($event: any) {
    this.organizationToSwitch = $event.target.value;
  }

  readOrganizations() {
    const fields = generateGraphQLFields([
      {
        property: 'Accounts.metadata.name',
      },
    ]);
    const queryOperation = 'core_platform_mesh_io';

    this.resourceService
      .readOrganizations(queryOperation, fields, this.context())
      .subscribe({
        next: (result) => {
          this.organizations.set(
            result['Accounts']
              .map((o) => o.metadata.name)
              .filter(
                (o) =>
                  o !== this.luigiCoreService.getGlobalContext().organization,
              ),
          );
        },
      });
  }

  onboardOrganization() {
    const resource: Resource = {
      spec: { type: 'org' },
      metadata: { name: this.newOrganization },
    };
    const resourceDefinition: ResourceDefinition = {
      group: 'core.platform-mesh.io',
      kind: 'Account',
      plural: 'accounts',
      singular: 'account',
      scope: 'Cluster',
    };

    this.resourceService
      .create(resource, resourceDefinition, this.context())
      .subscribe({
        next: (result) => {
          console.debug('Resource created', result.data);
          this.organizations.set([
            this.newOrganization,
            ...this.organizations(),
          ]);
          this.organizationToSwitch = this.newOrganization;
          this.newOrganization = '';
          this.LuigiClient().uxManager().showAlert({
            text: 'New organization has been created, select it from the list to switch to it.',
            type: 'info',
          });
        },
        error: (error) => {
          this.luigiCoreService.showAlert({
            text: `Failure! Could not create organization: ${resource.metadata.name}.`,
            type: 'error',
          });
        },
      });
  }

  private readTranslations() {
    return {
      explanation: this.i18nService.getTranslation(
        'ORGANIZATION_MANAGEMENT_EXPLANATION',
      ),
      switchOrganization: {
        label: this.i18nService.getTranslation(
          'ORGANIZATION_MANAGEMENT_SWITCH_LABEL',
        ),
        button: this.i18nService.getTranslation(
          'ORGANIZATION_MANAGEMENT_SWITCH_BUTTON',
        ),
      },

      onboardOrganization: {
        label: this.i18nService.getTranslation(
          'ORGANIZATION_MANAGEMENT_ONBOARD_LABEL',
        ),
        button: this.i18nService.getTranslation(
          'ORGANIZATION_MANAGEMENT_ONBOARD_BUTTON',
        ),
        placeholder: this.i18nService.getTranslation(
          'ORGANIZATION_MANAGEMENT_ONBOARD_PLACEHOLDER',
        ),
      },
    };
  }

  async switchOrganization() {
    const { baseDomain } = await this.envConfigService.getEnvConfig();
    const protocol = window.location.protocol;
    const fullSubdomain = `${this.organizationToSwitch}.${baseDomain}`;
    const port = window.location.port ? `:${window.location.port}` : '';

    window.location.href = `${protocol}//${fullSubdomain}${port}`;
  }
}
