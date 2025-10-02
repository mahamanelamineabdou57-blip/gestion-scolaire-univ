import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UtilisateurServiceMock } from '../utilisateur.service.mock';
import { Utilisateur } from '../utilisateur.model';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../login/auth/auth.service';
import { UtilisateurService } from '../utilisateur.service';
import { Acces } from '../../securite-acces/acces.model';
import { Interface } from '../../securite-acces/interface.model';
import { SecuriteAccessService } from '../../securite-acces/securite-access.service';

@Component({
  selector: 'app-utilisateurs-list',
  standalone: true,
  imports: [CommonModule, NgxDatatableModule,RouterModule],
  templateUrl: './utilisateurs-list.html',
  styleUrls: ['./utilisateurs-list.scss']
})
export class UtilisateursList implements OnInit {
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
  }

  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(row =>
      Object.values(row).some(field => String(field).toLowerCase().includes(val))
    );
  }

  edit(row: Utilisateur) {
    this.router.navigate(['/configuration/utilisateurs', row.id]);
  }

  delete(row: Utilisateur) {
    Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      icon: 'warning',
      text: 'Cette action est irréversible.',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn uas-btn-color-alt mx-2',
        cancelButton: 'btn uas-btn-color'
      }
    }).then(result => {
      if (result.isConfirmed) {

                this.userService.delete(row.id).subscribe({
                  next: () => {
                    this.rows = this.rows.filter(u => u.id !== row.id);
                    this.tempRows = this.tempRows.filter(u => u.id !== row.id);
                    this.cdRef.detectChanges();
                    if (this.datatable) this.datatable.recalculate();
          Swal.fire({toast: true,position: 'top-end',icon: 'success',title: `L'utilisateur ${row.nom} a été supprimé`,showConfirmButton: false,  timer: 3000,timerProgressBar: true});
          this.authService.logAction('INFO', `L'utilisateur ${row.nom} a été supprimé`);
                  },
                  error: err => {
                    Swal.fire({toast: true,position: 'top-end',icon: 'error',title: `Impossible de supprimer l\'utilisateur : ${row.nom} .` + err,showConfirmButton: false,  timer: 3000,timerProgressBar: true});
                    this.authService.logAction('ERROR', `Erreur suppression de l\'utilisateur : ${row.nom}: ${err.message || err}`);
                  }
                });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows, { columns: ['matricule','nom','prenom','email','telephone','role.nom'] });
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'utilisateurs.csv');
        Swal.fire({toast: true,position: 'top-end',icon: 'success',title: 'Export CSV des rôles. ',showConfirmButton: false,  timer: 3000,timerProgressBar: true});
        this.authService.logAction('INFO', 'Export CSV des rôles');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Matricule', dataKey: 'matricule' },
        { header: 'Nom', dataKey: 'nom' },
        { header: 'Prénom', dataKey: 'prenom' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Téléphone', dataKey: 'telephone' },
        { header: 'Rôle', dataKey: 'role.nom' }
      ],
      body: this.rows
    });
    doc.save('utilisateurs.pdf');
        Swal.fire({toast: true,position: 'top-end',icon: 'success',title: 'Export PDF des rôles. ',showConfirmButton: false,  timer: 3000,timerProgressBar: true});
        this.authService.logAction('INFO', 'Export PDF des rôles');
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
