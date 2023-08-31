import { Route } from '@angular/router';
import { CreatePermissionComponent } from './create-permission/create-permission.component';
import { EditPermissionComponent } from './edit-permission/edit-permission.component';
import { PermissionListComponent } from './list/list.component';
import { PermissionComponent } from './permission.component';
import { AssetTypeResolver, PermissionProductsResolver } from './permission.resolvers';


export const permissionRoute: Route[] = [
    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'brief-plan'
    // },
    {
        // path: '',
        // component: PermissionComponent,
        // children: [
        //     {
        //         path: '',
        //         component: PermissionListComponent,
             
        //     },
        //     {
        //         path: 'create-permission',
        //         component: CreatePermissionComponent,
     
        //     },
        //     {
        //         path: 'edit/:id',
        //         component: EditPermissionComponent,
         
        //     },

        // ]
        path: '',
        component: PermissionComponent,
        children: [
            {
                path: 'list',
                component: PermissionListComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },
            {
                path: 'create-permission',
                component: CreatePermissionComponent,
                // resolve: {
                //     permission: PermissionProductsResolver,
                //     department: DepartmentResolver,
                //     resolveGet: PositionResolve,
                //     branch: BranchResolver,
                // }
            },
            {
                path: 'edit/:id',
                component: EditPermissionComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },
          

        ]
  
    }
];
