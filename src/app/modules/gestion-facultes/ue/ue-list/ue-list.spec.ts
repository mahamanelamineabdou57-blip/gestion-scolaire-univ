import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UEList } from './ue-list';


describe('UeList', () => {
  let component: UEList;
  let fixture: ComponentFixture<UEList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UEList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UEList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
