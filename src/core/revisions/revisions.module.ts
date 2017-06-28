import { NgModule } from '@angular/core';
//import { DetailsRoutingModule } from './revisions-routing.module';
import { BcGeoRevisionModule } from './geographics/geo.module';
import { BcRevisions } from "./revisions.component";
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

@NgModule({
    imports: [HttpModule,RouterModule,BcGeoRevisionModule],
    declarations:[BcRevisions],
    exports: [BcRevisions]
})
export class BcRevisionsModule { }