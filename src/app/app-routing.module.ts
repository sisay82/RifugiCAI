import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcPageNotFound } from "./pageNotFound/pageNotFound.component";

const appRoutes: Routes = [
    { path: '', redirectTo:'list', pathMatch:'full'},
    { path: '**', component: BcPageNotFound }
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