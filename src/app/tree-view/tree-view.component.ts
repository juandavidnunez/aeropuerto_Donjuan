import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FlightService } from 'app/services/flight.service';
import { TreeService } from '../services/tree.service';

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
  selectedNode: any = null;

  // Variables para modal
showModal: boolean = false;
modalTitle: string = '';
formData: any = {
  code: '',
  origin: '',
  destination: '',
  base_price: 0,
  passengers: 0,
  promotion: 0,
  priority: 1
};

    constructor(
    private treeService: TreeService, private flightService: FlightService) { }

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

  // Seleccionar nodo al hacer clic
selectNode(node: any) {
  this.selectedNode = node;
}

// Abrir modal para insertar
openInsertModal() {
  this.modalTitle = 'Insertar nuevo vuelo';
  this.formData = {
    code: '',
    origin: '',
    destination: '',
    base_price: 0,
    passengers: 0,
    promotion: 0,
    priority: 1
  };
  this.showModal = true;
}

openEditModal() {
  if (!this.selectedNode) return;
  this.modalTitle = 'Editar vuelo: ' + this.selectedNode.code;
  this.formData = { ...this.selectedNode };
  this.showModal = true;
}

// Cerrar modal
closeModal() {
  this.showModal = false;
}



// Insertar vuelo
  insertFlight() {
    this.flightService.insert(this.formData).subscribe({
      next: () => {
        this.statusMessage = '✅ Vuelo insertado correctamente';
        this.closeModal();
        this.refreshTrees();
      },
      error: (err) => {
        console.error(err);
        this.statusMessage = '❌ Error al insertar vuelo';
      }
    });
  } 

submitForm() {
  if (this.modalTitle.includes('Insertar')) {
    this.insertFlight();
  } else {
    this.updateFlight();
  }
}

      updateFlight() {
    this.flightService.update(this.selectedNode.code, this.formData).subscribe({
      next: () => {
        this.statusMessage = '✅ Vuelo actualizado correctamente';
        this.closeModal();
        this.selectedNode = null;
        this.refreshTrees();
      },
      error: (err) => {
        console.error(err);
        this.statusMessage = '❌ Error al actualizar vuelo';
      }
    });
  }

  // Eliminar nodo
  deleteNode() {
    if (!this.selectedNode) return;
    if (confirm(`¿Eliminar vuelo ${this.selectedNode.code}?`)) {
      this.flightService.delete(this.selectedNode.code).subscribe({
        next: () => {
          this.statusMessage = '✅ Vuelo eliminado correctamente';
          this.selectedNode = null;
          this.refreshTrees();
        },
        error: (err) => {
          console.error(err);
          this.statusMessage = '❌ Error al eliminar vuelo';
        }
      });
    }
  }
}