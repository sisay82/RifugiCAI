import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcContact } from "./contacts/contact.component";
import { BcServ } from "./services/serv.component";
import { BcGeo } from "./geographics/geo.component";
import { BcDetails } from "./details.component";
import { BcManage } from "./management/manage.component";
import { BcCatastal } from "./catastal/cat.component";
import { BcDoc } from "./documents/document.component";
import { BcImg } from "./images/images.component";
import { BcContributions } from "./contributions/contributions.component";
import { BcFruition } from "./fruition/fruition.component";
import { BcEconomy } from "./economy/economy.component";
import { BcWorkingDetailPage } from "./pageOnWork/working-detail.component";

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
    { path: 'documents', component: BcDoc,outlet:'content' },
    { path: 'images', component: BcImg,outlet:'content' },
    { path: 'economy', component: BcWorkingDetailPage,outlet:'content' },
    { path: 'contribution', component: BcWorkingDetailPage,outlet:'content' },
    { path: 'use', component: BcFruition,outlet:'content' }
  ];
}