import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { AssetType, PermissionPagination } from '../permission.types';
import { PermissionService } from '../permission.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
  selector: 'app-edit-permission',
  templateUrl: './edit-permission.component.html',
  styleUrls: ['./edit-permission.component.scss'],

  animations: fuseAnimations
})

export class EditPermissionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  permissionData: any;

  statusData = [
    { id: 0, name: 'ปิดการใช้งาน' },
    { id: 1, name: 'เปิดการใช้งาน' },
  ]
  // branchId = 2;
  permissionId: string;

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

  // me: any | null;
  // get roleType(): string {
  //     return 'marketing';
  // }

  supplierId: string | null;
  pagination: PermissionPagination;

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: FormBuilder,
    private _Service: PermissionService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
  ) {

    this.formData = this._formBuilder.group({
      name: ['', Validators.required],
      status: '',
    })

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.permissionId = this._activatedRoute.snapshot.paramMap.get('id');
    console.log('this._activatedRoute.snapshot.paramMap.get', this._activatedRoute.snapshot.paramMap.get('id'))
    console.log('permissionId', this.permissionId)
    // return
    this._Service.getpermissionbyId(this.permissionId).subscribe((resp: any) => {
      this.permissionData = resp.data
      // console.log('resp',resp.data)
      this.formData.patchValue({
        name: 'Admin',
        status: 1
      })



    })



  }

  GetBranch(): void {

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


  UpdatePermission(): void {
    this.flashMessage = null;
    this.flashErrorMessage = null;
    // Return if the form is invalid
    if (this.formData.invalid) {
      return;
    }
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      "title": "แก้ไขสาขา",
      "message": "คุณต้องการแก้ไขสาขาใช่หรือไม่ ",
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
        this.showFlashMessage('success');
        this._router.navigateByUrl('permission/list').then(() => {
          window.location.reload();
        });
          // this._Service.updatePermission(this.formData.value, this.permissionId).subscribe((res: any) => {
          //     this.showFlashMessage('success');
          //     this._router.navigateByUrl('permission/list').then(() => {
          //         window.location.reload();
          //     });
          // })


          // Sign in
          // this._Service.createUser(this.userForm.value)
          //     .subscribe({
          //         next: (res) => {
          //             console.log(res);
          //         },
          //         error: (err: HttpErrorResponse) => {
          //             this.userForm.enable();
          //             this.flashMessage = 'error';

          //             if (err.error.error['message'] === 'This attribute must be unique') {
          //                 this.flashErrorMessage = 'Username is already';
          //             } else {
          //                 this.flashErrorMessage = err.error.error['message'];
          //             }
          //         },
          //         complete: () => {
          //             this._location.back();
          //         },
          //     }
          //     );


        }
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



}
