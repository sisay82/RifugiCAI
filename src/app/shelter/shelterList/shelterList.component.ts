import { Component, OnInit } from '@angular/core';
import { ShelterService } from '../shelter.service'
import { BcSharedService } from '../../shared/shared.service'
import { IShelter,IMenu } from '../../shared/types/interfaces';

@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss'],
    providers: [ShelterService,BcSharedService]
})
export class BcShelterList {
    appMenuElements:IMenu={
        elements:[
            {name:"Dati geografici",icon:"map-signs",link:"geographic"},
            {name:"Servizi",icon:"home",link:"services"},
            {name:"Contatti e apertura",icon:"phone",link:"contacts"},
            {name:"Proprietá e gestione",icon:"user",link:"management"},
            {name:"Dati catastali",icon:"book",link:"catastal"},
            {name:"Documenti",icon:"file-pdf-o",link:"geographic"},
            {name:"Immagini",icon:"picture-o",link:"geographic"},
            {name:"Economia",icon:"certificate",link:"geographic"},
            {name:"Richiesta contributi",icon:"eur",link:"geographic"},
            {name:"Fruizione",icon:"bar-chart",link:"geographic"}
        ]};

    /*appMenuElements:IMenu={
      layers:[
        {
            layerName:"",
            elements:[
                {name:"Dati geografici",icon:"map-signs",link:"geographics"},
                {name:"Servizi",icon:"home",link:"#"},
                {name:"Contatti e apertura",icon:"phone",link:"#"},
                {name:"Proprietá e gestione",icon:"user",link:"#"},
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

    filterText: string = "";
    filteredShelter: IShelter[] = [];
    rifugiSample: IShelter[] = [];

    constructor(private shelterService: ShelterService) { }

    ngOnInit() {
        this.filterText = "";
        this.shelterService.getShelters().subscribe(shelters => {
            this.rifugiSample = shelters;
        });
    }

    filterChanged(event: any) {
        var data = this.filterText;
        if (data && this.rifugiSample) {

            const props = ['name'];
            this.filteredShelter = this.rifugiSample.filter((item: any) => {
                let match = false;
                for (let prop of props) {
                    if (item[prop].toString().toUpperCase().indexOf(data.toUpperCase()) > -1) {
                        match = true;
                        break;
                    }
                };
                return match;
            });
        }
        else {
            this.filteredShelter = this.rifugiSample;
        }
    }
}