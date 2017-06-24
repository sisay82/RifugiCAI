import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcPageNotFound } from "./pageNotFound/pageNotFound.component";

const appRoutes: Routes = [
   // { path: '**', component: BcPageNotFound }
    //   { path: 'shelter/:id', component: ShelterDetailComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  declarations:[BcPageNotFound],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }