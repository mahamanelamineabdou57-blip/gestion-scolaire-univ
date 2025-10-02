import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuriteAccesList } from './securite-acces-list';

describe('SecuriteAccesList', () => {
  let component: SecuriteAccesList;
  let fixture: ComponentFixture<SecuriteAccesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecuriteAccesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecuriteAccesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
