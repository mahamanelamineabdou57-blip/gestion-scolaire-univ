import { RoleServiceApi } from './../role.service.api';
import { Component, TemplateRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RoleServiceMock } from '../role.service.mock';
import Swal from 'sweetalert2';
import { LogsService } from '../../../../logs/logs.service';
import { Logs } from '../../../../logs/logs.model';
import { AuthService } from '../../../login/auth/auth.service';
import { Acces } from '../../securite-acces/acces.model';
import { Interface } from '../../securite-acces/interface.model';
import { UtilisateurService } from '../../utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../securite-acces/securite-access.service';


@Component({
  selector: 'app-role',
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss'
})
export class RolesList implements OnInit {

  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: any[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private roleService: RoleServiceApi,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private router: Router
  ) {
  }

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
    this.roleService.getAll().subscribe({
      next: data => {
        this.rows = data;
        this.tempRows = [...this.rows];
        this.cdRef.detectChanges();
        if (this.datatable) {
          this.datatable.recalculate();
        }
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des rôles. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur de chargement des utilisateurs: ${err.message || err}`);
      }
    });

    this.columns = [
      { name: 'Nom', prop: 'nom' },
      { name: 'Description', prop: 'description' },
      {
        name: 'Actions',
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
      Object.values(row).some(field =>
        String(field).toLowerCase().includes(val)
      )
    );
  }

  edit(row: any): void {
    this.router.navigate(['/configuration/roles/', row.id]);
  }

  delete(row: any): void {
    Swal.fire({
      title: 'Supprimer ce rôle ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn uas-btn-color-alt mx-2',
        cancelButton: 'btn uas-btn-color'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.delete(row.id).subscribe({
          next: () => {
            let name = row.nom;
            this.rows = this.rows.filter(u => u.id !== row.id);
            this.tempRows = this.tempRows.filter(u => u.id !== row.id);
            this.cdRef.detectChanges();
            if (this.datatable) this.datatable.recalculate();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Le rôle ' + name + ' a été supprimé : ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            this.authService.logAction('INFO', `Rôle : ${row.nom} supprimé`);
          },
          error: err => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Impossible de supprimer le rôle : ' + name + '.' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            this.authService.logAction('ERROR', `Erreur suppression du rôle : ${row.nom}: ${err.message || err}`);
          }
        });
      }
    });
  }
  exportCSV() {
    const csv = Papa.unparse(this.rows, {
      columns: ['nom', 'description']
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'roles.csv');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des rôles. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export CSV des rôles');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Nom', dataKey: 'nom' },
        { header: 'Description', dataKey: 'description' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('roles.pdf');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export PDF des rôles. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export PDF des rôles');
  }

  normalizeString(value: string): string {
    return value
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  hasInterface(nom: string, permission: string): boolean {
    if (!this.user?.role?.interfaces) return false;

    const nomNormalise = this.normalizeString(nom);
    return this.user.role.interfaces.some(
      (i: { nom: string; permissions: string[] }) =>
        this.normalizeString(i.nom) === nomNormalise &&
        (!permission || i.permissions.includes(permission))
    );
  }
}
