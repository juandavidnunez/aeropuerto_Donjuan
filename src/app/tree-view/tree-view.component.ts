import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FlightService } from 'app/services/flight.service';
import { MetricsService } from 'app/services/metrics.service';
import { TreeService } from '../services/tree.service';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css', './critical-depth-styles.css']
})
export class TreeViewComponent implements OnInit, AfterViewInit {
  @ViewChildren('treeScroll') treeScrolls!: QueryList<ElementRef<HTMLDivElement>>;

  avlTree: any = { root: null };
  bstTree: any = { root: null };
  avlMetrics: any = null;
  bstStats: any = null;
  selectedMode: 'topology' | 'insertion' = 'insertion';
  selectedFileName = '';
  statusMessage = 'Selecciona un archivo JSON para cargar el árbol.';
  isLoading = false;
  selectedNode: any = null;
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

  criticalDepth: number = 5;
  criticalNodesCount: number = 0;

  constructor(
    private treeService: TreeService,
    private flightService: FlightService,
    private metricsService: MetricsService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    console.log('TreeViewComponent.ngOnInit()');
    this.loadCriticalDepth();
  }

  ngAfterViewInit(): void {
    this.updateTreeScale();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateTreeScale();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    if (!this.isCriticalDepthValid()) {
      this.statusMessage = 'Debes ingresar una profundidad crítica válida (0-20)';
      return;
    }

    this.selectedFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsedData = JSON.parse(String(reader.result));
        this.selectedMode = this.detectMode(parsedData, file.name);
        this.loadTree(parsedData);
      } catch (error) {
        this.statusMessage = 'El archivo no es JSON válido.';
      }
    };
    reader.readAsText(file);
  }

  loadTree(data: any): void {
    this.isLoading = true;
    this.statusMessage = 'Cargando árbol...';
    this.treeService.loadTree(this.selectedMode, data).subscribe({
      next: (response) => {
        this.selectedMode = response?.mode === 'topology' ? 'topology' : 'insertion';
        this.avlTree = response.avl || { root: null };
        this.bstTree = response.bst || { root: null };
        this.bstStats = response.bst_stats || null;
        this.loadAvlMetrics(response.avl_stats || null);
        this.statusMessage = response.message || '�rbol cargado.';
        this.countCriticalNodes();
        setTimeout(() => this.updateTreeScale(), 0);
        this.isLoading = false;
      },
      error: (error) => {
        this.statusMessage = this.getFriendlyErrorMessage(error, 'Error cargando árbol');
        this.isLoading = false;
      }
    });
  }

  private getFriendlyErrorMessage(error: any, fallback: string): string {
    if (error?.status === 0) {
      return 'No se pudo conectar con el backend';
    }
    return error?.error?.detail || fallback;
  }

  detectMode(data: any, fileName: string = ''): 'topology' | 'insertion' {
    // ✅ PRIORIDAD MÁXIMA: si tiene izquierdo/derecho, es topología
    if (data && typeof data === 'object') {
        if ('izquierdo' in data || 'derecho' in data || 'left' in data || 'right' in data) {
            console.log('🎯 Detectado TOPOLOGÍA por presencia de hijos');
            return 'topology';
        }
    }

    const rawMode = String(data?.mode || data?.modo || '').trim().toLowerCase();
    if (rawMode === 'topology' || rawMode === 'topologia') return 'topology';
    if (rawMode === 'insertion' || rawMode === 'insercion') return 'insertion';

    if (Array.isArray(data?.flights) || Array.isArray(data?.vuelos)) return 'insertion';

    const normalizedName = fileName.toLowerCase();
    if (normalizedName.includes('topologia') || normalizedName.includes('topology')) return 'topology';

    return this.selectedMode;
}

  updateTreeScale(): void {
    if (!this.treeScrolls || this.treeScrolls.length === 0) return;

    this.treeScrolls.forEach((scroll) => {
      const container = scroll.nativeElement as HTMLElement;
      const content = container.querySelector(':scope > .tree-list') as HTMLElement | null;
      if (!content) {
        this.renderer.removeStyle(container, 'transform');
        return;
      }

      // Reset before measuring so each recalculation starts from the natural tree size.
      this.renderer.setStyle(content, 'transform', 'scale(1)');

      const canvas = container.parentElement as HTMLElement | null;
      const parentWidth = canvas ? canvas.clientWidth : container.clientWidth;
      const parentHeight = canvas ? canvas.clientHeight : container.clientHeight;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;
      if (!contentWidth || !contentHeight || !parentWidth || !parentHeight) {
        this.renderer.removeStyle(content, 'transform');
        return;
      }

      const widthScale = parentWidth / contentWidth;
      const heightScale = parentHeight / contentHeight;
      const scale = Math.max(0.05, Math.min(0.9, widthScale, heightScale));
      this.renderer.setStyle(content, 'transform', `scale(${scale})`);
      this.renderer.setStyle(content, 'transformOrigin', 'top center');
    });
  }

  refreshTrees(): void {
    this.isLoading = true;
    this.treeService.setCriticalDepth(this.criticalDepth).subscribe({
      next: () => {
        forkJoin({
          avlTree: this.treeService.getTree('avl'),
          bstTree: this.treeService.getTree('bst'),
          avlMetrics: this.metricsService.getMetrics(),
          bstStats: this.treeService.getStats('bst')
        }).subscribe({
          next: ({ avlTree, bstTree, avlMetrics, bstStats }) => {
            this.avlTree = avlTree || { root: null };
            this.bstTree = bstTree || { root: null };
            this.avlMetrics = avlMetrics || null;
            this.bstStats = bstStats || null;
            if (this.avlTree?.root) {
              this.statusMessage = 'Árbol listo.';
              this.countCriticalNodes();
            }
            setTimeout(() => this.updateTreeScale(), 0);
            this.isLoading = false;
          },
          error: () => {
            this.statusMessage = 'Error recargando árbol';
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.statusMessage = 'Error aplicando profundidad crítica';
        this.isLoading = false;
      }
    });
  }

  private loadAvlMetrics(fallback: any = null): void {
    this.metricsService.getMetrics().subscribe({
      next: (metrics) => {
        this.avlMetrics = metrics;
      },
      error: () => {
        this.avlMetrics = fallback;
      }
    });
  }

  shouldShowBst(): boolean {
    return this.selectedMode === 'insertion';
  }

  selectNode(node: any) {
    this.selectedNode = node;
  }

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

  closeModal() {
    this.showModal = false;
  }

  insertFlight() {
    this.flightService.insert(this.formData).subscribe({
      next: () => {
        this.statusMessage = 'Vuelo insertado';
        this.closeModal();
        this.refreshTrees();
      },
      error: () => this.statusMessage = 'Error insertando vuelo'
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
        this.statusMessage = 'Vuelo actualizado';
        this.closeModal();
        this.selectedNode = null;
        this.refreshTrees();
      },
      error: () => this.statusMessage = 'Error actualizando vuelo'
    });
  }

  cancelFlight(): void {
    if (!this.selectedNode) return;
    const code = this.selectedNode.code;
    if (confirm(`Cancelar ${code}?`)) {
      this.flightService.cancel(code).subscribe({
        next: (r) => {
          this.statusMessage = `${r.nodes_removed} nodos eliminados`;
          this.selectedNode = null;
          this.refreshTrees();
        },
        error: () => this.statusMessage = 'Error cancelando vuelo'
      });
    }
  }

  undoLastAction(): void {
    this.treeService.undoLastAction().subscribe({
      next: () => {
        this.statusMessage = 'Acci�n deshecha';
        this.selectedNode = null;
        this.refreshTrees();
        this.loadCriticalDepth();
      },
      error: () => this.statusMessage = 'Error deshaciendo acci�n'
    });
  }

  deleteNode() {
    if (!this.selectedNode) return;
    if (confirm(`Eliminar ${this.selectedNode.code}?`)) {
      this.flightService.delete(this.selectedNode.code).subscribe({
        next: () => {
          this.statusMessage = 'Nodo eliminado';
          this.selectedNode = null;
          this.refreshTrees();
        },
        error: () => this.statusMessage = 'Error eliminando nodo'
      });
    }
  }

  deleteLeastProfitable(): void {
    if (confirm('Eliminar nodo menos rentable?')) {
      this.flightService.deleteLeastProfitable().subscribe({
        next: (r) => {
          this.statusMessage = `${r.deleted_code} eliminado (${r.nodes_removed} nodos)`;
          this.selectedNode = null;
          this.refreshTrees();
        },
        error: () => this.statusMessage = 'Error eliminando nodo'
      });
    }
  }

  loadCriticalDepth() {
    this.treeService.getCriticalDepth().subscribe({
      next: (r) => {
        this.criticalDepth = r.critical_depth;
        this.countCriticalNodes();
      },
      error: () => {}
    });
  }

  applyDepthPenalty() {
    this.statusMessage = `Profundidad crítica: ${this.criticalDepth}. Presiona Recargar`;
  }

  isCriticalDepthValid(): boolean {
    return typeof this.criticalDepth === 'number' && this.criticalDepth >= 0 && this.criticalDepth <= 20;
  }

  countCriticalNodes() {
    let count = 0;
    const countRecursive = (node: any) => {
      if (!node) return;
      if (node.is_critical) count++;
      countRecursive(node.left);
      countRecursive(node.right);
    };
    countRecursive(this.avlTree?.root);
    this.criticalNodesCount = count;
  }

  buildNodeTooltip(node: any): string {
    let t = `${node.code}: ${node.origin} -> ${node.destination}\n$${node.base_price}\n${node.passengers}pax`;
    if (node.is_critical) t += `\n+25%: $${node.penalty}`;
    return t;
  }

  onTreeUpdated() {
    this.refreshTrees();
  }
}
