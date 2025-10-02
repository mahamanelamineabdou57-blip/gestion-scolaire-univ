import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversiteForm } from './universite-form';

describe('UniversiteForm', () => {
  let component: UniversiteForm;
  let fixture: ComponentFixture<UniversiteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversiteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniversiteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
