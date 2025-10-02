import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { Paiement } from '../paiement.model';
import { PaiementServiceMock } from '../paiement.service.mock';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../login/auth/auth.service';
import { ColumnChangesService } from '@swimlane/ngx-datatable';
import { InscriptionServiceMock } from '../../../gestion-scolarite/inscription/inscription.service.mock';
import { EtudiantServiceMock } from '../../../gestion-scolarite/etudiant/etudiant.service.mock';
import { FormationServiceMock } from '../../../gestion-facultes/formation/formation.service.mock';
import { AnneeScolaireServiceMock } from '../../../configuration/annee-scolaire/annee-scolaire.service.mock';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { PaiementService } from '../paiement.service';
import { InscriptionService } from '../../../gestion-scolarite/inscription/inscription.service';
import { EtudiantService } from '../../../gestion-scolarite/etudiant/etudiant.service';
import { FormationService } from '../../../gestion-facultes/formation/formation.service';
import { AnneeScolaireService } from '../../../configuration/annee-scolaire/annee-scolaire.service';
import { firstValueFrom, forkJoin } from 'rxjs';

@Component({
  selector: 'app-paiement-list',
  imports: [CommonModule, NgxDatatableModule, RouterModule],
  templateUrl: './paiement-list.html',
  providers: [ColumnChangesService],
  styleUrl: './paiement-list.scss'
})

export class PaiementList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;
  @ViewChild('statutTemplate', { static: true }) statutTemplate!: TemplateRef<any>;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: Paiement[] = [];
  showActions = true;

  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private service: PaiementService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private inscriptionService: InscriptionService,
    private etudiantService: EtudiantService,
    private formationService: FormationService,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private anneeScolaireService: AnneeScolaireService
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
    const currentUrl = this.router.url;
    if (currentUrl === '/paiements') {
      this.showActions = false;
    }

    const type: 'inscription' | 'formation' | undefined = this.route.snapshot.data['type'];

    this.service.getAll().subscribe(data => {
      this.rows = data;
      this.rows.forEach(async p => {
        const inscription = await this.inscriptionService?.getById(p.inscriptionId).toPromise();
        if (inscription) {
          const etudiant = await this.etudiantService?.getById(inscription.etudiant_id).toPromise();
          const formation = await this.formationService?.getById(inscription.formation_id).toPromise();
          const annee = await this.anneeScolaireService?.getById(inscription.anneeScolaire_id).toPromise();
          p.inscriptionInfo = etudiant && formation && annee
            ? `${etudiant.nom} ${etudiant.prenom} - ${formation.nom} - ${annee.nom} - S${inscription.semestre_courant}`
            : 'Infos manquantes';
        } else {
          p.inscriptionInfo = 'Inscription non trouvée';
        }
      });
      this.tempRows = [...this.rows];
      this.cdRef.detectChanges();
      if (this.datatable) this.datatable.recalculate();
    });
    this.columns = [
      { name: 'Inscription', prop: 'inscriptionInfo' },
      { name: 'Type', prop: 'type' },
      { name: 'Montant', prop: 'montant' },
      { name: 'Statut', prop: 'statut', cellTemplate: this.statutTemplate }
    ];
    if (this.showActions) {
      this.columns.push({
        name: 'Actions',
        cellTemplate: this.actionsTemplate,
        sortable: false,
        canAutoResize: false,
        draggable: false,
        resizable: false,
        width: 100
      });
    }
  }

  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(row => Object.values(row).some(field => String(field).toLowerCase().includes(val)));
  }

  edit(row: Paiement) {
    this.router.navigate(['/paiements/', row.id]);
  }

  delete(row: Paiement) {
    Swal.fire({
      title: 'Supprimer ce paiement ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.delete(row.id).subscribe(() => {
          this.rows = this.rows.filter(r => r.id !== row.id);
          this.tempRows = this.tempRows.filter(r => r.id !== row.id);
          this.cdRef.detectChanges();
          Swal.fire({ icon: 'success', title: 'Paiement supprimé', timer: 2000, showConfirmButton: false });
        });
      }
    });
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows, { columns: ['matricule', 'nom', 'prenom', 'email', 'telephone', 'role.nom'] });
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'utilisateurs.csv');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des rôles. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
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
    if (!this.access) return false;

    const nomNormalise = this.normalizeString(nom);
    return this.access.some(
      (i: { droits: string; }) =>
        this.normalizeString(i.droits).includes(permission || "")
    );
  }
}
