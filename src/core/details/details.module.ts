import { NgModule } from '@angular/core';

import { BcGeoModule } from './geographics/geo.module';

@NgModule({
    imports: [BcGeoModule],
    exports: [BcGeoModule]
})
export class BcDetailsModule { }
