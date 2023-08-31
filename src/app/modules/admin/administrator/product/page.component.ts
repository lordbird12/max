import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
<<<<<<< HEAD:src/app/modules/admin/administrator/category/page.component.ts
  selector: 'page',
=======
  selector: 'logistic',
>>>>>>> a2c3955d2c4536e655870b1bb58ddaf5da1db342:src/app/modules/admin/administrator/product/page.component.ts
  templateUrl: './page.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent {
  /**
   * Constructor
   */
  constructor() {
  }
}
