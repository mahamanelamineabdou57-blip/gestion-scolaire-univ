import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paiement } from './paiement.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private baseUrl = `${environment.apiUrl}/fees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.baseUrl);
  }

  getById(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.baseUrl}/${id}`);
  }

  create(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(this.baseUrl, paiement);
  }

  update(id: number, paiement: Paiement): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.baseUrl}/${id}`, paiement);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
