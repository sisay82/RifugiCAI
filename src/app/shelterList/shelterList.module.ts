import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../../core/core.module';

import { ShelterListRoutingModule } from './shelterList-routing.module';

import { BcShelterList } from './shelterList.component';

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    ShelterListRoutingModule
  ],
  declarations: [BcShelterList],
  exports: [BrowserModule, CoreModule, BcShelterList]
})
export class ShelterListModule { }