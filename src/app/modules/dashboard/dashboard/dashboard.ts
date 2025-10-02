import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { DashboardServiceMock } from '../dashboard.service.mock';
import { DashboardStats } from '../dashboard.model';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  stats: DashboardStats[] = [];
  currentStats?: DashboardStats;
  selectedAnneeScolaire: string = new Date().getFullYear().toString();
  anneesDisponibles: string[] = [];

  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = { responsive: true, plugins: { legend: { position: 'top' } } };

  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions<'line'> = { responsive: true, plugins: { legend: { position: 'top' } } };

  pieChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  agePieChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  pieChartOptions: ChartOptions<'pie'> = { responsive: true };

  constructor(private dashboardService: DashboardServiceMock) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(stats => {
      this.stats = stats;

      // toutes les années disponibles
      this.anneesDisponibles = Array.from(new Set(
        stats.flatMap(s => s.etudiantsParFormation.map(f => f.anneeScolaire))
      ));

      if (this.anneesDisponibles.length) {
        this.selectedAnneeScolaire = this.anneesDisponibles[0];
      }

      this.updateCharts();
    });
  }

  onAnneeChange(annee: string) {
    this.selectedAnneeScolaire = annee;
    this.updateCharts();
  }

  getStatsForAnnee<T extends { anneeScolaire: string }>(arr?: T[]) {
    return arr?.filter(e => e.anneeScolaire === this.selectedAnneeScolaire) || [];
  }

  updateCharts() {
    // récupérer l'objet stats correspondant à l'année sélectionnée
    this.currentStats = this.stats.find(s => s.etudiantsParFormation.some(f => f.anneeScolaire === this.selectedAnneeScolaire));
    if (!this.currentStats) return;

    const stats = this.currentStats;

    // --- Bar chart : taux de réussite par semestre ---
    const tauxSemestre = this.getStatsForAnnee(stats.tauxReussiteParSemestre);
    this.barChartData = {
      labels: tauxSemestre.map(s => `Semestre ${s.semestre}`),
      datasets: [
        { data: tauxSemestre.map(s => s.reussite), label: 'Réussite', backgroundColor: '#4CAF50' },
        { data: tauxSemestre.map(s => s.echec), label: 'Échec', backgroundColor: '#F44336' }
      ]
    };

    // --- Line chart : évolution inscriptions ---
    const evo = this.getStatsForAnnee(stats.evolutionInscriptions);
    this.lineChartData = {
      labels: evo.map(e => e.annee),
      datasets: [
        { data: evo.map(e => e.count), label: 'Inscriptions', borderColor: '#2196F3', fill: false, tension: 0.3 }
      ]
    };

    // --- Pie chart sexe ---
    const sexe = this.getStatsForAnnee(stats.repartitionSexe);
    this.pieChartData = {
      labels: sexe.map(s => s.sexe),
      datasets: [{ data: sexe.map(s => s.count), backgroundColor: ['#42A5F5', '#FF6384'] }]
    };

    // --- Pie chart âge ---
    const age = this.getStatsForAnnee(stats.repartitionAge);
    this.agePieChartData = {
      labels: age.map(a => a.tranche),
      datasets: [{ data: age.map(a => a.count), backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4BC0C0'] }]
    };
  }
}
