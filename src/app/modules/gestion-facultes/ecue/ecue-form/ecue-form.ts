import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ECUE } from '../ecue.model';
import { ECUEServiceMock } from '../ecue.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { ECUEService } from '../ecue.service';
import { UE } from '../../ue/ue.model';
import { UEService } from '../../ue/ue.service';

@Component({
  selector: 'app-ecue-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ecue-form.html',
  styleUrl: './ecue-form.scss'
})
export class ECUEForm implements OnInit {
  ecue: ECUE = { id: 0, nom: '', code: '', credits: 0, ue_id: 0 };
  isEditMode = false;
  readOnly = false;
  ues: UE[] = [];

  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ECUEService,
    private ueService: UEService,
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
    this.ueService.getAll().subscribe(data => this.ues = data);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.service.getById(+id).subscribe(e => { if (e) this.ecue = { ...e }; });
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.service.update(this.ecue.id, this.ecue)
      : this.service.create(this.ecue);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: this.isEditMode
            ? `Modification ECUE ${this.ecue.nom}`
            : `Création ECUE ${this.ecue.nom}`, showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        this.authService.logAction('INFO', this.isEditMode
          ? `Modification ECUE ${this.ecue.nom}`
          : `Création ECUE ${this.ecue.nom}`);
        this.router.navigate(['/facultes/ecue']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur lors de l'enregistrement ECUE: ${err.message || err}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors de l'enregistrement ECUE : ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/facultes/ecue']);
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
