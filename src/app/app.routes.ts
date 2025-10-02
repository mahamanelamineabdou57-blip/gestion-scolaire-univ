// import { Routes } from '@angular/router';
// import { Login } from './modules/login/login/login';
// import { MainLayout } from './layouts/main-layout/main-layout';
// import { AuthGuard } from './modules/login/auth/auth.guard';
// import { Logs } from './logs/logs/logs';
// import { UniversiteForm } from './modules/configuration/universite/universite-form/universite-form';
// import { RolesForm } from './modules/configuration/roles/roles-form/roles-form';
// import { RolesList } from './modules/configuration/roles/roles-list/roles-list';
// import { UtilisateursList } from './modules/configuration/utilisateurs/utilisateurs-list/utilisateurs-list';
// import { UtilisateursForm } from './modules/configuration/utilisateurs/utilisateurs-form/utilisateurs-form';
// import { AnneeScolaireList } from './modules/configuration/annee-scolaire/annee-scolaire-list/annee-scolaire-list';
// import { AnneeScolaireForm } from './modules/configuration/annee-scolaire/annee-scolaire-form/annee-scolaire-form';
// import { SecuriteAccesList } from './modules/configuration/securite-acces/securite-acces-list/securite-acces-list';
// import { SecuriteAccesForm } from './modules/configuration/securite-acces/securite-acces-form/securite-acces-form';
// import { FaculteList } from './modules/gestion-facultes/faculte/faculte-list/faculte-list';
// import { FaculteForm } from './modules/gestion-facultes/faculte/faculte-form/faculte-form';
// import { DepartementList } from './modules/gestion-facultes/departement/departement-list/departement-list';
// import { DepartementForm } from './modules/gestion-facultes/departement/departement-form/departement-form';
// import { FormationList } from './modules/gestion-facultes/formation/formation-list/formation-list';
// import { FormationForm } from './modules/gestion-facultes/formation/formation-form/formation-form';
// import { UEForm } from './modules/gestion-facultes/ue/ue-form/ue-form';
// import { UEList } from './modules/gestion-facultes/ue/ue-list/ue-list';
// import { ECUEList } from './modules/gestion-facultes/ecue/ecue-list/ecue-list';
// import { ECUEForm } from './modules/gestion-facultes/ecue/ecue-form/ecue-form';
// import { EtudiantList } from './modules/gestion-scolarite/etudiant/etudiant-list/etudiant-list';
// import { EtudiantForm } from './modules/gestion-scolarite/etudiant/etudiant-form/etudiant-form';
// import { InscriptionList } from './modules/gestion-scolarite/inscription/inscription-list/inscription-list';
// import { InscriptionForm } from './modules/gestion-scolarite/inscription/inscription-form/inscription-form';
// import { NoteList } from './modules/gestion-scolarite/note/note-list/note-list';
// import { Bulletin } from './modules/gestion-scolarite/bulletin-releve/bulletin/bulletin';
// import { Releve } from './modules/gestion-scolarite/bulletin-releve/releve/releve';
// import { PaiementList } from './modules/gestion-paiement/paiement/paiement-list/paiement-list';
// import { PaiementForm } from './modules/gestion-paiement/paiement/paiement-form/paiement-form';
// import { Dashboard } from './modules/dashboard/dashboard/dashboard';
// import { AuthService } from './modules/login/auth/auth.service';

// export const routes: Routes = [
//   { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//   { path: 'login', component: Login },
//   {
//     path: '',
//     component: MainLayout,
//     canActivate: [AuthGuard],
//     children: [
//       { path: 'dashboard', component: Dashboard },
//       { path: 'configuration/universite', component: UniversiteForm },
//       { path: 'logs', component: Logs },
//       { path: 'configuration/roles', component: RolesList },
//       { path: 'configuration/roles/create', component: RolesForm },
//       { path: 'configuration/roles/:id', component: RolesForm },
//       { path: 'configuration/utilisateurs', component: UtilisateursList },
//       { path: 'configuration/utilisateurs/create', component: UtilisateursForm },
//       { path: 'configuration/utilisateurs/:id', component: UtilisateursForm },
//       { path: 'configuration/annee-scolaire', component: AnneeScolaireList },
//       { path: 'configuration/annee-scolaire/create', component: AnneeScolaireForm },
//       { path: 'configuration/annee-scolaire/:id', component: AnneeScolaireForm },
//       { path: 'configuration/securite-access', component: SecuriteAccesList },
//       { path: 'configuration/securite-access/:id', component: SecuriteAccesForm },
//       { path: 'facultes/faculte', component: FaculteList },
//       { path: 'facultes/faculte/create', component: FaculteForm },
//       { path: 'facultes/faculte/:id', component: FaculteForm },
//       { path: 'facultes/departement', component: DepartementList },
//       { path: 'facultes/departement/create', component: DepartementForm },
//       { path: 'facultes/departement/:id', component: DepartementForm },
//       { path: 'facultes/formation', component: FormationList },
//       { path: 'facultes/formation/create', component: FormationForm },
//       { path: 'facultes/formation/:id', component: FormationForm },
//       { path: 'facultes/ue', component: UEList },
//       { path: 'facultes/ue/create', component: UEForm },
//       { path: 'facultes/ue/:id', component: UEForm },
//       { path: 'facultes/ecue', component: ECUEList },
//       { path: 'facultes/ecue/create', component: ECUEForm },
//       { path: 'facultes/ecue/:id', component: ECUEForm },
//       { path: 'scolarite/etudiant', component: EtudiantList },
//       { path: 'scolarite/etudiant/create', component: EtudiantForm },
//       { path: 'scolarite/etudiant/:id', component: EtudiantForm },
//       { path: 'scolarite/inscription', component: InscriptionList },
//       { path: 'scolarite/inscription/create', component: InscriptionForm },
//       { path: 'scolarite/inscription/:id', component: InscriptionForm },
//       { path: 'scolarite/note', component: NoteList },
//       { path: 'scolarite/bulletin/:id', component: Bulletin },
//       { path: 'scolarite/releve', component: Releve },
//       { path: 'paiements', component: PaiementList },
//       { path: 'paiements/inscription', component: PaiementList, data: { type: 'inscription' } },
//       { path: 'paiements/formation', component: PaiementList, data: { type: 'formation' } },
//       { path: 'paiements/create', component: PaiementForm },
//       { path: 'paiements/create/:type', component: PaiementForm },
//       { path: 'paiements/:id', component: PaiementForm }
//     ]
//   },
//   { path: 'logout', component: Login },
//   { path: '**', redirectTo: 'login' }
// ];

import { Routes } from '@angular/router';
import { Login } from './modules/login/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthGuard } from './modules/login/auth/auth.guard';
import { Logs } from './logs/logs/logs';
import { UniversiteForm } from './modules/configuration/universite/universite-form/universite-form';
import { RolesForm } from './modules/configuration/roles/roles-form/roles-form';
import { RolesList } from './modules/configuration/roles/roles-list/roles-list';
import { UtilisateursList } from './modules/configuration/utilisateurs/utilisateurs-list/utilisateurs-list';
import { UtilisateursForm } from './modules/configuration/utilisateurs/utilisateurs-form/utilisateurs-form';
import { AnneeScolaireList } from './modules/configuration/annee-scolaire/annee-scolaire-list/annee-scolaire-list';
import { AnneeScolaireForm } from './modules/configuration/annee-scolaire/annee-scolaire-form/annee-scolaire-form';
import { SecuriteAccesList } from './modules/configuration/securite-acces/securite-acces-list/securite-acces-list';
import { SecuriteAccesForm } from './modules/configuration/securite-acces/securite-acces-form/securite-acces-form';
import { FaculteList } from './modules/gestion-facultes/faculte/faculte-list/faculte-list';
import { FaculteForm } from './modules/gestion-facultes/faculte/faculte-form/faculte-form';
import { DepartementList } from './modules/gestion-facultes/departement/departement-list/departement-list';
import { DepartementForm } from './modules/gestion-facultes/departement/departement-form/departement-form';
import { FormationList } from './modules/gestion-facultes/formation/formation-list/formation-list';
import { FormationForm } from './modules/gestion-facultes/formation/formation-form/formation-form';
import { UEForm } from './modules/gestion-facultes/ue/ue-form/ue-form';
import { UEList } from './modules/gestion-facultes/ue/ue-list/ue-list';
import { ECUEList } from './modules/gestion-facultes/ecue/ecue-list/ecue-list';
import { ECUEForm } from './modules/gestion-facultes/ecue/ecue-form/ecue-form';
import { EtudiantList } from './modules/gestion-scolarite/etudiant/etudiant-list/etudiant-list';
import { EtudiantForm } from './modules/gestion-scolarite/etudiant/etudiant-form/etudiant-form';
import { InscriptionList } from './modules/gestion-scolarite/inscription/inscription-list/inscription-list';
import { InscriptionForm } from './modules/gestion-scolarite/inscription/inscription-form/inscription-form';
import { NoteList } from './modules/gestion-scolarite/note/note-list/note-list';
import { Bulletin } from './modules/gestion-scolarite/bulletin-releve/bulletin/bulletin';
import { Releve } from './modules/gestion-scolarite/bulletin-releve/releve/releve';
import { PaiementList } from './modules/gestion-paiement/paiement/paiement-list/paiement-list';
import { PaiementForm } from './modules/gestion-paiement/paiement/paiement-form/paiement-form';
import { Dashboard } from './modules/dashboard/dashboard/dashboard';
import { AuthService } from './modules/login/auth/auth.service';
import { CarteList } from './modules/gestion-scolarite/carte/carte-list/carte-list';
import { CarteForm } from './modules/gestion-scolarite/carte/carte-form/carte-form';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'configuration/universite', component: UniversiteForm },
      { path: 'logs', component: Logs },
      { path: 'configuration/roles', component: RolesList },
      { path: 'configuration/roles/create', component: RolesForm },
      { path: 'configuration/roles/:id', component: RolesForm },
      { path: 'configuration/utilisateurs', component: UtilisateursList },
      { path: 'configuration/utilisateurs/create', component: UtilisateursForm },
      { path: 'configuration/utilisateurs/:id', component: UtilisateursForm },
      { path: 'configuration/annee-scolaire', component: AnneeScolaireList },
      { path: 'configuration/annee-scolaire/create', component: AnneeScolaireForm },
      { path: 'configuration/annee-scolaire/:id', component: AnneeScolaireForm },
      { path: 'configuration/securite-access', component: SecuriteAccesList },
      { path: 'configuration/securite-access/:id', component: SecuriteAccesForm },
      { path: 'facultes/faculte', component: FaculteList },
      { path: 'facultes/faculte/create', component: FaculteForm },
      { path: 'facultes/faculte/:id', component: FaculteForm },
      { path: 'facultes/departement', component: DepartementList },
      { path: 'facultes/departement/create', component: DepartementForm },
      { path: 'facultes/departement/:id', component: DepartementForm },
      { path: 'facultes/formation', component: FormationList },
      { path: 'facultes/formation/create', component: FormationForm },
      { path: 'facultes/formation/:id', component: FormationForm },
      { path: 'facultes/ue', component: UEList },
      { path: 'facultes/ue/create', component: UEForm },
      { path: 'facultes/ue/:id', component: UEForm },
      { path: 'facultes/ecue', component: ECUEList },
      { path: 'facultes/ecue/create', component: ECUEForm },
      { path: 'facultes/ecue/:id', component: ECUEForm },
      { path: 'scolarite/etudiant', component: EtudiantList },
      { path: 'scolarite/etudiant/create', component: EtudiantForm },
      { path: 'scolarite/etudiant/:id', component: EtudiantForm },
      { path: 'scolarite/inscription', component: InscriptionList },
      { path: 'scolarite/inscription/create', component: InscriptionForm },
      { path: 'scolarite/inscription/:id', component: InscriptionForm },
      { path: 'scolarite/note', component: NoteList },
      { path: 'scolarite/bulletin/:id', component: Bulletin },
      { path: 'scolarite/releve', component: Releve },
      { path: 'scolarite/carte', component: CarteList },
      { path: 'scolarite/carte/create', component: CarteForm },
      { path: 'scolarite/carte/:id', component: CarteForm },
      { path: 'paiements', component: PaiementList },
      { path: 'paiements/inscription', component: PaiementList, data: { type: 'inscription' } },
      { path: 'paiements/formation', component: PaiementList, data: { type: 'formation' } },
      { path: 'paiements/create', component: PaiementForm },
      { path: 'paiements/create/:type', component: PaiementForm },
      { path: 'paiements/:id', component: PaiementForm }
    ]
  },
  { path: 'logout', component: Login },
  { path: '**', redirectTo: 'login' }
];