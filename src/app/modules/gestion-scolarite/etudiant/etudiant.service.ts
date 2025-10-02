import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Etudiant } from './etudiant.model';

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private baseUrl = `${environment.apiUrl}/etudiants`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(this.baseUrl);
  }

  getById(id: number): Observable<Etudiant> {
    return this.http.get<Etudiant>(`${this.baseUrl}/${id}`);
  }

  create(etudiant: Etudiant): Observable<Etudiant> {
    return this.http.post<Etudiant>(this.baseUrl, etudiant);
  }

  update(id: number, etudiant: Etudiant): Observable<Etudiant> {
    etudiant.updatedAt = new Date();
    return this.http.put<Etudiant>(`${this.baseUrl}/${id}`, etudiant);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
