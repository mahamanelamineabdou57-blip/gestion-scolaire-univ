import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Faculte } from './faculte.model';

@Injectable({
  providedIn: 'root'
})
export class FaculteService {
  private logoUrlSubject = new BehaviorSubject<string | null>(null);
  logoUrl$ = this.logoUrlSubject.asObservable(); 
  private baseUrl = `${environment.apiUrl}/facultes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Faculte[]> {
    return this.http.get<Faculte[]>(this.baseUrl); 
  }

  getById(id: number): Observable<Faculte> {
    return this.http.get<Faculte>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Faculte>, logoFile?: File): Observable<Faculte> {
    const formData = new FormData();
    const now = new Date();

    for (const key in data) {
      if (data[key as keyof Faculte] !== undefined && key !== 'logo') {
        formData.append(key, data[key as keyof Faculte] as string);
      }
    }

    formData.append('createdAt', now.toISOString());
    formData.append('updatedAt', now.toISOString());

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return this.http.post<Faculte>(this.baseUrl, formData);
  }

  update(id: number, data: Partial<Faculte>, logoFile?: File): Observable<Faculte> {
    const formData = new FormData();
    const now = new Date();

    for (const key in data) {
      if (data[key as keyof Faculte] !== undefined && key !== 'logo') {
        formData.append(key, data[key as keyof Faculte] as string);
      }
    }

    formData.append('updatedAt', now.toISOString());

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return this.http.put<Faculte>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  notifyLogoUpdate(fileName: string) {
    const fullUrl = `${environment.apiUrl}/uploads/${fileName}?t=${Date.now()}`;
    this.logoUrlSubject.next(fullUrl);
  }
}
