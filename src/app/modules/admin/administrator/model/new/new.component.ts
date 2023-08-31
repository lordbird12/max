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
    AbstractControl,
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
import { MatFileUploadModule } from 'angular-material-fileupload';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import jsonDoc from './../../../../../doc';

@Component({
    selector: 'new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss'],

    animations: fuseAnimations,
})
export class NewComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatFileUploadModule) queue: MatFileUploadModule;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    files: File[] = [];
    files2: File[] = [];

    statusData: any = [
        { value: true, name: 'เปิดใช้งาน' },
        { value: false, name: 'ปิดใช้งาน' },
    ];

    notifyData: any = [
        { value: true, name: 'เปิดแจ้งเตือน' },
        { value: false, name: 'ไม่แจ้งเตือน' },
    ];

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

    courseData: any = [];
    instructorsData: any = [];

    currentFile?: File;
    progress = 0;
    message = '';

    fileName = 'กรุณาเลือกไฟล์';
    fileInfos?: Observable<any>;

    fileUploads: any = [];

    supplierId: string | null;
    pagination: Pagination;

    editordoc = jsonDoc;

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
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit(): Promise<void> {
        this.formData = this._formBuilder.group({
            course_category_id: ['', Validators.required],
            instructor_id: ['', Validators.required],
            name: ['', Validators.required],
            description: '',
            requirements: '',
            objective: '',
            time: [''],
            qty: [''],
            more_detail: '',
            youtube: [''],
            image: '',
        });
        this.getCourseCategory();
        this.getInstructor();

        this.editor1 = new Editor();
        this.editor2 = new Editor();
        this.editor3 = new Editor();
        this.editor4 = new Editor();

    }

    getCourseCategory(): void {
        this._Service.getCategory().subscribe((resp) => {
            this.courseData = resp.data;
        });
    }

    getInstructor(): void {
        this._Service.getInstructor().subscribe((resp) => {
            this.instructorsData = resp.data;
        });
    }

    get doc(): AbstractControl {
        return this.formData.get('editorContent');
    }

    discard(): void {}

    /**
     * After view init
     */
    ngAfterViewInit(): void {}

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this.editor1.destroy();
        this.editor2.destroy();
        this.editor3.destroy();
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
                let formValue = this.formData.value;

                const formData = new FormData();
                Object.entries(formValue).forEach(([key, value]: any[]) => {
                    formData.append(key, value);
                });

                for (var i = 0; i < this.fileUploads.length; i++) {
                    formData.append('files[]', this.fileUploads[i]);
                }

                this._Service.create(formData).subscribe({
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
}
