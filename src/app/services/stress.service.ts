import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface InconsistentNode {
  code: string;
  stored_height: number;
  expected_height: number;
  stored_balance: number;
  expected_balance: number;
}

export interface AvlAuditResult {
  valid: boolean;
  inconsistent_nodes: InconsistentNode[];
  total_nodes_checked: number;
}

@Injectable({
  providedIn: 'root'
})
export class StressService {
  private readonly apiUrl = `${environment.apiUrl}/stress`;

  constructor(private http: HttpClient) { }

  activateStressMode(): Observable<any> {
    return this.http.post(`${this.apiUrl}/activate`, {});
  }

  rebalance(): Observable<any> {
    return this.http.post(`${this.apiUrl}/rebalance`, {});
  }

  /** TAREA 7: llama GET /api/stress/audit */
  auditAvlProperty(): Observable<AvlAuditResult> {
    return this.http.get<AvlAuditResult>(`${this.apiUrl}/audit`);
  }
}
