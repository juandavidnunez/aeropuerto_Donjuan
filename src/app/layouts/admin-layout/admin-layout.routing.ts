import { Routes } from '@angular/router';

import { IconsComponent } from '../../icons/icons.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';
import { TreeViewComponent } from '../../tree-view/tree-view.component';

export const AdminLayoutRoutes: Routes = [
    { path: '', redirectTo: 'tree-view', pathMatch: 'full' },
    // {
    //   path: '',
    //   children: [ {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // }]}, {
    // path: '',
    // children: [ {
    //   path: 'userprofile',
    //   component: UserProfileComponent
    // }]
    // }, {
    //   path: '',
    //   children: [ {
    //     path: 'icons',
    //     component: IconsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'notifications',
    //         component: NotificationsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'maps',
    //         component: MapsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'typography',
    //         component: TypographyComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'upgrade',
    //         component: UpgradeComponent
    //     }]
    // }
    { path: 'icons',          component: IconsComponent },
    { path: 'upgrade',        component: UpgradeComponent },
    { path: 'tree-view',      component: TreeViewComponent },
];
