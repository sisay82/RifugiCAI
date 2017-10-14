import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcContributions,BcActiveTabStyler} from './contributions.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import {BcListModule} from '../../list/list.module';
@NgModule({
    declarations: [BcContributions,BcActiveTabStyler],
    exports: [BcContributions,BcActiveTabStyler],
    imports:[BcIconModule,PipesModule,BcListModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcContributionsModule { }
