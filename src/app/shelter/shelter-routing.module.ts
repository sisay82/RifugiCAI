import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelter } from './shelter.component';

const sheltersRoutes: Routes = [
    { path: 'shelter/:name', pathMatch: 'full', component: BcShelter }
];
@NgModule({
    imports: [
        RouterModule.forChild(sheltersRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ShelterRoutingModule { }