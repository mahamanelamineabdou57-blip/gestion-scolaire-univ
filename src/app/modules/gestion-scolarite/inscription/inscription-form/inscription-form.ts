import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Inscription } from '../inscription.model';
import { InscriptionServiceMock } from '../inscription.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { EtudiantServiceMock } from '../../etudiant/etudiant.service.mock';
import { FormationServiceMock } from '../../../gestion-facultes/formation/formation.service.mock';
import { AnneeScolaireServiceMock } from '../../../configuration/annee-scolaire/annee-scolaire.service.mock';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { InscriptionService } from '../inscription.service';
import { EtudiantService } from '../../etudiant/etudiant.service';
import { FormationService } from '../../../gestion-facultes/formation/formation.service';
import { AnneeScolaireService } from '../../../configuration/annee-scolaire/annee-scolaire.service';

@Component({
  selector: 'app-inscription-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inscription-form.html',
  styleUrl: './inscription-form.scss'
})
export class InscriptionForm implements OnInit {
  inscription: Inscription = { id: 0, etudiant_id: 0, formation_id: 0, anneeScolaire_id: 0, semestre_courant: 1 };
  readOnly = false;
  isEditMode = false;

  etudiants: any[] = [];
  facultes: any[] = [];
  departements: any[] = [];
  formations: any[] = [];
  anneesScolaires: any[] = [];
  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private inscriptionService: InscriptionService,
    private etudiantService: EtudiantService,
    private formationService: FormationService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private anneeService: AnneeScolaireService
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
      this.inscriptionService.getById(+id).subscribe(i => {
        if (i) this.inscription = { ...i };
      });
    }

    this.etudiantService.getAll().subscribe(data => this.etudiants = data);
    this.formationService.getAll().subscribe(data => this.formations = data);
    this.anneeService.getAll().subscribe(data => {
      this.anneesScolaires = data;
      if (!this.isEditMode) {
        const anneeActive = this.anneesScolaires.find(a => a.actif);
        if (anneeActive) {
          this.inscription.anneeScolaire_id = anneeActive.id;
        }
      }
    });
  }

  onSubmit() {
    if (!this.inscription.semestre_courant) {
      this.inscription.semestre_courant = 1;
    }

    const request = this.isEditMode
      ? this.inscriptionService.update(this.inscription.id, this.inscription)
      : this.inscriptionService.create(this.inscription);

    request.subscribe({
      next: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: this.isEditMode ? 'Modification inscription' : 'Inscription enregistrée', showConfirmButton: false, timer: 3000 });
        this.authService.logAction('INFO', this.isEditMode ? 'Modification inscription' : 'Inscription enregistrée');
        this.router.navigate(['/scolarite/inscription']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur : ${err.message || err}`, showConfirmButton: false, timer: 3000 });
        this.authService.logAction('ERROR', `Erreur inscription: ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/scolarite/inscription']);
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
