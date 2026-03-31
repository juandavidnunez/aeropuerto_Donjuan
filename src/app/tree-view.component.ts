import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { TreeService } from './services/tree.service';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {
  avlTree: any = { root: null };
  bstTree: any = { root: null };
  avlStats: any = null;
  bstStats: any = null;
  selectedMode: 'topology' | 'insertion' = 'insertion';
  selectedFileName = '';
  statusMessage = 'Selecciona un archivo JSON para cargar el árbol.';
  isLoading = false;

  constructor(private treeService: TreeService) { }

  ngOnInit(): void {
    this.refreshTrees();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    this.selectedFileName = file.name;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedData = JSON.parse(String(reader.result));
        this.selectedMode = this.detectMode(parsedData);
        this.loadTree(parsedData);
      } catch (error) {
        console.error('Error al leer el JSON:', error);
        this.statusMessage = 'El archivo seleccionado no es un JSON válido.';
      }
    };

    reader.readAsText(file);
  }

  loadTree(data: any): void {
    this.isLoading = true;
    this.statusMessage = 'Cargando árbol desde el archivo seleccionado...';

    this.treeService.loadTree(this.selectedMode, data).subscribe({
      next: (response) => {
        this.avlTree = response.avl || { root: null };
        this.bstTree = response.bst || { root: null };
        this.avlStats = response.avl_stats || null;
        this.bstStats = response.bst_stats || null;
        this.statusMessage = response.message || 'Árbol cargado correctamente.';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el árbol:', error);
        this.statusMessage = error?.error?.detail || 'No se pudo cargar el árbol.';
        this.isLoading = false;
      }
    });
  }

  detectMode(data: any): 'topology' | 'insertion' {
    const explicitMode = String(data?.mode || data?.modo || '').toLowerCase();
    if (explicitMode === 'topology' || explicitMode === 'insertion') {
      return explicitMode;
    }

    if (Array.isArray(data?.flights) || Array.isArray(data?.vuelos)) {
      return 'insertion';
    }

    if (data && typeof data === 'object') {
      const looksLikeTree = ['left', 'right', 'izquierdo', 'derecho', 'codigo', 'code']
        .some((key) => key in data);
      if (looksLikeTree) {
        return 'topology';
      }
    }

    return this.selectedMode;
  }

  refreshTrees(): void {
    this.isLoading = true;

    forkJoin({
      avlTree: this.treeService.getTree('avl'),
      bstTree: this.treeService.getTree('bst'),
      avlStats: this.treeService.getStats('avl'),
      bstStats: this.treeService.getStats('bst')
    }).subscribe({
      next: ({ avlTree, bstTree, avlStats, bstStats }) => {
        this.avlTree = avlTree || { root: null };
        this.bstTree = bstTree || { root: null };
        this.avlStats = avlStats || null;
        this.bstStats = bstStats || null;

        if (this.avlTree?.root) {
          this.statusMessage = 'Árbol cargado y listo para visualizar.';
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el árbol:', error);
        this.statusMessage = 'Aún no hay datos cargados. Selecciona un archivo JSON.';
        this.isLoading = false;
      }
    });
  }

  shouldShowBst(): boolean {
    return this.selectedMode === 'insertion' || !!this.bstTree?.root;
  }
}