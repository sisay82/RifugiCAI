import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IMarker } from '../../shared/interfaces';

@Component({
    moduleId:module.id,
    selector:'bc-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    providers:[MapService]
})
export class BcMap implements OnInit{
    markers:IMarker[]=[
        {latLng:new L.LatLng(40,10), popup:"popup1"},
        {latLng:new L.LatLng(30,13), popup:"popup2"},
        {latLng:new L.LatLng(20,15), popup:"popup3"},
    ];

    constructor(private mapService: MapService){}

    moveMap(){
        this.mapService.moveMap(new L.LatLng(40.0,10.0),5);
    }

    ngOnInit(){
        this.mapService.getMapInit('map');
        
        
        this.mapService.popolateMarkers(MapService.latLngRegions);

       // this.mapService.popolateMarkers(this.markers);
    }
}