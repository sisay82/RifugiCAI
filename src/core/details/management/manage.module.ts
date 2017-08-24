import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcManage,FormatDate,PrefixPipe } from './manage.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';

@NgModule({
    declarations: [BcManage,FormatDate,PrefixPipe],
    exports: [BcManage,FormatDate,PrefixPipe],
    imports:[BcIconModule,BcDividerModule,CommonModule]
})
export class BcManageModule { }