import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcSerItemvModule} from './serv-item.module';
import { BcServ } from './serv.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcServ],
    exports: [BcServ],
    imports:[CommonModule,BcDividerModule,BcSerItemvModule]
})
export class BcServModule { }
