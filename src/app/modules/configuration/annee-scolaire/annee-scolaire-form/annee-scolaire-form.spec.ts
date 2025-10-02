import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeScolaireForm } from './annee-scolaire-form';

describe('AnneeScolaireForm', () => {
  let component: AnneeScolaireForm;
  let fixture: ComponentFixture<AnneeScolaireForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnneeScolaireForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnneeScolaireForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
