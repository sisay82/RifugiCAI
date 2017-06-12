import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcServItem } from './serv-item.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcServItem],
    exports: [BcServItem],
    imports:[CommonModule]
})
export class BcSerItemvModule { }
