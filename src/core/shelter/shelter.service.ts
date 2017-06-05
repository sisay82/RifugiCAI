import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { IMarker, IShelter } from '../../shared/interfaces';
@Injectable()
export class ShelterService{
     shelters:IShelter[]=[
        {latLng:new L.LatLng(43.77,11.2), name:"Shelter1",collective:"Comune1",country:"Regione1",district:"Provincia1"},
        {latLng:new L.LatLng(43.14,11.42), name:"Shelter2",collective:"Comune2",country:"Regione1",district:"Provincia1"},
        {latLng:new L.LatLng(43.4,11.5),name:"Shelter3",collective:"Comune1",country:"Regione1",district:"Provincia1"},
    ];

    /**
     * Return shelters in the area around @point
     * @param point
     */
    getShelters(point:L.LatLng,area:number):IShelter[]{
        return this.shelters;
    }

    /**
     * Return markers of shelters of the given country.
     * @param country
     */
    getConutryMarkers(country:string):IShelter[]{
        return this.shelters;
    }
}