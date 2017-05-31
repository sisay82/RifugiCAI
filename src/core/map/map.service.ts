import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import * as L from 'leaflet';
import { Map } from 'leaflet';


@Injectable()
export class MapService{
    private base_url:string="http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    protected mapOptions:L.MapOptions;

    constructor(private http:Http){

    }

    getMapInit():Observable<Map>{

        this.mapOptions={
            zoom:5,
            center:new L.LatLng(41.9051,12.4879)
        }

        let map = new L.Map('map', {
            center: new L.LatLng(41.9051,12.4879),
            zoom: 5,
        });
        L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'        
        }).addTo(map);


        return Observable.of(map);
    }
}