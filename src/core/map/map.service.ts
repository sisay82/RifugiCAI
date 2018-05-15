import { Injectable } from '@angular/core'
import { Subject } from 'rxjs';
import { LatLngExpression, LatLng } from 'leaflet';

@Injectable()
export class BcMapService {
    private currentCenterSource = new Subject<LatLng | LatLngExpression>();
    currentcenter$ = this.currentCenterSource.asObservable();
    changeCurrentCenter(center: LatLng | LatLngExpression) {
        this.currentCenterSource.next(center);
    }
}
