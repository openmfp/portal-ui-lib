import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, input } from '@angular/core';
import { FieldDefinition, Resource, getResourceValueByJsonPath } from '@openmfp/portal-ui-lib';
import { IconComponent } from '@ui5/webcomponents-ngx';

import { FALSE_STRING, ICON_DESIGN_NEGATIVE, ICON_DESIGN_POSITIVE, ICON_NAME_NEGATIVE, ICON_NAME_POSITIVE, TRUE_STRING } from './value-cell.constants';

@Component({
  selector: 'value-cell',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './value-cell.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueCellComponent {
  resource = input<Resource | null | undefined>();
  field = input<FieldDefinition>();

  cellValue: unknown;
  isBoolLike: boolean = false;
  iconDesign: 'Positive' | 'Negative';
  iconName: string;

  constructor() {
    effect(() => {
      const resource = this.resource();
      const field = this.field();
      if (field) {
        this.cellValue = getResourceValueByJsonPath(resource as Resource, field);
        this.isBoolLike = this.isBooleanLike(this.cellValue);
        if (this.isBoolLike) {
          this.iconDesign = this.booleanIconDesign(this.cellValue);
          this.iconName = this.iconDesign === ICON_DESIGN_POSITIVE ? ICON_NAME_POSITIVE : ICON_NAME_NEGATIVE;
        }
      }
    });
  }

  protected booleanIconDesign = (
    value: unknown,
  ): 'Positive' | 'Negative' => {
    const asBool = this.toBoolean(value);
    return asBool ? ICON_DESIGN_POSITIVE : ICON_DESIGN_NEGATIVE;
  };

  protected isBooleanLike = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
      return true;
    }
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();

      return v === TRUE_STRING || v === FALSE_STRING;
    }
    return false;
  };

  private toBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === TRUE_STRING;
    }
    return false;
  };

}
