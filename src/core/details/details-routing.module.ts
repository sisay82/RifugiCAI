import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcContact } from "./contacts/contact.component";
import { BcServ } from "./services/serv.component";
import { BcGeo } from "./geographics/geo.component";
import { BcDetails } from "./details.component";
import { BcManage } from "./management/manage.component";
import { BcCatastal } from "./catastal/cat.component";


@NgModule({
  imports: [RouterModule],
  declarations:[],
  exports: [
    RouterModule
  ]
})

export class DetailsRoutingModule {
  public static appRoutes: Routes = [
    { path: 'geographic',component:BcGeo,outlet:'content'},
    { path: 'services', component: BcServ,outlet:'content' },
    { path: 'contacts', component: BcContact,outlet:'content' },
    { path: 'management', component: BcManage,outlet:'content' },
    { path: 'catastal', component: BcCatastal,outlet:'content' },
    { path: 'documents', component: BcGeo,outlet:'content' },
    { path: 'images', component: BcGeo,outlet:'content' },
    { path: 'economy', component: BcGeo,outlet:'content' },
    { path: 'contribution', component: BcGeo,outlet:'content' },
    { path: 'use', component: BcGeo,outlet:'content' }
  ];
}