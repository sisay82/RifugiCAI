import { NgModule } from '@angular/core';

import { BcDividerModule } from '../divider/divider.module';

import { BcList, BcListStyler, BcListAvatarStyler,BcListThumbnailStyler} from './list.component';

import { BcListHeaderModule } from './listHeader/list-header.module';
import { BcListItemGroupModule } from './listItemGroup/list-item-group.module';
import { BcListItemModule } from './listItem/list-item.module';

@NgModule({
    imports: [BcListHeaderModule, BcListItemGroupModule, BcListItemModule, BcDividerModule],
    declarations: [BcList, BcListStyler, BcListAvatarStyler,BcListThumbnailStyler],
    exports: [
        BcList,
        BcListStyler,
        BcListAvatarStyler,
        BcListHeaderModule,
        BcListThumbnailStyler,
        BcListItemGroupModule,
        BcListItemModule,
        BcDividerModule
    ]
})
export class BcListModule { }
