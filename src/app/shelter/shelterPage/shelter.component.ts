import { Component } from '@angular/core';
import {IMenu} from '../../shared/types/interfaces';
@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss']

})
export class BcShelter {

   appMenuElements:IMenu={
        elements:[
            {name:"Dati geografici",icon:"map-signs",link:"geographic"},
            {name:"Servizi",icon:"home",link:"services"},
            {name:"Contatti e apertura",icon:"phone",link:"contacts"},
            {name:"Proprietá e custodia",icon:"user",link:"management"},
            {name:"Dati catastali",icon:"book",link:"catastal"},
            {name:"Documenti",icon:"file-pdf-o",link:"documents"},
            {name:"Immagini",icon:"picture-o",link:"images"},
            {name:"Economia",icon:"certificate",link:"economy"},
            {name:"Richiesta contributi",icon:"eur",link:"contribution"},
            {name:"Fruizione",icon:"bar-chart",link:"use"}
        ]};

    /*appMenuElements:IMenu={
      layers:[
        {
            layerName:"",
            elements:[
                {name:"Dati geografici",icon:"map-signs",link:"geographics"},
                {name:"Servizi",icon:"home",link:"#"},
                {name:"Contatti e apertura",icon:"phone",link:"#"},
                {name:"Proprietá e custodia",icon:"user",link:"#"},
                {name:"Dati catastali",icon:"book",link:"#"}
            ]},{
            layerName:"",
            elements:[
                {name:"Documenti",icon:"file-pdf-o",link:"#"},
                {name:"Immagini",icon:"picture-o",link:"#"},
            ]},{
            layerName:"",
            elements:[
                {name:"Economia",icon:"certificate",link:"#"},
                {name:"Richiesta contributi",icon:"eur",link:"#"},
                {name:"Fruizione",icon:"bar-chart",link:"#"}
            ]}
        ]
    };*/
    
}