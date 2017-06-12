import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcManage } from './manage.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcManage],
    exports: [BcManage],
    imports:[BcDividerModule,CommonModule]
})
export class BcManageModule { }