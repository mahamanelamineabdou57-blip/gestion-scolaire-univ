import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Utilisateur } from '../utilisateur.model';
import { Role } from '../../roles/role.model';
import { UtilisateurServiceMock } from '../utilisateur.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import Swal from 'sweetalert2';
import { UtilisateurService } from '../utilisateur.service';
import { SecuriteAccessService } from '../../securite-acces/securite-access.service';
import { Interface } from '../../securite-acces/interface.model';
import { Acces } from '../../securite-acces/acces.model';

@Component({
  selector: 'app-utilisateurs-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './utilisateurs-form.html',
  styleUrls: ['./utilisateurs-form.scss']
})
export class UtilisateursForm implements OnInit {
  utilisateur: Utilisateur = {
    id: 0,
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role_id:2,
    role: { id: 2, nom: 'Utilisateur', description: '' }
  };
  roles: Role[] = [];
  readOnly = false;
  isEditMode = false;

  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private userService: UtilisateurService
  ) { }

  ngOnInit(): void {
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
    this.userService.getRoles().subscribe(r => this.roles = r);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.userService.getById(Number.parseInt(id)).subscribe(u => {
        if (u) this.utilisateur = { ...u };
      });
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.userService.update(this.utilisateur.id, this.utilisateur)
      : this.userService.create(this.utilisateur);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: this.isEditMode
            ? `Modification utilisateur ${this.utilisateur.nom} - ${this.utilisateur.prenom} `
            : `Création utilisateur ${this.utilisateur.nom} - ${this.utilisateur.prenom}`, showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        this.authService.logAction('INFO', this.isEditMode
          ? `Modification utilisateur ${this.utilisateur.nom} - ${this.utilisateur.prenom}`
          : `Création utilisateur ${this.utilisateur.nom} - ${this.utilisateur.prenom}`);
        this.router.navigate(['/configuration/roles']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur lors de l'enregistrement utilisateur: ${err.message || err}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors de l'enregistrement utilisateur : ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/configuration/utilisateurs']);
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
