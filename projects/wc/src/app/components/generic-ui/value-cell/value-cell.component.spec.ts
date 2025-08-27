jest.mock('@ui5/webcomponents-ngx', () => ({ IconComponent: class {} }), { virtual: true });

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValueCellComponent } from './value-cell.component';
import {
  ICON_DESIGN_NEGATIVE,
  ICON_DESIGN_POSITIVE,
  ICON_NAME_NEGATIVE,
  ICON_NAME_POSITIVE,
} from './value-cell.constants';

describe('ValueCellComponent', () => {
  let component: ValueCellComponent;
  let fixture: ComponentFixture<ValueCellComponent>;

  const makeComponent = (value: unknown) => {
    fixture = TestBed.createComponent(ValueCellComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('value', value as any);

    fixture.detectChanges();

    return { component, fixture };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
    }).overrideComponent(ValueCellComponent, {
      set: { template: '<div></div>', imports: [] },
    });
  });

  it('should create', () => {
    const { component } = makeComponent('r1');
    expect(component).toBeTruthy();
  });

  it('should accept non-boolean value and mark as not boolean-like', () => {
    const { component } = makeComponent('cluster-a');

    const vm: any = component.vm();
    expect(vm.isBool).toBe(false);
    expect(vm.value).toBe('cluster-a');
  });

  it("should accept boolean-like 'true' string and set positive icon and design", () => {
    const { component } = makeComponent('true');

    const vm: any = component.vm();
    expect(vm.isBool).toBe(true);
    if (vm.isBool) {
      expect(vm.iconDesign).toBe(ICON_DESIGN_POSITIVE);
      expect(vm.iconName).toBe(ICON_NAME_POSITIVE);
    }
  });

  it("should accept boolean-like 'false' string and set negative icon and design", () => {
    const { component } = makeComponent('false');

    const vm: any = component.vm();
    expect(vm.isBool).toBe(true);
    if (vm.isBool) {
      expect(vm.iconDesign).toBe(ICON_DESIGN_NEGATIVE);
      expect(vm.iconName).toBe(ICON_NAME_NEGATIVE);
    }
  });

  it('should accept boolean value true and set positive icon', () => {
    const { component } = makeComponent(true);

    const vm: any = component.vm();
    expect(vm.isBool).toBe(true);
    if (vm.isBool) {
      expect(vm.iconDesign).toBe(ICON_DESIGN_POSITIVE);
      expect(vm.iconName).toBe(ICON_NAME_POSITIVE);
    }
  });
});
