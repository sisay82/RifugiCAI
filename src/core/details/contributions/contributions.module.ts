import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcContributions} from './contributions.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
@NgModule({
    declarations: [BcContributions],
    exports: [BcContributions],
    imports:[BcIconModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcFruitionModule { }
