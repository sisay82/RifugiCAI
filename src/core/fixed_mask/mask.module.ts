import { NgModule } from '@angular/core';
import { BcMask } from './mask.component';
import { CommonModule } from '@angular/common';

@NgModule({
    exports: [BcMask],
    declarations: [BcMask],
    imports:[CommonModule]
})
export class BcMaskModule{

}