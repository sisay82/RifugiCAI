import { Component, OnInit } from '@angular/core';
import { ShelterService } from '../shelter.service'
import { IShelter } from '../../shared/types/interfaces';
import { Enums } from '../../shared/types/enums';
import {BcSharedService} from '../../shared/shared.service';
import {BcAuthService} from '../../shared/auth.service';
import { Subscription } from 'rxjs/Subscription';

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
    private profile:{code:String,role:Enums.User_Type};
    isCentral:boolean;
    constructor(private shelterService: ShelterService,private shared:BcSharedService,private authService:BcAuthService) {}

    private isCentralUser(){
        this.authService.isCentralUser().subscribe(val=>{
            this.isCentral=val;
        });
    }

    getAuth(){
        return (this.profile!=null)
    }

    ngOnInit() {
        let permissionSub = this.authService.getUserProfile().subscribe(profile=>{
            this.profile=profile;
            
            let section;
            let region;
            let processedProfile=this.authService.processUserProfileCode(profile);
            if(!processedProfile){
                return;
            }
            section=processedProfile.section;
            region=processedProfile.region;
            
            this.isCentralUser();
            let shelSub = this.shelterService.getShelters(region,section).subscribe(shelters => {
                this.rifugiSample = shelters;
                this.filteredShelter = shelters;
                this.filterChanged("");
    
                if(shelSub!=undefined){
                    shelSub.unsubscribe();
                }
                if(permissionSub){
                    permissionSub.unsubscribe();
                }
            });
        });
        this.filterText = "";
    }

    createShel(){
        if(this.isCentralUser()){
            let newShelSub=this.shelterService.getNewId().subscribe((obj)=>{
                this.shared.activeOutlet="revision";
                this.shared.activeComponent="geographic";
                if(newShelSub!=undefined){
                    newShelSub.unsubscribe();
                }
                location.href="newShelter/"+obj.id+"/(revision:geographic)";
            });
        }
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
                }
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