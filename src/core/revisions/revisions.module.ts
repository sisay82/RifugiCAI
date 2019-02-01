import { NgModule } from '@angular/core';
// import { DetailsRoutingModule } from './revisions-routing.module';
import { BcGeoRevisionComponentModule } from './geographics/geo.module';
import { BcServRevisionComponentModule } from './services/services.module';
import { BcContactsRevisionModule } from './contacts/contacts.module';
import { BcManagementRevisionModule } from './management/management.module';
import { BcCatastalRevisionComponentModule } from './catastal/catastal.module';
import { BcDocRevisionModule } from './documents/document.module';
import { BcImgRevisionModule } from './images/images.module';
import { BcFruitionRevisionModule } from './fruition/fruition.module';
import { BcContributionRevisionModule } from './contributions/contributions.module';
import { BcEconomyRevisionModule } from './economy/economy.module';
import { BcRevisions } from "./revisions.component";
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkingRevisionPage } from "./pageOnWork/working-revision.module";

@NgModule({
    imports: [HttpClientModule
        , RouterModule
        , WorkingRevisionPage
        , BcGeoRevisionComponentModule
        , BcServRevisionComponentModule
        , BcContactsRevisionModule
        , BcManagementRevisionModule
        , BcCatastalRevisionComponentModule
        , BcDocRevisionModule
        , BcEconomyRevisionModule
        , BcFruitionRevisionModule
        , BcImgRevisionModule
        , BcContributionRevisionModule],
    declarations: [BcRevisions],
    exports: [BcRevisions]
})
export class BcRevisionsModule { }
