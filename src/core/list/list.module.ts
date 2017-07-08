import { NgModule } from '@angular/core';

import { BcDividerModule } from '../divider/divider.module';

import { BcList, BcListStyler, BcListAvatarStyler} from './list.component';

import { BcListItemModule } from './listItem/list-item.module';
import { BcListHeaderModule } from './listHeader/list-header.module';

@NgModule({
    imports: [BcListItemModule, BcListHeaderModule, BcDividerModule],
    declarations: [BcList, BcListStyler, BcListAvatarStyler],
    exports: [
        BcList,
        BcListStyler,
        BcListAvatarStyler,
        BcListHeaderModule,
        BcListItemModule,
        BcDividerModule
    ]
})
export class BcListModule { }
