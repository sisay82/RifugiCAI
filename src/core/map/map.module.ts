import { NgModule } from '@angular/core';
import { BcMap, } from './map.component';
import { CommonModule } from '@angular/common';
@NgModule({
    imports:[CommonModule],
    declarations: [BcMap],
    exports: [BcMap]
})
export class BcMapModule{

}