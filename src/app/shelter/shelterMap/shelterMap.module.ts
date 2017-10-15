import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../core/core.module';

import { ShelterMapRoutingModule } from './shelterMap-routing.module';

import { BcShelterMap } from './shelterMap.component';

@NgModule({
  imports: [
    CoreModule,
    ShelterMapRoutingModule
  ],
  declarations: [BcShelterMap],
  exports: [CoreModule, BcShelterMap]
})
export class ShelterMapModule { }
