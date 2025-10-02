import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AnneeScolaire } from './annee-scolaire.model';

@Injectable({
  providedIn: 'root'
})
export class AnneeScolaireServiceMock {
  private annees: AnneeScolaire[] = [
    { id: 1, nom: '2023-2024', actif: false },
    { id: 2, nom: '2024-2025', actif: true }
  ];

  getAll(): Observable<AnneeScolaire[]> {
    return of(this.annees.filter(a => !a.deletedAt));
  }

  getById(id: number): Observable<AnneeScolaire | undefined> {
    return of(this.annees.find(a => a.id === id));
  }

  create(annee: AnneeScolaire): Observable<AnneeScolaire> {
    annee.id = Math.max(...this.annees.map(a => a.id)) + 1;
    annee.createdAt = new Date();
    annee.updatedAt = new Date();
    annee.deletedAt = undefined;
    this.annees.push(annee);
    return of(annee);
  }

  update(id: number, annee: AnneeScolaire): Observable<AnneeScolaire> {
    const index = this.annees.findIndex(a => a.id === id);
    if (index >= 0) {
      this.annees[index] = { ...annee, updatedAt: new Date() };
      return of(this.annees[index]);
    }
    return of(annee);
  }

  delete(id: number): Observable<void> {
    const index = this.annees.findIndex(a => a.id === id);
    if (index >= 0) this.annees[index].deletedAt = new Date();
    return of();
  }
}
