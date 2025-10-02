export interface Inscription {
  id: number;
  etudiant_id: number;
  formation_id: number;
  anneeScolaire_id: number;
  semestre_courant: number;
  statut?: 'en_cours' | 'termine';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
 