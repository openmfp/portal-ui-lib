import { DynamicSelectComponent } from './dynamic-select.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceService } from '@openmfp/portal-ui-lib';
import { of } from 'rxjs';

const mockResourceService = {
  list: jest.fn(),
};

describe('DynamicSelectComponent', () => {
  let component: DynamicSelectComponent;
  let fixture: ComponentFixture<DynamicSelectComponent>;

  beforeEach(async () => {
    mockResourceService.list.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DynamicSelectComponent],
      providers: [{ provide: ResourceService, useValue: mockResourceService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .overrideComponent(DynamicSelectComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DynamicSelectComponent);
    component = fixture.componentInstance;

    const fieldDefinition: any = {
      dynamicValuesDefinition: {
        opeartion: 'getData',
        gqlQuery: '{ someQuery }',
        key: 'id',
        value: 'name',
      },
    };

    const context: any = { id: 'ctx' };

    component.field = (() => fieldDefinition) as any;
    component.context = (() => context) as any;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dynamicValues via ResourceService', () => {
    const mockResponse = [
      { id: '1', name: 'First' },
      { id: '2', name: 'Second' },
    ];

    mockResourceService.list.mockReturnValue(of(mockResponse));

    fixture.detectChanges();

    const values = component.dynamicValues$();
    expect(values).toEqual([
      { property: '1', label: 'First' },
      { property: '2', label: 'Second' },
    ]);
  });
});
