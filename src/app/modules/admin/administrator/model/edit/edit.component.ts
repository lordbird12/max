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
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import jsonDoc from './../../../../../doc';

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

    courseData: any = [];
    instructorsData: any = [];

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
    flashErrorMessage: string;
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;

    currentFile?: File;
    progress = 0;
    message = '';

    fileName = 'กรุณาเลือกไฟล์';
    fileInfos?: Observable<any>;

    fileUploads: any = [];

    supplierId: string | null;
    pagination: Pagination;

    editor1: Editor;
    editor2: Editor;
    editor3: Editor;
    editor4: Editor;
    toolbar: Toolbar = [
        // default value
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link', 'image'],
        ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
        ['horizontal_rule', 'format_clear'],
    ];

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
            course_category_id: ['', Validators.required],
            instructor_id: ['', Validators.required],
            name: ['', Validators.required],
            description: [''],
            requirements: [''],
            qty: [''],
            time: [''],
            objective: [''],
            more_detail: [''],
            youtube: [''],
            image: '',
            reviews: this._formBuilder.array([]),
            curriculums: this._formBuilder.array([]),
            files: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.editor1 = new Editor();
        this.editor2 = new Editor();
        this.editor3 = new Editor();
        this.editor4 = new Editor();
        this.getCourseCategory();
        this.getInstructor();
        this.Id = this._activatedRoute.snapshot.paramMap.get('id');
    }

    getById(): void {
        this._Service.getById(this.Id).subscribe((resp: any) => {
            this.itemData = resp.data;
            this.formData.patchValue({
                id: this.itemData.id,
                course_category_id: Number(this.itemData.course_category_id),
                instructor_id: Number(this.itemData.instructor_id),
                name: this.itemData.name,
                description: this.itemData.description,
                time: this.itemData.time,
                qty: this.itemData.qty,
                objective: this.itemData.objective,
                requirements: this.itemData.requirements,
                more_detail: this.itemData.more_detail,
                youtube: this.itemData.youtube,
                files: this.itemData.files,
            });

            this.itemData.reviews.forEach((element) => {
                this.add_reviews_with_data(element);
            });

            this.itemData.curriculums.forEach((element) => {
                this.add_curriculums_with_data(element);
            });

            this._changeDetectorRef.detectChanges();
        });
    }

    getCourseCategory(): void {
        this._Service.getCategory().subscribe((resp) => {
            this.courseData = resp.data;
        });
    }

    getInstructor(): void {
        this._Service.getInstructor().subscribe((resp) => {
            this.instructorsData = resp.data;
            this.getById();
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

    update(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'แก้ไขรายการ',
            message: 'คุณต้องการแก้ไขรายการใช่หรือไม่ ',
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
                        const confirmation2 =
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

                        confirmation2.afterClosed().subscribe((result) => {
                            // If the confirm button pressed...
                            if (result === 'confirmed') {
                                this._router
                                    .navigateByUrl(
                                        'course/edit/' + resp.data.id
                                    )
                                    .then(() => {});
                            }
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

    update2(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'แก้ไขรายการ',
            message: 'คุณต้องการแก้ไขรายการใช่หรือไม่ ',
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
                this.curriculums().value.forEach((element) => {
                    this._Service.update2(element).subscribe({
                        next: (resp: any) => {},
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
                });
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
            }
        });
    }

    update3(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid
        // if (this.formData.invalid) {
        //     return;
        // }
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'แก้ไขรายการ',
            message: 'คุณต้องการแก้ไขรายการใช่หรือไม่ ',
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
                this.reviews().value.forEach((element) => {
                    var data = [];

                    data.push({
                        course_id: this.Id,
                        name: element.name,
                        description: element.description,
                    });

                    this._Service.update3(data[0]).subscribe({
                        next: (resp: any) => {},
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
                });
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
            }
        });
    }

    update4(): void {
        this.flashMessage = null;
        this.flashErrorMessage = null;
        // Return if the form is invalid

        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'แก้ไขรายการ',
            message: 'คุณต้องการแก้ไขรายการใช่หรือไม่ ',
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
                var data = [];

                data.push({
                    course_id: this.Id,
                    uploads: this.fileUploads,
                });

                this._Service.update4(data[0]).subscribe({
                    next: (resp: any) => {
                        const confirmation2 =
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

                        confirmation2.afterClosed().subscribe((result) => {
                            // If the confirm button pressed...
                            if (result === 'confirmed') {
                                this.fileUploads = [];
                                this.getById();
                            }
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

    // reviews

    reviews(): FormArray {
        return this.formData.get('reviews') as FormArray;
    }

    new_reviews(): FormGroup {
        return this._formBuilder.group({
            id: '',
            name: '',
            description: '',
        });
    }

    remove_reviews(id: any, i: number): void {
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
                    // this._Service.delete2(id).subscribe({
                    //     next: (resp: any) => {
                    //         this.reviews().removeAt(i);
                    //         this._changeDetectorRef.detectChanges();
                    //         this._fuseConfirmationService.open({
                    //             title: 'ลบรายการสำเร็จ',
                    //             message:
                    //                 'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
                    //             icon: {
                    //                 show: true,
                    //                 name: 'heroicons_outline:exclamation',
                    //                 color: 'warning',
                    //             },
                    //             actions: {
                    //                 confirm: {
                    //                     show: false,
                    //                     label: 'ยืนยัน',
                    //                     color: 'primary',
                    //                 },
                    //                 cancel: {
                    //                     show: false,
                    //                     label: 'ยกเลิก',
                    //                 },
                    //             },
                    //             dismissible: true,
                    //         });
                    //     },
                    //     error: (err: any) => {
                    //         this._fuseConfirmationService.open({
                    //             title: 'กรุณาระบุข้อมูล',
                    //             message: err.error.message,
                    //             icon: {
                    //                 show: true,
                    //                 name: 'heroicons_outline:exclamation',
                    //                 color: 'warning',
                    //             },
                    //             actions: {
                    //                 confirm: {
                    //                     show: false,
                    //                     label: 'ยืนยัน',
                    //                     color: 'primary',
                    //                 },
                    //                 cancel: {
                    //                     show: false,
                    //                     label: 'ยกเลิก',
                    //                 },
                    //             },
                    //             dismissible: true,
                    //         });
                    //     },
                    // });
                } else {
                    this.reviews().removeAt(i);
                    this._changeDetectorRef.detectChanges();
                }
            }
        });
    }

    add_reviews(): void {
        this.reviews().push(this.new_reviews());
    }

    // reviews with data

    new_reviews_with_data(item: any): FormGroup {
        return this._formBuilder.group({
            id: item.id,
            name: item.name,
            description: item.description,
        });
    }

    add_reviews_with_data(item: any): void {
        this.reviews().push(this.new_reviews_with_data(item));
    }

    // curriculums

    curriculums(): FormArray {
        return this.formData.get('curriculums') as FormArray;
    }

    new_curriculums(): FormGroup {
        return this._formBuilder.group({
            id: '',
            name: '',
            time: '',
            course_id: this.Id,
        });
    }

    remove_curriculums(id: any, i: number): void {
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
                    // this._Service.delete2(id).subscribe({
                    //     next: (resp: any) => {
                    //         this.reviews().removeAt(i);
                    //         this._changeDetectorRef.detectChanges();
                    //         this._fuseConfirmationService.open({
                    //             title: 'ลบรายการสำเร็จ',
                    //             message:
                    //                 'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
                    //             icon: {
                    //                 show: true,
                    //                 name: 'heroicons_outline:exclamation',
                    //                 color: 'warning',
                    //             },
                    //             actions: {
                    //                 confirm: {
                    //                     show: false,
                    //                     label: 'ยืนยัน',
                    //                     color: 'primary',
                    //                 },
                    //                 cancel: {
                    //                     show: false,
                    //                     label: 'ยกเลิก',
                    //                 },
                    //             },
                    //             dismissible: true,
                    //         });
                    //     },
                    //     error: (err: any) => {
                    //         this._fuseConfirmationService.open({
                    //             title: 'กรุณาระบุข้อมูล',
                    //             message: err.error.message,
                    //             icon: {
                    //                 show: true,
                    //                 name: 'heroicons_outline:exclamation',
                    //                 color: 'warning',
                    //             },
                    //             actions: {
                    //                 confirm: {
                    //                     show: false,
                    //                     label: 'ยืนยัน',
                    //                     color: 'primary',
                    //                 },
                    //                 cancel: {
                    //                     show: false,
                    //                     label: 'ยกเลิก',
                    //                 },
                    //             },
                    //             dismissible: true,
                    //         });
                    //     },
                    // });
                } else {
                    this.reviews().removeAt(i);
                    this._changeDetectorRef.detectChanges();
                }
            }
        });
    }

    add_curriculums(): void {
        this.curriculums().push(this.new_curriculums());
    }

    // curriculums with data

    new_curriculums_with_data(item: any): FormGroup {
        return this._formBuilder.group({
            id: item.id,
            name: item.name,
            time: item.time,
            course_id: item.course_id,
        });
    }

    add_curriculums_with_data(item: any): void {
        this.curriculums().push(this.new_curriculums_with_data(item));
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

    upload(): void {
        this.progress = 0;
        this.message = '';

        if (this.currentFile) {
            this._Service.upload(this.currentFile).subscribe(
                (event: any) => {
                    if (event.type === HttpEventType.UploadProgress) {
                        this.progress = Math.round(
                            (100 * event.loaded) / event.total
                        );
                    } else if (event instanceof HttpResponse) {
                        this.fileUploads.push(event.body.data.path);
                        this.message = event.body.message;
                        setTimeout(() => {
                            this.progress = 0;
                            this.message = '';

                            this.fileName = 'กรุณาเลือกไฟล์';
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        }, 1500);
                    }
                },
                (err: any) => {
                    console.log(err);
                    this.progress = 0;

                    if (err.error && err.error.message) {
                        this.message = err.error.message;
                    } else {
                        this.message = 'Could not upload the file!';
                    }

                    this.currentFile = undefined;
                }
            );
        }
    }

    selectFile(event: any): void {
        if (event.target.files && event.target.files[0]) {
            const file: File = event.target.files[0];
            this.currentFile = file;
            this.fileName = this.currentFile.name;
        } else {
            this.fileName = 'กรุณาเลือกไฟล์';
        }
    }

    removeFile(i: number): void {
        this.fileUploads.splice(i, 1);

        this._changeDetectorRef.markForCheck();
    }

    removeFileAdd(id: number): void {
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
                this._Service.deleteFile(id).subscribe(
                    (event: any) => {
                        this.getById();
                        this._fuseConfirmationService.open({
                            title: 'ลบรายการสำเร็จ',
                            message: 'รายการที่คุณเลือกได้ถูกลบออกจากระบบแล้ว',
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
                    (err: any) => {
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
                    }
                );
            }
        });
    }
}
