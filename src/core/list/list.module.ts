import { NgModule } from '@angular/core';

import { BcList, BcListStyler } from './list.component';

import { BcListItemModule } from './listItem/list-item.module';

@NgModule({
    imports: [BcListItemModule],
    declarations: [BcList, BcListStyler],
    exports: [
        BcList,
        BcListStyler,
        BcListItemModule
    ]
})
export class BcListModule { }
