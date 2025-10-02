export interface Formation {
  id: number;
  nom: string;
  code?: string;
  conditions?: string;
  duree: number;
  departement_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
