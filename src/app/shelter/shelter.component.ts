import { Component, OnInit } from '@angular/core';
import {IShelter} from '../../shared/interfaces';
import { ActivatedRoute } from '@angular/router';
import {ShelterService} from '../../core/shelter/shelter.service'

@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss'],
    providers:[ShelterService]

})
export class BcShelter {
    shelter:IShelter={id:"id",name:"nome",registry:{address:{via:"via",number:1,cap:1,city:"cittá",collective:"comune",country:"regione",district:"provincia"}}};

    constructor(private shelterService:ShelterService,private route:ActivatedRoute){}

    ngOnInit(){
        this.route.params.subscribe(params=>{
            this.shelter=this.shelterService.getByName(params['name']);
            
            //hardcoded
            this.shelter.name=params['name'];
        });
    }
}