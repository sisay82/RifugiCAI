import { NgModule } from '@angular/core';
//import { DetailsRoutingModule } from './revisions-routing.module';
import { BcGeoRevisionModule } from './geographics/geo.module';
import { BcServRevisionModule } from './services/services.module';
import { BcContactsRevisionModule } from './contacts/contacts.module';

import { BcRevisions } from "./revisions.component";
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';

@NgModule({
    imports: [HttpModule,RouterModule,BcGeoRevisionModule,BcServRevisionModule,BcContactsRevisionModule],
    declarations:[BcRevisions],
    exports: [BcRevisions]
})
export class BcRevisionsModule { }
