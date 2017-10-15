import { NgModule } from '@angular/core';
import { BcListItemGroup, BcListGroupHeader} from './list-item-group.component';
import { BcDividerModule } from "../../divider/divider.module";

@NgModule({
    imports: [ BcDividerModule ],
    declarations: [ BcListItemGroup, BcListGroupHeader ],
    exports: [ BcListItemGroup, BcListGroupHeader ]

})
export class BcListItemGroupModule { }

