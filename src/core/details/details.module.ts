import { NgModule } from '@angular/core';
import { DetailsRoutingModule } from './details-routing.module';
import { BcGeoModule } from './geographics/geo.module';
import { BcServModule } from './services/serv.module';
import { BcContactModule } from './contacts/contact.module';
import { BcDetails } from "./details.component";
import { BcDocModule } from "./documents/document.module";
import { BcImgModule } from "./images/images.module";
import { BcContributionsModule } from "./contributions/contributions.module";
import { BcEconomyModule } from "./economy/economy.module";
import { BcFruitionModule } from "./fruition/fruition.module";
import { RouterModule, Routes } from '@angular/router';
import { BcManageModule } from "./management/manage.module";
import { BcCatastalModule } from "./catastal/cat.module";
import { HttpClientModule } from '@angular/common/http';
import { WorkingDetailPage } from "./pageOnWork/working-detail.module";

@NgModule({
    imports: [HttpClientModule
        , RouterModule
        , WorkingDetailPage
        , BcImgModule
        , BcDocModule
        , BcGeoModule
        , BcServModule
        , BcContactModule
        , BcCatastalModule
        , BcManageModule
        , BcContributionsModule
        , BcEconomyModule
        , BcFruitionModule
    ],
    declarations: [BcDetails],
    exports: [BcGeoModule, BcDetails]
})
export class BcDetailsModule { }
