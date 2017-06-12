import { NgModule } from '@angular/core';
import { DetailsRoutingModule } from './details-routing.module';
import { BcGeoModule } from './geographics/geo.module';
import { BcDetails } from "./details.component";
import { RouterModule, Routes } from '@angular/router';

@NgModule({
    imports: [RouterModule,BcGeoModule],
    declarations:[BcDetails],
    exports: [BcGeoModule,BcDetails]
})
export class BcDetailsModule { }
