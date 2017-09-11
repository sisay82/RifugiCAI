import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelterMap } from './shelterMap.component';

const sheltersRoutes: Routes = [
    { path: 'map', pathMatch: 'full', component: BcShelterMap }
];
@NgModule({
    imports: [
        RouterModule.forChild(sheltersRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ShelterMapRoutingModule { }