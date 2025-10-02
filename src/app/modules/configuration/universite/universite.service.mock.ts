import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Universite } from './universite.model';

@Injectable({
  providedIn: 'root'
})
export class UniversiteServiceMock {
  private universite: (Universite & { createdAt?: Date; updatedAt?: Date; deletedAt?: Date }) | null = {
    id: 1,
    nom: 'Université Mock',
    logo: '',
    adresse: '123 Rue Principale',
    telephone: '0123456789',
    email: 'contact@mockuniv.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined
  };

  private universite$ = new BehaviorSubject<Universite | null>(this.universite);

  get(): Observable<Universite | null> {
    if (!this.universite || this.universite.deletedAt) return of(null);
    return this.universite$.asObservable();
  }

  update(data: Partial<Universite>, logoFile?: File): Observable<Universite> {
    const now = new Date();

    if (!this.universite) {
      this.universite = {
        id: 1,
        nom: '',
        logo: '',
        adresse: '',
        telephone: '',
        email: '',
        createdAt: now,
        updatedAt: now,
        deletedAt: undefined,
        ...data
      };
    } else {
      this.universite = {
        ...this.universite,
        ...data,
        updatedAt: now
      };
    }
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.universite!.logo = reader.result as string;
        this.universite$.next(this.universite!);
      };
      reader.readAsDataURL(logoFile);
    } else {
      this.universite$.next(this.universite);
    }
    return of(this.universite);
  }

  delete(): Observable<any> {
    if (this.universite) {
      this.universite.deletedAt = new Date();
      this.universite$.next(null);
    }
    return of({ success: true });
  }

  notifyLogoUpdate(fileName: string) {
    console.log('Logo mis à jour :', fileName);
  }
}
