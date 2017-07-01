import { NgModule } from '@angular/core';
import { BcDividerModule } from '../../divider/divider.module';
import { BcListItem, BcListNavItemStyler, BcListItemDisableStyler } from './list-item.component';


@NgModule({
    imports: [BcDividerModule],
    exports: [ BcListItem, BcListNavItemStyler, BcListItemDisableStyler],
    declarations: [ BcListItem, BcListNavItemStyler, BcListItemDisableStyler]
})
export class BcListItemModule { }

