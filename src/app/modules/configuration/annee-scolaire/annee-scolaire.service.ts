import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnneeScolaire } from './annee-scolaire.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnneeScolaireService {
  private baseUrl = `${environment.apiUrl}/academic-years`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AnneeScolaire[]> {
    return this.http.get<AnneeScolaire[]>(this.baseUrl);
  }

  getById(id: number): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(`${this.baseUrl}/${id}`);
  }

  create(annee: AnneeScolaire): Observable<AnneeScolaire> {
    const payload = { ...annee, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    return this.http.post<AnneeScolaire>(this.baseUrl, payload);
  }

  update(id: number, annee: AnneeScolaire): Observable<AnneeScolaire> {
    const payload = { ...annee, updatedAt: new Date() };
    return this.http.put<AnneeScolaire>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, { deletedAt: new Date() });
  }
}
