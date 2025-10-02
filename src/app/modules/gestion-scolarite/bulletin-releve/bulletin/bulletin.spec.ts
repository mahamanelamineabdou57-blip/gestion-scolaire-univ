import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bulletin } from './bulletin';

describe('Bulletin', () => {
  let component: Bulletin;
  let fixture: ComponentFixture<Bulletin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bulletin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bulletin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
