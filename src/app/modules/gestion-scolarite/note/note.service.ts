import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Note } from './note.model';

@Injectable({ 
  providedIn: 'root'
})
export class NoteService {
  private baseUrl = `${environment.apiUrl}/notes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Note[]> {
    return this.http.get<Note[]>(this.baseUrl);
  }

  getById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/${id}`);
  }

  create(note: Note): Observable<Note> {
    const now = new Date();
    note.createdAt = now;
    note.updatedAt = now;
    note.deletedAt = null;
    return this.http.post<Note>(this.baseUrl, note);
  }

  update(id: number, note: Note): Observable<Note> {
    note.updatedAt = new Date();
    return this.http.put<Note>(`${this.baseUrl}/${id}`, note);
  }

  delete(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, { deletedAt: new Date(), updatedAt: new Date() });
  }

  // 🔥 Récupérer les notes d’un ECUE
  getByECUE(ecueId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.baseUrl}?ecueId=${ecueId}`);
  }

  // 🔥 Batch save
  batchSave(notes: Note[]): Observable<Note[]> {
    const now = new Date();
    const formattedNotes = notes.map(n => ({
      ...n,
      updatedAt: now,
      createdAt: n.id ? n.createdAt : now,
      deletedAt: n.deletedAt ?? null
    }));
    return this.http.post<Note[]>(`${this.baseUrl}/batch`, formattedNotes);
  }
}
