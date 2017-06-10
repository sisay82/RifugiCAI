import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcGeo } from './geo.component';
import { BcMapModule } from '../../map/map.module';

@NgModule({
    declarations: [BcGeo],
    exports: [BcGeo],
    imports:[BcDividerModule,BcMapModule]
})
export class BcGeoModule { }
