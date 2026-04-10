import { Component, OnInit } from '@angular/core';
import { MetricsService } from '../../services/metrics.service';

@Component({
  selector: 'app-metrics-panel',
  templateUrl: './metrics-panel.component.html',
  styleUrls: ['./metrics-panel.component.css']
})
export class MetricsPanelComponent implements OnInit {
  metrics: any = null;
  showMetricsModal: boolean = false;

  constructor(private metricsService: MetricsService) { }

  ngOnInit(): void {
    this.loadMetrics();
  }

  openMetricsModal() {
    this.showMetricsModal = true;
    this.loadMetrics();
  }

  closeMetricsModal() {
    this.showMetricsModal = false;
  }

  loadMetrics() {
    this.metricsService.getMetrics().subscribe({
      next: (response) => {
        this.metrics = response;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        // Note: statusMessage is handled in parent component
      }
    });
  }

  getRotationEntries(): any[] {
    if (!this.metrics?.rotations) return [];
    return Object.entries(this.metrics.rotations).map(([type, count]) => ({
      type: type.toUpperCase(),
      count: count as number
    }));
  }

  getTotalRotations(): number {
    if (!this.metrics?.rotations) return 0;
    const rotations = this.metrics.rotations as { [key: string]: number };
    return Object.values(rotations).reduce((sum, count) => sum + count, 0);
  }
}