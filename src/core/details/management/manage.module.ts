import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcManage,FormatDate } from './manage.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [BcManage],
    exports: [BcManage],
    imports:[BcIconModule,BcDividerModule,CommonModule,PipesModule]
})
export class BcManageModule { }