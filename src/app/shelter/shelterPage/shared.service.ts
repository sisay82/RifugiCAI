import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { IShelter } from '../../shared/types/interfaces';

@Injectable()
export class BcSharedService{
    private maskSaveSource = new Subject<any>();
    maskSave$ = this.maskSaveSource.asObservable();
    onMaskSave(shelter:any){
        this.maskSaveSource.next(shelter);
    }

    private maskInvalidSource = new Subject<void>();
    maskInvalid$ = this.maskInvalidSource.asObservable();
    onMaskInvalid(){
        this.maskInvalidSource.next();
    }

    private masValidSource = new Subject<void>();
    maskValid$ = this.masValidSource.asObservable();
    onMaskValid(){
        this.masValidSource.next();
    }

    private maskCancelSource = new Subject<void>();
    maskCancel$ = this.maskCancelSource.asObservable();
    onMaskCancel(){
        this.maskCancelSource.next();
    }

    private activeOutletRequestSource = new Subject<void>();
    activeOutletRequest$ = this.activeOutletRequestSource.asObservable();
    onActiveOutletRequest(){
        this.activeOutletRequestSource.next();
    }

    private activeOutletAnswerSource = new Subject<string>();
    activeOutletAnswer$ = this.activeOutletAnswerSource.asObservable();
    onActiveOutletAnswer(outlet){
        this.activeOutletAnswerSource.next(outlet);
    }

    private maskCancelConfirmSource = new Subject<void>();
    maskCancelConfirm$ = this.maskCancelConfirmSource.asObservable();
    onMaskConfirmCancel(){
        this.maskCancelConfirmSource.next();
    }

    private maskConfirmSaveSource = new Subject<string>();
    maskConfirmSave$ = this.maskConfirmSaveSource.asObservable();
    onMaskConfirmSave(component:string){
        this.maskConfirmSaveSource.next(component);
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