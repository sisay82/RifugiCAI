import { Component, OnInit } from '@angular/core';
import {ShelterService} from '../shelter.service'
import {IShelter}from '../../shared/types/interfaces';

@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss'],
    providers:[ShelterService]
})
export class BcShelterList {
    filterText: string = "";
    filteredShelter: IShelter[] = [];
    rifugiSample:IShelter[]=[];

    constructor(private shelterService:ShelterService){}

    ngOnInit() {
        this.filterText = "";
        this.shelterService.getShelters().subscribe(shelters=>{
            this.rifugiSample=shelters;
        });
    }

    filterChanged(event: any) {
        var data = this.filterText;
        if (data && this.rifugiSample) {

            const props = ['name', 'municipality', 'province', 'region'];
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