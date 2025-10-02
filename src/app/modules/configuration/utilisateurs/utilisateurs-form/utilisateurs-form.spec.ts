import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateursForm } from './utilisateurs-form';

describe('UtilisateursForm', () => {
  let component: UtilisateursForm;
  let fixture: ComponentFixture<UtilisateursForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateursForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateursForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
