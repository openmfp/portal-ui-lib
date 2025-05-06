import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { I18nService } from '@openmfp/portal-ui-lib';
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
  ],
  templateUrl: './organization-management.component.html',
  styleUrl: './organization-management.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class OrganizationManagementComponent {
  private i18nService = inject(I18nService);

  texts: any = {};
  organizations: string[] = ['Organization 1', 'Organization 2'];
  organizationToSwitch: string;

  @Input()
  set context(context: any) {
    this.i18nService.translationTable = context.translationTable;
    this.texts = this.readTranslations();
  }

  @Input()
  LuigiClient: LuigiClient;

  setOrganizationToSwitch($event: any) {
    this.organizationToSwitch = $event.target.value;
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
}
