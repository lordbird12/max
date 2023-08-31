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
import { AssetType, BranchPagination } from '../logistic.types';
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
    bankData: any = [
        { id: 1, name: 'KBANK' },
        { id: 2, name: 'KTB' },
        { id: 3, name: 'GSB' },
        { id: 4, name: 'SCB' },
        { id: 5, name: 'BBL' },
        { id: 6, name: 'BAY' },
        { id: 7, name: 'CITI' },
        { id: 8, name: 'NBANK' },
        { id: 9, name: 'GHB' },
        { id: 10, name: 'SCIB' },
        { id: 11, name: 'TMB' },
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
            name: ['', Validators.required],
            number: ['', Validators.required],
            bank_of: '',
            description: '',
            approve: this._formBuilder.array([]),
        })


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.formData = this._formBuilder.group({
            name: ['', Validators.required],
            number: ['', Validators.required],
            bank_of: '',
            description: '',
            approve: this._formBuilder.array([]),
        })


        this._Service.getUsers().subscribe((resp: any) => {
            this.toppings = resp.data;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        })

    }

    approve(): FormArray {
        return this.formData.get('approve') as FormArray

    }

    NewUser(): FormGroup {
        return this._formBuilder.group({
            user_id: '',
            remark: '-'
        });
    }

    addUser(): void {
        this.approve().push(this.NewUser());

        // alert(1)
    }

    removeUser(i: number): void {
        this.approve().removeAt(i);

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


    NewBank(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            "title": "เพิ่มบัญชีธนาคารใหม่",
            "message": "คุณต้องการเพิ่มบัญชีธนาคารใหม่ใช่หรือไม่ ",
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
                this._Service.newBank(this.formData.value).subscribe(
                    {
                        next: (resp: any) => {
                            this._router.navigateByUrl('bank/list').then(() => { });
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

    CheckUserAppove(event, i): void {
        let itemData = this.formData.value.approve
        // this.addUser()
        if (event.checked === true) {
            this.addUser()
            this.UserAppove.push(event.source.value);
            itemData[i] = {
                user_id: event.source.value,
                remark: '-'
            }

            if (this.UserAppove) {
                this.formData.controls.approve.patchValue(itemData)
            }
        }
        else {

            this.UserAppove = this.UserAppove.filter(function (value, index, arr) {

                return value != event.source.value;

            });
            this.removeUser(i);

        }

    }








}
