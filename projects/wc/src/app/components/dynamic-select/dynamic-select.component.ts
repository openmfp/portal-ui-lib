import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FieldDefinition,
  ResourceNodeContext,
  ResourceService,
} from '@openmfp/portal-ui-lib';
import { OptionComponent, SelectComponent } from '@ui5/webcomponents-ngx';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'dynamic-select',
  imports: [SelectComponent, OptionComponent],
  templateUrl: './dynamic-select.component.html',
  styleUrl: './dynamic-select.component.scss',
})
export class DynamicSelectComponent {
  field = input.required<FieldDefinition>();
  context = input.required<ResourceNodeContext>();

  value = input<string>();
  required = input<boolean>(false);
  valueState = input<
    'None' | 'Positive' | 'Critical' | 'Negative' | 'Information'
  >('None');

  change = output<Event>();
  input = output<Event>();
  blur = output<void>();

  dynamicValues$ = signal<{ label: string; property: string }[]>([]);

  private resourceService = inject(ResourceService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.getDynamicValues(this.field(), this.context())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          this.dynamicValues$.set(result);
        });
    });
  }

  private getDynamicValues(
    fieldDefinition: FieldDefinition,
    context: ResourceNodeContext,
  ): Observable<{ label: string; property: string }[]> {
    return this.resourceService
      .list(
        fieldDefinition.dynamicValuesDefinition.opeartion,
        fieldDefinition.dynamicValuesDefinition.gqlQuery,
        context,
      )
      .pipe(
        map((result) =>
          result.map((resource) => ({
            label: this.getValueByPath(
              resource,
              fieldDefinition.dynamicValuesDefinition.value,
            ),
            property: this.getValueByPath(
              resource,
              fieldDefinition.dynamicValuesDefinition.key,
            ),
          })),
        ),
      );
  }

  private getValueByPath<T extends object, R = unknown>(
    obj: T,
    path: string,
  ): R | undefined {
    return path.split('.').reduce((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return acc[key];
      }
      return undefined;
    }, obj);
  }
}
