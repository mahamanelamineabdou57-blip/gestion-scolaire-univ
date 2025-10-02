import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Formation } from './formation.model';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private baseUrl = `${environment.apiUrl}/formations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.baseUrl);
  }

  getById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.baseUrl}/${id}`);
  }

  create(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.baseUrl, formation);
  }

  update(id: number, formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.baseUrl}/${id}`, formation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
