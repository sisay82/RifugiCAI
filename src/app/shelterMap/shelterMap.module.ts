import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';

import { ShelterMapRoutingModule } from './shelterMap-routing.module';

import { BcShelterMap } from './shelterMap.component';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        ShelterMapRoutingModule,
    ],
    providers: [],
    declarations: [BcShelterMap],
    bootstrap: [BcShelterMap]
})
export class ShelterMapModule { }