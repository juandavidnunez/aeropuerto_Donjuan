import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { VersioningService } from '../../services/versioning.service';

@Component({
  selector: 'app-versioning-panel',
  templateUrl: './versioning-panel.component.html',
  styleUrls: ['./versioning-panel.component.css']
})
export class VersioningPanelComponent implements OnInit {
  versions: string[] = [];
  newVersionName: string = '';
  showVersionModal: boolean = false;

  @Output() treeUpdated = new EventEmitter<void>();

  constructor(private versioningService: VersioningService) { }

  ngOnInit(): void {
    this.loadVersions();
  }

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
        alert(`✅ Versión "${this.newVersionName}" guardada correctamente.`);
        this.closeVersionModal();
        this.treeUpdated.emit(); // Notify parent to refresh
        this.loadVersions();
      },
      error: (error) => {
        console.error('Error saving version:', error);
        alert('❌ Error al guardar la versión.');
      }
    });
  }

  restoreVersion(versionName: string) {
    if (confirm(`¿Restaurar la versión "${versionName}"? Esto reemplazará el árbol actual.`)) {
      this.versioningService.restoreVersion(versionName).subscribe({
        next: () => {
          alert(`✅ Versión "${versionName}" restaurada correctamente.`);
          this.treeUpdated.emit(); // Notify parent to refresh
        },
        error: (error) => {
          console.error('Error restoring version:', error);
          alert('❌ Error al restaurar la versión.');
        }
      });
    }
  }

  deleteVersion(versionName: string) {
    if (confirm(`¿Eliminar permanentemente la versión "${versionName}"? Esta acción no se puede deshacer.`)) {
      this.versioningService.deleteVersion(versionName).subscribe({
        next: () => {
          alert(`✅ Versión "${versionName}" eliminada correctamente.`);
          this.loadVersions();
        },
        error: (error) => {
          console.error('Error deleting version:', error);
          alert('❌ Error al eliminar la versión.');
        }
      });
    }
  }
}