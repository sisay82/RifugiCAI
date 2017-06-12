import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelterList } from './shelterList.component';

const sheltersRoutes: Routes = [
    { path: 'list', pathMatch: 'full', component: BcShelterList }
];
@NgModule({
    imports: [
        RouterModule.forChild(sheltersRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ShelterListRoutingModule { }