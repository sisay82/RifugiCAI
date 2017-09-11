import { Component, OnInit } from '@angular/core';
import { ShelterService } from '../shelter.service'
import { IShelter,IButton } from '../../shared/types/interfaces';
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
    list_view_button:IButton={ref:'list',icon:'th-list',text:'Lista',dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'map-marker',text:'Mappa',dark_theme:false};
    add_shelter_button:IButton={action:this.createShel,text:'Aggiungi Rifugio',ref:this,icon:"plus",dark_theme:false};

    filterText: string = "";
    filteredShelter: IShelter[] = [];
    rifugiSample: IShelter[] = [];
    private profile:{code:String,role:Enums.User_Type};

    constructor(private shelterService: ShelterService,private shared:BcSharedService,private authService:BcAuthService) {
        
    }

    private checkUser(code:String):any{
        return code.substr(0,2)
    }

    private getRegion(code:String){
        return code.substr(2,2);
    }

    private getSection(code:String){
        return code.substr(4,3);
    }

    private isCentralUser(){
        return (this.profile&&this.profile.role==Enums.User_Type.central);
    }

    ngOnInit() {
        let permissionSub = this.authService.getUserProfile().subscribe(profile=>{
            this.profile=profile;
            
            let section;
            let region;
            if(profile.role==Enums.User_Type.regional){
                region=this.getRegion(profile.code);
            }else if(profile.role==Enums.User_Type.sectional){
                section=this.getSection(profile.code);
            }else if(profile.role!=Enums.User_Type.central){
                console.log("Invalid User");
                return;
            }
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

    buttonAction(){
        console.log("Button Click");
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
        this.filteredShelter=this.filteredShelter.sort((a:IShelter,b:IShelter)=>{
            return a.name.localeCompare(<string>b.name);
        });
    }
}