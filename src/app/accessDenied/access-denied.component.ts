import { Component } from '@angular/core';
import {  Router } from '@angular/router';
import {BcAuthService} from '../shared/auth.service';
@Component({
    moduleId: module.id,
    selector: 'access-denied',
    templateUrl: 'access-denied.component.html',
    styleUrls: ['access-denied.component.scss']
})
export class BcAccessDenied {
    constructor(private authService:BcAuthService,private router:Router){
        authService.getRouteError().subscribe((val)=>{
            if(!val){
                this.router.navigate([{outlets:({'access-denied': null,'primary': 'list'})}]);
            }
        });
    }
}