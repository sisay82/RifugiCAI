import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BcSharedService{
    private maskSaveSource = new Subject<string>();
    maskSave$ = this.maskSaveSource.asObservable();
    onMaskSave(){
        this.maskSaveSource.next();
    }

    private maskConfirmSaveSource = new Subject<{dirty:boolean,component:string}>();
    maskConfirmSave$ = this.maskConfirmSaveSource.asObservable();
    onMaskConfirmSave(dirty:boolean,component:string){
        this.maskConfirmSaveSource.next({dirty:dirty,component:component});
    }

    private activeComponentRequestSource = new Subject<void>();
    activeComponentRequest$ = this.activeComponentRequestSource.asObservable();
    onActiveComponentRequest(){
        this.activeComponentRequestSource.next();
    }

    private activeComponentAnswerSource = new Subject<string>();
    activeComponentAnswer$ = this.activeComponentAnswerSource.asObservable();
    onActiveComponentAnswer(component:string){
        this.activeComponentAnswerSource.next(component);
    }

    private activeOutletChangeSource = new Subject<string>();
    activeOutletChange$ = this.activeOutletChangeSource.asObservable();
    onActiveOutletChange(outlet:string){
        this.activeOutletChangeSource.next(outlet);
    }

}