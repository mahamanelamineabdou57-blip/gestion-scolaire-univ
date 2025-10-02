import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Note } from './note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteServiceMock {
  private notes: Note[] = [
    { id: 1, inscriptionId: 1, ecueId: 1, noteSessionNormale: 14, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 2, inscriptionId: 1, ecueId: 2, noteSessionNormale: 10, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 3, inscriptionId: 2, ecueId: 1, noteSessionNormale: 8, noteRattrapage: 14, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 4, inscriptionId: 2, ecueId: 2, noteSessionNormale: 19, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
  ];

  getAll(): Observable<Note[]> {
    return of(this.notes.filter(n => !n.deletedAt));
  }

  getById(id: number): Observable<Note | undefined> {
    return of(this.notes.find(n => n.id === id && !n.deletedAt));
  }

  create(note: Note): Observable<Note> {
    const now = new Date();
    note.id = this.notes.length ? Math.max(...this.notes.map(n => n.id)) + 1 : 1;
    note.createdAt = now;
    note.updatedAt = now;
    note.deletedAt = null;
    this.notes.push(note);
    return of(note);
  }

  update(id: number, note: Partial<Note>): Observable<Note | undefined> {
    const index = this.notes.findIndex(n => n.id === id && !n.deletedAt);
    if (index >= 0) {
      this.notes[index] = { ...this.notes[index], ...note, updatedAt: new Date() };
      return of(this.notes[index]);
    }
    return of(undefined);
  }

  delete(id: number): Observable<void> {
    const index = this.notes.findIndex(n => n.id === id && !n.deletedAt);
    if (index >= 0) {
      this.notes[index].deletedAt = new Date();
      this.notes[index].updatedAt = new Date();
    }
    return of();
  }

  // 🔥 Récupérer toutes les notes liées à un ECUE
  getByECUE(ecueId: number): Observable<Note[]> {
    return of(this.notes.filter(n => n.ecueId === ecueId && !n.deletedAt));
  }

  // 🔥 Batch save (renommé pour matcher le composant)
  batchSave(notes: Note[]): Observable<Note[]> {
    const now = new Date();
    notes.forEach(n => {
      if (n.id) {
        this.update(n.id, { ...n, updatedAt: now });
      } else {
        this.create({ ...n, createdAt: now, updatedAt: now });
      }
    });
    return of(notes);
  }
}
