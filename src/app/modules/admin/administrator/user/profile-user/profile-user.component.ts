
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { sortBy, startCase } from 'lodash-es';
import { AssetType, DataUser, UserPagination } from '../user.types';
import { UserService } from '../user.service';
import { MatTableDataSource } from '@angular/material/table';
import { ViewUserComponent } from '../view-user/view-user.component';
import { data } from 'jquery';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
    selector: 'app-profile-user',
    templateUrl: './profile-user.component.html',
    styleUrls: ['./profile-user.component.scss'],
    // encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})

export class ProfileUserComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    displayedColumns: string[] = ['id',
        'first_name',
        'last_name',
        'email',
        'status',
        'create_by',
        'created_at',
        'actions'];
    dataSource: MatTableDataSource<DataUser>;
    dataRow: any = []
    public namets: string
    url_pro: any = []
    url_sig: any = []
    Dep: any = []
    Pos: any = []
    Bra: any = []

    products$: Observable<any>;
    asset_types: AssetType[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;

    me: any | null;
    get roleType(): string {
        return 'marketing';
    }

    supplierId: string | null;
    pagination: UserPagination;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        // private _Service: PermissionService,
        private _Service: UserService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._Service.getUserprofile().subscribe((resp: any) => {
            this.dataRow = resp.data;
            console.log(this.dataRow)
            this._changeDetectorRef.markForCheck();
            this.Bra = this.dataRow.branch.name
            this.Pos = this.dataRow.position.name
            this.Dep = this.dataRow.department.name
            // this.dataRow.id = 4
            // this.namets = this.dataRow.first_name
            console.log(this.dataRow, 'datarow')
            // this.dataSource = new MatTableDataSource(this.dataRow)
            // this.dataSource.paginator = this._paginator;
            // this.dataSource.sort = this._sort;
            // this._changeDetectorRef.markForCheck();
            this.url_pro = this.dataRow.image
            this.url_sig = this.dataRow.image_signature
        })

        // });

        // this.me = this._activatedRoute.snapshot.data.me;

        // this.filterForm = this._formBuilder.group({
        //     asset_type: ['default'],
        //     searchInputControl: [null],
        // });

        // // Get the pagination
        // this._Service.pagination$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((pagination: PermissionPagination) => {

        //         // Update the pagination
        //         this.pagination = pagination;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });

        // // Get the products
        // this._Service.getProducts(0, 10, 'id', 'asc', null, null, this.supplierId)
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe(
        //         (res: any) => {
        //             // res.meta.pagination.page = res.meta.pagination.page -= 1;
        //             // this.pagination = res.meta.pagination;
        //         }
        //     );

        // this.products$ = this._Service.products$;

        // // Get the asset type
        // this._Service.asset_types$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((asset_types: any) => {
        //         this.asset_types = sortBy(asset_types.data, ['name']);
        //     });



        // this.filterForm.valueChanges
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         debounceTime(300),
        //         switchMap((query) => {
        //             const { asset_type, searchInputControl } = query;
        //             this.closeDetails();
        //             this.isLoading = true;
        //             if (this._paginator === undefined) {
        //                 return this._Service.getProducts(0, 10, 'id', 'asc', searchInputControl, asset_type == 'default' ? '' : asset_type, this.supplierId);
        //             } else {
        //                 return this._Service.getProducts(
        //                     this._paginator.pageIndex + 1,
        //                     this._paginator.pageSize,
        //                     'id',
        //                     'asc',
        //                     searchInputControl,
        //                     asset_type == 'default' ? '' : asset_type,
        //                     this.supplierId);
        //             }
        //         }),
        //         map(() => {
        //             this.isLoading = false;
        //         })
        //     )
        //     .subscribe();

        // this._changeDetectorRef.markForCheck();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // if (this._sort && this._paginator) {
        //     // Set the initial sort
        //     this._sort.sort({
        //         id: 'id',
        //         start: 'asc',
        //         disableClear: true
        //     });

        //     // Mark for check
        //     this._changeDetectorRef.markForCheck();

        //     // If the user changes the sort order...
        //     this._sort.sortChange
        //         .pipe(takeUntil(this._unsubscribeAll))
        //         .subscribe(() => {
        //             // Reset back to the first page
        //             this._paginator.pageIndex = 0;

        //             // Close the details
        //             this.closeDetails();
        //         });

        //     // Get products if sort or page changes
        //     merge(this._sort.sortChange, this._paginator.page).pipe(
        //         switchMap(() => {
        //             this.closeDetails();
        //             this.isLoading = true;
        //             return this._Service.getProducts(
        //                 this._paginator.pageIndex + 1,
        //                 this._paginator.pageSize,
        //                 this._sort.active,
        //                 this._sort.direction,
        //                 this.filterForm.value?.searchInputControl,
        //                 this.filterForm.value?.asset_type == 'default' ? '' : this.filterForm.value?.asset_type,
        //                 this.supplierId
        //             );
        //         }),
        //         map(() => {
        //             this.isLoading = false;
        //         })
        //     ).subscribe();
        // }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------




    resetForm(): void {
        this.filterForm.reset();
        this.filterForm.get('asset_type').setValue("default");
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    callDetail(productId: string): void {
        // alert(this.selectedProduct.id);
        // // If the product is already selected...
        // if (this.selectedProduct && this.selectedProduct.id === productId) {
        //     // Close the details
        //     // this.closeDetails();
        //     return;
        // }


        this._router.navigate(['marketing/brief-plan/' + productId]);

    }

    editBrief(productId: string): void {
        this._router.navigate(['marketing/brief-plan/edit/' + productId]);
    }
    edit(productId: string): void {
        this._router.navigate(['user/edit/' + productId]);
    }


    openNewBrief(): void {
        this._router.navigateByUrl('marketing/brief-plan/brief/create');
    }

    openNewOrder(productId: string): void {
        // If the product is already selected...
        // if (this.selectedProduct && this.selectedProduct.id === productId) {
        //     // Close the details
        //     // this.closeDetails();
        //     return;
        // }


        this._router.navigate(['marketing/data/assets-list/new-order/' + productId]);
    }

    textStatus(status: string): string {
        return startCase(status);
    }

    // openImportOsm(): void {
    //     this._matDialog.open(ImportOSMComponent)
    // }

    ViewUser(data): void {
        const dialogRef = this._matDialog.open(ViewUserComponent, {
            width: '1000px',
            height: '650px',
            data: data

        })
        dialogRef.afterClosed().subscribe(res => {
        })
    }
    ChangePwd(userId: string): void {
        this._router.navigate(['user/change-pwd/' + userId]);
    }
}
