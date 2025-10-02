import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecuriteAccessServiceMock } from '../securite-access.service.mock';
import { Utilisateur } from '../../utilisateurs/utilisateur.model';
import { Interface } from '../interface.model';
import { Acces } from '../acces.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../../login/auth/auth.service';
import { SecuriteAccessService } from '../securite-access.service';
import { UtilisateurService } from '../../utilisateurs/utilisateur.service';

@Component({
  selector: 'app-securite-acces-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule, RouterModule],
  templateUrl: './securite-acces-form.html',
  styleUrls: ['./securite-acces-form.scss']
})
export class SecuriteAccesForm implements OnInit {
  @ViewChild('lectureTemplate', { static: true }) lectureTemplate!: TemplateRef<any>;
  @ViewChild('ecritureTemplate', { static: true }) ecritureTemplate!: TemplateRef<any>;
  @ViewChild('suppressionTemplate', { static: true }) suppressionTemplate!: TemplateRef<any>;

  utilisateur!: Utilisateur;
  droits: Record<number, { lecture: boolean; ecriture: boolean; suppression: boolean }> = {};
  readOnly = true;

  columns: any[] = [];

      access: Acces[] = [];
    user: any = null;
      interfaces: Interface[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SecuriteAccessService,
    private authService: AuthService,
            private utilisateurService: UtilisateurService,
    private cdRef: ChangeDetectorRef
  ) {}


  ngOnInit() {
     try {
              this.utilisateurService.getById(this.authService.user()).subscribe({
                next: (utilisateur) => {
                  this.user = utilisateur;
                  this.service.getInterfaces().subscribe(data => {
                    this.interfaces = data;
                    this.cdRef.detectChanges();
                  });
                  this.service.getAccesByUtilisateur(this.user.id).subscribe(perms => {
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
    const userId = +this.route.snapshot.paramMap.get('id')!;
    this.service.getUtilisateurs().subscribe(users => {
      this.utilisateur = users.find(u => u.id === userId)!;
    });

    this.service.getInterfaces().subscribe(intfs => {
      this.interfaces = intfs;
      intfs.forEach(i => this.droits[i.id] = { lecture: false, ecriture: false, suppression: false });

      this.service.getAccesByUtilisateur(userId).subscribe(acc => {
        acc.forEach(a => {
          const d = this.droits[a.inteface_id];
          if (!d) return;
          const droitsArray = a.droits.split('_');
          d.lecture = droitsArray.includes('lecture');
          d.ecriture = droitsArray.includes('ecriture');
          d.suppression = droitsArray.includes('suppression');
        });
        this.cdRef.detectChanges();
      });
    });

    this.columns = [
      { name: 'Interface', prop: 'nom' },
      { name: 'Lecture', cellTemplate: this.lectureTemplate, sortable: false, width: 100 },
      { name: 'Ecriture / Modification', cellTemplate: this.ecritureTemplate, sortable: false, width: 150 },
      { name: 'Suppression', cellTemplate: this.suppressionTemplate, sortable: false, width: 120 }
    ];
  }

  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.interfaces = this.interfaces.filter(i => i.nom.toLowerCase().includes(val));
  }

  toggleReadOnly() {
    this.readOnly = !this.readOnly;
  }

  cancel() {
    this.router.navigate(['/configuration/securite-access']);
  }

  save() {
    const accesToSave: Acces[] = Object.entries(this.droits).map(
      ([inteface_id, d]) => ({
        utilisateur_id: this.utilisateur.id,
        inteface_id: +inteface_id,
        droits: [
          d.lecture ? 'lecture' : null,
          d.ecriture ? 'ecriture' : null,
          d.suppression ? 'suppression' : null
        ].filter(Boolean).join('_')
      })
    );

    this.service.saveAcces(this.utilisateur.id, accesToSave).subscribe({
      next: () => {
        Swal.fire({toast: true,position: 'top-end',icon: 'success',title: 'Droits sauvegardés', showConfirmButton: false,timer: 3000,timerProgressBar: true});
        this.authService.logAction('INFO',`Droits sauvegardés`);
        this.router.navigate(['/configuration/securite-access']);
      },
      error: (err) => {
        Swal.fire({toast: true,position: 'top-end',icon: 'error',title: 'Erreur sauvegarde droits: ' + (err.message || err), showConfirmButton: false,timer: 3000,timerProgressBar: true});
        this.authService.logAction('ERROR',`Erreur lors de l'enregistrement année: ${err.message || err}`);
      }
    });

  }

  getBadgeClasse(): string {
    return this.readOnly ? 'bg-secondary' : 'bg-success';
  }

  getBadgeTexte(): string {
    return this.readOnly ? 'Visualisation' : 'Modification active';
  }

  getLink(): string {
    return 'Gestion des droits';
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
