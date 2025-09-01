import {
  ICON_DESIGN_NEGATIVE,
  ICON_DESIGN_POSITIVE,
  ICON_NAME_NEGATIVE,
  ICON_NAME_POSITIVE,
} from './value-cell.constants';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IconComponent } from '@ui5/webcomponents-ngx';

export type IconDesignType =
  | typeof ICON_DESIGN_POSITIVE
  | typeof ICON_DESIGN_NEGATIVE;

@Component({
  selector: 'value-cell',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './value-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueCellComponent {
  value = input<unknown>();
  isBoolLike = computed(() => this.boolValue() !== undefined);
  iconDesign = computed<IconDesignType | undefined>(() => {
    return this.boolValue() === undefined
      ? undefined
      : this.boolValue()
        ? ICON_DESIGN_POSITIVE
        : ICON_DESIGN_NEGATIVE;
  });
  iconName = computed<string | undefined>(() => {
    return this.boolValue() === undefined
      ? undefined
      : this.boolValue()
        ? ICON_NAME_POSITIVE
        : ICON_NAME_NEGATIVE;
  });

  private boolValue = computed(() => this.normalizeBoolean(this.value()));

  private normalizeBoolean(value: unknown): boolean | undefined {
    const normalizedValue = value?.toString()?.toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }
    if (normalizedValue === 'false') {
      return false;
    }
    return undefined;
  }
}
