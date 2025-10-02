import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Inscription } from './inscription.model';
import { PaiementServiceMock } from '../../gestion-paiement/paiement/paiement.service.mock';

@Injectable({
  providedIn: 'root'
})
export class InscriptionServiceMock {
  private inscriptions: Inscription[] = [
    { id: 1, etudiant_id: 1, formation_id: 1, statut: 'en_cours', anneeScolaire_id: 1, semestre_courant: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 2, etudiant_id: 2, formation_id: 2, statut: 'termine', anneeScolaire_id: 1, semestre_courant: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 3, etudiant_id: 2, formation_id: 2, statut: 'en_cours', anneeScolaire_id: 1, semestre_courant: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  ];

  constructor(private paiementService: PaiementServiceMock) {}

  getAll(): Observable<Inscription[]> {
    return of(this.inscriptions.filter(i => !i.deletedAt));
  }

  getById(id: number): Observable<Inscription | undefined> {
    return of(this.inscriptions.find(i => i.id === id && !i.deletedAt));
  }

  create(inscription: Inscription): Observable<Inscription> {
    inscription.id = this.inscriptions.length ? Math.max(...this.inscriptions.map(i => i.id)) + 1 : 1;
    inscription.createdAt = new Date();
    inscription.updatedAt = new Date();
    inscription.deletedAt = null;
    this.inscriptions.push(inscription);
    this.paiementService.createPaiementsForInscription(inscription).subscribe();
    return of(inscription);
  }
  update(id: number, inscription: Inscription): Observable<Inscription> {
    const index = this.inscriptions.findIndex(i => i.id === id && !i.deletedAt);
    if (index >= 0) {
      this.inscriptions[index] = { ...this.inscriptions[index], ...inscription, updatedAt: new Date() };
      return of(this.inscriptions[index]);
    }
    return of(inscription);
  }

  delete(id: number): Observable<void> {
    const index = this.inscriptions.findIndex(i => i.id === id && !i.deletedAt);
    if (index >= 0) {
      this.inscriptions[index].deletedAt = new Date();
      this.inscriptions[index].updatedAt = new Date();
    }
    return of();
  }

  // 🔥 Ajout : récupérer les inscriptions par formation et semestre
  getByFormationAndSemestre(formationId: number, semestre: number): Observable<Inscription[]> {
    return of(
      this.inscriptions.filter(
        i => i.formation_id === formationId && i.semestre_courant === semestre && !i.deletedAt
      )
    );
  }
}
