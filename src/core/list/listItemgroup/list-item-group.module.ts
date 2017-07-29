import { NgModule } from '@angular/core';
import { BcListItemGroup } from './list-item-group.component';
import { BcDividerModule } from "../../divider/divider.module";

@NgModule({
    imports: [ BcDividerModule ],
    declarations: [ BcListItemGroup ],
    exports: [ BcListItemGroup ]

})
export class BcListItemGroupModule { }

