import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnneeScolaireList } from './annee-scolaire-list';

describe('AnneeScolaireList', () => {
  let component: AnneeScolaireList;
  let fixture: ComponentFixture<AnneeScolaireList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnneeScolaireList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnneeScolaireList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
