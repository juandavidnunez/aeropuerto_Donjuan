import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { QueueService } from '../../services/queue.service';

@Component({
  selector: 'app-queue-panel',
  templateUrl: './queue-panel.component.html',
  styleUrls: ['./queue-panel.component.css']
})
export class QueuePanelComponent implements OnInit {
  queueItems: any[] = [];
  isProcessing: boolean = false;
  isMinimized: boolean = false;
  processingLog: any[] = [];
  showQueueModal: boolean = false;
  processingDelayMs = 3000;

  formData: any = {
    code: '',
    origin: '',
    destination: '',
    base_price: 0,
    passengers: 0,
    promotion: 0,
    priority: 1
  };

  @Output() treeUpdated = new EventEmitter<void>();

  constructor(private queueService: QueueService) { }

  ngOnInit(): void {
    this.loadQueue();
  }

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
    if (!this.formData.code || !this.formData.origin || !this.formData.destination) {
      alert('Por favor complete los campos obligatorios: código, origen y destino.');
      return;
    }

    this.queueService.enqueue(this.formData).subscribe({
      next: (response) => {
        alert(`✅ Vuelo "${this.formData.code}" agregado a la cola. Cola: ${response.queue_length} elementos.`);
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
        alert('❌ Error al agregar vuelo a la cola.');
      }
    });
  }

  startProcessingQueue() {
    if (this.isProcessing) return;
    if (!this.queueItems.length) {
      alert('📭 La cola está vacía. Agrega vuelos antes de iniciar el procesamiento.');
      return;
    }

    this.isProcessing = true;
    this.isMinimized = true;
    this.processingLog = [];
    this.processNextQueueItem();
  }

  private processNextQueueItem() {
    this.queueService.processStep().subscribe({
      next: (result) => {
        if (result.status === 'empty') {
          this.isProcessing = false;
          this.isMinimized = false;
          this.loadQueue();
          return;
        }

        this.processingLog.unshift(result);
        this.treeUpdated.emit();
        this.loadQueue();

        if (result.remaining_queue > 0) {
          setTimeout(() => this.processNextQueueItem(), this.processingDelayMs);
        } else {
          this.isProcessing = false;
          this.isMinimized = false;
        }
      },
      error: (error) => {
        console.error('Error processing queue:', error);
        alert('❌ Error al procesar la cola.');
        this.isProcessing = false;
        this.isMinimized = false;
      }
    });
  }

  clearQueue() {
    if (this.isProcessing) return;

    this.queueService.clearQueue().subscribe({
      next: () => {
        alert('🧹 Cola limpiada correctamente.');
        this.queueItems = [];
        this.processingLog = [];
      },
      error: (error) => {
        console.error('Error clearing queue:', error);
        alert('❌ Error al limpiar la cola.');
      }
    });
  }
}