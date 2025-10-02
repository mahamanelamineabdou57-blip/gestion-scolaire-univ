import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { UE } from '../ue.model';
import { FormationServiceMock } from '../../formation/formation.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { UEServiceMock } from '../ue.service.mock';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { FormationService } from '../../formation/formation.service';
import { UEService } from '../ue.service';

@Component({
  selector: 'app-ue-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrl: './ue-form.scss',
  templateUrl: './ue-form.html'
})
export class UEForm implements OnInit {
  ue: UE = { id: 0, nom: '', code: '', formation_id: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
  readOnly = false;
  isEditMode = false;
  formations: any[] = [];
  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UEService,
    private formationService: FormationService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    try {
      this.utilisateurService.getById(this.authService.user()).subscribe({
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
    this.formationService.getAll().subscribe(data => this.formations = data);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.service.getById(+id).subscribe(u => { if (u) this.ue = { ...u }; });
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.service.update(this.ue.id, this.ue)
      : this.service.create(this.ue);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: this.isEditMode
            ? `Modification UE ${this.ue.nom}`
            : `Création UE ${this.ue.nom}`, showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        this.authService.logAction('INFO', this.isEditMode
          ? `Modification UE ${this.ue.nom}`
          : `Création UE ${this.ue.nom}`);
        this.router.navigate(['/facultes/ue']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur lors de l'enregistrement ue: ${err.message || err}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors de l'enregistrement ue : ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/facultes/ue']);
  }

  toggleReadOnly(): void {
    this.readOnly = !this.readOnly;
  }

  getBadgeClasse(): string {
    return this.readOnly ? 'bg-secondary' : 'bg-success';
  }

  getBadgeTexte(): string {
    return this.readOnly ? 'Visualisation' : 'Modification active';
  }

  getLink(): string {
    if (!this.isEditMode) return 'Enregistrement';
    return this.readOnly ? 'Visualisation' : 'Modification';
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
