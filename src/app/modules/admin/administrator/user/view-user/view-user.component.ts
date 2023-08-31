import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { sortBy, startCase } from 'lodash-es';
import { AssetType, UserPagination } from '../user.types';
import { UserService } from '../user.service';
import { PositionService } from '../../position/position.service';
import { DepartmentService } from '../../department/department.service';
import { BranchService } from '../../branch/branch.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
    selector: 'app-view-user',
    templateUrl: './view-user.component.html',
    styleUrls: ['./view-user.component.scss']
})

export class ViewUserComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    formData: FormGroup;
    flashErrorMessage: string;
    roleData = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Telesale' },
        { id: 3, name: 'Stock' },
        { id: 4, name: 'Packing' },
        { id: 5, name: 'Manager' },
        { id: 6, name: 'ทีมยิงad' },
    ]

    departmentData: any = []
    positionData: any = []
    
    url: any = []
    url2: any = []
    branchData: any = []
    DatabyId: any = []

    files: File[] = [];
    filesSignature: File[] = [];

    asset_types: AssetType[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: any | null = null;
    filterForm: FormGroup;
    imageData = []
    fileUpload: string;
    fileUploadData: string;
    tagsEditMode: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    env_path = environment.API_URL;

    // me: any | null;
    // get roleType(): string {
    //     return 'marketing';
    // }

    supplierId: string | null;
    pagination: UserPagination;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA)
        public data: any,
        public dialogRef: MatDialogRef<ViewUserComponent>,
        // private _Service: PermissionService,
        private _Service: UserService,
        private _ServicePosition: PositionService,
        private _ServiceDepartment: DepartmentService,
        private _ServiceBranch: BranchService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
    ) {

       
        this.formData = this._formBuilder.group({
            user_id: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            permission_id: ['', Validators.required],
            department_id: ['', Validators.required],
            position_id: ['', Validators.required],
            branch_id: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', ,],
            image: ['',],
            image_signature: ['',]
        })
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // console.log('data',this.data)
        // return
        this.formData.reset();
        this._ServiceBranch.getBranch().subscribe((resp: any) => {
            this.branchData = resp.data;
        })
        this._ServiceDepartment.getDepartment().subscribe((resp: any) => {
            this.departmentData = resp.data;
        })
        this._ServicePosition.getPosition().subscribe((resp: any) => {
            this.positionData = resp.data;
        })
        this._Service.getUserbyId(this.data).subscribe((resp: any) => {
            this.DatabyId = resp.data
            this.formData.patchValue({
                id: this.DatabyId.id,
                user_id: this.DatabyId.user_id,
                branch_id: this.DatabyId.branch_id,
                department_id: this.DatabyId.department_id,
                email: this.DatabyId.email,
                first_name: this.DatabyId.first_name,
                last_name: this.DatabyId.last_name,
                permission_id: this.DatabyId.permission_id,
                position_id: this.DatabyId.position_id,
                status: this.DatabyId.status,
            })


            this.url = this.DatabyId.image
            this.url2 = this.DatabyId.image_signature
     
        })
    
   

      
    }


    discard(): void {

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
    onClose(): void {
        this.dialogRef.close();
    }


}
