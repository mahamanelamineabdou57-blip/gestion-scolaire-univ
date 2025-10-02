import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Utilisateur } from './utilisateur.model';
import { Role } from '../roles/role.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurServiceMock {
  private roles: Role[] = [
    { id: 1, nom: 'Admin', description: 'Administrateur' },
    { id: 2, nom: 'Utilisateur', description: 'Utilisateur standard' }
  ];

  private utilisateurs: Utilisateur[] = [
    { id: 1, matricule: 'U001', nom: 'Dupont', prenom: 'Jean', email: 'j.dupont@example.com', telephone: '0102030405', role: { id: 1, nom: 'Admin', description: 'Administrateur' } },
    { id: 2, matricule: 'U002', nom: 'Pierre', prenom: 'Marie', email: 'm.pierre@example.com', telephone: '0203040506', role: { id: 2, nom: 'Utilisateur', description: 'Utilisateur standard' } }
  ];

  getAll(): Observable<Utilisateur[]> {
  return of(this.utilisateurs.filter(u => !u.deletedAt));
  }

  getById(id: number): Observable<Utilisateur> {
    const user = this.utilisateurs.find(u => u.id === id)!;
    return of(user);
  }

  create(data: Utilisateur): Observable<Utilisateur> {
    data.id = Math.max(...this.utilisateurs.map(u => u.id)) + 1;
    data.createdAt = new Date();
    data.updatedAt = new Date();
    data.deletedAt = undefined;
    this.utilisateurs.push(data);
    return of(data);
  }

  update(id: number, data: Utilisateur): Observable<Utilisateur> {
    const index = this.utilisateurs.findIndex(u => u.id === id);
    if (index !== -1) this.utilisateurs[index] = { ...data, updatedAt: new Date() };
    return of(data);
  }

  delete(id: number): Observable<any> {
    const index = this.utilisateurs.findIndex(u => u.id === id);
    if (index !== -1) this.utilisateurs[index].deletedAt = new Date();
    return of({ success: true });
  }

  getRoles(): Observable<Role[]> {
    return of(this.roles.filter(u => !u.deletedAt));
  }
}
