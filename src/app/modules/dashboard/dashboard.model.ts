export interface DashboardStats {
  totalEtudiants: number;
  nouveauxEtudiants: number;
  etudiantsDiplomes: number;
  etudiantsParFormation: { anneeScolaire: string; formation: string; count: number }[];
  progressionEtudiants: { anneeScolaire: string; statut: string; count: number }[];
  repartitionSexe?: { anneeScolaire: string; sexe: string; count: number }[];
  repartitionAge?: { anneeScolaire: string; tranche: string; count: number }[];
  totalInscriptions: number;
  totalFormations: number;
  formationsParFaculte: { anneeScolaire: string; faculte: string; count: number }[];
  semestresGeneres: { anneeScolaire: string; formation: string; semestres: number }[];
  tauxReussiteParSemestre: { anneeScolaire: string; semestre: number; reussite: number; echec: number }[];
  moyenneGenerale: number;
  moyenneParFormation: { anneeScolaire: string; formation: string; moyenne: number }[];
  tauxReussiteSession: { anneeScolaire: string; type: string; count: number }[];
  topEtudiants: { anneeScolaire: string; etudiant: string; moyenne: number }[];
  totalPaiements: number;
  totalPaiementsPayes: number;
  totalPaiementsNonPayes: number;
  paiementsParStatut: { anneeScolaire: string; statut: string; montant: number }[];
  paiementsRestant: number;
  evolutionInscriptions: { anneeScolaire: string; annee: string; count: number }[];
}

