import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import * as L from 'leaflet';
import { Map } from 'leaflet';

@Component({
    moduleId:module.id,
    selector:'bc-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    providers:[MapService]
})
export class BcMap implements OnInit{


    constructor(private mapService: MapService){}

    ngOnInit(){
        this.mapService.getMapInit();

       /* L.marker([51.5, -0.09]).addTo(map)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();*/

    }
}