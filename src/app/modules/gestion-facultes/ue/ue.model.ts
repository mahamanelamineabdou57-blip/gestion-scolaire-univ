export interface UE {
  id: number;
  nom: string;
  code: string;
  credits?: number;
  formation_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
   