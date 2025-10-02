import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../utilisateurs/utilisateur.model';
import { Interface } from './interface.model';
import { Acces } from './acces.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SecuriteAccessService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.baseUrl}/utilisateurs`);
  }

  getInterfaces(): Observable<Interface[]> {
    return this.http.get<Interface[]>(`${this.baseUrl}/interfaces`);
  }

  getAccesByUtilisateur(userId: number): Observable<Acces[]> {
    return this.http.get<Acces[]>(`${this.baseUrl}/utilisateur/${userId}/acces`);
  }

  saveAcces(userId: number, acces: Acces[]): Observable<any> {
    const now = new Date();
    const payload = acces.map(a => ({
      ...a,
      utilisateurId: userId,
      createdAt: now,
      updatedAt: now
    }));
    return this.http.post(`${this.baseUrl}/utilisateur/${userId}/acces`, payload);
  }
}
