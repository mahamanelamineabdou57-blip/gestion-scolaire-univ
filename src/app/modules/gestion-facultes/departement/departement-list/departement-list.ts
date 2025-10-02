import { Component, TemplateRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { Departement } from '../departement.model';
import { AuthService } from '../../../login/auth/auth.service';
import { DepartementServiceMock } from '../departement.service.mock';
import { Faculte } from '../../faculte/faculte.model';
import { FaculteServiceMock } from '../../faculte/faculte.service.mock';
import { DepartementService } from '../departement.service';
import { FaculteService } from '../../faculte/faculte.service';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';

@Component({
  selector: 'app-departement-list',
  standalone: true,
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './departement-list.html',
  styleUrl: './departement-list.scss'
})
export class DepartementList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: Departement[] = [];
  facultes: Faculte[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private service: DepartementService,
    private faculteService: FaculteService,
    private cdRef: ChangeDetectorRef,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private authService: AuthService,
    private router: Router
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
    this.faculteService.getAll().subscribe({
      next: facs => {
        this.facultes = facs;
        this.service.getAll().subscribe({
          next: data => {
            this.rows = data.map(dep => ({
              ...dep,
              faculteNom: this.facultes.find(f => f.id === dep.faculte_id)?.nom || 'N/A'
            }));
            this.tempRows = [...this.rows];
            this.cdRef.detectChanges();
            if (this.datatable) this.datatable.recalculate();
          },
          error: err => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des departements. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            this.authService.logAction('ERROR', `Erreur de chargement des departements: ${err.message || err}`);
          }
        });
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des facultés. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur de chargement des facultés: ${err.message || err}`);
      }
    });

    this.columns = [
      { name: 'Nom', prop: 'nom' },
      { name: 'Code', prop: 'code' },
      { name: 'Faculté', prop: 'faculteNom' },
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
      Object.values(row).some(field => String(field).toLowerCase().includes(val))
    );
  }

  edit(row: Departement) {
    this.router.navigate(['/facultes/departement', row.id]);
  }

  delete(row: Departement) {
    Swal.fire({
      title: 'Supprimer ce département ?',
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
        this.service.delete(row.id).subscribe(() => {
          this.rows = this.rows.filter(r => r.id !== row.id);
          this.tempRows = this.tempRows.filter(r => r.id !== row.id);
          this.cdRef.detectChanges();
          if (this.datatable) this.datatable.recalculate();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Département ${row.nom} supprimé`, showConfirmButton: false, timer: 3000 });
          this.authService.logAction('INFO', `Département ${row.nom} supprimé`);
        });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      Nom: r.nom,
      Code: r.code,
      Faculté: r.faculteNom
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'departements.csv');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des departements. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export CSV des departements');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Nom', dataKey: 'nom' },
        { header: 'Code', dataKey: 'code' },
        { header: 'Faculté', dataKey: 'faculteNom' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('departements.pdf');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export PDF des departements. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export PDF des departements');
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
