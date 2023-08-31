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
import { AssetType, BranchPagination, DataBranch } from '../branch.types';
import { BranchService } from '../branch.service';
import { NewBranchComponent } from '../new-branch/new-branch.component';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';
import { MatTableDataSource } from '@angular/material/table';
import { DataTableDirective } from 'angular-datatables';
@Component({
    selector: 'user-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    // encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})

export class BranchListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(DataTableDirective)
    dtElement!: DataTableDirective;
    public dtOptions: DataTables.Settings = {};
    public dataRow: any[];

    // dataRow: any = []
    @ViewChild(MatPaginator) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    displayedColumns: string[] = ['id', 'name', 'status', 'create_by', 'created_at', 'actions'];
    dataSource: MatTableDataSource<DataBranch>;

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
    pagination: BranchPagination;

    /**
     * Constructor
     */
    constructor(

        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        // private _Service: PermissionService,
        private _Service: BranchService,
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
        this.loadTable();
        // this._Service.getBranch().subscribe((resp: any) => {
        //     this.dataRow = resp.data;
        //     this.dataSource = new MatTableDataSource(this.dataRow)
        //     this.dataSource.paginator = this._paginator;
        //     this.dataSource.sort = this._sort;
        //     this._changeDetectorRef.markForCheck();
        // })
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

    edit(branchId: string): void {
        this._router.navigate(['branch/edit/' + branchId]);
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

    openDialog() {
        const dialogRef = this._matDialog.open(NewBranchComponent);
    }

    // openImportOsm(): void {
    //     this._matDialog.open(ImportOSMComponent)
    // }

    pages = { current_page: 1, last_page: 1, per_page: 10, begin: 0 }
    loadTable(): void {
        const that = this;
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 10,
            serverSide: true,
            processing: true,
            language: {
                "url": "https://cdn.datatables.net/plug-ins/1.11.3/i18n/th.json"
            },
            ajax: (dataTablesParameters: any, callback) => {

                that._Service.getBranchPage(dataTablesParameters).subscribe((resp) => {
                    this.dataRow = resp.data
                    // console.log(resp)
                    this.pages.current_page = resp.current_page;
                    this.pages.last_page = resp.last_page;
                    this.pages.per_page = resp.per_page;
                    if (resp.current_page > 1) {
                        this.pages.begin = resp.per_page * resp.current_page - 1;
                    } else {
                        this.pages.begin = 0;
                    }
                    callback({
                        recordsTotal: resp.total,
                        recordsFiltered: resp.total,
                        data: []
                    });
                    this._changeDetectorRef.markForCheck();
                })
            },
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'status' },
                { data: 'create_by' },
                { data: 'created_at' },
                { data: 'actice', orderable: false },
            ]
        };

    }
}
