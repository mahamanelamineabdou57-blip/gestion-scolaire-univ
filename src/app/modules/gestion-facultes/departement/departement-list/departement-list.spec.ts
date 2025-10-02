import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementList } from './departement-list';

describe('DepartementList', () => {
  let component: DepartementList;
  let fixture: ComponentFixture<DepartementList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartementList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartementList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
