import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ShelterService} from '../shelter.service'
import {IMenu,IShelter}from '../../shared/types/interfaces';

@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss'],
    providers:[ShelterService]

})
export class BcShelter {
    shelter:IShelter;
    appMenuElements:IMenu={
    layers:[{
        layerName:"Publics",
        elements:[
            {name:"Dati geografici",icon:"fa-map-signs",link:'geographic',default:true},
            {name:"Servizi",icon:"fa-home",link:'services'},
            {name:"Contatti e apertura",icon:"fa-phone",link:'contacts'},
            {name:"Proprietá e gestione",icon:"fa-user",link:'management'},
            {name:"Dati catastali",icon:"fa-book",link:'catastal'}
            ]},{
        layerName:"Documents",
        elements:[
            {name:"Documenti",icon:"fa-file-pdf-o",link:'documents'},
            {name:"Immagini",icon:"fa-picture-o",link:'images'}
            ]},{
        layerName:"Economy",
        elements:[
            {name:"Economia",icon:"fa-certificate",link:'economy'},
            {name:"Richiesta contributi",icon:"fa-eur",link:'contribution'},
            {name:"Fruizione",icon:"fa-bar-chart",link:'use'}
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