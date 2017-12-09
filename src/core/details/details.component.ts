import { Component, Input } from '@angular/core';
import { IShelter,IFile } from '../../app/shared/types/interfaces';
import { BcDetailsService } from './details.service';
import { Enums } from '../../app/shared/types/enums';
import { Subscription } from 'rxjs/Subscription';
import {BcSharedService} from '../../app/shared/shared.service';

@Component({
    moduleId:module.id,
    selector:'bc-details',
    styleUrls: ['details.component.scss'],
    templateUrl: 'details.component.html',
    providers:[BcDetailsService]
})
export class BcDetails {
    Shelters:IShelter;
    Docs:IFile[];
    Images:IFile[];
    loadSub:Subscription;
    saveSub:Subscription;
    outletChangeSub:Subscription;
    saveFilesSub:Subscription;
    loadFilesSub:Subscription;

    constructor(private detailsService:BcDetailsService,private shared:BcSharedService){
        this.outletChangeSub=shared.activeOutletChange$.subscribe((outlet)=>{
            if(outlet==Enums.Routes.Routed_Outlet.revision){
                delete(this.Shelters);
                delete(this.Docs);
                delete(this.Images);
            }
        });

        this.saveFilesSub=detailsService.saveFiles$.subscribe(files=>{
            for(let file of files){
                if(file.type==Enums.Files.File_Type.image){
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

        this.loadFilesSub=detailsService.loadFilesRequest$.subscribe(types=>{
            let files:IFile[]=[];
            let retNull=false;
            if(this.Docs!=undefined&&
                (types.includes(Enums.Files.File_Type.doc)||types.includes(Enums.Files.File_Type.map)||types.includes(Enums.Files.File_Type.invoice))){
                files=files.concat(this.Docs.filter(f=>types.includes(f.type)));
            }else{
                if(this.Images!=undefined&&types.includes(Enums.Files.File_Type.image)){
                    retNull=false;
                    files=files.concat(this.Images.filter(f=>types.includes(f.type)));
                }else{
                    retNull=true;
                }
            }

            if(retNull){
                this.detailsService.onChildLoadFiles(null);
            }else{
                this.detailsService.onChildLoadFiles(files);
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
        if(this.saveFilesSub!=undefined){
            this.saveFilesSub.unsubscribe();
        }
        if(this.loadFilesSub!=undefined){
            this.loadFilesSub.unsubscribe();
        }
    }

}
