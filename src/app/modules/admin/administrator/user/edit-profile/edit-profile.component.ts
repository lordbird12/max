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
import { AssetType, DataUser, UserPagination } from '../user.types';
import { UserService } from '../user.service';
import { MatTableDataSource } from '@angular/material/table';
import { ViewUserComponent } from '../view-user/view-user.component';
import { data } from 'jquery';
// import { ImportOSMComponent } from '../card/import-osm/import-osm.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})

export class EditProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  displayedColumns: string[] = ['id',
    'first_name',
    'last_name',
    'email',
    'status',
    'create_by',
    'created_at',
    'actions'];
  dataSource: MatTableDataSource<DataUser>;
  dataRow: any = []
  url_pro: any = []
  url_sig: any = []
  Dep: any = []
  Pos: any = []
  Bra: any = []
  branch: any = []
  position: any = []
  department: any = []
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


  products$: Observable<any>;
  asset_types: AssetType[];
  flashMessage: 'success' | 'error' | null = null;
  isLoading: boolean = false;
  searchInputControl: FormControl = new FormControl();
  selectedProduct: any | null = null;
  filterForm: FormGroup;
  tagsEditMode: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  env_path = environment.API_URL;

  me: any | null;
  get roleType(): string {
    return 'marketing';
  }

  supplierId: string | null;
  pagination: UserPagination;

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService,
    private _formBuilder: FormBuilder,
    // private _Service: PermissionService,
    private _Service: UserService,
    private _matDialog: MatDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
  ) {
    this.formData = this._formBuilder.group({
      id: ['',],
      user_id: ['',],
      first_name: ['',],
      last_name: ['',],
      permission_id: ['',],
      department_id: ['',],
      position_id: ['',],
      branch_id: ['',],
      email: ['',],
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
    this._Service.getUserprofile().subscribe((resp: any) => {
      this.dataRow = resp.data;
      this._changeDetectorRef.markForCheck();
      this.Bra = this.dataRow.branch.name
      this.Pos = this.dataRow.position.name
      this.Dep = this.dataRow.department.name
      // this.dataRow.id = 4
      // this.namets = this.dataRow.first_name
      console.log(this.dataRow, 'datarow')
      // this.dataSource = new MatTableDataSource(this.dataRow)
      // this.dataSource.paginator = this._paginator;
      // this.dataSource.sort = this._sort;
      // this._changeDetectorRef.markForCheck();
      this.url_pro = this.dataRow.image
      this.url_sig = this.dataRow.image_signature
      this.formData.patchValue({
        id: this.dataRow.id,
        first_name: this.dataRow.first_name,
        last_name: this.dataRow.last_name,
        email: this.dataRow.email,
      })
    })

  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // if (this._sort && this._paginator) {
    //     // Set the initial sort
    //     this._sort.sort({
    //         id: 'id',
    //         start: 'asc',
    //         disableClear: true
    //     });

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();

    //     // If the user changes the sort order...
    //     this._sort.sortChange
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .subscribe(() => {
    //             // Reset back to the first page
    //             this._paginator.pageIndex = 0;

    //             // Close the details
    //             this.closeDetails();
    //         });

    //     // Get products if sort or page changes
    //     merge(this._sort.sortChange, this._paginator.page).pipe(
    //         switchMap(() => {
    //             this.closeDetails();
    //             this.isLoading = true;
    //             return this._Service.getProducts(
    //                 this._paginator.pageIndex + 1,
    //                 this._paginator.pageSize,
    //                 this._sort.active,
    //                 this._sort.direction,
    //                 this.filterForm.value?.searchInputControl,
    //                 this.filterForm.value?.asset_type == 'default' ? '' : this.filterForm.value?.asset_type,
    //                 this.supplierId
    //             );
    //         }),
    //         map(() => {
    //             this.isLoading = false;
    //         })
    //     ).subscribe();
    // }
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




  resetForm(): void {
    this.filterForm.reset();
    this.filterForm.get('asset_type').setValue("default");
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Close the details
   */
  closeDetails(): void {
    this.selectedProduct = null;
  }

  /**
   * Show flash message
   */
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

  callDetail(productId: string): void {
    // alert(this.selectedProduct.id);
    // // If the product is already selected...
    // if (this.selectedProduct && this.selectedProduct.id === productId) {
    //     // Close the details
    //     // this.closeDetails();
    //     return;
    // }


    this._router.navigate(['marketing/brief-plan/' + productId]);

  }

  editBrief(productId: string): void {
    this._router.navigate(['marketing/brief-plan/edit/' + productId]);
  }
  edit(productId: string): void {
    this._router.navigate(['user/edit/' + productId]);
  }


  openNewBrief(): void {
    this._router.navigateByUrl('marketing/brief-plan/brief/create');
  }

  openNewOrder(productId: string): void {
    // If the product is already selected...
    // if (this.selectedProduct && this.selectedProduct.id === productId) {
    //     // Close the details
    //     // this.closeDetails();
    //     return;
    // }


    this._router.navigate(['marketing/data/assets-list/new-order/' + productId]);
  }

  textStatus(status: string): string {
    return startCase(status);
  }

  // openImportOsm(): void {
  //     this._matDialog.open(ImportOSMComponent)
  // }
  updateProfile(): void {
    console.log(this.formData.value)
    // return

    this.flashMessage = null;
    this.flashErrorMessage = null;
    // Return if the form is invalid
    // if (this.formData.invalid) {
    //   return;
    // }
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      "title": "แก้ไขโปรไฟล์ผู้ใช้งาน",
      "message": "คุณต้องการบันทึกการแก้ไขโปรไฟล์หรือไม่ ",
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
        const formData = new FormData();
        Object.entries(this.formData.value).forEach(
          ([key, value]: any[]) => {
            formData.append(key, value);
          }
        );
        this._Service.updateUserprofile(formData).subscribe({
          next: (resp: any) => {
            this._router.navigateByUrl('user/list').then(() => { })
        },
        error: (err: any) => {

            this._fuseConfirmationService.open({
                "title": "กรุณาระบุข้อมูล",
                "message": err.error.message,
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
            console.log(err.error.message)
        }
        })
      }
    });

  }

  onChange(event: any): void {
    // console.log('')
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    setTimeout(() => {
      this._changeDetectorRef.detectChanges()
  }, 150)
    reader.onload = (e: any) =>
      this.url_pro = e.target.result;
    const file = event.target.files[0];
    this.formData.patchValue({
      image: file
    });
    this._changeDetectorRef.markForCheck();
    // console.log
  }
  onChangeSignature(event: any): void {
    // console.log('')
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    setTimeout(() => {
      this._changeDetectorRef.detectChanges()
  }, 150)
    reader.onload = (e: any) =>
      this.url_sig = e.target.result;
    const file = event.target.files[0];
    this.formData.patchValue({
      image_signature: file
    });
    this._changeDetectorRef.markForCheck();
    // console.log
  }
}
