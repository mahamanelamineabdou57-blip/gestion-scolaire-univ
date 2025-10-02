import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Paiement } from './paiement.model';
import { Inscription } from '../../gestion-scolarite/inscription/inscription.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementServiceMock {
  private paiements: Paiement[] = [];

  getAll(): Observable<Paiement[]> { 
    return of(this.paiements.filter(p => !p.deletedAt));
  }

  getById(id: number): Observable<Paiement | undefined> {
    return of(this.paiements.find(p => p.id === id && !p.deletedAt));
  }

  create(paiement: Paiement): Observable<Paiement> {
    paiement.id = this.paiements.length > 0 ? Math.max(...this.paiements.map(p => p.id)) + 1 : 1;
    const now = new Date();
    paiement.createdAt = now;
    paiement.updatedAt = now;
    paiement.deletedAt = null;
    paiement.statut = 'non payé';
    this.paiements.push(paiement);
    return of(paiement);
  }

  update(id: number, paiement: Paiement): Observable<Paiement> {
    const index = this.paiements.findIndex(p => p.id === id && !p.deletedAt);
    if (index >= 0) {
      this.paiements[index] = { ...this.paiements[index], ...paiement, updatedAt: new Date() };
      return of(this.paiements[index]);
    }
    return of(paiement);
  }

  delete(id: number): Observable<void> {
    const index = this.paiements.findIndex(p => p.id === id && !p.deletedAt);
    if (index >= 0) {
      this.paiements[index].deletedAt = new Date();
      this.paiements[index].updatedAt = new Date();
    }
    return of();
  }

  createPaiementsForInscription(inscription: Inscription): Observable<Paiement[]> {
    const nouveauxPaiements: Paiement[] = [
      {
        id: 0,
        inscriptionId: inscription.id,
        type: 'inscription',
        montant: 500, // tu peux adapter selon règles
        statut: 'non payé',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        inscriptionInfo: ''
      },
      {
        id: 0,
        inscriptionId: inscription.id,
        type: 'formation',
        montant: 1000, // idem
        statut: 'non payé',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        inscriptionInfo: ''
      }
    ];

    // On les ajoute à la liste
    nouveauxPaiements.forEach(p => {
      p.id = this.paiements.length ? Math.max(...this.paiements.map(x => x.id)) + 1 : 1;
      this.paiements.push(p);
    });

    return of(nouveauxPaiements);
  }
}
