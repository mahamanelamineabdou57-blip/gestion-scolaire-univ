// src/app/modules/gestion-paiement/paiement/paiement.model.ts
export interface Paiement {
  inscriptionInfo?: string;
  id: number;
  inscriptionId: number;
  type: 'inscription' | 'formation';
  montant: number;
  statut: 'payé' | 'non payé';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}