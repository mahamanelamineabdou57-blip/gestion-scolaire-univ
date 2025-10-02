import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteList } from './carte-list';

describe('CarteList', () => {
  let component: CarteList;
  let fixture: ComponentFixture<CarteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
