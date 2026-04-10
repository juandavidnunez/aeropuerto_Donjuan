import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metrics-panel',
  templateUrl: './metrics-panel.component.html',
  styleUrls: ['./metrics-panel.component.css']
})
export class MetricsPanelComponent {
  @Input() metrics: any = null;
  showMetricsModal: boolean = false;

  openMetricsModal() {
    this.showMetricsModal = true;
  }

  closeMetricsModal() {
    this.showMetricsModal = false;
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