import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Role } from '../role.model';
import { RoleServiceMock } from '../role.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import Swal from 'sweetalert2';
import { RoleServiceApi } from '../role.service.api';
import { SecuriteAccessService } from '../../securite-acces/securite-access.service';
import { UtilisateurService } from '../../utilisateurs/utilisateur.service';
import { Acces } from '../../securite-acces/acces.model';
import { Interface } from '../../securite-acces/interface.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roles-form.html',
  styleUrls: ['./roles-form.scss']
})
export class RolesForm implements OnInit {
  role: Role = { id: 0, nom: '', description: '' };
  readOnly = false;
  isEditMode = false;
      access: Acces[] = [];
    user: any = null;
      interfaces: Interface[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleServiceApi,
        private utilisateurService: UtilisateurService,
        private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

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
                  Swal.fire({toast: true,position: 'top-end',icon: 'error',title: 'Erreur lors du chargement des informations: ' + (err.message || err), showConfirmButton: false,timer: 3000,timerProgressBar: true});
                  this.authService.logAction('ERROR',`Erreur lors du chargement des informations: ${err.message || err}`);
                  this.user = null;
                }
              });
            } catch (err) {
              Swal.fire({toast: true,position: 'top-end',icon: 'error',title: 'Erreur lors du chargement des informations: ' + (err), showConfirmButton: false,timer: 3000,timerProgressBar: true});
              this.authService.logAction('ERROR',`Erreur lors du chargement des informations: ${err}`);
              this.user = null;
            }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.roleService.getById(+id).subscribe(r => {
        if (r) this.role = { ...r };
      });
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.roleService.update(this.role)
      : this.roleService.create(this.role);

    request.subscribe({
      next: () => {
          Swal.fire({toast: true,position: 'top-end',icon: 'success',title:  this.isEditMode
          ? `Modification rôle ${this.role.nom}`
          : `Création rôle ${this.role.nom}`,showConfirmButton: false,  timer: 3000,timerProgressBar: true});
          this.authService.logAction('INFO', this.isEditMode
          ? `Modification rôle ${this.role.nom}`
          : `Création rôle ${this.role.nom}`);
        this.router.navigate(['/configuration/roles']);
      },
      error: err => {
                  Swal.fire({toast: true,position: 'top-end',icon: 'error',title:  `Erreur lors de l'enregistrement rôle: ${err.message || err}`,showConfirmButton: false,  timer: 3000,timerProgressBar: true});
                  this.authService.logAction('ERROR', `Erreur lors de l'enregistrement rôle : ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/configuration/roles']);
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

  toggleReadOnly(): void {
    this.readOnly = !this.readOnly;
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
