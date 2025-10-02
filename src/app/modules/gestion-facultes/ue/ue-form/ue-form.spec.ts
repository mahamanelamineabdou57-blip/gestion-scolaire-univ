import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UEForm } from './ue-form';


describe('UeForm', () => {
  let component: UEForm;
  let fixture: ComponentFixture<UEForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UEForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UEForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
