import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { IShelter,IFile } from '../../app/shared/types/interfaces';

@Injectable()
export class BcRevisionsService{
    private localPermissions:any[];

    private childSaveSource = new Subject<{shelter:IShelter,section:string}>();
    save$ = this.childSaveSource.asObservable();

    private childLoadSource = new Subject<IShelter>();
    load$ = this.childLoadSource.asObservable();

    private childLoadRequestSource = new Subject<string>();
    loadRequest$ = this.childLoadRequestSource.asObservable();

    private childDeleteSource = new Subject<string>();
    childDelete$ = this.childDeleteSource.asObservable();

    private childDisableSaveRequestSource = new Subject<void>();
    childDisableSaveRequest$ = this.childDisableSaveRequestSource.asObservable();

    private childDisableSaveAnswerSource = new Subject<void>();
    childDisableSaveAnswer$ = this.childDisableSaveAnswerSource.asObservable();

    private childSaveFileSource = new Subject<{file:IFile,remove?:Boolean}>();
    saveFile$ = this.childSaveFileSource.asObservable();

    private childSaveFilesSource = new Subject<IFile[]>();
    saveFiles$ = this.childSaveFilesSource.asObservable();

    private childLoadFilesSource = new Subject<IFile[]>();
    loadFiles$ = this.childLoadFilesSource.asObservable();

    private childLoadFilesSourceRequest = new Subject<any[]>();
    loadFilesRequest$ = this.childLoadFilesSourceRequest.asObservable();

    private childGetPermissionsSource = new Subject<void>();
    childGetPermissions$ = this.childGetPermissionsSource.asObservable();

    private fatherReturnPermissionsSource = new Subject<any[]>();
    fatherReturnPermissions$ = this.fatherReturnPermissionsSource.asObservable();

    onChildGetPermissions(){
        this.childGetPermissionsSource.next();
    }
    
    onFatherReturnPermissions(permissions){
        this.fatherReturnPermissionsSource.next(permissions);
    }

    onChildSaveFile(file:IFile,remove?:Boolean){
        this.childSaveFileSource.next({file:file,remove:remove});
    }

    onChildSaveFiles(files:IFile[]){
        this.childSaveFilesSource.next(files);
    }

    onChildLoadFiles(files:IFile[]){
        this.childLoadFilesSource.next(files);
    }

    onChildLoadFilesRequest(types:any[]){
        this.childLoadFilesSourceRequest.next(types);
    }

    onChildDisableSaveRequest(){
        this.childDisableSaveRequestSource.next();
    }

    onChildDisableSaveAnswer(){
        this.childDisableSaveAnswerSource.next();
    }

    onChildSave(shelter:IShelter,section:string){
        this.childSaveSource.next({shelter:shelter,section:section});
    }

    onChildLoadRequest(section:string){
        this.childLoadRequestSource.next(section);
    }

    onChildLoad(shelter:IShelter){
        this.childLoadSource.next(shelter);
    }

    onChildDelete(section:string){
        this.childDeleteSource.next(section);
    }
    
}