import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ECUE } from './ecue.model';

@Injectable({
  providedIn: 'root'
})
export class ECUEServiceMock {
  private ecues: ECUE[] = [
    { id: 1, nom: 'Algèbre Linéaire', code: 'MATH101-1', credits: 5, ue_id: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 2, nom: 'Mécanique', code: 'PHYS101-1', credits: 4, ue_id: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  ];

  getAll(): Observable<ECUE[]> {
    return of(this.ecues.filter(e => !e.deletedAt));
  }

  getById(id: number): Observable<ECUE | undefined> {
    return of(this.ecues.find(e => e.id === id && !e.deletedAt));
  }

  create(ecue: ECUE): Observable<ECUE> {
    ecue.id = this.ecues.length > 0 ? Math.max(...this.ecues.map(e => e.id)) + 1 : 1;
    const now = new Date();
    ecue.createdAt = now;
    ecue.updatedAt = now;
    ecue.deletedAt = null;
    this.ecues.push(ecue);
    return of(ecue);
  }

  update(id: number, ecue: ECUE): Observable<ECUE> {
    const index = this.ecues.findIndex(e => e.id === id && !e.deletedAt);
    if (index >= 0) {
      this.ecues[index] = { ...this.ecues[index], ...ecue, updatedAt: new Date() };
      return of(this.ecues[index]);
    }
    return of(ecue);
  }

  delete(id: number): Observable<void> {
    const index = this.ecues.findIndex(e => e.id === id && !e.deletedAt);
    if (index >= 0) {
      this.ecues[index].deletedAt = new Date();
      this.ecues[index].updatedAt = new Date();
    }
    return of();
  }
}
