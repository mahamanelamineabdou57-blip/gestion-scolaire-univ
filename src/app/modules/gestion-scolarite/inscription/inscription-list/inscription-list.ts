import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { InscriptionServiceMock } from '../inscription.service.mock';
import { Inscription } from '../inscription.model';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '../../../login/auth/auth.service';
import { EtudiantServiceMock } from '../../etudiant/etudiant.service.mock';
import { FormationServiceMock } from '../../../gestion-facultes/formation/formation.service.mock';
import { AnneeScolaireServiceMock } from '../../../configuration/annee-scolaire/annee-scolaire.service.mock';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { InscriptionService } from '../inscription.service';
import { EtudiantService } from '../../etudiant/etudiant.service';
import { FormationService } from '../../../gestion-facultes/formation/formation.service';
import { AnneeScolaireService } from '../../../configuration/annee-scolaire/annee-scolaire.service';

@Component({
  selector: 'app-inscription-list',
  standalone: true,
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './inscription-list.html',
  styleUrl: './inscription-list.scss'
})
export class InscriptionList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: any[] = [];

  etudiants: any[] = [];
  facultes: any[] = [];
  departements: any[] = [];
  formations: any[] = [];
  annees: any[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private inscriptionService: InscriptionService,
    private etudiantService: EtudiantService,
    private formationService: FormationService,
    private anneeService: AnneeScolaireService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private router: Router
  ) { }

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
    this.etudiantService.getAll().subscribe(data => this.etudiants = data);
    this.formationService.getAll().subscribe(data => this.formations = data);
    this.anneeService.getAll().subscribe(data => this.annees = data);

    this.inscriptionService.getAll().subscribe({
      next: data => {
        this.rows = data.map(inscription => {
          const etudiant = this.etudiants.find(e => e.id === inscription.etudiant_id);
          return {
            ...inscription,
            etudiantNom: etudiant ? `${etudiant.nom} ${etudiant.prenom}` : '',
            formationNom: this.formations.find(f => f.id === inscription.formation_id)?.nom || '',
            anneeScolaireNom: this.annees.find(a => a.id === inscription.anneeScolaire_id)?.nom || '',
            semestreCourant: 'Semestre '+inscription.semestre_courant.toString(),  // Affiche le nom du semestre ou fallback sur l'ID
          };
        });
        this.tempRows = [...this.rows];
        this.cdRef.detectChanges();
        if (this.datatable) this.datatable.recalculate();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Chargement des inscriptions : ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur chargement inscriptions : ${err.message || err}`);
      }
    });

    // Colonnes du tableau
    this.columns = [
      { name: 'Étudiant', prop: 'etudiantNom' },
      { name: 'Formation', prop: 'formationNom' },
      { name: 'Année scolaire', prop: 'anneeScolaireNom' },
      { name: 'Semestre courant', prop: 'semestreCourant' },
      {
        name: 'Actions',
        cellTemplate: this.actionsTemplate,
        sortable: false,
        canAutoResize: false,
        draggable: false,
        resizable: false,
        width: 120
      }
    ];
  }

  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(row =>
      Object.values(row).some(field => String(field).toLowerCase().includes(val))
    );
  }

  edit(row: Inscription) {
    this.router.navigate(['/scolarite/inscription', row.id]);
  }

  delete(row: Inscription) {
    Swal.fire({
      title: 'Supprimer cette inscription ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.inscriptionService.delete(row.id).subscribe(() => {
          this.rows = this.rows.filter(r => r.id !== row.id);
          this.tempRows = this.tempRows.filter(r => r.id !== row.id);
          this.cdRef.detectChanges();
          if (this.datatable) this.datatable.recalculate();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Inscription supprimée`, showConfirmButton: false, timer: 3000 });
          this.authService.logAction('INFO', `Inscription supprimée`);
        });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      Étudiant: r.etudiantNom,
      Faculté: r.faculteNom,
      Département: r.departementNom,
      Formation: r.formationNom,
      'Année scolaire': r.anneeScolaireNom,
      'Semestre courant': r.semestreCourant
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'inscriptions.csv');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export CSV des inscriptions',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export CSV des inscriptions');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Étudiant', dataKey: 'etudiantNom' },
        { header: 'Formation', dataKey: 'formationNom' },
        { header: 'Année scolaire', dataKey: 'anneeScolaireNom' },
        { header: 'Semestre courant', dataKey: 'semestreCourant' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('inscriptions.pdf');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export PDF des inscriptions',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export PDF des inscriptions');
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
