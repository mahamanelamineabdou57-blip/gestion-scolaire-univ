import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UE } from './ue.model';

@Injectable({
  providedIn: 'root'
})
export class UEService {
  private baseUrl = `${environment.apiUrl}/unite-enseignements`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<UE[]> {
    return this.http.get<UE[]>(this.baseUrl);
  }

  getById(id: number): Observable<UE> {
    return this.http.get<UE>(`${this.baseUrl}/${id}`);
  }

  create(ue: UE): Observable<UE> {
    return this.http.post<UE>(this.baseUrl, ue);
  }

  update(id: number, ue: UE): Observable<UE> {
    return this.http.put<UE>(`${this.baseUrl}/${id}`, ue);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
