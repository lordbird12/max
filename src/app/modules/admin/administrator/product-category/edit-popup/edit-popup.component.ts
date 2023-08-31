import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    debounceTime,
    map,
    Observable,
    of,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Service } from '../page.service';

@Component({
    selector: 'edit-popup',
    templateUrl: './edit-popup.component.html',
    // encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPopupComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    formData: FormGroup;
    files: File[] = [];

    itemMaxeData: any = [];
    itemModelData: any = [];
    itemData: any = [];

    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) private _data,
        private _formBuilder: FormBuilder,
        private _matDialogRef: MatDialogRef<EditPopupComponent>,
        private _fuseConfirmationService: FuseConfirmationService,
        private _Service: Service
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // this.imgSelected = this._data.imgSelected;
        this.formData = this._formBuilder.group({
            id: [this._data.item.id, Validators.required],
            product_main_categorie_id: [
                this._data.item.product_main_categorie_id,
                Validators.required,
            ],
            name: [this._data.item.name, Validators.required],
            image: '',
        });

        this.getProduct();
        this._changeDetectorRef.detectChanges();
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

    getProduct(): void {
        this._Service.getProduct().subscribe((resp) => {
            this.itemData = resp.data;
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
}
