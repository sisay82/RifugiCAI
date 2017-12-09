import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BcMapService{
    private currentCenterSource = new Subject<L.LatLng|L.LatLngExpression>();
    currentcenter$=this.currentCenterSource.asObservable();
    changeCurrentCenter(center:L.LatLng|L.LatLngExpression){
        this.currentCenterSource.next(center);
    }
}