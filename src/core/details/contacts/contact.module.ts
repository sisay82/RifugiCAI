import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcContact,PrefixPipe } from './contact.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcContact,PrefixPipe],
    exports: [BcContact,PrefixPipe],
    imports:[BcDividerModule,BcMapModule,CommonModule]
})
export class BcContactModule { }
