import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Paiement } from '../paiement.model';
import { PaiementServiceMock } from '../paiement.service.mock';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { AuthService } from '../../../login/auth/auth.service';
import { PaiementService } from '../paiement.service';

@Component({
  selector: 'app-paiement-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paiement-form.html',
  styleUrl: './paiement-form.scss'
})
export class PaiementForm implements OnInit {
  paiement: Paiement = { id: 0, inscriptionId: 0, type: 'inscription', montant: 0, statut: 'non payé' };
  isEditMode = false;
  readOnly = false;
  typeParam = '';
  access: Acces[] = [];
  user: any = null;
  interfaces: Interface[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private service: PaiementService,
    private authService: AuthService

  ) { }

  ngOnInit(): void {

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
    this.typeParam = this.route.snapshot.paramMap.get('type') || 'inscription';
    if (this.typeParam === 'inscription' || this.typeParam === 'formation') {
      this.paiement.type = this.typeParam;
    }
    if (id) {
      this.isEditMode = true;
      this.service.getById(+id).subscribe(p => { if (p) this.paiement = p; });
    }

  }

  onSubmit(): void {
    const request = this.isEditMode
      ? this.service.update(this.paiement.id, this.paiement)
      : this.service.create(this.paiement);

    request.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.isEditMode ? 'Paiement modifié' : 'Paiement créé', timer: 2000, showConfirmButton: false });
        this.router.navigate(['/paiements/' + this.typeParam]);
      },
      error: err => Swal.fire({ icon: 'error', title: 'Erreur lors de l\'enregistrement', text: err.message || err })
    });
  }

  cancel(): void {
    this.router.navigate(['/paiements/']);
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
