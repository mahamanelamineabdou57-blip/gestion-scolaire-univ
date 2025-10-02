export interface AnneeScolaire {
  id: number;
  nom: string;
  actif: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}