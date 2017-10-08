import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcEconomy,BcActiveTabStyler} from './economy.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import {BcListModule} from '../../list/list.module';
@NgModule({
    declarations: [BcEconomy,BcActiveTabStyler],
    exports: [BcEconomy,BcActiveTabStyler],
    imports:[BcIconModule,PipesModule,BcListModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcEconomyModule { }
