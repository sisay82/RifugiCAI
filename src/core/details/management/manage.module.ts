import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcManage } from './manage.component';

@NgModule({
    declarations: [BcManage],
    exports: [BcManage],
    imports:[BcDividerModule]
})
export class BcManageModule { }