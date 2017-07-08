import { Component, OnInit } from '@angular/core';
import { ShelterService } from '../shelter.service'
import { IShelter,IMenu } from '../../shared/types/interfaces';

@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss'],
    providers: [ShelterService]
})
export class BcShelterList {
    appMenuElements:IMenu={
    layers:[{
      layerName:"Publics",
      elements:[
        {name:"Dati geografici",icon:"map-signs",link:"geographics"},
        {name:"Servizi",icon:"home",link:"#"},
        {name:"Contatti e apertura",icon:"phone",link:"#"},
        {name:"Proprietá e gestione",icon:"user",link:"#"},
        {name:"Dati catastali",icon:"book",link:"#"}
        ]},{
      layerName:"Documents",
      elements:[
        {name:"Documenti",icon:"file-pdf-o",link:"#"},
        {name:"Immagini",icon:"picture-o",link:"#"}
        ]},{
      layerName:"Economy",
      elements:[
        {name:"Economia",icon:"certificate",link:"#"},
        {name:"Richiesta contributi",icon:"eur",link:"#"},
        {name:"Fruizione",icon:"bar-chart",link:"#"}
      ]}
    ]
  };

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