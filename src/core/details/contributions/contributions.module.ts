import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcContributions,BcActiveTabStyler} from './contributions.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
import { PipesModule } from '../../pipes/pipes.module';
@NgModule({
    declarations: [BcContributions,BcActiveTabStyler],
    exports: [BcContributions,BcActiveTabStyler],
    imports:[BcIconModule,PipesModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcContributionsModule { }
