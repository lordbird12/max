import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,Component,HostListener,NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, lastValueFrom, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { sortBy, startCase } from 'lodash-es';
import { AssetType, BranchPagination,DataBank } from '../logistic.types';
import { Service } from '../page.service';
import { ThemePalette } from '@angular/material/core';
import Swal from 'sweetalert2'

@Component({
    selector: 'print',
    templateUrl: './print.component.html',
    styleUrls: ['./print.component.css'],
    // encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    printId: any;
    printshow:boolean = true;
    bankData: any;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _Service: Service,
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
        this.printId = this._activatedRoute.snapshot.paramMap.get('id');
        this._Service.getBankTranById(this.printId).subscribe((resp: DataBank) => {
            this.bankData = resp.data
            console.log('bankData', this.bankData)
        })
    }

    public printMe(): void {
        this.printshow = false;
        this._changeDetectorRef.detectChanges()
        window.print();
    }

    @HostListener("window:beforeprint", ["$event"])
    onBeforePrint() {
        // console.log("onBeforePrint");
        // this.message = "before print triggered ";
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
}
