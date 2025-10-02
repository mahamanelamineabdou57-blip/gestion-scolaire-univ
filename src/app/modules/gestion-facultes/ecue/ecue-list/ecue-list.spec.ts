import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcueList } from './ecue-list';

describe('EcueList', () => {
  let component: EcueList;
  let fixture: ComponentFixture<EcueList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcueList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcueList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
