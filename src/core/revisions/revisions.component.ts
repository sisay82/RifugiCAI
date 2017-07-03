import { Component, Input,OnInit } from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import { BcRevisionsService } from './revisions.service';

@Component({
    moduleId:module.id,
    selector:'bc-revisions',
    templateUrl: 'revisions.component.html',
    providers:[BcRevisionsService]
})
export class BcRevisions implements OnInit{
    ShelterToUpdate:IShelter;

    constructor(private revisionService:BcRevisionsService){

    }

    ngOnInit(){
        this.revisionService.save$.subscribe(obj=>{
            console.log(obj.shelter);
            if(this.ShelterToUpdate!=undefined){
                this.ShelterToUpdate[obj.section]=obj.shelter[obj.section];
            }else{
                this.ShelterToUpdate=obj.shelter;
            }
        });
        
        this.revisionService.loadRequest$.subscribe(section=>{
            if(this.ShelterToUpdate!=undefined&&this.ShelterToUpdate[section]!=undefined){
                this.revisionService.onChildLoad(this.ShelterToUpdate);
            }else{
                this.revisionService.onChildLoad(null);
            }
        });
    }
}