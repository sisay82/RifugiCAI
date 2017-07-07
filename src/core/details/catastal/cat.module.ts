import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcCatastal } from './cat.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcCatastal],
    exports: [BcCatastal],
    imports:[BcDividerModule,CommonModule]
})
export class BcCatastalModule { }
