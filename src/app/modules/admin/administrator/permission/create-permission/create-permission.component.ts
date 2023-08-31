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
import { AssetType, CustomerPagination } from '../permission.types';
import { PermissionService } from '../permission.service';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
  selector: 'app-create-permission',
  templateUrl: './create-permission.component.html',
  styleUrls: ['./create-permission.component.scss'],
  animations: fuseAnimations

})

export class CreatePermissionComponent implements OnInit, AfterViewInit, OnDestroy {
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

  // me: any | null;
  // get roleType(): string {
  //     return 'marketing';
  // }

  supplierId: string | null;
  pagination: CustomerPagination;

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
      // contact: ['', Validators.required],
      // email: ['', Validators.required],
      // phone: ['', Validators.required],
      // adress: ['', Validators.required],
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


  createPermission(): void {
    this.flashMessage = null;
    this.flashErrorMessage = null;
    // Return if the form is invalid
    if (this.formData.invalid) {
      return;
    }
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      "title": "สร้างสิทธิ์ใหม่",
      "message": "คุณต้องการสร้างสิทธิ์ใหม่ใช่หรือไม่ ",
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

        // Disable the form
        // this.formData.disable();

        console.log(this.formData.value);
        this._router.navigateByUrl('permission/list').then(() => {
          window.location.reload();
          window.location.reload();
        });
        // this._Service.createPermission(this.formData.value).subscribe((resp: any) => {
        //   this._router.navigateByUrl('permission/list').then(() => {
        //     window.location.reload();
        //   });
        // })



      }
    });

  }
}
