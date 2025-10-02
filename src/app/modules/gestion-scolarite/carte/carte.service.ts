import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Carte } from './carte.model';

@Injectable({
  providedIn: 'root'
})
export class CarteService {
  private baseUrl = `${environment.apiUrl}/cartes-etudiants`;

  constructor(private http: HttpClient) { }

  getAll() : Observable<Carte[]> {
    return this.http.get<Carte[]>(this.baseUrl);
  }

  getById(id: number): Observable<Carte> {
    return this.http.get<Carte>(`${this.baseUrl}/${id}`);
  }

   create(data: Partial<Carte>): Observable<Carte> {
    // Assurer que 'status' est défini
    const payload = {
      ...data,
      status: data.status || 'active', // valeur par défaut
    };
    return this.http.post<Carte>(this.baseUrl, payload);
  }

  update(id: number, data: Partial<Carte>): Observable<Carte> {
    return this.http.put<Carte>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<Carte> {
    return this.http.delete<Carte>(`${this.baseUrl}/${id}`);
  }
}
