import { Component, OnInit } from '@angular/core';
import {ShelterService} from '../shelter.service';
import {BcSharedService} from '../shelterPage/shared.service';
import {IShelter,IButton}from '../../shared/types/interfaces';


@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss'],
    providers: [ShelterService]
})
export class BcShelterList {
    list_view_button:IButton={ref:'list',icon:'th-list',text:'Lista',dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'map-marker',text:'Mappa',dark_theme:false};
    add_shelter_button:IButton={action:this.createShel,text:'Aggiungi Rifugio',ref:this,icon:"plus",dark_theme:false};

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

    createShel(ref){
        let newShelSub=ref.shelterService.getNewId().subscribe((obj)=>{
            ref.shared.onActiveOutletChange("revision");
            if(newShelSub!=undefined){
                newShelSub.unsubscribe();
            }
            location.href="shelter/"+obj.id+"/(revision:geographic)";
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