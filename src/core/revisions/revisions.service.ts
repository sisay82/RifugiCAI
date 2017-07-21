import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { IShelter } from '../../app/shared/types/interfaces';

@Injectable()
export class BcRevisionsService{
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