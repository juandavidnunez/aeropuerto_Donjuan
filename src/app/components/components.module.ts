import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

// TAREA 7
import { AvlAuditComponent } from './stress-panel/avl-audit/avl-audit.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,

    // TAREA 7
    AvlAuditComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,

    // TAREA 7
    AvlAuditComponent,
  ]
})
export class ComponentsModule { }
