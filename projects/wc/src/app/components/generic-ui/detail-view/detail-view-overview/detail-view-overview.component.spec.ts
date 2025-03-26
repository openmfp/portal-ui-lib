import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailViewOverviewComponent } from './detail-view-overview.component';

describe('DetailViewOverviewComponent', () => {
  let component: DetailViewOverviewComponent;
  let fixture: ComponentFixture<DetailViewOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailViewOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailViewOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
