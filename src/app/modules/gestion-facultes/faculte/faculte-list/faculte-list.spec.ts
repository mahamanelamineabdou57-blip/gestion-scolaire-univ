import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaculteList } from './faculte-list';

describe('FaculteList', () => {
  let component: FaculteList;
  let fixture: ComponentFixture<FaculteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaculteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaculteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
