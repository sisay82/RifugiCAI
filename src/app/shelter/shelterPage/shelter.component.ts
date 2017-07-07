import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ShelterService} from '../shelter.service'
import {IMenu,IShelter}from '../../shared/types/interfaces';
import {BcSharedService} from './shared.service';
@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss'],
    providers:[ShelterService,BcSharedService]

})
export class BcShelter {
    shelter:IShelter;
    appMenuElements:IMenu={
    layers:[{
        layerName:"Publics",
        elements:[
            {name:"Dati geografici",icon:"fa-map-signs",link:[{outlets:({'content': ['geographic']})}],default:true},
            {name:"Servizi",icon:"fa-home",link:[{outlets:({'content': ['services']})}]},
            {name:"Contatti e apertura",icon:"fa-phone",link:[{outlets:({'content': ['contacts']})}]},
            {name:"Proprietá e gestione",icon:"fa-user",link:[{outlets:({'content': ['management']})}]},
            {name:"Dati catastali",icon:"fa-book",link:[{outlets:({'content': ['cadastral']})}]}
            ]},{
        layerName:"Documents",
        elements:[
            {name:"Documenti",icon:"fa-file-pdf-o",link:[{outlets:({'content': ['documents']})}]},
            {name:"Immagini",icon:"fa-picture-o",link:[{outlets:({'content': ['images']})}]}
            ]},{
        layerName:"Economy",
        elements:[
            {name:"Economia",icon:"fa-certificate",link:[{outlets:({'content': ['economy']})}]},
            {name:"Richiesta contributi",icon:"fa-eur",link:[{outlets:({'content': ['contribution']})}]},
            {name:"Fruizione",icon:"fa-bar-chart",link:[{outlets:({'content': ['use']})}]}
        ]}
        ]
    };

    constructor(private shelterService:ShelterService,private route:ActivatedRoute){}

    ngOnInit(){
        this.route.params.subscribe(params=>{
            this.shelterService.getShelter(params['id']).subscribe(shelter=>{
                this.shelter=shelter;
            });
        });
    }
}