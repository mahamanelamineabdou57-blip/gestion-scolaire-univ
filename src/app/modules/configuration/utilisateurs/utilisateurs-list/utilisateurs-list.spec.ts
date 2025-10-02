import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateursList } from './utilisateurs-list';

describe('UtilisateursList', () => {
  let component: UtilisateursList;
  let fixture: ComponentFixture<UtilisateursList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateursList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateursList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
