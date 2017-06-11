import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcGeo } from "./geographics/geo.component";
import { BcDetails } from "./details.component";

const appRoutes: Routes = [
  /*  { path: 'shelter',component:BcDetails, pathMatch:'full',children:[
        { path: 'geo', component: BcGeo, outlet:'lo' }
    ]}*/
    { path: 'shelter',component:BcDetails,children:[
        { path: '', redirectTo:'(secondary:geo)',pathMatch:'full'},
        { path: 'geo', component: BcGeo, outlet:'secondary' }
    ]},
   
    
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  declarations:[],
  exports: [
    RouterModule
  ]
})

export class DetailsRoutingModule { }