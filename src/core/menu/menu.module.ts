import { NgModule } from '@angular/core';

import { BcContentModule } from '../content/content.module';
import { BcBackdropModule } from '../backdrop/backdrop.module';

import { BcMenu } from './menu.component';

@NgModule({
    imports: [BcContentModule, BcBackdropModule],
    declarations: [BcMenu],
    exports: [
        BcMenu
    ]
})
export class BcMenuModule { }
