import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
    debounceTime,
    map,
    merge,
    Observable,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { sortBy, startCase } from 'lodash-es';
import { AssetType, BranchPagination, DataBranch } from '../logistic.types';
import { Service } from '../page.service';
import { NewComponent } from '../new/new.component';
import { MatTableDataSource } from '@angular/material/table';
import { DataTableDirective } from 'angular-datatables';
@Component({
    selector: 'list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    animations: fuseAnimations,
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(DataTableDirective)
    dtElement!: DataTableDirective;
    public dtOptions: DataTables.Settings = {};
    public dataRow: any[];
    public dataGrid: any[];

    // dataRow: any = []
    @ViewChild(MatPaginator) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    displayedColumns: string[] = [
        'id',
        'name',
        'status',
        'create_by',
        'created_at',
        'actions',
    ];
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

    accountData: any[] = [
        {
            id: 1,
            account_name: 'KBANK',
            account_no: '1234567890',
            status: 1,
            create_by: 'admin',
            created_at: '2022-09-22',
            user_id: [2],
        },
        {
            id: 2,
            account_name: 'SCB',
            account_no: '1234567890',
            status: 1,
            create_by: 'admin',
            created_at: '2022-09-22',
            user_id: [1, 3],
        },
        {
            id: 3,
            account_name: 'GSB',
            account_no: '1234567890',
            status: 1,
            create_by: 'admin',
            created_at: '2022-09-22',
            user_id: [1, 2],
        },
        {
            id: 4,
            account_name: 'KTB',
            account_no: '1234567890',
            status: 1,
            create_by: 'admin',
            created_at: '2022-09-22',
            user_id: [1, 2],
        },
    ];

    supplierId: string | null;
    pagination: BranchPagination;

    totalSummary: any;
    totalRows: any;
    totalRowSummary: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        // private _Service: PermissionService,
        private _Service: Service,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loadTable();
    }

    pages = { current_page: 1, last_page: 1, per_page: 10, begin: 0 };
    loadTable(): void {
        const that = this;
        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 100,
            serverSide: true,
            processing: true,
            responsive: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.11.3/i18n/th.json',
            },
            ajax: (dataTablesParameters: any, callback) => {
                dataTablesParameters.status = 'Yes';
                that._Service
                    .getPage(dataTablesParameters)
                    .subscribe((resp) => {
                        this.dataRow = resp.data;
                        this.totalRowSummary = this.totalPriceTable();
                        this.pages.current_page = resp.current_page;
                        this.pages.last_page = resp.last_page;
                        this.pages.per_page = resp.per_page;
                        if (resp.current_page > 1) {
                            this.pages.begin =
                                resp.per_page * resp.current_page - 1;
                        } else {
                            this.pages.begin = 0;
                        }

                        callback({
                            recordsTotal: resp.total,
                            recordsFiltered: resp.total,
                            data: [],
                        });
                        this._changeDetectorRef.markForCheck();
                    });
            },
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'number' },
                { data: 'description' },
                { data: 'summary' },
                { data: 'status' },
                { data: 'create_by' },
                { data: 'created_at' },
                { data: 'actice', orderable: false },
            ]
        };
    }

    totalPriceTable() {
        let total = 0;
        for (let data of this.dataRow) {
            total += Number(data.summary);
        }
        return total;
    }

    totalPrice() {
        let total = 0;
        for (let data of this.dataGrid) {
            total += Number(data.summary);
        }
        return total;
    }

    totalTrans() {
        let total = 0;
        for (let data of this.dataGrid) {
            total += data.today.length;
        }
        return total;
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {}

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
        this.filterForm.get('asset_type').setValue('default');
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

    edit(bankId: string): void {
        console.log(bankId);
        this._router.navigate(['bank/edit/' + bankId]);
    }

    viewDetail(bankId: string): void {
        console.log(bankId);
        this._router.navigate(['bank/view-bank-detail/' + bankId]);
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

        this._router.navigate([
            'marketing/data/assets-list/new-order/' + productId,
        ]);
    }

    textStatus(status: string): string {
        return startCase(status);
    }

    openDetail(id): void {
        this._router.navigate(['bank/view-bank-detail/' + id]);
    }
}
