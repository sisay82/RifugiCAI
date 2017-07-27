import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcGeo,TitleCasePipe} from './geo.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../../icon/icon.module';
@NgModule({
    declarations: [BcGeo,TitleCasePipe],
    exports: [BcGeo],
    imports:[BcIconModule,BcDividerModule,BcMapModule,CommonModule]
})
export class BcGeoModule { }
