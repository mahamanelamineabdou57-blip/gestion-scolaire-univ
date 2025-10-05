import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Inscription } from './inscription.model';

@Injectable({
  providedIn: 'root' 
})
export class InscriptionService {
  private baseUrl = `${environment.apiUrl}/inscriptions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.baseUrl);
  }

  getById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.baseUrl}/${id}`);
  }

  create(inscription: Inscription): Observable<Inscription> {
    inscription.createdAt = new Date();
    inscription.updatedAt = new Date();
    inscription.deletedAt = null;
    return this.http.post<Inscription>(this.baseUrl, inscription);
  }

  update(id: number, inscription: Inscription): Observable<Inscription> {
    inscription.updatedAt = new Date();
    return this.http.put<Inscription>(`${this.baseUrl}/${id}`, inscription);
  }

  delete(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, { deletedAt: new Date() });
  }
 
  // // 🔥 Ajout : récupérer les inscriptions par formation et semestre
  // getByFormationAndSemestre(formationId: number, semestre: number): Observable<Inscription[]> {
  //   return this.http.get<Inscription[]>(
  //     `${this.baseUrl}?formationId=${formationId}&semestre=${semestre}`
  //   );
  // }
  getByFormationAnneeSemestre(formationId: number, anneeId: number, semestre: number): Observable<any[]> {
    let params = new HttpParams()
      .set('formationId', formationId.toString())
      .set('anneeId', anneeId.toString())
      .set('semestre', semestre.toString());

    return this.http.get<any[]>(`${this.baseUrl}/by-formation-annee-semestre`, { params });
  }

  // Alternative si votre backend n'a pas cette route : utilisez getByFormationAndSemestre et filtrez côté client sur l'année
  getByFormationAndSemestre(formationId: number, semestre: number): Observable<any[]> {
    // Implémentez si nécessaire, mais préférez le filtrage serveur
    let params = new HttpParams()
      .set('formationId', formationId.toString())
      .set('semestre', semestre.toString());
    return this.http.get<any[]>(`${this.baseUrl}/by-formation-semestre`, { params });
  }
  getByEtudiantId(etudiantId: number) {
  return this.http.get<Inscription>(`${this.baseUrl}/etudiant/${etudiantId}`);
}
}
