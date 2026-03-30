import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadJson(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.API}/tree/load-json`, formData);
  }

  getStats(): Observable<any> {
  
    return this.http.get(`${this.API}/tree/stats`);
  }
}