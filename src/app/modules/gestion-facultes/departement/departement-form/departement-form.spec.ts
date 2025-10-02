import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementForm } from './departement-form';

describe('DepartementForm', () => {
  let component: DepartementForm;
  let fixture: ComponentFixture<DepartementForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartementForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartementForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
