import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UtilisateurServiceMock } from '../../utilisateurs/utilisateur.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { Utilisateur } from '../../utilisateurs/utilisateur.model';
import Swal from 'sweetalert2';
import { UtilisateurService } from '../../utilisateurs/utilisateur.service';
import { Acces } from '../acces.model';
import { Interface } from '../interface.model';
import { SecuriteAccessService } from '../securite-access.service';

@Component({
  selector: 'app-securite-acces-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatatableComponent],
  templateUrl: './securite-acces-list.html',
  styleUrls: ['./securite-acces-list.scss']
})
export class SecuriteAccesList implements OnInit {

  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: Utilisateur[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(private userService: UtilisateurService, private cdRef: ChangeDetectorRef, private router: Router,
                                  private securiteAccessService: SecuriteAccessService, private authService: AuthService) {}

  ngOnInit(): void {
                      try {
                        this.userService.getById(this.authService.user()).subscribe({
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
    this.columns = [
      { name: 'Matricule', prop: 'matricule' },
      { name: 'Nom', prop: 'nom' },
      { name: 'Prénom', prop: 'prenom' },
      { name: 'Email', prop: 'email' },
      { name: 'Téléphone', prop: 'telephone' },
      { name: 'Rôle', prop: 'role.nom' },
      { name: 'Actions',
        cellTemplate: this.actionsTemplate,
        sortable: false,
        canAutoResize: false,
        draggable: false,
        resizable: false,
        width: 100
      }
    ];

    this.userService.getAll().subscribe({
      next: data => {
        this.rows = data;
        this.tempRows = [...this.rows];
        this.cdRef.detectChanges();
        if (this.datatable) {
          this.datatable.recalculate();
        }
      },
      error: err => {
        Swal.fire({toast: true,position: 'top-end',icon: 'error',title: 'chargement des utilisateurs. '+ err,showConfirmButton: false,  timer: 3000,timerProgressBar: true});
        this.authService.logAction('ERROR', `Erreur de chargement des utilisateurs: ${err.message || err}`);
      }
    });
  }
 
  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(row =>
      Object.values(row).some(field => String(field).toLowerCase().includes(val))
    );
  }

  edit(user: Utilisateur) {
    this.router.navigate(['/configuration/securite-access', user.id]);
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
