import { Route } from '@angular/router';
import { PageComponent } from './page.component';
import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { NewComponent } from './new/new.component';
import { MapComponent } from './map/map.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';
import { PageResolve, } from './page.resolver';

export const pageRoute: Route[] = [
    {
        path: '',
        component: PageComponent,
        children: [
            {
                path: 'list',
                component: ListComponent,
                resolve: {
                    data: PageResolve,
                },
            },
            {
                path: 'new',
                component: NewComponent,
            },
            {
                path: 'edit/:id',
                component: EditComponent,
            },
            {
                path: 'detail/:id',
                component: DetailComponent,
            },
            {
                path: 'map/:start/:end',
                component: MapComponent,
            },
            {
                path: 'search',
                component: SearchComponent,
            },
        ],
    },
];
