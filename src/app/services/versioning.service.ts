import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersioningService {
  private readonly apiUrl = `${environment.apiUrl}/versions`;

  constructor(private http: HttpClient) { }

  listVersions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  saveVersion(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, { name });
  }

  restoreVersion(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restore/${name}`, {});
  }

  deleteVersion(name: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${name}`);
  }
}