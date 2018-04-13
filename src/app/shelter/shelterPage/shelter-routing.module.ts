import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BcShelter } from './shelter.component';
import { detailsRoutes } from '../../../core/details/details-routing.module';
import { revisionsRoutes } from '../../../core/revisions/revisions-routing.module';

import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { CUSTOM_PATTERN_VALIDATORS } from '../../../core/inputs/input_base';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/first';
import { Observable } from 'rxjs/Observable';
const validObjectIDRegExp = CUSTOM_PATTERN_VALIDATORS.objectID;

@Injectable()
export class CheckIDGuard implements CanActivate {

    constructor(private router: Router) { }

    public canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const id = route.params["id"]

        if (validObjectIDRegExp.test(id)) {
            return true;
        } else {
            this.router.navigateByUrl('/pageNotFound');
            return false;
        }
    }
}

const sheltersRoutes: Routes = [
    {
        path: 'shelter/:id', canActivate: [CheckIDGuard], component: BcShelter, children: [
            ...detailsRoutes,
            ...revisionsRoutes
        ]
    },
    {
        path: 'newShelter/:id', canActivate: [CheckIDGuard], data: { newShelter: true }, component: BcShelter, children: [
            ...revisionsRoutes
        ]
    }
];
@NgModule({
    imports: [
        RouterModule.forChild(sheltersRoutes)
    ],
    exports: [
        RouterModule
    ],
    providers: [CheckIDGuard]
})
export class ShelterRoutingModule { }
