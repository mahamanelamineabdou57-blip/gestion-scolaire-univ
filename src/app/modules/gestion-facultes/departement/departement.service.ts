import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Departement } from './departement.model';

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private baseUrl = `${environment.apiUrl}/departements`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Departement[]> {
    return this.http.get<Departement[]>(this.baseUrl);
  }

  getById(id: number): Observable<Departement> {
    return this.http.get<Departement>(`${this.baseUrl}/${id}`);
  }

  create(departement: Departement): Observable<Departement> {
    const now = new Date();
    departement.created_at = now;
    departement.updated_at = now;
    departement.deleted_at = null;
    return this.http.post<Departement>(this.baseUrl, departement);
  }

  update(id: number, departement: Departement): Observable<Departement> {
    departement.updated_at = new Date();
    return this.http.put<Departement>(`${this.baseUrl}/${id}`, departement);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}