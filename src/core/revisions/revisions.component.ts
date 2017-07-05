import { Component, Input,OnInit } from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import { BcRevisionsService } from './revisions.service';
import {Router,RoutesRecognized} from '@angular/router';

@Component({
    moduleId:module.id,
    selector:'bc-revisions',
    templateUrl: 'revisions.component.html',
    providers:[BcRevisionsService]
})
export class BcRevisions implements OnInit{
    ShelterToUpdate:IShelter;

    constructor(private revisionService:BcRevisionsService,private router: Router){

    }

    ngOnInit(){
        this.revisionService.save$.subscribe(obj=>{
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

        this.router.events.subscribe((event)=>{
            if(event instanceof RoutesRecognized){
                let route=event.state.root;
                while(route.children.length>0){
                    route=route.children[0];
                }
                if(route.outlet=="content"){
                    delete(this.ShelterToUpdate);
                }
            }
        });
    }
}