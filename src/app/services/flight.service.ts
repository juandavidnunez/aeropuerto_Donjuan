// src/app/services/flight.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private apiUrl = `${environment.apiUrl}/flights`;  // http://127.0.0.1:8000/api/flights

  constructor(private http: HttpClient) {}

  // Insertar vuelo
  insert(flight: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, flight);
  }

  // Actualizar vuelo
  update(code: string, flight: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${code}`, flight);
  }

  // Eliminar vuelo
  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }

  // Cancelar rama (vuelo + descendientes)
  cancel(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}/cancel`);
  }

  // Eliminar el menos rentable
  deleteLeastProfitable(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/least-profitable`);
  }
}