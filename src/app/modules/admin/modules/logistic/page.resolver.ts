


import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { Service, } from './page.service';
import { AssetType, Chat, Division, BranchPagination, BranchProduct, BranchProductDetail, Store, StoreType } from './page.types';

@Injectable({
  providedIn: 'root'
})
export class PageResolve implements Resolve<any>
{
  /**
   * Constructor
   */
  constructor(
    // private _Service: UserService,
    private _Service: Service,
    private _router: Router
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
     {
         return this._Service.getData();
     }
}

