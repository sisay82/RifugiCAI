import { Component, OnInit, Input } from '@angular/core';
import { ShelterService } from '../shelter/shelter.service';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IMarker } from '../../shared/interfaces';
@Component({
    moduleId:module.id,
    selector:'bc-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    providers:[ShelterService]
})
export class BcMap implements OnInit{
    @Input() enableExpansion:boolean=false;
    @Input() iconSize:string="18px";
    @Input() windowSize:{width:string,height:string}={width:'800px',height:'600px'};
    @Input() initialCenter:L.LatLng=L.latLng(41.9051,12.4879);

    public static latLngCountries: IMarker[]=[
        {latLng:new L.LatLng(40,10),popup:"",optional:{id:"Veneto"}},
        {latLng:new L.LatLng(40,15),popup:"",optional:{id:"Emilia Romagna"}},
    ];

    private expanded:boolean=false;   
    private markerPane= L.featureGroup();

    private base_url:string="http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    private map:Map;

    private divIcon;

    constructor(public shelterService:ShelterService){
        this.divIcon =L.divIcon({
            className:"",
            iconSize:null,
            html:'<style>.bc-marker:hover{color:#26a69a;} .bc-marker{font-size:'+this.iconSize+';} </style><div class="fa fa-map-marker bc-marker"></div>',
            iconAnchor:[0,0],
            popupAnchor:[0,0]
            
        });

    }

    ngOnInit(){
        this.getMapInit('map');
     //   document.getElementById("map").style.width=this.windowSize.width;
      //  document.getElementById("map").style.height=this.windowSize.height;
        this.map.invalidateSize();
        this.map.setView(this.initialCenter,6);

        this.markRegions();

    }

    addMarker(marker:L.Marker){
        this.markerPane.addLayer(marker);
       // document.getElementById("marker").className="bc-marker";
        //L.DomUtil.addClass(,"bc-marker");

    }

    getMapInit(mapElement:string){
        this.map = new L.Map(mapElement);
        L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'        
        }).addTo(this.map);
        this.map.on("zoom",this.zoomEvent,this);
        this.markerPane.addTo(this.map);
        if(this.enableExpansion)
            this.map.on("click",this.clickEvent,this);
    }

    popolateMarkers(markers:IMarker[]){
        for(let item of markers){
            this.addMarker(
                L.marker(item.latLng,{icon:this.divIcon}).bindPopup(item.popup)
                );
        }
    }

    markRegions(){
        for(let item of BcMap.latLngCountries){       
            let shelterCount:number = this.shelterService.getConutryMarkers(item.optional.id).length;
            this.addMarker(L.marker(item.latLng,{icon:this.divIcon}).bindPopup(shelterCount.toString()).on("click",this.openPopupRegion,this));
        }
    }

    openPopupRegion(event:L.Event){
        console.log(event.target);
        this.map.setView(event.target._latlng,8);
    }

    removeMarkers(){
        this.markerPane.clearLayers();
    }

    zoomEvent(event:L.Event){
        if(event.target.getZoom()>6){
            this.removeMarkers();
            this.popolateMarkers(
                this.shelterService.getShelters(
                    event.target.getCenter(),10));
        }else{
            this.removeMarkers();
            this.markRegions();
        }
    }

    clickEvent(event:MouseEvent){   
        if(!this.expanded){
            document.getElementById("map").style.width="100%";
            document.getElementById("map").style.height="100%";
            document.getElementById("map").style.position="absolute";
            this.expanded=true;
            this.map.off("click");
            this.map.invalidateSize();
        }else{this.expanded=false;}
    }

    clickCloseEvent(event:Event){        
        if(this.expanded){
            document.getElementById("map").style.width=this.windowSize.width;
            document.getElementById("map").style.height=this.windowSize.height;
            document.getElementById("map").style.position="relative";
            this.map.invalidateSize();
            this.map.on("click",this.clickEvent,this);
        }
    }

}