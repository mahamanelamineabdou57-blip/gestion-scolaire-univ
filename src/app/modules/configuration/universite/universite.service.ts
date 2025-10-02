import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Universite } from './universite.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UniversiteService {
  private logoUrlSubject = new BehaviorSubject<string | null>(null);
  logoUrl$ = this.logoUrlSubject.asObservable();
  private baseUrl = `${environment.apiUrl}/universite`;

  constructor(private http: HttpClient) {}

  get(): Observable<Universite> {
    return this.http.get<Universite>(this.baseUrl);
  }

  update(data: Partial<Universite>, logoFile?: File): Observable<Universite> {
    const formData = new FormData();
    const now = new Date();

    for (const key in data) {
      if (data[key as keyof Universite] !== undefined && key !== 'logo') {
        formData.append(key, data[key as keyof Universite] as string);
      }
    }

    formData.append('updatedAt', now.toISOString());

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    return this.http.post<Universite>(this.baseUrl, formData);
  }

  delete(): Observable<any> {
    return this.http.patch(`${this.baseUrl}`, { deletedAt: new Date() });
  }

  notifyLogoUpdate(fileName: string) {
    const fullUrl = `${environment.apiUrl}/uploads/${fileName}?t=${Date.now()}`;
    this.logoUrlSubject.next(fullUrl);
  }
}
