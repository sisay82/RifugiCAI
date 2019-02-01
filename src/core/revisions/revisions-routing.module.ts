import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcGeoRevisionComponent } from "./geographics/geo.component";
import { BcServRevisionComponent } from "./services/services.component";
import { BcContactsRevision } from "./contacts/contacts.component";
import { BcManagementRevision } from "./management/management.component";
import { BcCatastalRevisionComponent } from "./catastal/catastal.component";
import { BcDocRevision } from "./documents/document.component";
import { BcImgRevision } from "./images/images.component";
import { BcContributionRevision } from "./contributions/contributions.component";
import { BcEconomyRevision } from "./economy/economy.component";
import { BcFruitionRevision } from "./fruition/fruition.component";
import { BcWorkingRevisionPage } from "./pageOnWork/working-revision.component";

export const revisionsRoutes: Routes = [
  { path: 'geographic', component: BcGeoRevisionComponent, outlet: 'revision' },
  { path: 'services', component: BcServRevisionComponent, outlet: 'revision' },
  { path: 'contacts', component: BcContactsRevision, outlet: 'revision' },
  { path: 'management', component: BcManagementRevision, outlet: 'revision' },
  { path: 'catastal', component: BcCatastalRevisionComponent, outlet: 'revision' },
  { path: 'documents', component: BcDocRevision, outlet: 'revision' },
  { path: 'images', component: BcImgRevision, outlet: 'revision' },
  { path: 'economy', component: BcEconomyRevision, outlet: 'revision' },
  { path: 'contribution', component: BcContributionRevision, outlet: 'revision' },
  { path: 'use', component: BcFruitionRevision, outlet: 'revision' }
];

@NgModule({
  imports: [RouterModule],
  declarations: [],
  exports: [
    RouterModule
  ]
})

export class RevisionsRoutingModule { }
