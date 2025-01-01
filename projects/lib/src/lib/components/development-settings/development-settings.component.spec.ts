import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopmentSettingsComponent } from './development-settings.component';

describe('DevelopmentSettingsComponent', () => {
  let component: DevelopmentSettingsComponent;
  let fixture: ComponentFixture<DevelopmentSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopmentSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevelopmentSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
