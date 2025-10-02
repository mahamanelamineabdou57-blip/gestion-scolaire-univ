import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardStats } from './dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardServiceMock {
  getStats(): Observable<DashboardStats[]> {
    const stats: DashboardStats[] = [
      {
        totalEtudiants: 220,
        nouveauxEtudiants: 50,
        etudiantsDiplomes: 40,
        etudiantsParFormation: [
          { anneeScolaire: '2023', formation: 'Informatique', count: 45 },
          { anneeScolaire: '2023', formation: 'Droit', count: 35 },
          { anneeScolaire: '2023', formation: 'Médecine', count: 25 },
          { anneeScolaire: '2023', formation: 'Lettres', count: 20 }
        ],
        progressionEtudiants: [
          { anneeScolaire: '2023', statut: 'en_cours', count: 60 },
          { anneeScolaire: '2023', statut: 'termine', count: 30 },
          { anneeScolaire: '2023', statut: 'retard', count: 10 }
        ],
        repartitionSexe: [
          { anneeScolaire: '2023', sexe: 'H', count: 120 },
          { anneeScolaire: '2023', sexe: 'F', count: 100 }
        ],
        repartitionAge: [
          { anneeScolaire: '2023', tranche: '18-20', count: 70 },
          { anneeScolaire: '2023', tranche: '21-25', count: 100 },
          { anneeScolaire: '2023', tranche: '26+', count: 50 }
        ],
        totalInscriptions: 300,
        totalFormations: 10,
        formationsParFaculte: [
          { anneeScolaire: '2023', faculte: 'Sciences', count: 5 },
          { anneeScolaire: '2023', faculte: 'Lettres', count: 3 },
          { anneeScolaire: '2023', faculte: 'Médecine', count: 2 }
        ],
        semestresGeneres: [
          { anneeScolaire: '2023', formation: 'Informatique', semestres: 6 },
          { anneeScolaire: '2023', formation: 'Droit', semestres: 4 },
          { anneeScolaire: '2023', formation: 'Médecine', semestres: 6 }
        ],
        tauxReussiteParSemestre: [
          { anneeScolaire: '2023', semestre: 1, reussite: 35, echec: 10 },
          { anneeScolaire: '2023', semestre: 2, reussite: 30, echec: 15 },
          { anneeScolaire: '2023', semestre: 3, reussite: 25, echec: 10 }
        ],
        moyenneGenerale: 12.5,
        moyenneParFormation: [
          { anneeScolaire: '2023', formation: 'Informatique', moyenne: 12.8 },
          { anneeScolaire: '2023', formation: 'Droit', moyenne: 11.5 },
          { anneeScolaire: '2023', formation: 'Médecine', moyenne: 13.0 }
        ],
        tauxReussiteSession: [
          { anneeScolaire: '2023', type: 'normale', count: 70 },
          { anneeScolaire: '2023', type: 'rattrapage', count: 25 }
        ],
        topEtudiants: [
          { anneeScolaire: '2023', etudiant: 'Alice Martin', moyenne: 15.5 },
          { anneeScolaire: '2023', etudiant: 'Bob Leroy', moyenne: 14.8 },
          { anneeScolaire: '2023', etudiant: 'Claire Dubois', moyenne: 14.5 }
        ],
        totalPaiements: 400000,
        totalPaiementsPayes: 300000,
        totalPaiementsNonPayes: 100000,
        paiementsParStatut: [
          { anneeScolaire: '2023', statut: 'payé', montant: 140000 },
          { anneeScolaire: '2023', statut: 'partiellement payé', montant: 60000 },
          { anneeScolaire: '2023', statut: 'non payé', montant: 20000 }
        ],
        paiementsRestant: 100000,
        evolutionInscriptions: [
          { anneeScolaire: '2023', annee: '2023', count: 60 }
        ]
      },
      {
        totalEtudiants: 240,
        nouveauxEtudiants: 60,
        etudiantsDiplomes: 50,
        etudiantsParFormation: [
          { anneeScolaire: '2024', formation: 'Informatique', count: 50 },
          { anneeScolaire: '2024', formation: 'Droit', count: 40 },
          { anneeScolaire: '2024', formation: 'Médecine', count: 30 },
          { anneeScolaire: '2024', formation: 'Lettres', count: 20 }
        ],
        progressionEtudiants: [
          { anneeScolaire: '2024', statut: 'en_cours', count: 80 },
          { anneeScolaire: '2024', statut: 'termine', count: 30 },
          { anneeScolaire: '2024', statut: 'retard', count: 10 }
        ],
        repartitionSexe: [
          { anneeScolaire: '2024', sexe: 'H', count: 130 },
          { anneeScolaire: '2024', sexe: 'F', count: 110 }
        ],
        repartitionAge: [
          { anneeScolaire: '2024', tranche: '18-20', count: 80 },
          { anneeScolaire: '2024', tranche: '21-25', count: 100 },
          { anneeScolaire: '2024', tranche: '26+', count: 60 }
        ],
        totalInscriptions: 320,
        totalFormations: 11,
        formationsParFaculte: [
          { anneeScolaire: '2024', faculte: 'Sciences', count: 6 },
          { anneeScolaire: '2024', faculte: 'Lettres', count: 3 },
          { anneeScolaire: '2024', faculte: 'Médecine', count: 2 }
        ],
        semestresGeneres: [
          { anneeScolaire: '2024', formation: 'Informatique', semestres: 6 },
          { anneeScolaire: '2024', formation: 'Droit', semestres: 4 },
          { anneeScolaire: '2024', formation: 'Médecine', semestres: 6 }
        ],
        tauxReussiteParSemestre: [
          { anneeScolaire: '2024', semestre: 1, reussite: 40, echec: 10 },
          { anneeScolaire: '2024', semestre: 2, reussite: 35, echec: 15 },
          { anneeScolaire: '2024', semestre: 3, reussite: 30, echec: 10 }
        ],
        moyenneGenerale: 13,
        moyenneParFormation: [
          { anneeScolaire: '2024', formation: 'Informatique', moyenne: 13.2 },
          { anneeScolaire: '2024', formation: 'Droit', moyenne: 12.0 },
          { anneeScolaire: '2024', formation: 'Médecine', moyenne: 14.0 }
        ],
        tauxReussiteSession: [
          { anneeScolaire: '2024', type: 'normale', count: 80 },
          { anneeScolaire: '2024', type: 'rattrapage', count: 20 }
        ],
        topEtudiants: [
          { anneeScolaire: '2024', etudiant: 'Jean Dupont', moyenne: 16 },
          { anneeScolaire: '2024', etudiant: 'Marie Curie', moyenne: 15.5 },
          { anneeScolaire: '2024', etudiant: 'Luc Petit', moyenne: 15.2 }
        ],
        totalPaiements: 450000,
        totalPaiementsPayes: 350000,
        totalPaiementsNonPayes: 100000,
        paiementsParStatut: [
          { anneeScolaire: '2024', statut: 'payé', montant: 150000 },
          { anneeScolaire: '2024', statut: 'partiellement payé', montant: 50000 },
          { anneeScolaire: '2024', statut: 'non payé', montant: 50000 }
        ],
        paiementsRestant: 100000,
        evolutionInscriptions: [
          { anneeScolaire: '2024', annee: '2024', count: 90 }
        ]
      }
    ];

    return of(stats);
  }
}
