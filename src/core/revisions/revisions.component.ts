import { Component,OnDestroy } from '@angular/core';
import { IShelter } from '../../app/shared/types/interfaces';
import { BcRevisionsService } from './revisions.service';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {Router,RoutesRecognized} from '@angular/router';

@Component({
    moduleId:module.id,
    selector:'bc-revisions',
    templateUrl: 'revisions.component.html',
    providers:[BcRevisionsService]
})
export class BcRevisions{
    ShelterToUpdate:IShelter;
    saveSub:Subscription;
    loadSub:Subscription;
    maskCancelSub:Subscription;
    childDeleteSub:Subscription;
    constructor(private revisionService:BcRevisionsService,private router: Router,private shared:BcSharedService){
        this.saveSub=revisionService.save$.subscribe(obj=>{
            if(this.ShelterToUpdate!=undefined){
                this.ShelterToUpdate[obj.section]=obj.shelter[obj.section];
            }else{
                this.ShelterToUpdate=obj.shelter;
            }
        });
        
        this.loadSub=revisionService.loadRequest$.subscribe(section=>{
            if(this.ShelterToUpdate!=undefined&&this.ShelterToUpdate[section]!=undefined){
                this.revisionService.onChildLoad(this.ShelterToUpdate);
            }else{
                this.revisionService.onChildLoad(null);
            }
        });
        
        this.maskCancelSub=shared.maskCancel$.subscribe(()=>{
            delete(this.ShelterToUpdate);
            let disableSaveSub = this.revisionService.childDisableSaveAnswer$.subscribe(()=>{
                shared.onMaskConfirmCancel();
                if(disableSaveSub!=undefined){
                    disableSaveSub.unsubscribe();
                }
            });
            this.revisionService.onChildDisableSaveRequest();
        });

        this.childDeleteSub=revisionService.childDelete$.subscribe(section=>{
            if(this.ShelterToUpdate!=undefined&&this.ShelterToUpdate.hasOwnProperty(section))
                delete(this.ShelterToUpdate[section]);
        })
    }

    ngOnDestroy(){
        if(this.saveSub!=undefined){
            this.saveSub.unsubscribe();
        }
        if(this.loadSub!=undefined){
            this.loadSub.unsubscribe();
        }
        if(this.maskCancelSub!=undefined){
            this.maskCancelSub.unsubscribe();
        }
        if(this.childDeleteSub!=undefined){
            this.childDeleteSub.unsubscribe();
        }
    }
}