import { NgModule } from '@angular/core';

import {
    BcMenuLayer,
} from './menu-layer.component';

import { BcDividerModule } from '../divider/divider.module'

import { BcMenuItemModule } from './menu-item.module'

@NgModule({
    imports:[BcMenuItemModule,BcDividerModule ],
    exports: [
        BcMenuLayer,
        BcMenuItemModule
    ],
    declarations: [
        BcMenuLayer
    ],
})
export class BcMenuLayerModule { }
