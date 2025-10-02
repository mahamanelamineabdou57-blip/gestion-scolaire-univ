import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Carte } from '../carte.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { CarteService } from '../carte.service';
import { InscriptionService } from '../../inscription/inscription.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { AuthService } from '../../../login/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carte-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './carte-form.html',
  styleUrl: './carte-form.scss'
})
export class CarteForm implements OnInit {
  carte: Carte = { id: 0, numero_carte: '', inscriptions_id: '', date_emission: new Date(), date_expiration: new Date(), status: '', createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
  readOnly = false;
  isEditMode = false;
  inscriptions: any[] = [];
  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];

  constructor(
    private route: ActivatedRoute,
    private service: CarteService,
    private router: Router,
    private inscriptionService: InscriptionService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
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

    this.inscriptionService.getAll().subscribe(data => this.inscriptions = data);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.readOnly = true;
      this.service.getById(+id).subscribe(f => { if (f) this.carte = { ...f }; });
    }

  }

  onSubmit() {
    const request = this.isEditMode
      ? this.service.update(this.carte.id, this.carte)
      : this.service.create(this.carte);

    request.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: this.isEditMode
            ? `Modification carte ${this.carte.numero_carte}`
            : `Création carte ${this.carte.numero_carte}`, showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        this.authService.logAction('INFO', this.isEditMode
          ? `Modification carte ${this.carte.numero_carte}`
          : `Création carte ${this.carte.numero_carte}`);
        this.router.navigate(['/scolarite/carte']);
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Erreur lors de l'enregistrement carte: ${err.message || err}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors de l'enregistrement carte : ${err.message || err}`);
      }
    });
  }
  cancel() {
    this.router.navigate(['/scolarite/carte']);
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
