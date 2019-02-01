import { NgModule } from '@angular/core';
import { BcDividerModule } from '../../divider/divider.module';
import { BcCatastal } from './cat.component';
import { CommonModule } from '@angular/common';
import { BcIconModule } from '../../icon/icon.module';

@NgModule({
    declarations: [BcCatastal],
    exports: [BcCatastal],
    imports: [BcIconModule, BcDividerModule, CommonModule]
})
export class BcCatastalModule { }
