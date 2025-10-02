import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardStats } from './dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return forkJoin({
      etudiants: this.http.get<any[]>(`${environment.apiUrl}/etudiants`),
      inscriptions: this.http.get<any[]>(`${environment.apiUrl}/inscriptions`),
      formations: this.http.get<any[]>(`${environment.apiUrl}/formations`),
      paiements: this.http.get<any[]>(`${environment.apiUrl}/paiements`),
      notes: this.http.get<any[]>(`${environment.apiUrl}/notes`)
    }).pipe(
      map(({ etudiants, inscriptions, formations, paiements, notes }) => {
        const anneesScolaires = Array.from(new Set(inscriptions.map(i => new Date(i.createdAt).getFullYear().toString())));
        const filterByAnnee = (array: any[], key: string = 'createdAt', annee: string) =>
          array.filter(item => new Date(item[key]).getFullYear().toString() === annee);
        const statsParAnnee = anneesScolaires.map(annee => {
          const etudiantsAnnee = filterByAnnee(etudiants, 'createdAt', annee);
          const inscriptionsAnnee = filterByAnnee(inscriptions, 'createdAt', annee);
          const notesAnnee = notes.filter(n => inscriptionsAnnee.some(i => i.id === n.inscriptionId));
          const paiementsAnnee = paiements.filter(p => inscriptionsAnnee.some(i => i.id === p.inscriptionId));

          const nouveauxEtudiants = etudiantsAnnee.length;
          const etudiantsDiplomes = inscriptionsAnnee.filter(i => i.statut === 'termine').length;

          const etudiantsParFormation = formations.flatMap(f => {
            const count = inscriptionsAnnee.filter(i => i.formationId === f.id).length;
            return count ? [{ anneeScolaire: annee, formation: f.nom, count }] : [];
          });

          const progressionEtudiants = ['en_cours', 'termine', 'retard'].map(statut => ({
            anneeScolaire: annee,
            statut,
            count: inscriptionsAnnee.filter(i => i.statut === statut).length
          }));

          const repartitionSexe = etudiantsAnnee.reduce((acc: any[], e) => {
            const entry = acc.find(x => x.sexe === e.sexe);
            if (entry) entry.count++;
            else acc.push({ anneeScolaire: annee, sexe: e.sexe, count: 1 });
            return acc;
          }, []);

          const formationsParFaculte = formations.reduce((acc: any[], f) => {
            const count = inscriptionsAnnee.filter(i => i.formationId === f.id).length;
            if (count) {
              const entry = acc.find(x => x.faculte === f.faculteNom);
              if (entry) entry.count += count;
              else acc.push({ anneeScolaire: annee, faculte: f.faculteNom, count });
            }
            return acc;
          }, []);

          const semestresGeneres = formations.map(f => ({
            anneeScolaire: annee,
            formation: f.nom,
            semestres: f.duree * 2
          }));

          const moyenneGenerale = notesAnnee.length
            ? notesAnnee.reduce((s, n) => s + (n.noteSessionNormale || 0), 0) / notesAnnee.length
            : 0;

          const moyenneParFormation = formations.map(f => {
            const notesFormation = inscriptionsAnnee
              .filter(i => i.formationId === f.id)
              .flatMap(i => notesAnnee.filter(n => n.inscriptionId === i.id));
            const moyenne = notesFormation.length
              ? notesFormation.reduce((s, n) => s + (n.noteSessionNormale || 0), 0) / notesFormation.length
              : 0;
            return { anneeScolaire: annee, formation: f.nom, moyenne };
          });

          const tauxReussiteSession = [
            { anneeScolaire: annee, type: 'normale', count: notesAnnee.filter(n => n.noteSessionNormale >= 10).length },
            { anneeScolaire: annee, type: 'rattrapage', count: notesAnnee.filter(n => n.noteRattrapage >= 10).length }
          ];

          const topEtudiants = etudiantsAnnee
            .map(e => {
              const notesEtu = inscriptionsAnnee
                .filter(i => i.etudiantId === e.id)
                .flatMap(i => notesAnnee.filter(n => n.inscriptionId === i.id));
              const moyenne = notesEtu.length
                ? notesEtu.reduce((s, n) => s + (n.noteSessionNormale || 0), 0) / notesEtu.length
                : 0;
              return { anneeScolaire: annee, etudiant: `${e.prenom} ${e.nom}`, moyenne };
            })
            .sort((a, b) => b.moyenne - a.moyenne)
            .slice(0, 10);

          const totalPaiements = paiementsAnnee.reduce((s, p) => s + p.montant, 0);
          const totalPaiementsPayes = paiementsAnnee.filter(p => p.statut === 'payé').reduce((s, p) => s + p.montant, 0);
          const totalPaiementsNonPayes = paiementsAnnee.filter(p => p.statut === 'non payé').reduce((s, p) => s + p.montant, 0);

          const paiementsParStatut = ['payé', 'partiellement payé', 'non payé'].map(statut => ({
            anneeScolaire: annee,
            statut,
            montant: paiementsAnnee.filter(p => p.statut === statut).reduce((s, p) => s + p.montant, 0)
          }));

          const tauxReussiteParSemestre = [1,2,3,4,5,6].map(semestre => {
            const notesSemestre = notesAnnee.filter(n => n.semestre === semestre);
            const reussite = notesSemestre.filter(n => (n.noteSessionNormale || 0) >= 10).length;
            const echec = notesSemestre.length - reussite;
            return { anneeScolaire: annee, semestre, reussite, echec };
          });

          const evolutionInscriptions = [
            { anneeScolaire: annee, annee, count: inscriptionsAnnee.length }
          ];

          return {
            anneeScolaire: annee,
            totalEtudiants: etudiantsAnnee.length,
            nouveauxEtudiants,
            etudiantsDiplomes,
            etudiantsParFormation,
            progressionEtudiants,
            repartitionSexe,
            repartitionAge: [],
            totalInscriptions: inscriptionsAnnee.length,
            totalFormations: formations.length,
            formationsParFaculte,
            semestresGeneres,
            tauxReussiteParSemestre,
            moyenneGenerale,
            moyenneParFormation,
            tauxReussiteSession,
            topEtudiants,
            totalPaiements,
            totalPaiementsPayes,
            totalPaiementsNonPayes,
            paiementsParStatut,
            paiementsRestant: totalPaiements - totalPaiementsPayes,
            evolutionInscriptions
          };
        });

        return statsParAnnee[statsParAnnee.length -1];
      })
    );
  }
}
