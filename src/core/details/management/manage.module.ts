import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcManage,FormatDate } from './manage.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';

@NgModule({
    declarations: [BcManage,FormatDate],
    exports: [BcManage,FormatDate],
    imports:[BcIconModule,BcDividerModule,CommonModule]
})
export class BcManageModule { }