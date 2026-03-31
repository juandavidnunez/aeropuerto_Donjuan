import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private readonly apiUrl = `${environment.apiUrl}/tree`;

  constructor(private http: HttpClient) { }

  uploadJson(file: File, mode: 'topology' | 'insertion' = 'insertion'): Observable<any> {
    return from(file.text()).pipe(
      switchMap((content: string) => {
        const parsedData = JSON.parse(content);
        const detectedMode = String(parsedData?.mode || mode).toLowerCase();
        const finalMode: 'topology' | 'insertion' =
          detectedMode === 'topology' || detectedMode === 'insertion'
            ? detectedMode
            : mode;

        return this.loadTree(finalMode, parsedData);
      })
    );
  }

  loadTree(mode: 'topology' | 'insertion', data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/load`, { mode, data });
  }

  getTree(treeType: 'avl' | 'bst' = 'avl'): Observable<any> {
    const params = new HttpParams().set('tree_type', treeType);
    return this.http.get(`${this.apiUrl}/export`, { params });
  }

  getStats(treeType: 'avl' | 'bst' = 'avl'): Observable<any> {
    const params = new HttpParams().set('tree_type', treeType);
    return this.http.get(`${this.apiUrl}/stats`, { params });
  }

  undoLastAction(): Observable<any> {
    return this.http.post(`${this.apiUrl}/undo`, {});
  }
}
