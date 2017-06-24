import { Component, Input, ContentChildren, QueryList, OnInit } from '@angular/core';
import {IButton} from '../../shared/interfaces';
import {BcButton,BcButtonService} from './button.component';
@Component({
    moduleId:module.id,
    selector:'bc-select-group',
    templateUrl: 'selectGroup.component.html',
    styleUrls: ['selectGroup.component.scss'],
    providers:[BcButtonService]
})
export class BcSelectGroup{
   // parentSubject:Subject<BcButton>=new Subject();
    current_check:BcButton;
    @ContentChildren(BcButton) _listItems: QueryList<BcButton>;

    constructor(private _button_service:BcButtonService){
        _button_service.select$.subscribe(child=>{
            this._listItems.forEach((child:BcButton)=>{
                child.btnUncheck();
            });
        });
    }

    childClick(child:BcButton){
        if(this.current_check!=null&&this.current_check!=undefined)
            this.current_check.btnUncheck();
        this.current_check=child;
    }

    ngOnInit(){
        
    }

}