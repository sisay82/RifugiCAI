import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcGeoRevision } from "./geographics/geo.component";
import { BcServRevision } from "./services/services.component";
import { BcContactsRevision } from "./contacts/contacts.component";


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
    { path: 'management', component: BcGeoRevision,outlet:'revision' },
    { path: 'catastal', component: BcGeoRevision,outlet:'revision' },
    { path: 'documents', component: BcGeoRevision,outlet:'revision' },
    { path: 'images', component: BcGeoRevision,outlet:'revision' },
    { path: 'economy', component: BcGeoRevision,outlet:'revision' },
    { path: 'contribution', component: BcGeoRevision,outlet:'revision' },
    { path: 'use', component: BcGeoRevision,outlet:'revision' }
  ];
}