import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AnneeScolaire } from '../annee-scolaire.model';
import { AnneeScolaireServiceMock } from '../annee-scolaire.service.mock';
import Swal from 'sweetalert2';
import { AuthService } from '../../../login/auth/auth.service';
import { AnneeScolaireService } from '../annee-scolaire.service';
import { UtilisateurService } from '../../utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../securite-acces/securite-access.service';
import { Acces } from '../../securite-acces/acces.model';
import { Interface } from '../../securite-acces/interface.model';

@Component({
  selector: 'app-annee-scolaire-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './annee-scolaire-form.html',
  styleUrls: ['./annee-scolaire-form.scss']
})
export class AnneeScolaireForm implements OnInit {
  annee: AnneeScolaire = { id: 0, nom: '', actif: false, description: '' };
  readOnly = false;
  isEditMode = false;
    access: Acces[] = [];
  user: any = null;
    interfaces: Interface[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AnneeScolaireService,
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
      this.service.getById(+id).subscribe(a => {
        if (a) this.annee = { ...a };
      });
    }
  }

  onSubmit() {
    const request = this.isEditMode
      ? this.service.update(this.annee.id, this.annee)
      : this.service.create(this.annee);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: this.isEditMode
            ? `Modification année ${this.annee.nom}`
            : `Création année ${this.annee.nom}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        this.authService.logAction(
          'INFO',
          this.isEditMode
            ? `Modification année ${this.annee.nom}`
            : `Création année ${this.annee.nom}`
        );
        this.router.navigate(['/configuration/annee-scolaire']);
      },
      error: err => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: `Erreur lors de l'enregistrement année: ${err.message || err}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        this.authService.logAction('ERROR',`Erreur lors de l'enregistrement année: ${err.message || err}`);
      }
    });
  }

  cancel() {
    this.router.navigate(['/configuration/annee-scolaire']);
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
