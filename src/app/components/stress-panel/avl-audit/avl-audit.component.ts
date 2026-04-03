// TAREA 7 - Sistema de Auditoría AVL
// Archivo: frontend/src/app/components/stress-panel/avl-audit/avl-audit.component.ts

import { Component } from '@angular/core';
import { StressService, AvlAuditResult } from '../../../services/stress.service';

@Component({
  selector: 'app-avl-audit',
  templateUrl: './avl-audit.component.html',
  styleUrls: ['./avl-audit.component.scss']
})
export class AvlAuditComponent {

  auditResult: AvlAuditResult | null = null;
  isLoading = false;
  errorMsg  = '';

  constructor(private stressService: StressService) {}

  runAudit(): void {
    this.isLoading   = true;
    this.errorMsg    = '';
    this.auditResult = null;

    this.stressService.auditAvlProperty().subscribe({
      next: (result) => {
        this.auditResult = result;
        this.isLoading   = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMsg = 'La auditoría AVL solo está disponible en modo estrés.';
        } else {
          this.errorMsg = `Error al auditar: ${err.message ?? 'desconocido'}`;
        }
      }
    });
  }

  /** Devuelve true si el balance esperado viola la propiedad AVL (para el color del badge) */
  isViolation(expectedBalance: number): boolean {
    return Math.abs(expectedBalance) > 1;
  }
}
