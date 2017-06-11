import { NgModule } from '@angular/core';
import { DetailsRoutingModule } from './details-routing.module';
import { BcGeoModule } from './geographics/geo.module';
import { BcDetails } from "./details.component";

@NgModule({
    imports: [BcGeoModule,DetailsRoutingModule],
    declarations:[BcDetails],
    exports: [BcGeoModule]
})
export class BcDetailsModule { }
