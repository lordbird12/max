import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { AssetType, BranchPagination } from '../page.types';
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
    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;
    supplierId: string | null;
    pagination: BranchPagination;
    public UserAppove: any = [];
    // toppings: any = [
    //     { id: 1, name: 'พระธรรมกาย' },
    //     { id: 2, name: 'พระวิริยะ' },
    //     { id: 3, name: 'พระมโนธรรม' },
    // ];
    degreeData: any = [
        { id: 1, name: 'ประถมศึกษาปีที่6' },
        { id: 2, name: 'มัธยมศึกษาปีที่3' },
        { id: 3, name: 'มัธยมศึกษาปีที่6' },
        { id: 4, name: 'ประกาศนียบัตรวิชาชีพ (ปวช.)' },
        { id: 5, name: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)' },
        { id: 6, name: 'ปริญญาตรี' },
        { id: 7, name: 'ปริญญาโท' },
        { id: 8, name: 'ปริญญาเอก' },
    ];


    toppings: any = []
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
        this.formData = this._formBuilder.group({
            user_id: ['', Validators.required],
            position: ['', Validators.required],
            salary: '',
            exp: '',
            major: '',
            degree: '',
            qty: '',
            description: '',
        })


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        const user = JSON.parse(localStorage.getItem('user')) || null;
        this.formData = this._formBuilder.group({
            user_id: user.id,
            position: ['', Validators.required],
            salary: '',
            exp: '',
            major: '',
            degree: '',
            qty: '',
            description: '',
        })


        this._Service.getUsers().subscribe((resp: any) => {
            this.toppings = resp.data;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions

    }


    create(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            "title": "เพิ่มการสรรหา",
            "message": "คุณต้องการเพิ่มการสรรหาใหม่ใช่หรือไม่ ",
            "icon": {
                "show": false,
                "name": "heroicons_outline:exclamation",
                "color": "warning"
            },
            "actions": {
                "confirm": {
                    "show": true,
                    "label": "ยืนยัน",
                    "color": "primary"
                },
                "cancel": {
                    "show": true,
                    "label": "ยกเลิก"
                }
            },
            "dismissible": true
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if (result === 'confirmed') {
                // console.log(this.formData.value);
                this._Service.create(this.formData.value).subscribe(
                    {
                        next: (resp: any) => {
                            this._router.navigateByUrl('recruit/list').then(() => { });
                        },
                        error: (err: any) => {
                            this._fuseConfirmationService.open({
                                "title": "กรุณาระบุข้อมูล",
                                "message": "ไม่สามารถบันทึกข้อมูลได้กรุณาตรวจสอบใหม่อีกครั้ง",
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
                        }
                    }
                )

            }
        });

    }
    showFlashMessage(arg0: string) {
        throw new Error('Method not implemented.');
    }
}
