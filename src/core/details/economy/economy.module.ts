import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcEconomy} from './economy.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
@NgModule({
    declarations: [BcEconomy],
    exports: [BcEconomy],
    imports:[BcIconModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcEconomyModule { }
