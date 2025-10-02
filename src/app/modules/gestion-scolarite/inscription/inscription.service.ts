import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
 
  // 🔥 Ajout : récupérer les inscriptions par formation et semestre
  getByFormationAndSemestre(formationId: number, semestre: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(
      `${this.baseUrl}?formationId=${formationId}&semestre=${semestre}`
    );
  }
}
