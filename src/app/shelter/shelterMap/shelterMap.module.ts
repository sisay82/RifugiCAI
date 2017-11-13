import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CoreModule } from '../../../core/core.module';

import { ShelterMapRoutingModule } from './shelterMap-routing.module';

import { BcShelterMap } from './shelterMap.component';

@NgModule({
  imports: [
    FormsModule,
    BrowserModule,
    HttpModule,
    CoreModule,
    ShelterMapRoutingModule
  ],
  declarations: [BcShelterMap],
  exports: [BrowserModule, CoreModule, BcShelterMap]
})
export class ShelterMapModule { }