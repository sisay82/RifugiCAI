import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelter } from './shelter.component';
import { DetailsRoutingModule } from '../../core/details/details-routing.module';
import { BcGeo } from '../../core/details/geographics/geo.component';

const sheltersRoutes: Routes = [
    { path: 'shelter/:name',component: BcShelter,children:[
        //{ path: 'geographic', component: BcGeo,outlet:'secondary' }
        ...DetailsRoutingModule.appRoutes
    ]}
];
@NgModule({
    imports: [
        RouterModule.forRoot(sheltersRoutes),
    ],
    exports: [
        RouterModule
    ]
})
export class ShelterRoutingModule { }