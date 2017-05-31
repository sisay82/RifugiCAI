/**
 * Leaflet providers: http://leaflet-extras.github.io/leaflet-providers/preview/index.html
 * Leaflet examples: http://leafletjs.com/examples.html
 */


import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IMarker } from '../../shared/interfaces';

@Injectable()
export class MapService{
    public static latLngRegions: IMarker[]=[
        {latLng:new L.LatLng(40,10),popup:"",optional:"Veneto"},
        {latLng:new L.LatLng(40,15),popup:"",optional:"Emilia Romagna"},
    ];

    private base_url:string="http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    protected mapOptions:L.MapOptions;
    protected map:Map;

    protected divIcon =L.divIcon({
            className:'',
            html:'<i class="fa fa-map-marker" style="font-size:16px;"></i>',
            iconAnchor:[0,0],
            iconSize:null,
            popupAnchor:[0,0]
        });
        
    constructor(private http:Http){

    }

    getMapInit(mapElement:string):Observable<Map>{

        this.mapOptions={
            zoom:5,
            center:new L.LatLng(41.9051,12.4879)
        }

        this.map = new L.Map(mapElement, {
            center: new L.LatLng(41.9051,12.4879),
            zoom: 5,
        });
        L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'        
        }).addTo(this.map);

        return Observable.of(this.map);
    }


    moveMap(latLon:L.LatLng,zoom:number):Observable<Map>{
        return Observable.of(this.map.setView(latLon,zoom));
    }

    popolateMarkers(markers:IMarker[]):Observable<void>{
        for(let item of markers){
            let pop:string;
            if(item.optional!=undefined)
                pop=item.optional+" "+item.popup;
            else pop=item.popup;
            L.marker(item.latLng,{icon:this.divIcon}).addTo(this.map).bindPopup(pop);
        }

        return;
    }
}