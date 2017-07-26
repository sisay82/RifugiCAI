import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { IShelter } from '../shared/types/interfaces';

@Injectable()
export class BcSharedService{
    activeOutlet:string;
    activeComponent:string;
    newShelter:boolean=false;

    private displayErrorSource = new Subject<void>();
    displayError$ = this.displayErrorSource.asObservable();
    onDisplayError(){
        this.displayErrorSource.next();
    }

    private maskSaveSource = new Subject<any>();
    maskSave$ = this.maskSaveSource.asObservable();
    onMaskSave(shelter:any){
        this.maskSaveSource.next(shelter);
    }

    private toggleMenuSource = new Subject<void>();
    toggleMenu$ = this.toggleMenuSource.asObservable();
    onToggleMenu(){
        this.toggleMenuSource.next();
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

    private activeOutletChangeSource = new Subject<string>();
    activeOutletChange$ = this.activeOutletChangeSource.asObservable();
    onActiveOutletChange(outlet:string){
        this.activeOutlet=outlet;
        this.activeOutletChangeSource.next(outlet);
    }

}