import { Component } from '@angular/core';
import { StressService } from '../../services/stress.service';

@Component({
  selector: 'app-stress-panel',
  templateUrl: './stress-panel.component.html',
  styleUrls: ['./stress-panel.component.css']
})
export class StressPanelComponent {
  isStressMode: boolean = false; // Variable booleana que indica si el modo estrés está activo

  constructor(private stressService: StressService) { }

  // Métodos para activar/desactivar el modo estrés
  activateStressMode() {
    this.stressService.activateStressMode().subscribe({
      next: () => {
        this.isStressMode = true;
      },
      error: (err) => {
        console.error('Error activando modo estrés:', err);
      }
    });
  }

  deactivateStressMode() {
    this.stressService.rebalance().subscribe({
      next: () => {
        this.isStressMode = false;
      },
      error: (err) => {
        console.error('Error en rebalanceo:', err);
      }
    });
  }

  rebalanceGlobal() {
    if (confirm('¿Ejecutar Rebalanceo Global? Esto detectará y corregirá todos los nodos desbalanceados.')) {
      this.stressService.rebalance().subscribe({
        next: (response) => {
          this.isStressMode = false;
          // Aquí podrías mostrar un mensaje o algo, pero por ahora solo desactivar
        },
        error: (err) => {
          console.error('Error en rebalanceo:', err);
        }
      });
    }
  }
}