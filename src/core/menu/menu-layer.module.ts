import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    BcMenuLayer,
} from './menu-layer.component';

import { BcDividerModule } from '../divider/divider.module'

import { BcMenuItemModule } from './menu-item.module'

@NgModule({
    imports:[BcMenuItemModule,BcDividerModule,CommonModule],
    exports: [
        BcMenuLayer,
        BcMenuItemModule
    ],
    declarations: [
        BcMenuLayer
    ],
})
export class BcMenuLayerModule { }
