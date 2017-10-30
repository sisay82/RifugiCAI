import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BcPageNotFound } from "./pageNotFound/pageNotFound.component";
import { BcAccessDenied } from "./accessDenied/access-denied.component";

const appRoutes: Routes = [
    { path: '', redirectTo:'list', pathMatch:'full'},
    { path: '**', outlet:"access-denied", component: BcAccessDenied },
    { path: '**', component: BcPageNotFound }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  declarations:[BcAccessDenied],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }