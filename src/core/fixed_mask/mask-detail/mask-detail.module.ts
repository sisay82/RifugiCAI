import { NgModule } from '@angular/core';
import { BcMask } from './mask-detail.component';
import { CommonModule } from '@angular/common';
import { BcDividerModule } from '../../divider/divider.module';
import {BcIconModule} from '../../icon/icon.module';

@NgModule({
    exports: [BcMask],
    declarations: [BcMask],
    imports:[CommonModule,BcIconModule,BcDividerModule]
})
export class BcMaskDetailModule{

}