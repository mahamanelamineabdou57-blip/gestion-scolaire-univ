// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { InscriptionServiceMock } from '../../inscription/inscription.service.mock';
// import { NoteServiceMock } from '../../note/note.service.mock';
// import { Note } from '../../note/note.model';
// import { CommonModule } from '@angular/common';
// import { InscriptionService } from '../../inscription/inscription.service';
// import { NoteService } from '../../note/note.service';

// @Component({
//   selector: 'app-bulletin',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './bulletin.html',
//   styleUrls: ['./bulletin.scss']
// })
// export class Bulletin implements OnInit {
//   etudiantId!: number;
//   inscription: any;
//   notes: Note[] = [];
//   bulletin: any;
//   showMoy = true;

//   constructor(
//     private route: ActivatedRoute,
//     private inscriptionService: InscriptionService,
//     private noteService: NoteService
//   ) {}

//   ngOnInit() {
//     this.etudiantId = +this.route.snapshot.paramMap.get('id')!;
//     this.inscriptionService.getById(this.etudiantId).subscribe(insc => {
//       if (!insc) return;
//       this.inscription = insc;

//       this.noteService.getAll().subscribe(allNotes => {
//         this.notes = allNotes.filter(n => n.inscriptionId === this.inscription!.id);

//         const ueMap: any = {};
//         this.notes.forEach(n => {
//           const ueName = `UE ${n.ecueId}`;
//           if (!ueMap[ueName]) ueMap[ueName] = [];
//           const noteValue = n.noteSessionNormale ?? 0;
//           if (noteValue < 0) this.showMoy = false;
//           ueMap[ueName].push({
//             nom: `ECUE ${n.ecueId}`,
//             note: noteValue,
//             mention: this.getMention(noteValue),
//             decision: noteValue >= 10 ? 'Validé' : 'Non Validé'
//           });
//         });

//         const ues = (Object.entries(ueMap) as [string, any[]][]).map(([ueName, ecues]) => {
//           const ueDecision = ecues.every(e => e.decision === 'Validé') ? 'Validé' : 'Non Validé';
//           return { nom: ueName, ecues, decision: ueDecision };
//         });

//         const allNotesValues = this.notes.map(n => n.noteSessionNormale ?? 0);
//         const moyenne = this.calculateMoyenne(allNotesValues);

//         const decision = ues.every(ue => ue.decision === 'Validé') ? 'Validé' : 'Non Validé';

//         this.bulletin = {
//           etudiant: { nom: `Étudiant #${this.etudiantId}`, prenom: '' },
//           formation: { nom: `Formation ${this.inscription!.formationId}` },
//           annee: { nom: `Année ${this.inscription!.anneeScolaireId}` },
//           semestre: this.inscription!.semestreCourant,
//           ues,
//           moyenneGenerale: moyenne,
//           mention: this.getMention(moyenne),
//           decision
//         };
//       });
//     });
//   }

//   calculateMoyenne(notes: number[]): number {
//     if (!notes.length) return 0;
//     return +(notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2);
//   }

//   getMention(note: number): string {
//     if (note >= 16) return 'Très Bien';
//     if (note >= 14) return 'Bien';
//     if (note >= 12) return 'Assez Bien';
//     if (note >= 10) return 'Passable';
//     return 'Insuffisant';
//   }
// }
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InscriptionService } from '../../inscription/inscription.service';
import { NoteService } from '../../note/note.service';
import { Note } from '../../note/note.model';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bulletin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulletin.html',
  styleUrls: ['./bulletin.scss']
})
export class Bulletin implements OnInit {
  etudiantId!: number;
  inscription: any;
  notes: Note[] = [];
  bulletin: any;
  showMoy = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inscriptionService: InscriptionService,
    private noteService: NoteService
  ) {}

  ngOnInit() {
    this.etudiantId = +this.route.snapshot.paramMap.get('id')!;
    console.log('Étudiant ID:', this.etudiantId);
    if (!this.etudiantId) {
      Swal.fire('Erreur', 'ID étudiant manquant.', 'warning');
      this.router.navigate(['/liste-etudiants']);
      return;
    }

    this.inscriptionService.getByEtudiantId(this.etudiantId).subscribe({
      next: (insc) => {
        if (!insc) {
          Swal.fire('Erreur', 'Aucune inscription trouvée pour cet étudiant.', 'warning');
          this.router.navigate(['/liste-etudiants']);
          return;
        }
        this.inscription = insc;

        this.noteService.getAll().subscribe({
          next: (allNotes) => {
            this.notes = allNotes.filter(n => n.inscriptionId === this.inscription!.id);

            const ueMap: { [key: string]: any[] } = {};
            this.notes.forEach(n => {
              const ueName = `UE ${n.ecueId}`;
              if (!ueMap[ueName]) ueMap[ueName] = [];
              let noteValue = n.noteSessionNormale ?? 0;
              if (typeof noteValue === 'string') {
                noteValue = parseFloat((noteValue as string).trim()) || 0;
              }
              if (noteValue < 0) this.showMoy = false;
              ueMap[ueName].push({
                nom: `ECUE ${n.ecueId}`,
                note: noteValue,
                mention: this.getMention(noteValue),
                decision: noteValue >= 10 ? 'Validé' : 'Non Validé'
              });
            });

            const ues = (Object.entries(ueMap) as [string, any[]][]).map(([ueName, ecues]) => {
              const ueDecision = ecues.every(e => e.decision === 'Validé') ? 'Validé' : 'Non Validé';
              return { nom: ueName, ecues, decision: ueDecision };
            });

            const allNotesValues = this.notes.map(n => {
              let val = n.noteSessionNormale ?? 0;
              if (typeof val === 'string') {
                val = parseFloat((val as string).trim()) || 0;
              }
              return val;
            });
            const moyenne = this.calculateMoyenne(allNotesValues);

            const decision = ues.every(ue => ue.decision === 'Validé') ? 'Validé' : 'Non Validé';

            this.bulletin = {
              etudiant: this.inscription.etudiant || { nom: `Étudiant #${this.etudiantId}`, prenom: '' },
              formation: this.inscription.formation || { nom: `Formation ${this.inscription.formationId}` },
              annee: this.inscription.anneeScolaire || { nom: `Année ${this.inscription.anneeScolaireId}` },
              semestre: this.inscription.semestreCourant,
              ues,
              moyenneGenerale: moyenne,
              mention: this.getMention(moyenne),
              decision
            };
          },
          error: (err) => {
            console.error('Erreur notes:', err);
            Swal.fire('Erreur', 'Impossible de charger les notes.', 'error');
          }
        });
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
        if (err.status === 404) {
          Swal.fire('Non trouvé', 'Inscription non trouvée pour cet étudiant.', 'warning');
        } else {
          Swal.fire('Erreur', 'Problème de chargement du bulletin.', 'error');
        }
        this.router.navigate(['/liste-etudiants']);
      }
    });
  }

  calculateMoyenne(notes: number[]): number {
    if (!notes.length) return 0;
    const sum = notes.reduce((a, b) => a + b, 0);
    return + (sum / notes.length).toFixed(2);
  }

  getMention(note: number): string {
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }
}