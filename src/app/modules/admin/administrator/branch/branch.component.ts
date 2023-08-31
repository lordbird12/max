import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'permission',
  templateUrl: './branch.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BranchComponent {
  /**
   * Constructor
   */
  constructor() {
  }
}
