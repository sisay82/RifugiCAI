import { Component } from '@angular/core';
import {IMenu} from '../../shared/types/interfaces';
import {BcSharedService} from './shared.service'
@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss'],

})
export class BcShelter {
    appMenuElements:IMenu={
    layers:[{
        layerName:"Publics",
        elements:[
            {name:"Dati geografici",icon:"map-signs",link:'geographic',default:true},
            {name:"Servizi",icon:"home",link:'services'},
            {name:"Contatti e apertura",icon:"phone",link:'contacts'},
            {name:"Proprietá e gestione",icon:"user",link:'management'},
            {name:"Dati catastali",icon:"book",link:'catastal'}
            ]},{
        layerName:"Documents",
        elements:[
            {name:"Documenti",icon:"file-pdf-o",link:'documents'},
            {name:"Immagini",icon:"picture-o",link:'images'}
            ]},{
        layerName:"Economy",
        elements:[
            {name:"Economia",icon:"certificate",link:'economy'},
            {name:"Richiesta contributi",icon:"eur",link:'contribution'},
            {name:"Fruizione",icon:"bar-chart",link:'use'}
        ]}
        ]
    };

    constructor(private shared:BcSharedService){
    }
    
}