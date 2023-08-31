import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { defaultNavigation } from 'app/mock-api/common/navigation/data';
// import { PowerBiService } from 'app/modules/admin/admin/power-bi/power-bi.service';

@Injectable({
    providedIn: 'root',
})
export class NavigationMockApi {
    private readonly _defaultNavigation: FuseNavigationItem[] =
        defaultNavigation;
    biMkt: string = '';
    biStore: string = '';
    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    async registerHandlers(): Promise<void> {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            this._defaultNavigation.forEach((defaultNavItem) => {
                if (defaultNavItem.id === 'bi-marketing') {
                    defaultNavItem.link = this.biMkt;
                }
                if (defaultNavItem.id === 'bi-store') {
                    defaultNavItem.link = this.biStore;
                }
            });

            // Fill compact navigation children using the default navigation

            // Return the response
            return [
                200,
                {
                    default: cloneDeep(this._defaultNavigation),
                },
            ];
        });
    }
}
