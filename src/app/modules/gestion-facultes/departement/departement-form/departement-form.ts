import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Departement } from '../departement.model';
import { DepartementServiceMock } from '../departement.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { FaculteServiceMock } from '../../faculte/faculte.service.mock';
import { Faculte } from '../../faculte/faculte.model';
import { DepartementService } from '../departement.service';
import { FaculteService } from '../../faculte/faculte.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';

@Component({
  selector: 'app-departement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './departement-form.html',
  styleUrl: './departement-form.scss'
})
export class DepartementForm implements OnInit {
  departement: Departement = { id: 0, nom: '', code: '', faculte_id: 0, created_at: new Date(), updated_at: new Date(), deleted_at: null };
  facultes: Faculte[] = [];
  readOnly = false;
  isEditMode = false;

  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: DepartementService,
    private faculteService: FaculteService,
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
    this.faculteService.getAll().subscribe(f => this.facultes = f);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.service.getById(+id).subscribe(d => { if (d) this.departement = { ...d }; });
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.service.update(this.departement.id, this.departement)
      : this.service.create(this.departement);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: this.isEditMode
            ? `Modification departement ${this.departement.nom}`
            : `Création departement ${this.departement.nom}`, showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        this.authService.logAction('INFO', this.isEditMode
          ? `Modification departement ${this.departement.nom}`
          : `Création departement ${this.departement.nom}`);
        this.router.navigate(['/facultes/departement']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur lors de l'enregistrement departement: ${err.message || err}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors de l'enregistrement departement : ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/facultes/departement']);
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
