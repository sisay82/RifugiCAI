import { Component, OnInit } from '@angular/core';
import { ShelterService } from '../shelter.service'
import { IShelter } from '../../shared/types/interfaces';
import { Enums } from '../../shared/types/enums';
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
            this.filteredShelter = shelters;
            this.filterChanged("");
        });
    }

    createShel(){
        let newShelSub=this.shelterService.getNewId().subscribe((obj)=>{
            this.shared.activeOutlet=Enums.Routed_Outlet.revision;
            this.shared.activeComponent=Enums.Routed_Component.geographic;
            if(newShelSub!=undefined){
                newShelSub.unsubscribe();
            }
            location.href="newShelter/"+obj.id+"/(revision:geographic)";
        });
    }

    buttonAction(){
        console.log("Button Click");
    }

    filterChanged(event: any) {
        let data = this.filterText;
        if (data && this.rifugiSample) {
            const props = ['name','branch'];
            this.filteredShelter = this.rifugiSample.filter((item: any) => {
                let match = false;
                for (let prop of props) {
                    if (item[prop]&&item[prop].toString().toUpperCase().indexOf(data.toUpperCase()) > -1) {
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
        this.filteredShelter=this.filteredShelter.sort((a:IShelter,b:IShelter)=>{
            return a.name.localeCompare(<string>b.name);
        });
    }
}