import { Component,OnDestroy } from '@angular/core';
import { IShelter,IFile } from '../../app/shared/types/interfaces';
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
    Files:IFile[]=[];
    saveSub:Subscription;
    loadSub:Subscription;
    saveFilesSub:Subscription;
    saveFileSub:Subscription;
    loadFilesSub:Subscription;
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

        this.saveFileSub=revisionService.saveFile$.subscribe(obj=>{
            if(this.Files!=undefined){
                if(obj.remove){
                    let f=this.Files.find(f=>f._id==obj.file._id);
                    if(f!=undefined){
                        this.Files.splice(this.Files.indexOf(f),1);
                    }
                }else{
                    let fIndex=this.Files.findIndex(f=>f._id==obj.file._id);
                    if(fIndex>-1){
                        this.Files[fIndex]=obj.file;
                    }else{
                        this.Files.push(obj.file);
                    }
                }
            }else{
                if(!obj.remove){
                    this.Files=[obj.file];
                }
            }
        });

        this.saveFilesSub=revisionService.saveFiles$.subscribe(files=>{
            if(this.Files!=undefined){
                for(let file of files){
                    let fIndex=this.Files.findIndex(f=>f._id==file._id);
                    if(fIndex>-1){
                        this.Files[fIndex]=file;
                    }else{
                        this.Files.push(file);
                    }
                }
            }else{
                this.Files=files;
            }
        });

        this.loadFilesSub=revisionService.loadFilesRequest$.subscribe(types=>{
            if(this.Files!=undefined){
                let files = this.Files.filter(f=>types.includes(f.type));
                this.revisionService.onChildLoadFiles(files);
            }else{
                this.revisionService.onChildLoadFiles(null);
            }
        });
        
        this.maskCancelSub=shared.maskCancel$.subscribe(()=>{
            delete(this.ShelterToUpdate);
            delete(this.Files);
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
        delete(this.Files);
        delete(this.ShelterToUpdate);
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
        if(this.saveFilesSub!=undefined){
            this.saveFilesSub.unsubscribe();
        }
        if(this.loadFilesSub!=undefined){
            this.loadFilesSub.unsubscribe();
        }
    }
}