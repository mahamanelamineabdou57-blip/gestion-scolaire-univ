import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaculteForm } from './faculte-form';

describe('FaculteForm', () => {
  let component: FaculteForm;
  let fixture: ComponentFixture<FaculteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaculteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaculteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
