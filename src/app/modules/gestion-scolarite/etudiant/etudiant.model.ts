 export interface Etudiant {
  id: number;                     // id auto-incrément Laravel
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;          // ISO format YYYY-MM-DD
  lieuNaissance?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  photo?: string;
  contact_nom?: string;
  contact_prenom?: string;
  contact_telephone?: string;
  contact_email?: string;
  contact_lien?: string;

 createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;     // correspond à Laravel deleted_at (soft delete)
}
