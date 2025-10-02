import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Acces } from '../../modules/configuration/securite-acces/acces.model';
import { Interface } from '../../modules/configuration/securite-acces/interface.model';
import { UniversiteService } from '../../modules/configuration/universite/universite.service';
import { UtilisateurService } from '../../modules/configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../modules/configuration/securite-acces/securite-access.service';
import { AuthService } from '../../modules/login/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  currentUrl: string = '';
  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];

  constructor(
    private router: Router,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

  ngOnInit() {
this.authService.user.set(1);
      try {
        this.utilisateurService.getById(this.authService.user()).subscribe({
          next: (utilisateur) => {
          console.log("ok ")
            this.user = utilisateur;
          console.log("ok 1")
            this.securiteAccessService.getInterfaces().subscribe(data => {
          console.log("ok 2")
              this.interfaces = data;
          console.log("ok 3")
              this.cdRef.detectChanges();
            });
          console.log("ok 4")
            this.securiteAccessService.getAccesByUtilisateur(this.user.id).subscribe(perms => {
          console.log("ok 5")
              this.access = perms;
          console.log("ok 6")
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
