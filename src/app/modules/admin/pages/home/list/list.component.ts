import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
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
import { AssetType, BranchPagination, DataBranch } from '../home.types';
import { HomeService } from '../home.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';
import { MatTableDataSource } from '@angular/material/table';
import { DataTableDirective } from 'angular-datatables';

import Chart from 'chart.js/auto'


@Component({
    selector: 'list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    // encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})

export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('doughnutCanvas') doughnutCanvas: ElementRef | undefined;
    doughnutChart: any;
    @ViewChild('lineCanvas') lineCanvas: ElementRef | undefined;
    lineChart: any;
    @ViewChild('barCanvas') barCanvas: ElementRef | undefined;
    barChart: any;


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
        private _Service: HomeService,
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
    barChartMethod() {
        this.barChart = new Chart(this.barCanvas?.nativeElement, {
            type: 'bar',
            data: {
                labels: ['บัญชี 1', 'บัญชี 2', 'บัญชี 3', 'บัญชี 4', 'บัญชี 5', 'บัญชี 6'],
                datasets: [
                    {
                        label: '# of Votes',
                        data: [200, 50, 30, 15, 20, 34],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }
    lineChartMethod() {
        this.lineChart = new Chart(this.lineCanvas?.nativeElement, {
            type: 'line',
            data: {
                labels: [
                    'มกราคม',
                    'กุมภาพันธ์',
                    'มีนาคม',
                    'เมษายน',
                    'พฤษภาคม',
                    'มิถุนายน',
                    'กรกฏาคม',
                    'สิงหาคม',
                    'กันยายน',
                    'ตุลาคม',
                    'พฤษจิกายน',
                    'ธันวาคม',
                ],
                datasets: [
                    {
                        label: 'รายการเดินบัญชี',
                        //  lineTension: 0.2, 
                        fill: false,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [65, 59, 80, 81, 56, 55, 40, 10, 5, 50, 10, 15],
                        spanGaps: false,
                    },
                ],
            },
        });
    }
    doughnutChartMethod() {
        this.doughnutChart = new Chart(this.doughnutCanvas?.nativeElement, {
            type: 'doughnut',
            data: {
                labels: ['บัญชี 1', 'บัญชี 2', 'บัญชี 3', 'บัญชี 4', 'บัญชี 5'],
                datasets: [
                    {
                        label: '# of Transaction',
                        data: [50, 29, 15, 10, 7],
                        backgroundColor: [
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                        ],
                        hoverBackgroundColor: [
                            '#FFCE56',
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#FF6384',
                        ],
                    },
                ],
            },
        });
    }
    ngAfterViewInit(): void {
        this.barChartMethod();
        this.doughnutChartMethod();
        this.lineChartMethod();
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
        // const dialogRef = this._matDialog.open(NewBranchComponent);
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
