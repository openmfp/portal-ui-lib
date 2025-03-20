import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateResourceModalComponent } from './create-resource-modal.component';

describe('CreateResourceModalComponent', () => {
  let component: CreateResourceModalComponent;
  let fixture: ComponentFixture<CreateResourceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateResourceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateResourceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
