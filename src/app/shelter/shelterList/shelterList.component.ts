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
    filteredShelter: any[] = [];
    rifugiSample:any[]=[];

    constructor(private shelterService:ShelterService){}
    
    ngOnInit() {
        this.filterText = "";
        this.shelterService.getSheltersPage(0,6).subscribe(shelters=>{
            shelters.results.forEach(shelter=>{
                this.shelterService.getShelterSection(shelter._id,"geoData").subscribe(shel=>{
                    this.rifugiSample.push(
                        {
                            _id:shelter._id,
                            name:shelter.name,
                            municipality:shel.geoData.location.municipality,
                            province:shel.geoData.location.province,
                            region:shel.geoData.location.region
                        });
                        this.filterChanged("");
                })
            });
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