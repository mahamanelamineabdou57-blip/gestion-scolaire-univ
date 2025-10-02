// securite-access.service.mock.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UtilisateurService } from '../utilisateurs/utilisateur.service';
import { UtilisateurServiceMock } from '../utilisateurs/utilisateur.service.mock';
import { Utilisateur } from '../utilisateurs/utilisateur.model';
import { Interface } from './interface.model';
import { Acces } from './acces.model';

@Injectable({ providedIn: 'root' })
export class SecuriteAccessServiceMock {

  private interfaces: Interface[] = [
    { id: 1, nom: 'Dashboard' },
    { id: 2, nom: 'Utilisateurs' },
    { id: 3, nom: 'Rôles' },
    { id: 4, nom: 'Années scolaires' }
  ];

  private acces: Acces[] = [
    { inteface_id: 1, utilisateur_id: 1, droits: 'lecture_ecriture' },
    { inteface_id: 2, utilisateur_id: 1, droits: 'lecture' }
  ];

  constructor(
    private utilisateurService: UtilisateurServiceMock,
  ) {}
  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.utilisateurService.getAll();
  }

  getInterfaces(): Observable<Interface[]> {
    return of(this.interfaces);
  }

  getAccesByUtilisateur(userId: number): Observable<Acces[]> {
    return of(this.acces.filter(a => a.utilisateur_id === userId && !a.deletedAt));
  }

  saveAcces(userId: number, acces: Acces[]): Observable<any> {
    this.acces = this.acces.filter(a => a.utilisateur_id !== userId);
    const now = new Date();
    this.acces.push(
      ...acces.map(a => ({
        ...a,
        createdAt: now,
        updatedAt: now,
        deletedAt: undefined
      }))
    );
    return of({ success: true });
  }
}
