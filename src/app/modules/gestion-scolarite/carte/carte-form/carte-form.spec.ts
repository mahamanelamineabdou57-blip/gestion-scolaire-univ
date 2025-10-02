import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteForm } from './carte-form';

describe('CarteForm', () => {
  let component: CarteForm;
  let fixture: ComponentFixture<CarteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
