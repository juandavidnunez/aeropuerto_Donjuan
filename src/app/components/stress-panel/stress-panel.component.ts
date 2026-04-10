// src/app/components/stress-panel/stress-panel.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { StressService } from '../../services/stress.service';

@Component({
  selector: 'app-stress-panel',
  templateUrl: './stress-panel.component.html',
  styleUrls: ['./stress-panel.component.css']
})
export class StressPanelComponent {

  isStressMode: boolean = false;

  // Notifica al padre que debe refrescar el árbol
  @Output() treeChanged = new EventEmitter<void>();

  constructor(private stressService: StressService) {}

  activateStressMode(): void {
    this.stressService.activateStressMode().subscribe({
      next: () => {
        this.isStressMode = true;
        this.treeChanged.emit(); // refrescar para mostrar árbol sin balanceo
      },
      error: (err) => console.error('Error activando modo estrés:', err)
    });
  }

  deactivateStressMode(): void {
    this.stressService.rebalance().subscribe({
      next: () => {
        this.isStressMode = false;
        this.treeChanged.emit(); // refrescar para mostrar árbol rebalanceado
      },
      error: (err) => console.error('Error en rebalanceo:', err)
    });
  }

  rebalanceGlobal(): void {
    if (!confirm('¿Ejecutar Rebalanceo Global? Esto corregirá todos los nodos desbalanceados.')) return;
    this.stressService.rebalance().subscribe({
      next: () => {
        this.isStressMode = false;
        this.treeChanged.emit(); // refrescar para mostrar árbol rebalanceado
      },
      error: (err) => console.error('Error en rebalanceo:', err)
    });
  }
}