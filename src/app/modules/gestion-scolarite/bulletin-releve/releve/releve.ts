import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

import { FormationServiceMock } from '../../../gestion-facultes/formation/formation.service.mock';
import { AnneeScolaireServiceMock } from '../../../configuration/annee-scolaire/annee-scolaire.service.mock';
import { InscriptionServiceMock } from '../../inscription/inscription.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { Formation } from '../../../gestion-facultes/formation/formation.model';
import { AnneeScolaire } from '../../../configuration/annee-scolaire/annee-scolaire.model';
import { NoteServiceMock } from '../../note/note.service.mock';
import { FormationService } from '../../../gestion-facultes/formation/formation.service';
import { AnneeScolaireService } from '../../../configuration/annee-scolaire/annee-scolaire.service';
import { InscriptionService } from '../../inscription/inscription.service';

@Component({
  selector: 'app-releve',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgxDatatableModule],
  templateUrl: './releve.html',
  styleUrl: './releve.scss'
})
export class Releve implements OnInit, AfterViewInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  formations: Formation[] = [];
  annees: AnneeScolaire[] = [];
  semestres: number[] = [];

  selectedFormation: number | null = null;
  selectedAnnee: number | null = null;
  selectedSemestre: number | null = null;

  rows: any[] = [];
  tempRows: any[] = [];
  columns: any[] = [];

  constructor(
    private formationService: FormationService,
    private anneeService: AnneeScolaireService,
    private inscriptionService: InscriptionService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private noteService: NoteServiceMock
  ) {}

  ngOnInit() {
    this.formationService.getAll().subscribe(f => (this.formations = f));
    this.anneeService.getAll().subscribe(a => (this.annees = a));
    this.cdRef.detectChanges();

    this.columns = [
      { name: 'Étudiant', prop: 'etudiantNom' },
      { name: 'Matricule', prop: 'matricule' },
      { name: 'Moyenne', prop: 'moyenneGenerale' },
      { name: 'Rang', prop: 'rang' }
    ];
  }

  ngAfterViewInit() {
  }

  onFormationChange() {
    const formation = this.formations.find(f => f.id === this.selectedFormation);
    this.semestres = formation ? Array.from({ length: formation.duree * 2 }, (_, i) => i + 1) : [];
    this.selectedSemestre = null;
    this.rows = [];
    this.cdRef.detectChanges();
  }

  loadReleve() {
    if (!this.selectedFormation || !this.selectedAnnee || !this.selectedSemestre) return;

    this.inscriptionService.getByFormationAndSemestre(this.selectedFormation, +this.selectedSemestre).subscribe({
      next: inscriptions => {
        const rowsPromises = inscriptions.map(insc =>
          this.noteService.getAll().toPromise().then(allNotes => {
            const notes = (allNotes ?? []).filter(n => n.inscriptionId === insc.id);

            const notesValues = notes.map(n => n.noteSessionNormale ?? 0);
            const moyenne = notesValues.length
              ? +(notesValues.reduce((a, b) => a + b, 0) / notesValues.length).toFixed(2)
              : 0;

            const mention = this.getMention(moyenne);
            const decision = moyenne >= 10 ? 'Validé' : 'Non Validé';

            return {
              etudiantNom: `Étudiant #${insc.etudiant_id}`,
              matricule: `MATR-${insc.etudiant_id}`,
              moyenneGenerale: moyenne,
              rang: 0,
              etudiantId: insc.etudiant_id,
              inscriptionId: insc.id,
              mention,
              decision
            };
          })
        );

        Promise.all(rowsPromises).then(rows => {
          rows.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
          rows.forEach((r, i) => (r.rang = i + 1));

          this.rows = rows;
          this.tempRows = [...rows];
          this.cdRef.detectChanges();
        });
      },
      error: err => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Erreur chargement relevé: ' + err
        });
      }
    });
  }


  // Même getMention que dans Bulletin
  getMention(note: number): string {
    if (note >= 16) return 'Très Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }
  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(r => Object.values(r).some(f => String(f).toLowerCase().includes(val)));
  }

  visualiserBulletin(row: any) {
    this.router.navigate(['/scolarite/bulletin', row.etudiantId]);
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      Étudiant: r.etudiantNom,
      Matricule: r.matricule,
      Moyenne: r.moyenneGenerale,
      Rang: r.rang
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'releve.csv');
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Étudiant', dataKey: 'etudiantNom' },
        { header: 'Matricule', dataKey: 'matricule' },
        { header: 'Moyenne', dataKey: 'moyenneGenerale' },
        { header: 'Rang', dataKey: 'rang' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('releve.pdf');
  }
}
