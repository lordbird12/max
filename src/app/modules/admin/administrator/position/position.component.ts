import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'position',
  templateUrl: './position.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionComponent {
  /**
   * Constructor
   */
  constructor() {
  }
}
