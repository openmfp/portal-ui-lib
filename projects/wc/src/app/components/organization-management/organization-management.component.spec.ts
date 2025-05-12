import { OrganizationManagementComponent } from './organization-management.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { I18nService } from '@openmfp/portal-ui-lib';

describe('OrganizationManagementComponent', () => {
  let component: OrganizationManagementComponent;
  let fixture: ComponentFixture<OrganizationManagementComponent>;
  let mockI18nService: Partial<I18nService>;

  beforeEach(() => {
    mockI18nService = {
      getTranslation: (key: string) => `translated_${key}`,
    };

    TestBed.configureTestingModule({
      imports: [OrganizationManagementComponent],
      providers: [{ provide: I18nService, useValue: mockI18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize translations from context input', () => {
    const context = {
      translationTable: {},
    };
    component.context = (() => context) as any;
    expect(component.texts.explanation).toBe(
      'translated_ORGANIZATION_MANAGEMENT_EXPLANATION',
    );
    expect(component.texts.switchOrganization.label).toBe(
      'translated_ORGANIZATION_MANAGEMENT_SWITCH_LABEL',
    );
  });

  it('should set organizationToSwitch from event', () => {
    const event = { target: { value: 'Organization 2' } };
    component.setOrganizationToSwitch(event);
    expect(component.organizationToSwitch).toBe('Organization 2');
  });
});
