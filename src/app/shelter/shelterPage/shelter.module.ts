import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { CoreModule } from '../../../core/core.module';

import { ShelterRoutingModule } from './shelter-routing.module';

import { BcShelter,BcMenuElementStyler } from './shelter.component';

@NgModule({
  imports: [
    SharedModule,
    CoreModule,
    ShelterRoutingModule
  ],
  declarations: [BcShelter,BcMenuElementStyler]
})
export class ShelterModule { }