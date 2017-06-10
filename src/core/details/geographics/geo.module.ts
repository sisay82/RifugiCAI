import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcGeo } from './geo.component';


@NgModule({
    declarations: [BcGeo],
    exports: [BcGeo],
    imports:[BcDividerModule]
})
export class BcGeoModule { }
