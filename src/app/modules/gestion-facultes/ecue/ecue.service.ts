import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ECUE } from './ecue.model';

@Injectable({
  providedIn: 'root'
})
export class ECUEService {
  private baseUrl = `${environment.apiUrl}/modules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ECUE[]> {
    return this.http.get<ECUE[]>(this.baseUrl);
  }

  getById(id: number): Observable<ECUE> {
    return this.http.get<ECUE>(`${this.baseUrl}/${id}`);
  }

  create(ecue: ECUE): Observable<ECUE> {
    return this.http.post<ECUE>(this.baseUrl, ecue);
  }

  update(id: number, ecue: ECUE): Observable<ECUE> {
    return this.http.put<ECUE>(`${this.baseUrl}/${id}`, ecue);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
