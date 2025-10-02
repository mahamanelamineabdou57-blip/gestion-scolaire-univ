import { Component, TemplateRef, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { AnneeScolaire } from '../annee-scolaire.model';
import { AuthService } from '../../../login/auth/auth.service';
import { AnneeScolaireServiceMock } from '../annee-scolaire.service.mock';
import { AnneeScolaireService } from '../annee-scolaire.service';
import { Acces } from '../../securite-acces/acces.model';
import { Interface } from '../../securite-acces/interface.model';
import { UtilisateurService } from '../../utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../securite-acces/securite-access.service';

@Component({
  selector: 'app-annee-scolaire-list',
  standalone: true,
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './annee-scolaire-list.html',
  styleUrls: ['./annee-scolaire-list.scss']
})
export class AnneeScolaireList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: AnneeScolaire[] = [];
  user: any = null;

  access: Acces[] = [];
  interfaces: Interface[] = [];

  constructor(
    private service: AnneeScolaireService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private router: Router
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

    this.service.getAll().subscribe({
      next: data => {
        this.rows = data;
        this.tempRows = [...data];
        this.cdRef.detectChanges();
        if (this.datatable) this.datatable.recalculate();
      },
      error: err => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Erreur chargement des années scolaires: '+err,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        this.authService.logAction('ERROR', `Erreur chargement années scolaires: ${err.message || err}`);
      }
    });
    this.columns = [
      { name: 'Nom', prop: 'nom' },
      { name: 'Statut', prop: 'actif', cellTemplate: this.statusTemplate },
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

  edit(row: AnneeScolaire) {
    this.router.navigate(['/configuration/annee-scolaire', row.id]);
  }

  delete(row: AnneeScolaire) {
    Swal.fire({
      title: 'Supprimer cette année scolaire ?',
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
        this.service.delete(row.id).subscribe({
          next: () => {
            const name = row.nom;
            this.rows = this.rows.filter(r => r.id !== row.id);
            this.tempRows = this.tempRows.filter(r => r.id !== row.id);
            this.cdRef.detectChanges();
            if (this.datatable) this.datatable.recalculate();
            Swal.fire({toast: true,position: 'top-end',icon: 'success',title: `L'année ${name} a été supprimée`,showConfirmButton: false,timer: 3000,timerProgressBar: true});
            this.authService.logAction('INFO', `Année scolaire ${name} supprimée`);
          },
          error: err => {
            Swal.fire({toast: true,position: 'top-end',icon: 'error',title: 'Impossible de supprimer : '+err,showConfirmButton: false,timer: 3000,timerProgressBar: true});
            this.authService.logAction('ERROR', `Erreur suppression année scolaire ${row.nom}: ${err.message || err}`);
          }
        });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows, { columns: ['nom','actif'] });
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'annees-scolaires.csv');
    Swal.fire({toast: true,position: 'top-end',icon: 'success',title: 'Export CSV années scolaires. ',showConfirmButton: false,  timer: 3000,timerProgressBar: true});
    this.authService.logAction('INFO', 'Export CSV années scolaires');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Nom', dataKey: 'nom' },
        { header: 'Actif', dataKey: 'actif' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('annees-scolaires.pdf');
    Swal.fire({toast: true,position: 'top-end',icon: 'success',title: 'Export PDF années scolaires. ',showConfirmButton: false,  timer: 3000,timerProgressBar: true});
    this.authService.logAction('INFO', 'Export PDF années scolaires');
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
