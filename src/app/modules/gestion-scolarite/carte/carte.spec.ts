import { TestBed } from '@angular/core/testing';

import { Carte } from './carte.service';

describe('Carte', () => {
  let service: Carte;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Carte);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
