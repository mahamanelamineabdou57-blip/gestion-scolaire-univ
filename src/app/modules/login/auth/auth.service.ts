// src/app/services/auth/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LogsService } from '../../../logs/logs.service';
import Swal from 'sweetalert2';
import { Logs } from '../../../logs/logs.model';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  public user = signal<any>(null); // signal pour stocker l'utilisateur courant

  constructor(private http: HttpClient, private logsService: LogsService, private router: Router) { }

  login(matricule: string, password: string) {
    localStorage.setItem('token', 'token');
    this.user.set(1);
  }

  // login(matricule: string, password: string): Observable<any> {
  //   return this.http.post<{ token: string, user: any }>(`${this.baseUrl}/login`, { matricule, password })
  //     .pipe(
  //       tap(res => {
  //         localStorage.setItem('token', res.token);
  //         this.user.set(res.user);
  //       })
  //     );
  // }

  logout(): void {
    localStorage.removeItem('token');
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logAction(niveau: 'INFO' | 'WARN' | 'ERROR' | string, message: string) {
    const log: Logs = { utilisateur: "", niveau, message };
    this.logsService.addLog(log).subscribe({
      error: err => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'lors de l\'enregistrement du log. ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true });
      }
    });
  }
}
