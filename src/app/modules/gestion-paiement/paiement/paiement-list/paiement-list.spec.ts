import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementList } from './paiement-list';

describe('PaiementList', () => {
  let component: PaiementList;
  let fixture: ComponentFixture<PaiementList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
