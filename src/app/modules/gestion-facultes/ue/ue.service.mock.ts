import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UE } from './ue.model';

@Injectable({
  providedIn: 'root'
})
export class UEServiceMock {
  private ues: UE[] = [
    { id: 1, nom: 'Mathématiques', code: 'MATH101', formation_id: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 2, nom: 'Physique', code: 'PHYS101', formation_id: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  ]; 

  getAll(): Observable<UE[]> {
    return of(this.ues.filter(u => !u.deletedAt));
  }

  getById(id: number): Observable<UE | undefined> {
    return of(this.ues.find(u => u.id === id && !u.deletedAt));
  }

  create(ue: UE): Observable<UE> {
    ue.id = this.ues.length > 0 ? Math.max(...this.ues.map(u => u.id)) + 1 : 1;
    const now = new Date();
    ue.createdAt = now;
    ue.updatedAt = now;
    ue.deletedAt = null;
    this.ues.push(ue);
    return of(ue);
  }

  update(id: number, ue: UE): Observable<UE> {
    const index = this.ues.findIndex(u => u.id === id && !u.deletedAt);
    if (index >= 0) {
      this.ues[index] = { ...this.ues[index], ...ue, updatedAt: new Date() };
      return of(this.ues[index]);
    }
    return of(ue);
  }

  delete(id: number): Observable<void> {
    const index = this.ues.findIndex(u => u.id === id && !u.deletedAt);
    if (index >= 0) {
      this.ues[index].deletedAt = new Date();
      this.ues[index].updatedAt = new Date();
    }
    return of();
  }
}
