import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureToggleComponent } from './feature-toggle.component';

describe('FeatureToggleComponent', () => {
  let component: FeatureToggleComponent;
  let fixture: ComponentFixture<FeatureToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
