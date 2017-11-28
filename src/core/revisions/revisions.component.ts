import { Component,OnDestroy } from '@angular/core';
import { IShelter,IFile } from '../../app/shared/types/interfaces';
import { Enums } from '../../app/shared/types/enums';
import { BcRevisionsService } from './revisions.service';
import {BcSharedService} from '../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import {Router,RoutesRecognized} from '@angular/router';
import {BcAuthService} from '../../app/shared/auth.service';

@Component({
    moduleId:module.id,
    selector:'bc-revisions',
    templateUrl: 'revisions.component.html',
    styleUrls:['revisions.component.scss'],
    providers:[BcRevisionsService]
})
export class BcRevisions{
    shelterToUpdate:IShelter;
    docs:IFile[];
    images:IFile[];
    subscriptions:Subscription[]=[];
    localPermissions:any[];
    updateFile(file:IFile,remove?:Boolean){
        if(file.type==Enums.File_Type.image){
            this.updateFileLocal(this.images,file,remove);
        }else{
            this.updateFileLocal(this.docs,file,remove);
        }
    }

    saveFiles(files:IFile[]){
        for(let file of files){
            if(file.type==Enums.File_Type.image){
                this.updateFileLocal(this.images,file);
            }else{
                this.updateFileLocal(this.docs,file);
            }
        }
    }

    updateFileLocal(storage:IFile[],file:IFile,remove?:Boolean):void{
        if(storage!=undefined){
            if(remove){
                const f=storage.find(f=>f._id==file._id);
                if(f!=undefined){
                    storage.splice(storage.indexOf(f),1);
                }
            }else{
                const fIndex=storage.findIndex(f=>f._id==file._id);
                if(fIndex>-1){
                    storage[fIndex]=file;
                }else{
                    storage.push(file);
                }
            }
        }else{
            if(!remove){
                storage=[file];
            }
        }
    }

    deleteSection(section:string){
        if(this.shelterToUpdate&&this.shelterToUpdate.hasOwnProperty(section)){
            this.shelterToUpdate[section]=null;
        }
    }

    initStorage(){
        this.docs=null;
        this.images=null;
        this.shelterToUpdate=null;
    }

    checkDocTypes(types:Enums.File_Type[]):boolean{
        return (types.includes(Enums.File_Type.doc)||types.includes(Enums.File_Type.map)||types.includes(Enums.File_Type.invoice));
    }
    
    checkImageTypes(types:Enums.File_Type[]):boolean{
        return types.includes(Enums.File_Type.image);
    }

    constructor(private revisionService:BcRevisionsService,private router: Router,private shared:BcSharedService,private authService:BcAuthService){
        this.subscriptions.push(
            authService.getPermissions().subscribe(permissions=>{
                this.localPermissions=permissions; 
                revisionService.onFatherReturnPermissions(this.localPermissions);         
                this.subscriptions.push(revisionService.childGetPermissions$.subscribe(()=>{
                    revisionService.onFatherReturnPermissions(this.localPermissions);
                }));
            }),
            shared.activeOutletChange$.subscribe((outlet)=>{
                if(outlet==Enums.Routed_Outlet.content){
                    this.initStorage();
                }
            }),
            revisionService.save$.subscribe(obj=>{
                if(this.shelterToUpdate){
                    this.shelterToUpdate[obj.section]=obj.shelter[obj.section];
                }else{
                    this.shelterToUpdate=obj.shelter;
                }
            }),
            revisionService.loadRequest$.subscribe(section=>{
                if(this.shelterToUpdate&&this.shelterToUpdate[section]){
                    this.revisionService.onChildLoad(this.shelterToUpdate);
                }else{
                    this.revisionService.onChildLoad(null);
                }
            }),
            revisionService.saveFile$.subscribe(obj=>{
                this.updateFile(obj.file,obj.remove);
            }),
            revisionService.saveFiles$.subscribe(files=>{
                this.saveFiles(files);
            }),
            revisionService.loadFilesRequest$.subscribe(types=>{
                let files:IFile[]=[];
                let retNull=false;
                if(this.docs!=undefined&&this.checkDocTypes(types)){
                    files=files.concat(this.docs.filter(f=>types.includes(f.type)));
                }else{
                    if(this.images!=undefined&&this.checkImageTypes(types)){
                        retNull=false;
                        files=files.concat(this.images.filter(f=>types.includes(f.type)));
                    }else{
                        retNull=true;
                    }
                }
                
                if(retNull){
                    this.revisionService.onChildLoadFiles(null);
                }else{
                    this.revisionService.onChildLoadFiles(files);
                }
            }),
            shared.maskSave$.subscribe(()=>{
                this.initStorage();
            }),
            shared.maskCancel$.subscribe(()=>{
                this.initStorage();
                const disableSaveSub = this.revisionService.childDisableSaveAnswer$.subscribe(()=>{
                    shared.onMaskConfirmCancel();
                    if(disableSaveSub!=undefined){
                        disableSaveSub.unsubscribe();
                    }
                });
                this.revisionService.onChildDisableSaveRequest();
            }),
            revisionService.childDelete$.subscribe(section=>{
                this.deleteSection(section);
            })
        );
    }

    ngOnDestroy(){
        this.subscriptions.forEach(sub=>{
            if(sub){
                sub.unsubscribe();
            }
        });
    }
}