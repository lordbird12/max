import { Route } from '@angular/router';
// import { CreateUserComponent } from './create-user/create-user.component';
// import { UserListComponent } from './list/list.component';
import { DepartmentComponent } from './department.component';
import { EditDepartmentComponent } from './edit-department/edit-department.component';
import { DepartmentListComponent } from './list/list.component';
import { NewDepartmentComponent } from './new-department/new-department.component';
// import { AssetTypeResolver, PermissionProductsResolver } from './user.resolvers';


export const departmentRoute: Route[] = [
    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'brief-plan'
    // },
    {
        path: '',
        component: DepartmentComponent,
        children: [
            {
                path: 'list',
                component: DepartmentListComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },
            {
                path: 'new-department',
                component: NewDepartmentComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },
            {
                path: 'edit/:id',
                component: EditDepartmentComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },


        ]

        /*children : [
            {
                path     : '',
                component: ContactsListComponent,
                resolve  : {
                    tasks    : ContactsResolver,
                    countries: ContactsCountriesResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : ContactsDetailsComponent,
                        resolve      : {
                            task     : ContactsContactResolver,
                            countries: ContactsCountriesResolver
                        },
                        canDeactivate: [CanDeactivateContactsDetails]
                    }
                ]
            }
        ]*/
    }
];
