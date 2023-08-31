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
import { EditPopupComponent } from '../edit-popup/edit-popup.component';

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
    files21: File[] = [];
    files22: File[] = [];
    files23: File[] = [];
    files24: File[] = [];
    files25: File[] = [];
    files26: File[] = [];
    files27: File[] = [];
    files28: File[] = [];

    dtOptions: DataTables.Settings = {};
    dataRow: any = [];

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
    itemMaxeData: any = [];
    itemModelData: any = [];
    itemColorData: any = [];

    formData: FormGroup;
    formData2: FormGroup;

    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;

    // me: any | null;
    // get roleType(): string {
    //     return 'marketing';
    // }

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
            image: '',
        });

        this.formData2 = this._formBuilder.group({
            model_category_id: ['', Validators.required],
            name1: ['', Validators.required],
            color_id1: ['', Validators.required],
            maxe_id1: [1, Validators.required],
            image1: '',
            name2: ['', Validators.required],
            color_id2: ['', Validators.required],
            maxe_id2: [2, Validators.required],
            image2: '',
            name3: ['', Validators.required],
            color_id3: ['', Validators.required],
            maxe_id3: [3, Validators.required],
            image3: '',
            name4: ['', Validators.required],
            color_id4: ['', Validators.required],
            maxe_id4: [4, Validators.required],
            image4: '',
            name5: ['', Validators.required],
            color_id5: ['', Validators.required],
            maxe_id5: [5, Validators.required],
            image5: '',
            name6: ['', Validators.required],
            color_id6: ['', Validators.required],
            maxe_id6: [6, Validators.required],
            image6: '',
            name7: ['', Validators.required],
            color_id7: ['', Validators.required],
            maxe_id7: [7, Validators.required],
            image7: '',
            name8: ['', Validators.required],
            color_id8: ['', Validators.required],
            maxe_id8: [8, Validators.required],
            image8: '',
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
        this._Service.getById(this.Id).subscribe((resp: any) => {
            this.itemData = resp.data;
            this.formData.patchValue({
                id: this.itemData.id,
                name: this.itemData.name,
                image: '',
            });

            this.formData2.patchValue({
                model_category_id: this.Id,
            });
            this._changeDetectorRef.detectChanges();
        });

        this.formData2.patchValue({
            product_main_categorie_id: this.Id,
        });

        this.getColor();
        this.getMax();
        this._changeDetectorRef.detectChanges();
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

    getColor(): void {
        this._Service.getColor().subscribe((resp) => {
            this.itemColorData = resp.data;
        });
    }

    getMax(): void {
        this._Service.getMax().subscribe((resp) => {
            this.itemMaxeData = resp.data;
        });
    }

    update(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกข้อมูล',
            message: 'คุณต้องการบันทึกข้อมูลใช่หรือไม่!',
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
                // Disable the form
                this._Service.update(formData).subscribe({
                    next: (resp: any) => {
                        this.files = [];
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
                        // console.log(err.error.message)
                    },
                });
            }
        });
    }

    save(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'บันทึกข้อมูล',
            message: 'คุณต้องการบันทึกข้อมูลใช่หรือไม่!',
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
                let formValue = this.formData2.value;

                const formData = new FormData();
                Object.entries(formValue).forEach(([key, value]: any[]) => {
                    formData.append(key, value);
                });
                // Disable the form
                this._Service.save(formData).subscribe({
                    next: (resp: any) => {
                        this.files21 = [];
                        this.files22 = [];
                        this.files23 = [];
                        this.files24 = [];
                        this.files25 = [];
                        this.files26 = [];
                        this.files27 = [];
                        this.files28 = [];
                        this._Service
                            .getById(this.Id)
                            .subscribe((resp: any) => {
                                this.itemData = resp.data;
                                this.formData.patchValue({
                                    id: this.itemData.id,
                                    name: this.itemData.name,
                                    image: '',
                                });
                                this._changeDetectorRef.detectChanges();
                            });
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
                        // console.log(err.error.message)
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

    onSelect21(event) {
        this.files21.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image1: this.files21[0],
        });
    }

    onRemove21(event) {
        this.files21.splice(this.files21.indexOf(event), 1);
        this.formData2.patchValue({
            image1: '',
        });
    }

    onSelect22(event) {
        this.files22.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image2: this.files22[0],
        });
    }

    onRemove22(event) {
        this.files22.splice(this.files22.indexOf(event), 1);
        this.formData2.patchValue({
            image2: '',
        });
    }

    onSelect23(event) {
        this.files23.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image3: this.files23[0],
        });
    }

    onRemove23(event) {
        this.files23.splice(this.files23.indexOf(event), 1);
        this.formData2.patchValue({
            image3: '',
        });
    }

    onSelect24(event) {
        this.files24.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image4: this.files24[0],
        });
    }

    onRemove24(event) {
        this.files24.splice(this.files24.indexOf(event), 1);
        this.formData2.patchValue({
            image4: '',
        });
    }

    onSelect25(event) {
        this.files25.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image5: this.files25[0],
        });
    }

    onRemove25(event) {
        this.files25.splice(this.files25.indexOf(event), 1);
        this.formData2.patchValue({
            image5: '',
        });
    }

    onSelect26(event) {
        this.files26.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image6: this.files26[0],
        });
    }

    onRemove26(event) {
        this.files26.splice(this.files26.indexOf(event), 1);
        this.formData2.patchValue({
            image6: '',
        });
    }

    onSelect27(event) {
        this.files27.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image7: this.files27[0],
        });
    }

    onRemove27(event) {
        this.files27.splice(this.files27.indexOf(event), 1);
        this.formData2.patchValue({
            image7: '',
        });
    }

    onSelect28(event) {
        this.files28.push(...event.addedFiles);
        // Trigger Image Preview
        setTimeout(() => {
            this._changeDetectorRef.detectChanges();
        }, 150);
        this.formData2.patchValue({
            image8: this.files28[0],
        });
    }

    onRemove28(event) {
        this.files28.splice(this.files28.indexOf(event), 1);
        this.formData2.patchValue({
            image8: '',
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

    edit(item: any): void {
        this._matDialog
            .open(EditPopupComponent, {
                autoFocus: false,
                data: {
                    item: item,
                },
            })
            .afterClosed()
            .subscribe(() => {
                this._Service.getById(this.Id).subscribe((resp: any) => {
                    this.itemData = resp.data;
                    this.formData.patchValue({
                        id: this.itemData.id,
                        name: this.itemData.name,
                        image: '',
                    });
        
                    this.formData2.patchValue({
                        model_category_id: this.Id,
                    });
                    this._changeDetectorRef.detectChanges();
                });
            });
    }

    delete2(id: any, i: number): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'ลบรายการ',
            message: 'คุณต้องการลบรายการใช่หรือไม่!',
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
                if (id != '') {
                    this._Service.delete2(id).subscribe({
                        next: (resp: any) => {
                            this._Service
                                .getById(this.Id)
                                .subscribe((resp: any) => {
                                    this.itemData = resp.data;
                                    this.formData.patchValue({
                                        id: this.itemData.id,
                                        name: this.itemData.name,
                                        image: '',
                                    });
                                    this._changeDetectorRef.detectChanges();
                                });
                            this._fuseConfirmationService.open({
                                title: 'ลบรายการสำเร็จ',
                                message:
                                    'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
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
                        },
                    });
                }
            }
        });
    }
}
