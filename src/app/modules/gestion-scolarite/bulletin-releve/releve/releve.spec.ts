import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Releve } from './releve';

describe('Releve', () => {
  let component: Releve;
  let fixture: ComponentFixture<Releve>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Releve]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Releve);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
