import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TreeService } from './services/tree.service';
import { VersioningService } from './services/versioning.service';
import { QueueService } from './services/queue.service';
import { MetricsService } from './services/metrics.service';
import { TreeViewComponent } from '../app/tree-view/tree-view.component';
import { MetricsPanelComponent } from './tree-view/metrics-panel/metrics-panel.component';
import { VersioningPanelComponent } from './tree-view/versioning-panel/versioning-panel.component';
import { QueuePanelComponent } from './tree-view/queue-panel/queue-panel.component';

// TAREA 7
import { StressService } from './services/stress.service';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    TreeViewComponent,
    MetricsPanelComponent,
    VersioningPanelComponent,
    QueuePanelComponent,
  ],
  providers: [
    TreeService,
    VersioningService,
    QueueService,
    MetricsService,

    // TAREA 7
    StressService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
