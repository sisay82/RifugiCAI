import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcContact } from './contact.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [BcContact],
    exports: [BcContact],
    imports:[BcDividerModule,BcMapModule,CommonModule,PipesModule]
})
export class BcContactModule { }
