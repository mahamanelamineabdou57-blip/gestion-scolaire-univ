import { Universite } from './../../modules/configuration/universite/universite.model';
import { UniversiteService } from './../../modules/configuration/universite/universite.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../modules/login/auth/auth.service';
import { LogsService } from '../../logs/logs.service';
import { environment } from '../../../environments/environment';
import { Acces } from '../../modules/configuration/securite-acces/acces.model';
import { UtilisateurService } from '../../modules/configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../modules/configuration/securite-acces/securite-access.service';
import { Interface } from '../../modules/configuration/securite-acces/interface.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {
  currentUrl: string = '';
  logoPreview: string | null = null;
  user: any = null;
  access: any[] = [];
  interfaces: Interface[] = [];

  constructor(
    private router: Router,
    private universiteService: UniversiteService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });

    this.universiteService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoPreview = url;
        this.cdRef.detectChanges();
      }
    });

    // this.universiteService.get().subscribe({
    //   next: (universite) => {
    //     this.logoPreview = universite.logo ? `${environment.apiUrl}/uploads/${universite.logo}` : null;
    //     this.universiteService.notifyLogoUpdate(universite.logo);
    //     this.cdRef.detectChanges();
    //   },
    //   error: (err) => {
    //     Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations de l\'université : ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    //     this.authService.logAction('ERROR', `Erreur de chargement des informations: ${err.message || err}`);
    //   }
    // });
  }

  ngOnInit() {
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

    return this.access.some(a => {
      const hasPermission = this.normalizeString(a.droits).includes(permission);
      const hasInteface = this.normalizeString(a.inteface.nom) === nomNormalise;

      return hasPermission && hasInteface;
    });
  }

  // hasInterface(nom: string, permission: string): boolean {
  //   if (!this.access) return false;

  //       console.log("this.access ",this.access)
  //   const nomNormalise = this.normalizeString(nom);
  //   return this.access.some(
  //     (a) =>{
  //       console.log("nomNormalise ",nomNormalise)
  //       console.log("a.interfaceId ",a.inteface_id)
  //       console.log("a.droits ",a.droits)
  //       console.log("this.normalizeString(a.droits).includes(permission) ",
  //         (this.normalizeString(a.droits).includes(permission)))
  //       console.log("this.interfaces.some(i => i.id == a.interfaceId) ",
  //         (this.interfaces.some(i => i.id == a.inteface_id)))
  //       console.log("this.normalizeString(a.droits).includes(permission) && this.interfaces.some(i => i.id == a.interfaceId) ",
  //         (this.normalizeString(a.droits).includes(permission) && this.interfaces.some(i => i.id == a.inteface_id)))
  //       this.normalizeString(a.droits).includes(permission) && this.interfaces.some(i => i.id == a.inteface_id)
  //     }
  //   );
  // }
}
