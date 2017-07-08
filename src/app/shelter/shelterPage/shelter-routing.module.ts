import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelter } from './shelter.component';
import { DetailsRoutingModule } from '../../../core/details/details-routing.module';
import { RevisionsRoutingModule } from '../../../core/revisions/revisions-routing.module';

const sheltersRoutes: Routes = [
    { path: 'shelter/:id', component: BcShelter,children:[
        ...DetailsRoutingModule.appRoutes,
        ...RevisionsRoutingModule.appRoutes
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