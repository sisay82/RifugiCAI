import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcServItem } from './serv-item.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';

@NgModule({
    declarations: [BcServItem],
    exports: [BcServItem],
    imports:[BcIconModule,CommonModule]
})
export class BcSerItemvModule { }
