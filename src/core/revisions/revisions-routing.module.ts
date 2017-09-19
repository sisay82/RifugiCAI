import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcGeoRevision } from "./geographics/geo.component";
import { BcServRevision } from "./services/services.component";
import { BcContactsRevision } from "./contacts/contacts.component";
import { BcManagementRevision } from "./management/management.component";
import { BcCatastalRevision } from "./catastal/catastal.component";
import { BcDocRevision } from "./documents/document.component";
import { BcImgRevision } from "./images/images.component";
import { BcWorkingRevisionPage } from "./pageOnWork/working-revision.component";

@NgModule({
  imports: [RouterModule],
  declarations:[],
  exports: [
    RouterModule
  ]
})

export class RevisionsRoutingModule {
  public static appRoutes: Routes = [
    { path: 'geographic',component:BcGeoRevision,outlet:'revision'},
    { path: 'services', component: BcServRevision,outlet:'revision' },
    { path: 'contacts', component: BcContactsRevision,outlet:'revision' },
    { path: 'management', component: BcManagementRevision,outlet:'revision' },
    { path: 'catastal', component: BcCatastalRevision,outlet:'revision' },
    { path: 'documents', component: BcDocRevision,outlet:'revision' },
    { path: 'images', component: BcImgRevision,outlet:'revision' },
    { path: 'economy', component: BcWorkingRevisionPage,outlet:'revision' },
    { path: 'contribution', component: BcWorkingRevisionPage,outlet:'revision' },
    { path: 'use', component: BcWorkingRevisionPage,outlet:'revision' }
  ];
}