import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { IMarker, IShelter } from '../../shared/interfaces';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class ShelterService{
    shelters:IShelter[]=[
    ];

    /**
     * Return shelters in the area around @point
     * @param point
     */
    getShelters(point:L.LatLng,area:number):IShelter[]{
        return this.shelters;
    }

    getConutryMarkersNumber(country:String):Observable<any>{
        return Observable.of(3);
    }

    getSheltersAroundPoint(point:any,range:number):Observable<any[]>{
        return Observable.of([{name:"Name",location:{region:"Region",provinice:"Province"}}]);
    }

    /**
     * Return markers of shelters of the given country.
     * @param country
     */
    getConutryMarkers(country:string):IShelter[]{
        return this.shelters;
    }
}