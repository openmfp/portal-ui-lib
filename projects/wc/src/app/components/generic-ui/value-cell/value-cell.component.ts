import {
  ICON_DESIGN_NEGATIVE,
  ICON_DESIGN_POSITIVE,
  ICON_NAME_NEGATIVE,
  ICON_NAME_POSITIVE,
} from './value-cell.constants';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '@ui5/webcomponents-ngx';

export type IconDesignType = typeof ICON_DESIGN_POSITIVE | typeof ICON_DESIGN_NEGATIVE;

@Component({
  selector: 'value-cell',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './value-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueCellComponent {
  value = input<unknown>();

  isBoolLike = computed(() => this.isBooleanLike(this.value()));
  iconDesign = computed(() =>
    this.isBoolLike()
      ? this.booleanIconDesign(this.value())
      : undefined
  );
  iconName = computed(() =>
    this.isBoolLike()
      ? this.iconDesign() === ICON_DESIGN_POSITIVE
        ? ICON_NAME_POSITIVE
        : ICON_NAME_NEGATIVE
      : undefined
  );

  private isBooleanLike(val: any): boolean {
    return typeof val === 'boolean' || val === 'true' || val === 'false';
  }

  private booleanIconDesign(val: any): IconDesignType {
    return val === true || val === 'true'
      ? ICON_DESIGN_POSITIVE
      : ICON_DESIGN_NEGATIVE;
  }

}
