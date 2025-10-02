export interface Departement {
  id: number;
  nom: string;
  code?: string;
  faculte_id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}