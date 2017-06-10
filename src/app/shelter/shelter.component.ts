import { Component, OnInit } from '@angular/core';
import {IShelter} from '../../shared/interfaces';
import { ActivatedRoute } from '@angular/router';
import {ShelterService} from '../../core/shelter/shelter.service'
import {IMenu}from '../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss'],
    providers:[ShelterService]

})
export class BcShelter {
    shelter:IShelter={id:"id",name:"nome",registry:{address:{via:"via",number:1,cap:1,city:"cittá",collective:"comune",country:"regione",district:"provincia"}}};
    appMenuElements:IMenu={
    layers:[{
        layerName:"Publics",
        elements:[
            {name:"Dati geografici",icon:"fa-map-signs",link:"geographics"},
            {name:"Servizi",icon:"fa-home",link:"#"},
            {name:"Contatti e apertura",icon:"fa-phone",link:"#"},
            {name:"Proprietá e gestione",icon:"fa-user",link:"#"},
            {name:"Dati catastali",icon:"fa-book",link:"#"}
            ]},{
        layerName:"Documents",
        elements:[
            {name:"Documenti",icon:"fa-file-pdf-o",link:"#"},
            {name:"Immagini",icon:"fa-picture-o",link:"#"}
            ]},{
        layerName:"Economy",
        elements:[
            {name:"Economia",icon:"fa-certificate",link:"#"},
            {name:"Richiesta contributi",icon:"fa-eur",link:"#"},
            {name:"Fruizione",icon:"fa-bar-chart",link:"#"}
        ]}
        ]
    };

    constructor(private shelterService:ShelterService,private route:ActivatedRoute){}

    ngOnInit(){
        this.route.params.subscribe(params=>{
            this.shelter=this.shelterService.getByName(params['name']);
            
            //hardcoded
            this.shelter.name=params['name'];
        });
    }
}