import { RouterModule } from '@angular/router';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { saveAs } from 'file-saver';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { LogsService } from '../logs.service';
import { Logs as LogsModel } from '../logs.model';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [RouterModule, CommonModule, NgxDatatableModule],
  templateUrl: './logs.html',
  styleUrls: ['./logs.css']
})
export class Logs implements OnInit, AfterViewInit {

  @ViewChild('datatable') datatable!: DatatableComponent;

  columns = [
    { name: 'Date', prop: 'date' },
    { name: 'Niveau', prop: 'niveau' },
    { name: 'Utilisateur', prop: 'utilisateur' },
    { name: 'Message', prop: 'message' }
  ];

  rows: any[] = [];
  tempRows: LogsModel[] = [];

  constructor(private cdRef: ChangeDetectorRef, private logsService: LogsService) { }

  ngOnInit() {
    this.loadLogs();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.datatable?.recalculate();
  }

  loadLogs() {
    this.logsService.getLogs().subscribe({
      next: (logs) => {
        this.rows = logs;
        this.tempRows = [...logs];
        this.cdRef.detectChanges();
        this.datatable?.recalculate();
      },
      error: (err) => Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Erreur lors du chargement des logs : ' + err, showConfirmButton: false, timer: 3000, timerProgressBar: true }),
    });
  }

  updateFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.rows = this.tempRows.filter(row =>
      Object.values(row).some(field =>
        String(field).toLowerCase().includes(val)
      )
    );
  }

  exportCSV() {
    const csv = Papa.unparse(this.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'logs.csv');
  }

  exportPDF() {
    const doc = new jsPDF();

    const tableData = this.rows.map(log => ({
      date: log.date,
      niveau: log.niveau,
      utilisateur: log.utilisateur,
      message: log.message
    }));

    autoTable(doc, {
      columns: [
        { header: 'Date', dataKey: 'date' },
        { header: 'Niveau', dataKey: 'niveau' },
        { header: 'Utilisateur', dataKey: 'utilisateur' },
        { header: 'Message', dataKey: 'message' }
      ],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 }
    });

    doc.save('logs.pdf');
  }
}
