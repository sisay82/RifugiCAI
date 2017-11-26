import { Component,Directive,Input,ChangeDetectorRef } from '@angular/core';
import {IMenu} from '../../shared/types/interfaces';
import { BcSharedService} from '../../shared/shared.service';
import {BcAuthService} from '../../shared/auth.service';
import { Subscription } from 'rxjs/Subscription';
import {Enums} from '../../shared/types/enums';

@Directive({
    selector: 'a[bc-menu-element]',
    host: {
        '[class.active]': 'active'
    }
})
export class BcMenuElementStyler {
   @Input('bc-menu-element') active: boolean;
}

@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss']
    
})
export class BcShelter {
    private authorization:boolean
    constructor(private shared:BcSharedService,private authService:BcAuthService,private cd:ChangeDetectorRef){}

    getLink(link:String):any{
        const outlet=this.shared.activeOutlet;
        let routerLink;
        if(outlet==Enums.Routed_Outlet.revision){
            routerLink = [{outlets:({'revision': [link],'content': null})}];
        }else{
            routerLink = [{outlets:({'content': [link],'revision': null})}];
        }
        return routerLink;
    }

    isActiveLink(link:Enums.Routed_Component){
        const component=this.shared.activeComponent;
        return (component==link)
    }

    appMenuElements:IMenu={
      layers:[
        {
            layerName:"detail",
            elements:[
                {name:"Dati geografici",icon:"map-signs",link:Enums.Routed_Component.geographic},
                {name:"Servizi",icon:"home",link:Enums.Routed_Component.services},
                {name:"Contatti e apertura",icon:"phone",link:Enums.Routed_Component.contacts},
                {name:"Proprietà e custodia",icon:"user",link:Enums.Routed_Component.management},
                {name:"Dati catastali",icon:"book",link:Enums.Routed_Component.catastal}
            ]},{
            layerName:"document",
            elements:[
                {name:"Documenti",icon:"file-pdf-o",link:Enums.Routed_Component.documents},
                {name:"Immagini",icon:"picture-o",link:Enums.Routed_Component.images},
            ]},{
            layerName:"economy",
            elements:[
                {name:"Economia",icon:"certificate",link:Enums.Routed_Component.economy},
                {name:"Richiesta contributi",icon:"eur",link:Enums.Routed_Component.contribution},
                {name:"Fruizione",icon:"bar-chart",link:Enums.Routed_Component.use}
            ]}
        ]
    };

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