// import { CommonModule } from '@angular/common';
// import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
// import { Router, RouterModule } from '@angular/router';
// import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { Acces } from '../../../configuration/securite-acces/acces.model';
// import { Interface } from '../../../configuration/securite-acces/interface.model';
// import { Faculte } from '../../../gestion-facultes/faculte/faculte.model';
// import { Inscription } from '../../inscription/inscription.model';
// import { CarteService } from '../carte.service';
// import { InscriptionService } from '../../inscription/inscription.service';
// import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
// import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
// import { AuthService } from '../../../login/auth/auth.service';
// import Swal from 'sweetalert2';
// import { Carte } from '../carte.model';
// import Papa from 'papaparse';
// import saveAs from 'file-saver';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// @Component({
//   selector: 'app-carte-list',
//   imports: [RouterModule, CommonModule, NgxDatatableModule],
//   templateUrl: './carte-list.html',
//   styleUrl: './carte-list.scss'
// })
// export class CarteList implements OnInit {
//   @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
//   @ViewChild(DatatableComponent) datatable!: DatatableComponent;

//   columns: any[] = [];
//   rows: any[] = [];
//   tempRows: Faculte[] = [];
//   inscription: Inscription[] = [];
//   user: any = null;
//   access: Acces[] = [];
//   interfaces: Interface[] = [];
//   constructor(
//     private service: CarteService,
//     private cdRef: ChangeDetectorRef,
//     private utilisateurService: UtilisateurService,
//     private securiteAccessService: SecuriteAccessService,
//     private authService: AuthService,
//     private router: Router,
//     private inscriptionService: InscriptionService
//   ) {

//     // Initialize any necessary data or services here
//   }
//   ngOnInit() {
//     try {
//       this.utilisateurService.getById(this.authService.user()).subscribe({
//         next: (utilisateur) => {
//           this.user = utilisateur;
//           this.securiteAccessService.getInterfaces().subscribe(data => {
//             this.interfaces = data;
//             this.cdRef.detectChanges();
//           });
//           this.securiteAccessService.getAccesByUtilisateur(this.user.id).subscribe(perms => {
//             this.access = perms;
//             this.cdRef.detectChanges();
//           });
//         },
//         error: (err) => {
//           Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
//           this.authService.logAction('ERROR', `Erreur lors du chargement des informations: ${err.message || err}`);
//           this.user = null;
//         }
//       });
//     } catch (err) {
//       Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations: ' + (err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
//       this.authService.logAction('ERROR', `Erreur lors du chargement des informations: ${err}`);
//       this.user = null;
//     }

//     this.service.getAll().subscribe({
//       next: data => {
//         this.rows = data;
//         this.tempRows = [...this.rows];
//         this.cdRef.detectChanges();
//         if (this.datatable) {
//           this.datatable.recalculate();
//         }
//       },
//       error: err => {
//         Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'chargement des facultés. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
//         this.authService.logAction('ERROR', `Erreur de chargement des facultés: ${err.message || err}`);
//       }
//     });

//     this.inscriptionService.getAll().subscribe({
//       next: data => {
//         this.inscription = data;
//         this.cdRef.detectChanges();
//       },
//       error: err => {
//         Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
//         this.authService.logAction('ERROR', `Erreur lors du chargement des informations: ${err.message || err}`);
//       }
//     });

//     this.columns = [
//       { prop: 'id', name: 'ID', width: 50 },
//       { prop: 'numeroCarte', name: 'Numéro de Carte', width: 150 },
//       { prop: 'dateDelivrance', name: 'Date de Délivrance' },
//       { prop: 'dateExpiration', name: 'Date d\'Expiration' },
//       { prop: 'inscriptionId', name: 'Inscription' },
//       { name: 'Actions', cellTemplate: this.actionsTemplate, sortable: false, width: 150, canAutoResize: false, draggable: false, resizable: false }
//     ];
//     // Logic to fetch and display student cards
//   }
//   updateFilter(event: Event) {
//     const val = (event.target as HTMLInputElement).value.toLowerCase();
//     this.rows = this.tempRows.filter(row =>
//       Object.values(row).some(field => String(field).toLowerCase().includes(val))
//     );
//   }

//   edit(row: Carte) {
//     this.router.navigate(['/scolarite/carte', row.id]);
//   }
//   delete(row: Carte) {
//     Swal.fire({
//       title: 'Supprimer cette carte ?',
//       text: 'Cette action est irréversible.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Oui, supprimer',
//       cancelButtonText: 'Annuler',
//       buttonsStyling: false,
//       customClass: {
//         confirmButton: 'btn uas-btn-color-alt mx-2',
//         cancelButton: 'btn uas-btn-color'
//       }
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.service.delete(row.id).subscribe(() => {
//           this.rows = this.rows.filter(r => r.id !== row.id);
//           this.tempRows = this.tempRows.filter(r => r.id !== row.id);
//           this.cdRef.detectChanges();
//           if (this.datatable) this.datatable.recalculate();
//           Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `carte ${row.numero_carte} supprimée`, showConfirmButton: false, timer: 3000 });
//           this.authService.logAction('INFO', `carte ${row.numero_carte} supprimée`);
//         });


//       }
//     });
//   }
//   exportCSV() {
//     const csv = Papa.unparse(this.rows.map(r => ({
//       Nom: r.nom,
//     })));
//     saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'facultes.csv');
//     Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des facultés. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
//     this.authService.logAction('INFO', 'Export CSV des facultés');
//   }
//   exportPDF() {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       columns: [
//         { header: 'Nom', dataKey: 'nom' },
//       ],
//       body: this.rows,
//       styles: { fontSize: 10 },
//       headStyles: { fillColor: [41, 128, 185] },
//       margin: { top: 20 }
//     });
//     doc.save('carte.pdf');
//     Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export PDF des cartes. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
//     this.authService.logAction('INFO', 'Export PDF des cartes');
//   }
//   normalizeString(value: string): string {
//     return value
//       ?.toLowerCase()
//       .normalize("NFD")
//       .replace(/\p{Diacritic}/gu, "");
//   }

//   hasInterface(nom: string, permission: string): boolean {
//     if (!this.access) return false;

//     const nomNormalise = this.normalizeString(nom);
//     return this.access.some(
//       (i: { droits: string; }) =>
//         this.normalizeString(i.droits).includes(permission || "")
//     );
//   }
// }
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Acces } from '../../../configuration/securite-acces/acces.model';
import { Interface } from '../../../configuration/securite-acces/interface.model';
import { Inscription } from '../../inscription/inscription.model';
import { CarteService } from '../carte.service';
import { InscriptionService } from '../../inscription/inscription.service';
import { UtilisateurService } from '../../../configuration/utilisateurs/utilisateur.service';
import { SecuriteAccessService } from '../../../configuration/securite-acces/securite-access.service';
import { AuthService } from '../../../login/auth/auth.service';
import { EtudiantService } from '../../etudiant/etudiant.service';
// import { FormationService } from '../../../gestion-formations/formation/formation.service';
// import { AnneeScolaireService } from '../../../gestion-annees-scolaires/annee-scolaire/annee-scolaire.service';
import { FaculteService } from '../../../gestion-facultes/faculte/faculte.service';
// import { DepartementService } from '../../../gestion-departements/departement/departement.service';
import Swal from 'sweetalert2';
import { Carte } from '../carte.model';
import { Etudiant } from '../../etudiant/etudiant.model';
// import { Formation } from '../../../gestion-formations/formation/formation.model';
// import { AnneeScolaire } from '../../../gestion-annees-scolaires/annee-scolaire/annee-scolaire.model';
import { Faculte } from '../../../gestion-facultes/faculte/faculte.model';
// import { Departement } from '../../../gestion-departements/departement/departement.model';
import Papa from 'papaparse';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { AnneeScolaire } from '../../../configuration/annee-scolaire/annee-scolaire.model';
import { AnneeScolaireService } from '../../../configuration/annee-scolaire/annee-scolaire.service';
import { Departement } from '../../../gestion-facultes/departement/departement.model';
import { DepartementService } from '../../../gestion-facultes/departement/departement.service';
import { Formation } from '../../../gestion-facultes/formation/formation.model';
import { FormationService } from '../../../gestion-facultes/formation/formation.service';

@Component({
  selector: 'app-carte-list',
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './carte-list.html',
  styleUrl: './carte-list.scss'
})
export class CarteList implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) datatable!: DatatableComponent;

  columns: any[] = [];
  rows: any[] = [];
  tempRows: any[] = [];
  inscription: Inscription[] = [];
  etudiants: Etudiant[] = [];
  formations: Formation[] = [];
  annees: AnneeScolaire[] = [];
  facultes: Faculte[] = [];
  departements: Departement[] = [];
  user: any = null;
  access: Acces[] = [];
  interfaces: Interface[] = [];
  constructor(
    private service: CarteService,
    private cdRef: ChangeDetectorRef,
    private utilisateurService: UtilisateurService,
    private securiteAccessService: SecuriteAccessService,
    private authService: AuthService,
    private router: Router,
    private inscriptionService: InscriptionService,
    private etudiantService: EtudiantService,
    private formationService: FormationService,
    private anneeScolaireService: AnneeScolaireService,
    private faculteService: FaculteService,
    private departementService: DepartementService
  ) {

    // Initialize any necessary data or services here
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

    this.service.getAll().subscribe({
      next: data => {
        this.rows = data;
        this.tempRows = [...this.rows];
        this.cdRef.detectChanges();
        if (this.datatable) {
          this.datatable.recalculate();
        }
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur de chargement des cartes. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur de chargement des cartes: ${err.message || err}`);
      }
    });

    this.inscriptionService.getAll().subscribe({
      next: data => {
        this.inscription = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des informations: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors du chargement des informations: ${err.message || err}`);
      }
    });

    this.etudiantService.getAll().subscribe({
      next: data => {
        this.etudiants = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des étudiants: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors du chargement des étudiants: ${err.message || err}`);
      }
    });

    this.formationService.getAll().subscribe({
      next: data => {
        this.formations = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des formations: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors du chargement des formations: ${err.message || err}`);
      }
    });

    this.anneeScolaireService.getAll().subscribe({
      next: data => {
        this.annees = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des années scolaires: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors du chargement des années scolaires: ${err.message || err}`);
      }
    });

    this.faculteService.getAll().subscribe({
      next: data => {
        this.facultes = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des facultés: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors du chargement des facultés: ${err.message || err}`);
      }
    });

    this.departementService.getAll().subscribe({
      next: data => {
        this.departements = data;
        this.cdRef.detectChanges();
      },
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des départements: ' + (err.message || err), showConfirmButton: false, timer: 3000, timerProgressBar: true });
        this.authService.logAction('ERROR', `Erreur lors du chargement des départements: ${err.message || err}`);
      }
    });

    this.columns = [
      { prop: 'id', name: 'ID', width: 50 },
      { prop: 'numero_carte', name: 'Numéro de Carte', width: 150 },
      { prop: 'date_emission', name: 'Date d\'Émission' },
      { prop: 'date_expiration', name: 'Date d\'Expiration' },
      { prop: 'status', name: 'Statut', width: 100 },
      { prop: 'inscriptions_id', name: 'Inscription' },
      { name: 'Actions', cellTemplate: this.actionsTemplate, sortable: false, width: 150, canAutoResize: false, draggable: false, resizable: false }
    ];
    // Logic to fetch and display student cards
  }
  
  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.trim();

    if (!val) {
      // Si la recherche est vide, on remet toutes les lignes
      this.rows = [...this.tempRows];
      return;
    }

    // On filtre uniquement sur inscriptions_id
    this.rows = this.tempRows.filter(row =>
      String(row.inscriptions_id).includes(val)
    );
  }

  print(row: any) {
    this.service
  }


  edit(row: any) {
    this.router.navigate(['/scolarite/carte', row.id]);
  }
  delete(row: any) {
    Swal.fire({
      title: 'Supprimer cette carte ?',
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
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Carte ${row.numero_carte} supprimée`, showConfirmButton: false, timer: 3000 });
          this.authService.logAction('INFO', `Carte ${row.numero_carte} supprimée`);
        });
      }
    });
  }
  exportCSV() {
    const csv = Papa.unparse(this.rows.map(r => ({
      'ID': r.id,
      'Numéro de Carte': r.numero_carte,
      'Date d\'Émission': r.date_emission,
      'Date d\'Expiration': r.date_expiration,
      'Statut': r.status,
      'Inscription ID': r.inscriptions_id
    })));
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'cartes.csv');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export CSV des cartes. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export CSV des cartes');
  }
  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      columns: [
        { header: 'ID', dataKey: 'id' },
        { header: 'Numéro de Carte', dataKey: 'numero_carte' },
        { header: 'Date d\'Émission', dataKey: 'date_emission' },
        { header: 'Date d\'Expiration', dataKey: 'date_expiration' },
        { header: 'Statut', dataKey: 'status' },
        { header: 'Inscription', dataKey: 'inscriptions_id' }
      ],
      body: this.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });
    doc.save('cartes.pdf');
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export PDF des cartes. ', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', 'Export PDF des cartes');
  }

  // async exportCardsPDF(row:any) {
  //   if (!row) {
  //     Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Aucune carte à imprimer.', showConfirmButton: false, timer: 3000 });
  //     return;
  //   }

  //   const doc = new jsPDF('p', 'mm', 'a4');
  //   let yPosition = 20;

  //   for (let i = 0; i < this.rows.length; i++) {
  //     const row = this.rows[i];
  //     const inscription = row.inscription;
  //     if (!inscription) continue;

  //     const etudiant = this.etudiants.find(e => e.id === inscription.etudiant_id);
  //     if (!etudiant) continue;

  //     const formation = this.formations.find(f => f.id === inscription.formation_id);
  //     if (!formation) continue;

  //     const departement = this.departements.find(d => d.id === formation.departement_id);
  //     if (!departement) continue;

  //     const faculte = this.facultes.find(fa => fa.id === departement.faculte_id);
  //     if (!faculte) continue;

  //     const annee = this.annees.find(a => a.id === inscription.anneeScolaire_id);
  //     if (!annee) continue;

  //     // Assuming niveau is derived from formation or inscription, e.g., 'L1' or something; adjust as needed
  //     const niveau = formation.code || 'LICENCE'; // Placeholder, replace with actual logic

  //     const numeroCarteFormatted = row.numero_carte.padStart(6, '0'); // e.g., 004443-25

  //     const html = `
  // <div style="width: 85mm; height: 54mm; border: 1px solid #e0e0e0; position: relative; background: linear-gradient(135deg, #f8fdff 0%, #ffffff 50%, #f0f9ff 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px;">
  //   <!-- Header with gradient and university info -->
  //   <div style="position: absolute; top: 0; left: 0; width: 100%; height: 12mm; background: linear-gradient(to right, #1e7b34 0%, #228B22 30%, #FF8C00 70%, #ff7700 100%); display: flex; align-items: center; justify-content: space-between; padding: 0 3mm;">

  //     <!-- University Logo -->
  //     <div style="width: 9mm; height: 9mm; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #228B22; font-size: 7px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
  //       UAS
  //     </div>

  //     <!-- Republic and University Info -->
  //     <div style="text-align: center; color: white; font-size: 7px; font-weight: bold; flex-grow: 1; margin: 0 2mm;">
  //       <div style="font-size: 8px; margin-bottom: 1px;">RÉPUBLIQUE DU NIGER</div>
  //       <div>UNIVERSITÉ ANDRE SALIFOU DE ZINDER</div>
  //       <div style="font-size: 6px; font-weight: normal;">Service Central de Scolarité</div>
  //     </div>

  //     <!-- Republic Emblem -->
  //     <div style="width: 7mm; height: 7mm; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #ff7700; font-size: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
  //       RN
  //     </div>
  //   </div>

  //   <!-- Card Title with accent -->
  //   <div style="position: absolute; top: 12mm; left: 0; right: 0; text-align: center; background: linear-gradient(to right, #f0f8ff, #e6f3ff); padding: 1.5mm 0; border-bottom: 1px solid #d0e8ff;">
  //     <div style="font-size: 9px; font-weight: bold; color: #1e7b34; letter-spacing: 0.5px;">
  //       CARTE D'ÉTUDIANT N° : ${numeroCarteFormatted}
  //     </div>
  //   </div>

  //   <!-- Main Content Area -->
  //   <div style="position: absolute; top: 16mm; bottom: 8mm; left: 0; right: 0; display: flex; padding: 2mm;">

  //     <!-- Left: QR Codes and additional info -->
  //     <div style="width: 18mm; display: flex; flex-direction: column; align-items: center; margin-right: 2mm;">

  //       <!-- QR Code Placeholder - Main -->
  //       <div style="width: 13mm; height: 13mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 1mm; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
  //         <div style="text-align: center; color: #888; font-size: 6px;">
  //           QR CODE
  //         </div>
  //       </div>

  //       <!-- Academic Year -->
  //       <div style="margin-top: 2mm; text-align: center; font-size: 7px; font-weight: bold; color: #ff7700;">
  //         ${annee.nom}
  //       </div>
  //     </div>

  //     <!-- Center: Student Information -->
  //     <div style="flex-grow: 1; margin: 0 2mm; font-size: 7.5px;">
  //       <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
  //         <div style="font-weight: bold; color: #1e7b34; min-width: 20mm;">Nom :</div>
  //         <div style="font-weight: bold; border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.nom}</div>
  //       </div>

  //       <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
  //         <div style="font-weight: bold; color: #1e7b34; min-width: 20mm;">Prénom :</div>
  //         <div style="font-weight: bold; border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.prenom}</div>
  //       </div>

  //       <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
  //         <div style="font-weight: bold; color: #1e7b34; min-width: 20mm;">Né(e) le :</div>
  //         <div style="border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.dateNaissance}</div>
  //       </div>

  //       <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
  //         <div style="font-weight: bold; color: #1e7b34; min-width: 20mm;">A :</div>
  //         <div style="border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.lieuNaissance}</div>
  //       </div>

  //       <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
  //         <div style="font-weight: bold; color: #1e7b34; min-width: 20mm;">Fac/Inst/ED :</div>
  //         <div style="border-bottom: 1px dotted #ccc; flex-grow: 1;">${faculte.nom}</div>
  //       </div>

  //       <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
  //         <div style="font-weight: bold; color: #1e7b34; min-width: 20mm;">Niveau :</div>
  //         <div style="border-bottom: 1px dotted #ccc; flex-grow: 1; font-weight: bold; color: #ff7700;">${niveau}</div>
  //       </div>

  //       <!-- Contact Info -->
  //       <div style="display: flex; margin-top: 2mm; align-items: center; background: #f0f8ff; padding: 1mm; border-radius: 3px; border-left: 3px solid #228B22;">
  //         <div style="font-weight: bold; color: #1e7b34; margin-right: 2mm;">Contact :</div>
  //         <div style="font-weight: bold;">${etudiant.telephone}</div>
  //       </div>
  //     </div>

  //     <!-- Right: Student Photo -->
  //     <div style="width: 22mm; display: flex; flex-direction: column; align-items: center;">
  //       <div style="width: 20mm; height: 25mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 1mm; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
  //         <div style="text-align: center; color: #888; font-size: 7px;">
  //         <img src="${etudiant.photo}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
  //         </div>
  //       </div>

  //       <!-- Stamp and Signature Area -->
  //       <div style="width: 100%; display: flex; justify-content: space-between; margin-top: auto;">
  //         <div style="width: 8mm; height: 8mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 5px; color: #888; text-align: center;">
  //           SCEAU
  //         </div>
  //         <div style="width: 10mm; height: 5mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 5px; color: #888;">
  //           SIGNATURE
  //         </div>
  //       </div>
  //     </div>
  //   </div>

  //   <!-- Footer -->
  //   <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 6mm; background: linear-gradient(to right, #1e7b34, #228B22); color: white; font-size: 6px; display: flex; justify-content: space-between; align-items: center; padding: 0 3mm; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
  //     <div style="display: flex; align-items: center;">
  //       <span style="margin-right: 3mm;">🌐 www.uas.edu.ne</span>
  //       <span>📞 +227 20 73 20 20</span>
  //     </div>
  //     <div style="font-size: 5.5px; opacity: 0.9;">
  //       Carte valide pour l'année académique ${annee.nom}
  //     </div>
  //   </div>

  //   <!-- Security elements -->
  //   <div style="position: absolute; top: 40%; left: 0; right: 0; height: 1px; background: repeating-linear-gradient(90deg, transparent, transparent 2px, #228B22 2px, #228B22 4px); opacity: 0.3;"></div>
  //   <div style="position: absolute; top: 0; bottom: 0; left: 30%; width: 1px; background: repeating-linear-gradient(180deg, transparent, transparent 2px, #FF8C00 2px, #FF8C00 4px); opacity: 0.2;"></div>
  // </div>
  //     `;
  //     const element = document.createElement('div');
  //     element.innerHTML = html;
  //     element.style.position = 'absolute';
  //     element.style.left = '-9999px';
  //     document.body.appendChild(element);

  //     try {
  //       const canvas = await html2canvas(element, {
  //         scale: 2,
  //         backgroundColor: '#ffffff'
  //       });
  //       const imgData = canvas.toDataURL('image/png');
  //       const imgWidth = 85;
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       const pageHeight = doc.internal.pageSize.height - 40; // margins

  //       if (yPosition + imgHeight > pageHeight) {
  //         doc.addPage();
  //         yPosition = 20;
  //       }

  //       doc.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
  //       yPosition += imgHeight + 5;

  //     } catch (err) {
  //       console.error('Erreur lors de la génération de l\'image:', err);
  //       Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors de la génération PDF.', showConfirmButton: false, timer: 3000 });
  //       return;
  //     } finally {
  //       document.body.removeChild(element);
  //     }
  //   }

  //   doc.save('cartes_etudiants.pdf');
  //   Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export PDF des cartes étudiants réussi.', showConfirmButton: false, timer: 3000, timerProgressBar: true });
  //   this.authService.logAction('INFO', 'Export PDF des cartes étudiants');
  // }
  async exportCardsPDF(row: any) {
    if (!row) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Aucune carte à imprimer.', showConfirmButton: false, timer: 3000 });
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Changé en 'l' pour paysage
    // Suppression de yPosition : Une seule carte pleine page

    // Traitement direct de la row passée en paramètre (pas de boucle)
    const inscription = row.inscription;
    if (!inscription) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Inscription manquante pour cette carte.', showConfirmButton: false, timer: 3000 });
      return;
    }

    const etudiant = this.etudiants.find(e => e.id === inscription.etudiant_id);
    if (!etudiant) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Étudiant manquant pour cette carte.', showConfirmButton: false, timer: 3000 });
      return;
    }

    const formation = this.formations.find(f => f.id === inscription.formation_id);
    if (!formation) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Formation manquante pour cette carte.', showConfirmButton: false, timer: 3000 });
      return;
    }

    const departement = this.departements.find(d => d.id === formation.departement_id);
    if (!departement) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Département manquant pour cette carte.', showConfirmButton: false, timer: 3000 });
      return;
    }

    const faculte = this.facultes.find(fa => fa.id === departement.faculte_id);
    if (!faculte) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Faculté manquante pour cette carte.', showConfirmButton: false, timer: 3000 });
      return;
    }

    const annee = this.annees.find(a => a.id === inscription.anneeScolaire_id);
    if (!annee) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Année scolaire manquante pour cette carte.', showConfirmButton: false, timer: 3000 });
      return;
    }

    // Assuming niveau is derived from formation or inscription, e.g., 'L1' or something; adjust as needed
    const niveau = formation.code || 'LICENCE'; // Placeholder, replace with actual logic

    const numeroCarteFormatted = row.numero_carte.padStart(6, '0'); // e.g., 004443-25

    const html = `
<div style="width: 85mm; height: 54mm; border: 1px solid #e0e0e0; position: relative; background: linear-gradient(135deg, #f8fdff 0%, #ffffff 50%, #f0f9ff 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px;">
  <!-- Header with gradient and university info -->
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 12mm; background: linear-gradient(to right, #1e7b34 0%, #228B22 30%, #FF8C00 70%, #ff7700 100%); display: flex; align-items: center; justify-content: space-between; padding: 0 3mm;">
    
    <!-- University Logo -->
    <div style="width: 10mm; height: 10mm; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #228B22; font-size: 7px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      <img src="assets/img/logo.png" alt="Logo" style="width: 10mm; height: 10mm;border-radius: 50%; display: flex; align-items: center; ">
    </div>
    
    <!-- Republic and University Info -->
    <div style="text-align: center; color: white; font-size: 7px; font-weight: bold; flex-grow: 1; margin: 0 2mm;">
      <div style="font-size: 8px; margin-bottom: 1px;">RÉPUBLIQUE DU NIGER</div>
      <div>UNIVERSITÉ ANDRE SALIFOU DE ZINDER</div>
      <div style="font-size: 6px; font-weight: normal;">Service Central de Scolarité</div>
    </div>
  </div>
  
  <!-- Card Title with accent -->
  <div style="position: absolute; top: 12mm; left: 0; right: 0; text-align: center; background: linear-gradient(to right, #f0f8ff, #e6f3ff); padding: 1.5mm 0; border-bottom: 1px solid #d0e8ff;">
    <div style="font-size: 9px; font-weight: bold; color: #1e7b34; letter-spacing: 0.5px;">
      CARTE D'ÉTUDIANT N° : ${numeroCarteFormatted}
    </div>
  </div>
  
  <!-- Main Content Area -->
  <div style="position: absolute; top: 16mm; bottom: 8mm; left: 0; right: 0; display: flex; padding: 2mm;">
    
    <!-- Left: QR Codes and additional info -->
    <div style="width: 15mm; display: flex; flex-direction: column; align-items: center; margin-top: 1mm;">
      
      <!-- QR Code Placeholder - Main -->
      <div style="width: 13mm; height: 13mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 1mm; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="text-align: center; color: #888; font-size: 6px;">
          QR CODE
        </div>
      </div>
      
      <!-- Academic Year -->
      <div style="margin-top: 2mm; text-align: center; font-size: 7px; font-weight: bold; color: #ff7700;">
        ${annee.nom}
      </div>
    </div>
    
    <!-- Center: Student Information -->
    <div style="flex-grow: 1; margin: 1mm 2mm; font-size: 7.5px;">
      <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
        <div style="font-weight: bold; color: #1e7b34; width: 16mm;">Nom :</div>
        <div style="font-weight: bold; border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.nom}</div>
      </div>
      
      <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
        <div style="font-weight: bold; color: #1e7b34; width: 16mm;">Prénom :</div>
        <div style="font-weight: bold; border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.prenom}</div>
      </div>
      
      <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
        <div style="font-weight: bold; color: #1e7b34; width: 16mm;">Né(e) le :</div>
        <div style="border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.dateNaissance}</div>
      </div>
      
      <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
        <div style="font-weight: bold; color: #1e7b34; width: 16mm;">A :</div>
        <div style="border-bottom: 1px dotted #ccc; flex-grow: 1;">${etudiant.lieuNaissance}</div>
      </div>
      
      <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
        <div style="font-weight: bold; color: #1e7b34; width: 16mm;">Fac/Inst/ED :</div>
        <div style="border-bottom: 1px dotted #ccc; flex-grow: 1;">${faculte.nom}</div>
      </div>
      
      <div style="display: flex; margin-bottom: 1mm; align-items: flex-start;">
        <div style="font-weight: bold; color: #1e7b34; width: 16mm;">Niveau :</div>
        <div style="border-bottom: 1px dotted #ccc; flex-grow: 1; font-weight: bold; color: #ff7700;">${niveau}</div>
      </div>
      
      <!-- Contact Info -->
      <div style="display: flex; margin-top: 2mm; align-items: center; background: #f0f8ff; padding: 1mm; border-radius: 3px; border-left: 3px solid #228B22;">
        <div style="font-weight: bold; color: #1e7b34; margin-right: 2mm;">Contact :</div>
        <div style="font-weight: bold;">${etudiant.telephone}</div>
      </div>
    </div>
    
    <!-- Right: Student Photo -->
    <div style="width: 22mm; display: flex; flex-direction: column; align-items: center;margin-top:1mm;">
      <div style="width: 20mm; height: 25mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 1mm; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="text-align: center; color: #888; font-size: 7px;">
        <img src="${etudiant.photo}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>
      </div>
      
      <!-- Stamp and Signature Area -->
      <div style="width: 100%; display: flex; justify-content: space-between; margin-top: auto;">
        <div style="width: 8mm; height: 8mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 5px; color: #888; text-align: center;">
          SCEAU
        </div>
        <div style="width: 10mm; height: 5mm; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 5px; color: #888;">
          SIGNATURE
        </div>
      </div>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 6mm; background: linear-gradient(to right, #1e7b34, #228B22); color: white; font-size: 6px; display: flex; justify-content: space-between; align-items: center; padding: 0 3mm; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
    <div style="display: flex; align-items: center;">
      <span style="margin-right: 3mm;">🌐 www.uas.edu.ne</span>
      <span>📞 +227 20 73 20 20</span>
    </div>
    <div style="font-size: 5.5px; opacity: 0.9;">
      Carte valide pour l'année académique ${annee.nom}
    </div>
  </div>
  
  <!-- Security elements -->
  <div style="position: absolute; top: 40%; left: 0; right: 0; height: 1px; background: repeating-linear-gradient(90deg, transparent, transparent 2px, #228B22 2px, #228B22 4px); opacity: 0.3;"></div>
  <div style="position: absolute; top: 0; bottom: 0; left: 30%; width: 1px; background: repeating-linear-gradient(180deg, transparent, transparent 2px, #FF8C00 2px, #FF8C00 4px); opacity: 0.2;"></div>
</div>
  `;

    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      // Ajustements pour pleine page paysage A4
      const imgWidth = 292; // Pleine largeur A4 paysage (297mm) moins 5mm de marges totales
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Hauteur proportionnelle (~189mm)
      const marginLeft = 2.5; // Centrage horizontal (5mm total / 2)
      const marginTop = 5; // Petite marge haute pour sécurité

      doc.addImage(imgData, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);

    } catch (err) {
      console.error('Erreur lors de la génération de l\'image:', err);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors de la génération PDF.', showConfirmButton: false, timer: 3000 });
      return;
    } finally {
      document.body.removeChild(element);
    }

    // Nom du fichier personnalisé optionnel (ex. avec le nom de l'étudiant)
    const nomFichier = `carte_etudiant_${etudiant.nom}_${etudiant.prenom}.pdf`;
    doc.save(nomFichier);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Export PDF de la carte étudiant réussi.', showConfirmButton: false, timer: 3000, timerProgressBar: true });
    this.authService.logAction('INFO', `Export PDF de la carte étudiant pour ${etudiant.nom} ${etudiant.prenom}`);
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