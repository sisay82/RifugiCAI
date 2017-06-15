import { NgModule } from '@angular/core';

import { BcListItem, BcListNavItemStyler, BcListItemDisableStyler } from './list-item.component';


@NgModule({
    exports: [ BcListItem, BcListNavItemStyler, BcListItemDisableStyler],
    declarations: [ BcListItem, BcListNavItemStyler, BcListItemDisableStyler]
})
export class BcListItemModule { }

