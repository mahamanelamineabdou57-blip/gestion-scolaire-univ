import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../../login/auth/auth.service';
import { InscriptionServiceMock } from '../../inscription/inscription.service.mock';
import { EtudiantServiceMock } from '../../etudiant/etudiant.service.mock';
import { ECUEServiceMock } from '../../../gestion-facultes/ecue/ecue.service.mock';
import { Note } from '../../note/note.model';
import { NoteServiceMock } from '../../note/note.service.mock';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { NoteService } from '../note.service';
import { InscriptionService } from '../../inscription/inscription.service';
import { EtudiantService } from '../../etudiant/etudiant.service';
import { ECUEService } from '../../../gestion-facultes/ecue/ecue.service';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './note-form.html',
  styleUrl: './note-form.scss'
})
export class NoteForm implements OnInit {
  note: Note = { id: 0, inscriptionId: 0, ecueId: 0 };
  readOnly = false;
  isEditMode = false;

  inscriptions: any[] = [];
  etudiants: any[] = [];
  ecues: any[] = [];
  tempEcues: any[] = [];
  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService,
    private inscriptionService: InscriptionService,
    private etudiantService: EtudiantService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private ecueService: ECUEService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    try {
      this.utilisateurService.getById(this.authService.user().id).subscribe({
        next: (utilisateur) => {
          this.user = utilisateur;
          this.securiteAccessService.getInterfaces().subscribe(data => {
            this.interfaces = data;
            this.cdRef.detectChanges();
          });
          this.securiteAccessService.getAccesByUtilisateur(this.user.id).subscribe(perms => {
            this.access = perms;
            this.cdRef.detectChanges();
          });
        },
        error: (err) => {
          Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
          this.authService.logAction('ERROR', `Erreur lors du chargement des informations: ${err.message || err}`);
          this.user = null;
        }
      });
    } catch (err) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations: ' + (err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
      this.authService.logAction('ERROR', `Erreur lors du chargement des informations: ${err}`);
      this.user = null;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.noteService.getById(+id).subscribe(n => {
        if (n) {
          this.note = { ...n };
          this.onInscriptionChange();
        }
      });
    }
    this.etudiantService.getAll().subscribe(etuds => {
      this.ecueService.getAll().subscribe(ecues => {
        this.inscriptionService.getAll().subscribe(inscs => {
          this.inscriptions = inscs
            .filter(i => i.statut === 'en_cours')
            .map(insc => {
              const etudiant = etuds.find(e => e.id === insc.etudiant_id);
              const formation = ecues.find(f => f.id === insc.formation_id); // ⚠️ à remplacer si tu as FormationServiceMock
              return {
                ...insc,
                etudiantNom: etudiant ? `${etudiant.nom} ${etudiant.prenom}` : '—',
                formationNom: formation ? formation.nom : '—',
                anneeNom: `Année ${insc.anneeScolaire_id}` // idem : remplacer avec ton service Année
              };
            });
        });
      });
    });
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.noteService.update(this.note.id, this.note)
      : this.noteService.create(this.note);

    request.subscribe({
      next: () => {
        Swal.fire({ toast: true, icon: 'success', title: this.isEditMode ? 'Note modifiée' : 'Note enregistrée', timer: 3000 });
        this.authService.logAction('INFO', this.isEditMode ? 'Note modifiée' : 'Note enregistrée');
        this.router.navigate(['/scolarite/note']);
      }
    });
  }

  onInscriptionChange() {
    if (!this.note.inscriptionId) {
      this.tempEcues = [];
      return;
    }
    const inscription = this.inscriptions.find(i => i.id === this.note.inscriptionId);
    if (inscription) {
      this.tempEcues = this.ecues.filter(e => e.formationId === inscription.formationId);
    }
  }

  cancel() {
    this.router.navigate(['/scolarite/note']);
  }

  toggleReadOnly(): void {
    this.readOnly = !this.readOnly;
  }

  getLink(): string {
    if (!this.isEditMode) return 'Enregistrement';
    return this.readOnly ? 'Visualisation' : 'Modification';
  }

  getBadgeClasse(): string {
    return this.readOnly ? 'bg-secondary' : 'bg-success';
  }

  getBadgeTexte(): string {
    return this.readOnly ? 'Visualisation' : 'Modification active';
  }
  normalizeString(value: string): string {
    return value
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  hasInterface(nom: string, permission: string): boolean {
    if (!this.access) return false;

    const nomNormalise = this.normalizeString(nom);
    return this.access.some(
      (i: { droits: string; }) =>
        this.normalizeString(i.droits).includes(permission || "")
    );
  }
}
