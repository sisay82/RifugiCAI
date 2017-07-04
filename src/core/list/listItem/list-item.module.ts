import { NgModule } from '@angular/core';
import { BcListItem, BcListNavItemStyler, BcListItemDisableStyler, BcLineStyler} from './list-item.component';


@NgModule({
    exports: [ BcListItem, BcListNavItemStyler, BcListItemDisableStyler, BcLineStyler],
    declarations: [ BcListItem, BcListNavItemStyler, BcListItemDisableStyler, BcLineStyler]
})
export class BcListItemModule { }

