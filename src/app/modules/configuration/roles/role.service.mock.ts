import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Role } from './role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceMock {
  private roles: Role[] = [
    { id: 1, nom: 'Administrateur', description: 'Accès complet' },
    { id: 2, nom: 'Utilisateur', description: 'Accès limité' },
    { id: 3, nom: 'Gestionnaire', description: 'Accès aux rapports' }
  ];

  private roles$ = new BehaviorSubject<Role[]>(this.roles);

  getAll(): Observable<Role[]> {
    return of(this.roles.filter(r => !r.deletedAt));
  }

  getById(id: number): Observable<Role | undefined> {
    return of(this.roles.find(r => r.id === id));
  }

  create(role: Role): Observable<Role> {
    role.id = this.roles.length ? Math.max(...this.roles.map(r => r.id)) + 1 : 1;
    role.createdAt = new Date();
    role.updatedAt = new Date();
    role.deletedAt = undefined;
    this.roles.push(role);
    this.roles$.next(this.roles);
    return of(role);
  }

  update(role: Role): Observable<Role> {
    const index = this.roles.findIndex(r => r.id === role.id);
    if (index !== -1) this.roles[index] = { ...role, updatedAt: new Date() };
    this.roles$.next(this.roles);
    return of(role);
  }

  delete(id: number): Observable<boolean> {
    const index = this.roles.findIndex(r => r.id === id);
    if (index !== -1) this.roles[index].deletedAt = new Date();
    this.roles$.next(this.roles.filter(r => !r.deletedAt));
    return of(true);
  }
}
