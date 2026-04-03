import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private readonly apiUrl = `${environment.apiUrl}/queue`;

  constructor(private http: HttpClient) { }

  getQueue(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  enqueue(flight: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enqueue`, { flight });
  }

  processQueue(): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, {});
  }

  processStep(): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-step`, {});
  }

  clearQueue(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`);
  }
}