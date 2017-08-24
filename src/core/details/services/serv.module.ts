import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcServItemModule} from './serv-item.module';
import { BcServ } from './serv.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcServ],
    exports: [BcServ],
    imports:[CommonModule,BcDividerModule,BcServItemModule]
})
export class BcServModule { }
