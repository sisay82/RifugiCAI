import { Component, OnInit } from '@angular/core';
import { ShelterService } from '../shelter.service'
import { IShelter } from '../../shared/types/interfaces';
import {BcSharedService} from '../../shared/shared.service';

@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss'],
    providers: [ShelterService,BcSharedService]
})
export class BcShelterList {
    filterText: string = "";
    filteredShelter: IShelter[] = [];
    rifugiSample: IShelter[] = [];

    constructor(private shelterService: ShelterService,private shared:BcSharedService) {

    }

    ngOnInit() {
        this.filterText = "";
        this.shelterService.getShelters().subscribe(shelters => {
            this.rifugiSample = shelters;
        });
    }

    createShel(){
        let newShelSub=this.shelterService.getNewId().subscribe((obj)=>{
            this.shared.activeOutlet="revision";
            this.shared.activeComponent="geographic";
            if(newShelSub!=undefined){
                newShelSub.unsubscribe();
            }
            location.href="newShelter/"+obj.id+"/(revision:geographic)";
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