export interface Note {
  id: number;
  inscriptionId: number;
  ecueId: number;
  noteSessionNormale?: number;
  noteRattrapage?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
 