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
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts
import { AssetType, PositionPagination } from '../page.types';
import { Service } from '../page.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
    selector: 'new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss'],

    animations: fuseAnimations
})

export class NewComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    formData: FormGroup
=======
import { AssetType, BranchPagination, DataBank } from '../page.types';
import { Service } from '../page.service';
import { PictureComponent } from '../picture/picture.component';
import moment from 'moment';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: fuseAnimations,
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    Id: any;
    recruitment_companie_id: any;
    Data: any;
    formData: FormGroup;
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts

    ClassData: any;

    supplierId: string | null;
    pagination: PositionPagination;

=======
    supplierId: string | null;
    pagination: BranchPagination;
    public UserAppove: any = [];

    filterType: any;
    bank_trans_filter: any[] = [];

    rawDataFilter: any[] = [];
    filterData = [];
    dataRow = [];
    columns = [
        {
            price: 'price',
            type: 'type',
            remark: 'remark',
            create_by: 'create_by',
        },
    ];
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
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
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts
        private _authService: AuthService,
    ) {



    }
=======
        private _authService: AuthService
    ) {}
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts

        this.formData = this._formBuilder.group({
            classsId: ['', Validators.required],
            date: ['', Validators.required],
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            limit: ['', Validators.required]
        })

        this.getClass();
    }

    getClass(): void {
        this._Service.getClass().subscribe((resp) => {
            this.ClassData = resp.data;
        });
    }

    discard(): void {
=======
        this.Id = this._activatedRoute.snapshot.paramMap.get('id');
        this.recruitment_companie_id = this._activatedRoute.snapshot.paramMap.get('recruitment_companie_id');
        this._Service.getUserJobById(this.Id).subscribe((resp: any) => {
            this.Data = resp.data;

            this.filterData = this.Data.user_job_interestings;
            this.rawDataFilter = this.filterData;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
        const user = JSON.parse(localStorage.getItem('user')) || null;
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts

        this.formData = this._formBuilder.group({
            user_id: user.id,
            user_job_id: this.Id,
            recruitment_companie_id: this.recruitment_companie_id,
            topic: 'ทดสอบนัดสัมภาษณ์งาน',
            duration: '5',
            agenda: 'ทดสอบนัดสัมภาษณ์งาน',
            start_time: '',
        });
    }

<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts
=======
    discard(): void {}
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts

    /**
     * After view init
     */
    ngAfterViewInit(): void {}

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
    }

<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts

=======
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
    create(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts
            "title": "สร้างรายการใหม่",
            "message": "คุณต้องการสร้างรายการใหม่ใช่หรือไม่ ",
            "icon": {
                "show": false,
                "name": "heroicons_outline:exclamation",
                "color": "warning"
=======
            title: 'นัดสัมภาษณ์งาน',
            message: 'คุณต้องการนัดสัมภาษณ์งานใหม่ใช่หรือไม่ ',
            icon: {
                show: false,
                name: 'heroicons_outline:exclamation',
                color: 'warning',
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'ยืนยัน',
                    color: 'primary',
                },
                cancel: {
                    show: true,
                    label: 'ยกเลิก',
                },
            },
            dismissible: true,
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts

                this._Service.create(this.formData.value).subscribe({
                    next: (resp: any) => {
                        this._router.navigateByUrl('round/list').then(() => { })
=======
                this.formData.patchValue({
                    start_time: moment(this.formData.value.date).format(
                        'YYYY-MM-DD'
                    ),
                });
                let formValue = this.formData.value;
              

                this.formData.disable();
                this._Service.meeting(formValue).subscribe({
                    next: (resp: any) => {
                        location.reload();
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
                    },
                    error: (err: any) => {
                        this.formData.enable();
                        this._fuseConfirmationService.open({
                            "title": "กรุณาระบุข้อมูล",
                            "message": err.error.message,
                            "icon": {
                                "show": true,
                                "name": "heroicons_outline:exclamation",
                                "color": "warning"
                            },
                            "actions": {
                                "confirm": {
                                    "show": false,
                                    "label": "ยืนยัน",
                                    "color": "primary"
                                },
                                "cancel": {
                                    "show": false,
                                    "label": "ยกเลิก",

                                }
                            },
                            "dismissible": true
                        });
                        console.log(err.error.message)
                    }
                })
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts
=======

>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
            }
        });
    }
<<<<<<< HEAD:src/app/modules/admin/administrator/profile/new/new.component.ts


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

=======
    showFlashMessage(arg0: string) {
        throw new Error('Method not implemented.');
    }


    showPicture(imgObject: any): void {
        this._matDialog
            .open(PictureComponent, {
                autoFocus: false,
                data: {
                    imgSelected: imgObject,
                },
            })
            .afterClosed()
            .subscribe(() => {
                // Go up twice because card routes are setup like this; "card/CARD_ID"
                // this._router.navigate(['./../..'], {relativeTo: this._activatedRoute});
            });
    }
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/modules/recruit/profile/profile.component.ts
}
