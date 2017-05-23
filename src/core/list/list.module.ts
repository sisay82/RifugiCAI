import { NgModule } from '@angular/core';

import { BcList, BcListStyler } from './list.component';

import {
    BcListItemModule
} from './list-item.module';

@NgModule({
    imports:[ BcListItemModule],
    declarations: [BcList, BcListStyler],
    exports: [
        BcList,
        BcListItemModule,
        BcListStyler
    ]
})
export class BcListModule { }
