import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { IMarker/*, IShelter*/ } from '../../shared/interfaces';
@Injectable()
export class ShelterService{
     markers:IMarker[]=[
        {latLng:new L.LatLng(40,10), popup:"popup1"},
        {latLng:new L.LatLng(30,13), popup:"popup2"},
        {latLng:new L.LatLng(20,15), popup:"popup3"},
    ];

    /**
     * Return shelters in the area around @point
     * @param point
     */
    getShelters(point:L.LatLng,area:number):IMarker[]{
        return this.markers;
    }

    /**
     * Return markers of shelters of the given country.
     * @param country
     */
    getConutryMarkers(country:string):IMarker[]{
        return this.markers;
    }
}