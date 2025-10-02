import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Departement } from './departement.model';

@Injectable({
  providedIn: 'root'
})
export class DepartementServiceMock {
  private departements: Departement[] = [
    { id: 1, nom: 'Mathématiques', code: 'MATH', faculte_id: 1, created_at: new Date(), updated_at: new Date(), deleted_at: null },
    { id: 2, nom: 'Physique', code: 'PHYS', faculte_id: 1, created_at: new Date(), updated_at: new Date(), deleted_at: null }
  ];

  getAll(): Observable<Departement[]> {
    return of(this.departements.filter(d => !d.deleted_at));
  }

  getById(id: number): Observable<Departement | undefined> {
    return of(this.departements.find(d => d.id === id && !d.deleted_at));
  }

  create(departement: Departement): Observable<Departement> {
    departement.id = this.departements.length > 0 ? Math.max(...this.departements.map(d => d.id)) + 1 : 1;
    const now = new Date();
    departement.created_at = now;
    departement.updated_at = now;
    departement.deleted_at = null;
    this.departements.push(departement);
    return of(departement);
  }

  update(id: number, departement: Departement): Observable<Departement> {
    const index = this.departements.findIndex(d => d.id === id && !d.deleted_at);
    if (index >= 0) {
      this.departements[index] = {
        ...this.departements[index],
        ...departement,
        updated_at: new Date()
      };
      return of(this.departements[index]);
    }
    return of(departement);
  }

  delete(id: number): Observable<void> {
    const index = this.departements.findIndex(d => d.id === id && !d.deleted_at);
    if (index >= 0) {
      this.departements[index].deleted_at = new Date();
      this.departements[index].updated_at = new Date();
    }
    return of();
  }
}
