import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Logs } from './logs.model';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private apiUrl = `${environment.apiUrl}/logs`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les logs
  getLogs(): Observable<Logs[]> {
    return this.http.get<Logs[]>(this.apiUrl);
  }

  // Ajouter un log
  addLog(log: Logs): Observable<Logs> {
    return this.http.post<Logs>(this.apiUrl, log);
  }
}