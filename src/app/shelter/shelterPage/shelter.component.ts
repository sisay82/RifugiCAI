import { Component,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import {IMenu} from '../../shared/types/interfaces';
import {BcAuthService} from '../../shared/auth.service';
import { Subscription } from 'rxjs/Subscription';
@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss']
    
})
export class BcShelter {
    authorization:boolean;

    appMenuElements:IMenu={
      layers:[
        {
            layerName:"detail",
            elements:[
                {name:"Dati geografici",icon:"map-signs",link:"geographic"},
                {name:"Servizi",icon:"home",link:"services"},
                {name:"Contatti e apertura",icon:"phone",link:"contacts"},
                {name:"Proprietà e custodia",icon:"user",link:"management"},
                {name:"Dati catastali",icon:"book",link:"catastal"}
            ]},{
            layerName:"document",
            elements:[
                {name:"Documenti",icon:"file-pdf-o",link:"documents"},
                {name:"Immagini",icon:"picture-o",link:"images"},
            ]},{
            layerName:"economy",
            elements:[
                {name:"Economia",icon:"certificate",link:"economy"},
                {name:"Richiesta contributi",icon:"eur",link:"contribution"},
                {name:"Fruizione",icon:"bar-chart",link:"use"}
            ]}
        ]
    };

    constructor(private authService:BcAuthService,private cd:ChangeDetectorRef){
        
    }

    getAuth(){
        return this.authorization;
    }

    ngAfterViewInit() {
        let permSub = this.authService.getUserProfile().subscribe(profile=>{
            if(profile){
                this.authorization=true;
            }
            if(permSub){
                permSub.unsubscribe();
            }
            this.cd.detectChanges();
        });
    }   
}