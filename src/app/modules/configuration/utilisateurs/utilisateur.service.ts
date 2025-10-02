import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from './utilisateur.model';
import { Role } from '../roles/role.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private baseUrl = `${environment.apiUrl}/utilisateurs`;
  private rolesUrl = `${environment.apiUrl}/roles`;
 
  constructor(private http: HttpClient) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }

  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.baseUrl}/${id}`);
  }

  create(utilisateur: Utilisateur): Observable<Utilisateur> {
    const payload = { ...utilisateur, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    return this.http.post<Utilisateur>(this.baseUrl, payload);
  }

  update(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    const payload = { ...utilisateur, updatedAt: new Date() };
    return this.http.put<Utilisateur>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, { deletedAt: new Date() });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl);
  }
}
