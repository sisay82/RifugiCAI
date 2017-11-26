import { Component,OnDestroy } from '@angular/core';
import { IShelter,IFile } from '../../app/shared/types/interfaces';
import { Enums } from '../../app/shared/types/enums';
import { BcRevisionsService } from './revisions.service';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {Router,RoutesRecognized} from '@angular/router';

@Component({
    moduleId:module.id,
    selector:'bc-revisions',
    templateUrl: 'revisions.component.html',
    styleUrls:['revisions.component.scss'],
    providers:[BcRevisionsService]
})
export class BcRevisions{
    ShelterToUpdate:IShelter;
    Docs:IFile[];
    Images:IFile[];
    saveSub:Subscription;
    loadSub:Subscription;
    saveFilesSub:Subscription;
    saveFileSub:Subscription;
    loadFilesSub:Subscription;
    maskSaveSub:Subscription;
    maskCancelSub:Subscription;
    childDeleteSub:Subscription;
    outletChangeSub:Subscription;
    constructor(private revisionService:BcRevisionsService,private router: Router,private shared:BcSharedService){
        this.outletChangeSub=shared.activeOutletChange$.subscribe((outlet)=>{
            if(outlet==Enums.Routed_Outlet.content){
                delete(this.ShelterToUpdate);
                delete(this.Docs);
                delete(this.Images);
            }
        });

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
            if(obj.file.type==Enums.File_Type.image){
                if(this.Images!=undefined){
                    if(obj.remove){
                        let f=this.Images.find(f=>f._id==obj.file._id);
                        if(f!=undefined){
                            this.Images.splice(this.Images.indexOf(f),1);
                        }
                    }else{
                        let fIndex=this.Images.findIndex(f=>f._id==obj.file._id);
                        if(fIndex>-1){
                            this.Images[fIndex]=obj.file;
                        }else{
                            this.Images.push(obj.file);
                        }
                    }
                }else{
                    if(!obj.remove){
                        this.Images=[obj.file];
                    }
                }
            }else{
                if(this.Docs!=undefined){
                    if(obj.remove){
                        let f=this.Docs.find(f=>f._id==obj.file._id);
                        if(f!=undefined){
                            this.Docs.splice(this.Docs.indexOf(f),1);
                        }
                    }else{
                        let fIndex=this.Docs.findIndex(f=>f._id==obj.file._id);
                        if(fIndex>-1){
                            this.Docs[fIndex]=obj.file;
                        }else{
                            this.Docs.push(obj.file);
                        }
                    }
                }else{
                    if(!obj.remove){
                        this.Docs=[obj.file];
                    }
                }
            }
            
        });

        this.saveFilesSub=revisionService.saveFiles$.subscribe(files=>{
            for(let file of files){
                if(file.type==Enums.File_Type.image){
                    if(this.Images!=undefined){
                        let fIndex=this.Images.findIndex(f=>f._id==file._id);
                        if(fIndex>-1){
                            this.Images[fIndex]=file;
                        }else{
                            this.Images.push(file);
                        }
                    }else{
                        this.Images=[file]
                    }
                }else{
                    if(this.Docs!=undefined){
                        let fIndex=this.Docs.findIndex(f=>f._id==file._id);
                        if(fIndex>-1){
                            this.Docs[fIndex]=file;
                        }else{
                            this.Docs.push(file);
                        }
                    }else{
                        this.Docs=[file]
                    }
                }
            }
        });

        this.loadFilesSub=revisionService.loadFilesRequest$.subscribe(types=>{
            let files:IFile[]=[];
            let retNull=false;
            if(this.Docs!=undefined&&
                (types.includes(Enums.File_Type.doc)||types.includes(Enums.File_Type.map)||types.includes(Enums.File_Type.invoice))){
                files=files.concat(this.Docs.filter(f=>types.includes(f.type)));
            }else{
                if(this.Images!=undefined&&types.includes(Enums.File_Type.image)){
                    retNull=false;
                    files=files.concat(this.Images.filter(f=>types.includes(f.type)));
                }else{
                    retNull=true;
                }
            }

            if(retNull){
                this.revisionService.onChildLoadFiles(null);
            }else{
                this.revisionService.onChildLoadFiles(files);
            }
        });

        this.maskSaveSub=shared.maskSave$.subscribe(()=>{
            delete(this.ShelterToUpdate);
            delete(this.Docs);
            delete(this.Images);
        });
        
        this.maskCancelSub=shared.maskCancel$.subscribe(()=>{
            delete(this.ShelterToUpdate);
            delete(this.Docs);
            delete(this.Images);
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
        if(this.outletChangeSub!=undefined){
            this.outletChangeSub.unsubscribe();
        }
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
        if(this.maskSaveSub!=undefined){
            this.maskSaveSub.unsubscribe();
        }
    }
}