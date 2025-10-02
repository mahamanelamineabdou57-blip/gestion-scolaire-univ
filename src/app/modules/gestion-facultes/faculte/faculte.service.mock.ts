import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Faculte } from './faculte.model';

@Injectable({
  providedIn: 'root'
})
export class FaculteServiceMock {
  private facultes: Faculte[] = [
    { id: 1, nom: 'Faculté des Sciences', logo: '', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    { id: 2, nom: 'Faculté de Lettres', logo: '', createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  ];

  private facultes$ = new BehaviorSubject<Faculte[]>(this.facultes.filter(f => !f.deletedAt));

  getAll(): Observable<Faculte[]> {
    return this.facultes$.asObservable();
  }

  getById(id: number): Observable<Faculte | undefined> {
    const faculte = this.facultes.find(f => f.id === id && !f.deletedAt);
    return of(faculte);
  }

  create(faculte: Faculte, logoFile?: File): Observable<Faculte> {
    faculte.id = this.facultes.length > 0 ? Math.max(...this.facultes.map(f => f.id)) + 1 : 1;
    const now = new Date();
    faculte.createdAt = now;
    faculte.updatedAt = now;
    faculte.deletedAt = null;

    if (logoFile) {
      this.convertFileToBase64(logoFile, base64 => {
        faculte.logo = base64;
        this.pushFaculte(faculte);
      });
    } else {
      this.pushFaculte(faculte);
    }

    return of(faculte);
  }

  update(id: number, data: Partial<Faculte>, logoFile?: File): Observable<Faculte> {
    const index = this.facultes.findIndex(f => f.id === id && !f.deletedAt);
    if (index >= 0) {
      const now = new Date();
      const updatedFaculte = {
        ...this.facultes[index],
        ...data,
        updatedAt: now
      };

      if (logoFile) {
        this.convertFileToBase64(logoFile, base64 => {
          updatedFaculte.logo = base64;
          this.facultes[index] = updatedFaculte;
          this.refresh();
        });
      } else {
        this.facultes[index] = updatedFaculte;
        this.refresh();
      }

      return of(updatedFaculte);
    }
    return of(data as Faculte);
  }

  delete(id: number): Observable<void> {
    const index = this.facultes.findIndex(f => f.id === id && !f.deletedAt);
    if (index >= 0) {
      this.facultes[index].deletedAt = new Date();
      this.facultes[index].updatedAt = new Date();
      this.refresh();
    }
    return of();
  }

  private pushFaculte(faculte: Faculte) {
    this.facultes.push(faculte);
    this.refresh();
  }

  private refresh() {
    this.facultes$.next(this.facultes.filter(f => !f.deletedAt));
  }

  private convertFileToBase64(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  }

  notifyLogoUpdate(fileName: string) {
    console.log('Logo faculté mis à jour :', fileName);
  }
}
