import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Note } from '../note.model';
import { UEServiceMock } from '../../../gestion-facultes/ue/ue.service.mock';
import { ECUEServiceMock } from '../../../gestion-facultes/ecue/ecue.service.mock';
import { InscriptionServiceMock } from '../../inscription/inscription.service.mock';
import { FormationServiceMock } from '../../../gestion-facultes/formation/formation.service.mock';
import { AnneeScolaireServiceMock } from '../../../configuration/annee-scolaire/annee-scolaire.service.mock';
import { NoteServiceMock } from '../note.service.mock';
import { AuthService } from '../../../login/auth/auth.service';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { NoteService } from '../note.service';
import { FormationService } from '../../../gestion-facultes/formation/formation.service';
import { AnneeScolaireService } from '../../../configuration/annee-scolaire/annee-scolaire.service';
import { UEService } from '../../../gestion-facultes/ue/ue.service';
import { ECUEService } from '../../../gestion-facultes/ecue/ecue.service';
import { InscriptionService } from '../../inscription/inscription.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule],
  templateUrl: './note-list.html',
  styleUrl: './note-list.scss'
})
export class NoteList implements OnInit {
  formations: any[] = [];
  annees: any[] = [];
  ues: any[] = [];
  ecues: any[] = [];
  semestres: number[] = [];

  selectedFormation: number | null = null;
  selectedAnnee: number | null = null;
  selectedSemestre: number | null = null;
  selectedUE: number | null = null; 
  selectedECUE: number | null = null;

  rows: any[] = [];
  tempRows: any[] = [];

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private noteService: NoteService,
    private formationService: FormationService,
    private anneeService: AnneeScolaireService,
    private ueService: UEService,
    private ecueService: ECUEService,
    private authService: AuthService,
    private inscriptionService: InscriptionService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private cdRef: ChangeDetectorRef,
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
    this.formationService.getAll().subscribe(f => this.formations = f);
    this.anneeService.getAll().subscribe(a => this.annees = a);
    this.ueService.getAll().subscribe(u => this.ues = u);
    this.ecueService.getAll().subscribe(e => this.ecues = e);
  }

  onFormationChange() {
    const formation = this.formations.find(f => f.id === this.selectedFormation);
    this.semestres = formation ? Array.from({ length: formation.duree * 2 }, (_, i) => i + 1) : [];
    this.selectedSemestre = null;
    this.selectedUE = null;
    this.selectedECUE = null;
    this.rows = [];
  }

  // Chargement des étudiants inscrits pour un ECUE donné
  loadEtudiants() {
    if (!this.selectedFormation || !this.selectedAnnee || !this.selectedSemestre || !this.selectedECUE) return;
    const semestreNumber = +this.selectedSemestre;
    this.inscriptionService.getByFormationAndSemestre(this.selectedFormation, semestreNumber)
      .subscribe(inscriptions => {
        this.noteService.getByECUE(this.selectedECUE!).subscribe(notes => {
          this.rows = inscriptions.map(i => {
            const existing = notes.find((n: Note) => n.inscriptionId === i.id);
            return {
              inscriptionId: i.id,
              etudiantNom: `Étudiant #${i.etudiant_id}`,
              formationNom: `Formation #${i.formation_id}`,
              noteSessionNormale: existing?.noteSessionNormale ?? null,
              noteRattrapage: existing?.noteRattrapage ?? null
            };
          });
          this.tempRows = [...this.rows];
          this.cdRef.detectChanges();
        });
      });
  }

  // Sauvegarde batch
  saveAll() {
    const notes: Note[] = this.rows
      .filter(r => r.noteSessionNormale !== null || r.noteRattrapage !== null)
      .map(r => ({
        id: 0, // backend décidera si c’est une création ou update
        inscriptionId: r.inscriptionId,
        ecueId: this.selectedECUE!,
        noteSessionNormale: r.noteSessionNormale,
        noteRattrapage: r.noteRattrapage
      }));

    this.noteService.batchSave(notes).subscribe(() => {
      // Swal.fire({ icon: 'success', title: 'Notes enregistrées', timer: 2000, showConfirmButton: false });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Notes enregistrées',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      this.authService.logAction('INFO', 'Notes enregistrées');
    });
  }

  // Validation input
  validateNote(value: any): number | null {
    const n = Number(value);
    return n >= 0 && n <= 20 ? n : null;
  }

  // Filtre recherche
  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(r =>
      Object.values(r).some(f => String(f).toLowerCase().includes(val))
    );
  }

  // Export CSV
  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      Étudiant: r.etudiantNom,
      Formation: r.formationNom,
      'Note normale': r.noteSessionNormale ?? '',
      'Note rattrapage': r.noteRattrapage ?? ''
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'notes.csv');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export CSV des notes',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export CSV des notes');
  }

  // Export PDF
  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'Étudiant', dataKey: 'etudiantNom' },
        { header: 'Formation', dataKey: 'formationNom' },
        { header: 'Note normale', dataKey: 'noteSessionNormale' },
        { header: 'Note rattrapage', dataKey: 'noteRattrapage' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('notes.pdf');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export PDF des notes',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export PDF des notes');
  }

  exportExcel() {
    const data = this.rows.map(r => ({
      Étudiant: r.etudiantNom,
      Formation: r.formationNom,
      'Note normale': '',
      'Note rattrapage': ''
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Notes');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'notes_vierge.xlsx');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Export Excel vierge des notes',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    this.authService.logAction('INFO', 'Export Excel vierge des notes');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData: any[] = XLSX.utils.sheet_to_json(worksheet);

      this.rows = this.rows.map(r => {
        const ligne = excelData.find(x => x['Étudiant'] === r.etudiantNom);
        return {
          ...r,
          noteSessionNormale: ligne?.['Note normale'] ?? r.noteSessionNormale,
          noteRattrapage: ligne?.['Note rattrapage'] ?? r.noteRattrapage
        };
      });

      this.tempRows = [...this.rows];
      this.cdRef.detectChanges();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Import Excel réussi',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      this.authService.logAction('INFO', 'Import Excel des notes');
    };
    reader.readAsArrayBuffer(file);
  }

  importExcel(event: any) {
    const fileInput = document.querySelector<HTMLInputElement>('input[type=file]');
    fileInput?.click();
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
