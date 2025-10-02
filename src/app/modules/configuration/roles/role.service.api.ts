import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role } from './role.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceApi {
  private apiUrl = environment.apiUrl + '/roles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(role: Role): Observable<Role> {
    const payload = { ...role, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
    return this.http.post<Role>(this.apiUrl, payload);
  }

  update(role: Role): Observable<Role> {
    const payload = { ...role, updatedAt: new Date() };
    return this.http.put<Role>(`${this.apiUrl}/${role.id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { deletedAt: new Date() });
  }
}
