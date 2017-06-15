import { NgModule } from '@angular/core';
import { BcMask } from './mask.component';
import { CommonModule } from '@angular/common';
import { BcDividerModule } from '../divider/divider.module';
@NgModule({
    exports: [BcMask],
    declarations: [BcMask],
    imports:[CommonModule,BcDividerModule]
})
export class BcMaskModule{

}