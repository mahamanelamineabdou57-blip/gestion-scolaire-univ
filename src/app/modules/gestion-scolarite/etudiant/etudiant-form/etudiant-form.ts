// etudiants/etudiant-form.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Etudiant } from '../etudiant.model';
import { EtudiantServiceMock } from '../etudiant.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { EtudiantService } from '../etudiant.service';

@Component({
  selector: 'app-etudiant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './etudiant-form.html',
  styleUrl: './etudiant-form.scss'
})
export class EtudiantForm implements OnInit {
  etudiant: Etudiant = {
    id: 0,
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    email: '',
    telephone: '',
    adresse: '',
    photo: '',
    contact_nom: '',
    contact_prenom: '',
    contact_email: '',
    contact_telephone: '',
    contact_lien: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };
  readOnly = false;
  isEditMode = false;
  photoPreview: string | ArrayBuffer | null = null;

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
    private service: EtudiantService
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.service.getById(+id).subscribe(e => {
        if (e) {
          this.etudiant = { ...e };
          this.photoPreview = e.photo || null;
        }
      });
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
        this.etudiant.photo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.service.update(this.etudiant.id, this.etudiant)
      : this.service.create(this.etudiant);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: this.isEditMode
            ? `Modification étudiant ${this.etudiant.nom}`
            : `Création étudiant ${this.etudiant.nom}`, showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        this.authService.logAction('INFO', this.isEditMode
          ? `Modification étudiant ${this.etudiant.nom}`
          : `Création étudiant ${this.etudiant.nom}`);
        this.router.navigate(['/scolarite/etudiant']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur lors de l'enregistrement étudiant: ${err.message || err}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors de l'enregistrement étudiant : ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/scolarite/etudiant']);
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
