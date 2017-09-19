import { NgModule } from '@angular/core';
//import { DetailsRoutingModule } from './revisions-routing.module';
import { BcGeoRevisionModule } from './geographics/geo.module';
import { BcServRevisionModule } from './services/services.module';
import { BcContactsRevisionModule } from './contacts/contacts.module';
import { BcManagementRevisionModule } from './management/management.module';
import { BcCatastalRevisionModule } from './catastal/catastal.module';
import { BcRevisions } from "./revisions.component";
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';
import { WorkingRevisionPage } from "./pageOnWork/working-revision.module";

@NgModule({
    imports: [HttpModule,RouterModule,WorkingRevisionPage,BcGeoRevisionModule,BcServRevisionModule,BcContactsRevisionModule,BcManagementRevisionModule,BcCatastalRevisionModule],
    declarations:[BcRevisions],
    exports: [BcRevisions]
})
export class BcRevisionsModule { }
