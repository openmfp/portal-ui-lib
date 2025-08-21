import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValueCellComponent } from './value-cell.component';
import { FieldDefinition, Resource } from '@openmfp/portal-ui-lib';
import {
  ICON_DESIGN_NEGATIVE,
  ICON_DESIGN_POSITIVE,
  ICON_NAME_NEGATIVE,
  ICON_NAME_POSITIVE,
} from './value-cell.constants';

describe('ValueCellComponent', () => {
  let component: ValueCellComponent;
  let fixture: ComponentFixture<ValueCellComponent>;

  const makeComponent = (resource: Resource | null | undefined, field: FieldDefinition) => {
    fixture = TestBed.createComponent(ValueCellComponent);
    component = fixture.componentInstance;

    component.resource = (() => resource) as any;
    component.field = (() => field) as any;

    fixture.detectChanges();

    return { component, fixture };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      // No special providers required; component is standalone
    }).overrideComponent(ValueCellComponent, {
      // Template isn't required for logic tests; keep it minimal to avoid ShadowDom querying complexities
      set: { template: '<div></div>' },
    });
  });

  it('should create', () => {
    const resource = { metadata: { name: 'r1' } } as any;
    const field: FieldDefinition = { label: 'Name', property: 'metadata.name' } as any;

    const { component } = makeComponent(resource, field);
    expect(component).toBeTruthy();
  });

  it('should compute non-boolean value and mark as not boolean-like', () => {
    const resource = { metadata: { name: 'cluster-a' } } as any;
    const field: FieldDefinition = { label: 'Name', property: 'metadata.name' } as any;

    const { component } = makeComponent(resource, field);

    expect(component.cellValue).toBe('cluster-a');
    expect(component.isBoolLike).toBe(false);
    expect(component.iconDesign).toBeUndefined();
    expect(component.iconName).toBeUndefined();
  });

  it("should compute boolean-like 'true' value and set positive icon and design", () => {
    const resource = { spec: { ready: 'true' } } as any;
    const field: FieldDefinition = { label: 'Ready', property: 'spec.ready' } as any;

    const { component } = makeComponent(resource, field);

    expect(component.isBoolLike).toBe(true);
    expect(component.iconDesign).toBe(ICON_DESIGN_POSITIVE);
    expect(component.iconName).toBe(ICON_NAME_POSITIVE);
  });

  it("should compute boolean-like 'false' value and set negative icon and design", () => {
    const resource = { spec: { ready: 'false' } } as any;
    const field: FieldDefinition = { label: 'Ready', property: 'spec.ready' } as any;

    const { component } = makeComponent(resource, field);

    expect(component.isBoolLike).toBe(true);
    expect(component.iconDesign).toBe(ICON_DESIGN_NEGATIVE);
    expect(component.iconName).toBe(ICON_NAME_NEGATIVE);
  });

  it('should accept boolean value true and set positive icon', () => {
    const resource = { spec: { ready: true } } as any;
    const field: FieldDefinition = { label: 'Ready', property: 'spec.ready' } as any;

    const { component } = makeComponent(resource, field);

    expect(component.isBoolLike).toBe(true);
    expect(component.iconDesign).toBe(ICON_DESIGN_POSITIVE);
    expect(component.iconName).toBe(ICON_NAME_POSITIVE);
  });
});
