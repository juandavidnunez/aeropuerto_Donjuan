import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FlightService } from 'app/services/flight.service';
import { TreeService } from '../services/tree.service';
import { VersioningService } from '../services/versioning.service';
import { QueueService } from '../services/queue.service';


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

  // Versioning
  versions: string[] = [];
  newVersionName: string = '';
  showVersionModal: boolean = false;

  // Queue
  queueItems: any[] = [];
  isProcessing: boolean = false;
  processingLog: any[] = [];
  showQueueModal: boolean = false;
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
    private treeService: TreeService, private flightService: FlightService, private versioningService: VersioningService, private queueService: QueueService) { }

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
        this.statusMessage = this.getFriendlyErrorMessage(error, 'No se pudo cargar el árbol.');
        this.isLoading = false;
      }
    });
  }

  private getFriendlyErrorMessage(error: any, fallbackMessage: string): string {
    if (error?.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que Uvicorn esté corriendo en http://127.0.0.1:8000 y abre el frontend desde localhost:4200 o 127.0.0.1:4200.';
    }

    const detail = error?.error?.detail;
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }

    return fallbackMessage;
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
        this.statusMessage = this.getFriendlyErrorMessage(
          error,
          'Aún no hay datos cargados. Selecciona un archivo JSON.'
        );
        this.isLoading = false;
      }
    });
  }

  shouldShowBst(): boolean {
    return this.selectedMode === 'insertion' || !!this.bstTree?.root;
  }

  // Seleccionar nodo al hacer clic
selectNode(node: any) {
  console.log('🖱️ SELECT NODE EJECUTADO - Nodo:', node?.code);
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
  console.log('🖱️ OPEN EDIT MODAL EJECUTADO - Nodo:', this.selectedNode);
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

  console.log('📝 SUBMIT FORM - formData:', this.formData);
  if (this.modalTitle.includes('Insertar')) {
    this.insertFlight();
  } else {
    this.updateFlight();
  }
}

      updateFlight() {

          console.log('📝 Actualizando vuelo:', this.selectedNode.code);
  console.log('📦 Nuevos datosNuevos datos:', this.formData);
    this.flightService.update(this.selectedNode.code, this.formData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor', response)
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

  cancelFlight(): void {
    if (!this.selectedNode) return;

    const selectedCode = this.selectedNode.code;
    if (confirm(`¿Cancelar el vuelo ${selectedCode} y eliminar todo su subárbol?`)) {
      this.flightService.cancel(selectedCode).subscribe({
        next: (response) => {
          const removedNodes = response?.nodes_removed ?? 0;
          this.statusMessage = `✅ Cancelación masiva realizada. Se eliminaron ${removedNodes} nodo(s) desde ${selectedCode}.`;
          this.selectedNode = null;
          this.refreshTrees();
        },
        error: (err) => {
          console.error(err);
          this.statusMessage = this.getFriendlyErrorMessage(err, '❌ Error al cancelar el vuelo.');
        }
      });
    }
  }

  undoLastAction(): void {
    this.treeService.undoLastAction().subscribe({
      next: () => {
        this.statusMessage = '↩️ Última acción deshecha correctamente.';
        this.selectedNode = null;
        this.refreshTrees();
      },
      error: (err) => {
        console.error(err);
        this.statusMessage = this.getFriendlyErrorMessage(err, 'No hay acciones para deshacer.');
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
          this.statusMessage = this.getFriendlyErrorMessage(err, '❌ Error al eliminar vuelo.');
        }
      });
    }
  }

  // Versioning methods
  openVersionModal() {
    this.newVersionName = '';
    this.showVersionModal = true;
    this.loadVersions();
  }

  closeVersionModal() {
    this.showVersionModal = false;
  }

  loadVersions() {
    this.versioningService.listVersions().subscribe({
      next: (response) => {
        this.versions = response.versions || [];
      },
      error: (error) => {
        console.error('Error loading versions:', error);
      }
    });
  }

  saveVersion() {
    if (!this.newVersionName.trim()) {
      alert('Por favor ingresa un nombre para la versión.');
      return;
    }
    this.versioningService.saveVersion(this.newVersionName.trim()).subscribe({
      next: (response) => {
        this.statusMessage = `✅ Versión "${this.newVersionName}" guardada correctamente.`;
        this.closeVersionModal();
        this.refreshTrees();
        // Recargar versiones para mostrar la nueva
        this.loadVersions();
      },
      error: (error) => {
        console.error('Error saving version:', error);
        this.statusMessage = '❌ Error al guardar la versión.';
      }
    });
  }

  restoreVersion(versionName: string) {
    if (confirm(`¿Restaurar la versión "${versionName}"? Esto reemplazará el árbol actual.`)) {
      this.versioningService.restoreVersion(versionName).subscribe({
        next: () => {
          this.statusMessage = `✅ Versión "${versionName}" restaurada correctamente.`;
          this.refreshTrees();
        },
        error: (error) => {
          console.error('Error restoring version:', error);
          this.statusMessage = '❌ Error al restaurar la versión.';
        }
      });
    }
  }

  deleteVersion(versionName: string) {
    if (confirm(`¿Eliminar permanentemente la versión "${versionName}"? Esta acción no se puede deshacer.`)) {
      this.versioningService.deleteVersion(versionName).subscribe({
        next: () => {
          this.statusMessage = `✅ Versión "${versionName}" eliminada correctamente.`;
          this.loadVersions(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error deleting version:', error);
          this.statusMessage = '❌ Error al eliminar la versión.';
        }
      });
    }
  }

  // Queue methods
  openQueueModal() {
    this.showQueueModal = true;
    this.loadQueue();
  }

  closeQueueModal() {
    this.showQueueModal = false;
  }

  loadQueue() {
    this.queueService.getQueue().subscribe({
      next: (response) => {
        this.queueItems = response.items || [];
      },
      error: (error) => {
        console.error('Error loading queue:', error);
      }
    });
  }

  enqueueFlight() {
    // Use the same form data from the modal
    if (!this.formData.code || !this.formData.origin || !this.formData.destination) {
      alert('Por favor complete los campos obligatorios: código, origen y destino.');
      return;
    }

    this.queueService.enqueue(this.formData).subscribe({
      next: (response) => {
        this.statusMessage = `✅ Vuelo "${this.formData.code}" agregado a la cola. Cola: ${response.queue_length} elementos.`;
        this.loadQueue();
        // Reset form but keep modal open for more additions
        this.formData = {
          code: '',
          origin: '',
          destination: '',
          base_price: 0,
          passengers: 0,
          promotion: 0,
          priority: 1
        };
      },
      error: (error) => {
        console.error('Error enqueuing flight:', error);
        this.statusMessage = '❌ Error al agregar vuelo a la cola.';
      }
    });
  }

  processQueueStep() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.queueService.processStep().subscribe({
      next: (result) => {
        if (result.status === 'empty') {
          this.statusMessage = '📭 La cola está vacía.';
          this.isProcessing = false;
          return;
        }

        // Add to processing log
        this.processingLog.unshift(result);

        // Update tree display
        this.refreshTrees();

        // Show conflicts if any
        if (result.balance_conflicts && result.balance_conflicts.length > 0) {
          const conflicts = result.balance_conflicts.join(', ');
          this.statusMessage = `⚠️ Vuelo ${result.flight?.code} insertado con conflictos: ${conflicts}`;
        } else if (result.status === 'inserted') {
          this.statusMessage = `✅ Vuelo ${result.flight?.code} insertado correctamente.`;
        } else if (result.status === 'error') {
          this.statusMessage = `❌ Error al insertar vuelo ${result.flight?.code}: ${result.error}`;
        }

        // Update queue
        this.loadQueue();

        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error processing step:', error);
        this.statusMessage = '❌ Error al procesar el paso.';
        this.isProcessing = false;
      }
    });
  }

  clearQueue() {
    if (confirm('¿Limpiar toda la cola de inserciones?')) {
      this.queueService.clearQueue().subscribe({
        next: () => {
          this.statusMessage = '🧹 Cola limpiada correctamente.';
          this.queueItems = [];
          this.processingLog = [];
        },
        error: (error) => {
          console.error('Error clearing queue:', error);
          this.statusMessage = '❌ Error al limpiar la cola.';
        }
      });
    }
  }
}