import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload-json',
  templateUrl: './upload-json.component.html',
  styleUrls: ['./upload-json.component.css']
})
export class UploadJsonComponent {

  isDragging = false;
  selectedFile: File | null = null;

  @Output() close = new EventEmitter<void>();  // ← Agrega esto

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    console.log('🟢 BOTÓN FUNCIONA - archivo:', this.selectedFile);
    
    if (!this.selectedFile) {
      console.log('⚠️ No hay archivo seleccionado');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    console.log('📤 Enviando a:', 'http://localhost:8000/api/tree/load-json');
    
    this.http.post('http://localhost:8000/api/tree/load-json', formData)
      .subscribe({
        next: (res) => {
          console.log('✅ Subido:', res);
          alert('Archivo cargado correctamente');
          this.closeModal();  // ← Cerrar después de subir
        },
        error: (err) => {
          console.error('❌ Error:', err);
          alert('Error al subir archivo');
        }
      });
  }

  closeModal() {
    this.close.emit();  // ← Emite el evento para cerrar
  }
}