import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionList } from './inscription-list';

describe('InscriptionList', () => {
  let component: InscriptionList;
  let fixture: ComponentFixture<InscriptionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
