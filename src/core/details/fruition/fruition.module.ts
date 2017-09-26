import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcFruition} from './fruition.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
@NgModule({
    declarations: [BcFruition],
    exports: [BcFruition],
    imports:[BcIconModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcFruitionModule { }
