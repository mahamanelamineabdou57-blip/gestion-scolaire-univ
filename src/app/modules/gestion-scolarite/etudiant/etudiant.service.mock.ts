import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Etudiant } from './etudiant.model';

@Injectable({
  providedIn: 'root'
})
export class EtudiantServiceMock {
  private etudiants: Etudiant[] = [
    {
      id: 1,
      matricule: '2025-001',
      nom: 'Doe',
      prenom: 'John',
      dateNaissance: '2000-01-01',
      email: 'john.doe@email.com',
      telephone: '770000001',
      photo: '',
      contact_nom: 'Doe',
      contact_prenom: 'James',
      contact_telephone: '770000002',
      contact_lien: 'Père',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    },
    {
      id: 2,
      matricule: '2025-002',
      nom: 'Doe',
      prenom: 'Jane',
      dateNaissance:'2003-01-01',
      email: 'jane.doe@email.com',
      telephone: '770000003',
      photo: '',
      contact_nom: 'Doe',
      contact_prenom: 'Janine',
      contact_telephone: '770000004',
      contact_lien: 'Mère',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    }
  ];

  getAll(): Observable<Etudiant[]> {
    return of(this.etudiants.filter(e => !e.deletedAt));
  }

  getById(id: number): Observable<Etudiant | undefined> {
    return of(this.etudiants.find(e => e.id === id && !e.deletedAt));
  }

  create(etudiant: Etudiant): Observable<Etudiant> {
    etudiant.id = this.etudiants.length > 0 ? Math.max(...this.etudiants.map(e => e.id)) + 1 : 1;
    const now = new Date();
    etudiant.createdAt = now;
    etudiant.updatedAt = now;
    etudiant.deletedAt = null;
    this.etudiants.push(etudiant);
    return of(etudiant);
  }

  update(id: number, etudiant: Etudiant): Observable<Etudiant> {
    const index = this.etudiants.findIndex(e => e.id === id && !e.deletedAt);
    if (index >= 0) {
      this.etudiants[index] = {
        ...this.etudiants[index],
        ...etudiant,
        updatedAt: new Date()
      };
      return of(this.etudiants[index]);
    }
    return of(etudiant);
  }

  delete(id: number): Observable<void> {
    const index = this.etudiants.findIndex(e => e.id === id && !e.deletedAt);
    if (index >= 0) {
      this.etudiants[index].deletedAt = new Date();
      this.etudiants[index].updatedAt = new Date();
    }
    return of();
  }
}
