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
    FormArray,
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
import { AssetType, Pagination } from '../page.types';
import { Service } from '../page.service';
import { PictureComponent } from 'app/modules/admin/administrator/announcement/picture/picture.component';

@Component({
    selector: 'edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    animations: fuseAnimations,
})
export class EditComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    files: File[] = [];
    files2: File[] = [];
    files3: File[] = [];

    blogData: any = [];
    statusData: any = [
        { value: true, name: 'เปิดใช้งาน' },
        { value: false, name: 'ปิดใช้งาน' },
    ];

    notifyData: any = [
        { value: true, name: 'เปิดแจ้งเตือน' },
        { value: false, name: 'ไม่แจ้งเตือน' },
    ];

    Id: string;
    itemData: any = [];

    formData: FormGroup;
    formData3: FormGroup;
    itemMaxData: any = [];

    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;

    item1Data: any = [];
    item2Data: any = [];

    max: boolean = false;

    supplierId: string | null;
    pagination: Pagination;

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
        private _authService: AuthService
    ) {
        this.formData = this._formBuilder.group({
            id: ['', Validators.required],
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [''],
            sale_price: [''],
            youtube: [''],
            product_category_id: [''],
            main_product_category_id: [''],
            size_id: [''],
            image: '',
        });

        this.formData3 = this._formBuilder.group({
            product_id: ['', Validators.required],
            image: '',
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.Id = this._activatedRoute.snapshot.paramMap.get('id');

        this.formData.patchValue({
            id: this.Id,
        });

        this.formData3.patchValue({
            product_id: this.Id,
        });
        this.getItem1();
        // this.getItem3();
    }

    somethingChanged(event: any): void {
        if (event.value.length > 0) {
            if (event.value[0].product_main_categorie_id == 2) {
                this.max = true;
            } else {
                this.max = false;
            }
        } else {
            this.max = false;
        }
        this._Service.getCategory1ById(event.value).subscribe((resp) => {
            this.item2Data = resp.data;
            this._changeDetectorRef.detectChanges();
        });
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
    }

    getItem1(): void {
        this._Service.getCategory1().subscribe((resp) => {
            this.item1Data = resp.data;
            this._changeDetectorRef.detectChanges();
            this._Service.getCategory3().subscribe((resp) => {
                this.itemMaxData = resp.data.sizes;
                this._changeDetectorRef.detectChanges();

                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;

                    this._Service
                        .getCategory1ById(this.itemData.main_product_category)
                        .subscribe((resp) => {
                            this.item2Data = resp.data;

                            if (this.itemData.main_product_category == 2) {
                                this.max = true;
                            } else {
                                this.max = false;
                            }

                            this.formData.patchValue({
                                name: this.itemData.name,
                                description: this.itemData.description,
                                price: this.itemData.price,
                                sale_price: this.itemData.sale_price,
                                youtube: this.itemData.youtube,
                                product_category_id: parseInt(
                                    this.itemData.product_category_id
                                ),
                                main_product_category_id: parseInt(
                                    this.itemData.main_product_category
                                ),
                                size_id: parseInt(this.itemData.size_id),
                                image: '',
                            });
                            this._changeDetectorRef.detectChanges();
                        });

                    this._changeDetectorRef.detectChanges();
                });
            });
        });
    }

    getItem3(): void {
        this._Service.getCategory3().subscribe((resp) => {
            this.itemMaxData = resp.data.sizes;
        });
    }

    deleteReview(id: any): void {
        this.flashMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการที่เลือก',
            message: 'คุณต้องการลบรายการที่เลือกใช่หรือไม่ ',
            icon: {
                show: false,
                name: 'heroicons_outline:exclamation',
                color: 'warning',
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
                this._Service.deletereview(id).subscribe({
                    next: (resp: any) => {
                        this.getItem1();
                    },
                    error: (err: any) => {
                        this._fuseConfirmationService.open({
                            title: 'กรุณาระบุข้อมูล',
                            message: err.error.message,
                            icon: {
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'warning',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: true,
                        });
                        console.log(err.error.message);
                    },
                });
            }
        });
    }

    delete(id: any): void {
        this.flashMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการที่เลือก',
            message: 'คุณต้องการลบรายการที่เลือกใช่หรือไม่ ',
            icon: {
                show: false,
                name: 'heroicons_outline:exclamation',
                color: 'warning',
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
                this._Service.deleteimage(id).subscribe({
                    next: (resp: any) => {
                        this.getItem1();
                    },
                    error: (err: any) => {
                        this._fuseConfirmationService.open({
                            title: 'กรุณาระบุข้อมูล',
                            message: err.error.message,
                            icon: {
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'warning',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: true,
                        });
                        console.log(err.error.message);
                    },
                });
            }
        });
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

    update(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกช้อมูล',
            message: 'คุณต้องการบันทึกช้อมูลใช่หรือไม่ ',
            icon: {
                show: false,
                name: 'heroicons_outline:exclamation',
                color: 'warning',
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
                let formValue = this.formData.value;

                const formData = new FormData();
                Object.entries(formValue).forEach(([key, value]: any[]) => {
                    formData.append(key, value);
                });

                for (var i = 0; i < this.files2.length; i++) {
                    formData.append('images[]', this.files2[i]);
                }

                // Disable the form
                this._Service.update(formData).subscribe({
                    next: (resp: any) => {
                        this.files = [];

                        this.files2 = [];

                        this.getItem1();
                        this._fuseConfirmationService.open({
                            title: 'บันทึกข้อมูลสำเร็จ',
                            message: 'ข้อมูลวิทยากรถูกบันทึกสำเร็จ!',
                            icon: {
                                show: true,
                                name: 'heroicons_outline:success',
                                color: 'success',
                            },
                            actions: {
                                confirm: {
                                    show: true,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: false,
                        });
                    },
                    error: (err: any) => {
                        this._fuseConfirmationService.open({
                            title: 'กรุณาระบุข้อมูล',
                            message: err.error.message,
                            icon: {
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'warning',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: true,
                        });
                        // console.log(err.error.message)
                    },
                });
            }
        });
    }

    create(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        const confirmation = this._fuseConfirmationService.open({
            title: 'สร้างรายการใหม่',
            message: 'คุณต้องการสร้างรายการใหม่ใช่หรือไม่ ',
            icon: {
                show: false,
                name: 'heroicons_outline:exclamation',
                color: 'warning',
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
                let formValue = this.formData3.value;

                const formData = new FormData();
                Object.entries(formValue).forEach(([key, value]: any[]) => {
                    formData.append(key, value);
                });

                this._Service.create_review(formData).subscribe({
                    next: (resp: any) => {
                        this.files3 = [];
                        this.getItem1();
                        const confirmation2 =
                            this._fuseConfirmationService.open({
                                title: 'บันทึกข้อมูลสำเร็จ',
                                message: 'ข้อมูลถูกบันทึกสำเร็จ!',
                                icon: {
                                    show: true,
                                    name: 'heroicons_outline:success',
                                    color: 'success',
                                },
                                actions: {
                                    confirm: {
                                        show: true,
                                        label: 'ยืนยัน',
                                        color: 'primary',
                                    },
                                    cancel: {
                                        show: false,
                                        label: 'ยกเลิก',
                                    },
                                },
                                dismissible: false,
                            });
                    },
                    error: (err: any) => {
                        this._fuseConfirmationService.open({
                            title: 'กรุณาระบุข้อมูล',
                            message: err.error.message,
                            icon: {
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'warning',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'ยืนยัน',
                                    color: 'primary',
                                },
                                cancel: {
                                    show: false,
                                    label: 'ยกเลิก',
                                },
                            },
                            dismissible: true,
                        });
                        // console.log(err.error.message);
                    },
                });
            }
        });
    }

    onSelect(event) {
        this.files.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData.patchValue({
            image: this.files[0],
        });
    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
        this.formData.patchValue({
            image: '',
        });
    }

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

    onSelect2(event) {
        this.files2.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
    }

    onRemove2(event) {
        this.files2.splice(this.files2.indexOf(event), 1);
    }

    onSelect3(event) {
        this.files3.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData3.patchValue({
            image: this.files3[0],
        });
    }

    onRemove3(event) {
        this.files3.splice(this.files3.indexOf(event), 1);
        this.formData3.patchValue({
            image: '',
        });
    }
}
