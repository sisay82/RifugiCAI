import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../../../core/core.module';

import { ShelterRoutingModule } from './shelter-routing.module';

import { BcShelter,BcMenuElementStyler } from './shelter.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    ShelterRoutingModule
  ],
  declarations: [BcShelter,BcMenuElementStyler],
  bootstrap: [BcShelter]
})
export class ShelterModule { }