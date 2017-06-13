import {Component,Injectable,Input,OnInit} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { IMenuElement } from '../../shared/interfaces';
import { Router,ActivatedRoute } from '@angular/router';

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

    constructor(private _item_service: BcItemService, private _router:Router,private _route:ActivatedRoute){
         this.local_style=this.getClass();
    }   

    clickItem(){
        if(this._item_service!=undefined){
            this._router.navigate(this.menu_item.link,{relativeTo:this._route});
            this._selected=true;
            this._item_service.onSelect(this);
            let style=this.getClass();
            this.local_style=style.concat(" bc-menu-item-select");
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