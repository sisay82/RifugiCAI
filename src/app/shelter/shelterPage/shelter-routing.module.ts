import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelter } from './shelter.component';
import { detailsRoutes } from '../../../core/details/details-routing.module';
import { revisionsRoutes } from '../../../core/revisions/revisions-routing.module';

const sheltersRoutes: Routes = [
    { path: 'shelter/:id', component: BcShelter,children:[
        ...detailsRoutes,
        ...revisionsRoutes
    ]},
    { path: ':name/:id', component: BcShelter,children:[
        ...revisionsRoutes
    ]}
];
@NgModule({
    imports: [
        RouterModule.forChild(sheltersRoutes),
    ],
    exports: [
        RouterModule
    ]
})
export class ShelterRoutingModule { }