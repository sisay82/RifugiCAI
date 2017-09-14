import { Component } from '@angular/core';
import {BcAuthService} from '../shared/auth.service';
@Component({
    moduleId: module.id,
    selector: 'access-denied',
    templateUrl: 'access-denied.component.html',
    styleUrls: ['access-denied.component.scss']
})
export class BcAccessDenied {
    constructor(private authService:BcAuthService){
        authService.getRouteError().subscribe((val)=>{
            if(!val){
                location.href="/list";
            }
        });
    }
}