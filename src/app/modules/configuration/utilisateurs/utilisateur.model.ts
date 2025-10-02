import { Role } from '../roles/role.model';

export interface Utilisateur {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string; 
  telephone?: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
