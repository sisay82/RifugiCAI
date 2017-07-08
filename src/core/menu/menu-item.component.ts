import {Component,Injectable,Input,OnInit} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { IMenuElement } from '../../app/shared/types/interfaces';
import { Router,ActivatedRoute } from '@angular/router';
import { BcSharedService } from '../../app/shelter/shelterPage/shared.service';
@Injectable()
export class BcItemService{
    private selectSource = new Subject<string>();
    select$ = this.selectSource.asObservable();
    current_select:BcMenuItem;
    onSelect(item:BcMenuItem){
        this.current_select=item;
        this.selectSource.next();
    }
}

@Component({
    moduleId: module.id,
    selector: 'bc-menu-item',
    templateUrl: 'menu-item.component.html',
    styleUrls: ['menu-item.component.scss']

})
export class BcMenuItem {
    @Input() menu_item:IMenuElement;
    private _selected:Boolean;
    local_style:string;

    constructor(private _item_service: BcItemService, private _router:Router,private _route:ActivatedRoute,private shared:BcSharedService){
         this.local_style=this.getClass();
    }   

    clickItem(){
        if(this._item_service!=undefined){
            let activeOutletSub=this.shared.activeOutletAnswer$.subscribe(outlet=>{
                if(outlet=="revision"){
                    this._router.navigate([{outlets:({'revision': [this.menu_item.link],'content': null})}],{relativeTo:this._route});
                }else{
                    this._router.navigate([{outlets:({'content': [this.menu_item.link],'revision': null})}],{relativeTo:this._route});
                }
                
                if(activeOutletSub!=undefined){
                    activeOutletSub.unsubscribe();
                }
                this._selected=true;
                this._item_service.onSelect(this);
                let style=this.getClass();
                this.local_style=style.concat(" bc-menu-item-select");
            });
            this.shared.onActiveOutletRequest();
        }
    }

    itemUncheck(){
        this.local_style=this.getClass();
    }

    getClass(){
        let ret_class="bc-menu-item-content";
        return ret_class;
    }

    ngOnInit(){
        if(this.menu_item.default!=undefined){
             this.clickItem();
         }
    }
}