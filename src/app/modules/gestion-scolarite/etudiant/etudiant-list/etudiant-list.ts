// etudiants/etudiant-list.component.ts
import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { EtudiantServiceMock } from '../etudiant.service.mock';
import { Etudiant } from '../etudiant.model';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '../../../login/auth/auth.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { EtudiantService } from '../etudiant.service';

@Component({
  selector: 'app-etudiant-list',
  standalone: true,
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './etudiant-list.html',
  styleUrl: './etudiant-list.scss'
})
export class EtudiantList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;
  @ViewChild('photoTemplate', { static: true }) photoTemplate!: TemplateRef<any>;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: Etudiant[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private service: EtudiantService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private router: Router) { }

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
    this.service.getAll().subscribe({
      next: data => {
        this.rows = data;
        this.tempRows = [...this.rows];
        this.cdRef.detectChanges();
        if (this.datatable) this.datatable.recalculate();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des étudiants. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur de chargement des étudiants: ${err.message || err}`);
      }
    });

    this.columns = [
      { name: 'Photo', prop: 'photo', cellTemplate: this.photoTemplate, width: 50 },
      { name: 'Matricule', prop: 'matricule' },
      { name: 'Nom', prop: 'nom' },
      { name: 'Prénom', prop: 'prenom' },
      { name: 'Téléphone', prop: 'telephone' },
      { name: 'Email', prop: 'email' },
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

  edit(row: Etudiant) {
    this.router.navigate(['/scolarite/etudiant', row.id]);
  }

  delete(row: Etudiant) {
    Swal.fire({
      title: 'Supprimer cet étudiant ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(row.id).subscribe(() => {
          this.rows = this.rows.filter(r => r.id !== row.id);
          this.tempRows = this.tempRows.filter(r => r.id !== row.id);
          this.cdRef.detectChanges();
          if (this.datatable) this.datatable.recalculate();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Étudiant ${row.nom} supprimé`, showConfirmButton: false, timer: 3000 });
          this.authService.logAction('INFO', `Étudiant ${row.nom} supprimé`);
        });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      Matricule: r.matricule,
      Nom: r.nom,
      Prénom: r.prenom,
      Téléphone: r.telephone || '',
      Email: r.email || ''
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'etudiants.csv');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export CSV des étudiants.',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export CSV des étudiants');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Matricule', dataKey: 'matricule' },
        { header: 'Nom', dataKey: 'nom' },
        { header: 'Prénom', dataKey: 'prenom' },
        { header: 'Téléphone', dataKey: 'telephone' },
        { header: 'Email', dataKey: 'email' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('etudiants.pdf');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export PDF des étudiants.',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export PDF des étudiants');
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
