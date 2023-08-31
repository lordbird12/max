import { Route } from '@angular/router';
<<<<<<< HEAD:src/app/modules/admin/administrator/about/page.routing.ts
// import { CreateUserComponent } from './create-user/create-user.component';
// import { UserListComponent } from './list/list.component';
import { PageComponent } from './page.component';
import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { NewComponent } from './new/new.component';
// import { AssetTypeResolver, PermissionProductsResolver } from './user.resolvers';


export const pageRoute: Route[] = [
    {
        path: '',
        component: PageComponent,
        children: [
            {
                path: 'list',
                component: ListComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },
            {
                path: 'new',
                component: NewComponent,
                // resolve: {
                //     products: PermissionProductsResolver,

                // }
            },
            {
                path: 'edit/:id',
                component: EditComponent,
=======
import { BranchResolver } from '../branch/branch.resolver';
import { DepartmentResolver } from '../department/department.resolver';
import { PositionResolve } from '../position/position.resolver';
import { UserListComponent } from './list/list.component';
import { UserComponent } from './page.component';
import { AssetTypeResolver, PermissionProductsResolver } from './page.resolvers';


export const userRoute: Route[] = [
    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'brief-plan'
    // },
    {
        path: '',
        component: UserComponent,
        children: [
            {
                path: 'list',
                component: UserListComponent,
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/administrator/user_job/page.routing.ts
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
