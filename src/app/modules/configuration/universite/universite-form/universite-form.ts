import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Universite } from '../universite.model';
import { UniversiteServiceMock } from '../universite.service.mock';

@Component({
  selector: 'app-universite-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './universite-form.html',
  styleUrls: ['./universite-form.scss']
})
export class UniversiteForm implements OnInit {
  universite: Universite = { id: 1, nom: '', logo: '', adresse: '', telephone: '', email: '' };
  logoPreview: string | ArrayBuffer | null = null;
  readOnly = false;
  isEditMode = false;

  constructor(private universiteService: UniversiteServiceMock) {}

  ngOnInit(): void {
    this.universiteService.get().subscribe(u => {
      if (u) {
        this.universite = u;
        this.logoPreview = u.logo || null;
        this.isEditMode = true;
        this.readOnly = true;
      } else {
        this.universite = { id: 1, nom: '', logo: '', adresse: '', telephone: '', email: '' };
        this.isEditMode = false;
        this.readOnly = false;
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
        this.universite.logo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  update(form: NgForm): void {
    if (!form.valid) return;

    this.universiteService.update(this.universite).subscribe(u => {
      this.universite = u;
    });
  }

  getLink(): string {
    if (!this.isEditMode) return 'Enregistrement';
    return this.readOnly ? 'Visualisation' : 'Modification';
  }

  getBadgeClasse(): string {
    return this.readOnly ? 'bg-secondary' : 'bg-success';
  }

  getBadgeTexte(): string {
    return this.readOnly ? 'Visualisation' : 'Modification active';
  }

  toggleReadOnly(): void {
    this.readOnly = !this.readOnly;
  }

}
