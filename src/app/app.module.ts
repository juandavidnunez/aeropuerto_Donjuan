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
import { TreeViewComponent } from '../app/tree-view/tree-view.component';

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

  ],
  providers: [
    TreeService,
    VersioningService,
    QueueService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
