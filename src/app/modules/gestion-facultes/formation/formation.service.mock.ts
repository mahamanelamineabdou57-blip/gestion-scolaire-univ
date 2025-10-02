import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Formation } from './formation.model';

@Injectable({
  providedIn: 'root'
})
export class FormationServiceMock {
  private formations: Formation[] = [
    { id: 1, nom: 'Licence Mathématiques', code: 'LIC-MATH', conditions: 'Niveau secondaire', duree: 3, departement_id: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 2, nom: 'Licence Physique', code: 'LIC-PHYS', conditions: 'Avoir validé MATH101', duree: 4, departement_id: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  ];

  getAll(): Observable<Formation[]> {
    return of(this.formations.filter(f => !f.deletedAt));
  }

  getById(id: number): Observable<Formation | undefined> {
    return of(this.formations.find(f => f.id === id && !f.deletedAt));
  }

  create(formation: Formation): Observable<Formation> {
    formation.id = this.formations.length > 0 ? Math.max(...this.formations.map(f => f.id)) + 1 : 1;
    const now = new Date();
    formation.createdAt = now;
    formation.updatedAt = now;
    formation.deletedAt = null;
    this.formations.push(formation);
    return of(formation);
  }

  update(id: number, formation: Formation): Observable<Formation> {
    const index = this.formations.findIndex(f => f.id === id && !f.deletedAt);
    if (index >= 0) {
      this.formations[index] = {
        ...this.formations[index],
        ...formation,
        updatedAt: new Date()
      };
      return of(this.formations[index]);
    }
    return of(formation);
  }

  delete(id: number): Observable<void> {
    const index = this.formations.findIndex(f => f.id === id && !f.deletedAt);
    if (index >= 0) {
      this.formations[index].deletedAt = new Date();
      this.formations[index].updatedAt = new Date();
    }
    return of();
  }
}
