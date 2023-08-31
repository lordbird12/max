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
import { AssetType, BranchPagination, DataBranch } from '../page.types';
import { Service } from '../page.service';
import { NewComponent } from '../new/new.component';
import { MatTableDataSource } from '@angular/material/table';
import { DataTableDirective } from 'angular-datatables';

import { ApexOptions } from 'ng-apexcharts';

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

    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;

    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

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
        private _authService: AuthService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the data
        this._Service.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };

        this._Service.getAll().subscribe((resp) => {
            this.dataGrid = resp.data;
            this._changeDetectorRef.markForCheck();
        });
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
                // dataTablesParameters.status = 'Yes';
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
                { data: 'weight' },
                { data: 'height' },
                { data: 'weight' },
                { data: 'qty' },
                { data: 'transport_type' },
                { data: 'quot' },
                { data: 'status' },
                { data: 'create_by' },
                { data: 'created_at' },
                { data: 'actice', orderable: false },
            ],
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

    edit(Id: string): void {
        this._router.navigate(['logistic/edit/' + Id]);
    }

    viewDetail(Id: string): void {
        this._router.navigate(['logistic/detail/' + Id]);
    }

    textStatus(status: string): string {
        return startCase(status);
    }

    openDetail(id): void {
        this._router.navigate(['bank/view-bank-detail/' + id]);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
     private _fixSvgFill(element: Element): void
     {
         // Current URL
         const currentURL = this._router.url;
 
         // 1. Find all elements with 'fill' attribute within the element
         // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
         // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
         Array.from(element.querySelectorAll('*[fill]'))
              .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
              .forEach((el) => {
                  const attrVal = el.getAttribute('fill');
                  el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
              });
     }
 
     /**
      * Prepare the chart data from the data
      *
      * @private
      */
     private _prepareChartData(): void
     {
         // Github issues
         this.chartGithubIssues = {
             chart      : {
                 fontFamily: 'inherit',
                 foreColor : 'inherit',
                 height    : '100%',
                 type      : 'line',
                 toolbar   : {
                     show: false
                 },
                 zoom      : {
                     enabled: false
                 }
             },
             colors     : ['#64748B', '#94A3B8'],
             dataLabels : {
                 enabled        : true,
                 enabledOnSeries: [0],
                 background     : {
                     borderWidth: 0
                 }
             },
             grid       : {
                 borderColor: 'var(--fuse-border)'
             },
             labels     : this.data.githubIssues.labels,
             legend     : {
                 show: false
             },
             plotOptions: {
                 bar: {
                     columnWidth: '50%'
                 }
             },
             series     : this.data.githubIssues.series,
             states     : {
                 hover: {
                     filter: {
                         type : 'darken',
                         value: 0.75
                     }
                 }
             },
             stroke     : {
                 width: [3, 0]
             },
             tooltip    : {
                 followCursor: true,
                 theme       : 'dark'
             },
             xaxis      : {
                 axisBorder: {
                     show: false
                 },
                 axisTicks : {
                     color: 'var(--fuse-border)'
                 },
                 labels    : {
                     style: {
                         colors: 'var(--fuse-text-secondary)'
                     }
                 },
                 tooltip   : {
                     enabled: false
                 }
             },
             yaxis      : {
                 labels: {
                     offsetX: -16,
                     style  : {
                         colors: 'var(--fuse-text-secondary)'
                     }
                 }
             }
         };
 
         // Task distribution
         this.chartTaskDistribution = {
             chart      : {
                 fontFamily: 'inherit',
                 foreColor : 'inherit',
                 height    : '100%',
                 type      : 'polarArea',
                 toolbar   : {
                     show: false
                 },
                 zoom      : {
                     enabled: false
                 }
             },
             labels     : this.data.taskDistribution.labels,
             legend     : {
                 position: 'bottom'
             },
             plotOptions: {
                 polarArea: {
                     spokes: {
                         connectorColors: 'var(--fuse-border)'
                     },
                     rings : {
                         strokeColor: 'var(--fuse-border)'
                     }
                 }
             },
             series     : this.data.taskDistribution.series,
             states     : {
                 hover: {
                     filter: {
                         type : 'darken',
                         value: 0.75
                     }
                 }
             },
             stroke     : {
                 width: 2
             },
             theme      : {
                 monochrome: {
                     enabled       : true,
                     color         : '#93C5FD',
                     shadeIntensity: 0.75,
                     shadeTo       : 'dark'
                 }
             },
             tooltip    : {
                 followCursor: true,
                 theme       : 'dark'
             },
             yaxis      : {
                 labels: {
                     style: {
                         colors: 'var(--fuse-text-secondary)'
                     }
                 }
             }
         };
 
         // Budget distribution
         this.chartBudgetDistribution = {
             chart      : {
                 fontFamily: 'inherit',
                 foreColor : 'inherit',
                 height    : '100%',
                 type      : 'radar',
                 sparkline : {
                     enabled: true
                 }
             },
             colors     : ['#818CF8'],
             dataLabels : {
                 enabled   : true,
                 formatter : (val: number): string | number => `${val}%`,
                 textAnchor: 'start',
                 style     : {
                     fontSize  : '13px',
                     fontWeight: 500
                 },
                 background: {
                     borderWidth: 0,
                     padding    : 4
                 },
                 offsetY   : -15
             },
             markers    : {
                 strokeColors: '#818CF8',
                 strokeWidth : 4
             },
             plotOptions: {
                 radar: {
                     polygons: {
                         strokeColors   : 'var(--fuse-border)',
                         connectorColors: 'var(--fuse-border)'
                     }
                 }
             },
             series     : this.data.budgetDistribution.series,
             stroke     : {
                 width: 2
             },
             tooltip    : {
                 theme: 'dark',
                 y    : {
                     formatter: (val: number): string => `${val}%`
                 }
             },
             xaxis      : {
                 labels    : {
                     show : true,
                     style: {
                         fontSize  : '12px',
                         fontWeight: '500'
                     }
                 },
                 categories: this.data.budgetDistribution.categories
             },
             yaxis      : {
                 max       : (max: number): number => parseInt((max + 10).toFixed(0), 10),
                 tickAmount: 7
             }
         };
 
         // Weekly expenses
         this.chartWeeklyExpenses = {
             chart  : {
                 animations: {
                     enabled: false
                 },
                 fontFamily: 'inherit',
                 foreColor : 'inherit',
                 height    : '100%',
                 type      : 'line',
                 sparkline : {
                     enabled: true
                 }
             },
             colors : ['#22D3EE'],
             series : this.data.weeklyExpenses.series,
             stroke : {
                 curve: 'smooth'
             },
             tooltip: {
                 theme: 'dark'
             },
             xaxis  : {
                 type      : 'category',
                 categories: this.data.weeklyExpenses.labels
             },
             yaxis  : {
                 labels: {
                     formatter: (val): string => `$${val}`
                 }
             }
         };
 
         // Monthly expenses
         this.chartMonthlyExpenses = {
             chart  : {
                 animations: {
                     enabled: false
                 },
                 fontFamily: 'inherit',
                 foreColor : 'inherit',
                 height    : '100%',
                 type      : 'line',
                 sparkline : {
                     enabled: true
                 }
             },
             colors : ['#4ADE80'],
             series : this.data.monthlyExpenses.series,
             stroke : {
                 curve: 'smooth'
             },
             tooltip: {
                 theme: 'dark'
             },
             xaxis  : {
                 type      : 'category',
                 categories: this.data.monthlyExpenses.labels
             },
             yaxis  : {
                 labels: {
                     formatter: (val): string => `$${val}`
                 }
             }
         };
 
         // Yearly expenses
         this.chartYearlyExpenses = {
             chart  : {
                 animations: {
                     enabled: false
                 },
                 fontFamily: 'inherit',
                 foreColor : 'inherit',
                 height    : '100%',
                 type      : 'line',
                 sparkline : {
                     enabled: true
                 }
             },
             colors : ['#FB7185'],
             series : this.data.yearlyExpenses.series,
             stroke : {
                 curve: 'smooth'
             },
             tooltip: {
                 theme: 'dark'
             },
             xaxis  : {
                 type      : 'category',
                 categories: this.data.yearlyExpenses.labels
             },
             yaxis  : {
                 labels: {
                     formatter: (val): string => `$${val}`
                 }
             }
         };
     }
}
