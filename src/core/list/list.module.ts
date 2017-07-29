import { NgModule } from '@angular/core';

import { BcDividerModule } from '../divider/divider.module';

import { BcList, BcListStyler, BcListAvatarStyler} from './list.component';

import { BcListHeaderModule } from './listHeader/list-header.module';
import { BcListItemGroupModule } from './listItemGroup/list-item-Group.module';
import { BcListItemModule } from './listItem/list-item.module';

@NgModule({
    imports: [BcListHeaderModule, BcListItemGroupModule, BcListItemModule, BcDividerModule],
    declarations: [BcList, BcListStyler, BcListAvatarStyler],
    exports: [
        BcList,
        BcListStyler,
        BcListAvatarStyler,
        BcListHeaderModule,
        BcListItemGroupModule,
        BcListItemModule,
        BcDividerModule
    ]
})
export class BcListModule { }
