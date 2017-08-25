import { Component, Input } from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import { BcDetailsService } from './details.service';
import { Subscription } from 'rxjs/Subscription';
import {BcSharedService} from '../../app/shared/shared.service';

@Component({
    moduleId:module.id,
    selector:'bc-details',
    templateUrl: 'details.component.html',
    providers:[BcDetailsService]
})
export class BcDetails {
    Shelters:IShelter;
    loadSub:Subscription;
    saveSub:Subscription;
    outletChangeSub:Subscription;

    constructor(private detailsService:BcDetailsService,private shared:BcSharedService){
        this.outletChangeSub=shared.activeOutletChange$.subscribe((outlet)=>{
            if(outlet=="revision"){
                delete(this.Shelters);
            }
        });

        this.saveSub=detailsService.save$.subscribe(obj=>{
            if(this.Shelters!=undefined){
                this.Shelters[obj.section]=obj.shelter[obj.section];
            }else{
                this.Shelters=obj.shelter;
            }
        });

        this.loadSub=detailsService.loadRequest$.subscribe(section=>{
            if(this.Shelters!=undefined&&this.Shelters[section]!=undefined){
                this.detailsService.onChildLoad(this.Shelters);
            }else{
                this.detailsService.onChildLoad(null);
            }
        });
    }

    ngOnDestroy(){
        if(this.outletChangeSub!=undefined){
            this.outletChangeSub.unsubscribe();
        }
        if(this.saveSub!=undefined){
            this.saveSub.unsubscribe();
        }
        if(this.loadSub!=undefined){
            this.loadSub.unsubscribe();
        }
    }

}