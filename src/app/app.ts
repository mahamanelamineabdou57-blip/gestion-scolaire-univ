import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']   // correction ici
})
export class App {
  // Signal pour la réactivité Angular 20
  protected readonly title = signal('gestion-scolaire-univ');
}
