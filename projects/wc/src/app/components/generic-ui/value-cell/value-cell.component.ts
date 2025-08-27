import {
  FALSE_STRING,
  ICON_DESIGN_NEGATIVE,
  ICON_DESIGN_POSITIVE,
  ICON_NAME_NEGATIVE,
  ICON_NAME_POSITIVE,
  TRUE_STRING,
} from './value-cell.constants';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '@ui5/webcomponents-ngx';

import { ValueCellVm } from './value-cell-vm';

@Component({
  selector: 'value-cell',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './value-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueCellComponent {
  value = input<unknown>();

  vm = computed<ValueCellVm>(() => {
    const current = this.value();
    if (this.isBooleanLikeFn(current)) {
      const design = this.booleanIconDesign(current);
      const name = design === ICON_DESIGN_POSITIVE ? ICON_NAME_POSITIVE : ICON_NAME_NEGATIVE;
      return { isBool: true as const, iconDesign: design, iconName: name };
    }
    return { isBool: false as const, value: current };
  });

  protected booleanIconDesign = (
    value: unknown,
  ): 'Positive' | 'Negative' => {
    const asBool = this.toBoolean(value);
    return asBool ? ICON_DESIGN_POSITIVE : ICON_DESIGN_NEGATIVE;
  };

  protected isBooleanLikeFn = (value: unknown): boolean => {
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
