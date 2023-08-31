


import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
<<<<<<< HEAD:src/app/modules/admin/administrator/announcement/page.resolver.ts

import { Service, } from './page.service';
import { AssetType, Chat, DataPosition, } from './page.types';

=======
import { Service, } from './page.service';
import { AssetType, Chat, Division, BranchPagination, BranchProduct, BranchProductDetail, Store, StoreType } from './logistic.types';
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/administrator/client/page.resolver.ts

@Injectable({
  providedIn: 'root'
})
<<<<<<< HEAD:src/app/modules/admin/administrator/announcement/page.resolver.ts
export class AnnouncementResolve implements Resolve<any>
=======
export class PageResolve implements Resolve<any>
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/administrator/client/page.resolver.ts
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
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Chat[]> | any {
    return this._Service.getChatById('f73a5a34-a723-4b35-8439-5289e0164c83')
      .pipe(
        // Error here means the requested chat is not available
        catchError((error) => {

          // Log the error
          console.error(error);

          // Get the parent url
          const parentUrl = state.url.split('/').slice(0, -1).join('/');

          // Navigate to there
          this._router.navigateByUrl(parentUrl);

          // Throw an error
          return throwError(error);
        })
      );
  }

  resolveGet(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DataPosition[]> {
    console.log(1)
    return this._Service.getList();
  }
}


