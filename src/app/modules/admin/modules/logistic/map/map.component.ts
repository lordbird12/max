import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
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
    lastValueFrom,
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
import { AssetType, BranchPagination, DataBank } from '../page.types';
import { Service } from '../page.service';
import { ThemePalette } from '@angular/material/core';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    // encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {
    url: string;
    urlSafe: SafeResourceUrl;

    start: any;
    end: any;
    constructor(
        public sanitizer: DomSanitizer,
        private _activatedRoute: ActivatedRoute
    ) {}

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }

    ngOnInit() {
        this.start = this._activatedRoute.snapshot.paramMap.get('start');
        this.end = this._activatedRoute.snapshot.paramMap.get('end');
        this.url =
            'https://www.google.com/maps/embed/v1/directions?key=AIzaSyD2dLvuZOMWgMhbGSziy17ZgiNFfVhqVLs&origin=' +
            this.start +
            '&destination=' +
            this.end +
            '&avoid=tolls|highways';
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    }
}
