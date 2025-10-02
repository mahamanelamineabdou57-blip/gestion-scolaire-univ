import { Component, TemplateRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { UE } from '../ue.model';
import { AuthService } from '../../../login/auth/auth.service';
import { UEServiceMock } from '../ue.service.mock';
import { Formation } from '../../formation/formation.model';
import { FormationServiceMock } from '../../formation/formation.service.mock';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { FormationService } from '../../formation/formation.service';
import { UEService } from '../ue.service';

@Component({
  selector: 'app-ue-list',
  standalone: true,
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  styleUrl: './ue-list.scss',
  templateUrl: './ue-list.html'
})
export class UEList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: UE[] = [];
  formations: Formation[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private service: UEService,
    private formationService: FormationService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
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
    this.formationService.getAll().subscribe({
      next: formations => {
        this.formations = formations;
        this.service.getAll().subscribe({
          next: data => {
            this.rows = data.map(ue => ({
              ...ue,
              formationNom: this.formations.find(f => f.id === ue.formation_id)?.nom || 'N/A'
            }));
            this.tempRows = [...this.rows];
            this.cdRef.detectChanges();
            if (this.datatable) this.datatable.recalculate();
          },
          error: err => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des ues. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            this.authService.logAction('ERROR', `Erreur de chargement des ues: ${err.message || err}`);
          }
        });
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des formations. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur de chargement des formations: ${err.message || err}`);
      }
    });

    this.columns = [
      { name: 'Nom', prop: 'nom' },
      { name: 'Code', prop: 'code' },
      { name: 'Formation / Diplôme', prop: 'formationNom' },
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

  edit(row: UE) {
    this.router.navigate(['/facultes/ue', row.id]);
  }

  delete(row: UE) {
    Swal.fire({
      title: 'Supprimer cette UE ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      buttonsStyling: false,
      customClass: { confirmButton: 'btn uas-btn-color-alt mx-2', cancelButton: 'btn uas-btn-color' }
    }).then(result => {
      if (result.isConfirmed) {
        this.service.delete(row.id).subscribe(() => {
          this.rows = this.rows.filter(r => r.id !== row.id);
          this.tempRows = this.tempRows.filter(r => r.id !== row.id);
          this.cdRef.detectChanges();
          if (this.datatable) this.datatable.recalculate();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `UE ${row.nom} supprimée`, showConfirmButton: false, timer: 3000 });
          this.authService.logAction('INFO', `UE ${row.nom} supprimée`);
        });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      Nom: r.nom,
      Code: r.code,
      Durée: r.duree,
      Formation: r.formationNom
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'ues.csv');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des ues. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export CSV des ues');

  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Nom', dataKey: 'nom' },
        { header: 'Code', dataKey: 'code' },
        { header: 'Formation / Diplôme', dataKey: 'formationNom' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('ues.pdf');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des ues. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export CSV des ues');

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
