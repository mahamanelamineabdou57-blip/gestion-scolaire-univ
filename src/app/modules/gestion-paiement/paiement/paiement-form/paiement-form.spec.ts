import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementForm } from './paiement-form';

describe('PaiementForm', () => {
  let component: PaiementForm;
  let fixture: ComponentFixture<PaiementForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
