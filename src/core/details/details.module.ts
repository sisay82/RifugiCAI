import { NgModule } from '@angular/core';
import { DetailsRoutingModule } from './details-routing.module';
import { BcGeoModule } from './geographics/geo.module';
import { BcServModule } from './services/serv.module';
import { BcContactModule } from './contacts/contact.module';
import { BcDetails } from "./details.component";
import { RouterModule, Routes } from '@angular/router';
import { BcManageModule } from "./management/manage.module";
import { BcCatastalModule } from "./catastal/cat.module";
import { HttpModule } from '@angular/http';
import { WorkingDetailPage } from "./pageOnWork/working-detail.module";

@NgModule({
    imports: [HttpModule,RouterModule,WorkingDetailPage,BcGeoModule,BcServModule,BcContactModule,BcCatastalModule,BcManageModule],
    declarations:[BcDetails],
    exports: [BcGeoModule,BcDetails]
})
export class BcDetailsModule { }
