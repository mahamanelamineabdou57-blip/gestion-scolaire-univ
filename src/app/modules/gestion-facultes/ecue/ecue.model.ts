export interface ECUE {
  id: number;
  nom: string;
  code?: string;
  credits: number;
  ue_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
  