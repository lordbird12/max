import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'permission',
    templateUrl: './permission.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
